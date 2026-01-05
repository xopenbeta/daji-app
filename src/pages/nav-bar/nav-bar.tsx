import appIcon from '@/assets/envato.svg'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { AppTheme, Program } from '@/types/index'
import { useAtom } from 'jotai'
import {
  Github,
  Monitor,
  Moon,
  PanelLeft,
  Plus,
  Search,
  Server,
  Settings,
  Sun,
  SquareTerminal,
  User,
  X,
  MessageSquareText,
  FlaskConical,
  MoreHorizontal,
  Hexagon
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useAppSettings } from '@/hooks/appSettings'
import { appSettingsAtom, isAppLoadingAtom } from '../../store/appSettings'
import { SortableProgramItem } from './nav-bar-item'
import SettingsDialog from '../settings-dialog'
import { nowProgramIdAtom, programsAtom, createProgramDialogStateAtom } from '@/store'
import { isLogPanelOpenAtom } from '@/store/log'
import { getAllPrograms, deleteProgram } from '@/lib/db'
import { CreateProgramDialog } from '../create-program-dialog/create-program-dialog'
import { useTranslation } from 'react-i18next'

interface NavBarProps {
  onClose?: () => void
}

export default function NavBar({ onClose }: NavBarProps) {
  const [appSettings] = useAtom(appSettingsAtom)
  const { updateAppSettings } = useAppSettings()
  const currentTheme = appSettings?.theme as AppTheme
  const { t } = useTranslation()

  const [programs, setPrograms] = useAtom(programsAtom)
  const [nowProgramId, setNowProgramId] = useAtom(nowProgramIdAtom)
  const [, setIsLogPanelOpen] = useAtom(isLogPanelOpenAtom)
  const [createProgramDialogState, setCreateProgramDialogState] = useAtom(createProgramDialogStateAtom)
  const [isSettingDialogOpen, setIsSettingDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPrograms()
  }, [])

  const openLogPanel = () => setIsLogPanelOpen(true)

  const loadPrograms = async () => {
    try {
      const loadedPrograms = await getAllPrograms()
      setPrograms(loadedPrograms)
    } catch (error) {
      console.error("Failed to load programs", error)
      toast.error(t('common.load_failed'))
    }
  }

  const handleSelectProgram = (programId: string) => {
    if (nowProgramId === programId) {
      setNowProgramId('')
    } else {
      setNowProgramId(programId)
    }
  }

  const handleEditProgram = (program: Program) => {
    setCreateProgramDialogState({
      isOpen: true,
      initialPrompt: undefined,
      initialProgram: program
    })
  }

  const handleCreateProgram = () => {
    setCreateProgramDialogState({
      isOpen: true,
      initialPrompt: undefined,
      initialProgram: undefined
    })
  }

  const handleDeleteProgram = async (id: string) => {
    try {
      await deleteProgram(id)
      setPrograms(prev => prev.filter(p => p.id !== id))
      if (nowProgramId === id) {
        setNowProgramId('')
      }
      toast.success(t('common.delete_success'))
    } catch (error) {
      console.error("Failed to delete program", error)
      toast.error(t('common.delete_failed'))
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setPrograms((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!scrollAreaRef.current) return;
    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
    // Only clear selection when clicking on the container itself
    if (e.target === viewport) {
      setNowProgramId('')
    }
  }

  return (
    <div className={cn("w-full min-w-0 h-full flex flex-col")}>
      {/* Search Bar with Add Button */}
      <div className="flex items-center gap-2 pl-[10px] pr-[4px] py-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search_program')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8 h-8 bg-muted/50 border-none focus-visible:ring-1"
          />
          {searchTerm && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSearchTerm('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 shadow-none"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8"
          onClick={handleCreateProgram}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Program List */}
      <ScrollArea className="flex-1 w-full min-w-0 min-h-0" onClick={handleContainerClick} ref={scrollAreaRef}>
        <div className="p-0 pl-[10px] pr-[4px] w-full min-w-0 min-h-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredPrograms.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredPrograms.map((program) => (
                <SortableProgramItem
                  key={program.id}
                  program={program}
                  isSelected={nowProgramId === program.id}
                  isDragEnabled={!searchTerm}
                  onSelect={() => handleSelectProgram(program.id)}
                  onToggle={() => {}}
                  onEdit={() => handleEditProgram(program)}
                  onDelete={() => handleDeleteProgram(program.id)}
                  onViewLog={() => {
                    setNowProgramId(program.id)
                    openLogPanel()
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>

      <div className="p-2 border-t mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => setIsSettingDialogOpen(true)}
        >
          <Settings className="h-4 w-4" />
          <span>{t('settings.title')}</span>
        </Button>
      </div>

      <CreateProgramDialog 
        open={createProgramDialogState.isOpen} 
        onOpenChange={(open) => setCreateProgramDialogState(prev => ({ ...prev, isOpen: open }))}
        initialProgram={createProgramDialogState.initialProgram}
        initialPrompt={createProgramDialogState.initialPrompt}
      />

      <SettingsDialog 
        isSettingDialogOpen={isSettingDialogOpen} 
        setIsSettingDialogOpen={setIsSettingDialogOpen} 
      />
    </div>
  )
}
