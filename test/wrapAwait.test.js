'use strict'

const test = require('tap').test
const memclientFactory = require('../lib/memclient')
const wrapCBFactory = require('../lib/wrapCB')
const wrapAwaitFactory = require('../lib/wrapAwait')

function inceptify () {
  return wrapAwaitFactory(
    wrapCBFactory(memclientFactory())
  )
}

test('wraps set', (t) => {
  t.plan(1)
  const client = inceptify()
  client.set('foo', 'foo', 1000, (err) => {
    if (err) t.threw(err)
    t.pass()
  })
})

test('wraps has', (t) => {
  t.plan(1)
  const client = inceptify()
  client.set('foo', 'foo', 1000, (err) => {
    if (err) t.threw(err)
    client.has('foo', (err, result) => {
      if (err) t.threw(err)
      t.is(result, true)
    })
  })
})

test('wraps get', (t) => {
  t.plan(3)
  const client = inceptify()
  client.set('foo', 'foo', 1000, (err) => {
    if (err) t.threw(err)
    client.get('foo', (err, cached) => {
      if (err) t.threw(err)
      t.type(cached, Object)
      t.ok(cached.item)
      t.is(cached.item, 'foo')
    })
  })
})

test('wraps delete', (t) => {
  t.plan(1)
  const client = inceptify()
  client.set('foo', 'foo', 1000, (err) => {
    if (err) t.threw(err)
    client.delete('foo', (err) => {
      if (err) t.threw(err)
      client.has('foo', (err, result) => {
        if (err) t.threw(err)
        t.is(result, false)
      })
    })
  })
})

test('has start and stop', (t) => {
  t.plan(4)
  const client = {
    start () {
      t.pass()
      return Promise.resolve()
    },
    stop () {
      t.pass()
      return Promise.resolve()
    }
  }

  const wrapped = wrapAwaitFactory(client)
  wrapped.start((err) => t.is(err, null))
  wrapped.stop((err) => t.is(err, null))
})
