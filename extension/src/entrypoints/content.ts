export default defineContentScript({
  matches: ['*://github.com/*'],
  runAt: 'document_start',
  async main() {
    await injectScript('/editor-content.js', {
      keepInDom: true,
    })
  },
})
