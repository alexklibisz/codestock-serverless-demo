(function() {

  if(window.location.pathname.indexOf('album-upload') < 0) return;

  var albumName = getQueryVariable('albumName') || 'Demo_Album';
  $('#album-name').text(albumName);

  var form = $('#form-album-upload');
  var imgInput = form.find('[name=img-input]');

  imgInput.change(function imageSelection(event) {

    for(var i = 0; i < event.target.files.length; i++) {
        var file = event.target.files[i];

        // Read the image as base64.
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(loadEvent) {
          var image = loadEvent.target.result.replace(/^data:image\/(png|jpeg);base64,/, '');
          var payload = JSON.stringify({
            image: image, name: file.name
          });
          // When it's been read, post the image lambda using Axios.
          axios.post('/image', payload)
            .then(function(res) {
              console.log('Success', res.data);
            })
            .catch(function(error) {
              console.error('Error', error);
            });
        };

    }

  });

})();
