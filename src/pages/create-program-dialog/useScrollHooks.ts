import { useRef, useCallback, useEffect, useLayoutEffect } from 'react';

export function useScrollHooks(dependency: any, open: boolean) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const isAutoScrollRef = useRef(true);
    const lastScrollTop = useRef(0);

    // Auto scroll logic
    const scrollToBottom = useCallback(() => {
        if (!scrollAreaRef.current) return;
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
        if (viewport && isAutoScrollRef.current) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }, []);

    // Automatically scroll down by default, stop auto-scrolling when scrolling up
    // If user scrolls to bottom, resume auto-scrolling
    const handleScroll = useCallback(() => {
        if (!scrollAreaRef.current) return;
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
        if (viewport) {
            const { scrollTop, scrollHeight, clientHeight } = viewport;
            // Considered at bottom if distance to bottom is less than 25px
            const isAtBottom = (scrollTop + clientHeight >= scrollHeight - 25);

            if (isAtBottom) {
                // User scrolled to bottom, resume auto-scrolling
                isAutoScrollRef.current = true;
                console.log('Resume auto-scrolling');
            } else if (scrollTop < lastScrollTop.current) {
                // Stop auto-scrolling when scrolling up
                isAutoScrollRef.current = false;
                console.log('Stop auto-scrolling');
            }
            lastScrollTop.current = scrollTop;
        }
    }, []);

    useEffect(() => {
        if (!open) return;

        // Use setTimeout delay to ensure DOM is rendered after Dialog animation completes
        const timer = setTimeout(() => {
            if (!scrollAreaRef.current) {
                console.warn('scrollAreaRef.current is null');
                return;
            }
            const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
            if (!viewport) {
                console.warn('viewport not found');
                return;
            }
            viewport.addEventListener('scroll', handleScroll);
        }, 100); // Delay 100ms, wait for Dialog animation to complete

        return () => {
            clearTimeout(timer);
            if (scrollAreaRef.current) {
                const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
                if (viewport) {
                    viewport.removeEventListener('scroll', handleScroll);
                }
            }
        };
    }, [open, handleScroll]);

    // Default auto-scroll - use useLayoutEffect to ensure execution immediately after DOM update
    useLayoutEffect(() => {
        // Use requestAnimationFrame to ensure scroll executes before browser repaint
        const rafId = requestAnimationFrame(() => {
            scrollToBottom();
        });
        return () => cancelAnimationFrame(rafId);
    }, [dependency, scrollToBottom]);

    const resetIsAutoScroll = useCallback(() => {
        isAutoScrollRef.current = true;
    }, []);

    return {
        scrollAreaRef,
        scrollToBottom,
        resetIsAutoScroll
    };
}
