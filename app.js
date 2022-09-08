var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
var app = express();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var uploadRouter = require('./routes/upgrade');
var settingsRouter = require('./routes/settings');
var lockRouter = require('./routes/lock');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// enable files upload
app.use(fileUpload({
  createParentPath: true
}));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/upgrade', uploadRouter);
app.use('/settings', settingsRouter);
app.use('/lock', lockRouter);



module.exports = app;
