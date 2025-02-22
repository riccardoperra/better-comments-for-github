import { visit } from 'unist-util-visit'
import type {
  BlockContent,
  DefinitionContent,
  ListData,
  Parent,
  Root,
} from 'mdast'

export interface FlatList extends Parent {
  /**
   * Node type of mdast list.
   */
  type: 'flatList'
  /**
   * The kind of the list
   */
  kind: 'ordered' | 'bullet' | 'task' | 'toggle'
  /**
   * Whether the list is checked
   */
  checked?: boolean | null
  /**
   * The starting number of the list, when the `ordered` field is `true`.
   */
  start?: number | null | undefined
  /**
   * Whether one or more of the children are separated with a blank line from
   * its siblings (when `true`), or not (when `false` or not present).
   */
  spread?: boolean | null | undefined
  /**
   * Children of list.
   */
  children: Array<BlockContent | DefinitionContent>
  /**
   * Data associated with the mdast list.
   */
  data?: ListData | undefined
}

declare module 'mdast' {
  interface RootContentMap {
    flatList: FlatList
  }
}

export const remarkFlatList = () => {
  return (tree: Root) => {
    visit(tree, 'listItem', (node, index, parent) => {
      let kind: FlatList['kind'] = 'bullet'
      let checked = node.checked

      if (parent && parent.type === 'list') {
        if (parent.ordered === true) {
          kind = 'ordered'
        }
      }

      if (node.checked === true || node.checked === false) {
        kind = 'task'
      }

      if (kind !== 'task') {
        checked = null
      }

      const newNode: FlatList = {
        type: 'flatList',
        children: node.children,
        kind,
        checked: node.checked,
      }

      if (typeof index === 'number' && parent) {
        parent.children[index] = newNode
      }
    })
    visit(tree, 'list', (node, index, parent) => {
      if (typeof index === 'number' && parent) {
        parent.children.splice(index, 1, ...node.children)
      }
    })
  }
}
