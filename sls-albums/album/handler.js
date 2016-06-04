'use strict';
var helpers = require('../lib');

module.exports.handler = function(event, context, cb) {

  context.succeed({
    name: helpers.test(event.name)
  });

};
