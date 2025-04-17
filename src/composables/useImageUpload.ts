import { ref } from 'vue'

export interface ImagePreview {
  file: File
  url: string
}

export function useImageUpload() {
  const imageFiles = ref<File[]>([])
  const imagePreviewUrls = ref<ImagePreview[]>([])
  const errorMessage = ref('')

  function handleImageUpload(event: Event) {
    const files = (event.target as HTMLInputElement).files
    if (!files)
      return

    // 檢查每個檔案
    const validFiles = Array.from(files).filter((file) => {
      // 檢查檔案類型
      if (!file.type.includes('png')) {
        errorMessage.value = '只能上傳 PNG 格式的圖片'
        return false
      }
      // 檢查檔案大小（1MB = 1024 * 1024 bytes）
      if (file.size > 1024 * 1024) {
        errorMessage.value = '圖片大小必須小於 1MB'
        return false
      }
      return true
    })

    // 更新檔案列表
    imageFiles.value = validFiles

    // 產生預覽 URL
    imagePreviewUrls.value = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
    }))

    errorMessage.value = ''
  }

  function removeImage(fileToRemove: File) {
    const index = imageFiles.value.findIndex(file => file === fileToRemove)
    if (index !== -1) {
      // 釋放 URL 物件
      URL.revokeObjectURL(imagePreviewUrls.value[index].url)
      // 移除圖片
      imageFiles.value.splice(index, 1)
      imagePreviewUrls.value.splice(index, 1)
    }
  }

  function clearImages() {
    // 釋放所有 URL 物件
    imagePreviewUrls.value.forEach((item) => {
      URL.revokeObjectURL(item.url)
    })
    imageFiles.value = []
    imagePreviewUrls.value = []
    errorMessage.value = ''
  }

  return {
    imageFiles,
    imagePreviewUrls,
    errorMessage,
    handleImageUpload,
    removeImage,
    clearImages,
  }
}
