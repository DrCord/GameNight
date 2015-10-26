// User constructor, inherits from Object
var User = function(username, password, displayName, emails, permissions){
    password = password || null;
    emails = emails || [];
    permissions = permissions || {
        logs: {
            view: false,
            reset: false
        },
        users: {
            view: false,
            edit: false,
            delete: false
        },
        gatherings: {
            edit: false,
            delete: false
        }
    };
    this.username = username;
    this.password = password;
    // if not set use username and capitalize only first character
    this.displayName = displayName || username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
    this.emails = emails;
    this.permissions = permissions;
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