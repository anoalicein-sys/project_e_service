const mongoose = require('mongoose');
async function testAtlas() {
  try {
    const rawUri = 'mongodb://anoalicein_db_user:Ax8slTdbdF4DhsyS@ac-ew20ani-shard-00-00.gqnpyrd.mongodb.net:27017,ac-ew20ani-shard-00-01.gqnpyrd.mongodb.net:27017,ac-ew20ani-shard-00-02.gqnpyrd.mongodb.net:27017/service-management?ssl=true&replicaSet=atlas-9iyrig-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(rawUri);
    const db = mongoose.connection.db;
    
    // Fix Admin user
    await db.collection('users').updateOne(
      { email: 'admin@eservice.com' },
      { $set: { isActive: true } }
    );
    console.log('Fixed Admin isActive status');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
testAtlas();
