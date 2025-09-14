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

  const [pages, setPages] = useState<Page[]>([
    { id: 'page-1', content: initialContent }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const pageRefs = useRef<{ [key: string]: HTMLElement }>({});
  const isProcessing = useRef(false);

  // Initialize with content if provided
  useEffect(() => {
    if (initialContent && pages[0].content !== initialContent) {
      setPages([{ id: 'page-1', content: initialContent }]);
    }
  }, [initialContent]);

  const generatePageId = () => `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Accurate overflow detection using Range API
  const isContentOverflowing = (element: HTMLElement): boolean => {
    if (!element) return false;
    
    // Get actual content height without overflow restrictions
    const range = document.createRange();
    range.selectNodeContents(element);
    const rects = range.getClientRects();
    
    let totalHeight = 0;
    for (let i = 0; i < rects.length; i++) {
      totalHeight += rects[i].height;
    }
    
    // Add some padding for safety
    const contentHeight = Math.max(totalHeight, element.scrollHeight);
    const isOverflowing = contentHeight > USABLE_HEIGHT;
    
    console.log('Overflow check:', {
      contentHeight,
      usableHeight: USABLE_HEIGHT,
      isOverflowing,
      pageId: element.getAttribute('data-page-id')
    });
    
    range.detach();
    return isOverflowing;
  };

  // Get cursor position within element
  const getCursorPosition = (element: HTMLElement): number => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return 0;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    
    return preCaretRange.toString().length;
  };

  // Set cursor position within element
  const setCursorPosition = (element: HTMLElement, position: number) => {
    const range = document.createRange();
    const sel = window.getSelection();
    
    let charCount = 0;
    let node: Node | null = null;
    let offset = 0;
    
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      const textLength = textNode.textContent?.length || 0;
      
      if (charCount + textLength >= position) {
        node = textNode;
        offset = position - charCount;
        break;
      }
      charCount += textLength;
    }
    
    if (node) {
      range.setStart(node, offset);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  // Split content precisely at overflow point
  const splitContentAtOverflow = (element: HTMLElement): { keep: string; overflow: string } => {
    const fullContent = element.textContent || '';
    const words = fullContent.split(/(\s+)/); // Keep whitespace
    
    let low = 0;
    let high = words.length;
    let bestSplit = 0;
    
    // Binary search for optimal split point
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const testContent = words.slice(0, mid).join('');
      
      // Create temporary element to test
      const testDiv = document.createElement('div');
      testDiv.style.cssText = window.getComputedStyle(element).cssText;
      testDiv.style.position = 'absolute';
      testDiv.style.visibility = 'hidden';
      testDiv.style.top = '-9999px';
      testDiv.style.width = element.offsetWidth + 'px';
      testDiv.textContent = testContent;
      
      document.body.appendChild(testDiv);
      const fits = testDiv.scrollHeight <= USABLE_HEIGHT;
      document.body.removeChild(testDiv);
      
      if (fits) {
        bestSplit = mid;
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    
    const keepContent = words.slice(0, bestSplit).join('');
    const overflowContent = words.slice(bestSplit).join('');
    
    console.log('Content split:', {
      originalLength: fullContent.length,
      keepLength: keepContent.length,
      overflowLength: overflowContent.length
    });
    
    return { keep: keepContent, overflow: overflowContent };
  };

  const addPage = useCallback(() => {
    const newPageId = generatePageId();
    setPages(prev => [...prev, { id: newPageId, content: '' }]);
    return newPageId;
  }, []);

  const updatePageContent = useCallback((pageId: string, content: string) => {
    if (isProcessing.current) return;

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

  // Handle content overflow immediately
  const handleContentOverflow = useCallback((pageId: string) => {
    if (isProcessing.current) return;
    
    const pageElement = pageRefs.current[pageId];
    if (!pageElement || !isContentOverflowing(pageElement)) return;
    
    isProcessing.current = true;
    
    try {
      // Get cursor position before split
      const cursorPos = getCursorPosition(pageElement);
      
      // Split content
      const { keep, overflow } = splitContentAtOverflow(pageElement);
      
      if (overflow.trim()) {
        // Create new page
        const newPageId = addPage();
        
        // Update current page content
        pageElement.textContent = keep;
        updatePageContent(pageId, keep);
        
        // Update new page content
        setTimeout(() => {
          const newPageElement = pageRefs.current[newPageId];
          if (newPageElement) {
            newPageElement.textContent = overflow;
            updatePageContent(newPageId, overflow);
            
            // Move cursor to new page if it was in overflow content
            if (cursorPos > keep.length) {
              const newCursorPos = cursorPos - keep.length;
              newPageElement.focus();
              setCursorPosition(newPageElement, newCursorPos);
              
              // Update current page index
              const newPageIndex = pages.length; // Will be updated after addPage
              setCurrentPageIndex(newPageIndex);
            }
          }
        }, 10);
        
        console.log('Content overflowed to new page:', {
          sourcePageId: pageId,
          newPageId,
          keepLength: keep.length,
          overflowLength: overflow.length
        });
      }
    } finally {
      isProcessing.current = false;
    }
  }, [pages, updatePageContent, addPage]);

  const handlePageInput = useCallback((pageId: string, content: string) => {
    // Update content immediately
    updatePageContent(pageId, content);
    
    // Check for overflow immediately
    requestAnimationFrame(() => {
      handleContentOverflow(pageId);
    });
  }, [updatePageContent, handleContentOverflow]);

  // Handle large paste operations
  const handleLargePaste = useCallback((pageId: string, pastedText: string) => {
    if (isProcessing.current) return;
    
    const pageElement = pageRefs.current[pageId];
    if (!pageElement) return;
    
    isProcessing.current = true;
    
    try {
      // Start with current page
      let currentPageId = pageId;
      let remainingText = pastedText;
      let pageIndex = pages.findIndex(p => p.id === pageId);
      
      while (remainingText.trim()) {
        const currentElement = pageRefs.current[currentPageId];
        if (!currentElement) break;
        
        // Test how much content fits on current page
        const existingContent = currentElement.textContent || '';
        const testDiv = document.createElement('div');
        testDiv.style.cssText = window.getComputedStyle(currentElement).cssText;
        testDiv.style.position = 'absolute';
        testDiv.style.visibility = 'hidden';
        testDiv.style.top = '-9999px';
        testDiv.style.width = currentElement.offsetWidth + 'px';
        
        document.body.appendChild(testDiv);
        
        // Binary search for how much text fits
        const words = remainingText.split(/(\s+)/);
        let fitCount = 0;
        
        for (let i = 0; i <= words.length; i++) {
          const testContent = existingContent + words.slice(0, i).join('');
          testDiv.textContent = testContent;
          
          if (testDiv.scrollHeight > USABLE_HEIGHT) {
            break;
          }
          fitCount = i;
        }
        
        document.body.removeChild(testDiv);
        
        // Update current page
        const fitText = words.slice(0, fitCount).join('');
        const newContent = existingContent + fitText;
        currentElement.textContent = newContent;
        updatePageContent(currentPageId, newContent);
        
        // Prepare remaining text
        remainingText = words.slice(fitCount).join('');
        
        if (remainingText.trim()) {
          // Create new page
          const newPageId = addPage();
          currentPageId = newPageId;
          pageIndex++;
          
          // Wait for new page to be created
          setTimeout(() => {}, 10);
        }
      }
      
      // Focus on the last page with content
      setCurrentPageIndex(pageIndex);
      
    } finally {
      isProcessing.current = false;
    }
  }, [pages, updatePageContent, addPage]);

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
    registerPageRef,
    focusPage,
    handlePageInput,
    handleLargePaste,
    handleContentOverflow,
    getTotalContent,
    A4_WIDTH,
    A4_HEIGHT,
    MARGIN,
    USABLE_HEIGHT
  };
};