import { visit } from 'unist-util-visit'

export function rehypeBlockquote() {
  return function transformer(tree: any) {
    visit(tree, 'blockquote', (blockquote) => {
      const firstChildNode = blockquote.children.find(
        (child: any) => child.type === 'paragraph',
      )
      if (!firstChildNode) {
        return
      }
      for (const child of firstChildNode.children) {
        // Support custom props: `prop1=value`
        if (child.type === 'text') {
          // Support GitHub syntax
          const match = [
            { match: '[!WARNING]', type: 'warning' },
            { match: '[!NOTE]', type: 'info' },
          ].find(({ match }) => child.value.includes(match))

          if (match) {
            blockquote.type = 'blockquoteCallout'
            // blockquote.properties.type = match.type
            child.value = child.value.replaceAll(match, '')
            break
          }
        }
      }
    })
  }
}
