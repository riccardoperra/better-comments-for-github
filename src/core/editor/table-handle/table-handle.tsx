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

import { useEditor } from 'prosekit/solid'
import {
  TableHandleColumnRoot,
  TableHandleColumnTrigger,
  TableHandleDragPreview,
  TableHandleDropIndicator,
  TableHandlePopoverContent,
  TableHandlePopoverItem,
  TableHandleRoot,
  TableHandleRowRoot,
  TableHandleRowTrigger,
} from 'prosekit/solid/table-handle'
import LucideGripHorizontal from 'lucide-solid/icons/grip-horizontal'
import { clsx } from 'clsx'
import styles from '../autocomplete/Autocomplete.module.css'
import tableHandleStyles from './table-handle.module.css'
import type { EditorExtension } from '../extension'

export function TableHandle() {
  const editor = useEditor<EditorExtension>({ update: true })
  return (
    <TableHandleRoot class="contents">
      <TableHandleDragPreview />
      <TableHandleDropIndicator />
      <TableHandleColumnRoot
        class={clsx(
          tableHandleStyles.handleTrigger,
          tableHandleStyles.columnTrigger,
        )}
      >
        <TableHandleColumnTrigger class={styles.trigger}>
          <LucideGripHorizontal size={16} />
        </TableHandleColumnTrigger>
        <TableHandlePopoverContent class={styles.autocompleteMenu}>
          {editor().commands.addTableColumnBefore.canExec() && (
            <TableHandlePopoverItem
              class={styles.autocompleteMenuItem}
              onSelect={() => editor().commands.addTableColumnBefore()}
            >
              <span>Insert Left</span>
            </TableHandlePopoverItem>
          )}
          {editor().commands.addTableColumnAfter.canExec() && (
            <TableHandlePopoverItem
              class={styles.autocompleteMenuItem}
              onSelect={() => editor().commands.addTableColumnAfter()}
            >
              <span>Insert Right</span>
            </TableHandlePopoverItem>
          )}
          {editor().commands.deleteCellSelection.canExec() && (
            <TableHandlePopoverItem
              class={styles.autocompleteMenuItem}
              onSelect={() => editor().commands.deleteCellSelection()}
            >
              <span>Clear Contents</span>
            </TableHandlePopoverItem>
          )}
          {editor().commands.deleteTableColumn.canExec() && (
            <TableHandlePopoverItem
              class={styles.autocompleteMenuItem}
              onSelect={() => editor().commands.deleteTableColumn()}
            >
              <span>Delete Column</span>
            </TableHandlePopoverItem>
          )}
        </TableHandlePopoverContent>
      </TableHandleColumnRoot>
      <TableHandleRowRoot
        class={clsx(
          tableHandleStyles.handleTrigger,
          tableHandleStyles.rowTrigger,
        )}
      >
        <TableHandleRowTrigger class={styles.trigger}>
          <LucideGripHorizontal size={16} />
        </TableHandleRowTrigger>
        <TableHandlePopoverContent class={styles.autocompleteMenu}>
          {editor().commands.addTableRowAbove.canExec() && (
            <TableHandlePopoverItem
              class={styles.autocompleteMenuItem}
              onSelect={() => editor().commands.addTableRowAbove()}
            >
              <span>Insert Above</span>
            </TableHandlePopoverItem>
          )}
          {editor().commands.addTableRowBelow.canExec() && (
            <TableHandlePopoverItem
              class={styles.autocompleteMenuItem}
              onSelect={() => editor().commands.addTableRowBelow()}
            >
              <span>Insert Below</span>
            </TableHandlePopoverItem>
          )}
          {editor().commands.deleteCellSelection.canExec() && (
            <TableHandlePopoverItem
              class={styles.autocompleteMenuItem}
              onSelect={() => editor().commands.deleteCellSelection()}
            >
              <span>Clear Contents</span>
            </TableHandlePopoverItem>
          )}
          {editor().commands.deleteTableRow.canExec() && (
            <TableHandlePopoverItem
              class={styles.autocompleteMenuItem}
              onSelect={() => editor().commands.deleteTableRow()}
            >
              <span>Delete Row</span>
            </TableHandlePopoverItem>
          )}
        </TableHandlePopoverContent>
      </TableHandleRowRoot>
    </TableHandleRoot>
  )
}
