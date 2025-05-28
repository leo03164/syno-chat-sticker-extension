import type { AxiosInstance } from 'axios'
import axios from 'axios'
import { computed, watch } from 'vue'
import { serverUrl } from '~/logic/storage'

// 使用 ref 來存儲 axios 實例，這樣可以響應式地更新
const axiosInstance = ref<AxiosInstance | null>(null)

function createAxios(): AxiosInstance {
  const request = axios.create({
    baseURL: serverUrl.value,
  })

  // 更新實例
  axiosInstance.value = request
  return request
}

// 使用 computed 來確保每次都返回最新的實例
const axiosComputed = computed(() => {
  // 如果實例不存在或 baseURL 不匹配，則創建新實例
  if (!axiosInstance.value || axiosInstance.value.defaults.baseURL !== serverUrl.value) {
    return createAxios()
  }
  return axiosInstance.value
})

// 監聽 serverUrl 的變化
watch(
  () => serverUrl.value,
  () => {
    // 當 serverUrl 改變時，強制創建新實例
    createAxios()
  },
)

export function useAxios(): AxiosInstance {
  return axiosComputed.value
}
