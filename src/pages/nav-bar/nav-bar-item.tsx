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
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

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

  return (
    <div ref={setNodeRef} style={style} className="mb-2 min-w-0">
      <div
        className={cn(
          // 使 item 不被内部文字撑宽，并让文字能正确省略
          "group relative flex items-center p-2 rounded-lg cursor-pointer heroui-transition overflow-hidden w-full min-w-0",
          isSelected && "bg-content4",
          isDragging && "z-50"
        )}
        onClick={() => onSelect()}
      >
        <div className="flex items-center w-full min-w-0">
          {/* 拖动图标 */}
          {isDragEnabled && (
            <div
              {...attributes}
              {...listeners}
              className="mr-2 cursor-grab active:cursor-grabbing hover:text-foreground heroui-transition flex-shrink-0"
              title="拖动排序"
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

        {/* 绝对定位的操作按钮 */}
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
