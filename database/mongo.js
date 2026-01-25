require('dotenv').config();
const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(url);

let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db('assignment3');
  }
  return db;
}

module.exports = connectDB;
