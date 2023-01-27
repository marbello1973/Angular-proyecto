"use strict";

const semver = require('semver');
/**
 * Module of mixed-in functions shared between node and client code
 */


const _require = require('./utils'),
      isObject = _require.isObject,
      hasOwn = _require.hasOwn;
/**
 * Expose `RequestBase`.
 */


module.exports = RequestBase;
/**
 * Initialize a new `RequestBase`.
 *
 * @api public
 */

function RequestBase() {}
/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.clearTimeout = function () {
  clearTimeout(this._timer);
  clearTimeout(this._responseTimeoutTimer);
  clearTimeout(this._uploadTimeoutTimer);
  delete this._timer;
  delete this._responseTimeoutTimer;
  delete this._uploadTimeoutTimer;
  return this;
};
/**
 * Override default response body parser
 *
 * This function will be called to convert incoming data into request.body
 *
 * @param {Function}
 * @api public
 */


RequestBase.prototype.parse = function (fn) {
  this._parser = fn;
  return this;
};
/**
 * Set format of binary response body.
 * In browser valid formats are 'blob' and 'arraybuffer',
 * which return Blob and ArrayBuffer, respectively.
 *
 * In Node all values result in Buffer.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.responseType = function (value) {
  this._responseType = value;
  return this;
};
/**
 * Override default request body serializer
 *
 * This function will be called to convert data set via .send or .attach into payload to send
 *
 * @param {Function}
 * @api public
 */


RequestBase.prototype.serialize = function (fn) {
  this._serializer = fn;
  return this;
};
/**
 * Set timeouts.
 *
 * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
 * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
 * - upload is the time  since last bit of data was sent or received. This timeout works only if deadline timeout is off
 *
 * Value of 0 or false means no timeout.
 *
 * @param {Number|Object} ms or {response, deadline}
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.timeout = function (options) {
  if (!options || typeof options !== 'object') {
    this._timeout = options;
    this._responseTimeout = 0;
    this._uploadTimeout = 0;
    return this;
  }

  for (const option in options) {
    if (hasOwn(options, option)) {
      switch (option) {
        case 'deadline':
          this._timeout = options.deadline;
          break;

        case 'response':
          this._responseTimeout = options.response;
          break;

        case 'upload':
          this._uploadTimeout = options.upload;
          break;

        default:
          console.warn('Unknown timeout option', option);
      }
    }
  }

  return this;
};
/**
 * Set number of retry attempts on error.
 *
 * Failed requests will be retried 'count' times if timeout or err.code >= 500.
 *
 * @param {Number} count
 * @param {Function} [fn]
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.retry = function (count, fn) {
  // Default to 1 if no count passed or true
  if (arguments.length === 0 || count === true) count = 1;
  if (count <= 0) count = 0;
  this._maxRetries = count;
  this._retries = 0;
  this._retryCallback = fn;
  return this;
}; //
// NOTE: we do not include ESOCKETTIMEDOUT because that is from `request` package
//       <https://github.com/sindresorhus/got/pull/537>
//
// NOTE: we do not include EADDRINFO because it was removed from libuv in 2014
//       <https://github.com/libuv/libuv/commit/02e1ebd40b807be5af46343ea873331b2ee4e9c1>
//       <https://github.com/request/request/search?q=ESOCKETTIMEDOUT&unscoped_q=ESOCKETTIMEDOUT>
//
//
// TODO: expose these as configurable defaults
//


const ERROR_CODES = new Set(['ETIMEDOUT', 'ECONNRESET', 'EADDRINUSE', 'ECONNREFUSED', 'EPIPE', 'ENOTFOUND', 'ENETUNREACH', 'EAI_AGAIN']);
const STATUS_CODES = new Set([408, 413, 429, 500, 502, 503, 504, 521, 522, 524]); // TODO: we would need to make this easily configurable before adding it in (e.g. some might want to add POST)
// const METHODS = new Set(['GET', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE']);

/**
 * Determine if a request should be retried.
 * (Inspired by https://github.com/sindresorhus/got#retry)
 *
 * @param {Error} err an error
 * @param {Response} [res] response
 * @returns {Boolean} if segment should be retried
 */

RequestBase.prototype._shouldRetry = function (error, res) {
  if (!this._maxRetries || this._retries++ >= this._maxRetries) {
    return false;
  }

  if (this._retryCallback) {
    try {
      const override = this._retryCallback(error, res);

      if (override === true) return true;
      if (override === false) return false; // undefined falls back to defaults
    } catch (err) {
      console.error(err);
    }
  } // TODO: we would need to make this easily configurable before adding it in (e.g. some might want to add POST)

  /*
  if (
    this.req &&
    this.req.method &&
    !METHODS.has(this.req.method.toUpperCase())
  )
    return false;
  */


  if (res && res.status && STATUS_CODES.has(res.status)) return true;

  if (error) {
    if (error.code && ERROR_CODES.has(error.code)) return true; // Superagent timeout

    if (error.timeout && error.code === 'ECONNABORTED') return true;
    if (error.crossDomain) return true;
  }

  return false;
};
/**
 * Retry request
 *
 * @return {Request} for chaining
 * @api private
 */


RequestBase.prototype._retry = function () {
  this.clearTimeout(); // node

  if (this.req) {
    this.req = null;
    this.req = this.request();
  }

  this._aborted = false;
  this.timedout = false;
  this.timedoutError = null;
  return this._end();
};
/**
 * Promise support
 *
 * @param {Function} resolve
 * @param {Function} [reject]
 * @return {Request}
 */


RequestBase.prototype.then = function (resolve, reject) {
  if (!this._fullfilledPromise) {
    const self = this;

    if (this._endCalled) {
      console.warn('Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises');
    }

    this._fullfilledPromise = new Promise((resolve, reject) => {
      self.on('abort', () => {
        if (this._maxRetries && this._maxRetries > this._retries) {
          return;
        }

        if (this.timedout && this.timedoutError) {
          reject(this.timedoutError);
          return;
        }

        const error = new Error('Aborted');
        error.code = 'ABORTED';
        error.status = this.status;
        error.method = this.method;
        error.url = this.url;
        reject(error);
      });
      self.end((error, res) => {
        if (error) reject(error);else resolve(res);
      });
    });
  }

  return this._fullfilledPromise.then(resolve, reject);
};

RequestBase.prototype.catch = function (callback) {
  return this.then(undefined, callback);
};
/**
 * Allow for extension
 */


RequestBase.prototype.use = function (fn) {
  fn(this);
  return this;
};

RequestBase.prototype.ok = function (callback) {
  if (typeof callback !== 'function') throw new Error('Callback required');
  this._okCallback = callback;
  return this;
};

RequestBase.prototype._isResponseOK = function (res) {
  if (!res) {
    return false;
  }

  if (this._okCallback) {
    return this._okCallback(res);
  }

  return res.status >= 200 && res.status < 300;
};
/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */


RequestBase.prototype.get = function (field) {
  return this._header[field.toLowerCase()];
};
/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */


RequestBase.prototype.getHeader = RequestBase.prototype.get;
/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.set = function (field, value) {
  if (isObject(field)) {
    for (const key in field) {
      if (hasOwn(field, key)) this.set(key, field[key]);
    }

    return this;
  }

  this._header[field.toLowerCase()] = value;
  this.header[field] = value;
  return this;
};
/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field field name
 */


RequestBase.prototype.unset = function (field) {
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};
/**
 * Write the field `name` and `val`, or multiple fields with one object
 * for "multipart/form-data" request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 *
 * request.post('/upload')
 *   .field({ foo: 'bar', baz: 'qux' })
 *   .end(callback);
 * ```
 *
 * @param {String|Object} name name of field
 * @param {String|Blob|File|Buffer|fs.ReadStream} val value of field
 * @param {String} options extra options, e.g. 'blob'
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.field = function (name, value, options) {
  // name should be either a string or an object.
  if (name === null || undefined === name) {
    throw new Error('.field(name, val) name can not be empty');
  }

  if (this._data) {
    throw new Error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObject(name)) {
    for (const key in name) {
      if (hasOwn(name, key)) this.field(key, name[key]);
    }

    return this;
  }

  if (Array.isArray(value)) {
    for (const i in value) {
      if (hasOwn(value, i)) this.field(name, value[i]);
    }

    return this;
  } // val should be defined now


  if (value === null || undefined === value) {
    throw new Error('.field(name, val) val can not be empty');
  }

  if (typeof value === 'boolean') {
    value = String(value);
  } // fix https://github.com/visionmedia/superagent/issues/1680


  if (options) this._getFormData().append(name, value, options);else this._getFormData().append(name, value);
  return this;
};
/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request} request
 * @api public
 */


RequestBase.prototype.abort = function () {
  if (this._aborted) {
    return this;
  }

  this._aborted = true;
  if (this.xhr) this.xhr.abort(); // browser

  if (this.req) {
    // Node v13 has major differences in `abort()`
    // https://github.com/nodejs/node/blob/v12.x/lib/internal/streams/end-of-stream.js
    // https://github.com/nodejs/node/blob/v13.x/lib/internal/streams/end-of-stream.js
    // https://github.com/nodejs/node/blob/v14.x/lib/internal/streams/end-of-stream.js
    // (if you run a diff across these you will see the differences)
    //
    // References:
    // <https://github.com/nodejs/node/issues/31630>
    // <https://github.com/visionmedia/superagent/pull/1084/commits/dc18679a7c5ccfc6046d882015e5126888973bc8>
    //
    // Thanks to @shadowgate15 and @niftylettuce
    if (semver.gte(process.version, 'v13.0.0') && semver.lt(process.version, 'v14.0.0')) {
      // Note that the reason this doesn't work is because in v13 as compared to v14
      // there is no `callback = nop` set in end-of-stream.js above
      throw new Error('Superagent does not work in v13 properly with abort() due to Node.js core changes');
    } else if (semver.gte(process.version, 'v14.0.0')) {
      // We have to manually set `destroyed` to `true` in order for this to work
      // (see core internals of end-of-stream.js above in v14 branch as compared to v12)
      this.req.destroyed = true;
    }

    this.req.abort(); // node
  }

  this.clearTimeout();
  this.emit('abort');
  return this;
};

RequestBase.prototype._auth = function (user, pass, options, base64Encoder) {
  switch (options.type) {
    case 'basic':
      this.set('Authorization', "Basic ".concat(base64Encoder("".concat(user, ":").concat(pass))));
      break;

    case 'auto':
      this.username = user;
      this.password = pass;
      break;

    case 'bearer':
      // usage would be .auth(accessToken, { type: 'bearer' })
      this.set('Authorization', "Bearer ".concat(user));
      break;

    default:
      break;
  }

  return this;
};
/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */


RequestBase.prototype.withCredentials = function (on) {
  // This is browser-only functionality. Node side is no-op.
  if (on === undefined) on = true;
  this._withCredentials = on;
  return this;
};
/**
 * Set the max redirects to `n`. Does nothing in browser XHR implementation.
 *
 * @param {Number} n
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.redirects = function (n) {
  this._maxRedirects = n;
  return this;
};
/**
 * Maximum size of buffered response body, in bytes. Counts uncompressed size.
 * Default 200MB.
 *
 * @param {Number} n number of bytes
 * @return {Request} for chaining
 */


RequestBase.prototype.maxResponseSize = function (n) {
  if (typeof n !== 'number') {
    throw new TypeError('Invalid argument');
  }

  this._maxResponseSize = n;
  return this;
};
/**
 * Convert to a plain javascript object (not JSON string) of scalar properties.
 * Note as this method is designed to return a useful non-this value,
 * it cannot be chained.
 *
 * @return {Object} describing method, url, and data of this request
 * @api public
 */


RequestBase.prototype.toJSON = function () {
  return {
    method: this.method,
    url: this.url,
    data: this._data,
    headers: this._header
  };
};
/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
 *      request.post('/user')
 *        .send('name=tobi')
 *        .send('species=ferret')
 *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */
// eslint-disable-next-line complexity


RequestBase.prototype.send = function (data) {
  const isObject_ = isObject(data);
  let type = this._header['content-type'];

  if (this._formData) {
    throw new Error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObject_ && !this._data) {
    if (Array.isArray(data)) {
      this._data = [];
    } else if (!this._isHost(data)) {
      this._data = {};
    }
  } else if (data && this._data && this._isHost(this._data)) {
    throw new Error("Can't merge these send calls");
  } // merge


  if (isObject_ && isObject(this._data)) {
    for (const key in data) {
      if (hasOwn(data, key)) this._data[key] = data[key];
    }
  } else if (typeof data === 'string') {
    // default to x-www-form-urlencoded
    if (!type) this.type('form');
    type = this._header['content-type'];
    if (type) type = type.toLowerCase().trim();

    if (type === 'application/x-www-form-urlencoded') {
      this._data = this._data ? "".concat(this._data, "&").concat(data) : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!isObject_ || this._isHost(data)) {
    return this;
  } // default to json


  if (!type) this.type('json');
  return this;
};
/**
 * Sort `querystring` by the sort function
 *
 *
 * Examples:
 *
 *       // default order
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery()
 *         .end(callback)
 *
 *       // customized sort function
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery(function(a, b){
 *           return a.length - b.length;
 *         })
 *         .end(callback)
 *
 *
 * @param {Function} sort
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.sortQuery = function (sort) {
  // _sort default to true but otherwise can be a function or boolean
  this._sort = typeof sort === 'undefined' ? true : sort;
  return this;
};
/**
 * Compose querystring to append to req.url
 *
 * @api private
 */


RequestBase.prototype._finalizeQueryString = function () {
  const query = this._query.join('&');

  if (query) {
    this.url += (this.url.includes('?') ? '&' : '?') + query;
  }

  this._query.length = 0; // Makes the call idempotent

  if (this._sort) {
    const index = this.url.indexOf('?');

    if (index >= 0) {
      const queryArray = this.url.slice(index + 1).split('&');

      if (typeof this._sort === 'function') {
        queryArray.sort(this._sort);
      } else {
        queryArray.sort();
      }

      this.url = this.url.slice(0, index) + '?' + queryArray.join('&');
    }
  }
}; // For backwards compat only


RequestBase.prototype._appendQueryString = () => {
  console.warn('Unsupported');
};
/**
 * Invoke callback with timeout error.
 *
 * @api private
 */


RequestBase.prototype._timeoutError = function (reason, timeout, errno) {
  if (this._aborted) {
    return;
  }

  const error = new Error("".concat(reason + timeout, "ms exceeded"));
  error.timeout = timeout;
  error.code = 'ECONNABORTED';
  error.errno = errno;
  this.timedout = true;
  this.timedoutError = error;
  this.abort();
  this.callback(error);
};

RequestBase.prototype._setTimeouts = function () {
  const self = this; // deadline

  if (this._timeout && !this._timer) {
    this._timer = setTimeout(() => {
      self._timeoutError('Timeout of ', self._timeout, 'ETIME');
    }, this._timeout);
  } // response timeout


  if (this._responseTimeout && !this._responseTimeoutTimer) {
    this._responseTimeoutTimer = setTimeout(() => {
      self._timeoutError('Response timeout of ', self._responseTimeout, 'ETIMEDOUT');
    }, this._responseTimeout);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzZW12ZXIiLCJyZXF1aXJlIiwiaXNPYmplY3QiLCJoYXNPd24iLCJtb2R1bGUiLCJleHBvcnRzIiwiUmVxdWVzdEJhc2UiLCJwcm90b3R5cGUiLCJjbGVhclRpbWVvdXQiLCJfdGltZXIiLCJfcmVzcG9uc2VUaW1lb3V0VGltZXIiLCJfdXBsb2FkVGltZW91dFRpbWVyIiwicGFyc2UiLCJmbiIsIl9wYXJzZXIiLCJyZXNwb25zZVR5cGUiLCJ2YWx1ZSIsIl9yZXNwb25zZVR5cGUiLCJzZXJpYWxpemUiLCJfc2VyaWFsaXplciIsInRpbWVvdXQiLCJvcHRpb25zIiwiX3RpbWVvdXQiLCJfcmVzcG9uc2VUaW1lb3V0IiwiX3VwbG9hZFRpbWVvdXQiLCJvcHRpb24iLCJkZWFkbGluZSIsInJlc3BvbnNlIiwidXBsb2FkIiwiY29uc29sZSIsIndhcm4iLCJyZXRyeSIsImNvdW50IiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiX21heFJldHJpZXMiLCJfcmV0cmllcyIsIl9yZXRyeUNhbGxiYWNrIiwiRVJST1JfQ09ERVMiLCJTZXQiLCJTVEFUVVNfQ09ERVMiLCJfc2hvdWxkUmV0cnkiLCJlcnJvciIsInJlcyIsIm92ZXJyaWRlIiwiZXJyIiwic3RhdHVzIiwiaGFzIiwiY29kZSIsImNyb3NzRG9tYWluIiwiX3JldHJ5IiwicmVxIiwicmVxdWVzdCIsIl9hYm9ydGVkIiwidGltZWRvdXQiLCJ0aW1lZG91dEVycm9yIiwiX2VuZCIsInRoZW4iLCJyZXNvbHZlIiwicmVqZWN0IiwiX2Z1bGxmaWxsZWRQcm9taXNlIiwic2VsZiIsIl9lbmRDYWxsZWQiLCJQcm9taXNlIiwib24iLCJFcnJvciIsIm1ldGhvZCIsInVybCIsImVuZCIsImNhdGNoIiwiY2FsbGJhY2siLCJ1bmRlZmluZWQiLCJ1c2UiLCJvayIsIl9va0NhbGxiYWNrIiwiX2lzUmVzcG9uc2VPSyIsImdldCIsImZpZWxkIiwiX2hlYWRlciIsInRvTG93ZXJDYXNlIiwiZ2V0SGVhZGVyIiwic2V0Iiwia2V5IiwiaGVhZGVyIiwidW5zZXQiLCJuYW1lIiwiX2RhdGEiLCJBcnJheSIsImlzQXJyYXkiLCJpIiwiU3RyaW5nIiwiX2dldEZvcm1EYXRhIiwiYXBwZW5kIiwiYWJvcnQiLCJ4aHIiLCJndGUiLCJwcm9jZXNzIiwidmVyc2lvbiIsImx0IiwiZGVzdHJveWVkIiwiZW1pdCIsIl9hdXRoIiwidXNlciIsInBhc3MiLCJiYXNlNjRFbmNvZGVyIiwidHlwZSIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJ3aXRoQ3JlZGVudGlhbHMiLCJfd2l0aENyZWRlbnRpYWxzIiwicmVkaXJlY3RzIiwibiIsIl9tYXhSZWRpcmVjdHMiLCJtYXhSZXNwb25zZVNpemUiLCJUeXBlRXJyb3IiLCJfbWF4UmVzcG9uc2VTaXplIiwidG9KU09OIiwiZGF0YSIsImhlYWRlcnMiLCJzZW5kIiwiaXNPYmplY3RfIiwiX2Zvcm1EYXRhIiwiX2lzSG9zdCIsInRyaW0iLCJzb3J0UXVlcnkiLCJzb3J0IiwiX3NvcnQiLCJfZmluYWxpemVRdWVyeVN0cmluZyIsInF1ZXJ5IiwiX3F1ZXJ5Iiwiam9pbiIsImluY2x1ZGVzIiwiaW5kZXgiLCJpbmRleE9mIiwicXVlcnlBcnJheSIsInNsaWNlIiwic3BsaXQiLCJfYXBwZW5kUXVlcnlTdHJpbmciLCJfdGltZW91dEVycm9yIiwicmVhc29uIiwiZXJybm8iLCJfc2V0VGltZW91dHMiLCJzZXRUaW1lb3V0Il0sInNvdXJjZXMiOlsiLi4vc3JjL3JlcXVlc3QtYmFzZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzZW12ZXIgPSByZXF1aXJlKCdzZW12ZXInKTtcblxuLyoqXG4gKiBNb2R1bGUgb2YgbWl4ZWQtaW4gZnVuY3Rpb25zIHNoYXJlZCBiZXR3ZWVuIG5vZGUgYW5kIGNsaWVudCBjb2RlXG4gKi9cbmNvbnN0IHsgaXNPYmplY3QsIGhhc093biB9ID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdEJhc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gUmVxdWVzdEJhc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdEJhc2VgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdEJhc2UoKSB7fVxuXG4vKipcbiAqIENsZWFyIHByZXZpb3VzIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gIGNsZWFyVGltZW91dCh0aGlzLl9yZXNwb25zZVRpbWVvdXRUaW1lcik7XG4gIGNsZWFyVGltZW91dCh0aGlzLl91cGxvYWRUaW1lb3V0VGltZXIpO1xuICBkZWxldGUgdGhpcy5fdGltZXI7XG4gIGRlbGV0ZSB0aGlzLl9yZXNwb25zZVRpbWVvdXRUaW1lcjtcbiAgZGVsZXRlIHRoaXMuX3VwbG9hZFRpbWVvdXRUaW1lcjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE92ZXJyaWRlIGRlZmF1bHQgcmVzcG9uc2UgYm9keSBwYXJzZXJcbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIHRvIGNvbnZlcnQgaW5jb21pbmcgZGF0YSBpbnRvIHJlcXVlc3QuYm9keVxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uIChmbikge1xuICB0aGlzLl9wYXJzZXIgPSBmbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBmb3JtYXQgb2YgYmluYXJ5IHJlc3BvbnNlIGJvZHkuXG4gKiBJbiBicm93c2VyIHZhbGlkIGZvcm1hdHMgYXJlICdibG9iJyBhbmQgJ2FycmF5YnVmZmVyJyxcbiAqIHdoaWNoIHJldHVybiBCbG9iIGFuZCBBcnJheUJ1ZmZlciwgcmVzcGVjdGl2ZWx5LlxuICpcbiAqIEluIE5vZGUgYWxsIHZhbHVlcyByZXN1bHQgaW4gQnVmZmVyLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnJlc3BvbnNlVHlwZSgnYmxvYicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5yZXNwb25zZVR5cGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdGhpcy5fcmVzcG9uc2VUeXBlID0gdmFsdWU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBPdmVycmlkZSBkZWZhdWx0IHJlcXVlc3QgYm9keSBzZXJpYWxpemVyXG4gKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCB0byBjb252ZXJ0IGRhdGEgc2V0IHZpYSAuc2VuZCBvciAuYXR0YWNoIGludG8gcGF5bG9hZCB0byBzZW5kXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnNlcmlhbGl6ZSA9IGZ1bmN0aW9uIChmbikge1xuICB0aGlzLl9zZXJpYWxpemVyID0gZm47XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgdGltZW91dHMuXG4gKlxuICogLSByZXNwb25zZSB0aW1lb3V0IGlzIHRpbWUgYmV0d2VlbiBzZW5kaW5nIHJlcXVlc3QgYW5kIHJlY2VpdmluZyB0aGUgZmlyc3QgYnl0ZSBvZiB0aGUgcmVzcG9uc2UuIEluY2x1ZGVzIEROUyBhbmQgY29ubmVjdGlvbiB0aW1lLlxuICogLSBkZWFkbGluZSBpcyB0aGUgdGltZSBmcm9tIHN0YXJ0IG9mIHRoZSByZXF1ZXN0IHRvIHJlY2VpdmluZyByZXNwb25zZSBib2R5IGluIGZ1bGwuIElmIHRoZSBkZWFkbGluZSBpcyB0b28gc2hvcnQgbGFyZ2UgZmlsZXMgbWF5IG5vdCBsb2FkIGF0IGFsbCBvbiBzbG93IGNvbm5lY3Rpb25zLlxuICogLSB1cGxvYWQgaXMgdGhlIHRpbWUgIHNpbmNlIGxhc3QgYml0IG9mIGRhdGEgd2FzIHNlbnQgb3IgcmVjZWl2ZWQuIFRoaXMgdGltZW91dCB3b3JrcyBvbmx5IGlmIGRlYWRsaW5lIHRpbWVvdXQgaXMgb2ZmXG4gKlxuICogVmFsdWUgb2YgMCBvciBmYWxzZSBtZWFucyBubyB0aW1lb3V0LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfE9iamVjdH0gbXMgb3Ige3Jlc3BvbnNlLCBkZWFkbGluZX1cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcbiAgICB0aGlzLl90aW1lb3V0ID0gb3B0aW9ucztcbiAgICB0aGlzLl9yZXNwb25zZVRpbWVvdXQgPSAwO1xuICAgIHRoaXMuX3VwbG9hZFRpbWVvdXQgPSAwO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZm9yIChjb25zdCBvcHRpb24gaW4gb3B0aW9ucykge1xuICAgIGlmIChoYXNPd24ob3B0aW9ucywgb3B0aW9uKSkge1xuICAgICAgc3dpdGNoIChvcHRpb24pIHtcbiAgICAgICAgY2FzZSAnZGVhZGxpbmUnOlxuICAgICAgICAgIHRoaXMuX3RpbWVvdXQgPSBvcHRpb25zLmRlYWRsaW5lO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyZXNwb25zZSc6XG4gICAgICAgICAgdGhpcy5fcmVzcG9uc2VUaW1lb3V0ID0gb3B0aW9ucy5yZXNwb25zZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndXBsb2FkJzpcbiAgICAgICAgICB0aGlzLl91cGxvYWRUaW1lb3V0ID0gb3B0aW9ucy51cGxvYWQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc29sZS53YXJuKCdVbmtub3duIHRpbWVvdXQgb3B0aW9uJywgb3B0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IG51bWJlciBvZiByZXRyeSBhdHRlbXB0cyBvbiBlcnJvci5cbiAqXG4gKiBGYWlsZWQgcmVxdWVzdHMgd2lsbCBiZSByZXRyaWVkICdjb3VudCcgdGltZXMgaWYgdGltZW91dCBvciBlcnIuY29kZSA+PSA1MDAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnJldHJ5ID0gZnVuY3Rpb24gKGNvdW50LCBmbikge1xuICAvLyBEZWZhdWx0IHRvIDEgaWYgbm8gY291bnQgcGFzc2VkIG9yIHRydWVcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDAgfHwgY291bnQgPT09IHRydWUpIGNvdW50ID0gMTtcbiAgaWYgKGNvdW50IDw9IDApIGNvdW50ID0gMDtcbiAgdGhpcy5fbWF4UmV0cmllcyA9IGNvdW50O1xuICB0aGlzLl9yZXRyaWVzID0gMDtcbiAgdGhpcy5fcmV0cnlDYWxsYmFjayA9IGZuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBOT1RFOiB3ZSBkbyBub3QgaW5jbHVkZSBFU09DS0VUVElNRURPVVQgYmVjYXVzZSB0aGF0IGlzIGZyb20gYHJlcXVlc3RgIHBhY2thZ2Vcbi8vICAgICAgIDxodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL2dvdC9wdWxsLzUzNz5cbi8vXG4vLyBOT1RFOiB3ZSBkbyBub3QgaW5jbHVkZSBFQUREUklORk8gYmVjYXVzZSBpdCB3YXMgcmVtb3ZlZCBmcm9tIGxpYnV2IGluIDIwMTRcbi8vICAgICAgIDxodHRwczovL2dpdGh1Yi5jb20vbGlidXYvbGlidXYvY29tbWl0LzAyZTFlYmQ0MGI4MDdiZTVhZjQ2MzQzZWE4NzMzMzFiMmVlNGU5YzE+XG4vLyAgICAgICA8aHR0cHM6Ly9naXRodWIuY29tL3JlcXVlc3QvcmVxdWVzdC9zZWFyY2g/cT1FU09DS0VUVElNRURPVVQmdW5zY29wZWRfcT1FU09DS0VUVElNRURPVVQ+XG4vL1xuLy9cbi8vIFRPRE86IGV4cG9zZSB0aGVzZSBhcyBjb25maWd1cmFibGUgZGVmYXVsdHNcbi8vXG5jb25zdCBFUlJPUl9DT0RFUyA9IG5ldyBTZXQoW1xuICAnRVRJTUVET1VUJyxcbiAgJ0VDT05OUkVTRVQnLFxuICAnRUFERFJJTlVTRScsXG4gICdFQ09OTlJFRlVTRUQnLFxuICAnRVBJUEUnLFxuICAnRU5PVEZPVU5EJyxcbiAgJ0VORVRVTlJFQUNIJyxcbiAgJ0VBSV9BR0FJTidcbl0pO1xuXG5jb25zdCBTVEFUVVNfQ09ERVMgPSBuZXcgU2V0KFtcbiAgNDA4LCA0MTMsIDQyOSwgNTAwLCA1MDIsIDUwMywgNTA0LCA1MjEsIDUyMiwgNTI0XG5dKTtcblxuLy8gVE9ETzogd2Ugd291bGQgbmVlZCB0byBtYWtlIHRoaXMgZWFzaWx5IGNvbmZpZ3VyYWJsZSBiZWZvcmUgYWRkaW5nIGl0IGluIChlLmcuIHNvbWUgbWlnaHQgd2FudCB0byBhZGQgUE9TVClcbi8vIGNvbnN0IE1FVEhPRFMgPSBuZXcgU2V0KFsnR0VUJywgJ1BVVCcsICdIRUFEJywgJ0RFTEVURScsICdPUFRJT05TJywgJ1RSQUNFJ10pO1xuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHJlcXVlc3Qgc2hvdWxkIGJlIHJldHJpZWQuXG4gKiAoSW5zcGlyZWQgYnkgaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9nb3QjcmV0cnkpXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyIGFuIGVycm9yXG4gKiBAcGFyYW0ge1Jlc3BvbnNlfSBbcmVzXSByZXNwb25zZVxuICogQHJldHVybnMge0Jvb2xlYW59IGlmIHNlZ21lbnQgc2hvdWxkIGJlIHJldHJpZWRcbiAqL1xuUmVxdWVzdEJhc2UucHJvdG90eXBlLl9zaG91bGRSZXRyeSA9IGZ1bmN0aW9uIChlcnJvciwgcmVzKSB7XG4gIGlmICghdGhpcy5fbWF4UmV0cmllcyB8fCB0aGlzLl9yZXRyaWVzKysgPj0gdGhpcy5fbWF4UmV0cmllcykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0aGlzLl9yZXRyeUNhbGxiYWNrKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG92ZXJyaWRlID0gdGhpcy5fcmV0cnlDYWxsYmFjayhlcnJvciwgcmVzKTtcbiAgICAgIGlmIChvdmVycmlkZSA9PT0gdHJ1ZSkgcmV0dXJuIHRydWU7XG4gICAgICBpZiAob3ZlcnJpZGUgPT09IGZhbHNlKSByZXR1cm4gZmFsc2U7XG4gICAgICAvLyB1bmRlZmluZWQgZmFsbHMgYmFjayB0byBkZWZhdWx0c1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE86IHdlIHdvdWxkIG5lZWQgdG8gbWFrZSB0aGlzIGVhc2lseSBjb25maWd1cmFibGUgYmVmb3JlIGFkZGluZyBpdCBpbiAoZS5nLiBzb21lIG1pZ2h0IHdhbnQgdG8gYWRkIFBPU1QpXG4gIC8qXG4gIGlmIChcbiAgICB0aGlzLnJlcSAmJlxuICAgIHRoaXMucmVxLm1ldGhvZCAmJlxuICAgICFNRVRIT0RTLmhhcyh0aGlzLnJlcS5tZXRob2QudG9VcHBlckNhc2UoKSlcbiAgKVxuICAgIHJldHVybiBmYWxzZTtcbiAgKi9cbiAgaWYgKHJlcyAmJiByZXMuc3RhdHVzICYmIFNUQVRVU19DT0RFUy5oYXMocmVzLnN0YXR1cykpIHJldHVybiB0cnVlO1xuICBpZiAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IuY29kZSAmJiBFUlJPUl9DT0RFUy5oYXMoZXJyb3IuY29kZSkpIHJldHVybiB0cnVlO1xuICAgIC8vIFN1cGVyYWdlbnQgdGltZW91dFxuICAgIGlmIChlcnJvci50aW1lb3V0ICYmIGVycm9yLmNvZGUgPT09ICdFQ09OTkFCT1JURUQnKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoZXJyb3IuY3Jvc3NEb21haW4pIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBSZXRyeSByZXF1ZXN0XG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuX3JldHJ5ID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuXG4gIC8vIG5vZGVcbiAgaWYgKHRoaXMucmVxKSB7XG4gICAgdGhpcy5yZXEgPSBudWxsO1xuICAgIHRoaXMucmVxID0gdGhpcy5yZXF1ZXN0KCk7XG4gIH1cblxuICB0aGlzLl9hYm9ydGVkID0gZmFsc2U7XG4gIHRoaXMudGltZWRvdXQgPSBmYWxzZTtcbiAgdGhpcy50aW1lZG91dEVycm9yID0gbnVsbDtcblxuICByZXR1cm4gdGhpcy5fZW5kKCk7XG59O1xuXG4vKipcbiAqIFByb21pc2Ugc3VwcG9ydFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtyZWplY3RdXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICBpZiAoIXRoaXMuX2Z1bGxmaWxsZWRQcm9taXNlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHRoaXMuX2VuZENhbGxlZCkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAnV2FybmluZzogc3VwZXJhZ2VudCByZXF1ZXN0IHdhcyBzZW50IHR3aWNlLCBiZWNhdXNlIGJvdGggLmVuZCgpIGFuZCAudGhlbigpIHdlcmUgY2FsbGVkLiBOZXZlciBjYWxsIC5lbmQoKSBpZiB5b3UgdXNlIHByb21pc2VzJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLl9mdWxsZmlsbGVkUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYub24oJ2Fib3J0JywgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fbWF4UmV0cmllcyAmJiB0aGlzLl9tYXhSZXRyaWVzID4gdGhpcy5fcmV0cmllcykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnRpbWVkb3V0ICYmIHRoaXMudGltZWRvdXRFcnJvcikge1xuICAgICAgICAgIHJlamVjdCh0aGlzLnRpbWVkb3V0RXJyb3IpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdBYm9ydGVkJyk7XG4gICAgICAgIGVycm9yLmNvZGUgPSAnQUJPUlRFRCc7XG4gICAgICAgIGVycm9yLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICAgICAgICBlcnJvci5tZXRob2QgPSB0aGlzLm1ldGhvZDtcbiAgICAgICAgZXJyb3IudXJsID0gdGhpcy51cmw7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9KTtcbiAgICAgIHNlbGYuZW5kKChlcnJvciwgcmVzKSA9PiB7XG4gICAgICAgIGlmIChlcnJvcikgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgZWxzZSByZXNvbHZlKHJlcyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLl9mdWxsZmlsbGVkUHJvbWlzZS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG59O1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuY2F0Y2ggPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIGNhbGxiYWNrKTtcbn07XG5cbi8qKlxuICogQWxsb3cgZm9yIGV4dGVuc2lvblxuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiAoZm4pIHtcbiAgZm4odGhpcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLm9rID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBFcnJvcignQ2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgdGhpcy5fb2tDYWxsYmFjayA9IGNhbGxiYWNrO1xuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5faXNSZXNwb25zZU9LID0gZnVuY3Rpb24gKHJlcykge1xuICBpZiAoIXJlcykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0aGlzLl9va0NhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuX29rQ2FsbGJhY2socmVzKTtcbiAgfVxuXG4gIHJldHVybiByZXMuc3RhdHVzID49IDIwMCAmJiByZXMuc3RhdHVzIDwgMzAwO1xufTtcblxuLyoqXG4gKiBHZXQgcmVxdWVzdCBoZWFkZXIgYGZpZWxkYC5cbiAqIENhc2UtaW5zZW5zaXRpdmUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoZmllbGQpIHtcbiAgcmV0dXJuIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgaGVhZGVyIGBmaWVsZGAgdmFsdWUuXG4gKiBUaGlzIGlzIGEgZGVwcmVjYXRlZCBpbnRlcm5hbCBBUEkuIFVzZSBgLmdldChmaWVsZClgIGluc3RlYWQuXG4gKlxuICogKGdldEhlYWRlciBpcyBubyBsb25nZXIgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoZSBzdXBlcmFnZW50IGNvZGUgYmFzZSlcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICogQGRlcHJlY2F0ZWRcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuZ2V0SGVhZGVyID0gUmVxdWVzdEJhc2UucHJvdG90eXBlLmdldDtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIGBmaWVsZGAgdG8gYHZhbGAsIG9yIG11bHRpcGxlIGZpZWxkcyB3aXRoIG9uZSBvYmplY3QuXG4gKiBDYXNlLWluc2Vuc2l0aXZlLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5zZXQoJ1gtQVBJLUtleScsICdmb29iYXInKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCh7IEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLCAnWC1BUEktS2V5JzogJ2Zvb2JhcicgfSlcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcbiAgaWYgKGlzT2JqZWN0KGZpZWxkKSkge1xuICAgIGZvciAoY29uc3Qga2V5IGluIGZpZWxkKSB7XG4gICAgICBpZiAoaGFzT3duKGZpZWxkLCBrZXkpKSB0aGlzLnNldChrZXksIGZpZWxkW2tleV0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldID0gdmFsdWU7XG4gIHRoaXMuaGVhZGVyW2ZpZWxkXSA9IHZhbHVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGhlYWRlciBgZmllbGRgLlxuICogQ2FzZS1pbnNlbnNpdGl2ZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnVuc2V0KCdVc2VyLUFnZW50JylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGQgZmllbGQgbmFtZVxuICovXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUudW5zZXQgPSBmdW5jdGlvbiAoZmllbGQpIHtcbiAgZGVsZXRlIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbiAgZGVsZXRlIHRoaXMuaGVhZGVyW2ZpZWxkXTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdyaXRlIHRoZSBmaWVsZCBgbmFtZWAgYW5kIGB2YWxgLCBvciBtdWx0aXBsZSBmaWVsZHMgd2l0aCBvbmUgb2JqZWN0XG4gKiBmb3IgXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCIgcmVxdWVzdCBib2RpZXMuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoJ2ZvbycsICdiYXInKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoeyBmb286ICdiYXInLCBiYXo6ICdxdXgnIH0pXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBuYW1lIG5hbWUgb2YgZmllbGRcbiAqIEBwYXJhbSB7U3RyaW5nfEJsb2J8RmlsZXxCdWZmZXJ8ZnMuUmVhZFN0cmVhbX0gdmFsIHZhbHVlIG9mIGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucyBleHRyYSBvcHRpb25zLCBlLmcuICdibG9iJ1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuZmllbGQgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgLy8gbmFtZSBzaG91bGQgYmUgZWl0aGVyIGEgc3RyaW5nIG9yIGFuIG9iamVjdC5cbiAgaWYgKG5hbWUgPT09IG51bGwgfHwgdW5kZWZpbmVkID09PSBuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCcuZmllbGQobmFtZSwgdmFsKSBuYW1lIGNhbiBub3QgYmUgZW1wdHknKTtcbiAgfVxuXG4gIGlmICh0aGlzLl9kYXRhKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCIuZmllbGQoKSBjYW4ndCBiZSB1c2VkIGlmIC5zZW5kKCkgaXMgdXNlZC4gUGxlYXNlIHVzZSBvbmx5IC5zZW5kKCkgb3Igb25seSAuZmllbGQoKSAmIC5hdHRhY2goKVwiXG4gICAgKTtcbiAgfVxuXG4gIGlmIChpc09iamVjdChuYW1lKSkge1xuICAgIGZvciAoY29uc3Qga2V5IGluIG5hbWUpIHtcbiAgICAgIGlmIChoYXNPd24obmFtZSwga2V5KSkgdGhpcy5maWVsZChrZXksIG5hbWVba2V5XSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBmb3IgKGNvbnN0IGkgaW4gdmFsdWUpIHtcbiAgICAgIGlmIChoYXNPd24odmFsdWUsIGkpKSB0aGlzLmZpZWxkKG5hbWUsIHZhbHVlW2ldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHZhbCBzaG91bGQgYmUgZGVmaW5lZCBub3dcbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHVuZGVmaW5lZCA9PT0gdmFsdWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJy5maWVsZChuYW1lLCB2YWwpIHZhbCBjYW4gbm90IGJlIGVtcHR5Jyk7XG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcbiAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSk7XG4gIH1cblxuICAvLyBmaXggaHR0cHM6Ly9naXRodWIuY29tL3Zpc2lvbm1lZGlhL3N1cGVyYWdlbnQvaXNzdWVzLzE2ODBcbiAgaWYgKG9wdGlvbnMpIHRoaXMuX2dldEZvcm1EYXRhKCkuYXBwZW5kKG5hbWUsIHZhbHVlLCBvcHRpb25zKTtcbiAgZWxzZSB0aGlzLl9nZXRGb3JtRGF0YSgpLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFib3J0IHRoZSByZXF1ZXN0LCBhbmQgY2xlYXIgcG90ZW50aWFsIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gcmVxdWVzdFxuICogQGFwaSBwdWJsaWNcbiAqL1xuUmVxdWVzdEJhc2UucHJvdG90eXBlLmFib3J0ID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5fYWJvcnRlZCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdGhpcy5fYWJvcnRlZCA9IHRydWU7XG4gIGlmICh0aGlzLnhocikgdGhpcy54aHIuYWJvcnQoKTsgLy8gYnJvd3NlclxuICBpZiAodGhpcy5yZXEpIHtcbiAgICAvLyBOb2RlIHYxMyBoYXMgbWFqb3IgZGlmZmVyZW5jZXMgaW4gYGFib3J0KClgXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvdjEyLngvbGliL2ludGVybmFsL3N0cmVhbXMvZW5kLW9mLXN0cmVhbS5qc1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9ibG9iL3YxMy54L2xpYi9pbnRlcm5hbC9zdHJlYW1zL2VuZC1vZi1zdHJlYW0uanNcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi92MTQueC9saWIvaW50ZXJuYWwvc3RyZWFtcy9lbmQtb2Ytc3RyZWFtLmpzXG4gICAgLy8gKGlmIHlvdSBydW4gYSBkaWZmIGFjcm9zcyB0aGVzZSB5b3Ugd2lsbCBzZWUgdGhlIGRpZmZlcmVuY2VzKVxuICAgIC8vXG4gICAgLy8gUmVmZXJlbmNlczpcbiAgICAvLyA8aHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2lzc3Vlcy8zMTYzMD5cbiAgICAvLyA8aHR0cHM6Ly9naXRodWIuY29tL3Zpc2lvbm1lZGlhL3N1cGVyYWdlbnQvcHVsbC8xMDg0L2NvbW1pdHMvZGMxODY3OWE3YzVjY2ZjNjA0NmQ4ODIwMTVlNTEyNjg4ODk3M2JjOD5cbiAgICAvL1xuICAgIC8vIFRoYW5rcyB0byBAc2hhZG93Z2F0ZTE1IGFuZCBAbmlmdHlsZXR0dWNlXG4gICAgaWYgKFxuICAgICAgc2VtdmVyLmd0ZShwcm9jZXNzLnZlcnNpb24sICd2MTMuMC4wJykgJiZcbiAgICAgIHNlbXZlci5sdChwcm9jZXNzLnZlcnNpb24sICd2MTQuMC4wJylcbiAgICApIHtcbiAgICAgIC8vIE5vdGUgdGhhdCB0aGUgcmVhc29uIHRoaXMgZG9lc24ndCB3b3JrIGlzIGJlY2F1c2UgaW4gdjEzIGFzIGNvbXBhcmVkIHRvIHYxNFxuICAgICAgLy8gdGhlcmUgaXMgbm8gYGNhbGxiYWNrID0gbm9wYCBzZXQgaW4gZW5kLW9mLXN0cmVhbS5qcyBhYm92ZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnU3VwZXJhZ2VudCBkb2VzIG5vdCB3b3JrIGluIHYxMyBwcm9wZXJseSB3aXRoIGFib3J0KCkgZHVlIHRvIE5vZGUuanMgY29yZSBjaGFuZ2VzJ1xuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHNlbXZlci5ndGUocHJvY2Vzcy52ZXJzaW9uLCAndjE0LjAuMCcpKSB7XG4gICAgICAvLyBXZSBoYXZlIHRvIG1hbnVhbGx5IHNldCBgZGVzdHJveWVkYCB0byBgdHJ1ZWAgaW4gb3JkZXIgZm9yIHRoaXMgdG8gd29ya1xuICAgICAgLy8gKHNlZSBjb3JlIGludGVybmFscyBvZiBlbmQtb2Ytc3RyZWFtLmpzIGFib3ZlIGluIHYxNCBicmFuY2ggYXMgY29tcGFyZWQgdG8gdjEyKVxuICAgICAgdGhpcy5yZXEuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLnJlcS5hYm9ydCgpOyAvLyBub2RlXG4gIH1cblxuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICB0aGlzLmVtaXQoJ2Fib3J0Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLl9hdXRoID0gZnVuY3Rpb24gKHVzZXIsIHBhc3MsIG9wdGlvbnMsIGJhc2U2NEVuY29kZXIpIHtcbiAgc3dpdGNoIChvcHRpb25zLnR5cGUpIHtcbiAgICBjYXNlICdiYXNpYyc6XG4gICAgICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsIGBCYXNpYyAke2Jhc2U2NEVuY29kZXIoYCR7dXNlcn06JHtwYXNzfWApfWApO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdhdXRvJzpcbiAgICAgIHRoaXMudXNlcm5hbWUgPSB1c2VyO1xuICAgICAgdGhpcy5wYXNzd29yZCA9IHBhc3M7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2JlYXJlcic6IC8vIHVzYWdlIHdvdWxkIGJlIC5hdXRoKGFjY2Vzc1Rva2VuLCB7IHR5cGU6ICdiZWFyZXInIH0pXG4gICAgICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsIGBCZWFyZXIgJHt1c2VyfWApO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0cmFuc21pc3Npb24gb2YgY29va2llcyB3aXRoIHgtZG9tYWluIHJlcXVlc3RzLlxuICpcbiAqIE5vdGUgdGhhdCBmb3IgdGhpcyB0byB3b3JrIHRoZSBvcmlnaW4gbXVzdCBub3QgYmVcbiAqIHVzaW5nIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIgd2l0aCBhIHdpbGRjYXJkLFxuICogYW5kIGFsc28gbXVzdCBzZXQgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiXG4gKiB0byBcInRydWVcIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbiAob24pIHtcbiAgLy8gVGhpcyBpcyBicm93c2VyLW9ubHkgZnVuY3Rpb25hbGl0eS4gTm9kZSBzaWRlIGlzIG5vLW9wLlxuICBpZiAob24gPT09IHVuZGVmaW5lZCkgb24gPSB0cnVlO1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSBvbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgbWF4IHJlZGlyZWN0cyB0byBgbmAuIERvZXMgbm90aGluZyBpbiBicm93c2VyIFhIUiBpbXBsZW1lbnRhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5yZWRpcmVjdHMgPSBmdW5jdGlvbiAobikge1xuICB0aGlzLl9tYXhSZWRpcmVjdHMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTWF4aW11bSBzaXplIG9mIGJ1ZmZlcmVkIHJlc3BvbnNlIGJvZHksIGluIGJ5dGVzLiBDb3VudHMgdW5jb21wcmVzc2VkIHNpemUuXG4gKiBEZWZhdWx0IDIwME1CLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuIG51bWJlciBvZiBieXRlc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKi9cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5tYXhSZXNwb25zZVNpemUgPSBmdW5jdGlvbiAobikge1xuICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBhcmd1bWVudCcpO1xuICB9XG5cbiAgdGhpcy5fbWF4UmVzcG9uc2VTaXplID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENvbnZlcnQgdG8gYSBwbGFpbiBqYXZhc2NyaXB0IG9iamVjdCAobm90IEpTT04gc3RyaW5nKSBvZiBzY2FsYXIgcHJvcGVydGllcy5cbiAqIE5vdGUgYXMgdGhpcyBtZXRob2QgaXMgZGVzaWduZWQgdG8gcmV0dXJuIGEgdXNlZnVsIG5vbi10aGlzIHZhbHVlLFxuICogaXQgY2Fubm90IGJlIGNoYWluZWQuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBkZXNjcmliaW5nIG1ldGhvZCwgdXJsLCBhbmQgZGF0YSBvZiB0aGlzIHJlcXVlc3RcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICBtZXRob2Q6IHRoaXMubWV0aG9kLFxuICAgIHVybDogdGhpcy51cmwsXG4gICAgZGF0YTogdGhpcy5fZGF0YSxcbiAgICBoZWFkZXJzOiB0aGlzLl9oZWFkZXJcbiAgfTtcbn07XG5cbi8qKlxuICogU2VuZCBgZGF0YWAgYXMgdGhlIHJlcXVlc3QgYm9keSwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBtYW51YWwganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdqc29uJylcbiAqICAgICAgICAgLnNlbmQoJ3tcIm5hbWVcIjpcInRqXCJ9JylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCgnbmFtZT10b2JpJylcbiAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbXBsZXhpdHlcblJlcXVlc3RCYXNlLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgY29uc3QgaXNPYmplY3RfID0gaXNPYmplY3QoZGF0YSk7XG4gIGxldCB0eXBlID0gdGhpcy5faGVhZGVyWydjb250ZW50LXR5cGUnXTtcblxuICBpZiAodGhpcy5fZm9ybURhdGEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIi5zZW5kKCkgY2FuJ3QgYmUgdXNlZCBpZiAuYXR0YWNoKCkgb3IgLmZpZWxkKCkgaXMgdXNlZC4gUGxlYXNlIHVzZSBvbmx5IC5zZW5kKCkgb3Igb25seSAuZmllbGQoKSAmIC5hdHRhY2goKVwiXG4gICAgKTtcbiAgfVxuXG4gIGlmIChpc09iamVjdF8gJiYgIXRoaXMuX2RhdGEpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgdGhpcy5fZGF0YSA9IFtdO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuX2lzSG9zdChkYXRhKSkge1xuICAgICAgdGhpcy5fZGF0YSA9IHt9O1xuICAgIH1cbiAgfSBlbHNlIGlmIChkYXRhICYmIHRoaXMuX2RhdGEgJiYgdGhpcy5faXNIb3N0KHRoaXMuX2RhdGEpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgbWVyZ2UgdGhlc2Ugc2VuZCBjYWxsc1wiKTtcbiAgfVxuXG4gIC8vIG1lcmdlXG4gIGlmIChpc09iamVjdF8gJiYgaXNPYmplY3QodGhpcy5fZGF0YSkpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBkYXRhKSB7XG4gICAgICBpZiAoaGFzT3duKGRhdGEsIGtleSkpIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgLy8gZGVmYXVsdCB0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLl9oZWFkZXJbJ2NvbnRlbnQtdHlwZSddO1xuICAgIGlmICh0eXBlKSB0eXBlID0gdHlwZS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICBpZiAodHlwZSA9PT0gJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhID8gYCR7dGhpcy5fZGF0YX0mJHtkYXRhfWAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIWlzT2JqZWN0XyB8fCB0aGlzLl9pc0hvc3QoZGF0YSkpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGRlZmF1bHQgdG8ganNvblxuICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnanNvbicpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU29ydCBgcXVlcnlzdHJpbmdgIGJ5IHRoZSBzb3J0IGZ1bmN0aW9uXG4gKlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgIC8vIGRlZmF1bHQgb3JkZXJcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvdXNlcicpXG4gKiAgICAgICAgIC5xdWVyeSgnbmFtZT1OaWNrJylcbiAqICAgICAgICAgLnF1ZXJ5KCdzZWFyY2g9TWFubnknKVxuICogICAgICAgICAuc29ydFF1ZXJ5KClcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBjdXN0b21pemVkIHNvcnQgZnVuY3Rpb25cbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvdXNlcicpXG4gKiAgICAgICAgIC5xdWVyeSgnbmFtZT1OaWNrJylcbiAqICAgICAgICAgLnF1ZXJ5KCdzZWFyY2g9TWFubnknKVxuICogICAgICAgICAuc29ydFF1ZXJ5KGZ1bmN0aW9uKGEsIGIpe1xuICogICAgICAgICAgIHJldHVybiBhLmxlbmd0aCAtIGIubGVuZ3RoO1xuICogICAgICAgICB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzb3J0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnNvcnRRdWVyeSA9IGZ1bmN0aW9uIChzb3J0KSB7XG4gIC8vIF9zb3J0IGRlZmF1bHQgdG8gdHJ1ZSBidXQgb3RoZXJ3aXNlIGNhbiBiZSBhIGZ1bmN0aW9uIG9yIGJvb2xlYW5cbiAgdGhpcy5fc29ydCA9IHR5cGVvZiBzb3J0ID09PSAndW5kZWZpbmVkJyA/IHRydWUgOiBzb3J0O1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ29tcG9zZSBxdWVyeXN0cmluZyB0byBhcHBlbmQgdG8gcmVxLnVybFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuX2ZpbmFsaXplUXVlcnlTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHF1ZXJ5ID0gdGhpcy5fcXVlcnkuam9pbignJicpO1xuICBpZiAocXVlcnkpIHtcbiAgICB0aGlzLnVybCArPSAodGhpcy51cmwuaW5jbHVkZXMoJz8nKSA/ICcmJyA6ICc/JykgKyBxdWVyeTtcbiAgfVxuXG4gIHRoaXMuX3F1ZXJ5Lmxlbmd0aCA9IDA7IC8vIE1ha2VzIHRoZSBjYWxsIGlkZW1wb3RlbnRcblxuICBpZiAodGhpcy5fc29ydCkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy51cmwuaW5kZXhPZignPycpO1xuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICBjb25zdCBxdWVyeUFycmF5ID0gdGhpcy51cmwuc2xpY2UoaW5kZXggKyAxKS5zcGxpdCgnJicpO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLl9zb3J0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHF1ZXJ5QXJyYXkuc29ydCh0aGlzLl9zb3J0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXJ5QXJyYXkuc29ydCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnVybCA9IHRoaXMudXJsLnNsaWNlKDAsIGluZGV4KSArICc/JyArIHF1ZXJ5QXJyYXkuam9pbignJicpO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRm9yIGJhY2t3YXJkcyBjb21wYXQgb25seVxuUmVxdWVzdEJhc2UucHJvdG90eXBlLl9hcHBlbmRRdWVyeVN0cmluZyA9ICgpID0+IHtcbiAgY29uc29sZS53YXJuKCdVbnN1cHBvcnRlZCcpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB0aW1lb3V0IGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5fdGltZW91dEVycm9yID0gZnVuY3Rpb24gKHJlYXNvbiwgdGltZW91dCwgZXJybm8pIHtcbiAgaWYgKHRoaXMuX2Fib3J0ZWQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihgJHtyZWFzb24gKyB0aW1lb3V0fW1zIGV4Y2VlZGVkYCk7XG4gIGVycm9yLnRpbWVvdXQgPSB0aW1lb3V0O1xuICBlcnJvci5jb2RlID0gJ0VDT05OQUJPUlRFRCc7XG4gIGVycm9yLmVycm5vID0gZXJybm87XG4gIHRoaXMudGltZWRvdXQgPSB0cnVlO1xuICB0aGlzLnRpbWVkb3V0RXJyb3IgPSBlcnJvcjtcbiAgdGhpcy5hYm9ydCgpO1xuICB0aGlzLmNhbGxiYWNrKGVycm9yKTtcbn07XG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5fc2V0VGltZW91dHMgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gIC8vIGRlYWRsaW5lXG4gIGlmICh0aGlzLl90aW1lb3V0ICYmICF0aGlzLl90aW1lcikge1xuICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZWxmLl90aW1lb3V0RXJyb3IoJ1RpbWVvdXQgb2YgJywgc2VsZi5fdGltZW91dCwgJ0VUSU1FJyk7XG4gICAgfSwgdGhpcy5fdGltZW91dCk7XG4gIH1cblxuICAvLyByZXNwb25zZSB0aW1lb3V0XG4gIGlmICh0aGlzLl9yZXNwb25zZVRpbWVvdXQgJiYgIXRoaXMuX3Jlc3BvbnNlVGltZW91dFRpbWVyKSB7XG4gICAgdGhpcy5fcmVzcG9uc2VUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNlbGYuX3RpbWVvdXRFcnJvcihcbiAgICAgICAgJ1Jlc3BvbnNlIHRpbWVvdXQgb2YgJyxcbiAgICAgICAgc2VsZi5fcmVzcG9uc2VUaW1lb3V0LFxuICAgICAgICAnRVRJTUVET1VUJ1xuICAgICAgKTtcbiAgICB9LCB0aGlzLl9yZXNwb25zZVRpbWVvdXQpO1xuICB9XG59O1xuIl0sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU1BLE1BQU0sR0FBR0MsT0FBTyxDQUFDLFFBQUQsQ0FBdEI7QUFFQTtBQUNBO0FBQ0E7OztBQUNBLGlCQUE2QkEsT0FBTyxDQUFDLFNBQUQsQ0FBcEM7QUFBQSxNQUFRQyxRQUFSLFlBQVFBLFFBQVI7QUFBQSxNQUFrQkMsTUFBbEIsWUFBa0JBLE1BQWxCO0FBRUE7QUFDQTtBQUNBOzs7QUFFQUMsTUFBTSxDQUFDQyxPQUFQLEdBQWlCQyxXQUFqQjtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsV0FBVCxHQUF1QixDQUFFO0FBRXpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUFBLFdBQVcsQ0FBQ0MsU0FBWixDQUFzQkMsWUFBdEIsR0FBcUMsWUFBWTtFQUMvQ0EsWUFBWSxDQUFDLEtBQUtDLE1BQU4sQ0FBWjtFQUNBRCxZQUFZLENBQUMsS0FBS0UscUJBQU4sQ0FBWjtFQUNBRixZQUFZLENBQUMsS0FBS0csbUJBQU4sQ0FBWjtFQUNBLE9BQU8sS0FBS0YsTUFBWjtFQUNBLE9BQU8sS0FBS0MscUJBQVo7RUFDQSxPQUFPLEtBQUtDLG1CQUFaO0VBQ0EsT0FBTyxJQUFQO0FBQ0QsQ0FSRDtBQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBTCxXQUFXLENBQUNDLFNBQVosQ0FBc0JLLEtBQXRCLEdBQThCLFVBQVVDLEVBQVYsRUFBYztFQUMxQyxLQUFLQyxPQUFMLEdBQWVELEVBQWY7RUFDQSxPQUFPLElBQVA7QUFDRCxDQUhEO0FB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