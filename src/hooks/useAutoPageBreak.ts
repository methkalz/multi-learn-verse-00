import { useState, useEffect, useRef, useCallback } from 'react';

interface Page {
  id: string;
  content: string;
}

interface UseAutoPageBreakOptions {
  onContentChange?: (content: string) => void;
  initialContent?: string;
}

export const useAutoPageBreak = ({
  onContentChange,
  initialContent = ''
}: UseAutoPageBreakOptions = {}) => {
  // A4 exact dimensions: 8.5 x 11 inches = 816px x 1056px (96 DPI)
  // But we need to account for margins, so usable area is smaller
  const A4_PAGE_HEIGHT = 950; // Usable height after margins
  
  const [pages, setPages] = useState<Page[]>([
    { id: 'page-1', content: initialContent }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // Simple refs without complex state management
  const pageRefs = useRef<Map<string, HTMLElement>>(new Map());

  const addPage = useCallback(() => {
    const newPageId = `page-${Date.now()}`;
    
    setPages(prev => {
      const newPages = [...prev, { id: newPageId, content: '' }];
      console.log('Added new page, total pages:', newPages.length);
      return newPages;
    });
    
    setCurrentPageIndex(prev => prev + 1);
    return newPageId;
  }, []);

  const updatePageContent = useCallback((pageId: string, content: string) => {
    setPages(prev => prev.map(page => 
      page.id === pageId ? { ...page, content } : page
    ));
    
    if (onContentChange) {
      const allContent = pages.map(p => p.id === pageId ? content : p.content).join('\n\n<!-- PAGE_BREAK -->\n\n');
      onContentChange(allContent);
    }
  }, [pages, onContentChange]);

  const registerPageRef = useCallback((pageId: string, element: HTMLElement | null) => {
    if (element) {
      pageRefs.current.set(pageId, element);
      console.log(`Registered page: ${pageId}`);
    } else {
      pageRefs.current.delete(pageId);
      console.log(`Unregistered page: ${pageId}`);
    }
  }, []);

  const removePage = useCallback((pageId: string) => {
    if (pages.length > 1) {
      setPages(prev => prev.filter(page => page.id !== pageId));
      pageRefs.current.delete(pageId);
    }
  }, [pages.length]);

  // Load initial content
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

  return {
    pages,
    currentPageIndex,
    setCurrentPageIndex,
    addPage,
    removePage,
    updatePageContent,
    registerPageRef,
    totalPages: pages.length,
    A4_PAGE_HEIGHT
  };
};