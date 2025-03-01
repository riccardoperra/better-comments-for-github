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
import { Show, createMemo, createSignal } from 'solid-js'
import {
  SearchControl,
  SearchableSelectContent,
  SearchableSelectInput,
  SearchableSelectItem,
  SearchableSelectItemLabel,
  SearchableSelectPopover,
  SearchableSelectPopoverContent,
  SearchableSelectProvider,
  SearchableSelectRoot,
  SearchableSelectTrigger,
} from '../searchable-select/SearchableSelect'
import { SearchableSelectValue } from '../searchable-select/SearchableSelectControl'
import { NodeViewWrapper } from '../nodeviews/node-view'
import styles from './code-block-view.module.css'
import type { NodeViewContextProps } from '@prosemirror-adapter/solid'
import type { CodeBlockAttrs } from 'prosekit/extensions/code-block'

export default function CodeBlockView(props: NodeViewContextProps) {
  const attrLanguage = createMemo(() => props.node.attrs.language)
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

  const setLanguage = (language: string | null) => {
    const attrs: CodeBlockAttrs = { language: language ?? '' }
    props.setAttrs(attrs)
  }

  return (
    <NodeViewWrapper>
      <div class={`highlight ${styles.CodeBlock}`}>
        <div class={styles.LanguageSelector}>
          <CodeBlockLanguageSelector
            value={attrLanguage()}
            onValueChange={setLanguage}
          />
        </div>
        <pre ref={props.contentRef} data-language={language()}></pre>
      </div>
    </NodeViewWrapper>
  )
}

export function CodeBlockLanguageSelector(props: {
  value: string
  onValueChange: (value: string | null) => void
}) {
  const [term, setTerm] = createSignal('')
  const options = shikiBundledLanguagesInfo

  const currentValue = createMemo(() => {
    return options.find((info) => info.id === props.value)
  })

  const filteredOptions = createMemo(() => {
    const termValue = term()
    if (!termValue) {
      return options
    }
    return options.filter((option) =>
      option.name.toLowerCase().includes(term().toLowerCase()),
    )
  })

  return (
    <SearchableSelectProvider>
      <SearchableSelectPopover>
        <SearchableSelectTrigger>
          <SearchableSelectValue value={currentValue()}>
            {({ value }) => (
              <Show when={value()[0]}>{(value) => <>{value().name}</>}</Show>
            )}
          </SearchableSelectValue>
        </SearchableSelectTrigger>
        <SearchableSelectPopoverContent>
          <SearchableSelectRoot
            open
            value={currentValue()}
            onChange={(value) => {
              props.onValueChange(value?.id ?? null)
            }}
            optionLabel={'name'}
            optionValue={'id'}
            options={filteredOptions()}
            onInputChange={setTerm}
            placeholder="Search a language…"
            itemComponent={(props) => (
              <SearchableSelectItem item={props.item}>
                <SearchableSelectItemLabel>
                  {props.item.rawValue.name}
                </SearchableSelectItemLabel>
              </SearchableSelectItem>
            )}
          >
            <SearchControl>
              <SearchableSelectInput placeholder={'Search'} />
            </SearchControl>
            <SearchableSelectContent />
          </SearchableSelectRoot>
        </SearchableSelectPopoverContent>
      </SearchableSelectPopover>
    </SearchableSelectProvider>
  )
}
