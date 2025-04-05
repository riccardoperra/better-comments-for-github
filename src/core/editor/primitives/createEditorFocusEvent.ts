import { defineFocusChangeHandler } from "prosekit/core";
import { createEditorExtension } from "./createEditorExtension";
import type { Editor, FocusChangeHandler } from "prosekit/core";
import type { Accessor } from "solid-js";

/**
 * @internal
 */
export function createEditorFocusChangeEvent(
  editor: Accessor<Editor | null>,
  handler: FocusChangeHandler,
) {
  const extension = defineFocusChangeHandler(handler);
  createEditorExtension(editor, extension);
}
