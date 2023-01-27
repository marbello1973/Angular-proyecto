"use strict";

/**
 * Module dependencies.
 */
const util = require('util');

const Stream = require('stream');

const ResponseBase = require('../response-base');

const _require = require('../utils'),
      mixin = _require.mixin;
/**
 * Expose `Response`.
 */


module.exports = Response;
/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * @param {Request} req
 * @param {Object} options
 * @constructor
 * @extends {Stream}
 * @implements {ReadableStream}
 * @api private
 */

function Response(request) {
  Stream.call(this);
  this.res = request.res;
  const res = this.res;
  this.request = request;
  this.req = request.req;
  this.text = res.text;
  this.files = res.files || {};
  this.buffered = request._resBuffered;
  this.headers = res.headers;
  this.header = this.headers;

  this._setStatusProperties(res.statusCode);

  this._setHeaderProperties(this.header);

  this.setEncoding = res.setEncoding.bind(res);
  res.on('data', this.emit.bind(this, 'data'));
  res.on('end', this.emit.bind(this, 'end'));
  res.on('close', this.emit.bind(this, 'close'));
  res.on('error', this.emit.bind(this, 'error'));
} // Lazy access res.body.
// https://github.com/nodejs/node/pull/39520#issuecomment-889697136


Object.defineProperty(Response.prototype, 'body', {
  get() {
    return this._body !== undefined ? this._body : this.res.body !== undefined ? this.res.body : {};
  },

  set(value) {
    this._body = value;
  }

});
/**
 * Inherit from `Stream`.
 */

util.inherits(Response, Stream);
mixin(Response.prototype, ResponseBase.prototype);
/**
 * Implements methods of a `ReadableStream`
 */

Response.prototype.destroy = function (error) {
  this.res.destroy(error);
};
/**
 * Pause.
 */


Response.prototype.pause = function () {
  this.res.pause();
};
/**
 * Resume.
 */


Response.prototype.resume = function () {
  this.res.resume();
};
/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */


Response.prototype.toError = function () {
  const req = this.req;
  const method = req.method;
  const path = req.path;
  const message = "cannot ".concat(method, " ").concat(path, " (").concat(this.status, ")");
  const error = new Error(message);
  error.status = this.status;
  error.text = this.text;
  error.method = method;
  error.path = path;
  return error;
};

Response.prototype.setStatusProperties = function (status) {
  console.warn('In superagent 2.x setStatusProperties is a private method');
  return this._setStatusProperties(status);
};
/**
 * To json.
 *
 * @return {Object}
 * @api public
 */


Response.prototype.toJSON = function () {
  return {
    req: this.request.toJSON(),
    header: this.header,
    status: this.status,
    text: this.text
  };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1dGlsIiwicmVxdWlyZSIsIlN0cmVhbSIsIlJlc3BvbnNlQmFzZSIsIm1peGluIiwibW9kdWxlIiwiZXhwb3J0cyIsIlJlc3BvbnNlIiwicmVxdWVzdCIsImNhbGwiLCJyZXMiLCJyZXEiLCJ0ZXh0IiwiZmlsZXMiLCJidWZmZXJlZCIsIl9yZXNCdWZmZXJlZCIsImhlYWRlcnMiLCJoZWFkZXIiLCJfc2V0U3RhdHVzUHJvcGVydGllcyIsInN0YXR1c0NvZGUiLCJfc2V0SGVhZGVyUHJvcGVydGllcyIsInNldEVuY29kaW5nIiwiYmluZCIsIm9uIiwiZW1pdCIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwicHJvdG90eXBlIiwiZ2V0IiwiX2JvZHkiLCJ1bmRlZmluZWQiLCJib2R5Iiwic2V0IiwidmFsdWUiLCJpbmhlcml0cyIsImRlc3Ryb3kiLCJlcnJvciIsInBhdXNlIiwicmVzdW1lIiwidG9FcnJvciIsIm1ldGhvZCIsInBhdGgiLCJtZXNzYWdlIiwic3RhdHVzIiwiRXJyb3IiLCJzZXRTdGF0dXNQcm9wZXJ0aWVzIiwiY29uc29sZSIsIndhcm4iLCJ0b0pTT04iXSwic291cmNlcyI6WyIuLi8uLi9zcmMvbm9kZS9yZXNwb25zZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxuY29uc3QgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcbmNvbnN0IFN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuY29uc3QgUmVzcG9uc2VCYXNlID0gcmVxdWlyZSgnLi4vcmVzcG9uc2UtYmFzZScpO1xuY29uc3QgeyBtaXhpbiB9ID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBAcGFyYW0ge1JlcXVlc3R9IHJlcVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMge1N0cmVhbX1cbiAqIEBpbXBsZW1lbnRzIHtSZWFkYWJsZVN0cmVhbX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIFJlc3BvbnNlKHJlcXVlc3QpIHtcbiAgU3RyZWFtLmNhbGwodGhpcyk7XG4gIHRoaXMucmVzID0gcmVxdWVzdC5yZXM7XG4gIGNvbnN0IHsgcmVzIH0gPSB0aGlzO1xuICB0aGlzLnJlcXVlc3QgPSByZXF1ZXN0O1xuICB0aGlzLnJlcSA9IHJlcXVlc3QucmVxO1xuICB0aGlzLnRleHQgPSByZXMudGV4dDtcbiAgdGhpcy5maWxlcyA9IHJlcy5maWxlcyB8fCB7fTtcbiAgdGhpcy5idWZmZXJlZCA9IHJlcXVlc3QuX3Jlc0J1ZmZlcmVkO1xuICB0aGlzLmhlYWRlcnMgPSByZXMuaGVhZGVycztcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnM7XG4gIHRoaXMuX3NldFN0YXR1c1Byb3BlcnRpZXMocmVzLnN0YXR1c0NvZGUpO1xuICB0aGlzLl9zZXRIZWFkZXJQcm9wZXJ0aWVzKHRoaXMuaGVhZGVyKTtcbiAgdGhpcy5zZXRFbmNvZGluZyA9IHJlcy5zZXRFbmNvZGluZy5iaW5kKHJlcyk7XG4gIHJlcy5vbignZGF0YScsIHRoaXMuZW1pdC5iaW5kKHRoaXMsICdkYXRhJykpO1xuICByZXMub24oJ2VuZCcsIHRoaXMuZW1pdC5iaW5kKHRoaXMsICdlbmQnKSk7XG4gIHJlcy5vbignY2xvc2UnLCB0aGlzLmVtaXQuYmluZCh0aGlzLCAnY2xvc2UnKSk7XG4gIHJlcy5vbignZXJyb3InLCB0aGlzLmVtaXQuYmluZCh0aGlzLCAnZXJyb3InKSk7XG59XG5cbi8vIExhenkgYWNjZXNzIHJlcy5ib2R5LlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL3B1bGwvMzk1MjAjaXNzdWVjb21tZW50LTg4OTY5NzEzNlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlc3BvbnNlLnByb3RvdHlwZSwgJ2JvZHknLCB7XG4gIGdldCgpIHtcbiAgICByZXR1cm4gdGhpcy5fYm9keSAhPT0gdW5kZWZpbmVkXG4gICAgICA/IHRoaXMuX2JvZHlcbiAgICAgIDogdGhpcy5yZXMuYm9keSAhPT0gdW5kZWZpbmVkXG4gICAgICA/IHRoaXMucmVzLmJvZHlcbiAgICAgIDoge307XG4gIH0sXG4gIHNldCh2YWx1ZSkge1xuICAgIHRoaXMuX2JvZHkgPSB2YWx1ZTtcbiAgfVxufSk7XG5cbi8qKlxuICogSW5oZXJpdCBmcm9tIGBTdHJlYW1gLlxuICovXG5cbnV0aWwuaW5oZXJpdHMoUmVzcG9uc2UsIFN0cmVhbSk7XG5cbm1peGluKFJlc3BvbnNlLnByb3RvdHlwZSwgUmVzcG9uc2VCYXNlLnByb3RvdHlwZSk7XG5cbi8qKlxuICogSW1wbGVtZW50cyBtZXRob2RzIG9mIGEgYFJlYWRhYmxlU3RyZWFtYFxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKGVycm9yKSB7XG4gIHRoaXMucmVzLmRlc3Ryb3koZXJyb3IpO1xufTtcblxuLyoqXG4gKiBQYXVzZS5cbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMucmVzLnBhdXNlKCk7XG59O1xuXG4vKipcbiAqIFJlc3VtZS5cbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUucmVzdW1lID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnJlcy5yZXN1bWUoKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGBFcnJvcmAgcmVwcmVzZW50YXRpdmUgb2YgdGhpcyByZXNwb25zZS5cbiAqXG4gKiBAcmV0dXJuIHtFcnJvcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnRvRXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHsgcmVxIH0gPSB0aGlzO1xuICBjb25zdCB7IG1ldGhvZCB9ID0gcmVxO1xuICBjb25zdCB7IHBhdGggfSA9IHJlcTtcblxuICBjb25zdCBtZXNzYWdlID0gYGNhbm5vdCAke21ldGhvZH0gJHtwYXRofSAoJHt0aGlzLnN0YXR1c30pYDtcbiAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIGVycm9yLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnJvci50ZXh0ID0gdGhpcy50ZXh0O1xuICBlcnJvci5tZXRob2QgPSBtZXRob2Q7XG4gIGVycm9yLnBhdGggPSBwYXRoO1xuXG4gIHJldHVybiBlcnJvcjtcbn07XG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRTdGF0dXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKHN0YXR1cykge1xuICBjb25zb2xlLndhcm4oJ0luIHN1cGVyYWdlbnQgMi54IHNldFN0YXR1c1Byb3BlcnRpZXMgaXMgYSBwcml2YXRlIG1ldGhvZCcpO1xuICByZXR1cm4gdGhpcy5fc2V0U3RhdHVzUHJvcGVydGllcyhzdGF0dXMpO1xufTtcblxuLyoqXG4gKiBUbyBqc29uLlxuICpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICByZXE6IHRoaXMucmVxdWVzdC50b0pTT04oKSxcbiAgICBoZWFkZXI6IHRoaXMuaGVhZGVyLFxuICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXG4gICAgdGV4dDogdGhpcy50ZXh0XG4gIH07XG59O1xuIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUVBLE1BQU1BLElBQUksR0FBR0MsT0FBTyxDQUFDLE1BQUQsQ0FBcEI7O0FBQ0EsTUFBTUMsTUFBTSxHQUFHRCxPQUFPLENBQUMsUUFBRCxDQUF0Qjs7QUFDQSxNQUFNRSxZQUFZLEdB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