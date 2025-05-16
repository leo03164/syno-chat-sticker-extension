import { ref } from 'vue'

interface StickerInfo {
  file_name: string
  tags: string[]
}

export function useJsonUpload() {
  const jsonFile = ref<File | null>(null)
  const errorMessage = ref('')

  async function handleJsonUpload(event: Event) {
    const files = (event.target as HTMLInputElement).files
    if (!files || !files[0])
      return

    try {
      const file = files[0]
      const content = await file.text()
      const json = JSON.parse(content)

      // 驗證 JSON 格式
      if (!Array.isArray(json) || !json.every((item: StickerInfo) =>
        item.file_name
        && Array.isArray(item.tags))) {
        throw new Error('JSON 格式不正確')
      }

      jsonFile.value = file
      errorMessage.value = ''
    }
    catch (error) {
      errorMessage.value = `${error} 無效的 JSON 檔案格式`
      jsonFile.value = null
    }
  }

  function clearJson() {
    jsonFile.value = null
    errorMessage.value = ''
  }

  return {
    jsonFile,
    errorMessage,
    handleJsonUpload,
    clearJson,
  }
}
