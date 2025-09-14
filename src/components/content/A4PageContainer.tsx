import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface A4PageContainerProps {
  pages: Array<{ id: string; content: string }>;
  currentPageIndex: number;
  onPageContentChange: (pageId: string, content: string) => void;
  onRegisterPageRef: (pageId: string, element: HTMLElement | null) => void;
  className?: string;
  readOnly?: boolean;
}

export const A4PageContainer: React.FC<A4PageContainerProps> = ({
  pages,
  currentPageIndex,
  onPageContentChange,
  onRegisterPageRef,
  className,
  readOnly = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContentChange = (pageId: string, event: React.FormEvent<HTMLDivElement>) => {
    const content = event.currentTarget.innerHTML;
    onPageContentChange(pageId, content);
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  useEffect(() => {
    // Auto-scroll to current page
    if (containerRef.current && currentPageIndex >= 0) {
      const pageElement = containerRef.current.children[currentPageIndex] as HTMLElement;
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentPageIndex]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "a4-pages-container",
        "flex flex-col items-center gap-8 p-8 bg-muted/20 min-h-screen",
        className
      )}
    >
      {pages.map((page, index) => (
        <div
          key={page.id}
          className={cn(
            "a4-page",
            "bg-background shadow-lg",
            "w-[210mm] min-h-[297mm]",
            "p-[25.4mm]", // 1 inch margins
            "relative",
            "transition-all duration-200",
            index === currentPageIndex && "ring-2 ring-primary/20"
          )}
          style={{
            // A4 dimensions: 210 × 297 mm
            width: '210mm',
            minHeight: '297mm',
            maxHeight: '297mm',
            overflow: 'visible'
          }}
        >
          {/* Page number indicator */}
          <div className="absolute top-2 right-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            صفحة {index + 1} من {pages.length}
          </div>
          
          {/* Content area */}
          <div
            ref={(el) => onRegisterPageRef(page.id, el)}
            className={cn(
              "a4-content-area",
              "w-full min-h-full",
              "prose prose-lg max-w-none",
              "focus:outline-none",
              "text-foreground",
              "[&>*]:mb-4 [&>*:last-child]:mb-0",
              "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-6",
              "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-4",
              "[&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-3",
              "[&_p]:leading-relaxed [&_p]:mb-4",
              "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4",
              "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4",
              "[&_li]:mb-2",
              "[&_table]:border-collapse [&_table]:w-full [&_table]:mb-4",
              "[&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted",
              "[&_td]:border [&_td]:border-border [&_td]:p-2",
              "[&_img]:max-w-full [&_img]:h-auto [&_img]:mb-4",
              "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:mb-4"
            )}
            contentEditable={!readOnly}
            suppressContentEditableWarning={true}
            onInput={(e) => handleContentChange(page.id, e)}
            onPaste={handlePaste}
            dangerouslySetInnerHTML={{ __html: page.content }}
            style={{
              minHeight: 'calc(297mm - 50.8mm)', // Full height minus margins
              maxHeight: 'calc(297mm - 50.8mm)',
              overflow: 'hidden',
              wordWrap: 'break-word',
              hyphens: 'auto',
              direction: 'rtl',
              textAlign: 'right'
            }}
          />
          
          {/* Page break indicator */}
          {index < pages.length - 1 && (
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border">
              فاصل الصفحة
            </div>
          )}
        </div>
      ))}
      
      {/* Add page button */}
      <div className="text-center py-8">
        <div className="text-sm text-muted-foreground">
          سيتم إنشاء صفحة جديدة تلقائياً عند امتلاء الصفحة السابقة
        </div>
      </div>
    </div>
  );
};