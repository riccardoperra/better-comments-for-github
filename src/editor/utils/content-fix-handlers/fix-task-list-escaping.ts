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

import type { ContentFixHandler } from './content-fix-handler'

export const fixTaskListEscaping: ContentFixHandler = (content) => {
  // Fix the task list that contains \ before [ ] -> it Seems like GitHub ignore it and parse it as a task list
  // - \[ ] Will be converted to a task list instead of an ordered list
  return content.replace(/(^\s*-\s)(\\\[ ])/gm, (_, prefix) => `${prefix}[ ]`)
}
