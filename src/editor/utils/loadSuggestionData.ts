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
