var express = require('express');
var router = express.Router();
var http = require('http');
var https = require('https');

var request = require('request');


/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('index', { title: 'Level Crossing Demo' });
});


module.exports = router;