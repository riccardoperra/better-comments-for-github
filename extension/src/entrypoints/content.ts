export default defineContentScript({
  matches: ['*://github.com/*'],
  runAt: 'document_start',
  async main() {
    // Firefox does not support injecting content scripts via injectScript yet
    // Manifest V3?
    if (import.meta.env.FIREFOX) {
      const script = document.createElement('script')
      script.src = browser.runtime.getURL('/editor-content.js')
      script.type = 'text/javascript'
      ;(document.head || document.documentElement).appendChild(script)
    } else {
      await injectScript('/editor-content.js', {
        keepInDom: true,
      })
    }
  },
})
