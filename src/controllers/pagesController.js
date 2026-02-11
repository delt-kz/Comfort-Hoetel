const path = require('path');

function sendPage(res, fileName) {
  return res.sendFile(path.join(__dirname, '..', '..', 'views', fileName));
}

function home(req, res) {
  return sendPage(res, 'index.html');
}

function about(req, res) {
  return sendPage(res, 'about.html');
}

function contact(req, res) {
  return sendPage(res, 'contact.html');
}

function rooms(req, res) {
  return sendPage(res, 'rooms.html');
}

function booking(req, res) {
  return sendPage(res, 'booking.html');
}

function roomImage(req, res) {
  const itemId = req.params.id;
  const imagePath = path.join(__dirname, '..', '..', 'views', `${itemId}.jpg`);
  return res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).send('Image not found');
    }
  });
}

function namedRoomImage(fileName) {
  return (req, res) => res.sendFile(path.join(__dirname, '..', '..', 'views', fileName));
}

module.exports = {
  home,
  about,
  contact,
  rooms,
  booking,
  roomImage,
  roomImage1: namedRoomImage('1.jpg'),
  roomImage2: namedRoomImage('2.jpg'),
  roomImage3: namedRoomImage('3.jpg')
};
