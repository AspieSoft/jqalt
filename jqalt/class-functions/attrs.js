import { elementUrlTagTypes, callFunc, varType, fromElm } from '../functions.js'
import {$} from '../selector.js'


$.addMethod('attr', function(key, value){
  const keyType = varType(key);

  if(keyType === 'function'){
    callFunc(key, this, this[0].attributes);
    return this;
  }else if(key === undefined){
    return this[0].attributes;
  }

  if(keyType === 'object'){
    let keys = Object.keys(key);
    for(let i in keys){
      this.forEach(elm => {
        elm.setAttribute(keys[i], key[keys[i]]);
      });
    }
    return this;
  }
  if(keyType === 'array'){
    let res = {};
    if(value === $.del){
      for(let i in key){
        this.forEach(elm => {
          elm.removeAttribute(key[i]);
        });
      }
    }
    for(let i in key){
      res[key[i]] = this[0].getAttribute(key[i]);
    }
    if(typeof value === 'function'){
      callFunc(value, this, res);
      return this;
    }
    return res;
  }
  if(value === $.del){
    this.forEach(elm => {
      elm.removeAttribute(key);
    });
    return this;
  }else if(typeof value === 'function'){
    callFunc(value, this, this[0].getAttribute(key));
    return this;
  }
  if(value === undefined){
    return this[0].getAttribute(key);
  }
  this.forEach(elm => {
    elm.setAttribute(key, value);
  });
  return this;
});

$.addMethod('hasAttr', function(key, value){
  const keyType = varType(key);
  let cb;
  if(typeof value === 'function'){
    cb = value;
    value = undefined;
  }

  if(!this.length){
    if(cb){
      return this;
    }
    return undefined;
  }

  if(keyType === 'object'){
    let res = [];
    let keys = Object.keys(key);
    for(let i in keys){
      if(key[keys[i]] === this[0].getAttribute(keys[i])){
        res.push(keys[i]);
        if(!cb){
          break;
        }
      }
    }
    if(value === false){
      res = !res;
    }else if(cb && res.length){
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
  if(keyType === 'array'){
    let res = [];
    for(let i in key){
      if((value === undefined && this[0].hasAttribute(key[i])) || this[0].getAttribute(key[i]) === value){
        res.push(key[i]);
        if(!cb){
          break;
        }
      }
    }
    if(cb && res){
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
  if(cb && this[0].hasAttribute(key)){
    callFunc(cb, this, key);
    return this;
  }else if(cb){
    return this;
  }
  if(value === undefined){
    return this[0].hasAttribute(key);
  }
  return this[0].getAttribute(key) === value;
});

$.addMethod('removeAttr', function(key){
  if(Array.isArray(key)){
    for(let i in key){
      this.forEach(elm => {
        elm.removeAttribute(key[i]);
      });
    }
    return this;
  }
  this.forEach(elm => {
    elm.removeAttribute(key);
  });
  return this;
});


$.addMethod('tag', function(value){
  if(typeof value === 'string'){
    this.forEach((elm, i) => {
      const clone = document.createElement(value);
      for(let i = 0; i < elm.attributes.length; i++){
        let {name, value} = elm.attributes[i];
        if(name === 'class'){
          let classes = value.split(' ');
          for(let j in classes){
            clone.classList.add(classes[j]);
          }
        }else{
          clone[name] = value;
        }
      }

      elm.parentNode.insertBefore(clone, elm);

      let child = [...elm.childNodes];
      for(let i = 0; i < child.length; i++){
        clone.appendChild(child[i]);
      }

      elm.remove();

      this[i] = clone;
    });
    return this;
  }
  if(typeof value === 'function'){
    this.forEach(elm => {
      callFunc(value, fromElm(this, elm), elm.tagName);
    });
    return this;
  }
  return this[0].tagName;
});


$.addMethod('value', 'val', function(value){
  if(value === ''){
    this.removeAttr('value');
    return this;
  }
  return this.attr('value', value);
});

$.addMethod('id', function(value){
  if(value === ''){
    this.removeAttr('id');
    return this;
  }
  return this.attr('id', value);
});

$.addMethod('name', function(value){
  if(value === ''){
    this.removeAttr('name');
    return this;
  }
  return this.attr('name', value);
});

$.addMethod('type', function(value){
  if(value === ''){
    this.removeAttr('type');
    return this;
  }
  return this.attr('type', value);
});


$.addMethod('url', function(value){
  let res = [];
  this.forEach(elm => {
    const tag = elm.tagName.toLowerCase();
    if(elementUrlTagTypes.src.includes(tag)){
      if(value === ''){
        res.push($(elm).removeAttr('src'));
      }else{
        res.push($(elm).attr('src', value));
      }
    }else if(elementUrlTagTypes.href.includes(tag)){
      if(value === ''){
        res.push($(elm).removeAttr('href'));
      }else{
        res.push($(elm).attr('href', value));
      }
    }else{
      let attr = elementUrlTagTypes.other[tag];
      if(!attr){attr = 'src';}
      if(value === ''){
        res.push($(elm).removeAttr(attr));
      }else{
        res.push($(elm).attr(attr, value));
      }
    }
  });
  if(value !== undefined){
    return this;
  }
  return res[0];
});

$.addMethod('src', function(value){
  if(value === ''){
    this.removeAttr('src');
    return this;
  }
  return this.attr('src', value);
});

$.addMethod('href', function(value){
  if(value === ''){
    this.removeAttr('href');
    return this;
  }
  return this.attr('href', value);
});
