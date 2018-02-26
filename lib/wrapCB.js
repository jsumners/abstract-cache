'use strict'

const proto = {
  delete: function (key) {
    return new Promise((resolve, reject) => {
      this.client.delete(key, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  },

  get: function (key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, result) => {
        if (err) return reject(err)
        resolve(result)
      })
    })
  },

  has: function (key) {
    return new Promise((resolve, reject) => {
      this.client.has(key, (err, result) => {
        if (err) return reject(err)
        resolve(result)
      })
    })
  },

  set: function (key, value, ttl) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, ttl, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
}

function start () {
  return new Promise((resolve, reject) => {
    this.client.start((err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

function stop () {
  return new Promise((resolve, reject) => {
    this.client.stop((err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

module.exports = function abstractCacheWrapCB (client) {
  const instance = Object.create(proto)
  Object.defineProperty(instance, 'client', {
    enumerable: false,
    value: client
  })
  if (client.start) {
    instance.start = start.bind(instance)
    instance.stop = stop.bind(instance)
  }
  return instance
}
