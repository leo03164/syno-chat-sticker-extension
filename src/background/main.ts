import { onMessage, sendMessage } from 'webext-bridge/background'
import type { Tabs } from 'webextension-polyfill'
import type { StickerInfo } from '~/types/sticker'
import { seriesList, serverUrl, stickerMap } from '~/logic/storage'

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

  // eslint-disable-next-line no-console
  console.log('previous tab', tab)
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

export async function fetchAllSeries() {
  const res = await fetch(`${serverUrl.value}/series`)
  const { data } = await res.json() as { data: { id: string }[] }
  seriesList.value = data

  fetchStickersBySeries(seriesList.value)
}

async function fetchStickersBySeries(seriesList: { id: string }[]) {
  console.log('fetchStickersBySeries')
  const promiseArr: Promise<Response>[] = []

  seriesList.forEach((series) => {
    const query = new URLSearchParams({
      series: series.id,
    })

    promiseArr.push(fetch(`${serverUrl.value}/stickers?${query.toString()}`))
  })

  const resList = await Promise.all(promiseArr)

  resList.forEach(async (res) => {
    const { data } = await res.json() as { data: StickerInfo[] }
    const stickerSeries = data[0].seriesId
    stickerMap.value.set(stickerSeries, data)
  })
}

// extension 啟動時先抓一次
fetchAllSeries()

// 設定每天執行一次
browser.alarms.create('fetch-stickers', { periodInMinutes: 1 })

browser.alarms.onAlarm.addListener((alarm) => {
  console.log('onAlarm')
  if (alarm.name === 'fetch-stickers') {
    fetchAllSeries()
  }
})
