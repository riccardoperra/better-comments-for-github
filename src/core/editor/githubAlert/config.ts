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
    icon: OcticonNote,
    label: 'Note',
    match: '[!NOTE]',
  },
  tip: {
    icon: OcticonTip,
    label: 'Tip',
    match: '[!TIP]',
  },
  important: {
    icon: OcticonImportant,
    label: 'Important',
    match: '[!IMPORTANT]',
  },
  warning: {
    icon: OcticonWarning,
    label: 'Warning',
    match: '[!WARNING]',
  },
  caution: {
    icon: OcticonCaution,
    label: 'Caution',
    match: '[!CAUTION]',
  },
}

export const githubAlertTypeKeys = Object.keys(
  githubAlertTypeMap,
) as Array<GithubAlertType>

export type GithubAlertType =
  | 'note'
  | 'tip'
  | 'important'
  | 'warning'
  | 'caution'
