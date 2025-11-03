const http = require('http');
function post(path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}
(async ()=>{
  try{
    const reg = await post('/api/auth/user/register', JSON.stringify({ fullName:'HTTP Test', email:'http-test@example.com', password:'Pass1234'}));
    console.log('register', reg);
    const login = await post('/api/auth/user/login', JSON.stringify({ email:'http-test@example.com', password:'Pass1234'}));
    console.log('login', login);
  }catch(e){console.error('err',e)}
})();