"use strict"

$(document).ready(function() {

  var rand = Math.floor((Math.random() * 9) + 1);

    if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      $('body').css('background-image', "url('/img/mobile/image" + rand + ".jpg')")
    } else if (/iPad/i.test(navigator.userAgent)) {
      $('body').css('background-image', "url('/img/tablet/image" + rand + ".jpg')")
    } else {
      $('body').css('background-image', "url('/img/desktop/image" + rand + ".jpg')")
    }

});
