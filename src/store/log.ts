import { atom } from 'jotai'

export interface LogEntry {
  id: string
  time: number
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  meta?: any
}

export const logEntriesAtom = atom<LogEntry[]>([])
export const autoScrollLogAtom = atom(true)
export const isLogPanelOpenAtom = atom(false)
