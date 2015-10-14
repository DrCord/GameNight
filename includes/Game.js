var bgg = require('bgg'); //https://www.npmjs.com/package/bgg
// Game constructor, inherits from Object
var Game = function(objectId){
    this.objectid = objectId;
};
Game.prototype.getData = function(retry) {
    //console.log('Game.getData() called');
    var thisGame = this;
    var retry = retry || 1;
    return bgg('thing', {id: thisGame.objectid})
        .then(function(results){
            if(typeof results['items'] != "undefined" && typeof results['items']['item'] != "undefined"){
                var gameObj = results['items']['item'];
                for(var attrname in gameObj){
                    thisGame[attrname] = gameObj[attrname];
                }
            }
        })
        .then(function(){
            return thisGame;
        })
        .catch(function(error){
            console.log('Game.getData() - catch!! - thisGame.objectid: ' + thisGame.objectid);
            console.log(error);
            // If not successful try one more time to get the data for this game
            if(retry == 1){
                return thisGame.getData(0);
            }
            else{
                return thisGame;
            }
        })
    ;
};

Game.prototype.update = function() {
    //console.log('Game.update() called');
    var thisGame = this;
    return thisGame.getData()
        .catch(function(error){
            console.log('Game.update() - catch!!');
            console.log(error);
            return thisGame;
        })
    ;
};

module.exports = Game;