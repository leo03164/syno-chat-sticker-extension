<script setup lang="ts">
interface Props {
  file: File
  url: string
  onRemove?: (file: File) => void
}

defineProps<Props>()
</script>

<template>
  <div class="relative aspect-square">
    <!-- 圖片容器 -->
    <div class="w-full h-full rounded-xl overflow-hidden bg-[#F5F5F7] border border-[#E5E5E7]">
      <img
        :src="url"
        :alt="file.name"
        class="w-full h-full object-contain"
      >
    </div>

    <!-- 刪除按鈕 -->
    <button
      v-if="onRemove"
      class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FF3B30] text-white
             flex items-center justify-center shadow-lg
             opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      @click="onRemove(file)"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- 檔案名稱提示 -->
    <div
      class="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-xs
             opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-b-xl
             truncate"
    >
      {{ file.name }}
    </div>
  </div>
</template>
