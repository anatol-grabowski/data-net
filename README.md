# data-net
Serializable (JSON.stringifiable) graph (nodes connected by edges).
Multiple connections between the same nodes are possible.

### Graph is a set of Nodes connected by Edges:
```
Graph              Node              Edge
 .nodes[]           .data             .data
 .get edges[]       .edges[]          .from
                                      .to

 .node()            .remove()         .remove()
 .edge()

 .toJSON()          .toJSON()         .toJSON()
 .create(json)
```

## Examples
### Graph serialization/deserialization
This example creates a "triangular" graph (3 nodes, 3 edges).
```
  const { Graph } = require('data-net')

  let g = Graph.create()
  let n1 = g.node('node1 data')
  let n2 = g.node({name: 'John', age: 24})
  let e1 = g.edge(n1, n2)
  let n3 = g.node(666)
  let e2 = g.edge(n2, n3, 'edge data')
  let e3 = g.edge(n3, n1)

  let sg = JSON.stringify(g)
  console.log(sg)

  let g2 = Graph.create(sg)
```

console output:
```
  [
    {
      "_id": "66f3452e34a80da7",
      "data": "node1 data"
    },
    {
      "_id": "bb421ed09d99068e",
      "data": {
        "name": "John",
        "age": 24
      }
    },
    {
      "_id": "3074f15f83a4b019",
      "data": 666
    },
    {
      "_id": "6b463740721a51d8",
      "from": "66f3452e34a80da7",
      "to": "bb421ed09d99068e"
    },
    {
      "_id": "5e5ae06231b6151f",
      "from": "bb421ed09d99068e",
      "to": "3074f15f83a4b019",
      "data": "edge data"
    },
    {
      "_id": "9d4d880938d4c5a2",
      "from": "3074f15f83a4b019",
      "to": "66f3452e34a80da7"
    }
  ]
```