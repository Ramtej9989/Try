// init-db.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function initializeDatabase() {
  const uri = 'mongodb+srv://tejbonthu45_db_user:k476QemWIp0ZYusO@cyberintelcluster.q7kvfn9.mongodb.net/?retryWrites=true&w=majority&appName=CyberIntelCluster';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db("soc_platform");
    
    // Check if users collection exists and create it if not
    const collections = await db.listCollections().toArray();
    if (!collections.some(col => col.name === 'users')) {
      await db.createCollection('users');
      console.log("Created users collection");
    }
    
    // Check if admin user already exists
    const adminExists = await db.collection('users').findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      // Create admin user
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      await db.collection('users').insertOne({
        name: 'Admin User',
        email: 'admin@example.com',
        password_hash: adminPasswordHash,
        role: 'ADMIN',
        createdAt: new Date()
      });
      console.log("Created admin user");
    } else {
      console.log("Admin user already exists");
    }
    
    // Check if analyst user already exists
    const analystExists = await db.collection('users').findOne({ email: 'analyst@example.com' });
    
    if (!analystExists) {
      // Create analyst user
      const analystPasswordHash = await bcrypt.hash('analyst123', 10);
      await db.collection('users').insertOne({
        name: 'Analyst User',
        email: 'analyst@example.com',
        password_hash: analystPasswordHash,
        role: 'ANALYST',
        createdAt: new Date()
      });
      console.log("Created analyst user");
    } else {
      console.log("Analyst user already exists");
    }
    
    console.log("Database initialization complete");
  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

initializeDatabase();
