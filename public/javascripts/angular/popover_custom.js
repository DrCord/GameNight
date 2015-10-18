'use strict';

/** Prevents more than 1 popover from being open at once
 * by closing all popovers before opening another one. */
angular.element(document.body).bind('mousedown', function (e) {
    //Find all elements with the popover attribute
    var popups = document.querySelectorAll('*[uib-popover-template-popup]');
    if(popups) {
        //Go through all of them
        for(var i=0; i<popups.length; i++) {
            //The following is the popover DOM elemet
            var popup = popups[i];
            //The following is the same jQuery lite element
            var popupElement = angular.element(popup);
            //Remove the popover content
            popupElement.remove();
            //Set the scope to reflect this
            popupElement.tt_isOpen = false;
        }
    }
});