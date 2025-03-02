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
  createDefaultMapFromCDN,
  createSystem,
  createVirtualTypeScriptEnvironment,
} from '@typescript/vfs'
import { createWorker } from '@valtown/codemirror-ts/worker'
import ts from 'typescript'
import { setupTypeAcquisition } from '@typescript/ata'
import * as Comlink from 'comlink'

export default defineUnlistedScript(() => {
  try {
    const worker = createWorker({
      env: (async () => {
        const fsMap = await createDefaultMapFromCDN(
          { target: ts.ScriptTarget.ES2022 },
          ts.version,
          false,
          ts,
        )
        const system = createSystem(fsMap)
        return createVirtualTypeScriptEnvironment(system, [], ts, {
          lib: ['ES2022'],
        })
      })(),
      onFileUpdated(_env, _path, code) {
        ata(code)
      },
    })

    const ata = setupTypeAcquisition({
      projectName: 'My ATA Project',
      typescript: ts,
      logger: console,
      delegate: {
        receivedFile: (code: string, path: string) => {
          worker.getEnv().createFile(path, code)
        },
      },
    })

    Comlink.expose(worker)
  } catch (e) {
    console.log('my worker error', e)
  }
})
