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

import { Show, createSignal } from 'solid-js'
import LucideTrash from 'lucide-solid/icons/trash'
import LucidePersonStanding from 'lucide-solid/icons/person-standing'
import LucideUndo2 from 'lucide-solid/icons/undo-2'
import { useNodeViewContext } from '@prosemirror-adapter/solid'
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip/tooltip'
import { deleteRange } from '../../../editor/utils/deleteRange'
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover'
import { TextField } from '../text-field/text-field'
import styles from './image-view.module.css'

export interface ImageViewActionsProps {
  error?: string | null
  onUndoResize: () => void
}

export function ImageViewActions(props: ImageViewActionsProps) {
  const context = useNodeViewContext()
  const [openAltPopover, setOpenAltPopover] = createSignal(false)

  return (
    <div class={styles.actions}>
      <Show
        fallback={
          <>
            <Tooltip>
              <TooltipTrigger
                class={styles.action}
                onClick={() => {
                  const from = context().getPos()
                  if (from) {
                    const to = from + context().node.nodeSize
                    const command = deleteRange({ from, to })
                    command(context().view.state, context().view.dispatch)
                  }
                }}
              >
                <LucideTrash size={14} />
              </TooltipTrigger>
              <TooltipContent>Delete node</TooltipContent>
            </Tooltip>
          </>
        }
        when={!props.error}
      >
        <Tooltip>
          <Popover
            placement={'bottom-start'}
            open={openAltPopover()}
            onOpenChange={setOpenAltPopover}
          >
            <PopoverTrigger as={TooltipTrigger} class={styles.action}>
              <LucidePersonStanding size={14} />
            </PopoverTrigger>
            <PopoverContent
              class={styles.altTextPopoverContent}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  setOpenAltPopover(false)
                }
              }}
            >
              {(() => {
                const [value, setValue] = createSignal<string>(
                  context().node.attrs.value,
                )
                return (
                  <TextField
                    autofocus
                    label={'Alternative text'}
                    value={value()}
                    onValueChange={setValue}
                    onChange={(event) => {
                      context().setAttrs({ alt: value() })
                    }}
                  />
                )
              })()}
            </PopoverContent>
          </Popover>
          <TooltipContent>Alternative text</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger class={styles.action} onClick={props.onUndoResize}>
            <LucideUndo2 size={14} />
          </TooltipTrigger>
          <TooltipContent>Revert to original size</TooltipContent>
        </Tooltip>
      </Show>
    </div>
  )
}
