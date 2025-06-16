<script setup lang="ts">
import { defineProps } from 'vue'
import { scrollToBottom, sendMsg } from '../chat'
import type { StickerInfo } from '~/types/sticker'

interface Props {
  stickers: StickerInfo[]
  seriesId: string
}

const props = defineProps<Props>()

async function handleSendSticker(stickerId: string) {
  const container = document.querySelector('.chat-input-aria-main-v2.x-border-panel')
  const editableElement = container?.querySelector('.msg-inputarea-textarea-wrap .chat-contenteditable-field.msg-inputarea-textarea')
  if (editableElement) {
    const textContent = `base64=TUlTLUZFLWNoZW5sZW8=_${props.seriesId}_${stickerId}`
    editableElement.textContent = textContent
    await sendMsg()
      .catch((error) => {
        console.error('貼圖傳送失敗:', error)
      })
    setTimeout(async () => {
      await scrollToBottom()
    }, 100)
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
