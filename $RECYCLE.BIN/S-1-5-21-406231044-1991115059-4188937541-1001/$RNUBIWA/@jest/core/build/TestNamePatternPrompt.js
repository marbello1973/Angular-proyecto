'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;
function _jestWatcher() {
  const data = require('jest-watcher');
  _jestWatcher = function () {
    return data;
  };
  return data;
}
/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

class TestNamePatternPrompt extends _jestWatcher().PatternPrompt {
  constructor(pipe, prompt) {
    super(pipe, prompt, 'tests');
  }
  _onChange(pattern, options) {
    super._onChange(pattern, options);
    this._printPrompt(pattern);
  }
  _printPrompt(pattern) {
    const pipe = this._pipe;
    (0, _jestWatcher().printPatternCaret)(pattern, pipe);
    (0, _jestWatcher().printRestoredPatternCaret)(
      pattern,
      this._currentUsageRows,
      pipe
    );
  }
}
exports.default = TestNamePatternPrompt;
