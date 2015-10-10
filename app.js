var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bgg = require('bgg'); //https://www.npmjs.com/package/bgg

var Gathering = require('./includes/Gathering.js');

//var routes = require('./routes/index');
//var users = require('./routes/users');

var app = module.exports = express();
// Extend array with find for an object literal value
// From http://stackoverflow.com/a/11836196/1291935
// Usage: var arrayFound = obj.items.objectFind({isRight:1});
Array.prototype.objectFind = function(obj) {
    return this.filter(function(item) {
        for (var prop in obj)
            if (!(prop in item) || obj[prop] !== item[prop])
                return false;
        return true;
    });
};
// Setup data objects for each part of application


var Database = require('./includes/Database.js');
var WebServer = {
    init: function(){
        // view engine setup
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'jade');

        // uncomment after placing your favicon in /public
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cookieParser());
        app.use(express.static(path.join(__dirname, 'public')));

        app.get('/', function(req, res, next) {
            res.render('index',
                {
                    title: 'GameNight',
                    Gathering: Gathering
                }
            );
        });
        //app.use('/', routes);
        //app.use('/users', users);

        WebServer.setupApi();

        WebServer.create();
    },
    setupApi: function(){
        /** JSON API allows requests from front end to accomplish tasks */
        app.get('/api/add-user', function(req, res){
            console.log('/api/add-user backend route called');
            if(typeof req.body.username != "undefined"){
                console.log(req.body.username);
            }
            return res.json({ users: Gathering.users });
        });
        /** examples */
        /*app.get('/api/tags/allowed/get', function(req, res){
            return res.json({ allowedTags: Rfid.allowedTags });
        });
        app.post('/api/tags/allowed/add', function(req, res){
            if(typeof req.body.tagObj != "undefined"){
                Rfid.saveAllowedTag(req.body.tagObj);
            }
            return res.json({ allowedTags: Rfid.allowedTags });
        });*/
    },
    create: function(){
        // catch 404 and forward to error handler
        app.use(function(req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

        // error handlers

        // development error handler
        // will print stacktrace
        if (app.get('env') === 'development') {
            app.use(function(err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: {}
            });
        });
        console.log('WebServer initialized');
    }
};
// Object for overall application
var GameNight = {
    init: function(){
        Database.init();
        WebServer.init();

        /* dummy test data */
        var testUser = Gathering.addBGG_User('drcord');
        var testUser2 = Gathering.addBGG_User('glittergamer');

        //testUser.getUserCollection();
        //Gathering.updateBGG_User(testUser.getUserData());
        testUser.getUserData()
            .then(
                function(userObj){
                    Gathering.updateBGG_User(userObj);
                }
            )
        ;
    }
};

// Start application
GameNight.init();
