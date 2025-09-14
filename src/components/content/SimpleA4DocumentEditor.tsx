import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useA4PageSystem } from '@/hooks/useA4PageSystem';
import DocumentToolbar from './DocumentToolbar';
import A4Page from './A4Page';
import { 
  Save, 
  FileText, 
  Eye,
  Clock,
  Type
} from 'lucide-react';

interface SimpleA4DocumentEditorProps {
  initialContent?: string;
  onContentChange?: (content: string, wordCount: number, pageCount: number) => void;
  onSave?: () => void;
  readOnly?: boolean;
  autoSave?: boolean;
  className?: string;
}

const SimpleA4DocumentEditor: React.FC<SimpleA4DocumentEditorProps> = ({
  initialContent = '',
  onContentChange,
  onSave,
  readOnly = false,
  autoSave = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const {
    pages,
    currentPageIndex,
    addPage,
    updatePageContent,
    deleteLastPageIfEmpty,
    getTotalContent,
    focusPage,
    handlePageInput
  } = useA4PageSystem({
    initialContent,
    onContentChange: (content, pageCount) => {
      // Calculate word count
      const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
      setWordCount(words);
      onContentChange?.(content, words, pageCount);
    }
  });

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || readOnly) return;

    const autoSaveTimer = setTimeout(async () => {
      if (onSave) {
        setIsSaving(true);
        try {
          await onSave();
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [getTotalContent(), autoSave, readOnly, onSave]);

  const handleManualSave = async () => {
    if (!onSave || readOnly) return;

    setIsSaving(true);
    try {
      await onSave();
      setLastSaved(new Date());
    } catch (error) {
      console.error('Manual save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'لم يُحفظ بعد';
    return `آخر حفظ: ${lastSaved.toLocaleTimeString('ar')}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`w-full h-full flex flex-col bg-muted/30 ${className}`}>
      {/* Header with stats and controls */}
      <div className="flex items-center justify-between p-4 bg-background border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-medium">محرر المستندات</span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="secondary" className="gap-1">
              <Type className="h-3 w-3" />
              {wordCount} كلمة
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <FileText className="h-3 w-3" />
              {pages.length} صفحة
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <span className="text-xs text-muted-foreground">
                {isSaving ? 'جاري الحفظ...' : formatLastSaved()}
              </span>
              <Button 
                onClick={handleManualSave}
                disabled={isSaving || readOnly}
                size="sm"
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                حفظ
              </Button>
            </>
          )}
          <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            طباعة
          </Button>
        </div>
      </div>

      {/* Document toolbar */}
      {!readOnly && (
        <DocumentToolbar onContentChange={onContentChange} />
      )}

      {/* Document container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-muted/20 p-8"
        style={{ 
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      >
        <div className="max-w-[794px] mx-auto space-y-6">
          {pages.map((page, index) => (
            <A4Page
              key={page.id}
              page={page}
              pageNumber={index + 1}
              totalPages={pages.length}
              isActive={index === currentPageIndex}
              readOnly={readOnly}
              onInput={(content) => handlePageInput(page.id, content)}
              onFocus={() => focusPage(index)}
            />
          ))}
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            background: white !important;
          }
          
          .a4-page {
            page-break-after: always;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
          }
          
          .a4-page:last-child {
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default SimpleA4DocumentEditor;