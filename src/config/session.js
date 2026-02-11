const session = require('express-session');
const MongoStore = require('connect-mongo');

const isProduction = process.env.NODE_ENV === 'production';

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017',
    dbName: process.env.DB_NAME || 'assignment3',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60
  }),
  cookie: {
    httpOnly: true,
    secure: isProduction ? 'auto' : false,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  },
  name: 'sessionId'
});

module.exports = sessionMiddleware;
