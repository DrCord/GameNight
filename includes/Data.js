// User constructor, inherits from Object
var Data = function(){
    this.users = [];
    this.gatherings = [];
    this.games = [];
    this.logs = [];
    this.loading = false;
};

/**
 * @param gameObj - accepts either a game object or a game id
 * @returns {indexMatch: (int), gameMatch: (object)}
 */
Data.prototype.findGathering = function(gatheringObj){
    console.log('Data.findGathering() called');
    // Allow either a gathering object or a gathering displayName
    var gatheringDisplayName = gatheringObj;
    if(typeof gatheringObj == "object"){
        gatheringDisplayName = gatheringObj.displayName;
    }
    var gatheringFound = this.gatherings.objectFind({displayName: gatheringDisplayName});
    if(gatheringFound && gatheringFound.length){
        for(var i=0; i < this.gatherings.length; i++){
            if(this.gatherings[i]['displayName'] == gameId){
                console.log('this.findGathering() - this.gatherings[' + i + ']');
                console.log(this.gatherings[i]);
                var output = {
                    indexMatch: i,
                    gatheringMatch: this.gatherings[i]
                };
                return output;
            }
        }
    }
    return false;
};

module.exports = Data;