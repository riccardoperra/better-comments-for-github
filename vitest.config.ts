import { defineConfig } from 'vitest/config'

import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  test: {
    environment: 'jsdom',
    server: {
      deps: {
        inline: [
          /@aria-ui/,
          '@preact/signals-core',
          /prosekit/,
          /@prosemirror-adapter/,
          /solid-js/,
        ],
      },
    },
  },
  optimizeDeps: {
    exclude: ['solid-js'],
  },
  plugins: [solidPlugin()],
})
