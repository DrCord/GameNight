var bgg = require('bgg'); //https://www.npmjs.com/package/bgg
var BGG_User = require('./BGG_User.js');
var Game = require('./Game.js');

// Gathering constructor, inherits from Object
var Gathering = function(gName, creator, users, games, location, id){
    gName = gName || '';
    creator = creator || '';
    users = users || [];
    games = games || [];
    location = location || {};
    id = id || null; // TODO: needs a way to lookup next id to use from db
    this.gName = gName;
    this.creator = creator;
    this.owner = creator;
    this.users = users;
    this.games = games;
    this.location = location;
    this._id = id;
    this.loading = false;
};

Gathering.prototype.compare = {
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

Gathering.prototype.addBGG_User = function(username){
    //console.log('Gathering.addBGG_User() called');
    var newUser = new BGG_User(username);
    this.users.push(newUser);
    this.compare.unique(this.users, this.compare.users);
    if(userFound = this.findBGG_User(newUser)){
        return userFound['userMatch'];
    }
    return false;
};

Gathering.prototype.updateBGG_User = function(userObj){
    //console.log('Gathering.updateBGG_User() called');
    if(userFound = this.findBGG_User(userObj)){
        return userFound['userMatch'];
    }
    return false;
};

Gathering.prototype.updateAvailableGames = function(userObj){
    //console.log('Gathering.updateAvailableGames() called');
    // Reset games if no userObj supplied
    if(typeof userObj == "undefined"){
        // Remove all games from this.games
        this.games = [];
        // Refill games from existing users
        for(var m=0; m < this.users.length; m++){
            for(var i=0; i < this.users[m].collection.length; i++){
                this.games.push(new Game(this.users[m].collection[i].objectid));
            }
        }
    }
    else{ // Add userObj games to pool of available games
        for(var i=0; i < userObj.collection.length; i++){
            this.games.push(new Game(userObj.collection[i].objectid));
        }
    }
    // Remove duplicate games
    this.compare.unique(this.games, this.compare.games);
    //if(this.games.length){
    // If needed assemble string for multiple 'thing' API request
    var gameIdsString = 0; // Use 0 if no games
    if(this.games.length > 1){
        var gameIds = [];
        for(var i=0; i < this.games.length; i++){
            gameIds.push(this.games[i].objectid);
        }
        gameIdsString = [gameIds.join()];
    }
    else if(this.games.length == 1){ // Just use single game id
        gameIdsString = this.games[0].objectid;
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
                        var gameFound = this.findGame(gameObj);
                        //console.log('gameFound');
                        //console.log(gameFound);
                        if(gameFound){
                            for(var attrname in gameObj){
                                // Normalize name
                                if(attrname == 'name'){
                                    this.games[gameFound.indexMatch][attrname] = gameObj[attrname];
                                    if(Array.isArray(this.games[gameFound.indexMatch]['name'])){
                                        this.games[gameFound.indexMatch]['name'] = {};
                                        this.games[gameFound.indexMatch]['name']['value'] = gameObj['name'][0]['value'];
                                    }
                                    else{
                                        this.games[gameFound.indexMatch]['name'] = {};
                                        this.games[gameFound.indexMatch]['name']['value'] = gameObj['name']['value'];
                                    }
                                }
                                else{
                                    this.games[gameFound.indexMatch][attrname] = gameObj[attrname];
                                }
                            }
                            //console.log('this.games[' + gameFound.indexMatch + ']');
                            //console.log(this.games[gameFound.indexMatch]);
                        }
                    }
                }
                else{ // is Object from single result
                    var gameObj = results['items']['item'];
                    if(gameFound = this.findGame(gameObj)){
                        for(var attrname in gameObj){
                            this.games[gameFound.indexMatch][attrname] = gameObj[attrname];
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

Gathering.prototype.getUserCollection = function() {
    //console.log('User.getUserCollection() called');
    return false;
};

/**
 * @param userObj
 * @returns {*} numeric index (including 0) of deleted item or false if user not found
 */
Gathering.prototype.deleteBGG_User = function(userObj){
    //console.log('Gathering.deleteBGG_User() called');
    if(userFound = this.findBGG_User(userObj)){
        delete this.users[userFound['indexMatch']];
        // Remove the now empty null placeholders from the users array
        this.users.clean(undefined);
        return userFound['indexMatch'];
    }
    return false;
};
/**
 * @param userObj - accepts either a user object or a username
 * @returns {indexMatch: (int), userMatch: (object)}
 */
Gathering.prototype.findBGG_User = function(userObj){
    //console.log('Gathering.findBGG_User() called');
    // Allow either a username or a user object
    var username = userObj;
    if(typeof userObj == "object"){
        username = userObj.username;
    }
    var userFound = this.users.objectFind({username: username});
    if(userFound && userFound.length){
        //console.log('userFound');
        //console.log(userFound);
        for(var i=0; i < this.users.length; i++){
            if(this.users[i]['username'] == username){
                //console.log('Find User - this.users[' + i + ']');
                //console.log(this.users[i]);
                var output = {
                    indexMatch: i,
                    userMatch: this.users[i]
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
Gathering.prototype.findGame = function(gameObj){
    //console.log('Gathering.findGame() called');
    // Allow either a game object or a game id
    var gameId = gameObj;
    if(typeof gameObj == "object"){
        gameId = gameObj.id;
    }
    var gameFound = this.games.objectFind({objectid: gameId});
    if(gameFound && gameFound.length){
        for(var i=0; i < this.games.length; i++){
            if(this.games[i]['objectid'] == gameId){
                //console.log('this.findGame() - this.games[' + i + ']');
                //console.log(this.games[i]);
                var output = {
                    indexMatch: i,
                    gameMatch: this.games[i]
                };
                return output;
            }
        }
    }
    return false;
};
// Export Gathering
module.exports = Gathering;