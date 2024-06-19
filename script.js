class Element extends Array {
  dataStorage = {};

  data(key, value){
    switch ($.type(key)) {
      case 'function':
        key.call(this, this.dataStorage);
        return this;
      case 'undefined':
        return this.dataStorage;
      case 'object':
        let keys = Object.keys(key);
        for(let i in keys){
          if(key[keys[i]] === null){
            delete this.dataStorage[keys[i]];
          }else{
            this.dataStorage[keys[i]] = key[keys[i]];
          }
        }
        return this;
      case 'array':
        let res = {};
        for(let i in key){
          res[key[i]] = this.dataStorage[key[i]];
        }

        if(typeof value === 'function'){
          value.call(this, res);
          return this;
        }
        return res;
      default:
        break;
    }

    switch ($.type(value)) {
      case 'function':
        key.call(this, this.dataStorage[key]);
        return this;
      case 'undefined':
        return this.dataStorage[key];
      case 'null':
        delete this.dataStorage[key];
        return this;
      default:
        this.dataStorage[key] = value;
        return this;
    }
  }

  query(param, elm = document){
    $(param, elm).forEach(e => {
      this.push(e);
    });
    return this;
  }

  //todo: add common class functions (also test browser compatibility)
}

;(function(){
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


  // main method
  function $(param, elm = document){
    if(param instanceof Element){return param;}

    if(typeof param === 'string'){
      if(param.startsWith(':') && (elm === document || elm === window)){
        switch (param) {
          case ':root':
            return $.root;
          case ':head':
            return $.head;
          case ':body':
            return $.body;
          case ':header':
            return $.header;
          case ':main':
            return $.main;
          case ':footer':
            return $.footer;
          default:
            break;
        }
      }

      if(param.match(/<[\w_\-$]+(?:\s+.*?|)>/)){
        param = buildHtmlElmArray(param);
        return new Element(...param);
      }

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

    return new Element(elm);
  }


  // common elements
  $.root = (function(){
    return new Element(document.querySelectorAll(':root')[0]);
  })();

  $.head = (function(){
    return new Element(document.head || document.querySelector('head'));
  })();

  $.body = (function(){
    return new Element(document.body || document.querySelector('body'));
  })();

  $.header = (function(){
    return new Element(document.header || document.querySelector('header'));
  })();

  $.main = (function(){
    return new Element(document.main || document.querySelector('main'));
  })();

  $.footer = (function(){
    return new Element(document.footer || document.querySelector('footer'));
  })();


  // common methods
  $.type = function(value, types){
    let type;
    if(Array.isArray(value)){
      type = 'array';
    }else if(Number.isNaN(value)){
      type = 'nan';
    }else if(value === null){
      type = 'null';
    }else if(value instanceof RegExp){
      type = 'regex';
    }else if(value instanceof Element){
      type = 'element';
    }else if(value instanceof NodeList){
      type = 'nodelist';
    }else if(value instanceof Node){
      type = 'node';
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

  $.isElement = function(v){
    return !!(v instanceof Element);
  };

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
      cb.call({success: true, isJSON, ...data.info}, data.content);
    }).catch(e => {
      if(timedOut){return null;}
      if(timeoutFunc){clearTimeout(timeoutFunc);}
      if(opts.type === 'json' && !((typeof e === 'object' && !(e instanceof Error)) || Array.isArray(e))){
        e = {error: e};
      }
      cb.call({success: false, isJSON: (opts.type === 'json'), ok: false}, e);
    });

    if(opts.timeout > 0){
      timeoutFunc = setTimeout(function(){
        timedOut = true;
        let res = 'Request Timed Out';
        if(opts.type === 'json'){
          res = {error: res};
        }
        cb.call({success: false, isJSON: (opts.type === 'json'), timedOut: true, ok: false}, res);
      }, opts.timeout);
    }

    return this;
  };

  $.style = function(href){
    if(!$('link[rel="stylesheet"]').hasAttr('href', href)){
      $.head.append(`<link rel="stylesheet" href="${href.replace(/"/g, '&quot;')}">`);
    }
  };

  $.script = function(src){
    if(!$('script').hasAttr('src', src)){
      $.head.append(`<script src="${src.replace(/"/g, '&quot;')}"></script>`);
    }
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

  $.call = function(cb, thisArg){
    const args = [...arguments];
    args.splice(0, 2);
    if(args.length){
      return cb.call(thisArg, ...args, thisArg);
    }else{
      return cb.call(thisArg, thisArg);
    }
  };

  $.method = function(name, cb){
    if(!Array.isArray(name)){
      name = [name];
    }

    let added = [];

    for(let i in name){
      if(!Element.prototype[name[i]]){
        added.push(name[i]);
        Element.prototype[name[i]] = function(){
          return cb.call(this, ...arguments);
        };
      }
    }

    if(added.length === 0){
      return false;
    }
    return added;
  };


  // export
  window.$ = Object.freeze($);
  window.jqalt = Object.freeze($);
  window.jqAlt = Object.freeze($);
})();
