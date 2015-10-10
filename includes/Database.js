var datastore = require('nedb');
var Database = {
    datastore: new datastore({ filename: '../' + __dirname + '/db/gameNight.db', autoload: true }),
    init: function(){
        // Currently do nothing on init
        console.log('Database initialized');
    }
};

module.exports = Database;