  const { Graph } = require('..')

  let g = Graph.create()
  let n1 = g.node('node1 data')
  let n2 = g.node({name: 'John', age: 24})
  let e1 = g.edge(n1, n2)
  let n3 = g.node(666)
  let e2 = g.edge(n2, n3, 'edge data')
  let e3 = g.edge(n3, n1)

  let sg = JSON.stringify(g, null, 2)
  console.log(sg)

  let g2 = Graph.create(sg)