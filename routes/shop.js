const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');
const { route } = require('./admin');

const router = express.Router();

router.get('/',  shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', isAuth, shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/orders', isAuth, shopController.getOrder);

router.get('/orders/:orderId', isAuth, shopController.getInvoice)

module.exports = router;
