import {$} from './selector.js'

$.jquery = function(){
  const jq = function(param, elm = document){
    return $(param, elm).data('jquery-support', true);
  }

  //todo: add more jquery support

  return jq;
}

$.supportJquery = function(){
  window.jQuery = Object.freeze($.jquery());
};
