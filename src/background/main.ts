import { onMessage, sendMessage } from 'webext-bridge/background'
import type { Tabs } from 'webextension-polyfill'
import browser from 'webextension-polyfill'
import type { Endpoint } from 'webext-bridge'
import type { Result } from '../types/event'

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

onMessage('execute-scroll', async ({ sender }) => {
  if (!sender.tabId) {
    return { success: false }
  }

  try {
    const results = await browser.scripting.executeScript({
      target: { tabId: sender.tabId },
      world: 'MAIN',
      func: () => {
        if (!window.fleXenv?.fleXlist?.[0]) {
          return false
        }

        const firstItem = window.fleXenv.fleXlist[0]
        firstItem.scrollUpdate()
        const height = firstItem.fleXdata.getContentHeight()
        firstItem.fleXcroll.scrollContent(0, height)
        return true
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
onMessage('fetch-image-data', async ({ sender, data }): Promise<Result<string>> => {
  const { imageUrl } = data as { imageUrl: string }

  if (!imageUrl || typeof imageUrl !== 'string') {
    return {
      success: false,
      error: 'Invalid imageUrl parameter',
    }
  }

  try {
    // 在 background script 中 fetch 圖片，沒有 CSP 限制
    const response = await fetch(imageUrl)

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch image: ${response.status} ${response.statusText}`,
      }
    }

    // TODO: 感覺轉換 arrayBuffer 可以抽離出來
    // 將圖片轉換為 arrayBuffer
    const arrayBuffer = await response.arrayBuffer()

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return {
        success: false,
        error: 'transform arrayBuffer to base64 failed',
      }
    }

    // 將 arrayBuffer 轉換為 base64，以便傳輸到 content script
    const uint8Array = new Uint8Array(arrayBuffer)
    const base64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)))

    if (!base64) {
      return {
        success: false,
        error: 'transform arrayBuffer to base64 failed',
      }
    }

    // 使用 browser.scripting.executeScript 將 base64 轉換為 Object.createObjectURL 的 URL
    const results = await browser.scripting.executeScript({
      target: { tabId: sender.tabId },
      world: 'MAIN',
      func: (base64Data: string) => {
        const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: 'image/png' })
        return URL.createObjectURL(blob)
      },
      args: [base64],
    })

    const objectUrl = results[0]?.result as string

    return {
      success: true,
      result: objectUrl,
    }
  }
  catch (error: any) {
    return {
      success: false,
      error: error.message as string,
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
        const submitBtnIndex = 5
        const sendButton = Array.from(document.querySelectorAll('.msg-inputarea-buttons > span > button.x-btn-text'))[submitBtnIndex] as HTMLButtonElement | undefined
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
