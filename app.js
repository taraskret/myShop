const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf');
const flash =require('connect-flash');
const multer = require('multer')


const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://TarasShop:meHanik@cluster0.ixaop.mongodb.net/Shop';

const app = express();
 
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});  
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
 destination : (req, file, cb) => {
    cb(null, './uploads')
  },
  filename: (req, file, cb)=>{
    cb(null,  Date.now() + '-' +  file.originalname)
  }
});

const fileFilter = (req, file, callback) => {
if(file.mimetype === 'image/jpeg' || 
file.mimetype === 'image/png' ||
file.mimetype === 'image/jpg'
){
  callback(null, true)
} else {
  callback(null, false)
}
}

app.set('view engine', 'ejs');
app.set('views', 'views'); 
 
 
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

  
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
app.use(express.static(path.join(__dirname, 'public')));
app.use( '/uploads',express.static(path.join(__dirname, 'uploads')));

app.use(
  session(
    {secret: 'lexus', 
    resave: false, 
    saveUninitialized: false, 
    store: store
  })
); 
app.use(csrfProtection)
app.use(flash())

app.use((req,res,next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next()
})
 
app.use((req, res, next)=>{
  if(!req.session.user){
    return next()
  }
  User.findById(req.session.user._id)
  .then(user => {
    if(!user) {
      return next()
    }
    req.user = user
    next()
  })
  .catch(err => {
   next(new Error(err));
  });
})
  


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes)

app.get('/500', errorController.get500 );

app.use(errorController.get404);
app.use(errorController.get500);

app.use((error, req, res, next)=>{
  res.status(500).render('500', {
    pageTitle: 'ERROR', 
    path: '/500', 
   isAuthenticated: req.session.isLoggedIn
 });
})
     
mongoose
  .connect(
    MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(result => {
    app.listen(3000, ()=> console.log('listenning port 3000'));
  })
  .catch(err => {
    console.log(err);
  });
 
