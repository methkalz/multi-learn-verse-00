import React, { useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Save, Printer, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// A4 page dimensions in pixels (96 DPI)
const A4_WIDTH = 794; // 21cm at 96 DPI
const A4_HEIGHT = 1123; // 29.7cm at 96 DPI
const PAGE_MARGIN = 76; // 2cm margins
const CONTENT_WIDTH = A4_WIDTH - (PAGE_MARGIN * 2);
const CONTENT_HEIGHT = A4_HEIGHT - (PAGE_MARGIN * 2);
const LINE_HEIGHT = 24;
const MAX_LINES = Math.floor(CONTENT_HEIGHT / LINE_HEIGHT); // ~42 lines per page

interface ProfessionalA4EditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
  readOnly?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
  className?: string;
}

export interface ProfessionalA4EditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  focus: () => void;
  save: () => Promise<void>;
}

const ProfessionalA4Editor = forwardRef<ProfessionalA4EditorRef, ProfessionalA4EditorProps>(({
  initialContent = '',
  onContentChange,
  onSave,
  readOnly = false,
  autoSave = true,
  autoSaveInterval = 30000,
  className
}, ref) => {
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [wordCount, setWordCount] = React.useState(0);
  const [pageCount, setPageCount] = React.useState(1);
  const [pages, setPages] = useState<string[]>(['']);
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout>();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      const text = editor.getText();
      
      // Update stats
      setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
      
      // Calculate pages based on content length
      const calculatedPages = Math.max(1, Math.ceil(text.length / 2500)); // Approx 2500 chars per page
      setPageCount(calculatedPages);
      
      // Trigger content change
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
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
          'min-h-full p-4 text-foreground',
          'font-serif leading-relaxed',
          '[&>*]:!max-w-none [&>*]:!w-full'
        ),
        style: `
          direction: rtl;
          text-align: right;
          line-height: ${LINE_HEIGHT}px;
          font-family: 'Arial', 'Tahoma', sans-serif;
          font-size: 16px;
        `
      }
    }
  });

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
    if (!editor || !onSave || isSaving) return;
    
    try {
      setIsSaving(true);
      const content = editor.getHTML();
      await onSave(content);
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

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    getContent: () => editor?.getHTML() || '',
    setContent: (content: string) => editor?.commands.setContent(content),
    focus: () => editor?.commands.focus(),
    save: handleManualSave
  }));

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              الصفحة {pageCount.toLocaleString('ar')}
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

      {/* A4 Document Container */}
      <div className="w-full max-w-4xl mx-auto">
        <Card className="shadow-lg page-container">
          <div 
            className="mx-auto bg-white page-content"
            style={{
              width: `${A4_WIDTH}px`,
              minHeight: `${A4_HEIGHT}px`,
              padding: `${PAGE_MARGIN}px`,
              position: 'relative'
            }}
          >
            <EditorContent 
              editor={editor}
              className="min-h-full"
              style={{
                width: `${CONTENT_WIDTH}px`,
                minHeight: `${CONTENT_HEIGHT}px`
              }}
            />
            
            {/* Page number */}
            <div 
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground"
              style={{ direction: 'ltr' }}
            >
              صفحة {pageCount.toLocaleString('ar')}
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Print Styles */}
      <style>{`
        /* Page Container Styles */
        .page-container {
          page-break-after: always;
          break-after: page;
        }
        
        .page-content {
          overflow: hidden;
          position: relative;
        }
        
        /* Editor Styles */
        .ProseMirror {
          outline: none;
          direction: rtl;
          text-align: right;
          font-family: 'Arial', 'Tahoma', sans-serif;
          font-size: 16px;
          line-height: ${LINE_HEIGHT}px;
          padding: 0;
          margin: 0;
          height: 100%;
        }
        
        /* Readonly page content */
        .readonly-page-content {
          padding: 0;
          margin: 0;
        }
        
        .readonly-page-content p {
          margin: 0 0 1em 0;
          line-height: ${LINE_HEIGHT}px;
        }
        
        .readonly-page-content h1,
        .readonly-page-content h2,
        .readonly-page-content h3,
        .readonly-page-content h4,
        .readonly-page-content h5,
        .readonly-page-content h6 {
          margin: 1em 0 0.5em 0;
          line-height: 1.2;
        }
        
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          .page-container {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            page-break-after: always;
          }
          
          .page-content {
            margin: 0 !important;
          }
          
          body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            direction: rtl;
            text-align: right;
          }
        }
        
        @media screen {
          .page-container:not(:last-child) {
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
});

ProfessionalA4Editor.displayName = 'ProfessionalA4Editor';

export default ProfessionalA4Editor;