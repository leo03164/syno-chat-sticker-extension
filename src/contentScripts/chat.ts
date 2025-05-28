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

  console.log('🚀 ~ getStickerHtml ~ stickerUrl:', stickerUrl)

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
    scrollToBottom()
  }
}

function scrollToBottom() {
  window.fleXenv.fleXlist[0].scrollUpdate()
  window.fleXenv.fleXlist[0].fleXcroll.scrollContent(0, window.fleXenv.fleXlist[0].fleXdata.getContentHeight())
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
