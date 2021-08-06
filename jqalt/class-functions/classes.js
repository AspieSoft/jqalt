import { callFunc, varType, fromElm } from '../functions.js'
import {$} from '../selector.js'


$.addMethod('addClass', function(className){
  if(className.includes(' ')){className = className.split(' ').filter(c => c.trim() !== '');}
  if(Array.isArray(className)){
    for(let i in className){
      this.forEach(elm => {
        elm.classList.add(className[i]);
      });
    }
    return this;
  }
  if(arguments.length > 1){
    for(let i in arguments){
      this.forEach(elm => {
        elm.classList.add(arguments[i]);
      });
    }
    return this;
  }
  this.forEach(elm => {
    elm.classList.add(className);
  });
  return this;
});

$.addMethod('hasClass', function(className, cb){
  if(className.includes(' ')){className = className.split(' ').filter(c => c.trim() !== '');}
  if(Array.isArray(className)){
    let res = [];
    for(let i in className){
      if(this[0].classList.contains(className[i])){
        res.push(className[i]);
      }
    }
    if(typeof cb === 'function' && res.length !== 0){
      callFunc(cb, this, res);
      return this;
    }else if(cb){
      return this;
    }
    if(!res.length){
      return false;
    }
    return res;
  }
  if(arguments.length > 1){
    let res = [];
    for(let i in arguments){
      if(this[0].classList.contains(arguments[i])){
        res.push(arguments[i]);
      }
    }
    if(typeof cb === 'function' && res.length !== 0){
      callFunc(cb, this, res);
      return this;
    }else if(cb){
      return this;
    }
    if(!res.length){
      return false;
    }
    return res;
  }
  return this[0].classList.contains(className);
});

$.addMethod('removeClass', function(className){
  if(className.includes(' ')){className = className.split(' ').filter(c => c.trim() !== '');}
  if(Array.isArray(className)){
    for(let i in className){
      this.forEach(elm => {
        elm.classList.remove(className[i]);
      });
    }
    return this;
  }
  if(arguments.length > 1){
    for(let i in arguments){
      this.forEach(elm => {
        elm.classList.remove(arguments[i]);
      });
    }
    return this;
  }
  this.forEach(elm => {
    elm.classList.remove(className);
  });
  return this;
});


$.addMethod('css', function(key, value){
  const keyType = varType(key);

  if(keyType === 'function'){
    callFunc(key, this, this[0].style);
    return this;
  }else if(key === undefined){
    return this[0].style;
  }

  if(keyType === 'object'){
    let keys = Object.keys(key);
    for(let i in keys){
      this.forEach(elm => {
        elm.style[keys[i]] = key[keys[i]];
      });
    }
    return this;
  }
  if(keyType === 'array'){
    let res = {};
    if(value === '' || value === $.del){
      for(let i in key){
        this.forEach(elm => {
          elm.style[key[i]] = '';
        });
      }
    }
    for(let i in key){
      res[key[i]] = this[0].style[key[i]];
    }
    if(typeof value === 'function'){
      callFunc(value, this, res);
      return this;
    }
    return res;
  }
  if(value === '' || value === $.del){
    this.forEach(elm => {
      elm.style[key] = '';
    });
    return this;
  }else if(typeof value === 'function'){
    callFunc(value, this, this[0].style[key]);
    return this;
  }
  if(value === undefined){
    return this[0].style[key];
  }
  this.forEach(elm => {
    elm.style[key] = value;
  });
  return this;
});

$.addMethod('html', function(value){
  if(typeof value === 'string'){
    this.forEach(elm => elm.innerHTML = value);
  }else if(typeof value === 'function'){
    this.forEach(elm => {
      let newValue = callFunc(value, fromElm(this, elm), elm.innerHTML);
      if(newValue !== undefined){
        elm.innerHTML = newValue;
      }
    });
  }else{
    return this[0].innerHTML;
  }
  return this;
});

$.addMethod('text', function(value){
  if(typeof value === 'string'){
    this.forEach(elm => elm.textContent = value);
  }else if(typeof value === 'function'){
    this.forEach(elm => {
      let newValue = callFunc(value, fromElm(this, elm), elm.textContent);
      if(newValue !== undefined){
        elm.textContent = newValue;
      }
    });
  }else{
    return this[0].textContent;
  }
  return this;
});
