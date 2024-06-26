;$.ready(function(){

  $('body').css({'font-size': '1.2rem', '--size': '1em'});
  $('input').css('font-size', 'var(--size)');

  $('body').css('font-size', function(){
    console.log('font size changed')
  });

  const elm = $('<span class="test" style="color: red;">This is a </span><a href="test">test</a>');

  const h1 = $('h1, h2, h3');

  // $('.main-content').append(elm, h1);

});
