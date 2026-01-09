import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAtom } from "jotai";
import { useState, useEffect, useRef } from "react";
import { createProgramDialogStateAtom } from "@/store";
import { Github, Server, Code, Database, Settings, PanelLeft, Bot, Zap, Globe, Box, Layers, Terminal, Command, Cpu, Plus, FolderOpen, Book, Clock, ArrowRight, Search, GripVertical, Play, Square, Hexagon, Info, MemoryStick, HardDrive, Wifi, Upload, MessageCircle, MessageSquare, Users } from "lucide-react";
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
import { useTranslation } from "react-i18next";
import { useFileOperations } from "@/hooks/file-operations";
import { toast } from "sonner";
import { addProgram } from "@/lib/db";

export function WelcomeFragment({ onOpen }: {
    onOpen?: () => void;
}) {
    const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null);
    const { t } = useTranslation();
    const { openFileDialog, readFileContent } = useFileOperations();
    const [showContactDialog, setShowContactDialog] = useState(false);

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

    const handleImport = async () => {
        try {
            const result = await openFileDialog({
                title: t('common.import'),
                filters: [{ name: 'HTML Files', extensions: ['html', 'htm'] }]
            });

            if (result.success && result.data?.path) {
                const contentResult = await readFileContent(result.data.path);
                if (contentResult.success && contentResult.data?.content) {
                    // Extract program name from filename (remove extension)
                    const fileName = result.data.path.split('/').pop() || 'imported';
                    const programName = fileName.replace(/\.(html|htm)$/i, '');
                    
                    // Create new program
                    const newProgram = {
                        id: crypto.randomUUID(),
                        name: programName,
                        content: contentResult.data.content,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                    };
                    
                    await addProgram(newProgram);
                    toast.success(t('program.import_success'));
                } else {
                    toast.error(t('program.import_failed'));
                }
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error(t('program.import_failed'));
        }
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

            {/* Import button at top right */}
            <div className="absolute top-4 left-6 z-20">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImport}
                    className="gap-2 shadow-none"
                >
                    <Upload className="w-4 h-4" />
                    {t('common.import')}
                </Button>
            </div>

            {/* Main Content - App Welcome Screen */}
            <div className="flex-1 overflow-y-auto z-10 custom-scrollbar flex flex-col items-center">
                <div className="w-full max-w-2xl px-6 flex flex-col gap-8">
                    
                    {/* Brand Header */}
                    <div className="text-center space-y-4 mt-14">
                        <div className="w-full flex justify-center">
                            <a
                                href="https://github.com/xopenbeta/daji-app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20 dark:hover:bg-emerald-500/20"
                            >
                                <Github className="w-4 h-4" />
                                <span className="text-xs">{t('welcome.star_on_github')}</span>
                                <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                            </a>
                        </div>
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

                    {/* Usage Scenarios */}
                    <section className="space-y-6" aria-labelledby="scenarios-title">
                        <h2 id="scenarios-title" className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">{t('scenarios.title')}</h2>
                        <div className="grid grid-cols-1 gap-5">
                            {[
                                {
                                    icon: <Zap className="w-6 h-6" />,
                                    title: t('scenarios.rapid.title'),
                                    description: t('scenarios.rapid.desc'),
                                    gradient: "from-orange-500/10 to-red-500/10",
                                    iconBg: "bg-gradient-to-br from-orange-500 to-red-500",
                                    borderColor: "group-hover:border-orange-300 dark:group-hover:border-orange-500/30"
                                },
                                {
                                    icon: <Layers className="w-6 h-6" />,
                                    title: t('scenarios.switch.title'),
                                    description: t('scenarios.switch.desc'),
                                    gradient: "from-blue-500/10 to-cyan-500/10",
                                    iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
                                    borderColor: "group-hover:border-blue-300 dark:group-hover:border-blue-500/30"
                                },
                                {
                                    icon: <Users className="w-6 h-6" />,
                                    title: t('scenarios.team.title'),
                                    description: t('scenarios.team.desc'),
                                    gradient: "from-emerald-500/10 to-teal-500/10",
                                    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
                                    borderColor: "group-hover:border-emerald-300 dark:group-hover:border-emerald-500/30"
                                }
                            ].map((scenario, index) => (
                                <div key={index} className={`relative flex flex-row items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-white/5 bg-gradient-to-br ${scenario.gradient} backdrop-blur-sm ${scenario.borderColor} transition-all duration-300 group h-full overflow-hidden`}>
                                    {/* Background decoration */}
                                    <div className={`absolute top-0 right-0 w-32 h-32 ${scenario.iconBg} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity duration-300`}></div>
                                    
                                    <div className={`relative p-2.5 rounded-xl ${scenario.iconBg} shadow-lg transition-transform duration-300 shrink-0`}>
                                        <div className="text-white">
                                            {scenario.icon}
                                        </div>
                                    </div>
                                    <div className="relative flex-1">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 dark:group-hover:from-blue-400 dark:group-hover:to-purple-400 transition-all duration-300">{scenario.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{scenario.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Feedback & Suggestions */}
                    <div className="space-y-3 mb-6">
                        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">{t('welcome.feedback')}</h2>
                        <div className="flex flex-col rounded-lg border border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] overflow-hidden">
                            <a 
                                href="https://github.com/xopenbeta/daji-app" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-gray-200 dark:border-white/5 last:border-0"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-white">
                                    <Github className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-gray-900 dark:text-white">Github</div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400">{t('welcome.feedback_desc')}</div>
                                </div>
                                <ArrowRight className="w-3 h-3 text-gray-400" />
                            </a>
                            
                            <div 
                                onClick={() => setShowContactDialog(true)}
                                className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-gray-200 dark:border-white/5 last:border-0"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <MessageCircle className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-gray-900 dark:text-white">QQ</div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400">{t('welcome.join_qq')}</div>
                                </div>
                                <ArrowRight className="w-3 h-3 text-gray-400" />
                            </div>

                            <div 
                                onClick={() => setShowContactDialog(true)}
                                className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-gray-900 dark:text-white">{t('welcome.wechat')}</div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400">{t('welcome.join_wechat')}</div>
                                </div>
                                <ArrowRight className="w-3 h-3 text-gray-400" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('welcome.join_community')}</DialogTitle>
                        <DialogDescription>
                            {t('welcome.join_community_desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">{t('welcome.qq_group')}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{t('welcome.qq_group_id', { id: '1077940774' })}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                            <div className="p-2 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">{t('welcome.wechat_group')}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{t('welcome.wechat_group_desc')}</div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
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
