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

import { defineCommands, insertNode } from 'prosekit/core'
import { detectLanguageFromFilename } from '../shiki-language-extensions'
import type { SuggestedChangeConfig } from '../../../../editor/utils/loadCodeSuggestionChangesConfig'

export function defineCodeBlockSuggestionCommand() {
  return defineCommands({
    insertCodeBlockSuggestion: (options: {
      suggestChange: SuggestedChangeConfig
    }) => {
      const lang = detectLanguageFromFilename(options.suggestChange.filePath!)
      return (state, dispatch, view) => {
        const node = state.schema.nodes.codeBlock.create(
          {
            code: options.suggestChange.sourceContentFromDiffLines || '',
            lang: lang || '',
            isSuggestion: true,
            suggestChangeConfig: options.suggestChange,
          },
          state.schema.text(
            options.suggestChange.sourceContentFromDiffLines || '',
          ),
        )

        return insertNode({
          node,
          attrs: {
            code: options.suggestChange.sourceContentFromDiffLines || '',
            lang: lang || '',
            isSuggestion: true,
            suggestedChangeConfig: options.suggestChange,
          },
        })(state, dispatch, view)
      }
    },
  })
}
