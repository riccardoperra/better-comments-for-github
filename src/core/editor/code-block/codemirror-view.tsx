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
import type { Accessor, Component, Setter } from 'solid-js'
import {
  createContext,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js'
import { defineNodeViewComponent } from 'prosekit/core'
import { Selection, TextSelection } from 'prosemirror-state'
import { javascript } from '@codemirror/lang-javascript'
import { exitCode } from 'prosemirror-commands'
import { redo, undo } from 'prosekit/pm/history'
import {
  tsAutocomplete,
  tsFacet,
  tsGoto,
  tsHover,
  tsLinter,
  tsSync,
  tsTwoslash,
} from '@valtown/codemirror-ts'
import { autocompletion } from '@codemirror/autocomplete'
import * as Comlink from 'comlink'
import type { KeyBinding, ViewUpdate } from '@codemirror/view'
import { keymap } from '@codemirror/view'
import type { SolidNodeViewOptions, SolidNodeViewProps } from 'prosekit/solid'
import type { ProseMirrorNode } from 'prosemirror-transformer-markdown/prosemirror'
import './codemirror-view.css'
import { EditorView as CodeMirror, EditorView } from 'codemirror'
import { Dynamic } from 'solid-js/web'
import { githubDark } from '@uiw/codemirror-theme-github'
import { defaultKeymap } from '@codemirror/commands'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import type { TooltipRenderer } from '@valtown/codemirror-ts'
import type ts from 'typescript'
import type { HoverInfo, WorkerShape } from '@valtown/codemirror-ts/worker'

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
      console.log('codemirror test', codemirror)
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
      return true
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

export function CodeMirrorView() {
  const context = useNodeViewContext()
  const { updating, setCm, cm } = useContext(CodeMirrorContext)!
  let el!: HTMLPreElement

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
    const { state } = codemirror
    let { main } = state.selection
    if (!main.empty) return false
    if (unit == 'line') main = state.doc.lineAt(main.head) as any
    if (dir < 0 ? main.from > 0 : main.to < state.doc.length) return false
    const targetPos =
      context().getPos()! + (dir < 0 ? 0 : context().node.nodeSize)
    const selection = Selection.near(
      context().view.state.doc.resolve(targetPos),
      dir,
    )
    const tr = context().view.state.tr.setSelection(selection).scrollIntoView()
    context().view.dispatch(tr)
    context().view.focus()
  }

  const codeMirrorKeymap = () => {
    const view = context().view
    return [
      {
        key: 'ArrowUp',
        run: () => {
          console.log('arrow up')
          maybeEscape('line', -1)
        },
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

  onMount(async () => {
    const iframe = document.querySelector<HTMLIFrameElement>('#codemirror-ata')!
    const worker = Comlink.wrap(
      Comlink.windowEndpoint(iframe.contentWindow!),
    ) as WorkerShape
    await worker.initialize()

    const path = 'index.ts'

    setCm(
      new CodeMirror({
        doc: context().node.textContent,
        parent: el,
        extensions: [
          keymap.of([...defaultKeymap, ...codeMirrorKeymap()]),
          // drawSelection(),
          javascript({
            typescript: true,
            jsx: true,
          }),
          githubDark,
          tsFacet.of({ worker, path }),
          tsSync(),
          tsLinter(),
          autocompletion({
            override: [
              tsAutocomplete({
                renderAutocomplete(raw) {
                  return (com) => {
                    console.log(raw, com)
                    const div = document.createElement('div')
                    if (raw.displayParts) {
                      const dp = div.appendChild(document.createElement('div'))
                      dp.classList.add('cm-autocomplete-display-parts')
                      dp.appendChild(renderDisplayParts(raw.displayParts))
                    }

                    if (raw.documentation && raw.documentation.length > 0) {
                      const description = div.appendChild(
                        document.createElement('div'),
                      )
                      description.classList.add('cm-autocomplete-description')
                      description.appendChild(
                        renderDisplayParts(raw.documentation),
                      )
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
                },
              }),
            ],
          }),
          tsHover({
            renderTooltip: defaultTooltipRenderer,
          }),
          tsGoto(),
          tsTwoslash(),
          EditorView.theme({
            '&': {
              backgroundColor: 'transparent !important',
            },
            '.cm-line': {
              paddingInline: 0,
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
          CodeMirror.updateListener.of((update) => {
            forwardUpdate(update)
          }),
        ],
      }),
    )
    onCleanup(() => setCm(null))
  })

  return <pre ref={el} />
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
