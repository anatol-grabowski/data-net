let chai = require('chai')
let expect = chai.expect
let Graph = require('../data-net.js')


describe('nodes', ()=>{
	it('node created, lastId is updated and equals to that of node', ()=>{
		let gr = new Graph()
		let prevLastId
		prevLastId = gr.lastId
		let n1 = gr.node('node1')
		expect(gr.lastId).to.equal(n1.id)
		expect(gr.lastId).to.not.equal(prevLastId)
		prevLastId = gr.lastId
		let n2 = gr.node('node2')
		expect(gr.lastId).to.equal(n2.id)
		expect(gr.lastId).to.not.equal(prevLastId)
		expect(n2.id).to.not.equal(n1.id)
	})
	it('node added to nodes', ()=>{
		let gr = new Graph()
		let n1 = gr.node('node1')
		let n2 = gr.node('node2')
		expect(Object.keys(gr.nodes)).to.contain(''+n1.id) //keys are always strings
		expect(Object.keys(gr.nodes)).to.contain(''+n2.id)
	})
	it('node removed from nodes', ()=>{
		let gr = new Graph()
		let n1 = gr.node('node1')
		let n2 = gr.node('node2')
		n1.remove()
		expect(gr.nodes.map(n=>n.id)).to.not.contain(n1.id)
		expect(gr.nodes.map(n=>n.id)).to.contain(n2.id)
	})
})

describe("edges", ()=>{
	it('new edge from, to and id are set. All ids are different', ()=>{
		let gr = new Graph()
		let n1 = gr.node('node1')
		let n2 = gr.node('node2')
		let e1 = gr.edge(n1, n2)
		expect(e1.from).to.equal(n1)
		expect(e1.to).to.equal(n2)
		expect(e1.id).to.not.equal(n2)
		expect(e1.id).to.not.equal(n1)
		expect(e1.id).to.equal(gr.lastId)
	})
	it('new edge is added to nodes', ()=>{
		let gr = new Graph()
		let n1 = gr.node('node1')
		let n2 = gr.node('node2')
		let e1 = gr.edge(n1, n2)
		expect(n1.edges).to.contain(e1)
		expect(n2.edges).to.contain(e1)
	})
	it('two edges with the same from and to are added to nodes, their ids differ', ()=>{
		let gr = new Graph()
		let n1 = gr.node('node1')
		let n2 = gr.node('node2')
		let e1 = n1.to(n2)
		let e2 = n1.to(n2)
		expect(n1.edges).to.contain(e1)
		expect(n2.edges).to.contain(e1)
		expect(n1.edges).to.contain(e2)
		expect(n2.edges).to.contain(e2)
		expect(e1.id).to.not.equal(e2.id)
	})
	it('edge is removed from nodes', ()=>{
		let gr = new Graph()
		let n1 = gr.node('node1')
		let n2 = gr.node('node2')
		let e1 = gr.edge(n1, n2)
		let e2 = gr.edge(n1, n2)
		e1.remove()
		expect(n1.edges).to.not.contain(e1)
		expect(n2.edges).to.not.contain(e1)
		expect(n1.edges).to.contain(e2)
		expect(n2.edges).to.contain(e2)
	})
	it('edge.toJSON has same properties as orig edge minus graph', ()=>{
		let gr = new Graph()
		let n1 = gr.node('node1')
		let n2 = gr.node('node2')
		let e1 = gr.edge(n1, n2)
		e1.prop = 'test custom prop'
		let fe1 = e1.toJSON()
		let e1props = Object.keys(e1)
		//n1props.filter((pr)=>{ return typeof n1[pr] == 'function' })
		//n1props.filter((pr)=>{ return (pr == 'graph' || pr == 'edges') })
		expect(Object.keys(fe1).concat(['graph'])).to.include.members(e1props)
		expect(Object.keys(fe1)).to.not.include('graph')
	})
	it('edge.toJSON has correct from and to', ()=>{
		let gr = new Graph()
		let n1 = gr.node('node1')
		let n2 = gr.node('node2')
		let e1 = n1.to(n2)
		let fe1 = e1.toJSON()
		expect(fe1.from).to.equal(n1.id)
		expect(fe1.to).to.equal(n2.id)
	})
})

describe('nodes with edges', ()=>{
	it('if node is removed its edges are removed from other nodes', ()=>{
		let gr = new Graph()
		let n1 = gr.node('node1')
		let n2 = gr.node('node2')
		let e1 = gr.edge(n1, n2)
		let n3 = gr.node('node3')
		let e2 = gr.edge(n2, n3)
		let e3 = gr.edge(n3, n1)
		n1.remove()
		expect(n2.edges).to.not.contain(e1)
		expect(n3.edges).to.not.contain(e3)
		expect(n3.edges).to.contain(e2)
		expect(n2.edges).to.contain(e2)
	})
	it('node.toJSON has same properties as orig node minus graph and edges', ()=>{
		let gr = new Graph()
		let n1 = gr.node('node1')
		let n2 = gr.node('node2')
		let e1 = gr.edge(n1, n2)
		n1.prop = 'test custom prop'
		let fn1 = n1.toJSON()
		let n1props = Object.keys(n1)
		//n1props.filter((pr)=>{ return typeof n1[pr] == 'function' })
		//n1props.filter((pr)=>{ return (pr == 'graph' || pr == 'edges') })
		expect(Object.keys(fn1).concat(['graph', 'edges'])).to.include.members(n1props)
		expect(Object.keys(fn1)).to.not.include('graph')
		expect(Object.keys(fn1)).to.not.include('edges')
	})
	it('node.fromsToJSON has all froms and no tos of node', ()=>{
		let gr = new Graph()
		let n1 = gr.node('node1')
		let n2 = gr.node('node2')
		let e1 = gr.edge(n1, n2)
		let n3 = gr.node('node3')
		let e2 = gr.edge(n2, n3)
		let e3 = gr.edge(n3, n1)
		let ffroms = n1.fromsToJSON()
		let froms = []
		n1.edges.forEach((ed)=>{
			if (ed.from==n1) froms.push(ed.toJSON())
		})
		expect(ffroms).to.deep.equal(froms)
	})
})

describe('graph flattening', ()=>{
	it('flat graph has nodes with same ids', ()=>{
		let gr = new Graph()
		let n1 = gr.node('node1')
		let n2 = gr.node('node2')
		let e1 = gr.edge(n1, n2)
		let n3 = gr.node('node3')
		let e2 = gr.edge(n2, n3)
		let e3 = gr.edge(n3, n1)
		let fgr = gr.toJSON()
		let origIds = gr.nodes.map(n=>n.id)
		let flatIds = fgr.nodes.map(n=>n.id)
		expect(flatIds.length).to.equal(origIds.length)
		expect(flatIds).to.include.members(origIds)
	})
	it('flat graph has edges with same ids', ()=>{
		let gr = new Graph()
		let n1 = gr.node('node1')
		let n2 = gr.node('node2')
		let e1 = gr.edge(n1, n2)
		let n3 = gr.node('node3')
		let e2 = gr.edge(n2, n3)
		let e3 = gr.edge(n3, n1)
		let fgr = gr.toJSON()
		let origEdgeIds = []
		gr.nodes.forEach((node)=>{
			node.edges.forEach((edge)=>{
				origEdgeIds.push(edge.id)
			})
		})
		let flatEdgeIds = fgr.edges.map((edge)=>{ return edge.id })
		expect(flatEdgeIds).to.include.members(origEdgeIds)
	})
})

describe('graph unflattening', ()=>{
	it('unflattened graph has nodes with same ids', ()=>{
		let gr = new Graph()
		let n1 = gr.node('node1')
		let n2 = gr.node('node2')
		let e1 = gr.edge(n1, n2)
		let n3 = gr.node('node3')
		let e2 = gr.edge(n2, n3)
		let e3 = gr.edge(n3, n1)
		let fgr = gr.toJSON()
		let gr2 = new Graph(fgr)
		let origIds = Object.keys(gr.nodes)
		let unflIds = Object.keys(gr2.nodes)
		expect(unflIds.length).to.equal(origIds.length)
		expect(unflIds).to.include.members(origIds)
	})
	it('unflattened graph has edges with same ids', ()=>{
		let gr = new Graph()
		let n1 = gr.node('node1')
		let n2 = gr.node('node2')
		let e1 = gr.edge(n1, n2)
		let n3 = gr.node('node3')
		let e2 = gr.edge(n2, n3)
		let e3 = gr.edge(n3, n1)
		let fgr = gr.toJSON()
		let gr2 = new Graph(fgr)
		let origEdgeIds = []
		gr.nodes.forEach((node)=>{
			node.edges.forEach((edge)=>{
				origEdgeIds.push(edge.id)
			})
		})
		let unflEdgeIds = []
		gr2.nodes.forEach((node)=>{
			node.edges.forEach((edge)=>{
				unflEdgeIds.push(edge.id)
			})
		})
		expect(unflEdgeIds).to.include.members(origEdgeIds)
	})
})
