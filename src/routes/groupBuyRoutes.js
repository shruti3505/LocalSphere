const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const GroupBuy = require('../models/GroupBuy');
const Product = require('../models/Product');

// Get all open group buys
router.get('/', async (req, res) => {
  try {
    const groups = await GroupBuy.find({ status: 'open' })
      .populate('product').populate('vendor');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create group buy
router.post('/', auth, async (req, res) => {
  try {
    const { product, vendor, minUsers, discountPercent, hoursValid } = req.body;
    const expiresAt = new Date(Date.now() + (hoursValid || 24) * 3600000);
    const group = new GroupBuy({ product, vendor, minUsers, discountPercent, expiresAt });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Join group buy
router.post('/join/:id', auth, async (req, res) => {
  try {
    const group = await GroupBuy.findById(req.params.id);
    if (!group || group.status !== 'open')
      return res.status(400).json({ msg: 'Group buy not available' });
    if (new Date() > group.expiresAt)
      return res.status(400).json({ msg: 'Group buy expired' });
    if (group.participants.includes(req.user.id))
      return res.status(400).json({ msg: 'Already joined' });
    group.participants.push(req.user.id);
    if (group.participants.length >= group.minUsers) {
      group.status = 'successful';
    }
    await group.save();
    const populated = await GroupBuy.findById(group._id).populate('product').populate('vendor');
    res.json({ group: populated, unlocked: group.status === 'successful' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Seed demo group buys
router.post('/seed-demo', async (req, res) => {
  try {
    await GroupBuy.deleteMany({});

    const defaultDeals = [
      { name: 'Fresh Tomatoes', price: 40, category: 'Vegetables', discount: 15, minUsers: 3, img: 'https://images.unsplash.com/photo-1546470427-1f7b8b1f4f5a?w=400&q=80' },
      { name: 'Organic Apples', price: 120, category: 'Fruits', discount: 20, minUsers: 4, img: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=400&q=80' },
      { name: 'Pure Cow Milk 1L', price: 60, category: 'Dairy', discount: 10, minUsers: 5, img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80' },
      { name: 'Basmati Rice 5kg', price: 280, category: 'Food', discount: 12, minUsers: 4, img: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&q=80' },
      { name: 'Fresh Spinach', price: 25, category: 'Vegetables', discount: 18, minUsers: 3, img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80' },
      { name: 'Banana Bunch', price: 35, category: 'Fruits', discount: 10, minUsers: 5, img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80' },
      { name: 'Handmade Pottery', price: 350, category: 'Handicrafts', discount: 25, minUsers: 3, img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80' },
      { name: 'Cotton Kurta', price: 450, category: 'Clothing', discount: 20, minUsers: 4, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80' },
      { name: 'Paneer 500g', price: 110, category: 'Dairy', discount: 15, minUsers: 5, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80' },
      { name: 'Mixed Dal 2kg', price: 160, category: 'Food', discount: 12, minUsers: 4, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' },
      { name: 'Fresh Carrots', price: 30, category: 'Vegetables', discount: 10, minUsers: 3, img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80' },
      { name: 'Wooden Toys Set', price: 550, category: 'Handicrafts', discount: 22, minUsers: 3, img: 'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?w=400&q=80' },
    ];

    const virtualDeals = defaultDeals.map((deal, i) => ({
      productName: deal.name,
      productPrice: deal.price,
      productImage: deal.img,
      productCategory: deal.category,
      vendorName: 'Local Vendor',
      minUsers: deal.minUsers,
      discountPercent: deal.discount,
      participants: [],
      status: 'open',
      expiresAt: new Date(Date.now() + (20 + i) * 3600000)
    }));

    await GroupBuy.collection.insertMany(virtualDeals);

    const all = await GroupBuy.find({ status: 'open' });
    res.json({ msg: `${all.length} group deals created!`, data: all });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;