var datastore = require('nedb');
//var Data = require('./Data.js');

var Database = {
    init: function(Data){
        Database.initDatastores();
        Database.loadAll(Data);
        // Use console.log instead of Log.log.info as the Database object
        // is required by the Log object
        console.log('Databases and Database object initialized');
        // TODO - remove test running automatically when no longer needed
        Database.test();
    },
    initDatastores: function(){
        // Setup function to query db for each db and datastores(dbs) themselves
        Database.users = require('./db/users.js');
        Database.users.datastore = new datastore({ filename: __dirname + '/../db/users.db', autoload: true });

        Database.gatherings = {};
        Database.gatherings.datastore = new datastore({ filename: __dirname + '/../db/gatherings.db', autoload: true });

        Database.games = {};
        Database.games.datastore = new datastore({ filename: __dirname + '/../db/games.db', autoload: true });

        Database.logs = {};
        Database.logs.datastore = new datastore({ filename: __dirname + '/../db/logs.db', autoload: true });
    },
    loadAll: function(Data){
        Database.loadUsers(Data);
        Database.loadLogs(Data);
        Database.loadGatherings(Data);
        Database.loadGames(Data);
    },
    loadUsers: function(Data){
        Database.users.load(Database.users.datastore, function(err, users) {
            if (err) { new Error(err); }
            if (!users) { new Error('No users found to load.') }
            Data.users = users;
        });
    },
    loadLogs: function(Data){
        // TODO(?) - already done in Log.js
    },
    loadGatherings: function(Data){
        // TODO
    },
    loadGames: function(Data){
        // TODO
    },
    test: function(){
        console.log('Database tests running');
        Database.users.test.init(Database.users.datastore);
    }
};

module.exports = Database;