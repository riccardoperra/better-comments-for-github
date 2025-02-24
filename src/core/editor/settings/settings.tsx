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

import { onMount } from 'solid-js'
import { StorageItem } from 'webext-storage'
import { createStore, reconcile } from 'solid-js/store'

export interface EditorOptions {
  showDebug: boolean
}

export function Settings() {
  const [options, setOptions] = createStore<EditorOptions>({})
  const optionsItem = new StorageItem<EditorOptions>('editor-options', {
    area: 'sync',
  })

  onMount(() => {
    optionsItem.onChanged((value) => {
      setOptions(reconcile(value, { merge: true }))
    })
  })

  return (
    <div>
      <input
        type={'check'}
        class={'form-checkbox'}
        checked={options.showDebug}
        onChange={(event) => {
          setOptions('showDebug', event.target.checked)
          optionsItem.set({ showDebug: event.target.checked }).then()
        }}
      />
    </div>
  )
}
