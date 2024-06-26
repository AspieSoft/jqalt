import { elementUrlTagTypes, callFunc, varType, fromElm } from '../functions.js'
import {$} from '../selector.js'


/*$.addMethod('attr', 'prop', function(key, value){
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
      if(keys[i] === 'tag'){keys[i] = 'tagName';}
      this.forEach(elm => {
        elm.setAttribute(keys[i], key[keys[i]]);
        if(elm[keys[i]] !== undefined){elm[keys[i]] = key[keys[i]];}
      });
    }
    return this;
  }
  if(keyType === 'array'){
    let res = {};
    if(value === $.del){
      for(let i in key){
        if(key[i] === 'tag'){key[i] = 'tagName';}
        this.forEach(elm => {
          elm.removeAttribute(key[i]);
          if(elm[key[i]] !== undefined){elm[key[i]] = undefined;}
        });
      }
    }
    for(let i in key){
      if(key[i] === 'tag'){key[i] = 'tagName';}
      res[key[i]] = (this[0].getAttribute(key[i]) || this[0][key[i]]);
    }
    if(typeof value === 'function'){
      callFunc(value, this, res);
      return this;
    }
    return res;
  }
  if(key === 'tag'){key = 'tagName';}
  if(value === $.del){
    this.forEach(elm => {
      elm.removeAttribute(key);
      if(elm[key] !== undefined){elm[key] = undefined;}
    });
    return this;
  }else if(typeof value === 'function'){
    callFunc(value, this, (this[0].getAttribute(key) || this[0][key]));
    return this;
  }
  if(value === undefined){
    return this[0].getAttribute(key) || this[0][key];
  }
  if(key === 'tagName'){
    this.tag(value);
    return this;
  }
  this.forEach(elm => {
    elm.setAttribute(key, value);
  });
  return this;
});*/

$.method(['attr', 'prop'], function(key, value){
  const keyType = varType(key);

  if(keyType === 'function'){
    this.func(key, this, this(0, 'args'))();
    return this();
  }else if(key === undefined){
    return this(0, 'args');
  }

  if(keyType === 'object'){
    let keys = Object.keys(key);
    for(let i in keys){
      if(keys[i] === 'tag'){keys[i] = 'tagName';}
      this(elm => {
        elm.setAttribute(keys[i], key[keys[i]]);
        if(elm[keys[i]] !== undefined){elm[keys[i]] = key[keys[i]];}
      });
    }
    return this();
  }
  if(keyType === 'array'){
    let res = {};
    if(value === $.del){
      for(let i in key){
        if(key[i] === 'tag'){key[i] = 'tagName';}
        
        this(elm => {
          elm.removeAttribute(key[i]);
          if(elm[key[i]] !== undefined){elm[key[i]] = undefined;}
        });
      }
    }
    for(let i in key){
      if(key[i] === 'tag'){key[i] = 'tagName';}
      if(this.jquery && this.method === 'prop'){
        res[key[i]] = this(0, key[i]);
      }else if(this.jquery){
        res[key[i]] = this(0).getAttribute(key[i]);
      }else{
        res[key[i]] = (this(0).getAttribute(key[i]) || this(0, key[i]));
      }
    }
    if(typeof value === 'function'){
      this.func(value, this, res)();
      return this();
    }
    return res;
  }
  if(key === 'tag'){key = 'tagName';}
  if(value === $.del){
    this(elm => {
      elm.removeAttribute(key);
      if(elm[key] !== undefined){elm[key] = undefined;}
    });
    return this();
  }else if(typeof value === 'function'){
    if(this.jquery && this.method === 'prop'){
      this.call(value, this, this(0, key));
    }else if(this.jquery){
      this.call(value, this, this(0).getAttribute(key));
    }else{
      this.call(value, this, (this(0).getAttribute(key) || this(0, key)));
    }
    return this;
  }
  if(value === undefined){
    if(this.jquery && this.method === 'prop'){
      return this(0, key);
    }else if(this.jquery){
      return this(0).getAttribute(key);
    }else{
      return (this(0).getAttribute(key) || this(0, key));
    }
  }
  if(key === 'tagName' && !this.jquery){
    this().tag(value);
    return this();
  }

  this(elm => {
    if(elm[key]){
      elm[key] = value;
    }else if(!this.jquery || this.method !== 'prop'){
      elm.setAttribute(key, value);
    }
  });
  return this();
});

$.addMethod('hasAttr', 'hasProp', function(key, value){
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
      if(keys[i] === 'tag'){keys[i] = 'tagName';}
      if(key[keys[i]] === this[0].getAttribute(keys[i]) || key[keys[i]] === this[0][keys[i]]){
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
      if(key[i] === 'tag'){key[i] = 'tagName';}
      if((value === undefined && (this[0].hasAttribute(key[i]) || this[0][key[i]])) || this[0].getAttribute(key[i]) === value || this[0][key[i]] === value){
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
  if(key === 'tag'){key = 'tagName';}
  if(cb && (this[0].hasAttribute(key) || this[0][key] !== undefined)){
    callFunc(cb, this, key);
    return this;
  }else if(cb){
    return this;
  }
  if(value === undefined){
    return this[0].hasAttribute(key) || this[0][key] !== undefined;
  }
  return this[0].getAttribute(key) === value || this[0][key] === value;
});

$.addMethod('removeAttr', 'removeProp', function(key){
  if(Array.isArray(key)){
    for(let i in key){
      if(key[i] === 'tag'){key[i] = 'tagName';}
      this.forEach(elm => {
        elm.removeAttribute(key[i]);
        if(elm[key[i]] !== undefined){elm[key[i]] = undefined;}
      });
    }
    return this;
  }
  if(key === 'tag'){key = 'tagName';}
  this.forEach(elm => {
    elm.removeAttribute(key);
    if(elm[key] !== undefined){elm[key] = undefined;}
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
