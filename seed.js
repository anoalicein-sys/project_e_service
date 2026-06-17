const http = require('http');

const data = JSON.stringify({
  name: "Super Admin",
  email: "admin@eservice.com",
  password: "AdminPassword123!"
});

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/auth/bootstrap-admin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body: ${body}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
