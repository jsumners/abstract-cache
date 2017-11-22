'use strict'

const LMap = require('lru_map').LRUMap
const clone = require('clone')

function mapKey (key, segment) {
  if (typeof key === 'string') return `${segment}:${key}`
  return `${key.segment || segment}:${key.id}`
}

const cacheProto = {
  delete: function (key, callback) {
    this._cache.delete(mapKey(key, this._segment))
    callback(null)
  },

  get: function (key, callback) {
    const _key = mapKey(key, this._segment)
    const obj = this._cache.get(_key)
    if (!obj) return callback(null, null)
    const now = Date.now()
    const expires = obj.ttl + obj.stored
    const ttl = expires - now
    if (ttl < 0) {
      this._cache.delete(_key)
      return callback(null, null)
    }
    callback(null, {
      item: clone(obj.item),
      stored: obj.stored,
      ttl
    })
  },

  has: function (key, callback) {
    callback(null, this._cache.has(mapKey(key, this._segment)))
  },

  set: function (key, value, ttl, callback) {
    this._cache.set(mapKey(key, this._segment), {
      ttl: ttl,
      item: value,
      stored: Date.now()
    })
    callback(null)
  }
}

module.exports = function (config) {
  const _config = config || {}
  const _segment = _config.segment || 'abstractMemcache'
  const _maxItems = (_config.maxItems && Number.isInteger(_config.maxItems))
    ? _config.maxItems
    : 100000
  const map = new LMap(_maxItems)
  const cache = Object.create(cacheProto)

  Object.defineProperties(cache, {
    await: {
      value: false
    },
    _cache: {
      enumerable: false,
      value: map
    },
    _segment: {
      enumerable: false,
      value: _segment
    }
  })
  return cache
}
