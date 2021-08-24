import Element from './selector.js';

const elementUrlTagTypes = {
  src: [
    'iframe',
    'img',
    'script',
    'frame',
    'embed',
    'source',
    'input',
    'audio',
    'track',
    'video',
  ],
  href: [
    'link',
    'a',
    'area',
    'base',
    'image',
  ],
  other: {
    'applet': 'codebase',
    'blockquote': 'cite',
    'body': 'background',
    'del': 'cite',
    'form': 'action',
    'head': 'profile',
    'ins': 'cite',
    'object': 'data',
    'q': 'cite',
    'button': 'formaction',
    'command': 'icon',
    'html': 'manifest',
  }
};


function buildHtmlElmArray(param){
  let tags = [];
  let level = [];
  param = param.replace(/%!|!%/g, function(s){
    if(s === '%!'){
      return '%!-!%';
    }return '%!!%';
  }).replace(/<(\/|)([\w_\-$\.]+)((?:\s+[\w_\-$\.]+\s*=\s*(["'])(?:\\[\\"']|.)*?\3)*)(\/|)>/g, function(_, start, tag, attrs, q, end){
    if(attrs && attrs !== ''){
      attrs = attrs.split(/(\s+[\w_\-$\.]+\s*=\s*(?:"(?:\\[\\"']|.)*?"|'(?:\\[\\"']|.)*?'))/g);
      let attrList = {};
      for(let i = 0; i < attrs.length; i++){
        if(attrs[i].trim() !== ''){
          let attr = attrs[i].split(/=(.*)/);
          attrList[attr[0]] = attr[1].replace(/^["'](.*)["']$/, '$1');
        }
      }
      attrs = attrList;
    }else{attrs = {};}
    if(end !== ''){
      return `%!t:${tags.push({tag, attrs})-1}!%`;
    }else if(start !== ''){
      let lev = [...level];
      let oldTag = lev.pop();
      while(oldTag !== tag && lev.length > 0){
        oldTag = lev.pop();
      }
      if(oldTag !== tag){
        return '';
      }
      level = [...lev];
      return `%!x:${tags.push({tag, attrs})-1}:${level.length}!%`;
    }else{
      return `%!x:${tags.push({tag, attrs})-1}:${level.push(tag)-1}!%`;
    }
  });

  function getTag(param){
    const list = [];
    param = param.replace(/%!x:([0-9]+):([0-9]+)!%(.*?)%!x:[0-9]+:\2!%/gs, function(_, i1, l1, c){
      let {tag, attrs} = tags[i1];
      let aKey = Object.keys(attrs);
      for(let i = 0; i < aKey.length; i++){
        let k = aKey[i].replace(/%!(-|)!%/g, function(_, n){
          if(n === '-'){
            return '%!';
          }return '!%';
        });
        let v = attrs[aKey[i]].replace(/%!(-|)!%/g, function(_, n){
          if(n === '-'){
            return '%!';
          }return '!%';
        });
        attrs[k] = v;
      }
      let cont = getTag(c);
      return `%!${list.push({tag, attrs, cont})-1}!%`;
    }).replace(/%![xt]:([0-9]+)(?::[0-9]+|)!%/gs, function(_, i){
      return `%!${list.push(tags[i])-1}!%`;
    });

    param = param.split(/(%![0-9]+!%)/g).map(p => {
      if(p.match(/^%![0-9]+!%$/)){
        return list[Number(p.replace(/^%!([0-9]+)!%$/, '$1'))];
      }
      return p;
    });

    return param;
  }

  param = getTag(param);

  function buildHtmlStr(cont){
    let res = '';
    for(let i = 0; i < cont.length; i++){
      if(typeof cont[i] === 'object'){
        let html = '<'+cont[i].tag;
        const keys = Object.keys(cont[i].attrs);
        for(let j = 0; j < keys.length; j++){
          html += ` ${keys[j]}="${cont[i].attrs[keys[j]]}"`;
        }
        if(!cont[i].cont){
          html += '/>';
        }else{
          html += `>${buildHtmlStr(cont[i].cont)}</${cont[i].tag}>`;
        }
        res += html;
      }else{
        res += cont[i];
      }
    }
    return res;
  }

  const elmList = [];
  for(let i = 0; i < param.length; i++){
    if(typeof param[i] === 'object'){
      let elm = document.createElement(param[i].tag);
      const keys = Object.keys(param[i].attrs);
      for(let j = 0; j < keys.length; j++){
        if(keys[j].trim() === 'class'){
          let classes = param[i].attrs[keys[j]].split(' ').filter(c => c.trim() !== '');
          for(let i in classes){
            elm.classList.add(classes[i]);
          }
        }else{
          elm[keys[j].trim()] = param[i].attrs[keys[j]];
        }
      }
      if(param[i].cont){
        elm.innerHTML = buildHtmlStr(param[i].cont);
      }
      elmList.push(elm);
    }else if(param[i].trim() !== ''){
      let elm = document.createElement('p');
      elm.textContent = param[i];
      elmList.push(elm);
    }
  }

  return elmList;
}


function func(cb, args, end){
  if(!cb.toString().startsWith('f')){
    // arrow function
    if(Array.isArray(args)){
      const first = args.shift();
      const addArgs = [...args];
      if(first === undefined){
        // pre arg without first
        return {call: function(){
          const addArgs = [...args];
          let f = arguments[0];
          let argIndex = 0;
          for(let i = 1; i < arguments.length; i++){
            while(addArgs[argIndex] !== undefined){
              argIndex++;
            }
            addArgs[argIndex] = arguments[i];
          }
          if(end){
            cb(...addArgs, f);
          }else{
            cb(f, ...addArgs);
          }
        }};
      }
      // pre arg with first
      return {call: function(){
        const addArgs = [...args];
        let argIndex = 0;
        for(let i = 0; i < arguments.length; i++){
          while(addArgs[argIndex] !== undefined){
            argIndex++;
          }
          addArgs[argIndex] = arguments[i];
        }
        if(end){
          cb(...addArgs, first);
        }else{
          cb(first, ...addArgs);
        }
      }};
    }
    // no pre args
    if(end){
      return {call: function(){
        let a = arguments;
        let f = a.shift();
        cb(...a, f);
      }};
    }
    return {call: function(){
      cb(...arguments);
    }};
  }
  // normal function
  if(Array.isArray(args)){
    const first = args.shift();
    if(first === undefined){
      // pre arg without first
      return {call: function(){
        const addArgs = [...args];
        let f = arguments[0];
        let argIndex = 0;
        for(let i = 1; i < arguments.length; i++){
          while(addArgs[argIndex] !== undefined){
            argIndex++;
          }
          addArgs[argIndex] = arguments[i];
        }
        cb.call(f, ...addArgs);
      }};
    }
    // pre arg with first
    return {call: function(){
      const addArgs = [...args];
      let argIndex = 0;
      for(let i = 0; i < arguments.length; i++){
        while(addArgs[argIndex] !== undefined){
          argIndex++;
        }
        addArgs[argIndex] = arguments[i];
      }
      cb.call(first, ...addArgs);
    }};
  }
  // no pre args
  return {call: function(){
    cb.call(...arguments);
  }};
}

function callFunc(cb, thisArg){
  if(thisArg instanceof Element && thisArg.data('jquery-support')){
    thisArg = thisArg[0];
  }

  const args = [...arguments];
  args.splice(0, 2);
  if(args.length){
    return cb.call(thisArg, ...args, thisArg);
  }else{
    return cb.call(thisArg, thisArg);
  }
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
  }
  return typeof value;
}

function fixTypeStr(t){
  if(typeof t !== 'string'){return undefined;}
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
    case 'regex' || 'reg':
      return 'regexp';
    case 'elm':
    case 'elem':
      return 'element';
    case 'list':
      return 'nodelist';
    default:
      return t.toLowerCase();          
  }
}


function fromElm(from, elm){
  if(!elm && from.data('jquery-support')){
    if(from instanceof Element){
      return from[0];
    }
    return from;
  }else if(!elm){
    let e;
    if(from instanceof Element){
      e = from;
    }
    if(Array.isArray(elm)){
      e = new Element(...from);
    }
    e = new Element(from);

    e.dataStorage = from.dataStorage;
    return e;
  }

  let e;
  if(Array.isArray(elm)){
    e = new Element(...elm);
  }else{
    e = new Element(elm);
  }

  e.dataStorage = from.dataStorage;

  if(from.data('jquery-support')){
    return e[0];
  }
  return e;
}

function getQuery(param, elm = document){
  if(param === 'body' && (elm === document || elm === window)){
    return [(document.body || document.getElementsByTagName('body')[0])];
  }

  if(typeof param === 'string'){
    return [...selectQuery(param, elm)];
  }else if(!(param instanceof Element) && Array.isArray(param)){
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
    return arr;
  }else if(param != null){
    return [param];
  }

  return [];
}

function selectQuery(param, elm = document){
  if(elm instanceof NodeList){
    elm = [...elm];
  }
  if(elm instanceof Element){
    let arr = [];
    elm.forEach(e => {
      arr.push(...e.querySelectorAll(param));
    });
    return arr;
  }else if(typeof elm === 'string'){
    elm = document.querySelectorAll(elm);
    let arr = [];
    elm.forEach(e => {
      arr.push(...e.querySelectorAll(param));
    });
    return arr;
  }else if(Array.isArray(elm)){
    let arr = [];
    elm.forEach(e => {
      if(e === window){
        return document.querySelectorAll(param);
      }else{
        arr.push(...e.querySelectorAll(param));
      }
    });
    return arr;
  }else if(elm != null){
    if(elm === window){
      return document.querySelectorAll(param);
    }
    return elm.querySelectorAll(param);
  }
  return null;
}


const ajaxContentTypes = {
  'json': 'application/json; charset=UTF-8',
  'text': 'text/plain; charset=UTF-8',
  'html': 'text/html; charset=UTF-8',
  'css': 'text/css; charset=UTF-8',
  'javascript': 'text/javascript; charset=UTF-8',
  'js': 'text/javascript; charset=UTF-8',
  'data': 'text/data; charset=UTF-8',
  'image': 'image/png; charset=UTF-8',
  'png': 'image/png; charset=UTF-8',
  'jpg': 'image/jpg; charset=UTF-8',
  'jpeg': 'image/jpeg; charset=UTF-8',
  'svg': 'image/svg; charset=UTF-8',
  'webp': 'image/webp; charset=UTF-8',
  'audio': 'video/mp3; charset=UTF-8',
  'video': 'video/mp4; charset=UTF-8',
  'mp4': 'video/mp4; charset=UTF-8',
  'mov': 'video/mov; charset=UTF-8',
  'mp3': 'audio/mp3; charset=UTF-8',
  'wav': 'audio/wav; charset=UTF-8',
  'ogg': 'audio/ogg; charset=UTF-8',
};
function getAjaxContentType(type){
  let t = ajaxContentTypes[type.toLowerCase()];
  if(t){
    return t;
  }
  if(!type.includes('/')){
    type = 'text/'+type;
  }
  if(!type.includes(';')){
    type += '; charset=UTF-8';
  }
  return type;
}

export {
  elementUrlTagTypes,
  buildHtmlElmArray,
  func,
  callFunc,
  varType,
  fromElm,
  getQuery,
  selectQuery,
  fixTypeStr,
  ajaxContentTypes,
  getAjaxContentType,
};
