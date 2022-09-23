#!/usr/bin/env node
// Pass the original process to a closure stored in the `process._original` property.
// Use a closure to ensure the stored value will not change when running tests.
process._original = (function (_original) {
  return function () {
    return _original
  }
})(process)
// Run Jest
require('jest/bin/jest')
