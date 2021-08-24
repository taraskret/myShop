const User = require('../models/user')
const bcrypt = require('bcryptjs')

exports.getLogin = (req, res) => {
   let message = req.flash('erroR');
   if(message.length >0){
     massege = message[0]
   } else {
     message=null
   }
    res.render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: message
    });
  };

exports.getSignup = (req, res) => {
  let message = req.flash('erroR');
  if(message.length >0){
    massege = message[0]
  } else {
    message=null
  }
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: message
    });
  };
  
exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;  
  User.findOne({email: email})
    .then(user => {
      if(!user){
        req.flash('erroR', 'Invalid email or password' )
        return res.redirect('/login')
      } 
      bcrypt
        .compare(password, user.password)
        .then(doMach =>{
            if(doMach){
              req.session.isLoggedIn = true;
              req.session.user = user;
              return res.redirect('/')
            } 
            req.flash('erroR', 'Invalid email or password' )
            res.redirect('/login')
        })
        .catch(err => { console.log(err);
          res.redirect('/login')
        })
    })
    .catch(err => console.log(err));
  };

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({email: email})
  .then(userDoc =>{
    if(userDoc){
      req.flash('erroR', 'Email alredy exist, please pick a different one' )
     return res.redirect('/signup');
    }
    return  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
    const user = new User({
      email: email,
      password: hashedPassword,
      cart: {items: [] }
    });
    return user.save()
  })
  .then(result => {
    res.redirect('/login')
  })
  })
  
  .catch(err => console.log(err))
};
  
exports.postLogout = (req, res)=>{
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/')
  })
};