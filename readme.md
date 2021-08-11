# JQAlt (JQuery Alternative) (Alpha)

This script is a attempt to replace the heavy jquery with a lightweight alternative.
Rather than completely copying what jquery does, this module brings some different capabilities.

This idea was inspired by [A YouTube Video I Watched](https://www.youtube.com/watch?v=5MFnKG15ZfI) from [Web Dev Simplified](https://www.youtube.com/channel/UCFbNIlppjAuEX4znoulh0Cw), and I decided to expand on the idea.

I have used JQuery a lot, and its great, but it is old. Modern javascript now has builtin functions, and [The IE browser is finally being retired](https://www.theverge.com/2021/5/19/22443997/microsoft-internet-explorer-end-of-support-date).
Soon, the bulk of old browser support may not be as necessary, and taking out JQuery as a dependency can help site performance.

JQuery still has a nice syntax though, and the vanilla js `document.querySelectorAll` is long and wordy compared to `$()` being much shorter.

## Installation

```html

<script src="https://cdn.jsdelivr.net/gh/jquery/jquery@0.0.4/jqalt/index.js"></script>

```

## Usage

```javascript

if(typeof jqAlt !== 'undefined'){
  // module is installed
}

$.ready(function(){
  // in place of the common $(document).ready (old method still works too)
});


// run the js fetch function, with some additional features added in
let options = {method: 'POST', timeout: 30000, type: 'json'};
$.fetch('/url', {data: 'data passed through GET or POST'}, function(data, info){
  data // the content or error message
  info.success // true if the request was successful without an error (404 as a success)
  info.ok // true for a 200 ok response (404 will return false here)
  info.isJSON // true if the response data was valid json

  // also returned from js builtin fetch function
  info.status: res.status,
  info.type: res.type,
  info.url: res.url,
  info.ok: res.ok,
  info.redirected: res.redirected,
  info.head: res.headers,
  info.body: res.body,
}, options);


$.addStyle('/href') // adds a stylesheet to the head if not already there
$.addScript('/src') // adds a script to the head if not already there
// useful if you make a js module and need to ensure a stylesheet was added with it


$.isElement(var) // returns true if the variable is an instanceof a jqalt element


$.once('random id', function(){
  // this function will only run once
});

$.once('random id', function(){
  // this function wont run, because it has the same id
});

setInterval(function(){
  $.once('random id 2', function(){
    // this function will also only run once
  });
}, 100);


$.loop(1000, function(loops, stop){
  // this is an interval
  // it will run every second
  // it will only run 10 times because of the limit number at the bottom
  loops // the number of loops left before this function stops
  stop() // stops/clears this interval
}, 10);

$.loop(100, function(){
  // this interval will always run without a defined limit
});


function(str, bool, msg, list, opts){
  // sort function parameters by type
  [str, bool, msg, list, opts] = $.sort([str, 'string'], [bool, 'bool'], [msg, 'str'], [list, 'array'], [opts, 'object']);
  // this function accepts common shorthands like "str = string", "obj = object", "arr = array", "func = function", etc.
}


$.type(var) // a bit more than typeof (also returns 'array', 'nan', 'regexp', 'element' (a jqalt element), 'node', 'nodelist')

$.type(var, type) // returns true if the var matches the type you passed
// this function also excepts common shorthands, and is what $.sort uses to recognize types


$.isQuery(elm, sel) // returns true if the element matches a querySelector (does not use querySelector, uses regex instead)


$.isArrowFunction(func) // returns true if the var passed is an arrow function "() => {}"

```

I haven't even listed any of the element class functions yet.
I will add more info in the future, but for now, this project is still in alpha.
