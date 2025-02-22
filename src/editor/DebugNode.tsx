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

import { useStateUpdate } from 'prosekit/solid'
import { createSignal, onMount } from 'solid-js'
import styles from './DebugNode.module.css'
import type { Accessor } from 'solid-js'
import type { Editor } from 'prosekit/core'
import type { ProseMirrorNode } from 'prosemirror-transformer-markdown/prosemirror'
import type { EditorState } from 'prosemirror-state'

export interface DebugNodeProps {
  editor: Editor
}

export function DebugNode(props: DebugNodeProps) {
  const [value, setValue] = createSignal<any>()

  onMount(() => {
    const tree = debugNodeTree(
      props.editor.state.doc,
      props.editor.state,
      () => props.editor.state.selection,
    )
    setValue(formatTree(tree))
  })

  useStateUpdate(
    (state) => {
      const tree = debugNodeTree(
        state.doc,
        props.editor.state,
        () => props.editor.state.selection,
      )
      setValue(formatTree(tree))
    },
    { editor: props.editor },
  )

  return (
    <div class={styles.DebugAnchor}>
      <pre innerHTML={value()} />
    </div>
  )
}

function debugNodeTree(
  node: ProseMirrorNode,
  state: EditorState,
  cursor: Accessor<{ from: number; to: number } | null>,
) {
  return layerJson(node, 0, 0, state, cursor)
}

type DebugTreeItem = {
  attrs: Record<string, any>
  type: string
  text: string | null
  depth: number
  from: number
  to?: number
  children: Array<DebugTreeItem>
  isSelected: () => boolean
}

function formatNodeAttrs(attrs: Record<string, any>): string {
  let str = ''
  for (const attr in attrs) {
    str += `${attr}=${attrs[attr]},`
  }
  if (str === '') {
    return ''
  }
  if (str.at(-1) === ',') {
    str = str.slice(0, str.length - 1)
  }
  return `<small style="color: var(--fgColor-muted); font-size: 12px">{${str}}</small>`
}

function formatTree(node: DebugTreeItem) {
  let output = ''
  const prefix =
    '  '.repeat(node.depth) +
    (node.isSelected() ? '> ' : '') +
    `├ (${node.from}) ${node.type} ${formatNodeAttrs(node.attrs)} \n`

  if (node.text) {
    output +=
      '  '.repeat(node.depth + 1) +
      (node.isSelected() ? '> ' : '') +
      `└ (${node.from}) text "${node.text}"\n`
  } else {
    output += prefix
  }

  node.children.forEach((child) => {
    output += formatTree(child)
  })

  return output
}

const layerJson = (
  node: ProseMirrorNode,
  start = 0,
  depth = 0,
  state: EditorState,
  cursor: Accessor<{ from: number; to: number } | null>,
): DebugTreeItem => {
  const isDoc = node.type.name === 'doc'
  const end = start + node.nodeSize
  const children = [] as Array<DebugTreeItem>

  const obj: DebugTreeItem = {
    type: node.type.name,
    text: node.isText ? node.textContent : null,
    depth,
    from: start,
    to: end,
    children,
    attrs: node.attrs,
    isSelected: () => {
      const $cursor = cursor()
      if (!$cursor) {
        return false
      }
      if (node.type.name === 'doc') {
        return false
      }
      if ($cursor.from === $cursor.to) {
        if ($cursor.from >= start && $cursor.to <= end) {
          return children.length === 0
        }
        return false
      } else if ($cursor.from === start && $cursor.to === end) {
        return true
      } else if ($cursor.from >= start && $cursor.to <= end) {
        // Current node is a group, then it will not be marked as
        // selected if a child could be.
        return children.length === 0
      } else {
        return false
      }
    },
  }

  let pos = isDoc ? 0 : start + 1

  if (!node.isText) {
    node.forEach((child) => {
      const end = pos + child.nodeSize
      const resolvedPos = state.doc.resolve(pos)
      children.push(layerJson(child, pos, resolvedPos.depth, state, cursor))
      pos = end
    })
  }

  return obj
}
