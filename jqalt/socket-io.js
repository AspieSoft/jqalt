import { callFunc, varType } from './functions.js'
import {$} from './selector.js'

export default class Socket extends Array {
  dataStorage = {};
  lastPing = undefined;
  ping = [];
  lastPingUpdate = new Date().getTime();

  data(key, value){
    const keyType = varType(key);

    if(keyType === 'function'){
      callFunc(key, this, this.dataStorage);
      return this;
    }else if(key === undefined){
      return this.dataStorage;
    }

    if(keyType === 'object'){
      let keys = Object.keys(key);
      for(let i in keys){
        this.dataStorage[keys[i]] = key[keys[i]];
      }
      return this;
    }
    if(keyType === 'array'){
      let res = {};
      if(value === $.del){
        for(let i in key){
          delete this.dataStorage[key[i]];
        }
      }
      for(let i in key){
        res[key[i]] = this.dataStorage[key[i]];
      }
      if(typeof value === 'function'){
        callFunc(value, this, res);
        return this;
      }
      return res;
    }
    if(value === $.del){
      delete this.dataStorage[key];
      return this;
    }else if(typeof value === 'function'){
      callFunc(value, this, this.dataStorage[key]);
      return this;
    }
    if(value === undefined){
      return this.dataStorage[key];
    }
    this.dataStorage[key] = value;
    return this;
  }

  hasData(key, value){
    const keyType = varType(key);
    let cb;
    if(typeof value === 'function'){
      cb = value;
      value = undefined;
    }
    if(keyType === 'object'){
      let res = [];
      let keys = Object.keys(key);
      for(let i in keys){
        if(key[keys[i]] === this.dataStorage[keys[i]]){
          res.push(keys[i]);
          if(!cb){
            break;
          }
        }
      }
      if(value === false){
        res = !res;
      }else if(cb && res.length){
        callFunc(cb, this, res);
        return this;
      }else if(cb){
        return this;
      }
      if(!res.length){
        return false;
      }
      return res;
    }
    if(keyType === 'array'){
      let res = [];
      for(let i in key){
        if((value === undefined && this.dataStorage[key[i]] !== undefined) || this.dataStorage[key[i]] === value){
          res.push(key[i]);
          if(!cb){
            break;
          }
        }
      }
      if(cb && res){
        callFunc(cb, this, res);
        return this;
      }else if(cb){
        return this;
      }
      if(!res.length){
        return false;
      }
      return res;
    }
    if(cb && this.dataStorage[key] !== undefined){
      callFunc(cb, this, key);
      return this;
    }else if(cb){
      return this;
    }
    if(value === undefined){
      return this.dataStorage[key] !== undefined;
    }
    return this.dataStorage[key] === value;
  }

  removeData(key){
    if(Array.isArray(key)){
      for(let i in key){
        delete this.dataStorage[key[i]];
      }
      return this;
    }
    delete this.dataStorage[key];
    return this;
  }


  on(event, cb, any){
    [event, cb, any] = $.sort([event, 'str'], [cb, 'func'], [any, 'bool']);
    if(any){
      this[0].onAny(event, () => {
        callFunc(cb, this, ...attributes);
      });
    }else{
      this[0].on(event, () => {
        callFunc(cb, this, ...attributes);
      });
    }
    return this;
  }

  off(event, any){
    if(typeof event !== 'string'){
      [event, any] = [any, event];
    }
    if(any){
      this[0].offAny(event);
    }else{
      this[0].off(event);
    }
    return this;
  }

  once(event, cb){
    if(typeof cb !== 'function'){
      [event, cb] = [cb, event];
    }
    this[0].once(event, () => {
      callFunc(cb, this, ...attributes);
    });
    return this;
  }

  send(){
    this[0].emit(...arguments);
    return this;
  }
  emit(){return this.send(...arguments);}

  removeAll(){
    this[0].removeAllListeners(...arguments);
    return this;
  }

  connect(cb){
    if(typeof cb === 'function'){
      this[0].on('connect', () => {
        callFunc(cb, this, ...attributes);
      });
    }else{
      let socket = io(this[1]);

      let keys = Object.keys(this[0]._callbacks);
      for(let i in keys){
        socket[keys[i]]._callbacks = this[0]._callbacks[keys[i]];
      }

      this[0] = socket;
    }
    return this;
  }

  disconnect(cb){
    if(typeof cb === 'function'){
      this[0].on('disconnect', () => {
        callFunc(cb, this, ...attributes);
      });
    }else{
      this[0].disconnect();
    }
    return this;
  }

  reconnect(cb, attempt){
    if(typeof cb !== 'function'){
      [cb, attempt] = [attempt, cb];
    }
    if(attempt){
      this[0].on('reconnect_attempt', () => {
        callFunc(cb, this, ...attributes);
      });
    }else{
      this[0].on('reconnect', () => {
        callFunc(cb, this, ...attributes);
      });
    }
    return this;
  }

  error(cb, connect){
    if(typeof cb !== 'function'){
      [cb, connect] = [connect, cb];
    }
    if(connect){
      this[0].on('connect_error', () => {
        callFunc(cb, this, ...attributes);
      });
    }else{
      this[0].on('error', () => {
        callFunc(cb, this, ...attributes);
      });
    }
    return this;
  }

  ping(cb){
    let now = new Date().getTime();
    this[0].emit('ping');
    this[0].on('pong', () => {
      let time = (new Date().getTime()) - now;
      if(typeof cb === 'function'){
        let p = 0;
        for(let i in this.ping){
          p += this.ping[i];
        }
        p /= this.ping.length;

        callFunc(cb, this, time, p);
      }
      this.lastPing = time;
      this.ping.push(time);
      if(this.ping.length > 10){
        this.ping.shift();
      }
      this.lastPingUpdate = now;
    });
    return this;
  }

  averagePing(cb){
    let p = 0;
    for(let i in this.ping){
      p += this.ping[i];
    }
    p /= this.ping.length;

    if(typeof cb === 'function'){
      callFunc(cb, this, p, this.lastPingUpdate);
    }
    return p;
  }

  lastPing(cb){
    if(typeof cb === 'function'){
      callFunc(cb, this, this.lastPing, this.lastPingUpdate);
    }
    return this.lastPing;
  }


  of(adapter){
    return new Socket(this[0].of(adapter).adapter);
  }

  to(adapter){
    return new Socket(this[0].to(adapter).adapter);
  }

}

$.socket = function(url){
  if(typeof io === 'undefined'){
    $.addScript('https://cdn.jsdelivr.net/gh/socketio/socket.io@latest/client-dist/socket.io.min.js');
  }

  let socket = io(url);

  socket.on('ping', () => {
    socket.emit('pong');
  });

  return new Socket(socket, url);
};
