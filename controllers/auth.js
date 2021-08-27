const crypto = require('crypto')

const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const {validationResult} = require('express-validator')

const User = require('../models/user')

const transporter = nodemailer.createTransport(sendgrid({
  auth: {
    api_key: "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"
  }
}))


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
            errorMessage: message,
            oldInput: {
              email: '',
              password: ''
            },
            validationErr: []
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
      errorMessage: message,
      oldInput: {
        email: '',
        password: '',
        confirmPassword: ''
      },
      validationErr: []
    });
  };
  

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;  

  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      path: '/login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErr: errors.array()
});
  }
  User.findOne({email: email})
    .then(user => {
      if(!user){
        return res.status(422).render('auth/login', {
          pageTitle: 'Login',
          path: '/login',
          errorMessage: 'Invalid email or password',
          oldInput: {
            email: email,
            password: password
          },
          validationErr: []
    });
      } 
      bcrypt
        .compare(password, user.password)
        .then(doMach =>{
            if(doMach){
              req.session.isLoggedIn = true;
              req.session.user = user;
              return res.redirect('/')
            } 
            return res.status(422).render('auth/login', {
              pageTitle: 'Login',
              path: '/login',
              errorMessage: 'Invalid email or password',
              oldInput: {
                email: email,
                password: password
              },
              validationErr: []
        });
        })
        .catch(err => { console.log(err);
          res.redirect('/login')
        })
    })
    .catch(err => {
      const error = new Error(err)
     error.httpStatusCode = 500;
     return next(error)
    });
  };


exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword
      },
      validationErr: errors.array()
    })
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
    return transporter.sendMail({
      to: email,
      from: 'kret_taras@mail.ru',
      subject: 'Signup succeded',
      html: '<h1> You successfullu sign up </h1>'
    });
})  
  .catch(err => {
    const error = new Error(err)
     error.httpStatusCode = 500;
     return next(error)
  })
}; 
  

exports.postLogout = (req, res)=>{
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/')
  })
}; 


exports.getReset = (req, res) =>{
  let message = req.flash('erroR');
  if(message.length >0){
    massege = message[0]
  } else {
    message=null
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  })
};


exports.postReset = (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if(err){
      console.log(err);
      return res.redirect('/reset')
    } 
    const token = buffer.toString('hex');

    User.findOne({email: req.body.email})
    .then(user => {
      if(!user){
        req.flash('erroR', 'No account with that email faund ');
        return res.redirect('/reset')
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save()
    })
    .then(result => {
      const link = href="http://localhost:3000/reset/" + token;
      console.log(link);
      res.redirect('/');
      transporter.sendMail({
        to: req.body.email,
        from: 'kret_taras@mail.ru',
        subject: 'Password Resset',
        html: `
          <p> You requsted a password reset </p>
          <p> Click this  ${link} to resset new Password </p>
        `
      });

    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error)
    })
  })
};


exports.getNewPassword = (req, res) => {
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenExpiration: { $gt: Date.now()} })
  .then(user => {
    let message = req.flash('erroR');
  if(message.length >0){
    massege = message[0]
  } else {
    message=null
  }
  res.render('auth/new-passw', {
    pageTitle: 'New Password',
    path: '/new-password',
    errorMessage: message,
    userId: user._id.toString(),
    passwordToken: token
  })
  })
  .catch(err => {
    const error = new Error(err)
     error.httpStatusCode = 500;
     return next(error)
  })
};


exports.postNewPassword = (req, res)=> {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: {$gt: Date.now()},
    _id: userId 
  })
  .then(user=>{
    resetUser = user;
    return bcrypt.hash(newPassword, 12 )
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    resetUser.save()
  })
  .then(result => {
    res.redirect('/login')
  })
  .catch(err => {
    const error = new Error(err)
     error.httpStatusCode = 500;
     return next(error)
  } 
  )
}