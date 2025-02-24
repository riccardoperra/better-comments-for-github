import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  srcDir: './src',
  outDir: './dist',
  // vite: (env) => ({
  //   plugins: [
  //     statebuilder({
  //       autoKey: true,
  //       dev: env.mode === 'development',
  //     }) as any,
  //   ],
  // }),
  // only on linux/macOS
  runner: {
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
    startUrls: ['https://github.com/riccardoperra/better-writer-for-github'],
  },

  modules: ['@wxt-dev/module-solid'],
  manifest: {
    name: 'Better write for GitHub',
    permissions: ['storage'],
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
