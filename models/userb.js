const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

//User Schema
const UserSchema = mongoose.Schema({

  email: {
    type: String,
    require: true
  },
  username: {
    type: String,
    require: true
  },
  password: {
    type: String,
    required: true
  },
  moodles: [
    {
      url: String,
      name: String,
      token:String
    }
  ]
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback){
  const query = {username: username}
  User.findOne(query, callback);
}

module.exports.addUser = function(newUser, callback){
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if(err) throw err;
        newUser.password = hash;
        newUser.save(callback);
    });
  });
}
module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if(err) throw err;
    callback(null, isMatch);
  });
}
module.exports.addMoodle = function(id, moodle, callback){

  User.update(
    {"_id": id},
    {$push:{"moodles": moodle}},
      callback
    );
}
module.exports.updateMoodle = function(id, moodleid, moodle, callback){
  console.log(moodle.name + ' ' + moodle.url)
  User.update(
    {"_id": id, "moodles._id": moodleid},
    {$set:{"moodles.$.name": moodle.name,"moodles.$.url": moodle.url, "moodles.$.token": moodle.token}},
    callback
    // {"_id": id, "moodles": {"_id": moodleid}},
    // {$set:{"moodles.$.name": moodle.name,"moodles.$.url": moodle.url, "moodles.$.token": moodle.token}},
    // callback
  )
}
module.exports.removeMoodle = function(id, moodleid, callback){
  User.update(
    {"_id": id},
    {$pull: {
      "moodles": {"_id": moodleid}
    }},
    callback
  )
}
