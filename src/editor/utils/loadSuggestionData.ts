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

import { getFiberFromHostInstance, traverseFiber } from 'bippy'

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
}

export interface SuggestionData {
  mentions: Array<MentionSuggestion>
  references: Array<ReferenceSuggestion>
  savedReplies: Array<SavedReplySuggestion>
  emojis: Array<EmojiSuggestion>
}

export function getGitHubEditorInstanceFiber(element: HTMLElement) {
  let fiber = getFiberFromHostInstance(element)
  traverseFiber(fiber, (node) => {
    if (node.memoizedProps.mentionSuggestions) {
      fiber = node
      return true
    }
    return false
  })
  return fiber
}

export function loadSuggestionData(element: HTMLElement): SuggestionData {
  const data: SuggestionData = {
    mentions: [],
    references: [],
    savedReplies: [],
    emojis: [],
  }

  const fiber = getFiberFromHostInstance(element)

  traverseFiber(fiber, (node) => {
    if (node.memoizedProps.mentionSuggestions) {
      const {
        mentionSuggestions,
        referenceSuggestions,
        savedReplies,
        emojiSuggestions,
      } = node.memoizedProps as any

      data.mentions = mentionSuggestions
      data.emojis = emojiSuggestions
      data.savedReplies = savedReplies
      data.references = referenceSuggestions
      return true
    }
    return false
  })

  return data
}
