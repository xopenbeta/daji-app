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

export const ipcOpenFileDialog = async (options?: {
    title?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
    defaultPath?: string;
}): Promise<IPCResult> => {
    return invokeCommand('open_file_dialog', options || {});
}

export const ipcSaveFileDialog = async (options?: {
    title?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
    defaultPath?: string;
    defaultName?: string;
}): Promise<IPCResult> => {
    return invokeCommand('save_file_dialog', options || {});
}

export const ipcWriteFileContent = async (filePath: string, content: string): Promise<IPCResult> => {
    return invokeCommand('write_file_content', { filePath, content });
}
