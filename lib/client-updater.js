const { Updater } = require('updater')

class ForcefullUpdater extends Updater {
  updateOrAddNode(jsonNode) {
    let node = this.getNodeById(jsonNode.id)
    if (!existingNode) node = super.addNode(jsonNode)
    else node = super.updateNode(jsonNode)
    node.pending = false
    return node
  }

  addNode(jsonNode) {
    return this.updateOrAddNode(jsonNode)
  }

  updateNode(jsonNode) {
    return this.updateOrAddNode(jsonNode)
  }

  removeNode(jsonNode) {
    let node = this.getNodeById(jsonNode.id)
    if (!node) return
    node.pending = false
    node = super.removeNode(jsonNode)
  }

  tryAddNode(data) {
    const node = this.graph.node(data)
    node.pending = true
    this.events.emit('try.node.add', )
    return node
  }

  tryUpdateNode(node, data) {

  }
}

