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

import { addMark, defineCommands, defineMarkSpec, union } from 'prosekit/core'
import { defineLink } from 'prosekit/extensions/link'
import {
  fromProseMirrorMark,
  toProseMirrorMark,
} from '@prosemirror-processor/unist/mdast'
import type { LinkAttrs as $LinkAttrs } from 'prosekit/extensions/link'
import { Link } from 'mdast'

export type LinkAttrs = $LinkAttrs & { title?: string | null }

export function defineLinkMarkdown() {
  return union(
    defineLink(),
    defineMarkSpec({
      name: 'link',
      attrs: {
        title: {
          default: null,
        },
      },
      __toUnist: (mark, node, children, context) => {
        return fromProseMirrorMark('link', (mark) => {
          const attrs = mark.attrs as LinkAttrs & { title?: string }
          return {
            url: attrs.href,
            title: attrs.title,
          }
        })(
          mark,
          node,
          children,
          // @ts-expect-error TODO: fix context type
          context,
        )
      },
      __fromUnist: toProseMirrorMark('link', (link) => {
        const _link = link as Link
        return {
          href: _link.url,
          title: _link.title,
        }
      }),
    }),
    defineCommands({
      addLink: (attrs: LinkAttrs) => addMark({ type: 'link', attrs }),
    }),
  )
}
