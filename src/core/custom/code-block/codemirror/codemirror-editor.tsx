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

import type {
  SolidNodeViewComponent,
  SolidNodeViewUserOptions,
} from '@prosemirror-adapter/solid'
import { useNodeViewContext } from '@prosemirror-adapter/solid'
import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  useContext,
} from 'solid-js'
import { defineNodeViewComponent } from 'prosekit/core'
import { Selection, TextSelection } from 'prosemirror-state'
import { exitCode } from 'prosemirror-commands'
import { redo, undo } from 'prosekit/pm/history'
import { keymap } from '@codemirror/view'
import '../codemirror-view.css'
import { EditorView as CodeMirror } from 'codemirror'
import { Dynamic } from 'solid-js/web'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import {
  createCodeMirror,
  createLazyCompartmentExtension,
} from 'solid-codemirror'
import { GapCursor } from 'prosemirror-gapcursor'
import { cmTheme } from './theme'
import { initTsAutocompleteWorker, typescriptPlugins } from './tsPlugins'
import type { KeyBinding, ViewUpdate } from '@codemirror/view'
import type { Accessor, Component, Setter } from 'solid-js'
import type { ProseMirrorNode } from 'prosemirror-transformer-markdown/prosemirror'
import type { SolidNodeViewOptions, SolidNodeViewProps } from 'prosekit/solid'

export const CodeMirrorContext = createContext<{
  cm: Accessor<CodeMirror | null>
  setCm: Setter<CodeMirror | null>
  updating: Accessor<boolean>
  setUpdating: Setter<boolean>
}>()

function withNodeViewProps(
  component: SolidNodeViewComponent,
  cmProps: {
    cm: Accessor<CodeMirror | null>
    setCm: Setter<CodeMirror | null>
    updating: Accessor<boolean>
    setUpdating: Setter<boolean>
  },
): Component<SolidNodeViewProps> {
  return function NodeViewPropsWrapper() {
    const props: Accessor<SolidNodeViewProps> = useNodeViewContext()

    return (
      <CodeMirrorContext.Provider value={cmProps}>
        <Dynamic component={component} {...props()} />
      </CodeMirrorContext.Provider>
    )
  }
}

export function defineCodeBlockCustomView(options: SolidNodeViewOptions) {
  const { name, component, ...userOptions } = options

  const [updating, setUpdating] = createSignal(false)
  const [cm, setCm] = createSignal<CodeMirror | null>(null)
  const [_node, setNode] = createSignal<ProseMirrorNode>()

  const args: SolidNodeViewUserOptions = {
    ...userOptions,
    setSelection(anchor, head) {
      const codemirror = cm()
      if (!codemirror) return
      codemirror.focus()
      setUpdating(true)
      codemirror.dispatch({ selection: { anchor, head } })
      setUpdating(false)
    },
    selectNode() {
      if (cm()) {
        cm()!.focus()
      }
    },
    stopEvent() {
      return false
    },
    ignoreMutation: () => true,
    update: (node) => {
      const cmView = cm()
      if (!cmView) return false
      if (_node() && node.type != _node()!.type) return false
      setNode(node)
      if (updating()) return true
      const newText = node.textContent,
        curText = cmView.state.doc.toString()
      if (newText != curText) {
        let start = 0,
          curEnd = curText.length,
          newEnd = newText.length
        while (
          start < curEnd &&
          curText.charCodeAt(start) == newText.charCodeAt(start)
        ) {
          ++start
        }
        while (
          curEnd > start &&
          newEnd > start &&
          curText.charCodeAt(curEnd - 1) == newText.charCodeAt(newEnd - 1)
        ) {
          curEnd--
          newEnd--
        }
        setUpdating(true)
        cmView.dispatch({
          changes: {
            from: start,
            to: curEnd,
            insert: newText.slice(start, newEnd),
          },
        })
        setUpdating(false)
      }
      return true
    },
    component: withNodeViewProps(component, {
      cm,
      setCm,
      updating,
      setUpdating,
    }),
  }

  return defineNodeViewComponent<SolidNodeViewUserOptions>({
    group: 'solid',
    name,
    args,
  })
}

export interface CodemirrorEditorProps {
  workerInitializedChange?: (value: boolean) => void
  onDiagnosticChange?: (data: Array<unknown>) => void
}

export function CodemirrorEditor(props: CodemirrorEditorProps) {
  const context = useNodeViewContext()
  const { updating, setCm, cm } = useContext(CodeMirrorContext)!
  const { ref, createExtension, editorView } = createCodeMirror({
    value: context().node.textContent,
  })
  setCm(editorView())

  const forwardUpdate = (update: ViewUpdate) => {
    if (updating() || !cm()?.hasFocus) return
    let offset = context().getPos()! + 1
    const { main } = update.state.selection
    const selFrom = offset + main.from,
      selTo = offset + main.to
    const pmSel = context().view.state.selection
    if (update.docChanged || pmSel.from != selFrom || pmSel.to != selTo) {
      const tr = context().view.state.tr
      update.changes.iterChanges((fromA, toA, fromB, toB, text) => {
        if (text.length)
          tr.replaceWith(
            offset + fromA,
            offset + toA,
            context().view.state.schema.text(text.toString()),
          )
        else tr.delete(offset + fromA, offset + toA)
        offset += toB - fromB - (toA - fromA)
      })
      tr.setSelection(TextSelection.create(tr.doc, selFrom, selTo))
      context().view.dispatch(tr)
    }
  }

  const maybeEscape = (unit: 'char' | 'line', dir: number) => {
    const codemirror = cm()
    if (!codemirror) return
    const sel = codemirror.state.selection
    let main = sel.main
    if (!main.empty) return false
    if (unit == 'line') main = codemirror.state.doc.lineAt(main.head) as any
    if (dir < 0 ? main.from > 0 : main.to < codemirror.state.doc.length) {
      return false
    }
    const targetPos =
      context().getPos()! + (dir < 0 ? 0 : context().node.nodeSize)
    const $from = context().view.state.doc.resolve(targetPos)
    let selection = Selection.near($from, dir)
    if ($from.parentOffset === 0 && $from.depth === 0) {
      selection = new GapCursor($from)
    }
    const tr = context().view.state.tr.setSelection(selection).scrollIntoView()
    context().view.dispatch(tr)
    context().view.focus()
  }

  const codeMirrorKeymap = () => {
    const view = context().view
    return [
      {
        key: 'ArrowUp',
        run: () => maybeEscape('line', -1),
      },
      { key: 'ArrowLeft', run: () => maybeEscape('char', -1) },
      { key: 'ArrowDown', run: () => maybeEscape('line', 1) },
      { key: 'ArrowRight', run: () => maybeEscape('char', 1) },
      {
        key: 'Ctrl-Enter',
        run: () => {
          if (!exitCode(view.state, view.dispatch)) return false
          view.focus()
          return true
        },
      },
      {
        key: 'Ctrl-z',
        mac: 'Cmd-z',
        run: () => undo(view.state, view.dispatch),
      },
      {
        key: 'Shift-Ctrl-z',
        mac: 'Shift-Cmd-z',
        run: () => redo(view.state, view.dispatch),
      },
      {
        key: 'Ctrl-y',
        mac: 'Cmd-y',
        run: () => redo(view.state, view.dispatch),
      },
    ] as ReadonlyArray<KeyBinding>
  }

  createExtension(() => [
    keymap.of([...defaultKeymap, indentWithTab, ...codeMirrorKeymap()]),
    ...cmTheme,
    CodeMirror.updateListener.of((update) => {
      forwardUpdate(update)
    }),
  ])

  createLazyCompartmentExtension(async () => {
    const { worker, path } = await initTsAutocompleteWorker()
    props.workerInitializedChange?.(true)
    return [
      typescriptPlugins(true, true, worker, path),
      CodeMirror.updateListener.of(() => {
        worker
          .getLints({
            path,
          })
          .then((lints) => props.onDiagnosticChange?.(lints))
      }),
    ]
  }, editorView)

  createEffect(() => {
    const view = editorView()
    setCm(view)
  })
  onCleanup(() => setCm(null))

  return <pre ref={ref} />
}
