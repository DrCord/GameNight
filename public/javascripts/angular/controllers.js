'use strict';
/** Controllers */
angular.module('gameNight.controllers', []).
    controller('AppCtrl', function ($scope) {
        $scope.test = 'test123';
        $scope.init = function(){
            console.log('AppCtrl init');
        };
        // Startup front-end of application
        $scope.init();
    })
;