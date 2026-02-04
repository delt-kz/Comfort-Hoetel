# 🏨 Comfort Hoetel - Hotel Booking System

## Assignment 4: Session-Based Authentication & CRUD Operations

### 📋 Project Overview

Modern hotel booking system with secure session-based authentication, full CRUD operations for bookings management, and production-ready security features.

### ✨ Key Features

#### 🔐 Security Features
- **Session-based Authentication** using express-session
- **Bcrypt Password Hashing** (no plain-text passwords)
- **HttpOnly Cookies** (protection against XSS)
- **Secure Cookies** in production (HTTPS only)
- **SameSite Cookie Policy** (CSRF protection)
- **Protected API Endpoints** with middleware
- **Generic Error Messages** (no information leakage)

#### 📊 CRUD Operations
- **CREATE**: Add new hotel bookings
- **READ**: View all bookings with filtering and sorting
- **UPDATE**: Modify existing bookings
- **DELETE**: Remove bookings

#### 🎯 Domain Data (Bookings Entity)
Each booking contains **10 meaningful fields**:
1. `roomName` - Name of the hotel room
2. `roomType` - Type/category of room
3. `guestName` - Full name of guest
4. `guestEmail` - Guest's email address
5. `guestPhone` - Contact phone number
6. `checkInDate` - Check-in date
7. `checkOutDate` - Check-out date
8. `duration` - Length of stay (auto-calculated)
9. `numberOfGuests` - Number of people
10. `totalPrice` - Total booking cost
11. `specialRequests` - Additional notes
12. `status` - Booking status (pending, confirmed, etc.)

### 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB (with connection pooling)
- **Session Store**: MongoDB (connect-mongo)
- **Authentication**: bcrypt + express-session
- **Frontend**: HTML5, Bootstrap 5, Vanilla JavaScript
- **Security**: HttpOnly cookies, CSRF protection

### 📦 Installation & Setup

#### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- Git

#### Step 1: Install Dependencies
```bash
npm install
```

This installs:
- `express` - Web framework
- `express-session` - Session management
- `connect-mongo` - MongoDB session store
- `bcrypt` - Password hashing
- `mongodb` - Database driver
- `dotenv` - Environment variables

#### Step 2: Configure Environment
Create/update `.env` file with your settings:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
SESSION_SECRET=your-secret-key-change-in-production-please
NODE_ENV=development
```

⚠️ **IMPORTANT**: Change `SESSION_SECRET` and `ADMIN_PASSWORD` in production!

#### Step 3: Initialize Database

**Initialize admin users:**
```bash
node init-users.js
```

This creates:
- Admin user: `admin / admin123`
- Manager user: `manager / manager123`

**Seed database with sample bookings (25 realistic records):**
```bash
node seed-bookings.js
```

#### Step 4: Start the Server
```bash
npm start
```

Server runs on: `http://localhost:3000`

### 🚀 Usage Guide

#### Public Access
- **Home**: http://localhost:3000/
- **Rooms**: http://localhost:3000/rooms
- **Booking Form**: http://localhost:3000/booking
- **About**: http://localhost:3000/about
- **Contact**: http://localhost:3000/contact

#### Admin Access
- **Login**: http://localhost:3000/admin
- **Dashboard**: http://localhost:3000/admin/dashboard (requires login)

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

### 🔒 Security Implementation

#### 1. Session Configuration
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    dbName: 'assignment3',
    collectionName: 'sessions'
  }),
  cookie: {
    httpOnly: true,      // Cannot be accessed via JavaScript
    secure: true,        // HTTPS only in production
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    sameSite: 'strict'   // CSRF protection
  }
}));
```

#### 2. Password Hashing (bcrypt)
```javascript
// Hash password during user creation
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password during login
const isValid = await bcrypt.compare(password, user.password);
```

#### 3. Authentication Middleware
```javascript
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
}
```

#### 4. Protected Routes
All write operations (POST, PUT, DELETE) require authentication:
```javascript
app.post('/api/bookings', isAuthenticated, async (req, res) => { ... });
app.put('/api/bookings/:id', isAuthenticated, async (req, res) => { ... });
app.delete('/api/bookings/:id', isAuthenticated, async (req, res) => { ... });
```

### 📊 API Endpoints

#### Authentication
- `POST /admin/login` - Login with credentials
- `POST /admin/logout` - Destroy session
- `GET /api/auth/status` - Check authentication status

#### Bookings CRUD
- `GET /api/bookings` - Get all bookings (no auth required for demo)
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create booking (**protected**)
- `PUT /api/bookings/:id` - Update booking (**protected**)
- `DELETE /api/bookings/:id` - Delete booking (**protected**)

### 🎓 Defense Preparation

#### Session Explanation
**Q: How do sessions work?**
A: 
1. User logs in with credentials
2. Server validates credentials using bcrypt
3. Server creates a session object and stores it in MongoDB
4. Server sends session ID to client as an HttpOnly cookie
5. Client sends cookie with every request
6. Server validates session ID and retrieves user data
7. Session expires after 24 hours or on logout

#### Cookie Security
**Q: What are HttpOnly and Secure flags?**
A:
- **HttpOnly**: Cookie cannot be accessed via JavaScript (`document.cookie`), preventing XSS attacks
- **Secure**: Cookie only sent over HTTPS connections, preventing man-in-the-middle attacks
- **SameSite**: Prevents CSRF attacks by not sending cookies on cross-site requests

#### Authentication vs Authorization
**Q: What's the difference?**
A:
- **Authentication**: Verifying WHO you are (login with username/password)
- **Authorization**: Verifying WHAT you can do (checking permissions/roles)

Example in our app:
- Authentication: `isAuthenticated()` middleware checks if user is logged in
- Authorization: `isAdmin()` middleware checks if user has admin role

### 📝 Validation & Error Handling

#### Input Validation
- Email format validation
- Phone number format validation
- Date validation (check-in must be before check-out)
- Number range validation (guests: 1-10)
- Required field validation

#### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### 🌐 Deployment

For production deployment (Render, Railway, Vercel, etc.):

1. **Update environment variables:**
   ```env
   NODE_ENV=production
   SESSION_SECRET=<strong-random-secret>
   MONGO_URI=<your-production-mongodb-uri>
   ```

2. **Ensure Secure cookies:**
   ```javascript
   secure: process.env.NODE_ENV === 'production'  // Already configured
   ```

3. **Create users on production database:**
   ```bash
   node init-users.js
   node seed-bookings.js
   ```

### 📁 Project Structure

```
Comfort-Hoetel/
├── server.js              # Main application server
├── init-users.js          # User initialization script
├── seed-bookings.js       # Database seeding script
├── package.json           # Dependencies
├── .env                   # Environment variables
├── database/
│   └── mongo.js          # MongoDB connection
├── views/
│   ├── index.html        # Home page
│   ├── admin-login.html  # Login page
│   ├── admin-dashboard.html  # CRUD dashboard
│   ├── rooms.html        # Rooms catalog
│   ├── booking.html      # Public booking form
│   ├── about.html        # About page
│   ├── contact.html      # Contact page
│   └── 404.html          # Error page
└── public/
    └── style.css         # Styles
```

### 🐛 Troubleshooting

#### Issue: "Session not persisting"
Solution: Check MongoDB connection and ensure `connect-mongo` is configured correctly.

#### Issue: "401 Unauthorized on CRUD operations"
Solution: Make sure you're logged in. Session cookie must be present.

#### Issue: "Users not found"
Solution: Run `node init-users.js` to create initial users.

#### Issue: "Empty bookings table"
Solution: Run `node seed-bookings.js` to populate database.

### ✅ Assignment Requirements Checklist

- [x] Node.js + Express backend
- [x] MongoDB database connection
- [x] Session-based authentication
- [x] Bcrypt password hashing
- [x] HttpOnly cookies
- [x] Secure cookies (production)
- [x] Protected write operations (POST, PUT, DELETE)
- [x] Authentication middleware
- [x] Full CRUD via Web UI
- [x] Domain-specific entity (Bookings, not "items")
- [x] 8+ meaningful fields per entity
- [x] 20+ realistic database records
- [x] Input validation
- [x] Proper HTTP status codes
- [x] Error handling
- [x] Generic error messages
- [x] No sensitive data in cookies
- [x] No plain-text passwords

### 👥 Contributors

**Our Team** - Comfort Hoetel Development

### 📄 License

This project is for educational purposes as part of Web Programming Course Assignment 4.

---

**🎉 Ready for defense!** All requirements implemented with production-grade security practices.
