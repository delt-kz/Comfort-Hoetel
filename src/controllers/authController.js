const path = require('path');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

async function adminLogin(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await userModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Admin privileges required.',
        hint: 'Please use the User Login page'
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      email: user.email,
      fullName: user.fullName
    };

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Session error' });
      }

      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        user: {
          username: user.username,
          role: user.role,
          fullName: user.fullName
        }
      });
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function userLogin(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await userModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        error: 'Access denied. Please use Admin Login.',
        hint: 'Administrators must login through /admin'
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      email: user.email,
      fullName: user.fullName
    };

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Session error' });
      }

      return res.status(200).json({
        success: true,
        message: 'User login successful',
        user: {
          username: user.username,
          role: user.role,
          fullName: user.fullName
        }
      });
    });
  } catch (error) {
    console.error('User login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('sessionId');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
}

function authStatus(req, res) {
  if (req.session && req.session.user) {
    return res.status(200).json({
      authenticated: true,
      user: req.session.user
    });
  }
  return res.status(200).json({ authenticated: false });
}

function showAdminLogin(req, res) {
  if (req.session && req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  return res.sendFile(path.join(__dirname, '..', '..', 'views', 'admin-login.html'));
}

function showUserLogin(req, res) {
  if (req.session && req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  return res.sendFile(path.join(__dirname, '..', '..', 'views', 'user-login.html'));
}

function adminDashboard(req, res) {
  return res.sendFile(path.join(__dirname, '..', '..', 'views', 'admin-dashboard.html'));
}

module.exports = {
  adminLogin,
  userLogin,
  logout,
  authStatus,
  showAdminLogin,
  showUserLogin,
  adminDashboard
};
