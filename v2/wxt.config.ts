import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-solid'],
  manifest: {
    web_accessible_resources: [
      {
        resources: ['editor-content.js'],
        matches: ['*://github.com/*'],
      },
    ],
    content_scripts: [
      {
        css: ['assets/main.css', 'assets/editor-content.css'],
        matches: ['*://github.com/*'],
      },
    ],
  },
})
