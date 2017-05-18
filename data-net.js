//Nodes and edges are arrays to allow usage of all of the arrays methods and cool stuff.
//Ids are needed when graph or individual node/edge is saved to file or sent through wire.
//It is impossible to make nodes agnostic of their graph during node.remove,
//it is impossible to make edges agnostic of their graph during Edge.fromJSON,
//so we keep graph property for both nodes and edges.
//Graph.nodes is not a sparse array.
//Edges array in graph seems to be redundant.
//No checks for errors performed in methods
//
/*__________________________________________________________
 * Graph								Node							Edge
 * -lastId							-id								-id
 * -nodes[]							-data							-from
 *											-edges[]					-to
 *											-graph						-graph
 *
 * -nextId()						-remove()					-remove()
 * -node()							-from()						
 * -edge()							-to()
 * -getNode()						-getEdge()
 *
 * -toJSON()						-toJSON()					-toJSON()
 * -fromJSON()					-fromJSON()				-fromJSON()
 * -nodeFromJSON()			-fromsToJSON()
 * -edgeFromJSON()
 *__________________________________________________________*/
/**=================================================================CORE========*/
function Graph(jsonGraph) {
	this.lastId = undefined	
	this.nodes = []	//cleaner and simpler than 'Graph.prot = Obj.cr(Arr.prot)'
	if (jsonGraph) { this.fromJSON(jsonGraph) }
}
Graph.prototype.nextId = function() {
	this.lastId = (this.lastId == undefined) ? 0 : this.lastId+1
	return this.lastId
}
Graph.prototype.node = function(data) {
	return new Node(data, this)
}
Graph.prototype.edge = function(from, to) {
	return new Edge(from, to, this)
}
Graph.prototype.getNode = function(id) {
	return this.nodes.find(n=>n.id==id)
}
Graph.prototype.nodeFromJSON = function(jsonObj) {
	let found = this.getNode(jsonObj.id)
	if (found) { found.remove() }
	let node = new Node(this, jsonObj)
	if (found) { node.edges = found.edges }
	return node
}
Graph.prototype.edgeFromJSON = function(jsonObj) {
	let found_n = this.getNode(jsonObj.from)
	if (found_n) {
		let found_e = found_n.getEdge(jsonObj.id)
		found_e.remove()
	}
	return new Edge(this, jsonObj)
}

function Edge(from, to, graph) {
	if (arguments[0] && arguments[0].constructor == Graph) {
		this.graph = arguments[0]
		if (arguments[1]) { this.fromJSON(arguments[1]) }
		return
	}
	this.from = from
	this.to = to
	this.graph = graph
	this.id = graph ? this.graph.nextId() : undefined
	if (from) { from.edges.push(this) }
	if (to) { to.edges.push(this) }
}
Edge.prototype.remove = function() {
	this.from.edges.splice(this.from.edges.indexOf(this), 1)
	this.to.edges.splice(this.to.edges.indexOf(this), 1)
}

function Node(data, graph) {
	if (arguments[0] && arguments[0].constructor == Graph) {
		this.graph = arguments[0]
		this.edges = []
		if (arguments[1]) { this.fromJSON(arguments[1]) }
		return
	}
	this.data = data
	this.edges = []	//not object with ids to allow multiple conn-s of same nodes
	this.graph = graph
	this.id = graph ? this.graph.nextId() : undefined
	if (graph) { this.graph.nodes.push(this) }
}
Node.prototype.remove = function() {
	for (let i=this.edges.length; i--; ) { this.edges[i].remove() }
	this.graph.nodes.splice(this.graph.nodes.indexOf(this), 1)
}
Node.prototype.to = function(to) {
	return new Edge(this, to, this.graph)
}
Node.prototype.from = function(from) {
	return new Edge(from, this, this.graph)
}
Node.prototype.getEdge = function(id) {
	return this.edges.find(e=>e.id==id)
}

Graph.Edge = Edge
Graph.Node = Node
module.exports = Graph
/**============================== toJSON/fromJSON =================================*/
function copyProps(src, dst, skip=[]) {
	for (let prop in src) {
		if (!src.hasOwnProperty(prop)) continue
		if ( skip.find((pr)=>pr==prop) || (typeof src[prop] == 'function') ) continue
		dst[prop] = src[prop]
	}
}

Edge.prototype.toJSON = function() {
	let jsonEdge = {}
	jsonEdge.to = this.to.id
	jsonEdge.from = this.from.id
	copyProps(this, jsonEdge, ['graph', 'from', 'to'])
	return jsonEdge
}
Edge.prototype.fromJSON = function(jsonObj) {
	if (typeof jsonObj == 'string') { jsonObj = JSON.parse(jsonObj) }
	//this.from = this.graph.nodes[jsonObj.from]
	//this.to = this.graph.nodes[jsonObj.to]
	this.from = this.graph.nodes.find(n=>n.id==jsonObj.from)
	this.to = this.graph.nodes.find(n=>n.id==jsonObj.to)
	this.from.edges.push(this)
	this.to.edges.push(this)
	copyProps(jsonObj, this, ['graph', 'from', 'to'])
	return this
}

Node.prototype.toJSON = function() {
	let jsonNode = {}
	copyProps(this, jsonNode, ['graph', 'edges'])
	return jsonNode
}
Node.prototype.fromsToJSON = function() {
	let jsonEdges = []
	this.edges.forEach((edge)=>{ if (edge.from == this) jsonEdges.push(edge.toJSON()) })
	return jsonEdges
}
Node.prototype.fromJSON = function(jsonObj) {
	if (typeof jsonObj == 'string') { jsonObj = JSON.parse(jsonObj) }
	copyProps(jsonObj, this, ['graph', 'edges'])
	//if (this.graph) { this.graph.nodes[this.id] = this }
	if (this.graph) { this.graph.nodes.push(this) }
	return this
}

Graph.prototype.toJSON = function() {
	let jsonGraph = { nodes: [], edges: [] }
	copyProps(this, jsonGraph, ['nodes', 'edges'])
	this.nodes.forEach((node)=>{
		jsonGraph.nodes.push(node.toJSON())
		jsonGraph.edges = jsonGraph.edges.concat(node.fromsToJSON())
	})
	return jsonGraph
}
Graph.prototype.fromJSON = function(jsonObj) {
	if (typeof jsonObj == 'string') { jsonObj = JSON.parse(jsonObj) }
	copyProps(jsonObj, this, ['nodes', 'edges'])
	for (let jsonNode of jsonObj.nodes) {
		new Node(this, jsonNode) }
	for (let jsonEdge of jsonObj.edges) {
		new Edge(this, jsonEdge) }
	return this
}
