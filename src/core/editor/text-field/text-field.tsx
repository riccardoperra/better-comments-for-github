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
import * as KTextField from '@kobalte/core/text-field'
import type { JSX } from 'solid-js'

export interface CheckboxProps {
  value?: string
  onValueChange?: (value: string) => void
  onChange?: (event: Event) => void
  label?: JSX.Element
  description?: JSX.Element
  autofocus?: boolean
}

export function TextField(props: CheckboxProps) {
  return (
    <KTextField.Root
      class={'FormControl-input-wrap FormControl-input-leadingVisualWrap'}
      value={props.value}
      onChange={props.onValueChange}
    >
      <Show when={props.label}>
        {(label) => (
          <KTextField.Label class={'FormControl-label'}>
            {label()}
          </KTextField.Label>
        )}
      </Show>

      <KTextField.Input
        type={'text'}
        autofocus={props.autofocus}
        class={'FormControl FormControl-input'}
        onChange={props.onChange}
      />

      <Show when={props.description}>
        {(description) => (
          <KTextField.Description class={'FormControl-caption'}>
            {description()}
          </KTextField.Description>
        )}
      </Show>
    </KTextField.Root>
  )
}
