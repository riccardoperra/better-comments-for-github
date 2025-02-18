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
import { Editor } from './editor/editor'
import styles from './content.module.css'
import './styles.css'

createRoot(() => {
  const [, onAdded] = queryComment()
  onAdded((element) => {
    const suggestionData = loadSuggestionData(element)
    const jsCommentField = element.querySelector<HTMLTextAreaElement>(
      'textarea.js-comment-field',
    )

    let textarea: HTMLTextAreaElement | null = null
    let isOldTextarea: boolean
    let mountElFunction: (node: HTMLElement) => void

    // Old comment component of GitHub, This is still present in pull requests
    if (jsCommentField) {
      isOldTextarea = true
      textarea = jsCommentField

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
      isOldTextarea = false
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

    render(
      () => (
        <div
          data-github-better-comment-wrapper=""
          on:keydown={(event) => {
            event.stopPropagation()
          }}
        >
          <Editor
            isOldTextarea={isOldTextarea}
            suggestions={suggestionData}
            textarea={textarea}
            initialValue={textarea.value}
          />
        </div>
      ),
      root,
    )
  })
})
