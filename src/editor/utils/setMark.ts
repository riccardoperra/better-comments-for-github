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

import { isTextSelection } from 'prosekit/core'
import { getMarkType } from './getMarkType'
import type { Command, EditorState, Transaction } from 'prosemirror-state'
import type { Attrs, MarkType, ResolvedPos } from 'prosemirror-model'

interface SetMarkOptions {
  type: MarkType | string
  attrs?: Attrs
}

/**
 * From https://github.com/ueberdosis/tiptap/blob/develop/packages/core/src/commands/setMark.ts
 */
function canSetMark(
  state: EditorState,
  tr: Transaction,
  newMarkType: MarkType,
) {
  const { selection } = tr
  let cursor: ResolvedPos | null = null
  if (isTextSelection(selection)) {
    cursor = selection.$cursor
  }

  if (cursor) {
    const currentMarks = state.storedMarks ?? cursor.marks()
    const parentAllowsMarkType = cursor.parent.type.allowsMarkType(newMarkType)

    // There can be no current marks that exclude the new mark, and the parent must allow this mark type
    return (
      parentAllowsMarkType &&
      (!!newMarkType.isInSet(currentMarks) ||
        !currentMarks.some((mark) => mark.type.excludes(newMarkType)))
    )
  }

  const { ranges } = selection

  return ranges.some(({ $from, $to }) => {
    let someNodeSupportsMark =
      $from.depth === 0
        ? state.doc.inlineContent && state.doc.type.allowsMarkType(newMarkType)
        : false

    state.doc.nodesBetween($from.pos, $to.pos, (node, _pos, parent) => {
      // If we already found a mark that we can enable, return false to bypass the remaining search
      if (someNodeSupportsMark) {
        return false
      }

      if (node.isInline) {
        const parentAllowsMarkType =
          !parent || parent.type.allowsMarkType(newMarkType)
        const currentMarksAllowMarkType =
          !!newMarkType.isInSet(node.marks) ||
          !node.marks.some((otherMark) => otherMark.type.excludes(newMarkType))

        someNodeSupportsMark = parentAllowsMarkType && currentMarksAllowMarkType
      }
      return !someNodeSupportsMark
    })

    return someNodeSupportsMark
  })
}

/**
 * From https://github.com/ueberdosis/tiptap/blob/develop/packages/core/src/commands/setMark.ts
 */
export const setMark: (options: SetMarkOptions) => Command = (options) => {
  return (state, dispatch) => {
    const attrs = options.attrs
    const tr = state.tr
    const { selection } = tr
    const { ranges } = selection
    const type = getMarkType(state.schema, options.type)

    const canSet = canSetMark(state, tr, type)
    if (!canSet) {
      return false
    }

    if (dispatch) {
      ranges.forEach((range) => {
        const from = range.$from.pos
        const to = range.$to.pos

        state.doc.nodesBetween(from, to, (node, pos) => {
          const trimmedFrom = Math.max(pos, from)
          const trimmedTo = Math.min(pos + node.nodeSize, to)
          const someHasMark = node.marks.find((mark) => mark.type === type)

          if (someHasMark) {
            node.marks.forEach((mark) => {
              if (type === mark.type) {
                tr.addMark(
                  trimmedFrom,
                  trimmedTo,
                  type.create({
                    ...mark.attrs,
                    ...attrs,
                  }),
                )
              }
            })
          } else {
            tr.addMark(trimmedFrom, trimmedTo, type.create(attrs))
          }
        })
      })

      dispatch(tr)
    }

    return true
  }
}
