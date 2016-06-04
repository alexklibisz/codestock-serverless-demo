(function() {

  if(window.location.pathname.indexOf('album-upload') < 0) return;

  var albumName = getQueryVariable('albumName') || 'Demo_Album';
  $('#album-name').text(albumName);

  var form = $('#form-album-upload');
  var imgInput = form.find('[name=img-input]');
  var thumbnails = $('#thumbnails');

  function parseImage(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function(loadEvent) {
        var image = loadEvent.target.result.replace(/^data:image\/(png|jpeg);base64,/, '');
        resolve(image);
      }
      reader.readAsDataURL(file);
    });
  }

  function appendThumbnail(url, name) {
    thumbnails.append(`<div><img src=${url}></img><p>${name}</p></div>`);
  }

  imgInput.change(function imageSelection(event) {

    // Populate files array from non-standard event.target.files.
    // This allows you to use a forEach loop.
    var files = [];
    for(var i = 0; i < event.target.files.length; i++)
      files.push(event.target.files[i]);

    // Loop over each file, encode the image as Base64.
    // Uplaod the image via endpoint. Call appendThumbnail
    // after image is uploaded.
    files.forEach(function(file, index) {
      parseImage(file)
        .then(function(image) {
          var payload = JSON.stringify({
            albumName: albumName,
            image: image,
            name: file.name
          });
          console.log(JSON.parse(payload).name);
          return axios.post('/image', payload);
        })
        .then(function(res) {
          console.log(res.data.standardName);
          appendThumbnail(res.data.thumbURL, res.data.thumbName);
        })
        .catch(function(error) {
          console.error('Error', error);
        });
    });

  });

})();
