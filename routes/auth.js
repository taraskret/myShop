
const express = require('express');
const { check, body } = require('express-validator')

const { getLogin, postLogin, 
    postLogout, getSignup,
     postSignup, getReset, 
     postReset, getNewPassword, 
     postNewPassword } = require('../controllers/auth');

const User = require('../models/user')

const router = express.Router();

router.get('/login', getLogin)

router.get('/signup', getSignup);

router.post('/login', 
check('email')
    .isEmail()
    .withMessage('Please Enter existing email')
    .normalizeEmail(),
body('password', 'please submit valid password')
    .isLength({min: 6})
    .isAlphanumeric()
    .trim()
,postLogin)


router.post('/signup', 
check('email')
.isEmail()
.withMessage('Please enter a valid email')
.custom((value, {req})=>{
   // if(value === 'taras@ggg.net'){
   //     throw new Error('this email was forbidden')
   // }
   // return true
   return User.findOne({email: value})
   .then(userDoc => {
     if(userDoc) {
         return Promise.reject( 'Email alredy exist, please pick a different one')
     }
    })
})
.normalizeEmail(),
check('password', 'Please enter a password with text and numbers,     minimum 6 characters')
.isLength({min: 6})
.isAlphanumeric()
.trim(),

body('confirmPassword')
.custom((value, {req})=>{
    if(value !== req.body.password){
        throw new Error('Passwords do not match')
    }
    return true
})
.trim()
,postSignup);

router.post('/logout', postLogout)

router.get('/reset', getReset);

router.post('/reset', postReset);

router.get('/reset/:token', getNewPassword);

router.post('/new-password', postNewPassword);





module.exports = router;
