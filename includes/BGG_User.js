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
// Modify functions from User constructor
BGG_User.prototype.getUserCollection = function() {
    console.log('BGG_User.getUserCollection() called');
    var thisUser = this;
    return bgg('collection', {username: thisUser.username})
        .then(function(results){
            if(typeof results['items']['item'] != "undefined"){
                thisUser.collection = results['items']['item'];
            }
            else{
                thisUser.collection = {};
            }
        }).then(function(){
            return thisUser;
        })
        .catch(
            function(){
                console.log('BGG_User.getUserCollection() - catch!!')
                return thisUser;
            }
        )
    ;
};
BGG_User.prototype.getUserData = function() {
    console.log('BGG_User.getUserData() called');
    var thisUser = this;
    return bgg('user', {name: thisUser.username})
        .then(function(results){
            thisUser.userData = results['user'];
        }).then(function(){
            return thisUser;
        })
        .catch(
            function(){
                console.log('BGG_User.getUserData() - catch!!')
                return thisUser;
            }
        )
    ;
};
BGG_User.prototype.update = function() {
    console.log('BGG_User.update() called');
    var thisUser = this;
    return thisUser.getUserData()
        .then(
            function(){
                return thisUser.getUserCollection();
            }
        )
        .catch(
            function(){
                console.log('BGG_User.update() - catch!!')
                return thisUser;
            }
        )
    ;
};
// Set BGG_User constructor to itself
BGG_User.prototype.constructor = BGG_User;
// Export BGG_User
module.exports = BGG_User;