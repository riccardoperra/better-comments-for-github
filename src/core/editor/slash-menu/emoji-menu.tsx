import { createEffect, createMemo, createSignal } from 'solid-js'

import { useEditor } from 'prosekit/solid'
import {
  AutocompleteRule,
  defineAutocomplete,
} from 'prosekit/extensions/autocomplete'
import { Fragment, Slice } from 'prosemirror-model'
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
  const [open, setOpen] = createSignal(false)

  const [reference, setReference] = createSignal<HTMLElement | null>(null)
  const [query, setQuery] = createSignal<string>('')
  const [onDismiss, setDismiss] = createSignal<(() => VoidFunction) | null>(
    null,
  )
  const [onSubmit, setSubmit] = createSignal<(() => VoidFunction) | null>(null)

  const regex = () => /:(|\S.*)$/iu

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

  return (
    <SearchableSelectProvider
      popoverOpen={open()}
      onPopoverOpen={(open) => {
        setOpen(open)
        if (!open) {
          setTimeout(() => {
            onDismiss()?.()
            editor().view.focus()
          })
        }
      }}
    >
      <SearchableSelectPopover
        placement={'right-start'}
        fitViewport={false}
        anchorRef={anchorRef}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setTimeout(() => onDismiss()?.())
          }
        }}
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
                  {props.item.rawValue.character}
                  <span>{'   '}</span>:{props.item.rawValue.name}:
                </SearchableSelectItemLabel>
              </SearchableSelectItem>
            )}
            onChange={(value) => {
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
                    new Slice(
                      Fragment.from(editor().schema.text(value.character)),
                      0,
                      0,
                    ),
                  )

                  editor().view.dispatch(tr)
                  setTimeout(() => editor().view.focus())
                }
              }
            }}
          >
            <SearchControl
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  onDismiss()
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

function useAutocompleteExtension(
  editor: Accessor<Editor | null>,
  regex: Accessor<RegExp | null>,
  setReference: Setter<HTMLElement | null>,
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
  setReference: Setter<HTMLElement | null>,
  setQuery: Setter<string>,
  setDismiss: Setter<(() => VoidFunction) | null>,
  setSubmit: Setter<(() => VoidFunction) | null>,
) {
  const handleEnter: MatchHandler = (options) => {
    const span = editor.view.dom.querySelector<HTMLElement>(
      '.prosemirror-prediction-match',
    )
    if (span) {
      setReference(span)
    }
    setQuery(defaultQueryBuilder(options.match))
    setDismiss(() => options.ignoreMatch)
    setSubmit(() => options.deleteMatch)
  }

  const handleLeave = () => {
    setReference(null)
    setQuery('')
  }

  return new AutocompleteRule({
    regex,
    onEnter: handleEnter,
    onLeave: handleLeave,
  })
}
