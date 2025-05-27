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

import { defineDetailsMarkdown } from '@prosedoc/markdown-schema'
import { union } from 'prosekit/core'
import { defineInputRule } from 'prosekit/extensions/input-rule'
import { InputRule } from 'prosemirror-inputrules'
import { Fragment } from 'prosekit/pm/model'
import { pmNode } from '@prosemirror-processor/unist'
import { defineDetailsView } from './details-view'
import type { Schema } from 'prosemirror-model'

function createDetails(schema: Schema) {
  const summary = pmNode(
    schema.nodes.detailsSummary,
    [schema.text('Summary')],
    null,
  )!

  return pmNode(
    schema.nodes.details,
    [summary, schema.nodes.paragraph.createAndFill(null)!],
    { open: true },
    { mode: 'fill' },
  )
}

export function defineDetails() {
  return union(
    defineDetailsMarkdown(),
    defineDetailsView(),
    defineInputRule(
      new InputRule(/<details>\s$/, (state, match, start, end) => {
        let { tr } = state
        const node = createDetails(state.schema)
        if (!node) return null
        const $from = tr.selection.$from
        const parentNode = $from.node($from.depth)
        const input = parentNode.textContent
        const updated = input.slice(0, start - 1) + input.slice(end)
        let offset = 0
        if (updated.length === 0) offset = 1
        tr = tr.replaceWith(start - offset, end, Fragment.fromArray([node]))
        return tr
      }),
    ),
  )
}
