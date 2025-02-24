import { createEffect } from "solid-js";
import type { Editor, Extension } from "prosekit/core";
import type { Accessor } from "solid-js";

export function createEditorExtension(
  editor: Accessor<Editor | null>,
  extension: Extension,
) {
  createEffect(() => {
    editor()?.use(extension);
  });
}
