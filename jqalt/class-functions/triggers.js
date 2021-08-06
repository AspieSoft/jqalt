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
});


$.addMethod('on', function(event, sel, cb){
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
});

$.addMethod('do', 'trigger', function(event, opts = {}){
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
});
