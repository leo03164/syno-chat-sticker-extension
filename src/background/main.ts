import { onMessage, sendMessage } from 'webext-bridge/background'
import type { Tabs } from 'webextension-polyfill'
import browser from 'webextension-polyfill'
import type { Endpoint } from 'webext-bridge'

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

onMessage('get-fle-xenv-details', async ({ sender }: { sender: Endpoint & { tabId: number } }): Promise<any | null> => {
  if (!sender.tabId) {
    return null
  }

  try {
    const results = await browser.scripting.executeScript({
      target: { tabId: sender.tabId },
      world: 'MAIN',
      func: () => {
        if (!window.fleXenv)
          return null

        const firstItem = window.fleXenv.fleXlist?.[0]
        if (!firstItem)
          return null

        const details = {
          fleXlistLength: window.fleXenv.fleXlist.length,
          firstItem: {
            hasScrollUpdate: !!firstItem.scrollUpdate,
            hasScrollContent: !!firstItem.fleXcroll?.scrollContent,
            hasGetContentHeight: !!firstItem.fleXdata?.getContentHeight,
            scrollUpdateType: typeof firstItem.scrollUpdate,
            scrollContentType: typeof firstItem.fleXcroll?.scrollContent,
            getContentHeightType: typeof firstItem.fleXdata?.getContentHeight,
          },
        }

        return details
      },
    })

    return results[0]?.result as any | null
  }
  catch (error) {
    console.error('Failed to get fleXenv details:', error)
    return null
  }
})

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

// 監聽來自 content script 的消息
onMessage('get-unsafe-window', async ({ sender }) => {
  try {
    // 等待頁面完全加載
    await browser.tabs.executeScript(sender.tabId!, {
      code: 'document.readyState === "complete"',
    })

    // 使用 browser.scripting.executeScript 在頁面上下文中執行代碼
    const results = await browser.scripting.executeScript({
      target: { tabId: sender.tabId! },
      world: 'MAIN',
      func: () => {
        // 在頁面上下文中執行
        // 等待 fleXenv 可用
        const waitForFleXenv = () => {
          return new Promise<any | null>((resolve) => {
            if (window.fleXenv) {
              resolve(window.fleXenv)
              return
            }

            const observer = new MutationObserver(() => {
              if (window.fleXenv) {
                observer.disconnect()
                resolve(window.fleXenv)
              }
            })

            observer.observe(document.body, {
              childList: true,
              subtree: true,
            })

            // 設置超時
            setTimeout(() => {
              observer.disconnect()
              resolve(null)
            }, 5000)
          })
        }

        return waitForFleXenv().then((fleXenv) => {
          if (!fleXenv)
            return { fleXenv: null }

          return {
            fleXenv: {
              fleXlist: fleXenv.fleXlist.map((item: any) => ({
                scrollUpdate: item.scrollUpdate.toString(),
                fleXcroll: {
                  scrollContent: item.fleXcroll.scrollContent.toString(),
                },
                fleXdata: {
                  getContentHeight: item.fleXdata.getContentHeight.toString(),
                },
              })),
            },
          }
        })
      },
    })

    // 將結果發送回 content script
    if (results[0]?.result) {
      const jsonData = JSON.parse(JSON.stringify(results[0].result))
      sendMessage('unsafe-window-ready', { data: jsonData }, { context: 'content-script', tabId: sender.tabId! })
    }
  }
  catch (error) {
    console.error('Failed to execute script:', error)
  }
})
