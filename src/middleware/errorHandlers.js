const path = require('path');

function apiNotFound(req, res) {
  res.status(404).json({ error: 'API endpoint not found' });
}

function notFound(req, res) {
  res.status(404).sendFile(path.join(__dirname, '..', '..', 'views', '404.html'));
}

function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);
  if (req.path && req.path.startsWith('/api/')) {
    return res.status(500).json({ error: 'Internal server error' });
  }
  return res.status(500).send('Internal server error');
}

module.exports = {
  apiNotFound,
  notFound,
  errorHandler
};
