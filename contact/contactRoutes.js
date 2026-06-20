// src/contact/contactRoutes.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const contactController = require('./contactController');

const router = express.Router();

// Rate limiting: max 5 requests per IP per hour
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many contact requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/send', limiter, express.json(), contactController.sendContactMessage);

module.exports = router;