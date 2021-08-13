import Element, {$} from '../selector.js'


$.addMethod('next', function(sel){
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
      if(!$.isQuery(e, sel)){return null;}
      return e;
    }).filter(e => e != null);
  }
  return this.map(e => e.previousElementSibling).filter(e => e != null);
});

$.addMethod('previous', function(sel){
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
      if(!$.isQuery(e, sel)){return null;}
      return e;
    }).filter(e => e != null);
  }
  return this.map(e => e.previousElementSibling).filter(e => e != null);
});


$.addMethod('parent', function(sel){
  if(typeof sel === 'number'){
    return this.map(e => {
      if(sel < 0){
        //todo: get element depth within document
      }
      for(let i = 0; i < sel; i++){
        let n = e.parentNode;
        if(!n){break;}
        e = n;
      }
      return e;
    }).filter(e => e != null);
  }
  if(typeof sel === 'string'){
    return this.map(e => {
      e = e.parentNode;
      while(e != null && !$.isQuery(e, sel)){
        e = e.parentNode;
      }
      if(!$.isQuery(e, sel)){return null;}
      return e;
    }).filter(e => e != null);
  }
  return this.map(e => e.parentNode).filter(e => e != null);

  //return new Element(this[0].parentNode);
});

$.addMethod('child', function(sel, index, node){
  [sel, index, node] = $.sort([sel, 'str', 'arr'], [index, 'num'], [node, 'bool']);

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
});

$.addMethod('clone', function(deep = true){
  return new Element(...this.map(elm => {
    return elm.cloneNode(deep);
  }));
});
