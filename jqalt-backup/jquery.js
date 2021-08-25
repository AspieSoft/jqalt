import {$} from './selector.js'

$.jquery = function(){
  const jq = function(param, elm = document){
    elm = $(param, elm);
    elm.jQuery = true;
    return elm;
  }

  //todo: add more jquery support

  return jq;
}

$.supportJquery = function(){
  window.jQuery = Object.freeze($.jquery());
};
