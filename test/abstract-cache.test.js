'use strict'

const test = require('tap').test
const mockquire = require('mock-require')
const mocks = require('./mocks')
const factory = require('../')

test('uses a previously established client', (t) => {
  t.plan(1)
  const client1 = factory.memclient()
  const client2 = factory({client: client1})
  t.is(client2, client1)
})

test('existing client overrides driver config', (t) => {
  t.plan(1)
  const client1 = factory.memclient()
  const client2 = factory({
    client: client1,
    driver: {
      name: 'foo'
    }
  })
  t.is(client2, client1)
})

test('creates an in-memory client if no configuration provided', (t) => {
  t.plan(2)
  const client = factory()
  t.is(client.await, false)
  client.set('foo', 'foo', 1000, (err) => {
    if (err) t.threw(err)
    client.has('foo', (err, result) => {
      if (err) t.threw(err)
      t.is(result, true)
    })
  })
})

test('creates a client by specifying a driver', (t) => {
  t.plan(1)
  mockquire('abstract-cache-foo', factory.memclient)
  t.tearDown(() => mockquire.stopAll())
  const client = factory({driver: {name: 'abstract-cache-foo'}})
  t.is(client.await, false)
})

test('returns an await client when await style is desired', (t) => {
  t.plan(2)
  const client = factory({
    useAwait: true,
    client: mocks.awaitClient()
  })
  const future = client.set('foo', 'foo', 1000)
  t.ok(future.then)
  t.type(future.then, Function)
})

test('wraps a callback client for await style', (t) => {
  t.plan(2)
  const client = factory({
    useAwait: true,
    client: mocks.cbClient()
  })
  const future = client.set('foo', 'foo', 1000)
  t.ok(future.then)
  t.type(future.then, Function)
})

test('wraps an await client for callback style', (t) => {
  t.plan(2)
  const client = factory({
    client: mocks.awaitClient()
  })
  const future = client.set('foo', 'foo', 1000, (err) => {
    t.is(err, null)
  })
  t.is(future, undefined)
})

test('returns a callback client when callback style is desired', (t) => {
  t.plan(2)
  const client = factory({
    useAwait: false,
    client: mocks.cbClient()
  })
  const future = client.set('foo', 'foo', 1000, (err) => {
    t.is(err, null)
  })
  t.is(future, undefined)
})

test('supports clients with start/stop', (t) => {
  t.plan(2)
  const client = factory({
    useAwait: true,
    client: mocks.startAsyncClient()
  })
  client.start()
    .then((started) => t.is(started, true))
    .then(() => client.stop())
    .then((stopped) => t.is(stopped, true))
    .catch(t.threw)
})

test('exposes start and stop via driver', (t) => {
  t.plan(6)
  mockquire('abstract-cache-foo', () => {
    return {
      await: true,
      start () {
        t.pass()
        return Promise.resolve()
      },
      stop () {
        t.pass()
        return Promise.resolve()
      }
    }
  })
  t.tearDown(() => mockquire.stopAll())
  const client = factory({useAwait: true, driver: {name: 'abstract-cache-foo'}})
  t.type(client.start, Function)
  t.type(client.stop, Function)
  client.start()
    .then(() => t.pass())
    .then(() => client.stop())
    .then(() => t.pass())
    .catch(t.threw)
})
