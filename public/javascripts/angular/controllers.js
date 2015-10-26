'use strict';
/** Controllers */
angular.module('gameNight.controllers', []).
    controller('AppCtrl', function ($scope, $http, $resource, poller) {
        $scope.ready = false;
        $scope.adminPermissions = {
            logs: [
                'view',
                'reset'
            ],
            users: [
                'view',
                'edit',
                'delete'
            ],
            gatherings: [
                'edit',
                'delete'
            ]
        };
        $scope.Data = $scope.Data || {
            init: function(){
                $scope.Data.loading = false;
            }
        };
        $scope.getData = function(){
            $scope.Data.loading = true;
            return $http.get('/api/data/get').
                success(function( data ){
                    console.log('AppCtrl.getData function - front-end: data:');
                    console.log(data);
                    $scope.Data = data.Data;
                    $scope.initGatheringGameUrls();
                    $scope.Data.loading = false;
                    return $scope.Data;
                })
            ;
        };
        $scope.getUser = function(){
            $scope.Data.loading = true;
            return $http.get('/api/user/get').
                success(function( data ){
                    console.log('AppCtrl.getUser function - front-end: data:');
                    console.log(data);
                    $scope.user = data.user;
                    $scope.Data.loading = false;
                    return $scope.user;
                })
            ;
        };
        $scope.addUser = function(username){
            // TODO(maybe): change to promise to allow .then(), see getData()
            if(typeof username != "undefined" && username != ''){
                $scope.Data.loading = true;
                var parameters = { username: username };
                $http.post('/api/user/add', parameters).
                    success(function( data ) {
                        console.log('AppCtrl.addUser function - front-end: data:');
                        console.log(data);
                        $scope.Data = data.Data;
                        $scope.Data.loading = false;
                        $scope.addUserInputUsername = '';
                    })
                ;
            }
            else{
                // TODO: return validation message to user to enter a username
                console.log('AppCtrl.addUser function - else');
            }
        };
        $scope.addGathering = function(gName){
            console.log('AppCtrl.addGathering function called');
            // TODO(maybe): change to promise to allow .then(), see getData()
            // TODO: add check if new Gathering name is unique or already exists
            if(typeof gName != "undefined" && gName != ''){
                $scope.Data.loading = true;
                var parameters = {
                    gName: gName,
                    creator: $scope.user.username
                };
                console.log(parameters);
                $http.post('/api/gathering/add', parameters).
                    success(function( data ){
                        console.log('AppCtrl.addGathering function - front-end: data:');
                        console.log(data);
                        $scope.Data.gatherings = data.gatherings;
                        $scope.Data.loading = false;
                        $scope.addGatheringDisplayName = '';
                    })
                ;
            }
            else{
                // TODO: return validation message to user to enter a gathering display name
                console.log('AppCtrl.addGathering function - else');
            }
        };
        $scope.addGatheringUser = function(username){
            // FINISH
            // TODO(maybe): change to promise to allow .then(), see getData()
            if(typeof username != "undefined" && username != ''){
                $scope.Data.loading = true;
                var parameters = { username: username };
                $http.post('/api/gathering/:gName/user/add', parameters).
                    success(function( data ) {
                        console.log('AppCtrl.addUser function - front-end: data:');
                        console.log(data);
                        $scope.Data = data.Data;
                        $scope.initGatheringGameUrls();
                        $scope.Data.loading = false;
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
            // TODO(maybe): change to promise to allow then(), see getData()
            if(typeof username != "undefined" && username != ''){
                $scope.Data.loading = true;
                var parameters = { username: username };
                $http.post('/api/user/delete', parameters).
                    success(function( data ) {
                        console.log('AppCtrl.deleteUser function - front-end: data:');
                        console.log(data);
                        $scope.Data = data.Data;
                        $scope.initGatheringGameUrls();
                        $scope.Data.loading = false;
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
        $scope.initGatheringGameUrls = function(){
            for(var i = 0; i < $scope.Data.gatherings.length; i++){
                if(typeof $scope.Data.gatherings[i].games != "undefined"){
                    for(var j=0; j < $scope.Data.gatherings[i].games.length; j++){
                        // create full link to game as property for rendering in DOM
                        $scope.Data.gatherings[i].games[j]['url'] = 'http://boardgamegeek.com/';
                        $scope.Data.gatherings[i].games[j]['url'] += $scope.Data.gatherings[i].games[j]['type'];
                        $scope.Data.gatherings[i].games[j]['url'] += '/';
                        $scope.Data.gatherings[i].games[j]['url'] += $scope.Data.gatherings[i].games[j]['id'];
                    }
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
        $scope.dataPoller = function(resource, callback){
            // Define your resource object.
            var logResource = $resource(resource);
            // Get poller. This also starts/restarts poller.
            var logPoller = poller.get(logResource, {
                catchError: true
            });
            // Update view. Since a promise can only be resolved or rejected once but we want
            // to keep track of all requests, poller service uses the notifyCallback. By default
            // poller only gets notified of success responses.
            logPoller.promise.then(null, null, function(data){$scope.dataPollerCallback(data, callback)});
        };
        $scope.dataPollerCallback = function(result, callback){
            // If catchError is set to true, this notifyCallback can contain either
            // a success or an error response.
            if (result.$resolved) {
                // Success handler ...
                callback(result);
                /*var updated = $scope.dataUpdatedCheck(result);
                // If not identical set data to new data, else do nothing
                if(updated){
                    $scope.Data = result.Data;
                }
                $scope.Data = result.Data;*/
            } else {
                // Error handler: (data, status, headers, config)
                if (result.status === 503) {
                    // Stop poller or provide visual feedback to the user etc
                    poller.stopAll();
                }
            }
        };
        /*$scope.dataUserUpdatedCheck = function(result){
            // TODO: needs major overhaul to new data structure of $scope.Data...
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
        };*/
        $scope.dataLoadingUpdatedCheck = function(result){
            if($scope.Data.loading !== result.Data.loading){
                return true;
            }
            return false;
        };
        $scope.dataUpdatedCheck = function(result){
            // TODO: fix/update and re-implement this user updated check
            // TODO: needs gathering check
            //var usersUpdated = $scope.dataUserUpdatedCheck(result);
            var loadingUpdated = $scope.dataLoadingUpdatedCheck(result);
            if(/*usersUpdated || */loadingUpdated){
                return true;
            }
            return false;
        };
        $scope.resetLog = function(){
            $http.get('/api/log/reset').success(function( data ) {
                $scope.Data.logs = data || [];
            });
        };
        $scope.isAdmin = function(){
            // Checks if user has any administrative permissions
            for(var permissionType in $scope.adminPermissions){
                for(var i=0; i< $scope.adminPermissions[permissionType].length; i++){
                    if(typeof $scope.user != "undefined" && $scope.user.permissions[permissionType][$scope.adminPermissions[permissionType][i]]){
                        return true;
                    }
                }
            }
            return false;
        };
        $scope.hasPermissions = function(permissions){
            var output = {};
            for(var permissionType in $scope.adminPermissions){
                if(typeof permissions[permissionType] != "undefined"){
                    output[permissionType] = {};
                    for(var i=0; i< permissions[permissionType].length; i++){
                        if(typeof $scope.user != "undefined"){
                            console.log('$scope.user.permissions');
                            console.log($scope.user.permissions);
                        }
                        if(typeof $scope.user != "undefined" &&
                            $scope.user.permissions[permissionType][permissions[permissionType][i]]
                        ){
                            output[permissionType][permissions[permissionType][i]] = true;
                        }
                        else{
                            output[permissionType][permissions[permissionType][i]] = false;
                        }
                    }
                }
            }
            return output;
        };
        $scope.setupPollers = function(){
            $scope.gatheringsPoller();
            $scope.loadingPoller();
            var permissions = {
                logs: [
                    'view',
                    'reset'
                ]
            };
            var userLogPermissions = $scope.hasPermissions(permissions);
            console.log('userLogPermissions');
            console.log(userLogPermissions);
            if(userLogPermissions.logs.view || userLogPermissions.logs.reset){
                $scope.logsPoller();
            }
        };
        $scope.logsPoller = function(){
            return $scope.dataPoller('/api/log/load', function(result){
                $scope.Data.logs = result.log;
            });
        };
        $scope.gatheringsPoller = function(){
            return $scope.dataPoller('/api/gatherings/get', function(result){
                $scope.Data.gatherings = result.gatherings;
            });
        };
        $scope.loadingPoller = function(){
            return $scope.dataPoller('/api/loading/get', function(result){
                $scope.Data.loading = result.loading;
            });
        };
        $scope.init = function(){
            $scope.Data.init();
            $scope.initFilterValues();
            $scope.initSortValues();
            $scope.getData()
                .then(function(){
                    $scope.getUser()
                        .then(function(){
                            $scope.setupPollers();
                        })
                        .then(function(){
                            $scope.ready = true;
                        })
                    ;
                })
            ;
        };
        // Startup front-end of application
        $scope.init();
    })
;