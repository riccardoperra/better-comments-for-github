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

import {
  defineCommands,
  defineKeymap,
  defineNodeSpec,
  insertNode,
  isAtBlockStart,
  toggleWrap,
  union,
  wrap,
} from 'prosekit/core'
import { defineWrappingInputRule } from 'prosekit/extensions/input-rule'
import { joinBackward } from 'prosemirror-commands'
import { createProseMirrorNode } from 'prosemirror-transformer-markdown/prosemirror'
import { defineSolidNodeView } from 'prosekit/solid'
import { AlertView } from './AlertView'
import { githubAlertTypeMap } from './config'
import type { GithubAlertType } from './config'
import type { Command } from 'prosemirror-state'

function defineGitHubAlertCommands() {
  return defineCommands({
    setAlert: (type: GithubAlertType) => {
      return wrap({ type: 'githubAlert', attrs: { type } })
    },
    insertAlert: (type: GithubAlertType) => {
      return insertNode({ type: 'githubAlert', attrs: { type } })
    },
    toggleAlert: (type: GithubAlertType) => {
      return toggleWrap({ type: 'githubAlert', attrs: { type } })
    },
  })
}

function defineGitHubAlertInputRule() {
  return union(
    ...Object.values(githubAlertTypeMap).map((map) =>
      defineWrappingInputRule({
        regex: map.shortcutRegexp,
        type: 'githubAlert',
        attrs: {
          type: map.type,
        },
      }),
    ),
  )
}

function backspaceUnsetBlockquote(): Command {
  return (state, dispatch, view) => {
    const $pos = isAtBlockStart(state, view)
    if ($pos?.node(-1).type.name === 'githubAlert') {
      return joinBackward(state, dispatch, view)
    }
    return false
  }
}

function defineGitHubAlertKeymap() {
  return defineKeymap({
    Backspace: backspaceUnsetBlockquote(),
  })
}

function defineGitHubAlertSpec() {
  return defineNodeSpec({
    name: 'githubAlert',
    content: 'block+',
    parseDOM: [{ tag: 'blockquote' }],
    attrs: {
      type: {
        default: 'note',
      },
    },
    toDOM: (node) => {
      return [
        'div',
        {
          'data-tip-type': node.attrs.type || 'info',
        },
        0,
      ]
    },
    toUnist(node, children) {
      const type = githubAlertTypeMap[node.attrs.type as GithubAlertType]

      return [
        {
          type: 'blockquote',
          children: [{ type: 'text', value: type.match }, ...children],
        },
      ]
    },
    unistToNode(node, schema, children, context) {
      return createProseMirrorNode('githubAlert', schema, children, {
        type: node.variant,
      })
    },
  })
}

function defineGitHubAlertSpecView() {
  return defineSolidNodeView({
    name: 'githubAlert',
    component: AlertView,
    contentAs: 'div',
  })
}

export function defineGitHubAlert() {
  return union(
    defineGitHubAlertSpec(),
    defineGitHubAlertInputRule(),
    defineGitHubAlertCommands(),
    defineGitHubAlertKeymap(),
    defineGitHubAlertSpecView(),
  )
}
