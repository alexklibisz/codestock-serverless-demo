'use strict';

module.exports.handler = function(event, context, cb) {

  context.succeed({
    name: event.name.split(' ').join('-')
  });

};
