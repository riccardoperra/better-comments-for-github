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

const patchProperty = Symbol('ghBetterCommentsNativeValuePatch')

interface JsNativeTextAreaPatch {
  originalDescriptor: PropertyDescriptor
  unmount: () => void
}

let enableEvent = false

export function setNativeTextareaValue(
  textarea: HTMLTextAreaElement,
  value: string,
) {
  enableEvent = false
  textarea.value = value
  enableEvent = true
}

function getPatch(textarea: HTMLTextAreaElement): JsNativeTextAreaPatch | null {
  return Reflect.get(textarea, patchProperty)
}

function setPatch(
  textarea: HTMLTextAreaElement,
  patch: JsNativeTextAreaPatch,
): void {
  Reflect.set(textarea, patchProperty, patch)
}

export function patchJsNativeTextareaValue(
  textarea: HTMLTextAreaElement,
): () => void {
  const patch = getPatch(textarea)
  if (patch) {
    return patch.unmount
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

  const unmount = () => {
    Reflect.deleteProperty(textarea, patchProperty)
    Object.defineProperty(textarea, 'value', descriptor)
  }

  Reflect.set(textarea, patchProperty, descriptor)
  setPatch(textarea, {
    unmount,
    originalDescriptor: descriptor,
  })
  Object.defineProperty(textarea, 'value', {
    set(newValue) {
      setter.call(this, newValue)
      if (enableEvent) {
        console.log('run stter')
        this.dispatchEvent(
          new CustomEvent('gh-better-comments-textarea-set-value', {
            detail: newValue,
          }),
        )
      }
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
