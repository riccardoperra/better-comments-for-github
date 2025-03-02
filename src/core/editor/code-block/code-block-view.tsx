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

import { For, Show, createMemo, createSignal } from 'solid-js'
import { LucideCheck, LucideCopy } from 'lucide-solid'
import { useNodeViewContext } from '@prosemirror-adapter/solid'
import { shikiBundledLanguagesInfo } from 'prosekit/extensions/code-block'
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
import { ConfigStore } from '../../../config.store'
import styles from './code-block-view.module.css'
import { CodeMirrorView } from './codemirror-view'
import type {
  CodeBlockAttrs,
  ShikiBundledLanguageInfo,
} from 'prosekit/extensions/code-block'
import type { NodeViewContextProps } from '@prosemirror-adapter/solid'

export default function CodeBlockView(props: NodeViewContextProps) {
  const context = useNodeViewContext()
  const configStore = ConfigStore.provide()
  const attrLanguage = createMemo(() => context().node.attrs.language)
  const guid = createMemo(() => context().node.attrs.guid)
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
    console.log(language)
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
        <div class={styles.actions} contenteditable={false}>
          <div class={styles.LanguageSelector}>
            <Show
              fallback={
                <>
                  <select
                    class={styles.Select}
                    onChange={(event) => setLanguage(event.target.value)}
                    value={currentValue()?.id || ''}
                  >
                    <option value="">Plain Text</option>
                    <For each={shikiBundledLanguagesInfo}>
                      {(info) => <option value={info.id}>{info.name}</option>}
                    </For>
                  </select>
                </>
              }
              when={!configStore.get.nativeSelectForLanguageSelector}
            >
              <CodeBlockLanguageSelector
                value={currentValue()}
                onValueChange={setLanguage}
              />
            </Show>
          </div>
          <button
            type={'button'}
            class={'Button Button--small Button--iconOnly Button--invisible'}
            onClick={copyContent}
          >
            <Show fallback={<LucideCheck size={13} />} when={!copied()}>
              <LucideCopy size={13} />
            </Show>
          </button>
        </div>

        <Show
          fallback={
            <>
              <pre ref={props.contentRef} data-language={language()}></pre>
            </>
          }
          when={language() === 'typescript'}
        >
          <CodeMirrorView />
        </Show>
      </div>
    </NodeViewWrapper>
  )
}

export function CodeBlockLanguageSelector(props: {
  value: ShikiBundledLanguageInfo | null
  onValueChange: (value: string | null) => void
}) {
  const [term, setTerm] = createSignal('')

  const filteredOptions = createMemo(() => {
    const termValue = term()
    if (!termValue) {
      return shikiBundledLanguagesInfo
    }
    return shikiBundledLanguagesInfo.filter((option) =>
      option.name.toLowerCase().includes(term().toLowerCase()),
    )
  })

  return (
    <SearchableSelectProvider>
      <SearchableSelectPopover hideWhenDetached>
        <SearchableSelectTrigger>
          <SearchableSelectValue value={props.value}>
            {({ value }) => (
              <Show when={value()[0]}>{(value) => <>{value().name}</>}</Show>
            )}
          </SearchableSelectValue>
        </SearchableSelectTrigger>
        <SearchableSelectPopoverContent>
          <SearchableSelectRoot
            forceMount
            open
            value={props.value}
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
