const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  imageUrl: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true
  }
});

module.exports = mongoose.model('Product', productSchema);


