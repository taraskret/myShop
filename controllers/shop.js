const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');
const Uder = require('../models/user');
const { OrderedBulkOperation } = require('mongodb');

exports.getProducts = (req, res, next) => {
  Product.find()
  .then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'

    });
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  })
  .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
};


exports.getCart = (req, res, next) => {
  req.user
  .populate('cart.items.productId')
  .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  req.user
  .removeFromCart(prodId)
  .then(resultt=>{
    res.redirect('/cart')
  })
  .catch(err =>{console.log(err)})
};

exports.postOrder = (req,res, next)=>{
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(user =>{
    console.log(user.cart.items);
    const products = user.cart.items.map(i=>{
      return {quantity: i.quantity, product: {...i.productId}}
    });
  const order = new Order({
    user: {
      email: req.user.email,
      userId: req.user
    },
    products: products
  })
  return order.save();
})
  .then(result=> {
     req.user.clearCart()
  })
  .then(result => {
    res.redirect('/orders')
  })
  .catch(err => console.log(err));
}

exports.getOrder = (req, res) => {
  Order.find({'user.userId': req.session.user})
  .then(orders => {
    res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders',
    orders: orders
  })
  })
  .catch(err=>console.log(err))
}

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId).then(order =>{
    console.log(order);
    if(!order){
      return next(new Error('No order found'))
    }
    if(order.user.userId.toString() !== req.user._id.toString() ){
      return next(new Error ('Unauthorised'))
    }
    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName)
    
    const doc = new PDFDocument();
    res.setHeader('Content-type', 'application/pdf')
    res.setHeader(
      'Content-Disposition', 
      'inline; filename=" ' + invoiceName + '"'
      );
  
    doc.pipe(fs.createWriteStream(invoicePath));
    doc.pipe(res);
    doc
    .fontSize(25)
    .text('Invoice!', 100, 100);
    doc.text('---------------');
      let totalPrice = 0;
    order.products.forEach(prod => {
      totalPrice = totalPrice + prod.product.price * prod.quantity 
        doc
        .fontSize(12)
        .text(
          prod.product.title +
           '-     ' + 
           prod.quantity + 
           'x' + 
           '$' + 
           prod.product.price)
      })
      doc.text('-----------')
      doc
      .fontSize(18)
      .text('Total Price: $' + totalPrice)
    doc.end();


    // fs.readFile(invoicePath, (err, data)=>{
    //   if(err){
    //     console.log(err);
    //     return next(err);
    //   }
    //   res.setHeader('Content-type', 'application/pdf')
    //   res.setHeader('Content-Disposition', 'inline; filename=" ' + invoiceName + '"'  )
    //   res.send(data)
    // })

    //const file = fs.createReadStream(invoicePath);
      //  file.pipe(res)
     
  })
  .catch(err => next(err))
}