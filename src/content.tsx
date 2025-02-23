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

import type { Accessor } from 'solid-js'
import { createRoot } from 'solid-js'
import { queryComment } from './dom/queryComment'
import { createSuggestionData } from './editor/utils/loadSuggestionData'
import styles from './content.module.css'
import './styles.css'
import {
  fetchMentionableUsers,
  getUserAvatarId,
  tryGetReferences,
} from './github/data'
import { mountEditor } from './render'
import { GitHubUploaderNativeHandler } from './core/editor/image/github-file-uploader'
import type {
  AttachmentHandlerElement,
  GitHubUploaderHandler,
} from './core/editor/image/github-file-uploader'
import type { SuggestionData } from './editor/utils/loadSuggestionData'
import type { EditorType } from './editor/editor'

createRoot(() => {
  const [, onAdded] = queryComment()

  onAdded(async (element) => {
    const jsCommentField = element.querySelector<HTMLTextAreaElement>(
      'textarea.js-comment-field',
    )

    let textarea: HTMLTextAreaElement | null = null
    let mountElFunction: (node: HTMLElement) => void
    let suggestionData: Accessor<SuggestionData>
    let type: EditorType
    let uploadHandler: GitHubUploaderHandler | null = null

    // Old comment component of GitHub, This is still present in pull requests
    if (jsCommentField) {
      type = 'native'
      textarea = jsCommentField

      const textExpander = jsCommentField.closest<HTMLElement>('text-expander')
      if (textExpander) {
        const { emojiUrl, issueUrl, mentionUrl } = textExpander.dataset

        const [issues, mentionableUsers] = await Promise.all([
          await tryGetReferences(issueUrl!),
          await fetchMentionableUsers(mentionUrl!),
        ])

        suggestionData = () => ({
          mentions: mentionableUsers.map((data) => ({
            avatarUrl: getUserAvatarId(data.id),
            identifier: data.login,
            description: data.name,
            participant: data.participant,
          })),
          emojis: [],
          references: issues,
          savedReplies: [],
        })
      }

      const fileAttachmentTransfer =
        jsCommentField.closest<AttachmentHandlerElement>('file-attachment')
      if (fileAttachmentTransfer) {
        uploadHandler = new GitHubUploaderNativeHandler(fileAttachmentTransfer)
      }

      // Search for closest tab-container of the textarea.
      // This element is the wrapper of the entire comment box.
      const tabContainer = jsCommentField.closest<HTMLElement>('tab-container')

      if (!tabContainer) {
        // TODO: add log
        return
      }

      // We should create our element before the tab container
      mountElFunction = (node) =>
        tabContainer.insertAdjacentElement('beforebegin', node)
    } else {
      type = 'react'
      const suggestionDataResult = createSuggestionData(element)
      suggestionData = suggestionDataResult.suggestionData
      const moduleContainer = element.querySelector(
        '[class*="MarkdownEditor-module__container"]',
      )!
      textarea = moduleContainer.querySelector<HTMLTextAreaElement>('textarea')

      mountElFunction = (node) => moduleContainer.prepend(node)
    }

    if (!textarea) {
      // add log
      return
    }

    const root = document.createElement('div')
    root.id = 'github-better-comment'
    root.className = styles.injectedEditorContent
    mountElFunction(root)

    mountEditor(root, {
      get suggestionData() {
        return suggestionData()
      },
      uploadHandler,
      get textarea() {
        return textarea
      },
      get initialValue() {
        return textarea.value
      },
      type,
    })
  })
})
