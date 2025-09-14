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

  const needsPageBreak = (element: HTMLElement): boolean => {
    // Temporarily remove overflow hidden to get accurate scroll height
    const originalOverflow = element.style.overflow;
    element.style.overflow = 'visible';
    
    const contentHeight = element.scrollHeight;
    const availableHeight = USABLE_HEIGHT; // 931px
    
    // Restore original overflow
    element.style.overflow = originalOverflow;
    
    const isOverflowing = contentHeight > availableHeight;
    
    console.log('Page overflow check:', {
      contentHeight,
      availableHeight,
      isOverflowing,
      element: element.textContent?.substring(0, 50) + '...'
    });
    
    return isOverflowing;
  };

  const moveOverflowContent = (sourceElement: HTMLElement, targetPageId: string): string => {
    const sourceText = sourceElement.innerHTML || '';
    
    // If content fits, no need to move anything
    if (!needsPageBreak(sourceElement)) {
      return '';
    }
    
    // Use a more sophisticated approach to split content
    // Start by trying to split at natural breaks (paragraphs, sentences)
    const textContent = sourceElement.textContent || '';
    const words = textContent.split(/\s+/);
    
    // Binary search to find the optimal split point
    let low = 0;
    let high = words.length;
    let bestSplit = Math.floor(words.length * 0.7); // Start at 70% as estimate
    
    while (low < high - 1) {
      const mid = Math.floor((low + high) / 2);
      const testContent = words.slice(0, mid).join(' ');
      
      // Create a temporary test element
      const testElement = sourceElement.cloneNode(true) as HTMLElement;
      testElement.innerHTML = testContent;
      testElement.style.position = 'absolute';
      testElement.style.visibility = 'hidden';
      testElement.style.top = '-9999px';
      document.body.appendChild(testElement);
      
      const fits = !needsPageBreak(testElement);
      document.body.removeChild(testElement);
      
      if (fits) {
        bestSplit = mid;
        low = mid;
      } else {
        high = mid;
      }
    }
    
    // Split the content
    const keepWords = words.slice(0, bestSplit);
    const moveWords = words.slice(bestSplit);
    
    // Update source content
    sourceElement.innerHTML = keepWords.join(' ');
    
    console.log('Content split:', {
      originalWords: words.length,
      keepWords: keepWords.length,
      moveWords: moveWords.length,
      splitPoint: bestSplit
    });
    
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

    // Check for overflow after a delay to allow DOM to update
    setTimeout(() => {
      if (needsPageBreak(pageElement)) {
        console.log('Page overflow detected, creating new page...');
        isUpdating.current = true;
        
        // Create new page
        const newPageId = addPage();
        
        // Move overflow content
        const overflowContent = moveOverflowContent(pageElement, newPageId);
        
        if (overflowContent.trim()) {
          // Update both pages
          const sourceContent = pageElement.innerHTML || '';
          updatePageContent(pageId, sourceContent);
          updatePageContent(newPageId, overflowContent);
          
          console.log('Content moved to new page:', {
            sourcePageId: pageId,
            newPageId: newPageId,
            overflowLength: overflowContent.length
          });
        }
        
        isUpdating.current = false;
      } else {
        // Check if we can merge with next page or remove empty page
        const currentPageIndex = pages.findIndex(p => p.id === pageId);
        if (currentPageIndex < pages.length - 1) {
          deleteLastPageIfEmpty();
        }
      }
    }, 300); // Increased delay for better accuracy
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