'use strict';
/** Controllers */
angular.module('gameNight.controllers', []).
    controller('AppCtrl', function ($scope, $http) {
        $scope.ready = false;
        $scope.Gathering = $scope.Gathering || {};
        $scope.Gathering.users = $scope.Gathering.users || [];
        $scope.getGathering = function(){
            return $http.get('/api/gathering').
                success(function( data ) {
                    console.log('AppCtrl.getGathering function - front-end: data:');
                    console.log(data);
                    $scope.Gathering = data.Gathering;
                    return $scope.Gathering;
                })
            ;
        };
        $scope.getUsers = function(){
            return $http.get('/api/users').
                success(function( data ) {
                    console.log('AppCtrl.getUsers function - front-end: data:');
                    console.log(data);
                    $scope.Gathering.users = data.users;
                })
            ;
        };
        $scope.addUser = function(username){
            // TODO: change to promise to allow then(), see getUsers()
            if(typeof username != "undefined" && username != ''){
                var parameters = { username: username };
                $http.post('/api/add-user', parameters).
                    success(function( data ) {
                        console.log('AppCtrl.addUser function - front-end: data:');
                        console.log(data);
                        $scope.Gathering = data.Gathering;
                    })
                ;
            }
            else{
                // TODO: return validation message to user to enter a username
                console.log('AppCtrl.addUser function - else');
            }
        };
        $scope.deleteUser = function(username){
            // TODO: change to promise to allow then(), see getUsers()
            if(typeof username != "undefined" && username != ''){
                var parameters = { username: username };
                $http.post('/api/delete-user', parameters).
                    success(function( data ) {
                        console.log('AppCtrl.deleteUser function - front-end: data:');
                        console.log(data);
                        $scope.Gathering.users = data.users;
                    })
                ;
            }
            else{
                // TODO: return validation message to user to enter a username
                console.log('AppCtrl.deleteUser function - else');
            }
        };
        $scope.init = function(){
            console.log('AppCtrl init');
            $scope.getGathering()
                .then(function(){
                    $scope.ready = true;
                })
            ;
        };
        // Startup front-end of application
        $scope.init();
    })
;