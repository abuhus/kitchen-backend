const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  pantry: [{
    name: String,
    quantity: String,
    storage: String
  }],
  shoppingList: [{
    name: String,
    quantity: String
  }],
  preferences: [String]

});

module.exports = mongoose.model('User', userSchema);
