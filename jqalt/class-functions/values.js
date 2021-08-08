import { elementUrlTagTypes, callFunc, varType, fromElm } from '../functions.js'
import {$} from '../selector.js'


$.addMethod('get', function(i, sel){
  if(typeof i !== 'number'){[i, sel] = [sel, i];}
  if(typeof i === 'function'){
    if(!sel){
      callFunc(i, fromElm(this, [...this]));
      return this;
    }
    let elms = [];
    this.forEach(e => {
      if($.isQuery(e, sel)){
        elms.push(e);
      }
    });
    callFunc(i, fromElm(this, elms));
    return this;
  }

  if(typeof sel === 'function'){
    if(i < 0){
      callFunc(this, fromElm(this, (this[this.length + i])));
      return this;
    }
    callFunc(this, fromElm(this, (this[this.length + i])));
    return this;
  }
  
  if(sel){
    let elms = [];
    this.forEach(e => {
      if($.isQuery(e, sel)){
        elms.push(e);
      }
    });
    if(i === undefined){
      return fromElm(this, elms);
    }else if(i < 0){
      return fromElm(this, (elms[elms.length + i]));
    }
    return fromElm(this, (elms[i]));
  }

  if(i === undefined){
    return fromElm(this, [...this]);
  }else if(i < 0){
    return fromElm(this, (this[this.length + i]));
  }
  return fromElm(this, (this[i]));
});


$.addMethod('width', 'clientWidth', function(sel, cb){
  if(typeof sel === 'function'){
    [sel, cb] = [cb, sel];
  }

  if(sel){
    for(let i = 0; i < this.length; i++){
      if($.isQuery(this[i], sel)){
        if(this[i] === window || this[i] === document){
          if(typeof cb === 'function'){
            callFunc(cb, fromElm(this, this[i]), window.innerWidth);
          }else{
            return window.innerWidth;
          }
        }
        if(typeof cb === 'function'){
          callFunc(cb, fromElm(this, this[i]), this[i].clientWidth || this[i].offsetWidth);
        }else{
          return this[i].clientWidth || this[i].offsetWidth;
        }
      }
    }
    return this;
  }

  if(typeof cb === 'function'){
    for(let i = 0; i < this.length; i++){
      if(this[i] === window || this[i] === document){
        if(typeof cb === 'function'){
          callFunc(cb, fromElm(this, this[i]), window.innerWidth);
        }else{
          return window.innerWidth;
        }
      }
      if(typeof cb === 'function'){
        callFunc(cb, fromElm(this, this[i]), this[i].clientWidth || this[i].offsetWidth);
      }else{
        return this[i].clientWidth || this[i].offsetWidth;
      }
    }
  }

  if(this[0] === window || this[0] === document){
    return window.innerWidth;
  }
  return this[0].clientWidth || this[0].offsetWidth;
});

$.addMethod('height', 'clientHeight', function(sel, cb){
  if(typeof sel === 'function'){
    [sel, cb] = [cb, sel];
  }

  if(sel){
    for(let i = 0; i < this.length; i++){
      if($.isQuery(this[i], sel)){
        if(this[i] === window || this[i] === document){
          if(typeof cb === 'function'){
            callFunc(cb, fromElm(this, this[i]), window.innerHeight);
          }else{
            return window.innerHeight;
          }
        }
        if(typeof cb === 'function'){
          callFunc(cb, fromElm(this, this[i]), this[i].clientHeight || this[i].offsetHeight);
        }else{
          return this[i].clientHeight || this[i].offsetHeight;
        }
      }
    }
    return this;
  }

  if(typeof cb === 'function'){
    for(let i = 0; i < this.length; i++){
      if(this[i] === window || this[i] === document){
        if(typeof cb === 'function'){
          callFunc(cb, fromElm(this, this[i]), window.innerHeight);
        }else{
          return window.innerHeight;
        }
      }
      if(typeof cb === 'function'){
        callFunc(cb, fromElm(this, this[i]), this[i].clientHeight || this[i].offsetHeight);
      }else{
        return this[i].clientHeight || this[i].offsetHeight;
      }
    }
  }

  if(this[0] === window || this[0] === document){
    return window.innerHeight;
  }
  return this[0].clientHeight || this[0].offsetHeight;
});

$.addMethod('offsetWidth', function(sel, cb){
  if(typeof sel === 'function'){
    [sel, cb] = [cb, sel];
  }

  if(sel){
    for(let i = 0; i < this.length; i++){
      if($.isQuery(this[i], sel)){
        if(this[i] === window || this[i] === document){
          if(typeof cb === 'function'){
            callFunc(cb, fromElm(this, this[i]), window.innerWidth);
          }else{
            return window.innerWidth;
          }
        }
        if(typeof cb === 'function'){
          callFunc(cb, fromElm(this, this[i]), this[i].offsetWidth || this[i].clientWidth);
        }else{
          return this[i].offsetWidth || this[i].clientWidth;
        }
      }
    }
    return this;
  }

  if(typeof cb === 'function'){
    for(let i = 0; i < this.length; i++){
      if(this[i] === window || this[i] === document){
        if(typeof cb === 'function'){
          callFunc(cb, fromElm(this, this[i]), window.innerWidth);
        }else{
          return window.innerWidth;
        }
      }
      if(typeof cb === 'function'){
        callFunc(cb, fromElm(this, this[i]), this[i].offsetWidth || this[i].clientWidth);
      }else{
        return this[i].offsetWidth || this[i].clientWidth;
      }
    }
  }

  if(this[0] === window || this[0] === document){
    return window.innerWidth;
  }
  return this[0].offsetWidth || this[0].clientWidth;
});

$.addMethod('offsetHeight', function(sel, cb){
  if(typeof sel === 'function'){
    [sel, cb] = [cb, sel];
  }

  if(sel){
    for(let i = 0; i < this.length; i++){
      if($.isQuery(this[i], sel)){
        if(this[i] === window || this[i] === document){
          if(typeof cb === 'function'){
            callFunc(cb, fromElm(this, this[i]), window.innerHeight);
          }else{
            return window.innerHeight;
          }
        }
        if(typeof cb === 'function'){
          callFunc(cb, fromElm(this, this[i]), this[i].offsetHeight || this[i].clientHeight);
        }else{
          return this[i].offsetHeight || this[i].clientHeight;
        }
      }
    }
    return this;
  }

  if(typeof cb === 'function'){
    for(let i = 0; i < this.length; i++){
      if(this[i] === window || this[i] === document){
        if(typeof cb === 'function'){
          callFunc(cb, fromElm(this, this[i]), window.innerHeight);
        }else{
          return window.innerHeight;
        }
      }
      if(typeof cb === 'function'){
        callFunc(cb, fromElm(this, this[i]), this[i].offsetHeight || this[i].clientHeight);
      }else{
        return this[i].offsetHeight || this[i].clientHeight;
      }
    }
  }

  if(this[0] === window || this[0] === document){
    return window.innerHeight;
  }
  return this[0].offsetHeight || this[0].clientHeight;
});


$.addMethod('show', function(){
  return this.css('display', '');
});

$.addMethod('hide', function(){
  return this.css('display', 'none');
});


//todo: test above functions


//todo: add scroll and scrollTo functions

//todo: add animation function (may add somewhere else)
