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

import {
  Priority,
  defineBaseCommands,
  defineBaseKeymap,
  defineHistory,
  defineMarkSpec,
  defineNodeSpec,
  union,
  withPriority,
} from 'prosekit/core'
import { defineDropCursor } from 'prosekit/extensions/drop-cursor'
import { defineGapCursor } from 'prosekit/extensions/gap-cursor'
import { defineModClickPrevention } from 'prosekit/extensions/mod-click-prevention'
import { defineVirtualSelection } from 'prosekit/extensions/virtual-selection'
import { definePlaceholder } from 'prosekit/extensions/placeholder'

import {
  defineBlockquoteMarkdown,
  defineBoldMarkdown,
  defineCodeMarkdown,
  defineDocMarkdown,
  defineHardbreakMarkdown,
  defineHeadingMarkdown,
  defineHorizontalRuleMarkdown,
  defineImageMarkdown,
  defineItalicMarkdown,
  defineLinkMarkdown,
  defineListMarkdown,
  defineParagraphMarkdown,
  defineStrikethroughMarkdown,
  defineSubscriptMarkdown,
  defineSuperscriptMarkdown,
  defineTableMarkdown,
  defineTextMarkdown,
  defineUnderlineMarkdown,
} from '@prosedoc/markdown-schema'
import { defineTextAlign } from 'prosekit/extensions/text-align'
import { defineSolidNodeView } from 'prosekit/solid'
import { defineCodeBlock } from '../custom/code-block/code-block'
import { defineGitHubAlert } from '../custom/githubAlert/alert'
import { defineMentionMarkdown } from '../custom/user-mention/mention'
import { UserMentionView } from '../custom/user-mention/UserMentionView/UserMentionView'
import { defineUnknownNodeSpec } from '../custom/unknown-node/unknown-node'
import { defineGitHubIssueReference } from '../custom/issue-reference/issue'
import { defineImageExtension } from '../custom/image/extension'
import { defineComment } from '../custom/comment/comment'
import { defineExitable } from './exitable/exitable'
import type { HeadingAttrs } from 'prosekit/extensions/heading'

function defineCode() {
  return union(
    defineCodeMarkdown(),
    defineMarkSpec({ name: 'code', exitable: true }),
  )
}

export function defineMarkdownExtension() {
  return union(
    defineDocMarkdown(),
    defineTextMarkdown(),
    defineHeadingMarkdown(),
    defineHistory(),
    defineListMarkdown(),
    defineBlockquoteMarkdown(),

    defineBaseKeymap(),
    defineBaseCommands(),

    defineItalicMarkdown(),
    defineBoldMarkdown(),
    defineStrikethroughMarkdown(),
    defineCode(),

    defineSuperscriptMarkdown(),
    defineSubscriptMarkdown(),
    defineUnderlineMarkdown(),
    defineGitHubIssueReference(), // to define before to allow copy-paste from link issue
    defineLinkMarkdown(),
    defineImageMarkdown(),
    defineParagraphMarkdown(),

    defineHardbreakMarkdown(),
    defineComment(),

    defineDropCursor(),
    defineGapCursor(),
    defineHorizontalRuleMarkdown(),
    defineVirtualSelection(),
    defineModClickPrevention(),
    defineTableMarkdown(),
    defineUnknownNodeSpec(),
  )
}

export function defineExtension() {
  return union(
    defineMarkdownExtension(),
    defineNodeSpec({
      name: 'doc',
      content: '(block|githubAlert)+',
      topNode: true,
    }),
    // Mention should be defined before link in order to support pasting content
    withPriority(defineMentionMarkdown(), Priority.high),
    defineTextAlign({ types: ['paragraph', 'heading'] }),
    defineExitable(),
    definePlaceholder({
      placeholder: (state) => {
        const node = state.selection.$from.node()
        if (node.type.name === 'heading') {
          const attrs = node.attrs as HeadingAttrs
          return `Heading ${attrs.level}`
        }

        return `Write something, or press '/' for commands...`
      },
    }),
    defineCodeBlock(),
    defineGitHubAlert(),
    defineImageExtension(),
    defineSolidNodeView({
      name: 'mention',
      as: 'span',
      contentAs: 'span',
      component: UserMentionView,
    }),
  )
}

export function getExtensionSchema() {
  return defineExtension().schema!
}

export type EditorExtension = ReturnType<typeof defineExtension>
