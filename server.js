require('dotenv').config();
const express = require('express');
const path = require('path');
const { ObjectId } = require('mongodb');
const connectDB = require('./database/mongo');

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.get('/rooms', (req, res) => {
  const roomsPath = path.join(__dirname, 'views', 'rooms.html');
  res.sendFile(roomsPath, (err) => {
    if (err) {
      console.error('Error serving rooms.html:', err);
      res.status(404).send('Rooms page not found');
    }
  });
});

app.get('/item/:id', (req, res) => {
  const itemId = req.params.id;
  const imagePath = path.join(__dirname, 'views', `${itemId}.jpg`);
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).send('Image not found');
    }
  });
});

// Serve room images (1.jpg, 2.jpg, 3.jpg) for rooms.html
app.get('/1.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', '1.jpg'));
});

app.get('/2.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', '2.jpg'));
});

app.get('/3.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', '3.jpg'));
});


app.get('/api/info', (req, res) => {
  res.status(200).json({
    project: 'Assignment 3 Part 1',
    description: 'Backend API with MongoDB',
    author: 'Our Team'
  });
});

/* GET ALL (filter, sort, projection) */
app.get('/api/contacts', async (req, res) => {
  try {
    const db = await connectDB();

    // Build filter object
    const filter = {};
    if (req.query.email) {
      filter.email = req.query.email;
    }
    if (req.query.name) {
      filter.name = req.query.name;
    }

    // Build sort object (supports sortBy and sortOrder)
    const sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      // Default sort by created_at descending
      sort.created_at = -1;
    }

    // Build projection object
    const projection = {};
    if (req.query.fields) {
      req.query.fields.split(',').forEach(f => {
        const field = f.trim();
        if (field) projection[field] = 1;
      });
    }

    const contacts = await db
      .collection('contacts')
      .find(filter)
      .project(Object.keys(projection).length > 0 ? projection : null)
      .sort(sort)
      .toArray();

    res.status(200).json(contacts);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/* GET BY ID */
app.get('/api/contacts/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const db = await connectDB();
    const contact = await db.collection('contacts').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/* CREATE */
app.post('/api/contacts', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const db = await connectDB();
    const result = await db.collection('contacts').insertOne({
      name,
      email,
      message,
      created_at: new Date()
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/* UPDATE */
app.put('/api/contacts/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const db = await connectDB();
    const result = await db.collection('contacts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, email, message } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Return the updated record
    const updatedContact = await db.collection('contacts').findOne({
      _id: new ObjectId(req.params.id)
    });

    res.status(200).json(updatedContact);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/* DELETE */
app.delete('/api/contacts/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const db = await connectDB();
    const result = await db.collection('contacts').deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send('All fields are required');
  }

  try {
    const db = await connectDB();

    await db.collection('contacts').insertOne({
      name,
      email,
      message,
      created_at: new Date()
    });

    res.send(`<h2>Thanks, ${name}! Your message has been saved.</h2><a href="/">Back</a>`);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Error saving data');
  }
});

// Booking routes
app.get('/booking', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'booking.html'));
});

// Admin routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  // Simple authentication check via query parameter
  // In production, use proper session management (express-session)
  const isAuthenticated = req.query.authenticated === 'true';
  if (!isAuthenticated) {
    return res.redirect('/admin?error=Please login first');
  }
  res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html'));
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  // Default admin credentials
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Simple authentication - redirect with authenticated flag
    res.redirect('/admin/dashboard?authenticated=true');
  } else {
    res.redirect('/admin?error=Invalid credentials');
  }
});

// BOOKING API ENDPOINTS

/* GET ALL BOOKINGS */
app.get('/api/bookings', async (req, res) => {
  try {
    const db = await connectDB();

    const filter = {};
    if (req.query.roomName) {
      filter.roomName = req.query.roomName;
    }
    if (req.query.guestEmail) {
      filter.guestEmail = req.query.guestEmail;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      sort.checkInDate = -1;
    }

    const projection = {};
    if (req.query.fields) {
      req.query.fields.split(',').forEach(f => {
        const field = f.trim();
        if (field) projection[field] = 1;
      });
    }

    const bookings = await db
      .collection('bookings')
      .find(filter)
      .project(Object.keys(projection).length > 0 ? projection : null)
      .sort(sort)
      .toArray();

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/* GET BOOKING BY ID */
app.get('/api/bookings/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const db = await connectDB();
    const booking = await db.collection('bookings').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/* CREATE BOOKING */
app.post('/api/bookings', async (req, res) => {
  const { roomName, roomType, guestName, guestEmail, guestPhone, checkInDate, checkOutDate, numberOfGuests, totalPrice, specialRequests } = req.body;

  if (!roomName || !roomType || !guestName || !guestEmail || !checkInDate || !checkOutDate || !numberOfGuests || !totalPrice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Calculate duration
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  if (duration <= 0) {
    return res.status(400).json({ error: 'Check-out date must be after check-in date' });
  }

  try {
    const db = await connectDB();
    const result = await db.collection('bookings').insertOne({
      roomName,
      roomType,
      guestName,
      guestEmail,
      guestPhone: guestPhone || '',
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      duration,
      numberOfGuests: parseInt(numberOfGuests),
      totalPrice: parseFloat(totalPrice),
      specialRequests: specialRequests || '',
      status: 'pending',
      created_at: new Date()
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/* UPDATE BOOKING */
app.put('/api/bookings/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const { roomName, roomType, guestName, guestEmail, guestPhone, checkInDate, checkOutDate, numberOfGuests, totalPrice, specialRequests, status } = req.body;

  if (!roomName || !roomType || !guestName || !guestEmail || !checkInDate || !checkOutDate || !numberOfGuests || !totalPrice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  if (duration <= 0) {
    return res.status(400).json({ error: 'Check-out date must be after check-in date' });
  }

  try {
    const db = await connectDB();
    const updateData = {
      roomName,
      roomType,
      guestName,
      guestEmail,
      guestPhone: guestPhone || '',
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      duration,
      numberOfGuests: parseInt(numberOfGuests),
      totalPrice: parseFloat(totalPrice),
      specialRequests: specialRequests || '',
      updated_at: new Date()
    };

    if (status) {
      updateData.status = status;
    }

    const result = await db.collection('bookings').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const updatedBooking = await db.collection('bookings').findOne({
      _id: new ObjectId(req.params.id)
    });

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/* DELETE BOOKING */
app.delete('/api/bookings/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const db = await connectDB();
    const result = await db.collection('bookings').deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Global 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Global 404 handler for non-API routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
