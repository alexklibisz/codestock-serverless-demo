'use strict';
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var helpers = require('../lib');

module.exports.handler = async(function(event, context, cb) {

  const bucket = 'demo-codestock-serverless-storage';

  try {
    event.name = event.name.replace(/\ /g, '_');
    var directoryMeta = await(helpers.s3CreateDirectory(bucket, event.name, true));
    context.succeed({
      status: 'directory created',
      name: event.name,
      meta: directoryMeta
    });
  } catch(error) {
    context.fail(error);
  }

});
