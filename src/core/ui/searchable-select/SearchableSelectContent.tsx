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

import { Show, splitProps } from 'solid-js'
import * as SearchPrimitive from '@kobalte/core/search'
import clsx from 'clsx'
import styles from './SearchableSelect.module.css'
import type { JSX } from 'solid-js/jsx-runtime'
import type { PolymorphicProps } from '@kobalte/core/polymorphic'
import type { ValidComponent } from 'solid-js'

type SearchContentProps<T extends ValidComponent = 'div'> = {
  class?: string | undefined
  listboxClass?: string | undefined
  noResultContent?: JSX.Element
}

export const SearchableSelectContent = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, SearchContentProps<T>>,
) => {
  const [local, others] = splitProps(props as SearchContentProps, [
    'class',
    'listboxClass',
    'noResultContent',
  ])
  let listboxScrollContainer!: HTMLDivElement

  return (
    <div
      ref={listboxScrollContainer}
      class={clsx(local.class, styles.searchableSelectListboxContainer)}
    >
      <SearchPrimitive.Listbox
        class={clsx(local.listboxClass, styles.searchableSelectListbox)}
        scrollRef={() => listboxScrollContainer}
      />
      <Show when={props.noResultContent}>
        {(noResultContent) => (
          <SearchPrimitive.NoResult>
            {noResultContent()}
          </SearchPrimitive.NoResult>
        )}
      </Show>
    </div>
  )
}
