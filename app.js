const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require("http");
const logger = require('morgan');
const socketIO = require('socket.io');
const passport = require('passport');
const initSocketIO = require("./socketIO/index");
const passportSocketIO = require('passport.socketio');
const connectMongo = require("connect-mongo");
const session = require('express-session');
require("./config/connectDB")();
require("dotenv").config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var messagesRouter = require('./routes/messages');

var app = express();

let server = http.Server(app);
let io = socketIO(server)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

let MongoStore = connectMongo(session);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let sessionStore = new MongoStore({
  url:process.env.URI,
  autoReconnect:true
})

app.use(session({
  secret : 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store:sessionStore,
  cookie : {
    maxAge : 1000*60*50
  }
}))

app.use(passport.initialize());
app.use(passport.session());
app.enable('trust proxy')
io.use(passportSocketIO.authorize({
  cookieParser : cookieParser,
  key:"connect.sid",
  secret:"keyboard cat",
  store:sessionStore,
  success:onAuthorizeSuccess,
  fail:onAuthorizeFail
}))

function onAuthorizeSuccess(data,accept){
  accept(null, true)
}

function onAuthorizeFail(data,message,error,accept){
  if(error){
    throw new Error(message)
  }

  accept(null,false)
}

initSocketIO(io);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/messages',messagesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {
  app : app,
  server:server
}