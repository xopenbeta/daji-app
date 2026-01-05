import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Program } from '@/types'
import {
  useSortable
} from '@dnd-kit/sortable'
import {
  CSS,
} from '@dnd-kit/utilities'
import {
  GripVertical,
  MoreHorizontal,
  Play,
  Settings,
  Square,
  Trash,
  FileText,
  Download,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFileOperations } from '@/hooks/file-operations'
import { toast } from 'sonner'

interface SortableProgramItemProps {
  program: Program;
  isSelected: boolean;
  isDragEnabled: boolean;
  onSelect: () => void;
  onToggle: (e: React.MouseEvent) => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewLog: () => void;
}

export function SortableProgramItem({
  program,
  isSelected,
  isDragEnabled,
  onSelect,
  onToggle,
  onEdit,
  onDelete,
  onViewLog
}: SortableProgramItemProps) {
  const { t } = useTranslation()
  const { saveFileDialog, writeFileContent } = useFileOperations();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: program.id,
    disabled: !isDragEnabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleExport = async () => {
    try {
      const result = await saveFileDialog({
        title: t('common.export'),
        filters: [{ name: 'HTML Files', extensions: ['html'] }],
        defaultName: `${program.name}.html`
      });

      if (result.success && result.data?.path) {
        const writeResult = await writeFileContent(result.data.path, program.content);
        if (writeResult.success) {
          toast.success(t('program.export_success'));
        } else {
          toast.error(t('program.export_failed'));
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('program.export_failed'));
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2 min-w-0">
      <div
        className={cn(
          // Prevent item from being expanded by internal text and allow text to truncate correctly
          "group relative flex items-center p-2 rounded-lg cursor-pointer heroui-transition overflow-hidden w-full min-w-0",
          isSelected && "bg-content4",
          isDragging && "z-50"
        )}
        onClick={() => onSelect()}
      >
        <div className="flex items-center w-full min-w-0">
          {/* Drag icon */}
          {isDragEnabled && (
            <div
              {...attributes}
              {...listeners}
              className="mr-2 cursor-grab active:cursor-grabbing hover:text-foreground heroui-transition flex-shrink-0"
              title={t('program.drag_to_sort')}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm text-gray-700 dark:text-gray-300 min-w-0 truncate">
              {program.name}
            </span>
          </div>
        </div>

        {/* Absolutely positioned action buttons */}
        <div
          className={cn(
            "absolute right-3 top-1/2 transform -translate-y-1/2",
            "flex items-center heroui-transition",
            "opacity-0 group-hover:opacity-100",
            "hover:backdrop-blur-sm rounded"
          )}
        >

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {e.stopPropagation(); onEdit()}}>
                <Settings className="h-4 w-4 mr-2" />
                {t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {e.stopPropagation(); onViewLog()}}>
                <FileText className="h-4 w-4 mr-2" />
                {t('common.view_log')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleExport()}}>
                <Download className="h-4 w-4 mr-2" />
                {t('common.export')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {e.stopPropagation(); onDelete()}}
                className="text-danger"
              >
                <Trash className="h-4 w-4 mr-2" />
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
