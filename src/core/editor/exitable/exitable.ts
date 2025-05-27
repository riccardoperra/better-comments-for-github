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
import { handleMarkExit } from './exit'

declare module 'prosemirror-model' {
  interface MarkSpec {
    exitable?: boolean
  }
}

declare module 'prosemirror-model' {
  interface NodeSpec {
    exitable?: boolean
  }
}

export function defineExitable() {
  const exitable = '$exitable'
  type ExitableData = {
    exitableMarks: Array<string>
    exitableNodes: Array<string>
  }

  return defineKeymap({
    ArrowRight: (state, dispatch, view) => {
      let exitableData: ExitableData = {
        exitableMarks: [],
        exitableNodes: [],
      }

      if (state.schema.cached[exitable]) {
        exitableData = state.schema.cached[exitable] as ExitableData
      } else {
        state.schema.cached[exitable] = exitableData
        state.schema.spec.marks.forEach((m, spec) => {
          if (spec.exitable) {
            exitableData.exitableMarks.push(m)
          }
        })
        state.schema.spec.nodes.forEach((m, spec) => {
          if (spec.exitable && spec.inline) {
            exitableData.exitableNodes.push(m)
          }
        })
      }

      const { exitableMarks, exitableNodes } = exitableData

      if (exitableMarks.length === 0 && exitableNodes.length === 0) {
        return false
      }

      return handleMarkExit({ marks: exitableMarks, nodes: exitableNodes })(
        state,
        dispatch,
        view,
      )
    },
  })
}
