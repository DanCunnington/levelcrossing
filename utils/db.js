var exports = module.exports = {};
var mongoose = require('mongoose');

var options = { server: { socketOptions: { connectTimeoutMS: 30000 } },
replset: { socketOptions: { connectTimeoutMS : 30000 } } };

var mongodbUri = 'mongodb://dan:levelcrossings@ds013250.mlab.com:13250/levelcrossing';
var db;
var TrainStation;
var connected = false;

var connect = function(callbackFunc) {

    mongoose.connect(mongodbUri, options);

    db = mongoose.connection;

    db.on('error', console.error.bind(console, 'connection error:'));

    db.once('open',function callback() {

        // Create TrainStation schema
        var stationSchema = mongoose.Schema({
            name: String,
            crsCode: String,
            lat: String,
            lng: String,
        });

        // Store result documents in a collection called "trainstations"
        TrainStation = mongoose.model('trainstations', stationSchema);

        connected = true;
        callbackFunc();
    });
}

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {

    if (connected) {
        mongoose.connection.db.close(function () {
            console.log('Mongoose disconnected on app termination');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }

});


exports.addStation = function(station, callback) {

    if (!connected) {
        connect(function() {
            addStationToDb(station,callback);
        });
    } else {
        addStationToDb(station,callback);
    }
}

var addStationToDb = function(station,callback) {
    // Create seed data
    var newStation = new station({
        name: station.name,
        csrCode: station.csrCode,
        lat: station.lat,
        lng: station.lng
    });


    newStation.save(function(err) {
        if (err) {
            console.log(err);
        }

        callback();
    });
}

exports.viewStations = function(callback) {
    if (!connected) {
        connect(function() {
            viewStationsFromDb(callback);
        });
    } else {
        viewStationsFromDb(callback);
    }
}

var viewStationsFromDb = function(callback) {
    TrainStation.find({}).exec(function (err, docs){

        if (err) {
            console.log(err);
        }
        callback(docs);
    });
}

exports.deleteStations = function(callback) {
    if (!connected) {
        connect(function() {
            deleteStationsFromDb(callback);
        });
    } else {
        deleteStationsFromDb(callback);
    }
}

var deleteStationsFromDb = function(callback) {
    mongoose.connection.db.collection('trainstations').drop(function (err) {
        if (err) {
            console.log(err);
        }
        callback();
    });
}

exports.deleteStation = function(id,callback) {
    if (!connected) {
        connect(function() {
            deleteStationFromDb(id,callback);
        });
    } else {
        deleteStationFromDb(id,callback);
    }
}

var deleteStationFromDb = function(id,callback) {
    TrainStation.findByIdAndRemove(id, function() {
        callback();
    });
}

exports.addBulk = function(docs,callback) {
    console.log(docs);
    if (!connected) {
        console.log("connecting");
        connect(function() {
            console.log("inserting");
            TrainStation.insertMany(docs, callback);  
        })
    } else {

        TrainStation.insertMany(docs, callback);
    }
    
}

exports.connect = connect;