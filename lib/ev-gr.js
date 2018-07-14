function makeMethods(name) {
  const upper = name[0].toUpperCase() + name.substr(1)
  methods = {
    ['add' + upper](json) {
      const item = this.graph[name + 'FromJSON'](json)
      item.removed = false
      item.pending = false
      this.events.emit(name + '.add', item)
      return item
    },

    ['update' + upper](item, json) {
      item.data = json.data
      item.removed = false
      item.pending = false
      this.events.emit(name + '.update', item)
      return item
    },

    ['remove' + upper](item) {
      item.remove()
      item.removed = true
      item.pending = false
      this.events.emit(name + '.remove', item)
      return item
    },

    getNodeById(id) {
      return this.graph.nodes.find(node => node.id === id)
    }


  }
}