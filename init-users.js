require('dotenv').config();
const bcrypt = require('bcrypt');
const connectDB = require('./database/mongo');

/**
 * Скрипт для создания пользователей с хешированными паролями
 * Запускается один раз для инициализации базы данных
 */
async function initializeUsers() {
  try {
    const db = await connectDB();
    const usersCollection = db.collection('users');

    // checks if users already exist
    const existingUsers = await usersCollection.countDocuments();
    if (existingUsers > 0) {
      console.log('⚠️  Users already exist in database. Skipping initialization.');
      console.log(`Found ${existingUsers} user(s).`);
      process.exit(0);
    }

    console.log('🔐 Creating users with hashed passwords...');

    // Creating admin user
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    await usersCollection.insertOne({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: adminPassword,
      role: 'admin',
      email: 'admin@comforthoetel.com',
      fullName: 'Administrator',
      created_at: new Date()
    });
    console.log('✅ Admin user created');

    // Creating manager user
    const managerPassword = await bcrypt.hash('manager123', 10);
    await usersCollection.insertOne({
      username: 'manager',
      password: managerPassword,
      role: 'manager',
      email: 'manager@comforthoetel.com',
      fullName: 'Hotel Manager',
      created_at: new Date()
    });
    console.log('✅ Manager user created');

    console.log('\n🎉 User initialization completed successfully!');
    console.log('\nCredentials:');
    console.log('Admin - Username: admin, Password: admin123');
    console.log('Manager - Username: manager, Password: manager123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing users:', error);
    process.exit(1);
  }
}

initializeUsers();
