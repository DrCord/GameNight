var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
Array.prototype.objectFind = function(obj) {
    // Extend array with find for an object literal value
    // From http://stackoverflow.com/a/11836196/1291935
    // Usage: var arrayFound = obj.items.objectFind({isRight:1});
    return this.filter(function(item) {
        for (var prop in obj)
            if (!(prop in item) || obj[prop] !== item[prop])
                return false;
        return true;
    });
};
Array.prototype.clean = function(deleteValue) {
    // Extend Array prototype to clean every "falsy" value:
    // undefined, null, 0, false, NaN and ''
    // From: http://stackoverflow.com/a/281335/1291935
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};
// Setup data objects for each part of application
var Gathering = require('./includes/Gathering.js');
var NodeMailer = require('./includes/NodeMailer.js');
//var Database = require('./includes/Database.js');
var WebServer = {
    init: function(){
        // view engine setup - Jade
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'jade');
        // uncomment next line after placing your favicon in /public
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cookieParser());
        // Allow the 'public' folder to be served to the front-end
        app.use(express.static(path.join(__dirname, 'public')));
        // Allow the 'node_modules/angular' folder to be served to the front-end
        app.use(express.static(path.join(__dirname, 'node_modules/angular')));
        // Allow the 'node_modules/angular-animate' folder to be served to the front-end
        app.use(express.static(path.join(__dirname, 'node_modules/angular-animate')));
        // Setup route for / for the index page
        app.get('/', function(req, res, next) {
            res.render('index', { Gathering: Gathering });
        });
        WebServer.setupApi();
        WebServer.create();
    },
    setupApi: function(){
        /** JSON API allows requests from front end to accomplish tasks */
        app.get('/api/gathering', function(req, res){
            //console.log('/api/gathering backend route called');
            return res.json({ Gathering: Gathering });
        });
        app.get('/api/users', function(req, res){
            //console.log('/api/users backend route called');
            return res.json({ Gathering: Gathering });
        });
        app.post('/api/add-user', function(req, res){
            //console.log('/api/add-user backend route called');
            if(typeof req.body.username != "undefined"){
                Gathering.loading = true;
                //console.log(req.body.username);
                var user = Gathering.addBGG_User(req.body.username);
                user.update()
                    .then(function(userObj){
                        Gathering.updateBGG_User(userObj);
                        Gathering.updateAvailableGames(userObj)
                            .then(function(){
                                Gathering.loading = false;
                                return res.json({ Gathering: Gathering });
                            })
                        ;
                    })

                ;
            }
            else{
                return res.json({ Gathering: Gathering });
            }
        });
        app.post('/api/delete-user', function(req, res){
            //console.log('/api/delete-user backend route called');
            if(typeof req.body.username != "undefined"){
                Gathering.loading = true;
                //console.log(req.body.username);
                // Find and delete user with username from Gathering.users
                Gathering.deleteBGG_User(req.body.username);
                Gathering.updateAvailableGames()
                    .then(function(){
                        Gathering.loading = false;
                        return res.json({ Gathering: Gathering });
                    })
                ;
            }
        });
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
        //Database.init();
        WebServer.init();
        Gathering.init();
        //GameNight.test();
    },
    test: function(){ /** testing function to setup data */
        var testUser = Gathering.addBGG_User('drcord');
        var testUser2 = Gathering.addBGG_User('glittergamer');
        var testUser3 = Gathering.addBGG_User('test897974444');
        // Example/test usage
        testUser3.update()
            .then(function(userObj){
                Gathering.updateBGG_User(userObj);
            })
        ;
    }
};
// Start application
GameNight.init();

module.exports = app;