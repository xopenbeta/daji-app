import { useRef, useCallback, useEffect } from 'react';

export function useScrollHooks(dependency: any) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const scrollViewportRef = useRef<HTMLDivElement | null>(null);
    const userHasScrolledRef = useRef(false);
    const lastScrollTop = useRef(0);

    // Auto scroll logic
    const scrollToBottom = useCallback(() => {
        const viewport = scrollViewportRef.current;
        if (viewport && !userHasScrolledRef.current) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }, []);

    // 默认会自动向下滚动，但一旦用户手动滚动过，就不再自动滚动
    const handleScroll = useCallback(() => {
        const viewport = scrollViewportRef.current;
        if (viewport) {
            const { scrollTop, scrollHeight, clientHeight } = viewport;
            const isAtBottom = (scrollTop + clientHeight >= scrollHeight - 10);

            if (isAtBottom) {
                userHasScrolledRef.current = false;
            } else if (scrollTop < lastScrollTop.current) {
                userHasScrolledRef.current = true;
            }
            lastScrollTop.current = scrollTop;
        }
    }, []);

    useEffect(() => {
        if (!scrollAreaRef.current) return;
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
        if (!viewport) return;

        scrollViewportRef.current = viewport;
        viewport.addEventListener('scroll', handleScroll);
        return () => viewport.removeEventListener('scroll', handleScroll);
    }, []);

    // 默认自动滚动
    useEffect(() => {
        scrollToBottom();
    }, [dependency, scrollToBottom]);

    const resetUserHasScrolled = useCallback(() => {
        userHasScrolledRef.current = false;
    }, []);

    return {
        scrollAreaRef,
        scrollToBottom,
        resetUserHasScrolled
    };
}
