const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Mock payment - no real gateway needed
router.post('/create-order', protect, async (req, res) => {
  const { amount, appointmentId } = req.body;
  res.json({
    success: true,
    order: { id: 'mock_order_' + Date.now(), amount: amount * 100 },
    key: 'mock_key'
  });
});

router.post('/verify', protect, async (req, res) => {
  res.json({ success: true, message: 'Mock payment verified', paymentId: req.body.razorpay_payment_id || 'mock_pay_' + Date.now() });
});

module.exports = router;
