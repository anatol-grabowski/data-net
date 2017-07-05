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
 * -lastId              -id               -id
 * -nodes[]             -data             -from
 * -get edges[]         -edges[]          -to
 *                      -graph            -graph
 *
 * -nextId()            -remove()         -remove()
 * -node()              -from()
 * -edge()              -to()
 * -getNode()           -getEdge()
 *
 * -toJSON()            -toJSON()          -toJSON()
 * -fromJSON()          -fromJSON()        -fromJSON()
 * -nodeFromJSON()
 * -edgeFromJSON()
 *__________________________________________________________ */
function Graph (jsonGraph) {
  this.lastId = undefined
  this.nodes = []  // cleaner and simpler than 'Graph.prot = Obj.cr(Arr.prot)'
  if (jsonGraph) { this.fromJSON(jsonGraph) }
}
Object.defineProperty(Graph.prototype, 'edges', {
  get: function () {
    let es = []
    this.nodes.forEach(n => {
      es = es.concat(n.edges.filter(e => e.from === n))
    })
    return es
  }
})
Graph.prototype.nextId = function () {
  this.lastId = (this.lastId === undefined) ? 0 : this.lastId + 1
  return this.lastId
}
Graph.prototype.node = function (data) {
  let n = new Node(data)
  n.graph = this
  n.id = this.nextId()
  this.nodes.push(n)
  return n
}
Graph.prototype.edge = function (from, to) {
  let e = new Edge(from, to)
  e.graph = this
  e.id = this.nextId()
  return e
}
Graph.prototype.getNode = function (id) {
  if (id instanceof Node) return this.nodes.find(n => n === id)
  return this.nodes.find(n => n.id === id)
}
Graph.prototype.getEdge = function (id) {
  if (id instanceof Edge) return this.edges.find(e => e === id)
  return this.edges.find(e => e.id === id)
}
Graph.prototype.nodeFromJSON = function (jsonObj) {
  let n = new Node().fromJSON(jsonObj)
  let nFound = this.getNode(n.id)
  if (nFound) {
    nFound.remove()
    n.edges = nFound.edges
  }
  n.graph = this
  this.nodes.push(n)
  return n
}
Graph.prototype.edgeFromJSON = function (jsonObj) {
  let nFound = this.nodes.find(n => n.id === jsonObj.from)
  if (nFound) {
    let eFound = nFound.getEdge(jsonObj.id)
    if (eFound) eFound.remove()
  }
  let e = new Edge().fromJSON(jsonObj, this.nodes)
  e.graph = this
  return e
}

function Edge (from, to) {
  this.from = from
  this.to = to
  if (this.from) this.from.edges.push(this)
  if (this.to) this.to.edges.push(this)
}
Edge.prototype.remove = function () {
  if (this.from) this.from.edges.splice(this.from.edges.indexOf(this), 1)
  if (this.to) this.to.edges.splice(this.to.edges.indexOf(this), 1)
}

function Node (data) {
  this.data = data
  this.edges = []  // not object with ids to allow multiple conn-s of same nodes
}
Node.prototype.remove = function () {
  for (let i = this.edges.length; i--;) { this.edges[i].remove() }
  if (this.graph) this.graph.nodes.splice(this.graph.nodes.indexOf(this), 1)
}
Node.prototype.to = function (to) {
  if (this.graph) return this.graph.edge(this, to)
  else return new Edge(this, to)
}
Node.prototype.from = function (from) {
  if (this.graph) return this.graph.edge(from, this)
  else return new Edge(from, this)
}
Node.prototype.getEdge = function (id) {
  if (id instanceof Edge) return this.edges.find(e => e === id)
  return this.edges.find(e => e.id === id)
}

Graph.Edge = Edge
Graph.Node = Node
if (this.window && this === window) {
  this.Graph = Graph
} else {
  module.exports = Graph
}
/** ============================== toJSON/fromJSON ================================= */
function copyProps (src, dst, skip = []) {
  for (let prop in src) {
    if (!src.hasOwnProperty(prop)) continue
    if (skip.find((pr) => pr === prop) || (typeof src[prop] === 'function')) continue
    dst[prop] = src[prop]
  }
}

Edge.prototype.toJSON = function () {
  let jsonEdge = {}
  jsonEdge.to = this.to.id
  jsonEdge.from = this.from.id
  copyProps(this, jsonEdge, ['graph', 'from', 'to'])
  return jsonEdge
}
Edge.prototype.fromJSON = function (jsonObj, nodes) {
  if (typeof jsonObj === 'string') { jsonObj = JSON.parse(jsonObj) }
  this.from = nodes.find(n => n.id === jsonObj.from)
  this.to = nodes.find(n => n.id === jsonObj.to)
  if (this.from) this.from.edges.push(this)
  if (this.to) this.to.edges.push(this)
  copyProps(jsonObj, this, ['graph', 'from', 'to'])
  return this
}

Node.prototype.toJSON = function () {
  let jsonNode = {}
  copyProps(this, jsonNode, ['graph', 'edges'])
  return jsonNode
}
Node.prototype.fromJSON = function (jsonObj) {
  if (typeof jsonObj === 'string') jsonObj = JSON.parse(jsonObj)
  copyProps(jsonObj, this, ['graph', 'edges'])
  return this
}

Graph.prototype.toJSON = function () {
  let jsonGraph = { nodes: [], edges: [] }
  copyProps(this, jsonGraph, ['nodes', 'edges'])
  jsonGraph.nodes = this.nodes.map(n => n.toJSON())
  jsonGraph.edges = this.edges.map(e => e.toJSON())
  return jsonGraph
}
Graph.prototype.fromJSON = function (jsonObj) {
  if (typeof jsonObj === 'string') jsonObj = JSON.parse(jsonObj)
  copyProps(jsonObj, this, ['nodes', 'edges'])
  //`for of` in case `nodes` is not an array for some reason
  for (let jsonNode of jsonObj.nodes) this.nodeFromJSON(jsonNode)
  for (let jsonEdge of jsonObj.edges) this.edgeFromJSON(jsonEdge)
  return this
}
