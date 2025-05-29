import { onMessage, sendMessage } from 'webext-bridge/content-script'
import type { JsonObject } from 'webext-bridge'
import { createApp } from 'vue'
import App from './views/App.vue'
import { startObserving, waitForElement } from './chat'
import { setupApp } from '~/logic/common-setup'
import './test-inject-script' // 引入測試腳本

type CheckFleXenvResponse = JsonObject & {
  available: boolean
}

type GetFleXenvDetailsResponse = JsonObject & {
  fleXlistLength: number
  firstItem: JsonObject & {
    hasScrollUpdate: boolean
    hasScrollContent: boolean
    hasGetContentHeight: boolean
    scrollUpdateType: string
    scrollContentType: string
    getContentHeightType: string
  }
}

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.warn('[vitesse-webext] Hello world from content script')

  // 等待頁面完全加載
  const waitForPageLoad = () => {
    return new Promise<void>((resolve) => {
      if (document.readyState === 'complete') {
        resolve()
        return
      }

      window.addEventListener('load', () => {
        resolve()
      })
    })
  }

  // 等待 fleXenv 可用
  const waitForFleXenv = async () => {
    return new Promise<void>((resolve) => {
      let retryCount = 0
      const maxRetries = 20 // 增加重試次數
      const retryInterval = 1000

      const checkFleXenv = async () => {
        try {
          // 使用 webext-bridge 來檢查 fleXenv
          const result = await sendMessage<CheckFleXenvResponse>('check-fle-xenv', {})
          if (result?.available) {
            console.warn('[vitesse-webext] fleXenv 可用，嘗試獲取詳細信息')

            // 嘗試獲取 fleXenv 的詳細信息
            const details = await sendMessage<GetFleXenvDetailsResponse>('get-fle-xenv-details', {})
            console.warn('[vitesse-webext] fleXenv 詳細信息:', details)

            resolve()
            return
          }

          if (retryCount < maxRetries) {
            retryCount++
            console.warn(`[vitesse-webext] fleXenv 尚未準備好，重試 ${retryCount}/${maxRetries}`)
            setTimeout(checkFleXenv, retryInterval)
          }
          else {
            console.warn('[vitesse-webext] fleXenv 等待超時')
            resolve()
          }
        }
        catch (error) {
          console.error('[vitesse-webext] 檢查 fleXenv 時出錯:', error)
          if (retryCount < maxRetries) {
            retryCount++
            console.warn(`[vitesse-webext] 重試 ${retryCount}/${maxRetries}`)
            setTimeout(checkFleXenv, retryInterval)
          }
          else {
            console.warn('[vitesse-webext] 重試次數已達上限')
            resolve()
          }
        }
      }

      // 等待一小段時間再開始檢查，確保 background script 已經準備好
      setTimeout(checkFleXenv, 1000)
    })
  }

  // 初始化
  const init = async () => {
    try {
      await waitForPageLoad()
      console.warn('[vitesse-webext] 頁面加載完成')

      // 等待一小段時間再開始初始化
      await new Promise(resolve => setTimeout(resolve, 1000))
      await waitForFleXenv()

      // communication example: send previous tab title from background page
      onMessage('tab-prev', ({ data }) => {
        console.warn(`[vitesse-webext] Navigate from page "${data.title}"`)
      })

      // mount component to context window
      const container = document.createElement('div')
      container.id = __NAME__
      const root = document.createElement('div')
      const styleEl = document.createElement('link')
      const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container
      styleEl.setAttribute('rel', 'stylesheet')
      styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
      shadowDOM.appendChild(styleEl)
      shadowDOM.appendChild(root)
      document.body.appendChild(container)
      const app = createApp(App)
      setupApp(app)
      app.mount(root)

      // 等待 DOM 元素準備好
      await waitForElement('body', startObserving)

      // 引入測試腳本
      await import('./test-inject-script')
    }
    catch (error) {
      console.error('[vitesse-webext] 初始化失敗:', error)
    }
  }

  // 等待一小段時間再開始初始化
  setTimeout(init, 1000)
})()
