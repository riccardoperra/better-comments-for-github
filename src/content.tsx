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

import { createRoot } from 'solid-js'
import { render } from 'solid-js/web'
import { queryComment } from './dom/queryComment'
import { loadSuggestionData } from './editor/utils/loadSuggestionData'
import { Editor, EditorRootContext } from './editor/editor'
import styles from './content.module.css'
import type { SuggestionData } from './editor/utils/loadSuggestionData'
import './styles.css'
import {
  fetchIssues,
  fetchMentionableUsers,
  getUserAvatarId,
} from './github/data'

async function waitForReactFiber(
  element: HTMLElement,
  interval = 150,
  timeout = 3000,
) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()

    function check() {
      if (!element) {
        reject(new Error('Element not found'))
        return
      }

      let fiber: any

      for (const key in element) {
        if (key.includes('react')) {
          console.log('find something', element[key])
          fiber = element[key]
          break
        }
      }
      if (fiber) {
        resolve(fiber)
        return
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for React Fiber'))
        return
      }

      setTimeout(check, interval)
    }

    check()
  })
}

setTimeout(() => {
  createRoot(() => {
    const [, onAdded] = queryComment()
    onAdded(async (element) => {
      const jsCommentField = element.querySelector<HTMLTextAreaElement>(
        'textarea.js-comment-field',
      )

      let textarea: HTMLTextAreaElement | null = null
      let mountElFunction: (node: HTMLElement) => void
      let suggestionData: SuggestionData

      let isOldTextarea = false
      // Old comment component of GitHub, This is still present in pull requests
      if (jsCommentField) {
        isOldTextarea = true
        textarea = jsCommentField

        const textExpander =
          jsCommentField.closest<HTMLElement>('text-expander')
        if (textExpander) {
          const { emojiUrl, issueUrl, mentionUrl } = textExpander.dataset

          const [issues, mentionableUsers] = await Promise.all([
            await fetchIssues(issueUrl!),
            await fetchMentionableUsers(mentionUrl!),
          ])

          suggestionData = {
            mentions: mentionableUsers.map((data) => ({
              avatarUrl: getUserAvatarId(data.id),
              identifier: data.login,
              description: data.name,
              participant: data.participant,
            })),
            // emojis: emojiUrlResponse,
            references: issues,
            savedReplies: [],
          }
        }

        // Search for closest tab-container of the textarea.
        // This element is the wrapper of the entire comment box.
        const tabContainer =
          jsCommentField.closest<HTMLElement>('tab-container')

        if (!tabContainer) {
          // TODO: add log
          return
        }

        // We should create our element before the tab container
        mountElFunction = (node) =>
          tabContainer.insertAdjacentElement('beforebegin', node)
      } else {
        isOldTextarea = false
        await waitForReactFiber(element)

        suggestionData = loadSuggestionData(element)

        const moduleContainer = element.querySelector(
          '[class*="MarkdownEditor-module__container"]',
        )!
        textarea =
          moduleContainer.querySelector<HTMLTextAreaElement>('textarea')

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

      render(
        () => (
          <div
            data-github-better-comment-wrapper=""
            on:keydown={(event) => {
              event.stopPropagation()
            }}
          >
            <EditorRootContext.Provider
              value={{
                get data() {
                  return suggestionData
                },
                get initialValue() {
                  return textarea.value
                },
                textarea,
                isOldTextarea,
              }}
            >
              <Editor
                isOldTextarea={isOldTextarea}
                suggestions={suggestionData}
                textarea={textarea}
                initialValue={textarea.value}
              />
            </EditorRootContext.Provider>
          </div>
        ),
        root,
      )
    })
  })
}, 1000)
