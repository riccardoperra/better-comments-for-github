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

import { useEditor } from 'prosekit/solid'
import LucideBold from 'lucide-solid/icons/bold'
import LucideItalic from 'lucide-solid/icons/italic'
import LucideStrike from 'lucide-solid/icons/strikethrough'
import LucideCode from 'lucide-solid/icons/code'
import LucideCodeBlock from 'lucide-solid/icons/code-square'
import LucideBlockquote from 'lucide-solid/icons/text-quote'
import LucideAlignLeft from 'lucide-solid/icons/align-left'
import LucideAlignCenter from 'lucide-solid/icons/align-center'
import LucideAlignRight from 'lucide-solid/icons/align-right'
import LucideCog from 'lucide-solid/icons/cog'
import LucideChevronDown from 'lucide-solid/icons/chevron-down'
import LucideAlert from 'lucide-solid/icons/alert-octagon'
import LucideSuperscript from 'lucide-solid/icons/superscript'
import LucideSubscript from 'lucide-solid/icons/subscript'
import { For, Match, Switch, createMemo } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu/dropdown-menu'
import { githubAlertTypeMap } from '../githubAlert/config'
import { Settings } from '../settings/settings'
import { EditorTextShortcut } from '../kbd/kbd'
import styles from './toolbar.module.css'
import type { GithubAlertType } from '../githubAlert/config'
import type { FlowProps, JSX } from 'solid-js'
import type { NodeAction } from 'prosekit/core'
import type { EditorExtension } from '../extension'

export function Toolbar() {
  const editor = useEditor<EditorExtension>({ update: true })

  const isTextAlignActive = (value: string) => {
    return Object.values(editor().nodes).some((node: NodeAction<any>) => {
      return node.isActive({ textAlign: value })
    })
  }

  const currentTextAlign = createMemo(() => {
    let isLeft = false
    let isCenter = false
    let isRight = false
    for (const value of Object.values(editor().nodes)) {
      if (value.isActive({ textAlign: 'left' })) {
        isLeft = true
        break
      }
      if (value.isActive({ textAlign: 'center' })) {
        isCenter = true
        break
      }
      if (value.isActive({ textAlign: 'right' })) {
        isRight = true
        break
      }
    }
    return isLeft ? 'left' : isCenter ? 'center' : isRight ? 'right' : 'left'
  })

  return (
    <div class={styles.Toolbar}>
      <ToolbarAction
        label={
          <>
            Bold (<EditorTextShortcut type={'keyboard'} element={'bold'} />)
          </>
        }
        isPressed={editor().marks.bold.isActive()}
        disabled={!editor().commands.toggleBold.canExec()}
        onClick={() => editor().commands.toggleBold()}
      >
        <LucideBold size={16} />
      </ToolbarAction>
      <ToolbarAction
        label={
          <>
            Italic (<EditorTextShortcut type={'keyboard'} element={'italic'} />)
          </>
        }
        isPressed={editor().marks.italic.isActive()}
        disabled={!editor().commands.toggleItalic.canExec()}
        onClick={() => editor().commands.toggleItalic()}
      >
        <LucideItalic size={16} />
      </ToolbarAction>
      <ToolbarAction
        label={
          <>
            Strike (
            <EditorTextShortcut type={'keyboard'} element={'strikethrough'} />)
          </>
        }
        isPressed={editor().marks.strike.isActive()}
        disabled={!editor().commands.toggleStrike.canExec()}
        onClick={() => editor().commands.toggleStrike()}
      >
        <LucideStrike size={16} />
      </ToolbarAction>

      <div class={styles.Separator}></div>

      <ToolbarAction
        label={
          <>
            Subscript (
            <EditorTextShortcut type={'keyboard'} element={'subscript'} />)
          </>
        }
        isPressed={editor().marks.subscript.isActive()}
        disabled={!editor().commands.toggleSubscript.canExec()}
        onClick={() => editor().commands.toggleSubscript()}
      >
        <LucideSubscript size={16} />
      </ToolbarAction>

      <ToolbarAction
        label={
          <>
            Superscript (
            <EditorTextShortcut type={'keyboard'} element={'superscript'} />)
          </>
        }
        isPressed={editor().marks.superscript.isActive()}
        disabled={!editor().commands.toggleSuperscript.canExec()}
        onClick={() => editor().commands.toggleSuperscript()}
      >
        <LucideSuperscript size={16} />
      </ToolbarAction>

      <div class={styles.Separator}></div>

      <ToolbarAction
        label={
          <>
            Blockquote (
            <EditorTextShortcut type={'keyboard'} element={'blockquote'} />)
          </>
        }
        isPressed={editor().nodes.blockquote.isActive()}
        disabled={!editor().commands.toggleBlockquote.canExec()}
        onClick={() => editor().commands.toggleBlockquote()}
      >
        <LucideBlockquote size={16} />
      </ToolbarAction>

      <ToolbarAction
        label={'Code block'}
        isPressed={editor().nodes.codeBlock.isActive()}
        disabled={!editor().commands.toggleCodeBlock.canExec()}
        onClick={() => editor().commands.toggleCodeBlock()}
      >
        <LucideCodeBlock size={16} />
      </ToolbarAction>

      <ToolbarAction
        label={
          <>
            Code (
            <EditorTextShortcut type={'keyboard'} element={'code'} />)
          </>
        }
        isPressed={editor().marks.code.isActive()}
        disabled={!editor().commands.toggleCode.canExec()}
        onClick={() => editor().commands.toggleCode()}
      >
        <LucideCode size={16} />
      </ToolbarAction>

      <div class={styles.Separator}></div>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger as={DropdownMenuTrigger} class={styles.ToolbarAction}>
            <Switch>
              <Match when={currentTextAlign() === 'left'}>
                <LucideAlignLeft size={16} />
              </Match>
              <Match when={currentTextAlign() === 'center'}>
                <LucideAlignCenter size={16} />
              </Match>
              <Match when={currentTextAlign() === 'right'}>
                <LucideAlignRight size={16} />
              </Match>
            </Switch>
            <LucideChevronDown size={14} />
          </TooltipTrigger>
          <TooltipContent>Align text</TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
          <For each={['left', 'center', 'right'] as const}>
            {(value) => (
              <Tooltip placement={'right'}>
                <TooltipTrigger
                  as={DropdownMenuItem}
                  class={styles.ToolbarMenuCenteredItem}
                  data-pressed={isTextAlignActive(value)}
                  disabled={!editor().commands.setTextAlign.canExec(value)}
                  onClick={() => editor().commands.setTextAlign(value)}
                >
                  <Dynamic component={alignIcons[value]} size={16} />
                </TooltipTrigger>
                <TooltipContent>
                  Align {value} (
                  <EditorTextShortcut
                    type={'keyboard'}
                    element={`textAlign>${value}`}
                  />
                  )
                </TooltipContent>
              </Tooltip>
            )}
          </For>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger as={DropdownMenuTrigger} class={styles.ToolbarAction}>
            <LucideAlert size={16} />
            <LucideChevronDown size={14} />
          </TooltipTrigger>
          <TooltipContent>Alert</TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
          <For each={Object.keys(githubAlertTypeMap) as Array<GithubAlertType>}>
            {(value) => (
              <DropdownMenuItem
                data-pressed={isTextAlignActive(value)}
                disabled={!editor().commands.setAlert.canExec(value)}
                onClick={() => editor().commands.setAlert(value)}
              >
                <Dynamic component={githubAlertTypeMap[value].icon} />
                {githubAlertTypeMap[value].label}
              </DropdownMenuItem>
            )}
          </For>
        </DropdownMenuContent>
      </DropdownMenu>

      <div class={'ml-auto d-flex'}>
        <Popover placement={'bottom-end'}>
          <PopoverTrigger class={styles.ToolbarAction}>
            <LucideCog size={16} />
          </PopoverTrigger>
          <PopoverContent>
            <Settings />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

const alignIcons = {
  left: LucideAlignLeft,
  center: LucideAlignCenter,
  right: LucideAlignRight,
}

export function ToolbarAction(
  props: FlowProps<{
    isPressed: boolean
    disabled: boolean
    onClick?: () => void
    label: JSX.Element
  }>,
) {
  return (
    <Tooltip>
      <TooltipTrigger
        data-pressed={props.isPressed}
        disabled={props.disabled}
        type={'button'}
        onClick={() => props.onClick?.()}
        class={styles.ToolbarAction}
      >
        {props.children}
      </TooltipTrigger>
      <TooltipContent>{props.label}</TooltipContent>
    </Tooltip>
  )
}
