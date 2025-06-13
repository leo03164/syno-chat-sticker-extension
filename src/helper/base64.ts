export function transformArrayBufferToBase64(arrayBuffer: ArrayBuffer) {
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    return ''
  }

  const uint8Array = new Uint8Array(arrayBuffer)
  const base64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)))

  if (!base64) {
    return ''
  }

  return base64
}
