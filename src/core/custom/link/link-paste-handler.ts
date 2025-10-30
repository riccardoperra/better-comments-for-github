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

import { Plugin, PluginKey } from 'prosemirror-state'
import { find } from 'linkifyjs'
import { setMark } from '../../../editor/utils/setMark'
import type { MarkType } from 'prosemirror-model'

type PasteHandlerOptions = {
  defaultProtocol: string
  type: MarkType
}

export function pasteHandler(options: PasteHandlerOptions): Plugin {
  return new Plugin({
    key: new PluginKey('pasteLinkHandler'),
    props: {
      handlePaste: (view, _event, slice) => {
        const { state } = view
        const { selection } = state
        const { empty } = selection

        if (empty) {
          return false
        }

        let textContent = ''

        slice.content.forEach((node) => {
          textContent += node.textContent
        })

        const link = find(textContent, {
          defaultProtocol: options.defaultProtocol,
        }).find((item) => item.isLink && item.value === textContent)

        if (!textContent || !link) {
          return false
        }

        return setMark({
          type: options.type,
          attrs: {
            href: link.href,
          },
        })(state, view.dispatch, view)
      },
    },
  })
}
