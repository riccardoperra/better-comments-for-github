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

import { createMemo, createSignal } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { InlineEditorPopover } from './EditorInlineMenu/editor-inline-popover'
import styles from './inline-menu.module.css'
import { LinkMenuContent } from './LinkMenu/LinkMenuContent'
import { BaseMenu } from './BaseMenu/BaseMenu'

export default function InlineMenu() {
  const [linkMenuOpen, setLinkMenuOpen] = createSignal(false)
  const toggleLinkMenuOpen = () => setLinkMenuOpen((open) => !open)

  const menuComponent = createMemo(() => {
    if (linkMenuOpen()) {
      return () => <LinkMenuContent onBack={() => setLinkMenuOpen(false)} />
    }
    return () => <BaseMenu toggleLink={toggleLinkMenuOpen} />
  })

  return (
    <>
      <InlineEditorPopover
        class={styles.popoverContent}
        onOpenChange={(open) => {
          if (!open) {
            setLinkMenuOpen(false)
          }
        }}
      >
        <Dynamic component={menuComponent()} />
      </InlineEditorPopover>
    </>
  )
}
