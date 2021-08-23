const User = require('../models/user')

exports.getLogin = (req, res) => {
   //const ss = req.get('Cookie').split(';')[1];
   //const isLoggedIn = ss.split('=')[1];
   isLoggedIn=true;
   console.log(req.session.bbb);
    res.render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            isAuthenticated: false
    });
  };
  
  exports.postLogin = (req, res, next) => {
    //req.isLoggedIn  = true;
    //res.setHeader('Set-Cookie', 'aaa=true')
    User.findById('611df4eba2396b263cae0cad')
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      res.redirect('/');
    })
    .catch(err => console.log(err));
  };
  
exports.postLogout = (req, res)=>{
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/')
  })
};