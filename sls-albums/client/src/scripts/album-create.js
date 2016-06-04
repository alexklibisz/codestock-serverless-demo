(function() {

  if (window.location.pathname.indexOf('album-create') < 0) return;

  var form = $('#form-album');

  // Submit name from form to API.
  // On success, redirect to the album-upload page.
  form.submit(function() {
    var name = $(this).find('[name=album-name]').val();
    var payload = JSON.stringify({ name: name });
    axios.post('/album', payload)
      .then(function next(result) {
        var name = result.data.name;
        window.location = '/album-upload.html?name=' + name;
      })
      .catch(function error(error) {
        allert(error.toString());
      });
    return false;
  });

})();
