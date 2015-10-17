var bgg = require('bgg'); //https://www.npmjs.com/package/bgg
var BGG_User = require('./BGG_User.js');
var Game = require('./Game.js');

var Gathering = Gathering || {};
Gathering.loading = false;
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
    //console.log('Gathering.addBGG_User() called');
    var newUser = new BGG_User(username);
    Gathering.users.push(newUser);
    Gathering.compare.unique(Gathering.users, Gathering.compare.users);
    if(userFound = Gathering.findBGG_User(newUser)){
        return userFound['userMatch'];
    }
    return false;
};
Gathering.updateBGG_User = function(userObj){
    //console.log('Gathering.updateBGG_User() called');
    if(userFound = Gathering.findBGG_User(userObj)){
        return userFound['userMatch'];
    }
    return false;
};
Gathering.updateAvailableGames = function(userObj){
    //console.log('Gathering.updateAvailableGames() called');
    // Reset games if no userObj supplied
    if(typeof userObj == "undefined"){
        // Remove all games from Gathering.games
        Gathering.games = [];
        // Refill games from existing users
        for(var m=0; m < Gathering.users.length; m++){
            for(var i=0; i < Gathering.users[m].collection.length; i++){
                Gathering.games.push(new Game(Gathering.users[m].collection[i].objectid));
            }
        }
    }
    else{ // Add userObj games to pool of available games
        for(var i=0; i < userObj.collection.length; i++){
            Gathering.games.push(new Game(userObj.collection[i].objectid));
        }
    }
    // Remove duplicate games
    Gathering.compare.unique(Gathering.games, Gathering.compare.games);
    //if(Gathering.games.length){
        // If needed assemble string for multiple 'thing' API request
        var gameIdsString = 0; // Use 0 if no games
        if(Gathering.games.length > 1){
            var gameIds = [];
            for(var i=0; i < Gathering.games.length; i++){
                gameIds.push(Gathering.games[i].objectid);
            }
            gameIdsString = [gameIds.join()];
        }
        else if(Gathering.games.length == 1){ // Just use single game id
            gameIdsString = Gathering.games[0].objectid;
        }
        // Return promise
        return bgg('thing', {id: gameIdsString})
            .then(function(results){
                //console.log('Gathering.updateAvailableGames() - results');
                //console.log(results);
                if(typeof results['items'] != "undefined" && typeof results['items']['item'] != "undefined"){
                    // API returns an array of objects or a single object (not in an array!)
                    if(Array.isArray(results['items']['item'])){
                        for(var i=0; i < results['items']['item'].length; i++){
                            var gameObj = results['items']['item'][i];
                            var gameFound = Gathering.findGame(gameObj);
                            //console.log('gameFound');
                            //console.log(gameFound);
                            if(gameFound){
                                for(var attrname in gameObj){
                                    // Normalize name
                                    if(attrname == 'name'){
                                        Gathering.games[gameFound.indexMatch][attrname] = gameObj[attrname];
                                        if(Array.isArray(Gathering.games[gameFound.indexMatch]['name'])){
                                            Gathering.games[gameFound.indexMatch]['name'] = {};
                                            Gathering.games[gameFound.indexMatch]['name']['value'] = gameObj['name'][0]['value'];
                                        }
                                        else{
                                            Gathering.games[gameFound.indexMatch]['name'] = {};
                                            Gathering.games[gameFound.indexMatch]['name']['value'] = gameObj['name']['value'];
                                        }
                                    }
                                    else{
                                        Gathering.games[gameFound.indexMatch][attrname] = gameObj[attrname];
                                    }
                                }
                                //console.log('Gathering.games[' + gameFound.indexMatch + ']');
                                //console.log(Gathering.games[gameFound.indexMatch]);
                            }
                        }
                    }
                    else{ // is Object from single result
                        var gameObj = results['items']['item'];
                        if(gameFound = Gathering.findGame(gameObj)){
                            for(var attrname in gameObj){
                                Gathering.games[gameFound.indexMatch][attrname] = gameObj[attrname];
                            }
                        }
                    }
                }
            })
            .then(function(){
                return true;
            })
            .catch(function(error){
                console.log('Gathering.updateAvailableGames() - catch!!');
                console.log(error);
            })
        ;
    //}
};
/**
 * @param userObj
 * @returns {*} numeric index (including 0) of deleted item or false if user not found
 */
Gathering.deleteBGG_User = function(userObj){
    //console.log('Gathering.deleteBGG_User() called');
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
    //console.log('Gathering.findBGG_User() called');
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
/**
 * @param gameObj - accepts either a game object or a game id
 * @returns {indexMatch: (int), gameMatch: (object)}
 */
Gathering.findGame = function(gameObj){
    //console.log('Gathering.findGame() called');
    // Allow either a game object or a game id
    var gameId = gameObj;
    if(typeof gameObj == "object"){
        gameId = gameObj.id;
    }
    var gameFound = Gathering.games.objectFind({objectid: gameId});
    if(gameFound && gameFound.length){
        for(var i=0; i < Gathering.games.length; i++){
            if(Gathering.games[i]['objectid'] == gameId){
                //console.log('Gathering.findGame() - Gathering.games[' + i + ']');
                //console.log(Gathering.games[i]);
                var output = {
                    indexMatch: i,
                    gameMatch: Gathering.games[i]
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