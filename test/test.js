/* global describe, it */
let chai = require('chai')
let expect = chai.expect
let { createGraph } = require('..')

describe('Graph creation', () => {
  it.only('should create empty', () => {
    const g = createGraph()
    expext(g.nodes).to.be.an.empty.array()
  })

  it('Graph created, nodes and edge added, node removed', () => {
    let gr = Graph.create()
    let n1 = gr.node('n1')
    let n2 = gr.node('n2')
    let e1 = gr.edge(n1, n2, 'e1')
    let e2 = gr.edge(n2, n1, 'e2')
    expect(n1.data).to.equal('n1')
    expect(n2.data).to.equal('n2')
    expect(e1.data).to.equal('e1')
    expect(gr.nodes.length).to.equal(2)
    expect(gr.nodes).to.include(n1)
    expect(gr.nodes).to.include(n2)
    expect(gr.edges.length).to.equal(2)
    expect(gr.edges).to.include(e1)
    expect(n1.edges).to.include(e1)
    expect(n2.edges).to.include(e1)
    n2.remove()
    expect(gr.nodes.length).to.equal(1)
    expect(gr.edges.length).to.equal(0)
    expect(n1.edges.length).to.equal(0)
    let n3 = gr.node('n3')
    let e3 = gr.edge(n1, n3, 'e3')
    expect(gr.nodes.length).to.equal(2)
    expect(gr.edges.length).to.equal(1)
    expect(n1.edges).to.include(e3)
    expect(n3.edges).to.include(e3)
    e3.remove()
    expect(gr.nodes.length).to.equal(2)
    expect(gr.edges.length).to.equal(0)
    expect(n1.edges.length).to.equal(0)
    expect(n3.edges.length).to.equal(0)
  })
})

describe('toJSON', () => {
  it('Graph to/from json', () => {
    let gr = Graph.create()
    let n1 = gr.node('n1')
    let n2 = gr.node('n2')
    let n3 = gr.node('n3')
    let e1 = gr.edge(n1, n2, 'e1')
    let e2 = gr.edge(n2, n3, 'e2')
    let grj = gr.toJSON()
    expect(grj.nodes.length).to.equal(gr.nodes.length)
    expect(grj.edges.length).to.equal(gr.edges.length)

    let gr2 = Graph.create(JSON.stringify(gr))
    expect(gr2.nodes.length).to.equal(gr.nodes.length)
    expect(gr2.edges.length).to.equal(gr.edges.length)

    gr2.nodes.forEach(node => {
      const originalNode = gr.nodes.find(n => n.id === node.id)
      expect(node.data).to.deep.equal(originalNode.data)
    })
    gr2.edges.forEach(edge => {
      const originalEdge = gr.edges.find(e => e.id === edge.id)
      expect(edge.data).to.deep.equal(originalEdge.data)
    })
  })

  it('nodeFromJSON', () => {
    const gr = Graph.create()
    const n = gr.node('data')
    n.remove()
    const json = n.toJSON()
    expect(gr.nodes.length).to.equal(0)
    expect(() => gr.nodeFromJSON(json)).to.throw(Error)
  })

  it('edgeFromJSON', () => {
    const gr = Graph.create()
    const n1 = gr.node()
    const n2 = gr.node()
    const e = gr.edge(n1, n2)
    e.remove()
    const json = e.toJSON()
    expect(gr.edges.length).to.equal(0)
    expect(() => gr.edgeFromJSON(json)).to.throw(Error)
  })
})