'use strict'

module.exports.awaitClient = function () {
  return {
    await: true,
    delete: function () {
      return Promise.resolve()
    },
    get: function () {
      return Promise.resolve('foo')
    },
    has: function () {
      return Promise.resolve(true)
    },
    set: function () {
      return Promise.resolve()
    }
  }
}

module.exports.cbClient = function () {
  return {
    await: false,
    delete: function (key, cb) {
      cb(null)
    },
    get: function (key, cb) {
      cb(null, 'foo')
    },
    has: function (key, cb) {
      cb(null, true)
    },
    set: function (key, value, ttl, cb) {
      cb(null)
    }
  }
}

module.exports.startAsyncClient = function () {
  const client = module.exports.awaitClient()
  client.start = function () {
    return Promise.resolve(true)
  }
  client.stop = async function () {
    return Promise.resolve(true)
  }
  return client
}
