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

import type { ToProseMirrorNodeHandler } from '@prosemirror-processor/unist/mdast'
import type { Nodes } from 'mdast'

export const unknownNodeHandler: (
  raw: string,
) => ToProseMirrorNodeHandler<Nodes> = (raw) => (node, parent, context) => {
  const { position } = node
  if (position) {
    const start = position.start.offset || 0
    const end = position.end.offset || 0
    const slice = raw.slice(start, end)
    const rows = slice.split('\n')
    const content = rows.flatMap((row) => [
      context.schema.text(row),
      context.schema.nodes.hardBreak.create(),
    ])
    return context.schema.nodes.unknownBlock.createChecked(null, content)
  }
  return []
}
