import { IPCResult } from "@/types/ipc"
import { invokeCommand } from '@/lib/tauri-api'

export const ipcGetSystemInfo = async (): Promise<IPCResult<{
    cpu_usage: number,
    cpu_count: number,
    cpu_brand: string,
    memory_total: number,
    memory_used: number,
    memory_available: number,
    memory_usage_percent: number,
    disks: Array<{
        name: string,
        mount_point: string,
        total_space: number,
        available_space: number,
        used_space: number,
        usage_percent: number,
        file_system: string,
    }>,
    network_interfaces: Array<{
        name: string,
        bytes_received: number,
        bytes_transmitted: number,
        packets_received: number,
        packets_transmitted: number,
        errors_on_received: number,
        errors_on_transmitted: number,
    }>,
    ip_addresses: string[],
    uptime: number,
    os_name: string,
    hostname: string,
}>> => {
    return invokeCommand('get_system_info')
}

export const ipcOpenTerminal = async (): Promise<IPCResult> => {
    return invokeCommand('open_terminal')
}

export const ipcToggleDevTools = async (): Promise<IPCResult> => {
    return invokeCommand('toggle_dev_tools');
}

export const ipcQuitApp = async (): Promise<IPCResult> => {
    return invokeCommand('quit_app');
}
