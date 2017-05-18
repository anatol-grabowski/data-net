# data-net
Serializable (JSON.stringifiable) directed/undirected graph (datanet).
Multiple connections between the same nodes are possible.
Wether graph is directed or not depends on how you treat edges.

### Graph is a set of Nodes connected by Edges:
```
Graph {
  lastId: number //counter for assigning unique ids to nodes and edges
  nodes: Node[] //dense array of nodes
  
  new Graph([jsonGraph: JsonGraph||string]): Graph
  node(data: any): Node //creates new node
  edge(from: Node, to: Node): Edge //creates an edge between two nodes
	nodeFromJSON(jsonNode: JsonNode): Node //node from json, overwrites if exist, keeps edges
	edgeFromJSON(jsonEdge: JsonEdge): Edge //edge from json, overwrites if exist
	getNode(id: number): Node //finds node by id
  nextId(): number //generates new id (essentialy lastId++)
  toJSON(): JsonGraph //simple representaton of the graph without recursive properties
  fromJSON(jsonGraph: JsonGraph||string): this
}
```

```
Node {
  id: number //ids needed for proper (de)serialization
  data: any //any kind of data you wish to store in the node
  edges: Edge[] //incoming and outgoing edges are stored in the same array
  graph: Graph //needed for remove method
  
  remove(): undefined //removes node from graph.nodes and all edges from connected nodes
  from(fromNode: Node): Edge //shortcut for faster edges creating
  to(toNode: Node): Edge //shortcut for faster edges creating
	getEdge(id: number): Edge //finds edge by id
  fromsToJSON(): JsonEdge[] //provides serialization of outgoing edges
  toJSON(): JsonNode //skips graph and edges properties
  fromJSON(jsonNode: JsonNode||string): this
	//creation of nodes through constructor is not recommended use graph.node() instead
  new Node([data: any, graph: Graph]): Node //adds node to graph.nodes
  new Node(graph: Graph): Node //sets NOTHING but graph property of the node
}
```

```
Edge {
  id: number
  from: Node
  to: Node
  graph: Graph //needed to find nodes during deserialization

  remove(): undefined //removes edge from from.edges and to.edges
  toJSON(): JsonEdge //replaces from and to with from.id and to.id, skips graph property
  fromJSON(jsonEdge: JsonEdge||string): this
	//creation of edges through constructor is not recommended use graph.edge() instead
  new Edge([from: Node, to: Node, graph: Graph]): Edge //adds edge to from-, to.edges
  new Edge(graph: Graph): Edge //sets NOTHING but graph property of the edge
}
```
See more concise summary of all methods on top of the source file.

## Examples
### Graph serialization/deserialization
This example creates a "triangular" graph (3 nodes, 3 edges).
```
  const Graph = require('data-net')
  let g = new Graph()
  let n1 = g.node('node1') //string as data
  let n2 = g.node({name: 'John', age: 24}) //object as data
  let e1 = g.edge(n1, n2)
  let n3 = g.node(666)
  let e2 = n2.to(n3) //connect n2 and n3 by edge
  let e3 = n1.from(n3)
  n3.x = 40 //custom properties can be added to nodes
  n3.y = 100
  e2.weight = 2 //or edges
  g.name = 'sample graph' //or graph

  //now serialize graph
  let sg = JSON.stringify(g)
 /*'{"nodes":[
   {"data":"node1","id":0},
   {"data":{"name":"John","age":24},"id":1},
   {"data":666,"id":3,"x":40,"y":100}],
  "edges":[
   {"to":1,"from":0,"id":2},
   {"to":3,"from":1,"id":4,"weight":2},
   {"to":0,"from":3,"id":5}],
 	"lastId":5,
  "name":"sample graph"}'*/

  //deserialize
  let g2 = new Graph(sg) //now g2 is the same as g
  
  //alternative way
  let jsong = g.toJSON()
  let sjsong = JSON.stringify(jsong) //sjsong == sg
  let g3 = new Graph().fromJSON(sjsong)
  let g4 = new Graph().fromJSON(jsong) //now g, g1, g2, g3 are all the same
```
