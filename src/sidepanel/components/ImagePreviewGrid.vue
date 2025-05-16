<script setup lang="ts">
import ImagePreviewItem from './ImagePreviewItem.vue'

interface ImagePreview {
  file: File
  url: string
}

interface Props {
  images: ImagePreview[]
  onRemove?: (file: File) => void
  onClearAll?: () => void
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-6">
    <!-- 標題和清除按鈕 -->
    <div class="flex items-center justify-center space-x-2 text-sm text-[#86868B]">
      <span>已選擇 {{ images.length }} 個檔案</span>
      <button
        v-if="onClearAll"
        class="text-[#FF3B30] hover:text-[#FF2D55] transition-colors duration-200"
        @click="onClearAll"
      >
        清除全部
      </button>
    </div>

    <!-- 預覽網格 -->
    <div class="grid grid-cols-3 gap-4">
      <div
        v-for="{ file, url } in images"
        :key="url"
        class="relative aspect-square group"
      >
        <ImagePreviewItem
          :file="file"
          :url="url"
          :on-remove="onRemove"
        />
      </div>
    </div>
  </div>
</template>
