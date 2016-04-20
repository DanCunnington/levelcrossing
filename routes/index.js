var express = require('express');
var router = express.Router();
var http = require('http');
var https = require('https');

var request = require('request');

var Converter = require("csvtojson").Converter;
var converter = new Converter({});

var OSPoint = require('ospoint');

var db = require('../utils/db.js');

/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('index', { title: 'Level Crossing Demo' });
});

/* GET all stations in UK */
router.get('/stations', function(req,res,next) {
    //return stations from db
    db.viewStations(function(stations) {
        res.json({stations: stations});
    });
});


router.get('/storeStations', function(req,res,next) {
    //read in csv file
    converter.fromFile("data/RailReferences.csv",function(err,result) {
        var bulkInsert = [];

        for (var i=0; i<result.length; i++) {
            var station = result[i];
            var name = station.StationName;
            var crsCode = station.CrsCode;
            var northing = station.Northing;
            var easting = station.Easting;

            //Convert to lat lng
            var point = new OSPoint(northing.toString(), easting.toString());
            var latlng = point.toWGS84();
            var lat = latlng.latitude;
            var lng = latlng.longitude;

            //Build array for database
            var mongoObj = {name: name, crsCode: crsCode, lat: lat, lng: lng};
            bulkInsert.push(mongoObj);
        }

        //Add to database
        db.addBulk(bulkInsert, function() {
            res.json({"res": "finished"});
        }) 
    });
});

router.get('/deleteall', function(req,res,next) {
    db.deleteStations(function() {
        res.json({status: "finished"});
    });
});

router.get('/trainroute/:fromlat/:fromlng/:tolat/:tolng', function(req,res,next) {
    var fromlat = req.params.fromlat;
    var fromlng = req.params.fromlng;
    var tolat = req.params.tolat;
    var tolng = req.params.tolng;

    //Make a request to transport api

    //'http://transportapi.com/v3/uk/public/journey/from/lonlat:-0.134649,51.529258/to/lonlat:-0.088780,51.506383.json?app_id=03bf8009&app_key=d9307fd91b0247c607e098d5effedc97&modes=train'


    var url = 'http://transportapi.com/v3/uk/public/journey/from/lonlat:'+fromlng+','+fromlat+'/to/lonlat:'+tolng+','+tolat+'.json?' + 
      '&app_id='+process.env.TRANSPORT_API_APP_ID+'&app_key='+process.env.TRANSPORT_API_KEY+'&modes=train&region=southeast';
    
    request(url, function (error, response, body) {

        var result = JSON.parse(body);

        //Only look for trains and only look for the route with the lowest number of parts
        var routes = result.routes;
        var lowestRoute = routes[0];
        var lowestRouteLength = lowestRoute.route_parts.length;
        for (var i=1; i<routes.length; i++) {  
            if (routes[i].route_parts.length < lowestRouteLength) {
                lowestRoute = routes[i];
                lowestRouteLength = lowestRoute.route_parts.length;
            }
        }

        var lowestRouteParts = lowestRoute.route_parts;

        var trainModes = [];
        for (var i=0; i<lowestRouteParts.length; i++) {
            if (lowestRouteParts[i].mode == 'train') {
                trainModes.push(lowestRouteParts[i]);
            }
        }

        var coordinates = [];
        for (var i=0; i<trainModes.length; i++) {
            coordinates.push(trainModes[i].coordinates);
        }

        res.json({route: coordinates});
    });
});

module.exports = router;