var fs = require('fs');
var aws = require('aws-sdk');
var mime = require('mime');
var gm = require('gm').subClass({imageMagick: true});

const s3 = new aws.S3({
  apiVersion: '2006-03-01',
  accessKeyId: process.env.AWS_AKI,
  secretAccessKey: process.env.AWS_SAK,
  region: 'us-east-1'
});

/**
 * Take a bucket, image name, and the image body base64-encoded.
 * Store that image in S3.
 * Returns a promise.
 */
module.exports.s3SaveImage = function s3SaveImage(bucket, name, bodyBase64) {
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
};

module.exports.s3CreateDirectory = function s3CreateDirectory(bucket, name, overwrite) {

  // Delete the existing directory
  if(overwrite) {

  }

  // Create the directoy with a single ".keep" file.
  var meta = {
    name: name,
    createdAt: new Date().getTime()
  };
  var fname = 'meta.json';
  fs.writeFileSync(`/tmp/${fname}`, JSON.stringify(meta), 'utf8');
  var buffer = fs.readFileSync(`/tmp/${fname}`);

  const params = {
    Bucket: bucket,
    ACL: 'public-read',
    Body: buffer,
    Key: `${name}/${fname}`,
    ContentType: mime.lookup(fname)
  };

  return new Promise(function(resolve, reject) {
    s3.putObject(params, function(error,data) {
      if(error) reject(error);
      else resolve(meta);
    });
  });

};

/**
 * Take an image in base64 encoding.
 * Resize it via imageMagick library.
 * Return a promise resolving to resized image base64 encoded string.
 */
module.exports.resizeImage = function resizeImage(imageBase64, size) {
  size = size || 250;
  return new Promise((resolve, reject) => {
    gm(new Buffer(imageBase64, 'base64')).resize(size).quality(80).toBuffer(function (error, buffer) {
      if (error) reject(error);
      resolve(buffer.toString('base64'));
    });
  });
}
