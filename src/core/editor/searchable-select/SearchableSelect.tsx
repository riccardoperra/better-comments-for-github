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

import { createSignal, onCleanup, splitProps, useContext } from 'solid-js'

import * as SearchPrimitive from '@kobalte/core/search'
import { clsx } from 'clsx'
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover'
import styles from './SearchableSelect.module.css'
import { SearchableSelectContext } from './SearchableSelectContext'
import { SearchableSelectInput } from './SearchableSelectInput'
import type { FlowProps, ValidComponent } from 'solid-js'
import type { SearchRootProps } from '@kobalte/core/search'
import type {
  PopoverContentProps,
  PopoverRootProps,
  PopoverTriggerProps,
} from '@kobalte/core/popover'
import type { PolymorphicProps } from '@kobalte/core/polymorphic'

type SearchItemProps<T extends ValidComponent = 'li'> =
  SearchPrimitive.SearchItemProps<T> & {
    class?: string | undefined
  }

const SearchableSelectItem = <T extends ValidComponent = 'li'>(
  props: PolymorphicProps<T, SearchItemProps<T>>,
) => {
  const [local, others] = splitProps(props as SearchItemProps, ['class'])
  return (
    <SearchPrimitive.Item
      class={clsx(styles.searchableSelectMenuItem, local.class)}
      {...others}
    />
  )
}

export const SearchableSelectItemLabel = SearchPrimitive.ItemLabel

type SearchControlProps<
  U,
  T extends ValidComponent = 'div',
> = SearchPrimitive.SearchControlProps<U, T> & {
  class?: string | undefined
}

const SearchControl = <T, U extends ValidComponent = 'div'>(
  props: PolymorphicProps<U, SearchControlProps<T>>,
) => {
  const [local, others] = splitProps(props as SearchControlProps<T>, ['class'])
  return <SearchPrimitive.Control class={clsx(local.class)} {...others} />
}

export function SearchableSelectProvider(props: FlowProps) {
  const [initialPopoverRender, setInitialPopoverRender] = createSignal(true)
  const [popoverOpen, setPopoverOpen] = createSignal(false)
  const [anchorRef, setAnchorRef] = createSignal<HTMLElement | null>(null)

  const onPopoverKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setPopoverOpen(false)
    }
  }

  return (
    <SearchableSelectContext.Provider
      value={{
        initialPopoverRender,
        setInitialPopoverRender,
        popoverOpen,
        setPopoverOpen,
        onPopoverKeyDown,
        anchorRef,
        setAnchorRef,
      }}
    >
      {props.children}
    </SearchableSelectContext.Provider>
  )
}

export function SearchableSelectTrigger<T extends ValidComponent = 'button'>(
  props: PolymorphicProps<T, PopoverTriggerProps<T>>,
) {
  return (
    <div class={'FormControl-select-wrap'}>
      <PopoverTrigger
        class={`FormControl FormControl-select FormControl-small ${styles.selectTrigger}`}
        {...props}
      />
    </div>
  )
}

export function SearchableSelectPopover<T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, PopoverRootProps>,
) {
  const context = useContext(SearchableSelectContext)!
  return (
    <Popover
      anchorRef={context.anchorRef}
      open={context.popoverOpen()}
      onOpenChange={context.setPopoverOpen}
      {...props}
    />
  )
}

export function SearchableSelectPopoverContent<
  T extends ValidComponent = 'div',
>(props: PolymorphicProps<T, PopoverContentProps<T>>) {
  const context = useContext(SearchableSelectContext)!

  return <PopoverContent {...props} onKeyDown={context.onPopoverKeyDown} />
}

export function SearchableSelectRoot<
  Option,
  OptGroup = never,
  T extends ValidComponent = 'div',
>(props: PolymorphicProps<T, SearchRootProps<Option, OptGroup, T>>) {
  const context = useContext(SearchableSelectContext)!

  onCleanup(() => {
    props.onInputChange?.('')
  })

  return (
    <SearchPrimitive.Search
      {...props}
      open
      onInputChange={(value) => {
        if (context.initialPopoverRender()) {
          return
        }
        props.onInputChange?.(value)
      }}
      onChange={(value) => {
        context.setPopoverOpen(false)
        props.onChange?.(value as any)
      }}
    />
  )
}

export { SearchableSelectItem, SearchControl, SearchableSelectInput }

export { SearchableSelectContent } from './SearchableSelectContent'
