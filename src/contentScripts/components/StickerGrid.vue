<script setup lang="ts">
import { defineProps } from 'vue'
import type { StickerInfo } from '~/types/sticker'

interface Props {
  stickers: StickerInfo[]
}

defineProps<Props>()

async function handleSendSticker(id: string) {
  try {
    // 將貼圖 ID 寫入剪貼簿
    await navigator.clipboard.writeText(`:${id}:`)
    // 可以加入一個提示，讓使用者知道已經複製成功
    console.warn('貼圖 ID 已複製到剪貼簿')
  }
  catch (error) {
    console.error('複製到剪貼簿失敗:', error)
  }
}
</script>

<template>
  <div class="grid grid-cols-4 gap-2">
    <img
      v-for="sticker in stickers"
      :key="sticker.stickerId"
      :src="sticker.path"
      class="w-28 h-28 aspect-square cursor-pointer object-contain rounded-xl border border-[#E5E5E7] transition-all duration-200 hover:scale-120 active:scale-95 bg-[#F5F5F7]"
      @click="handleSendSticker(sticker.stickerId)"
    >
  </div>
</template>
