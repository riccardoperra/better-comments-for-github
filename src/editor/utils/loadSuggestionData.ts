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

export function loadSuggestionData(element: HTMLElement): SuggestionData {
  const data: SuggestionData = {
    mentions: [],
    references: [],
    savedReplies: [],
    emojis: [],
  }

  let fiber
  for (const key in element) {
    if (key.includes('__reactFiber')) {
      fiber = element[key as keyof typeof element] as Record<string, any> | null
      break
    }
  }

  const result = traverseFiber2(fiber, false, (sel) => {
    return !!sel.memoizedProps.mentionSuggestions
  })

  data.mentions = result.memoizedProps.mentionSuggestions
  data.emojis = result.memoizedProps.emojiSuggestions
  data.savedReplies = result.memoizedProps.savedReplies
  data.references = result.memoizedProps.referenceSuggestions

  return data
}

export function traverseFiber2<T = any>(
  fiber: any,
  ascending: boolean,
  selector: any,
) {
  if (!fiber) return
  if (selector(fiber) === true) return fiber

  let child = ascending ? fiber.return : fiber.child
  while (child) {
    const match = traverseFiber2(child, ascending, selector)
    if (match) return match

    child = ascending ? null : child.sibling
  }
}
