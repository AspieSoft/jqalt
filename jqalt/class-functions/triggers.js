import { func, callFunc, fromElm, getQuery } from '../functions.js'
import {$} from '../selector.js'


$.addMethod('ready', function(cb){
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
});


$.addMethod('each', function(sel, cb){
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
});

$.addMethod('loop', function(ms, sel, cb, limit){
  [ms, sel, cb, limit] = $.sort([ms, 'num'], [sel, 'str', 'arr', 'elm'], [cb, 'func'], [limit, 'num']);
  this.forEach(elm => {
    if(elm != null){
      if(sel){
        getQuery(sel, elm).forEach(e => {
          function stop(){clearInterval(interval);}
          let callback = func(cb, [fromElm(this, e),,{stop}]);

          const interval = setInterval(() => {
            callback.call(limit);
            if(limit !== undefined && --limit <= 0){
              clearInterval(interval);
            }
          }, ms);
        });
      }else{
        function stop(){clearInterval(interval);}
        let callback = func(cb, [fromElm(this, elm),,{stop}]);

        const interval = setInterval(() => {
          callback.call(limit);
          if(limit !== undefined && --limit <= 0){
            clearInterval(interval);
          }
        }, ms);
      }
    }
  });
  return this;
});


$.addMethod('on', function(event, sel, cb){
  if(typeof sel === 'function'){
    [sel, cb] = [cb, sel];
  }
  if(!Array.isArray(event)){
    event = event.split(' ');
  }

  if(typeof cb !== 'function'){return this;}

  if(sel){
    this.forEach(elm => {
      for(let i = 0; i < event.length; i++){
        elm.addEventListener(event[i], e => {
          if($.isQuery(e.target, sel)){
            callFunc(cb, fromElm(this, elm), e);
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
});

$.addMethod('do', 'trigger', function(event, sel, opts = {}){
  if(typeof sel === 'object' && !Array.isArray(sel)){
    [event, opts] = [opts, event];
  }
  if(!Array.isArray(event)){event = [event];}
  this.forEach(elm => {
    for(let i = 0; i < event.length; i++){
      if($.isQuery(elm, sel)){
        elm.dispatchEvent(new Event(event[i], opts));
      }
    }
  });
  return this;
});

//todo: build is function to run .matches
$.addMethod('is', function(sel, cb){
  if(typeof sel === 'function'){
    [sel, cb] = [cb, sel];
  }

  let selIsArr = Array.isArray(sel);

  let matches = [];
  this.forEach((e, index) => {
    if(selIsArr){
      let m = false;
      for(let i in sel){
        if(e.matches(sel[i])){
          m = true;
        }
      }
      if(m){
        matches.push(index);
      }
    }else if(e.matches(sel)){
      matches.push(index);
    }
  });

  if(!matches.length){
    matches = false;
  }

  if(cb){
    callFunc(cb, this, matches);
    return this;
  }

  return matches;
});


//todo: test onStop and onIdle functions

$.addMethod('onStop', function(event, sel, cb, delay){
  [sel, cb, delay] = $.sort([sel, 'str'], [cb, 'func'], [delay, 'num']);
  if(!Array.isArray(event)){
    event = [event];
  }
  if(!delay){delay = 1000;}

  if(typeof cb !== 'function'){return this;}

  if(sel){
    this.forEach(elm => {
      for(let i = 0; i < event.length; i++){
        let lastRan = undefined;
        let ev = undefined;
        setInterval(function(){
          if(lastRan === undefined){return;}
          let now = (new Date().getTime());
          if(now - delay > lastRan){
            callFunc(cb, fromElm(this, elm), ev, (now - lastRan));
            lastRan = undefined;
          }
        }, Math.min(100, delay));
        elm.addEventListener(event[i], e => {
          if($.isQuery(e.target, sel)){
            ev = e;
            lastRan = (new Date().getTime());
          }
        }, {passive: false});
      }
    });
    return this;
  }
  this.forEach(elm => {
    for(let i = 0; i < event.length; i++){
      let lastRan = undefined;
      let ev = undefined;
      setInterval(function(){
        if(lastRan === undefined){return;}
        let now = (new Date().getTime());
        if(now - delay > lastRan){
          callFunc(cb, fromElm(this, elm), ev, (now - lastRan));
          lastRan = undefined;
        }
      }, Math.min(100, delay));
      elm.addEventListener(event[i], e => {
        ev = e;
        lastRan = (new Date().getTime());
      }, {passive: false});
    }
  });
  return this;
});

$.addMethod('onIdle', function(event, sel, cb, delay){
  [sel, cb, delay] = $.sort([sel, 'str'], [cb, 'func'], [delay, 'num']);
  if(!Array.isArray(event)){
    event = [event];
  }
  if(!delay){delay = 1000;}

  if(typeof cb !== 'function'){return this;}

  if(sel){
    this.forEach(elm => {
      for(let i = 0; i < event.length; i++){
        let lastRan = (new Date().getTime());
        let ev = undefined;
        setInterval(function(){
          let now = (new Date().getTime());
          if(now - delay > lastRan){
            callFunc(cb, fromElm(this, elm), ev, (now - lastRan));
          }
        }, Math.min(100, delay));
        elm.addEventListener(event[i], e => {
          if($.isQuery(e.target, sel)){
            ev = e;
            lastRan = (new Date().getTime());
          }
        }, {passive: false});
      }
    });
    return this;
  }
  this.forEach(elm => {
    for(let i = 0; i < event.length; i++){
      let lastRan = (new Date().getTime());
      let ev = undefined;
      setInterval(function(){
        let now = (new Date().getTime());
        if(now - delay > lastRan){
          callFunc(cb, fromElm(this, elm), ev, (now - lastRan));
        }
      }, Math.min(100, delay));
      elm.addEventListener(event[i], e => {
        ev = e;
        lastRan = (new Date().getTime());
      }, {passive: false});
    }
  });
  return this;
});
