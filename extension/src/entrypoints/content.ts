export default defineContentScript({
  matches: ['*://github.com/*'],
  runAt: 'document_idle',
  async main(ctx) {
    // Define the UI
    const ui = createIframeUi(ctx, {
      page: '/iframe-worker.html',
      position: 'overlay',
      anchor: 'body',
      onMount: (wrapper, iframe) => {
        // Add styles to the iframe like width
        iframe.id = 'codemirror-ata'
        iframe.style.display = 'none'
        iframe.addEventListener('load', () => {
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage(
              browser.runtime.getURL('/worker.js'),
              '*',
            )
          }
        })
      },
    })
    ui.mount()

    // Firefox does not support injecting content scripts via injectScript yet
    // Manifest V3?
    if (import.meta.env.FIREFOX) {
      const script = document.createElement('script')
      script.src = browser.runtime.getURL('/editor-content.js')
      script.type = 'text/javascript'
      ;(document.head || document.documentElement).appendChild(script)
    } else {
      await injectScript('/editor-content.js', {
        keepInDom: false,
      })
    }
  },
})
