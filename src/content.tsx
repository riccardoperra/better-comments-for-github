import './styles.css'
import { createRoot } from 'solid-js'
import { render } from 'solid-js/web'
import { queryComment } from './dom/queryComment'
import { loadSuggestionData } from './editor/utils/loadSuggestionData'
import { Editor } from './editor/editor'
import styles from './content.module.css'

setTimeout(() => {
  createRoot(() => {
    const [, onAdded] = queryComment()

    onAdded((element) => {
      const suggestionData = loadSuggestionData(element)

      const viewTabs = element.querySelector<HTMLElement>(
        '[class*="ViewSwitch-module"]',
      )

      const moduleContainer = element.querySelector(
        '[class*="MarkdownEditor-module__container"]',
      )!

      const inputWrapper = moduleContainer.firstElementChild
      const textarea = inputWrapper!.querySelector('textarea')
      const container = document.createElement('div')

      const switchButton = document.createElement('button')
      switchButton.classList.add('btn')
      switchButton.innerHTML = 'Back to default editor'

      container.appendChild(switchButton)

      moduleContainer.prepend(container)

      if (textarea) {
        const root = document.createElement('div')
        root.id = 'github-better-comment'
        root.className = styles.injectedEditorContent
        container.appendChild(root)

        render(
          () => (
            <Editor
              suggestions={suggestionData}
              textarea={textarea}
              initialValue={textarea.value}
            />
          ),
          root,
        )
      }
    })
  })
}, 1000)
