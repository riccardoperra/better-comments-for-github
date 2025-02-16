import { createEffect, createSignal } from 'solid-js'
import { EditorView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { exampleSetup } from 'prosemirror-example-setup'
import { defaultMarkdownParser, schema } from 'prosemirror-markdown'
import styles from './editor.module.css'
import { forceGithubTextAreaSync } from './utils/forceGithubTextAreaSync'

import 'prosemirror-example-setup/style/style.css'
import { setEditorContent } from './utils/setContent'
import { proseMirrorToMarkdown } from './utils/markdownParser'
import type { SuggestionData } from './utils/loadSuggestionData'

export interface EditorProps {
  suggestions: SuggestionData
  textarea: HTMLTextAreaElement
  initialValue: string
}

export function Editor(props: EditorProps) {
  const [ref, setRef] = createSignal<HTMLDivElement | null>(null)
  const [view, setView] = createSignal<EditorView | null>(null)

  createEffect(() => {
    const $ref = ref()
    if (!$ref) {
      return
    }

    const view = new EditorView($ref, {
      attributes: {
        class: `${styles.editor} ProseMirror-example-setup-style`,
      },
      state: EditorState.create({
        plugins: exampleSetup({
          schema,
          menuBar: true,
          floatingMenu: true,
        }),
        doc: defaultMarkdownParser.parse(props.initialValue),
      }),
      handleDOMEvents: {
        keydown: (view, event) => {
          event.stopPropagation()
        },
      },
      dispatchTransaction(tr) {
        const newState = view.state.apply(tr)
        view.updateState(newState)

        if (tr.getMeta('from-textarea')) {
          return
        }

        if (tr.docChanged) {
          const content = proseMirrorToMarkdown(tr.doc, schema)
          async function fn() {
            const blob = new Blob([content], { type: 'text/html' })
            return await blob
              .text()
              .then((text) => text.replaceAll('&#x20;', ' '))
          }
          fn().then((sanitizedContent) => {
            console.log(sanitizedContent)
            props.textarea.value = sanitizedContent
            forceGithubTextAreaSync(props.textarea)
          })
        }
      },
    })

    setEditorContent(props.initialValue, view, {
      isFromTextarea: true,
      isInitialValue: true,
    })

    props.textarea.addEventListener('input', ({ target }) => {
      setEditorContent(props.textarea.value, view, {
        isFromTextarea: true,
      })
    })

    setView(view)
  })

  return <div ref={setRef} />
}
