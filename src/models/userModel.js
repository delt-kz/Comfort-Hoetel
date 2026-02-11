const { ObjectId } = require('mongodb');
const getDb = require('../config/db');

async function findByUsername(username) {
  const db = await getDb();
  return db.collection('users').findOne({ username });
}

async function findById(id) {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  return db.collection('users').findOne({ _id: new ObjectId(id) });
}

module.exports = {
  findByUsername,
  findById
};
