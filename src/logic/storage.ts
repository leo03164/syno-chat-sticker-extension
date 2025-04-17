import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'

export const storageDemo = useWebExtensionStorage('webext-demo', 'Storage Demo')

export const imgPathMapRecordUrl = useWebExtensionStorage('img-path-map-record-url', '')
export const mainImgServerUrl = useWebExtensionStorage('main-img-server-url', '')
export const thirdPartImgServerUrl = useWebExtensionStorage('third-part-img-server-url', '')
