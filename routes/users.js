const express = require('express');
const router = express.Router();
const config = require('../config/database');
const firebase = require('firebase');
firebase.initializeApp(config);
fbUser = null;

//firebase auth
fbAuth = firebase.auth();
//Register
router.post('/register', (req, res) =>{
  const email = req.body.email;
  const password = req.body.password

  fbAuth.createUserWithEmailAndPassword(email, password);
  promise.catch(
    e => res.json({success: false, msg: 'erro ao registrar usuário'})
  )
});
router.post('/authenticate', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const promise = fbAuth.signInWithEmailAndPassword(username, password);
  promise.catch(
    e => res.json({success: false, msg: e})
  )
});
fbAuth.onAuthStateChanged(user => {
  if(user){
    fbUser = user;
  }
  else{
    console.error('usuário não logado')
  }
})

// router.post('/authenticate', (req, res, next) =>{
//   const username = req.body.username;
//   const password = req.body.password;
//
//   User.getUserByUsername(username,  (err, user) => {
//     if(err)throw err;
//     if(!user){
//       return res.json({success: false, msg: 'Usuário não encontrado'})
//     }
//     User.comparePassword(password, user.password, (err, isMatch) => {
//       if(err) throw err;
//       if(isMatch){
//         const token = jwt.sign({data: user}, config.secret, {
//           expiresIn: 604800 // 1 week
//         });
//
//         res.json({
//           success: true,
//           token:'JWT ' + token,
//           user: {
//             id: user._id,
//             name: user.name,
//             username: user.username,
//             email: user.email
//           }
//         });
//       }else {
//         return res.json({success: false, msg: 'Senha incorreta'});
//       }
//     })
//   })
// });

//Profile
router.get('/profile', (req, res) => {
  res.json({user: fbUser});
});


//Update user

// //add moodle
// router.put('/moodle/add/:id', (req, res, next) => {
//   User.addMoodle(req.params.id, req.body, (err, user) => {
//     if(err){
//       console.log('erro ocorreu: ' + err);
//     }else res.send(user);
//   })
// });
//
// //update moodle
// router.put('/moodle/update/:id/:moodleid', (req, res, next) => {
//   User.updateMoodle(req.params.id, req.params.moodleid, req.body, (err, user) => {
//     if(err){
//       console.log('erro ocorreu: ' + err);
//     }else res.send(user);
//   })
// });
// //remove moodle
// router.put('/moodle/remove/:id/:moodleid', (req, res, next) => {
//   User.removeMoodle(req.params.id, req.params.moodleid, (err, user) => {
//     if(err){
//       console.log('erro ocorreu: ' + err);
//     }else res.send(user);
//   })
// })




module.exports = router;
