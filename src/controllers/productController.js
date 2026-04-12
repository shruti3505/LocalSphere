const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

exports.addProduct = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) return res.status(403).json({ msg: 'Register as vendor first' });

    const product = new Product({ ...req.body, vendor: vendor._id });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, sort } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (minPrice || maxPrice) query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    if (search) query.name = { $regex: search, $options: 'i' };

    let sortObj = {};
    if (sort === 'price_asc') sortObj.price = 1;
    if (sort === 'price_desc') sortObj.price = -1;
    if (sort === 'sustainability') sortObj.sustainabilityScore = -1;

    const products = await Product.find(query).sort(sortObj).populate('vendor');
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, vendor: vendor._id },
      { $set: req.body },
      { new: true }
    );
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    await Product.findOneAndUpdate(
      { _id: req.params.id, vendor: vendor._id },
      { isActive: false }
    );
    res.json({ msg: 'Product removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};