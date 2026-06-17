require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User').default;
const { generateToken } = require('./src/utils/auth');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/service-management');
  
  const admin = await User.findOne({ role: 'Admin' });
  const token = generateToken(admin._id.toString(), 'Admin');
  
  const res = await fetch('http://localhost:5000/api/users?role=Manager', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}
test();
