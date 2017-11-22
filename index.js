'use strict'

const merge = require('merge-options')
const defaultOptions = {
  useAwait: false,
  client: undefined,
  driver: {
    name: undefined,
    options: {}
  }
}

module.exports = function abstractCache (options) {
  const opts = merge({}, defaultOptions, options)

  let client
  if (opts.client) {
    client = opts.client
  } else if (!opts.driver.name) {
    client = require('./lib/memclient')(opts.driver.options)
  } else {
    client = require(opts.driver.name)(opts.driver.options)
  }

  if (opts.useAwait === true && client.await === true) {
    return client
  } else if (opts.useAwait === true && !client.await) {
    return require('./lib/wrapCB')(client)
  } else if (opts.useAwait === false && client.await === true) {
    return require('./lib/wrapAwait')(client)
  }

  // User wants callback style and client is callback style.
  return client
}

module.exports.memclient = require('./lib/memclient')
