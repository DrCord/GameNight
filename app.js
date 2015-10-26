var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
// Logging (server requests/responses into the node console)
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// For authentication
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var connectEnsureLogin = require('connect-ensure-login');
var session = require('express-session');
var flash = require('connect-flash');
var passwordHash = require('password-hash');
var DataConstructor = require('./includes/Data.js');
var Data = new DataConstructor();
var Database = require('./includes/Database.js');
var Gathering = require('./includes/Gathering.js');
var User = require('./includes/User.js');
var Log = require('./includes/Log.js');

/** Configure the local strategy for use by Passport.
*
* The local strategy requires a `verify` function which receives the credentials
* (`username` and `password`) submitted by the user.  The function must verify
* that the password is correct and then invokes `cb` with a user object, which
* will be set at `req.user` in route handlers after authentication.
*/
passport.use(new Strategy(
    function(username, password, cb) {
        Database.users.findByUsername(username, Database.users.datastore, function(err, user){
            // If error is 'Username **** does not exist' return cb without error, but not successful with user
            if (err && err.message.match(/Username .*? does not exist/)) { return cb(null, false); }
            if (err) { return cb(err); }
            if (!user) { return cb(null, false); }
            // Check if input password matches user password from db
            if (!passwordHash.verify(password, user.password)) { return cb(null, false); }
            return cb(null, user);
        });
    }));

/** Configure Passport authenticated session persistence.
*
* In order to restore authentication state across HTTP requests, Passport needs
* to serialize users into and deserialize users out of the session.  The
* typical implementation of this is as simple as supplying the user ID when
* serializing, and querying the user record by ID from the database when
* deserializing.
*/
passport.serializeUser(function(user, cb) {
    cb(null, user._id);
});

passport.deserializeUser(function(id, cb) {
    Database.users.findById(id, Database.users.datastore, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});

var app = express();
var sessionStore = new session.MemoryStore;
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
/** Setup data objects for each part of application */
var Gathering = require('./includes/Gathering.js');
// TODO: enable NodeMailer when needed, already tested and working with Mailgun account
//var NodeMailer = require('./includes/NodeMailer.js');
var WebServer = {
    init: function(){
        WebServer.setupMiddleware();
        WebServer.serveDirectories();
        WebServer.defineRoutes();
        WebServer.setupApi();
        WebServer.errorHandling();
    },
    setupMiddleware: function(){
        // view engine setup - Jade
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'jade');
        // uncomment next line after placing your favicon in /public
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(cookieParser());
        app.use(session({
            secret: 'keyboard cat',
            store: sessionStore,
            resave: true,
            saveUninitialized: true,
            cookie: { maxAge: 60000 }
        }));
        app.use(flash());
        // Custom flash middleware -- from Ethan Brown's book, 'Web Development with Node & Express'
        app.use(function(req, res, next){
            // if there's a flash message in the session request, make it available in the response, then delete it
            res.locals.sessionFlash = req.session.sessionFlash;
            delete req.session.sessionFlash;
            next();
        });
        // Initialize Passport and restore authentication state,
        // if any, from any previous session.
        app.use(passport.initialize());
        app.use(passport.session());
    },
    serveDirectories: function(){
        // Allow the 'public' folder to be served to the front-end
        app.use(express.static(path.join(__dirname, 'public')));
        // Allow the 'node_modules/angular' folder to be served to the front-end
        app.use(express.static(path.join(__dirname, 'node_modules/angular')));
        // Allow the 'node_modules/angular-animate' folder to be served to the front-end
        app.use(express.static(path.join(__dirname, 'node_modules/angular-animate')));
    },
    defineRoutes: function(){
        app.get('/', function(req, res){
            res.render('index', {
                Data: Data,
                user: req.user[0],
                expressFlash: req.flash('success'),
                sessionFlash: res.locals.sessionFlash
            });
        });

        // TODO remove these test flash message creation routes when sure unneeded
        // Route that creates a flash message using the express-flash module
        app.get('/express-flash', function( req, res ){
            req.flash('success', 'This is a flash message using the express-flash module.');
            res.redirect('/');
        });

        // Route that creates a flash message using custom middleware
        app.get('/session-flash', function( req, res ){
            req.session.sessionFlash = {
                type: 'success',
                message: 'This is a flash message using custom middleware and express-session.'
            };
            res.redirect('/');
        });

        app.get('/login',
            function(req, res){
                res.redirect('/');
            });

        app.get('/login/failure', function( req, res ){
            // Use req.session.sessionFlash as it is available to msg logged out user
            req.session.sessionFlash = {
                type: 'success',
                message: 'Unable to login, please try again or consult the systems admin.'
            };
            res.redirect('/');
        });

        app.post('/login',
            passport.authenticate('local', {
                successRedirect: '/',
                failureRedirect: '/login/failure',
                failureFlash: 'Login Failure!',
                successFlash: 'Welcome: successful login!'
            }),
            function(req, res){
                Log.log.info('User', 'User ' + req.user[0]['username'] + ' logged in', true);
            });

        app.get('/logout',
            function(req, res){
                var msg = 'User ' + req.user[0]['username'] + ' logged out';
                req.flash('success', msg);
                Log.log.info('User', msg, true);
                req.logout();
                res.redirect('/');
            });

        app.get('/user',
            connectEnsureLogin.ensureLoggedIn(),
            function(req, res){
                res.render('user', {
                    user: req.user[0],
                    expressFlash: req.flash('success'),
                    sessionFlash: res.locals.sessionFlash
                });
            });

        app.get('/gatherings',
            connectEnsureLogin.ensureLoggedIn(),
            function(req, res){
                res.render('gatherings', {
                    Data: Data,
                    user: req.user[0],
                    expressFlash: req.flash('success'),
                    sessionFlash: res.locals.sessionFlash
                });
            });

        app.get('/gathering/:gName',
            connectEnsureLogin.ensureLoggedIn(),
            function(req, res){
                if(typeof Data.gatherings[req.params.gName] != "undefined"){
                    var gathering = Data.gatherings[req.params.gid];
                }
                else if(typeof Data.gatherings[0] != "undefined"){
                    var gathering = Data.gatherings[0];
                }
                if(typeof gathering != "undefined"){
                    res.render('gathering', {
                        Data: Data,
                        Gathering: gathering,
                        user: req.user[0],
                        expressFlash: req.flash('success'),
                        sessionFlash: res.locals.sessionFlash
                    });
                }
                // If no gatherings redirect to /gatherings to allow gathering creation
                res.redirect('/gatherings');
            });

        app.get('/logs',
            connectEnsureLogin.ensureLoggedIn(),
            function(req, res){
                if(req.user[0]['permissions']['logs']['view']){
                    res.render('log', {
                        Data: Data,
                        user: req.user[0],
                        expressFlash: req.flash('success'),
                        sessionFlash: res.locals.sessionFlash
                    });
                }
                else{
                    // TODO message regarding permissions and redirection
                    res.redirect('/');
                }
            });
    },
    setupApi: function(){
        /** JSON API allows requests from front end to accomplish tasks */
        app.get('/api/data/get', function(req, res){
            return res.json({ Data: Data });
        });
        app.get('/api/users/get', function(req, res){
            return res.json({ users: Data.users });
        });
        app.get('/api/gatherings/get', function(req, res){
            return res.json({ gatherings: Data.gatherings });
        });
        app.get('/api/games/get', function(req, res){
            return res.json({ games: Data.games });
        });
        app.get('/api/loading/get', function(req, res){
            return res.json({ loading: Data.loading });
        });
        app.get('/api/messages/get', function(req, res){
            return res.json({ messages: req.flash('info') });
        });
        app.get('/api/user/get', function(req, res){
            // get active logged in user
            var user = {};
            if(typeof req.user != "undefined"){
                user = req.user[0];
            }
            return res.json({ user: user });
        });
        app.post('/api/gathering/add', function(req, res){
            console.log('/api/gathering/add backend route called');
            if(typeof req.body.gName != "undefined"){
                Data.loading = true;
                console.log(req.body);
                var gathering = new Gathering(req.body.gName, req.body.creator);
                // TODO on gathering creation save to db
                Data.gatherings.push(gathering);
                Data.loading = false;
                return res.json({ gatherings: Data.gatherings });
            }
            else{
                return res.json({ gatherings: Data.gatherings });
            }
        });
        app.post('/api/user/add', function(req, res){
            console.log('/api/user/add backend route called');
            if(typeof req.body.username != "undefined" && typeof req.body.password != "undefined"){
                Data.loading = true;
                //console.log(req.body);
                var user = new User(req.body.gName, req.body.creator);
                // TODO on user creation save to db
                Data.users.push(user);
                Data.loading = false;
                return res.json({ Data: Data });
            }
            else{
                return res.json({ Data: Data });
            }
        });
        // TODO finish updating to work with specific gathering
        app.post('/api/gathering/:gName/user/add', function(req, res){
            //console.log('/api/user/add backend route called');
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
                                return res.json({ Data: Data });
                            })
                        ;
                    })
                ;
            }
            else{
                return res.json({ Gathering: Gathering });
            }
        });
        // TODO finish updating to work with specific gathering
        app.post('/api/gathering/:gName/user/delete', function(req, res){
            //console.log('/api/user/delete backend route called');
            if(typeof req.body.username != "undefined"){
                Gathering.loading = true;
                //console.log(req.body.username);
                // Find and delete user with username from Gathering.users
                Gathering.deleteBGG_User(req.body.username);
                Gathering.updateAvailableGames()
                    .then(function(){
                        Gathering.loading = false;
                        return res.json({ Data: Data });
                    })
                ;
            }
        });
        // log
        app.get('/api/log/get', function(req, res){
            return res.json({ log: Data.logs });
        });
        app.get('/api/log/load', function(req, res){
            // /load queries the db for new log items as opposed to /get just getting the current items
            Log.load(Data);
            return res.json({ log: Data.logs });
        });
        app.get('/api/log/reset', function(req, res){
            Log.reset(Data);
            return res.json({ log: Data.logs });
        });
    },
    errorHandling: function(){
        // Send 404's to 404 page
        // from http://stackoverflow.com/a/9802006/1291935
        app.use(function(req, res, next){
            res.status(404);
            // respond with html page
            if (req.accepts('html')) {
                res.render('404', { url: req.url });
                return;
            }
            // respond with json
            if (req.accepts('json')) {
                res.send({ error: 'Not found' });
                return;
            }
            // default to plain-text. send()
            res.type('txt').send('Not found');
        });

        /** error handlers */
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
        Log.log.info('WebServer', 'WebServer initialized', true);

    }
};
// Object for overall application
var GameNight = {
    init: function(){
        Database.init(Data);
        Log.init(Data);
        WebServer.init();
        Log.log.info('GameNight', 'GameNight initialized', true);

        //GameNight.test();
    },
    test: function(){ /** testing function to setup data */
        /*var testUser = Gathering.addBGG_User('drcord');
        var testUser2 = Gathering.addBGG_User('glittergamer');
        var testUser3 = Gathering.addBGG_User('test897974444');
        // Example/test usage
        testUser3.update()
            .then(function(userObj){
                Gathering.updateBGG_User(userObj);
            })
        ;*/
        Data.gatherings.push(new Gathering('testGathering1', 'drcord'));
        console.log('GameNight.test() - Data');
        console.log(Data);
    }
};
// Start application
GameNight.init();

module.exports = app;