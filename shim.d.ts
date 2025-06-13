import type { ProtocolWithReturn } from 'webext-bridge'
import type { Result } from './src/types/event'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    'tab-prev': { title: string | undefined }
    'fetch-image-data': ProtocolWithReturn<{ imageUrl: string }, Result<string>>
    'execute-scroll': ProtocolWithReturn<{ action: 'update-bar' | 'scroll-to-bottom' }, Promise<boolean>>
  }
}
