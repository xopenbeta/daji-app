// Abstracting this here doesn't actually have much effect anymore
export interface CommonResult {
  success: boolean
  message?: string
  data?: any
}

export interface IPCResult<T = any> extends CommonResult {
  data?: T
}

export interface CommandResult extends CommonResult {
  data?: {
    output?: string
  }
}
