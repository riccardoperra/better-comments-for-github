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

import { chainCommands } from 'prosemirror-commands'
import { TextSelection } from 'prosemirror-state'
import type { Command } from 'prosemirror-state'
import type { ResolvedPos } from 'prosemirror-model'

export interface HandleExitOptions {
  marks: Array<string>
  nodes: Array<string>
}

const tryExitMark = (
  currentPos: ResolvedPos,
  marks: Array<string>,
): Command => {
  return (state, dispatch, view) => {
    const currentMarks = currentPos.marks()
    const tr = state.tr
    const removeMark = currentMarks.find((m) => marks.includes(m.type.name))
    if (!removeMark) {
      return false
    }

    tr.removeStoredMark(removeMark)
    tr.insertText(' ', currentPos.pos)

    if (view) view.dispatch(tr)

    return true
  }
}

const tryExitNode = (
  currentPos: ResolvedPos,
  nodes: Array<string>,
): Command => {
  return (state, dispatch, view) => {
    const tr = state.tr
    const currentPos = state.selection.$from
    const parentNode = currentPos.parent

    if (!parentNode.isInline || !nodes.includes(parentNode.type.name)) {
      return false
    }

    if (currentPos.end(currentPos.depth - 1) - 1 >= currentPos.pos) {
      return false
    }

    tr.insertText(' ', currentPos.pos + 1)
    tr.setSelection(TextSelection.create(tr.doc, state.selection.$from.pos + 2))
    if (view) view.dispatch(tr)
    return true
  }
}

export const handleMarkExit: (options: HandleExitOptions) => Command =
  (options) => (state, dispatch, view) => {
    const { marks, nodes } = options
    const currentPos = state.selection.$from
    const isAtEnd = currentPos.pos === currentPos.end()

    if (isAtEnd) {
      const tryExit = chainCommands(
        tryExitMark(currentPos, marks),
        tryExitNode(currentPos, nodes),
      )

      return tryExit(state, dispatch, view)
    }

    return false
  }
