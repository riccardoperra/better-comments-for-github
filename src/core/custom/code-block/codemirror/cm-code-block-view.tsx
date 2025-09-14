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
import { ConfigStore } from '../../../../config.store'
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
  const configStore = ConfigStore.provide()
  const editorStore = ExtensionEditorStore.provide()
  const attrLanguage = createMemo(() => context().node.attrs.language)

  const language = () => {
    const lang = attrLanguage()
    switch (lang) {
      case 'js':
        return 'javascript'
      case 'ts':
        return 'typescript'
      default:
        return lang
    }
  }

  const [isActive, setIsActive] = createSignal<boolean>()
  const [ready, setReady] = createSignal<boolean>()

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
          <CodemirrorEditor workerInitializedChange={setReady} />
        </div>

        <Show when={isActive()}>
          <div class={styles.codeBlockActions} contenteditable={false}>
            <CodeBlockLanguageSelector
              value={currentValue()}
              setLanguage={setLanguage}
            />
            <CodeBlockClipboard content={context().node.textContent} />
          </div>
        </Show>
      </div>
    </NodeViewWrapper>
  )
}
