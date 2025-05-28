import type { AxiosResponse } from 'axios'
import { useAxios } from '~/composables/useAxios'
import type { ApiResponse } from '~/types/api'

export default {
  getSeriesList(): Promise<AxiosResponse<ApiResponse<{ id: string }[]>>> {
    const axios = useAxios()
    return axios.get('/series')
  },
}
