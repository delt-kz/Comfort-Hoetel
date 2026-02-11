const express = require('express');
const bookingsController = require('../controllers/bookingsController');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.get('/', bookingsController.listBookings);
router.get('/:id', bookingsController.getBookingById);
router.post('/', isAuthenticated, bookingsController.createBooking);
router.put('/:id', isAuthenticated, bookingsController.updateBooking);
router.delete('/:id', isAuthenticated, bookingsController.deleteBooking);

module.exports = router;
