const { ObjectId } = require('mongodb');
const bookingModel = require('../models/bookingModel');
const { isValidEmail, isValidPhone, validateBookingDates } = require('../utils/validators');
const { parsePagination, applyPaginationHeaders } = require('../utils/pagination');
const { isOwnerOrAdmin } = require('../middleware/auth');

async function listBookings(req, res) {
  try {
    const filter = {};
    if (req.query.roomName) filter.roomName = req.query.roomName;
    if (req.query.guestEmail) filter.guestEmail = req.query.guestEmail;
    if (req.query.status) filter.status = req.query.status;

    const sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      sort.checkInDate = -1;
    }

    const projection = {};
    if (req.query.fields) {
      req.query.fields.split(',').forEach((f) => {
        const field = f.trim();
        if (field) projection[field] = 1;
      });
    }

    const pagination = parsePagination(req.query);
    const [bookings, totalCount] = await Promise.all([
      bookingModel.list(filter, projection, sort, pagination),
      pagination.enabled ? bookingModel.count(filter) : Promise.resolve(0)
    ]);

    if (pagination.enabled) {
      applyPaginationHeaders(res, pagination, totalCount);
    }

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function getBookingById(req, res) {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const booking = await bookingModel.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function createBooking(req, res) {
  const {
    roomName, roomType, guestName, guestEmail, guestPhone,
    checkInDate, checkOutDate, numberOfGuests, totalPrice, specialRequests
  } = req.body;

  if (!roomName || !roomType || !guestName || !guestEmail ||
      !checkInDate || !checkOutDate || !numberOfGuests || !totalPrice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!isValidEmail(guestEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (guestPhone && !isValidPhone(guestPhone)) {
    return res.status(400).json({ error: 'Invalid phone format' });
  }

  const dateValidation = validateBookingDates(checkInDate, checkOutDate);
  if (!dateValidation.valid) {
    return res.status(400).json({ error: dateValidation.error });
  }

  const guests = parseInt(numberOfGuests, 10);
  const price = parseFloat(totalPrice);

  if (Number.isNaN(guests) || guests < 1 || guests > 10) {
    return res.status(400).json({ error: 'Number of guests must be between 1 and 10' });
  }

  if (Number.isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'Invalid price' });
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  try {
    const doc = {
      roomName: roomName.trim(),
      roomType: roomType.trim(),
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone ? guestPhone.trim() : '',
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      duration,
      numberOfGuests: guests,
      totalPrice: price,
      specialRequests: specialRequests ? specialRequests.trim() : '',
      status: 'pending',
      created_at: new Date(),
      created_by_username: req.session.user.username,
      created_by_user_id: new ObjectId(req.session.user.id)
    };

    const result = await bookingModel.insertOne(doc);

    return res.status(201).json({
      message: 'Booking created successfully',
      id: result.insertedId
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function updateBooking(req, res) {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const {
    roomName, roomType, guestName, guestEmail, guestPhone,
    checkInDate, checkOutDate, numberOfGuests, totalPrice, specialRequests, status
  } = req.body;

  if (!roomName || !roomType || !guestName || !guestEmail ||
      !checkInDate || !checkOutDate || !numberOfGuests || !totalPrice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!isValidEmail(guestEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (guestPhone && !isValidPhone(guestPhone)) {
    return res.status(400).json({ error: 'Invalid phone format' });
  }

  const dateValidation = validateBookingDates(checkInDate, checkOutDate);
  if (!dateValidation.valid) {
    return res.status(400).json({ error: dateValidation.error });
  }

  const guests = parseInt(numberOfGuests, 10);
  const price = parseFloat(totalPrice);

  if (Number.isNaN(guests) || guests < 1 || guests > 10) {
    return res.status(400).json({ error: 'Number of guests must be between 1 and 10' });
  }

  if (Number.isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'Invalid price' });
  }

  const validStatuses = ['pending', 'confirmed', 'checked-in', 'completed', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const existing = await bookingModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!isOwnerOrAdmin(req.session.user, existing)) {
      return res.status(403).json({ error: 'You can only modify your own bookings' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    const updateData = {
      roomName: roomName.trim(),
      roomType: roomType.trim(),
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone ? guestPhone.trim() : '',
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      duration,
      numberOfGuests: guests,
      totalPrice: price,
      specialRequests: specialRequests ? specialRequests.trim() : '',
      updated_at: new Date(),
      updated_by_username: req.session.user.username,
      updated_by_user_id: new ObjectId(req.session.user.id)
    };

    if (status) {
      updateData.status = status;
    }

    const updatedBooking = await bookingModel.updateById(req.params.id, updateData);
    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function deleteBooking(req, res) {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const existing = await bookingModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!isOwnerOrAdmin(req.session.user, existing)) {
      return res.status(403).json({ error: 'You can only delete your own bookings' });
    }

    const result = await bookingModel.deleteById(req.params.id);
    if (!result || result.deletedCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

module.exports = {
  listBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking
};
