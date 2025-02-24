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

import { Show } from 'solid-js'
import * as KCheckbox from '@kobalte/core/checkbox'
import type { JSX } from 'solid-js'

export interface CheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: JSX.Element
  description?: JSX.Element
}

export const revertVisuallyHiddenStyles: JSX.CSSProperties = {
  border: undefined,
  clip: undefined,
  'clip-path': undefined,
  height: undefined,
  margin: 'revert',
  overflow: undefined,
  padding: undefined,
  position: undefined,
  width: undefined,
  'white-space': undefined,
}

export function Checkbox(props: CheckboxProps) {
  return (
    <KCheckbox.Root
      class="FormControl-checkbox-wrap"
      checked={props.checked}
      onChange={props.onCheckedChange}
    >
      <KCheckbox.Input
        class={'FormControl-checkbox'}
        style={revertVisuallyHiddenStyles}
      />

      <span class={'FormControl-checkbox-labelWrap'}>
        <Show when={props.label}>
          {(label) => (
            <KCheckbox.Label for="toggle-debug" class={'FormControl-label'}>
              {label()}
            </KCheckbox.Label>
          )}
        </Show>
        <Show when={props.description}>
          {(description) => (
            <KCheckbox.Description class={'FormControl-description'}>
              {description()}
            </KCheckbox.Description>
          )}
        </Show>
      </span>
    </KCheckbox.Root>
  )
}
