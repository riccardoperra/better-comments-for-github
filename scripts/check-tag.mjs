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

import path from 'node:path'
import * as fs from 'node:fs'
import { execSync } from 'node:child_process'

const dirname = import.meta.dirname

const mainExtensionVersion = path.join(dirname, '../extension/package.json')

const { version } = JSON.parse(fs.readFileSync(mainExtensionVersion, 'utf8'))

const tag = `v${version}`

console.log('Check tag: ', tag)

// Get list of tags and check for the target
const tags = execSync(`git tag -l ${tag}`, { encoding: 'utf-8' })
  .split('\n')
  .map((t) => t.trim())
const exists = tags.includes(tag)

console.log('Tag exists: ', exists)

// Set output in GitHub Actions
const githubOutput = process.env.GITHUB_OUTPUT
if (githubOutput) {
  fs.appendFileSync(githubOutput, `tag_exists=${exists}\n`)
  fs.appendFileSync(githubOutput, `new_tag=${tag}\n`)
}
