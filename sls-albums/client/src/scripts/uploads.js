(function uploads () {
  function parseImage(file, callback) {
    var reader = new FileReader();
    reader.onload = function(ev) {
      var image = ev.target.result.replace(/^data:image\/(png|jpeg);base64,/, '');
      callback(image, file);
    }
    reader.readAsDataURL(file);
  }

  function uploadImage(image, file) {
    var payload = JSON.stringify({
      image: image,
      name: file.name
    });
    axios.post("https://yj0dx2u9p6.execute-api.us-east-1.amazonaws.com/dev/image", payload)
      .then(function(res) { console.log('Success', res.data); })
      .catch(function(error) { console.error('Error', error); });
  }

  var imgInput = document.getElementById('img-input');
  if(imgInput === null) return;

  imgInput.onchange = function(event) {
    var files = event.target.files;
    for(var i = 0; i < event.target.files.length; i++) {
      var file = event.target.files[i];
      parseImage(file, uploadImage);
    }
  }
})();
