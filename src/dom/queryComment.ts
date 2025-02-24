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

//   <textarea
//     aria-required="false"
//     aria-invalid="false"
//     rows="20"
//     cols="30"
//     class="Textarea__StyledTextarea-sc-1lf8it-0 hAxfsE MarkdownInput-module__textArea--QjIwG"
//     id=":r6:"
//     placeholder="Type your description here…"
//     aria-label="Markdown value"
//     aria-describedby=":r6:-description"
//   >
// This is the description</textarea
//   >
//     <div class="CommentBox-container">
//         <textarea name="comment[body]" id="new_comment_field" placeholder=" "
//                   data-required-trimmed="Text field is empty"
//                   class="js-comment-field js-paste-markdown js-task-list-field js-quick-submit FormControl-textarea CommentBox-input js-size-to-fit size-to-fit js-session-resumable js-saved-reply-shortcut-comment-field"
//                   dir="auto"
//                   aria-describedby="placeholder_previewable-comment-form-component-dadd1c8f-aad0-4975-8102-44143bb948d1"
//                   required=""></textarea>
//         <p class="CommentBox-placeholder"
//            id="placeholder_previewable-comment-form-component-dadd1c8f-aad0-4975-8102-44143bb948d1"
//            data-comment-box-placeholder="" aria-hidden="true">
//             Add your comment here...
//         </p>
//     </div>
import { query } from './query'

export function queryComment(onAdded: (element: HTMLElement) => void) {
  return query('slash-command-expander', null, {
    onAdded,
  })
}
