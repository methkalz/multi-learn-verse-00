import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface Page {
  id: string;
  content: string;
}

interface UseSmartPageBreakOptions {
  onContentChange?: (content: string) => void;
  initialContent?: string;
  linesPerPage?: number;
}

export const useSmartPageBreak = ({
  onContentChange,
  initialContent = '',
  linesPerPage = 35
}: UseSmartPageBreakOptions = {}) => {
  // A4 dimensions and line calculations with Word-like margins
  const A4_PAGE_HEIGHT = 760; // Reduced usable height due to 95px margins on top/bottom (950 - 190)
  const LINE_HEIGHT = 26; // 16px font * 1.6 line-height ≈ 26px
  const MAX_LINES_PER_PAGE = Math.floor(linesPerPage * 0.85); // Reduced to ~30 lines for safety
  
  const [pages, setPages] = useState<Page[]>([
    { id: 'page-1', content: initialContent }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  const pageRefs = useRef<Map<string, HTMLElement>>(new Map());
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Calculate text lines in element
  const calculateLines = useCallback((element: HTMLElement): number => {
    if (!element) return 0;
    
    const style = window.getComputedStyle(element);
    const lineHeight = parseInt(style.lineHeight) || LINE_HEIGHT;
    const scrollHeight = element.scrollHeight;
    
    return Math.ceil(scrollHeight / lineHeight);
  }, []);

  // Smart content analysis to determine if page break is needed
  const needsPageBreak = useCallback((element: HTMLElement): boolean => {
    const lines = calculateLines(element);
    console.log(`Lines: ${lines}, Max: ${MAX_LINES_PER_PAGE}`);
    return lines >= MAX_LINES_PER_PAGE;
  }, [calculateLines]);

  // Move overflow content to new page
  const moveOverflowContent = useCallback((currentElement: HTMLElement, newPageId: string) => {
    const selection = window.getSelection();
    if (!selection) return;

    // Get cursor position
    const range = selection.getRangeAt(0);
    const cursorOffset = range.startOffset;
    const cursorNode = range.startContainer;

    // Calculate which part should stay and which should move
    const currentContent = currentElement.innerHTML;
    const textNodes = currentElement.childNodes;
    
    // Simple approach: move last paragraph or line to new page
    const lastParagraph = currentElement.lastElementChild as HTMLElement;
    if (lastParagraph) {
      const contentToMove = lastParagraph.outerHTML;
      lastParagraph.remove();
      
      // Set content on new page
      setTimeout(() => {
        const newPageElement = document.querySelector(`[data-page-id="${newPageId}"] [contenteditable]`) as HTMLElement;
        if (newPageElement) {
          newPageElement.innerHTML = contentToMove;
          newPageElement.focus();
          
          // Set cursor at beginning
          const newRange = document.createRange();
          const newSelection = window.getSelection();
          newRange.setStart(newPageElement, 0);
          newRange.collapse(true);
          newSelection?.removeAllRanges();
          newSelection?.addRange(newRange);
        }
      }, 50);
    }
  }, []);

  const addPage = useCallback(() => {
    const newPageId = `page-${Date.now()}`;
    
    setPages(prev => {
      const newPages = [...prev, { id: newPageId, content: '' }];
      console.log('✅ Added new page, total pages:', newPages.length);
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
      setPages(currentPages => {
        const allContent = currentPages.map(p => 
          p.id === pageId ? content : p.content
        ).join('\n\n<!-- PAGE_BREAK -->\n\n');
        onContentChange(allContent);
        return currentPages;
      });
    }
  }, [onContentChange]);

  const registerPageRef = useCallback((pageId: string, element: HTMLElement | null) => {
    if (element) {
      pageRefs.current.set(pageId, element);
      console.log(`📄 Registered page: ${pageId}`);
    } else {
      pageRefs.current.delete(pageId);
      console.log(`🗑️ Unregistered page: ${pageId}`);
    }
  }, []);

  const removePage = useCallback((pageId: string) => {
    if (pages.length > 1) {
      setPages(prev => prev.filter(page => page.id !== pageId));
      pageRefs.current.delete(pageId);
    }
  }, [pages.length]);

  // Smart overflow detection with debouncing
  const checkForOverflow = useCallback((element: HTMLElement, pageId: string) => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce check by 200ms for faster response
    debounceTimer.current = setTimeout(() => {
      const pageIndex = pages.findIndex(p => p.id === pageId);
      const isLastPage = pageIndex === pages.length - 1;
      
      if (!isLastPage) return;
      
      if (needsPageBreak(element)) {
        console.log('🚨 Page overflow detected - creating new page...');
        const newPageId = addPage();
        
        // Move overflow content
        if (newPageId) {
          moveOverflowContent(element, newPageId);
        }
      }
    }, 200);
  }, [pages, needsPageBreak, addPage, moveOverflowContent]);

  // Load initial content with page breaks
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

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
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
    checkForOverflow,
    totalPages: pages.length,
    A4_PAGE_HEIGHT,
    LINE_HEIGHT,
    MAX_LINES_PER_PAGE
  };
};