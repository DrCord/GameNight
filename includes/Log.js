var log = require('npmlog');
var Database = require('./Database.js');
var Data = require('./Data.js');

var Log = {
    log: log,
    init: function(){
        // setup event listener to save our npmlog events to the db log
        Log.log.on('log', function(stream){
            //if extra args not set or !== false then save log item to db log
            if(typeof stream.messageRaw[1] == "undefined" || (typeof stream.messageRaw[1] != "undefined" && stream.messageRaw[1] !== false)){
                Log.saveItem(stream);
            }
        });
        Log.load();
        // Use arg false to prevent this from being saved to db log
        Log.log.info('Log', 'Log initialized and log items loaded', true);
    },
    saveItem: function(stream){
        var date = new Date();
        var unix_secs = date.getTime();
        var logItem = {
            type: 'log',
            level: stream.level,
            category: stream.prefix,
            message: stream.messageRaw[0],
            timestamp: unix_secs
        };
        Database.logs.datastore.insert(logItem, function (err, newDoc) {
            Log.log.info('Log', 'Log.saveItem success', false);
        });
    },
    load: function(){
        Database.logs.datastore.find({type: 'log'}, function (err, docs) {
            if(typeof docs[0] != "undefined"){
                Data.logs = [];
                for (var i=0; i < docs.length; i++) {
                    logItem = {
                        message: docs[i]['message'],
                        level: docs[i]['level'],
                        category: docs[i]['category'],
                        timestamp: docs[i]['timestamp']
                    };
                    Data.logs.push(logItem);
                }
            }
        });
    },
    reset: function(){
        Database.logs.datastore.remove({ type: 'log' }, { multi: true }, function (err, numRemoved) {
            // newDoc is the newly inserted document, including its _id
            Log.log.info('Log', 'Log.reset - number of log items removed: ' + numRemoved, true);
            Data.logs = [];
            return Data.logs;
        });
    }
};

module.exports = Log;