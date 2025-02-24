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
import type { LinkAttrs as $LinkAttrs } from 'prosekit/extensions/link'
import type { Link, PhrasingContent } from 'mdast'

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
      toUnist(node, mark): Link {
        const attrs = mark.attrs as LinkAttrs & { title?: string }
        return {
          type: 'link',
          children: [node] as Array<PhrasingContent>,
          url: attrs.href,
          title: attrs.title,
        }
      },
      unistToNode(node, schema, children, context) {
        const link = node as Link
        return children.map((child) =>
          child.mark(
            child.marks.concat(
              schema.marks.link.create({
                href: link.url,
                title: link.title,
              }),
            ),
          ),
        )
      },
    }),
    defineCommands({
      addLink: (attrs: LinkAttrs) => addMark({ type: 'link', attrs }),
    }),
  )
}
