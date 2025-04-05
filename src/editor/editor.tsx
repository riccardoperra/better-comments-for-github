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

import type { Accessor } from 'solid-js'
import {
  Show,
  createContext,
  createEffect,
  onCleanup,
  useContext,
} from 'solid-js'
import { createEditor } from 'prosekit/core'
import { useDocChange } from 'prosekit/solid'
import { markdownFromUnistNode } from 'prosemirror-transformer-markdown/unified'
import {
  convertPmSchemaToUnist,
  convertUnistToProsemirror,
} from 'prosemirror-transformer-markdown/prosemirror'
import { ProsekitEditor } from '../core/editor/editor'
import { defineExtension } from '../core/editor/extension'

import 'prosemirror-example-setup/style/style.css'
import { ConfigStore } from '../config.store'
import { setEditorContent } from './utils/setContent'
import { forceGithubTextAreaSync } from './utils/forceGithubTextAreaSync'
import type { SuggestionData } from './utils/loadSuggestionData'

import './editor.css'
import { ExtensionEditorStore } from '../editor.store'
import { DebugNode } from './DebugNode'
import { unistNodeFromMarkdown } from './utils/unistNodeFromMarkdown'
import type { GitHubUploaderHandler } from '../core/editor/image/github-file-uploader'
import type { Root } from 'mdast'

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
  currentUsername: Accessor<string>
  repository: string
  owner: string
}>()

function sanitizeMarkdownValue(value: string) {
  return (
    value
      // Handle Alerts:  > [!NOTE]
      .replaceAll('> \\[!', '> [!')
      // Handle github links: https:\//github.com
      .replaceAll('https\\://github', 'https://github')
  )
}

export function Editor(props: EditorProps) {
  const context = useContext(EditorRootContext)!
  const configStore = ConfigStore.provide()
  const editorStore = ExtensionEditorStore.provide()

  const extension = defineExtension()
  const editor = createEditor({
    extension,
  })

  createEffect(() => {
    const abortController = new AbortController()
    onCleanup(() => abortController.abort('I hope a new reference of textarea'))

    const observer = new ResizeObserver(([{ target }], observer) => {
      if (!target.isConnected) {
        observer.disconnect()
        console.log('test')
      }
    })
    observer.observe(props.textarea)

    props.textarea.addEventListener(
      'input',
      (event) => {
        if (!(event as { fromEditor?: boolean }).fromEditor) {
          const value = props.textarea.value
          const unistNode = unistNodeFromMarkdown(value, {
            owner: context.owner,
            repository: context.repository,
          })
          const pmNode = convertUnistToProsemirror(unistNode, editor.schema)
          editor.setContent(pmNode)
        }
      },
      { signal: abortController.signal },
    )

    props.textarea.addEventListener(
      'change',
      (event) => {
        if ((event as any)['fromEditor']) return
        if (event.isTrusted) return false
        const value = props.textarea.value
        const unistNode = unistNodeFromMarkdown(value, {
          owner: context.owner,
          repository: context.repository,
        })
        const pmNode = convertUnistToProsemirror(unistNode, editor.schema)
        editor.setContent(pmNode)
      },
      { signal: abortController.signal },
    )
  })

  createEffect(() => {
    setEditorContent(props.initialValue, editor.view, {
      isFromTextarea: true,
      isInitialValue: true,
      owner: context.owner,
      repository: context.repository,
    })
    const markdown = toMarkdown()
    editorStore.set('markdown', markdown)
  })

  function toMarkdown() {
    const unistNode = convertPmSchemaToUnist(editor.state.doc, editor.schema, {
      postProcess: (node) => {
        // unistMergeAdjacentList(node)
        // remarkGitHubIssueReferenceSupport()(node)
      },
    })
    return sanitizeMarkdownValue(markdownFromUnistNode(unistNode as Root))
  }

  useDocChange(
    (node) => {
      setTimeout(() => {
        const markdown = toMarkdown()
        editorStore.set('markdown', markdown)
        forceGithubTextAreaSync(props.textarea, markdown, {
          behavior: props.type,
        })
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
      <Show when={configStore.get.showDebug}>
        <DebugNode editor={editor} />
      </Show>
    </div>
  )
}
