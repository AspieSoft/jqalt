class Element extends Array {
  storage = [];

  // store javascript side data on a particular element or list of elements
  //
  // this can be used as an alternative to setting html arguments,
  // if you need a faster way to store more complex data than just strings.
  //
  // this can also be used for keeping private data attached to an element for a specific variable.
  data(key, value, index){
    if(typeof index !== 'number'){
      index = -1;
    }

    if(typeof this.storage[index] !== 'object'){
      this.storage[index] = {};
    }

    switch ($.type(key)) {
      case 'function':
        key.call(this, this.storage[index]);
        return this;
      case 'undefined':
        return this.storage[index];
      case 'object':
        let keys = Object.keys(key);
        for(let i in keys){
          if(key[keys[i]] === null){
            delete this.storage[index][keys[i]];
          }else{
            this.storage[index][keys[i]] = key[keys[i]];
          }
        }
        return this;
      case 'array':
        let res = {};
        for(let i in key){
          res[key[i]] = this.storage[index][key[i]];
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
        key.call(this, this.storage[index][key]);
        return this;
      case 'undefined':
        return this.storage[index][key];
      case 'null':
        delete this.storage[index][key];
        return this;
      default:
        this.storage[index][key] = value;
        return this;
    }
  }

  // add elements to query list
  query(param, elm = document){
    $(param, elm).forEach(e => {
      this.push(e);
    });
    return this;
  }

  // run callback method for each element
  each(sel, cb){
    if(typeof sel === 'function'){[sel, cb] = [cb, sel];}
    if(typeof cb !== 'function'){return this;}

    // split selector list by spaces
    if(typeof sel === 'string'){
      sel = sel.split(/(,|[^,]*\[(?:".*?"|'.*?'|`.*?`|.)*?\][^,]*)/).map(s => s.trim()).filter(s => s !== '' && s !== ',');
    }

    for(let i in this){
      if(this[i] instanceof Node){
        // check for matching selector
        if(Array.isArray(sel)){
          let m = false;
          for(let s of sel){
            if($.isQuery(this[i], s)){
              m = true;
            }
          }

          if(!m){
            continue;
          }
        }

        // make elm an instance of jqalt Element
        const elm = new Element(this[i]);

        // merge dataStorage index of element
        if(typeof this.storage[i] !== 'object'){
          this.storage[i] = {};
        }
        elm.storage[-1] = this.storage[i];

        // run callback method with 'this' var as the element instance
        // return normal elm node as 1st arg
        // return list index as 2nd arg
        //
        // if callback returns false, stop the loop
        if(cb.call(elm, this[i], i) === false){
          break;
        }
      }
    }

    return this;
  }

  // return element from a specified index
  // @index default: 0
  elm(index, sel, cb){
    [index, sel, cb] = $.sort([index, 'num'], [sel, 'str', 'arr', 'obj'], [cb, 'func']);

    if(typeof index !== 'number' || index < 0){
      index = 0;
    }

    let elm = null;

    if(!sel){
      if(this[index] instanceof Node){
        // make elm an instance of jqalt Element
        elm = new Element(this[index]);

        // merge dataStorage index of element
        if(typeof this.storage[index] !== 'object'){
          this.storage[index] = {};
        }
        elm.storage[-1] = this.storage[index];
      }
    }else{
      let i = 0;
      this.each(sel, function(){
        if(i !== index){
          i++;
          return true;
        }
  
        elm = this;
        return false;
      });
    }

    if(elm != null && typeof cb === 'function'){
      cb.call(elm, elm[0]);
      return this;
    }

    return elm;
  }

  // addEventListener
  on(event, sel, cb, opts){
    [sel, cb, opts] = $.sort([sel, 'str'], [cb, 'func'], [opts, 'obj']);
    if(!Array.isArray(event) && typeof event !== 'string' && !(event instanceof CustomEvent)){return this;}
    if(typeof event === 'string'){event = event.split(' ');}
    if(typeof cb !== 'function'){return this;}
    if(typeof opts !== 'object' && opts !== 'boolean'){opts = {};}

    this.each(sel, function(elm, index){
      // prevent accidental double firing of event
      let cbEv = $.limit(cb);

      if(event instanceof CustomEvent){
        elm.addEventListener(event.type, e => {
          cbEv.type = e.type; // helps prevent duplicate triggers
          cbEv.call(this, e, elm, index);
        }, opts);
        return;
      }

      for(let ev of event){
        elm.addEventListener(ev, e => {
          cbEv.type = e.type; // helps prevent duplicate triggers
          cbEv.call(this, e, elm, index);
        }, opts);
      }
    });

    return this;
  }

  // addEventListener and removeEventListener on first call
  once(event, sel, cb, opts){
    [sel, cb, opts] = $.sort([sel, 'str'], [cb, 'func'], [opts, 'obj']);
    if(!Array.isArray(event) && typeof event !== 'string' && !(event instanceof CustomEvent)){return this;}
    if(typeof event === 'string'){event = event.split(' ');}
    if(typeof cb !== 'function'){return this;}
    if(typeof opts !== 'object' && opts !== 'boolean'){opts = {};}

    this.each(sel, function(elm, index){
      // prevent accidental double firing of event
      let cbEv = $.limit(cb);

      if(event instanceof CustomEvent){
        const thisCB = e => {
          cbEv.type = e.type; // helps prevent duplicate triggers
          cbEv.call(this, e, elm, index);
          elm.removeEventListener(event.type, thisCB);
        };

        elm.addEventListener(event.type, thisCB, opts);
        return;
      }

      for(let ev of event){
        const thisCB = e => {
          cbEv.type = e.type; // helps prevent duplicate triggers
          cbEv.call(this, e, elm, index);
          elm.removeEventListener(ev, thisCB);
        };

        elm.addEventListener(ev, thisCB, opts);
      }
    });

    return this;
  }

  // dispatchEvent
  do(event, sel, opts){
    [sel, opts] = $.sort([sel, 'str'], [opts, 'obj']);
    if(!Array.isArray(event) && typeof event !== 'string' && !(event instanceof CustomEvent)){return this;}
    if(typeof event === 'string'){event = event.split(' ');}
    if(typeof opts !== 'object' && opts !== 'boolean'){opts = {};}

    this.each(sel, function(elm){
      if(event instanceof CustomEvent){
        elm.dispatchEvent(event, opts);
        return;
      }

      for(let ev of event){
        elm.dispatchEvent(new Event(ev, opts));
      }
    });

    return this;
  }

  // triggers or detects a click event
  // when triggered, this method will also append the document.activeElement to the manual $.focus method
  click(sel, cb, opts){
    [sel, cb, opts] = $.sort([sel, 'str'], [cb, 'func'], [opts, 'obj']);
    if(typeof opts !== 'object' && opts !== 'boolean'){opts = {};}

    if(typeof cb !== 'function'){
      return this.do('click', sel, opts);
    }

    this.on('mousedown touchstart', sel, () => {
      $.focus(true);
    }, opts);

    return this.on('click', sel, cb, opts);
  }

  // triggers or detects a focus event
  // when triggered, this method will also append the document.activeElement to the manual $.focus method
  focus(sel, cb, opts){
    [sel, cb, opts] = $.sort([sel, 'str'], [cb, 'func'], [opts, 'obj']);
    if(typeof opts !== 'object' && opts !== 'boolean'){opts = {};}

    if(typeof cb !== 'function'){
      $.focus(true);
      this.elm(0, sel)[0].focus();
      return this;
    }

    return this.on('focus', sel, cb, opts);
  }

  // triggers or detects a blur event
  // set focusLast to autofocus the last active element before this one
  // focusLast will use the manual $.focus method
  blur(sel, cb, opts, focusLast){
    [sel, cb, opts, focusLast] = $.sort([sel, 'str'], [cb, 'func'], [opts, 'obj'], [focusLast, 'bool']);
    if(typeof opts !== 'object' && opts !== 'boolean'){opts = {};}

    if(typeof cb !== 'function'){
      const elm = this.elm(0, sel)[0];

      let oldElm = null;
      if(focusLast){
        oldElm = $.focus(-1, true);

        if(oldElm === elm){
          oldElm = $.focus(-1, true);
        }

        if(oldElm === elm){
          oldElm = null;
        }
      }

      elm.blur();

      // focus document body if blur fails
      if(document.activeElement === elm){
        $.body[0].focus();
      }

      // focus previous element
      if(focusLast && oldElm instanceof Node){
        oldElm.focus();
      }

      return this;
    }

    return this.on('blur', sel, cb, opts);
  }

  // get or set a css value
  //
  // when setting values, @sel is used as an html selector in an each loop (strings only).
  // what getting values, @sel is used as a value selector `window.getComputedStyle(elm, sel)` (i.e. sel = ':after').
  //
  // you can pass an object value to set a list of key value pairs.
  //
  // you can pass an array value to set the key to an incremental/alternating value per element.
  // example:
  //  $('div').css('background', ['blue', 'green', 'red'])
  //    <div style="background: blue">
  //    <div style="background: green">
  //    <div style="background: red">
  //    <div style="background: blue">
  //    <div style="background: green">
  //    <div style="background: red">
  //
  // when getting values, @computed has multiple options:
  //  - true: evaluate a `var(--myvar)` to its computed value.
  //  - false: do not run window.getComputedStyle when returning values (only use html style tag).
  //  - null/undefined (default): will not evaluate `var(--myvar)` to its computed value,
  //    but will fallback to a computed value if the result is null/undefined/''.
  //
  // pass a callback function to listen for changes to a css value specified by the key,
  // or leave the key blank to listen for all css changes.
  css(key, value, sel, cb, computed){
    [key, value, sel, cb, computed] = $.sort([key, 'str'], [value, 'str', 'obj', 'arr', 'null'], [sel, 'str'], [cb, 'func'], [computed, 'bool']);
    if(typeof value === 'string' && typeof sel !== 'string' && value.match(/^:[A-Za-z0-9_-]+$/)){
      [value, sel] = [sel, value];
    }

    // listen for changes
    if(typeof cb === 'function'){
      //todo: add css change listener
      // for change event, include the old and new value
      // if no key is specified, include any key as a function argument
      return this;
    }

    // set value
    if(value != null){
      this.each(sel, function(elm, index){
        if(typeof key === 'string' && typeof value === 'string'){ // key value string
          if(key.startsWith('-')){
            elm.style.setProperty(key, value);
            return;
          }

          elm.style[key] = value;
        }else if(typeof key === 'string' && Array.isArray(value)){ // array value
          if(value.length < 0){
            return;
          }
          while(index >= value.length){
            index -= value.length;
          }
          if(index < 0){index = 0;}

          if(typeof value[index] === 'string'){
            elm.style[key] = value[index];
          }
        }else if(typeof value === 'object'){
          for(let k in value){
            if(typeof value[k] === 'string'){
              elm.style.setProperty(k, value[k]);
            }
          }
        }
      });

      return this;
    }

    // get value
    const elm = this.elm(0)[0];

    // for performance on simple requests
    if(!computed && typeof key === 'string' && typeof sel !== 'string' && !key.startsWith('-')){
      if(elm.style[key] != null && elm.style[key] !== ''){
        return elm.style[key];
      }
    }

    if(computed === false){
      if(typeof key !== 'string'){
        return elm.style;
      }

      return elm.style.getPropertyValue(key);
    }

    let css = null;
    if(typeof sel === 'string'){
      css = window.getComputedStyle(elm, sel);
    }else{
      css = window.getComputedStyle(elm);
    }

    if(typeof key !== 'string'){
      return css;
    }

    return css.getPropertyValue(key);
  }

  // get or set an html attribute (or use a '--key' to set a css property/variable)
  //
  // note: this method functions in a similar way to the "css" method
  attr(key, value, sel, cb){
    [key, value, sel, cb] = $.sort([key, 'str'], [value, 'str', 'obj', 'arr'], [sel, 'str'], [cb, 'func']);

    // listen for changes
    if(typeof cb === 'function'){
      //todo: add html attribute change listener
      // for change event, include the old and new value
      // also include the type of change (added, removed, changed) || (add, del, set)
      return this;
    }

    // set value
    if(value != null){
      this.each(sel, function(elm, index){
        if(typeof key === 'string' && typeof value === 'string'){ // key value string
          if(key.startsWith('--')){
            elm.style.setProperty(key, value);
            return;
          }

          elm.setAttribute(key, value);
        }else if(typeof key === 'string' && Array.isArray(value)){ // array value
          if(value.length < 0){
            return;
          }
          while(index >= value.length){
            index -= value.length;
          }
          if(index < 0){index = 0;}

          if(key.startsWith('--')){
            if(typeof value[index] === 'string'){
              elm.style.setProperty(key, value[index]);
            }
          }else if(typeof value[index] === 'string'){
            elm.setAttribute(key, value[index]);
          }
        }else if(typeof value === 'object'){
          for(let k in value){
            if(k.startsWith('--')){
              if(typeof value[k] === 'string'){
                elm.style.setProperty(k, value[k]);
              }
            }else if(typeof value[k] === 'string'){
              elm.setAttribute(k, value[k]);
            }
          }
        }
      });

      return this;
    }

    // get value
    const elm = this.elm(0, sel)[0];

    if(typeof key === 'string'){
      if(key.startsWith('--')){
        elm.style.getPropertyValue(key);
      }
      return elm.getAttribute(key);
    }
  }

  // return true if an element has an html attribute
  //
  // pass an array @key to check if element has all of the attributes in a list
  //
  // @callback: check every element, and run a callback funnction for each element that has the specified attribute
  hasAttr(key, sel, cb){
    [key, sel, cb] = $.sort([key, 'str', 'arr'], [sel, 'str'], [cb, 'func']);
    if(key == null){return this;}

    if(typeof cb === 'function'){
      this.each(sel, function(elm, index){
        if(Array.isArray(key)){
          let hasAttr = key.length !== 0;
          for(let k of key){
            if(typeof k === 'string'){
              if(!elm.hasAttribute(k)){
                hasAttr = false;
                break;
              }
            }
          }

          if(hasAttr){
            return cb.call(this, elm, index);
          }
        }

        if(elm.hasAttribute(key)){
          return cb.call(this, elm, index);
        }
      });

      return this;
    }

    const elm = this.elm(0, sel)[0];

    if(Array.isArray(key)){
      let hasAttr = key.length !== 0;
      for(let k of key){
        if(typeof k === 'string'){
          if(!elm.hasAttribute(k)){
            hasAttr = false;
            break;
          }
        }
      }

      return hasAttr;
    }

    return elm.hasAttribute(key);
  }

  // delete an html attribute
  //
  // pass an array @key to remove multiple attributes
  delAttr(key, sel){
    [key, sel] = $.sort([key, 'str', 'arr'], [sel, 'str']);
    if(key == null){return this;}

    this.each(sel, function(elm, index){
      if(Array.isArray(key)){
        for(let k of key){
          elm.removeAttribute(k);
        }
        return;
      }

      elm.removeAttribute(key);
    });

    return this;
  }

  //todo: add methods: id, tag, type, name, value, url (smart href || src) (use $.urlTag)
  //? for html attributes
  // may call existing jqalt methods

  //todo: add html and text methods for getting and setting an elements content

  //todo: test class methods

  // add a list of classes to an html element
  //
  // pass the first arg as a callback function, to detect when a class changes
  addClass(cb){
    if(typeof cb === 'function'){
      //todo: detect when a class is added
      // include classname in callback
      // if no keys specified, use any key
      // may also include old and new classlist
      return this;
    }

    this.each((elm, index) => {
      elm.classList.add(...arguments);
    });

    return this;
  }

  // remove a list of classes from an html element
  //
  // pass the first arg as a callback function, to detect when a class changes
  delClass(cb){
    if(typeof cb === 'function'){
      //todo: detect when a class is removed
      // include classname in callback
      // if no keys specified, use any key
      // may also include old and new classlist
      return this;
    }

    this.each((elm, index) => {
      elm.classList.remove(...arguments);
    });

    return this;
  }

  // toggle a list of classes in an html element
  //
  // pass the first arg as a callback function, to detect when a class changes
  toggleClass(cb){
    if(typeof cb === 'function'){
      //todo: detect when a class is changed
      // include classname in callback
      // if no keys specified, use any key
      // may also include old and new classlist
      // include change type (add || del)
      return this;
    }

    this.each((elm, index) => {
      for(let arg of arguments){
        elm.classList.toggle(arg);
      }
    });

    return this;
  }

  // detect if an element has a class or list of classes
  //
  // note: this method only checks the first jqalt element
  hasClass(){
    //todo: consider replacing first element checks, with all element checks
    // also consider for other elements
    const elm = this.elm(0)[0];

    let hasClass = arguments.length !== 0;
    for(let arg of arguments){
      if(!elm.classList.contains(arg)){
        hasClass = false;
        break;
      }
    }

    return hasClass;
  }

  //todo: add append and moving methods
}

;(function(){
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
      case 'int':
        return 'number';
      case 'bool':
        return 'boolean';
      case 'obj':
        return 'object';
      case 'arr':
      case 'list':
        return 'array';
      case 'void':
      case 'func':
      case 'fn':
      case 'cb':
      case 'callback':
        return 'function';
      case 'regex':
      case 'reg':
        return 'regexp';
      case 'elm':
      case 'elem':
        return 'element';
      case 'nil':
        return 'null';
      default:
        return t.toLowerCase();        
    }
  }


  //* main method
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


  //* common document elements
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


  //* common methods

  // get the typeof a variable, with some additional common instanceof types
  // will also return: array, nan, null, regex, element (jqalt), nodelist, node
  //
  // add a second arg to return true if a type matches a given value
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

  // return true if an variable is a typeof jqalt element
  $.isElement = function(v){
    return !!(v instanceof Element);
  };

  // return true if an element matches a selector
  $.isQuery = function(elm, sel){
    if(typeof elm === 'string'){[elm, sel] = [sel, elm];}
    if(typeof sel !== 'string' || sel === ''){return true;}

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
      if(key === '.' && !elm.classList?.contains(value)){
        match = false;
      }else if(key === '#' && elm.id !== value){
        match = false;
      }else if(key === '' && elm.tagName?.toLowerCase() !== value.toLowerCase()){
        match = false;
      }
    });

    return match;
  };

  // call a function when the DOM is ready
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

  // fetch data from the server
  // this uses the modern 'fetch' method as an alternative to ajax
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

  // import and load a stylesheet if its not already loaded
  $.style = function(href){
    if(!$('link[rel="stylesheet"]').hasAttr('href', href)){
      $.head.append(`<link rel="stylesheet" href="${href.replace(/"/g, '&quot;')}">`);
    }
  };

  // import and load a script if its not already loaded
  $.script = function(src){
    if(!$('script').hasAttr('src', src)){
      $.head.append(`<script src="${src.replace(/"/g, '&quot;')}"></script>`);
    }
  };


  // ensure a function, given the same id, will only run once
  const ranFunctions = [];
  $.once = function(id, cb){
    if(typeof id === 'function'){[id, cb] = [cb, id];}
    if(ranFunctions[id]){
      return;
    }
    if(id === undefined){
      id = Date.now().toString() + '.' + Math.floor(Math.random() * 10000).toString();
    }
    ranFunctions[id.toString()] = true;
    cb();
  };

  // run a callback on an interval
  // you can also limit how many times the interval cn run
  // optional stop method passed for stopping the interval
  $.loop = function(ms, cb, limit){
    [ms, cb, limit] = $.sort([ms, 'num'], [cb, 'func'], [limit, 'num']);
    if(typeof cb !== 'function'){
      return undefined;
    }
    if(typeof limit !== 'number'){
      limit = null;
    }

    function stop(){
      clearInterval(interval);
    }

    const interval = setInterval(function(){
      cb.call(limit, stop);
      if(limit === null && --limit <= 0){
        clearInterval(interval);
      }
    }, ms);
  };

  // adds a rate limit to how frequently a method can be called
  // minimum = 2ms
  // (useful for preventing methods from double firing)
  //
  // note: set this.type to prevent changing event types in less than 250ms
  // this can help prevent multiple different event types from double firing
  // without slowing down the first event
  //
  // this method is used by the "on" and "once" jqalt methods automatically
  // and may be used by other methods where they make sense
  $.limit = function(ms, cb){
    if(typeof ms === 'function'){[ms, cb] = [cb, ms];}
    if(typeof cb !== 'function'){
      return undefined;
    }
    if(typeof ms !== 'number' || ms < 2){
      ms = 2;
    }

    let last = 0;
    let lastType = null;

    const thisCB = function(){
      let now = Date.now();
      if(now - last < ms){
        return;
      }

      // allow events to specify a type to prevent longer delays across multiple events
      // this allows the event to fire rapidly within a short time, while also preventing
      // duplicates across different events
      //
      // example: if both mousedown and touchstart are triggered, the method should
      // only run for one of these 2 events, without slowing down the first event
      if(thisCB.type){
        if(thisCB.type !== lastType && now - last < 250){
          return;
        }
        lastType = thisCB.type;
      }

      last = now;
      cb.call(this, ...arguments);
    };

    return thisCB;
  };

  // sorts function arguments by type
  // (useful for adding dynamic argument order to a function)
  //
  // example:
  //  [arg1, arg2, arg3] = $.sort([arg1, 'str'], [arg2, 'obj', 'arr'], [arg3, 'bool'])
  //  [key, val, cb] = $.sort([key, 'str', 'num'], [val, 'str', 'obj', 'arr', 'regex'], [cb, 'func'])
  //
  // note: this method uses $.type and the fixTypeStr method to evaluate variable types and allow for
  // optional common shorthands.
  //
  //  [arg1, arg2, arg3, arg4, fallback] = $.sort(
  //    [arg1, 'str' || 'string', 'num' || 'int' || 'number', 'bool' || boolean],
  //    [arg2, 'nan', 'null' || 'nil', 'undefined'],
  //    [arg3, 'func' || 'fn' || 'void' || 'cb' || 'callback' || 'function'],
  //    [arg4, 'obj' || 'object', 'arr' || 'list' || 'array', 'regex' || 'reg' || 'regexp'],
  //    [fallback], // set no type parameters to allow any type
  //  )
  //
  // Note:
  //  I wrote this function long ago, and didn't write any documentation.
  //  I cannot remember how it works, so we will just call this a magic sort function.
  //  If it works, don't touch it.
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

  // adds a function to the Element class
  // (useful for plugins)
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

  // returns a string of the html attribute that is the url type,
  // of a given element by tag name
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
  $.urlTag = function(tag){
    if(elementUrlTagTypes.src.includes(tag)){
      return 'src';
    }else if(elementUrlTagTypes.href.includes(tag)){
      return 'href';
    }

    if(elementUrlTagTypes.other[tag]){
      return elementUrlTagTypes.other[tag];
    }

    return null;
  };

  // keeps and returns the history of the last focused elements
  // the most recent elements will be at the beginning of the array
  const focusHistory = [];
  const focusHistoryManual = [];

  const addManualFocus = $.limit(250, function(){
    if(focusHistoryManual[0] !== document.activeElement){
      focusHistoryManual.unshift(document.activeElement);
      if(focusHistoryManual.length > 10){
        focusHistoryManual.splice(10 - focusHistoryManual.length)
      }
    }
  });

  $.focus = function(index, manual){
    if(typeof index === 'boolean'){[index, manual] = [manual, index];}

    if(manual && typeof index !== 'number'){
      addManualFocus();
    }

    if(typeof index !== 'number'){index = 0;}

    if(index < 0){
      let res = null;
      index *= -1;

      if(manual){
        res = focusHistoryManual[index-1];
        focusHistoryManual.splice(0, index);
      }else{
        res = focusHistory[index-1];
        focusHistory.shift(0, index);
      }

      return res;
    }

    if(manual){
      return focusHistoryManual[index]
    }
    return focusHistory[index];
  };

  setInterval(function(){
    if(focusHistory[0] !== document.activeElement){
      focusHistory.unshift(document.activeElement);
      if(focusHistory.length > 10){
        focusHistory.splice(10 - focusHistory.length)
      }
    }
  }, 250);


  //* export
  window.$ = Object.freeze($);
  window.jqalt = Object.freeze($);
  window.jqAlt = Object.freeze($);
})();
