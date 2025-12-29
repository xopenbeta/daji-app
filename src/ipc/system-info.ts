import { IPCResult } from "@/types/ipc"
import { invokeCommand } from '@/lib/tauri-api'

export const ipcOpenTerminal = async (): Promise<IPCResult> => {
    return invokeCommand('open_terminal')
}

export const ipcToggleDevTools = async (): Promise<IPCResult> => {
    return invokeCommand('toggle_dev_tools');
}

export const ipcQuitApp = async (): Promise<IPCResult> => {
    return invokeCommand('quit_app');
}
