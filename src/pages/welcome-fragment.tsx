import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAtom } from "jotai";
import { useState, useEffect, useRef } from "react";
import { createProgramDialogStateAtom } from "@/store";
import { Github, Server, Code, Database, Settings, PanelLeft, Bot, Zap, Globe, Box, Layers, Terminal, Command, Cpu, Plus, FolderOpen, Book, Clock, ArrowRight, Search, GripVertical, Play, Square, Hexagon, Info, MemoryStick, HardDrive, Wifi } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/ui/pie-chart";
import { Progress } from "@/components/ui/progress";
import { SystemMonitor, useSystemMonitorData } from '@/components/system-monitor';
import { useTranslation } from "react-i18next";

export function WelcomeFragment({ onOpen }: {
    onOpen?: () => void;
}) {
    const systemInfo = useSystemMonitorData()
    const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null);
    const { t } = useTranslation();

    const [, setCreateProgramDialogState] = useAtom(createProgramDialogStateAtom);
    const [inputValue, setInputValue] = useState("");
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const placeholders = [
        t('welcome.placeholder_url_encoder'),
        t('welcome.placeholder_calculator'),
        t('welcome.placeholder_qrcode'),
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [placeholders.length]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '72px';
            const scrollHeight = textareaRef.current.scrollHeight;
            if (scrollHeight > 72) {
                textareaRef.current.style.height = `${scrollHeight}px`;
            }
        }
    }, [inputValue]);

    const handleSubmit = () => {
        setCreateProgramDialogState({
            isOpen: true,
            initialPrompt: inputValue || placeholders[placeholderIndex],
            initialProgram: undefined
        });
        setInputValue("");
    };

    return (
        <div className="relative w-full h-full bg-white dark:bg-[#030303] text-gray-900 dark:text-white overflow-hidden flex flex-col font-sans selection:bg-blue-500/20 dark:selection:bg-white/20">
            {/* Cursor-style Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Subtle gradient glow at the top */}
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-black/[0.02] dark:bg-white/[0.03] blur-[120px] rounded-full"></div>
                
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            </div>

            {/* Main Content - App Welcome Screen */}
            <div className="flex-1 overflow-y-auto z-10 custom-scrollbar flex flex-col items-center justify-center -mt-10">
                <div className="w-full max-w-2xl px-6 flex flex-col gap-8">
                    
                    {/* Brand Header */}
                    <div className="text-center space-y-4 mt-14">
                        <div>
                            <h1 className="text-3xl font-medium tracking-tight text-gray-900 dark:text-white mb-2">{t('app.title')}</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('app.description')}</p>
                        </div>
                    </div>

                    {/* Input Section */}
                    <div className="w-full max-w-lg mx-auto relative">
                        <div className="relative flex w-full">
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground pointer-events-none" />
                            <Textarea 
                                ref={textareaRef}
                                className="w-full min-h-[72px] pl-12 pr-12 py-3 text-base rounded-2xl shadow-sm border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm transition-all focus:shadow-md focus:ring-2 focus:ring-primary/20 resize-none overflow-hidden"
                                placeholder={placeholders[placeholderIndex]}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                                rows={2}
                            />
                            <Button 
                                size="icon" 
                                className="absolute right-1.5 bottom-1.5 h-9 w-9 rounded-full"
                                onClick={handleSubmit}
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Getting Started */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">{t('welcome.getting_started')}</h2>
                        <div className="grid grid-cols-3 gap-3">
                            <Step number="1" title={t('welcome.step1')} desc={t('welcome.step1_desc')} />
                            <Step number="2" title={t('welcome.step2')} desc={t('welcome.step2_desc')} />
                            <Step number="3" title={t('welcome.step3')} desc={t('welcome.step3_desc')} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

function Step({ number, title, desc }: { number: string, title: string, desc: string }) {
    return (
        <div className="flex flex-col items-center text-center p-3 rounded-lg border border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-white mb-2">
                {number}
            </div>
            <div className="text-xs font-medium text-gray-900 dark:text-white">{title}</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">{desc}</div>
        </div>
    )
}
