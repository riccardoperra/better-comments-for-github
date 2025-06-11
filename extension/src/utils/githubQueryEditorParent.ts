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
  onNodeAdded: (element: HTMLElement) => void
  onNodeRemoved: (element: HTMLElement) => void
}) {
  return query(
    [
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
    ],
    undefined,
    {
      onAdded: options.onNodeAdded,
      onRemoved: options.onNodeRemoved,
    },
  )
}
