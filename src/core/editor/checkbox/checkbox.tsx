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
import type { JSX } from 'solid-js'

export interface CheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: JSX.Element
  description?: JSX.Element
}

export function Checkbox(props: CheckboxProps) {
  return (
    <div class="FormControl-checkbox-wrap">
      <input
        type="checkbox"
        name="toggle-debug"
        class={'FormControl-checkbox'}
        checked={props.checked}
        onChange={(event) => {
          props.onCheckedChange(event.target.checked)
        }}
        id="toggle-debug"
      />

      <span class={'FormControl-checkbox-labelWrap'}>
        <Show when={props.label}>
          {(label) => (
            <label for="toggle-debug" class={'FormControl-label'}>
              {label()}
            </label>
          )}
        </Show>
        <Show when={props.description}>
          {(description) => (
            <span class={'FormControl-description'}>{description()}</span>
          )}
        </Show>
      </span>
    </div>
  )
}
