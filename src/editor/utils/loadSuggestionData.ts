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
  createEffect,
  createMemo,
  createSignal,
  getOwner,
  runWithOwner,
} from 'solid-js'
import {
  getFiber,
  traverseFiber,
  waitForReactFiber,
} from '../../react-hacks/fiber'
import type { Accessor, JSXElement } from 'solid-js'
import type { Fiber } from '../../react-hacks/fiber'

export interface MentionSuggestion {
  avatarUrl: string
  description: string
  identifier: string
  participant: boolean
}

export interface ReferenceSuggestion {
  iconHtml: string
  id: string
  titleHtml: string
  titleText: string
}

export interface SavedReplySuggestion {
  name: string
  content: string
}

export interface EmojiSuggestion {
  name: string
  character: string
  fallback?: () => JSXElement
}

export interface SuggestionData {
  mentions: Array<MentionSuggestion>
  references: Array<ReferenceSuggestion>
  savedReplies: Array<SavedReplySuggestion>
  emojis: Array<EmojiSuggestion>
}

export function createSuggestionData(element: HTMLElement) {
  const [data, setData] = createSignal<SuggestionData>({
    mentions: [],
    references: [],
    savedReplies: [],
    emojis: [],
  })
  const owner = getOwner()
  const fiber = getFiber(element)

  function register(fiber: Fiber) {
    const _suggestionData = makeSuggestionData(fiber)
    runWithOwner(owner, () => {
      createEffect(() => {
        const suggestionData = _suggestionData()
        setData(() => ({
          emojis: suggestionData.emojis,
          mentions: suggestionData.mentions,
          references: suggestionData.references,
          savedReplies: suggestionData.savedReplies,
        }))
      })
    })
  }
  if (!fiber) {
    waitForReactFiber(element).then((fiber) => {
      register(fiber)
    })
  } else {
    register(fiber)
  }

  return {
    suggestionData: data,
  }
}

function getEditorFiber(fiber: Fiber) {
  const result = traverseFiber(fiber, false, (sel) => {
    return !!sel.memoizedProps.mentionSuggestions
  })

  if (!result) {
    return null
  }
  return result
}

function makeSuggestionData(fiber: Fiber): Accessor<SuggestionData> {
  fiber = getEditorFiber(fiber)
  const [notifier, notify] = createSignal()

  setTimeout(() => {
    notify({})
    setTimeout(() => {
      notify({})
    }, 500)
  }, 500)

  const getDataFromFiber = () => {
    notifier()

    return {
      mentions: fiber.memoizedProps.mentionSuggestions,
      emojis: fiber.memoizedProps.emojiSuggestions,
      savedReplies: fiber.memoizedProps.savedReplies,
      references: fiber.memoizedProps.referenceSuggestions,
    } as SuggestionData
  }

  return createMemo(getDataFromFiber)
}
