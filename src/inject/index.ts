import { onCommitFiberRoot } from 'bippy'

// installRDTHook()

onCommitFiberRoot((root) => {
  console.log(root)
})
