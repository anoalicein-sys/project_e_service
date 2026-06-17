const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function seedData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/service-management');
    console.log('Connected to DB for dummy seeding...');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('TestPassword123!', salt);

    // 1. Create Manager
    const managerRes = await users.insertOne({
      name: 'Michael Manager',
      email: 'manager1@eservice.com',
      passwordHash,
      role: 'Manager',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const managerId = managerRes.insertedId;
    console.log('Inserted 1 Manager:', managerId);

    // 2. Create 2 Engineers (Assigned to Manager)
    const engineerDocs = [
      {
        name: 'Sarah Engineer',
        email: 'engineer1@eservice.com',
        passwordHash,
        role: 'Engineer',
        managerId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'David Engineer',
        email: 'engineer2@eservice.com',
        passwordHash,
        role: 'Engineer',
        managerId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await users.insertMany(engineerDocs);
    console.log('Inserted 2 Engineers.');

    // 3. Create 5 Customers
    const customerDocs = [];
    for (let i = 1; i <= 5; i++) {
      customerDocs.push({
        name: `Customer Client ${i}`,
        email: `customer${i}@eservice.com`,
        passwordHash,
        role: 'Customer',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    await users.insertMany(customerDocs);
    console.log('Inserted 5 Customers.');

    console.log('Seeding Complete! All passwords are: TestPassword123!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
}

seedData();
