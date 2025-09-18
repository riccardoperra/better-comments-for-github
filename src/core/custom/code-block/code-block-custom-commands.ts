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

import { defineKeymap } from 'prosekit/core'
import { TextSelection } from 'prosemirror-state'
import type { Command } from 'prosemirror-state'

const TAB_CHAR = '\u00A0\u00A0'

export const selectCodeBlock: Command = (state, dispatch) => {
  const { $head, from, to } = state.selection
  const parent = $head.parent
  if (parent.isTextblock && parent.type.spec.code) {
    const start = $head.start($head.depth)
    const end = $head.end()
    const isSelectingAll = from === start && to === end
    if (isSelectingAll) {
      return false
    }
    if (from >= start && to <= end) {
      if (dispatch) {
        const tr = state.tr.setSelection(
          TextSelection.create(state.doc, start, end),
        )
        dispatch(tr)
      }
      return true
    }

    return false
  }

  return false
}

export function defineCodeBlockCustomCommands() {
  return defineKeymap({
    // Mod-A just select only content into the code block. If everything about this node is already selected (example double-press),
    // we will select the whole content.
    'Mod-a': selectCodeBlock,
    // Support for tab char
    Tab: (state, dispatch) => {
      if (!state.selection.empty) {
        return false
      }
      const { $head } = state.selection
      const parent = $head.parent
      if (parent.isTextblock && parent.type.spec.code) {
        if (dispatch) {
          const tr = state.tr
          tr.insertText(TAB_CHAR)
          dispatch(tr)
        }
        return true
      }
      return false
    },
  })
}
