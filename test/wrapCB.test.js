'use strict'

const test = require('tap').test
const memclientFactory = require('../lib/memclient')
const wrapCBFactory = require('../lib/wrapCB')

test('wraps set', (t) => {
  t.plan(1)
  const client = wrapCBFactory(memclientFactory())
  client.set('foo', 'foo', 1000)
    .then(() => {
      t.pass()
    })
    .catch(t.threw)
})

test('wraps has', (t) => {
  t.plan(1)
  const client = wrapCBFactory(memclientFactory())
  client.set('foo', 'foo', 1000)
    .then(() => client.has('foo'))
    .then((result) => t.is(result, true))
    .catch(t.threw)
})

test('wraps get', (t) => {
  t.plan(3)
  const client = wrapCBFactory(memclientFactory())
  client.set('foo', 'foo', 1000)
    .then(() => client.get('foo'))
    .then((cached) => {
      t.type(cached, Object)
      t.ok(cached.item)
      t.is(cached.item, 'foo')
    })
    .catch(t.threw)
})

test('wraps delete', (t) => {
  t.plan(1)
  const client = wrapCBFactory(memclientFactory())
  client.set('foo', 'foo', 1000)
    .then(() => client.delete('foo'))
    .then(() => client.has('foo'))
    .then((result) => t.is(result, false))
    .catch(t.threw)
})

test('has start and stop', (t) => {
  t.plan(4)
  const client = {
    start (cb) {
      t.type(cb, 'function')
      cb(null)
    },
    stop (cb) {
      t.type(cb, 'function')
      cb(null)
    }
  }
  const wrapped = wrapCBFactory(client)
  wrapped.start().then(t.pass).catch(t.threw)
  wrapped.stop().then(t.pass).catch(t.threw)
})
