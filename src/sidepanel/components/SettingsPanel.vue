<script setup lang="ts">
import { seriesList, seriesMapStickerList, serverUrl, stickerPathMap } from '~/logic/storage'
import type { GetStickersApiParams, StickerInfo } from '~/types/sticker'
import SERIES_API from '~/api/series'
import STICKER_API from '~/api/sticker'

const stickerInfoList = ref<StickerInfo[]>([])
const isInit = ref(false)

async function initSeries() {
  const res = await SERIES_API.getSeriesList()
  seriesList.value = res.data.data || []
}

function initStickerInfoList(list: StickerInfo[]) {
  stickerInfoList.value = list
}

async function initStickerPathMap(query?: GetStickersApiParams) {
  const res = await STICKER_API.getStickers(query)
  initStickerInfoList(res.data.data || [])

  res.data.data?.forEach((item) => {
    stickerPathMap.value.set(item.stickerId, item.path)
  })
}

function initSeriesMapStickerList() {
  seriesList.value.forEach((seriesId) => {
    const list = stickerInfoList.value.filter(seriesInfo => seriesInfo.seriesId === seriesId.id)
    seriesMapStickerList.value.set(seriesId.id, list)
  })
}

async function initAll() {
  await initSeries()
  await initStickerPathMap()
  initSeriesMapStickerList()
  isInit.value = true
  setTimeout(() => {
    isInit.value = false
  }, 5000)
}
</script>

<template>
  <div class="space-y-8">
    <!-- 表單區域 -->
    <div class="space-y-7">
      <!-- 圖片路徑映射記錄 URL -->
      <div class="form-group">
        <label class="block text-sm font-medium text-[#1D1D1F] mb-2.5">伺服器網址</label>
        <input
          v-model="serverUrl"
          class="w-full px-4 py-3 rounded-xl bg-white border border-[#E5E5E7]
                 focus:border-[#0066CC] focus:ring focus:ring-[#0066CC20]
                 transition-all duration-200 text-sm"
          placeholder="請輸入伺服器網址"
        >
      </div>

      <!-- 當前設定區域 -->
      <div class="p-5 bg-white rounded-2xl shadow-sm border border-[#E5E5E7]">
        <h2 class="text-lg font-medium text-[#1D1D1F] mb-4">
          目前設定
        </h2>
        <div class="space-y-4">
          <div class="flex flex-col">
            <span class="text-sm text-[#86868B] mb-1">伺服器網址</span>
            <span class="text-sm font-mono text-[#1D1D1F] break-all">
              {{ serverUrl || '尚未設定' }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div>
      <button
        class="w-full py-3 px-4 bg-[#0066CC] text-white rounded-xl font-medium
             hover:bg-[#004499] transition-colors duration-200 disabled:opacity-50"
        @click="initAll"
      >
        Save
      </button>
      <div v-if="isInit" class="w-full text-center mt-4 text-md text-[#0066CC]">
        {{ 'Initial Success! Enjoy the stickers!' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-group input {
  -webkit-appearance: none;
  appearance: none;
}

.form-group input:focus {
  outline: none;
}

.form-group input::placeholder {
  color: #86868B;
}
</style>
