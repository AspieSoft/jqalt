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

$.addMethod('scrollTo', function(sel, target, ms, snap, cb){
  //todo: organize option sorting better
  if(typeof sel !== 'string'){[sel, target] = [target, sel];}
  if(typeof target === 'number'){[target, ms] = [ms, target];}
  else if(typeof target === 'function'){[target, cb] = [cb, target];}
  if(typeof target === 'number'){[target, snap] = [snap, target];}
  else if(typeof target === 'function'){[target, cb] = [cb, target];}
  if(typeof target === 'function'){[target, cb] = [cb, target];}
  if(!target){target = sel;}
  if(!target){return this;}
  if(!ms){ms = 1000;}
  if(!snap){snap = 1;}else{snap = Math.abs(snap);}

  let doc;
  if(sel){
    doc = $(sel)[0];
  }else if(this[0] === document || this[0] === window){
    doc = window;
  }else{
    doc = this[0];
  }

  const targetType = varType(target);
  if(targetType === 'array'){
    target = {x: target[0], y: target[1]};
    targetType = 'object';
  }else if(targetType === 'number'){
    target = {x: null, y: targetType};
    targetType = 'object';
  }

  if(targetType === 'string'){
    target = $(target)[0];
    target = {
      x: (target.scrollLeft ?? doc.pageXOffset ?? $.body[0].scrollLeft) || 0,
      y: (target.scrollTop ?? doc.pageYOffset ?? $.body[0].scrollTop) || 0,
    };
    targetType = 'object';
  }

  if(targetType !== 'object'){
    if(doc === this[0] || this[0] === document || this[0] === window){
      return this;
    }
    let targetRect = target.getBoundingClientRect();
    target = {
      x: targetRect.left,
      y: targetRect.top,
    };
  }

  let start = {
    x: (doc.scrollLeft ?? doc.pageXOffset ?? $.body[0].scrollLeft) || 0,
    y: (doc.scrollTop ?? doc.pageYOffset ?? $.body[0].scrollTop) || 0,
  };

  if(target.x === undefined || target.x === null){target.x = start.x;}
  if(target.y === undefined || target.y === null){target.y = start.y;}

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
      res.x = ease(timeE, start.x, dist.x, ms);
    }

    if(dist.y < snap && dist.y > -snap){
      res.y = target.y;
    }else{
      //todo: add option to select ease type
      res.y = anim_ease(timeE, start.y, dist.y, ms);
    }

    window.scrollTo(res.x, res.y);

    if(timeE < ms){
      requestAnimationFrame(anim);
    }else{
      window.scrollTo(target.x, target.y);
      if(typeof cb === 'function'){
        callFunc(cb, fromElm(this, this[0]), {x: target.x, y: target.y, time: timeE});
      }
    }
  }

  requestAnimationFrame(anim);

  return this;
});

$.addMethod('scroll', function(){
  //todo: scroll by number for duration OR return scroll position as object {x, y}
});


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
