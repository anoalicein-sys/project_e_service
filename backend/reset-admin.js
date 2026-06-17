const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function reset() {
  await mongoose.connect('mongodb://localhost:27017/service-management');
  console.log('Connected to DB');

  const db = mongoose.connection.db;
  const users = db.collection('users');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('AdminPassword123!', salt);

  const result = await users.updateOne(
    { role: 'Admin' },
    { $set: { email: 'admin@eservice.com', passwordHash: passwordHash, name: 'System Admin' } },
    { upsert: true }
  );

  console.log('Admin user reset successfully. Credentials: admin@eservice.com / AdminPassword123!');
  process.exit(0);
}

reset().catch(console.error);
