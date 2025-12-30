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
import { getFiber, waitForReactFiber } from '../../react-hacks/fiber'
import type { Fiber } from '../../react-hacks/fiber'
import type { Accessor } from 'solid-js'

//  CommentBox.tsx GitHub source code
export interface SuggestedChangeConfig {
  filePath: string | undefined
  showSuggestChangesButton: boolean
  sourceContentFromDiffLines: string | undefined
  onInsertSuggestedChange: () => void
  shouldInsertSuggestedChange?: boolean
}

export function createSuggestedChangeConfigData(element: HTMLElement) {
  const [data, setData] = createSignal<SuggestedChangeConfig | undefined>({
    filePath: undefined,
    showSuggestChangesButton: false,
    sourceContentFromDiffLines: undefined,
    onInsertSuggestedChange: () => void 0,
    shouldInsertSuggestedChange: undefined,
  })
  const fiber = getFiber(element)

  if (!fiber) {
    waitForReactFiber(element)
      .then((fiber) => {
        setData(getSuggestedChangesConfig(fiber))
      })
      .catch(() => {})
  } else {
    setData(getSuggestedChangesConfig(fiber))
  }

  return data
}

function getSuggestedChangesConfig(
  fiber: Fiber,
): Accessor<SuggestedChangeConfig | undefined> {
  return () => {
    if (fiber.return.elementType.displayName !== 'CommentBox') {
      return undefined
    }
    const props = fiber.return.memoizedProps
    return {
      ...props.suggestedChangesConfig,
      filePath: props.filePath,
    }
  }
}

function getSafeSuggestionValueValue<T>(value: unknown, fallback: T): T {
  if (value === 'loading') {
    return fallback
  }
  if (typeof value === typeof fallback) {
    return value as T
  }
  return fallback
}
