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

import { Popover, PopoverContent, PopoverTrigger } from './popover'
import type { Meta, StoryObj } from 'storybook-solidjs'

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
const meta = {
  title: 'Primitives/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/solid/writing-stories/args
export const Default: Story = {
  args: {
    primary: true,
    label: 'Button',
  },
  render: () => {
    return (
      <Popover>
        <PopoverTrigger>Trigger</PopoverTrigger>
        <PopoverContent>This is a popover content</PopoverContent>
      </Popover>
    )
  },
}
