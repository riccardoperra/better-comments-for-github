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

import 'prosemirror-example-setup/style/style.css'

import './editor.css'

import { unistMergeAdjacentList } from '@prosedoc/markdown-schema'
import { ExtensionEditorStore } from '../editor.store'
import { ConfigStore } from '../config.store'
import { defineExtension } from '../core/editor/extension'
import { ProsekitEditor } from '../core/editor/editor'
import { remarkGitHubIssueReferenceSupport } from '../core/editor/issue-reference/remarkGitHubIssueReference'
import { unknownNodeHandler } from '../core/editor/unknown-node/unknown-node-handler'
import { setEditorContent } from './utils/setContent'
import { forceGithubTextAreaSync } from './utils/forceGithubTextAreaSync'
import { DebugNode } from './DebugNode'
import { unistNodeFromMarkdown } from './utils/unistNodeFromMarkdown'
import type { SuggestionData } from './utils/loadSuggestionData'
import type { GitHubUploaderHandler } from '../core/editor/image/github-file-uploader'
import type { Root } from 'mdast'

export interface EditorProps {
  suggestions: SuggestionData
  type: EditorType
}

export type EditorType = 'native' | 'react'
export type EditorRootContextProps = {
  data: Accessor<SuggestionData>
  textarea: HTMLTextAreaElement
  initialValue: string
  uploadHandler: GitHubUploaderHandler
  type: EditorType
  currentUsername: Accessor<string | null>
  repository: Accessor<string | null>
  owner: Accessor<string | null>
}

export const EditorRootContext = createContext<EditorRootContextProps>()

function sanitizeMarkdownValue(value: string) {
  return (
    value
      .replaceAll('\\', '')
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

    const observer = new ResizeObserver(([{ target }], observer) => {
      if (!target.isConnected) {
        observer.disconnect()
        console.log('test')
      }
    })
    observer.observe(context.textarea)

    onCleanup(() => {
      abortController.abort('I hope a new reference of textarea')
      observer.disconnect()
    })

    context.textarea.addEventListener(
      'input',
      (event) => {
        if (!(event as { fromEditor?: boolean }).fromEditor) {
          const value = context.textarea.value
          const unistNode = unistNodeFromMarkdown(value, {
            owner: context.owner() ?? '',
            repository: context.repository() ?? '',
          })
          const pmNode = convertUnistToProsemirror(
            unistNode,
            editor.schema,
            unknownNodeHandler(value),
          )
          editor.setContent(pmNode)
        }
      },
      { signal: abortController.signal },
    )

    context.textarea.addEventListener(
      'change',
      (event) => {
        if ((event as any)['fromEditor']) return
        if (event.isTrusted) return false
        const value = context.textarea.value
        const unistNode = unistNodeFromMarkdown(value, {
          owner: context.owner() ?? '',
          repository: context.repository() ?? '',
        })
        const pmNode = convertUnistToProsemirror(
          unistNode,
          editor.schema,
          unknownNodeHandler(value),
        )
        editor.setContent(pmNode)
      },
      { signal: abortController.signal },
    )
  })

  createEffect(() => {
    setEditorContent(context.initialValue, editor.view, {
      isFromTextarea: true,
      isInitialValue: true,
      owner: context.owner() ?? '',
      repository: context.repository() ?? '',
    })
    const markdown = toMarkdown()
    editorStore.set('markdown', markdown)
  })

  function toMarkdown() {
    const unistNode = convertPmSchemaToUnist(editor.state.doc, editor.schema, {
      postProcess: (node) => {
        unistMergeAdjacentList(node)
        remarkGitHubIssueReferenceSupport()(node)
      },
    })
    return sanitizeMarkdownValue(markdownFromUnistNode(unistNode as Root))
  }

  useDocChange(
    (node) => {
      setTimeout(() => {
        const markdown = toMarkdown()
        editorStore.set('markdown', markdown)
        forceGithubTextAreaSync(context.textarea, markdown, {
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
