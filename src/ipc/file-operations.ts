import { IPCResult } from "@/types/ipc"
import { invokeCommand } from '@/lib/tauri-api'

export const ipcOpenSelectDialog = async (): Promise<IPCResult> => {
    return invokeCommand('open_file_dialog');
}

export const ipcReadFileContent = async (filePath: string): Promise<IPCResult> => {
    return invokeCommand('read_file_content', { filePath });
}

export const ipcIsFileWrite = async (filePath: string): Promise<IPCResult> => {
    return invokeCommand('is_file_write', { filePath });
}

export const ipcSelectFolder = async (options: { title?: string, defaultPath?: string }): Promise<IPCResult> => {
    return invokeCommand('open_folder_dialog', options);
}

export const ipcOpenFolderInFinder = async (folderPath: string): Promise<IPCResult> => {
    return invokeCommand('open_in_file_manager', { path: folderPath });
}
