'use strict';
/* Filters */
angular.module('gameNight.filters', [])
    .filter('html', function($sce) {
        return function(val) {
            // Account for weird behavior of html processor due to doubly encoded html
            val = val.replace(/&amp;/g, '&');
            val = val.replace(/&#35;/g, '#');
            val = val.replace(/&#40;/g, '(');
            val = val.replace(/&#40;/g, ')');
            return $sce.trustAsHtml(val);
        };
    })
;