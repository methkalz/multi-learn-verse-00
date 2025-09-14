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
  // A4 exact dimensions in pixels
  const A4_PAGE_HEIGHT = 930; // 246.2mm = 930px
  
  const [pages, setPages] = useState<Page[]>([
    { id: 'page-1', content: initialContent }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // Simple refs without complex observers
  const pageRefs = useRef<Map<string, HTMLElement>>(new Map());
  const checkingRef = useRef(false);

  const addPage = useCallback(() => {
    if (checkingRef.current) return null;
    
    checkingRef.current = true;
    const newPageId = `page-${Date.now()}`;
    
    setPages(prev => [...prev, { id: newPageId, content: '' }]);
    setCurrentPageIndex(prev => prev + 1);
    
    console.log('New page created:', newPageId);
    
    // Reset flag after creation
    setTimeout(() => {
      checkingRef.current = false;
    }, 1000);
    
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

  // Simple height check - only called manually and with strict conditions
  const checkPageHeight = useCallback((pageId: string) => {
    if (checkingRef.current) return;
    
    const pageElement = pageRefs.current.get(pageId);
    if (!pageElement) return;
    
    const contentArea = pageElement.querySelector('[contenteditable]') as HTMLElement;
    if (!contentArea) return;
    
    const pageIndex = pages.findIndex(p => p.id === pageId);
    const isLastPage = pageIndex === pages.length - 1;
    
    if (!isLastPage) return;
    
    // Get actual content height
    const contentHeight = contentArea.offsetHeight;
    const availableHeight = A4_PAGE_HEIGHT - 120; // Conservative margin for padding
    
    console.log(`Page ${pageIndex + 1}: content height = ${contentHeight}px, available = ${availableHeight}px`);
    
    // Only create new page if we're REALLY close to the bottom (90% full)
    if (contentHeight > availableHeight * 0.9) {
      console.log('Page is 90% full, creating new page');
      addPage();
    } else {
      console.log('Page has space remaining, no new page needed');
    }
  }, [pages, addPage, A4_PAGE_HEIGHT]);

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

  // Manual check function - to be called from component
  const manualCheckPageHeight = useCallback((pageId: string) => {
    console.log('Manual height check requested for:', pageId);
    checkPageHeight(pageId);
  }, [checkPageHeight]);

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
    manualCheckPageHeight,
    totalPages: pages.length,
    A4_PAGE_HEIGHT
  };
};