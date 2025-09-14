import React, { useEffect, useImperativeHandle, forwardRef, useState, useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, Printer, FileText, Clock, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
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
const CONTENT_HEIGHT = A4_HEIGHT - (PAGE_MARGIN * 2); // ~971px usable height

interface PageData {
  id: string;
  content: string;
  wordCount: number;
}

interface MultiPageDocumentEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
  readOnly?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
  className?: string;
}

export interface MultiPageDocumentEditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  focus: () => void;
  save: () => Promise<void>;
}

const MultiPageDocumentEditor = forwardRef<MultiPageDocumentEditorRef, MultiPageDocumentEditorProps>(({
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
  const [pages, setPages] = useState<PageData[]>([
    { id: '1', content: initialContent, wordCount: 0 }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [totalWordCount, setTotalWordCount] = useState(0);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const pageEditorsRef = useRef<(any)[]>([]);

  // Create editors for each page
  const createEditor = useCallback((pageIndex: number, content: string) => {
    return useEditor({
      extensions: [
        StarterKit,
        TextStyle,
        Color,
      ],
      content: content,
      editable: !readOnly,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        updatePageContent(pageIndex, html);
      },
      onFocus: () => {
        setCurrentPageIndex(pageIndex);
      },
      editorProps: {
        attributes: {
          class: cn(
            'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
            'prose-headings:text-right prose-p:text-right',
            'prose-ul:text-right prose-ol:text-right',
            'min-h-full w-full p-4',
            '[&_*]:direction-rtl [&_*]:text-right'
          ),
          dir: 'rtl',
          style: `
            direction: rtl; 
            text-align: right; 
            font-family: Arial, Tahoma, sans-serif;
            min-height: ${CONTENT_HEIGHT}px;
            max-height: ${CONTENT_HEIGHT}px;
            overflow-y: auto;
            line-height: 24px;
            font-size: 16px;
          `
        },
        handleKeyDown: (view, event) => {
          // Handle page navigation with keyboard
          if (event.key === 'PageDown' || (event.ctrlKey && event.key === 'ArrowDown')) {
            event.preventDefault();
            goToNextPage();
            return true;
          }
          if (event.key === 'PageUp' || (event.ctrlKey && event.key === 'ArrowUp')) {
            event.preventDefault();
            goToPrevPage();
            return true;
          }
          
          // Auto-create new page when reaching bottom
          if (event.key === 'Enter') {
            const editorElement = view.dom;
            if (editorElement.scrollHeight > CONTENT_HEIGHT) {
              setTimeout(() => checkForPageOverflow(pageIndex), 100);
            }
          }
          
          return false;
        }
      },
    });
  }, [readOnly]);

  // Check if page content overflows and needs to be split
  const checkForPageOverflow = useCallback((pageIndex: number) => {
    const editor = pageEditorsRef.current[pageIndex];
    if (!editor) return;

    const editorElement = editor.view.dom;
    if (editorElement.scrollHeight > CONTENT_HEIGHT + 50) { // 50px buffer
      splitPageContent(pageIndex);
    }
  }, []);

  // Split page content when it overflows
  const splitPageContent = useCallback((pageIndex: number) => {
    const editor = pageEditorsRef.current[pageIndex];
    if (!editor) return;

    const content = editor.getHTML();
    const doc = new DOMParser().parseFromString(content, 'text/html');
    const elements = Array.from(doc.body.children);
    
    let keepOnCurrentPage = '';
    let moveToNextPage = '';
    let totalHeight = 0;
    let splitIndex = 0;

    // Calculate which elements fit on current page
    for (let i = 0; i < elements.length; i++) {
      const elementHeight = estimateElementHeight(elements[i].outerHTML);
      if (totalHeight + elementHeight > CONTENT_HEIGHT - 100) { // 100px buffer
        splitIndex = i;
        break;
      }
      totalHeight += elementHeight;
      keepOnCurrentPage += elements[i].outerHTML;
      splitIndex = i + 1;
    }

    // Move remaining elements to next page
    for (let i = splitIndex; i < elements.length; i++) {
      moveToNextPage += elements[i].outerHTML;
    }

    if (moveToNextPage.trim()) {
      // Update current page
      editor.commands.setContent(keepOnCurrentPage);
      
      // Create or update next page
      setPages(prev => {
        const newPages = [...prev];
        if (newPages[pageIndex + 1]) {
          // Prepend to existing next page
          newPages[pageIndex + 1].content = moveToNextPage + newPages[pageIndex + 1].content;
        } else {
          // Create new page
          newPages.splice(pageIndex + 1, 0, {
            id: `${Date.now()}`,
            content: moveToNextPage,
            wordCount: 0
          });
        }
        return newPages;
      });
    }
  }, []);

  // Estimate element height for content splitting
  const estimateElementHeight = useCallback((html: string): number => {
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
      position: absolute;
      visibility: hidden;
      width: ${CONTENT_WIDTH}px;
      direction: rtl;
      text-align: right;
      font-family: Arial, Tahoma, sans-serif;
      font-size: 16px;
      line-height: 24px;
      padding: 0;
      margin: 0;
    `;
    
    tempDiv.innerHTML = html;
    document.body.appendChild(tempDiv);
    
    const height = tempDiv.scrollHeight;
    document.body.removeChild(tempDiv);
    
    return height;
  }, []);

  // Update page content and recalculate stats
  const updatePageContent = useCallback((pageIndex: number, content: string) => {
    setPages(prev => {
      const newPages = [...prev];
      const plainText = content.replace(/<[^>]*>/g, '').trim();
      const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
      
      newPages[pageIndex] = {
        ...newPages[pageIndex],
        content,
        wordCount
      };
      
      return newPages;
    });

    // Trigger content change
    const allContent = pages.map(page => page.content).join('\n\n<!-- PAGE_BREAK -->\n\n');
    onContentChange?.(allContent);
    
    // Auto-save logic
    if (autoSave && onSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave(allContent);
      }, autoSaveInterval);
    }
  }, [pages, onContentChange, autoSave, onSave, autoSaveInterval]);

  // Navigation functions
  const goToNextPage = useCallback(() => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      setTimeout(() => {
        pageEditorsRef.current[currentPageIndex + 1]?.commands.focus();
      }, 100);
    } else {
      // Create new page if at the end
      addNewPage();
    }
  }, [currentPageIndex, pages.length]);

  const goToPrevPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      setTimeout(() => {
        pageEditorsRef.current[currentPageIndex - 1]?.commands.focus();
      }, 100);
    }
  }, [currentPageIndex]);

  const goToPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPageIndex(pageIndex);
      setTimeout(() => {
        pageEditorsRef.current[pageIndex]?.commands.focus();
      }, 100);
    }
  }, [pages.length]);

  // Add new page
  const addNewPage = useCallback(() => {
    const newPage: PageData = {
      id: `${Date.now()}`,
      content: '',
      wordCount: 0
    };
    
    setPages(prev => [...prev, newPage]);
    setCurrentPageIndex(pages.length); // Focus on the new page
  }, [pages.length]);

  // Remove page
  const removePage = useCallback((pageIndex: number) => {
    if (pages.length <= 1) return; // Don't remove the last page
    
    setPages(prev => prev.filter((_, index) => index !== pageIndex));
    
    // Adjust current page index
    if (currentPageIndex >= pageIndex && currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  }, [pages.length, currentPageIndex]);

  // Auto-save function
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

  // Manual save function
  const handleManualSave = async () => {
    if (!onSave || isSaving) return;
    
    const allContent = pages.map(page => page.content).join('\n\n<!-- PAGE_BREAK -->\n\n');
    
    try {
      setIsSaving(true);
      await onSave(allContent);
      setLastSaved(new Date());
      toast.success('تم حفظ المستند بنجاح');
    } catch (error) {
      console.error('Manual save failed:', error);
      toast.error('فشل في حفظ المستند');
    } finally {
      setIsSaving(false);
    }
  };

  // Print function
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Format last saved time
  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'لم يتم الحفظ بعد';
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'تم الحفظ للتو';
    if (diffInSeconds < 3600) return `تم الحفظ منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    return `تم الحفظ منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
  };

  // Calculate total word count
  useEffect(() => {
    const total = pages.reduce((sum, page) => sum + page.wordCount, 0);
    setTotalWordCount(total);
  }, [pages]);

  // Initialize editors when pages change
  useEffect(() => {
    pageEditorsRef.current = pages.map((page, index) => {
      if (pageEditorsRef.current[index]) {
        return pageEditorsRef.current[index];
      }
      return createEditor(index, page.content);
    });

    // Clean up unused editors
    if (pageEditorsRef.current.length > pages.length) {
      pageEditorsRef.current.splice(pages.length).forEach(editor => {
        editor?.destroy();
      });
    }
  }, [pages, createEditor]);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    getContent: () => pages.map(page => page.content).join('\n\n<!-- PAGE_BREAK -->\n\n'),
    setContent: (content: string) => {
      const splitContent = content.split('\n\n<!-- PAGE_BREAK -->\n\n');
      const newPages = splitContent.map((pageContent, index) => ({
        id: `${index + 1}`,
        content: pageContent,
        wordCount: pageContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0).length
      }));
      setPages(newPages);
    },
    focus: () => {
      pageEditorsRef.current[currentPageIndex]?.commands.focus();
    },
    save: handleManualSave
  }));

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      pageEditorsRef.current.forEach(editor => {
        editor?.destroy();
      });
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
              {totalWordCount.toLocaleString('ar')} كلمة
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {pages.length.toLocaleString('ar')} صفحة
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
          {!readOnly && (
            <Button
              onClick={addNewPage}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              صفحة جديدة
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Pages Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">الصفحات</h3>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-all",
                    index === currentPageIndex 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => goToPage(index)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      صفحة {(index + 1).toLocaleString('ar')}
                    </span>
                    {pages.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePage(index);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {page.wordCount.toLocaleString('ar')} كلمة
                  </div>
                </div>
              ))}
            </div>

            {/* Page Navigation Controls */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevPage}
                disabled={currentPageIndex === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <span className="text-sm">
                {(currentPageIndex + 1).toLocaleString('ar')} / {pages.length.toLocaleString('ar')}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPageIndex >= pages.length - 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Document Pages */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {pages.map((page, index) => {
              const editor = pageEditorsRef.current[index];
              
              return (
                <Card
                  key={page.id}
                  className={cn(
                    "transition-all duration-200",
                    index === currentPageIndex 
                      ? "ring-2 ring-primary shadow-lg" 
                      : "shadow-sm hover:shadow-md"
                  )}
                  style={{
                    width: `${A4_WIDTH}px`,
                    height: `${A4_HEIGHT}px`,
                    maxWidth: '100%',
                    aspectRatio: `${A4_WIDTH} / ${A4_HEIGHT}`,
                  }}
                >
                  {/* Page Header */}
                  <div className="flex items-center justify-between p-2 border-b bg-muted/20">
                    <span className="text-sm font-medium">
                      صفحة {(index + 1).toLocaleString('ar')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {page.wordCount.toLocaleString('ar')} كلمة
                    </span>
                  </div>

                  {/* Page Content */}
                  <div
                    className="relative bg-white"
                    style={{
                      height: `${A4_HEIGHT - 40}px`, // Subtract header height
                      margin: `${PAGE_MARGIN}px`,
                      width: `${CONTENT_WIDTH}px`,
                    }}
                    onClick={() => {
                      setCurrentPageIndex(index);
                      editor?.commands.focus();
                    }}
                  >
                    {editor && (
                      <EditorContent 
                        editor={editor}
                        className="h-full [&_.ProseMirror]:outline-none [&_.ProseMirror]:h-full"
                      />
                    )}

                    {/* Page Number */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                      {(index + 1).toLocaleString('ar')}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
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
            margin: 0;
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

          /* Hide everything except pages during print */
          .lg\\:col-span-1,
          .flex.items-center.justify-between.mb-4 {
            display: none !important;
          }
          
          /* Make pages break properly */
          .space-y-6 > * {
            page-break-after: always;
            margin: 0 !important;
          }
          
          .space-y-6 > *:last-child {
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
});

MultiPageDocumentEditor.displayName = 'MultiPageDocumentEditor';

export default MultiPageDocumentEditor;