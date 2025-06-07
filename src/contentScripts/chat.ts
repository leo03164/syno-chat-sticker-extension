import { sendMessage } from 'webext-bridge/content-script'
import { stickerObjectUrlMap, stickerPathMap } from '~/logic/storage'

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
    await sendMessage('execute-scroll', {})
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

  const promises = Array.from(targetList).map(async (el) => {
    // eslint-disable-next-line unicorn/prefer-dom-node-text-content
    const stickerKey = (el as HTMLElement).innerText
    const stickerUrl = stickerPathMap.value.get(stickerKey)
    let stickerObjectUrl = ''

    if (stickerUrl) {
      try {
        stickerObjectUrl = stickerObjectUrlMap.value.get(stickerKey) || ''

        if (!stickerObjectUrl) {
          const responseObj: any = await sendMessage('fetch-image-data', {
            imageUrl: stickerUrl,
          })

          if (responseObj) {
            stickerObjectUrl = responseObj.result.objectUrl
            stickerObjectUrlMap.value.set(stickerKey, stickerObjectUrl)
          }
        }
      }
      catch (error) {
        console.error('[Syno Chat Sticker] 轉換 Object URL 失敗:', error)
      }
    }

    const stickerHtml = getStickerHtml(stickerKey, stickerObjectUrl)
    if (stickerHtml) {
      el.innerHTML = stickerHtml
      return true
    }
    return false
  })

  // 等待所有貼圖處理完成
  const results = await Promise.all(promises)
  flag = results.some(result => result)

  if (flag) {
    await scrollToBottom()
  }
}

export function resetStickerCache() {
  stickerObjectUrlMap.value.clear()
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

export async function sendMsg() {
  try {
    await sendMessage('send-msg', {})
  }
  catch (error) {
    console.error('[Syno Chat Sticker] 傳送訊息失敗:', error)
  }
}
