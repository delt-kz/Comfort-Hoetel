const { ObjectId } = require('mongodb');
const getDb = require('../config/db');

async function list(filter, projection, sort, pagination) {
  const db = await getDb();
  let cursor = db.collection('contacts').find(filter);

  if (projection && Object.keys(projection).length > 0) {
    cursor = cursor.project(projection);
  }

  if (sort && Object.keys(sort).length > 0) {
    cursor = cursor.sort(sort);
  }

  if (pagination && pagination.enabled) {
    cursor = cursor.skip(pagination.skip).limit(pagination.limit);
  }

  return cursor.toArray();
}

async function count(filter) {
  const db = await getDb();
  return db.collection('contacts').countDocuments(filter);
}

async function findById(id) {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  return db.collection('contacts').findOne({ _id: new ObjectId(id) });
}

async function insertOne(doc) {
  const db = await getDb();
  return db.collection('contacts').insertOne(doc);
}

async function updateById(id, updateDoc) {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const result = await db
    .collection('contacts')
    .updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });
  if (result.matchedCount === 0) return null;
  return db.collection('contacts').findOne({ _id: new ObjectId(id) });
}

async function deleteById(id) {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  return db.collection('contacts').deleteOne({ _id: new ObjectId(id) });
}

module.exports = {
  list,
  count,
  findById,
  insertOne,
  updateById,
  deleteById
};
