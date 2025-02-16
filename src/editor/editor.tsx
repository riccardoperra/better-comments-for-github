import { createEffect, createSignal } from 'solid-js'
import { EditorView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { exampleSetup } from 'prosemirror-example-setup'
import {
  defaultMarkdownParser,
  defaultMarkdownSerializer,
  schema,
} from 'prosemirror-markdown'
import styles from './editor.module.css'
import { forceGithubTextAreaSync } from './utils/forceGithubTextAreaSync'

import 'prosemirror-example-setup/style/style.css'
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
      dispatchTransaction(tr) {
        const newState = view.state.apply(tr)
        view.updateState(newState)

        if (tr.getMeta('from-textarea')) {
          return
        }

        if (tr.docChanged) {
          props.textarea.value = defaultMarkdownSerializer.serialize(
            newState.doc,
          )
          forceGithubTextAreaSync(props.textarea)
        }
      },
    })

    let skipInput = false
    props.textarea.addEventListener('input', ({ target }) => {
      if (skipInput) {
        skipInput = false
        return
      }
      const tr = view.state.tr
      const content = props.textarea.value
      const doc = defaultMarkdownParser.parse(content)
      tr.replaceWith(0, tr.doc.content.size, doc)
      tr.setMeta('from-textarea', true)
      view.dispatch(tr)
    })

    setView(view)
  })

  return <div ref={setRef} />
}
