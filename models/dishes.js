// Grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Add the currency type to the mongoose Schema types
require('mongoose-currency').loadType(mongoose);

var Currency = mongoose.Types.Currency;

// Create a comments schema
var commentSchema = new Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create a Schema
var dishSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  price: {
    type: Currency,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  comments: [commentSchema]
}, {
  timestamps: true
});

// The schema is useless so far
// we need to create a model using it
var Dishes = mongoose.model('Dish', dishSchema);

// Make this available to our Node application
module.exports = Dishes;
