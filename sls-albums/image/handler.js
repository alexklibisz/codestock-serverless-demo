'use strict';

var aws = require('aws-sdk');

module.exports.handler = function(event, context, cb) {

  var s3 = new aws.S3({
    apiVersion: '2006-03-01',
    accessKeyId: process.env.AWS_AKI,
    secretAccessKey: process.env.AWS_SAK,
    region: 'us-east-1'
  });

  var uploadParams = {
    Bucket: 'codestock-serverless-demo',
    ACL: 'public-read',
    Body: new Buffer(event.image, 'base64'),
    Key: event.name,
    ContentType: 'image/jpeg'
  };

  s3.putObject(uploadParams, function(error,data) {
    if(error) context.fail(error)
    else {
      context.succeed({
        status: 'image uploaded',
        name: event.name,
        url: 'https://s3.amazonaws.com/' + uploadParams.Bucket + '/' + uploadParams.Key
      });
    }
  });

};
