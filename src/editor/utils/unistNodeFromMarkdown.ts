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

import { unistNodeFromMarkdown as coreUnistNodeFromMarkdown } from 'prosemirror-transformer-markdown/unified'
import {
  remarkFlatList,
  remarkHtmlHardbreak,
  remarkHtmlImage,
  remarkInlineImage,
} from '@prosedoc/markdown-schema'
import { remarkGitHubAlert } from '../../core/editor/githubAlert/remarkGitHubAlert'
import { remarkParseLinkToGitHubIssueReference } from '../../core/editor/issue-reference/remarkGitHubIssueReference'

export function unistNodeFromMarkdown(content: string) {
  return coreUnistNodeFromMarkdown(content, {
    transformers: [
      { type: 'remarkPlugin', handler: remarkGitHubAlert },
      { type: 'remarkPlugin', handler: remarkFlatList },
      { type: 'remarkPlugin', handler: remarkHtmlImage },
      { type: 'remarkPlugin', handler: remarkInlineImage },
      { type: 'remarkPlugin', handler: remarkHtmlHardbreak },
      { type: 'remarkPlugin', handler: remarkParseLinkToGitHubIssueReference },
    ],
  })
}
