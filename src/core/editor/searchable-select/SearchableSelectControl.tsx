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

import { children } from 'solid-js'
import type { Accessor, ValidComponent } from 'solid-js'
import type { JSX } from 'solid-js/jsx-runtime'

export interface SearchableSelectControlOptions<Option> {
  value: Option | Array<Option>
  /**
   * The children of the combobox control.
   * Can be a `JSX.Element` or a _render prop_ for having access to the internal state.
   */
  children?: (state: { value: Accessor<Array<Option>> }) => JSX.Element
}

/**
 * Contains the combobox input and trigger.
 */
export function SearchableSelectValue<Option, T extends ValidComponent = 'div'>(
  props: SearchableSelectControlOptions<Option>,
) {
  return (
    <SearchableSelectValueChild value={props.value}>
      {props.children}
    </SearchableSelectValueChild>
  )
}

function SearchableSelectValueChild<Option>(
  props: SearchableSelectControlOptions<Option>,
) {
  const resolvedChildren = children(() => {
    const body = props.children
    return typeof body === 'function'
      ? body({
          value: () =>
            Array.isArray(props.value) ? props.value : [props.value],
        })
      : body
  })

  return <>{resolvedChildren()}</>
}
