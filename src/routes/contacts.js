const express = require('express');
const contactsController = require('../controllers/contactsController');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.get('/api/contacts', contactsController.listContacts);
router.get('/api/contacts/:id', contactsController.getContactById);
router.post('/api/contacts', isAuthenticated, contactsController.createContact);
router.put('/api/contacts/:id', isAuthenticated, contactsController.updateContact);
router.delete('/api/contacts/:id', isAuthenticated, contactsController.deleteContact);

router.post('/contact', isAuthenticated, contactsController.submitContactForm);

module.exports = router;
