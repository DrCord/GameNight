$(function(){
    // Prevent enter from submitting the form and reloading the page
    // Form is submitted via ajax to backend API instead
    $(window).keydown(function(event){
        if(event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
    // Clicking add-user button
    $('#add-user-button').on('click', function(){
        addUser();
    });
    // Enter key in add-user-input field
    $('#add-user-input').on('keyup', function(e){
        e.preventDefault();
        if(e.keyCode === 13) {
            addUser();
        };
    });

    var addUser = function(){
        var username = $('#add-user-input').val();
        if(username != ''){
            var parameters = { username: username };
            $.get('/api/add-user', parameters, function(data) {
                // Display returned user(s) in page
                /*var results = data;
                results.msg = '';
                if(results['users'].length == 0){
                    results.msg = 'No users in Gathering, add users above.';
                }
                if (results['users'] instanceof Array) {
                    $gatheringUsers.html(dataTemplate({ gatheringUsers: results }));
                } else {
                    $gatheringUsers.html(results);
                };*/
                console.log('addUser function - front-end: results:');
                console.log(results);
            });
        }
        else{
            // TODO: return validation message to user to enter a username
        }
    };
});