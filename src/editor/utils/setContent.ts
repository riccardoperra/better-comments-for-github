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

import { convertUnistToProsemirror } from 'prosemirror-transformer-markdown/prosemirror'
import { unknownNodeHandler } from '../../core/editor/unknown-node/unknown-node-handler'
import { unistNodeFromMarkdown } from './unistNodeFromMarkdown'
import type { EditorView } from 'prosemirror-view'

export function setEditorContent(
  content: string,
  view: EditorView,
  options: {
    isInitialValue?: boolean
    isFromTextarea?: boolean
    repository: string
    owner: string
  },
) {
  const {
    isInitialValue = false,
    isFromTextarea = false,
    repository,
    owner,
  } = options
  const schema = view.state.schema

  const unistNode = unistNodeFromMarkdown(content, { repository, owner })
  const result = convertUnistToProsemirror(
    unistNode,
    schema,
    unknownNodeHandler(content),
  )

  const tr = view.state.tr

  tr.replaceWith(0, tr.doc.content.size, result)
  if (isInitialValue) {
    tr.setMeta('initial-value', true)
  }
  if (isFromTextarea) {
    tr.setMeta('from-textarea', true)
  }
  view.dispatch(tr)
}
