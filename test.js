;$.ready(function(){

  // $('body').css('font-size', 1.2 + 'rem');
  $.body[0].style['font-size'] = '1.2rem';

  const elm = $('<span class="test" style="color: red;">This is a </span><a href="test">test</a>');

  const h1 = $('h1, h2, h3');

  // $('.main-content').append(elm, h1);

  const input = $('input[name="test"]');
  input[0].style['font-size'] = '1.2rem';

});
