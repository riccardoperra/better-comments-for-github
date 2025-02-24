export default defineContentScript({
  matches: ['*://github.com/*'],
  runAt: 'document_idle',
  async main() {
    console.log('Injecting script...')
    await injectScript('/editor-content.js', {
      keepInDom: true,
    })
    console.log('Done!')
  },
})
