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
import LucideImageOff from 'lucide-solid/icons/image-off'
import { createStore } from 'solid-js/store'
import { clsx } from 'clsx'
import { EditorRootContext } from '../../../editor/editor'
import styles from './image-view.module.css'
import { ImageViewActions } from './image-view-actions'
import type { ImageAttrs } from '@prosedoc/markdown-schema'

export function ImageView() {
  const context = useNodeViewContext()
  const { uploadHandler } = useContext(EditorRootContext)!
  const [resizableRoot, setResizableRoot] = createSignal<HTMLElement | null>()
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

  const selected = createMemo(() => context().selected)
  const referenceId = () => context().node.attrs.referenceId
  const attrs = () => context().node.attrs as ImageAttrs
  const url = () => attrs().src || ''
  const uploading = () => gitHubFileRef()?.status === 'progress'

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

    if (ref?.status === 'error') {
      setError(ref.errorMessage ?? 'Cannot upload image')
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
      class={clsx(styles.wrapper, { [styles.isError]: error() })}
    >
      <Show when={imageSrc() && !error()}>
        <img
          alt={attrs().alt ?? ''}
          title={attrs().title ?? ''}
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
      <Show when={error()}>
        {(error) => (
          <div class={styles.errorWrapper} contenteditable={false}>
            <LucideImageOff size={20} />
            <p>{error()}</p>
          </div>
        )}
      </Show>

      <ImageViewActions error={error()} onUndoResize={undoResize} />

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
