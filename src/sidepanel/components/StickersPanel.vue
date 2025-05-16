<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import ImagePreviewGrid from './ImagePreviewGrid.vue'
import FileUploadZone from './FileUploadZone.vue'
import { useImageUpload } from '~/composables/useImageUpload'
import { useJsonUpload } from '~/composables/useJsonUpload'
import { serverUrl } from '~/logic/storage'

// 使用組合式函數管理上傳邏輯
const {
  imageFiles,
  imagePreviewUrls,
  handleImageUpload,
  removeImage,
  clearImages,
  errorMessage: imageError,
} = useImageUpload()

const {
  jsonFile,
  handleJsonUpload,
  clearJson,
  errorMessage: jsonError,
} = useJsonUpload()

const isUploading = ref(false)
const successMessage = ref('')

// 合併錯誤訊息
const errorMessage = computed(() => imageError.value || jsonError.value)

// 處理 jsonFile 的值
const selectedJsonFile = computed(() => jsonFile.value || undefined)
const hasJsonFile = computed(() => !!jsonFile.value)
const jsonFileName = computed(() => jsonFile.value?.name || '')

async function handleSubmit() {
  if (!serverUrl.value) {
    imageError.value = '請先在設定中設定圖片路徑對照表 URL'
    return
  }

  if (!imageFiles.value.length || !jsonFile.value) {
    imageError.value = '請上傳圖片和 JSON 檔案'
    return
  }

  isUploading.value = true
  successMessage.value = ''

  try {
    const formData = new FormData()
    imageFiles.value.forEach((file) => {
      formData.append('files', file)
    })
    formData.append('record', jsonFile.value)

    const response = await fetch(`${serverUrl.value}/stickers/upload/hackmd`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok)
      throw new Error('上傳失敗')

    successMessage.value = '上傳成功！'
    clearImages()
    clearJson()
  }
  catch (error) {
    imageError.value = `${error} 上傳失敗，請稍後再試`
  }
  finally {
    isUploading.value = false
  }
}

// 組件銷毀時清理
onUnmounted(() => {
  clearImages()
  clearJson()
})
</script>

<template>
  <div class="space-y-8">
    <!-- 圖片上傳區 -->
    <FileUploadZone
      accept=".png"
      :multiple="true"
      label="上傳貼圖（PNG 格式，小於 1MB）"
      button-text="選擇圖片"
      :selected-file="imageFiles"
      @change="handleImageUpload"
    >
      <template #selected-info>
        <ImagePreviewGrid
          v-if="imagePreviewUrls.length"
          :images="imagePreviewUrls"
          :on-remove="removeImage"
          :on-clear-all="clearImages"
        />
      </template>
    </FileUploadZone>

    <!-- JSON 上傳區 -->
    <FileUploadZone
      accept=".json"
      label="上傳 JSON 設定檔"
      button-text="選擇 JSON 檔案"
      :selected-file="selectedJsonFile"
      @change="handleJsonUpload"
    >
      <template #selected-info>
        <div v-if="hasJsonFile" class="mt-4 text-sm text-[#86868B]">
          已選擇: {{ jsonFileName }}
        </div>
      </template>
    </FileUploadZone>

    <!-- 錯誤和成功訊息 -->
    <div v-if="errorMessage" class="text-[#FF3B30] text-sm">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="text-[#34C759] text-sm">
      {{ successMessage }}
    </div>

    <!-- 送出按鈕 -->
    <button
      class="w-full py-3 px-4 bg-[#0066CC] text-white rounded-xl font-medium
             hover:bg-[#004499] transition-colors duration-200 disabled:opacity-50"
      :disabled="isUploading || !imageFiles.length || !jsonFile"
      @click="handleSubmit"
    >
      {{ isUploading ? '上傳中...' : '送出' }}
    </button>
  </div>
</template>
