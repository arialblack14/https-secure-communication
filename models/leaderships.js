// Grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Add the currency type to the mongoose Schema types
require('mongoose-currency').loadType(mongoose);

var Currency = mongoose.Types.Currency;

// Create a Schema
var leadershipSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  abbr: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// The schema is useless so far
// we need to create a model using it
var Leaderships = mongoose.model('Leadership', leadershipSchema);

// Make this available to our Node application
module.exports = Leaderships;
