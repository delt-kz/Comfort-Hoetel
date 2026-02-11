function info(req, res) {
  res.status(200).json({
    project: 'Comfort Hoetel - Final Project',
    description: 'Hotel Booking System with Session-based Authentication',
    version: '3.0.0',
    features: [
      'Session-based authentication',
      'Bcrypt password hashing',
      'HttpOnly & Secure cookies',
      'CRUD operations for bookings',
      'Protected write operations',
      'Owner-based access control',
      'Pagination support'
    ]
  });
}

module.exports = {
  info
};
