
var fs = require('fs');
var ax = require('axios');

var fileContent = fs.readFileSync('portland.jpg').toString('base64');
var url = "https://yj0dx2u9p6.execute-api.us-east-1.amazonaws.com/dev/image";
var payload = {
  image: fileContent,
  name: 'portland-' + new Date().getTime() + '.jpg'
};

ax.post(url, JSON.stringify(payload))
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
