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
  const PAGE_END_THRESHOLD = 50; // Space buffer before creating new page
  
  const [pages, setPages] = useState<Page[]>([
    { id: 'page-1', content: initialContent }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const pageRefs = useRef<Map<string, HTMLElement>>(new Map());

  const addPage = useCallback(() => {
    const newPageId = `page-${pages.length + 1}`;
    setPages(prev => [...prev, { id: newPageId, content: '' }]);
    setCurrentPageIndex(pages.length);
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
    if (!pageElement) return;

    const contentHeight = pageElement.scrollHeight;
    const pageIndex = pages.findIndex(p => p.id === pageId);
    
    // Only check for the last (active) page
    if (pageIndex === pages.length - 1 && contentHeight >= A4_PAGE_HEIGHT - PAGE_END_THRESHOLD) {
      // Create new page and move cursor there
      const newPageId = addPage();
      
      // Focus on the new page after a short delay
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
          }
        }
      }, 100);
    }
  }, [A4_PAGE_HEIGHT, PAGE_END_THRESHOLD, pages, addPage]);

  const registerPageRef = useCallback((pageId: string, element: HTMLElement | null) => {
    if (element) {
      pageRefs.current.set(pageId, element);
      
      // Set up MutationObserver for real-time content monitoring
      if (!mutationObserverRef.current) {
        mutationObserverRef.current = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
              const targetElement = mutation.target as HTMLElement;
              const pageElement = targetElement.closest('[data-page-id]') as HTMLElement;
              
              if (pageElement) {
                const pageId = pageElement.getAttribute('data-page-id');
                if (pageId) {
                  // Check immediately for page overflow
                  requestAnimationFrame(() => {
                    checkIfNearPageEnd(pageElement, pageId);
                  });
                }
              }
            }
          });
        });
      }
      
      // Observe changes in the page content
      mutationObserverRef.current.observe(element, {
        childList: true,
        subtree: true,
        characterData: true
      });

      // Also check on input events for immediate response
      const contentArea = element.querySelector('[contenteditable]') as HTMLElement;
      if (contentArea) {
        const handleInput = () => {
          requestAnimationFrame(() => {
            checkIfNearPageEnd(element, pageId);
          });
        };
        
        contentArea.addEventListener('input', handleInput);
        contentArea.addEventListener('paste', handleInput);
        
        // Store the handler for cleanup
        (element as any)._inputHandler = handleInput;
      }
    } else {
      // Clean up when element is removed
      const entries = Array.from(pageRefs.current.entries());
      const [pageId] = entries.find(([, el]) => !document.contains(el)) || [];
      
      if (pageId) {
        const element = pageRefs.current.get(pageId);
        if (element && (element as any)._inputHandler) {
          const contentArea = element.querySelector('[contenteditable]') as HTMLElement;
          if (contentArea) {
            contentArea.removeEventListener('input', (element as any)._inputHandler);
            contentArea.removeEventListener('paste', (element as any)._inputHandler);
          }
        }
        pageRefs.current.delete(pageId);
      }
    }
  }, [checkIfNearPageEnd]);

  const removePage = useCallback((pageId: string) => {
    if (pages.length > 1) {
      setPages(prev => prev.filter(page => page.id !== pageId));
      const element = pageRefs.current.get(pageId);
      if (element && (element as any)._inputHandler) {
        const contentArea = element.querySelector('[contenteditable]') as HTMLElement;
        if (contentArea) {
          contentArea.removeEventListener('input', (element as any)._inputHandler);
          contentArea.removeEventListener('paste', (element as any)._inputHandler);
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

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
      
      // Cleanup all event listeners
      pageRefs.current.forEach((element, pageId) => {
        if ((element as any)._inputHandler) {
          const contentArea = element.querySelector('[contenteditable]') as HTMLElement;
          if (contentArea) {
            contentArea.removeEventListener('input', (element as any)._inputHandler);
            contentArea.removeEventListener('paste', (element as any)._inputHandler);
          }
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