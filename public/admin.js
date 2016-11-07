"use strict"

$(document).ready(function(){

  $('.show-affirmations').click(function(){
    $('.images').addClass('hide');
    $('.affirmations').toggleClass('hide');
  });

  $('.show-past-affirmations').click(function(){
    $('.future-affirmations').addClass('hide');
    $('.past-affirmations').toggleClass('hide');
  });

  $('.show-future-affirmations').click(function(){
    $('.future-affirmations').toggleClass('hide');
    $('.past-affirmations').addClass('hide');
  });

  $('.show-images').click(function(){
    $('.images').toggleClass('hide');
    $('.affirmations').addClass('hide');
  });

  // END OF DOCUMENT.READY
});
