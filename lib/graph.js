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

const cryptoRandomString = require('crypto-random-string')

function generateId () {
  const idLength = 16
  return cryptoRandomString(idLength)
}

module.exports.Graph = class Graph {
  static create (json) {
    const graph = new Graph()
    if (typeof json === 'string') json = JSON.parse(json)
    if (json) graph._fromJSON(json)
    return graph
  }

  constructor () {
    this.nodes = []
  }

  get edges () {
    return this.nodes.reduce((edges, n) => {
      return edges.concat(n.edges.filter(e => e.from === n))
    }, [])
  }

  edge (from, to, data) {
    return new Edge(from, to, data, this, generateId())
  }

  node (data) {
    return new Node(data, this, generateId())
  }

  toJSON () {
    const nodes = this.nodes.map(n => n.toJSON())
    const edges = this.edges.map(e => e.toJSON())
    return nodes.concat(edges)
  }

  _fromJSON (json) {
    json.forEach(ji => {
      if (!ji.from) return new Node(ji.data, this, ji._id)

      const from = this.nodes.find(n => ji.from === n._id)
      const to = this.nodes.find(n => ji.to === n._id)
      return new Edge(from, to, ji.data, this, ji._id)
    })
  }
}

class Edge {
  constructor (from, to, data, graph, id) {
    this._graph = graph
    this._id = id
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
    let json = {
      _id: this._id,
      from: this.from._id,
      to: this.to._id,
      data: this.data,
    }
    return json
  }
}

class Node {
  constructor (data, graph, id) {
    this._graph = graph
    this._id = id
    this.data = data
    this.edges = []
    graph.nodes.push(this)
  }

  remove () {
    this.edges.forEach(e => {
      if (e.from !== this) e.from.edges.splice(e.from.edges.indexOf(e), 1)
      if (e.to !== this) e.to.edges.splice(e.to.edges.indexOf(e), 1)
    })
    this._graph.nodes.splice(this._graph.nodes.indexOf(this), 1)
    return this
  }

  toJSON () {
    let json = {
      _id: this._id,
      data: this.data,
    }
    return json
  }
}