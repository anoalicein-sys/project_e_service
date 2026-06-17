async function testLogin() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@eservice.com',
        password: 'AdminPassword123!'
      })
    });
    const data = await res.json();
    if (res.ok) {
      console.log('Login Success:', data.user.email);
    } else {
      console.log('Login Failed:', data);
    }
  } catch (err) {
    console.error('Network Error:', err.message);
  }
}

testLogin();
