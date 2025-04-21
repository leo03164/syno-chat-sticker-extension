<script setup lang="ts">
import { useToggle } from '@vueuse/core'
import { ref } from 'vue'
import 'uno.css'

const [show, toggle] = useToggle(false)

interface StickerSeries {
  icon: string
  stickers: string[]
}

interface StickerSeriesMap {
  [key: string]: StickerSeries
}

const currentSeries = ref<keyof typeof stickerSeries>('basic')

// 貼圖系列數據
const stickerSeries: StickerSeriesMap = {
  basic: {
    icon: '😊',
    stickers: ['👍', '🙏', '👌', '⭐', '😤', '📱', '😊', '🤗', '❤️', '🎉', '🌟', '✨', '💪', '🎵', '🎸', '🎮'],
  },
  animals: {
    icon: '🐱',
    stickers: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐙', '🦄'],
  },
  food: {
    icon: '🍜',
    stickers: ['🍎', '🍕', '🍜', '🍣', '🍙', '🍪', '🍩', '🍖', '🌮', '🥐', '🥨', '🥯', '🥞', '🧇', '🥓', '🥪'],
  },
  weather: {
    icon: '🌤',
    stickers: ['☀️', '🌤', '⛅️', '🌥', '☁️', '🌦', '🌧', '⛈', '🌩', '🌨', '❄️', '💨', '🌪', '🌈', '☔️', '⚡️'],
  },
  nature: {
    icon: '🌸',
    stickers: ['🌸', '🌺', '🌹', '🌷', '🌻', '🌼', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁'],
  },
  sports: {
    icon: '⚽️',
    stickers: ['⚽️', '🏀', '🏈', '⚾️', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '⛳️', '🎳', '⛸', '🎿', '🏹'],
  },
}
</script>

<template>
  <div class="fixed right-4 bottom-30 m-5 flex items-end font-sans select-none leading-1em z-2147483647">
    <div
      v-show="show"
      class="w-[300px] h-[340px] flex flex-col bg-white rounded-xl overflow-hidden"
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
      <div class="relative">
        <div
          class="flex overflow-x-auto px-3 py-3 hide-scrollbar"
          style="scroll-behavior: smooth;"
        >
          <button
            v-for="(series, key) in stickerSeries"
            :key="key"
            class="relative shrink-0 w-9 h-9 transition-all duration-200
                   flex items-center justify-center mx-0.5 first:ml-0 last:mr-0"
            :class="[
              currentSeries === key
                ? 'text-[#1d1d1f]'
                : 'text-[#86868b] hover:text-[#1d1d1f]',
            ]"
            @click="currentSeries = key"
          >
            <span class="text-xl">{{ series.icon }}</span>
            <div
              v-if="currentSeries === key"
              class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#007AFF] rounded-full"
            />
          </button>
        </div>
      </div>

      <!-- 貼圖網格區 -->
      <div
        class="flex-1 overflow-y-auto px-3 py-2"
        style="overflow-y: overlay;"
      >
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="(sticker, index) in stickerSeries[currentSeries].stickers"
            :key="index"
            class="aspect-square
                   flex items-center justify-center text-xl
                   transition-all duration-200 transform
                   hover:scale-110
                   active:scale-95"
          >
            {{ sticker }}
          </button>
        </div>
      </div>

      <!-- 底部資訊 -->
      <div class="px-4 py-2">
        <div class="text-xs text-[#86868b] text-center">
          <SharedSubtitle />
        </div>
      </div>
    </div>

    <!-- 觸發按鈕 -->
    <button
      class="flex w-10 h-10 rounded-full cursor-pointer border-none ml-2
             bg-[#0066CC] hover:bg-[#004499] transition-all duration-200"
      @click="toggle()"
    >
      <span class="block m-auto text-white text-lg">🖼</span>
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
