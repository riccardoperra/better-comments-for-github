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

import { For, createSignal } from 'solid-js'
import clsx from 'clsx'
import styles from './table-grid-selector.module.css'

export interface TableGridSelectorProps {
  onSelect?: (row: number, cell: number) => void
}

export function TableGridSelector(props: TableGridSelectorProps) {
  const rows = 5
  const cells = 5

  const cellsData = Array.from({ length: cells }, (_, index) => index)
  const rowsData = Array.from({ length: rows }, (_, index) => index)

  const [active, setActive] = createSignal<{ row: number; cell: number }>({
    row: 0,
    cell: 0,
  })

  // --- keyboard navigation ---
  const handleKeyDown = (e: KeyboardEvent) => {
    e.preventDefault()
    const { row, cell } = active()

    if (e.key === 'ArrowUp') {
      setActive({ row: Math.max(row - 1, 0), cell })
    } else if (e.key === 'ArrowDown') {
      setActive({ row: Math.min(row + 1, rows - 1), cell })
    } else if (e.key === 'ArrowLeft') {
      setActive({ row, cell: Math.max(cell - 1, 0) })
    } else if (e.key === 'ArrowRight') {
      setActive({ row, cell: Math.min(cell + 1, cells - 1) })
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (row !== -1 && cell !== -1) {
        props.onSelect?.(row + 1, cell + 1)
      }
    }
  }

  return (
    <div class={styles.wrapper}>
      <div
        class={styles.grid}
        tabIndex={0}
        autofocus
        onKeyDown={handleKeyDown}
        onMouseLeave={() => setActive({ row: -1, cell: -1 })}
      >
        <For each={rowsData}>
          {(rowIndex) => (
            <div class={styles.row}>
              <For each={cellsData}>
                {(cellIndex) => {
                  const isActive = () =>
                    active().cell >= cellIndex && active().row >= rowIndex

                  return (
                    <button
                      data-highlighted={isActive()}
                      class={clsx(styles.cell)}
                      onClick={() =>
                        props.onSelect?.(rowIndex + 1, cellIndex + 1)
                      }
                      onMouseEnter={() =>
                        setActive({ row: rowIndex, cell: cellIndex })
                      }
                    ></button>
                  )
                }}
              </For>
            </div>
          )}
        </For>
      </div>

      <div class={styles.state}>
        {active().row !== -1 && active().cell !== -1 && (
          <span>
            {active().row + 1} x {active().cell + 1}
          </span>
        )}
      </div>
    </div>
  )
}
