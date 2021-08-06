;$ = (function(){


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

  function fromElm(from, elm){
    let e;
    if(Array.isArray(elm)){
      e = new Element(...elm);
    }else{
      e = new Element(elm);
    }

    e.dataStorage = from.dataStorage;
    return e;
  }

  class Element extends Array {
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


    attr(key, value){
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
    }

    hasAttr(key, value){
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
    }

    removeAttr(key){
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
    }


    addClass(className){
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
    }

    hasClass(className, cb){
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
    }

    removeClass(className){
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
    }


    css(key, value){
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
    }

    html(value){
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
    }

    text(value){
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
    }


    tag(value){
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
    }

    value(value){
      if(value === ''){
        this.removeAttr('value');
        return this;
      }
      return this.attr('value', value);
    }
    val(value){return this.value(value);}

    id(value){
      if(value === ''){
        this.removeAttr('id');
        return this;
      }
      return this.attr('id', value);
    }
    name(value){
      if(value === ''){
        this.removeAttr('name');
        return this;
      }
      return this.attr('name', value);
    }
    type(value){
      if(value === ''){
        this.removeAttr('type');
        return this;
      }
      return this.attr('type', value);
    }

    url(value){
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
    }
    src(value){
      if(value === ''){
        this.removeAttr('src');
        return this;
      }
      return this.attr('src', value);
    }
    href(value){
      if(value === ''){
        this.removeAttr('href');
        return this;
      }
      return this.attr('href', value);
    }



    query(param, elm = document){
      $(param, elm).forEach(e => {
        this.push(e);
      });
      return this;
    }

    each(sel, cb){
      if(typeof sel === 'function'){
        [sel, cb] = [cb, sel];
      }
      this.forEach(elm => {
        if(elm != null){
          if(sel){
            getQuery(sel, elm).forEach(e => {
              callFunc(cb, fromElm(this, e));
            });
          }else{
            callFunc(cb, fromElm(this, elm));
          }
        }
      });
      return this;
    }

    loop(ms, sel, cb, limit){
      [ms, sel, cb, limit] = $.sort([ms, 'num'], [sel, 'str', 'arr', 'elm'], [cb, 'func'], [limit, 'num']);
      this.forEach(elm => {
        if(elm != null){
          if(sel){
            getQuery(sel, elm).forEach(e => {
              function stop(){clearInterval(interval);}
              cb = func(cb, [fromElm(this, e),,{stop}]);

              const interval = setInterval(() => {
                cb.call(limit);
                if(limit !== undefined && --limit <= 0){
                  clearInterval(interval);
                }
              }, ms);
            });
          }else{
            function stop(){clearInterval(interval);}
            cb = func(cb, [fromElm(this, e),,{stop}]);

            const interval = setInterval(() => {
              cb.call(limit);
              if(limit !== undefined && --limit <= 0){
                clearInterval(interval);
              }
            }, ms);
          }
        }
      });
      return this;
    }

    on(event, sel, cb){
      if(typeof sel === 'function'){
        [sel, cb] = [cb, sel];
      }
      if(!Array.isArray(event)){
        event = [event];
      }

      if(typeof cb !== 'function'){return this;}

      if(sel){
        this.forEach(elm => {
          for(let i = 0; i < event.length; i++){
            elm.addEventListener(event[i], e => {
              if(e.target.matches(sel)){
                cb.call(this.cloneData(elm), e);
              }
            }, {passive: false});
          }
        });
        return this;
      }
      this.forEach(elm => {
        for(let i = 0; i < event.length; i++){
          elm.addEventListener(event[i], e => {
            callFunc(cb, fromElm(this, elm), e);
          }, {passive: false});
        }
      });
      return this;
    }

    do(event, opts = {}){
      if(typeof event === 'object' && !Array.isArray(event)){
        [event, opts] = [opts, event];
      }
      if(!Array.isArray(event)){
        event = [event];
      }
      this.forEach(elm => {
        for(let i = 0; i < event.length; i++){
          elm.dispatchEvent(new Event(event[i], opts));
        }
      });
      return this;
    }
    trigger(event, opts = {}){return this.do(event, opts);}


    ready(cb){
      const isReady = this.some(e => {
        return e.readyState != null && e.readyState != 'loading';
      });
      if(isReady){
        this.each(elm => {
          if(elm === document || elm === window){
            cb.call(document);
          }else{
            cb.call(this.cloneData(elm));
          }
        });
      }else{
        this.each(elm => {
          if(elm === document || elm === window){
            if(document.addEventListener){
              document.addEventListener('DOMContentLoaded', e => {
                cb.call(document, e);
              });
            }else{
              document.attachEvent('onreadystatechange', function(){
                if(document.readyState == 'complete'){
                  cb.call(document);
                }
              });
            }
          }else{
            this.on('DOMContentLoaded', e => {
              cb.call(this.cloneData(elm), e);
            });
          }
        });
        this.on('DOMContentLoaded', cb);
      }
      return this;
    }


    append(sel, ref){
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
    }

    prepend(sel, ref){
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
    }

    appendTo(sel, ref){
      $(sel).append(this, ref);
      return this;
    }

    prependTo(sel, ref){
      $(sel).prepend(this, ref);
      return this;
    }

    after(sel){
      $(this).parent().append(sel, this);
    }

    before(sel){
      $(this).parent().prepend(sel, this);
    }

    putAfter(sel){
      $(sel).parent().append(this, sel);
    }
    insertAfter(sel){this.putAfter(sel);}

    putBefore(sel){
      $(sel).parent().prepend(this, sel);
    }
    insertBefore(sel){this.putBefore(sel);}



    next(sel){
      if(typeof sel === 'number'){
        return this.map(e => {
          if(sel < 0){sel = e.parentNode.children.length - Math.abs(sel);}
          for(let i = 0; i < sel; i++){
            let n = e.nextElementSibling;
            if(!n){break;}
            e = n;
          }
          return e;
        }).filter(e => e != null);
      }
      if(typeof sel === 'string'){
        return this.map(e => {
          e = e.nextElementSibling;
          while(e != null && !$.isQuery(e, sel)){
            e = e.nextElementSibling;
          }
          return e;
        }).filter(e => e != null);
      }
      return this.map(e => e.nextElementSibling).filter(e => e != null);
    }

    previous(){
      if(typeof sel === 'number'){
        return this.map(e => {
          if(sel < 0){sel = e.parentNode.children.length - Math.abs(sel);}
          for(let i = 0; i < sel; i++){
            let n = e.previousElementSibling;
            if(!n){break;}
            e = n;
          }
          return e;
        }).filter(e => e != null);
      }
      if(typeof sel === 'string'){
        return this.map(e => {
          e = e.previousElementSibling;
          while(e != null && !$.isQuery(e, sel)){
            e = e.previousElementSibling;
          }
          return e;
        }).filter(e => e != null);
      }
      return this.map(e => e.previousElementSibling).filter(e => e != null);
    }


    parent(){
      return new Element(this[0].parentNode);
    }

    child(sel, index, node){
      [sel, index, node] = $.sort([sel, 'str'], [index, 'num'], [node, 'bool']);

      let result = [];
      this.forEach(elm => {
        let child;
        if(node){
          child = [...elm.childNodes];
        }else{
          child = [...elm.children];
        }
        if(sel){
          let res = [];
          for(let i = 0; i < child.length; i++){
            if($.isQuery(child[i], sel)){
              res.push(child[i]);
            }
          }
          child = res;
        }
        if(index !== undefined){
          if(index % 1 !== 0){
            let [start, end] = index.toString().split('.');
            start = Number(start);
            if(start < 0){start = child.length - Math.abs(start);}
            end = Number(start) + Number(end);
            for(let i = start; i <= end; i++){
              if(child[i] != null){
                result.push(child[i]);
              }
            }
          }else{
            if(index < 0){index = child.length - Math.abs(index);}
            if(child[index] != null){
              result.push(child[index]);
            }
          }
        }else{
          result.push(...child);
        }
      });

      return new Element(...result);
    }

    clone(deep = true){
      return new Element(...this.map(elm => {
        return elm.cloneNode(deep);
      }));
    }

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


  function $(param, elm = document){
    if(param instanceof Element){return param;}

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


  // define additional keywords
  $.del = new Date().getTime();


  // define basic functions
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


  $.isArrowFunction = function(cb){
    return (typeof cb === 'function' && !cb.toString().startsWith('f'));
  };

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
  $.type = function(value, types){
    let type;
    if(value instanceof Element){
      type = 'element';
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
  }

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


  $.addMethod = function(name, cb){
    if(!Element.prototype[name]){
      Element.prototype[name] = cb;
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
  $.head = addCommonTag('head');
  $.body = addCommonTag('body');
  $.header = addCommonTag('header');
  $.main = addCommonTag('main');
  $.footer = addCommonTag('footer');


  return $;
})();

Object.freeze($);
