const http = require('http');

http.get('http://localhost:3000/vendedor/properties', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(data.substring(0, 5000));
  });
}).on('error', (err) => {
  console.error(err);
});
