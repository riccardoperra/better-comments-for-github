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

import {
  AutocompleteRule,
  defineAutocomplete,
} from 'prosekit/extensions/autocomplete'
import { createEffect } from 'solid-js'
import type { Editor } from 'prosekit/core'
import type { Accessor, Setter } from 'solid-js'

export function useSearchableSelectAutocompleteExtension(
  editor: Accessor<Editor | null>,
  regex: Accessor<RegExp | null>,
  setReference: Setter<HTMLElement | null>,
  setQuery: Setter<string>,
  setDismiss: (fn: VoidFunction) => void,
  setSubmit: (fn: VoidFunction) => void,
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
  setDismiss: (fn: VoidFunction) => void,
  setSubmit: (fn: VoidFunction) => void,
) {
  return new AutocompleteRule({
    regex,
    onEnter: (options) => {
      const span = editor.view.dom.querySelector<HTMLElement>(
        '.prosemirror-prediction-match',
      )
      if (span) {
        setReference(span)
      }
      setQuery(defaultQueryBuilder(options.match))
      setDismiss(options.ignoreMatch)
      setSubmit(options.deleteMatch)
    },
    onLeave: () => {
      setReference(null)
      setQuery('')
    },
  })
}
