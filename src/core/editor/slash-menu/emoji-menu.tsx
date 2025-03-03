import { createEffect, createMemo, createSignal } from 'solid-js'

import { useEditor } from 'prosekit/solid'
import {
  AutocompleteRule,
  defineAutocomplete,
} from 'prosekit/extensions/autocomplete'
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
import styles from './emoji-menu.module.css'
import type { Accessor, Setter } from 'solid-js'
import type { Editor } from 'prosekit/core'
import type { EditorExtension } from '../extension'
import type { SuggestionData } from '../../../editor/utils/loadSuggestionData'

export default function EmojiMenu(props: { emojis: SuggestionData['emojis'] }) {
  const editor = useEditor<EditorExtension>()

  createEffect(() => {
    console.log(props.emojis)
  })

  const [open, setOpen] = createSignal(false)

  const [reference, setReference] = createSignal<Element | null>(null)
  const [_query, _setQuery] = createSignal<string | null>(null)
  const [query, setQuery] = createSignal<string>(':')
  const [onDismiss, setDismiss] = createSignal<VoidFunction | null>(null)
  const [onSubmit, setSubmit] = createSignal<VoidFunction | null>(null)

  const regex = () => /(?:^|(?<=\s)):(?!:)[^:]*$/iu

  useAutocompleteExtension(
    editor,
    regex,
    setReference,
    setQuery,
    setDismiss,
    setSubmit,
  )

  createEffect(() => {
    if (reference()) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  })

  const anchorRef = createMemo(() => reference())

  const emojis = createMemo(() => {
    const _ = _query() ?? ''
    return props.emojis.slice(0, 200).filter((emoji) => {
      return emoji.name.toLowerCase().includes(_)
    })
  })

  return (
    <SearchableSelectProvider
      popoverOpen={open()}
      onPopoverOpen={(open) => {
        setOpen(open)
        if (!open) {
          editor().focus()
        }
      }}
    >
      <SearchableSelectPopover
        placement={'bottom-end'}
        fitViewport={false}
        anchorRef={anchorRef}
      >
        <SearchableSelectPopoverContent>
          <SearchableSelectRoot
            open
            multiple={false}
            optionValue={'name'}
            options={emojis()}
            onInputChange={_setQuery}
            itemComponent={(props) => (
              <SearchableSelectItem item={props.item}>
                <SearchableSelectItemLabel>
                  {props.item.rawValue.character}
                  <span>{'   '}</span>:{props.item.rawValue.name}:
                </SearchableSelectItemLabel>
              </SearchableSelectItem>
            )}
          >
            <SearchControl>
              <SearchableSelectInput placeholder={'Search'} />
            </SearchControl>
            <SearchableSelectContent listboxClass={styles.emojiListbox} />
          </SearchableSelectRoot>
        </SearchableSelectPopoverContent>
      </SearchableSelectPopover>
    </SearchableSelectProvider>
  )
}

function useAutocompleteExtension(
  editor: Accessor<Editor | null>,
  regex: Accessor<RegExp | null>,
  setReference: Setter<Element | null>,
  setQuery: Setter<string>,
  setDismiss: Setter<VoidFunction | null>,
  setSubmit: Setter<VoidFunction | null>,
) {
  createEffect(() => {
    const editorValue = editor()
    const regexValue = regex()
    if (!editorValue || !regexValue) {
      return
    }

    const rule = createAutocompleteRule(
      editorValue,
      regexValue,
      setReference,
      setQuery,
      setDismiss,
      setSubmit,
    )
    console.log(rule)
    const extension = defineAutocomplete(rule)
    return editorValue.use(extension)
  })
}

export function defaultQueryBuilder(match: RegExpExecArray) {
  return match[0]
    .toLowerCase()
    .replace(/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/g, '')
    .replace(/\s\s+/g, ' ')
    .trim()
}

function createAutocompleteRule(
  editor: Editor,
  regex: RegExp,
  setReference: Setter<Element | null>,
  setQuery: Setter<string>,
  setDismiss: Setter<VoidFunction | null>,
  setSubmit: Setter<VoidFunction | null>,
) {
  const handleEnter: MatchHandler = (options) => {
    const span = editor.view.dom.querySelector('.prosemirror-prediction-match')
    console.log('set enter', options, span)

    if (span) {
      setReference(span)
    }

    setQuery(defaultQueryBuilder(options.match))
    // setDismiss(options.ignoreMatch)
    // setSubmit(options.deleteMatch)
  }

  const handleLeave = () => {
    console.log('leave')
    // setReference(null)
    setQuery('')
  }

  return new AutocompleteRule({
    regex,
    onEnter: handleEnter,
    onLeave: handleLeave,
  })
}
