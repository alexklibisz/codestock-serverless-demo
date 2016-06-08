'use strict';

var async = require('asyncawait/async');
var await = require('asyncawait/await');
var ax = require('axios');
var helpers = require('../lib');
var Promise = require('bluebird');

module.exports.handler = async(function imageHandler(event, context, cb) {

  const awsURL = 'http://s3.amazonaws.com';
  const bucket = 'demo-codestock-serverless-storage';
  const lambdaURL = 'https://yj0dx2u9p6.execute-api.us-east-1.amazonaws.com/dev';

  try {

    // Replace spaces with underscores in albumName and name.
    event.albumName = event.albumName.replace(/\ /g, '_');
    event.name = event.name.replace(/\ /g, '_');

    // Setup the standard image
    const standardName = `${event.albumName}/${event.name}`;
    const standardBody = event.image;

    // Setup the thumbnail
    const extension = '.' + event.name.split('.').pop();
    const thumbName = `${event.albumName}/` + event.name.replace(extension, `-thumb${extension}`);
    const thumbBody = await(helpers.resizeImage(event.image, 350));

    // Trigger the album rebuild
    const rebuildURL = `${lambdaURL}/album-builder`;

    // Upload standard and thumbnail
    await(Promise.all([
      helpers.s3SaveImage(bucket, standardName, standardBody),
      helpers.s3SaveImage(bucket, thumbName, thumbBody)
    ]));

    // Hit the rebuild endpoing to rebuild this album.
    const rebuildResult = await(ax.get(rebuildURL, { params: { albumName: event.albumName } }));
    const imageCount = rebuildResult.data.imageCount;

    // Return successful payload.
    const successPayload = {
      status: 'image uploaded',
      standardName: standardName,
      standardURL: `${awsURL}/${bucket}/${standardName}`,
      thumbName: thumbName,
      thumbURL: `${awsURL}/${bucket}/${thumbName}`,
      imageCount: imageCount
    };

    context.succeed(successPayload);

  } catch(error) {
    context.fail(error);
  }

});
