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

import { createSignal } from 'solid-js'
import { useEditor } from 'prosekit/solid'
import { createWritableMemo } from '@solid-primitives/memo'
import { createEditorFocusChangeEvent } from '../../primitives/createEditorFocusEvent'
import { createEditorUpdateEvent } from '../../primitives/createEditorUpdateEvent'
import { Popover, PopoverContent } from '../../../ui/popover/popover'
import { getVirtualSelectionElement } from './virtualSelectionElement'
import type { Editor } from 'prosekit/core'
import type { ClientRectObject, ReferenceElement } from '@floating-ui/dom'
import type { Accessor, ParentProps } from 'solid-js'

function createEditorPopover(
  ref: Accessor<HTMLElement | undefined>,
  editor: Accessor<Editor | null>,
) {
  const [reference, setReference] = createSignal<ReferenceElement | null>(null)

  const [open, setOpen] = createWritableMemo(() => !!reference())

  let editorFocused = false

  createEditorFocusChangeEvent(editor, (focus) => {
    editorFocused = focus
  })

  createEditorUpdateEvent(editor, (view) => {
    const refValue = ref()
    const isPopoverFocused =
      !editorFocused &&
      refValue &&
      refValue.contains(refValue.ownerDocument.activeElement)

    if (isPopoverFocused) {
      return
    }

    setReference(getVirtualSelectionElement(view) || null)
  })

  return [reference, { open, setOpen, onEscape: () => setOpen(false) }] as const
}

export function InlineEditorPopover(
  props: ParentProps<{
    class?: string
    onOpenChange?: (open: boolean) => void
  }>,
) {
  const [host, setHost] = createSignal<HTMLElement>()
  const editor = useEditor()
  const [ref, { onEscape, open, setOpen }] = createEditorPopover(host, editor)
  let lastRect: ClientRectObject | undefined

  return (
    <Popover
      ref={setHost}
      modal={false}
      placement="top"
      open={open()}
      onOpenChange={(open) => {
        setOpen(open)
        props.onOpenChange?.(open)
      }}
      anchorRef={() => editor().view.dom}
      getAnchorRect={(anchor) => {
        const rect = ref()?.getBoundingClientRect()
        if (!ref()) {
          return lastRect
        }
        lastRect = rect
        return lastRect
      }}
    >
      <PopoverContent
        onOpenAutoFocus={(event) => event.preventDefault()}
        class={props.class}
        onEscapeKeyDown={() => {
          onEscape()
        }}
      >
        {props.children}
      </PopoverContent>
    </Popover>
  )
}
