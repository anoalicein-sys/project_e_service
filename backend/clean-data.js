const mongoose = require('mongoose');

async function cleanData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/service-management');
    console.log('Connected to DB. Cleaning up user data...');

    const db = mongoose.connection.db;
    const users = db.collection('users');
    const machines = db.collection('machines');
    const tickets = db.collection('servicerequests');
    const reports = db.collection('servicereports');

    // Find the dummy users and admin
    // Typically dummy users have emails ending in @eservice.com or we can match names.
    const keepEmails = [
      'admin@eservice.com',
      'manager1@eservice.com',
      'engineer1@eservice.com',
      'engineer2@eservice.com',
      'customer1@eservice.com',
      'customer2@eservice.com',
      'customer3@eservice.com',
      'customer4@eservice.com',
      'customer5@eservice.com',
    ];

    // Find users to delete
    const usersToDelete = await users.find({ email: { $nin: keepEmails } }).toArray();
    const userIdsToDelete = usersToDelete.map(u => u._id);

    if (userIdsToDelete.length > 0) {
      console.log(`Deleting ${userIdsToDelete.length} manual users...`);
      await users.deleteMany({ _id: { $in: userIdsToDelete } });
      
      // Also delete machines, tickets, reports associated with deleted users
      console.log('Deleting associated machines, tickets, reports...');
      await machines.deleteMany({ customerId: { $in: userIdsToDelete } });
      await tickets.deleteMany({ customerId: { $in: userIdsToDelete } });
      await reports.deleteMany({ customerId: { $in: userIdsToDelete } });
    }

    console.log('Cleanup complete! Only admin and purely dummy data remain.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanData();
