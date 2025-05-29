import { sendMessage } from 'webext-bridge/content-script'
import { stickerPathMap } from '~/logic/storage'

export function waitForElement(selector: string, callback: (el: HTMLElement) => void) {
  const interval = setInterval(() => {
    const el = document.querySelector(selector)
    if (el) {
      clearInterval(interval)
      callback(el as HTMLElement)
    }
  }, 1000)
}

function getStickerHtml(stickerKey: string, stickerUrl: string | undefined) {
  if (!stickerUrl || !stickerKey) {
    return ''
  }

  console.warn('[Syno Chat Sticker] 貼圖 URL:', stickerUrl)

  return `
        <div class="sticker sticker-post sticker-only">
          <div ext:qtip=":${stickerKey}:"
            class="sticker-img"
            style="
              width: 320px;
              height: 320px;
              background-image: url(${stickerUrl});
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
            ">
          </div>
        </div>
      `
}

async function scrollToBottom() {
  try {
    // 使用 background script 來執行滾動操作
    await sendMessage('execute-scroll', {
      action: 'scrollToBottom',
    })
  }
  catch (error) {
    console.error('[Syno Chat Sticker] 滾動失敗:', error)
  }
}

async function processMsgEls(node: HTMLElement) {
  const targetList = node.querySelectorAll('.msg-text>.text-wrapper>.markdown')

  if (!targetList.length) {
    return
  }

  let flag = false

  targetList.forEach((el) => {
    // eslint-disable-next-line unicorn/prefer-dom-node-text-content
    const stickerKey = (el as HTMLElement).innerText
    const stickerUrl = stickerPathMap.value.get(stickerKey)

    const stickerHtml = getStickerHtml(stickerKey, stickerUrl)
    if (stickerHtml) {
      el.innerHTML = stickerHtml
    }

    flag = true
  })

  if (flag) {
    await scrollToBottom()
  }
}

export function startObserving(targetNode: HTMLElement) {
  processMsgEls(document.body)

  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement))
            return
          processMsgEls(node)
        })
      }
    })
  })

  observer.observe(targetNode, {
    childList: true,
    subtree: true,
  })
}
