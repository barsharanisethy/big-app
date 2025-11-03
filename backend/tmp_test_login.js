(async ()=>{
  const fetch = globalThis.fetch || (await import('node-fetch')).default;
  try {
    const regRes = await fetch('http://localhost:3000/api/auth/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Cli Test', email: 'cli-test@example.com', password: 'TestPass123' })
    });
    console.log('register status', regRes.status);
    console.log('register body', await regRes.text());

    const loginRes = await fetch('http://localhost:3000/api/auth/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'cli-test@example.com', password: 'TestPass123' })
    });
    console.log('login status', loginRes.status);
    console.log('login body', await loginRes.text());
  } catch (err) {
    console.error(err);
  }
})();