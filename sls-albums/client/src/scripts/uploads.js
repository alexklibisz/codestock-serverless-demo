(function uploads() {

    function parseImage(file, callback) {
        var reader = new FileReader();
        var promise = new Promise(function(resolve, reject) {
            reader.onload = function(ev) {
                var image = ev.target.result.replace(/^data:image\/(png|jpeg);base64,/, '');
                resolve(image);
            }
        });
        reader.readAsDataURL(file);
        return promise;
    }

    function uploadImage(image, name) {
        var payload = JSON.stringify({
            image: image,
            name: name
        });
        axios.post("/image", payload)
            .then(function(res) {
                console.log('Success', res.data);
            })
            .catch(function(error) {
                console.error('Error', error);
            });
    }

    var imgInput = document.getElementById('img-input');
    if (imgInput === null) return;

    imgInput.onchange = function uploadSelectedImages (event) {
        var files = event.target.files;
        for (var i = 0; i < event.target.files.length; i++) {
            var file = event.target.files[i];
            parseImage(file)
                .then(function(image) {
                    uploadImage(image, file.name);
                });
        }
    }
})();
