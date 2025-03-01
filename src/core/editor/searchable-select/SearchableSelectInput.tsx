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

import * as SearchPrimitive from '@kobalte/core/search'
import { onMount, splitProps, untrack, useContext } from 'solid-js'
import clsx from 'clsx'
import { SearchableSelectContext } from './SearchableSelectContext'
import type { ValidComponent } from 'solid-js'
import type { PolymorphicProps } from '@kobalte/core/polymorphic'

type SearchInputProps<T extends ValidComponent = 'input'> =
  SearchPrimitive.SearchInputProps<T> & { class?: string | undefined }

export const SearchableSelectInput = <T extends ValidComponent = 'input'>(
  props: PolymorphicProps<T, SearchInputProps<T>>,
) => {
  const [local, others] = splitProps(props as SearchInputProps, ['class'])
  const context = useContext(SearchableSelectContext)!
  return (
    <SearchPrimitive.Input
      class={clsx(
        'FormControl FormControl-input FormControl-small',
        local.class,
      )}
      ref={(ref) => {
        if (untrack(context.initialPopoverRender)) {
          onMount(() => {
            setTimeout(() => {
              ref.value = ''
              context.setInitialPopoverRender(false)
            })
          })
        }
      }}
      {...others}
    />
  )
}
