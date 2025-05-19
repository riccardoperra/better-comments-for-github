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

import { defineNodeSpec, union } from 'prosekit/core'

import { defineSolidNodeView } from 'prosekit/solid'
import { ImageView } from './image-view'
import { defineImageFileHandlers } from './upload-file'
import type { SolidNodeViewComponent } from '@prosemirror-adapter/solid'

export function defineImageExtension() {
  return union(
    defineSolidNodeView({
      name: 'image',
      as: 'span',
      component: ImageView satisfies SolidNodeViewComponent,
    }),
    defineNodeSpec({
      name: 'image',
      attrs: {
        // Here we'll save the temporary id of the image to be uploaded
        referenceId: { default: null },
      },
    }),
    defineImageFileHandlers(),
  )
}
