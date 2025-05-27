export default defineContentScript({
  matches: ['*://github.com/*'],
  runAt: 'document_start',
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

    // Show UI to user
    ui.mount()

    await injectScript('/editor-content.js', {
      keepInDom: true,
    })
  },
})
