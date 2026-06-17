const mongoose = require('mongoose');

async function seedMachines() {
  try {
    await mongoose.connect('mongodb://localhost:27017/service-management');
    console.log('Connected to DB for machine seeding...');

    const db = mongoose.connection.db;
    const users = db.collection('users');
    const machines = db.collection('machines');

    const customers = await users.find({ role: 'Customer' }).toArray();
    if (customers.length === 0) {
      console.log('No customers found. Cannot seed machines.');
      process.exit(1);
    }

    const machineDocs = [];
    customers.forEach((customer, index) => {
      machineDocs.push({
        customerId: customer._id,
        type: 'Industrial Generator',
        model: `GenX-${1000 + index}`,
        serialNo: `SN-IG-${Math.floor(Math.random() * 1000000)}`,
        status: 'Active',
        location: `Factory Unit ${index + 1}`,
        installDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      });
      machineDocs.push({
        customerId: customer._id,
        type: 'Heavy Duty Conveyor',
        model: `ConvMaster-${500 + index}`,
        serialNo: `SN-CV-${Math.floor(Math.random() * 1000000)}`,
        status: 'Active',
        location: `Assembly Line ${index + 1}`,
        installDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      });
    });

    await machines.insertMany(machineDocs);
    console.log(`Successfully seeded ${machineDocs.length} dummy machines.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
}

seedMachines();
