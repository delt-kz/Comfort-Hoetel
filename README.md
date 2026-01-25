# Comfort Hotel - Booking System

A modern hotel booking system built with Node.js, Express, and MongoDB.

## Features

- **Room Booking System**: Complete booking functionality with room selection, date management, and pricing
- **Contact Management**: Contact form with full CRUD API
- **Admin Panel**: Secure admin dashboard for managing bookings and contacts
- **Modern UI**: Responsive design with Bootstrap 5
- **Multi-currency Support**: Currency conversion for room prices

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Required Variables:
- `PORT`: Server port (default: 3000)
- `MONGO_URI`: MongoDB connection string (default: mongodb://localhost:27017)

### Optional Variables:
- `ADMIN_USERNAME`: Admin panel username (default: admin)
- `ADMIN_PASSWORD`: Admin panel password (default: admin123)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your configuration

3. Start MongoDB (if running locally)

4. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000` (or your configured PORT)

## API Endpoints

### Contacts API
- `GET /api/contacts` - Get all contacts (supports filtering, sorting, projection)
- `GET /api/contacts/:id` - Get contact by ID
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Bookings API
- `GET /api/bookings` - Get all bookings (supports filtering, sorting, projection)
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Other API
- `GET /api/info` - Get API information

## Pages

- `/` - Home page
- `/rooms` - Room listings
- `/booking` - Booking form
- `/about` - About page
- `/contact` - Contact form
- `/admin` - Admin login
- `/admin/dashboard` - Admin dashboard (requires authentication)

## Booking System

The booking system includes:
- Room name/number
- Room type (Single, Double, Suite)
- Check-in and check-out dates
- Number of guests
- Guest information (name, email, phone)
- Special requests
- Automatic price calculation based on room type and duration
- Booking status management (pending, confirmed, cancelled)

## Admin Panel

Access the admin panel at `/admin` with default credentials:
- Username: `admin`
- Password: `admin123`

The admin panel allows you to:
- View and manage all bookings
- View and manage all contacts
- Update booking statuses
- Delete bookings and contacts
- View all available API endpoints

## Database

The application uses MongoDB with the following collections:
- `contacts` - Contact form submissions
- `bookings` - Hotel room bookings

## Technologies

- Node.js
- Express.js
- MongoDB
- Bootstrap 5
- jQuery
