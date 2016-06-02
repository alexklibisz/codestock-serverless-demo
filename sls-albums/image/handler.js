'use strict';

var fs = require('fs');
var aws = require('aws-sdk');
var gm = require('gm').subClass({imageMagick: true});
var mime = require('mime');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

/**
 * Take a bucket, image name, and the image body base64-encoded.
 * Store that image in S3.
 * Returns a promise.
 */
function saveImage(bucket, name, bodyBase64) {
  const s3 = new aws.S3({
    apiVersion: '2006-03-01',
    accessKeyId: process.env.AWS_AKI,
    secretAccessKey: process.env.AWS_SAK,
    region: 'us-east-1'
  });
  const params = {
    Bucket: bucket,
    ACL: 'public-read',
    Body: new Buffer(bodyBase64, 'base64'),
    Key: name,
    ContentType: mime.lookup(name)
  }
  return new Promise(function(resolve, reject) {
    s3.putObject(params, function(error, data) {
      if (error) reject(error);
      else resolve(data);
    });
  });
}

/**
 * Take an image in base64 encoding.
 * Resize it via imageMagick library.
 * Return a promise resolving to resized image base64 encoded string.
 */
function resizeImage(imageBase64, size) {
  size = size || 250;
  return new Promise((resolve, reject) => {
    gm(new Buffer(imageBase64, 'base64')).resize(size).toBuffer(function (error, buffer) {
      if (error) reject(error);
      resolve(buffer.toString('base64'));
    });
  });
}

module.exports.handler = async(function imageHandler(event, context, cb) {

  const awsURL = 'http://s3.amazonaws.com';
  const bucket = 'demo-codestock-serverless-storage';

  try {

    // Save the standard image
    const standardName = event.name;
    const standardBody = event.image;
    await(saveImage(bucket, standardName, standardBody));

    // Save the thumbnail
    const extension = '.' + event.name.split('.').pop();
    const thumbName = event.name.replace(extension, `-thumb${extension}`);
    const thumbBody = await(resizeImage(event.image, 350));
    await(saveImage(bucket, thumbName, thumbBody));

    // Return successful payload.
    const successPayload = {
      status: 'image uploaded',
      standardName: standardName,
      standardURL: `${awsURL}/${bucket}/${standardName}`,
      thumbName: thumbName,
      thumbURL: `${awsURL}/${bucket}/${thumbName}`
    };

    context.succeed(successPayload);

  } catch(error) {
    context.fail(error);
  }

});
