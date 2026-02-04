require('dotenv').config();
const connectDB = require('./database/mongo');

/**
    * Скрипт для заполнения базы данных бронирований реалистичными данными
    * Запускается один раз для инициализации базы данных
    * Создает 25 бронирований с разными статусами и деталями
    * Выводит статистику по созданным бронированиям
 */

// Реалистичные данные
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

const statuses = ['confirmed', 'pending', 'checked-in', 'completed', 'cancelled'];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateBooking(index) {
  const room = roomTypes[Math.floor(Math.random() * roomTypes.length)];
  const guestName = guestNames[index % guestNames.length];
  
  // Generating email from name
  const emailName = guestName.toLowerCase().replace(' ', '.');
  const guestEmail = `${emailName}@example.com`;
  
  // Generating random dates (range from -30 days to +60 days from today)
  const today = new Date();
  const checkInDate = randomDate(
    new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
    new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)
  );
  
  // Duration from 1 to 7 nights
  const duration = Math.floor(Math.random() * 7) + 1;
  const checkOutDate = new Date(checkInDate.getTime() + duration * 24 * 60 * 60 * 1000);
  
  // Number of guests from 1 to 4
  const numberOfGuests = Math.floor(Math.random() * 4) + 1;
  
  // Calculating total price
  const totalPrice = room.pricePerNight * duration;
  
  // Generating phone number
  const guestPhone = `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  
  // Choosing status (more confirmed and pending for realism)
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
    created_at: new Date(checkInDate.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000) // Created 0-14 days before check-in
  };
}

async function seedBookings() {
  try {
    const db = await connectDB();
    const bookingsCollection = db.collection('bookings');

    // Checking if bookings already exist
    const existingBookings = await bookingsCollection.countDocuments();
    if (existingBookings >= 20) {
      console.log('⚠️  Database already contains 20+ bookings. Skipping seed.');
      console.log(`Found ${existingBookings} booking(s).`);
      process.exit(0);
    }

    console.log('🏨 Generating 25 realistic hotel bookings...\n');

    // Generating 25 bookings
    const bookings = [];
    for (let i = 0; i < 25; i++) {
      bookings.push(generateBooking(i));
    }

    // Inserting into database
    const result = await bookingsCollection.insertMany(bookings);
    
    console.log(`✅ Successfully inserted ${result.insertedCount} bookings!\n`);
    
    // Statistics
    const statusCounts = {};
    bookings.forEach(b => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    });
    
    console.log('📊 Booking Statistics:');
    console.log('─────────────────────────');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`${status.padEnd(15)}: ${count}`);
    });
    console.log('─────────────────────────');
    console.log(`Total Bookings  : ${bookings.length}`);
    
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    console.log(`Total Revenue   : $${totalRevenue.toFixed(2)}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding bookings:', error);
    process.exit(1);
  }
}

seedBookings();
