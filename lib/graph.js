// Nodes and edges are arrays to allow usage of all of the arrays methods and cool stuff.
// Ids are needed when graph or individual node/edge is saved to file or sent through wire.
// Edges are kept within nodes, it is more convenient than in graph.
// It is impossible to make nodes agnostic of their graph during node.remove,
// it is impossible to make edges agnostic of their graph during Edge.fromJSON,
// Graph.nodes is not a sparse array.
// Edges array in graph seems to be redundant.
// No checks for errors performed in methods
/* __________________________________________________________
 * Graph                Node              Edge
 * .nodes[]             .data             .from
 * .get edges[]         .edges[]          .to
 *
 * .node()              .remove()         .remove()
 * .edge()
 *
 * .toJSON()            .toJSON()          .toJSON()
 * .create(json)
 *
 * ._fromJSON(json)     ._id              ._id
 *                      ._graph           ._graph
 *
 *__________________________________________________________ */

function generateId () {
  const genByte = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  const idLengthBytes = 8
  let id = ''
  for (let i = 0; i < idLengthBytes; i++) id += genByte()
  return id
}

class Edge {
  constructor (from, to, data, graph, id) {
    this.graph = graph
    this.id = id
    this.from = from
    this.to = to
    this.data = data
    from.edges.push(this)
    to.edges.push(this)
  }

  remove () {
    this.from.edges.splice(this.from.edges.indexOf(this), 1)
    this.to.edges.splice(this.to.edges.indexOf(this), 1)
    return this
  }

  toJSON () {
    return {
      id: this.id,
      from: this.from.id,
      to: this.to.id,
      data: this.data,
    }
  }
}

class Node {
  constructor (data, graph, id) {
    this.graph = graph
    this.id = id
    this.data = data
    this.edges = []
    graph.nodes.push(this)
  }

  remove () {
    this.edges.forEach(e => {
      if (e.from !== this) e.from.edges.splice(e.from.edges.indexOf(e), 1)
      if (e.to !== this) e.to.edges.splice(e.to.edges.indexOf(e), 1)
    })
    this.graph.nodes.splice(this.graph.nodes.indexOf(this), 1)
    return this
  }

  toJSON () {
    return {
      id: this.id,
      data: this.data,
    }
  }
}

class Graph {
  static create (json) {
    const graph = new Graph()
    if (typeof json === 'string') json = JSON.parse(json)
    if (json) graph.fromJSON(json)
    return graph
  }

  constructor () {
    this.nodes = []
  }

  get edges () {
    return this.nodes.reduce((acc, node) => {
      const outs = node.edges.filter(e => e.from === node)
      return acc.concat(outs)
    }, [])
  }

  edge (from, to, data) {
    return new this.constructor.Edge(from, to, data, this, generateId())
  }

  node (data) {
    return new this.constructor.Node(data, this, generateId())
  }

  toJSON () {
    return {
      nodes: this.nodes.map(n => n.toJSON()),
      edges: this.edges.map(e => e.toJSON())
    }
  }

  fromJSON (json) {
    json.nodes.forEach(jsonNode => this.nodeFromJSON(jsonNode))
    json.edges.forEach(jsonEdge => this.edgeFromJSON(jsonEdge))
  }

  nodeFromJSON (json) {
    return new this.constructor.Node(json.data, this, json.id)
  }

  edgeFromJSON (json) {
    const from = this.nodes.find(n => json.from === n.id)
    const to = this.nodes.find(n => json.to === n.id)
    return new this.constructor.Edge(from, to, json.data, this, json.id)
  }
}
Graph.Node = Node
Graph.Edge = Edge

module.exports = {
  Node,
  Edge,
  Graph
}