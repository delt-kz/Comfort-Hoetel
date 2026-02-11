const express = require('express');
const pagesController = require('../controllers/pagesController');

const router = express.Router();

router.get('/', pagesController.home);
router.get('/about', pagesController.about);
router.get('/contact', pagesController.contact);
router.get('/rooms', pagesController.rooms);
router.get('/booking', pagesController.booking);
router.get('/1.jpg', pagesController.roomImage1);
router.get('/2.jpg', pagesController.roomImage2);
router.get('/3.jpg', pagesController.roomImage3);
router.get('/item/:id', pagesController.roomImage);

module.exports = router;
