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
  // A4 precise dimensions with line-based calculations
  const A4_WIDTH = 794; // 210mm = 794px
  const A4_HEIGHT = 1123; // 297mm = 1123px
  const MARGIN = 96; // 2.54cm = 96px (Word standard)
  const USABLE_HEIGHT = 931; // A4_HEIGHT - (MARGIN * 2)
  const LINE_HEIGHT = 24; // 16px font * 1.5 line-height = 24px
  const MAX_LINES_PER_PAGE = Math.floor(USABLE_HEIGHT / LINE_HEIGHT); // ~38 lines

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

  // Simple and accurate line-based overflow detection
  const isContentOverflowing = (element: HTMLElement): boolean => {
    if (!element) return false;
    
    // Count actual lines based on content height and line height
    const computedStyle = window.getComputedStyle(element);
    const actualLineHeight = parseInt(computedStyle.lineHeight) || LINE_HEIGHT;
    const actualLines = Math.ceil(element.scrollHeight / actualLineHeight);
    
    const isOverflowing = actualLines > MAX_LINES_PER_PAGE;
    
    console.log('⚡ Line-based overflow check:', {
      scrollHeight: element.scrollHeight,
      lineHeight: actualLineHeight,
      actualLines,
      maxLines: MAX_LINES_PER_PAGE,
      isOverflowing,
      content: element.textContent?.substring(0, 50) + '...'
    });
    
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

  // Handle content overflow immediately - no delays
  const handleContentOverflow = useCallback((pageId: string) => {
    if (isProcessing.current) return;
    
    const pageElement = pageRefs.current[pageId];
    if (!pageElement || !isContentOverflowing(pageElement)) return;
    
    isProcessing.current = true;
    
    try {
      console.log('🚨 IMMEDIATE PAGE BREAK TRIGGERED!');
      
      // Get cursor position before split
      const cursorPos = getCursorPosition(pageElement);
      
      // Split content at current cursor position or last complete line
      const content = pageElement.textContent || '';
      const lines = content.split('\n');
      
      // Keep first MAX_LINES_PER_PAGE lines, move rest to new page
      const keepLines = lines.slice(0, MAX_LINES_PER_PAGE);
      const overflowLines = lines.slice(MAX_LINES_PER_PAGE);
      
      const keep = keepLines.join('\n');
      const overflow = overflowLines.join('\n');
      
      if (overflow.trim()) {
        // Update current page immediately
        pageElement.textContent = keep;
        updatePageContent(pageId, keep);
        
        // Create new page and add overflow content
        const newPageId = addPage();
        
        // Set up new page immediately
        requestAnimationFrame(() => {
          const newPageElement = pageRefs.current[newPageId];
          if (newPageElement) {
            newPageElement.textContent = overflow;
            updatePageContent(newPageId, overflow);
            
            // Move focus to new page immediately
            newPageElement.focus();
            setCursorPosition(newPageElement, 0);
            
            // Update current page index
            setCurrentPageIndex(pages.length);
            
            // Scroll to new page
            newPageElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        });
        
        console.log('✅ Content moved to new page:', {
          sourcePageId: pageId,
          newPageId,
          keepLines: keepLines.length,
          overflowLines: overflowLines.length
        });
      }
    } finally {
      setTimeout(() => {
        isProcessing.current = false;
      }, 100); // Brief delay to prevent rapid firing
    }
  }, [pages, updatePageContent, addPage, MAX_LINES_PER_PAGE]);

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