import { func, callFunc, fixTypeStr, getAjaxContentType } from './functions.js'
import Element, {$} from './selector.js'
import Socket from './socket-io.js'


$.ready = function(cb){
  let loaded = false;

  // for other browsers
  let loops = 10;
  let interval = setInterval(function(){
    if(document.readyState !== 'loading' || loops-- < 0){
      ready();
      clearInterval(interval);
    }
  }, 1000);

  // for most browsers
  if(document.readyState !== 'loading'){
    ready();
  }else if(document.addEventListener){
    document.addEventListener("DOMContentLoaded", ready);
  }else{ // for IE8
    document.attachEvent('onreadystatechange', function(){
      if(document.readyState === 'complete'){
        ready();
      }
    });
  }

  function ready(){
    if(loaded){return;}
    loaded = true;
    clearInterval(interval);
    cb();
  };
};

$.fetch = function(url, data = {}, cb = () => {}, {method = 'POST', timeout = 30000, type = 'json'} = {}){
  const opts = {method, timeout, type};
  if(typeof data === 'function'){
    [data, cb] = [cb, data];
    if(typeof data === 'object'){
      let keys = Object.keys(opts);
      for(let i in keys){
        if(data[keys[i]] !== undefined){
          opts[keys[i]] = data[keys[i]];
        }
      }
      data = {};
    }
  }

  let timedOut = false;
  opts.method = opts.method.toUpperCase();

  const headers = {
    method: opts.method,
    headers: {
      'Content-Type': getAjaxContentType(type)
    }
  }

  if(opts.method === 'GET'){
    if(Object.keys(data).length){
      url = url+'?'+Object.entries(data).map(([key, value]) => {
        return `${key}=${value}`;
      }).join('&');
    }
  }else if(opts.method === 'POST'){
    opts.method.body = JSON.stringify(data);
  }else if(method === 'HEAD'){
    opts.method.head = JSON.stringify(data);
  }

  let timeoutFunc;

  navigator.userAgent

  fetch(url, headers).then(res => {
    if(timedOut){return null;}
    if(timeoutFunc){clearTimeout(timeoutFunc);}
    return {
      info: {
        status: res.status,
        type: res.type,
        url: res.url,
        ok: res.ok,
        redirected: res.redirected,
        head: res.headers,
        body: res.body
      },
      content: res.json() || res.text()
    };
  }).then(data => {
    if(timedOut){return null;}
    let isJSON = (opts.type === 'json');
    if(isJSON && !((typeof data.content === 'object' && !(data.content instanceof Error) || Array.isArray(data.content)))){
      try{
        data.content = JSON.parse(data.content);
      }catch(e){isJSON = false;}
    }
    callFunc(cb, {success: true, isJSON, ...data.info}, data.content);
  }).catch(e => {
    if(timedOut){return null;}
    if(timeoutFunc){clearTimeout(timeoutFunc);}
    if(opts.type === 'json' && !((typeof e === 'object' && !(e instanceof Error)) || Array.isArray(e))){
      e = {error: e};
    }
    callFunc(cb, {success: false, isJSON: (opts.type === 'json'), ok: false}, e);
  });

  if(opts.timeout > 0){
    timeoutFunc = setTimeout(function(){
      timedOut = true;
      let res = 'Request Timed Out';
      if(opts.type === 'json'){
        res = {error: res};
      }
      callFunc(cb, {success: false, isJSON: (opts.type === 'json'), timedOut: true, ok: false}, res);
    }, opts.timeout);
  }

  return this;
};

$.addStyle = function(href){
  if(!$('link[rel="stylesheet"]').hasAttr('href', href)){
    $.head().append(`<link rel="stylesheet" href="${href.replace(/"/g, '&quot;')}">`);
  }
};

$.addScript = function(src){
  if(!$('script').hasAttr('src', src)){
    $.head().append(`<script src="${src.replace(/"/g, '&quot;')}"></script>`);
  }
};

$.isElement = function(v){
  return !!(v instanceof Element);
};

$.isSocket = function(v){
  return !!(v instanceof Socket);
};


const ranFunctions = [];
$.once = function(id, cb){
  if(typeof id === 'function'){
    [id, cb] = [cb, id];
  }
  if(ranFunctions[id]){
    return;
  }
  ranFunctions[id] = true;
  cb();
};

$.loop = function(ms, cb, limit){
  [ms, cb, limit] = $.sort([ms, 'num'], [cb, 'func'], [limit, 'num']);

  if(typeof cb !== 'function'){
    return undefined;
  }

  cb = func(cb, [{stop}], true);

  function stop(){
    clearInterval(interval);
  }

  const interval = setInterval(function(){
    cb.call(limit);
    if(limit !== undefined && --limit <= 0){
      clearInterval(interval);
    }
  }, ms);
};

$.sort = function(){
  let params = [];
  for(let i in arguments){
    if(!Array.isArray(arguments[i])){
      params[i] = arguments[i];
    }else if(arguments[i].length === 1){
      params[i] = arguments[i][0];
    }else{
      let args = [...arguments[i]];
      let arg = args.shift();
      if($.type(arg, args)){
        params[i] = arg;
      }
    }
  }

  let moved = [];
  for(let i = 0; i < arguments.length; i++){
    if(params[i] === undefined){
      for(let j = 0; j < arguments.length; j++){
        if(params[j] === undefined && moved[j] === undefined){
          let args = [...arguments[j]];
          args.shift();
          if($.type(arguments[i][0], args)){
            moved[j] = arguments[i][0];
            break;
          }
        }
      }
    }
  }

  for(let i in moved){
    params[i] = moved[i];
  }

  return params;
};

$.type = function(value, types){
  let type;
  if(value instanceof Element){
    type = 'element';
  }else if(value instanceof Socket){
    type = 'socket';
  }else if(value instanceof NodeList){
    type = 'nodelist';
  }else if(value instanceof Node){
    type = 'node';
  }else if(value instanceof RegExp){
    type = 'regexp';
  }else if(Array.isArray(value)){
    type = 'array';
  }else if((typeof value === 'number' && isNaN(value))){
    type = 'nan';
  }else if(value === null){
    type = 'null';
  }else{
    type = typeof value;
  }

  if(types){
    if(Array.isArray(types)){
      return types.map(fixTypeStr).includes(type);
    }
    return type === fixTypeStr(types);
  }

  return type;
};

$.isQuery = function(elm, sel){
  if(typeof elm === 'string'){
    [elm, sel] = [sel, elm];
  }

  if(Array.isArray(elm)){
    return elm.map(e => $.isQuery(e));
  }

  //todo: improve function (split by commas and spaces, to improve capabilities)

  let match = true;
  sel.replace(/\[\s*([\w_\-$\.]+)\s*=\s*(["'])((?:\\[\\"']|.)*?)\1\s*\]/g, function(_, key, q, value){
    if(elm.getAttribute(key) !== value){
      match = false;
    }
  });
  if(!match){return false;}

  sel.replace(/\[\s*([\w_\-$\.]+)\s*=\s*(.*?)\s*\]/g, function(_, key, value){
    if(elm.getAttribute(key) !== value){
      match = false;
    }
  });
  if(!match){return false;}

  sel.replace(/([.#]|)([\w_\-$\.]+)/g, function(_, key, value){
    if(key === '.' && !elm.classList.contains(value)){
      match = false;
    }else if(key === '#' && elm.id !== value){
      match = false;
    }else if(elm.tagName.toLowerCase() !== value.toLowerCase()){
      match = false;
    }
  });

  return match;
};

$.isArrowFunction = function(cb){
  return (typeof cb === 'function' && !cb.toString().startsWith('f'));
};
