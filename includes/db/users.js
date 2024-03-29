/** Database user functions */
var Log = require('../Log.js');

var users = {};
users.findById = function(id, datastore, cb) {
    process.nextTick(function() {
        datastore.find({_id: id}, function (err, docs) {
            //console.log('users.findById');
            //console.log(docs);
            if(typeof docs[0] != "undefined"){
                cb(null, docs);
            }
            else {
                cb(new Error('User with id ' + id + ' does not exist'));
            }
        });
    });
};

users.findByUsername = function(username, datastore, cb) {
    process.nextTick(function() {
        datastore.find({username: username}, function (err, docs) {
            //console.log('findByUsername: docs = ');
            //console.log(docs);
            if(typeof docs[0] != "undefined"){
                return cb(null, docs[0]);
            }
            else {
                return cb(new Error('Username ' + username + ' does not exist'), null);
            }
        });
    });
};

users.load = function(datastore, cb){
    datastore.find({}, function (err, docs) {
        //console.log('users.load: docs = ');
        //console.log(docs);
        if(typeof docs[0] != "undefined"){
            return cb(null, docs);
        }
        else {
            return cb(new Error('load failed'), null);
        }
    });
};

users.saveItem = function(userObj, datastore){
    datastore.update(
        {username: userObj.username},
        userObj,
        {upsert: true},
        function (err, newDoc) {   // Callback is optional
            Log.log.info('users', 'users.save - ' + userObj.username + ' saved.', true);
        }
    );
};

users.test = {
    passwordHash: require('password-hash'),
    User: require('../User.js'),
    init: function(datastore){
        users.test.createUsers(datastore);
        users.test.findUsers(datastore);
    },
    createUsers: function(datastore) {
        var hashedPassword = users.test.passwordHash.generate('secret');
        var permissions = {
            logs: {
                view: true,
                reset: true
            },
            users: {
                view: true,
                edit: true,
                delete: true
            },
            gatherings: {
                edit: true,
                delete: true
            }
        };
        var userObj = new users.test.User('drcord', hashedPassword, null, [{value: 'cord42@gmail.com'}], permissions);
        users.saveItem(userObj, datastore);

        var hashedPassword2 = users.test.passwordHash.generate('birthday');
        var userObj2 = new users.test.User('glittergamer', hashedPassword2, null, [{value: 'jill@example.com'}]);
        users.saveItem(userObj2, datastore);
    },
    findUsers: function(datastore){
        datastore.find({}, function (err, docs) {
            //console.log('Database.test findUsers: docs');
            //console.log(docs);
            if(typeof docs[0] != "undefined"){
                return docs;
            }
        });
    }
};

module.exports = users;