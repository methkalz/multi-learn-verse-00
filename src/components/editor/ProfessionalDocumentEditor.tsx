import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
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
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Typography from '@tiptap/extension-typography';
import { cn } from '@/lib/utils';
import { ProfessionalToolbar } from './ProfessionalToolbar';
import { MultiPageEditor } from './MultiPageEditor';
import { ExportEngine } from './ExportEngine';
import { CollaborationSystem } from './CollaborationSystem';
import { AutoSaveSystem } from './AutoSaveSystem';

interface ProfessionalDocumentEditorProps {
  documentId?: string;
  initialContent?: any;
  onContentChange?: (content: any, html: string, plainText: string) => void;
  onSave?: (content: any) => void;
  readOnly?: boolean;
  className?: string;
  showToolbar?: boolean;
  showPageBreaks?: boolean;
  enableCollaboration?: boolean;
  autoSave?: boolean;
  title?: string;
}

export const ProfessionalDocumentEditor: React.FC<ProfessionalDocumentEditorProps> = ({
  documentId,
  initialContent,
  onContentChange,
  onSave,
  readOnly = false,
  className,
  showToolbar = true,
  showPageBreaks = true,
  enableCollaboration = true,
  autoSave = true,
  title = "مستند جديد"
}) => {
  const [isA4Mode, setIsA4Mode] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  
  const editor = useEditor({
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
      Paragraph.configure({
        HTMLAttributes: {
          class: 'tiptap-paragraph',
        },
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
        HTMLAttributes: {
          class: 'tiptap-heading',
        },
      }),
      Bold,
      Italic,
      Underline,
      TextStyle,
      Color,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      ListItem,
      BulletList.configure({
        HTMLAttributes: {
          class: 'tiptap-bullet-list',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'tiptap-ordered-list',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Typography,
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      const html = editor.getHTML();
      const plainText = editor.getText();
      
      // حساب إحصائيات النص
      setWordCount(plainText.split(/\s+/).filter(word => word.length > 0).length);
      setCharacterCount(plainText.length);
      
      // استدعاء callback التغيير
      onContentChange?.(content, html, plainText);
      
      // إعداد الحفظ التلقائي
      if (autoSave && documentId) {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = setTimeout(() => {
          handleAutoSave(content);
        }, 2000); // حفظ تلقائي كل ثانيتين
      }
    },
    onCreate: ({ editor }) => {
      // تطبيق إعدادات RTL والخطوط العربية
      const editorElement = editor.view.dom as HTMLElement;
      editorElement.style.direction = 'rtl';
      editorElement.style.fontFamily = '"Cairo", "Amiri", "Noto Sans Arabic", Arial, sans-serif';
      editorElement.style.fontSize = '14px';
      editorElement.style.lineHeight = '1.6';
    },
  }, [isA4Mode, initialContent, readOnly]); // إضافة dependencies

  // وظيفة الحفظ التلقائي
  const handleAutoSave = useCallback(async (content: any) => {
    if (!onSave || isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave(content);
      setLastSaved(new Date());
    } catch (error) {
      console.error('خطأ في الحفظ التلقائي:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, isSaving]);

  // وظيفة الحفظ اليدوي
  const handleManualSave = useCallback(async () => {
    if (!editor || !onSave || isSaving) return;
    
    const content = editor.getJSON();
    setIsSaving(true);
    
    try {
      await onSave(content);
      setLastSaved(new Date());
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editor, onSave, isSaving]);

  // إدارة صفحات A4
  const updatePageInfo = useCallback(() => {
    if (!editorRef.current || !isA4Mode) return;
    
    const editorHeight = editorRef.current.scrollHeight;
    const a4Height = 1056; // ارتفاع A4 بالبكسل (297mm في 72 DPI)
    const calculatedPages = Math.ceil(editorHeight / a4Height);
    setTotalPages(Math.max(1, calculatedPages));
  }, [isA4Mode]);

  useEffect(() => {
    const interval = setInterval(updatePageInfo, 1000);
    return () => clearInterval(interval);
  }, [updatePageInfo]);

  // تنظيف timeout عند إلغاء المكون
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // وظيفة معالجة تغيير المحتوى في وضع A4
  const handleA4ContentChange = useCallback((content: any, html: string, plainText: string) => {
    // حساب إحصائيات النص
    setWordCount(plainText.split(/\s+/).filter(word => word.length > 0).length);
    setCharacterCount(plainText.length);
    
    // استدعاء callback التغيير
    onContentChange?.(content, html, plainText);
    
    // إعداد الحفظ التلقائي
    if (autoSave && documentId) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave(content);
      }, 2000);
    }
  }, [onContentChange, autoSave, documentId]);

  if (!editor && !isA4Mode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn("professional-document-editor flex flex-col h-full", className)}>
      {/* شريط الأدوات */}
      {showToolbar && (
        <ProfessionalToolbar
          editor={editor}
          onSave={handleManualSave}
          isSaving={isSaving}
          lastSaved={lastSaved}
          documentId={documentId}
          title={title}
          isA4Mode={isA4Mode}
          onToggleA4Mode={setIsA4Mode}
          wordCount={wordCount}
          characterCount={characterCount}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      )}

      {/* منطقة المحرر */}
      <div className="flex-1 relative overflow-hidden">
        {enableCollaboration && documentId && (
          <CollaborationSystem
            documentId={documentId}
            editor={editor}
          />
        )}
        
        {isA4Mode ? (
          <MultiPageEditor
            ref={editorRef}
            initialContent={initialContent}
            onContentChange={handleA4ContentChange}
            readOnly={readOnly}
            className="h-full"
          />
        ) : (
          <div 
            ref={editorRef}
            className="h-full p-6 overflow-y-auto bg-background"
          >
            <EditorContent 
              editor={editor}
              className="tiptap-editor min-h-full outline-none prose prose-lg max-w-none"
            />
          </div>
        )}
      </div>

      {/* شريط الحالة */}
      <div className="border-t bg-muted/30 px-4 py-2 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>الكلمات: {wordCount.toLocaleString('ar')}</span>
          <span>الأحرف: {characterCount.toLocaleString('ar')}</span>
          {isA4Mode && (
            <>
              <span>الصفحة: {currentPage.toLocaleString('ar')}</span>
              <span>من: {totalPages.toLocaleString('ar')}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {autoSave && (
            <div className="flex items-center gap-1">
              {isSaving ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  <span>جاري الحفظ...</span>
                </>
              ) : lastSaved ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>آخر حفظ: {lastSaved.toLocaleTimeString('ar')}</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span>غير محفوظ</span>
                </>
              )}
            </div>
          )}
          
          {documentId && (
            <ExportEngine
              editor={editor}
              documentId={documentId}
              title={title}
            />
          )}
        </div>
      </div>

      {/* Auto Save System */}
      {autoSave && documentId && (
        <AutoSaveSystem
          documentId={documentId}
          editor={editor}
          content={editor.getJSON()}
          enabled={autoSave}
        />
      )}
      <style>{`
        .professional-document-editor {
          --editor-font-family: 'Cairo', 'Amiri', 'Noto Sans Arabic', Arial, sans-serif;
        }
        
        .tiptap-editor {
          direction: rtl;
          font-family: var(--editor-font-family);
        }
        
        .tiptap-paragraph {
          margin: 0 0 1em 0;
          line-height: 1.6;
        }
        
        .tiptap-heading {
          font-weight: bold;
          margin: 1.5em 0 0.5em 0;
          line-height: 1.3;
        }
        
        .tiptap-heading:first-child {
          margin-top: 0;
        }
        
        .tiptap-bullet-list,
        .tiptap-ordered-list {
          margin: 1em 0;
          padding-right: 1.5em;
        }
        
        .tiptap-bullet-list li,
        .tiptap-ordered-list li {
          margin: 0.25em 0;
        }
        
        .tiptap-image {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1em auto;
        }
        
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 1em 0;
          overflow: hidden;
        }
        
        .ProseMirror td,
        .ProseMirror th {
          min-width: 1em;
          border: 1px solid #ced4da;
          padding: 8px 12px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
          text-align: right;
        }
        
        .ProseMirror th {
          font-weight: bold;
          background-color: #f8f9fa;
        }
        
        .ProseMirror .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: rgba(200, 200, 255, 0.4);
          pointer-events: none;
        }
        
        @media print {
          .professional-document-editor {
            height: auto !important;
          }
          
          .tiptap-editor {
            font-size: 12pt !important;
            line-height: 1.5 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalDocumentEditor;