import { defineConfig } from 'wxt'
import { statebuilder } from 'statebuilder/compiler'
import tsconfigPaths from 'vite-tsconfig-paths'

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  publicDir: 'src/public',
  modulesDir: 'src/modules',
  outDir: './dist',
  vite: (env) => ({
    plugins: [
      tsconfigPaths(),
      statebuilder({
        autoKey: true,
        dev: env.mode === 'development',
      }) as any,
    ],
  }),
  // only on linux/macOS
  webExt: {
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
    startUrls: ['https://github.com/riccardoperra/better-writer-for-github'],
  },

  zip: {
    name: 'better-comments-for-github',
  },

  modules: ['@wxt-dev/module-solid'],
  manifest: {
    name: 'Better comments for GitHub',
    description:
      'A chrome extension that will enhance the GitHub native comment editor with a more powerful wysiwyg block based editor',
    author: {
      email: 'riccardo.perra@icloud.com',
    },
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
