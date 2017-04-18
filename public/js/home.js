"use strict"

$(document).ready(function() {

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        console.log('mobile');
    } else if (/iPad/i.test(navigator.userAgent)) {
        console.log('tablet');
    } else {
        console.log('desktop');
    }

});
