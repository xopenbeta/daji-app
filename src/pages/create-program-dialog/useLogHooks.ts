import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { addChatMessageAtom } from '@/store/ai';

export interface LogEntry {
    type: 'log' | 'error' | 'warn' | 'info';
    content: string;
    timestamp: string;
}

export function useLogHooks() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [, addChatMessage] = useAtom(addChatMessageAtom);
    
    const lastErrorRef = useRef<string | null>(null);
    const lastErrorTimeRef = useRef<number>(0);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'program-log') {
                const newLog: LogEntry = {
                    type: event.data.logType,
                    content: event.data.content,
                    timestamp: event.data.timestamp
                };
                setLogs(prev => [...prev, newLog]);

                if (newLog.type === 'error') {
                    const now = Date.now();
                    // Prevent spamming: same error within 5 seconds or just too frequent
                    if (newLog.content !== lastErrorRef.current || (now - lastErrorTimeRef.current > 5000)) {
                        lastErrorRef.current = newLog.content;
                        lastErrorTimeRef.current = now;
                        
                        addChatMessage({
                            role: 'assistant',
                            content: '检测到程序运行错误，是否需要我尝试修复？',
                            errorLog: newLog.content
                        });
                    }
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [addChatMessage]);

    const clearLogs = () => setLogs([]);

    return { logs, clearLogs };
}
