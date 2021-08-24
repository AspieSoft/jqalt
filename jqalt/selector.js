import { buildHtmlElmArray, callFunc, varType, selectQuery } from './functions.js'


export default class Element extends Array {
  dataStorage = {};

  data(key, value){
    const keyType = varType(key);

    if(keyType === 'function'){
      callFunc(key, this, this.dataStorage);
      return this;
    }else if(key === undefined){
      return this.dataStorage;
    }

    if(keyType === 'object'){
      let keys = Object.keys(key);
      for(let i in keys){
        this.dataStorage[keys[i]] = key[keys[i]];
      }
      return this;
    }
    if(keyType === 'array'){
      let res = {};
      if(value === $.del){
        for(let i in key){
          delete this.dataStorage[key[i]];
        }
      }
      for(let i in key){
        res[key[i]] = this.dataStorage[key[i]];
      }
      if(typeof value === 'function'){
        callFunc(value, this, res);
        return this;
      }
      return res;
    }
    if(value === $.del){
      delete this.dataStorage[key];
      return this;
    }else if(typeof value === 'function'){
      callFunc(value, this, this.dataStorage[key]);
      return this;
    }
    if(value === undefined){
      return this.dataStorage[key];
    }
    this.dataStorage[key] = value;
    return this;
  }

  hasData(key, value){
    const keyType = varType(key);
    let cb;
    if(typeof value === 'function'){
      cb = value;
      value = undefined;
    }
    if(keyType === 'object'){
      let res = [];
      let keys = Object.keys(key);
      for(let i in keys){
        if(key[keys[i]] === this.dataStorage[keys[i]]){
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
        if((value === undefined && this.dataStorage[key[i]] !== undefined) || this.dataStorage[key[i]] === value){
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
    if(cb && this.dataStorage[key] !== undefined){
      callFunc(cb, this, key);
      return this;
    }else if(cb){
      return this;
    }
    if(value === undefined){
      return this.dataStorage[key] !== undefined;
    }
    return this.dataStorage[key] === value;
  }

  removeData(key){
    if(Array.isArray(key)){
      for(let i in key){
        delete this.dataStorage[key[i]];
      }
      return this;
    }
    delete this.dataStorage[key];
    return this;
  }


  query(param, elm = document){
    $(param, elm).forEach(e => {
      this.push(e);
    });
    return this;
  }

}


const commonTagList = [
  'head',
  'body',
  'header',
  'main',
  'footer'
];

function $(param, elm = document){
  if(param instanceof Element){return param;}

  if(typeof param === 'string'){
    if(param === ':root' && (elm === document || elm === window)){
      return $.root();
    }else if((elm === document || elm === window) && commonTagList.includes(param) && $[param]){
      return $[param]();
    }else if(param.startsWith(':') && commonTagList.includes(param.replace(/:/, ''))){
      param = param.replace(/:/, '');
    }
  }

  if(param === 'head' && (elm === document || elm === window)){
    return new Element(document.head || document.getElementsByTagName('head')[0]);
  }else if(param === 'body' && (elm === document || elm === window)){
    return new Element(document.body || document.getElementsByTagName('body')[0]);
  }

  if(typeof param === 'string' && param.match(/<[\w_\-$]+(?:\s+.*?|)>/)){
    param = buildHtmlElmArray(param);

    return new Element(...param);
  }

  if(typeof param === 'string'){
    return new Element(...selectQuery(param, elm));
  }else if(Array.isArray(param)){
    let arr = [];
    param.forEach(p => {
      if(typeof p === 'string'){
        arr.push(...selectQuery(p, elm));
      }else if(p instanceof Element){
        arr = arr.concat(p);
      }else if(p != null){
        arr.push(p);
      }
    });
    return new Element(...arr);
  }else if(param != null){
    return new Element(param);
  }

  return new Element(document);
}

$.del = new Date().getTime();

$.addMethod = function(name, alias, cb){
  if(typeof alias === 'function'){
    [alias, cb] = [cb, alias];
  }
  if(!Element.prototype[name]){
    Element.prototype[name] = cb;
    if(alias && !Element.prototype[alias]){
      Element.prototype[alias] = function(){return this[name](...arguments);};
    }
    return true;
  }
  return false;
};


// add common tags
let commonTags = {};
function addCommonTag(tag){
  return function(){
    if(commonTags[tag]){
      return commonTags[tag];
    }
    let elm = new Element(document[tag] || document.getElementsByTagName(tag)[0]);
    if(elm){commonTags[tag] = elm;}
    return elm;
  }
}

for(const tag of commonTagList){
  $[tag] = addCommonTag(tag);
}

$.root = function(){
  if(commonTags[':root']){
    return commonTags[':root'];
  }
  let elm = new Element(document.querySelectorAll(':root')[0]);
  if(elm){commonTags[':root'] = elm;}
  return elm;
};


export {$};
