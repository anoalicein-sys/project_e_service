async function testAudit() {
  try {
    const loginRes = await fetch('https://project-e-service-5xrt.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@eservice.com', password: 'AdminPassword123!' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    console.log('Login:', loginRes.status);
    
    const auditRes = await fetch('https://project-e-service-5xrt.onrender.com/api/audit', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const auditData = await auditRes.text();
    console.log('Audit Status:', auditRes.status);
    console.log('Audit Data:', auditData);
  } catch(e) {
    console.error(e);
  }
}
testAudit();
