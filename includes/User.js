// User constructor, inherits from Object
var User = function(username, id, password, displayName, emails){
    id = id || null;
    password = password || null;
    emails = emails || [];
    this._id = id;
    this.username = username;
    this.password = password;
    // if not set use username and capitalize only first character
    this.displayName = displayName || username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
    this.emails = emails;
};
User.prototype.getUserCollection = function() {
    //console.log('User.getUserCollection() called');
    return false;
};
User.prototype.getUserData = function() {
    //console.log('User.getUserData() called');
    return false;
};
User.prototype.update = function() {
    //console.log('User.update() called');
    return false;
};

module.exports = User;