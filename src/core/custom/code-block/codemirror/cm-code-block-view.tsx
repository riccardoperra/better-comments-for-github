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

import { Show, createMemo, createSignal, onCleanup, onMount } from 'solid-js'
import { useNodeViewContext } from '@prosemirror-adapter/solid'
import { shikiBundledLanguagesInfo } from 'prosekit/extensions/code-block'

import { NodeViewWrapper } from '../../../editor/primitives/node-view'
import { ExtensionEditorStore } from '../../../../editor.store'
import styles from '../code-block-view.module.css'
import {
  CodeBlockClipboard,
  CodeBlockLanguageSelector,
} from '../CodeBlockToolbar'

import { CodemirrorEditor } from './codemirror-editor'
import type { CodeBlockAttrs } from 'prosekit/extensions/code-block'
import type { NodeViewContextProps } from '@prosemirror-adapter/solid'

export default function CmCodeBlockView(props: NodeViewContextProps) {
  const context = useNodeViewContext()
  const editorStore = ExtensionEditorStore.provide()
  const attrLanguage = createMemo(() => context().node.attrs.language)

  const [isActive, setIsActive] = createSignal<boolean>()
  const [ready, setReady] = createSignal<boolean>()
  const [diagnostic, setDiagnostic] = createSignal<Array<unknown>>([])

  const setLanguage = (language: string | null) => {
    const attrs: CodeBlockAttrs = { language: language ?? '' }
    props.setAttrs(attrs)
  }

  const options = shikiBundledLanguagesInfo
  const currentValue = createMemo(() => {
    return options.find((info) => info.id === attrLanguage()) ?? null
  })

  onMount(() => {
    const unsubscribe = editorStore.emitter.on(
      'editor::state-update',
      (state) => {
        const pos = context().getPos()
        if (pos === undefined) return
        const { from } = state.selection
        const start = pos
        const end = pos + context().node.nodeSize
        const isActive = from >= start && from < end
        setIsActive(isActive)
      },
    )
    onCleanup(() => unsubscribe())
  })

  return (
    <NodeViewWrapper>
      <div class={`highlight ${styles.CodeBlock}`}>
        <div contentEditable={false}>
          <CodemirrorEditor
            onDiagnosticChange={setDiagnostic}
            workerInitializedChange={setReady}
          />
        </div>

        <div class={styles.codeBlockActions} contenteditable={false}>
          <Show when={diagnostic().length}>
            <div class={'fgColor-muted text-small'}>
              {diagnostic().length}{' '}
              {diagnostic().length === 1 ? 'error ' : 'errors'}
            </div>
          </Show>

          <CodeBlockClipboard content={() => context().node.textContent} />

          <CodeBlockLanguageSelector
            value={currentValue()}
            setLanguage={setLanguage}
          />
        </div>
      </div>
    </NodeViewWrapper>
  )
}
