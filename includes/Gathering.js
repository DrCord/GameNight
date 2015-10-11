var BGG_User = require('./BGG_User.js');

var Gathering = Gathering || {};
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
    if(userFound = Gathering.findBGG_User(userObj)){
        return userFound['userMatch'];
    }
    return false;
};
/**
 *
 * @param userObj
 * @returns {*} numeric index (including 0) of deleted item or false if user not found
 */
Gathering.deleteBGG_User = function(userObj){
    console.log('Gathering.deleteBGG_User() called');
    if(userFound = Gathering.findBGG_User(userObj)){
        delete Gathering.users[userFound['indexMatch']];
        // Remove the now empty null placeholders from the users array
        Gathering.users.clean(undefined);
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
        console.log('userFound');
        console.log(userFound);
        for(var i=0; i < Gathering.users.length; i++){
            if(Gathering.users[i]['username'] == username){
                console.log('Find User - Gathering.users[' + i + ']');
                console.log(Gathering.users[i]);
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
};
// Export Gathering
module.exports = Gathering;