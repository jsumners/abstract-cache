# abstract-cache

*abstract-cache* is a module that provides a common interface to multiple
caching strategies. It allows for requiring *abstract-cache* everywhere while
defining the strategy via a simple configuration.

*abstract-cache* is heavily inspired by the excellent [Catbox][catbox]. The
decision to create *abstract-cache* was predicated on a desire to require
implementing clients accept previously established connections in addtion to
accepting configuration to create their own connections. It also seeks to
allow using either the callback or async/await style of asynchronous
programming.

[catbox]: https://npm.im/catbox

### Available Clients

+ [abstract-cache-mongo](https://github.com/jsumners/abstract-cache-mongo)
+ [abstract-cache-redis](https://github.com/jsumners/abstract-cache-redis)

## Example

The following example uses *abstract-cache*'s included in-memory cache. Of note,
is that the included in-memory cache is actually callback based.

```js
const cache = requre('abstract-cache')({useAwait: true})

async function doSomething () {
  const val = await cache.get('foo')
  console.log(val)
}

cache.set('foo', 'foo', 100)
  .then(doSomething)
  .catch(console.error)
```

This example shows instantiating *abstract-cache* with a specific store that
relies upon a connection to a remote system. In this example we are supplying
an already existing connection to the remote system; all *abstract-cache*
compliant clients **must** support this.

```js
const cache = require('abstract-cache')({
  useAwait: true,
  driver: {
    name: 'abstract-cache-redis',
    options: {
      client: require('redis')({url: 'some.redis.url'})
    }
  }
})

async function doSomething () {
  const val = await cache.get('foo')
  console.log(val)
}

cache.set('foo', 'foo', 100)
  .then(doSomething)
  .catch(console.error)
```

## Options

*abstract-client* accepts an options object with the following properties:

+ `useAwait` (Default: `false`): designate that the resulting cache client
should use `async/await` functions. When `false`, every method accepts a
standard `callback(err, result)`.
+ `client` (Default: `undefined`): an already instantiated strategy client.
In combination with `useAwait` the client can be wrapped accordingly. Specifying
a `client` superceeds the `driver` configuration.
+ `driver`:
    * `name` (Default: `undefined`): specifies the implementing strategy to
    load. The default value results in the buil-in in-memory strategy being
    loaded -- this is **not recommended** for production environments.
    * `options` (Default: `{}`): an options object to pass to the strategy
    while loading. The strategy should describe this object.

### memclient

The included in-memory client is available as:

```js
const memclientFactory = require('abstract-cache').memclient
```

It accepts an options object:

+ `segment` (Default: `abstractMemcache`): the default segment in which to store
items.
+ `maxItems` (Default: `100000`): the maximum number of items to keep in the
cache. The backing is an LRU cache with an upper bound.

## Protocol

All implementing strategies **must** implement the protocol described in this
section.

1. The module should export a factory `function (optionsObject) {}`.
1. Accept an existing connection to data stores via the `optionsObject`.
1. Manage connections created by itself.
1. In all cases where a `key` is required, the `key` may be a simple string,
or it may be an object of the format `{id: 'name', segment: 'name'}`. It is
up to the implementing strategy to decide how to handle these keys.
1. The factory function should return an object (client) that has the following
methods and properties:
    * `await` (boolean property): `true` indicates that the strategy's methods
    are *all* `async` functions. If `false`, all methods **must** have a
    `callback(err, result)` as the last parameter.
    * `delete(key[, callback])`: removes the specified item from the cache.
    * `get(key[, callback])`: retrieves the desired item from the cache. The
    returned item should be a deep copy of the stored value to prevent alterations
    from affecting the cache. The result should be an object with the properties:
        + `item`: the item the user cached.
        + `stored`: a `Date`, in Epoch milliseconds, indicating when the item
        was stored.
        + `ttl`: the *remaining* lifetime of the item in the cache (milliseconds).
    * `has(key[, callback])`: returns a boolean result indicating if the cache
    contains the desired `key`.
    * `set(key, value, ttl[, callback])`: stores the specified `value` in the
    cache under the specified `key` for the time `ttl` in milliseconds.
    * `start([callback])` (optional): clients that require extra initialization,
    e.g. to start a database connection, may export this method. When present,
    this method **must** be invoked by the user before any other method. This
    method may be an `async` function at the discretion of the implementor.
    * `stop([callback])` (optional): required when `start()` is present. This
    should shutdown any connections/processes started via `start()`. It is
    left to the user to invoke this method in their shutdown procedure. This
    method may be an `async` function at the discretion of the implementor.

## License

[MIT License](http://jsumners.mit-license.org/)

