const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const isAuth  = require('../middleware/is-auth');
const { check } = require('express-validator');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',
[
    check('title', 'please submit valid Title')
        .isString()
        .isLength({min: 3})
        .trim(),
    check('price', 'please submit valid Price')
        .isNumeric(),
    check('description', 'please submit valid Description')
        .isLength({min: 6})
        .trim()      
], 
isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product',
[
    check('title', 'please submit valid Title')
        .isString()
        .isLength({min: 3})
        .trim(),
    check('imageUrl', 'please submit valid Image')
        .isURL(),
    check('price', 'please submit valid Price')
        .isNumeric(),
    check('description', 'please submit valid Description')
        .isLength({min: 6})
        .trim()      
], 
isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
