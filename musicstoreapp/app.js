let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let app = express();
let crypto = require('crypto');

const expressSession = require('express-session');
app.use(expressSession({
  secret: 'abcdefg',
  resave: true,
  saveUninitialized: true
}));

const fileUpload = require('express-fileupload');
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  createParentPath: true
}));

app.set('uploadPath', __dirname)
app.set('clave', 'abcdefg');
app.set('crypto', crypto);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routers

const indexRouter = require('./routes/index');

const userSessionRouter = require('./routes/userSessionRouter');
app.use("/songs/add",userSessionRouter);
app.use("/publications",userSessionRouter);
app.use("/shop/",userSessionRouter);

const userAudiosRouter = require('./routes/userAudiosRouter');
app.use("/audios/",userAudiosRouter);

// DB & Repositories
const { MongoClient } = require("mongodb");
const connectionStrings = 'mongodb+srv://admin:sdi@musicstoreapp.4ovvbr4.mongodb.net/?retryWrites=true&w=majority&appName=musicstoreapp'
const dbClient = new MongoClient(connectionStrings);

const usersRepository = require("./repositories/usersRepository.js");
usersRepository.init(app, dbClient);

const songsRepository = require("./repositories/songsRepository.js");
songsRepository.init(app, dbClient);

// Routes
require("./routes/users.js")(app, usersRepository);
require("./routes/songs.js")(app, songsRepository);
require("./routes/authors.js")(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

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

module.exports = app;
