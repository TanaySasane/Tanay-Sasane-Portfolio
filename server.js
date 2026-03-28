const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

let isDbConnected = false;

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, maxlength: 160 },
    subject: { type: String, trim: true, maxlength: 180, default: '' },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ContactMessage = mongoose.model('ContactMessage', contactSchema);

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isDbConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    isDbConnected = false;
    console.error('MongoDB connection failed:', error.message);
  }
}

mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  isDbConnected = true;
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-password');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

app.use(express.static(path.join(__dirname)));

function safeCompare(a, b) {
  const valueA = Buffer.from(String(a || ''), 'utf8');
  const valueB = Buffer.from(String(b || ''), 'utf8');
  if (valueA.length !== valueB.length) {
    return false;
  }
  return crypto.timingSafeEqual(valueA, valueB);
}

function requireAdminAuth(req, res, next) {
  if (!ADMIN_PASSWORD) {
    return res.status(500).json({
      error: 'Admin password is not configured on the server.',
    });
  }

  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : '';
  const headerPassword = req.headers['x-admin-password'];
  const providedPassword = bearerToken || headerPassword;

  if (!safeCompare(providedPassword, ADMIN_PASSWORD)) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  return next();
}

app.post('/api/contact', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim();
  const subject = String(req.body.subject || '').trim();
  const message = String(req.body.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({
      error: 'Please fill in all required fields.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Please enter a valid email address.',
    });
  }

  if (!isDbConnected) {
    return res.status(503).json({
      error: 'Database is not connected yet. Please try again in a moment.',
    });
  }

  try {
    await ContactMessage.create({
      name,
      email,
      subject,
      message,
      submittedAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save contact message:', error.message);
    return res.status(500).json({
      error: 'Could not save your message right now. Please try again.',
    });
  }

  return res.status(200).json({
    message: "Thanks for reaching out. I'll get back to you soon.",
  });
});

app.get('/api/admin/messages', requireAdminAuth, async (req, res) => {
  if (!isDbConnected) {
    return res.status(503).json({
      error: 'Database is not connected yet. Please try again in a moment.',
    });
  }

  const rawLimit = Number(req.query.limit || 25);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), 100)
    : 25;

  try {
    const messages = await ContactMessage.find({})
      .sort({ submittedAt: -1, _id: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error('Failed to fetch admin messages:', error.message);
    return res.status(500).json({
      error: 'Could not fetch messages right now.',
    });
  }
});

app.delete('/api/admin/messages/:id', requireAdminAuth, async (req, res) => {
  if (!isDbConnected) {
    return res.status(503).json({
      error: 'Database is not connected yet. Please try again in a moment.',
    });
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: 'Invalid message id.',
    });
  }

  try {
    const deletedMessage = await ContactMessage.findByIdAndDelete(id).lean();

    if (!deletedMessage) {
      return res.status(404).json({
        error: 'Message not found.',
      });
    }

    return res.status(200).json({
      message: 'Message deleted successfully.',
      deletedId: id,
    });
  } catch (error) {
    console.error('Failed to delete message:', error.message);
    return res.status(500).json({
      error: 'Could not delete the message right now.',
    });
  }
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

connectToDatabase();
