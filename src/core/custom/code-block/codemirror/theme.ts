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

import { EditorView } from 'codemirror'
import { githubDark } from '@uiw/codemirror-theme-github'

export const cmTheme = [
  githubDark,
  EditorView.theme({
    '&': {
      backgroundColor: 'transparent !important',
      outline: 'none',
    },
    '.cm-line': {
      paddingInline: 0,
    },
    '.cm-content': {
      padding: 0,
      outline: 'none',
    },
    '.cm-tooltip': {
      backgroundColor: 'var(--overlay-bgColor)',
      boxShadow: 'var(--shadow-floating-small)',
      borderRadius: 'var(--borderRadius-medium)',
    },
    '.cm-tooltip-hover': {
      padding: 'var(--base-size-16) var(--base-size-12)',
    },
    '.cm-tooltip .cm-completionInfo': {
      maxHeight: '400px',
      overflow: 'auto',
      isolation: 'isolate',
      padding: 'var(--base-size-16) var(--base-size-12)',
      maxWidth: '700px',
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li': {
        fontSize: '14px',
        padding: '6px !important',
        paddingRight: '8px !important',
        paddingLeft: '8px !important',
      },
      '& > ul > li[aria-selected]': {
        backgroundColor: `var(--control-bgColor-active)`,
      },
      '& > ul > li > div.cm-completionIcon': {
        marginRight: '4px !important',
        fontSize: '14px',
      },
    },
  }),
]
