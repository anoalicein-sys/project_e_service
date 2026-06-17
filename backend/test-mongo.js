const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/service-management');
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({ role: 'Manager' }).toArray();
  console.log(users);
  process.exit(0);
}
test();
