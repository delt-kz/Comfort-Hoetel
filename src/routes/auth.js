const express = require('express');
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.get('/admin', authController.showAdminLogin);
router.get('/user', authController.showUserLogin);
router.post('/admin/login', authController.adminLogin);
router.post('/user/login', authController.userLogin);
router.post('/admin/logout', authController.logout);
router.get('/api/auth/status', authController.authStatus);
router.get('/admin/dashboard', isAuthenticated, authController.adminDashboard);

module.exports = router;
