function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  if (req.path.startsWith('/api/')) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to perform this action'
    });
  }

  const loginPath = req.path.startsWith('/admin') ? '/admin' : '/user';
  return res.redirect(`${loginPath}?error=Please login first`);
}

function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }

  if (req.path.startsWith('/api/')) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin privileges required'
    });
  }

  return res.status(403).send('Access denied: Admin privileges required');
}

function isOwnerOrAdmin(user, resource) {
  if (!user || !resource) return false;
  if (user.role === 'admin') return true;
  if (resource.created_by_user_id) {
    return String(resource.created_by_user_id) === String(user.id);
  }
  if (resource.created_by_username) {
    return String(resource.created_by_username) === String(user.username);
  }
  if (resource.created_by) {
    return String(resource.created_by) === String(user.username);
  }
  return false;
}

module.exports = {
  isAuthenticated,
  isAdmin,
  isOwnerOrAdmin
};
