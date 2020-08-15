const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs')
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const app = express();
const Papa = require('papaparse')

const multer = require('multer');
const upload = multer();

const firestoreService = require('firestore-export-import');
const firebaseConfig = require('./config.js')
const serviceAccount = require('./serviceAccount.json');
firestoreService.initializeApp(serviceAccount, firebaseConfig.databaseURL);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Converts the uploaded CSV file to JSON and uploads to Firebase FireStore

app.post('/addcsv', upload.single('selectedFile'), function(req, res) {
  const csvFile = req.file.buffer.toString('utf8');
  const config = {
	  delimiter: "",
	  newline: "",
	  quoteChar: '"',
	  escapeChar: '"',
	  header: true,
  }
  const jsonFile = Papa.parse(csvFile, config);
  console.log(jsonFile);
  try {
    firestoreService.restore(jsonFile);
  }
  catch (error) {
    console.log(error);
  }
  res.send(200);
})

// Generator code
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
  next(createError(404));
});
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
