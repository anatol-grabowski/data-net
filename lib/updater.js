// add_ok, add_exists
// data_ok, data_doesnt_exist, data_diff_prev
// remove_ok, remove_doesnt_exist, remove_diff_prev

const EventEmitter = require('events')

function deepEqual(obj1, obj2) {

}

class Updater {
  constructor(graph) {
    this.graph = graph
    this.events = new EventEmitter()
  }

  getNodeById(id) {
    return this.graph.nodes.find(node => node.id === id)
  }

  addNode(jsonNode) {
    const existingNode = this.getNodeById(jsonNode.id)
    if (existingNode) throw new Error(`Node ${jsonNode.id} already exists`)
    const newNode = this.graph.nodeFromJSON(jsonNode)
    this.events.emit('node.add', newNode)
    return newNode
  }

  updateNode(jsonNode) {
    const existingNode = this.getNodeById(jsonNode.id)
    if (!existingNode) throw new Error(`Node ${jsonNode.id} doesn't exist`)
    existingNode.data = jsonNode.data
    this.events.emit('node.update', existingNode)
    return existingNode
  }

  removeNode(jsonNode) {
    const existingNode = this.getNodeById(jsonNode.id)
    if (!existingNode) throw new Error(`Node ${jsonNode.id} doesn't exist`)
    existingNode.remove()
    this.events.emit('node.remove', existingNode)
    return removedNode
  }
}

class ValidatingUpdater extends Updater {
  addNode(jsonNode) {
    const existingNode = this.getNodeById(jsonNode.id)
    if (existingNode) return existingNode
    return super.addNode(jsonNode)
  }

  updateNode(jsonNode, prevJsonNode) {
    const existingNode = this.getNodeById(jsonNode.id)
    if (!existingNode) return
    const canUpdate = deepEqual(prevJsonNode, existingNode.toJSON())
    if (!canUpdate) return existingNode
    return super.updateNode(jsonNode)
  }

  nodeRemove(jsonNode, prevJsonNode) {
    const existingNode = this.getNodeById(jsonNode.id)
    if (!existingNode) return
    const canUpdate = deepEqual(prevJsonNode, existingNode.toJSON())
    if (!canUpdate) return existingNode
    super.removeNode(jsonNode)
    return
  }
}

module.exports = {
  Updater,
  ValidatingUpdater
}