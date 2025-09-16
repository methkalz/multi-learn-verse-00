import React, { useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface MultiPageTipTapEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
  readOnly?: boolean;
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
  className
}, ref) => {
  const [isSaving, setIsSaving] = useState(false);

  // Main editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange?.(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
          'min-h-[400px] w-full p-4',
          '[&_*]:direction-rtl [&_*]:text-right'
        ),
        dir: 'rtl',
        style: 'direction: rtl; text-align: right; font-family: Arial, Tahoma, sans-serif;'
      },
    },
  });

  const handleSave = async () => {
    if (!onSave || !editor || isSaving) return;
    
    try {
      setIsSaving(true);
      const content = editor.getHTML();
      await onSave(content);
      toast.success('تم حفظ المستند بنجاح');
    } catch (error) {
      console.error('Save failed:', error);
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

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    getContent: () => editor?.getHTML() || '',
    setContent: (content: string) => {
      editor?.commands.setContent(content);
    },
    focus: () => {
      editor?.commands.focus();
    },
    save: handleSave
  }));

  // Update content when initialContent changes
  useEffect(() => {
    if (initialContent && editor) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  return (
    <div className={cn('w-full mx-auto', className)}>
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4 p-4 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold">محرر النص</h3>
        
        <div className="flex items-center gap-2">
          {onSave && !readOnly && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              variant="outline"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'جاري الحفظ...' : 'حفظ'}
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

      {/* Editor */}
      <div className="border rounded-lg">
        <EditorContent 
          editor={editor}
          className="prose prose-sm max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px]"
        />
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }
          
          body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            direction: rtl;
            text-align: right;
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