import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { nowProgramIdAtom, programsAtom } from "@/store"
import { logEntriesAtom } from "@/store/log"
import { useAtom } from "jotai"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import LogPanel from "../log-panel/log-panel"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"

interface ProgramPanelProps {
  onOpen?: () => void
}

export function ProgramPanel({ onOpen }: ProgramPanelProps) {
  const { t } = useTranslation()
  const [nowProgramId] = useAtom(nowProgramIdAtom)
  const [programs] = useAtom(programsAtom)
  const [, setLogEntries] = useAtom(logEntriesAtom)
  
  const program = programs.find(p => p.id === nowProgramId)

  useEffect(() => {
    setLogEntries([])
  }, [nowProgramId])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'program-log') {
        setLogEntries(prev => [...prev, {
          id: Math.random().toString(36).substring(7),
          time: event.data.timestamp,
          level: event.data.level,
          message: event.data.message,
          meta: event.data.meta
        }])
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [setLogEntries])

  const injectedContent = useMemo(() => {
    if (!program) return ''
    return program.content
  }, [program])

  if (!program) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        {onOpen && (
          <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={onOpen}>
            <Menu />
          </Button>
        )}
        {t('program.not_found')}
      </div>
    )
  }

  return (
    <div className="w-full h-full relative bg-white dark:bg-black">
      {onOpen && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 left-2 z-50 bg-background/50 hover:bg-background" 
          onClick={onOpen}
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
      <iframe 
        srcDoc={injectedContent}
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-modals allow-forms allow-popups"
        title={program.name}
      />
      <LogPanel />
    </div>
  )
}

