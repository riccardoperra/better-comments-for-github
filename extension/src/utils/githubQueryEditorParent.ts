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

import { query } from '@better-comments-for-github/core/dom/query'

export function githubQueryEditorParent(options: {
  onNodeAdded: (textarea: HTMLTextAreaElement, parent: HTMLElement) => void
  onNodeRemoved: (textarea: HTMLTextAreaElement) => void
}) {
  // new SelectorObserver(document.body).observe('textarea', {
  // add: (x) => console.log('add selector observer', x),
  // remove: (x) => console.log('remove SELECTOR OBSERVER', x),
  // })
  return query('textarea', document.body, {
    onAdded: (textarea) => {
      const parents = [
        // Only if slash-command feature flag is enabled
        'slash-command-expander',
        //
        'fieldset[class*=MarkdownEditor-module__fieldSet]',
        'div[class*=MarkdownEditor-module__container]',
        '[class*=IssueCommentComposer-module__commentComposerWrapper]',
        'tab-container',
        // PR edit
        '.js-previewable-comment-form',
        '.js-inline-comment-form',
        // PR code review comments
        '.inline-comments',
      ]
      while (parents.length) {
        const parent = parents.shift()
        const closestElement = !!parent && textarea.closest(parent)
        if (closestElement) {
          options.onNodeAdded(
            textarea as HTMLTextAreaElement,
            closestElement as HTMLElement,
          )
          break
        }
      }
    },
    onRemoved: (textarea) => {
      options.onNodeRemoved(textarea as HTMLTextAreaElement)
    },
  })
}
