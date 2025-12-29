import {
    ipcToggleDevTools,
    ipcOpenTerminal,
    ipcQuitApp,
} from "../ipc/system-info";

export function useSystemInfo() {
    const openTerminal = async () => {
        const res = await ipcOpenTerminal();
        if (res.success) {
            return res.data;
        } else {
            throw new Error(res.message || 'Failed to open terminal');
        }
    }

    const toggleDevTools = async () => {
        const res = await ipcToggleDevTools();
        return res;
    }

    const quitApp = async () => {
        const res = await ipcQuitApp();
        return res;
    }

    return {
        openTerminal,
        toggleDevTools,
        quitApp
    }
}
