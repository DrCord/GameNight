$(function(){
    // Prevent enter from submitting the form and reloading the page
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
                // TODO: display returned user(s) in page
                //$('#results').html(data);
                console.log('addUser function - front-end: data:');
                console.log(data);
            });
        }
        else{
            // TODO: return validation message to user to enter a username
        }
    };
});