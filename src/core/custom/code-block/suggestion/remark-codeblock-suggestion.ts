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

import { visit } from 'unist-util-visit'
import { detectLanguageFromFilename } from '../shiki-language-extensions'
import type { Code, Root } from 'mdast'
import type { SuggestedChangeConfig } from '../../../../editor/utils/loadCodeSuggestionChangesConfig'
import type { Processor } from 'unified'

declare module 'unified' {
  interface Data {
    suggestedChangeConfig?: SuggestedChangeConfig
  }
}

export interface CodeWithSuggestion extends Code {
  isSuggestion?: boolean
  suggestChangeConfig?: SuggestedChangeConfig
}

declare module 'mdast' {
  export interface Code {
    isSuggestion?: boolean
    suggestChangeConfig?: SuggestedChangeConfig
  }
}

export function remarkCodeblockSuggestion(this: Processor) {
  const config = this.data('suggestedChangeConfig')

  return (root: Root) => {
    if (config && config.showSuggestChangesButton) {
      visit(root, 'code', (node) => {
        const config = this.data('suggestedChangeConfig')
        if (node.lang === 'suggestion') {
          if (config!.filePath) {
            node.lang = detectLanguageFromFilename(config!.filePath) || ''
          }
          node.isSuggestion = true
          node.suggestChangeConfig = config
        }
      })
    }
  }
}
