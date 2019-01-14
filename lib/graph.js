// Nodes and edges are arrays to allow usage of all of the arrays methods and cool stuff.
// Ids are needed when graph or individual node/edge is saved to file or sent through wire.
// Edges are kept within nodes, it is more convenient than in graph.
// It is impossible to make nodes agnostic of their graph during node.remove,
// it is impossible to make edges agnostic of their graph during Edge.fromJSON,
// node.remove keeps edges connected to the removed node
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
 * .toJSON()            .toJSON()         .toJSON()
 * .create(json)
 *
 * .fromJSON(json)      .id               .id
 *                      .graph            .graph
 *
 *__________________________________________________________ */

function generateId () {
  const genByte = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  const idLengthBytes = 8
  let id = ''
  for (let i = 0; i < idLengthBytes; i++) id += genByte()
  return id
}

function createGraph(jg) {
  if (jg) return graphFromJson(jg)
  return { nodes: [], edges: [] }
}

function graphFromJson(jg) {
  if (typeof jg === 'string') jg = JSON.parse(jg)
  const nodes = jg.nodes.map(jn => makeNode(jn))
  const edges = jg.edges.map(je => {
    const e = makeEdge(nodes, je)
    e.nodes.forEach(n => n.edges.push(e))
    return e
  })
  return { nodes, edges }
}

function makeNode(jn) {
  return  {
    id: jn.id,
    data: jn.data,
    edges: [],
  }
}

// makes incomplete edge (doesn't update nodes)
function makeEdge(nodes, je) {
  return {
    id: je.id,
    data: je.data,
    nodes: je.nodes.map(id => nodes.find(n => n.id === id)),
  }
}

function addNode(graph, jn) {
  const node = makeNode(jn)
  node.id = generateId()
  return {
    nodes: graph.nodes.concat([node]),
    edges: graph.edges,
  }
}

function addEdge(graph, je) {
  const edge = makeEdge(graph.nodes, je)
  edge.id = generateId()
  edge.nodes = edge.nodes.map(n => ({
    id: n.id,
    data: n.data,
    edges: n.edges.concat([edge]),
  }))
  return {
    nodes: graph.nodes.map(n => edge.nodes.find(en => en.id === n.id) || n),
    edges: graph.edges.concat([edge]),
  }
}

function removeNode(graph, id) {

}

function removeEdge(graph, id) {

}

function updateNode(graph, id, data) {

}

function updateEdge(graph, id, data) {

}

function nodeToJson(n) {
  return {
    id: n.id,
    data: n.data,
  }
}

function edgeToJson(e) {
  return {
    id: e.id,
    nodes: e.nodes.slice(0, 2).map(n => n.id),
    data: e.data,
  }
}

function graphToJson(g) {
  return {
    nodes: g.nodes.map(n => nodeToJson(n)),
    edges: g.edges.map(e => edgeToJson(e)),
  }
}

module.exports = {
  createGraph,
  graphFromJson,
}

const gs = []
gs.push(createGraph())
gs.push(addNode(gs.slice(-1)[0], {data: 123}))
gs.push(addNode(gs.slice(-1)[0], {data: 'str'}))
gs.push(addNode(gs.slice(-1)[0], {data: {a: []}}))
gs.push(addEdge(gs.slice(-1)[0], {nodes: [gs.slice(-1)[0].nodes[0].id, gs.slice(-1)[0].nodes[1].id], data: 'edg'}))

gs.forEach((g, i) => {
  console.log(i)
  console.log(g)
  const jg = graphToJson(g)
  const sg = JSON.stringify(jg, null, 2)
  console.log(sg)
})