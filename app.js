const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');

// const api = require('./server/routes/api');
const port = 3000;

const app = express();

const users = require('./routes/users');
//View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//Body Parser Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cors());

//Index Route
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/index.html'));
// });﻿
// app.get('', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/index.html'));
// });

//Routes
app.use('/users', users);



app.listen(port, function(){
  console.log("servidor rodando no localhost: " + port)
});
