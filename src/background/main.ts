import { onMessage, sendMessage } from 'webext-bridge/background'
import type { Tabs } from 'webextension-polyfill'
import browser from 'webextension-polyfill'
import type { Endpoint } from 'webext-bridge'

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

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

// remove or turn this off if you don't use side panel
const USE_SIDE_PANEL = true

// to toggle the sidepanel with the action button in chromium:
if (USE_SIDE_PANEL) {
  // @ts-expect-error missing types
  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: unknown) => console.error(error))
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

let previousTabId = 0

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId
    return
  }

  let tab: Tabs.Tab

  try {
    tab = await browser.tabs.get(previousTabId)
    previousTabId = tabId
  }
  catch {
    return
  }

  sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId })
})

onMessage('get-current-tab', async () => {
  try {
    const tab = await browser.tabs.get(previousTabId)
    return {
      title: tab?.title,
    }
  }
  catch {
    return {
      title: undefined,
    }
  }
})

// 定義消息類型
interface ExecuteScrollMessage {
  action: 'scrollToBottom'
}

onMessage('execute-scroll', async (message: { sender: Endpoint & { tabId: number }, data: unknown }) => {
  const data = message.data as ExecuteScrollMessage
  if (!message.sender.tabId || !data || data.action !== 'scrollToBottom') {
    return { success: false }
  }

  try {
    const results = await browser.scripting.executeScript({
      target: { tabId: message.sender.tabId },
      world: 'MAIN',
      func: () => {
        if (!window.fleXenv?.fleXlist?.[0]) {
          console.warn('[Syno Chat Sticker] fleXenv 不可用')
          return false
        }

        try {
          const firstItem = window.fleXenv.fleXlist[0]
          firstItem.scrollUpdate()
          const height = firstItem.fleXdata.getContentHeight()
          firstItem.fleXcroll.scrollContent(0, height)
          return true
        }
        catch (error) {
          console.error('[Syno Chat Sticker] 滾動操作失敗:', error)
          return false
        }
      },
    })

    return { success: results[0]?.result ?? false }
  }
  catch (error) {
    console.error('Failed to execute scroll:', error)
    return { success: false }
  }
})

// 在 background script 中 fetch 圖片數據來繞過 CSP
onMessage('fetch-image-data', async (message: { sender: Endpoint & { tabId: number }, data: any }) => {
  const { imageUrl } = message.data

  if (!imageUrl || typeof imageUrl !== 'string') {
    console.error('[Syno Chat Sticker] Invalid imageUrl parameter:', imageUrl)
    return {
      success: false,
      error: 'Invalid imageUrl parameter',
    }
  }

  try {
    // 在 background script 中 fetch 圖片，沒有 CSP 限制
    const response = await fetch(imageUrl)

    if (!response.ok) {
      console.error('[Syno Chat Sticker] Fetch failed with status:', response.status, response.statusText)
      return {
        success: false,
        error: `Failed to fetch image: ${response.status} ${response.statusText}`,
      }
    }

    // 將圖片轉換為 arrayBuffer
    const arrayBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      console.error('[Syno Chat Sticker] Empty arrayBuffer received')
      return {
        success: false,
        error: 'Empty arrayBuffer received',
      }
    }

    // 將 arrayBuffer 轉換為 base64，以便傳輸到 content script
    const uint8Array = new Uint8Array(arrayBuffer)
    const base64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)))

    if (!base64) {
      console.error('[Syno Chat Sticker] Failed to convert arrayBuffer to base64')
      return {
        success: false,
        error: 'Failed to convert arrayBuffer to base64',
      }
    }

    // 使用 browser.scripting.executeScript 將 base64 轉換為 Object.createObjectURL 的 URL
    const results = await browser.scripting.executeScript({
      target: { tabId: message.sender.tabId },
      world: 'MAIN',
      func: (base64Data: string) => {
        const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: 'image/png' })
        return URL.createObjectURL(blob)
      },
      args: [base64],
    })

    const objectUrl = results[0]?.result

    return {
      success: true,
      result: {
        contentType,
        objectUrl,
      },
    }
  }
  catch (error: any) {
    console.error('[Syno Chat Sticker] Background script fetch 失敗:', error)
    console.error('[Syno Chat Sticker] Error stack:', error.stack)
    return {
      success: false,
      error: error.message,
      stack: error.stack,
    }
  }
})

onMessage('send-msg', async ({ sender }: { sender: Endpoint & { tabId: number } }): Promise<any | null> => {
  if (!sender.tabId) {
    return null
  }

  try {
    const results = await browser.scripting.executeScript({
      target: { tabId: sender.tabId },
      world: 'MAIN',
      func: () => {
        const sendButton = Array.from(document.querySelectorAll('span > button.x-btn-text')).find(btn => btn.textContent?.trim() === '傳送') as HTMLButtonElement | undefined
        if (sendButton) {
          sendButton.click()
          return true
        }
        return false
      },
    })

    return results[0]?.result as any | null
  }
  catch (error) {
    console.error('Failed to send message:', error)
    return null
  }
})
