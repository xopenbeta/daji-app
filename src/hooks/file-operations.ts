import { ipcOpenFolderInFinder, ipcSelectFolder, ipcOpenFileDialog, ipcSaveFileDialog, ipcReadFileContent, ipcWriteFileContent } from "../ipc/file-operations";

export function useFileOperations() {
  function openFolderInFinder(folderPath: string) {
    ipcOpenFolderInFinder(folderPath)
  }

  async function selectFolder(options?: { title?: string, defaultPath?: string }) {
    return ipcSelectFolder(options || {})
  }

  async function openFileDialog(options?: {
    title?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
    defaultPath?: string;
  }) {
    return ipcOpenFileDialog(options)
  }

  async function saveFileDialog(options?: {
    title?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
    defaultPath?: string;
    defaultName?: string;
  }) {
    return ipcSaveFileDialog(options)
  }

  async function readFileContent(filePath: string) {
    return ipcReadFileContent(filePath)
  }

  async function writeFileContent(filePath: string, content: string) {
    return ipcWriteFileContent(filePath, content)
  }

  return {
    openFolderInFinder,
    selectFolder,
    openFileDialog,
    saveFileDialog,
    readFileContent,
    writeFileContent
  }
}
