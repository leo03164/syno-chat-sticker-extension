import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'
import type { StickerInfo } from '~/types/sticker'
import type { Series } from '~/types/series'

export const serverUrl = useWebExtensionStorage('server-url', '')

// seriesList
export const seriesList = useWebExtensionStorage<Series[]>('series-list', [])

// seriesId -> stickerList
export const seriesMapStickerList = useWebExtensionStorage<Map<string, StickerInfo[]>>('series-map-sticker-list', new Map())

// id -> path
export const stickerPathMap = useWebExtensionStorage<Map<string, string>>('sticker-path-map', new Map())

// id -> objectUrl
export const stickerObjectUrlMap = useWebExtensionStorage<Map<string, string>>('sticker-object-url-map', new Map())
