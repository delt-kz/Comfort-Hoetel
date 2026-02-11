const { ObjectId } = require('mongodb');
const contactModel = require('../models/contactModel');
const { isValidEmail } = require('../utils/validators');
const { parsePagination, applyPaginationHeaders } = require('../utils/pagination');
const { isOwnerOrAdmin } = require('../middleware/auth');

async function listContacts(req, res) {
  try {
    const filter = {};
    if (req.query.email) filter.email = req.query.email;
    if (req.query.name) filter.name = req.query.name;

    const sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      sort.created_at = -1;
    }

    const projection = {};
    if (req.query.fields) {
      req.query.fields.split(',').forEach((f) => {
        const field = f.trim();
        if (field) projection[field] = 1;
      });
    }

    const pagination = parsePagination(req.query);
    const [contacts, totalCount] = await Promise.all([
      contactModel.list(filter, projection, sort, pagination),
      pagination.enabled ? contactModel.count(filter) : Promise.resolve(0)
    ]);

    if (pagination.enabled) {
      applyPaginationHeaders(res, pagination, totalCount);
    }

    return res.status(200).json(contacts);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function getContactById(req, res) {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const contact = await contactModel.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    return res.status(200).json(contact);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

function buildContactDoc(req) {
  const { name, email, message } = req.body;

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    created_at: new Date(),
    created_by_username: req.session.user.username,
    created_by_user_id: new ObjectId(req.session.user.id)
  };
}

function getContactValidationError(req) {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return 'All fields are required';
  }

  if (!isValidEmail(email)) {
    return 'Invalid email format';
  }

  if (name.length < 2 || name.length > 100) {
    return 'Name must be between 2 and 100 characters';
  }

  return null;
}

async function createContact(req, res) {
  const validationError = getContactValidationError(req);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const doc = buildContactDoc(req);
    const result = await contactModel.insertOne(doc);

    return res.status(201).json({
      message: 'Contact created successfully',
      id: result.insertedId
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function submitContactForm(req, res) {
  const validationError = getContactValidationError(req);
  if (validationError) {
    return res.status(400).send(validationError);
  }

  try {
    const doc = buildContactDoc(req);
    await contactModel.insertOne(doc);
    return res.send(`<h2>Thanks, ${doc.name}! Your message has been saved.</h2><a href="/">Back</a>`);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).send('Error saving data');
  }
}

async function updateContact(req, res) {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const validationError = getContactValidationError(req);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const existing = await contactModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    if (!isOwnerOrAdmin(req.session.user, existing)) {
      return res.status(403).json({ error: 'You can only modify your own contacts' });
    }

    const updateDoc = {
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      message: req.body.message.trim(),
      updated_at: new Date(),
      updated_by_username: req.session.user.username,
      updated_by_user_id: new ObjectId(req.session.user.id)
    };

    const updated = await contactModel.updateById(req.params.id, updateDoc);
    if (!updated) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function deleteContact(req, res) {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const existing = await contactModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    if (!isOwnerOrAdmin(req.session.user, existing)) {
      return res.status(403).json({ error: 'You can only delete your own contacts' });
    }

    const result = await contactModel.deleteById(req.params.id);
    if (!result || result.deletedCount === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    return res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

module.exports = {
  listContacts,
  getContactById,
  createContact,
  submitContactForm,
  updateContact,
  deleteContact
};
