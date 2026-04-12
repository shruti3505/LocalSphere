const Order = require('../models/Order');
const Product = require('../models/Product');
const ExpenseTracker = require('../models/ExpenseTracker');

exports.placeOrder = async (req, res) => {
  try {
    const { vendor, items, paymentMethod } = req.body;

    let totalAmount = 0;
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity)
        return res.status(400).json({ msg: `Insufficient stock for ${product?.name}` });
      totalAmount += product.price * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      buyer: req.user.id,
      vendor, items, totalAmount, paymentMethod
    });
    await order.save();

    // Update expense tracker
    let tracker = await ExpenseTracker.findOne({ user: req.user.id });
    if (!tracker) tracker = new ExpenseTracker({ user: req.user.id });
    tracker.totalSpent += totalAmount;
    tracker.expenses.push({ orderId: order._id, amount: totalAmount });
    await tracker.save();

    res.status(201).json({ order, totalAmount });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('vendor').populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};