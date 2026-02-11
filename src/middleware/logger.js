function requestLogger(req, res, next) {
  const username = req.session && req.session.user ? req.session.user.username : 'guest';
  console.log(`${req.method} ${req.url} - User: ${username}`);
  next();
}

module.exports = requestLogger;
