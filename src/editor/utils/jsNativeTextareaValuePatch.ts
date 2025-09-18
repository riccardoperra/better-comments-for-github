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

const patchProperty = Symbol('ghBetterCommentsNativeValuePatched')

export function patchJsNativeTextareaValue(
  textarea: HTMLTextAreaElement,
): () => void {
  if (Reflect.has(textarea, patchProperty)) {
    return () => {
      // Should enter here only if unmount has not been called (so, never?)
      const descriptor = Reflect.get(textarea, patchProperty)
      Reflect.deleteProperty(textarea, patchProperty)
      Object.defineProperty(textarea, 'value', descriptor)
    }
  }

  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    'value',
  )

  if (!descriptor || !descriptor.get || !descriptor.set) {
    return () => {
      // no-op
    }
  }

  const setter = descriptor.set
  const getter = descriptor.get

  Reflect.set(textarea, patchProperty, descriptor)

  Object.defineProperty(textarea, 'value', {
    set(newValue) {
      setter.call(this, newValue)
      this.dispatchEvent(
        new CustomEvent('gh-better-comments-textarea-set-value', {
          detail: newValue,
        }),
      )
    },
    get() {
      return getter.call(this)
    },
    configurable: true,
    enumerable: true,
  })

  return () => {
    Reflect.deleteProperty(textarea, patchProperty)
    Object.defineProperty(textarea, 'value', descriptor)
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'gh-better-comments-textarea-set-value': CustomEvent<string>
  }
}
