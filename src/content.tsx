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

setTimeout(() => {
  createRoot(() => {
    const [, onAdded] = queryComment()

    onAdded((element) => {
      const suggestionData = loadSuggestionData(element)

      const viewTabs = element.querySelector<HTMLElement>(
        '[class*="ViewSwitch-module"]',
      )

      const moduleContainer = element.querySelector(
        '[class*="MarkdownEditor-module__container"]',
      )!

      const inputWrapper = moduleContainer.firstElementChild
      const textarea = inputWrapper!.querySelector('textarea')
      const container = document.createElement('div')

      // const switchButton = document.createElement('button')
      // switchButton.classList.add('btn')
      // switchButton.innerHTML = 'Back to default editor'
      //
      // container.appendChild(switchButton)

      moduleContainer.prepend(container)

      if (textarea) {
        const root = document.createElement('div')
        root.id = 'github-better-comment'
        root.className = styles.injectedEditorContent
        container.appendChild(root)

        root.addEventListener('keydown', (event) => {
          event.stopPropagation()
        })

        render(
          () => (
            <Editor
              suggestions={suggestionData}
              textarea={textarea}
              initialValue={textarea.value}
            />
          ),
          root,
        )
      }
    })
  })
}, 50)
