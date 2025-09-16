import React, { forwardRef, useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface A4PageSystemProps {
  children: React.ReactNode;
  showPageBreaks?: boolean;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
  showRulers?: boolean;
  showMargins?: boolean;
  zoom?: number;
}

export const A4PageSystem = forwardRef<HTMLDivElement, A4PageSystemProps>(
  ({ 
    children, 
    showPageBreaks = true, 
    currentPage = 1, 
    onPageChange, 
    className,
    showRulers = false,
    showMargins = true,
    zoom = 1
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pages, setPages] = useState<number[]>([1]);
    const [isIntersecting, setIsIntersecting] = useState<{ [key: number]: boolean }>({ 1: true });
    
    // أبعاد A4 بالبكسل (210 × 297 مم في 96 DPI)
    const A4_WIDTH = 794; // 210mm
    const A4_HEIGHT = 1123; // 297mm
    const MARGIN = 72; // هوامش 1 بوصة (25.4mm)

    // تطبيق Zoom
    const scaledWidth = A4_WIDTH * zoom;
    const scaledHeight = A4_HEIGHT * zoom;
    const scaledMargin = MARGIN * zoom;

    // مراقبة تداخل الصفحات لتحديد الصفحة الحالية
    useEffect(() => {
      if (!containerRef.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const newIntersecting = { ...isIntersecting };
          
          entries.forEach((entry) => {
            const pageNum = parseInt(entry.target.getAttribute('data-page') || '1');
            newIntersecting[pageNum] = entry.isIntersecting;
          });
          
          setIsIntersecting(newIntersecting);
          
          // تحديد الصفحة الحالية (أول صفحة مرئية)
          const visiblePages = Object.entries(newIntersecting)
            .filter(([_, visible]) => visible)
            .map(([page]) => parseInt(page))
            .sort((a, b) => a - b);
            
          if (visiblePages.length > 0 && visiblePages[0] !== currentPage) {
            onPageChange?.(visiblePages[0]);
          }
        },
        {
          root: containerRef.current,
          threshold: 0.5,
          rootMargin: '0px'
        }
      );

      // مراقبة جميع الصفحات
      const pageElements = containerRef.current.querySelectorAll('.a4-page');
      pageElements.forEach((page) => observer.observe(page));

      return () => observer.disconnect();
    }, [pages.length, currentPage, onPageChange, isIntersecting]);

    // حساب عدد الصفحات المطلوبة بناءً على المحتوى
    const updatePagesCount = useCallback(() => {
      if (!containerRef.current) return;
      
      const contentHeight = containerRef.current.scrollHeight;
      const availableHeight = scaledHeight - (scaledMargin * 2); // طرح الهوامش العلوية والسفلية
      const requiredPages = Math.max(1, Math.ceil(contentHeight / availableHeight));
      
      if (requiredPages !== pages.length) {
        setPages(Array.from({ length: requiredPages }, (_, i) => i + 1));
      }
    }, [scaledHeight, scaledMargin, pages.length]);

    // تحديث عدد الصفحات عند تغيير المحتوى
    useEffect(() => {
      const resizeObserver = new ResizeObserver(updatePagesCount);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      
      return () => resizeObserver.disconnect();
    }, [updatePagesCount]);

    // التمرير إلى صفحة معينة
    const scrollToPage = useCallback((pageNumber: number) => {
      if (!containerRef.current) return;
      
      const pageElement = containerRef.current.querySelector(`[data-page="${pageNumber}"]`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, []);

    return (
      <div 
        ref={ref}
        className={cn(
          "a4-document-container bg-gray-100 overflow-auto h-full",
          className
        )}
      >
        {/* مسطرة أفقية */}
        {showRulers && (
          <div className="sticky top-0 z-10 bg-white border-b">
            <div 
              className="h-6 bg-gray-50 border-r relative"
              style={{ width: scaledWidth, margin: '0 auto' }}
            >
              {Array.from({ length: 21 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 border-l border-gray-300"
                  style={{ 
                    left: (i * scaledWidth / 21), 
                    height: i % 5 === 0 ? '100%' : '50%'
                  }}
                >
                  {i % 5 === 0 && (
                    <span className="text-xs text-gray-500 absolute -top-4">
                      {i}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex">
          {/* مسطرة عمودية */}
          {showRulers && (
            <div className="sticky right-0 z-10 bg-white border-l">
              <div className="w-6 bg-gray-50 relative min-h-full">
                {Array.from({ length: 30 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute right-0 border-t border-gray-300"
                    style={{ 
                      top: (i * scaledHeight / 30), 
                      width: i % 5 === 0 ? '100%' : '50%'
                    }}
                  >
                    {i % 5 === 0 && (
                      <span 
                        className="text-xs text-gray-500 absolute -right-8 transform -rotate-90"
                        style={{ transformOrigin: 'center' }}
                      >
                        {i}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* منطقة الصفحات */}
          <div 
            ref={containerRef}
            className="flex-1 py-8 overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)'
            }}
          >
            <div className="mx-auto space-y-4" style={{ width: scaledWidth + 40 }}>
              {pages.map((pageNumber) => (
                <div
                  key={pageNumber}
                  data-page={pageNumber}
                  className={cn(
                    "a4-page bg-white shadow-lg mx-auto relative overflow-hidden",
                    "transition-all duration-300 hover:shadow-xl",
                    isIntersecting[pageNumber] && "ring-2 ring-primary/20"
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
                        className="absolute top-0 left-0 right-0 border-b border-dashed border-gray-300/50"
                        style={{ height: scaledMargin }}
                      />
                      {/* الهامش السفلي */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 border-t border-dashed border-gray-300/50"
                        style={{ height: scaledMargin }}
                      />
                      {/* الهامش الأيمن */}
                      <div 
                        className="absolute top-0 right-0 bottom-0 border-l border-dashed border-gray-300/50"
                        style={{ width: scaledMargin }}
                      />
                      {/* الهامش الأيسر */}
                      <div 
                        className="absolute top-0 left-0 bottom-0 border-r border-dashed border-gray-300/50"
                        style={{ width: scaledMargin }}
                      />
                    </>
                  )}

                  {/* رقم الصفحة */}
                  <div 
                    className="absolute text-xs text-gray-500 select-none"
                    style={{
                      bottom: scaledMargin / 3,
                      right: scaledMargin,
                    }}
                  >
                    {pageNumber.toLocaleString('ar')}
                  </div>

                  {/* منطقة المحتوى */}
                  <div
                    className="absolute overflow-hidden"
                    style={{
                      top: scaledMargin,
                      left: scaledMargin,
                      right: scaledMargin,
                      bottom: scaledMargin,
                      width: scaledWidth - (scaledMargin * 2),
                      height: scaledHeight - (scaledMargin * 2),
                    }}
                  >
                    {pageNumber === 1 && children}
                  </div>

                  {/* خط فاصل الصفحات */}
                  {showPageBreaks && pageNumber < pages.length && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* أدوات التنقل بين الصفحات */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border px-3 py-1 flex items-center gap-2">
            <button
              onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              ←
            </button>
            
            <span className="text-sm font-medium min-w-[4rem] text-center">
              {currentPage.toLocaleString('ar')} / {pages.length.toLocaleString('ar')}
            </span>
            
            <button
              onClick={() => scrollToPage(Math.min(pages.length, currentPage + 1))}
              disabled={currentPage >= pages.length}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>

        {/* الأنماط المخصصة */}
        <style jsx>{`
          .a4-document-container {
            font-family: 'Cairo', 'Amiri', 'Noto Sans Arabic', Arial, sans-serif;
          }
          
          .a4-page {
            box-shadow: 
              0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06),
              0 0 0 1px rgba(0, 0, 0, 0.05);
          }
          
          .a4-page:hover {
            box-shadow: 
              0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(0, 0, 0, 0.05);
          }
          
          /* تحسينات الطباعة */
          @media print {
            .a4-document-container {
              background: white !important;
              overflow: visible !important;
            }
            
            .a4-page {
              box-shadow: none !important;
              margin: 0 !important;
              page-break-after: always;
            }
            
            .a4-page:last-child {
              page-break-after: avoid;
            }
          }
        `}</style>
      </div>
    );
  }
);

A4PageSystem.displayName = 'A4PageSystem';

export default A4PageSystem;