import type { AxiosInstance } from 'axios'
import axios from 'axios'
import { computed, watch } from 'vue'
import { serverUrl } from '~/logic/storage'

// Singleton Axios Instance
const axiosInstance = ref<AxiosInstance | null>(null)

function createAxios(): AxiosInstance {
  const request = axios.create({
    baseURL: serverUrl.value,
  })

  axiosInstance.value = request
  return request
}

const axiosComputed = computed(() => {
  if (!axiosInstance.value || axiosInstance.value.defaults.baseURL !== serverUrl.value) {
    return createAxios()
  }
  return axiosInstance.value
})

watch(
  () => serverUrl.value,
  () => {
    createAxios()
  },
)

export function useAxios(): AxiosInstance {
  return axiosComputed.value
}
