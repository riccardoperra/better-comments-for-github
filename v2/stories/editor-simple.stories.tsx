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

import { App } from './App'
import type { Meta, StoryObj } from 'storybook-solidjs'

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
const meta = {
  title: 'Editor/Basic',
  component: App,
} satisfies Meta<typeof App>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/solid/writing-stories/args
export const Default: Story = {
  args: {
    initialValue: `# heading 1
## heading 2
### heading 3
#### heading 4
##### heading 5
###### heading 6

This is just a paragraph

---

Paragraph after **hardbreak**

`,
  },
}

export const Alert: Story = {
  args: {
    initialValue: `> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.
    `,
  },
}

export const List: Story = {
  args: {
    initialValue: `- [ ] Task list item
- [x] Completed task list item

1. Ordered list item
    1. Nested ordered list item
    
- Bullet list item
- Bullet list item 2
  - Bullet list item nested`,
  },
}

export const Images: Story = {
  args: {
    initialValue: `<img src="https://placehold.co/600x400" alt="placeholder" /> inline text`,
  },
}
