import React, { useEffect, useImperativeHandle, forwardRef, useState, useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, Printer, FileText, Clock, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';

// A4 page dimensions in pixels (96 DPI)
const A4_WIDTH = 794; // 21cm at 96 DPI
const A4_HEIGHT = 1123; // 29.7cm at 96 DPI
const PAGE_MARGIN = 76; // 2cm margins
const CONTENT_WIDTH = A4_WIDTH - (PAGE_MARGIN * 2);
const CONTENT_HEIGHT = A4_HEIGHT - (PAGE_MARGIN * 2);

interface PageContent {
  id: string;
  content: string;
  wordCount: number;
  htmlContent: string;
}

interface MultiPageTipTapEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
  readOnly?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
  className?: string;
}

export interface MultiPageTipTapEditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  focus: () => void;
  save: () => Promise<void>;
}

const MultiPageTipTapEditor = forwardRef<MultiPageTipTapEditorRef, MultiPageTipTapEditorProps>(({
  initialContent = '',
  onContentChange,
  onSave,
  readOnly = false,
  autoSave = true,
  autoSaveInterval = 30000,
  className
}, ref) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentContent, setCurrentContent] = useState(initialContent);
  const [pages, setPages] = useState<PageContent[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [totalPageCount, setTotalPageCount] = useState(1);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const pageEditorsRef = useRef<any[]>([]);

  // Main editor for content editing
  const mainEditor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setCurrentContent(html);
      handleContentChange(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
          'prose-headings:text-right prose-p:text-right',
          'prose-ul:text-right prose-ol:text-right',
          'min-h-full w-full',
          '[&_*]:direction-rtl [&_*]:text-right'
        ),
        dir: 'rtl',
        style: 'direction: rtl; text-align: right; font-family: Arial, Tahoma, sans-serif;'
      },
    },
  });

  // Function to measure content height for pagination
  const measureContentHeight = useCallback((content: string): number => {
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
      position: absolute;
      visibility: hidden;
      width: ${CONTENT_WIDTH}px;
      direction: rtl;
      text-align: right;
      font-family: 'Arial', 'Tahoma', sans-serif;
      font-size: 16px;
      line-height: 24px;
      padding: 0;
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
    `;
    
    tempDiv.innerHTML = content || '<p></p>';
    document.body.appendChild(tempDiv);
    
    const height = tempDiv.scrollHeight;
    document.body.removeChild(tempDiv);
    
    return height;
  }, []);

  // Split content into pages based on height
  const splitContentIntoPages = useCallback((content: string): PageContent[] => {
    if (!content?.trim()) {
      return [{
        id: '1',
        content: '',
        wordCount: 0,
        htmlContent: '<p></p>'
      }];
    }

    const totalHeight = measureContentHeight(content);
    
    // If content fits in one page
    if (totalHeight <= CONTENT_HEIGHT) {
      const plainText = content.replace(/<[^>]*>/g, '').trim();
      const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
      
      return [{
        id: '1',
        content: plainText,
        wordCount,
        htmlContent: content
      }];
    }

    // Split content into paragraphs for better page breaks
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${content}</div>`, 'text/html');
    const elements = Array.from(doc.querySelector('div')?.children || []);
    
    const newPages: PageContent[] = [];
    let currentPageContent = '';
    let currentPageHtml = '';
    let pageId = 1;

    for (const element of elements) {
      const elementHtml = element.outerHTML;
      const testContent = currentPageHtml + elementHtml;
      const testHeight = measureContentHeight(testContent);

      if (testHeight > CONTENT_HEIGHT && currentPageContent) {
        // Current page is full, finalize it
        const wordCount = currentPageContent.replace(/<[^>]*>/g, '').trim()
          .split(/\s+/).filter(word => word.length > 0).length;
        
        newPages.push({
          id: pageId.toString(),
          content: currentPageContent.trim(),
          wordCount,
          htmlContent: currentPageHtml
        });

        // Start new page
        pageId++;
        currentPageContent = element.textContent || '';
        currentPageHtml = elementHtml;
      } else {
        currentPageContent += ' ' + (element.textContent || '');
        currentPageHtml = testContent;
      }
    }

    // Add the last page if there's content
    if (currentPageContent.trim()) {
      const wordCount = currentPageContent.replace(/<[^>]*>/g, '').trim()
        .split(/\s+/).filter(word => word.length > 0).length;
      
      newPages.push({
        id: pageId.toString(),
        content: currentPageContent.trim(),
        wordCount,
        htmlContent: currentPageHtml
      });
    }

    return newPages;
  }, [measureContentHeight]);

  // Handle content changes
  const handleContentChange = useCallback((content: string) => {
    // Calculate word count
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    const words = plainText.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    // Split into pages
    const newPages = splitContentIntoPages(content);
    setPages(newPages);
    setTotalPageCount(newPages.length);
    
    // Trigger external content change
    onContentChange?.(content);
    
    // Auto-save logic
    if (autoSave && onSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave(content);
      }, autoSaveInterval);
    }
  }, [onContentChange, autoSave, onSave, autoSaveInterval, splitContentIntoPages]);

  const handleAutoSave = async (content: string) => {
    if (!onSave || isSaving) return;
    
    try {
      setIsSaving(true);
      await onSave(content);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error('فشل في الحفظ التلقائي');
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = async () => {
    if (!onSave || isSaving) return;
    
    try {
      setIsSaving(true);
      await onSave(currentContent);
      setLastSaved(new Date());
      toast.success('تم حفظ المستند بنجاح');
    } catch (error) {
      console.error('Manual save failed:', error);
      toast.error('فشل في حفظ المستند');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'لم يتم الحفظ بعد';
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'تم الحفظ للتو';
    if (diffInSeconds < 3600) return `تم الحفظ منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    return `تم الحفظ منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
  };

  // Navigation functions
  const goToNextPage = () => {
    if (currentPageIndex < totalPageCount - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPageCount) {
      setCurrentPageIndex(pageIndex);
    }
  };

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    getContent: () => currentContent,
    setContent: (content: string) => {
      setCurrentContent(content);
      mainEditor?.commands.setContent(content);
    },
    focus: () => {
      mainEditor?.commands.focus();
    },
    save: handleManualSave
  }));

  // Update content when initialContent changes
  useEffect(() => {
    if (initialContent !== currentContent) {
      setCurrentContent(initialContent);
      mainEditor?.commands.setContent(initialContent);
    }
  }, [initialContent]);

  // Initialize pages on mount
  useEffect(() => {
    const initialPages = splitContentIntoPages(initialContent);
    setPages(initialPages);
    setTotalPageCount(initialPages.length);
  }, []);

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('w-full mx-auto', className)}>
      {/* Header with stats and controls */}
      <div className="flex items-center justify-between mb-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {wordCount.toLocaleString('ar')} كلمة
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {totalPageCount.toLocaleString('ar')} صفحة
            </Badge>
          </div>
          {lastSaved && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatLastSaved(lastSaved)}
              </span>
            </div>
          )}
          {isSaving && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
              <span className="text-xs text-muted-foreground">جاري الحفظ...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onSave && !readOnly && (
            <Button
              onClick={handleManualSave}
              disabled={isSaving}
              size="sm"
              variant="outline"
            >
              <Save className="h-4 w-4 mr-2" />
              حفظ
            </Button>
          )}
          <Button
            onClick={handlePrint}
            size="sm"
            variant="outline"
          >
            <Printer className="h-4 w-4 mr-2" />
            طباعة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">محرر النص</h3>
              <p className="text-sm text-muted-foreground">
                اكتب محتوى مشروعك هنا. سيتم تقسيمه تلقائياً على صفحات A4.
              </p>
            </div>
            
            <div className="border rounded-lg min-h-[400px] max-h-[600px] overflow-y-auto">
              <EditorContent 
                editor={mainEditor}
                className="p-4 prose prose-sm max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px]"
              />
            </div>
          </Card>
        </div>

        {/* Pages Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">معاينة الصفحات</h3>
              
              {/* Page Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={currentPageIndex === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <span className="text-sm">
                  صفحة {(currentPageIndex + 1).toLocaleString('ar')} من {totalPageCount.toLocaleString('ar')}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPageIndex >= totalPageCount - 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Page Preview */}
            <div className="border rounded-lg p-2 bg-gray-50 min-h-[400px]">
              {pages[currentPageIndex] && (
                <div
                  className="bg-white shadow-sm mx-auto"
                  style={{
                    width: '200px',
                    height: '283px', // A4 ratio scaled down
                    padding: '16px',
                    fontSize: '8px',
                    lineHeight: '10px',
                    direction: 'rtl',
                    textAlign: 'right',
                    fontFamily: 'Arial, Tahoma, sans-serif',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{ 
                      __html: pages[currentPageIndex]?.htmlContent || '<p>صفحة فارغة</p>' 
                    }}
                  />
                  
                  {/* Page number in preview */}
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                    {(currentPageIndex + 1).toLocaleString('ar')}
                  </div>
                </div>
              )}
            </div>

            {/* Page Stats */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>كلمات هذه الصفحة:</span>
                <span>{(pages[currentPageIndex]?.wordCount || 0).toLocaleString('ar')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>إجمالي الكلمات:</span>
                <span>{wordCount.toLocaleString('ar')}</span>
              </div>
            </div>

            {/* Quick Page Navigation */}
            {totalPageCount > 1 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">الانتقال السريع:</p>
                <div className="grid grid-cols-4 gap-1">
                  {Array.from({ length: Math.min(totalPageCount, 16) }, (_, i) => (
                    <Button
                      key={i}
                      variant={i === currentPageIndex ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(i)}
                      className="text-xs"
                    >
                      {(i + 1).toLocaleString('ar')}
                    </Button>
                  ))}
                </div>
                {totalPageCount > 16 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    و {(totalPageCount - 16).toLocaleString('ar')} صفحة أخرى...
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          @page {
            size: A4;
            margin: 2cm;
          }
          
          body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            direction: rtl;
            text-align: right;
            font-size: 16px;
            line-height: 24px;
          }
          
          .prose {
            max-width: none !important;
          }
          
          .prose * {
            direction: rtl !important;
            text-align: right !important;
          }
        }
      `}</style>
    </div>
  );
});

MultiPageTipTapEditor.displayName = 'MultiPageTipTapEditor';

export default MultiPageTipTapEditor;