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
import { createMemo, createSignal, onCleanup } from 'solid-js'
import { Search } from '@kobalte/core/search'
import { clsx } from 'clsx'
import { createControllableSignal } from '@kobalte/core'
import { useNodeViewContext } from '@prosemirror-adapter/solid'
import { NodeViewWrapper } from '../nodeviews/node-view'
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover'
import styles from './code-block-view.module.css'
import type { NodeViewContextProps } from '@prosemirror-adapter/solid'
import type { CodeBlockAttrs } from 'prosekit/extensions/code-block'

export default function CodeBlockView(props: NodeViewContextProps) {
  const context = useNodeViewContext()
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

  const setLanguage = (language: string | null) => {
    const attrs: CodeBlockAttrs = { language: language ?? '' }
    context().setAttrs(attrs)
  }

  return (
    <NodeViewWrapper>
      <div class={`highlight ${styles.CodeBlock}`}>
        <div class={styles.LanguageSelector} contentEditable={false}>
          <CodeBlockLanguageSelector
            value={language()}
            onValueChange={setLanguage}
          />
        </div>
        <pre ref={props.contentRef} data-language={language}></pre>
      </div>
    </NodeViewWrapper>
  )
}

export function CodeBlockLanguageSelector(props: {
  value: string
  onValueChange: (value: string | null) => void
}) {
  const [open, setOpen] = createSignal(false)
  const [term, setTerm] = createSignal('')
  const [value, setValue] = createControllableSignal<string | null>({
    value: () => props.value,
    onChange: (value) => {
      props.onValueChange(value)
    },
    defaultValue: () => null,
  })
  const options = shikiBundledLanguagesInfo

  const filteredOptions = createMemo(() => {
    const termValue = term()
    if (!termValue) {
      return options
    }
    return options.filter((option) =>
      option.name.toLowerCase().includes(term().toLowerCase()),
    )
  })

  const onPopoverKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  let languageListboxContainer!: HTMLDivElement

  return (
    <Popover open={open()} onOpenChange={setOpen}>
      <div class={'FormControl-select-wrap'}>
        <PopoverTrigger
          class={`FormControl FormControl-select FormControl-small ${styles.languageTrigger}`}
        >
          {value() ?? 'No value'}
        </PopoverTrigger>
      </div>
      <PopoverContent
        ref={() => {
          onCleanup(() => setTerm(''))
        }}
        class={styles.LanguageSelectorPopover}
        onKeyDown={onPopoverKeyDown}
      >
        <Search
          open
          options={filteredOptions()}
          onInputChange={setTerm}
          optionValue="name"
          optionLabel="name"
          onChange={(value) => {
            setValue(value ? value.name : null)
            setOpen(false)
          }}
          shouldFocusWrap={true}
          placeholder="Search a language…"
          itemComponent={(props) => (
            <Search.Item
              item={props.item}
              class={clsx(styles.languageMenuItem)}
            >
              <Search.ItemLabel>{props.item.rawValue.name}</Search.ItemLabel>
            </Search.Item>
          )}
        >
          <Search.Control aria-label="Emoji">
            <Search.Input
              placeholder={'Search'}
              class={'FormControl FormControl-input FormControl-small'}
            />
          </Search.Control>
          <div class={styles.LanguageListboxRef} ref={languageListboxContainer}>
            <Search.Listbox
              class={styles.languageMenu}
              scrollRef={() => languageListboxContainer}
            />
            <Search.NoResult>No languages found</Search.NoResult>
          </div>
        </Search>
      </PopoverContent>
    </Popover>
  )
}
