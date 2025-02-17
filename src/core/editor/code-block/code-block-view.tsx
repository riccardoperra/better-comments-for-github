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

import { shikiBundledLanguagesInfo } from 'prosekit/extensions/code-block'
import { For } from 'solid-js'
import { NodeViewWrapper } from '../nodeviews/node-view'
import styles from './code-block-view.module.css'
import type { NodeViewContextProps } from '@prosemirror-adapter/solid'
import type { CodeBlockAttrs } from 'prosekit/extensions/code-block'

export default function CodeBlockView(props: NodeViewContextProps) {
  const language = () => {
    const lang = props.node.attrs.language
    switch (lang) {
      case 'js':
        return 'javascript'
      case 'ts':
        return 'typescript'
      default:
        return lang
    }
  }

  const setLanguage = (language: string) => {
    const attrs: CodeBlockAttrs = { language }
    props.setAttrs(attrs)
  }

  return (
    <NodeViewWrapper>
      <div class={`highlight ${styles.CodeBlock}`}>
        <div class={styles.LanguageSelector} contentEditable={false}>
          <select
            class={styles.Select}
            onChange={(event) => setLanguage(event.target.value)}
            value={language() || ''}
          >
            <option value="">Plain Text</option>
            <For each={shikiBundledLanguagesInfo}>
              {(info) => <option value={info.id}>{info.name}</option>}
            </For>
          </select>
        </div>
        <pre ref={props.contentRef} data-language={language}></pre>
      </div>
    </NodeViewWrapper>
  )
}
