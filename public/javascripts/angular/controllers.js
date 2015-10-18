'use strict';
/** Controllers */
angular.module('gameNight.controllers', []).
    controller('AppCtrl', function ($scope, $http, $resource, poller) {
        $scope.ready = false;
        $scope.Gathering = $scope.Gathering || {
            init: function(){
                $scope.Gathering.users = $scope.Gathering.users || [];
                $scope.Gathering.games = $scope.Gathering.games || [];
                $scope.Gathering.loading = false;
            }
        };

        $scope.getGathering = function(){
            $scope.Gathering.loading = true;
            return $http.get('/api/gathering').
                success(function( data ) {
                    console.log('AppCtrl.getGathering function - front-end: data:');
                    console.log(data);
                    $scope.Gathering = data.Gathering;
                    $scope.initGameUrls();
                    $scope.Gathering.loading = false;
                    return $scope.Gathering;
                })
            ;
        };
        $scope.getUsers = function(){
            return $http.get('/api/users').
                success(function( data ) {
                    console.log('AppCtrl.getUsers function - front-end: data:');
                    console.log(data);
                    $scope.Gathering = data.Gathering;
                    $scope.initGameUrls();
                })
            ;
        };
        $scope.addUser = function(username){
            // TODO(maybe): change to promise to allow then(), see getUsers()
            if(typeof username != "undefined" && username != ''){
                $scope.Gathering.loading = true;
                var parameters = { username: username };
                $http.post('/api/add-user', parameters).
                    success(function( data ) {
                        console.log('AppCtrl.addUser function - front-end: data:');
                        console.log(data);
                        $scope.Gathering = data.Gathering;
                        $scope.initGameUrls();
                        $scope.Gathering.loading = false;
                        $scope.addUserInputUsername = '';
                    })
                ;
            }
            else{
                // TODO: return validation message to user to enter a username
                console.log('AppCtrl.addUser function - else');
            }
        };
        $scope.deleteUser = function(username){
            // TODO(maybe): change to promise to allow then(), see getUsers()
            if(typeof username != "undefined" && username != ''){
                $scope.Gathering.loading = true;
                var parameters = { username: username };
                $http.post('/api/delete-user', parameters).
                    success(function( data ) {
                        console.log('AppCtrl.deleteUser function - front-end: data:');
                        console.log(data);
                        $scope.Gathering = data.Gathering;
                        $scope.initGameUrls();
                        $scope.Gathering.loading = false;
                    })
                ;
            }
            else{
                // TODO: return validation message to user to enter a username
                console.log('AppCtrl.deleteUser function - else');
            }
        };
        $scope.searchChangeType = function(value){
            // Allows all except "None" to use strict search
            if(value == ""){
                $scope.strict = false;
            }
            else{
                $scope.strict = true;
            }
        };
        $scope.initFilterValues = function(){
            $scope.customFilters = {
                playingTime: {
                    min: 0,
                    max: 180
                },
                players: {
                    min: 0,
                    max: 15
                }
            };
        };
        $scope.initGameUrls = function(){
            if(typeof $scope.Gathering != "undefined" && typeof $scope.Gathering.games != "undefined"){
                for(var i=0; i< $scope.Gathering.games.length; i++){
                    // create full link to game as property for rendering in DOM
                    $scope.Gathering.games[i]['url'] = 'http://boardgamegeek.com/';
                    $scope.Gathering.games[i]['url'] += $scope.Gathering.games[i]['type'];
                    $scope.Gathering.games[i]['url'] += '/';
                    $scope.Gathering.games[i]['url'] += $scope.Gathering.games[i]['id'];
                }
            }
        };
        $scope.initSortValues = function () {
            $scope.sortReverse = false;
            $scope.sortField = 'name.value';
        };
        $scope.gameTooltipText = function(showDetails){
            var text = "Click for more information";
            if(showDetails){
                text = "Click to close information";
            }
            return text;
        };
        $scope.dataPoller = function(){
            // Define your resource object.
            var logResource = $resource('/api/gathering');
            // Get poller. This also starts/restarts poller.
            var logPoller = poller.get(logResource, {
                catchError: true
            });
            // Update view. Since a promise can only be resolved or rejected once but we want
            // to keep track of all requests, poller service uses the notifyCallback. By default
            // poller only gets notified of success responses.
            logPoller.promise.then(null, null, function(data){$scope.dataPollerCallback(data)});
        };
        $scope.dataPollerCallback = function(result){
            // If catchError is set to true, this notifyCallback can contain either
            // a success or an error response.
            if (result.$resolved) {
                // Success handler ...
                var updated = $scope.dataUserUpdatedCheck(result);
                // If not identical set data to new data, else do nothing
                if(updated){
                    $scope.Gathering = result.Gathering;
                }
            } else {
                // Error handler: (data, status, headers, config)
                if (result.status === 503) {
                    // Stop poller or provide visual feedback to the user etc
                    poller.stopAll();
                }
            }
        };
        $scope.dataUserUpdatedCheck = function(result){
            var updated = false;
            // Check if same number of users
            if($scope.Gathering.users.length == result.Gathering.users.length){
                // Check if users are the same users, in the same order
                for(var i=0; i< $scope.Gathering.users.length; i++){
                    if($scope.Gathering.users[i]['username'] != result.Gathering.users[i]['username']){
                        updated = true;
                    }
                }
            }
            else{
                updated = true;
            }
            return updated;
        };
        $scope.init = function(){
            $scope.Gathering.init();
            $scope.initFilterValues();
            $scope.initSortValues();
            $scope.getGathering()
                .then(function(){
                    $scope.ready = true;
                })
                .then(function(){
                    $scope.dataPoller();
                })
            ;
        };
        // Startup front-end of application
        $scope.init();
    })
;