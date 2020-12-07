var express = require('express');
var router = express.Router();
require('dotenv').config();
const bodyParser = require('body-parser');
const validator = require('validator');
const xss = require('xss');
const axios = require('axios');
const db = require('../config/connectDB');
const passport = require('passport');
const ControllerAuth = require('../controllers/ControllerAuth');
const {RenderAuth,RenderMain} = require("../render/index");


router.get("/AppChat",ControllerAuth.checkLogin,RenderAuth.Login);
router.get("/",ControllerAuth.checkLogin,RenderAuth.Login);

module.exports = router;
