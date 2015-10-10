var bgg = require('bgg'); //https://www.npmjs.com/package/bgg
var User = require('./User.js');

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
    return bgg('collection', {username: thisUser.username})
        .then(function(results){
            thisUser.collection = results;
        }).then(function(){
            return thisUser;
        })
    ;
};
BGG_User.prototype.getUserData = function() {
    console.log('BGG_User.getUserData() called');
    var thisUser = this;
    return bgg('user', {name: thisUser.username})
        .then(function(results){
            thisUser.userData = results;
        }).then(function(){
            return thisUser;
        })
    ;
};
// Set BGG_User constructor to itself
BGG_User.prototype.constructor = BGG_User;

module.exports = BGG_User;