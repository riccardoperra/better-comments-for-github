/*
 * Copyright 2025 Riccardo Perra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createEffect, createSignal } from 'solid-js'
import { EditorView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { Schema } from 'prosemirror-model'
import { marks, nodes } from 'prosemirror-schema-basic'
import { exampleSetup } from 'prosemirror-example-setup'
import { createEditor } from 'prosekit/core'
import { useDocChange } from 'prosekit/solid'
import {
  markdownFromUnistNode,
  unistNodeFromMarkdown,
} from 'prosemirror-transformer-markdown/unified'
import {
  convertPmSchemaToUnist,
  convertUnistToProsemirror,
} from 'prosemirror-transformer-markdown/prosemirror'
import { ProsekitEditor } from '../core/editor/editor'
import { defineExtension } from '../core/editor/extension'
import styles from './editor.module.css'

import 'prosemirror-example-setup/style/style.css'
import { setEditorContent } from './utils/setContent'
import { proseMirrorToMarkdown } from './utils/markdownParser'
import { forceGithubTextAreaSync } from './utils/forceGithubTextAreaSync'
import type { SuggestionData } from './utils/loadSuggestionData'

import 'prosekit/basic/style.css'
import 'prosekit/basic/typography.css'

export interface EditorProps {
  suggestions: SuggestionData
  textarea: HTMLTextAreaElement
  initialValue: string
}

export function Editor(props: EditorProps) {
  const [ref, setRef] = createSignal<HTMLDivElement | null>(null)
  const [view, setView] = createSignal<EditorView | null>(null)

  const extension = defineExtension()
  const editor = createEditor({
    extension,
  })

  createEffect(() => {
    props.textarea.addEventListener('input', ({ target }) => {
      const value = props.textarea.value

      const unistNode = unistNodeFromMarkdown(value)
      console.log(unistNode)
      const pmNode = convertUnistToProsemirror(unistNode, editor.schema)

      editor.setContent(pmNode)
    })
  })

  createEffect(() => {
    const $ref = ref()
    if (!$ref) {
      return
    }

    const updatedSchema = new Schema({
      marks: marks,
      nodes: {
        ...nodes,
        // image: {
        //   name: 'image',
        //   attrs: {
        //     src: { default: null },
        //     width: { default: null },
        //     height: { default: null },
        //   },
        //   group: 'block',
        //   defining: true,
        //   draggable: true,
        //   parseDOM: [
        //     {
        //       tag: 'img[src]',
        //       getAttrs: (element) => {
        //         if (typeof element === 'string') {
        //           return { src: null }
        //         }
        //
        //         const src = element.getAttribute('src') || null
        //
        //         let width: number | null = null
        //         let height: number | null = null
        //
        //         const rect = element.getBoundingClientRect()
        //         if (rect.width > 0 && rect.height > 0) {
        //           width = rect.width
        //           height = rect.height
        //         } else if (
        //           element instanceof HTMLImageElement &&
        //           element.naturalWidth > 0 &&
        //           element.naturalHeight > 0
        //         ) {
        //           width = element.naturalWidth
        //           height = element.naturalHeight
        //         }
        //         return { src, width, height }
        //       },
        //     },
        //   ],
        //   toDOM(node) {
        //     const attrs = node.attrs
        //     return ['img', attrs]
        //   },
        // },
        blockquote_callout: {
          group: 'block',
          content: 'block+',
          parseDOM: [{ tag: 'blockquote-callout' }],
          toDOM(node) {
            return ['blockquote-callout', { class: 'test' }, 0]
          },
        },
      },
    })

    const view = new EditorView($ref, {
      attributes: {
        class: `${styles.editor} ProseMirror-example-setup-style`,
      },
      state: EditorState.create({
        schema: updatedSchema,
        plugins: exampleSetup({
          schema: updatedSchema,
          menuBar: true,
          floatingMenu: true,
        }),
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
          const content = proseMirrorToMarkdown(tr.doc, updatedSchema)

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

    setView(view)
  })

  useDocChange(
    (node) => {
      const unistNode = convertPmSchemaToUnist(node, editor.schema)
      const markdown = markdownFromUnistNode(unistNode as any)
      props.textarea.value = markdown
      forceGithubTextAreaSync(props.textarea)
    },
    { editor },
  )

  return (
    <div>
      <ProsekitEditor editor={editor} />
    </div>
  )
}
