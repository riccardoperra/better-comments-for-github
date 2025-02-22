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

import {
  BlockHandleAdd,
  BlockHandleDraggable,
  BlockHandlePopover,
} from 'prosekit/solid/block-handle'

import LucidePlus from 'lucide-solid/icons/plus'
import LucideGripVertical from 'lucide-solid/icons/grip-vertical'

export function EditorBlockHandler() {
  return (
    <BlockHandlePopover className="flex items-center flex-row box-border justify-center transition border-0 [&:not([data-state])]:hidden will-change-transform data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:animate-duration-150 data-[state=closed]:animate-duration-200">
      <BlockHandleAdd className="flex items-center box-border justify-center h-[1.5em] w-[1.5em] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500/50 dark:text-zinc-500/50 cursor-pointer">
        <LucidePlus size={14} />
      </BlockHandleAdd>
      <BlockHandleDraggable className="flex items-center box-border justify-center h-[1.5em] w-[1.2em] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500/50 dark:text-zinc-500/50 cursor-grab">
        <LucideGripVertical size={14} />
      </BlockHandleDraggable>
    </BlockHandlePopover>
  )
}
