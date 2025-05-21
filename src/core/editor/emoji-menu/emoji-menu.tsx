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

import { Show, createEffect, createMemo, createSignal } from 'solid-js'
import { useEditor } from 'prosekit/solid'
import { Fragment, Slice } from 'prosemirror-model'
import { Dynamic } from 'solid-js/web'
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
} from '../searchable-select/SearchableSelect'
import { useSearchableSelectAutocompleteExtension } from '../searchable-select/searchable-select-autocomplete'
import styles from './emoji-menu.module.css'
import type { EditorExtension } from '../extension'
import type {
  EmojiSuggestion,
  SuggestionData,
} from '../../../editor/utils/loadSuggestionData'

export default function EmojiMenu(props: { emojis: SuggestionData['emojis'] }) {
  const editor = useEditor<EditorExtension>()
  const [open, setOpen] = createSignal(false)

  const [reference, setReference] = createSignal<HTMLElement | null>(null)
  const [query, setQuery] = createSignal<string>('')

  let onDismiss: VoidFunction = () => void 0

  const regex = () => /(?:^|(?<=\s)):(?!:)[^:]*$/iu

  useSearchableSelectAutocompleteExtension(
    editor,
    regex,
    setReference,
    setQuery,
    (fn) => (onDismiss = fn),
    () => void 0,
  )

  createEffect(() => {
    if (reference()) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  })

  const anchorRef = createMemo(() => reference() || undefined)

  const emojis = createMemo(() => {
    const _ = query()
    let emojis = props.emojis
    if (_.length < 2) {
      emojis = emojis.slice(0, 50)
    }
    return emojis.filter((emoji) => {
      return emoji.name.toLowerCase().includes(_)
    })
  })

  const onChange = (value: EmojiSuggestion | null) => {
    if (value) {
      const span = editor().view.dom.querySelector(
        '.prosemirror-prediction-match',
      )
      if (span) {
        const pos = editor().view.posAtDOM(span, 0)
        const tr = editor().state.tr
        tr.replace(
          pos,
          pos + 1,
          new Slice(Fragment.from(editor().schema.text(value.character)), 0, 0),
        )
        editor().view.dispatch(tr)
        setTimeout(() => editor().view.focus())
      }
    }
  }

  return (
    <SearchableSelectProvider
      popoverOpen={open()}
      onPopoverOpen={(open) => {
        setOpen(open)
        if (!open) {
          setTimeout(() => onDismiss())
        }
      }}
    >
      <SearchableSelectPopover
        placement={'right-start'}
        fitViewport={false}
        anchorRef={anchorRef}
      >
        <SearchableSelectPopoverContent>
          <SearchableSelectRoot
            open
            multiple={false}
            optionLabel={'name'}
            optionValue={'name'}
            options={emojis()}
            onInputChange={setQuery}
            itemComponent={(props) => (
              <SearchableSelectItem item={props.item}>
                <SearchableSelectItemLabel>
                  <Show
                    fallback={props.item.rawValue.character}
                    when={props.item.rawValue.fallback}
                  >
                    {(fallback) => <Dynamic component={fallback()} />}
                  </Show>
                  <span>{'   '}</span>
                  {props.item.rawValue.name}
                </SearchableSelectItemLabel>
              </SearchableSelectItem>
            )}
            onChange={onChange}
          >
            <SearchControl
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  onDismiss()
                  editor().view.focus()
                }
              }}
            >
              <SearchableSelectInput placeholder={'Search'} />
            </SearchControl>
            <SearchableSelectContent listboxClass={styles.emojiListbox} />
          </SearchableSelectRoot>
        </SearchableSelectPopoverContent>
      </SearchableSelectPopover>
    </SearchableSelectProvider>
  )
}
