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
import { For, Show, createMemo, createSignal } from 'solid-js'
import { LucideCheck, LucideCopy } from 'lucide-solid'
import {
  SearchControl,
  SearchableSelectItem,
  SearchableSelectItemLabel,
  SearchableSelectPopover,
  SearchableSelectPopoverContent,
  SearchableSelectProvider,
  SearchableSelectRoot,
  SearchableSelectTrigger,
} from '../../ui/searchable-select/SearchableSelect'
import { SearchableSelectValue } from '../../ui/searchable-select/SearchableSelectControl'
import { SearchableSelectInput } from '../../ui/searchable-select/SearchableSelectInput'
import { SearchableSelectContent } from '../../ui/searchable-select/SearchableSelectContent'
import { ConfigStore } from '../../../config.store'
import styles from './code-block-view.module.css'
import type { ShikiBundledLanguageInfo } from 'prosekit/extensions/code-block'

export function CodeBlockClipboard(props: { content: string }) {
  const [copied, setCopied] = createSignal(false)

  const copyContent = () => {
    const content = props.content
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2500)
    })
  }

  return (
    <button
      type={'button'}
      class={'Button Button--small Button--iconOnly Button--invisible'}
      onClick={copyContent}
    >
      <Show fallback={<LucideCheck size={13} />} when={!copied()}>
        <LucideCopy size={13} />
      </Show>
    </button>
  )
}

export function CodeBlockLanguageSelector(props: {
  value: ShikiBundledLanguageInfo | null
  setLanguage: (value: string | null) => void
}) {
  const configStore = ConfigStore.provide()

  return (
    <div class={styles.LanguageSelector}>
      <Show
        fallback={
          <>
            <select
              class={styles.Select}
              onChange={(event) => props.setLanguage(event.target.value)}
              value={props.value?.id || ''}
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
        <CustomCodeBlockLanguageSelector
          value={props.value}
          onValueChange={props.setLanguage}
        />
      </Show>
    </div>
  )
}

export function CustomCodeBlockLanguageSelector(props: {
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
