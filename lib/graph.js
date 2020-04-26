function generateId () {
  const genByte = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  const idLengthBytes = 8
  let id = ''
  for (let i = 0; i < idLengthBytes; i++) id += genByte()
  return id
}

const Graph = {
  createNode(graph, data) {
    const node = {
      id: generateId(),
      data,
    }
    graph.nodes.push(node)
    return node
  },
  createEdge(graph, from, to, data) {
    const fromNode = graph.nodes.find(n => n.id === from)
    const toNode = graph.nodes.find(n => n.id === to)
    if (!fromNode || !toNode) throw Error('Not found from or to node.')
    const edge = {
      id: generateId(),
      from,
      to,
      data,
    }
    graph.edges.push(edge)
    return edge
  },
  deleteNode(graph, nodeId) {
    const nodeIndex = graph.nodes.findIndex(n => n.id === nodeId)
    if (nodeIndex === -1) return
    graph.nodes.splice(nodeIndex, 1)

    while (true) {
      const edgeIndex = graph.edges.findIndex(e => e.from === nodeId || e.to === nodeId)
      if (edgeIndex === -1) return
      graph.edges.splice(edgeIndex, 1)
    }
  },
  deleteEdge(graph, edgeId) {
    const edgeIndex = graph.edges.findIndex(e => e.id === edgeId)
    if (edgeIndex === -1) return
    graph.edges.splice(edgeIndex, 1)
  }
}

module.exports = {
  Graph,
}
