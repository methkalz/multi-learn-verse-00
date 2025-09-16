import React, { forwardRef, useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import ListItem from '@tiptap/extension-list-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import { cn } from '@/lib/utils';

interface PageData {
  id: number;
  content: any;
  editor: Editor | null;
  isFull: boolean;
}

interface MultiPageEditorProps {
  initialContent?: any;
  onContentChange?: (content: any, html: string, plainText: string) => void;
  readOnly?: boolean;
  className?: string;
  zoom?: number;
}

export const MultiPageEditor = forwardRef<HTMLDivElement, MultiPageEditorProps>(
  ({ 
    initialContent,
    onContentChange,
    readOnly = false,
    className,
    zoom = 1
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pages, setPages] = useState<PageData[]>([{ id: 1, content: initialContent, editor: null, isFull: false }]);
    const [currentPage, setCurrentPage] = useState(1);
    
    // أبعاد A4 بالبكسل
    const A4_WIDTH = 794;
    const A4_HEIGHT = 1123;
    const MARGIN = 72;
    const MAX_CONTENT_HEIGHT = A4_HEIGHT - (MARGIN * 2) - 100; // هامش أمان

    // تطبيق Zoom
    const scaledWidth = A4_WIDTH * zoom;
    const scaledHeight = A4_HEIGHT * zoom;
    const scaledMargin = MARGIN * zoom;
    const scaledMaxContentHeight = MAX_CONTENT_HEIGHT * zoom;

    // إنشاء محرر لصفحة معينة
    const createPageEditor = useCallback((pageId: number, content: any) => {
      return useEditor({
        extensions: [
          StarterKit.configure({
            document: false,
            paragraph: false,
            heading: false,
            bold: false,
            italic: false,
            bulletList: false,
            orderedList: false,
            listItem: false,
          }),
          Document,
          Paragraph,
          Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
          Bold,
          Italic,
          Underline,
          TextAlign.configure({
            types: ['heading', 'paragraph'],
            alignments: ['left', 'center', 'right', 'justify'],
          }),
          ListItem,
          BulletList,
          OrderedList,
        ],
        content: content,
        editable: !readOnly,
        onUpdate: ({ editor }) => {
          checkPageOverflow(pageId, editor);
          updateGlobalContent();
        },
        onCreate: ({ editor }) => {
          const editorElement = editor.view.dom as HTMLElement;
          editorElement.style.direction = 'rtl';
          editorElement.style.fontFamily = '"Cairo", "Amiri", "Noto Sans Arabic", Arial, sans-serif';
          editorElement.style.fontSize = '14px';
          editorElement.style.lineHeight = '1.6';
          editorElement.style.minHeight = `${scaledMaxContentHeight}px`;
          editorElement.style.maxHeight = `${scaledMaxContentHeight}px`;
          editorElement.style.overflowY = 'hidden';
        },
      });
    }, [readOnly, scaledMaxContentHeight]);

    // التحقق من امتلاء الصفحة
    const checkPageOverflow = useCallback((pageId: number, editor: Editor) => {
      const editorElement = editor.view.dom as HTMLElement;
      const contentHeight = editorElement.scrollHeight;
      
      if (contentHeight > scaledMaxContentHeight) {
        // الصفحة ممتلئة - انقل المحتوى الزائد
        moveOverflowToNextPage(pageId, editor);
      }
    }, [scaledMaxContentHeight]);

    // نقل المحتوى الزائد للصفحة التالية
    const moveOverflowToNextPage = useCallback((pageId: number, editor: Editor) => {
      // هذه وظيفة معقدة تتطلب تقسيم المحتوى
      // للبساطة، سنمنع الكتابة الإضافية ونركز على الصفحة التالية
      
      setPages(prevPages => {
        const updatedPages = [...prevPages];
        const currentPageIndex = updatedPages.findIndex(p => p.id === pageId);
        
        if (currentPageIndex !== -1) {
          updatedPages[currentPageIndex].isFull = true;
          
          // إنشاء صفحة جديدة إذا لم تكن موجودة
          if (currentPageIndex === updatedPages.length - 1) {
            updatedPages.push({
              id: pageId + 1,
              content: null,
              editor: null,
              isFull: false
            });
          }
        }
        
        return updatedPages;
      });
      
      // التركيز على الصفحة التالية
      setTimeout(() => {
        setCurrentPage(pageId + 1);
      }, 100);
      
    }, []);

    // تحديث المحتوى العام
    const updateGlobalContent = useCallback(() => {
      const allContent = pages
        .map(page => page.editor?.getJSON())
        .filter(Boolean);
        
      const allHtml = pages
        .map(page => page.editor?.getHTML())
        .filter(Boolean)
        .join('\n\n');
        
      const allText = pages
        .map(page => page.editor?.getText())
        .filter(Boolean)
        .join('\n\n');
      
      onContentChange?.(allContent, allHtml, allText);
    }, [pages, onContentChange]);

    // إنشاء المحررات عند تغيير الصفحات
    useEffect(() => {
      setPages(prevPages => 
        prevPages.map(page => ({
          ...page,
          editor: page.editor || createPageEditor(page.id, page.content)
        }))
      );
    }, [createPageEditor]);

    // تنظيف المحررات
    useEffect(() => {
      return () => {
        pages.forEach(page => {
          page.editor?.destroy();
        });
      };
    }, []);

    return (
      <div 
        ref={ref}
        className={cn(
          "multi-page-editor bg-gray-100 overflow-auto h-full",
          className
        )}
      >
        <div 
          ref={containerRef}
          className="py-8 overflow-y-auto"
          style={{
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)'
          }}
        >
          <div 
            className="mx-auto space-y-4"
            style={{ width: scaledWidth + 40 }}
          >
            {pages.map((page) => (
              <div
                key={page.id}
                className={cn(
                  "bg-white shadow-lg mx-auto relative transition-all duration-300",
                  currentPage === page.id && "ring-2 ring-primary/20"
                )}
                style={{
                  width: scaledWidth,
                  height: scaledHeight,
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center'
                }}
                onClick={() => setCurrentPage(page.id)}
              >
                {/* الهوامش المرئية */}
                <div 
                  className="absolute top-0 left-0 right-0 border-b border-dashed border-gray-300/50"
                  style={{ height: scaledMargin }}
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 border-t border-dashed border-gray-300/50"
                  style={{ height: scaledMargin }}
                />
                <div 
                  className="absolute top-0 right-0 bottom-0 border-l border-dashed border-gray-300/50"
                  style={{ width: scaledMargin }}
                />
                <div 
                  className="absolute top-0 left-0 bottom-0 border-r border-dashed border-gray-300/50"
                  style={{ width: scaledMargin }}
                />

                {/* منطقة المحرر */}
                <div 
                  className="absolute inset-0"
                  style={{
                    top: scaledMargin,
                    bottom: scaledMargin,
                    left: scaledMargin,
                    right: scaledMargin,
                  }}
                >
                  {page.editor && (
                    <EditorContent 
                      editor={page.editor}
                      className="h-full outline-none"
                    />
                  )}
                  
                  {page.isFull && (
                    <div className="absolute bottom-2 left-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                      الصفحة ممتلئة
                    </div>
                  )}
                </div>

                {/* رقم الصفحة */}
                <div 
                  className="absolute text-xs text-gray-500 select-none"
                  style={{
                    bottom: scaledMargin / 3,
                    right: scaledMargin,
                  }}
                >
                  {page.id.toLocaleString('ar')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* أدوات التنقل */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border px-3 py-1 flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              ←
            </button>
            
            <span className="text-sm font-medium min-w-[4rem] text-center">
              {currentPage.toLocaleString('ar')} / {pages.length.toLocaleString('ar')}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(pages.length, currentPage + 1))}
              disabled={currentPage >= pages.length}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>

        {/* الأنماط */}
        <style>{`
          .multi-page-editor {
            font-family: 'Cairo', 'Amiri', 'Noto Sans Arabic', Arial, sans-serif;
          }
          
          .multi-page-editor .ProseMirror {
            outline: none;
            direction: rtl;
            text-align: right;
            padding: 16px;
            height: 100%;
            overflow-y: hidden;
            box-sizing: border-box;
          }
          
          .multi-page-editor .ProseMirror p {
            margin: 0 0 1em 0;
            line-height: 1.6;
          }
          
          .multi-page-editor .ProseMirror h1,
          .multi-page-editor .ProseMirror h2,
          .multi-page-editor .ProseMirror h3,
          .multi-page-editor .ProseMirror h4,
          .multi-page-editor .ProseMirror h5,
          .multi-page-editor .ProseMirror h6 {
            font-weight: bold;
            margin: 1.5em 0 0.5em 0;
            line-height: 1.3;
          }
          
          @media print {
            .multi-page-editor {
              background: white !important;
              overflow: visible !important;
            }
            
            .multi-page-editor > div > div {
              box-shadow: none !important;
              margin: 0 !important;
              page-break-after: always;
            }
            
            .multi-page-editor > div > div:last-child {
              page-break-after: avoid;
            }
          }
        `}</style>
      </div>
    );
  }
);

MultiPageEditor.displayName = 'MultiPageEditor';

export default MultiPageEditor;