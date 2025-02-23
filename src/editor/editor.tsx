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

import { createContext, createEffect, onMount } from 'solid-js'
import { createEditor } from 'prosekit/core'
import { useDocChange } from 'prosekit/solid'
import { markdownFromUnistNode } from 'prosemirror-transformer-markdown/unified'
import {
  convertPmSchemaToUnist,
  convertUnistToProsemirror,
} from 'prosemirror-transformer-markdown/prosemirror'
import { unistMergeAdjacentList } from '@prosedoc/markdown-schema'
import { ProsekitEditor } from '../core/editor/editor'
import { defineExtension } from '../core/editor/extension'

import 'prosemirror-example-setup/style/style.css'
import { setEditorContent } from './utils/setContent'
import { forceGithubTextAreaSync } from './utils/forceGithubTextAreaSync'
import type { SuggestionData } from './utils/loadSuggestionData'

import './editor.css'
import { DebugNode } from './DebugNode'
import { unistNodeFromMarkdown } from './utils/unistNodeFromMarkdown'
import type { GitHubUploaderHandler } from '../core/editor/image/github-file-uploader'

export interface EditorProps {
  suggestions: SuggestionData
  textarea: HTMLTextAreaElement
  initialValue: string
  type: EditorType
}

export type EditorType = 'native' | 'react'

export const EditorRootContext = createContext<{
  data: SuggestionData
  textarea: HTMLTextAreaElement
  initialValue: string
  uploadHandler: GitHubUploaderHandler
  type: EditorType
}>()

export function Editor(props: EditorProps) {
  const extension = defineExtension()
  const editor = createEditor({
    extension,
  })

  createEffect(() => {
    props.textarea.addEventListener('input', (event) => {
      if (!(event as { fromEditor?: boolean }).fromEditor) {
        const value = props.textarea.value
        const unistNode = unistNodeFromMarkdown(value)
        const pmNode = convertUnistToProsemirror(unistNode, editor.schema)
        editor.setContent(pmNode)
      }
    })
  })

  onMount(() => {
    setEditorContent(props.initialValue, editor.view, {
      isFromTextarea: true,
      isInitialValue: true,
    })
  })

  useDocChange(
    (node) => {
      setTimeout(() => {
        const unistNode = convertPmSchemaToUnist(
          editor.state.doc,
          editor.schema,
          {
            postProcess: (node) => {
              unistMergeAdjacentList(node)
            },
          },
        )

        forceGithubTextAreaSync(
          props.textarea,
          markdownFromUnistNode(unistNode as any),
          { behavior: props.type },
        )
      }, 150)
    },
    { editor },
  )

  return (
    <div data-editor-wrapper={''}>
      <ProsekitEditor
        editor={editor}
        mentions={props.suggestions.mentions ?? []}
        issues={props.suggestions.references ?? []}
      />
      <DebugNode editor={editor} />
    </div>
  )
}
