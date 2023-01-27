"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

/**
 * Module dependencies.
 */
// eslint-disable-next-line node/no-deprecated-api
const _require = require('url'),
      parse = _require.parse,
      format = _require.format,
      resolve = _require.resolve;

const Stream = require('stream');

const https = require('https');

const http = require('http');

const fs = require('fs');

const zlib = require('zlib');

const util = require('util');

const qs = require('qs');

const mime = require('mime');

let methods = require('methods');

const FormData = require('form-data');

const formidable = require('formidable');

const debug = require('debug')('superagent');

const CookieJar = require('cookiejar');

const semverGte = require('semver/functions/gte');

const safeStringify = require('fast-safe-stringify');

const utils = require('../utils');

const RequestBase = require('../request-base');

const _require2 = require('./unzip'),
      unzip = _require2.unzip;

const Response = require('./response');

const mixin = utils.mixin,
      hasOwn = utils.hasOwn;
let http2;
if (semverGte(process.version, 'v10.10.0')) http2 = require('./http2wrapper');

function request(method, url) {
  // callback
  if (typeof url === 'function') {
    return new exports.Request('GET', method).end(url);
  } // url first


  if (arguments.length === 1) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
}

module.exports = request;
exports = module.exports;
/**
 * Expose `Request`.
 */

exports.Request = Request;
/**
 * Expose the agent function
 */

exports.agent = require('./agent');
/**
 * Noop.
 */

function noop() {}
/**
 * Expose `Response`.
 */


exports.Response = Response;
/**
 * Define "form" mime type.
 */

mime.define({
  'application/x-www-form-urlencoded': ['form', 'urlencoded', 'form-data']
}, true);
/**
 * Protocol map.
 */

exports.protocols = {
  'http:': http,
  'https:': https,
  'http2:': http2
};
/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

exports.serialize = {
  'application/x-www-form-urlencoded': qs.stringify,
  'application/json': safeStringify
};
/**
 * Default parsers.
 *
 *     superagent.parse['application/xml'] = function(res, fn){
 *       fn(null, res);
 *     };
 *
 */

exports.parse = require('./parsers');
/**
 * Default buffering map. Can be used to set certain
 * response types to buffer/not buffer.
 *
 *     superagent.buffer['application/xml'] = true;
 */

exports.buffer = {};
/**
 * Initialize internal header tracking properties on a request instance.
 *
 * @param {Object} req the instance
 * @api private
 */

function _initHeaders(request_) {
  request_._header = {// coerces header names to lowercase
  };
  request_.header = {// preserves header name case
  };
}
/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String|Object} url
 * @api public
 */


function Request(method, url) {
  Stream.call(this);
  if (typeof url !== 'string') url = format(url);
  this._enableHttp2 = Boolean(process.env.HTTP2_TEST); // internal only

  this._agent = false;
  this._formData = null;
  this.method = method;
  this.url = url;

  _initHeaders(this);

  this.writable = true;
  this._redirects = 0;
  this.redirects(method === 'HEAD' ? 0 : 5);
  this.cookies = '';
  this.qs = {};
  this._query = [];
  this.qsRaw = this._query; // Unused, for backwards compatibility only

  this._redirectList = [];
  this._streamRequest = false;
  this._lookup = undefined;
  this.once('end', this.clearTimeout.bind(this));
}
/**
 * Inherit from `Stream` (which inherits from `EventEmitter`).
 * Mixin `RequestBase`.
 */


util.inherits(Request, Stream);
mixin(Request.prototype, RequestBase.prototype);
/**
 * Enable or Disable http2.
 *
 * Enable http2.
 *
 * ``` js
 * request.get('http://localhost/')
 *   .http2()
 *   .end(callback);
 *
 * request.get('http://localhost/')
 *   .http2(true)
 *   .end(callback);
 * ```
 *
 * Disable http2.
 *
 * ``` js
 * request = request.http2();
 * request.get('http://localhost/')
 *   .http2(false)
 *   .end(callback);
 * ```
 *
 * @param {Boolean} enable
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.http2 = function (bool) {
  if (exports.protocols['http2:'] === undefined) {
    throw new Error('superagent: this version of Node.js does not support http2');
  }

  this._enableHttp2 = bool === undefined ? true : bool;
  return this;
};
/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('http://localhost/upload')
 *   .attach('field', Buffer.from('<b>Hello world</b>'), 'hello.html')
 *   .end(callback);
 * ```
 *
 * A filename may also be used:
 *
 * ``` js
 * request.post('http://localhost/upload')
 *   .attach('files', 'image.jpg')
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {String|fs.ReadStream|Buffer} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.attach = function (field, file, options) {
  if (file) {
    if (this._data) {
      throw new Error("superagent can't mix .send() and .attach()");
    }

    let o = options || {};

    if (typeof options === 'string') {
      o = {
        filename: options
      };
    }

    if (typeof file === 'string') {
      if (!o.filename) o.filename = file;
      debug('creating `fs.ReadStream` instance for file: %s', file);
      file = fs.createReadStream(file);
      file.on('error', error => {
        const formData = this._getFormData();

        formData.emit('error', error);
      });
    } else if (!o.filename && file.path) {
      o.filename = file.path;
    }

    this._getFormData().append(field, file, o);
  }

  return this;
};

Request.prototype._getFormData = function () {
  if (!this._formData) {
    this._formData = new FormData();

    this._formData.on('error', error => {
      debug('FormData error', error);

      if (this.called) {
        // The request has already finished and the callback was called.
        // Silently ignore the error.
        return;
      }

      this.callback(error);
      this.abort();
    });
  }

  return this._formData;
};
/**
 * Gets/sets the `Agent` to use for this HTTP request. The default (if this
 * function is not called) is to opt out of connection pooling (`agent: false`).
 *
 * @param {http.Agent} agent
 * @return {http.Agent}
 * @api public
 */


Request.prototype.agent = function (agent) {
  if (arguments.length === 0) return this._agent;
  this._agent = agent;
  return this;
};
/**
 * Gets/sets the `lookup` function to use custom DNS resolver.
 *
 * @param {Function} lookup
 * @return {Function}
 * @api public
 */


Request.prototype.lookup = function (lookup) {
  if (arguments.length === 0) return this._lookup;
  this._lookup = lookup;
  return this;
};
/**
 * Set _Content-Type_ response header passed through `mime.getType()`.
 *
 * Examples:
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('json')
 *        .send(jsonstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/json')
 *        .send(jsonstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.type = function (type) {
  return this.set('Content-Type', type.includes('/') ? type : mime.getType(type));
};
/**
 * Set _Accept_ response header passed through `mime.getType()`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.accept = function (type) {
  return this.set('Accept', type.includes('/') ? type : mime.getType(type));
};
/**
 * Add query-string `val`.
 *
 * Examples:
 *
 *   request.get('/shoes')
 *     .query('size=10')
 *     .query({ color: 'blue' })
 *
 * @param {Object|String} val
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.query = function (value) {
  if (typeof value === 'string') {
    this._query.push(value);
  } else {
    Object.assign(this.qs, value);
  }

  return this;
};
/**
 * Write raw `data` / `encoding` to the socket.
 *
 * @param {Buffer|String} data
 * @param {String} encoding
 * @return {Boolean}
 * @api public
 */


Request.prototype.write = function (data, encoding) {
  const request_ = this.request();

  if (!this._streamRequest) {
    this._streamRequest = true;
  }

  return request_.write(data, encoding);
};
/**
 * Pipe the request body to `stream`.
 *
 * @param {Stream} stream
 * @param {Object} options
 * @return {Stream}
 * @api public
 */


Request.prototype.pipe = function (stream, options) {
  this.piped = true; // HACK...

  this.buffer(false);
  this.end();
  return this._pipeContinue(stream, options);
};

Request.prototype._pipeContinue = function (stream, options) {
  this.req.once('response', res => {
    // redirect
    if (isRedirect(res.statusCode) && this._redirects++ !== this._maxRedirects) {
      return this._redirect(res) === this ? this._pipeContinue(stream, options) : undefined;
    }

    this.res = res;

    this._emitResponse();

    if (this._aborted) return;

    if (this._shouldUnzip(res)) {
      const unzipObject = zlib.createUnzip();
      unzipObject.on('error', error => {
        if (error && error.code === 'Z_BUF_ERROR') {
          // unexpected end of file is ignored by browsers and curl
          stream.emit('end');
          return;
        }

        stream.emit('error', error);
      });
      res.pipe(unzipObject).pipe(stream, options);
    } else {
      res.pipe(stream, options);
    }

    res.once('end', () => {
      this.emit('end');
    });
  });
  return stream;
};
/**
 * Enable / disable buffering.
 *
 * @return {Boolean} [val]
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.buffer = function (value) {
  this._buffer = value !== false;
  return this;
};
/**
 * Redirect to `url
 *
 * @param {IncomingMessage} res
 * @return {Request} for chaining
 * @api private
 */


Request.prototype._redirect = function (res) {
  let url = res.headers.location;

  if (!url) {
    return this.callback(new Error('No location header for redirect'), res);
  }

  debug('redirect %s -> %s', this.url, url); // location

  url = resolve(this.url, url); // ensure the response is being consumed
  // this is required for Node v0.10+

  res.resume();
  let headers = this.req.getHeaders ? this.req.getHeaders() : this.req._headers;
  const changesOrigin = parse(url).host !== parse(this.url).host; // implementation of 302 following defacto standard

  if (res.statusCode === 301 || res.statusCode === 302) {
    // strip Content-* related fields
    // in case of POST etc
    headers = utils.cleanHeader(headers, changesOrigin); // force GET

    this.method = this.method === 'HEAD' ? 'HEAD' : 'GET'; // clear data

    this._data = null;
  } // 303 is always GET


  if (res.statusCode === 303) {
    // strip Content-* related fields
    // in case of POST etc
    headers = utils.cleanHeader(headers, changesOrigin); // force method

    this.method = 'GET'; // clear data

    this._data = null;
  } // 307 preserves method
  // 308 preserves method


  delete headers.host;
  delete this.req;
  delete this._formData; // remove all add header except User-Agent

  _initHeaders(this); // redirect


  this._endCalled = false;
  this.url = url;
  this.qs = {};
  this._query.length = 0;
  this.set(headers);
  this.emit('redirect', res);

  this._redirectList.push(this.url);

  this.end(this._callback);
  return this;
};
/**
 * Set Authorization field value with `user` and `pass`.
 *
 * Examples:
 *
 *   .auth('tobi', 'learnboost')
 *   .auth('tobi:learnboost')
 *   .auth('tobi')
 *   .auth(accessToken, { type: 'bearer' })
 *
 * @param {String} user
 * @param {String} [pass]
 * @param {Object} [options] options with authorization type 'basic' or 'bearer' ('basic' is default)
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.auth = function (user, pass, options) {
  if (arguments.length === 1) pass = '';

  if (typeof pass === 'object' && pass !== null) {
    // pass is optional and can be replaced with options
    options = pass;
    pass = '';
  }

  if (!options) {
    options = {
      type: 'basic'
    };
  }

  const encoder = string => Buffer.from(string).toString('base64');

  return this._auth(user, pass, options, encoder);
};
/**
 * Set the certificate authority option for https request.
 *
 * @param {Buffer | Array} cert
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.ca = function (cert) {
  this._ca = cert;
  return this;
};
/**
 * Set the client certificate key option for https request.
 *
 * @param {Buffer | String} cert
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.key = function (cert) {
  this._key = cert;
  return this;
};
/**
 * Set the key, certificate, and CA certs of the client in PFX or PKCS12 format.
 *
 * @param {Buffer | String} cert
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.pfx = function (cert) {
  if (typeof cert === 'object' && !Buffer.isBuffer(cert)) {
    this._pfx = cert.pfx;
    this._passphrase = cert.passphrase;
  } else {
    this._pfx = cert;
  }

  return this;
};
/**
 * Set the client certificate option for https request.
 *
 * @param {Buffer | String} cert
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.cert = function (cert) {
  this._cert = cert;
  return this;
};
/**
 * Do not reject expired or invalid TLS certs.
 * sets `rejectUnauthorized=true`. Be warned that this allows MITM attacks.
 *
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.disableTLSCerts = function () {
  this._disableTLSCerts = true;
  return this;
};
/**
 * Return an http[s] request.
 *
 * @return {OutgoingMessage}
 * @api private
 */
// eslint-disable-next-line complexity


Request.prototype.request = function () {
  if (this.req) return this.req;
  const options = {};

  try {
    const query = qs.stringify(this.qs, {
      indices: false,
      strictNullHandling: true
    });

    if (query) {
      this.qs = {};

      this._query.push(query);
    }

    this._finalizeQueryString();
  } catch (err) {
    return this.emit('error', err);
  }

  let url = this.url;
  const retries = this._retries; // Capture backticks as-is from the final query string built above.
  // Note: this'll only find backticks entered in req.query(String)
  // calls, because qs.stringify unconditionally encodes backticks.

  let queryStringBackticks;

  if (url.includes('`')) {
    const queryStartIndex = url.indexOf('?');

    if (queryStartIndex !== -1) {
      const queryString = url.slice(queryStartIndex + 1);
      queryStringBackticks = queryString.match(/`|%60/g);
    }
  } // default to http://


  if (url.indexOf('http') !== 0) url = "http://".concat(url);
  url = parse(url); // See https://github.com/visionmedia/superagent/issues/1367

  if (queryStringBackticks) {
    let i = 0;
    url.query = url.query.replace(/%60/g, () => queryStringBackticks[i++]);
    url.search = "?".concat(url.query);
    url.path = url.pathname + url.search;
  } // support unix sockets


  if (/^https?\+unix:/.test(url.protocol) === true) {
    // get the protocol
    url.protocol = "".concat(url.protocol.split('+')[0], ":"); // get the socket, path

    const unixParts = url.path.match(/^([^/]+)(.+)$/);
    options.socketPath = unixParts[1].replace(/%2F/g, '/');
    url.path = unixParts[2];
  } // Override IP address of a hostname


  if (this._connectOverride) {
    const _url = url,
          hostname = _url.hostname;
    const match = hostname in this._connectOverride ? this._connectOverride[hostname] : this._connectOverride['*'];

    if (match) {
      // backup the real host
      if (!this._header.host) {
        this.set('host', url.host);
      }

      let newHost;
      let newPort;

      if (typeof match === 'object') {
        newHost = match.host;
        newPort = match.port;
      } else {
        newHost = match;
        newPort = url.port;
      } // wrap [ipv6]


      url.host = /:/.test(newHost) ? "[".concat(newHost, "]") : newHost;

      if (newPort) {
        url.host += ":".concat(newPort);
        url.port = newPort;
      }

      url.hostname = newHost;
    }
  } // options


  options.method = this.method;
  options.port = url.port;
  options.path = url.path;
  options.host = url.hostname;
  options.ca = this._ca;
  options.key = this._key;
  options.pfx = this._pfx;
  options.cert = this._cert;
  options.passphrase = this._passphrase;
  options.agent = this._agent;
  options.lookup = this._lookup;
  options.rejectUnauthorized = typeof this._disableTLSCerts === 'boolean' ? !this._disableTLSCerts : process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0'; // Allows request.get('https://1.2.3.4/').set('Host', 'example.com')

  if (this._header.host) {
    options.servername = this._header.host.replace(/:\d+$/, '');
  }

  if (this._trustLocalhost && /^(?:localhost|127\.0\.0\.\d+|(0*:)+:0*1)$/.test(url.hostname)) {
    options.rejectUnauthorized = false;
  } // initiate request


  const module_ = this._enableHttp2 ? exports.protocols['http2:'].setProtocol(url.protocol) : exports.protocols[url.protocol]; // request

  this.req = module_.request(options);
  const req = this.req; // set tcp no delay

  req.setNoDelay(true);

  if (options.method !== 'HEAD') {
    req.setHeader('Accept-Encoding', 'gzip, deflate');
  }

  this.protocol = url.protocol;
  this.host = url.host; // expose events

  req.once('drain', () => {
    this.emit('drain');
  });
  req.on('error', error => {
    // flag abortion here for out timeouts
    // because node will emit a faux-error "socket hang up"
    // when request is aborted before a connection is made
    if (this._aborted) return; // if not the same, we are in the **old** (cancelled) request,
    // so need to continue (same as for above)

    if (this._retries !== retries) return; // if we've received a response then we don't want to let
    // an error in the request blow up the response

    if (this.response) return;
    this.callback(error);
  }); // auth

  if (url.auth) {
    const auth = url.auth.split(':');
    this.auth(auth[0], auth[1]);
  }

  if (this.username && this.password) {
    this.auth(this.username, this.password);
  }

  for (const key in this.header) {
    if (hasOwn(this.header, key)) req.setHeader(key, this.header[key]);
  } // add cookies


  if (this.cookies) {
    if (hasOwn(this._header, 'cookie')) {
      // merge
      const temporaryJar = new CookieJar.CookieJar();
      temporaryJar.setCookies(this._header.cookie.split(';'));
      temporaryJar.setCookies(this.cookies.split(';'));
      req.setHeader('Cookie', temporaryJar.getCookies(CookieJar.CookieAccessInfo.All).toValueString());
    } else {
      req.setHeader('Cookie', this.cookies);
    }
  }

  return req;
};
/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */


Request.prototype.callback = function (error, res) {
  if (this._shouldRetry(error, res)) {
    return this._retry();
  } // Avoid the error which is emitted from 'socket hang up' to cause the fn undefined error on JS runtime.


  const fn = this._callback || noop;
  this.clearTimeout();
  if (this.called) return console.warn('superagent: double callback bug');
  this.called = true;

  if (!error) {
    try {
      if (!this._isResponseOK(res)) {
        let message = 'Unsuccessful HTTP response';

        if (res) {
          message = http.STATUS_CODES[res.status] || message;
        }

        error = new Error(message);
        error.status = res ? res.status : undefined;
      }
    } catch (err) {
      error = err;
      error.status = error.status || (res ? res.status : undefined);
    }
  } // It's important that the callback is called outside try/catch
  // to avoid double callback


  if (!error) {
    return fn(null, res);
  }

  error.response = res;
  if (this._maxRetries) error.retries = this._retries - 1; // only emit error event if there is a listener
  // otherwise we assume the callback to `.end()` will get the error

  if (error && this.listeners('error').length > 0) {
    this.emit('error', error);
  }

  fn(error, res);
};
/**
 * Check if `obj` is a host object,
 *
 * @param {Object} obj host object
 * @return {Boolean} is a host object
 * @api private
 */


Request.prototype._isHost = function (object) {
  return Buffer.isBuffer(object) || object instanceof Stream || object instanceof FormData;
};
/**
 * Initiate request, invoking callback `fn(err, res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */


Request.prototype._emitResponse = function (body, files) {
  const response = new Response(this);
  this.response = response;
  response.redirects = this._redirectList;

  if (undefined !== body) {
    response.body = body;
  }

  response.files = files;

  if (this._endCalled) {
    response.pipe = function () {
      throw new Error("end() has already been called, so it's too late to start piping");
    };
  }

  this.emit('response', response);
  return response;
};

Request.prototype.end = function (fn) {
  this.request();
  debug('%s %s', this.method, this.url);

  if (this._endCalled) {
    throw new Error('.end() was called twice. This is not supported in superagent');
  }

  this._endCalled = true; // store callback

  this._callback = fn || noop;

  this._end();
};

Request.prototype._end = function () {
  if (this._aborted) return this.callback(new Error('The request has been aborted even before .end() was called'));
  let data = this._data;
  const req = this.req;
  const method = this.method;

  this._setTimeouts(); // body


  if (method !== 'HEAD' && !req._headerSent) {
    // serialize stuff
    if (typeof data !== 'string') {
      let contentType = req.getHeader('Content-Type'); // Parse out just the content type from the header (ignore the charset)

      if (contentType) contentType = contentType.split(';')[0];
      let serialize = this._serializer || exports.serialize[contentType];

      if (!serialize && isJSON(contentType)) {
        serialize = exports.serialize['application/json'];
      }

      if (serialize) data = serialize(data);
    } // content-length


    if (data && !req.getHeader('Content-Length')) {
      req.setHeader('Content-Length', Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data));
    }
  } // response
  // eslint-disable-next-line complexity


  req.once('response', res => {
    debug('%s %s -> %s', this.method, this.url, res.statusCode);

    if (this._responseTimeoutTimer) {
      clearTimeout(this._responseTimeoutTimer);
    }

    if (this.piped) {
      return;
    }

    const max = this._maxRedirects;
    const mime = utils.type(res.headers['content-type'] || '') || 'text/plain';
    let type = mime.split('/')[0];
    if (type) type = type.toLowerCase().trim();
    const multipart = type === 'multipart';
    const redirect = isRedirect(res.statusCode);
    const responseType = this._responseType;
    this.res = res; // redirect

    if (redirect && this._redirects++ !== max) {
      return this._redirect(res);
    }

    if (this.method === 'HEAD') {
      this.emit('end');
      this.callback(null, this._emitResponse());
      return;
    } // zlib support


    if (this._shouldUnzip(res)) {
      unzip(req, res);
    }

    let buffer = this._buffer;

    if (buffer === undefined && mime in exports.buffer) {
      buffer = Boolean(exports.buffer[mime]);
    }

    let parser = this._parser;

    if (undefined === buffer && parser) {
      console.warn("A custom superagent parser has been set, but buffering strategy for the parser hasn't been configured. Call `req.buffer(true or false)` or set `superagent.buffer[mime] = true or false`");
      buffer = true;
    }

    if (!parser) {
      if (responseType) {
        parser = exports.parse.image; // It's actually a generic Buffer

        buffer = true;
      } else if (multipart) {
        const form = formidable();
        parser = form.parse.bind(form);
        buffer = true;
      } else if (isBinary(mime)) {
        parser = exports.parse.image;
        buffer = true; // For backwards-compatibility buffering default is ad-hoc MIME-dependent
      } else if (exports.parse[mime]) {
        parser = exports.parse[mime];
      } else if (type === 'text') {
        parser = exports.parse.text;
        buffer = buffer !== false; // everyone wants their own white-labeled json
      } else if (isJSON(mime)) {
        parser = exports.parse['application/json'];
        buffer = buffer !== false;
      } else if (buffer) {
        parser = exports.parse.text;
      } else if (undefined === buffer) {
        parser = exports.parse.image; // It's actually a generic Buffer

        buffer = true;
      }
    } // by default only buffer text/*, json and messed up thing from hell


    if (undefined === buffer && isText(mime) || isJSON(mime)) {
      buffer = true;
    }

    this._resBuffered = buffer;
    let parserHandlesEnd = false;

    if (buffer) {
      // Protectiona against zip bombs and other nuisance
      let responseBytesLeft = this._maxResponseSize || 200000000;
      res.on('data', buf => {
        responseBytesLeft -= buf.byteLength || buf.length > 0 ? buf.length : 0;

        if (responseBytesLeft < 0) {
          // This will propagate through error event
          const error = new Error('Maximum response size reached');
          error.code = 'ETOOLARGE'; // Parsers aren't required to observe error event,
          // so would incorrectly report success

          parserHandlesEnd = false; // Will not emit error event

          res.destroy(error); // so we do callback now

          this.callback(error, null);
        }
      });
    }

    if (parser) {
      try {
        // Unbuffered parsers are supposed to emit response early,
        // which is weird BTW, because response.body won't be there.
        parserHandlesEnd = buffer;
        parser(res, (error, object, files) => {
          if (this.timedout) {
            // Timeout has already handled all callbacks
            return;
          } // Intentional (non-timeout) abort is supposed to preserve partial response,
          // even if it doesn't parse.


          if (error && !this._aborted) {
            return this.callback(error);
          }

          if (parserHandlesEnd) {
            this.emit('end');
            this.callback(null, this._emitResponse(object, files));
          }
        });
      } catch (err) {
        this.callback(err);
        return;
      }
    }

    this.res = res; // unbuffered

    if (!buffer) {
      debug('unbuffered %s %s', this.method, this.url);
      this.callback(null, this._emitResponse());
      if (multipart) return; // allow multipart to handle end event

      res.once('end', () => {
        debug('end %s %s', this.method, this.url);
        this.emit('end');
      });
      return;
    } // terminating events


    res.once('error', error => {
      parserHandlesEnd = false;
      this.callback(error, null);
    });
    if (!parserHandlesEnd) res.once('end', () => {
      debug('end %s %s', this.method, this.url); // TODO: unless buffering emit earlier to stream

      this.emit('end');
      this.callback(null, this._emitResponse());
    });
  });
  this.emit('request', this);

  const getProgressMonitor = () => {
    const lengthComputable = true;
    const total = req.getHeader('Content-Length');
    let loaded = 0;
    const progress = new Stream.Transform();

    progress._transform = (chunk, encoding, callback) => {
      loaded += chunk.length;
      this.emit('progress', {
        direction: 'upload',
        lengthComputable,
        loaded,
        total
      });
      callback(null, chunk);
    };

    return progress;
  };

  const bufferToChunks = buffer => {
    const chunkSize = 16 * 1024; // default highWaterMark value

    const chunking = new Stream.Readable();
    const totalLength = buffer.length;
    const remainder = totalLength % chunkSize;
    const cutoff = totalLength - remainder;

    for (let i = 0; i < cutoff; i += chunkSize) {
      const chunk = buffer.slice(i, i + chunkSize);
      chunking.push(chunk);
    }

    if (remainder > 0) {
      const remainderBuffer = buffer.slice(-remainder);
      chunking.push(remainderBuffer);
    }

    chunking.push(null); // no more data

    return chunking;
  }; // if a FormData instance got created, then we send that as the request body


  const formData = this._formData;

  if (formData) {
    // set headers
    const headers = formData.getHeaders();

    for (const i in headers) {
      if (hasOwn(headers, i)) {
        debug('setting FormData header: "%s: %s"', i, headers[i]);
        req.setHeader(i, headers[i]);
      }
    } // attempt to get "Content-Length" header


    formData.getLength((error, length) => {
      // TODO: Add chunked encoding when no length (if err)
      if (error) debug('formData.getLength had error', error, length);
      debug('got FormData Content-Length: %s', length);

      if (typeof length === 'number') {
        req.setHeader('Content-Length', length);
      }

      formData.pipe(getProgressMonitor()).pipe(req);
    });
  } else if (Buffer.isBuffer(data)) {
    bufferToChunks(data).pipe(getProgressMonitor()).pipe(req);
  } else {
    req.end(data);
  }
}; // Check whether response has a non-0-sized gzip-encoded body


Request.prototype._shouldUnzip = res => {
  if (res.statusCode === 204 || res.statusCode === 304) {
    // These aren't supposed to have any body
    return false;
  } // header content is a string, and distinction between 0 and no information is crucial


  if (res.headers['content-length'] === '0') {
    // We know that the body is empty (unfortunately, this check does not cover chunked encoding)
    return false;
  } // console.log(res);


  return /^\s*(?:deflate|gzip)\s*$/.test(res.headers['content-encoding']);
};
/**
 * Overrides DNS for selected hostnames. Takes object mapping hostnames to IP addresses.
 *
 * When making a request to a URL with a hostname exactly matching a key in the object,
 * use the given IP address to connect, instead of using DNS to resolve the hostname.
 *
 * A special host `*` matches every hostname (keep redirects in mind!)
 *
 *      request.connect({
 *        'test.example.com': '127.0.0.1',
 *        'ipv6.example.com': '::1',
 *      })
 */


Request.prototype.connect = function (connectOverride) {
  if (typeof connectOverride === 'string') {
    this._connectOverride = {
      '*': connectOverride
    };
  } else if (typeof connectOverride === 'object') {
    this._connectOverride = connectOverride;
  } else {
    this._connectOverride = undefined;
  }

  return this;
};

Request.prototype.trustLocalhost = function (toggle) {
  this._trustLocalhost = toggle === undefined ? true : toggle;
  return this;
}; // generate HTTP verb methods


if (!methods.includes('del')) {
  // create a copy so we don't cause conflicts with
  // other packages using the methods package and
  // npm 3.x
  methods = [...methods];
  methods.push('del');
}

var _iterator = _createForOfIteratorHelper(methods),
    _step;

try {
  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    let method = _step.value;
    const name = method;
    method = method === 'del' ? 'delete' : method;
    method = method.toUpperCase();

    request[name] = (url, data, fn) => {
      const request_ = request(method, url);

      if (typeof data === 'function') {
        fn = data;
        data = null;
      }

      if (data) {
        if (method === 'GET' || method === 'HEAD') {
          request_.query(data);
        } else {
          request_.send(data);
        }
      }

      if (fn) request_.end(fn);
      return request_;
    };
  }
  /**
   * Check if `mime` is text and should be buffered.
   *
   * @param {String} mime
   * @return {Boolean}
   * @api public
   */

} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
}

function isText(mime) {
  const parts = mime.split('/');
  let type = parts[0];
  if (type) type = type.toLowerCase().trim();
  let subtype = parts[1];
  if (subtype) subtype = subtype.toLowerCase().trim();
  return type === 'text' || subtype === 'x-www-form-urlencoded';
} // This is not a catchall, but a start. It might be useful
// in the long run to have file that includes all binary
// content types from https://www.iana.org/assignments/media-types/media-types.xhtml


function isBinary(mime) {
  let _mime$split = mime.split('/'),
      _mime$split2 = _slicedToArray(_mime$split, 2),
      registry = _mime$split2[0],
      name = _mime$split2[1];

  if (registry) registry = registry.toLowerCase().trim();
  if (name) name = name.toLowerCase().trim();
  return ['audio', 'font', 'image', 'video'].includes(registry) || ['gz', 'gzip'].includes(name);
}
/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */


function isJSON(mime) {
  // should match /json or +json
  // but not /json-seq
  return /[/+]json($|[^-\w])/i.test(mime);
}
/**
 * Check if we should follow the redirect `code`.
 *
 * @param {Number} code
 * @return {Boolean}
 * @api private
 */


function isRedirect(code) {
  return [301, 302, 303, 305, 307, 308].includes(code);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyZXF1aXJlIiwicGFyc2UiLCJmb3JtYXQiLCJyZXNvbHZlIiwiU3RyZWFtIiwiaHR0cHMiLCJodHRwIiwiZnMiLCJ6bGliIiwidXRpbCIsInFzIiwibWltZSIsIm1ldGhvZHMiLCJGb3JtRGF0YSIsImZvcm1pZGFibGUiLCJkZWJ1ZyIsIkNvb2tpZUphciIsInNlbXZlckd0ZSIsInNhZmVTdHJpbmdpZnkiLCJ1dGlscyIsIlJlcXVlc3RCYXNlIiwidW56aXAiLCJSZXNwb25zZSIsIm1peGluIiwiaGFzT3duIiwiaHR0cDIiLCJwcm9jZXNzIiwidmVyc2lvbiIsInJlcXVlc3QiLCJtZXRob2QiLCJ1cmwiLCJleHBvcnRzIiwiUmVxdWVzdCIsImVuZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsIm1vZHVsZSIsImFnZW50Iiwibm9vcCIsImRlZmluZSIsInByb3RvY29scyIsInNlcmlhbGl6ZSIsInN0cmluZ2lmeSIsImJ1ZmZlciIsIl9pbml0SGVhZGVycyIsInJlcXVlc3RfIiwiX2hlYWRlciIsImhlYWRlciIsImNhbGwiLCJfZW5hYmxlSHR0cDIiLCJCb29sZWFuIiwiZW52IiwiSFRUUDJfVEVTVCIsIl9hZ2VudCIsIl9mb3JtRGF0YSIsIndyaXRhYmxlIiwiX3JlZGlyZWN0cyIsInJlZGlyZWN0cyIsImNvb2tpZXMiLCJfcXVlcnkiLCJxc1JhdyIsIl9yZWRpcmVjdExpc3QiLCJfc3RyZWFtUmVxdWVzdCIsIl9sb29rdXAiLCJ1bmRlZmluZWQiLCJvbmNlIiwiY2xlYXJUaW1lb3V0IiwiYmluZCIsImluaGVyaXRzIiwicHJvdG90eXBlIiwiYm9vbCIsIkVycm9yIiwiYXR0YWNoIiwiZmllbGQiLCJmaWxlIiwib3B0aW9ucyIsIl9kYXRhIiwibyIsImZpbGVuYW1lIiwiY3JlYXRlUmVhZFN0cmVhbSIsIm9uIiwiZXJyb3IiLCJmb3JtRGF0YSIsIl9nZXRGb3JtRGF0YSIsImVtaXQiLCJwYXRoIiwiYXBwZW5kIiwiY2FsbGVkIiwiY2FsbGJhY2siLCJhYm9ydCIsImxvb2t1cCIsInR5cGUiLCJzZXQiLCJpbmNsdWRlcyIsImdldFR5cGUiLCJhY2NlcHQiLCJxdWVyeSIsInZhbHVlIiwicHVzaCIsIk9iamVjdCIsImFzc2lnbiIsIndyaXRlIiwiZGF0YSIsImVuY29kaW5nIiwicGlwZSIsInN0cmVhbSIsInBpcGVkIiwiX3BpcGVDb250aW51ZSIsInJlcSIsInJlcyIsImlzUmVkaXJlY3QiLCJzdGF0dXNDb2RlIiwiX21heFJlZGlyZWN0cyIsIl9yZWRpcmVjdCIsIl9lbWl0UmVzcG9uc2UiLCJfYWJvcnRlZCIsIl9zaG91bGRVbnppcCIsInVuemlwT2JqZWN0IiwiY3JlYXRlVW56aXAiLCJjb2RlIiwiX2J1ZmZlciIsImhlYWRlcnMiLCJsb2NhdGlvbiIsInJlc3VtZSIsImdldEhlYWRlcnMiLCJfaGVhZGVycyIsImNoYW5nZXNPcmlnaW4iLCJob3N0IiwiY2xlYW5IZWFkZXIiLCJfZW5kQ2FsbGVkIiwiX2NhbGxiYWNrIiwiYXV0aCIsInVzZXIiLCJwYXNzIiwiZW5jb2RlciIsInN0cmluZyIsIkJ1ZmZlciIsImZyb20iLCJ0b1N0cmluZyIsIl9hdXRoIiwiY2EiLCJjZXJ0IiwiX2NhIiwia2V5IiwiX2tleSIsInBmeCIsImlzQnVmZmVyIiwiX3BmeCIsIl9wYXNzcGhyYXNlIiwicGFzc3BocmFzZSIsIl9jZXJ0IiwiZGlzYWJsZVRMU0NlcnRzIiwiX2Rpc2FibGVUTFNDZXJ0cyIsImluZGljZXMiLCJzdHJpY3ROdWxsSGFuZGxpbmciLCJfZmluYWxpemVRdWVyeVN0cmluZyIsImVyciIsInJldHJpZXMiLCJfcmV0cmllcyIsInF1ZXJ5U3RyaW5nQmFja3RpY2tzIiwicXVlcnlTdGFydEluZGV4IiwiaW5kZXhPZiIsInF1ZXJ5U3RyaW5nIiwic2xpY2UiLCJtYXRjaCIsImkiLCJyZXBsYWNlIiwic2VhcmNoIiwicGF0aG5hbWUiLCJ0ZXN0IiwicHJvdG9jb2wiLCJzcGxpdCIsInVuaXhQYXJ0cyIsInNvY2tldFBhdGgiLCJfY29ubmVjdE92ZXJyaWRlIiwiaG9zdG5hbWUiLCJuZXdIb3N0IiwibmV3UG9ydCIsInBvcnQiLCJyZWplY3RVbmF1dGhvcml6ZWQiLCJOT0RFX1RMU19SRUpFQ1RfVU5BVVRIT1JJWkVEIiwic2VydmVybmFtZSIsIl90cnVzdExvY2FsaG9zdCIsIm1vZHVsZV8iLCJzZXRQcm90b2NvbCIsInNldE5vRGVsYXkiLCJzZXRIZWFkZXIiLCJyZXNwb25zZSIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJ0ZW1wb3JhcnlKYXIiLCJzZXRDb29raWVzIiwiY29va2llIiwiZ2V0Q29va2llcyIsIkNvb2tpZUFjY2Vzc0luZm8iLCJBbGwiLCJ0b1ZhbHVlU3RyaW5nIiwiX3Nob3VsZFJldHJ5IiwiX3JldHJ5IiwiZm4iLCJjb25zb2xlIiwid2FybiIsIl9pc1Jlc3BvbnNlT0siLCJtZXNzYWdlIiwiU1RBVFVTX0NPREVTIiwic3RhdHVzIiwiX21heFJldHJpZXMiLCJsaXN0ZW5lcnMiLCJfaXNIb3N0Iiwib2JqZWN0IiwiYm9keSIsImZpbGVzIiwiX2VuZCIsIl9zZXRUaW1lb3V0cyIsIl9oZWFkZXJTZW50IiwiY29udGVudFR5cGUiLCJnZXRIZWFkZXIiLCJfc2VyaWFsaXplciIsImlzSlNPTiIsImJ5dGVMZW5ndGgiLCJfcmVzcG9uc2VUaW1lb3V0VGltZXIiLCJtYXgiLCJ0b0xvd2VyQ2FzZSIsInRyaW0iLCJtdWx0aXBhcnQiLCJyZWRpcmVjdCIsInJlc3BvbnNlVHlwZSIsIl9yZXNwb25zZVR5cGUiLCJwYXJzZXIiLCJfcGFyc2VyIiwiaW1hZ2UiLCJmb3JtIiwiaXNCaW5hcnkiLCJ0ZXh0IiwiaXNUZXh0IiwiX3Jlc0J1ZmZlcmVkIiwicGFyc2VySGFuZGxlc0VuZCIsInJlc3BvbnNlQnl0ZXNMZWZ0IiwiX21heFJlc3BvbnNlU2l6ZSIsImJ1ZiIsImRlc3Ryb3kiLCJ0aW1lZG91dCIsImdldFByb2dyZXNzTW9uaXRvciIsImxlbmd0aENvbXB1dGFibGUiLCJ0b3RhbCIsImxvYWRlZCIsInByb2dyZXNzIiwiVHJhbnNmb3JtIiwiX3RyYW5zZm9ybSIsImNodW5rIiwiZGlyZWN0aW9uIiwiYnVmZmVyVG9DaHVua3MiLCJjaHVua1NpemUiLCJjaHVua2luZyIsIlJlYWRhYmxlIiwidG90YWxMZW5ndGgiLCJyZW1haW5kZXIiLCJjdXRvZmYiLCJyZW1haW5kZXJCdWZmZXIiLCJnZXRMZW5ndGgiLCJjb25uZWN0IiwiY29ubmVjdE92ZXJyaWRlIiwidHJ1c3RMb2NhbGhvc3QiLCJ0b2dnbGUiLCJuYW1lIiwidG9VcHBlckNhc2UiLCJzZW5kIiwicGFydHMiLCJzdWJ0eXBlIiwicmVnaXN0cnkiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvbm9kZS9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vZGUvbm8tZGVwcmVjYXRlZC1hcGlcbmNvbnN0IHsgcGFyc2UsIGZvcm1hdCwgcmVzb2x2ZSB9ID0gcmVxdWlyZSgndXJsJyk7XG5jb25zdCBTdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKTtcbmNvbnN0IGh0dHBzID0gcmVxdWlyZSgnaHR0cHMnKTtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdodHRwJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCB6bGliID0gcmVxdWlyZSgnemxpYicpO1xuY29uc3QgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcbmNvbnN0IHFzID0gcmVxdWlyZSgncXMnKTtcbmNvbnN0IG1pbWUgPSByZXF1aXJlKCdtaW1lJyk7XG5sZXQgbWV0aG9kcyA9IHJlcXVpcmUoJ21ldGhvZHMnKTtcbmNvbnN0IEZvcm1EYXRhID0gcmVxdWlyZSgnZm9ybS1kYXRhJyk7XG5jb25zdCBmb3JtaWRhYmxlID0gcmVxdWlyZSgnZm9ybWlkYWJsZScpO1xuY29uc3QgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdzdXBlcmFnZW50Jyk7XG5jb25zdCBDb29raWVKYXIgPSByZXF1aXJlKCdjb29raWVqYXInKTtcbmNvbnN0IHNlbXZlckd0ZSA9IHJlcXVpcmUoJ3NlbXZlci9mdW5jdGlvbnMvZ3RlJyk7XG5jb25zdCBzYWZlU3RyaW5naWZ5ID0gcmVxdWlyZSgnZmFzdC1zYWZlLXN0cmluZ2lmeScpO1xuXG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5jb25zdCBSZXF1ZXN0QmFzZSA9IHJlcXVpcmUoJy4uL3JlcXVlc3QtYmFzZScpO1xuY29uc3QgeyB1bnppcCB9ID0gcmVxdWlyZSgnLi91bnppcCcpO1xuY29uc3QgUmVzcG9uc2UgPSByZXF1aXJlKCcuL3Jlc3BvbnNlJyk7XG5cbmNvbnN0IHsgbWl4aW4sIGhhc093biB9ID0gdXRpbHM7XG5cbmxldCBodHRwMjtcblxuaWYgKHNlbXZlckd0ZShwcm9jZXNzLnZlcnNpb24sICd2MTAuMTAuMCcpKSBodHRwMiA9IHJlcXVpcmUoJy4vaHR0cDJ3cmFwcGVyJyk7XG5cbmZ1bmN0aW9uIHJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgLy8gY2FsbGJhY2tcbiAgaWYgKHR5cGVvZiB1cmwgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gbmV3IGV4cG9ydHMuUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBuZXcgZXhwb3J0cy5SZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBleHBvcnRzLlJlcXVlc3QobWV0aG9kLCB1cmwpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVlc3Q7XG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHM7XG5cbi8qKlxuICogRXhwb3NlIGBSZXF1ZXN0YC5cbiAqL1xuXG5leHBvcnRzLlJlcXVlc3QgPSBSZXF1ZXN0O1xuXG4vKipcbiAqIEV4cG9zZSB0aGUgYWdlbnQgZnVuY3Rpb25cbiAqL1xuXG5leHBvcnRzLmFnZW50ID0gcmVxdWlyZSgnLi9hZ2VudCcpO1xuXG4vKipcbiAqIE5vb3AuXG4gKi9cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZWAuXG4gKi9cblxuZXhwb3J0cy5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIERlZmluZSBcImZvcm1cIiBtaW1lIHR5cGUuXG4gKi9cblxubWltZS5kZWZpbmUoXG4gIHtcbiAgICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogWydmb3JtJywgJ3VybGVuY29kZWQnLCAnZm9ybS1kYXRhJ11cbiAgfSxcbiAgdHJ1ZVxuKTtcblxuLyoqXG4gKiBQcm90b2NvbCBtYXAuXG4gKi9cblxuZXhwb3J0cy5wcm90b2NvbHMgPSB7XG4gICdodHRwOic6IGh0dHAsXG4gICdodHRwczonOiBodHRwcyxcbiAgJ2h0dHAyOic6IGh0dHAyXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxuZXhwb3J0cy5zZXJpYWxpemUgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBxcy5zdHJpbmdpZnksXG4gICdhcHBsaWNhdGlvbi9qc29uJzogc2FmZVN0cmluZ2lmeVxufTtcblxuLyoqXG4gKiBEZWZhdWx0IHBhcnNlcnMuXG4gKlxuICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24ocmVzLCBmbil7XG4gKiAgICAgICBmbihudWxsLCByZXMpO1xuICogICAgIH07XG4gKlxuICovXG5cbmV4cG9ydHMucGFyc2UgPSByZXF1aXJlKCcuL3BhcnNlcnMnKTtcblxuLyoqXG4gKiBEZWZhdWx0IGJ1ZmZlcmluZyBtYXAuIENhbiBiZSB1c2VkIHRvIHNldCBjZXJ0YWluXG4gKiByZXNwb25zZSB0eXBlcyB0byBidWZmZXIvbm90IGJ1ZmZlci5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC5idWZmZXJbJ2FwcGxpY2F0aW9uL3htbCddID0gdHJ1ZTtcbiAqL1xuZXhwb3J0cy5idWZmZXIgPSB7fTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGludGVybmFsIGhlYWRlciB0cmFja2luZyBwcm9wZXJ0aWVzIG9uIGEgcmVxdWVzdCBpbnN0YW5jZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcmVxIHRoZSBpbnN0YW5jZVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9pbml0SGVhZGVycyhyZXF1ZXN0Xykge1xuICByZXF1ZXN0Xy5faGVhZGVyID0ge1xuICAgIC8vIGNvZXJjZXMgaGVhZGVyIG5hbWVzIHRvIGxvd2VyY2FzZVxuICB9O1xuICByZXF1ZXN0Xy5oZWFkZXIgPSB7XG4gICAgLy8gcHJlc2VydmVzIGhlYWRlciBuYW1lIGNhc2VcbiAgfTtcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0YCB3aXRoIHRoZSBnaXZlbiBgbWV0aG9kYCBhbmQgYHVybGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSB1cmxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdChtZXRob2QsIHVybCkge1xuICBTdHJlYW0uY2FsbCh0aGlzKTtcbiAgaWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSB1cmwgPSBmb3JtYXQodXJsKTtcbiAgdGhpcy5fZW5hYmxlSHR0cDIgPSBCb29sZWFuKHByb2Nlc3MuZW52LkhUVFAyX1RFU1QpOyAvLyBpbnRlcm5hbCBvbmx5XG4gIHRoaXMuX2FnZW50ID0gZmFsc2U7XG4gIHRoaXMuX2Zvcm1EYXRhID0gbnVsbDtcbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMudXJsID0gdXJsO1xuICBfaW5pdEhlYWRlcnModGhpcyk7XG4gIHRoaXMud3JpdGFibGUgPSB0cnVlO1xuICB0aGlzLl9yZWRpcmVjdHMgPSAwO1xuICB0aGlzLnJlZGlyZWN0cyhtZXRob2QgPT09ICdIRUFEJyA/IDAgOiA1KTtcbiAgdGhpcy5jb29raWVzID0gJyc7XG4gIHRoaXMucXMgPSB7fTtcbiAgdGhpcy5fcXVlcnkgPSBbXTtcbiAgdGhpcy5xc1JhdyA9IHRoaXMuX3F1ZXJ5OyAvLyBVbnVzZWQsIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSBvbmx5XG4gIHRoaXMuX3JlZGlyZWN0TGlzdCA9IFtdO1xuICB0aGlzLl9zdHJlYW1SZXF1ZXN0ID0gZmFsc2U7XG4gIHRoaXMuX2xvb2t1cCA9IHVuZGVmaW5lZDtcbiAgdGhpcy5vbmNlKCdlbmQnLCB0aGlzLmNsZWFyVGltZW91dC5iaW5kKHRoaXMpKTtcbn1cblxuLyoqXG4gKiBJbmhlcml0IGZyb20gYFN0cmVhbWAgKHdoaWNoIGluaGVyaXRzIGZyb20gYEV2ZW50RW1pdHRlcmApLlxuICogTWl4aW4gYFJlcXVlc3RCYXNlYC5cbiAqL1xudXRpbC5pbmhlcml0cyhSZXF1ZXN0LCBTdHJlYW0pO1xuXG5taXhpbihSZXF1ZXN0LnByb3RvdHlwZSwgUmVxdWVzdEJhc2UucHJvdG90eXBlKTtcblxuLyoqXG4gKiBFbmFibGUgb3IgRGlzYWJsZSBodHRwMi5cbiAqXG4gKiBFbmFibGUgaHR0cDIuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LmdldCgnaHR0cDovL2xvY2FsaG9zdC8nKVxuICogICAuaHR0cDIoKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiByZXF1ZXN0LmdldCgnaHR0cDovL2xvY2FsaG9zdC8nKVxuICogICAuaHR0cDIodHJ1ZSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBEaXNhYmxlIGh0dHAyLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdCA9IHJlcXVlc3QuaHR0cDIoKTtcbiAqIHJlcXVlc3QuZ2V0KCdodHRwOi8vbG9jYWxob3N0LycpXG4gKiAgIC5odHRwMihmYWxzZSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGVuYWJsZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmh0dHAyID0gZnVuY3Rpb24gKGJvb2wpIHtcbiAgaWYgKGV4cG9ydHMucHJvdG9jb2xzWydodHRwMjonXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ3N1cGVyYWdlbnQ6IHRoaXMgdmVyc2lvbiBvZiBOb2RlLmpzIGRvZXMgbm90IHN1cHBvcnQgaHR0cDInXG4gICAgKTtcbiAgfVxuXG4gIHRoaXMuX2VuYWJsZUh0dHAyID0gYm9vbCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGJvb2w7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBRdWV1ZSB0aGUgZ2l2ZW4gYGZpbGVgIGFzIGFuIGF0dGFjaG1lbnQgdG8gdGhlIHNwZWNpZmllZCBgZmllbGRgLFxuICogd2l0aCBvcHRpb25hbCBgb3B0aW9uc2AgKG9yIGZpbGVuYW1lKS5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnaHR0cDovL2xvY2FsaG9zdC91cGxvYWQnKVxuICogICAuYXR0YWNoKCdmaWVsZCcsIEJ1ZmZlci5mcm9tKCc8Yj5IZWxsbyB3b3JsZDwvYj4nKSwgJ2hlbGxvLmh0bWwnKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEEgZmlsZW5hbWUgbWF5IGFsc28gYmUgdXNlZDpcbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnaHR0cDovL2xvY2FsaG9zdC91cGxvYWQnKVxuICogICAuYXR0YWNoKCdmaWxlcycsICdpbWFnZS5qcGcnKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtTdHJpbmd8ZnMuUmVhZFN0cmVhbXxCdWZmZXJ9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uIChmaWVsZCwgZmlsZSwgb3B0aW9ucykge1xuICBpZiAoZmlsZSkge1xuICAgIGlmICh0aGlzLl9kYXRhKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzdXBlcmFnZW50IGNhbid0IG1peCAuc2VuZCgpIGFuZCAuYXR0YWNoKClcIik7XG4gICAgfVxuXG4gICAgbGV0IG8gPSBvcHRpb25zIHx8IHt9O1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG8gPSB7IGZpbGVuYW1lOiBvcHRpb25zIH07XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBmaWxlID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKCFvLmZpbGVuYW1lKSBvLmZpbGVuYW1lID0gZmlsZTtcbiAgICAgIGRlYnVnKCdjcmVhdGluZyBgZnMuUmVhZFN0cmVhbWAgaW5zdGFuY2UgZm9yIGZpbGU6ICVzJywgZmlsZSk7XG4gICAgICBmaWxlID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlKTtcbiAgICAgIGZpbGUub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICAgIGNvbnN0IGZvcm1EYXRhID0gdGhpcy5fZ2V0Rm9ybURhdGEoKTtcbiAgICAgICAgZm9ybURhdGEuZW1pdCgnZXJyb3InLCBlcnJvcik7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKCFvLmZpbGVuYW1lICYmIGZpbGUucGF0aCkge1xuICAgICAgby5maWxlbmFtZSA9IGZpbGUucGF0aDtcbiAgICB9XG5cbiAgICB0aGlzLl9nZXRGb3JtRGF0YSgpLmFwcGVuZChmaWVsZCwgZmlsZSwgbyk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLl9nZXRGb3JtRGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkge1xuICAgIHRoaXMuX2Zvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgdGhpcy5fZm9ybURhdGEub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICBkZWJ1ZygnRm9ybURhdGEgZXJyb3InLCBlcnJvcik7XG4gICAgICBpZiAodGhpcy5jYWxsZWQpIHtcbiAgICAgICAgLy8gVGhlIHJlcXVlc3QgaGFzIGFscmVhZHkgZmluaXNoZWQgYW5kIHRoZSBjYWxsYmFjayB3YXMgY2FsbGVkLlxuICAgICAgICAvLyBTaWxlbnRseSBpZ25vcmUgdGhlIGVycm9yLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2FsbGJhY2soZXJyb3IpO1xuICAgICAgdGhpcy5hYm9ydCgpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuX2Zvcm1EYXRhO1xufTtcblxuLyoqXG4gKiBHZXRzL3NldHMgdGhlIGBBZ2VudGAgdG8gdXNlIGZvciB0aGlzIEhUVFAgcmVxdWVzdC4gVGhlIGRlZmF1bHQgKGlmIHRoaXNcbiAqIGZ1bmN0aW9uIGlzIG5vdCBjYWxsZWQpIGlzIHRvIG9wdCBvdXQgb2YgY29ubmVjdGlvbiBwb29saW5nIChgYWdlbnQ6IGZhbHNlYCkuXG4gKlxuICogQHBhcmFtIHtodHRwLkFnZW50fSBhZ2VudFxuICogQHJldHVybiB7aHR0cC5BZ2VudH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWdlbnQgPSBmdW5jdGlvbiAoYWdlbnQpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHJldHVybiB0aGlzLl9hZ2VudDtcbiAgdGhpcy5fYWdlbnQgPSBhZ2VudDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEdldHMvc2V0cyB0aGUgYGxvb2t1cGAgZnVuY3Rpb24gdG8gdXNlIGN1c3RvbSBETlMgcmVzb2x2ZXIuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbG9va3VwXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUubG9va3VwID0gZnVuY3Rpb24gKGxvb2t1cCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXMuX2xvb2t1cDtcbiAgdGhpcy5fbG9va3VwID0gbG9va3VwO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IF9Db250ZW50LVR5cGVfIHJlc3BvbnNlIGhlYWRlciBwYXNzZWQgdGhyb3VnaCBgbWltZS5nZXRUeXBlKClgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgneG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCdqc29uJylcbiAqICAgICAgICAuc2VuZChqc29uc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLnNlbmQoanNvbnN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnR5cGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICByZXR1cm4gdGhpcy5zZXQoXG4gICAgJ0NvbnRlbnQtVHlwZScsXG4gICAgdHlwZS5pbmNsdWRlcygnLycpID8gdHlwZSA6IG1pbWUuZ2V0VHlwZSh0eXBlKVxuICApO1xufTtcblxuLyoqXG4gKiBTZXQgX0FjY2VwdF8gcmVzcG9uc2UgaGVhZGVyIHBhc3NlZCB0aHJvdWdoIGBtaW1lLmdldFR5cGUoKWAuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLmpzb24gPSAnYXBwbGljYXRpb24vanNvbic7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdqc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhY2NlcHRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodHlwZSkge1xuICByZXR1cm4gdGhpcy5zZXQoJ0FjY2VwdCcsIHR5cGUuaW5jbHVkZXMoJy8nKSA/IHR5cGUgOiBtaW1lLmdldFR5cGUodHlwZSkpO1xufTtcblxuLyoqXG4gKiBBZGQgcXVlcnktc3RyaW5nIGB2YWxgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgcmVxdWVzdC5nZXQoJy9zaG9lcycpXG4gKiAgICAgLnF1ZXJ5KCdzaXplPTEwJylcbiAqICAgICAucXVlcnkoeyBjb2xvcjogJ2JsdWUnIH0pXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5xdWVyeSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHRoaXMuX3F1ZXJ5LnB1c2godmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5xcywgdmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdyaXRlIHJhdyBgZGF0YWAgLyBgZW5jb2RpbmdgIHRvIHRoZSBzb2NrZXQuXG4gKlxuICogQHBhcmFtIHtCdWZmZXJ8U3RyaW5nfSBkYXRhXG4gKiBAcGFyYW0ge1N0cmluZ30gZW5jb2RpbmdcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKGRhdGEsIGVuY29kaW5nKSB7XG4gIGNvbnN0IHJlcXVlc3RfID0gdGhpcy5yZXF1ZXN0KCk7XG4gIGlmICghdGhpcy5fc3RyZWFtUmVxdWVzdCkge1xuICAgIHRoaXMuX3N0cmVhbVJlcXVlc3QgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHJlcXVlc3RfLndyaXRlKGRhdGEsIGVuY29kaW5nKTtcbn07XG5cbi8qKlxuICogUGlwZSB0aGUgcmVxdWVzdCBib2R5IHRvIGBzdHJlYW1gLlxuICpcbiAqIEBwYXJhbSB7U3RyZWFtfSBzdHJlYW1cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtTdHJlYW19XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbiAoc3RyZWFtLCBvcHRpb25zKSB7XG4gIHRoaXMucGlwZWQgPSB0cnVlOyAvLyBIQUNLLi4uXG4gIHRoaXMuYnVmZmVyKGZhbHNlKTtcbiAgdGhpcy5lbmQoKTtcbiAgcmV0dXJuIHRoaXMuX3BpcGVDb250aW51ZShzdHJlYW0sIG9wdGlvbnMpO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuX3BpcGVDb250aW51ZSA9IGZ1bmN0aW9uIChzdHJlYW0sIG9wdGlvbnMpIHtcbiAgdGhpcy5yZXEub25jZSgncmVzcG9uc2UnLCAocmVzKSA9PiB7XG4gICAgLy8gcmVkaXJlY3RcbiAgICBpZiAoXG4gICAgICBpc1JlZGlyZWN0KHJlcy5zdGF0dXNDb2RlKSAmJlxuICAgICAgdGhpcy5fcmVkaXJlY3RzKysgIT09IHRoaXMuX21heFJlZGlyZWN0c1xuICAgICkge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlZGlyZWN0KHJlcykgPT09IHRoaXNcbiAgICAgICAgPyB0aGlzLl9waXBlQ29udGludWUoc3RyZWFtLCBvcHRpb25zKVxuICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB0aGlzLnJlcyA9IHJlcztcbiAgICB0aGlzLl9lbWl0UmVzcG9uc2UoKTtcbiAgICBpZiAodGhpcy5fYWJvcnRlZCkgcmV0dXJuO1xuXG4gICAgaWYgKHRoaXMuX3Nob3VsZFVuemlwKHJlcykpIHtcbiAgICAgIGNvbnN0IHVuemlwT2JqZWN0ID0gemxpYi5jcmVhdGVVbnppcCgpO1xuICAgICAgdW56aXBPYmplY3Qub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICAgIGlmIChlcnJvciAmJiBlcnJvci5jb2RlID09PSAnWl9CVUZfRVJST1InKSB7XG4gICAgICAgICAgLy8gdW5leHBlY3RlZCBlbmQgb2YgZmlsZSBpcyBpZ25vcmVkIGJ5IGJyb3dzZXJzIGFuZCBjdXJsXG4gICAgICAgICAgc3RyZWFtLmVtaXQoJ2VuZCcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVycm9yKTtcbiAgICAgIH0pO1xuICAgICAgcmVzLnBpcGUodW56aXBPYmplY3QpLnBpcGUoc3RyZWFtLCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzLnBpcGUoc3RyZWFtLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICByZXMub25jZSgnZW5kJywgKCkgPT4ge1xuICAgICAgdGhpcy5lbWl0KCdlbmQnKTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBzdHJlYW07XG59O1xuXG4vKipcbiAqIEVuYWJsZSAvIGRpc2FibGUgYnVmZmVyaW5nLlxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFt2YWxdXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYnVmZmVyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHRoaXMuX2J1ZmZlciA9IHZhbHVlICE9PSBmYWxzZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlZGlyZWN0IHRvIGB1cmxcbiAqXG4gKiBAcGFyYW0ge0luY29taW5nTWVzc2FnZX0gcmVzXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLl9yZWRpcmVjdCA9IGZ1bmN0aW9uIChyZXMpIHtcbiAgbGV0IHVybCA9IHJlcy5oZWFkZXJzLmxvY2F0aW9uO1xuICBpZiAoIXVybCkge1xuICAgIHJldHVybiB0aGlzLmNhbGxiYWNrKG5ldyBFcnJvcignTm8gbG9jYXRpb24gaGVhZGVyIGZvciByZWRpcmVjdCcpLCByZXMpO1xuICB9XG5cbiAgZGVidWcoJ3JlZGlyZWN0ICVzIC0+ICVzJywgdGhpcy51cmwsIHVybCk7XG5cbiAgLy8gbG9jYXRpb25cbiAgdXJsID0gcmVzb2x2ZSh0aGlzLnVybCwgdXJsKTtcblxuICAvLyBlbnN1cmUgdGhlIHJlc3BvbnNlIGlzIGJlaW5nIGNvbnN1bWVkXG4gIC8vIHRoaXMgaXMgcmVxdWlyZWQgZm9yIE5vZGUgdjAuMTArXG4gIHJlcy5yZXN1bWUoKTtcblxuICBsZXQgaGVhZGVycyA9IHRoaXMucmVxLmdldEhlYWRlcnMgPyB0aGlzLnJlcS5nZXRIZWFkZXJzKCkgOiB0aGlzLnJlcS5faGVhZGVycztcblxuICBjb25zdCBjaGFuZ2VzT3JpZ2luID0gcGFyc2UodXJsKS5ob3N0ICE9PSBwYXJzZSh0aGlzLnVybCkuaG9zdDtcblxuICAvLyBpbXBsZW1lbnRhdGlvbiBvZiAzMDIgZm9sbG93aW5nIGRlZmFjdG8gc3RhbmRhcmRcbiAgaWYgKHJlcy5zdGF0dXNDb2RlID09PSAzMDEgfHwgcmVzLnN0YXR1c0NvZGUgPT09IDMwMikge1xuICAgIC8vIHN0cmlwIENvbnRlbnQtKiByZWxhdGVkIGZpZWxkc1xuICAgIC8vIGluIGNhc2Ugb2YgUE9TVCBldGNcbiAgICBoZWFkZXJzID0gdXRpbHMuY2xlYW5IZWFkZXIoaGVhZGVycywgY2hhbmdlc09yaWdpbik7XG5cbiAgICAvLyBmb3JjZSBHRVRcbiAgICB0aGlzLm1ldGhvZCA9IHRoaXMubWV0aG9kID09PSAnSEVBRCcgPyAnSEVBRCcgOiAnR0VUJztcblxuICAgIC8vIGNsZWFyIGRhdGFcbiAgICB0aGlzLl9kYXRhID0gbnVsbDtcbiAgfVxuXG4gIC8vIDMwMyBpcyBhbHdheXMgR0VUXG4gIGlmIChyZXMuc3RhdHVzQ29kZSA9PT0gMzAzKSB7XG4gICAgLy8gc3RyaXAgQ29udGVudC0qIHJlbGF0ZWQgZmllbGRzXG4gICAgLy8gaW4gY2FzZSBvZiBQT1NUIGV0Y1xuICAgIGhlYWRlcnMgPSB1dGlscy5jbGVhbkhlYWRlcihoZWFkZXJzLCBjaGFuZ2VzT3JpZ2luKTtcblxuICAgIC8vIGZvcmNlIG1ldGhvZFxuICAgIHRoaXMubWV0aG9kID0gJ0dFVCc7XG5cbiAgICAvLyBjbGVhciBkYXRhXG4gICAgdGhpcy5fZGF0YSA9IG51bGw7XG4gIH1cblxuICAvLyAzMDcgcHJlc2VydmVzIG1ldGhvZFxuICAvLyAzMDggcHJlc2VydmVzIG1ldGhvZFxuICBkZWxldGUgaGVhZGVycy5ob3N0O1xuXG4gIGRlbGV0ZSB0aGlzLnJlcTtcbiAgZGVsZXRlIHRoaXMuX2Zvcm1EYXRhO1xuXG4gIC8vIHJlbW92ZSBhbGwgYWRkIGhlYWRlciBleGNlcHQgVXNlci1BZ2VudFxuICBfaW5pdEhlYWRlcnModGhpcyk7XG5cbiAgLy8gcmVkaXJlY3RcbiAgdGhpcy5fZW5kQ2FsbGVkID0gZmFsc2U7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLnFzID0ge307XG4gIHRoaXMuX3F1ZXJ5Lmxlbmd0aCA9IDA7XG4gIHRoaXMuc2V0KGhlYWRlcnMpO1xuICB0aGlzLmVtaXQoJ3JlZGlyZWN0JywgcmVzKTtcbiAgdGhpcy5fcmVkaXJlY3RMaXN0LnB1c2godGhpcy51cmwpO1xuICB0aGlzLmVuZCh0aGlzLl9jYWxsYmFjayk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgLmF1dGgoJ3RvYmknLCAnbGVhcm5ib29zdCcpXG4gKiAgIC5hdXRoKCd0b2JpOmxlYXJuYm9vc3QnKVxuICogICAuYXV0aCgndG9iaScpXG4gKiAgIC5hdXRoKGFjY2Vzc1Rva2VuLCB7IHR5cGU6ICdiZWFyZXInIH0pXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBbcGFzc11cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gb3B0aW9ucyB3aXRoIGF1dGhvcml6YXRpb24gdHlwZSAnYmFzaWMnIG9yICdiZWFyZXInICgnYmFzaWMnIGlzIGRlZmF1bHQpXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uICh1c2VyLCBwYXNzLCBvcHRpb25zKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSBwYXNzID0gJyc7XG4gIGlmICh0eXBlb2YgcGFzcyA9PT0gJ29iamVjdCcgJiYgcGFzcyAhPT0gbnVsbCkge1xuICAgIC8vIHBhc3MgaXMgb3B0aW9uYWwgYW5kIGNhbiBiZSByZXBsYWNlZCB3aXRoIG9wdGlvbnNcbiAgICBvcHRpb25zID0gcGFzcztcbiAgICBwYXNzID0gJyc7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0geyB0eXBlOiAnYmFzaWMnIH07XG4gIH1cblxuICBjb25zdCBlbmNvZGVyID0gKHN0cmluZykgPT4gQnVmZmVyLmZyb20oc3RyaW5nKS50b1N0cmluZygnYmFzZTY0Jyk7XG5cbiAgcmV0dXJuIHRoaXMuX2F1dGgodXNlciwgcGFzcywgb3B0aW9ucywgZW5jb2Rlcik7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY2VydGlmaWNhdGUgYXV0aG9yaXR5IG9wdGlvbiBmb3IgaHR0cHMgcmVxdWVzdC5cbiAqXG4gKiBAcGFyYW0ge0J1ZmZlciB8IEFycmF5fSBjZXJ0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2EgPSBmdW5jdGlvbiAoY2VydCkge1xuICB0aGlzLl9jYSA9IGNlcnQ7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNsaWVudCBjZXJ0aWZpY2F0ZSBrZXkgb3B0aW9uIGZvciBodHRwcyByZXF1ZXN0LlxuICpcbiAqIEBwYXJhbSB7QnVmZmVyIHwgU3RyaW5nfSBjZXJ0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUua2V5ID0gZnVuY3Rpb24gKGNlcnQpIHtcbiAgdGhpcy5fa2V5ID0gY2VydDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCB0aGUga2V5LCBjZXJ0aWZpY2F0ZSwgYW5kIENBIGNlcnRzIG9mIHRoZSBjbGllbnQgaW4gUEZYIG9yIFBLQ1MxMiBmb3JtYXQuXG4gKlxuICogQHBhcmFtIHtCdWZmZXIgfCBTdHJpbmd9IGNlcnRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5wZnggPSBmdW5jdGlvbiAoY2VydCkge1xuICBpZiAodHlwZW9mIGNlcnQgPT09ICdvYmplY3QnICYmICFCdWZmZXIuaXNCdWZmZXIoY2VydCkpIHtcbiAgICB0aGlzLl9wZnggPSBjZXJ0LnBmeDtcbiAgICB0aGlzLl9wYXNzcGhyYXNlID0gY2VydC5wYXNzcGhyYXNlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX3BmeCA9IGNlcnQ7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IHRoZSBjbGllbnQgY2VydGlmaWNhdGUgb3B0aW9uIGZvciBodHRwcyByZXF1ZXN0LlxuICpcbiAqIEBwYXJhbSB7QnVmZmVyIHwgU3RyaW5nfSBjZXJ0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2VydCA9IGZ1bmN0aW9uIChjZXJ0KSB7XG4gIHRoaXMuX2NlcnQgPSBjZXJ0O1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRG8gbm90IHJlamVjdCBleHBpcmVkIG9yIGludmFsaWQgVExTIGNlcnRzLlxuICogc2V0cyBgcmVqZWN0VW5hdXRob3JpemVkPXRydWVgLiBCZSB3YXJuZWQgdGhhdCB0aGlzIGFsbG93cyBNSVRNIGF0dGFja3MuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmRpc2FibGVUTFNDZXJ0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5fZGlzYWJsZVRMU0NlcnRzID0gdHJ1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBodHRwW3NdIHJlcXVlc3QuXG4gKlxuICogQHJldHVybiB7T3V0Z29pbmdNZXNzYWdlfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbXBsZXhpdHlcblJlcXVlc3QucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLnJlcSkgcmV0dXJuIHRoaXMucmVxO1xuXG4gIGNvbnN0IG9wdGlvbnMgPSB7fTtcblxuICB0cnkge1xuICAgIGNvbnN0IHF1ZXJ5ID0gcXMuc3RyaW5naWZ5KHRoaXMucXMsIHtcbiAgICAgIGluZGljZXM6IGZhbHNlLFxuICAgICAgc3RyaWN0TnVsbEhhbmRsaW5nOiB0cnVlXG4gICAgfSk7XG4gICAgaWYgKHF1ZXJ5KSB7XG4gICAgICB0aGlzLnFzID0ge307XG4gICAgICB0aGlzLl9xdWVyeS5wdXNoKHF1ZXJ5KTtcbiAgICB9XG5cbiAgICB0aGlzLl9maW5hbGl6ZVF1ZXJ5U3RyaW5nKCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgfVxuXG4gIGxldCB7IHVybCB9ID0gdGhpcztcbiAgY29uc3QgcmV0cmllcyA9IHRoaXMuX3JldHJpZXM7XG5cbiAgLy8gQ2FwdHVyZSBiYWNrdGlja3MgYXMtaXMgZnJvbSB0aGUgZmluYWwgcXVlcnkgc3RyaW5nIGJ1aWx0IGFib3ZlLlxuICAvLyBOb3RlOiB0aGlzJ2xsIG9ubHkgZmluZCBiYWNrdGlja3MgZW50ZXJlZCBpbiByZXEucXVlcnkoU3RyaW5nKVxuICAvLyBjYWxscywgYmVjYXVzZSBxcy5zdHJpbmdpZnkgdW5jb25kaXRpb25hbGx5IGVuY29kZXMgYmFja3RpY2tzLlxuICBsZXQgcXVlcnlTdHJpbmdCYWNrdGlja3M7XG4gIGlmICh1cmwuaW5jbHVkZXMoJ2AnKSkge1xuICAgIGNvbnN0IHF1ZXJ5U3RhcnRJbmRleCA9IHVybC5pbmRleE9mKCc/Jyk7XG5cbiAgICBpZiAocXVlcnlTdGFydEluZGV4ICE9PSAtMSkge1xuICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSB1cmwuc2xpY2UocXVlcnlTdGFydEluZGV4ICsgMSk7XG4gICAgICBxdWVyeVN0cmluZ0JhY2t0aWNrcyA9IHF1ZXJ5U3RyaW5nLm1hdGNoKC9gfCU2MC9nKTtcbiAgICB9XG4gIH1cblxuICAvLyBkZWZhdWx0IHRvIGh0dHA6Ly9cbiAgaWYgKHVybC5pbmRleE9mKCdodHRwJykgIT09IDApIHVybCA9IGBodHRwOi8vJHt1cmx9YDtcbiAgdXJsID0gcGFyc2UodXJsKTtcblxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3Zpc2lvbm1lZGlhL3N1cGVyYWdlbnQvaXNzdWVzLzEzNjdcbiAgaWYgKHF1ZXJ5U3RyaW5nQmFja3RpY2tzKSB7XG4gICAgbGV0IGkgPSAwO1xuICAgIHVybC5xdWVyeSA9IHVybC5xdWVyeS5yZXBsYWNlKC8lNjAvZywgKCkgPT4gcXVlcnlTdHJpbmdCYWNrdGlja3NbaSsrXSk7XG4gICAgdXJsLnNlYXJjaCA9IGA/JHt1cmwucXVlcnl9YDtcbiAgICB1cmwucGF0aCA9IHVybC5wYXRobmFtZSArIHVybC5zZWFyY2g7XG4gIH1cblxuICAvLyBzdXBwb3J0IHVuaXggc29ja2V0c1xuICBpZiAoL15odHRwcz9cXCt1bml4Oi8udGVzdCh1cmwucHJvdG9jb2wpID09PSB0cnVlKSB7XG4gICAgLy8gZ2V0IHRoZSBwcm90b2NvbFxuICAgIHVybC5wcm90b2NvbCA9IGAke3VybC5wcm90b2NvbC5zcGxpdCgnKycpWzBdfTpgO1xuXG4gICAgLy8gZ2V0IHRoZSBzb2NrZXQsIHBhdGhcbiAgICBjb25zdCB1bml4UGFydHMgPSB1cmwucGF0aC5tYXRjaCgvXihbXi9dKykoLispJC8pO1xuICAgIG9wdGlvbnMuc29ja2V0UGF0aCA9IHVuaXhQYXJ0c1sxXS5yZXBsYWNlKC8lMkYvZywgJy8nKTtcbiAgICB1cmwucGF0aCA9IHVuaXhQYXJ0c1syXTtcbiAgfVxuXG4gIC8vIE92ZXJyaWRlIElQIGFkZHJlc3Mgb2YgYSBob3N0bmFtZVxuICBpZiAodGhpcy5fY29ubmVjdE92ZXJyaWRlKSB7XG4gICAgY29uc3QgeyBob3N0bmFtZSB9ID0gdXJsO1xuICAgIGNvbnN0IG1hdGNoID1cbiAgICAgIGhvc3RuYW1lIGluIHRoaXMuX2Nvbm5lY3RPdmVycmlkZVxuICAgICAgICA/IHRoaXMuX2Nvbm5lY3RPdmVycmlkZVtob3N0bmFtZV1cbiAgICAgICAgOiB0aGlzLl9jb25uZWN0T3ZlcnJpZGVbJyonXTtcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIC8vIGJhY2t1cCB0aGUgcmVhbCBob3N0XG4gICAgICBpZiAoIXRoaXMuX2hlYWRlci5ob3N0KSB7XG4gICAgICAgIHRoaXMuc2V0KCdob3N0JywgdXJsLmhvc3QpO1xuICAgICAgfVxuXG4gICAgICBsZXQgbmV3SG9zdDtcbiAgICAgIGxldCBuZXdQb3J0O1xuXG4gICAgICBpZiAodHlwZW9mIG1hdGNoID09PSAnb2JqZWN0Jykge1xuICAgICAgICBuZXdIb3N0ID0gbWF0Y2guaG9zdDtcbiAgICAgICAgbmV3UG9ydCA9IG1hdGNoLnBvcnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdIb3N0ID0gbWF0Y2g7XG4gICAgICAgIG5ld1BvcnQgPSB1cmwucG9ydDtcbiAgICAgIH1cblxuICAgICAgLy8gd3JhcCBbaXB2Nl1cbiAgICAgIHVybC5ob3N0ID0gLzovLnRlc3QobmV3SG9zdCkgPyBgWyR7bmV3SG9zdH1dYCA6IG5ld0hvc3Q7XG4gICAgICBpZiAobmV3UG9ydCkge1xuICAgICAgICB1cmwuaG9zdCArPSBgOiR7bmV3UG9ydH1gO1xuICAgICAgICB1cmwucG9ydCA9IG5ld1BvcnQ7XG4gICAgICB9XG5cbiAgICAgIHVybC5ob3N0bmFtZSA9IG5ld0hvc3Q7XG4gICAgfVxuICB9XG5cbiAgLy8gb3B0aW9uc1xuICBvcHRpb25zLm1ldGhvZCA9IHRoaXMubWV0aG9kO1xuICBvcHRpb25zLnBvcnQgPSB1cmwucG9ydDtcbiAgb3B0aW9ucy5wYXRoID0gdXJsLnBhdGg7XG4gIG9wdGlvbnMuaG9zdCA9IHVybC5ob3N0bmFtZTtcbiAgb3B0aW9ucy5jYSA9IHRoaXMuX2NhO1xuICBvcHRpb25zLmtleSA9IHRoaXMuX2tleTtcbiAgb3B0aW9ucy5wZnggPSB0aGlzLl9wZng7XG4gIG9wdGlvbnMuY2VydCA9IHRoaXMuX2NlcnQ7XG4gIG9wdGlvbnMucGFzc3BocmFzZSA9IHRoaXMuX3Bhc3NwaHJhc2U7XG4gIG9wdGlvbnMuYWdlbnQgPSB0aGlzLl9hZ2VudDtcbiAgb3B0aW9ucy5sb29rdXAgPSB0aGlzLl9sb29rdXA7XG4gIG9wdGlvbnMucmVqZWN0VW5hdXRob3JpemVkID1cbiAgICB0eXBlb2YgdGhpcy5fZGlzYWJsZVRMU0NlcnRzID09PSAnYm9vbGVhbidcbiAgICAgID8gIXRoaXMuX2Rpc2FibGVUTFNDZXJ0c1xuICAgICAgOiBwcm9jZXNzLmVudi5OT0RFX1RMU19SRUpFQ1RfVU5BVVRIT1JJWkVEICE9PSAnMCc7XG5cbiAgLy8gQWxsb3dzIHJlcXVlc3QuZ2V0KCdodHRwczovLzEuMi4zLjQvJykuc2V0KCdIb3N0JywgJ2V4YW1wbGUuY29tJylcbiAgaWYgKHRoaXMuX2hlYWRlci5ob3N0KSB7XG4gICAgb3B0aW9ucy5zZXJ2ZXJuYW1lID0gdGhpcy5faGVhZGVyLmhvc3QucmVwbGFjZSgvOlxcZCskLywgJycpO1xuICB9XG5cbiAgaWYgKFxuICAgIHRoaXMuX3RydXN0TG9jYWxob3N0ICYmXG4gICAgL14oPzpsb2NhbGhvc3R8MTI3XFwuMFxcLjBcXC5cXGQrfCgwKjopKzowKjEpJC8udGVzdCh1cmwuaG9zdG5hbWUpXG4gICkge1xuICAgIG9wdGlvbnMucmVqZWN0VW5hdXRob3JpemVkID0gZmFsc2U7XG4gIH1cblxuICAvLyBpbml0aWF0ZSByZXF1ZXN0XG4gIGNvbnN0IG1vZHVsZV8gPSB0aGlzLl9lbmFibGVIdHRwMlxuICAgID8gZXhwb3J0cy5wcm90b2NvbHNbJ2h0dHAyOiddLnNldFByb3RvY29sKHVybC5wcm90b2NvbClcbiAgICA6IGV4cG9ydHMucHJvdG9jb2xzW3VybC5wcm90b2NvbF07XG5cbiAgLy8gcmVxdWVzdFxuICB0aGlzLnJlcSA9IG1vZHVsZV8ucmVxdWVzdChvcHRpb25zKTtcbiAgY29uc3QgeyByZXEgfSA9IHRoaXM7XG5cbiAgLy8gc2V0IHRjcCBubyBkZWxheVxuICByZXEuc2V0Tm9EZWxheSh0cnVlKTtcblxuICBpZiAob3B0aW9ucy5tZXRob2QgIT09ICdIRUFEJykge1xuICAgIHJlcS5zZXRIZWFkZXIoJ0FjY2VwdC1FbmNvZGluZycsICdnemlwLCBkZWZsYXRlJyk7XG4gIH1cblxuICB0aGlzLnByb3RvY29sID0gdXJsLnByb3RvY29sO1xuICB0aGlzLmhvc3QgPSB1cmwuaG9zdDtcblxuICAvLyBleHBvc2UgZXZlbnRzXG4gIHJlcS5vbmNlKCdkcmFpbicsICgpID0+IHtcbiAgICB0aGlzLmVtaXQoJ2RyYWluJyk7XG4gIH0pO1xuXG4gIHJlcS5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAvLyBmbGFnIGFib3J0aW9uIGhlcmUgZm9yIG91dCB0aW1lb3V0c1xuICAgIC8vIGJlY2F1c2Ugbm9kZSB3aWxsIGVtaXQgYSBmYXV4LWVycm9yIFwic29ja2V0IGhhbmcgdXBcIlxuICAgIC8vIHdoZW4gcmVxdWVzdCBpcyBhYm9ydGVkIGJlZm9yZSBhIGNvbm5lY3Rpb24gaXMgbWFkZVxuICAgIGlmICh0aGlzLl9hYm9ydGVkKSByZXR1cm47XG4gICAgLy8gaWYgbm90IHRoZSBzYW1lLCB3ZSBhcmUgaW4gdGhlICoqb2xkKiogKGNhbmNlbGxlZCkgcmVxdWVzdCxcbiAgICAvLyBzbyBuZWVkIHRvIGNvbnRpbnVlIChzYW1lIGFzIGZvciBhYm92ZSlcbiAgICBpZiAodGhpcy5fcmV0cmllcyAhPT0gcmV0cmllcykgcmV0dXJuO1xuICAgIC8vIGlmIHdlJ3ZlIHJlY2VpdmVkIGEgcmVzcG9uc2UgdGhlbiB3ZSBkb24ndCB3YW50IHRvIGxldFxuICAgIC8vIGFuIGVycm9yIGluIHRoZSByZXF1ZXN0IGJsb3cgdXAgdGhlIHJlc3BvbnNlXG4gICAgaWYgKHRoaXMucmVzcG9uc2UpIHJldHVybjtcbiAgICB0aGlzLmNhbGxiYWNrKGVycm9yKTtcbiAgfSk7XG5cbiAgLy8gYXV0aFxuICBpZiAodXJsLmF1dGgpIHtcbiAgICBjb25zdCBhdXRoID0gdXJsLmF1dGguc3BsaXQoJzonKTtcbiAgICB0aGlzLmF1dGgoYXV0aFswXSwgYXV0aFsxXSk7XG4gIH1cblxuICBpZiAodGhpcy51c2VybmFtZSAmJiB0aGlzLnBhc3N3b3JkKSB7XG4gICAgdGhpcy5hdXRoKHRoaXMudXNlcm5hbWUsIHRoaXMucGFzc3dvcmQpO1xuICB9XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy5oZWFkZXIpIHtcbiAgICBpZiAoaGFzT3duKHRoaXMuaGVhZGVyLCBrZXkpKSByZXEuc2V0SGVhZGVyKGtleSwgdGhpcy5oZWFkZXJba2V5XSk7XG4gIH1cblxuICAvLyBhZGQgY29va2llc1xuICBpZiAodGhpcy5jb29raWVzKSB7XG4gICAgaWYgKGhhc093bih0aGlzLl9oZWFkZXIsICdjb29raWUnKSkge1xuICAgICAgLy8gbWVyZ2VcbiAgICAgIGNvbnN0IHRlbXBvcmFyeUphciA9IG5ldyBDb29raWVKYXIuQ29va2llSmFyKCk7XG4gICAgICB0ZW1wb3JhcnlKYXIuc2V0Q29va2llcyh0aGlzLl9oZWFkZXIuY29va2llLnNwbGl0KCc7JykpO1xuICAgICAgdGVtcG9yYXJ5SmFyLnNldENvb2tpZXModGhpcy5jb29raWVzLnNwbGl0KCc7JykpO1xuICAgICAgcmVxLnNldEhlYWRlcihcbiAgICAgICAgJ0Nvb2tpZScsXG4gICAgICAgIHRlbXBvcmFyeUphci5nZXRDb29raWVzKENvb2tpZUphci5Db29raWVBY2Nlc3NJbmZvLkFsbCkudG9WYWx1ZVN0cmluZygpXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXEuc2V0SGVhZGVyKCdDb29raWUnLCB0aGlzLmNvb2tpZXMpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEludm9rZSB0aGUgY2FsbGJhY2sgd2l0aCBgZXJyYCBhbmQgYHJlc2BcbiAqIGFuZCBoYW5kbGUgYXJpdHkgY2hlY2suXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1Jlc3BvbnNlfSByZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNhbGxiYWNrID0gZnVuY3Rpb24gKGVycm9yLCByZXMpIHtcbiAgaWYgKHRoaXMuX3Nob3VsZFJldHJ5KGVycm9yLCByZXMpKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JldHJ5KCk7XG4gIH1cblxuICAvLyBBdm9pZCB0aGUgZXJyb3Igd2hpY2ggaXMgZW1pdHRlZCBmcm9tICdzb2NrZXQgaGFuZyB1cCcgdG8gY2F1c2UgdGhlIGZuIHVuZGVmaW5lZCBlcnJvciBvbiBKUyBydW50aW1lLlxuICBjb25zdCBmbiA9IHRoaXMuX2NhbGxiYWNrIHx8IG5vb3A7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIGlmICh0aGlzLmNhbGxlZCkgcmV0dXJuIGNvbnNvbGUud2Fybignc3VwZXJhZ2VudDogZG91YmxlIGNhbGxiYWNrIGJ1ZycpO1xuICB0aGlzLmNhbGxlZCA9IHRydWU7XG5cbiAgaWYgKCFlcnJvcikge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXRoaXMuX2lzUmVzcG9uc2VPSyhyZXMpKSB7XG4gICAgICAgIGxldCBtZXNzYWdlID0gJ1Vuc3VjY2Vzc2Z1bCBIVFRQIHJlc3BvbnNlJztcbiAgICAgICAgaWYgKHJlcykge1xuICAgICAgICAgIG1lc3NhZ2UgPSBodHRwLlNUQVRVU19DT0RFU1tyZXMuc3RhdHVzXSB8fCBtZXNzYWdlO1xuICAgICAgICB9XG5cbiAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgICAgIGVycm9yLnN0YXR1cyA9IHJlcyA/IHJlcy5zdGF0dXMgOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBlcnJvciA9IGVycjtcbiAgICAgIGVycm9yLnN0YXR1cyA9IGVycm9yLnN0YXR1cyB8fCAocmVzID8gcmVzLnN0YXR1cyA6IHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgLy8gSXQncyBpbXBvcnRhbnQgdGhhdCB0aGUgY2FsbGJhY2sgaXMgY2FsbGVkIG91dHNpZGUgdHJ5L2NhdGNoXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBjYWxsYmFja1xuICBpZiAoIWVycm9yKSB7XG4gICAgcmV0dXJuIGZuKG51bGwsIHJlcyk7XG4gIH1cblxuICBlcnJvci5yZXNwb25zZSA9IHJlcztcbiAgaWYgKHRoaXMuX21heFJldHJpZXMpIGVycm9yLnJldHJpZXMgPSB0aGlzLl9yZXRyaWVzIC0gMTtcblxuICAvLyBvbmx5IGVtaXQgZXJyb3IgZXZlbnQgaWYgdGhlcmUgaXMgYSBsaXN0ZW5lclxuICAvLyBvdGhlcndpc2Ugd2UgYXNzdW1lIHRoZSBjYWxsYmFjayB0byBgLmVuZCgpYCB3aWxsIGdldCB0aGUgZXJyb3JcbiAgaWYgKGVycm9yICYmIHRoaXMubGlzdGVuZXJzKCdlcnJvcicpLmxlbmd0aCA+IDApIHtcbiAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyb3IpO1xuICB9XG5cbiAgZm4oZXJyb3IsIHJlcyk7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBob3N0IG9iamVjdFxuICogQHJldHVybiB7Qm9vbGVhbn0gaXMgYSBob3N0IG9iamVjdFxuICogQGFwaSBwcml2YXRlXG4gKi9cblJlcXVlc3QucHJvdG90eXBlLl9pc0hvc3QgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gIHJldHVybiAoXG4gICAgQnVmZmVyLmlzQnVmZmVyKG9iamVjdCkgfHxcbiAgICBvYmplY3QgaW5zdGFuY2VvZiBTdHJlYW0gfHxcbiAgICBvYmplY3QgaW5zdGFuY2VvZiBGb3JtRGF0YVxuICApO1xufTtcblxuLyoqXG4gKiBJbml0aWF0ZSByZXF1ZXN0LCBpbnZva2luZyBjYWxsYmFjayBgZm4oZXJyLCByZXMpYFxuICogd2l0aCBhbiBpbnN0YW5jZW9mIGBSZXNwb25zZWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5fZW1pdFJlc3BvbnNlID0gZnVuY3Rpb24gKGJvZHksIGZpbGVzKSB7XG4gIGNvbnN0IHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKHRoaXMpO1xuICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIHJlc3BvbnNlLnJlZGlyZWN0cyA9IHRoaXMuX3JlZGlyZWN0TGlzdDtcbiAgaWYgKHVuZGVmaW5lZCAhPT0gYm9keSkge1xuICAgIHJlc3BvbnNlLmJvZHkgPSBib2R5O1xuICB9XG5cbiAgcmVzcG9uc2UuZmlsZXMgPSBmaWxlcztcbiAgaWYgKHRoaXMuX2VuZENhbGxlZCkge1xuICAgIHJlc3BvbnNlLnBpcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiZW5kKCkgaGFzIGFscmVhZHkgYmVlbiBjYWxsZWQsIHNvIGl0J3MgdG9vIGxhdGUgdG8gc3RhcnQgcGlwaW5nXCJcbiAgICAgICk7XG4gICAgfTtcbiAgfVxuXG4gIHRoaXMuZW1pdCgncmVzcG9uc2UnLCByZXNwb25zZSk7XG4gIHJldHVybiByZXNwb25zZTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uIChmbikge1xuICB0aGlzLnJlcXVlc3QoKTtcbiAgZGVidWcoJyVzICVzJywgdGhpcy5tZXRob2QsIHRoaXMudXJsKTtcblxuICBpZiAodGhpcy5fZW5kQ2FsbGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJy5lbmQoKSB3YXMgY2FsbGVkIHR3aWNlLiBUaGlzIGlzIG5vdCBzdXBwb3J0ZWQgaW4gc3VwZXJhZ2VudCdcbiAgICApO1xuICB9XG5cbiAgdGhpcy5fZW5kQ2FsbGVkID0gdHJ1ZTtcblxuICAvLyBzdG9yZSBjYWxsYmFja1xuICB0aGlzLl9jYWxsYmFjayA9IGZuIHx8IG5vb3A7XG5cbiAgdGhpcy5fZW5kKCk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5fZW5kID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5fYWJvcnRlZClcbiAgICByZXR1cm4gdGhpcy5jYWxsYmFjayhcbiAgICAgIG5ldyBFcnJvcignVGhlIHJlcXVlc3QgaGFzIGJlZW4gYWJvcnRlZCBldmVuIGJlZm9yZSAuZW5kKCkgd2FzIGNhbGxlZCcpXG4gICAgKTtcblxuICBsZXQgZGF0YSA9IHRoaXMuX2RhdGE7XG4gIGNvbnN0IHsgcmVxIH0gPSB0aGlzO1xuICBjb25zdCB7IG1ldGhvZCB9ID0gdGhpcztcblxuICB0aGlzLl9zZXRUaW1lb3V0cygpO1xuXG4gIC8vIGJvZHlcbiAgaWYgKG1ldGhvZCAhPT0gJ0hFQUQnICYmICFyZXEuX2hlYWRlclNlbnQpIHtcbiAgICAvLyBzZXJpYWxpemUgc3R1ZmZcbiAgICBpZiAodHlwZW9mIGRhdGEgIT09ICdzdHJpbmcnKSB7XG4gICAgICBsZXQgY29udGVudFR5cGUgPSByZXEuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcbiAgICAgIC8vIFBhcnNlIG91dCBqdXN0IHRoZSBjb250ZW50IHR5cGUgZnJvbSB0aGUgaGVhZGVyIChpZ25vcmUgdGhlIGNoYXJzZXQpXG4gICAgICBpZiAoY29udGVudFR5cGUpIGNvbnRlbnRUeXBlID0gY29udGVudFR5cGUuc3BsaXQoJzsnKVswXTtcbiAgICAgIGxldCBzZXJpYWxpemUgPSB0aGlzLl9zZXJpYWxpemVyIHx8IGV4cG9ydHMuc2VyaWFsaXplW2NvbnRlbnRUeXBlXTtcbiAgICAgIGlmICghc2VyaWFsaXplICYmIGlzSlNPTihjb250ZW50VHlwZSkpIHtcbiAgICAgICAgc2VyaWFsaXplID0gZXhwb3J0cy5zZXJpYWxpemVbJ2FwcGxpY2F0aW9uL2pzb24nXTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlcmlhbGl6ZSkgZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcbiAgICB9XG5cbiAgICAvLyBjb250ZW50LWxlbmd0aFxuICAgIGlmIChkYXRhICYmICFyZXEuZ2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcpKSB7XG4gICAgICByZXEuc2V0SGVhZGVyKFxuICAgICAgICAnQ29udGVudC1MZW5ndGgnLFxuICAgICAgICBCdWZmZXIuaXNCdWZmZXIoZGF0YSkgPyBkYXRhLmxlbmd0aCA6IEJ1ZmZlci5ieXRlTGVuZ3RoKGRhdGEpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8vIHJlc3BvbnNlXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb21wbGV4aXR5XG4gIHJlcS5vbmNlKCdyZXNwb25zZScsIChyZXMpID0+IHtcbiAgICBkZWJ1ZygnJXMgJXMgLT4gJXMnLCB0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHJlcy5zdGF0dXNDb2RlKTtcblxuICAgIGlmICh0aGlzLl9yZXNwb25zZVRpbWVvdXRUaW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3Jlc3BvbnNlVGltZW91dFRpbWVyKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5waXBlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG1heCA9IHRoaXMuX21heFJlZGlyZWN0cztcbiAgICBjb25zdCBtaW1lID0gdXRpbHMudHlwZShyZXMuaGVhZGVyc1snY29udGVudC10eXBlJ10gfHwgJycpIHx8ICd0ZXh0L3BsYWluJztcbiAgICBsZXQgdHlwZSA9IG1pbWUuc3BsaXQoJy8nKVswXTtcbiAgICBpZiAodHlwZSkgdHlwZSA9IHR5cGUudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgY29uc3QgbXVsdGlwYXJ0ID0gdHlwZSA9PT0gJ211bHRpcGFydCc7XG4gICAgY29uc3QgcmVkaXJlY3QgPSBpc1JlZGlyZWN0KHJlcy5zdGF0dXNDb2RlKTtcbiAgICBjb25zdCByZXNwb25zZVR5cGUgPSB0aGlzLl9yZXNwb25zZVR5cGU7XG5cbiAgICB0aGlzLnJlcyA9IHJlcztcblxuICAgIC8vIHJlZGlyZWN0XG4gICAgaWYgKHJlZGlyZWN0ICYmIHRoaXMuX3JlZGlyZWN0cysrICE9PSBtYXgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZWRpcmVjdChyZXMpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSB7XG4gICAgICB0aGlzLmVtaXQoJ2VuZCcpO1xuICAgICAgdGhpcy5jYWxsYmFjayhudWxsLCB0aGlzLl9lbWl0UmVzcG9uc2UoKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gemxpYiBzdXBwb3J0XG4gICAgaWYgKHRoaXMuX3Nob3VsZFVuemlwKHJlcykpIHtcbiAgICAgIHVuemlwKHJlcSwgcmVzKTtcbiAgICB9XG5cbiAgICBsZXQgYnVmZmVyID0gdGhpcy5fYnVmZmVyO1xuICAgIGlmIChidWZmZXIgPT09IHVuZGVmaW5lZCAmJiBtaW1lIGluIGV4cG9ydHMuYnVmZmVyKSB7XG4gICAgICBidWZmZXIgPSBCb29sZWFuKGV4cG9ydHMuYnVmZmVyW21pbWVdKTtcbiAgICB9XG5cbiAgICBsZXQgcGFyc2VyID0gdGhpcy5fcGFyc2VyO1xuICAgIGlmICh1bmRlZmluZWQgPT09IGJ1ZmZlciAmJiBwYXJzZXIpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgXCJBIGN1c3RvbSBzdXBlcmFnZW50IHBhcnNlciBoYXMgYmVlbiBzZXQsIGJ1dCBidWZmZXJpbmcgc3RyYXRlZ3kgZm9yIHRoZSBwYXJzZXIgaGFzbid0IGJlZW4gY29uZmlndXJlZC4gQ2FsbCBgcmVxLmJ1ZmZlcih0cnVlIG9yIGZhbHNlKWAgb3Igc2V0IGBzdXBlcmFnZW50LmJ1ZmZlclttaW1lXSA9IHRydWUgb3IgZmFsc2VgXCJcbiAgICAgICk7XG4gICAgICBidWZmZXIgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmICghcGFyc2VyKSB7XG4gICAgICBpZiAocmVzcG9uc2VUeXBlKSB7XG4gICAgICAgIHBhcnNlciA9IGV4cG9ydHMucGFyc2UuaW1hZ2U7IC8vIEl0J3MgYWN0dWFsbHkgYSBnZW5lcmljIEJ1ZmZlclxuICAgICAgICBidWZmZXIgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChtdWx0aXBhcnQpIHtcbiAgICAgICAgY29uc3QgZm9ybSA9IGZvcm1pZGFibGUoKTtcbiAgICAgICAgcGFyc2VyID0gZm9ybS5wYXJzZS5iaW5kKGZvcm0pO1xuICAgICAgICBidWZmZXIgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChpc0JpbmFyeShtaW1lKSkge1xuICAgICAgICBwYXJzZXIgPSBleHBvcnRzLnBhcnNlLmltYWdlO1xuICAgICAgICBidWZmZXIgPSB0cnVlOyAvLyBGb3IgYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgYnVmZmVyaW5nIGRlZmF1bHQgaXMgYWQtaG9jIE1JTUUtZGVwZW5kZW50XG4gICAgICB9IGVsc2UgaWYgKGV4cG9ydHMucGFyc2VbbWltZV0pIHtcbiAgICAgICAgcGFyc2VyID0gZXhwb3J0cy5wYXJzZVttaW1lXTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgIHBhcnNlciA9IGV4cG9ydHMucGFyc2UudGV4dDtcbiAgICAgICAgYnVmZmVyID0gYnVmZmVyICE9PSBmYWxzZTtcbiAgICAgICAgLy8gZXZlcnlvbmUgd2FudHMgdGhlaXIgb3duIHdoaXRlLWxhYmVsZWQganNvblxuICAgICAgfSBlbHNlIGlmIChpc0pTT04obWltZSkpIHtcbiAgICAgICAgcGFyc2VyID0gZXhwb3J0cy5wYXJzZVsnYXBwbGljYXRpb24vanNvbiddO1xuICAgICAgICBidWZmZXIgPSBidWZmZXIgIT09IGZhbHNlO1xuICAgICAgfSBlbHNlIGlmIChidWZmZXIpIHtcbiAgICAgICAgcGFyc2VyID0gZXhwb3J0cy5wYXJzZS50ZXh0O1xuICAgICAgfSBlbHNlIGlmICh1bmRlZmluZWQgPT09IGJ1ZmZlcikge1xuICAgICAgICBwYXJzZXIgPSBleHBvcnRzLnBhcnNlLmltYWdlOyAvLyBJdCdzIGFjdHVhbGx5IGEgZ2VuZXJpYyBCdWZmZXJcbiAgICAgICAgYnVmZmVyID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBieSBkZWZhdWx0IG9ubHkgYnVmZmVyIHRleHQvKiwganNvbiBhbmQgbWVzc2VkIHVwIHRoaW5nIGZyb20gaGVsbFxuICAgIGlmICgodW5kZWZpbmVkID09PSBidWZmZXIgJiYgaXNUZXh0KG1pbWUpKSB8fCBpc0pTT04obWltZSkpIHtcbiAgICAgIGJ1ZmZlciA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5fcmVzQnVmZmVyZWQgPSBidWZmZXI7XG4gICAgbGV0IHBhcnNlckhhbmRsZXNFbmQgPSBmYWxzZTtcbiAgICBpZiAoYnVmZmVyKSB7XG4gICAgICAvLyBQcm90ZWN0aW9uYSBhZ2FpbnN0IHppcCBib21icyBhbmQgb3RoZXIgbnVpc2FuY2VcbiAgICAgIGxldCByZXNwb25zZUJ5dGVzTGVmdCA9IHRoaXMuX21heFJlc3BvbnNlU2l6ZSB8fCAyMDBfMDAwXzAwMDtcbiAgICAgIHJlcy5vbignZGF0YScsIChidWYpID0+IHtcbiAgICAgICAgcmVzcG9uc2VCeXRlc0xlZnQgLT0gYnVmLmJ5dGVMZW5ndGggfHwgYnVmLmxlbmd0aCA+IDAgPyBidWYubGVuZ3RoIDogMDtcbiAgICAgICAgaWYgKHJlc3BvbnNlQnl0ZXNMZWZ0IDwgMCkge1xuICAgICAgICAgIC8vIFRoaXMgd2lsbCBwcm9wYWdhdGUgdGhyb3VnaCBlcnJvciBldmVudFxuICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdNYXhpbXVtIHJlc3BvbnNlIHNpemUgcmVhY2hlZCcpO1xuICAgICAgICAgIGVycm9yLmNvZGUgPSAnRVRPT0xBUkdFJztcbiAgICAgICAgICAvLyBQYXJzZXJzIGFyZW4ndCByZXF1aXJlZCB0byBvYnNlcnZlIGVycm9yIGV2ZW50LFxuICAgICAgICAgIC8vIHNvIHdvdWxkIGluY29ycmVjdGx5IHJlcG9ydCBzdWNjZXNzXG4gICAgICAgICAgcGFyc2VySGFuZGxlc0VuZCA9IGZhbHNlO1xuICAgICAgICAgIC8vIFdpbGwgbm90IGVtaXQgZXJyb3IgZXZlbnRcbiAgICAgICAgICByZXMuZGVzdHJveShlcnJvcik7XG4gICAgICAgICAgLy8gc28gd2UgZG8gY2FsbGJhY2sgbm93XG4gICAgICAgICAgdGhpcy5jYWxsYmFjayhlcnJvciwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChwYXJzZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFVuYnVmZmVyZWQgcGFyc2VycyBhcmUgc3VwcG9zZWQgdG8gZW1pdCByZXNwb25zZSBlYXJseSxcbiAgICAgICAgLy8gd2hpY2ggaXMgd2VpcmQgQlRXLCBiZWNhdXNlIHJlc3BvbnNlLmJvZHkgd29uJ3QgYmUgdGhlcmUuXG4gICAgICAgIHBhcnNlckhhbmRsZXNFbmQgPSBidWZmZXI7XG5cbiAgICAgICAgcGFyc2VyKHJlcywgKGVycm9yLCBvYmplY3QsIGZpbGVzKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMudGltZWRvdXQpIHtcbiAgICAgICAgICAgIC8vIFRpbWVvdXQgaGFzIGFscmVhZHkgaGFuZGxlZCBhbGwgY2FsbGJhY2tzXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSW50ZW50aW9uYWwgKG5vbi10aW1lb3V0KSBhYm9ydCBpcyBzdXBwb3NlZCB0byBwcmVzZXJ2ZSBwYXJ0aWFsIHJlc3BvbnNlLFxuICAgICAgICAgIC8vIGV2ZW4gaWYgaXQgZG9lc24ndCBwYXJzZS5cbiAgICAgICAgICBpZiAoZXJyb3IgJiYgIXRoaXMuX2Fib3J0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrKGVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocGFyc2VySGFuZGxlc0VuZCkge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdlbmQnKTtcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2sobnVsbCwgdGhpcy5fZW1pdFJlc3BvbnNlKG9iamVjdCwgZmlsZXMpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2soZXJyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucmVzID0gcmVzO1xuXG4gICAgLy8gdW5idWZmZXJlZFxuICAgIGlmICghYnVmZmVyKSB7XG4gICAgICBkZWJ1ZygndW5idWZmZXJlZCAlcyAlcycsIHRoaXMubWV0aG9kLCB0aGlzLnVybCk7XG4gICAgICB0aGlzLmNhbGxiYWNrKG51bGwsIHRoaXMuX2VtaXRSZXNwb25zZSgpKTtcbiAgICAgIGlmIChtdWx0aXBhcnQpIHJldHVybjsgLy8gYWxsb3cgbXVsdGlwYXJ0IHRvIGhhbmRsZSBlbmQgZXZlbnRcbiAgICAgIHJlcy5vbmNlKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgIGRlYnVnKCdlbmQgJXMgJXMnLCB0aGlzLm1ldGhvZCwgdGhpcy51cmwpO1xuICAgICAgICB0aGlzLmVtaXQoJ2VuZCcpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gdGVybWluYXRpbmcgZXZlbnRzXG4gICAgcmVzLm9uY2UoJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICBwYXJzZXJIYW5kbGVzRW5kID0gZmFsc2U7XG4gICAgICB0aGlzLmNhbGxiYWNrKGVycm9yLCBudWxsKTtcbiAgICB9KTtcbiAgICBpZiAoIXBhcnNlckhhbmRsZXNFbmQpXG4gICAgICByZXMub25jZSgnZW5kJywgKCkgPT4ge1xuICAgICAgICBkZWJ1ZygnZW5kICVzICVzJywgdGhpcy5tZXRob2QsIHRoaXMudXJsKTtcbiAgICAgICAgLy8gVE9ETzogdW5sZXNzIGJ1ZmZlcmluZyBlbWl0IGVhcmxpZXIgdG8gc3RyZWFtXG4gICAgICAgIHRoaXMuZW1pdCgnZW5kJyk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sobnVsbCwgdGhpcy5fZW1pdFJlc3BvbnNlKCkpO1xuICAgICAgfSk7XG4gIH0pO1xuXG4gIHRoaXMuZW1pdCgncmVxdWVzdCcsIHRoaXMpO1xuXG4gIGNvbnN0IGdldFByb2dyZXNzTW9uaXRvciA9ICgpID0+IHtcbiAgICBjb25zdCBsZW5ndGhDb21wdXRhYmxlID0gdHJ1ZTtcbiAgICBjb25zdCB0b3RhbCA9IHJlcS5nZXRIZWFkZXIoJ0NvbnRlbnQtTGVuZ3RoJyk7XG4gICAgbGV0IGxvYWRlZCA9IDA7XG5cbiAgICBjb25zdCBwcm9ncmVzcyA9IG5ldyBTdHJlYW0uVHJhbnNmb3JtKCk7XG4gICAgcHJvZ3Jlc3MuX3RyYW5zZm9ybSA9IChjaHVuaywgZW5jb2RpbmcsIGNhbGxiYWNrKSA9PiB7XG4gICAgICBsb2FkZWQgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgdGhpcy5lbWl0KCdwcm9ncmVzcycsIHtcbiAgICAgICAgZGlyZWN0aW9uOiAndXBsb2FkJyxcbiAgICAgICAgbGVuZ3RoQ29tcHV0YWJsZSxcbiAgICAgICAgbG9hZGVkLFxuICAgICAgICB0b3RhbFxuICAgICAgfSk7XG4gICAgICBjYWxsYmFjayhudWxsLCBjaHVuayk7XG4gICAgfTtcblxuICAgIHJldHVybiBwcm9ncmVzcztcbiAgfTtcblxuICBjb25zdCBidWZmZXJUb0NodW5rcyA9IChidWZmZXIpID0+IHtcbiAgICBjb25zdCBjaHVua1NpemUgPSAxNiAqIDEwMjQ7IC8vIGRlZmF1bHQgaGlnaFdhdGVyTWFyayB2YWx1ZVxuICAgIGNvbnN0IGNodW5raW5nID0gbmV3IFN0cmVhbS5SZWFkYWJsZSgpO1xuICAgIGNvbnN0IHRvdGFsTGVuZ3RoID0gYnVmZmVyLmxlbmd0aDtcbiAgICBjb25zdCByZW1haW5kZXIgPSB0b3RhbExlbmd0aCAlIGNodW5rU2l6ZTtcbiAgICBjb25zdCBjdXRvZmYgPSB0b3RhbExlbmd0aCAtIHJlbWFpbmRlcjtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY3V0b2ZmOyBpICs9IGNodW5rU2l6ZSkge1xuICAgICAgY29uc3QgY2h1bmsgPSBidWZmZXIuc2xpY2UoaSwgaSArIGNodW5rU2l6ZSk7XG4gICAgICBjaHVua2luZy5wdXNoKGNodW5rKTtcbiAgICB9XG5cbiAgICBpZiAocmVtYWluZGVyID4gMCkge1xuICAgICAgY29uc3QgcmVtYWluZGVyQnVmZmVyID0gYnVmZmVyLnNsaWNlKC1yZW1haW5kZXIpO1xuICAgICAgY2h1bmtpbmcucHVzaChyZW1haW5kZXJCdWZmZXIpO1xuICAgIH1cblxuICAgIGNodW5raW5nLnB1c2gobnVsbCk7IC8vIG5vIG1vcmUgZGF0YVxuXG4gICAgcmV0dXJuIGNodW5raW5nO1xuICB9O1xuXG4gIC8vIGlmIGEgRm9ybURhdGEgaW5zdGFuY2UgZ290IGNyZWF0ZWQsIHRoZW4gd2Ugc2VuZCB0aGF0IGFzIHRoZSByZXF1ZXN0IGJvZHlcbiAgY29uc3QgZm9ybURhdGEgPSB0aGlzLl9mb3JtRGF0YTtcbiAgaWYgKGZvcm1EYXRhKSB7XG4gICAgLy8gc2V0IGhlYWRlcnNcbiAgICBjb25zdCBoZWFkZXJzID0gZm9ybURhdGEuZ2V0SGVhZGVycygpO1xuICAgIGZvciAoY29uc3QgaSBpbiBoZWFkZXJzKSB7XG4gICAgICBpZiAoaGFzT3duKGhlYWRlcnMsIGkpKSB7XG4gICAgICAgIGRlYnVnKCdzZXR0aW5nIEZvcm1EYXRhIGhlYWRlcjogXCIlczogJXNcIicsIGksIGhlYWRlcnNbaV0pO1xuICAgICAgICByZXEuc2V0SGVhZGVyKGksIGhlYWRlcnNbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGF0dGVtcHQgdG8gZ2V0IFwiQ29udGVudC1MZW5ndGhcIiBoZWFkZXJcbiAgICBmb3JtRGF0YS5nZXRMZW5ndGgoKGVycm9yLCBsZW5ndGgpID0+IHtcbiAgICAgIC8vIFRPRE86IEFkZCBjaHVua2VkIGVuY29kaW5nIHdoZW4gbm8gbGVuZ3RoIChpZiBlcnIpXG4gICAgICBpZiAoZXJyb3IpIGRlYnVnKCdmb3JtRGF0YS5nZXRMZW5ndGggaGFkIGVycm9yJywgZXJyb3IsIGxlbmd0aCk7XG5cbiAgICAgIGRlYnVnKCdnb3QgRm9ybURhdGEgQ29udGVudC1MZW5ndGg6ICVzJywgbGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgbGVuZ3RoID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXEuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsIGxlbmd0aCk7XG4gICAgICB9XG5cbiAgICAgIGZvcm1EYXRhLnBpcGUoZ2V0UHJvZ3Jlc3NNb25pdG9yKCkpLnBpcGUocmVxKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChCdWZmZXIuaXNCdWZmZXIoZGF0YSkpIHtcbiAgICBidWZmZXJUb0NodW5rcyhkYXRhKS5waXBlKGdldFByb2dyZXNzTW9uaXRvcigpKS5waXBlKHJlcSk7XG4gIH0gZWxzZSB7XG4gICAgcmVxLmVuZChkYXRhKTtcbiAgfVxufTtcblxuLy8gQ2hlY2sgd2hldGhlciByZXNwb25zZSBoYXMgYSBub24tMC1zaXplZCBnemlwLWVuY29kZWQgYm9keVxuUmVxdWVzdC5wcm90b3R5cGUuX3Nob3VsZFVuemlwID0gKHJlcykgPT4ge1xuICBpZiAocmVzLnN0YXR1c0NvZGUgPT09IDIwNCB8fCByZXMuc3RhdHVzQ29kZSA9PT0gMzA0KSB7XG4gICAgLy8gVGhlc2UgYXJlbid0IHN1cHBvc2VkIHRvIGhhdmUgYW55IGJvZHlcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBoZWFkZXIgY29udGVudCBpcyBhIHN0cmluZywgYW5kIGRpc3RpbmN0aW9uIGJldHdlZW4gMCBhbmQgbm8gaW5mb3JtYXRpb24gaXMgY3J1Y2lhbFxuICBpZiAocmVzLmhlYWRlcnNbJ2NvbnRlbnQtbGVuZ3RoJ10gPT09ICcwJykge1xuICAgIC8vIFdlIGtub3cgdGhhdCB0aGUgYm9keSBpcyBlbXB0eSAodW5mb3J0dW5hdGVseSwgdGhpcyBjaGVjayBkb2VzIG5vdCBjb3ZlciBjaHVua2VkIGVuY29kaW5nKVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIGNvbnNvbGUubG9nKHJlcyk7XG4gIHJldHVybiAvXlxccyooPzpkZWZsYXRlfGd6aXApXFxzKiQvLnRlc3QocmVzLmhlYWRlcnNbJ2NvbnRlbnQtZW5jb2RpbmcnXSk7XG59O1xuXG4vKipcbiAqIE92ZXJyaWRlcyBETlMgZm9yIHNlbGVjdGVkIGhvc3RuYW1lcy4gVGFrZXMgb2JqZWN0IG1hcHBpbmcgaG9zdG5hbWVzIHRvIElQIGFkZHJlc3Nlcy5cbiAqXG4gKiBXaGVuIG1ha2luZyBhIHJlcXVlc3QgdG8gYSBVUkwgd2l0aCBhIGhvc3RuYW1lIGV4YWN0bHkgbWF0Y2hpbmcgYSBrZXkgaW4gdGhlIG9iamVjdCxcbiAqIHVzZSB0aGUgZ2l2ZW4gSVAgYWRkcmVzcyB0byBjb25uZWN0LCBpbnN0ZWFkIG9mIHVzaW5nIEROUyB0byByZXNvbHZlIHRoZSBob3N0bmFtZS5cbiAqXG4gKiBBIHNwZWNpYWwgaG9zdCBgKmAgbWF0Y2hlcyBldmVyeSBob3N0bmFtZSAoa2VlcCByZWRpcmVjdHMgaW4gbWluZCEpXG4gKlxuICogICAgICByZXF1ZXN0LmNvbm5lY3Qoe1xuICogICAgICAgICd0ZXN0LmV4YW1wbGUuY29tJzogJzEyNy4wLjAuMScsXG4gKiAgICAgICAgJ2lwdjYuZXhhbXBsZS5jb20nOiAnOjoxJyxcbiAqICAgICAgfSlcbiAqL1xuUmVxdWVzdC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uIChjb25uZWN0T3ZlcnJpZGUpIHtcbiAgaWYgKHR5cGVvZiBjb25uZWN0T3ZlcnJpZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgdGhpcy5fY29ubmVjdE92ZXJyaWRlID0geyAnKic6IGNvbm5lY3RPdmVycmlkZSB9O1xuICB9IGVsc2UgaWYgKHR5cGVvZiBjb25uZWN0T3ZlcnJpZGUgPT09ICdvYmplY3QnKSB7XG4gICAgdGhpcy5fY29ubmVjdE92ZXJyaWRlID0gY29ubmVjdE92ZXJyaWRlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX2Nvbm5lY3RPdmVycmlkZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUudHJ1c3RMb2NhbGhvc3QgPSBmdW5jdGlvbiAodG9nZ2xlKSB7XG4gIHRoaXMuX3RydXN0TG9jYWxob3N0ID0gdG9nZ2xlID09PSB1bmRlZmluZWQgPyB0cnVlIDogdG9nZ2xlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGdlbmVyYXRlIEhUVFAgdmVyYiBtZXRob2RzXG5pZiAoIW1ldGhvZHMuaW5jbHVkZXMoJ2RlbCcpKSB7XG4gIC8vIGNyZWF0ZSBhIGNvcHkgc28gd2UgZG9uJ3QgY2F1c2UgY29uZmxpY3RzIHdpdGhcbiAgLy8gb3RoZXIgcGFja2FnZXMgdXNpbmcgdGhlIG1ldGhvZHMgcGFja2FnZSBhbmRcbiAgLy8gbnBtIDMueFxuICBtZXRob2RzID0gWy4uLm1ldGhvZHNdO1xuICBtZXRob2RzLnB1c2goJ2RlbCcpO1xufVxuXG5mb3IgKGxldCBtZXRob2Qgb2YgbWV0aG9kcykge1xuICBjb25zdCBuYW1lID0gbWV0aG9kO1xuICBtZXRob2QgPSBtZXRob2QgPT09ICdkZWwnID8gJ2RlbGV0ZScgOiBtZXRob2Q7XG5cbiAgbWV0aG9kID0gbWV0aG9kLnRvVXBwZXJDYXNlKCk7XG4gIHJlcXVlc3RbbmFtZV0gPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICAgIGNvbnN0IHJlcXVlc3RfID0gcmVxdWVzdChtZXRob2QsIHVybCk7XG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmbiA9IGRhdGE7XG4gICAgICBkYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoZGF0YSkge1xuICAgICAgaWYgKG1ldGhvZCA9PT0gJ0dFVCcgfHwgbWV0aG9kID09PSAnSEVBRCcpIHtcbiAgICAgICAgcmVxdWVzdF8ucXVlcnkoZGF0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0Xy5zZW5kKGRhdGEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmbikgcmVxdWVzdF8uZW5kKGZuKTtcbiAgICByZXR1cm4gcmVxdWVzdF87XG4gIH07XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYG1pbWVgIGlzIHRleHQgYW5kIHNob3VsZCBiZSBidWZmZXJlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWltZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gaXNUZXh0KG1pbWUpIHtcbiAgY29uc3QgcGFydHMgPSBtaW1lLnNwbGl0KCcvJyk7XG4gIGxldCB0eXBlID0gcGFydHNbMF07XG4gIGlmICh0eXBlKSB0eXBlID0gdHlwZS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgbGV0IHN1YnR5cGUgPSBwYXJ0c1sxXTtcbiAgaWYgKHN1YnR5cGUpIHN1YnR5cGUgPSBzdWJ0eXBlLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuXG4gIHJldHVybiB0eXBlID09PSAndGV4dCcgfHwgc3VidHlwZSA9PT0gJ3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc7XG59XG5cbi8vIFRoaXMgaXMgbm90IGEgY2F0Y2hhbGwsIGJ1dCBhIHN0YXJ0LiBJdCBtaWdodCBiZSB1c2VmdWxcbi8vIGluIHRoZSBsb25nIHJ1biB0byBoYXZlIGZpbGUgdGhhdCBpbmNsdWRlcyBhbGwgYmluYXJ5XG4vLyBjb250ZW50IHR5cGVzIGZyb20gaHR0cHM6Ly93d3cuaWFuYS5vcmcvYXNzaWdubWVudHMvbWVkaWEtdHlwZXMvbWVkaWEtdHlwZXMueGh0bWxcbmZ1bmN0aW9uIGlzQmluYXJ5KG1pbWUpIHtcbiAgbGV0IFtyZWdpc3RyeSwgbmFtZV0gPSBtaW1lLnNwbGl0KCcvJyk7XG4gIGlmIChyZWdpc3RyeSkgcmVnaXN0cnkgPSByZWdpc3RyeS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgaWYgKG5hbWUpIG5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICByZXR1cm4gKFxuICAgIFsnYXVkaW8nLCAnZm9udCcsICdpbWFnZScsICd2aWRlbyddLmluY2x1ZGVzKHJlZ2lzdHJ5KSB8fFxuICAgIFsnZ3onLCAnZ3ppcCddLmluY2x1ZGVzKG5hbWUpXG4gICk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYG1pbWVgIGlzIGpzb24gb3IgaGFzICtqc29uIHN0cnVjdHVyZWQgc3ludGF4IHN1ZmZpeC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWltZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSlNPTihtaW1lKSB7XG4gIC8vIHNob3VsZCBtYXRjaCAvanNvbiBvciAranNvblxuICAvLyBidXQgbm90IC9qc29uLXNlcVxuICByZXR1cm4gL1svK11qc29uKCR8W14tXFx3XSkvaS50ZXN0KG1pbWUpO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHdlIHNob3VsZCBmb2xsb3cgdGhlIHJlZGlyZWN0IGBjb2RlYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gY29kZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzUmVkaXJlY3QoY29kZSkge1xuICByZXR1cm4gWzMwMSwgMzAyLCAzMDMsIDMwNSwgMzA3LCAzMDhdLmluY2x1ZGVzKGNvZGUpO1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBRUE7QUFDQSxpQkFBbUNBLE9BQU8sQ0FBQyxLQUFELENBQTFDO0FBQUEsTUFBUUMsS0FBUixZQUFRQSxLQUFSO0FBQUEsTUFBZUMsTUFBZixZQUFlQSxNQUFmO0FBQUEsTUFBdUJDLE9BQXZCLFlBQXVCQSxPQUF2Qjs7QUFDQSxNQUFNQyxNQUFNLEdBQUdKLE9BQU8sQ0FBQyxRQUFELENBQXRCOztBQUNBLE1BQU1LLEtBQUssR0FBR0wsT0FBTyxDQUFDLE9BQUQsQ0FBckI7O0FBQ0EsTUFBTU0sSUFBSSxHQUFHTixPQUFPLENBQUMsTUFBRCxDQUFwQjs7QUFDQSxNQUFNTyxFQUFFLEdBQUdQLE9BQU8sQ0FBQyxJQUFELENBQWxCOztBQUNBLE1BQU1RLElBQUksR0FBR1IsT0FBTyxDQUFDLE1BQUQsQ0FBcEI7O0FBQ0EsTUFBTVMsSUFBSSxHQUFHVCxP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