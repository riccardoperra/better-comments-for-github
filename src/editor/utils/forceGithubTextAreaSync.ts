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

export function forceGithubTextAreaSync(
  textarea: HTMLTextAreaElement,
  value: string,
  options: {
    behavior: 'native' | 'react'
  },
) {
  // This is a trick that automatically encode characters and sanitize the `value`
  const fakeTextarea = document.createElement('textarea')
  fakeTextarea.innerHTML = value
  const sanitizedValue = fakeTextarea.value
  fakeTextarea.remove()

  const inputEvent = new Event('input', { bubbles: true })
  Object.assign(inputEvent, { fromEditor: true })

  if (options.behavior === 'react') {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value',
    )?.set

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(textarea, sanitizedValue)
      textarea.dispatchEvent(inputEvent)
    } else {
      forceCallReactFiberOnChange(inputEvent, textarea)
    }
  } else {
    const changeEvent = new Event('change', { bubbles: true })
    Object.assign(changeEvent, { fromEditor: true })
    textarea.value = sanitizedValue
    textarea.dispatchEvent(inputEvent)
    textarea.dispatchEvent(changeEvent)
  }
}

function forceCallReactFiberOnChange(
  event: Event,
  textarea: HTMLTextAreaElement,
): void {
  Object.assign(event, {
    isDefaultPrevented: () => false,
  })
  Object.defineProperty(event, 'target', {
    writable: false,
    value: textarea,
  })
  for (const key in textarea) {
    if (key.includes('__reactProps')) {
      const fiberProps = textarea[key as keyof typeof textarea] as Record<
        string,
        any
      > | null
      if (
        fiberProps &&
        'onChange' in fiberProps &&
        typeof fiberProps.onChange === 'function'
      ) {
        fiberProps.onChange(event)
      }

      break
    }
  }
}
