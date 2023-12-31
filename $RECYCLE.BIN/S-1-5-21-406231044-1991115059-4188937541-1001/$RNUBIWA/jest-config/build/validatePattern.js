'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = validatePattern;
/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function validatePattern(pattern) {
  if (pattern) {
    try {
      // eslint-disable-next-line no-new
      new RegExp(pattern, 'i');
    } catch {
      return false;
    }
  }
  return true;
}
