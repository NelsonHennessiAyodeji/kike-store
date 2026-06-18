// src/payment/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('./paymentController');

router.post('/initiate-payment', paymentController.initiatePayment);
router.get('/callback', paymentController.paymentCallback);
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.paymentWebhook);

module.exports = router;