const mongoose = require('mongoose');
const config = require('../config/database');

const MoodleSchema = mongoose.Schema({

  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  }
  token: {
    type: String,
    required: true
  }
});
