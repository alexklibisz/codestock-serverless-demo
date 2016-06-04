(function() {

  if(window.location.pathname.indexOf('album-upload') < 0) return;

  var name = getQueryVariable('name');
  $('#album-name').text(name);



})();
