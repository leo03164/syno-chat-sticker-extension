// 擴展 Window 接口
import { onMessage, sendMessage } from 'webext-bridge/content-script'

declare global {
  interface Window {
    fleXenv?: {
      fleXlist: Array<{
        scrollUpdate: () => void
        fleXcroll: {
          scrollContent: (x: number, y: number) => void
        }
        fleXdata: {
          getContentHeight: () => number
        }
      }>
    }
  }
}

// 定義消息類型，確保符合 JsonValue 約束
type UnsafeWindowData = {
  fleXenv: {
    fleXlist: Array<{
      scrollUpdate: string
      fleXcroll: {
        scrollContent: string
      }
      fleXdata: {
        getContentHeight: string
      }
    }>
  } | null
} & { [key: string]: unknown }

// 創建一個類似 Tampermonkey 的 unsafeWindow 實現
async function getUnsafeWindow(retries = 3): Promise<UnsafeWindowData> {
  return new Promise((resolve, _reject) => {
    let retryCount = 0

    const tryGetWindow = () => {
      // 監聽來自 background script 的消息
      onMessage<{ data: UnsafeWindowData }>('unsafe-window-ready', ({ data }) => {
        if (data?.data) {
          if (data.data.fleXenv === null && retryCount < retries) {
            retryCount++
            console.warn(`[Syno Chat Sticker] fleXenv 尚未準備好，重試 ${retryCount}/${retries}`)
            setTimeout(() => {
              sendMessage('get-unsafe-window', {})
            }, 1000)
            return
          }
          resolve(data.data)
        }
      })

      // 請求 background script 注入腳本
      sendMessage('get-unsafe-window', {})
    }

    tryGetWindow()
  })
}

// 創建一個隱藏的 div 元素來注入我們的腳本
async function injectScript() {
  try {
    // 等待 unsafeWindow 準備就緒
    const unsafeWindow = await getUnsafeWindow()
    console.warn('[Syno Chat Sticker] unsafeWindow 準備就緒:', unsafeWindow)

    if (!unsafeWindow.fleXenv) {
      console.error('[Syno Chat Sticker] fleXenv 不可用')
      return
    }

    const fleXlist = unsafeWindow.fleXenv.fleXlist
    if (!fleXlist || fleXlist.length === 0) {
      console.error('[Syno Chat Sticker] fleXlist 為空')
      return
    }

    // 輸出 fleXenv 的詳細信息
    console.warn('[Syno Chat Sticker] fleXenv 詳細信息:', {
      fleXlistLength: fleXlist.length,
      firstItem: {
        hasScrollUpdate: !!fleXlist[0].scrollUpdate,
        hasScrollContent: !!fleXlist[0].fleXcroll?.scrollContent,
        hasGetContentHeight: !!fleXlist[0].fleXdata?.getContentHeight,
      },
    })

    // 創建一個隱藏的 div 元素
    const div = document.createElement('div')
    div.style.display = 'none'
    div.id = 'syno-chat-sticker-extension-script-container'
    document.body.appendChild(div)

    // 使用 setInterval 來模擬每秒執行
    setInterval(() => {
      try {
        const firstItem = fleXlist[0]
        if (!firstItem) {
          console.warn('[Syno Chat Sticker] fleXlist 的第一個項目不存在')
          return
        }

        // 輸出當前狀態
        console.warn('[Syno Chat Sticker] 當前狀態:', {
          timestamp: new Date().toLocaleTimeString(),
          fleXlistLength: fleXlist.length,
          firstItemExists: !!firstItem,
        })

        // 注意：這裡的函數已經被序列化為字符串，需要重新評估
        // eslint-disable-next-line no-new-func
        const scrollUpdate = new Function(`return ${firstItem.scrollUpdate}`)()
        // eslint-disable-next-line no-new-func
        const scrollContent = new Function(`return ${firstItem.fleXcroll.scrollContent}`)()
        // eslint-disable-next-line no-new-func
        const getContentHeight = new Function(`return ${firstItem.fleXdata.getContentHeight}`)()

        // 輸出函數評估結果
        console.warn('[Syno Chat Sticker] 函數評估結果:', {
          scrollUpdateType: typeof scrollUpdate,
          scrollContentType: typeof scrollContent,
          getContentHeightType: typeof getContentHeight,
        })

        // 使用重新評估後的函數
        try {
          scrollUpdate()
          console.warn('[Syno Chat Sticker] scrollUpdate 執行成功')
        }
        catch (error) {
          console.error('[Syno Chat Sticker] scrollUpdate 執行失敗:', error)
        }

        try {
          const height = getContentHeight()
          console.warn('[Syno Chat Sticker] getContentHeight 返回:', height)
          scrollContent(0, height)
          console.warn('[Syno Chat Sticker] scrollContent 執行成功')
        }
        catch (error) {
          console.error('[Syno Chat Sticker] scrollContent/getContentHeight 執行失敗:', error)
        }
      }
      catch (error) {
        console.error('[Syno Chat Sticker] 訪問 unsafeWindow 時出錯:', error)
      }
    }, 3000)
  }
  catch (error) {
    console.error('[Syno Chat Sticker] 初始化失敗:', error)
  }
}

// 執行注入
injectScript()

// 清理函數
export function cleanup() {
  const container = document.getElementById('syno-chat-sticker-extension-script-container')
  if (container && container.parentNode) {
    container.parentNode.removeChild(container)
  }
}
