'use strict';
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const helpers = require('../lib');

module.exports.handler = async(function(event, context, cb) {

  const bucket = 'www.lambda-albums.xyz-storage';

  try {

    event.name = event.name.replace(/\ /g, '_');
    const directoryMeta = await(helpers.s3CreateDirectory(bucket, event.name, true));
    context.succeed({
      status: 'directory created',
      name: event.name,
      meta: directoryMeta
    });

  } catch(error) {

    context.fail(error);

  }

});
