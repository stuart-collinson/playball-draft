const VIEWPORT_META_SELECTOR = 'meta[name="viewport"]'

const SCALABLE_VIEWPORT = "width=device-width, initial-scale=1"

const PINNED_VIEWPORT = `${SCALABLE_VIEWPORT}, maximum-scale=1, user-scalable=no`

const RESTORE_SCALING_DELAY_MS = 300

export const resetViewportZoom = (): void => {
  const meta = document.querySelector<HTMLMetaElement>(VIEWPORT_META_SELECTOR)
  if (!meta) return

  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()

  meta.setAttribute("content", PINNED_VIEWPORT)
  window.setTimeout(() => meta.setAttribute("content", SCALABLE_VIEWPORT), RESTORE_SCALING_DELAY_MS)
}
