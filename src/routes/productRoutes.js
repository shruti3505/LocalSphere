const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addProduct, getProducts, updateProduct, deleteProduct } = require('../controllers/productController');

router.post('/', auth, addProduct);
router.get('/', getProducts);
router.put('/:id', auth, updateProduct);
router.delete('/:id', auth, deleteProduct);

module.exports = router;