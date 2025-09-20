import { mergeConfig } from 'vite'
import type { StorybookConfig } from 'storybook-solidjs-vite'

export default {
  framework: 'storybook-solidjs-vite',
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    {
      name: '@storybook/addon-vitest',
      options: {
        cli: false,
      },
    },
  ],
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  async viteFinal(config) {
    return mergeConfig(config, {
      define: {
        'process.env': {},
      },
    })
  },
  docs: {
    autodocs: true,
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
} as StorybookConfig
