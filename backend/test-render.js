async function testRender() {
  try {
    const res = await fetch('https://project-e-service-5xrt.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@eservice.com',
        password: 'AdminPassword123!'
      })
    });
    const data = await res.json();
    console.log(res.status, data.message || data.user?.email);
  } catch(e) {
    console.error(e);
  }
}
testRender();
