import { defineUpdateHandler } from "prosekit/core";
import { createEditorExtension } from "./createEditorExtension";
import type { Editor, UpdateHandler } from "prosekit/core";
import type { Accessor } from "solid-js";

/**
 * @internal
 */
export function createEditorUpdateEvent(
  editor: Accessor<Editor | null>,
  handler: UpdateHandler,
) {
  const extension = defineUpdateHandler(handler);
  createEditorExtension(editor, extension);
}
