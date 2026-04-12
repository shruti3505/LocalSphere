const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { placeOrder, getMyOrders, updateOrderStatus } = require('../controllers/orderController');

router.post('/', auth, placeOrder);
router.get('/my', auth, getMyOrders);
router.put('/:id/status', auth, updateOrderStatus);

module.exports = router;