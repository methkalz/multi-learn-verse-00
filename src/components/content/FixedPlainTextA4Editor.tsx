import React, { useState, useEffect, useImperativeHandle, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, Printer, Save } from 'lucide-react';

interface Page {
  id: string;
  ref: React.RefObject<HTMLDivElement>;
}

export interface FixedPlainTextA4EditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  focus: () => void;
  save: () => Promise<void>;
}

interface FixedPlainTextA4EditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
  readOnly?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
  className?: string;
}

const FixedPlainTextA4Editor = React.forwardRef<FixedPlainTextA4EditorRef, FixedPlainTextA4EditorProps>(({
  initialContent = '',
  onContentChange,
  onSave,
  readOnly = false,
  autoSave = false,
  autoSaveInterval = 30000,
  className = ''
}, ref) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const { toast } = useToast();
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  const contentChangeTimeoutRef = useRef<NodeJS.Timeout>();

  // A4 dimensions with Word-like margins
  const A4_WIDTH = 794; // 210mm
  const A4_HEIGHT = 1123; // 297mm
  const PAGE_PADDING = 95; // 2.5cm margins like MS Word default
  const LINE_HEIGHT = 24; // ارتفاع مناسب للنص العربي
  const CHARS_PER_LINE = 65; // عدد أحرف مناسب مع الهوامش الجديدة
  const LINES_PER_PAGE = Math.floor((A4_HEIGHT - PAGE_PADDING * 2) / LINE_HEIGHT);
  const CHARS_PER_PAGE = CHARS_PER_LINE * LINES_PER_PAGE;

  // إنشاء صفحة جديدة
  const createNewPage = useCallback((): Page => {
    return {
      id: Date.now().toString(),
      ref: React.createRef<HTMLDivElement>()
    };
  }, []);

  // تهيئة الصفحات
  useEffect(() => {
    if (pages.length === 0) {
      const firstPage = createNewPage();
      setPages([firstPage]);
      
      // تعيين المحتوى الأولي
      if (initialContent && firstPage.ref.current) {
        setTimeout(() => {
          if (firstPage.ref.current) {
            firstPage.ref.current.textContent = initialContent;
          }
        }, 100);
      }
    }
  }, [pages.length, createNewPage, initialContent]);

  // حساب عدد الكلمات
  const calculateWordCount = useCallback((text: string) => {
    const arabicWords = text.match(/[\u0600-\u06FF]+/g) || [];
    const englishWords = text.match(/[a-zA-Z]+/g) || [];
    return arabicWords.length + englishWords.length;
  }, []);

  // الحصول على المحتوى الكامل
  const getCombinedContent = useCallback(() => {
    return pages
      .map(page => page.ref.current?.textContent || '')
      .join('\n\n')
      .trim();
  }, [pages]);

  // التحقق من الحاجة لتقسيم الصفحة بناءً على الارتفاع الفعلي
  const checkPageOverflow = useCallback((pageElement: HTMLDivElement) => {
    // استخدام scrollHeight للكشف الدقيق عن الفيض
    const hasScrollOverflow = pageElement.scrollHeight > pageElement.clientHeight;
    
    // احتياطي: التحقق من عدد الأحرف أيضاً
    const content = pageElement.textContent || '';
    const hasCharOverflow = content.length > CHARS_PER_PAGE;
    
    return hasScrollOverflow || hasCharOverflow;
  }, []);

  // نقل النص الزائد لصفحة جديدة
  const handlePageOverflow = useCallback((pageIndex: number) => {
    const pageElement = pages[pageIndex]?.ref.current;
    if (!pageElement) return;

    const content = pageElement.textContent || '';
    if (content.length <= CHARS_PER_PAGE) return;

    console.log(`Page ${pageIndex} overflow detected. Content length: ${content.length}, Max: ${CHARS_PER_PAGE}`);

    // حفظ موضع المؤشر الحالي
    const selection = window.getSelection();
    let cursorOffset = 0;
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (range.commonAncestorContainer === pageElement || pageElement.contains(range.commonAncestorContainer)) {
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(pageElement);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        cursorOffset = preCaretRange.toString().length;
      }
    }

    // تقسيم المحتوى
    let cutPoint = CHARS_PER_PAGE;
    const nearbySpace = content.lastIndexOf(' ', cutPoint);
    const nearbyNewline = content.lastIndexOf('\n', cutPoint);
    
    if (nearbyNewline > cutPoint - 100) {
      cutPoint = nearbyNewline + 1;
    } else if (nearbySpace > cutPoint - 100) {
      cutPoint = nearbySpace + 1;
    }

    const pageContent = content.substring(0, cutPoint).trim();
    const overflowContent = content.substring(cutPoint).trim();

    console.log(`Splitting at position ${cutPoint}. Page content: ${pageContent.length} chars, Overflow: ${overflowContent.length} chars`);

    // تحديث الصفحة الحالية
    pageElement.textContent = pageContent;

    // إنشاء صفحة جديدة للمحتوى الزائد
    if (overflowContent) {
      const newPage = createNewPage();
      setPages(prev => {
        const updated = [...prev];
        updated.splice(pageIndex + 1, 0, newPage);
        return updated;
      });

      // تعيين المحتوى للصفحة الجديدة
      setTimeout(() => {
        if (newPage.ref.current) {
          newPage.ref.current.textContent = overflowContent;
          
          // استعادة موضع المؤشر
          if (cursorOffset > cutPoint) {
            // المؤشر كان في النص المنقول للصفحة الجديدة
            const newCursorOffset = cursorOffset - cutPoint;
            newPage.ref.current.focus();
            
            const range = document.createRange();
            const selection = window.getSelection();
            const textNode = newPage.ref.current.firstChild;
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
              const actualOffset = Math.min(newCursorOffset, textNode.textContent?.length || 0);
              range.setStart(textNode, actualOffset);
              range.collapse(true);
              selection?.removeAllRanges();
              selection?.addRange(range);
            }
          } else {
            // المؤشر يبقى في الصفحة الأصلية
            pageElement.focus();
            const range = document.createRange();
            const selection = window.getSelection();
            const textNode = pageElement.firstChild;
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
              const actualOffset = Math.min(cursorOffset, textNode.textContent?.length || 0);
              range.setStart(textNode, actualOffset);
              range.collapse(true);
              selection?.removeAllRanges();
              selection?.addRange(range);
            }
          }
        }
      }, 100);
    }
  }, [pages, createNewPage]);

  // معالجة الإدخال
  const handleInput = useCallback((pageIndex: number) => {
    const pageElement = pages[pageIndex]?.ref.current;
    if (!pageElement) return;

    console.log(`Input on page ${pageIndex}. Content length: ${pageElement.textContent?.length || 0}, scrollHeight: ${pageElement.scrollHeight}, clientHeight: ${pageElement.clientHeight}`);

    // تحديث فوري لعدد الكلمات
    const content = getCombinedContent();
    setWordCount(calculateWordCount(content));
    onContentChange?.(content);

    // التحقق الفوري من تجاوز الصفحة
    if (checkPageOverflow(pageElement)) {
      console.log(`Page ${pageIndex} overflow detected - splitting now`);
      handlePageOverflow(pageIndex);
    }
  }, [pages, checkPageOverflow, handlePageOverflow, getCombinedContent, calculateWordCount, onContentChange]);

  // معالجة الضغط على المفاتيح
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, pageIndex: number) => {
    // التنقل بين الصفحات بـ Page Up/Down
    if (e.key === 'PageDown' && pageIndex < pages.length - 1) {
      e.preventDefault();
      const nextPageRef = pages[pageIndex + 1]?.ref.current;
      if (nextPageRef) {
        nextPageRef.focus();
        setCurrentPageIndex(pageIndex + 1);
      }
    } else if (e.key === 'PageUp' && pageIndex > 0) {
      e.preventDefault();
      const prevPageRef = pages[pageIndex - 1]?.ref.current;
      if (prevPageRef) {
        prevPageRef.focus();
        setCurrentPageIndex(pageIndex - 1);
      }
    }
  }, [pages]);

  // إضافة صفحة جديدة
  const addNewPage = useCallback(() => {
    const newPage = createNewPage();
    setPages(prev => [...prev, newPage]);
    
    // التركيز على الصفحة الجديدة
    setTimeout(() => {
      if (newPage.ref.current) {
        newPage.ref.current.focus();
        setCurrentPageIndex(pages.length);
      }
    }, 100);
  }, [createNewPage, pages.length]);

  // حفظ المحتوى
  const handleSave = useCallback(async () => {
    if (!onSave || isSaving) return;
    
    setIsSaving(true);
    try {
      const content = getCombinedContent();
      await onSave(content);
      setLastSaved(new Date());
      toast({
        title: "تم الحفظ",
        description: "تم حفظ المستند بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "فشل في حفظ المستند",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [onSave, isSaving, getCombinedContent, toast]);

  // طباعة المحتوى
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // الحفظ التلقائي
  useEffect(() => {
    if (autoSave && onSave) {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setInterval(() => {
        handleSave();
      }, autoSaveInterval);

      return () => {
        if (autoSaveTimerRef.current) {
          clearInterval(autoSaveTimerRef.current);
        }
      };
    }
  }, [autoSave, onSave, autoSaveInterval, handleSave]);

  // Imperative handle للمرجع
  useImperativeHandle(ref, () => ({
    getContent: getCombinedContent,
    setContent: (content: string) => {
      if (pages[0]?.ref.current) {
        pages[0].ref.current.textContent = content;
        // إعادة تقسيم إذا لزم الأمر
        setTimeout(() => {
          if (pages[0]?.ref.current && checkPageOverflow(pages[0].ref.current)) {
            handlePageOverflow(0);
          }
        }, 100);
      }
    },
    focus: () => {
      const firstPageRef = pages[0]?.ref.current;
      if (firstPageRef) {
        firstPageRef.focus();
      }
    },
    save: handleSave
  }), [getCombinedContent, pages, checkPageOverflow, handlePageOverflow, handleSave]);

  return (
    <div className={`fixed-plain-text-a4-editor ${className}`} dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {pages.length} صفحة • {wordCount.toLocaleString('ar')} كلمة
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addNewPage}
            disabled={readOnly}
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة صفحة
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>
          
          {onSave && (
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || readOnly}
            >
              <Save className="h-4 w-4 ml-2" />
              {isSaving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          )}
        </div>
      </div>

      {/* Pages Container */}
      <div className="pages-container overflow-auto max-h-[80vh] bg-muted/30 p-8">
        <div className="pages-wrapper flex flex-col items-center gap-8">
          {pages.map((page, index) => (
            <Card 
              key={page.id}
              data-page-index={index}
              className="page-card relative bg-background shadow-lg"
              style={{
                width: `${A4_WIDTH}px`,
                minHeight: `${A4_HEIGHT}px`,
                padding: `${PAGE_PADDING}px`,
                position: 'relative',
              }}
            >
              {/* Single subtle margin indicator - only on focus */}
              <div 
                className="absolute pointer-events-none opacity-0 transition-opacity duration-300 page-margin-indicator border border-primary/15"
                style={{ 
                  left: `${PAGE_PADDING - 1}px`, 
                  top: `${PAGE_PADDING - 1}px`, 
                  right: `${PAGE_PADDING - 1}px`,
                  bottom: `${PAGE_PADDING - 1}px`
                }}
              />
              {/* Page Content */}
              <div
                ref={page.ref}
                className="page-content w-full h-full outline-none text-foreground arabic-text-optimized"
                style={{
                  minHeight: `${A4_HEIGHT - PAGE_PADDING * 2}px`,
                  lineHeight: '24px',
                  fontSize: '16px',
                  fontFamily: "'Arial', 'Tahoma', sans-serif",
                  textAlign: 'right',
                  direction: 'rtl',
                  padding: '0',
                  margin: '0',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  outline: 'none',
                  border: 'none',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word'
                }}
                contentEditable={!readOnly}
                suppressContentEditableWarning={true}
                onInput={() => handleInput(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={() => setCurrentPageIndex(index)}
              />
              
              {/* Page Number */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                صفحة {(index + 1).toLocaleString('ar')}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      {lastSaved && (
        <div className="p-2 text-center text-xs text-muted-foreground border-t border-border">
          آخر حفظ: {lastSaved.toLocaleString('ar')}
        </div>
      )}

      {/* CSS للتحسينات */}
      <style>{`
        .page-content:focus + .page-margin-indicator {
          opacity: 1;
        }
        
        .arabic-text-optimized {
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        @media print {
          .fixed-plain-text-a4-editor .pages-container {
            overflow: visible !important;
            max-height: none !important;
            background: white !important;
            padding: 0 !important;
          }
          
          .fixed-plain-text-a4-editor .page-card {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            page-break-after: always;
          }
          
          .fixed-plain-text-a4-editor .page-card:last-child {
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
});

FixedPlainTextA4Editor.displayName = 'FixedPlainTextA4Editor';

export default FixedPlainTextA4Editor;