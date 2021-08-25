import {$} from './selector.js'
import Element from './selector.js'
import Socket from './socket-io.js'

//todo: slowly replace $.addMethod with $.method
// making the add method function more advanced

$.method = function(name, sort, cb){
  if(typeof sort === 'function'){[sort, cb] = [cb, sort];}
  if(!Array.isArray(name)){
    name = [name];
  }

  let added = [];

  for(let i in name){
    if(!Element.prototype[name[i]]){
      added[i] = true;
      Element.prototype[name[i]] = function(){
        const args = [...arguments];
        if(sort){args = methodSort.call(args, true, sort);}

        const thisArg = methodThisArg.call(this, name[i], args);
        let res = cb.call(thisArg, ...args);
        if(!this.jQuery){
          res = fixValue(res);
        }
        return res;
      };
    }
  }

  if(added.length === 0){
    return false;
  }
  return added;
};


function fixValue(value){
  if(value instanceof Element || value instanceof Node || value instanceof NodeList || value instanceof Socket){
    return value;
  }

  if(Array.isArray(value)){
    return value.map(v => fixValue(v));
  }else if(typeof value === 'object'){
    let keys = Object.keys(value);
    for(let i in keys){
      value[keys[i]] = fixValue(value[keys[i]]);
    }
  }

  if(typeof value !== 'string'){
    return value;
  }

  if(value.match(/^[0-9]+(?:\.[0-9]+|)$/)){
    return Number(value);
  }else if(value === 'NaN'){
    return NaN;
  }else if(value === 'null'){
    return null;
  }else if(value === 'undefined'){
    return undefined;
  }else if(value === 'Infinity'){
    return Infinity;
  }else if(value === 'true'){
    return true;
  }else if(value === 'false'){
    return false;
  }

  try{
    return JSON.parse(value);
  }catch(e){}

  return value;
}


function methodThisArg(name, args){
  const thisArg = methodSelect.bind(this);

  thisArg.from = methodFrom.bind(this);
  thisArg.func = methodFunc.bind(args);
  thisArg.type = methodType.bind(args);
  thisArg.sort = methodSort.bind(args);
  thisArg.resolve = resolveThisElm;

  thisArg.method = name;
  thisArg.jquery = this.jQuery;

  return thisArg;
}


function methodSelect(sel, cb){
  if(typeof sel === 'function'){
    [sel, cb] = [cb, sel];
  }

  let res = this;
  if(typeof sel === 'number'){
    res = this[sel];
  }else if(typeof sel === 'string'){
    res = [];
    for(let i = 0; i < this.length; i++){
      if(isQuery(this[i], sel)){
        res.push(this[i]);
      }
    }
  }else if(Array.isArray(sel)){
    res = [];
    let off = 0;
    for(let i = 0; i < sel.length; i++){
      if(typeof sel[i] === 'number'){
        res.push(this[sel[i]]);
        off++;
      }else if(typeof sel[i] === 'string'){
        if(isQuery(this, sel[i])){
          res.push(this[i-off]);
        }
      }
    }
  }

  if(typeof cb === 'function'){
    if(Array.isArray(res)){
      let r = [];
      for(let i = 0; i < res.length; i++){
        r.push(cb(res[i]));
      }
      return r;
    }else{
      return cb(res);
    }
  }else if(typeof cb === 'number'){
    return res[cb];
  }else if(typeof cb === 'string'){
    if(cb === 'args' || cb === 'atts' || cb === 'attrs'){cb = 'attributes';}
    if(Array.isArray(res)){
      return res[0][cb];
    }else{
      return res[cb];
    }
  }else if(cb === true){
    return methodFrom(this, res);
  }

  return res;
}

function methodFrom(from, elm){
  if(!elm){
    elm = from;
    from = this;
  }

  from = resolveThisElm(from);

  let e;
  if(Array.isArray(elm)){
    e = new Element(...elm);
  }else{
    e = new Element(elm);
  }

  e.dataStorage = from.dataStorage;
  e.jQuery = from.jQuery;

  return e;
}

function methodFunc(cb, thisArg){
  const args = [...arguments];
  args.splice(0, 2);

  const newArgsFirst = (thisArg === true);
  if(newArgsFirst){
    thisArg = args.shift();
  }

  if(typeof cb !== 'function'){
    args.unshift(arguments[1]);
    thisArg = cb;
    for(let i = 0; i < this.length; i++){
      if(typeof this[i] === 'function'){
        cb = this[i];
        break;
      }
    }
    if(typeof cb !== 'function'){
      return function(){};
    }
  }

  thisArg = resolveThisElm(thisArg);

  if((thisArg instanceof Element || thisArg instanceof NodeList) && thisArg.jQuery){
    thisArg = thisArg[0];
  }else if(thisArg instanceof Element || thisArg instanceof Node || thisArg instanceof NodeList){
    if(thisArg instanceof Node){
      thisArg = new Element(thisArg);
    }else if(thisArg instanceof NodeList){
      thisArg = new Element(...thisArg);
    }
    thisArg.dataStorage = this.dataStorage;
    thisArg.jQuery = this.jQuery;
  }


  const hasThisArg = (thisArg !== null && thisArg !== undefined);

  if(newArgsFirst === true){
    if(hasThisArg){
      return function(){cb.call(thisArg, ...arguments, ...args, thisArg);};
    }else{
      return function(){
        let newArgs = [...arguments];
        let newThis = newArgs.shift();
        cb.call(newThis, ...newArgs, ...args, newThis);
      };
    }
  }

  if(hasThisArg){
    return function(){cb.call(thisArg, ...args, ...arguments, thisArg);}
  }else{
    return function(){
      let newArgs = [...arguments];
      let newThis = newArgs.shift();
      cb.call(newThis, ...args, ...newArgs, newThis);
    };
  }
}


function methodType(value, t){
  if(!value){
    value = this;
  }
  if(Array.isArray(value)){
    return value.map(v => type(v, t));
  }
  return type(value, t);
}

function type(value, type){
  const t = varType(value);
  if(Array.isArray(type)){
    for(let i = 0; i < type.length; i++){
      let ty = fixTypeStr(type[i]);
      if(t === ty || ty === 'any'){
        return true;
      }
    }
    return false;
  }else if(type){
    let ty = fixTypeStr(type);
    if(t === ty || ty === 'any'){
      return true;
    }
    return false;
  }
  return t;
}

function varType(value){
  if(Array.isArray(value)){
    return 'array';
  }else if(Number.isNaN(value)){
    return 'nan';
  }else if(value === null){
    return 'null';
  }else if(value instanceof RegExp){
    return 'regex';
  }else if(value instanceof Element){
    return 'element';
  }else if(value instanceof Node){
    return 'node';
  }else if(value instanceof NodeList){
    return 'nodelist';
  }else if(value instanceof Socket){
    return 'socket';
  }
  return typeof value;
}

function fixTypeStr(t){
  if(typeof t !== 'string'){return undefined;}
  t = t.toLowerCase();
  switch(t){
    case 'str':
      return 'string';
    case 'num':
      return 'number';
    case 'bool':
      return 'boolean';
    case 'obj':
      return 'object';
    case 'arr':
      return 'array';
    case 'void':
    case 'func':
      return 'function';
    case 'regex':
    case 'reg':
      return 'regexp';
    case 'elm':
    case 'elem':
      return 'element';
    case 'list':
      return 'nodelist';
    case 'html':
      return 'node';
    default:
      return t;          
  }
}


function methodSort(useThisArgs, priority){
  const args = [...arguments];
  if(useThisArgs === true){
    args.shift();
    if(priority === false){
      args.shift();
    }
    for(let i in this){
      if(Array.isArray(args[i])){
        args[i].unshift(this[i]);
        if(priority === false){
          args[i].push(false);
        }
      }else{
        args[i] = this[i];
      }
    }
  }else if(useThisArgs === false){
    args.shift();
    for(let i in this){
      if(Array.isArray(args[i])){
        args[i].push(false);
      }
    }
  }

  return sortArgs(...args);
}

function sortArgs(){
  let args = [...arguments];
  let res = [];
  let used = [];

  for(let i = 0; i < args.length; i++){
    // if basic arg
    if(!Array.isArray(args[i])){
      res[i] = args[i];
      used[i] = true;
      continue;
    }

    let types = [...args[i]];
    let arg = types.shift();

    // if not low priority && proper slot
    if(!used[i] && !types.includes(false) && type(arg, types)){
      res[i] = arg;
      continue;
    }

    loopJ: for(let j = 0; j < args.length; j++){
      if(!used[j] && Array.isArray(args[j])){
        let jTypes = [...args[j]];
        let jArg = jTypes.shift();

        if(type(arg, jTypes)){
          // if correct j type
          if(res[j] || jTypes.includes(false) || !type(jArg, jTypes)){
            // if j is set || low priority || incorrect
            res[j] = arg;
            used[j] = true;
            break;
          }else{
            // if j is correct
            for(let k = 0; k < args.length; k++){
              let kTypes = [...args[k]];
              let kArg = jTypes.shift();

              if(!used[k] && type(jArg, kTypes) && !type(kArg, kTypes)){
                // if k slot available
                res[j] = arg;
                used[j] = true;
                break loopJ;
              }
            }
          }
        }
      }
    }
  }

  return res;
}


function resolveThisElm(elm){
  if(typeof elm === 'function' && (elm.name === 'bound methodSelect' || elm.name === 'methodSelect')){
    return elm();
  }
  return elm;
}
