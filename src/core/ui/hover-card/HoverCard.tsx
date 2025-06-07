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

import { splitProps } from 'solid-js'

import * as HoverCardPrimitive from '@kobalte/core/hover-card'
import { clsx } from 'clsx'
import styles from './HoverCard.module.css'
import type { Component, ValidComponent } from 'solid-js'
import type { PolymorphicProps } from '@kobalte/core/polymorphic'

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardArrow: Component<HoverCardPrimitive.HoverCardArrowProps> = (
  props,
) => {
  return <HoverCardPrimitive.Arrow {...props} />
}

const HoverCard: Component<HoverCardPrimitive.HoverCardRootProps> = (props) => {
  return (
    <HoverCardPrimitive.Root
      closeDelay={0}
      openDelay={100}
      gutter={4}
      {...props}
    />
  )
}

type HoverCardContentProps<T extends ValidComponent = 'div'> =
  HoverCardPrimitive.HoverCardContentProps<T> & {
    class?: string | undefined
  }

const HoverCardContent = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, HoverCardContentProps<T>>,
) => {
  const [local, others] = splitProps(props as HoverCardContentProps, ['class'])
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        class={clsx(styles.hovercardContent, local.class)}
        {...others}
      />
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCardArrow, HoverCard, HoverCardTrigger, HoverCardContent }
