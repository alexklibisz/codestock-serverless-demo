'use strict';

var fs = require('fs');
var aws = require('aws-sdk');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

module.exports.handler = async(function(event, context, cb) {

  var s3 = new aws.S3({
    apiVersion: '2006-03-01',
    accessKeyId: process.env.AWS_AKI,
    secretAccessKey: process.env.AWS_SAK,
    region: 'us-east-1'
  });

  fs.writeFileSync('/tmp/index.html', '<h1>Hello ' + event.name + '</h1>' , 'utf8');
  var fileContents = fs.readFileSync('/tmp/index.html', 'utf8');

  var uploadParams = {
    Bucket: 'serverless-voting',
    ACL: 'public-read',
    Body: new Buffer(fileContents, 'binary'),
    ContentType: 'text/html',
    Key: 'index.html'
  };

  function createBucket() {
    return new Promise(function(resolve, reject) {
      s3.createBucket({ Bucket: 'serverless-voting' }, function(error, data) {
        if(error) reject(error);
        else resolve(data);
      });
    });
  }

  function uploadFile() {
    return new Promise(function(resolve, reject) {
      s3.putObject(uploadParams, function(error, data) {
        if(error) reject(error);
        else resolve(data);
      })
    });
  }

  try {
    await(createBucket());
    await(uploadFile());
    context.succeed({
      message: 'File Updated'
    });
  } catch(error) {
    context.fail(error);
  }

});
