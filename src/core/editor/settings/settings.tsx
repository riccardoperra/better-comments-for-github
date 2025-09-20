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

import { ConfigStore } from '../../../config.store'
import styles from './settings.module.css'

export function Settings() {
  const configStore = ConfigStore.provide()

  return (
    <div class={styles.settingsContainer}>
      <div class="FormControl-checkbox-wrap">
        <input
          type="checkbox"
          name="toggle-debug"
          class={'FormControl-checkbox'}
          checked={configStore.get.showDebug !== false}
          onChange={(event) => {
            configStore.set('showDebug', event.target.checked ? 'md' : false)
          }}
          id="toggle-debug"
        />
        <span class={'FormControl-checkbox-labelWrap'}>
          <label for="toggle-debug" class={'FormControl-label'}>
            Show/hide debug tools
          </label>
          <span class={'FormControl-caption'}>
            Enable or disable debug tools for the editor.
          </span>
        </span>
      </div>
    </div>
  )
}
