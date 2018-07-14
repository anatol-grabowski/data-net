/* global describe, it */
const chai = require('chai')
const expect = chai.expect
const {
  Graph,
  EVENT_TRY_NODE_ADD,
  EVENT_NODE_ADD,
  EVENT_NODE_UPDATE,
  EVENT_NODE_REMOVE,
} = require('../lib/eventfull-graph')

describe('eventfull-graph', () => {
  let g
  beforeEach(() => {
    g = Graph.create()
    const n1 = g.node('n1 data')
    const n2 = g.node('n2 data')
    g.edge(n1, n2, 'e1 data')
  })
  describe('Graph', () => {
    describe('tryAddNode', () => {
      it('should create and emit pending node', (done) => {
        let evtNode
        g.events.on(EVENT_TRY_NODE_ADD, evt => {
          evtNode = evt.node
          done()
        })
        const n = g.tryAddNode('n try data')
        expect(n.pending).to.be.true
        expect(n).to.equal(evtNode)
      })
    })
    describe('forcedNode', () => {
      it('shoud create and emit node if node does not exist', (done) => {
        let evtNode
        g.events.on(EVENT_NODE_ADD, evt => {
          evtNode = evt.node
          done()
        })
        const json = {id: '123', data: 'n forced data'}
        expect(g.getNodeById(json.id)).to.equal(undefined)
        const n = g.forcedNode(json) //shouldn't be able to pass a string??
        expect(n.pending).to.be.false
        expect(n.removed).to.be.false
        expect(n.data).to.equal(json.data)
        expect(n).to.equal(evtNode)
      })
      it('shoud update and emit node and unpend and unremove it if node exists', (done) => {
        const nExisting = g.nodes[1]
        nExisting.pending = true
        nExisting.removed = true
        let evtNode
        g.events.on(EVENT_NODE_UPDATE, evt => {
          evtNode = evt.node
          done()
        })
        const json = {id: nExisting.id, data: 'n forced data'}
        expect(g.getNodeById(json.id)).to.equal(nExisting)
        const n = g.forcedNode(json)
        expect(n.pending).to.be.false
        expect(n.removed).to.be.false
        expect(n.data).to.equal(json.data)
        expect(n).to.equal(evtNode)
        expect(n).to.equal(nExisting)
      })
      it('shoud remove and emit node and unpend it if node exists and json has "removed: true"', (done) => {
        const nExisting = g.nodes[1]
        nExisting.pending = true
        let evtNode
        g.events.on(EVENT_NODE_REMOVE, evt => {
          evtNode = evt.node
          done()
        })
        const json = {id: nExisting.id, removed: true}
        expect(g.getNodeById(json.id)).to.equal(nExisting)
        const n = g.forcedNode(json)
        expect(n.pending).to.be.false
        expect(n.removed).to.be.true
        expect(n).to.equal(evtNode)
        expect(n).to.equal(nExisting)
      })
      it('shoud return null if node does not exists and json has "removed: true"', () => {
        const json = {id: '123', removed: true}
        expect(g.getNodeById(json.id)).to.equal(undefined)
        const n = g.forcedNode(json)
        expect(n).to.equal(null)
      })
    })
    describe('validatedNode', () => {
      it('shoud create and emit node if node does not exist', (done) => {
        let evtNode
        g.events.on(EVENT_NODE_ADD, evt => {
          evtNode = evt.node
          done()
        })
        const json = {id: '123', data: 'n validated data'}
        expect(g.getNodeById(json.id)).to.equal(undefined)
        const n = g.validatedNode(json)
        expect(n.pending).to.be.false
        expect(n.removed).to.be.false
        expect(n.data).to.equal(json.data)
        expect(n).to.equal(evtNode)
      })
      it('shoud return existing node if node exists', () => {
        // let evtNode
        // g.events.on(EVENT_NODE_ADD, evt => {
        //   evtNode = evt.node
        //   done()
        // })
        // const json = {id: '123', data: 'n validated data'}
        // expect(g.getNodeById(json.id)).to.equal(undefined)
        // const n = g.validatedNode(json)
        // expect(n.pending).to.be.false
        // expect(n.removed).to.be.false
        // expect(n.data).to.equal(json.data)
        // expect(n).to.equal(evtNode)
      })
    })
  })
})