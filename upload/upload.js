
var fs = require('fs');
var ax = require('axios');

var fileContent = fs.readFileSync('portland.jpg').toString('base64');
var url = "https://yj0dx2u9p6.execute-api.us-east-1.amazonaws.com/dev/image";

console.log(fileContent.substr(0,100));

for(var i = 0; i < 10; i++) {
  var payload = {
    image: fileContent,
    name: 'portland-' + i + '.jpg'
  };
  console.log(payload.name);
  ax.post(url, JSON.stringify(payload))
    .then(res => console.log(res.data))
    .catch(err => console.error(err));
}
