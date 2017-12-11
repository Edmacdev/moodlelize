const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');

//Connect to Database
mongoose.connect(config.database);

//On Connection
mongoose.connection.on('connected', () => {
  console.log('Connected to database ' + config.database);
});

mongoose.connection.on('error', (err) => {
  console.log('Database connection error: ' + err);
});

// const index = require('./server/routes/index');
// const tasks = require('./server/routes/tasks');

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

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

//CORS Middleware
app.use(cors());

//Index Route
app.get('/', (req, res) => {
  res.send('Invalid Endpoint')
});

//Routes
app.use('/users', users);

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist/index.html'));
// });

app.listen(port, function(){
  console.log("servidor rodando no localhost: " + port)
});
