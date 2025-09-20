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
  AutocompleteEmpty as CoreAutocompleteEmpty,
  AutocompleteItem as CoreAutocompleteItem,
  AutocompleteList as CoreAutocompleteList,
  AutocompletePopover as CoreAutocompletePopopover,
} from 'prosekit/solid/autocomplete'
import { clsx } from 'clsx'
import styles from './Autocomplete.module.css'
import type {
  AutocompleteEmptyProps,
  AutocompleteItemProps,
  AutocompleteListProps,
  AutocompletePopoverProps,
} from 'prosekit/solid/autocomplete'
import type { ParentComponent } from 'solid-js'

export const AutocompletePopover: ParentComponent<
  Partial<AutocompletePopoverProps & { class?: string }>
> = (props) => {
  return (
    <CoreAutocompletePopopover
      {...props}
      hide={true}
      class={clsx(props.class, styles.autocompleteMenu)}
    />
  )
}

export const AutocompleteList: ParentComponent<
  Partial<AutocompleteListProps>
> = (props) => {
  return <CoreAutocompleteList class={styles.autocompleteMenuList} {...props} />
}

export const AutocompleteEmpty: ParentComponent<
  Partial<AutocompleteEmptyProps>
> = (props) => {
  return (
    <CoreAutocompleteEmpty class={styles.autocompleteMenuItem} {...props} />
  )
}

export const AutocompleteItem: ParentComponent<
  Partial<AutocompleteItemProps & { class?: string }>
> = (props) => {
  return (
    // @ts-expect-error Fix types
    <CoreAutocompleteItem
      {...props}
      class={clsx(props.class, styles.autocompleteMenuItem)}
    />
  )
}
