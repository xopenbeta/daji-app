'use client'
import { AppSettings } from '@/types/index'
import { atom } from 'jotai'

export const defaultAppSettings: AppSettings = {
  theme: 'system',
  language: 'zh',
  ai: {
    enabled: false,
    provider: 'openai',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo'
  }
}

export const appSettingsAtom = atom<AppSettings | undefined>(undefined)
export const isAppLoadingAtom = atom(true)
export const updateAvailableAtom = atom(false)
