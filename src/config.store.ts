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

import { defineStore } from 'statebuilder'

export interface ConfigState {
  showDebug: false | 'md' | 'node'
  nativeSelectForLanguageSelector: boolean
  newIssueUrl: string
}

const defaultDebugMode: ConfigState['showDebug'] = false

export const ConfigStore = defineStore<ConfigState>(() => ({
  showDebug: import.meta.env.MODE === 'development' ? defaultDebugMode : false,
  nativeSelectForLanguageSelector: false,
  newIssueUrl:
    'https://github.com/riccardoperra/leave-better-comments-for-github/issues/new',
}))
