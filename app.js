const path = require('path');
 
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

const errorController = require('./controllers/error');
const User = require('./models/user')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.
  connect(
    'mongodb+srv://TarasShop:meHanik88@cluster0.ixaop.mongodb.net/Shop?retryWrites=true&w=majority',  { useNewUrlParser: true, useUnifiedTopology: true }
).then(result=>{
    const user = new User({
        name: 'terry',
        email: 'test@gmail.com',
        cart: {
            items: []
        }  
    });
    user.save()
})
.catch(err=>{console.log(err);
}) ;


app.listen(3000, ()=>{console.log('listenning port 3000....');});
  