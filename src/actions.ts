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

import LucideBold from 'lucide-solid/icons/bold'
import LucideItalic from 'lucide-solid/icons/italic'
import LucideStrike from 'lucide-solid/icons/strikethrough'
import LucideCode from 'lucide-solid/icons/code'
import LucideCodeBlock from 'lucide-solid/icons/code-square'
import LucideBlockquote from 'lucide-solid/icons/text-quote'
import LucideAlignLeft from 'lucide-solid/icons/align-left'
import LucideAlignCenter from 'lucide-solid/icons/align-center'
import LucideAlignRight from 'lucide-solid/icons/align-right'
import LucideSuperscript from 'lucide-solid/icons/superscript'
import LucideSubscript from 'lucide-solid/icons/subscript'
import LucideUnderline from 'lucide-solid/icons/underline'
import LucideHeading1 from 'lucide-solid/icons/heading-1'
import LucideHeading2 from 'lucide-solid/icons/heading-2'
import LucideHeading3 from 'lucide-solid/icons/heading-3'
import LucideHeading4 from 'lucide-solid/icons/heading-4'
import LucideHeading5 from 'lucide-solid/icons/heading-5'
import LucideHeading6 from 'lucide-solid/icons/heading-6'
import LucideListCheck from 'lucide-solid/icons/list-check'
import LucideDivider from 'lucide-solid/icons/minus'
import LucideList from 'lucide-solid/icons/list'
import LucideListOrdered from 'lucide-solid/icons/list-ordered'
import LucidePanelBottom from 'lucide-solid/icons/panel-bottom'
import LucideAlertOctagon from 'lucide-solid/icons/alert-octagon'
import LucideTable from 'lucide-solid/icons/table-2'
import LucideLink from 'lucide-solid/icons/link'
import { githubAlertTypeMap } from './core/custom/githubAlert/config'
import type { LucideProps } from 'lucide-solid'
import type { JSXElement } from 'solid-js'

export interface EditorActionConfigData {
  [key: string]: {
    icon?: (props: LucideProps) => JSXElement
    shortcuts: [
      keyboardShorcut?: string | Array<string> | [],
      inputRule?: string,
    ]
  }
}

export const EditorActionConfig = {
  // marks
  bold: {
    icon: LucideBold,
    shortcuts: ['Mod-b'],
  },
  italic: {
    icon: LucideItalic,
    shortcuts: ['Mod-i'],
  },
  strikethrough: {
    icon: LucideStrike,
    shortcuts: [['Mod-shift-s', 'Mod-shift-x']],
  },
  'textAlign>left': {
    icon: LucideAlignLeft,
    shortcuts: ['mod-shift-l'],
  },
  'textAlign>center': {
    icon: LucideAlignCenter,
    shortcuts: ['mod-shift-e'],
  },
  'textAlign>right': {
    icon: LucideAlignRight,
    shortcuts: ['mod-shift-r'],
  },
  code: {
    icon: LucideCode,
    shortcuts: ['mod-e'],
  },
  underline: {
    icon: LucideUnderline,
    shortcuts: ['mod-u'],
  },
  subscript: {
    icon: LucideSubscript,
    shortcuts: ['mod-,'],
  },
  superscript: {
    icon: LucideSuperscript,
    shortcuts: ['mod-.'],
  },
  // nodes
  link: {
    icon: LucideLink,
    shortcuts: [],
  },
  blockquote: {
    icon: LucideBlockquote,
    shortcuts: ['mod-shift-b', '>'],
  },
  horizontalRule: {
    icon: LucideDivider,
    shortcuts: [[], '---'],
  },
  taskList: {
    shortcuts: [[], '[]'],
    icon: LucideListCheck,
  },
  bulletList: {
    shortcuts: [[], '-'],
    icon: LucideList,
  },
  orderedList: {
    shortcuts: [[], '1.'],
    icon: LucideListOrdered,
  },
  codeBlock: {
    icon: LucideCodeBlock,
    shortcuts: [[], '```'],
  },
  alert: {
    icon: LucideAlertOctagon,
    shortcuts: [],
  },
  details: {
    icon: LucidePanelBottom,
    shortcuts: [],
  },
  table: {
    icon: LucideTable,
    shortcuts: [],
  },
  ...Object.values(githubAlertTypeMap).reduce(
    (acc, alert) => ({
      ...acc,
      [`alert>${alert.type}`]: {
        icon: alert.icon,
        shortcuts: [[], `>${alert.label}`],
      },
    }),
    {} as EditorActionConfigData,
  ),
  ...(
    [
      [1, LucideHeading1],
      [2, LucideHeading2],
      [3, LucideHeading3],
      [4, LucideHeading4],
      [5, LucideHeading5],
      [6, LucideHeading6],
    ] as const
  ).reduce(
    (acc, [l, icon]) => ({
      ...acc,
      [`heading>${l}`]: {
        icon: icon,
        shortcuts: [`mod-${l}`, '#'.repeat(l)],
      },
    }),
    {} as EditorActionConfigData,
  ),
} as const satisfies EditorActionConfigData
