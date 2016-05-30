'use strict';

var fs = require('fs');
var aws = require('aws-sdk');
var gm = require('gm').subClass({imageMagick: true});
var async = require('asyncawait/async');
var await = require('asyncawait/await');

module.exports.handler = async(function(event, context, cb) {

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

  function saveImage(uploadParams) {
    return new Promise(function(resolve, reject) {
      s3.putObject(uploadParams, function(error, data) {
        if (error) reject(error);
        else resolve(data);
      });
    });
  }

  function resizeImage(imageBase64) {
    return new Promise((resolve, reject) => {
      gm(imageBase64).resize(450).toBuffer(function (error, buffer) {
        if (error) reject(error);
        resolve(buffer);
      });
    });
  }

  try {

    // Save the standard image
    await(saveImage(uploadParams));

    // Create the resized image and save it.
    const thumbBody = await(resizeImage(uploadParams.Body));
    uploadParams.Body = thumbBody;
    uploadParams.Key = event.name.replace('.', '-thumb.');
    await(saveImage(uploadParams));

    context.succeed({
      status: 'image uploaded',
      name: uploadParams.Key,
      url: 'https://s3.amazonaws.com/' + uploadParams.Bucket + '/' + uploadParams.Key
    })
  } catch(error) {
    context.fail(error);
  }

  // s3.putObject(uploadParams, function(error,data) {
  //   if(error) context.fail(error)
  //   else {
  //     context.succeed({
  //       status: 'image uploaded',
  //       name: event.name,
  //       url: 'https://s3.amazonaws.com/' + uploadParams.Bucket + '/' + uploadParams.Key
  //     });
  //   }
  // });

});
