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

import {
  tsAutocomplete,
  tsFacet,
  tsGoto,
  tsHover,
  tsLinter,
  tsSync,
  tsTwoslash,
} from '@valtown/codemirror-ts'
import { autocompletion } from '@codemirror/autocomplete'
import * as Comlink from 'comlink'
import { javascript } from '@codemirror/lang-javascript'
import {
  autocompleteRenderer,
  defaultTooltipRenderer,
} from './autocompleteRenderer'
import type { WorkerShape } from '@valtown/codemirror-ts/worker'

export const typescriptPlugins = (
  enableTypescript: boolean,
  enableJsx: boolean,
  worker: WorkerShape,
  path: string,
) => [
  javascript({ typescript: enableTypescript, jsx: enableJsx }),
  tsFacet.of({ worker, path }),
  tsSync(),
  tsLinter(),
  autocompletion({
    override: [
      tsAutocomplete({
        renderAutocomplete: autocompleteRenderer,
      }),
    ],
  }),
  tsHover({ renderTooltip: defaultTooltipRenderer }),
  tsGoto(),
  tsTwoslash(),
]

export async function initTsAutocompleteWorker(): Promise<{
  iframe: HTMLIFrameElement
  worker: WorkerShape
  path: string
}> {
  const iframe = document.querySelector<HTMLIFrameElement>('#codemirror-ata')!
  const worker: WorkerShape = Comlink.wrap(
    Comlink.windowEndpoint(iframe.contentWindow!),
  )
  await worker.initialize()
  return {
    iframe,
    worker,
    path: 'index.ts',
  }
}
