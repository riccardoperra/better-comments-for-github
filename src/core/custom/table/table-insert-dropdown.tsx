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

import { useEditor, useStateUpdate } from 'prosekit/solid'
import { createSignal } from 'solid-js'
import { Popover, PopoverContent } from '../../ui/popover/popover'
import { tableInsertPluginKey } from './table-insert-plugin'
import { TableGridSelector } from './table-grid-selector'
import type { EditorExtension } from '../../editor/extension'

export function TableInsertDropdown() {
  const [active, setActive] = createSignal(false)
  const [reference, setReference] = createSignal<HTMLElement | undefined>(
    undefined,
  )
  const editor = useEditor<EditorExtension>()

  useStateUpdate((state) => {
    const pluginState = tableInsertPluginKey.getState(state)
    if (pluginState) {
      setActive(pluginState.active)
      const node =
        editor().view.dom.querySelector<HTMLDivElement>('.table-insert-deco')
      setReference(node || undefined)
    }
  })

  return (
    <Popover
      placement={'bottom-start'}
      open={active()}
      onOpenChange={(active) => {
        if (!active) {
          editor().commands.closeTableInsertDropdown()
        }
        setActive(active)
      }}
      anchorRef={reference}
      hideWhenDetached={true}
      getAnchorRect={(anchor) => {
        const rect = anchor?.getBoundingClientRect()
        return {
          width: 0,
          height: 0,
          y: rect?.y,
          x: rect?.x,
        }
      }}
    >
      <PopoverContent
        onEscapeKeyDown={() => {
          editor().commands.closeTableInsertDropdown()
        }}
      >
        <TableGridSelector
          onSelect={(row, column) => {
            editor().commands.insertTable({
              row: row,
              col: column,
              header: true,
            })
            editor().commands.closeTableInsertDropdown()
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
