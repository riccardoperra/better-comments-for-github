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

import { defineCommands, definePlugin, union } from 'prosekit/core'
import { Plugin, PluginKey } from 'prosekit/pm/state'
import { Decoration, DecorationSet } from 'prosemirror-view'

interface TableInsertPluginState {
  active: boolean
  range: { from: number; to: number }
}

export const tableInsertPluginKey = new PluginKey<TableInsertPluginState>(
  'tableInsertPlugin',
)

function tableInsertPlugin() {
  return new Plugin({
    key: tableInsertPluginKey,
    state: {
      init() {
        const state: TableInsertPluginState = {
          active: false,
          range: { from: 0, to: 0 },
        }
        return state
      },
      apply(transaction, prev, _oldState, state) {
        const { selection } = transaction
        const { from } = selection
        const next = { ...prev }
        const meta = transaction.getMeta(tableInsertPluginKey)
        next.range = { from, to: from }
        if (meta === true || meta === false) {
          next.active = meta
        }
        return next
      },
    },

    props: {
      handleDOMEvents: {
        focus: (view) => {
          if (tableInsertPluginKey.getState(view.state)!.active) {
            view.dispatch(view.state.tr.setMeta(tableInsertPluginKey, false))
          }
        },
      },

      decorations(state) {
        const { active, range } = tableInsertPluginKey.getState(state)!
        if (!active) {
          return null
        }
        const deco = DecorationSet.create(state.doc, [
          Decoration.widget(
            range.from,
            () => {
              const el = document.createElement('div')
              el.classList.add('table-insert-deco')
              return el
            },
            {
              class: 'table-insert-deco',
              side: -1,
            },
          ),
        ])
        return deco
      },
    },
  })
}

export function defineTableInsert() {
  return union(
    definePlugin(tableInsertPlugin()),
    defineCommands({
      openTableInsertDropdown: () => {
        return (state, dispatch, view) => {
          const tr = state.tr.setMeta(tableInsertPluginKey, true)
          if (dispatch) dispatch(tr)
          return true
        }
      },
      closeTableInsertDropdown: () => {
        return (state, dispatch, view) => {
          const tr = state.tr.setMeta(tableInsertPluginKey, false)
          if (dispatch) dispatch(tr)
          view?.focus()
          return true
        }
      },
    }),
  )
}
