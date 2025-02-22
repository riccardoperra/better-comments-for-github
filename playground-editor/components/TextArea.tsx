import type { Ref } from 'solid-js'

export interface TextAreaProps {
  ref: Ref<HTMLTextAreaElement>
  initialValue?: string
}

export function TextArea(props: TextAreaProps) {
  return (
    <textarea
      ref={props.ref}
      class={'FormControl FormControl-textarea'}
      value={props.initialValue}
    ></textarea>
  )
}
