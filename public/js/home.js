"use strict"

$(document).ready(function() {

  // set up image backgrounds
  var rand = Math.floor((Math.random() * 19) + 1);
  if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    $('body').css('background-image', "url('/img/mobile/image" + rand + ".jpg')")
    $('.subscription span').css('bottom', '0vh')
    $('.messenger').css('bottom', '17vh')
    setTimeout(() => {
      $('.subscription span').css('bottom', '-16vh')
    }, 5000)
  } else if (/iPad/i.test(navigator.userAgent)) {
    $('body').css('background-image', "url('/img/tablet/image" + rand + ".jpg')")
    $('.subscription span').css('bottom', '0vh')
    $('.messenger').css('bottom', '20vh')
    setTimeout(() => {
      $('.subscription span').css('bottom', '-16vh')
    }, 5000)
  } else {
    $('body').css('background-image', "url('/img/desktop/image" + rand + ".jpg')")
    $('.subscription span').css('bottom', '0vh')
    $('.messenger').css('bottom', '14vh')
    setTimeout(() => {
      $('.subscription span').css('bottom', '-16vh')
    }, 5000)
  }

})
