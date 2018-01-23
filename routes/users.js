const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database')

//Register
router.post('/register', (req, res) =>{
  let newUser = new User({

    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  });
  User.addUser(newUser, (err, user) =>{
    if(err){
      res.json({success: false, msg:'Erro ao registrar usuário ' + err})
    }else{
      res.json({success: true, msg: 'Usuário registrado'})
    }
  })

});

router.post('/authenticate', (req, res, next) =>{
  const username = req.body.username;
  const password = req.body.password;

  User.getUserByUsername(username,  (err, user) => {
    if(err)throw err;
    if(!user){
      return res.json({success: false, msg: 'Usuário não encontrado'})
    }
    User.comparePassword(password, user.password, (err, isMatch) => {
      if(err) throw err;
      if(isMatch){
        const token = jwt.sign({data: user}, config.secret, {
          expiresIn: 604800 // 1 week
        });

        res.json({
          success: true,
          token:'JWT ' + token,
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        });
      }else {
        return res.json({success: false, msg: 'Senha incorreta'});
      }
    })
  })
});

//Profile
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
  res.json({user: req.user});
});

//Update user

//add moodle
router.put('/moodle/add/:id', (req, res, next) => {
  User.addMoodle(req.params.id, req.body, (err, user) => {
    if(err){
      console.log('erro ocorreu: ' + err);
    }else res.send(user);
  })
});

//update moodle
router.put('/moodle/update/:id/:moodleid', (req, res, next) => {
  User.updateMoodle(req.params.id, req.params.moodleid, req.body, (err, user) => {
    if(err){
      console.log('erro ocorreu: ' + err);
    }else res.send(user);
  })
});
//remove moodle
router.put('/moodle/remove/:id/:moodleid', (req, res, next) => {
  User.removeMoodle(req.params.id, req.params.moodleid, (err, user) => {
    if(err){
      console.log('erro ocorreu: ' + err);
    }else res.send(user);
  })
})




module.exports = router;
