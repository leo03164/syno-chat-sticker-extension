import type { AxiosResponse } from 'axios'
import type { GetStickersApiParams, StickerInfo } from '~/types/sticker'
import { useAxios } from '~/composables/useAxios'
import type { ApiResponse } from '~/types/api'

export default {
  getStickers(params?: GetStickersApiParams): Promise<AxiosResponse<ApiResponse<StickerInfo[]>>> {
    const axios = useAxios()
    return axios.get('/stickers', { params })
  },
}
