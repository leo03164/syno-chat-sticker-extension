export interface StickerInfo {
  stickerId: string
  path: string
  seriesId: string
}

export interface GetStickersApiParams {
  seriesId?: string
  stickerId?: string
}
