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
  defineBaseCommands,
  defineBaseKeymap,
  defineHistory,
  defineNodeSpec,
  union,
} from 'prosekit/core'
import { defineDropCursor } from 'prosekit/extensions/drop-cursor'
import { defineGapCursor } from 'prosekit/extensions/gap-cursor'
import { defineList } from 'prosekit/extensions/list'
import { defineModClickPrevention } from 'prosekit/extensions/mod-click-prevention'
import { defineVirtualSelection } from 'prosekit/extensions/virtual-selection'
import { definePlaceholder } from 'prosekit/extensions/placeholder'

import {
  defineBlockquoteMarkdown,
  defineBoldMarkdown,
  defineCodeMarkdown,
  defineDocMarkdown,
  defineHeadingMarkdown,
  defineHorizontalRuleMarkdown,
  defineImageMarkdown,
  defineItalicMarkdown,
  defineLinkMarkdown,
  defineParagraphMarkdown,
  defineStrikethroughMarkdown,
  defineTableMarkdown,
  defineTextMarkdown,
} from '@prosedoc/markdown-schema'
import { defineTextAlign } from 'prosekit/extensions/text-align'
import { defineCodeBlock } from './code-block/code-block'
import { defineHardbreak } from './hardbreak/hardbreak'
import { defineMentionMarkdown } from './user-mention/mention'
import { defineGitHubAlert } from './githubAlert/alert'
import type { HeadingAttrs } from 'prosekit/extensions/heading'

export function defineMarkdownExtension() {
  return union(
    defineDocMarkdown(),
    defineTextMarkdown(),
    defineHeadingMarkdown(),
    defineHistory(),
    defineList(),
    defineBlockquoteMarkdown(),

    defineBaseKeymap(),
    defineBaseCommands(),

    defineItalicMarkdown(),
    defineBoldMarkdown(),
    defineStrikethroughMarkdown(),
    defineCodeMarkdown(),

    defineLinkMarkdown(),
    defineImageMarkdown(),
    defineParagraphMarkdown(),

    defineHardbreak(),

    defineDropCursor(),
    defineGapCursor(),
    defineHorizontalRuleMarkdown(),
    defineVirtualSelection(),
    defineModClickPrevention(),
    defineTableMarkdown(),
  )
}

export function defineExtension() {
  return union(
    defineMarkdownExtension(),
    defineTextAlign({ types: ['paragraph', 'heading'] }),
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
    defineMentionMarkdown(),
    defineGitHubAlert(),
    defineNodeSpec({
      name: 'doc',
      content: '(block|githubAlert)+',
      topNode: true,
    }),
  )
}

export function getExtensionSchema() {
  return defineExtension().schema!
}

export type EditorExtension = ReturnType<typeof defineExtension>
