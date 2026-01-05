import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safe JSON serialization function, handles circular references
 */
export function safeStringify(value: any, space?: number): string {
  const cache = new WeakSet()
  try {
    return JSON.stringify(
      value,
      (_k, v) => {
        if (typeof v === 'object' && v !== null) {
          if (cache.has(v)) return '[Circular]'
          cache.add(v)
        }
        return v
      },
      space ?? 0
    )
  } catch (error) {
    return '[Stringify Error: ' + (error instanceof Error ? error.message : String(error)) + ']'
  }
}
