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

import { createMemo, createSignal } from 'solid-js'
import { useNodeViewContext } from '@prosemirror-adapter/solid'
import { shikiBundledLanguagesInfo } from 'prosekit/extensions/code-block'

import { NodeViewWrapper } from '../../editor/primitives/node-view'
import { ConfigStore } from '../../../config.store'
import styles from './code-block-view.module.css'
import {
  CodeBlockClipboard,
  CodeBlockLanguageSelector,
} from './CodeBlockToolbar'
import type { CodeBlockAttrs } from 'prosekit/extensions/code-block'
import type { NodeViewContextProps } from '@prosemirror-adapter/solid'

export default function ShikiCodeBlockView(props: NodeViewContextProps) {
  const context = useNodeViewContext()
  const configStore = ConfigStore.provide()
  const attrLanguage = createMemo(() => context().node.attrs.language)

  const setLanguage = (language: string | null) => {
    const attrs: CodeBlockAttrs = { language: language ?? '' }
    props.setAttrs(attrs)
  }

  const options = shikiBundledLanguagesInfo

  const currentValue = createMemo(() => {
    return options.find((info) => info.id === attrLanguage()) ?? null
  })

  const [copied, setCopied] = createSignal(false)

  const copyContent = () => {
    const content = context().node.textContent
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2500)
    })
  }

  return (
    <NodeViewWrapper>
      <div class={`highlight ${styles.CodeBlock}`}>
        <div class={styles.codeBlockActions} contenteditable={false}>
          <CodeBlockLanguageSelector
            value={currentValue()}
            setLanguage={setLanguage}
          />
          <CodeBlockClipboard content={context().node.textContent} />
        </div>

        <pre
          ref={props.contentRef}
          data-language={context().node.attrs.language}
        ></pre>
      </div>
    </NodeViewWrapper>
  )
}
