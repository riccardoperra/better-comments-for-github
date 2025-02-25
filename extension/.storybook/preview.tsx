import './styles.scss'
import { Preview } from 'storybook-solidjs'

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
  parameters: {
    decorators,
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
