import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' with { type: 'json' }
import webExtension, { readJsonFile } from 'vite-plugin-web-extension'

// Generate manifest with package info
const generateManifest = () => {
  const manifestPath = 'manifest.json'

  const manifest = readJsonFile(manifestPath)
  const pkg = readJsonFile('package.json')

  return {
    name: pkg.name,
    description: pkg.description,
    ...manifest,
    version: pkg.version,
  }
}

export default defineConfig({
  plugins: [solidPlugin(), crx({ manifest })],
  // build: {
  //   minify: 'esbuild' as const,
  // },
  // esbuild: {
  //   keepNames: true,
  //   minifyIdentifiers: false,
  // },
  build: {
    minify: false,
    target: 'esnext',
    rollupOptions: {
      plugins: [
        {
          name: 'crx:dynamic-imports-polyfill',
          generateBundle(_, bundle) {
            const polyfill = `
                (function () {
                  const chrome = window.chrome || {};
                  chrome.runtime = chrome.runtime || {};
                  chrome.runtime.getURL = chrome.runtime.getURL || function(path) { return path.replace("assets/", "./"); };
                })();
            `
            for (const chunk of Object.values(bundle)) {
              if (
                chunk.name?.endsWith('-loader.js') &&
                'source' in chunk &&
                typeof chunk.source === 'string' &&
                chunk.source.includes('chrome.runtime.getURL') &&
                !chunk.source.includes(polyfill)
              ) {
                chunk.source = `
                  ${polyfill}
                  ${chunk.source}
                `
              }
            }
          },
        },
      ],
    },
  },
})
