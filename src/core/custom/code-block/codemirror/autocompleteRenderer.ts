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

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import type {
  AutocompleteRenderer,
  TooltipRenderer,
} from '@valtown/codemirror-ts'
import type ts from 'typescript'
import type { HoverInfo } from '@valtown/codemirror-ts/worker'

export const autocompleteRenderer: AutocompleteRenderer = (raw) => {
  return (com) => {
    const div = document.createElement('div')
    if (raw.displayParts) {
      const dp = div.appendChild(document.createElement('div'))
      dp.classList.add('cm-autocomplete-display-parts')
      dp.appendChild(renderDisplayParts(raw.displayParts))
    }

    if (raw.documentation && raw.documentation.length > 0) {
      const description = div.appendChild(document.createElement('div'))
      description.classList.add('cm-autocomplete-description')
      description.appendChild(renderDisplayParts(raw.documentation))
    }

    if (raw.tags) {
      const tags = document.createElement('div')
      div.appendChild(tags)
      tags.style =
        'display: flex; gap: var(--base-size-8); flex-direction: column;'

      const tagsToAdd: {
        [tag: string]: Array<{ content: string }>
      } = {}

      tags.classList.add('cm-autocomplete-description')
      raw.tags.forEach((tag) => {
        if (
          tag.name === 'link' ||
          tag.name === 'description' ||
          tag.name === 'since'
        ) {
          let allText = ''
          tag.text?.forEach((t) => {
            if (t.text) {
              allText += t.text
            }
          })
          const mdText = unified()
            .use(remarkParse)
            .use(remarkRehype)
            .use(rehypeStringify)
            .processSync(allText)

          ;(tagsToAdd[tag.name] ??= []).push({
            content: mdText.value as string,
          })
        }
      })

      Object.entries(tagsToAdd).forEach(([name, values]) => {
        const tagEl = document.createElement('div')
        tagEl.style = 'display: flex; gap: var(--base-size-8);'
        const kind = document.createElement('span')
        kind.style = 'color: var(--fgColor-muted)'
        kind.innerHTML = name

        const content = document.createElement('div')
        content.style =
          'display: flex; flex-direction: column; gap: var(--base-size-4)'
        values.forEach((value) => {
          const item = document.createElement('div')
          item.innerHTML = value.content
          content.appendChild(item)
        })
        content.style.color = 'white'
        tagEl.appendChild(kind)
        tagEl.appendChild(content)
        tags.appendChild(tagEl)
      })
    }

    return { dom: div }
  }
}

function renderDisplayParts(dp: Array<ts.SymbolDisplayPart>) {
  const div = document.createElement('div')
  for (const part of dp) {
    const span = div.appendChild(document.createElement('span'))
    let text = part.text
    if (part.kind === 'text' && dp.length === 1) {
      const mdText = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeStringify)
        .processSync(part.text)
      text = mdText.value as string
    }
    span.className = `quick-info-${part.kind}`
    span.innerHTML = text
  }
  return div
}

export const defaultTooltipRenderer: TooltipRenderer = (info: HoverInfo) => {
  const div = document.createElement('div')
  if (info.quickInfo?.displayParts) {
    div.appendChild(renderDisplayParts(info.quickInfo.displayParts))
  }
  return { dom: div }
}
