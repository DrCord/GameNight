'use strict';
/** Controllers */
angular.module('gameNight.controllers', []).
    controller('AppCtrl', function ($scope, $http, $sce) {
        $scope.ready = false;
        $scope.loading = false;
        $scope.Gathering = $scope.Gathering || {
            init: function(){
                $scope.Gathering.users = $scope.Gathering.users || [];
                $scope.Gathering.games = $scope.Gathering.games || [];
            }
        };

        $scope.getGathering = function(){
            $scope.loading = true;
            return $http.get('/api/gathering').
                success(function( data ) {
                    console.log('AppCtrl.getGathering function - front-end: data:');
                    console.log(data);
                    $scope.Gathering = data.Gathering;
                    $scope.initGameUrls();
                    $scope.loading = false;
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
                $scope.loading = true;
                var parameters = { username: username };
                $http.post('/api/add-user', parameters).
                    success(function( data ) {
                        console.log('AppCtrl.addUser function - front-end: data:');
                        console.log(data);
                        $scope.Gathering = data.Gathering;
                        $scope.initGameUrls();
                        $scope.loading = false;
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
                $scope.loading = true;
                var parameters = { username: username };
                $http.post('/api/delete-user', parameters).
                    success(function( data ) {
                        console.log('AppCtrl.deleteUser function - front-end: data:');
                        console.log(data);
                        $scope.Gathering = data.Gathering;
                        $scope.initGameUrls();
                        $scope.loading = false;
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
        $scope.init = function(){
            $scope.Gathering.init();
            $scope.initFilterValues();
            $scope.initSortValues();
            $scope.getGathering()
                .then(function(){
                    $scope.ready = true;
                })
                .then(function(){
                    $scope.ready = true;
                })
            ;
        };
        // Startup front-end of application
        $scope.init();
    })
;