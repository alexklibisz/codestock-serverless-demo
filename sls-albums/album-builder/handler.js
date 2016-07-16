'use strict';

const async = require('asyncawait/async');
const await = require('asyncawait/await');
const helpers = require('../lib');
const mime = require('mime');
const fs = require('fs');
const hbs = require('handlebars');
const _ = require('lodash');

module.exports.handler = async(function(event, context, cb) {

  const awsURL = 'http://s3.amazonaws.com'
  const storageBucket = 'www.lambda-albums.xyz-storage';
  const siteBucket = 'www.lambda-albums.xyz';

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

  // Combine into a single photos array and add src URLs
  const photos = _.zip(thumbs, standard).map((pair, i) => {
    const thumb = pair[0], standard = pair[1];
    thumb.src = `${awsURL}/${storageBucket}/${thumb.Key}`;
    standard.src = `${awsURL}/${storageBucket}/${standard.Key}`
    return { thumb, standard };
  });

  // Set up and compile the handlebars View
  const template = fs.readFileSync('./album-builder/album-view.hbs', 'utf8');
  const compiled = hbs.compile(template);
  const updatedAt = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
  const content = { albumName, photos, updatedAt };
  const htmlString = compiled(content);

  // Write the html file to a buffer
  const fileContents = new Buffer(htmlString).toString('base64');

  // Write the file to S3, using albumName as the directory.
  await(helpers.s3SaveFile(siteBucket, `albums/${albumName}/index.html`, fileContents));

  context.succeed();

});
