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

// 如果往下滾動則滾動到最下方
export async function scrollToBottom() {
  const success = await sendMessage('execute-scroll', { action: 'scroll-to-bottom' })
  if (!success) {
    console.error('[Syno Chat Sticker] 滾動到最下方失敗')
  }
}

// 如果往上滾動，則更新狀態列
export async function updateBar() {
  const success = await sendMessage('execute-scroll', { action: 'update-bar' })
  if (!success) {
    console.error('[Syno Chat Sticker] 更新狀態列失敗')
  }
}

async function getImgFromCache(stickerKey: string, stickerUrl: string) {
  let stickerObjectUrl = stickerObjectUrlMap.value.get(stickerKey) || ''
  if (stickerObjectUrl)
    return stickerObjectUrl

  const responseObj = await sendMessage('fetch-image-data', {
    imageUrl: stickerUrl,
  })

  if (responseObj.success) {
    stickerObjectUrl = responseObj.result
    stickerObjectUrlMap.value.set(stickerKey, stickerObjectUrl)
  }
  else {
    console.error('[Syno Chat Sticker] 轉換 Object URL 失敗:', responseObj.error)
  }
  return stickerObjectUrl
}

async function processMsgEls(node: HTMLElement) {
  const targetList = node.querySelectorAll('.msg-text>.text-wrapper>.markdown')

  if (!targetList.length) {
    return
  }

  const promises = Array.from(targetList).map(async (el) => {
    // eslint-disable-next-line unicorn/prefer-dom-node-text-content
    const stickerKey = (el as HTMLElement).innerText
    const stickerUrl = stickerPathMap.value.get(stickerKey)
    if (!stickerUrl)
      return false

    const stickerObjectUrl = await getImgFromCache(stickerKey, stickerUrl)
    const stickerHtml = getStickerHtml(stickerKey, stickerObjectUrl)

    if (!stickerHtml)
      return false

    el.innerHTML = stickerHtml
    return true
  })

  // 等待所有貼圖處理完成
  const results = await Promise.all(promises)
  return results.some(result => result)
}

export function resetStickerCache() {
  stickerObjectUrlMap.value.clear()
}

export async function startObserving(targetNode: HTMLElement) {
  const isSuccess = await processMsgEls(document.body)
  if (isSuccess) {
    await scrollToBottom()
  }

  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach(async (mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(async (node) => {
          if (!(node instanceof HTMLElement))
            return
          const isSuccess = await processMsgEls(node)
          if (isSuccess) {
            await updateBar()
          }
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
  const isSuccess = await sendMessage('send-msg', {})
  if (!isSuccess) {
    console.error('[Syno Chat Sticker] 傳送訊息失敗:')
  }
}
