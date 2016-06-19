'use strict';

const async = require('asyncawait/async');
const await = require('asyncawait/await');
const helpers = require('../lib');
const mime = require('mime');
const fs = require('fs');
const hbs = require('handlebars');

module.exports.handler = async(function(event, context, cb) {

  const awsURL = 'http://s3.amazonaws.com'
  const storageBucket = 'lambda-albums.xyz-storage';
  const siteBucket = 'lambda-albums.xyz';

  const s3Object = (event.Records.pop()).s3.object;
  const albumName = s3Object.key.split('/').shift();

  // Get the files by looking up the albumName directory in S3
  // Sort the returned Contents array by date in ascending order.
  const objects = await(helpers.s3ListObjects(storageBucket, albumName));
  const sorted = objects.Contents.sort((a,b) => new Date(a.LastModified).getTime() > new Date(b.LastModified).getTime());

  // Filter out images and then standard and thumbnail sized
  const isImage = (x) => mime.lookup(x.Key.split('.').pop()).indexOf('image') > -1;
  const images = sorted.filter(isImage);
  const standard = images.filter(x => x.Key.indexOf('thumb') < 0);
  const thumbs = images.filter(x => x.Key.indexOf('thumb') > -1);

  // Add src URLs to thumbs and standard
  thumbs.forEach(x => x.src = `${awsURL}/${storageBucket}/${x.Key}`);
  standard.forEach(x => x.src = `${awsURL}/${storageBucket}/${x.Key}`);

  const template = fs.readFileSync('./album-builder/album-view.hbs', 'utf8');
  const compiled = hbs.compile(template);
  const updatedAt = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
  const content = { albumName, standard, thumbs, updatedAt };
  const htmlString = compiled(content);

  // Write the html file to a buffer
  const fileContents = new Buffer(htmlString).toString('base64');

  // Write the file to S3, using albumName as the directory.
  await(helpers.s3SaveFile(siteBucket, `albums/${albumName}/index.html`, fileContents));

  context.succeed({ imageCount: standard.length });

});
