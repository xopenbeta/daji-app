import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useAtom } from 'jotai'
import { HardDrive, Info, Moon, RefreshCw, Sun, Monitor, Bot, Code, Power, Globe, Terminal, Folder, Trash2, AlertTriangle, Server, Database, ExternalLink, LogOut } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import _ from 'lodash'
import { toast } from 'sonner'
import { AppSettings, AppTheme, AIProvider } from "@/types/index"
import { appSettingsAtom } from "../store/appSettings"
import { useAppSettings } from "@/hooks/appSettings"
import { useSystemInfo } from "@/hooks/system-info"
import { useFileOperations } from "@/hooks/file-operations"
import { useTranslation } from "react-i18next"

export default function SettingsDialog(props: {
  isSettingDialogOpen: boolean
  setIsSettingDialogOpen: (isSettingDialogOpen: boolean) => void
}) {
  const { isSettingDialogOpen, setIsSettingDialogOpen } = props;

  const [appSettings] = useAtom(appSettingsAtom)
  const { updateAppSettings } = useAppSettings()
  const { toggleDevTools, quitApp, getSystemInfo } = useSystemInfo()
  const { openFolderInFinder, selectFolder } = useFileOperations()
  const { t } = useTranslation()
  const currentTheme = appSettings?.theme as AppTheme
  const currentLanguage = appSettings?.language || 'en'

  const [newFontSize, setNewFontSize] = useState(14)
  const saveButtonRef = useRef<HTMLButtonElement>(null)

  // AI设置相关状态
  const [newAIApiKey, setNewAIApiKey] = useState('')
  const [newAIBaseUrl, setNewAIBaseUrl] = useState('')
  const [newAIModel, setNewAIModel] = useState('')
  const [newAIEnabled, setNewAIEnabled] = useState(false)
  const [newAIProvider, setNewAIProvider] = useState<AIProvider>('openai')

  useEffect(() => {
    if (isSettingDialogOpen && appSettings) {
      setNewAIEnabled(appSettings.ai?.enabled ?? true)
      setNewAIProvider(appSettings.ai?.provider ?? 'openai')
      setNewAIApiKey(appSettings.ai?.apiKey ?? '')
      setNewAIBaseUrl(appSettings.ai?.baseUrl ?? 'https://api.openai.com/v1')
      setNewAIModel(appSettings.ai?.model ?? 'gpt-3.5-turbo')
    }
  }, [isSettingDialogOpen, appSettings])

  const onToggleDevTools = async () => {
    toggleDevTools()
  }

  const onQuitApp = async () => {
    try {
      await quitApp()
    } catch (error) {
      console.error(t('settings.exit_error'), error)
      toast.error(t('settings.exit_error'))
    }
  }

  const onSaveBtnClick = () => {
    updateAppSettings({
      ai: {
        enabled: newAIEnabled,
        provider: newAIProvider,
        apiKey: newAIApiKey,
        baseUrl: newAIBaseUrl,
        model: newAIModel
      }
    })
    toast.success(t('settings.saved'))
    setIsSettingDialogOpen(false)
  }

  const onRevertBtnClick = () => {
    if (appSettings) {
      setNewAIEnabled(appSettings.ai?.enabled ?? false)
      setNewAIProvider(appSettings.ai?.provider ?? 'openai')
      setNewAIApiKey(appSettings.ai?.apiKey ?? '')
      setNewAIBaseUrl(appSettings.ai?.baseUrl ?? 'https://api.openai.com/v1')
      setNewAIModel(appSettings.ai?.model ?? 'gpt-3.5-turbo')
      toast.info(t('settings.reverted'))
    }
  }

  return (
    <Dialog open={isSettingDialogOpen} onOpenChange={setIsSettingDialogOpen}>
      <DialogContent 
        className="sm:max-w-[625px] h-[500px] border border-divider rounded-2xl bg-content1 shadow-none flex flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()} // 防止自动focus到content
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">{t('settings.title')}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('settings.description')}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={"general"} className="w-full flex-1 min-h-0 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-content2 p-1 rounded-lg">
            <TabsTrigger
              value="general"
              className="rounded-md heroui-transition data-[state=active]:bg-content1 data-[state=active]:shadow-none"
            >
              {t('settings.general')}
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="rounded-md heroui-transition data-[state=active]:bg-content1 data-[state=active]:shadow-none"
            >
              {t('settings.ai')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-4 py-2 pb-4">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-medium text-foreground">{t('settings.language')}</Label>
                <Select value={currentLanguage} onValueChange={(value) => updateAppSettings({ language: value })}>
                  <SelectTrigger className="bg-content2 dark:bg-content3 border-divider focus:border-primary heroui-transition shadow-none">
                    <SelectValue placeholder={t('settings.select_language')} />
                  </SelectTrigger>
                  <SelectContent className="heroui-card">
                    <SelectItem value="en" className="heroui-transition hover:bg-content2 dark:hover:bg-content3">
                      <div className="flex items-center">
                        <Globe className="mr-2 h-4 w-4" />
                        English
                      </div>
                    </SelectItem>
                    <SelectItem value="zh" className="heroui-transition hover:bg-content2 dark:hover:bg-content3">
                      <div className="flex items-center">
                        <Globe className="mr-2 h-4 w-4" />
                        中文
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme" className="text-sm font-medium text-foreground">{t('settings.theme')}</Label>
                <Select value={currentTheme} onValueChange={(value: 'light' | 'dark' | 'system') => updateAppSettings({ theme: value })}>
                  <SelectTrigger className="bg-content2 dark:bg-content3 border-divider focus:border-primary heroui-transition shadow-none">
                    <SelectValue placeholder={t('settings.select_theme')} />
                  </SelectTrigger>
                  <SelectContent className="heroui-card">
                    <SelectItem value="light" className="heroui-transition hover:bg-content2 dark:hover:bg-content3">
                      <div className="flex items-center">
                        <Sun className="mr-2 h-4 w-4" />
                        {t('settings.theme_light')}
                      </div>
                    </SelectItem>
                    <SelectItem value="dark" className="heroui-transition hover:bg-content2 dark:hover:bg-content3">
                      <div className="flex items-center">
                        <Moon className="mr-2 h-4 w-4" />
                        {t('settings.theme_dark')}
                      </div>
                    </SelectItem>
                    <SelectItem value="system" className="heroui-transition hover:bg-content2 dark:hover:bg-content3">
                      <div className="flex items-center">
                        <Monitor className="mr-2 h-4 w-4" />
                        {t('settings.theme_system')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">{t('settings.about')}</Label>
                <Button
                  variant="outline"
                  className="w-full dark:bg-content3 justify-start heroui-button-secondary border-divider hover:border-primary shadow-none"
                  onClick={() => window.open('https://github.com/heroisuseless/daji', '_blank')}
                >
                  <Info className="mr-2 h-4 w-4" /> {t('settings.about_us')}
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">{t('settings.dev_tools')}</Label>
                <Button
                  onClick={onToggleDevTools}
                  variant="outline"
                  className="w-full dark:bg-content3 justify-start heroui-button-secondary border-divider hover:border-primary shadow-none"
                >
                  <Code className="mr-2 h-4 w-4" /> {t('settings.open_dev_tools')}
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">{t('settings.application')}</Label>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full dark:bg-content3 justify-start heroui-button-secondary border-divider hover:border-destructive shadow-none text-destructive hover:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> {t('settings.quit_app')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border border-divider rounded-2xl bg-content1 shadow-none">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        {t('settings.confirm_quit')}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('settings.confirm_quit_desc')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="heroui-button-secondary border-divider shadow-none">
                        {t('common.cancel')}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onQuitApp}
                        className="heroui-button bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('settings.quit_app')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-4 py-2 pb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-enabled" className="text-sm font-medium text-foreground">{t('settings.enable_ai')}</Label>
                  <Switch
                    id="ai-enabled"
                    checked={newAIEnabled}
                    onCheckedChange={setNewAIEnabled}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-provider" className="text-sm font-medium text-foreground">{t('settings.ai_provider')}</Label>
                <Select value={newAIProvider} onValueChange={(value: AIProvider) => {
                  setNewAIProvider(value)
                  // 自动设置默认配置
                  if (value === 'openai') {
                    setNewAIBaseUrl('https://api.openai.com/v1')
                    setNewAIModel('gpt-3.5-turbo')
                  } else if (value === 'deepseek') {
                    setNewAIBaseUrl('https://api.deepseek.com/v1')
                    setNewAIModel('deepseek-chat')
                  } else if (value === 'qwen') {
                    setNewAIBaseUrl('https://dashscope.aliyuncs.com/compatible-mode/v1')
                    setNewAIModel('qwen-plus')
                  }
                }}>
                  <SelectTrigger className="bg-content2 border-divider focus:border-primary heroui-transition shadow-none">
                    <SelectValue placeholder={t('settings.select_provider')} />
                  </SelectTrigger>
                  <SelectContent className="heroui-card">
                    <SelectItem value="openai" className="heroui-transition hover:bg-content2">
                      <div className="flex items-center">
                        <Bot className="mr-2 h-4 w-4" />
                        OpenAI
                      </div>
                    </SelectItem>
                    <SelectItem value="deepseek" className="heroui-transition hover:bg-content2">
                      <div className="flex items-center">
                        <Bot className="mr-2 h-4 w-4" />
                        DeepSeek
                      </div>
                    </SelectItem>
                    <SelectItem value="qwen" className="heroui-transition hover:bg-content2">
                      <div className="flex items-center">
                        <Bot className="mr-2 h-4 w-4" />
                        阿里千问
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-api-key" className="text-sm font-medium text-foreground">{t('settings.api_key')}</Label>
                <Input
                  id="ai-api-key"
                  type="password"
                  value={newAIApiKey}
                  onChange={(e) => setNewAIApiKey(e.target.value)}
                  placeholder={t('settings.enter_api_key')}
                  className="bg-content2 border-divider focus:border-primary heroui-transition shadow-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-base-url" className="text-sm font-medium text-foreground">{t('settings.base_url')}</Label>
                <Input
                  id="ai-base-url"
                  value={newAIBaseUrl}
                  onChange={(e) => setNewAIBaseUrl(e.target.value)}
                  placeholder={t('settings.enter_base_url')}
                  className="bg-content2 border-divider focus:border-primary heroui-transition shadow-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-model" className="text-sm font-medium text-foreground">{t('settings.model')}</Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {newAIProvider === 'openai' && (
                    <>
                      <Badge 
                        variant={newAIModel === 'gpt-3.5-turbo' ? 'default' : 'outline'} 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setNewAIModel('gpt-3.5-turbo')}
                      >
                        gpt-3.5-turbo
                      </Badge>
                      <Badge 
                        variant={newAIModel === 'gpt-4' ? 'default' : 'outline'} 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setNewAIModel('gpt-4')}
                      >
                        gpt-4
                      </Badge>
                      <Badge 
                        variant={newAIModel === 'gpt-4-turbo' ? 'default' : 'outline'} 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setNewAIModel('gpt-4-turbo')}
                      >
                        gpt-4-turbo
                      </Badge>
                      <Badge 
                        variant={newAIModel === 'gpt-4o' ? 'default' : 'outline'} 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setNewAIModel('gpt-4o')}
                      >
                        gpt-4o
                      </Badge>
                    </>
                  )}
                  {newAIProvider === 'deepseek' && (
                    <>
                      <Badge 
                        variant={newAIModel === 'deepseek-chat' ? 'default' : 'outline'} 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setNewAIModel('deepseek-chat')}
                      >
                        deepseek-chat
                      </Badge>
                      <Badge 
                        variant={newAIModel === 'deepseek-coder' ? 'default' : 'outline'} 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setNewAIModel('deepseek-coder')}
                      >
                        deepseek-coder
                      </Badge>
                      <Badge 
                        variant={newAIModel === 'deepseek-reasoner' ? 'default' : 'outline'} 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setNewAIModel('deepseek-reasoner')}
                      >
                        deepseek-reasoner
                      </Badge>
                    </>
                  )}
                  {newAIProvider === 'qwen' && (
                    <>
                      <Badge 
                        variant={newAIModel === 'qwen-plus' ? 'default' : 'outline'} 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setNewAIModel('qwen-plus')}
                      >
                        qwen-plus
                      </Badge>
                      <Badge 
                        variant={newAIModel === 'qwen-turbo' ? 'default' : 'outline'} 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setNewAIModel('qwen-turbo')}
                      >
                        qwen-turbo
                      </Badge>
                      <Badge 
                        variant={newAIModel === 'qwen-max' ? 'default' : 'outline'} 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setNewAIModel('qwen-max')}
                      >
                        qwen-max
                      </Badge>
                      <Badge 
                        variant={newAIModel === 'qwen-coder-plus' ? 'default' : 'outline'} 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setNewAIModel('qwen-coder-plus')}
                      >
                        qwen-coder-plus
                      </Badge>
                    </>
                  )}
                </div>
                <Input
                  id="ai-model"
                  value={newAIModel}
                  onChange={(e) => setNewAIModel(e.target.value)}
                  placeholder={t('settings.enter_model')}
                  className="bg-content2 border-divider focus:border-primary heroui-transition shadow-none"
                />
              </div>

              {newAIProvider === 'openai' && (
                <div className="text-xs text-muted-foreground bg-content2 p-3 rounded-lg">
                  <p className="font-medium mb-1">{t('settings.openai_desc_title')}</p>
                  <p>{t('settings.openai_desc_model')}</p>
                  <p>{t('settings.openai_desc_key')}</p>
                </div>
              )}

              {newAIProvider === 'deepseek' && (
                <div className="text-xs text-muted-foreground bg-content2 p-3 rounded-lg">
                  <p className="font-medium mb-1">{t('settings.deepseek_desc_title')}</p>
                  <p>{t('settings.deepseek_desc_model')}</p>
                  <p>{t('settings.deepseek_desc_key')}</p>
                </div>
              )}

              {newAIProvider === 'qwen' && (
                <div className="text-xs text-muted-foreground bg-content2 p-3 rounded-lg">
                  <p className="font-medium mb-1">{t('settings.qwen_desc_title')}</p>
                  <p>{t('settings.qwen_desc_model')}</p>
                  <p>{t('settings.qwen_desc_key')}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <div className="flex items-center space-x-2 justify-end">
            <Button
              onClick={onRevertBtnClick}
              variant="outline"
              className="heroui-button heroui-button-secondary border border-divider hover:border-primary rounded-lg shadow-none"
            >
              <RefreshCw className="mr-2 h-4 w-4" />{t('settings.restore')}
            </Button>
            <Button
              ref={saveButtonRef}
              onClick={onSaveBtnClick}
              className="heroui-button heroui-button-primary border-0 rounded-lg shadow-none"
            >
              <HardDrive className="mr-2 h-4 w-4" />{t('settings.save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
