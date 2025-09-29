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
import { markdownFromUnistNode } from 'prosemirror-transformer-markdown/unified'
import {
  convertPmSchemaToUnist,
  convertUnistToProsemirror,
} from 'prosemirror-transformer-markdown/prosemirror'

import './editor.css'

import { unistMergeAdjacentList } from '@prosedoc/markdown-schema'
import { useDocChange, useStateUpdate } from 'prosekit/solid'
import { unknownNodeHandler } from '../core/custom/unknown-node/unknown-node-handler'
import { remarkGitHubIssueReferenceSupport } from '../core/custom/issue-reference/remarkGitHubIssueReference'
import { ProsekitEditor } from '../core/editor/editor'
import { defineExtension } from '../core/editor/extension'
import { ConfigStore } from '../config.store'
import { ExtensionEditorStore } from '../editor.store'
import { log } from './utils/logger'
import { patchJsNativeTextareaValue } from './utils/jsNativeTextareaValuePatch'
import { unistNodeFromMarkdown } from './utils/unistNodeFromMarkdown'
import { DebugNode } from './DebugNode'
import { setEditorContent } from './utils/setContent'
import { forceGithubTextAreaSync } from './utils/forceGithubTextAreaSync'
import type { Root } from 'mdast'
import type { GitHubUploaderHandler } from '../core/custom/image/github-file-uploader'
import type { SuggestionData } from './utils/loadSuggestionData'
import type { Schema } from 'prosemirror-model'

export interface EditorProps {
  suggestions: SuggestionData
  type: EditorType
}

export type EditorType = 'native' | 'react'
export type EditorRootContextProps = {
  id: string
  suggestionData: Accessor<SuggestionData>
  textarea: Accessor<HTMLTextAreaElement>
  initialValue: string
  uploadHandler: GitHubUploaderHandler
  type: EditorType
  currentUsername: Accessor<string | null>
  repository: Accessor<string | null>
  owner: Accessor<string | null>
  hovercardSubjectTag: Accessor<string | null>
}

export const EditorRootContext = createContext<EditorRootContextProps>()

function sanitizeMarkdownValue(value: string) {
  return (
    value
      // Remove all backslashes -> safe?
      // .replaceAll('\\', '')
      // Handle Alerts:  > [!NOTE]
      .replaceAll('> \\[!', '> [!')
      // Handle github links: https:\//github.com
      .replaceAll('https\\://github', 'https://github')
      // Handle \ in issue references when plain text
      .replaceAll('\\#', '#')
  )
}

function textAreaValueToPmNode(
  value: string,
  context: EditorRootContextProps,
  schema: Schema,
  suggestion: () => SuggestionData,
) {
  if (value === '') {
    return schema.nodes.doc.createAndFill()!
  }

  const unistNode = unistNodeFromMarkdown(value, {
    owner: context.owner() ?? '',
    repository: context.repository() ?? '',
    references: () => suggestion().references,
  })
  return convertUnistToProsemirror(unistNode, schema, unknownNodeHandler(value))
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
    const textarea = context.textarea()

    function focusEditorWhileTextareaIsFocused() {
      if (document.activeElement === textarea) editor.focus()
    }
    focusEditorWhileTextareaIsFocused()
    const observer = new MutationObserver(([entry]) => {
      focusEditorWhileTextareaIsFocused()
    })
    observer.observe(textarea, {
      attributes: true,
      attributeFilter: ['data-focus-visible-added'],
    })
    onCleanup(() => observer.disconnect())

    if (props.type === 'native') {
      const unpatchSetValueEvent = patchJsNativeTextareaValue(textarea)
      textarea.addEventListener(
        'gh-better-comments-textarea-set-value',
        (e) => {
          const pmNode = textAreaValueToPmNode(
            e.detail,
            context,
            editor.schema,
            () => props.suggestions,
          )
          editor.setContent(pmNode)
        },
        { signal: abortController.signal },
      )

      // This is needed for the native textarea in discussion. I don't know why
      // the change event is not always triggered consistently.
      const associatedForm = textarea.closest('form')
      if (associatedForm) {
        associatedForm.addEventListener('reset', (event) => {
          log('Reset form event', { event }, { id: context.id })
          editor.setContent('')
        })
      }

      onCleanup(() => {
        unpatchSetValueEvent()
      })
    }

    onCleanup(() => {
      log('Destroy editor', { id: context.id })
      abortController.abort('I hope a new reference of textarea')
      editor.setContent('')
    })

    textarea.addEventListener(
      'input',
      (event) => {
        if (!(event as { fromEditor?: boolean }).fromEditor) {
          const pmNode = textAreaValueToPmNode(
            textarea.value,
            context,
            editor.schema,
            () => props.suggestions,
          )
          editor.setContent(pmNode)
        }
      },
      { signal: abortController.signal },
    )

    // Old text area change event (e.g. PR)
    textarea.addEventListener(
      'change',
      (event) => {
        if ((event as any)['fromEditor']) return
        if (event.isTrusted) return false
        const pmNode = textAreaValueToPmNode(
          textarea.value,
          context,
          editor.schema,
          () => props.suggestions,
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
      suggestionData: () => props.suggestions,
    })
    const markdown = toMarkdown()
    editorStore.set('markdown', markdown)
  })

  function toMarkdown() {
    const unistNode = convertPmSchemaToUnist(editor.state.doc, editor.schema, {
      postProcess: (node) => {
        unistMergeAdjacentList(node)
        remarkGitHubIssueReferenceSupport(() => props.suggestions.references)(
          node,
        )
      },
    })

    return sanitizeMarkdownValue(markdownFromUnistNode(unistNode as Root))
  }

  useStateUpdate(
    (state) => {
      queueMicrotask(() => {
        editorStore.emitter.emit('editor::state-update', state)
      })
    },
    { editor },
  )

  useDocChange(
    (node) => {
      setTimeout(() => {
        const markdown = toMarkdown()
        editorStore.set('markdown', markdown)
        forceGithubTextAreaSync(context.textarea(), markdown, {
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
        emojis={props.suggestions.emojis}
        mentions={props.suggestions.mentions ?? []}
        issues={props.suggestions.references ?? []}
      />
      <Show when={configStore.get.showDebug}>
        <DebugNode editor={editor} />
      </Show>
    </div>
  )
}
