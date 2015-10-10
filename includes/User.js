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
    return false;
};

module.exports = User;