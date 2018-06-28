'use strict';

var lodash = require('lodash');
var debugx = require('debug')('tdd:devebot-cli:textui');
var assert = require('chai').assert;
var expect = require('chai').expect;
var TextUI = require('../../lib/utils/textui');
var stdInterceptor = require('../lib/std-interceptor');

describe('devebot-cli:textui:displayCliOutput', function() {
  var textui = new TextUI({
    options: {
      colorEnabled: false
    }
  });

  it('Render Table output data type', function() {
    var unhook = stdInterceptor({trim:false});
    textui.displayCliOutput({
      state: 'completed',
      payload: [
        {
          "title": "Grid data format Example",
          "type": "grid",
          "data": {
            "objValue": {
              "greeting": "Hello world",
              "PI": 3.14159
            },
            "intValue": 1024,
            "boolValue": true
          }
        }
      ]
    });
    var output = unhook();
    var expected = [
      '\n',
      '[x] Sequence descriptors\n',
      '┌──────────────────────────────────────────────────────────────────────────────┐\n' +
      '│ JSON                                                                         │\n' +
      '├──────────────────────────────────────────────────────────────────────────────┤\n' +
      '│ {                                                                            │\n' +
      '│   "objValue": {                                                              │\n' +
      '│     "greeting": "Hello world",                                               │\n' +
      '│     "PI": 3.14159                                                            │\n' +
      '│   },                                                                         │\n' +
      '│   "intValue": 1024,                                                          │\n' +
      '│   "boolValue": true                                                          │\n' +
      '│ }                                                                            │\n' +
      '└──────────────────────────────────────────────────────────────────────────────┘\n'
    ]
    assert.sameOrderedMembers(output.stdout, expected)
  });

  it('Render JSON output data type', function() {
    var unhook = stdInterceptor({trim:false});
    textui.displayCliOutput({
      state: 'failed',
      payload: [
        {
          "title": "Sequence descriptors",
          "type": "json",
          "data": {
            "objValue": {
              "greeting": "Hello world",
              "PI": 3.14159
            },
            "intValue": 1024,
            "boolValue": true
          }
        }
      ]
    });
    var output = unhook();
    var expected = [
      '\n',
      '[x] Sequence descriptors\n',
      '┌──────────────────────────────────────────────────────────────────────────────┐\n' +
      '│ JSON                                                                         │\n' +
      '├──────────────────────────────────────────────────────────────────────────────┤\n' +
      '│ {                                                                            │\n' +
      '│   "objValue": {                                                              │\n' +
      '│     "greeting": "Hello world",                                               │\n' +
      '│     "PI": 3.14159                                                            │\n' +
      '│   },                                                                         │\n' +
      '│   "intValue": 1024,                                                          │\n' +
      '│   "boolValue": true                                                          │\n' +
      '│ }                                                                            │\n' +
      '└──────────────────────────────────────────────────────────────────────────────┘\n'
    ]
    assert.sameOrderedMembers(output.stdout, expected)
  });
});
