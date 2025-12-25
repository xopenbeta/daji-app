import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export interface UpdateInfo {
  version: string
}

export function UpdateDialog() {
  const { t } = useTranslation()
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleRestart = () => {
  }

  const handleRemindLater = () => {
    setIsDialogOpen(false)
    setUpdateInfo(null)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('app.update_available')}</DialogTitle>
        </DialogHeader>
        <div>{t('app.update_desc', { version: updateInfo?.version })}</div>
        <DialogFooter>
          <Button variant="default" onClick={handleRestart}>
            {t('app.restart_update')}
          </Button>
          <Button variant="outline" onClick={handleRemindLater}>
            {t('app.later')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
