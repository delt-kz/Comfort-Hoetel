const express = require('express');
const path = require('path');
const { validateEnv } = require('./config/env');
const sessionMiddleware = require('./config/session');
const requestLogger = require('./middleware/logger');
const { apiNotFound, notFound, errorHandler } = require('./middleware/errorHandlers');

const pagesRoutes = require('./routes/pages');
const authRoutes = require('./routes/auth');
const infoRoutes = require('./routes/info');
const contactsRoutes = require('./routes/contacts');
const bookingsRoutes = require('./routes/bookings');

validateEnv();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(sessionMiddleware);
app.use(requestLogger);

app.use(pagesRoutes);
app.use(authRoutes);
app.use('/api', infoRoutes);
app.use(contactsRoutes);
app.use('/api/bookings', bookingsRoutes);

app.use('/api', apiNotFound);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
