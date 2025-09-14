import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

interface Page {
  id: string;
  content: string;
}

interface A4PageProps {
  page: Page;
  pageNumber: number;
  totalPages: number;
  isActive: boolean;
  readOnly?: boolean;
  onInput: (content: string) => void;
  onFocus: () => void;
  onPageRef?: (element: HTMLDivElement | null) => void;
  onPaste?: (content: string) => void;
}

const A4Page: React.FC<A4PageProps> = ({
  page,
  pageNumber,
  totalPages,
  isActive,
  readOnly = false,
  onInput,
  onFocus,
  onPageRef,
  onPaste
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && contentRef.current.textContent !== page.content) {
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const cursorOffset = range ? range.startOffset : 0;
      
      contentRef.current.textContent = page.content;
      
      // Restore cursor position if page is active
      if (isActive && range) {
        try {
          const newRange = document.createRange();
          const textNode = contentRef.current.firstChild;
          if (textNode) {
            const offset = Math.min(cursorOffset, textNode.textContent?.length || 0);
            newRange.setStart(textNode, offset);
            newRange.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
          }
        } catch (error) {
          // Cursor position restoration failed, continue normally
        }
      }
    }
  }, [page.content, isActive]);

  // Register page ref with parent
  useEffect(() => {
    if (onPageRef && contentRef.current) {
      onPageRef(contentRef.current);
    }
    return () => {
      if (onPageRef) {
        onPageRef(null);
      }
    };
  }, [onPageRef]);

  const handleInput = () => {
    if (contentRef.current && !readOnly) {
      const content = contentRef.current.textContent || '';
      onInput(content);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text/plain');
    
    // For large paste operations, use the specialized handler
    if (pastedText.length > 500 && onPaste) {
      onPaste(pastedText);
      return;
    }
    
    // For small pastes, insert at cursor position
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(pastedText));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Trigger input event
    if (contentRef.current) {
      const content = contentRef.current.textContent || '';
      onInput(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow normal text editing
    if (e.key === 'Enter') {
      // Let the browser handle line breaks naturally
      return;
    }
  };

  return (
    <Card 
      className={`
        a4-page relative bg-background shadow-lg border transition-all duration-200 mx-auto
        ${isActive ? 'ring-2 ring-primary shadow-xl scale-[1.01]' : 'hover:shadow-xl'}
        ${readOnly ? 'cursor-default' : 'cursor-text'}
      `}
      style={{
        width: '794px', // A4 width: 210mm = 794px at 96 DPI
        height: '1123px', // A4 height: 297mm = 1123px at 96 DPI
        minHeight: '1123px',
        maxHeight: '1123px',
        overflow: 'hidden',
        pageBreakAfter: 'always'
      }}
      onClick={() => {
        onFocus();
        if (!readOnly && contentRef.current) {
          contentRef.current.focus();
        }
      }}
    >
      {/* Page header with page number */}
      <div className="absolute top-4 right-4 z-10 no-print">
        <Badge variant="secondary" className="gap-1 text-xs">
          <FileText className="h-3 w-3" />
          صفحة {pageNumber} من {totalPages}
        </Badge>
      </div>

      {/* Margin indicators (visible only in edit mode) */}
      {!readOnly && (
        <div className="absolute inset-0 pointer-events-none no-print">
          {/* Top margin line */}
          <div 
            className="absolute left-0 right-0 border-t border-primary/20" 
            style={{ top: '96px' }}
          />
          {/* Bottom margin line */}
          <div 
            className="absolute left-0 right-0 border-t border-primary/20" 
            style={{ bottom: '96px' }}
          />
          {/* Left margin line */}
          <div 
            className="absolute top-0 bottom-0 border-l border-primary/20" 
            style={{ left: '96px' }}
          />
          {/* Right margin line */}
          <div 
            className="absolute top-0 bottom-0 border-r border-primary/20" 
            style={{ right: '96px' }}
          />
        </div>
      )}

      {/* Content area */}
      <div
        ref={contentRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        className={`
          absolute outline-none transition-colors duration-200
          ${!readOnly ? 'focus:bg-primary/5' : ''}
        `}
        style={{
          top: '96px',
          left: '96px',
          width: '602px', // 794 - 96*2 = 602px
          height: '931px', // 1123 - 96*2 = 931px
          padding: '0', // No padding - text starts at margin
          margin: '0',
          wordWrap: 'break-word',
          hyphens: 'auto',
          direction: 'rtl',
          textAlign: 'right',
          fontSize: '16px',
          lineHeight: '1.5', // 24px line height
          fontFamily: '"Times New Roman", "Amiri", serif',
          overflow: 'hidden',
          boxSizing: 'border-box',
          whiteSpace: 'pre-wrap'
        }}
        dir="rtl"
      />

      {/* Print page break */}
      <div className="page-break" />
    </Card>
  );
};

export default A4Page;