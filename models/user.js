const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    cart: {
        items:[
            {productId: {type: Schema.Types.ObjectId,  require: true}, 
            quantity: {type: Number, require: true}
            }
        ]
    }
});

module.exports = mongoose.model('User', userSchema);