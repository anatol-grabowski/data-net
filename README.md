# data-net
Serializable (JSON.stringifiable) graph (nodes connected by edges).
Multiple connections between the same nodes are possible.

### Graph is a set of Nodes connected by Edges:
```
  Graph                Node              Edge
  .nodes[]             .data             .from
  .get edges[]         .edges[]          .to

  .node()              .remove()         .remove()
  .edge()

  .toJSON()            .toJSON()         .toJSON()
  .create(json)

  .fromJSON(json)      .id               .id
                       .graph            .graph
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
  {
    "nodes": [
      {
        "id": "7470b312c0465758",
        "data": "node1 data"
      },
      {
        "id": "4ba1066d42a36faf",
        "data": {
          "name": "John",
          "age": 24
        }
      },
      {
        "id": "1fa26f86bb0bdbf1",
        "data": 666
      }
    ],
    "edges": [
      {
        "id": "528fe27a0bd4908c",
        "from": "7470b312c0465758",
        "to": "4ba1066d42a36faf"
      },
      {
        "id": "0e5a3c3d2d87f181",
        "from": "4ba1066d42a36faf",
        "to": "1fa26f86bb0bdbf1",
        "data": "edge data"
      },
      {
        "id": "43a07d31be3f2ca5",
        "from": "1fa26f86bb0bdbf1",
        "to": "7470b312c0465758"
      }
    ]
  }
```