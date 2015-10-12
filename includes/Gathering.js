var BGG_User = require('./BGG_User.js');

var Gathering = Gathering || {};
Gathering.compare = {
    unique: function(a, compareFunc){
        /** From: http://stackoverflow.com/a/2219206/1291935
         * used to remove objects that are duplicate based on a compare function */
        a.sort( compareFunc );
        for(var i = 1; i < a.length; ){
            if( compareFunc(a[i-1], a[i]) === 0){
                a.splice(i, 1);
            } else {
                i++;
            }
        }
        return a;
    },
    /** comparison functions for respective types of objects */
    users: function(userObjA, userObjB){ return userObjA.username.localeCompare(userObjB.username); },
    games: function(gameObjA, gameObjB){
        if (gameObjA.objectid < gameObjB.objectid) {
            return -1;
        }
        if (gameObjA.objectid > gameObjB.objectid) {
            return 1;
        }
        // a must be equal to b
        return 0;
    }
};
Gathering.addBGG_User = function(username){
    var newUser = new BGG_User(username);
    Gathering.users.push(newUser);
    Gathering.compare.unique(Gathering.users, Gathering.compare.users);
    if(userFound = Gathering.findBGG_User(newUser)){
        return userFound['userMatch'];
    }
    return false;
};
Gathering.updateBGG_User = function(userObj){
    console.log('Gathering.updateBGG_User() called');
    if(userFound = Gathering.findBGG_User(userObj)){
        Gathering.updateAvailableGames(userFound['userMatch']);
        return userFound['userMatch'];
    }
    return false;
};
Gathering.updateAvailableGames = function(userObj){
    console.log('Gathering.updateAvailableGames() called');
    Gathering.games = Gathering.games.concat(userObj.collection);
    // Remove duplicates
    Gathering.compare.unique(Gathering.games, Gathering.compare.games);
};
/**
 * @param userObj
 * @returns {*} numeric index (including 0) of deleted item or false if user not found
 */
Gathering.deleteBGG_User = function(userObj){
    console.log('Gathering.deleteBGG_User() called');
    if(userFound = Gathering.findBGG_User(userObj)){
        delete Gathering.users[userFound['indexMatch']];
        // Remove the now empty null placeholders from the users array
        Gathering.users.clean(undefined);
        // Remove user's games from Gathering.games
        Gathering.games = [];
        for(var i =0; i < Gathering.users.length; i++){
            Gathering.updateAvailableGames(Gathering.users[i]);
        }
        return userFound['indexMatch'];
    }
    return false;
};
/**
 * @param userObj - accepts either a user object or a username
 * @returns {indexMatch: (int), userMatch: (object)}
 */
Gathering.findBGG_User = function(userObj){
    console.log('Gathering.findBGG_User() called');
    // Allow either a username or a user object
    var username = userObj;
    if(typeof userObj == "object"){
        username = userObj.username;
    }
    var userFound = Gathering.users.objectFind({username: username});
    if(userFound && userFound.length){
        //console.log('userFound');
        //console.log(userFound);
        for(var i=0; i < Gathering.users.length; i++){
            if(Gathering.users[i]['username'] == username){
                //console.log('Find User - Gathering.users[' + i + ']');
                //console.log(Gathering.users[i]);
                var output = {
                    indexMatch: i,
                    userMatch: Gathering.users[i]
                };
                return output;
            }
        }
    }
    return false;
};
Gathering.init = function(){
    Gathering.users = Gathering.users || [];
    Gathering.location = Gathering.location || {};
    Gathering.games = Gathering.games || [];
};
// Export Gathering
module.exports = Gathering;