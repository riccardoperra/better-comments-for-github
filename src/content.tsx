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

      element = element.querySelector(
        '[class*="MarkdownEditor-module__container"]',
      )!
      const textarea = element.querySelector('textarea')

      if (textarea) {
        const root = document.createElement('div')
        root.id = 'github-better-comment'
        root.className = styles.injectedEditorContent
        element.appendChild(root)

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
