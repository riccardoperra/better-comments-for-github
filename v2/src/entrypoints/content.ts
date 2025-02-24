export default defineContentScript({
  matches: ['*://github.com/*'],
  runAt: 'document_idle',
  async main() {
    await injectScript('/editor-content.js', {
      keepInDom: true,
    })
  },
})
