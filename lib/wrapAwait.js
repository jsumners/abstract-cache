'use strict'

const proto = {
  delete: function (key, callback) {
    this.client.delete(key)
      .then(() => callback(null))
      .catch(callback)
  },

  get: function (key, callback) {
    this.client.get(key)
      .then((result) => callback(null, result))
      .catch(callback)
  },

  has: function (key, callback) {
    this.client.has(key)
      .then((result) => callback(null, result))
      .catch(callback)
  },

  set: function (key, value, ttl, callback) {
    this.client.set(key, value, ttl)
      .then((result) => callback(null, result))
      .catch(callback)
  }
}

module.exports = function (client) {
  const instance = Object.create(proto)
  Object.defineProperty(instance, 'client', {
    enumerable: false,
    value: client
  })
  return instance
}