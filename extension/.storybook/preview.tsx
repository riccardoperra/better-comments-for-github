import './styles.scss'
import type { Preview } from 'storybook-solidjs-vite'

export const decorators = [
  (Story: () => any) => {
    document.body.setAttribute('data-color-mode', 'dark')
    document.body.setAttribute('data-light-theme', 'light')
    document.body.setAttribute('data-dark-theme', 'dark')
    return (
      <div>
        <Story />
      </div>
    )
  },
]

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    // automatically create action args for all props that start with "on"
    actions: { argTypesRegex: '^on.*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      codePanel: true,
    },
  },
}

export default preview
