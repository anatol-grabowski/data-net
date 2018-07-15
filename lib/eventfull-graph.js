const { Node, Edge, Graph } = require('./graph')
const EventEmitter = require('events')

const EVENT_NODE_ADD = 'node.add'
const EVENT_NODE_UPDATE = 'node.update'
const EVENT_NODE_REMOVE = 'node.remove'
const EVENT_TRY_NODE_ADD = 'try.node.add'
const EVENT_TRY_NODE_UPDATE = 'try.node.update'
const EVENT_TRY_NODE_REMOVE = 'try.node.remove'

function hash(item) {
  return JSON.stringify(item)
}

class EventfullNode extends Node {
  constructor(...args) {
    super(...args)
    this.removed = false
    this.pending = false
  }

  tryUpdate(data) {
    const oldNode = this.this.toJSON()
    this.data = data
    this.removed = false
    this.pending = true
    this.graph.events.emit('try.node.update', {oldNode, node: this})
    return this
  }

  tryRemove() {
    const oldNode = this.this.toJSON()
    this.removed = true
    this.pending = true
    this.graph.events.emit('try.node.remove', {oldNode, node: this})
    return this
  }
}

class EventfullEdge extends Edge {

}

class EventfullGraph extends Graph {
  constructor(...args) {
    super(...args)
    this.events = new EventEmitter()
  }

  tryAddNode(...args) {
    const node = this.node(...args)
    node.removed = false
    node.pending = true
    this.events.emit(EVENT_TRY_NODE_ADD, {node})
    return node
  }

  addNode(jsonNode) {
    const node = this.nodeFromJSON(jsonNode)
    node.removed = false
    node.pending = false
    this.events.emit(EVENT_NODE_ADD, {node})
    return node
  }

  updateNode(node, jsonNode) {
    node.data = jsonNode.data
    node.removed = false
    node.pending = false
    this.events.emit(EVENT_NODE_UPDATE, {node})
    return node
  }

  removeNode(node) {
    node.remove()
    node.removed = true
    node.pending = false
    this.events.emit(EVENT_NODE_REMOVE, {node})
    return node
  }

  getNodeById(id) {
    return this.nodes.find(node => node.id === id)
  }

  getHash(item) {
    return hash(item.toJSON())
  }

  isUpdateValid(node, nodeHash) {
    return this.getHash(node) === nodeHash
  }

  validatedAddNode(jsonNode) {
    const node = this.getNodeById(jsonNode.id)
    if (node) return node
    return this.addNode(jsonNode)
  }

  validatedUpdateNode(jsonNode, oldNodeHash) {
    const node = this.getNodeById(jsonNode.id)
    if (!node) return null
    const canUpdate = this.isUpdateValid(node, oldNodeHash)
    if (!canUpdate) return node
    return this.updateNode(node, jsonNode)
  }

  validatedRemoveNode(jsonNode, oldNodeHash) {
    const node = this.getNodeById(jsonNode.id)
    if (!node) return null
    const canUpdate = this.isUpdateValid(node, oldNodeHash)
    if (!canUpdate) return node
    return this.removeNode(node)
  }

  validatedNode(jsonNode, oldNodeHash) {
    if (oldNodeHash === undefined) return this.validatedAddNode(jsonNode)
    if (jsonNode.removed) return this.validatedRemoveNode(jsonNode, oldNodeHash)
    return this.validatedUpdateNode(jsonNode, oldNodeHash)
  }

  forcedAddOrUpdateNode(jsonNode) {
    const node = this.getNodeById(jsonNode.id)
    if (node) return this.updateNode(node, jsonNode)
    else return this.addNode(jsonNode)
  }

  forcedRemoveNode(jsonNode) {
    const node = this.getNodeById(jsonNode.id)
    if (node) return this.removeNode(node)
    else return null
  }

  forcedNode(jsonNode) {
    if (jsonNode.removed) return this.forcedRemoveNode(jsonNode)
    else return this.forcedAddOrUpdateNode(jsonNode)
  }



  tryAddEdge(...args) {
    const edge = this.edge(...args)
    edge.pending = true
    edge.removed = false
    this.events.emit('try.edge.add', {edge})
    return edge
  }

}
EventfullGraph.Node = EventfullNode
EventfullGraph.Edge = EventfullEdge

module.exports = {
  Node: EventfullNode,
  Edge: EventfullEdge,
  Graph: EventfullGraph,
  EVENT_NODE_ADD,
  EVENT_NODE_UPDATE,
  EVENT_NODE_REMOVE,
  EVENT_TRY_NODE_ADD,
  EVENT_TRY_NODE_UPDATE,
  EVENT_TRY_NODE_REMOVE,
}