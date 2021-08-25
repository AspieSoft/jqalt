import { elementUrlTagTypes, callFunc, varType, fromElm } from '../functions.js'
import {$} from '../selector.js'


$.addMethod('get', function(i, sel){
  if(typeof i !== 'number'){[i, sel] = [sel, i];}
  if(typeof i === 'function'){
    if(!sel){
      callFunc(i, fromElm(this, [...this]));
      return this;
    }
    let elms = [];
    this.forEach(e => {
      if($.isQuery(e, sel)){
        elms.push(e);
      }
    });
    callFunc(i, fromElm(this, elms));
    return this;
  }

  if(typeof sel === 'function'){
    if(i < 0){
      callFunc(this, fromElm(this, (this[this.length + i])));
      return this;
    }
    callFunc(this, fromElm(this, (this[this.length + i])));
    return this;
  }
  
  if(sel){
    let elms = [];
    this.forEach(e => {
      if($.isQuery(e, sel)){
        elms.push(e);
      }
    });
    if(i === undefined){
      return fromElm(this, elms);
    }else if(i < 0){
      return fromElm(this, (elms[elms.length + i]));
    }
    return fromElm(this, (elms[i]));
  }

  if(i === undefined){
    return fromElm(this, [...this]);
  }else if(i < 0){
    return fromElm(this, (this[this.length + i]));
  }
  return fromElm(this, (this[i]));
});


$.addMethod('width', 'clientWidth', function(sel, cb){
  if(typeof sel === 'function'){
    [sel, cb] = [cb, sel];
  }

  if(sel){
    for(let i = 0; i < this.length; i++){
      if($.isQuery(this[i], sel)){
        if(this[i] === window || this[i] === document){
          if(typeof cb === 'function'){
            callFunc(cb, fromElm(this, this[i]), window.innerWidth);
          }else{
            return window.innerWidth;
          }
        }
        if(typeof cb === 'function'){
          callFunc(cb, fromElm(this, this[i]), this[i].clientWidth || this[i].offsetWidth);
        }else{
          return this[i].clientWidth || this[i].offsetWidth;
        }
      }
    }
    return this;
  }

  if(typeof cb === 'function'){
    for(let i = 0; i < this.length; i++){
      if(this[i] === window || this[i] === document){
        if(typeof cb === 'function'){
          callFunc(cb, fromElm(this, this[i]), window.innerWidth);
        }else{
          return window.innerWidth;
        }
      }
      if(typeof cb === 'function'){
        callFunc(cb, fromElm(this, this[i]), this[i].clientWidth || this[i].offsetWidth);
      }else{
        return this[i].clientWidth || this[i].offsetWidth;
      }
    }
  }

  if(this[0] === window || this[0] === document){
    return window.innerWidth;
  }
  return this[0].clientWidth || this[0].offsetWidth;
});

$.addMethod('height', 'clientHeight', function(sel, cb){
  if(typeof sel === 'function'){
    [sel, cb] = [cb, sel];
  }

  if(sel){
    for(let i = 0; i < this.length; i++){
      if($.isQuery(this[i], sel)){
        if(this[i] === window || this[i] === document){
          if(typeof cb === 'function'){
            callFunc(cb, fromElm(this, this[i]), window.innerHeight);
          }else{
            return window.innerHeight;
          }
        }
        if(typeof cb === 'function'){
          callFunc(cb, fromElm(this, this[i]), this[i].clientHeight || this[i].offsetHeight);
        }else{
          return this[i].clientHeight || this[i].offsetHeight;
        }
      }
    }
    return this;
  }

  if(typeof cb === 'function'){
    for(let i = 0; i < this.length; i++){
      if(this[i] === window || this[i] === document){
        if(typeof cb === 'function'){
          callFunc(cb, fromElm(this, this[i]), window.innerHeight);
        }else{
          return window.innerHeight;
        }
      }
      if(typeof cb === 'function'){
        callFunc(cb, fromElm(this, this[i]), this[i].clientHeight || this[i].offsetHeight);
      }else{
        return this[i].clientHeight || this[i].offsetHeight;
      }
    }
  }

  if(this[0] === window || this[0] === document){
    return window.innerHeight;
  }
  return this[0].clientHeight || this[0].offsetHeight;
});

$.addMethod('offsetWidth', function(sel, cb){
  if(typeof sel === 'function'){
    [sel, cb] = [cb, sel];
  }

  if(sel){
    for(let i = 0; i < this.length; i++){
      if($.isQuery(this[i], sel)){
        if(this[i] === window || this[i] === document){
          if(typeof cb === 'function'){
            callFunc(cb, fromElm(this, this[i]), window.innerWidth);
          }else{
            return window.innerWidth;
          }
        }
        if(typeof cb === 'function'){
          callFunc(cb, fromElm(this, this[i]), this[i].offsetWidth || this[i].clientWidth);
        }else{
          return this[i].offsetWidth || this[i].clientWidth;
        }
      }
    }
    return this;
  }

  if(typeof cb === 'function'){
    for(let i = 0; i < this.length; i++){
      if(this[i] === window || this[i] === document){
        if(typeof cb === 'function'){
          callFunc(cb, fromElm(this, this[i]), window.innerWidth);
        }else{
          return window.innerWidth;
        }
      }
      if(typeof cb === 'function'){
        callFunc(cb, fromElm(this, this[i]), this[i].offsetWidth || this[i].clientWidth);
      }else{
        return this[i].offsetWidth || this[i].clientWidth;
      }
    }
  }

  if(this[0] === window || this[0] === document){
    return window.innerWidth;
  }
  return this[0].offsetWidth || this[0].clientWidth;
});

$.addMethod('offsetHeight', function(sel, cb){
  if(typeof sel === 'function'){
    [sel, cb] = [cb, sel];
  }

  if(sel){
    for(let i = 0; i < this.length; i++){
      if($.isQuery(this[i], sel)){
        if(this[i] === window || this[i] === document){
          if(typeof cb === 'function'){
            callFunc(cb, fromElm(this, this[i]), window.innerHeight);
          }else{
            return window.innerHeight;
          }
        }
        if(typeof cb === 'function'){
          callFunc(cb, fromElm(this, this[i]), this[i].offsetHeight || this[i].clientHeight);
        }else{
          return this[i].offsetHeight || this[i].clientHeight;
        }
      }
    }
    return this;
  }

  if(typeof cb === 'function'){
    for(let i = 0; i < this.length; i++){
      if(this[i] === window || this[i] === document){
        if(typeof cb === 'function'){
          callFunc(cb, fromElm(this, this[i]), window.innerHeight);
        }else{
          return window.innerHeight;
        }
      }
      if(typeof cb === 'function'){
        callFunc(cb, fromElm(this, this[i]), this[i].offsetHeight || this[i].clientHeight);
      }else{
        return this[i].offsetHeight || this[i].clientHeight;
      }
    }
  }

  if(this[0] === window || this[0] === document){
    return window.innerHeight;
  }
  return this[0].offsetHeight || this[0].clientHeight;
});


$.addMethod('show', function(){
  return this.css('display', '');
});

$.addMethod('hide', function(){
  return this.css('display', 'none');
});


//todo: test above functions


//todo: add scroll and scrollTo functions

//todo: add animation function (may add somewhere else)

$.addMethod('scroll', function(sel, target, ms, snap, cb, cb2, method){
  if(sel === undefined){
    return {
      x: (this[0].scrollLeft ?? this[0].pageXOffset ?? window.scrollX ?? $.body()[0].scrollLeft) || 0,
      y: (this[0].scrollTop ?? this[0].pageYOffset ?? window.scrollY ?? $.body()[0].scrollTop) || 0,
    };
  }

  if(typeof sel !== 'string'){[sel, target] = [target, sel];}
  [sel, target, ms, snap, cb, cb2, method] = $.sort([sel, 'str', 'elm'], [target, 'obj', 'arr', 'num', 'str'], [ms, 'num'], [snap, 'num'], [cb, 'func'], [cb2, 'func'], [method, 'str'])
  if(!target){target = sel;}
  if(!target && typeof cb !== 'function'){return this;}
  if(!ms){ms = 1000;}
  if(!snap){snap = 1;}else{snap = Math.abs(snap);}


  if(typeof cb === 'function'){
    this.on('scroll', sel, function(e){
      if(this.data('js-triggered-scroll')){
        return;
      }
      let scroll = {
        x: (e.target.scrollLeft ?? e.target.pageXOffset ?? window.scrollX ?? $.body()[0].scrollLeft) || 0,
        y: (e.target.scrollTop ?? e.target.pageYOffset ?? window.scrollY ?? $.body()[0].scrollTop) || 0,
      };
      let res = callFunc(cb, this, e, scroll);
      if(res !== undefined){
        this.data('js-triggered-scroll', true);
        res.done = () => {this.data('js-triggered-scroll', false);};
        this.scroll(res);
      }
    }, {passive: false});
  }

  if(target){
    function handleTarget(doc){
      let targetType = varType(target);
      if(targetType === 'array'){
        target = {x: target[0], y: target[1]};

        if(target[2]){ms = target[2];}
        if(target[3]){snap = target[3];}
        if(target[4]){cb2 = target[4];}

        targetType = 'object';
      }else if(targetType === 'number'){
        target = {x: null, y: targetType};
        targetType = 'object';
      }

      if(targetType === 'string'){
        let targetElm = $(target);

        if(targetElm.length === 1){
          target = {
            x: (targetElm[0]?.scrollLeft ?? doc[0]?.pageXOffset ?? window.scrollX ?? $.body()[0].scrollLeft) || 0,
            y: (targetElm[0]?.scrollTop ?? doc[0]?.pageYOffset ?? window.scrollY ?? $.body()[0].scrollTop) || 0,
          };
          targetType = 'object';
        }else{
          target = [];
          for(let i in targetElm){
            target[i] = {
              x: (targetElm[i]?.scrollLeft ?? doc[0]?.pageXOffset ?? window.scrollX ?? $.body()[0].scrollLeft) || 0,
              y: (targetElm[i]?.scrollTop ?? doc[0]?.pageYOffset ?? window.scrollY ?? $.body()[0].scrollTop) || 0,
            };
          }
          targetType = 'array';
        }
      }

      if(targetType !== 'object' && targetType !== 'array' && !(doc[0] === this[0] || this[0] === document || this[0] === window)){
        let targetRect = target.getBoundingClientRect();
        target = {
          x: targetRect.left,
          y: targetRect.top,
        };
      }

      if(targetType === 'object'){
        if(targetType.ms){ms = targetType.ms;}
        if(targetType.snap){snap = targetType.snap;}
        if(targetType.cb){cb2 = targetType.cb;}
        if(targetType.method){method = targetType.method;}
      }

      let start = {
        x: (doc[0]?.scrollLeft ?? doc[0]?.pageXOffset ?? window.scrollX ?? $.body()[0].scrollLeft) || 0,
        y: (doc[0]?.scrollTop ?? doc[0]?.pageYOffset ?? window.scrollY ?? $.body()[0].scrollTop) || 0,
      };

      if(targetType === 'array'){
        target.forEach(tar => {
          if(tar.x === undefined || tar.x === null){tar.x = start.x;}
          if(tar.y === undefined || tar.y === null){tar.y = start.y;}

          
          runAnim(start, tar, ms, snap, res => {
            doc[0].scrollTo(res.x, res.y);
          }, cb2);
        });
      }

      if(targetType === 'object'){
        if(target.x === undefined || target.x === null){target.x = start.x;}
        if(target.y === undefined || target.y === null){target.y = start.y;}

        runAnim(start, target, ms, snap, res => {
          doc[0].scrollTo(res.x, res.y);
        }, cb2);
      }
    }

    this.each(function(){
      if(sel){
        $(sel, this).each(handleTarget);
      }else if(this[0] === document || this[0] === window){
        handleTarget(fromElm(this, window));
      }else{
        handleTarget(this);
      }
    });
  }

  return this;
});


function runAnim(start, target, ms, snap, cb, cb2, method = 'ease'){
  let dist = {
    x: target.x - start.x,
    y: target.y - start.y,
  };

  let startTime = null;
  function anim(now){
    if(startTime === null){startTime = now;}
    let timeE = now - startTime;

    let res = {x: 0, y: 0};

    if(dist.x < snap && dist.x > -snap){
      res.x = target.x;
    }else{
      res.x = anim_method(timeE, start.x, dist.x, ms, method);
    }

    if(dist.y < snap && dist.y > -snap){
      res.y = target.y;
    }else{
      res.y = anim_method(timeE, start.y, dist.y, ms, method);
    }

    cb(res);

    if(timeE < ms){
      requestAnimationFrame(anim);
    }else{
      cb(target);
      //todo: fix cb2 undefined
      if(typeof cb2 === 'function'){
        callFunc(cb2, fromElm(this, this[0]), {x: target.x, y: target.y, time: timeE});
      }
      if(typeof target.done === 'function'){
        target.done();
      }
    }
  }

  requestAnimationFrame(anim);
}


function anim_method(t, b, c, d, m){
  switch(m){
    case 'ease':
      return anim_ease(t, b, c, d);
    case 'ease-in':
      return anim_ease_in(t, b, c, d);
    case 'ease-out':
      return anim_ease_out(t, b, c, d);
    default:
      return anim_ease(t, b, c, d);
  }
}

function anim_ease_in(t, b, c, d){
  t /= d;
  return c*t*t + b;
}

function anim_ease_out(t, b, c, d){
  t /= d;
  return -c * t*(t-2) + b;
}

function anim_ease(t, b, c, d){
  t /= d / 2;
  if(t < 1){return c / 2 * t * t + b;}
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
}
