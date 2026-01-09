import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { cn, safeStringify } from '@/lib/utils'
import { useAtom } from 'jotai'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { autoScrollLogAtom, isLogPanelOpenAtom, logEntriesAtom, LogEntry } from '@/store/log'
import { appSettingsAtom, isAppLoadingAtom } from '@/store/appSettings'
import { X, Trash2, Copy, ChevronDown, Pause, RefreshCcw, ChevronRight } from 'lucide-react'

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleTimeString()
}

function LevelBadge({ level }: { level: LogEntry['level'] }) {
  const color = level === 'error'
    ? 'text-red-500'
    : level === 'warn'
      ? 'text-yellow-500'
      : level === 'debug'
        ? 'text-blue-500'
        : 'text-green-500'
  return <span className={cn('text-xs font-medium', color)}>[{level.toUpperCase()}]</span>
}

function LogEntryItem({ entry }: { entry: LogEntry }) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(true)
  const hasMeta = entry.meta && Object.keys(entry.meta).length > 0

  return (
    <div className="text-xs">
      <div className="flex gap-2">
        <span className="text-muted-foreground min-w-[64px]">{formatTime(entry.time)}</span>
        <LevelBadge level={entry.level} />
        <span className="whitespace-pre-wrap break-words flex-1">{entry.message}</span>
        {hasMeta && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
            title={collapsed ? t('common.expand_params') : t('common.collapse_params')}
          >
            <ChevronRight className={cn('h-3 w-3 transition-transform', !collapsed && 'rotate-90')} />
          </button>
        )}
      </div>
      {hasMeta && !collapsed && (
        <div className="mt-1 ml-[74px] pl-2 border-l border-muted">
          <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap break-words bg-muted/30 rounded p-1.5 max-h-32 overflow-auto">
            {safeStringify(entry.meta, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function LogPanel() {
  const [entries, setEntries] = useAtom(logEntriesAtom)
  const [open, setOpen] = useAtom(isLogPanelOpenAtom)
  const [autoScroll, setAutoScroll] = useAtom(autoScrollLogAtom)
  const [ascending, setAscending] = useState(true)
  const [activeTab, setActiveTab] = useState<'logs' | 'state'>('logs')
  // height in px for the scrollable area (content). 14rem = 224px matches previous h-56.
  const [panelHeight, setPanelHeight] = useState<number>(224)
  const draggingRef = useRef<{ startY: number; startH: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  // state atoms
  const [appSettings] = useAtom(appSettingsAtom)
  const [isAppLoading] = useAtom(isAppLoadingAtom)
  const { t } = useTranslation()

  useEffect(() => {
    if (autoScroll && open && activeTab === 'logs') {
      if (ascending) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      } else {
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [entries.length, autoScroll, open, ascending, panelHeight, activeTab])

  // Drag handlers for resizing by dragging the header
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!draggingRef.current) return
      const { startY, startH } = draggingRef.current
      const delta = startY - e.clientY // moving up (smaller Y) increases height
      const minH = 120
      const maxH = Math.max(160, window.innerHeight - 80) // leave some space for header/page
      const next = Math.min(Math.max(startH + delta, minH), maxH)
      setPanelHeight(next)
    }
    function onMouseUp() {
      if (!draggingRef.current) return
      draggingRef.current = null
      setDragging(false)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging])

  const onHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    // Avoid starting drag when interacting with buttons in header
    if (target.closest('button')) return
    draggingRef.current = { startY: e.clientY, startH: panelHeight }
    setDragging(true)
    e.preventDefault()
  }

  if (!open) return null

  return (
    <div className="absolute bottom-0 w-full z-40 pointer-events-none">
      <div className="bg-content2 border rounded-lg heroui-card pointer-events-auto overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'logs' | 'state')}>
          {/* Header with Tabs */}
          <div
            className={cn(
              'flex items-center justify-between px-2 py-1 border-b select-none',
              dragging ? 'cursor-ns-resize' : 'cursor-ns-resize'
            )}
            onMouseDown={onHeaderMouseDown}
            title={t('common.drag_to_resize')}
          >
            <div className="flex items-center gap-2">
              <TabsList>
                <TabsTrigger value="logs">{t('common.logs')}</TabsTrigger>
              </TabsList>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setOpen(false)} title={t('common.close')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <TabsContent value="logs">
            <div style={{ height: panelHeight }}>
              <ScrollArea className="h-full w-full">
                <div className="px-3 py-2 space-y-1">
                  <div ref={topRef} />
                  {entries.length === 0 && (
                    <div className="text-xs text-muted-foreground">{t('common.no_logs')}</div>
                  )}
                  {(ascending ? entries : [...entries].slice().reverse()).map((e) => (
                    <LogEntryItem key={e.id} entry={e} />
                  ))}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
