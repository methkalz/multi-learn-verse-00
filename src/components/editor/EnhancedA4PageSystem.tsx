import React, { forwardRef, useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface EnhancedA4PageSystemProps {
  children: React.ReactNode;
  className?: string;
  zoom?: number;
  showRulers?: boolean;
  showMargins?: boolean;
  showPageNumbers?: boolean;
  onPageCountChange?: (count: number) => void;
}

export const EnhancedA4PageSystem = forwardRef<HTMLDivElement, EnhancedA4PageSystemProps>(
  ({ 
    children, 
    className,
    zoom = 0.8,
    showRulers = false,
    showMargins = true,
    showPageNumbers = true,
    onPageCountChange
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [pageCount, setPageCount] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    
    // أبعاد A4 المحسنة
    const A4_WIDTH = 794; // 210mm في 96 DPI
    const A4_HEIGHT = 1123; // 297mm في 96 DPI  
    const MARGIN = 60; // هوامش محسنة
    
    const scaledWidth = A4_WIDTH * zoom;
    const scaledHeight = A4_HEIGHT * zoom;
    const scaledMargin = MARGIN * zoom;

    // حساب عدد الصفحات بدقة محسنة
    const calculatePageCount = useCallback(() => {
      if (!contentRef.current) return 1;
      
      const content = contentRef.current.querySelector('.ProseMirror');
      if (!content) return 1;
      
      const contentHeight = content.scrollHeight;
      const availableHeight = A4_HEIGHT - (MARGIN * 2);
      
      const pages = Math.max(1, Math.ceil(contentHeight / availableHeight));
      return Math.min(pages, 100); // حد أقصى 100 صفحة
    }, []);

    // تحديث عدد الصفحات مع debouncing محسن
    const updatePageCount = useCallback(() => {
      const newPageCount = calculatePageCount();
      if (newPageCount !== pageCount) {
        setPageCount(newPageCount);
        onPageCountChange?.(newPageCount);
      }
    }, [calculatePageCount, pageCount, onPageCountChange]);

    // مراقبة تغييرات المحتوى
    useEffect(() => {
      let timeoutId: NodeJS.Timeout;
      
      const debouncedUpdate = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(updatePageCount, 200);
      };

      const resizeObserver = new ResizeObserver(debouncedUpdate);
      const mutationObserver = new MutationObserver(debouncedUpdate);
      
      if (contentRef.current) {
        resizeObserver.observe(contentRef.current);
        mutationObserver.observe(contentRef.current, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }
      
      return () => {
        clearTimeout(timeoutId);
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      };
    }, [updatePageCount]);

    // إنشاء مؤشرات الصفحات المرئية
    const pageIndicators = Array.from({ length: pageCount }, (_, i) => i + 1);

    return (
      <div 
        ref={ref}
        className={cn(
          "enhanced-a4-container bg-gradient-to-b from-gray-50 to-gray-100",
          "overflow-auto h-full relative",
          className
        )}
      >
        {/* خلفية الصفحات */}
        <div 
          className="relative mx-auto py-8"
          style={{ width: scaledWidth + 40 }}
        >
          {/* الصفحات المرئية */}
          <div className="relative space-y-6">
            {pageIndicators.map((pageNum) => (
              <Card
                key={pageNum}
                className={cn(
                  "page-shadow bg-white relative mx-auto overflow-hidden",
                  "border border-gray-200/50 transition-all duration-200",
                  "hover:shadow-xl hover:border-primary/20"
                )}
                style={{
                  width: scaledWidth,
                  height: scaledHeight,
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center'
                }}
              >
                {/* الهوامش المرئية */}
                {showMargins && (
                  <>
                    {/* الهامش العلوي */}
                    <div 
                      className="absolute top-0 left-0 right-0 border-b border-dashed border-blue-200/60"
                      style={{ height: scaledMargin }}
                    />
                    {/* الهامش السفلي */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 border-t border-dashed border-blue-200/60"
                      style={{ height: scaledMargin }}
                    />
                    {/* الهامش الأيمن */}
                    <div 
                      className="absolute top-0 right-0 bottom-0 border-l border-dashed border-blue-200/60"
                      style={{ width: scaledMargin }}
                    />
                    {/* الهامش الأيسر */}
                    <div 
                      className="absolute top-0 left-0 bottom-0 border-r border-dashed border-blue-200/60"
                      style={{ width: scaledMargin }}
                    />
                  </>
                )}
                
                {/* رقم الصفحة */}
                {showPageNumbers && (
                  <div 
                    className="absolute text-xs text-gray-500 font-medium select-none"
                    style={{
                      bottom: scaledMargin / 3,
                      right: scaledMargin,
                    }}
                  >
                    صفحة {pageNum.toLocaleString('ar')}
                  </div>
                )}

                {/* خط فاصل الصفحة */}
                {pageNum < pageCount && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full" />
                    <div className="text-xs text-center text-primary/60 mt-1 font-medium">
                      فاصل الصفحة
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* المحتوى المطلق */}
          <div 
            ref={contentRef}
            className="absolute top-8 right-5 left-5 z-10"
            style={{
              paddingTop: scaledMargin,
              paddingBottom: scaledMargin,
              paddingRight: scaledMargin,
              paddingLeft: scaledMargin,
            }}
          >
            <div className="enhanced-editor-content">
              {children}
            </div>
          </div>
        </div>

        {/* مؤشر الصفحة الحالية */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <Card className="px-4 py-2 bg-white/95 backdrop-blur-sm shadow-lg border">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">الصفحة:</span>
              <span className="font-bold text-primary">
                {currentPage.toLocaleString('ar')} من {pageCount.toLocaleString('ar')}
              </span>
            </div>
          </Card>
        </div>

        {/* الأنماط المحسنة */}
        <style>{`
          .enhanced-a4-container {
            font-family: 'Cairo', 'Amiri', 'Noto Sans Arabic', Arial, sans-serif;
          }
          
          .page-shadow {
            box-shadow: 
              0 8px 25px -8px rgba(0, 0, 0, 0.15),
              0 4px 12px -4px rgba(0, 0, 0, 0.1),
              0 0 0 1px rgba(0, 0, 0, 0.05);
          }
          
          .page-shadow:hover {
            box-shadow: 
              0 12px 35px -8px rgba(0, 0, 0, 0.2),
              0 6px 18px -4px rgba(0, 0, 0, 0.12),
              0 0 0 1px rgba(59, 130, 246, 0.15);
          }
          
          .enhanced-editor-content {
            line-height: 1.6;
            direction: rtl;
            text-align: right;
          }
          
          .enhanced-editor-content .ProseMirror {
            outline: none;
            min-height: 200px;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          
          .enhanced-editor-content .ProseMirror p {
            margin: 0 0 1em 0;
            word-wrap: break-word;
          }
          
          .enhanced-editor-content .ProseMirror h1,
          .enhanced-editor-content .ProseMirror h2,
          .enhanced-editor-content .ProseMirror h3,
          .enhanced-editor-content .ProseMirror h4,
          .enhanced-editor-content .ProseMirror h5,
          .enhanced-editor-content .ProseMirror h6 {
            margin: 1.2em 0 0.6em 0;
            font-weight: bold;
            word-wrap: break-word;
          }
          
          .enhanced-editor-content .ProseMirror ul,
          .enhanced-editor-content .ProseMirror ol {
            padding-right: 1.5em;
            margin: 0.5em 0;
          }
          
          .enhanced-editor-content .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
          }
          
          @media print {
            .enhanced-a4-container {
              background: white !important;
              overflow: visible !important;
            }
            
            .page-shadow {
              box-shadow: none !important;
              page-break-after: always;
            }
            
            .page-shadow:last-child {
              page-break-after: avoid;
            }
            
            .enhanced-editor-content {
              font-size: 12pt;
              line-height: 1.5;
            }
          }
        `}</style>
      </div>
    );
  }
);

EnhancedA4PageSystem.displayName = 'EnhancedA4PageSystem';

export default EnhancedA4PageSystem;