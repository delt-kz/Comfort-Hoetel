const express = require('express');
const infoController = require('../controllers/infoController');

const router = express.Router();

router.get('/info', infoController.info);

module.exports = router;
