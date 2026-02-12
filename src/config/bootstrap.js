const bcrypt = require('bcrypt');
const getDb = require('./db');

async function ensureUser(db, userData) {
  const existing = await db.collection('users').findOne({ username: userData.username });
  if (existing) return false;

  const passwordHash = await bcrypt.hash(userData.password, 10);
  await db.collection('users').insertOne({
    username: userData.username,
    password: passwordHash,
    role: userData.role,
    email: userData.email,
    fullName: userData.fullName,
    created_at: new Date()
  });
  return true;
}

async function bootstrapUsers() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const userPassword = process.env.USER_PASSWORD;

  if (!adminPassword || !userPassword) {
    console.warn('Bootstrap skipped: ADMIN_PASSWORD or USER_PASSWORD is missing');
    return;
  }

  const db = await getDb();
  const createdAdmin = await ensureUser(db, {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: adminPassword,
    role: 'admin',
    email: 'admin@comforthoetel.com',
    fullName: 'Administrator'
  });

  const createdUser = await ensureUser(db, {
    username: process.env.USER_USERNAME || 'user',
    password: userPassword,
    role: 'user',
    email: 'user@comforthoetel.com',
    fullName: 'Standard User'
  });

  if (createdAdmin || createdUser) {
    console.log(
      `Bootstrap users completed. Created admin=${createdAdmin}, user=${createdUser}`
    );
  }
}

module.exports = {
  bootstrapUsers
};
