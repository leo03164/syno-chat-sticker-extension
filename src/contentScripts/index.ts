import { onMessage, sendMessage } from 'webext-bridge/content-script'
import { createApp } from 'vue'
import App from './views/App.vue'
import { startObserving, waitForElement } from './chat'
import { setupApp } from '~/logic/common-setup'

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
      const checkFleXenv = async () => {
        try {
          // 嘗試獲取 fleXenv 的詳細信息
          const details = await sendMessage<any>('get-fle-xenv-details', {})
          console.warn('[vitesse-webext] fleXenv 詳細信息:', details)

          resolve()
        }
        catch (error) {
          console.error('[vitesse-webext] 檢查 fleXenv 時出錯:', error)
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
    }
    catch (error) {
      console.error('[vitesse-webext] 初始化失敗:', error)
    }
  }

  // 等待一小段時間再開始初始化
  setTimeout(init, 1000)
})()
