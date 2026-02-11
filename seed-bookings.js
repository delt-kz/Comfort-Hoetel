require('dotenv').config();
const connectDB = require('./database/mongo');

const roomTypes = [
  { name: 'Deluxe Suite', type: 'suite', pricePerNight: 250 },
  { name: 'Executive Room', type: 'executive', pricePerNight: 180 },
  { name: 'Standard Room', type: 'standard', pricePerNight: 120 },
  { name: 'Family Suite', type: 'family', pricePerNight: 300 },
  { name: 'Presidential Suite', type: 'presidential', pricePerNight: 500 },
  { name: 'Ocean View Room', type: 'ocean-view', pricePerNight: 220 },
  { name: 'Garden View Room', type: 'garden-view', pricePerNight: 150 }
];

const guestNames = [
  'John Smith', 'Emma Johnson', 'Michael Brown', 'Sarah Davis', 'David Wilson',
  'Lisa Martinez', 'Robert Anderson', 'Jennifer Taylor', 'William Thomas', 'Mary Jackson',
  'James White', 'Patricia Harris', 'Christopher Martin', 'Linda Thompson', 'Daniel Garcia',
  'Barbara Rodriguez', 'Matthew Lee', 'Elizabeth Walker', 'Joseph Hall', 'Susan Allen',
  'Charles Young', 'Jessica King', 'Thomas Wright', 'Nancy Lopez', 'Christopher Hill'
];

const specialRequests = [
  'Late check-in requested',
  'Extra pillows needed',
  'High floor preference',
  'Quiet room please',
  'Anniversary celebration - surprise flowers',
  'Honeymoon suite decoration',
  'Business trip - need workspace',
  'Early check-in if possible',
  'Near elevator',
  'Away from elevator',
  'Hypoallergenic bedding',
  'Extra towels',
  'Baby crib needed',
  'Pet-friendly room',
  '',
  '',
  ''
];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateBooking(index, creatorUser) {
  const room = roomTypes[Math.floor(Math.random() * roomTypes.length)];
  const guestName = guestNames[index % guestNames.length];
  const emailName = guestName.toLowerCase().replace(' ', '.');
  const guestEmail = `${emailName}@example.com`;

  const today = new Date();
  const checkInDate = randomDate(
    new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
    new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)
  );

  const duration = Math.floor(Math.random() * 7) + 1;
  const checkOutDate = new Date(checkInDate.getTime() + duration * 24 * 60 * 60 * 1000);
  const numberOfGuests = Math.floor(Math.random() * 4) + 1;
  const totalPrice = room.pricePerNight * duration;
  const guestPhone = `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  let status;
  if (checkInDate < today) {
    status = Math.random() > 0.3 ? 'completed' : 'checked-in';
  } else {
    status = Math.random() > 0.2 ? 'confirmed' : 'pending';
  }

  return {
    roomName: room.name,
    roomType: room.type,
    guestName,
    guestEmail,
    guestPhone,
    checkInDate,
    checkOutDate,
    duration,
    numberOfGuests,
    totalPrice,
    specialRequests: specialRequests[Math.floor(Math.random() * specialRequests.length)],
    status,
    created_at: new Date(checkInDate.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000),
    created_by_username: creatorUser.username,
    created_by_user_id: creatorUser._id
  };
}

async function seedBookings() {
  try {
    const db = await connectDB();
    const bookingsCollection = db.collection('bookings');

    const existingBookings = await bookingsCollection.countDocuments();
    if (existingBookings >= 20) {
      console.log('Database already contains 20+ bookings. Skipping seed.');
      console.log(`Found ${existingBookings} booking(s).`);
      process.exit(0);
    }

    const creatorUser = await db.collection('users').findOne({ role: 'admin' }) || await db.collection('users').findOne({ role: 'user' });
    if (!creatorUser) {
      throw new Error('No users found. Run node init-users.js first.');
    }

    console.log('Generating 25 realistic hotel bookings...\n');

    const bookings = [];
    for (let i = 0; i < 25; i++) {
      bookings.push(generateBooking(i, creatorUser));
    }

    const result = await bookingsCollection.insertMany(bookings);
    console.log(`Successfully inserted ${result.insertedCount} bookings.\n`);

    const statusCounts = {};
    bookings.forEach((b) => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    });

    console.log('Booking Statistics:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`${status.padEnd(15)}: ${count}`);
    });
    console.log(`Total Bookings: ${bookings.length}`);

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    console.log(`Total Revenue: $${totalRevenue.toFixed(2)}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding bookings:', error);
    process.exit(1);
  }
}

seedBookings();
