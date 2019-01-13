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
      it('should create, return and emit pending node', () => {
        let event
        g.events.on(EVENT_TRY_NODE_ADD, evt => {
          event = evt
        })
        const n = g.tryAddNode('n try data')
        expect(n).to.equal(event.node)
        expect(n.pending).to.be.true
      })
    })
    describe('forcedNode', () => {
      it('shoud create, return and emit node if node does not exist', () => {
        let event
        g.events.on(EVENT_NODE_ADD, evt => {
          event = evt
        })
        const json = {id: '123', data: 'n forced data'}
        expect(g.getNodeById(json.id)).to.equal(undefined)
        const n = g.forcedNode(json) //shouldn't be able to pass a string??
        expect(n).to.equal(event.node)
        expect(n.pending).to.be.false
        expect(n.removed).to.be.false
        expect(n.data).to.equal(json.data)
      })
      it('shoud update, return and emit node and unpend and unremove it if node exists', () => {
        const nExisting = g.nodes[1]
        nExisting.pending = true
        nExisting.removed = true
        let event
        g.events.on(EVENT_NODE_UPDATE, evt => {
          event = evt
        })
        const json = {id: nExisting.id, data: 'n forced data'}
        expect(g.getNodeById(json.id)).to.equal(nExisting)
        const n = g.forcedNode(json)
        expect(n).to.equal(event.node)
        expect(n).to.equal(nExisting)
        expect(n.pending).to.be.false
        expect(n.removed).to.be.false
        expect(n.data).to.equal(json.data)
      })
      it('shoud remove, return and emit node and unpend it if node exists and json has "removed: true"', () => {
        const nExisting = g.nodes[1]
        nExisting.pending = true
        let event
        g.events.on(EVENT_NODE_REMOVE, evt => {
          event = evt
        })
        const json = {id: nExisting.id, removed: true}
        expect(g.getNodeById(json.id)).to.equal(nExisting)
        const n = g.forcedNode(json)
        expect(n.pending).to.be.false
        expect(n.removed).to.be.true
        expect(n).to.equal(event.node)
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
      it('shoud create and emit node if node does not exist and no hash provided', () => {
        let event
        g.events.on(EVENT_NODE_ADD, evt => {
          event = evt
        })
        const json = {id: '123', data: 'n validated data'}
        expect(g.getNodeById(json.id)).to.equal(undefined)
        const n = g.validatedNode(json)
        expect(n).to.equal(event.node)
        expect(n.pending).to.be.false
        expect(n.removed).to.be.false
        expect(n.data).to.equal(json.data)
      })
      it('shoud return existing node if node exists and no hash provided', () => {
        g.events.on(EVENT_NODE_ADD, evt => {
          throw new Error('should not emit the event')
        })
        const nExisting = g.nodes[1]
        const nExistingData = nExisting.data
        const json = {id: nExisting.id, data: 'n validated data'}
        expect(g.getNodeById(json.id)).to.equal(nExisting)
        expect(json.data).to.not.equal(nExisting.data)
        const n = g.validatedNode(json)
        expect(n).to.equal(nExisting)
        expect(n.data).to.equal(nExistingData)
      })
      it('shoud update, return and emit node if node exists and the right hash provided', () => {
        let event
        g.events.on(EVENT_NODE_UPDATE, evt => {
          event = evt
        })
        const nExisting = g.nodes[1]
        const json = {id: nExisting.id, data: 'n validated data'}
        expect(g.getNodeById(json.id)).to.equal(nExisting)
        expect(json.data).to.not.equal(nExisting.data)
        const n = g.validatedNode(json, g.getHash(nExisting))
        expect(n).to.equal(nExisting)
        expect(n).to.equal(event.node)
        expect(n.data).to.equal(json.data)
      })
    })
  })
})