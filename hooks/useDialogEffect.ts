import { useEffect } from 'react';

/**
 * This hook helps prevent content shift when dialogs are opened
 * by setting a data-state attribute on the body and calculating scrollbar width
 */
export function useDialogEffect(isOpen: boolean) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (isOpen) {
      // Calculate scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.setProperty('--removed-body-scroll-bar-size', `${scrollbarWidth}px`);
      document.body.setAttribute('data-state', 'open');
    } else {
      document.body.removeAttribute('data-state');
    }
    
    return () => {
      document.body.removeAttribute('data-state');
    };
  }, [isOpen]);
} 