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

import { githubAlertTypeMap } from './core/editor/githubAlert/config'

export interface EditorActionConfigData {
  [key: string]: {
    shortcuts: [
      keyboardShorcut?: string | Array<string> | [],
      inputRule?: string,
    ]
  }
}

export const EditorActionConfig: EditorActionConfigData = {
  // marks
  bold: {
    shortcuts: ['Mod-b'],
  },
  italic: {
    shortcuts: ['Mod-i'],
  },
  strikethrough: {
    shortcuts: [['Mod-shift-s', 'Mod-shift-x']],
  },
  'textAlign>left': {
    shortcuts: ['mod-shift-l'],
  },
  'textAlign>center': {
    shortcuts: ['mod-shift-e'],
  },
  'textAlign>right': {
    shortcuts: ['mod-shift-r'],
  },
  code: {
    shortcuts: ['mod-e'],
  },
  // nodes
  blockquote: {
    shortcuts: ['mod-shift-b', '>'],
  },
  horizontalRule: {
    shortcuts: [[], '---'],
  },
  taskList: {
    shortcuts: [[], '[]'],
  },
  bulletList: {
    shortcuts: [[], '-'],
  },
  orderedList: {
    shortcuts: [[], '1.'],
  },
  codeBlock: {
    shortcuts: [[], '```'],
  },
  ...Object.values(githubAlertTypeMap).reduce(
    (acc, alert) => ({
      ...acc,
      [`alert>${alert.type}`]: {
        shortcuts: [[], `>${alert.label}`],
      },
    }),
    {} as EditorActionConfigData,
  ),
  ...[1, 2, 3, 4, 5, 6].reduce(
    (acc, l) => ({
      ...acc,
      [`heading>${l}`]: {
        shortcuts: [`mod-${l}`, '#'.repeat(l)],
      },
    }),
    {} as EditorActionConfigData,
  ),
} as const
