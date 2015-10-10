var express = require('express');
var router = express.Router();
var bgg = require('bgg'); //https://www.npmjs.com/package/bgg
// Extend array with find for an object literal value
// From http://stackoverflow.com/a/11836196/1291935
// Usage var arrayFound = obj.items.objectFind({isRight:1});
Array.prototype.objectFind = function(obj) {
    return this.filter(function(item) {
        for (var prop in obj)
            if (!(prop in item) || obj[prop] !== item[prop])
                return false;
        return true;
    });
};

// Setup data objects
var Gathering = Gathering || {};
Gathering.users = Gathering.users || [];
Gathering.location = Gathering.location || {};
// User constructor, inherits from Object
var User = function(username){
    this.username = username;
};
User.prototype.getUserCollection = function() {
    console.log('User.getUserCollection() called');
    return false;
};
User.prototype.getUserData = function() {
    console.log('User.getUserData() called');
    return false;
};
User.prototype.update = function() {
    console.log('User.update() called');
    var userFound = Gathering.users.objectFind({username: this.username});
    if(userFound){
        console.log('userFound');
        console.log(userFound);
        for(var i=0; i < Gathering.users.length; i++){
            if(Gathering.users[i]['username'] == this.username){
                Gathering.users[i] = this;
                console.log('Update User - Gathering.users[' + i + ']');
                console.log(Gathering.users[i]);
                return true;
            }
        }
    }
    return false;
};
// BGG_User constructor, inherits from User
var BGG_User = function(username){
    User.call(this, username);
    this.collection = [];
    this.userData = {};
};
// Make our prototype from User.prototype so we inherit User's methods
BGG_User.prototype = Object.create(User.prototype);
// Modify functions
BGG_User.prototype.getUserCollection = function() {
    console.log('BGG_User.getUserCollection() called');
    var thisUser = this;
    bgg('collection', {username: thisUser.username})
        .then(function(results){
            thisUser.collection = results;
        }).then(function(){
            Gathering.updateBGG_User(thisUser);
        })
    ;
};
BGG_User.prototype.getUserData = function() {
    console.log('BGG_User.getUserData() called');
    var thisUser = this;
    bgg('user', {name: thisUser.username})
        .then(function(results){
            thisUser.userData = results;
        }).then(function(){
            Gathering.updateBGG_User(thisUser);
        })
    ;
};
// Set BGG_User constructor to itself
BGG_User.prototype.constructor = BGG_User;

Gathering.addBGG_User = function(username){
    if(Gathering.users.indexOf(username) === -1){ // TODO: needs fixing - won't work as is numerically indexed array, need to look deeper
        var newUser = new BGG_User(username);
        Gathering.users.push(newUser);
        return newUser;
    }
    return false;
};
Gathering.updateBGG_User = function(userObj){
    console.log('Gathering.updateBGG_User() called');
    var userFound = Gathering.users.objectFind({username: userObj.username});
    if(userFound && userFound.length){
        console.log('userFound');
        console.log(userFound);
        for(var i=0; i < Gathering.users.length; i++){
            if(Gathering.users[i]['username'] == userObj.username){
                Gathering.users[i] = userObj;
                console.log('Update User - Gathering.users[' + i + ']');
                console.log(Gathering.users[i]);
                return true;
            }
        }
    }
    return false;
};

/* dummy test data */
var testUser = Gathering.addBGG_User('drcord');
var testUser2 = Gathering.addBGG_User('glittergamer');

//testUser.getUserCollection();
testUser.getUserData();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index',
        {
            title: 'GameNight',
            Gathering: Gathering
        }
    );
});

module.exports = router;
