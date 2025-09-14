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
import LucideCog from 'lucide-solid/icons/cog'
import { For, createMemo } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import LucideChevronDown from 'lucide-solid/icons/chevron-down'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../ui/tooltip/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu/dropdown-menu'
import { githubAlertTypeMap } from '../../custom/githubAlert/config'
import { Settings } from '../settings/settings'
import { EditorTextShortcut } from '../../ui/kbd/kbd'
import { EditorActionIcon } from '../../ui/action-icon/ActionIcon'
import { EditorActionConfig } from '../../../actions'
import styles from './toolbar.module.css'
import type { GithubAlertType } from '../../custom/githubAlert/config'
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

  const textAlignments = [
    ['left', EditorActionConfig['textAlign>left']],
    ['center', EditorActionConfig['textAlign>center']],
    ['right', EditorActionConfig['textAlign>right']],
  ] as const

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
            Bold{' '}
            <EditorTextShortcut
              wrappedInParenthesis
              type={'keyboard'}
              element={'bold'}
            />
          </>
        }
        isPressed={editor().marks.bold.isActive()}
        disabled={!editor().commands.toggleBold.canExec()}
        onClick={() => editor().commands.toggleBold()}
      >
        <EditorActionIcon actionId={'bold'} size={16} />
      </ToolbarAction>
      <ToolbarAction
        label={
          <>
            Italic{' '}
            <EditorTextShortcut
              wrappedInParenthesis
              type={'keyboard'}
              element={'italic'}
            />
          </>
        }
        isPressed={editor().marks.italic.isActive()}
        disabled={!editor().commands.toggleItalic.canExec()}
        onClick={() => editor().commands.toggleItalic()}
      >
        <EditorActionIcon actionId={'italic'} size={16} />
      </ToolbarAction>
      <ToolbarAction
        label={
          <>
            Strike{' '}
            <EditorTextShortcut
              wrappedInParenthesis
              type={'keyboard'}
              element={'strikethrough'}
            />
          </>
        }
        isPressed={editor().marks.strike.isActive()}
        disabled={!editor().commands.toggleStrike.canExec()}
        onClick={() => editor().commands.toggleStrike()}
      >
        <EditorActionIcon actionId={'strikethrough'} size={16} />
      </ToolbarAction>

      <ToolbarAction
        label={
          <>
            Underline{' '}
            <EditorTextShortcut
              wrappedInParenthesis
              type={'keyboard'}
              element={'underline'}
            />
          </>
        }
        isPressed={editor().marks.underline.isActive()}
        disabled={!editor().commands.toggleUnderline.canExec()}
        onClick={() => editor().commands.toggleUnderline()}
      >
        <EditorActionIcon actionId={'underline'} size={16} />
      </ToolbarAction>

      <ToolbarAction
        label={
          <>
            Subscript{' '}
            <EditorTextShortcut
              wrappedInParenthesis
              type={'keyboard'}
              element={'subscript'}
            />
          </>
        }
        isPressed={editor().marks.subscript.isActive()}
        disabled={!editor().commands.toggleSubscript.canExec()}
        onClick={() => editor().commands.toggleSubscript()}
      >
        <EditorActionIcon actionId={'subscript'} size={16} />
      </ToolbarAction>

      <ToolbarAction
        label={
          <>
            Superscript{' '}
            <EditorTextShortcut
              wrappedInParenthesis
              type={'keyboard'}
              element={'superscript'}
            />
          </>
        }
        isPressed={editor().marks.superscript.isActive()}
        disabled={!editor().commands.toggleSuperscript.canExec()}
        onClick={() => editor().commands.toggleSuperscript()}
      >
        <EditorActionIcon actionId={'superscript'} size={16} />
      </ToolbarAction>

      <div class={styles.Separator}></div>

      <ToolbarAction
        label={
          <>
            Blockquote{' '}
            <EditorTextShortcut
              type={'keyboard'}
              element={'blockquote'}
              wrappedInParenthesis
            />
          </>
        }
        isPressed={editor().nodes.blockquote.isActive()}
        disabled={!editor().commands.toggleBlockquote.canExec()}
        onClick={() => editor().commands.toggleBlockquote()}
      >
        <EditorActionIcon actionId={'blockquote'} size={16} />
      </ToolbarAction>

      <ToolbarAction
        label={
          <>
            Code block{' '}
            <EditorTextShortcut
              wrappedInParenthesis
              type={'keyboard'}
              element={'codeBlock'}
            />
          </>
        }
        isPressed={
          editor().nodes.codeBlock.isActive() ||
          editor().nodes.cmCodeBlock.isActive()
        }
        disabled={
          !editor().commands.toggleCodeBlock.canExec() ||
          !editor().commands.toggleCmCodeBlock.canExec()
        }
        onClick={() => {
          if (editor().nodes.codeBlock.isActive()) {
            editor().commands.toggleCodeBlock()
          } else {
            editor().commands.toggleCmCodeBlock()
          }
        }}
      >
        <EditorActionIcon actionId={'codeBlock'} size={16} />
      </ToolbarAction>

      <ToolbarAction
        label={
          <>
            Code{' '}
            <EditorTextShortcut
              wrappedInParenthesis
              type={'keyboard'}
              element={'code'}
            />
          </>
        }
        isPressed={editor().marks.code.isActive()}
        disabled={!editor().commands.toggleCode.canExec()}
        onClick={() => editor().commands.toggleCode()}
      >
        <EditorActionIcon actionId={'code'} size={16} />
      </ToolbarAction>

      <div class={styles.Separator}></div>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger as={DropdownMenuTrigger} class={styles.ToolbarAction}>
            <EditorActionIcon
              actionId={`textAlign>${currentTextAlign()}`}
              size={16}
            />
          </TooltipTrigger>
          <TooltipContent>Align text</TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
          <For each={textAlignments}>
            {([alignType, info]) => (
              <Tooltip placement={'right'}>
                <TooltipTrigger
                  as={DropdownMenuItem}
                  class={styles.ToolbarMenuCenteredItem}
                  data-pressed={isTextAlignActive(alignType)}
                  disabled={!editor().commands.setTextAlign.canExec(alignType)}
                  onClick={() => editor().commands.setTextAlign(alignType)}
                >
                  <Dynamic component={info.icon} size={16} />
                </TooltipTrigger>
                <TooltipContent>
                  Align {alignType}
                  <EditorTextShortcut
                    wrappedInParenthesis
                    type={'keyboard'}
                    element={`textAlign>${alignType}`}
                  />
                </TooltipContent>
              </Tooltip>
            )}
          </For>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger as={DropdownMenuTrigger} class={styles.ToolbarAction}>
            <EditorActionIcon actionId={'alert'} size={16} />
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
