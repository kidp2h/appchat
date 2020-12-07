const bodyParser = require('body-parser');
const validator = require('validator');
const xss = require('xss');
const axios = require('axios');
const db = require('../config/connectDB');
const passport = require('passport');
//const {bodyParser, db, passport, validator,xss, axios} = require("./requireLib");
module.exports = {
  bodyParser : bodyParser,
  validator : validator,
  xss : xss,
  axios : axios,
  db : db,
  passport: passport
}
