var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
var app = express();

var indexRouter = require('./routes/index');
let genericPostRouter = require('./routes/genericPostApi');
let genericGetRouter = require('./routes/genericGetApi');
let autoupdateRouter = require('./routes/autoupdate');

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
app.use('/upgrade', genericPostRouter);
app.use('/settings', genericPostRouter);
app.use('/wifi', genericPostRouter);
app.use('/lock', genericGetRouter);
app.use('/autoupdate', autoupdateRouter);


module.exports = app;
