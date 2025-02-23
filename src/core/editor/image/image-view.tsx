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

import { ResizableHandle, ResizableRoot } from 'prosekit/solid/resizable'
import {
  Show,
  batch,
  createEffect,
  createMemo,
  createSignal,
  onMount,
  untrack,
  useContext,
} from 'solid-js'
import { useNodeViewContext } from '@prosemirror-adapter/solid'
import LucideLoaderCircle from 'lucide-solid/icons/loader-circle'
import LucideUndo2 from 'lucide-solid/icons/undo-2'
import LucidePersonStanding from 'lucide-solid/icons/person-standing'
import { createStore } from 'solid-js/store'
import { EditorRootContext } from '../../../editor/editor'
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip/tooltip'
import styles from './image-view.module.css'
import type { ImageAttrs } from 'prosekit/extensions/image'

export function ImageView() {
  const context = useNodeViewContext()
  const { uploadHandler } = useContext(EditorRootContext)!
  const selected = createMemo(() => context().selected)
  const referenceId = () => context().node.attrs.referenceId
  const attrs = () => context().node.attrs as ImageAttrs
  const url = () => attrs().src || ''
  const [resizableRoot, setResizableRoot] = createSignal<HTMLElement | null>()
  const uploading = () => gitHubFileRef()?.status === 'progress'
  const [aspectRatio, setAspectRatio] = createSignal<number | undefined>()
  const [error, setError] = createSignal<string | undefined>()

  const [size, setSize] = createStore<{
    initialWidth: number | undefined
    initialHeight: number | undefined
    width: number | undefined
    height: number | undefined
  }>({
    initialHeight: context().node.attrs.height,
    initialWidth: context().node.attrs.width,
    width: context().node.attrs.width,
    height: context().node.attrs.height,
  })

  const gitHubFileRef = createMemo(() =>
    referenceId()
      ? (uploadHandler.get.find((handler) => handler.id === referenceId()) ??
        null)
      : null,
  )

  const imageSrc = createMemo(() => {
    const src = url()
    const ref = gitHubFileRef()
    if (!ref) {
      return src
    }
    if (ref.status === 'done' && ref.previewUrl) {
      return ref.previewUrl
    }
    return src
  })

  createEffect(() => {
    const ref = gitHubFileRef()

    if (
      ref?.status === 'done' &&
      ref.originalUrl &&
      untrack(url) !== ref.originalUrl
    ) {
      context().setAttrs({ ...context().node.attrs, src: ref.originalUrl })
    }
  })

  const handleImageLoad = (event: Event) => {
    const img = event.target as HTMLImageElement
    const { naturalWidth, naturalHeight } = img
    const ratio = naturalWidth / naturalHeight
    setSize('initialWidth', naturalWidth)
    setSize('initialHeight', naturalHeight)

    if (ratio && Number.isFinite(ratio)) {
      setAspectRatio(ratio)
    }

    setSize('width', naturalWidth)
    setSize('height', naturalHeight)
  }

  createEffect(() => {
    const naturalWidth = size.initialWidth
    const naturalHeight = size.initialHeight
    if (
      naturalWidth === size.width &&
      naturalHeight === size.height &&
      context().node.attrs.width !== naturalWidth &&
      context().node.attrs.height !== naturalHeight
    ) {
      context().setAttrs({ width: undefined, height: undefined })
    } else if (naturalWidth !== size.width || naturalHeight !== size.height) {
      context().setAttrs({ width: size.width, height: size.height })
    }
  })

  const canRevertToOriginalSize = createMemo(() => {
    return (
      size.initialWidth === size.width &&
      size.initialHeight === size.height &&
      context().node.attrs.width !== size.initialWidth &&
      context().node.attrs.height !== size.initialHeight
    )
  })

  createEffect(() => {
    const selectedValue = selected()
    const el = resizableRoot()
    if (!el) {
      return
    }
    if (selectedValue) {
      el.setAttribute('data-selected', '')
    } else {
      el.removeAttribute('data-selected')
    }
  })

  const undoResize = () => {
    batch(() => {
      setSize('width', size.initialWidth)
      setSize('height', size.initialHeight)
    })
  }

  const [openAltPopover, setOpenAltPopover] = createSignal(false)

  return (
    <ResizableRoot
      width={size.width ?? undefined}
      height={size.height ?? undefined}
      aspectRatio={aspectRatio()}
      onResizeEnd={(event: any) => {
        batch(() => {
          setSize('width', event.detail.width)
          setSize('height', event.detail.height)
        })
      }}
      class={styles.wrapper}
    >
      <Show when={imageSrc() && !error()}>
        <img
          src={imageSrc()}
          onLoad={handleImageLoad}
          class={styles.image}
          ref={(el) => {
            onMount(() => {
              setResizableRoot(el.parentElement)
            })
          }}
        />
      </Show>
      <Show when={uploading() && !error()}>
        <div class={styles.loader}>
          <LucideLoaderCircle size={14} />
        </div>
      </Show>
      <Show when={error()}>Error</Show>

      <div class={styles.actions}>
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
              <h5>Alternative text</h5>
              <div>
                <input
                  autofocus={true}
                  type={'text'}
                  class={'FormControl FormControl-input'}
                  value={context().node.attrs.alt}
                  onChange={(event) => {
                    context().setAttrs({ alt: event.target.value })
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
          <TooltipContent>Alternative text</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            class={styles.action}
            onClick={undoResize}
            disabled={!canRevertToOriginalSize()}
          >
            <LucideUndo2 size={14} />
          </TooltipTrigger>
          <TooltipContent>Revert to original size</TooltipContent>
        </Tooltip>
      </div>

      <ResizableHandle
        class={styles.resizableHandler}
        position="left"
      ></ResizableHandle>

      <ResizableHandle
        class={styles.resizableHandler}
        position="right"
      ></ResizableHandle>
    </ResizableRoot>
  )
}
