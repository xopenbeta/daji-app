import { useRef, useCallback, useEffect, useLayoutEffect } from 'react';

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
    // 如果用户滚动到底部，则恢复自动滚动
    const handleScroll = useCallback(() => {
        const viewport = scrollViewportRef.current;
        if (viewport) {
            const { scrollTop, scrollHeight, clientHeight } = viewport;
            // 距离底部小于25px就认为在底部
            const isAtBottom = (scrollTop + clientHeight >= scrollHeight - 25);

            if (isAtBottom) {
                // 用户滚动到底部，恢复自动滚动
                userHasScrolledRef.current = false;
            } else {
                // 用户滚动到非底部位置，停止自动滚动
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

    // 默认自动滚动 - 使用 useLayoutEffect 确保在 DOM 更新后立即执行
    useLayoutEffect(() => {
        // 使用 requestAnimationFrame 确保滚动在浏览器重绘前执行
        const rafId = requestAnimationFrame(() => {
            scrollToBottom();
        });
        return () => cancelAnimationFrame(rafId);
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
