require('dotenv').config();
const bcrypt = require('bcrypt');
const connectDB = require('./database/mongo');

async function initializeUsers() {
  try {
    if (!process.env.ADMIN_PASSWORD || !process.env.USER_PASSWORD) {
      throw new Error('ADMIN_PASSWORD and USER_PASSWORD must be set in .env');
    }

    const db = await connectDB();
    const usersCollection = db.collection('users');

    const existingUsers = await usersCollection.countDocuments();
    if (existingUsers > 0) {
      console.log('Users already exist in database. Skipping initialization.');
      console.log(`Found ${existingUsers} user(s).`);
      process.exit(0);
    }

    console.log('Creating users with hashed passwords...');

    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await usersCollection.insertOne({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: adminPassword,
      role: 'admin',
      email: 'admin@comforthoetel.com',
      fullName: 'Administrator',
      created_at: new Date()
    });
    console.log('Admin user created');

    const userPassword = await bcrypt.hash(process.env.USER_PASSWORD, 10);
    await usersCollection.insertOne({
      username: process.env.USER_USERNAME || 'user',
      password: userPassword,
      role: 'user',
      email: 'user@comforthoetel.com',
      fullName: 'Standard User',
      created_at: new Date()
    });
    console.log('User account created');

    console.log('\nUser initialization completed successfully');
    console.log('\nCredentials:');
    console.log(`Admin - Username: ${process.env.ADMIN_USERNAME || 'admin'}, Password: [from ADMIN_PASSWORD]`);
    console.log(`User - Username: ${process.env.USER_USERNAME || 'user'}, Password: [from USER_PASSWORD]`);

    process.exit(0);
  } catch (error) {
    console.error('Error initializing users:', error);
    process.exit(1);
  }
}

initializeUsers();
