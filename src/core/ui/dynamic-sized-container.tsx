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

import { animate } from 'motion'
import { createSignal, onCleanup, onMount } from 'solid-js'
import type { FlowProps } from 'solid-js'

interface DynamicSizedContainerProps {}

function toPx(value: number): string {
  return `${value}px`
}

export function DynamicSizedContainer(
  props: FlowProps<DynamicSizedContainerProps>,
) {
  let contentRef!: HTMLDivElement
  let layoutRef!: HTMLDivElement
  const [height] = createSignal('auto')

  onMount(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const observedHeight = entries[0]?.target.clientHeight
      animate(
        layoutRef,
        { height: toPx(observedHeight) },
        { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
      )
    })
    resizeObserver.observe(contentRef)
    return onCleanup(() => resizeObserver.disconnect())
  })

  return (
    <div
      ref={layoutRef}
      style={{
        height: height(),
      }}
    >
      <div ref={contentRef}>{props.children}</div>
    </div>
  )
}
