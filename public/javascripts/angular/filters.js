'use strict';
/* Filters */
angular.module('gameNight.filters', [])
    .filter('playingTimeBetween', function () { // Adapted from: http://stackoverflow.com/a/32161799/1291935
        return function(items, maximum, lowest) {
            if(typeof items != "undefined"){
                items = items.filter(function(item){
                    // If item.playingtime.value is between(inclusive) the two boundaries return true
                    if(typeof item.playingtime != "undefined" &&
                       typeof item.playingtime.value != "undefined" &&
                       typeof item.playingtime != "undefined" &&
                       typeof item.playingtime.value != "undefined"
                    ){
                        return item.playingtime.value >= lowest && item.playingtime.value <= maximum;
                    }
                    else{
                        return false;
                    }
                });
                return items;
            }
            // If items was undefined then return an empty array to account for filter startup on page load
            return [];
        };
    })
    .filter('playersBetween', function () { // Adapted from: http://stackoverflow.com/a/32161799/1291935
        return function(items, maximum, lowest) {
            if(typeof items != "undefined"){
                items = items.filter(function(item){
                    // If item.playingtime.value is between(inclusive) the two boundaries return true
                    return item.minplayers.value >= lowest && item.maxplayers.value <= maximum;
                });
                return items;
            }
            // If items was undefined then return an empty array to account for filter startup on page load
            return [];
        };
    })
;