import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  root: './playground-editor',
  plugins: [solidPlugin()],
})
