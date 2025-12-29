import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { addProgram, updateProgram } from "@/lib/db";
import { programsAtom } from "@/store";
import { chatMessagesAtom, addChatMessageAtom, clearChatMessagesAtom, isAIResponseLoadingAtom } from "@/store/ai";
import { appSettingsAtom } from "@/store/appSettings";
import { Program } from "@/types";
import { useAtom } from "jotai";
import { Bot, Send, User, Square, Trash2, FileCode, Terminal, Play, Pencil, Wrench } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { useScrollHooks } from "./useScrollHooks";
import { useLogHooks } from "./useLogHooks";
import { extractCode, injectLogInterceptor, renderMarkdown, systemPrompt } from "./renderText";
import { useTranslation } from "react-i18next";

interface CreateProgramDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialProgram?: Program;
    initialPrompt?: string;
}

export function CreateProgramDialog({ open, onOpenChange, initialProgram, initialPrompt }: CreateProgramDialogProps) {
    const { t } = useTranslation();
    const [appSettings] = useAtom(appSettingsAtom);
    const [chatMessages, setChatMessages] = useAtom(chatMessagesAtom);
    const [, addChatMessage] = useAtom(addChatMessageAtom);
    const [, clearChatMessages] = useAtom(clearChatMessagesAtom);
    const [isLoading, setIsLoading] = useAtom(isAIResponseLoadingAtom);
    const [, setPrograms] = useAtom(programsAtom);

    const [inputValue, setInputValue] = useState('');
    const isComposingRef = useRef(false);
    const lastCompositionEndRef = useRef(0); // 中文输入法下确认输入（按回车）时，浏览器会先结束输入法状态，然后再派发一个回车键事件。
    const [generatedCode, setGeneratedCode] = useState<string>('');
    const [programName, setProgramName] = useState(t('program.unnamed'));
    const [isEditingName, setIsEditingName] = useState(false);
    const [activeTab, setActiveTab] = useState('preview');
    const { logs, clearLogs } = useLogHooks();

    const abortControllerRef = useRef<AbortController | null>(null);

    const { scrollAreaRef, resetIsAutoScroll } = useScrollHooks(chatMessages, open);

    // Reset or load initial state when dialog opens
    useEffect(() => {
        if (open) {
            clearChatMessages();
            clearLogs(); // Clear logs
            if (initialProgram) {
                addChatMessage({ role: 'assistant', content: t('program.ai_continue') });
                setGeneratedCode(initialProgram.content);
                setProgramName(initialProgram.name);
            } else {
                addChatMessage({ role: 'assistant', content: t('program.ai_hello') });
                setGeneratedCode('');
                setProgramName(initialPrompt || t('program.unnamed'));

                if (initialPrompt) {
                    handleSendMessageStreaming(initialPrompt);
                }
            }
            setInputValue('');
            setIsLoading(false);
            setActiveTab('preview');
        }
    }, [open, initialProgram, initialPrompt]);

    const handleSendMessageStreaming = async (overrideContent?: string | any) => {
        const contentToSend = typeof overrideContent === 'string' ? overrideContent : inputValue.trim();
        if (!contentToSend || isLoading) return;

        if (!appSettings?.ai?.enabled || !appSettings?.ai?.apiKey) {
            toast.error(t('program.ai_disabled'));
            return;
        }

        if (typeof overrideContent !== 'string') {
            setInputValue('');
        }
        resetIsAutoScroll();

        setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'user',
            content: contentToSend,
            timestamp: new Date().toLocaleTimeString()
        }]);

        try {
            const messages = [
                { role: 'system', content: systemPrompt },
                ...chatMessages.map(msg => ({ role: msg.role, content: msg.content })),
                { role: 'user', content: contentToSend }
            ];
            let apiUrl = appSettings.ai.baseUrl || 'https://api.openai.com/v1';
            const headers = {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${appSettings.ai.apiKey}`
            };

            const response = await fetch(`${apiUrl}/chat/completions`, {
                method: 'POST',
                headers,
                signal: abortControllerRef.current?.signal,
                body: JSON.stringify({
                    model: appSettings.ai.model || 'gpt-3.5-turbo',
                    messages,
                    temperature: 0.1, // 越小越精确
                    stream: true
                })
            });

            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            const decoder = new TextDecoder();
            let aiContent = '';
            let buffer = '';
            const aiMsgId = Date.now().toString() + 'ai';

            // Add initial empty AI message
            setChatMessages(prev => [...prev, {
                id: aiMsgId,
                role: 'assistant',
                content: '',
                timestamp: new Date().toLocaleTimeString()
            }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(line.slice(6));
                            const content = data.choices[0]?.delta?.content || '';
                            if (content) {
                                aiContent += content;

                                // Update the last message (which is the AI message)
                                setChatMessages(prev => {
                                    const newMsgs = [...prev];
                                    const lastMsg = newMsgs[newMsgs.length - 1];
                                    if (lastMsg.id === aiMsgId) {
                                        lastMsg.content = aiContent;
                                    }
                                    return newMsgs;
                                });

                                // Try to extract code in real-time
                                const code = extractCode(aiContent);
                                if (code) {
                                    setGeneratedCode(code);
                                }
                            }
                        } catch (e) {
                            // ignore
                        }
                    }
                }
            }

            // Final code extraction
            const finalCode = extractCode(aiContent);
            if (finalCode) {
                setGeneratedCode(finalCode);
            }

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Aborted');
            } else {
                console.error(error);
                toast.error(t('program.ai_request_failed'));
                setChatMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: t('common.error') + ': ' + (error instanceof Error ? error.message : 'Unknown error'),
                    timestamp: new Date().toLocaleTimeString()
                }]);
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleInterrupt = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            toast.info(t('program.interrupted'));
        }
    };

    const handleFixError = (errorLog: string) => {
        const prompt = t('program.fix_error_prompt', { error: errorLog });
        handleSendMessageStreaming(prompt);
    };

    const handleSave = async () => {
        if (!generatedCode) {
            toast.error(t('program.no_code_generated'));
            return;
        }

        const programToSave: Program = {
            id: initialProgram ? initialProgram.id : uuidv4(),
            name: programName,
            content: generatedCode,
            createdAt: initialProgram ? initialProgram.createdAt : Date.now(),
            updatedAt: Date.now(),
            description: chatMessages.filter(m => m.role === 'user').pop()?.content || t('program.generated_desc')
        };

        try {
            if (initialProgram) {
                await updateProgram(programToSave);
                setPrograms(prev => prev.map(p => p.id === programToSave.id ? programToSave : p));
            } else {
                await addProgram(programToSave);
                setPrograms(prev => [...prev, programToSave]);
            }

            toast.success(t('program.save_success'));
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error(t('program.save_failed'));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[100vw] w-[100vw] max-h-[100vh] h-[100vh] p-0 gap-0 flex flex-col">
                <DialogHeader className="px-6 py-0 h-12 border-b flex flex-row items-center justify-between space-y-0">
                    <DialogTitle>{t('program.create_new')}</DialogTitle>
                    <Button size="sm" className="mr-6" onClick={handleSave}>{t('program.save_program')}</Button>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <ResizablePanelGroup direction="horizontal">
                        {/* Left: AI Chat */}
                        <ResizablePanel defaultSize={40} minSize={30}>
                            <div className="flex flex-col h-full bg-muted/30">
                                <div className="h-10 flex items-center justify-between px-4 border-b bg-background/50">
                                    <span className="text-sm font-medium">{t('common.ai_assistant')}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => clearChatMessages()}
                                        title={t('common.clear')}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                                    <div className="space-y-4">
                                        {chatMessages.map((msg) => (
                                            <div key={msg.id} className={`flex-col ${msg.role === 'assistant' ? 'align-top' : 'align-bottom'}`}>
                                                <div className={`w-full flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                        {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                                                    </div>
                                                </div>
                                                <div className={`rounded-lg mt-3 p-3 text-sm ${msg.role === 'assistant' ? 'bg-background border shadow-sm rounded-tl-none' : 'bg-primary text-primary-foreground rounded-tr-none'}`}>
                                                    {msg.role === 'assistant' ? (
                                                        <div
                                                            className="prose prose-sm max-w-none dark:prose-invert"
                                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                                                        />
                                                    ) : (
                                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                                    )}
                                                    {msg.errorLog && (
                                                        <div className="mt-3 pt-3 border-t">
                                                            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs font-mono text-red-600 dark:text-red-400 mb-2 break-all">
                                                                {msg.errorLog}
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                                                                onClick={() => handleFixError(msg.errorLog!)}
                                                            >
                                                                <Wrench size={14} />
                                                                {t('common.fix_error')}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {isLoading && chatMessages[chatMessages.length - 1]?.role !== 'assistant' && (
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                                                    <Bot size={16} />
                                                </div>
                                                <div className="bg-background border shadow-sm rounded-lg p-3">
                                                    <div className="flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>

                                <div className="p-2 bg-background">
                                    <div className="relative">
                                        <Textarea
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onCompositionStart={() => { 
                                                isComposingRef.current = true; 
                                            }}
                                            onCompositionEnd={() => { 
                                                isComposingRef.current = false; 
                                                lastCompositionEndRef.current = Date.now();
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    if (isComposingRef.current || e.nativeEvent.isComposing) return;
                                                    // 通过延时实现状态的有效判断，这里状态改变比较奇怪
                                                    if (Date.now() - lastCompositionEndRef.current < 100) return;

                                                    e.preventDefault();
                                                    handleSendMessageStreaming();
                                                }
                                            }}
                                            placeholder={appSettings?.ai?.enabled ? t('program.ai_placeholder') : t('program.ai_disabled')}
                                            disabled={!appSettings?.ai?.enabled || isLoading}
                                            className="min-h-[80px] resize-none pr-12"
                                        />
                                        <Button
                                            size="icon"
                                            className="absolute bottom-2 right-2 h-8 w-8"
                                            onClick={isLoading ? handleInterrupt : handleSendMessageStreaming}
                                            disabled={(!inputValue.trim() && !isLoading) || !appSettings?.ai?.enabled}
                                        >
                                            {isLoading ? <Square size={14} /> : <Send size={14} />}
                                        </Button>
                                    </div>
                                    {!appSettings?.ai?.enabled && (
                                        <p className="text-xs text-yellow-600 mt-2">{t('program.ai_disabled_warn')}</p>
                                    )}
                                </div>
                            </div>
                        </ResizablePanel>

                        <ResizableHandle />

                        {/* Right: Preview */}
                        <ResizablePanel defaultSize={60}>
                            <div className="h-full bg-white dark:bg-black relative flex flex-col">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                    <div className="h-10 border-b flex items-center px-1 bg-muted/20 justify-between shrink-0">
                                        <div className="flex items-center gap-2">
                                            {isEditingName ? (
                                                <>
                                                    <Input
                                                        value={programName}
                                                        onChange={(e) => setProgramName(e.target.value)}
                                                        className="text-sm h-8 w-40"
                                                        placeholder={t('program.program_name')}
                                                        autoFocus
                                                    />
                                                    <Button size="sm" onClick={() => setIsEditingName(false)}>{t('common.save')}</Button>
                                                </>
                                            ) : (
                                                <>
                                                    <div
                                                        className="flex items-center gap-2 cursor-pointer group px-2 py-1 rounded hover:bg-muted/50"
                                                        onClick={() => setIsEditingName(true)}
                                                    >
                                                        <span className="text-sm font-medium group-hover:underline underline-offset-4">{programName}</span>
                                                        <Pencil size={14} className="text-muted-foreground opacity-50 group-hover:opacity-100" />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">{generatedCode ? t('program.generated') : t('program.waiting')}</span>
                                        <TabsList className="h-8">
                                            <TabsTrigger value="preview" className="text-xs px-3"><Play size={14} className="mr-1.5" />{t('common.preview')}</TabsTrigger>
                                            <TabsTrigger value="code" className="text-xs px-3"><FileCode size={14} className="mr-1.5" />{t('common.code')}</TabsTrigger>
                                            <TabsTrigger value="logs" className="text-xs px-3 relative">
                                                <Terminal size={14} className="mr-1.5" />
                                                {t('common.logs')}
                                                {logs.some(log => log.type === 'error') && (
                                                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                )}
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <TabsContent value="preview" forceMount className="flex-1 relative mt-0 h-full overflow-hidden data-[state=inactive]:hidden">
                                        {generatedCode ? (
                                            <iframe
                                                srcDoc={injectLogInterceptor(generatedCode)}
                                                className="w-full h-full border-none"
                                                sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                                                title="preview"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                                                <Bot size={48} className="opacity-20" />
                                                <p>{t('program.describe_hint')}</p>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="code" className="flex-1 relative mt-0 h-full overflow-hidden">
                                        <ScrollArea className="h-full w-full">
                                            <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-all">
                                                {generatedCode || `// ${t('program.no_code')}`}
                                            </pre>
                                        </ScrollArea>
                                    </TabsContent>

                                    <TabsContent value="logs" className="flex-1 relative mt-0 h-full overflow-hidden">
                                        <ScrollArea className="h-full w-full">
                                            <div className="p-2 space-y-1 font-mono text-xs">
                                                {logs.length === 0 && (
                                                    <div className="text-muted-foreground p-2">{t('common.no_logs')}</div>
                                                )}
                                                {logs.map((log, i) => (
                                                    <div key={i} className={`p-1.5 rounded border-b border-border/50 flex gap-2 ${log.type === 'error' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                                                        log.type === 'warn' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                                                            'text-foreground'
                                                        }`}>
                                                        <span className="text-muted-foreground shrink-0">[{log.timestamp}]</span>
                                                        <span className={`uppercase font-bold shrink-0 w-12 ${log.type === 'error' ? 'text-red-600' :
                                                            log.type === 'warn' ? 'text-yellow-600' :
                                                                'text-blue-600'
                                                            }`}>{log.type}</span>
                                                        <span className="whitespace-pre-wrap break-all">{log.content}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </DialogContent>
        </Dialog>
    );
}
