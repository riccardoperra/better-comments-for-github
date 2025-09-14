import { splitProps } from 'solid-js'

import * as DropdownMenuPrimitive from '@kobalte/core/dropdown-menu'
import { clsx } from 'clsx'
import styles from './dropdown-menu.module.css'
import type { PolymorphicProps } from '@kobalte/core/polymorphic'

import type { Component, ComponentProps, JSX, ValidComponent } from 'solid-js'

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuPortal = DropdownMenuPrimitive.Portal
const DropdownMenuGroup = DropdownMenuPrimitive.Group
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSub: Component<DropdownMenuPrimitive.DropdownMenuSubProps> = (
  props,
) => {
  return <DropdownMenuPrimitive.Sub overlap gutter={-8} {...props} />
}

const DropdownMenu: Component<DropdownMenuPrimitive.DropdownMenuRootProps> = (
  props,
) => {
  return <DropdownMenuPrimitive.Root gutter={4} {...props} />
}

type DropdownMenuContentProps<T extends ValidComponent = 'div'> =
  DropdownMenuPrimitive.DropdownMenuContentProps<T> & {
    class?: string | undefined
  }

const DropdownMenuContent = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, DropdownMenuContentProps<T>>,
) => {
  const [, rest] = splitProps(props as DropdownMenuContentProps, ['class'])
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        class={clsx(props.class, styles.dropdownMenuContent)}
        {...rest}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

type DropdownMenuItemProps<T extends ValidComponent = 'div'> =
  DropdownMenuPrimitive.DropdownMenuItemProps<T> & {
    class?: string | undefined
  }

const DropdownMenuItem = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, DropdownMenuItemProps<T>>,
) => {
  const [, rest] = splitProps(props as DropdownMenuItemProps, ['class'])
  return (
    <DropdownMenuPrimitive.Item
      class={clsx(props.class, styles.dropdownMenuItem)}
      {...rest}
    />
  )
}

const DropdownMenuShortcut: Component<ComponentProps<'span'>> = (props) => {
  const [, rest] = splitProps(props, ['class'])
  return (
    <span
      class={clsx('ml-auto text-xs tracking-widest opacity-60', props.class)}
      {...rest}
    />
  )
}

const DropdownMenuLabel: Component<
  ComponentProps<'div'> & { inset?: boolean }
> = (props) => {
  const [, rest] = splitProps(props, ['class', 'inset'])
  return (
    <div
      class={clsx(
        'px-2 py-1.5 text-sm font-semibold',
        props.inset && 'pl-8',
        props.class,
      )}
      {...rest}
    />
  )
}

type DropdownMenuSeparatorProps<T extends ValidComponent = 'hr'> =
  DropdownMenuPrimitive.DropdownMenuSeparatorProps<T> & {
    class?: string | undefined
  }

const DropdownMenuSeparator = <T extends ValidComponent = 'hr'>(
  props: PolymorphicProps<T, DropdownMenuSeparatorProps<T>>,
) => {
  const [, rest] = splitProps(props as DropdownMenuSeparatorProps, ['class'])
  return (
    <DropdownMenuPrimitive.Separator
      class={clsx('-mx-1 my-1 h-px bg-muted', props.class)}
      {...rest}
    />
  )
}

type DropdownMenuSubTriggerProps<T extends ValidComponent = 'div'> =
  DropdownMenuPrimitive.DropdownMenuSubTriggerProps<T> & {
    class?: string | undefined
    children?: JSX.Element
  }

const DropdownMenuSubTrigger = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, DropdownMenuSubTriggerProps<T>>,
) => {
  const [, rest] = splitProps(props as DropdownMenuSubTriggerProps, [
    'class',
    'children',
  ])
  return (
    <DropdownMenuPrimitive.SubTrigger
      class={clsx(props.class, styles.dropdownMenuItem)}
      {...rest}
    >
      {props.children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="ml-auto size-4"
      >
        <path d="M9 6l6 6l-6 6" />
      </svg>
    </DropdownMenuPrimitive.SubTrigger>
  )
}

type DropdownMenuSubContentProps<T extends ValidComponent = 'div'> =
  DropdownMenuPrimitive.DropdownMenuSubContentProps<T> & {
    class?: string | undefined
  }

const DropdownMenuSubContent = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, DropdownMenuSubContentProps<T>>,
) => {
  const [, rest] = splitProps(props as DropdownMenuSubContentProps, ['class'])
  return (
    <DropdownMenuPrimitive.SubContent
      class={clsx(
        'z-50 min-w-32 origin-[var(--kb-menu-content-transform-origin)] overflow-hidden animate-in',
        props.class,
        styles.dropdownMenuContent,
      )}
      {...rest}
    />
  )
}

type DropdownMenuCheckboxItemProps<T extends ValidComponent = 'div'> =
  DropdownMenuPrimitive.DropdownMenuCheckboxItemProps<T> & {
    class?: string | undefined
    children?: JSX.Element
  }

const DropdownMenuCheckboxItem = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, DropdownMenuCheckboxItemProps<T>>,
) => {
  const [, rest] = splitProps(props as DropdownMenuCheckboxItemProps, [
    'class',
    'children',
  ])
  return (
    <DropdownMenuPrimitive.CheckboxItem
      class={clsx(styles.dropdownMenuItem, props.class)}
      {...rest}
    >
      <span class="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-4"
          >
            <path d="M5 12l5 5l10 -10" />
          </svg>
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {props.children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

type DropdownMenuGroupLabelProps<T extends ValidComponent = 'span'> =
  DropdownMenuPrimitive.DropdownMenuGroupLabelProps<T> & {
    class?: string | undefined
  }

const DropdownMenuGroupLabel = <T extends ValidComponent = 'span'>(
  props: PolymorphicProps<T, DropdownMenuGroupLabelProps<T>>,
) => {
  const [, rest] = splitProps(props as DropdownMenuGroupLabelProps, ['class'])
  return (
    <DropdownMenuPrimitive.GroupLabel
      class={clsx('px-2 py-1.5 text-sm font-semibold', props.class)}
      {...rest}
    />
  )
}

type DropdownMenuRadioItemProps<T extends ValidComponent = 'div'> =
  DropdownMenuPrimitive.DropdownMenuRadioItemProps<T> & {
    class?: string | undefined
    children?: JSX.Element
  }

const DropdownMenuRadioItem = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, DropdownMenuRadioItemProps<T>>,
) => {
  const [, rest] = splitProps(props as DropdownMenuRadioItemProps, [
    'class',
    'children',
  ])
  return (
    <DropdownMenuPrimitive.RadioItem
      class={clsx(styles.dropdownMenuItem, props.class)}
      {...rest}
    >
      <span class={styles.dropdownMenuItemRadio}>
        <DropdownMenuPrimitive.ItemIndicator>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class={styles.dropdownMenuItemRadioIndicator}
          >
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          </svg>
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {props.children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
}
