import { defineConfig } from '@solidjs/start/config'
import { statebuilder } from 'statebuilder/compiler'

export default defineConfig({
  vite: {
    plugins: [
      statebuilder({
        dev: false,
        autoKey: true,
      }),
    ],
    optimizeDeps: {
      exclude: ['statebuilder', '@codemirror/state', '@codemirror/view'],
    },
  },
})
