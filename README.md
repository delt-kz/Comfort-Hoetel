# Comfort Hoetel - Final Project

Production-style hotel booking app on Node.js + Express + MongoDB.

## Requirements Coverage

- Node.js + Express backend
- MongoDB with multiple related collections (`users`, `bookings`, `contacts`, `sessions`)
- Modular structure (`src/routes`, `src/controllers`, `src/models`, `src/middleware`, `src/config`)
- Session authentication + bcrypt password hashing
- Roles: `admin` and `user`
- Owner access rule: non-admin users can edit/delete only their own records
- Admin has extended permissions (can edit/delete any booking/contact)
- All write endpoints protected by authentication
- Pagination for large datasets (`page`, `limit` query params)
- Environment variables for secrets (no hardcoded `SESSION_SECRET` / passwords)

## Project Structure

```text
Comfort-Hoetel/
  server.js
  src/
    app.js
    config/
      db.js
      env.js
      session.js
    controllers/
      authController.js
      bookingsController.js
      contactsController.js
      infoController.js
      pagesController.js
    middleware/
      auth.js
      errorHandlers.js
      logger.js
    models/
      bookingModel.js
      contactModel.js
      userModel.js
    routes/
      auth.js
      bookings.js
      contacts.js
      info.js
      pages.js
    utils/
      pagination.js
      validators.js
  database/mongo.js
  init-users.js
  seed-bookings.js
  views/
  public/
```

## Environment Variables

Create `.env`:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017
DB_NAME=assignment3
SESSION_SECRET=replace-with-strong-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-admin-password
USER_USERNAME=user
USER_PASSWORD=replace-user-password
```

## Run

```bash
npm install
node init-users.js
node seed-bookings.js
npm start
```

## Key Endpoints

- `POST /admin/login`
- `POST /user/login`
- `POST /admin/logout`
- `GET /api/auth/status`
- `GET /api/bookings?page=1&limit=20`
- `POST /api/bookings` (auth required)
- `PUT /api/bookings/:id` (owner or admin)
- `DELETE /api/bookings/:id` (owner or admin)
- `GET /api/contacts?page=1&limit=20`
- `POST /api/contacts` (auth required)
- `PUT /api/contacts/:id` (owner or admin)
- `DELETE /api/contacts/:id` (owner or admin)
- `POST /contact` (auth required)

## Notes for Defense

- Authentication: session-based (`express-session` + `connect-mongo`)
- Password security: bcrypt hash + compare
- Authorization: role check (`admin`) and ownership check (`created_by_user_id`)
- API security: all write operations require authenticated session
- Data scale: pagination headers (`X-Total-Count`, `X-Page`, `X-Limit`)
