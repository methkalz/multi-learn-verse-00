import { useState, useCallback, useRef, useEffect } from 'react';

interface Page {
  id: string;
  content: string;
}

interface UseA4PageSystemOptions {
  initialContent?: string;
  onContentChange?: (content: string, pageCount: number) => void;
}

export const useA4PageSystem = ({
  initialContent = '',
  onContentChange
}: UseA4PageSystemOptions = {}) => {
  // A4 precise dimensions at 96 DPI
  const A4_WIDTH = 794; // 210mm = 794px
  const A4_HEIGHT = 1123; // 297mm = 1123px
  const MARGIN = 96; // 2.54cm = 96px (Word standard)
  const USABLE_HEIGHT = A4_HEIGHT - (MARGIN * 2); // 931px
  const LINE_HEIGHT = 24; // 16px font * 1.5 line-height
  const MAX_LINES_PER_PAGE = Math.floor(USABLE_HEIGHT / LINE_HEIGHT) - 2; // ~37 lines with safety

  const [pages, setPages] = useState<Page[]>([
    { id: 'page-1', content: initialContent }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const pageRefs = useRef<{ [key: string]: HTMLElement }>({});
  const isUpdating = useRef(false);

  // Initialize with content if provided
  useEffect(() => {
    if (initialContent && pages[0].content !== initialContent) {
      setPages([{ id: 'page-1', content: initialContent }]);
    }
  }, [initialContent]);

  const generatePageId = () => `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addPage = useCallback(() => {
    const newPageId = generatePageId();
    setPages(prev => [...prev, { id: newPageId, content: '' }]);
    return newPageId;
  }, []);

  const deleteLastPageIfEmpty = useCallback(() => {
    setPages(prev => {
      if (prev.length <= 1) return prev;
      const lastPage = prev[prev.length - 1];
      if (!lastPage.content.trim()) {
        return prev.slice(0, -1);
      }
      return prev;
    });
  }, []);

  const calculateLines = (element: HTMLElement): number => {
    const computedStyle = window.getComputedStyle(element);
    const lineHeight = parseInt(computedStyle.lineHeight) || LINE_HEIGHT;
    const contentHeight = element.scrollHeight;
    return Math.ceil(contentHeight / lineHeight);
  };

  const needsPageBreak = (element: HTMLElement): boolean => {
    const lines = calculateLines(element);
    return lines > MAX_LINES_PER_PAGE;
  };

  const moveOverflowContent = (sourceElement: HTMLElement, targetPageId: string): string => {
    const sourceText = sourceElement.innerText || '';
    const words = sourceText.split(/\s+/);
    
    // Estimate how many words fit in one page
    const wordsPerLine = 8; // Conservative estimate for Arabic/English
    const maxWordsPerPage = MAX_LINES_PER_PAGE * wordsPerLine;
    
    if (words.length <= maxWordsPerPage) {
      return '';
    }

    // Split content
    const keepWords = words.slice(0, maxWordsPerPage);
    const moveWords = words.slice(maxWordsPerPage);
    
    // Update source content
    sourceElement.innerHTML = keepWords.join(' ');
    
    // Return overflow content
    return moveWords.join(' ');
  };

  const updatePageContent = useCallback((pageId: string, content: string) => {
    if (isUpdating.current) return;

    setPages(prev => {
      const newPages = prev.map(page => 
        page.id === pageId ? { ...page, content } : page
      );
      
      // Notify about content change
      const totalContent = newPages.map(p => p.content).join('\n\n');
      onContentChange?.(totalContent, newPages.length);
      
      return newPages;
    });
  }, [onContentChange]);

  const handlePageInput = useCallback((pageId: string, content: string) => {
    const pageElement = pageRefs.current[pageId];
    if (!pageElement) return;

    // Update content first
    updatePageContent(pageId, content);

    // Check for overflow after a short delay
    setTimeout(() => {
      if (needsPageBreak(pageElement)) {
        isUpdating.current = true;
        
        // Create new page
        const newPageId = addPage();
        
        // Move overflow content
        const overflowContent = moveOverflowContent(pageElement, newPageId);
        
        if (overflowContent) {
          // Update both pages
          const sourceContent = pageElement.innerText || '';
          updatePageContent(pageId, sourceContent);
          updatePageContent(newPageId, overflowContent);
        }
        
        isUpdating.current = false;
      } else {
        // Check if we can merge with next page or remove empty page
        const currentPageIndex = pages.findIndex(p => p.id === pageId);
        if (currentPageIndex < pages.length - 1) {
          deleteLastPageIfEmpty();
        }
      }
    }, 100);
  }, [pages, updatePageContent, addPage, deleteLastPageIfEmpty]);

  const registerPageRef = useCallback((pageId: string, element: HTMLElement | null) => {
    if (element) {
      pageRefs.current[pageId] = element;
    } else {
      delete pageRefs.current[pageId];
    }
  }, []);

  const focusPage = useCallback((pageIndex: number) => {
    setCurrentPageIndex(pageIndex);
  }, []);

  const getTotalContent = useCallback(() => {
    return pages.map(page => page.content).join('\n\n');
  }, [pages]);

  return {
    pages,
    currentPageIndex,
    addPage,
    updatePageContent,
    deleteLastPageIfEmpty,
    registerPageRef,
    focusPage,
    handlePageInput,
    getTotalContent,
    A4_WIDTH,
    A4_HEIGHT,
    MARGIN,
    USABLE_HEIGHT
  };
};