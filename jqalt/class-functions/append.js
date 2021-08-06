import {$} from '../selector.js'


$.addMethod('append', function(sel, ref){
  sel = $(sel);

  this.forEach(e => {
    if(ref){ref = $(ref, e)[0].nextElementSibling;}
    if(ref){
      //todo: fix strange issue with insertBefore and for loop
      console.log(sel);
      for(let i = sel.length-1; i >= 0; i--){
        e.insertBefore(sel[i], ref);
      }
    }else{
      for(let i = 0; i < sel.length; i++){
        e.appendChild(sel[i]);
      }
    }
  });

  return this;
});

$.addMethod('prepend', function(sel, ref){
  sel = $(sel);
  if(ref){ref = $(ref)[0];}

  this.forEach(e => {
    if(ref){
      for(let i = 0; i < sel.length; i++){
        e.insertBefore(sel[i], ref);
      }
    }else if(e.hasChildren()){
      let r = e.firstElementChild;
      for(let i = 0; i < sel.length; i++){
        e.insertBefore(sel[i], r);
      }
    }else{
      for(let i = 0; i < sel.length; i++){
        e.appendChild(sel[i]);
      }
    }
  });

  return this;
});

$.addMethod('appendTo', function(sel, ref){
  $(sel).append(this, ref);
  return this;
});

$.addMethod('prependTo', function(sel, ref){
  $(sel).prepend(this, ref);
  return this;
});


$.addMethod('after', function(sel){
  $(this).parent().append(sel, this);
});

$.addMethod('before', function(sel){
  $(this).parent().prepend(sel, this);
});

$.addMethod('putAfter', 'insertAfter', function(sel){
  $(sel).parent().append(this, sel);
});

$.addMethod('putBefore', 'insertBefore', function(sel){
  $(sel).parent().prepend(this, sel);
});
