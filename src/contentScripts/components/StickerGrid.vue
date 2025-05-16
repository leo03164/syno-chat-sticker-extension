<script setup lang="ts">
import { defineProps } from 'vue'
import type { StickerInfo } from '~/types/sticker'

defineProps<{
  stickers: StickerInfo[]
}>()

function handleSendSticker(id: string) {
  console.info(id)
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
