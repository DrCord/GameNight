var BGG_User = require('./BGG_User.js');

var Gathering = Gathering || {};
Gathering.users = Gathering.users || [];
Gathering.location = Gathering.location || {};
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
// Export Gathering
module.exports = Gathering;