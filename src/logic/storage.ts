import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'
import type { StickerInfo } from '~/types/sticker'

export const serverUrl = useWebExtensionStorage('server-url', '')

export const seriesList = useWebExtensionStorage<{ id: string }[]>('series-list', [])

export const stickerMap = useWebExtensionStorage<Map<string, StickerInfo[]>>('sticker-map', new Map())
