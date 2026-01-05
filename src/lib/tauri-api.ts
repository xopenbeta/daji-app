/**
 * Tauri API unified encapsulation
 * Used to replace Electron's ipcRenderer calls
 */

import { invoke } from '@tauri-apps/api/core';

// Generic IPC call encapsulation
export async function invokeCommand<T = any>(command: string, args?: any): Promise<T> {
  try {
    const result = await invoke(command, args);
    return result as T;
  } catch (error) {
    console.error(`Tauri command "${command}" failed:`, error);
    throw error;
  }
}

// Open external link or file
export async function openExternal(path: string): Promise<void> {
  await invoke('plugin:opener|open', { path });
}

// Type definitions
export interface TauriResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic result wrapper
export function wrapResult<T>(data: T): TauriResult<T> {
  return {
    success: true,
    data
  };
}

export function wrapError(error: string | Error): TauriResult {
  return {
    success: false,
    error: error instanceof Error ? error.message : error
  };
}
