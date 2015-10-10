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

module.exports = User;