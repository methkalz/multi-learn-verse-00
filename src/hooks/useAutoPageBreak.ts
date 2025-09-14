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
  // A4 dimensions: 210mm × 297mm
  // After margins (25.4mm each side): 159.2mm × 246.2mm
  // Convert to pixels (1mm = 3.78px): 602px × 930px
  const A4_PAGE_HEIGHT = 930;
  const PAGE_END_THRESHOLD = 80; // More conservative threshold
  
  const [pages, setPages] = useState<Page[]>([
    { id: 'page-1', content: initialContent }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // Refs for managing page creation state
  const isCreatingPageRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pageRefs = useRef<Map<string, HTMLElement>>(new Map());

  const addPage = useCallback(() => {
    // Prevent multiple page creation
    if (isCreatingPageRef.current) {
      console.log('Page creation already in progress, skipping...');
      return null;
    }

    console.log('Creating new page...');
    isCreatingPageRef.current = true;

    const newPageId = `page-${pages.length + 1}`;
    setPages(prev => {
      const newPages = [...prev, { id: newPageId, content: '' }];
      console.log('Pages updated:', newPages.length);
      return newPages;
    });
    setCurrentPageIndex(pages.length);

    // Reset the flag after a short delay
    setTimeout(() => {
      isCreatingPageRef.current = false;
      console.log('Page creation flag reset');
    }, 500);

    return newPageId;
  }, [pages.length]);

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

  const checkIfNearPageEnd = useCallback((pageElement: HTMLElement, pageId: string) => {
    if (!pageElement || isCreatingPageRef.current) {
      return;
    }

    const contentHeight = pageElement.scrollHeight;
    const pageIndex = pages.findIndex(p => p.id === pageId);
    
    console.log(`Checking page ${pageIndex + 1}: height=${contentHeight}, threshold=${A4_PAGE_HEIGHT - PAGE_END_THRESHOLD}`);
    
    // Only check for the last (active) page and if we're not already creating a page
    if (pageIndex === pages.length - 1 && 
        contentHeight >= A4_PAGE_HEIGHT - PAGE_END_THRESHOLD &&
        !isCreatingPageRef.current) {
      
      console.log('Page overflow detected, creating new page...');
      
      // Create new page
      const newPageId = addPage();
      
      if (newPageId) {
        // Focus on the new page after creation
        setTimeout(() => {
          const newPageElement = pageRefs.current.get(newPageId);
          if (newPageElement) {
            const contentArea = newPageElement.querySelector('[contenteditable]') as HTMLElement;
            if (contentArea) {
              contentArea.focus();
              // Place cursor at the beginning of the new page
              const range = document.createRange();
              const selection = window.getSelection();
              range.setStart(contentArea, 0);
              range.collapse(true);
              selection?.removeAllRanges();
              selection?.addRange(range);
              console.log('Focus moved to new page');
            }
          }
        }, 200);
      }
    }
  }, [A4_PAGE_HEIGHT, PAGE_END_THRESHOLD, pages, addPage]);

  // Debounced version of checkIfNearPageEnd
  const debouncedCheckPageEnd = useCallback((pageElement: HTMLElement, pageId: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      checkIfNearPageEnd(pageElement, pageId);
    }, 100); // 100ms debounce
  }, [checkIfNearPageEnd]);

  const registerPageRef = useCallback((pageId: string, element: HTMLElement | null) => {
    if (element) {
      pageRefs.current.set(pageId, element);
      console.log(`Registered page ref: ${pageId}`);
      
      // Set up input event listener for immediate response
      const contentArea = element.querySelector('[contenteditable]') as HTMLElement;
      if (contentArea) {
        const handleInput = () => {
          // Use debounced version to prevent multiple rapid calls
          debouncedCheckPageEnd(element, pageId);
        };
        
        const handleKeyDown = (e: KeyboardEvent) => {
          // Check on Enter key specifically for immediate response
          if (e.key === 'Enter') {
            setTimeout(() => {
              debouncedCheckPageEnd(element, pageId);
            }, 10);
          }
        };
        
        contentArea.addEventListener('input', handleInput);
        contentArea.addEventListener('keydown', handleKeyDown);
        
        // Store handlers for cleanup
        (element as any)._inputHandler = handleInput;
        (element as any)._keydownHandler = handleKeyDown;
      }
    } else {
      // Clean up when element is removed
      const entries = Array.from(pageRefs.current.entries());
      const [pageId] = entries.find(([, el]) => !document.contains(el)) || [];
      
      if (pageId) {
        const element = pageRefs.current.get(pageId);
        if (element) {
          const contentArea = element.querySelector('[contenteditable]') as HTMLElement;
          if (contentArea && (element as any)._inputHandler) {
            contentArea.removeEventListener('input', (element as any)._inputHandler);
            contentArea.removeEventListener('keydown', (element as any)._keydownHandler);
          }
        }
        pageRefs.current.delete(pageId);
        console.log(`Cleaned up page ref: ${pageId}`);
      }
    }
  }, [debouncedCheckPageEnd]);

  const removePage = useCallback((pageId: string) => {
    if (pages.length > 1) {
      setPages(prev => prev.filter(page => page.id !== pageId));
      const element = pageRefs.current.get(pageId);
      if (element) {
        const contentArea = element.querySelector('[contenteditable]') as HTMLElement;
        if (contentArea && (element as any)._inputHandler) {
          contentArea.removeEventListener('input', (element as any)._inputHandler);
          contentArea.removeEventListener('keydown', (element as any)._keydownHandler);
        }
      }
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Cleanup all event listeners
      pageRefs.current.forEach((element, pageId) => {
        const contentArea = element.querySelector('[contenteditable]') as HTMLElement;
        if (contentArea && (element as any)._inputHandler) {
          contentArea.removeEventListener('input', (element as any)._inputHandler);
          contentArea.removeEventListener('keydown', (element as any)._keydownHandler);
        }
      });
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
    totalPages: pages.length,
    A4_PAGE_HEIGHT
  };
};