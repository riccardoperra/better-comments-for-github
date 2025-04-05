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

import { defineConfig } from 'vite'
import { WxtVitest } from 'wxt/testing'

export default defineConfig({
  plugins: [
    // Add all the vite config from your wxt.config.ts, including the built-in
    // plugins and config WXT sets up automatically.
    // @ts-expect-error Fix types
    WxtVitest(),
  ],
})
