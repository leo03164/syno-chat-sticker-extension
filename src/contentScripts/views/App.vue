<script setup lang="ts">
import { useToggle } from '@vueuse/core'
import { ref } from 'vue'
import 'uno.css'
import { sendMessage } from 'webext-bridge/background'
import StickerSeriesSelector from '../components/StickerSeriesSelector.vue'
import StickerGrid from '../components/StickerGrid.vue'
import { seriesList, stickerMap } from '~/logic/storage'
import type { SeriesForDisplay } from '~/types/series'

function waitForElement(selector, callback) {
  const interval = setInterval(() => {
    const el = document.querySelector(selector)
    if (el) {
      clearInterval(interval)
      callback(el)
    }
  }, 1000)
}

async function processMsgEls(node: HTMLElement) {
  const targetList = node.querySelectorAll('.msg-text>.text-wrapper>.markdown')

  if (!targetList.length) {
    return
  }

  let flag = false

  for (const el of targetList) {
    const stickerKey = el.innerText
    const stickerPath = file_path_map[stickerKey]

    if (!stickerPath) {
      continue
    }

    try {
      const imageUrl = ''

      el.innerHTML
        = `
          <div class="sticker sticker-post sticker-only">
            <div ext:qtip=":${stickerKey}:"
              class="sticker-img"
              style="
                width: 320px;
                height: 320px;
                background-image: url(${imageUrl});
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
              ">
            </div>
          </div>
        `
      flag = true
    }
    catch (error) {
      console.error('Error loading image:', error)
    }
  }

  if (flag) {
    scrollToBottom()
  }
}

function scrollToBottom() {
  window.fleXenv.fleXlist[0].scrollUpdate()
  window.fleXenv.fleXlist[0].fleXcroll.scrollContent(0, window.fleXenv.fleXlist[0].fleXdata.getContentHeight())
}

function startObserving(targetNode: HTMLElement) {
  processMsgEls(document.body)

  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement))
            return
          processMsgEls(node)
        })
      }
    })
  })

  observer.observe(targetNode, {
    childList: true,
    subtree: true,
  })
}

onMounted(async () => {
  // startObserving(document.body)
  const res = await sendMessage('get-sticker-map')
  console.log('res: ', res)
})

console.log('stickerMap: ', stickerMap.value)

console.log('Hello World')

const [show, toggle] = useToggle(false)

const currentSeries = ref<string>('basic')
const seriesIconList = ['👍', '🙏', '👌', '⭐', '😤', '📱', '😊', '🤗', '❤️', '🎉', '🌟', '✨', '💪', '🎵', '🎸', '🎮']

const seriesListForDisplay = computed<SeriesForDisplay[]>(() => {
  return seriesList.value.map((item, index) => {
    return {
      img: seriesIconList[index],
      id: item.id,
    }
  })
})
</script>

<template>
  <div class="fixed right-4 bottom-30 m-5 flex items-end font-sans select-none leading-1em z-2147483647">
    <div
      v-show="show"
      class="w-[500px] h-[440px] flex flex-col bg-white rounded-xl overflow-hidden"
      :class="show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
      transition="all duration-300"
      :style="{
        border: '1px solid #000',
      }"
    >
      <!-- 標題區 -->
      <div
        class="px-4 py-3"
        :style="{
          borderBottom: '1px solid #000',
        }"
      >
        <h1 class="text-[15px] font-medium text-[#1d1d1f]">
          貼圖
        </h1>
      </div>

      <!-- 系列選擇區 -->
      <StickerSeriesSelector
        :series-list="seriesListForDisplay"
        :current-series="String(currentSeries)"
        @update:current-series="val => currentSeries = val"
      />

      <!-- 貼圖網格區 -->
      <div class="flex-1 overflow-y-auto px-3 py-2" style="overflow-y: overlay;">
        <StickerGrid :stickers="stickerMap.get(currentSeries) || []" />
      </div>

      <!-- 底部資訊 -->
      <div class="px-4 py-2">
        <div class="text-xs text-[#86868b] text-center">
          <SharedSubtitle />
        </div>
      </div>
    </div>

    <!-- 開啟貼圖區塊 -->
    <button
      class="flex w-10 h-10 rounded-full cursor-pointer border-none ml-2
             bg-[#0066CC] hover:bg-[#004499] transition-all duration-200"
      @click="toggle()"
    >
      <span class="block m-auto text-white text-lg">😊</span>
    </button>
  </div>
</template>

<style>
.aspect-square {
  aspect-ratio: 1;
}

/* 隱藏水平滾動條但保持功能 */
.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* 自定義垂直滾動條 */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #d1d1d6;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #c1c1c6;
}
</style>
