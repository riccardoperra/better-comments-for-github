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

export const logEnabled = import.meta.env.DEV

export const log = (...args: Array<any>) => {
  if (logEnabled) {
    const lastArg = args[args.length - 1]
    let id: string | undefined = ''
    if (typeof lastArg === 'object' && 'id' in lastArg) {
      id = lastArg.id
      args.length = args.length - 1
    }

    console.debug(
      `%cgithub-better-comments${id ? `:${id}` : ''}`,
      'background-color: #0089d9; color: white; border-radius: 4px; padding: 2px 4px;',
      ...args,
    )
  }
}
