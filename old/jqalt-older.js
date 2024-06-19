;$ = (function(){

  class Element extends Array {
    dataStorage = {};

    data(key, value){
      if(typeof key === 'object'){
        const k = Object.keys(key);
        for(let i = 0; i < k.length; i++){
          this.dataStorage[k[i]] = key[k[i]];
        }
      }else if(value !== undefined && value != null){
        this.dataStorage[key] = value;
      }else{
        return this.dataStorage[key];
      }
      return this;
    }

    removeData(key){
      if(Array.isArray(key)){
        key.forEach(k => {
          delete this.dataStorage[k];
        });
      }else{
        delete this.dataStorage[key];
      }
      return this;
    }

    hasData(key){
      if(Array.isArray(key)){
        for(let i = 0; i < key.length; i++){
          if(this.dataStorage[key[i]]){
            return true;
          }
        }
        return false;
      }
      return this.dataStorage[key] !== undefined;
    }

    cloneData(elm){
      let e = new Element(elm);
      e.dataStorage = this.dataStorage;
      return e;
    }


    each(sel, cb){
      if(typeof sel === 'function'){
        cb = sel;
        sel = undefined;
      }

      this.forEach(elm => {
        if(elm != null){
          if(sel){
            elm.querySelectorAll(sel).forEach(e => {
              cb.call(this.cloneData(e), e);
            });
          }else{
            cb.call(this.cloneData(elm), elm);
          }
        }
      });
      return this;
    }

    loop(interval, sel, cb){
      if(typeof sel === 'function'){
        cb = sel;
        sel = undefined;
      }

      interval = Number(interval) || 100;

      if(sel !== undefined && sel != null){
        setInterval(() => {
          this.forEach(elm => {
            if(elm != null){
              elm.querySelectorAll(sel).forEach(e => {
                cb.call(this.cloneData(e), e);
              });
            }
          });
        }, interval);

        this.forEach(elm => {
          if(elm != null){
            let elem = new Element(elm);
            let i = setInterval(() => {
              if(elm == null || elem[0] == null){
                clearInterval(i);
                return;
              }
              elm.querySelectorAll(sel).forEach(e => {
                cb.call(elem.cloneData(e), e);
              });
            }, interval);
          }
        });
      }else{
        this.forEach(elm => {
          if(elm != null){
            let elem = new Element(elm);
            let i = setInterval(() => {
              if(elm == null || elem[0] == null){
                clearInterval(i);
                return;
              }
              cb.call(elem, elm);
            }, interval);
          }
        });
      }
      return this;
    }

    on(event, cbOrSel, cb){
      if(!Array.isArray(event)){
        event = [event];
      }
      if(typeof cbOrSel === 'function'){
        this.each(elm => {
          for(let i = 0; i < event.length; i++){
            elm.addEventListener(event[i], e => {
              cbOrSel.call(this.cloneData(elm), e);
            }, {passive: false});
          }
        });
        return this;
      }else{
        this.each(elm => {
          for(let i = 0; i < event.length; i++){
            elm.addEventListener(event[i], e => {
              if(e.target.matches(cbOrSel)){
                cb.call(this.cloneData(elm), e);
              }
            }, {passive: false});
          }
        });
      }
      return this;
    }

    onStop(event, cbOrSel, cb){
      if(typeof cbOrSel === 'function'){
        this.on(event, function(e){
          if(!this.hasData('lastEventTime')){
            this.data('lastEventTime', new Date().getTime());
            let interval = setInterval(() => {
              if((new Date().getTime()) > this.data('lastEventTime') + 100){
                cbOrSel.call(this, e);
                this.removeData('lastEventTime');
                clearInterval(interval);
              }
            }, 100);
          }
          this.data('lastEventTime', new Date().getTime());
        });
      }else{
        this.on(event, cbOrSel, function(e){
          if(!this.hasData('lastEventTime')){
            this.data('lastEventTime', new Date().getTime());
            let interval = setInterval(() => {
              if((new Date().getTime()) > this.data('lastEventTime') + 100){
                cb.call(this, e);
                this.removeData('lastEventTime');
                clearInterval(interval);
              }
            }, 100);
          }
          this.data('lastEventTime', new Date().getTime());
        });
      }
      return this;
    }

    onIdle(event, cbOrSel, cbOrInterval, interval){
      if(typeof cbOrSel === 'function'){
        this.data('lastEventTime', new Date().getTime() + 100).each(() => {
          this.on(event, () => {
            this.data('lastEventTime', new Date().getTime());
          });
          let loop = setInterval(() => {
            if((new Date().getTime()) > this.data('lastEventTime') + (cbOrInterval || 1000)){
              this.data('lastEventTime', new Date().getTime());
              cbOrSel.call(this, {stop: function(){clearInterval(loop)}});
            }
          }, 10);
        });
      }else{
        this.data('lastEventTime', new Date().getTime() + 100).each(() => {
          this.on(event, cbOrSel, () => {
            this.data('lastEventTime', new Date().getTime());
          });
          let loop = setInterval(() => {
            if((new Date().getTime()) > this.data('lastEventTime') + (interval || 1000)){
              this.data('lastEventTime', new Date().getTime());
              cbOrInterval.call(this, {stop: function(){clearInterval(loop)}});
            }
          }, 10);
        });
      }
      return this;
    }

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

    next(){
      return this.map(e => e.nextElementSibling).filter(e => e != null);
    }

    previous(){
      return this.map(e => e.previousElementSibling).filter(e => e != null);
    }

    removeClass(className){
      this.forEach(e => e.classList.remove(className));
      return this;
    }

    addClass(className){
      this.forEach(e => e.classList.add(className));
      return this;
    }

    hasClass(className){
      for(let i = 0; i < this.length; i++){
        if(this[i] != null){
          if(this[i].classList.has(className)){
            return true;
          }
        }
      }
      return false;
    }

    css(prop, value){
      if(typeof prop === 'object'){
        let props = Object.keys(prop);
        this.forEach(e => {
          for(let i = 0; i < props.length; i++){
            e.style[props[i]] = prop[props[i]];
          }
        });
      }else if(value == null){
        return this[0].style[prop];
      }else{
        this.forEach(e => e.style[prop] = value);
      }
      return this;
    }

    html(html){
      if(typeof html === 'string'){
        this.forEach(elm => elm.innerHTML = html);
      }else if(typeof html === 'function'){
        this.forEach(elm => elm.innerHTML = html.call(this.cloneData(elm)));
      }else{
        return this[0].innerHTML;
      }
      return this;
    }

    text(text){
      if(typeof text === 'string'){
        this.forEach(elm => elm.textContent = text);
      }else if(typeof text === 'function'){
        this.forEach(elm => elm.textContent = text.call(this.cloneData(elm)));
      }else{
        return this[0].textContent;
      }
      return this;
    }

    attr(attr, value){
      if(typeof attr === 'object'){
        const a = Object.keys(attr);
        for(let i = 0; i < a.length; i++){
          this.forEach(e => e.setAttribute(a[i], attr[a[i]]));
        }
      }else if(value !== undefined && value != null){
        if(typeof value === 'object' || Array.isArray(value)){
          value = JSON.stringify(value);
        }
        this.forEach(e => e.setAttribute(attr, value));
      }else{
        let val = this[0].getAttribute(attr);
        if(typeof val === 'string'){
          if(val.toLowerCase() === 'true'){
            return true;
          }else if(val.toLowerCase() === 'false'){
            return false;
          }else if(!isNaN(Number(val))){
            return Number(val);
          }else if((val.includes('{') && val.includes('}')) || (val.includes('[') && val.includes(']'))){
            try{
              return JSON.parse(val);
            }catch(e){}
          }
        }
        return val;
      }
      return this;
    }

    removeAttr(attr){
      if(Array.isArray(attr)){
        attr.forEach(a => {
          this.forEach(e => e.removeAttribute(a));
        });
      }else{
        this.forEach(e => e.removeAttribute(attr));
      }
      return this;
    }

    hasAttr(attr, value){
      if(value !== undefined){value = value.toString();}
      if(Array.isArray(attr)){
        for(let a = 0; a < attr.length; a++){
          for(let i = 0; i < this.length; i++){
            if(this[i].hasAttribute(attr[a]) && (value === undefined || this[i].getAttribute(attr[a]) === value)){
              return true;
            }
          }
        }
      }else{
        for(let i = 0; i < this.length; i++){
          if(this[i].hasAttribute(attr) && (value === undefined || this[i].getAttribute(attr) === value)){
            return true;
          }
        }
      }
      return false;
    }

    get(i = 0){
      if(i < 0){
        return this.cloneData(this[this.length + i]);
      }
      return this.cloneData(this[i]);
    }

    width(){
      if(this[0] === window || this[0] === document){
        return window.innerWidth;
      }
      return this[0].clientWidth || this[0].offsetWidth;
    }

    height(){
      if(this[0] === window || this[0] === document){
        return window.innerHeight;
      }
      return this[0].clientHeight || this[0].offsetHeight;
    }

    offset(){
      if(this[0] === window || this[0] === document){
        return {
          width: window.innerWidth,
          height: window.innerHeight
        };
      }
      return {
        width: this[0].offsetWidth,
        height: this[0].offsetHeight
      }
    }

    scroll(cbOrYOrX, y){
      function handleNumber(elem, x, y){
        if(typeof y === 'undefined' || y == null){
          y = x;
          x = 0;
        }
        if(typeof x === 'undefined' || x == null){
          return false;
        }

        if(typeof y === 'string' && y.endsWith('%') && typeof x === 'string' && x.endsWith('%')){
          y = Number(y.replace(/^([^0-9]+(?:\.[0-9]+)).*/s, '$1'));
          x = Number(x.replace(/^(-?[^0-9]+(?:\.[0-9]+)).*/s, '$1'));
          elem.forEach(elm => {
            if(elm === window || elm === document){
              y = y * window.innerHeight / 100;
              x = x * window.innerWidth / 100;
              window.scrollBy(x, y);
            }else{
              y = y * elm.clientHeight / 100;
              x = x * elm.clientWidth / 100;
              elm.scrollBy(x, y);
            }
          });
          return true;
        }
        if(typeof y === 'string' && !y.endsWith('%')){
          y = Number(y.replace(/^([^0-9]+(?:\.[0-9]+)).*/s, '$1'));
        }
        if(typeof x === 'string' && !x.endsWith('%')){
          x = Number(x.replace(/^([^0-9]+(?:\.[0-9]+)).*/s, '$1'));
        }
        if(typeof y === 'string' && y.endsWith('%')){
          y = Number(y.replace(/^([^0-9]+(?:\.[0-9]+)).*/s, '$1'));
          elem.forEach(elm => {
            if(elm === window || elm === document){
              y = y * window.innerHeight / 100;
              window.scrollBy(Number(x) || 0, y);
            }else{
              y = y * elm.clientHeight / 100;
              elm.scrollBy(Number(x) || 0, y);
            }
          });
          return true;
        }
        if(typeof x === 'string' && x.endsWith('%')){
          x = Number(x.replace(/^([^0-9]+(?:\.[0-9]+)).*/s, '$1'));
          elem.forEach(elm => {
            if(elm === window || elm === document){
              x = x * window.innerWidth / 100;
              window.scrollBy(x, y);
            }else{
              x = x * elm.clientWidth / 100;
              elm.scrollBy(x, y);
            }
          });
          return true;
        }
        if(typeof y === 'number'){
          elem.forEach(elm => {
            if(elm === window || elm === document){
              window.scrollBy(Number(x) || 0, y);
            }else{
              elm.scrollBy(Number(x) || 0, y);
            }
          });
          return true;
        }
        return false;
      }
      if(handleNumber(this, cbOrYOrX, y)){
        return this;
      }

      if(typeof cbOrYOrX === 'function'){
        this.each(function(elm){
          if(elm === window || elm === document){
            window.addEventListener('scroll', e => {
              let res = cbOrYOrX.call(this.cloneData(window), e, {
                top: window.scrollY,
                left: window.scrollX,
                bottom: window.scrollY + window.innerHeight,
                right: window.scrollX + window.innerWidth,
                width: document.body.scrollHeight,
                height: document.body.scrollHeight
              });
              if(res !== undefined){
                if(Array.isArray(res)){
                  handleNumber(window, ...res);
                }else if(typeof res === 'object'){
                  handleNumber(window, res.x || 0, res.y || 0);
                }else{
                  handleNumber(window, res);
                }
              }
            });
          }else{
            this.on('scroll', function(e){
              let res = cbOrYOrX.call(this, e, {
                top: e.target.scrollTop,
                left: e.target.scrollLeft,
                bottom: e.target.scrollTop + e.target.clientHeight,
                right: e.target.scrollLeft + e.target.clientWidth,
                width: e.target.scrollWidth,
                height: e.target.scrollHeight
              });
              if(res !== undefined){
                if(Array.isArray(res)){
                  handleNumber(this, ...res);
                }else if(typeof res === 'object'){
                  handleNumber(this, res.x || 0, res.y || 0);
                }else{
                  handleNumber(this, res);
                }
              }
            });
          }
        });
        return this;
      }

      if(this[0] === window || this[0] === document){
        return {
          top: window.scrollY,
          left: window.scrollX,
          bottom: window.scrollY + window.innerHeight,
          right: window.scrollX + window.innerWidth,
          width: document.body.scrollHeight,
          height: document.body.scrollHeight
        };
      }
      return {
        top: this[0].scrollTop,
        left: this[0].scrollLeft,
        bottom: this[0].scrollTop + this[0].clientHeight,
        right: this[0].scrollLeft + this[0].clientWidth,
        width: this[0].scrollWidth,
        height: this[0].scrollHeight
      };
    }

    scrollTo(elmOrYOrXOrI, yOrI){
      function handleNumber(elem, x, y){
        if(typeof y === 'undefined' || y == null){
          y = x;
          x = 0;
        }
        if(typeof x === 'undefined' || x == null){
          return false;
        }

        if(typeof y === 'string' && y.endsWith('%') && typeof x === 'string' && x.endsWith('%')){
          y = Number(y.replace(/^([^0-9]+(?:\.[0-9]+)).*/s, '$1'));
          x = Number(x.replace(/^(-?[^0-9]+(?:\.[0-9]+)).*/s, '$1'));
          elem.forEach(elm => {
            if(elm === document){elm = window;}
            elm = this.cloneData(elm);
            y = y * elm.height() / 100;
            x = x * elm.width() / 100;
            elm[0].scrollTo(x, y);
          });
          return true;
        }
        if(typeof y === 'string' && !y.endsWith('%')){
          y = Number(y.replace(/^([^0-9]+(?:\.[0-9]+)).*/s, '$1'));
        }
        if(typeof x === 'string' && !x.endsWith('%')){
          x = Number(x.replace(/^([^0-9]+(?:\.[0-9]+)).*/s, '$1'));
        }
        if(typeof y === 'string' && y.endsWith('%')){
          y = Number(y.replace(/^([^0-9]+(?:\.[0-9]+)).*/s, '$1'));
          elem.forEach(elm => {
            if(elm === document){elm = window;}
            elm = this.cloneData(elm);
            y = y * elm.height() / 100;
            elm[0].scrollTo(x, y);
          });
          return true;
        }
        if(typeof x === 'string' && x.endsWith('%')){
          x = Number(x.replace(/^([^0-9]+(?:\.[0-9]+)).*/s, '$1'));
          elem.forEach(elm => {
            if(elm === document){elm = window;}
            elm = this.cloneData(elm);
            x = x * elm.width() / 100;
            elm[0].scrollTo(x, y);
          });
          return true;
        }
        if(typeof y === 'number'){
          elem.forEach(elm => {
            if(elm === document){elm = window;}
            elm.scrollTo(Number(x) || 0, y);
            //scrollAnim(elm, Number(x) || 0, y);
          });
          return true;
        }
        return false;
      }
      if(handleNumber(this, elmOrYOrXOrI, yOrI)){
        return this;
      }

      if(typeof elmOrYOrXOrI === 'number'){
        if(this[elmOrYOrXOrI] === window || this[elmOrYOrXOrI] === document){
          window.scrollTo(0);
        }else{
          this[elmOrYOrXOrI].scrollIntoView();
        }
        return this;
      }

      if(elmOrYOrXOrI){
        if(!Number(yOrI)){
          yOrI = 0;
        }
        this.forEach(elm => {
          let e = elm.querySelectorAll(elmOrYOrXOrI)[yOrI];
          if(e === window || e === document){
            window.scrollTo(0);
          }else{
            e.scrollIntoView();
          }
        });
        return this;
      }

      if(this[0] === window || this[0] === document){
        window.scrollTo(0);
      }else{
        this[0].scrollIntoView();
      }

      return this;
    }

    parent(){
      return new Element(this[0].parentNode);
    }

    child(elmOrIndex, index, node = true){
      if(!this[0].children.length){
        return null;
      }
      if(!elmOrIndex){
        return new Element(this[0].firstElementChild);
      }
      if(typeof elmOrIndex === 'number'){
        if(node && !this[0].hasChildNodes){
          return null;
        }
        if(elmOrIndex === 0){
          return new Element(this[0].firstElementChild);
        }else if(elmOrIndex === -1){
          return new Element(this[0].lastElementChild);
        }else{
          let elms = node ? this[0].childNodes : this[0].children;
          if(elmOrIndex < 0){
            elmOrIndex = elms.length + elmOrIndex;
          }
          if(elmOrIndex < 0){
            return null;
          }
          return new Element(elms[elmOrIndex]);
        }
      }else if(typeof elmOrIndex === 'string' && index === undefined && node){
        return new Element(...this[0].querySelectorAll(elmOrIndex));
      }else if(typeof elmOrIndex === 'string'){
        let elms = node ? this[0].childNodes : this[0].children;
        if(index === 0){
          for(let i = 0; i < elms.length; i++){
            if(e.tag && e.tag.toLowerCase() === elmOrIndex.toLowerCase()){
              return new Element(elms[i]);
            }
          }
          return null;
        }else if(index === -1){
          for(let i = elms.length - 1; i >= 0; i--){
            if(e.tag && e.tag.toLowerCase() === elmOrIndex.toLowerCase()){
              return new Element(elms[i]);
            }
          }
          return null;
        }
        elms.filter(e => {
          if(!e.tag){
            return false;
          }
          return e.tag.toLowerCase() === elmOrIndex.toLowerCase();
        });
        if(!index){
          return new Element(...elms);
        }else if(index < 0){
          index = elms.length + index;
        }
        if(index < 0){
          return null;
        }
        return new Element(elms[index]);
      }
      return node ? new Element(...this[0].childNodes) : new Element(...this[0].children);
    }

    clone(node = true){
      return new Element(this[0].cloneNode);
    }

    append(elm, ref){
      let elms = [];
      if(typeof elm === 'string'){
        elm.replace(/<([\w_$-]+)(?:\s+(.*?))>((?:<\1(?:\s+.*?)>(?:.*?<\/\1>|.)*?)<\/\1>|)/gs, function(_, tag, attrs, html){
          let e = document.createElement(tag);
          attrs.replace(/([\w_$-]+)=([\w_$-]+|"(?:\\[\\"]|.)*?"|'(?:\\[\\']|.)*?')/gs, function(_, key, value){
            value = value.replace(/^(["'])(.*)\1$/, '$2');
            if(key.toLowerCase() === 'class'){
              e.classList.add(value);
            }else{
              e[key] = value;
            }
          });
          e.innerHTML = html;
          elms.push(e);
        });
      }else if(Array.isArray(elm)){
        elms = elm;
      }else{
        elms = [elm];
      }

      if(ref){
        if(typeof ref === 'string'){
          ref = e.querySelector(ref);
        }else if(ref instanceof Element){
          ref = ref[0];
        }else if(ref === document || ref === window){
          ref = null;
        }
      }

      this.forEach(e => {
        if(ref){
          for(let i = 0; i < elms.length; i++){
            e.insertBefore(elms[i], ref.nextElementSibling);
          }
        }else{
          for(let i = 0; i < elms.length; i++){
            e.appendChild(elms[i]);
          }
        }
      });
      return this;
    }

    prepend(elm, ref){
      let elms = [];
      if(typeof elm === 'string'){
        elm.replace(/<([\w_$-]+)(?:\s+(.*?))>((?:<\1(?:\s+.*?)>(?:.*?<\/\1>|.)*?)<\/\1>|)/gs, function(_, tag, attrs, html){
          let e = document.createElement(tag);
          attrs.replace(/([\w_$-]+)=([\w_$-]+|"(?:\\[\\"]|.)*?"|'(?:\\[\\']|.)*?')/gs, function(_, key, value){
            value = value.replace(/^(["'])(.*)\1$/, '$2');
            if(key.toLowerCase() === 'class'){
              e.classList.add(value);
            }else{
              e[key] = value;
            }
          });
          e.innerHTML = html;
          elms.push(e);
        });
      }else if(Array.isArray(elm)){
        elms = elm;
      }else{
        elms = [elm];
      }

      if(ref){
        if(typeof ref === 'string'){
          ref = e.querySelector(ref);
        }else if(ref instanceof Element){
          ref = ref[0];
        }else if(ref === document || ref === window){
          ref = null;
        }
      }

      this.forEach(e => {
        if(ref){
          for(let i = 0; i < elms.length; i++){
            e.insertBefore(elms[i], ref);
          }
        }else if(e.hasChildNodes()){
          let r = e.firstElementChild;
          for(let i = 0; i < elms.length; i++){
            e.insertBefore(elms[i], r);
          }
        }else{
          for(let i = 0; i < elms.length; i++){
            e.append(elms[i]);
          }
        }
      });
      return this;
    }


    tag(value){
      if(typeof value === 'string'){
        this.forEach((elm, i) => {
          let par = elm.parentNode;
          let newElm = document.createElement(value);
          [...elm.attributes].forEach(key => {
            newElm.setAttribute(key.name, key.value);
          });
          par.insertBefore(newElm, elm);
          elm.remove();
          this[i] = newElm;
        });
        return this;
      }else{
        return this[0].tag;
      }
    }

    type(value){
      if(value === '' || value === null){
        return this.removeAttr('type');
      }
      return this.attr('type', value);
    }

    name(value){
      if(value === '' || value === null){
        return this.removeAttr('name');
      }
      return this.attr('name', value);
    }

    id(value){
      if(value === '' || value === null){
        return this.removeAttr('id');
      }
      return this.attr('id', value);
    }

    value(value){
      if(value === '' || value === null){
        return this.removeAttr('value');
      }
      return this.attr('value', value);
    }

    val(value){
      return this.value(value);
    }

    src(value){
      if(value === '' || value === null){
        return this.removeAttr('src');
      }
      return this.attr('src', value);
    }

    href(value){
      if(value === '' || value === null){
        return this.removeAttr('href');
      }
      return this.attr('href', value);
    }


    do(cb){
      cb.call(this);
    }

    animation(data, cb){
      if(typeof data === 'function'){
        cb = data;
        data = {};
      }
      this.forEach(elm => {
        let animData = {...data};
        let anim = () => {
          let r = cb.call(this.cloneData(elm), animData);
          if(!r){
            window.requestAnimationFrame(anim);
          }else if(typeof r === 'number'){
            setTimeout(function(){
              window.requestAnimationFrame(anim);
            }, r);
          }
        };
        window.requestAnimationFrame(anim);
      });
    }

  }


  function $(param, elm = document){
    function querySelector(param){
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

    if(typeof param === 'string'){
      return new Element(...querySelector(param));
    }else if(!(param instanceof Element) && Array.isArray(param)){
      let arr = [];
      param.forEach(p => {
        if(typeof p === 'string'){
          arr.push(...querySelector(p));
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
  }


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
    'audio': 'video/mp4; charset=UTF-8',
    'video': 'video/mp4; charset=UTF-8',
    'mp4': 'video/mp4; charset=UTF-8',
    'mov': 'video/mov; charset=UTF-8',
    'mp3': 'audio/mp3; charset=UTF-8',
    'wav': 'audio/wav; charset=UTF-8',
    'ogg': 'audio/ogg; charset=UTF-8',
  };

  $.fetch = function(url, data = {}, cb = () => {}, {method = 'GET', timeout = 0, type = 'json'}){
    let timedOut = false;
    method = method.toUpperCase();

    const headers = {
      method: method,
      headers: {
        'Content-Type': ajaxContentTypes[type.toLowerCase()] || type
      }
    }

    if(method === 'GET'){
      url = url+'?'+Object.entries(data).map(([key, value]) => {
        return `${key}=${value}`;
      }).join('&');
    }else if(method === 'POST'){
      method.body = JSON.stringify(data);
    }else if(method === 'HEAD'){
      method.head = JSON.stringify(data);
    }

    fetch(url, headers).then(res => {
      if(timedOut){return null;}
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
      let isJSON = (type === 'json');
      if(isJSON && !((typeof data.content === 'object' && !(data.content instanceof Error) || Array.isArray(data.content)))){
        try{
          data.content = JSON.parse(data.content);
        }catch(e){isJSON = false;}
      }
      cb.call({success: true, isJSON, ...data.info}, data.content);
    }).catch(e => {
      if(timedOut){return null;}
      if(type === 'json' && !((typeof e === 'object' && !(e instanceof Error)) || Array.isArray(e))){
        e = {error: e};
      }
      cb.call({success: false, isJSON: (type === 'json'), ok: false}, e);
    });

    if(setTimeout > 0){
      setTimeout(function(){
        timedOut = true;
        let res = 'Request Timed Out';
        if(type === 'json'){
          res = {error: res};
        }
        cb.call({success: false, isJSON: (type === 'json'), timedOut: true, ok: false}, res);
      }, timeout);
    }

    return this;
  }

  $.async = async function(cb){
    await cb();
  };


  $.animation = function(data, cb){
    if(typeof data === 'function'){
      cb = data;
      data = {};
    }
    function anim(){
      let r = cb.call(data, data);
      if(!r){
        window.requestAnimationFrame(anim);
      }else if(typeof r === 'number'){
        setTimeout(function(){
          window.requestAnimationFrame(anim);
        }, r);
      }
    }
    window.requestAnimationFrame(anim);
  };

  $.addStyle = function(href){
    if(!$('link[rel="stylesheet"]').hasAttr('href', href)){
      $('head').append(`<link rel="stylesheet" href="${href.replace(/"/g, '&quot;')}">`);
    }
  };

  $.addScript = function(src){
    if(!$('script').hasAttr('src', src)){
      $('head').append(`<script src="${src.replace(/"/g, '&quot;')}"></script>`);
    }
  };

  $.isElement = function(v){
    return !!(v instanceof Element);
  };


  const ranFunctions = [];
  $.once = function(id, cb){
    if(ranFunctions[id]){
      return;
    }
    ranFunctions[id] = true;
    cb();
  };

  $.type = function(value){
    if(value instanceof Element){
      return 'element';
    }else if(value instanceof NodeList){
      return 'nodelist';
    }else if(value instanceof Node){
      return 'node';
    }else if(value instanceof RegExp){
      return 'regex';
    }else if(Array.isArray(value)){
      return 'array';
    }else if((typeof value === 'number' && isNaN(value))){
      return 'nan';
    }else if(value === null){
      return 'null';
    }else if(typeof value === 'boolean'){
      return 'bool';
    }
    return typeof value;
  }

  $.sortAttrs = function(){
    let result = {};
    let cb;
    if(typeof arguments[arguments.length-1] === 'function'){
      cb = arguments.pop;
    }
    for(let i = 0; i < arguments.length; i++){
      if(arguments[i].type === undefined){
        result[(arguments[i].name || i)] = arguments[i].value;
        arguments[i].used = true;
        continue;
      }
      let type = $.type(arguments[i].value);
      if(type === arguments[i].type || (Array.isArray(arguments[i].type) && arguments[i].type.includes(type))){
        result[(arguments[i].name || i)] = arguments[i].value;
        arguments[i].used = true;
      }else{
        for(let j = 0; j < arguments.length; j++){
          if(arguments[j].used || j === i){continue;}
          let type = $.type(arguments[j].value);
          if(type === arguments[i].type || (Array.isArray(arguments[i].type) && arguments[i].type.includes(type))){
            result[(arguments[i].name || i)] = arguments[j].value;
            arguments[j].used = true;
            break;
          }
        }
        if(result[(arguments[i].name || i)] === undefined){
          result = arguments[i].default;
        }
      }
    }
    if(cb){
      return cb(...result);
    }
    return result;
  };


  $.addMethod = function(name, cb){
    if(!Element.prototype[name]){
      Element.prototype[name] = cb;
      return true;
    }
    return false;
  }

  return $;
})();

Object.freeze($);
