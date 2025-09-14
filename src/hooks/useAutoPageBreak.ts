import { useState, useEffect, useRef, useCallback } from 'react';

interface Page {
  id: string;
  content: string;
}

interface UseAutoPageBreakOptions {
  pageHeight?: number;
  onContentChange?: (content: string) => void;
  initialContent?: string;
}

export const useAutoPageBreak = ({
  pageHeight = 1056, // A4 height in pixels at 96 DPI minus margins
  onContentChange,
  initialContent = ''
}: UseAutoPageBreakOptions = {}) => {
  const [pages, setPages] = useState<Page[]>([
    { id: 'page-1', content: initialContent }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);
  const pageRefs = useRef<Map<string, HTMLElement>>(new Map());

  const addPage = useCallback(() => {
    const newPageId = `page-${Date.now()}`;
    setPages(prev => [...prev, { id: newPageId, content: '' }]);
    return newPageId;
  }, []);

  const updatePageContent = useCallback((pageId: string, content: string) => {
    setPages(prev => prev.map(page => 
      page.id === pageId ? { ...page, content } : page
    ));
    
    // Notify parent of content change
    if (onContentChange) {
      const allContent = pages.map(p => p.id === pageId ? content : p.content).join('\n\n<!-- PAGE_BREAK -->\n\n');
      onContentChange(allContent);
    }
  }, [pages, onContentChange]);

  const checkPageOverflow = useCallback((pageElement: HTMLElement, pageId: string) => {
    if (!pageElement) return;

    const contentHeight = pageElement.scrollHeight;
    const pageIndex = pages.findIndex(p => p.id === pageId);
    
    if (contentHeight > pageHeight && pageIndex === pages.length - 1) {
      // Content overflows and this is the last page, create new page
      const overflowContent = extractOverflowContent(pageElement, pageHeight);
      
      if (overflowContent) {
        // Move overflow content to new page
        const remainingContent = pageElement.innerHTML.replace(overflowContent, '');
        updatePageContent(pageId, remainingContent);
        
        // Add new page with overflow content
        const newPageId = addPage();
        setTimeout(() => {
          updatePageContent(newPageId, overflowContent);
        }, 100);
      }
    }
  }, [pageHeight, pages, updatePageContent, addPage]);

  const extractOverflowContent = (element: HTMLElement, maxHeight: number): string => {
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.height = `${maxHeight}px`;
    clone.style.overflow = 'hidden';
    
    // Find the point where content overflows
    const walker = document.createTreeWalker(
      clone,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node;
    let overflowPoint = null;
    
    while (node = walker.nextNode()) {
      const range = document.createRange();
      range.selectNodeContents(node);
      const rect = range.getBoundingClientRect();
      
      if (rect.bottom > maxHeight) {
        overflowPoint = node;
        break;
      }
    }
    
    if (overflowPoint && overflowPoint.parentElement) {
      // Extract content from overflow point onwards
      const overflowElement = overflowPoint.parentElement;
      const siblings = Array.from(overflowElement.parentNode?.children || []);
      const startIndex = siblings.indexOf(overflowElement);
      
      return siblings.slice(startIndex).map(el => (el as HTMLElement).outerHTML).join('');
    }
    
    return '';
  };

  const registerPageRef = useCallback((pageId: string, element: HTMLElement | null) => {
    if (element) {
      pageRefs.current.set(pageId, element);
      
      // Set up ResizeObserver for this page
      if (!observerRef.current) {
        observerRef.current = new ResizeObserver((entries) => {
          entries.forEach((entry) => {
            const pageId = Array.from(pageRefs.current.entries())
              .find(([, el]) => el === entry.target)?.[0];
            
            if (pageId) {
              checkPageOverflow(entry.target as HTMLElement, pageId);
            }
          });
        });
      }
      
      observerRef.current.observe(element);
    } else {
      // Clean up when element is removed
      const entries = Array.from(pageRefs.current.entries());
      const [pageId] = entries.find(([, el]) => !document.contains(el)) || [];
      
      if (pageId) {
        pageRefs.current.delete(pageId);
      }
    }
  }, [checkPageOverflow]);

  const removePage = useCallback((pageId: string) => {
    if (pages.length > 1) {
      setPages(prev => prev.filter(page => page.id !== pageId));
      pageRefs.current.delete(pageId);
    }
  }, [pages.length]);

  // Load initial content into pages if provided
  useEffect(() => {
    if (initialContent && initialContent.includes('<!-- PAGE_BREAK -->')) {
      const pageContents = initialContent.split('\n\n<!-- PAGE_BREAK -->\n\n');
      const newPages = pageContents.map((content, index) => ({
        id: `page-${index + 1}`,
        content: content.trim()
      }));
      setPages(newPages);
    }
  }, [initialContent]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    pages,
    currentPageIndex,
    setCurrentPageIndex,
    addPage,
    removePage,
    updatePageContent,
    registerPageRef,
    totalPages: pages.length
  };
};