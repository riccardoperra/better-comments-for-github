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
  OcticonCaution,
  OcticonImportant,
  OcticonNote,
  OcticonTip,
  OcticonWarning,
} from './icons'

export const githubAlertTypeMap = {
  note: {
    type: 'note',
    icon: OcticonNote,
    label: 'Note',
    match: '[!NOTE]',
    shortcutRegexp: /^>Note\s/,
  },
  tip: {
    type: 'tip',
    icon: OcticonTip,
    label: 'Tip',
    match: '[!TIP]',
    shortcutRegexp: /^>Tip\s/,
  },
  important: {
    type: 'important',
    icon: OcticonImportant,
    label: 'Important',
    match: '[!IMPORTANT]',
    shortcutRegexp: /^>Important\s/,
  },
  warning: {
    type: 'warning',
    icon: OcticonWarning,
    label: 'Warning',
    match: '[!WARNING]',
    shortcutRegexp: /^>Warning\s/,
  },
  caution: {
    type: 'caution',
    icon: OcticonCaution,
    label: 'Caution',
    match: '[!CAUTION]',
    shortcutRegexp: /^>Caution\s/,
  },
} as const

export const githubAlertTypeKeys = Object.keys(
  githubAlertTypeMap,
) as Array<GithubAlertType>

export type GithubAlertType =
  | 'note'
  | 'tip'
  | 'important'
  | 'warning'
  | 'caution'
