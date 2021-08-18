const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  
  const product = new Product({
    title: title,
    imageUrl: imageUrl, 
    description: description, 
    price: price
  });
  product
  .save()
  .then(result => {
    console.log('CREATED PRODUCT');
    res.redirect('/admin/products');
  })
  .catch(err=>console.log(err))
  
};

exports.getEditProduct = (req, res) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  
Product.findById(prodId)
.then(product=>{
  product.title = updatedTitle;
  product.price = updatedPrice;
  product.description = updatedDesc;
  product.imageUrl = updatedImageUrl;
return product.save()
}).then(result => {
  console.log('UPDATET PRODUCT');
  res.redirect('/admin/products')
})
.catch(err => console.log(err))
};

exports.getProducts = (req, res, next) => {
  Product.find()
  .then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndDelete(prodId)
  .then(()=>{
    console.log('PRODUCT DELETED');
    res.redirect('/admin/products')
  })
  res.redirect('/admin/products');
};
