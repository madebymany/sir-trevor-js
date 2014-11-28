/*!
 * Sir Trevor JS v0.3.2
 *
 * Released under the MIT license
 * www.opensource.org/licenses/MIT
 *
 * 2014-11-28
 */


!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.SirTrevor=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./src/');

},{"./src/":89}],2:[function(require,module,exports){
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as a module.
    define('eventable', function() {
      return (root.Eventable = factory());
    });
  } else if (typeof exports !== 'undefined') {
    // Node. Does not work with strict CommonJS, but only CommonJS-like
    // enviroments that support module.exports, like Node.
    module.exports = factory();
  } else {
    // Browser globals
    root.Eventable = factory();
  }
}(this, function() {

  // Copy and pasted straight out of Backbone 1.0.0
  // We'll try and keep this updated to the latest

  var array = [];
  var slice = array.slice;

  function once(func) {
    var memo, times = 2;

    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      } else {
        func = null;
      }
      return memo;
    };
  }

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Eventable = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var func = once(function() {
        self.off(name, func);
        callback.apply(this, arguments);
      });
      func._callback = callback;
      return this.on(name, func, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : Object.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) return this;
      var deleteListener = !name && !callback;
      if (typeof name === 'object') callback = this;
      if (obj) (listeners = {})[obj._listenerId] = obj;
      for (var id in listeners) {
        listeners[id].off(name, callback, this);
        if (deleteListener) delete this._listeners[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  function addListenMethod(method, implementation) {
    Eventable[method] = function(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = (new Date()).getTime());
      listeners[id] = obj;
      if (typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  }

  addListenMethod('listenTo', 'on');
  addListenMethod('listenToOnce', 'once');

  // Aliases for backwards compatibility.
  Eventable.bind   = Eventable.on;
  Eventable.unbind = Eventable.off;

  return Eventable;

}));

},{}],3:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var forOwn = require('lodash.forown'),
    isFunction = require('lodash.isfunction');

/** `Object#toString` result shortcuts */
var argsClass = '[object Arguments]',
    arrayClass = '[object Array]',
    objectClass = '[object Object]',
    stringClass = '[object String]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/**
 * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
 * length of `0` and objects with no own enumerable properties are considered
 * "empty".
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {Array|Object|string} value The value to inspect.
 * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
 * @example
 *
 * _.isEmpty([1, 2, 3]);
 * // => false
 *
 * _.isEmpty({});
 * // => true
 *
 * _.isEmpty('');
 * // => true
 */
function isEmpty(value) {
  var result = true;
  if (!value) {
    return result;
  }
  var className = toString.call(value),
      length = value.length;

  if ((className == arrayClass || className == stringClass || className == argsClass ) ||
      (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
    return !length;
  }
  forOwn(value, function() {
    return (result = false);
  });
  return result;
}

module.exports = isEmpty;

},{"lodash.forown":4,"lodash.isfunction":27}],4:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    keys = require('lodash.keys'),
    objectTypes = require('lodash._objecttypes');

/**
 * Iterates over own enumerable properties of an object, executing the callback
 * for each property. The callback is bound to `thisArg` and invoked with three
 * arguments; (value, key, object). Callbacks may exit iteration early by
 * explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {Object} object The object to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
 *   console.log(key);
 * });
 * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
 */
var forOwn = function(collection, callback, thisArg) {
  var index, iterable = collection, result = iterable;
  if (!iterable) return result;
  if (!objectTypes[typeof iterable]) return result;
  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
    var ownIndex = -1,
        ownProps = objectTypes[typeof iterable] && keys(iterable),
        length = ownProps ? ownProps.length : 0;

    while (++ownIndex < length) {
      index = ownProps[ownIndex];
      if (callback(iterable[index], index, collection) === false) return result;
    }
  return result
};

module.exports = forOwn;

},{"lodash._basecreatecallback":5,"lodash._objecttypes":23,"lodash.keys":24}],5:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var bind = require('lodash.bind'),
    identity = require('lodash.identity'),
    setBindData = require('lodash._setbinddata'),
    support = require('lodash.support');

/** Used to detected named functions */
var reFuncName = /^\s*function[ \n\r\t]+\w/;

/** Used to detect functions containing a `this` reference */
var reThis = /\bthis\b/;

/** Native method shortcuts */
var fnToString = Function.prototype.toString;

/**
 * The base implementation of `_.createCallback` without support for creating
 * "_.pluck" or "_.where" style callbacks.
 *
 * @private
 * @param {*} [func=identity] The value to convert to a callback.
 * @param {*} [thisArg] The `this` binding of the created callback.
 * @param {number} [argCount] The number of arguments the callback accepts.
 * @returns {Function} Returns a callback function.
 */
function baseCreateCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  // exit early for no `thisArg` or already bound by `Function#bind`
  if (typeof thisArg == 'undefined' || !('prototype' in func)) {
    return func;
  }
  var bindData = func.__bindData__;
  if (typeof bindData == 'undefined') {
    if (support.funcNames) {
      bindData = !func.name;
    }
    bindData = bindData || !support.funcDecomp;
    if (!bindData) {
      var source = fnToString.call(func);
      if (!support.funcNames) {
        bindData = !reFuncName.test(source);
      }
      if (!bindData) {
        // checks if `func` references the `this` keyword and stores the result
        bindData = reThis.test(source);
        setBindData(func, bindData);
      }
    }
  }
  // exit early if there are no `this` references or `func` is bound
  if (bindData === false || (bindData !== true && bindData[1] & 1)) {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 2: return function(a, b) {
      return func.call(thisArg, a, b);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
  }
  return bind(func, thisArg);
}

module.exports = baseCreateCallback;

},{"lodash._setbinddata":6,"lodash.bind":9,"lodash.identity":20,"lodash.support":21}],6:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative'),
    noop = require('lodash.noop');

/** Used as the property descriptor for `__bindData__` */
var descriptor = {
  'configurable': false,
  'enumerable': false,
  'value': null,
  'writable': false
};

/** Used to set meta data on functions */
var defineProperty = (function() {
  // IE 8 only accepts DOM elements
  try {
    var o = {},
        func = isNative(func = Object.defineProperty) && func,
        result = func(o, o, o) && func;
  } catch(e) { }
  return result;
}());

/**
 * Sets `this` binding data on a given function.
 *
 * @private
 * @param {Function} func The function to set data on.
 * @param {Array} value The data array to set.
 */
var setBindData = !defineProperty ? noop : function(func, value) {
  descriptor.value = value;
  defineProperty(func, '__bindData__', descriptor);
};

module.exports = setBindData;

},{"lodash._isnative":7,"lodash.noop":8}],7:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/** Used to detect if a method is native */
var reNative = RegExp('^' +
  String(toString)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/toString| for [^\]]+/g, '.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
 */
function isNative(value) {
  return typeof value == 'function' && reNative.test(value);
}

module.exports = isNative;

},{}],8:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * A no-operation function.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @example
 *
 * var object = { 'name': 'fred' };
 * _.noop(object) === undefined;
 * // => true
 */
function noop() {
  // no operation performed
}

module.exports = noop;

},{}],9:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var createWrapper = require('lodash._createwrapper'),
    slice = require('lodash._slice');

/**
 * Creates a function that, when called, invokes `func` with the `this`
 * binding of `thisArg` and prepends any additional `bind` arguments to those
 * provided to the bound function.
 *
 * @static
 * @memberOf _
 * @category Functions
 * @param {Function} func The function to bind.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {...*} [arg] Arguments to be partially applied.
 * @returns {Function} Returns the new bound function.
 * @example
 *
 * var func = function(greeting) {
 *   return greeting + ' ' + this.name;
 * };
 *
 * func = _.bind(func, { 'name': 'fred' }, 'hi');
 * func();
 * // => 'hi fred'
 */
function bind(func, thisArg) {
  return arguments.length > 2
    ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
    : createWrapper(func, 1, null, null, thisArg);
}

module.exports = bind;

},{"lodash._createwrapper":10,"lodash._slice":19}],10:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseBind = require('lodash._basebind'),
    baseCreateWrapper = require('lodash._basecreatewrapper'),
    isFunction = require('lodash.isfunction'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push,
    unshift = arrayRef.unshift;

/**
 * Creates a function that, when called, either curries or invokes `func`
 * with an optional `this` binding and partially applied arguments.
 *
 * @private
 * @param {Function|string} func The function or method name to reference.
 * @param {number} bitmask The bitmask of method flags to compose.
 *  The bitmask may be composed of the following flags:
 *  1 - `_.bind`
 *  2 - `_.bindKey`
 *  4 - `_.curry`
 *  8 - `_.curry` (bound)
 *  16 - `_.partial`
 *  32 - `_.partialRight`
 * @param {Array} [partialArgs] An array of arguments to prepend to those
 *  provided to the new function.
 * @param {Array} [partialRightArgs] An array of arguments to append to those
 *  provided to the new function.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new function.
 */
function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
  var isBind = bitmask & 1,
      isBindKey = bitmask & 2,
      isCurry = bitmask & 4,
      isCurryBound = bitmask & 8,
      isPartial = bitmask & 16,
      isPartialRight = bitmask & 32;

  if (!isBindKey && !isFunction(func)) {
    throw new TypeError;
  }
  if (isPartial && !partialArgs.length) {
    bitmask &= ~16;
    isPartial = partialArgs = false;
  }
  if (isPartialRight && !partialRightArgs.length) {
    bitmask &= ~32;
    isPartialRight = partialRightArgs = false;
  }
  var bindData = func && func.__bindData__;
  if (bindData && bindData !== true) {
    // clone `bindData`
    bindData = slice(bindData);
    if (bindData[2]) {
      bindData[2] = slice(bindData[2]);
    }
    if (bindData[3]) {
      bindData[3] = slice(bindData[3]);
    }
    // set `thisBinding` is not previously bound
    if (isBind && !(bindData[1] & 1)) {
      bindData[4] = thisArg;
    }
    // set if previously bound but not currently (subsequent curried functions)
    if (!isBind && bindData[1] & 1) {
      bitmask |= 8;
    }
    // set curried arity if not yet set
    if (isCurry && !(bindData[1] & 4)) {
      bindData[5] = arity;
    }
    // append partial left arguments
    if (isPartial) {
      push.apply(bindData[2] || (bindData[2] = []), partialArgs);
    }
    // append partial right arguments
    if (isPartialRight) {
      unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
    }
    // merge flags
    bindData[1] |= bitmask;
    return createWrapper.apply(null, bindData);
  }
  // fast path for `_.bind`
  var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
  return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
}

module.exports = createWrapper;

},{"lodash._basebind":11,"lodash._basecreatewrapper":15,"lodash._slice":19,"lodash.isfunction":27}],11:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreate = require('lodash._basecreate'),
    isObject = require('lodash.isobject'),
    setBindData = require('lodash._setbinddata'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * The base implementation of `_.bind` that creates the bound function and
 * sets its meta data.
 *
 * @private
 * @param {Array} bindData The bind data array.
 * @returns {Function} Returns the new bound function.
 */
function baseBind(bindData) {
  var func = bindData[0],
      partialArgs = bindData[2],
      thisArg = bindData[4];

  function bound() {
    // `Function#bind` spec
    // http://es5.github.io/#x15.3.4.5
    if (partialArgs) {
      // avoid `arguments` object deoptimizations by using `slice` instead
      // of `Array.prototype.slice.call` and not assigning `arguments` to a
      // variable as a ternary expression
      var args = slice(partialArgs);
      push.apply(args, arguments);
    }
    // mimic the constructor's `return` behavior
    // http://es5.github.io/#x13.2.2
    if (this instanceof bound) {
      // ensure `new bound` is an instance of `func`
      var thisBinding = baseCreate(func.prototype),
          result = func.apply(thisBinding, args || arguments);
      return isObject(result) ? result : thisBinding;
    }
    return func.apply(thisArg, args || arguments);
  }
  setBindData(bound, bindData);
  return bound;
}

module.exports = baseBind;

},{"lodash._basecreate":12,"lodash._setbinddata":6,"lodash._slice":19,"lodash.isobject":28}],12:[function(require,module,exports){
(function (global){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative'),
    isObject = require('lodash.isobject'),
    noop = require('lodash.noop');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(prototype, properties) {
  return isObject(prototype) ? nativeCreate(prototype) : {};
}
// fallback for browsers without `Object.create`
if (!nativeCreate) {
  baseCreate = (function() {
    function Object() {}
    return function(prototype) {
      if (isObject(prototype)) {
        Object.prototype = prototype;
        var result = new Object;
        Object.prototype = null;
      }
      return result || global.Object();
    };
  }());
}

module.exports = baseCreate;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash._isnative":13,"lodash.isobject":28,"lodash.noop":14}],13:[function(require,module,exports){
module.exports=require(7)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":7}],14:[function(require,module,exports){
module.exports=require(8)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":8}],15:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreate = require('lodash._basecreate'),
    isObject = require('lodash.isobject'),
    setBindData = require('lodash._setbinddata'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * The base implementation of `createWrapper` that creates the wrapper and
 * sets its meta data.
 *
 * @private
 * @param {Array} bindData The bind data array.
 * @returns {Function} Returns the new function.
 */
function baseCreateWrapper(bindData) {
  var func = bindData[0],
      bitmask = bindData[1],
      partialArgs = bindData[2],
      partialRightArgs = bindData[3],
      thisArg = bindData[4],
      arity = bindData[5];

  var isBind = bitmask & 1,
      isBindKey = bitmask & 2,
      isCurry = bitmask & 4,
      isCurryBound = bitmask & 8,
      key = func;

  function bound() {
    var thisBinding = isBind ? thisArg : this;
    if (partialArgs) {
      var args = slice(partialArgs);
      push.apply(args, arguments);
    }
    if (partialRightArgs || isCurry) {
      args || (args = slice(arguments));
      if (partialRightArgs) {
        push.apply(args, partialRightArgs);
      }
      if (isCurry && args.length < arity) {
        bitmask |= 16 & ~32;
        return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
      }
    }
    args || (args = arguments);
    if (isBindKey) {
      func = thisBinding[key];
    }
    if (this instanceof bound) {
      thisBinding = baseCreate(func.prototype);
      var result = func.apply(thisBinding, args);
      return isObject(result) ? result : thisBinding;
    }
    return func.apply(thisBinding, args);
  }
  setBindData(bound, bindData);
  return bound;
}

module.exports = baseCreateWrapper;

},{"lodash._basecreate":16,"lodash._setbinddata":6,"lodash._slice":19,"lodash.isobject":28}],16:[function(require,module,exports){
module.exports=require(12)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":12,"lodash._isnative":17,"lodash.isobject":28,"lodash.noop":18}],17:[function(require,module,exports){
module.exports=require(7)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":7}],18:[function(require,module,exports){
module.exports=require(8)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":8}],19:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Slices the `collection` from the `start` index up to, but not including,
 * the `end` index.
 *
 * Note: This function is used instead of `Array#slice` to support node lists
 * in IE < 9 and to ensure dense arrays are returned.
 *
 * @private
 * @param {Array|Object|string} collection The collection to slice.
 * @param {number} start The start index.
 * @param {number} end The end index.
 * @returns {Array} Returns the new array.
 */
function slice(array, start, end) {
  start || (start = 0);
  if (typeof end == 'undefined') {
    end = array ? array.length : 0;
  }
  var index = -1,
      length = end - start || 0,
      result = Array(length < 0 ? 0 : length);

  while (++index < length) {
    result[index] = array[start + index];
  }
  return result;
}

module.exports = slice;

},{}],20:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'name': 'fred' };
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

},{}],21:[function(require,module,exports){
(function (global){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative');

/** Used to detect functions containing a `this` reference */
var reThis = /\bthis\b/;

/**
 * An object used to flag environments features.
 *
 * @static
 * @memberOf _
 * @type Object
 */
var support = {};

/**
 * Detect if functions can be decompiled by `Function#toString`
 * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
 *
 * @memberOf _.support
 * @type boolean
 */
support.funcDecomp = !isNative(global.WinRTError) && reThis.test(function() { return this; });

/**
 * Detect if `Function#name` is supported (all but IE).
 *
 * @memberOf _.support
 * @type boolean
 */
support.funcNames = typeof Function.name == 'string';

module.exports = support;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash._isnative":22}],22:[function(require,module,exports){
module.exports=require(7)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":7}],23:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to determine if values are of the language type Object */
var objectTypes = {
  'boolean': false,
  'function': true,
  'object': true,
  'number': false,
  'string': false,
  'undefined': false
};

module.exports = objectTypes;

},{}],24:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative'),
    isObject = require('lodash.isobject'),
    shimKeys = require('lodash._shimkeys');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

/**
 * Creates an array composed of the own enumerable property names of an object.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property names.
 * @example
 *
 * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
 * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  if (!isObject(object)) {
    return [];
  }
  return nativeKeys(object);
};

module.exports = keys;

},{"lodash._isnative":25,"lodash._shimkeys":26,"lodash.isobject":28}],25:[function(require,module,exports){
module.exports=require(7)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":7}],26:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = require('lodash._objecttypes');

/** Used for native method references */
var objectProto = Object.prototype;

/** Native method shortcuts */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A fallback implementation of `Object.keys` which produces an array of the
 * given object's own enumerable property names.
 *
 * @private
 * @type Function
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property names.
 */
var shimKeys = function(object) {
  var index, iterable = object, result = [];
  if (!iterable) return result;
  if (!(objectTypes[typeof object])) return result;
    for (index in iterable) {
      if (hasOwnProperty.call(iterable, index)) {
        result.push(index);
      }
    }
  return result
};

module.exports = shimKeys;

},{"lodash._objecttypes":23}],27:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Checks if `value` is a function.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 */
function isFunction(value) {
  return typeof value == 'function';
}

module.exports = isFunction;

},{}],28:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = require('lodash._objecttypes');

/**
 * Checks if `value` is the language type of Object.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // check if the value is the ECMAScript language type of Object
  // http://es5.github.io/#x8
  // and avoid a V8 bug
  // http://code.google.com/p/v8/issues/detail?id=2291
  return !!(value && objectTypes[typeof value]);
}

module.exports = isObject;

},{"lodash._objecttypes":29}],29:[function(require,module,exports){
module.exports=require(23)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._objecttypes/index.js":23}],30:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** `Object#toString` result shortcuts */
var stringClass = '[object String]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/**
 * Checks if `value` is a string.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
 * @example
 *
 * _.isString('fred');
 * // => true
 */
function isString(value) {
  return typeof value == 'string' ||
    value && typeof value == 'object' && toString.call(value) == stringClass || false;
}

module.exports = isString;

},{}],31:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Checks if `value` is `undefined`.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
 * @example
 *
 * _.isUndefined(void 0);
 * // => true
 */
function isUndefined(value) {
  return typeof value == 'undefined';
}

module.exports = isUndefined;

},{}],32:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isFunction = require('lodash.isfunction');

/**
 * Resolves the value of property `key` on `object`. If `key` is a function
 * it will be invoked with the `this` binding of `object` and its result returned,
 * else the property value is returned. If `object` is falsey then `undefined`
 * is returned.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {Object} object The object to inspect.
 * @param {string} key The name of the property to resolve.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = {
 *   'cheese': 'crumpets',
 *   'stuff': function() {
 *     return 'nonsense';
 *   }
 * };
 *
 * _.result(object, 'cheese');
 * // => 'crumpets'
 *
 * _.result(object, 'stuff');
 * // => 'nonsense'
 */
function result(object, key) {
  if (object) {
    var value = object[key];
    return isFunction(value) ? object[key]() : value;
  }
}

module.exports = result;

},{"lodash.isfunction":27}],33:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var defaults = require('lodash.defaults'),
    escape = require('lodash.escape'),
    escapeStringChar = require('lodash._escapestringchar'),
    keys = require('lodash.keys'),
    reInterpolate = require('lodash._reinterpolate'),
    templateSettings = require('lodash.templatesettings'),
    values = require('lodash.values');

/** Used to match empty string literals in compiled template source */
var reEmptyStringLeading = /\b__p \+= '';/g,
    reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
    reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

/**
 * Used to match ES6 template delimiters
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
 */
var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

/** Used to ensure capturing order of template delimiters */
var reNoMatch = /($^)/;

/** Used to match unescaped characters in compiled string literals */
var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

/**
 * A micro-templating method that handles arbitrary delimiters, preserves
 * whitespace, and correctly escapes quotes within interpolated code.
 *
 * Note: In the development build, `_.template` utilizes sourceURLs for easier
 * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
 *
 * For more information on precompiling templates see:
 * http://lodash.com/custom-builds
 *
 * For more information on Chrome extension sandboxes see:
 * http://developer.chrome.com/stable/extensions/sandboxingEval.html
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {string} text The template text.
 * @param {Object} data The data object used to populate the text.
 * @param {Object} [options] The options object.
 * @param {RegExp} [options.escape] The "escape" delimiter.
 * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
 * @param {Object} [options.imports] An object to import into the template as local variables.
 * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
 * @param {string} [sourceURL] The sourceURL of the template's compiled source.
 * @param {string} [variable] The data object variable name.
 * @returns {Function|string} Returns a compiled function when no `data` object
 *  is given, else it returns the interpolated text.
 * @example
 *
 * // using the "interpolate" delimiter to create a compiled template
 * var compiled = _.template('hello <%= name %>');
 * compiled({ 'name': 'fred' });
 * // => 'hello fred'
 *
 * // using the "escape" delimiter to escape HTML in data property values
 * _.template('<b><%- value %></b>', { 'value': '<script>' });
 * // => '<b>&lt;script&gt;</b>'
 *
 * // using the "evaluate" delimiter to generate HTML
 * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
 * _.template(list, { 'people': ['fred', 'barney'] });
 * // => '<li>fred</li><li>barney</li>'
 *
 * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
 * _.template('hello ${ name }', { 'name': 'pebbles' });
 * // => 'hello pebbles'
 *
 * // using the internal `print` function in "evaluate" delimiters
 * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
 * // => 'hello barney!'
 *
 * // using a custom template delimiters
 * _.templateSettings = {
 *   'interpolate': /{{([\s\S]+?)}}/g
 * };
 *
 * _.template('hello {{ name }}!', { 'name': 'mustache' });
 * // => 'hello mustache!'
 *
 * // using the `imports` option to import jQuery
 * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
 * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
 * // => '<li>fred</li><li>barney</li>'
 *
 * // using the `sourceURL` option to specify a custom sourceURL for the template
 * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
 * compiled(data);
 * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
 *
 * // using the `variable` option to ensure a with-statement isn't used in the compiled template
 * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
 * compiled.source;
 * // => function(data) {
 *   var __t, __p = '', __e = _.escape;
 *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
 *   return __p;
 * }
 *
 * // using the `source` property to inline compiled templates for meaningful
 * // line numbers in error messages and a stack trace
 * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
 *   var JST = {\
 *     "main": ' + _.template(mainText).source + '\
 *   };\
 * ');
 */
function template(text, data, options) {
  // based on John Resig's `tmpl` implementation
  // http://ejohn.org/blog/javascript-micro-templating/
  // and Laura Doktorova's doT.js
  // https://github.com/olado/doT
  var settings = templateSettings.imports._.templateSettings || templateSettings;
  text = String(text || '');

  // avoid missing dependencies when `iteratorTemplate` is not defined
  options = defaults({}, options, settings);

  var imports = defaults({}, options.imports, settings.imports),
      importsKeys = keys(imports),
      importsValues = values(imports);

  var isEvaluating,
      index = 0,
      interpolate = options.interpolate || reNoMatch,
      source = "__p += '";

  // compile the regexp to match each delimiter
  var reDelimiters = RegExp(
    (options.escape || reNoMatch).source + '|' +
    interpolate.source + '|' +
    (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
    (options.evaluate || reNoMatch).source + '|$'
  , 'g');

  text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
    interpolateValue || (interpolateValue = esTemplateValue);

    // escape characters that cannot be included in string literals
    source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

    // replace delimiters with snippets
    if (escapeValue) {
      source += "' +\n__e(" + escapeValue + ") +\n'";
    }
    if (evaluateValue) {
      isEvaluating = true;
      source += "';\n" + evaluateValue + ";\n__p += '";
    }
    if (interpolateValue) {
      source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
    }
    index = offset + match.length;

    // the JS engine embedded in Adobe products requires returning the `match`
    // string in order to produce the correct `offset` value
    return match;
  });

  source += "';\n";

  // if `variable` is not specified, wrap a with-statement around the generated
  // code to add the data object to the top of the scope chain
  var variable = options.variable,
      hasVariable = variable;

  if (!hasVariable) {
    variable = 'obj';
    source = 'with (' + variable + ') {\n' + source + '\n}\n';
  }
  // cleanup code by stripping empty strings
  source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
    .replace(reEmptyStringMiddle, '$1')
    .replace(reEmptyStringTrailing, '$1;');

  // frame code as the function body
  source = 'function(' + variable + ') {\n' +
    (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
    "var __t, __p = '', __e = _.escape" +
    (isEvaluating
      ? ', __j = Array.prototype.join;\n' +
        "function print() { __p += __j.call(arguments, '') }\n"
      : ';\n'
    ) +
    source +
    'return __p\n}';

  try {
    var result = Function(importsKeys, 'return ' + source ).apply(undefined, importsValues);
  } catch(e) {
    e.source = source;
    throw e;
  }
  if (data) {
    return result(data);
  }
  // provide the compiled function's source by its `toString` method, in
  // supported environments, or the `source` property as a convenience for
  // inlining compiled templates during the build process
  result.source = source;
  return result;
}

module.exports = template;

},{"lodash._escapestringchar":34,"lodash._reinterpolate":35,"lodash.defaults":36,"lodash.escape":38,"lodash.keys":43,"lodash.templatesettings":47,"lodash.values":48}],34:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to escape characters for inclusion in compiled string literals */
var stringEscapes = {
  '\\': '\\',
  "'": "'",
  '\n': 'n',
  '\r': 'r',
  '\t': 't',
  '\u2028': 'u2028',
  '\u2029': 'u2029'
};

/**
 * Used by `template` to escape characters for inclusion in compiled
 * string literals.
 *
 * @private
 * @param {string} match The matched character to escape.
 * @returns {string} Returns the escaped character.
 */
function escapeStringChar(match) {
  return '\\' + stringEscapes[match];
}

module.exports = escapeStringChar;

},{}],35:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to match "interpolate" template delimiters */
var reInterpolate = /<%=([\s\S]+?)%>/g;

module.exports = reInterpolate;

},{}],36:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var keys = require('lodash.keys'),
    objectTypes = require('lodash._objecttypes');

/**
 * Assigns own enumerable properties of source object(s) to the destination
 * object for all destination properties that resolve to `undefined`. Once a
 * property is set, additional defaults of the same property will be ignored.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {Object} object The destination object.
 * @param {...Object} [source] The source objects.
 * @param- {Object} [guard] Allows working with `_.reduce` without using its
 *  `key` and `object` arguments as sources.
 * @returns {Object} Returns the destination object.
 * @example
 *
 * var object = { 'name': 'barney' };
 * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
 * // => { 'name': 'barney', 'employer': 'slate' }
 */
var defaults = function(object, source, guard) {
  var index, iterable = object, result = iterable;
  if (!iterable) return result;
  var args = arguments,
      argsIndex = 0,
      argsLength = typeof guard == 'number' ? 2 : args.length;
  while (++argsIndex < argsLength) {
    iterable = args[argsIndex];
    if (iterable && objectTypes[typeof iterable]) {
    var ownIndex = -1,
        ownProps = objectTypes[typeof iterable] && keys(iterable),
        length = ownProps ? ownProps.length : 0;

    while (++ownIndex < length) {
      index = ownProps[ownIndex];
      if (typeof result[index] == 'undefined') result[index] = iterable[index];
    }
    }
  }
  return result
};

module.exports = defaults;

},{"lodash._objecttypes":37,"lodash.keys":43}],37:[function(require,module,exports){
module.exports=require(23)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._objecttypes/index.js":23}],38:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var escapeHtmlChar = require('lodash._escapehtmlchar'),
    keys = require('lodash.keys'),
    reUnescapedHtml = require('lodash._reunescapedhtml');

/**
 * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
 * corresponding HTML entities.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {string} string The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escape('Fred, Wilma, & Pebbles');
 * // => 'Fred, Wilma, &amp; Pebbles'
 */
function escape(string) {
  return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
}

module.exports = escape;

},{"lodash._escapehtmlchar":39,"lodash._reunescapedhtml":41,"lodash.keys":43}],39:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var htmlEscapes = require('lodash._htmlescapes');

/**
 * Used by `escape` to convert characters to HTML entities.
 *
 * @private
 * @param {string} match The matched character to escape.
 * @returns {string} Returns the escaped character.
 */
function escapeHtmlChar(match) {
  return htmlEscapes[match];
}

module.exports = escapeHtmlChar;

},{"lodash._htmlescapes":40}],40:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Used to convert characters to HTML entities:
 *
 * Though the `>` character is escaped for symmetry, characters like `>` and `/`
 * don't require escaping in HTML and have no special meaning unless they're part
 * of a tag or an unquoted attribute value.
 * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
 */
var htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

module.exports = htmlEscapes;

},{}],41:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var htmlEscapes = require('lodash._htmlescapes'),
    keys = require('lodash.keys');

/** Used to match HTML entities and HTML characters */
var reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

module.exports = reUnescapedHtml;

},{"lodash._htmlescapes":42,"lodash.keys":43}],42:[function(require,module,exports){
module.exports=require(40)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.template/node_modules/lodash.escape/node_modules/lodash._escapehtmlchar/node_modules/lodash._htmlescapes/index.js":40}],43:[function(require,module,exports){
module.exports=require(24)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash.keys/index.js":24,"lodash._isnative":44,"lodash._shimkeys":45,"lodash.isobject":28}],44:[function(require,module,exports){
module.exports=require(7)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":7}],45:[function(require,module,exports){
module.exports=require(26)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash.keys/node_modules/lodash._shimkeys/index.js":26,"lodash._objecttypes":46}],46:[function(require,module,exports){
module.exports=require(23)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._objecttypes/index.js":23}],47:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var escape = require('lodash.escape'),
    reInterpolate = require('lodash._reinterpolate');

/**
 * By default, the template delimiters used by Lo-Dash are similar to those in
 * embedded Ruby (ERB). Change the following template settings to use alternative
 * delimiters.
 *
 * @static
 * @memberOf _
 * @type Object
 */
var templateSettings = {

  /**
   * Used to detect `data` property values to be HTML-escaped.
   *
   * @memberOf _.templateSettings
   * @type RegExp
   */
  'escape': /<%-([\s\S]+?)%>/g,

  /**
   * Used to detect code to be evaluated.
   *
   * @memberOf _.templateSettings
   * @type RegExp
   */
  'evaluate': /<%([\s\S]+?)%>/g,

  /**
   * Used to detect `data` property values to inject.
   *
   * @memberOf _.templateSettings
   * @type RegExp
   */
  'interpolate': reInterpolate,

  /**
   * Used to reference the data object in the template text.
   *
   * @memberOf _.templateSettings
   * @type string
   */
  'variable': '',

  /**
   * Used to import variables into the compiled template.
   *
   * @memberOf _.templateSettings
   * @type Object
   */
  'imports': {

    /**
     * A reference to the `lodash` function.
     *
     * @memberOf _.templateSettings.imports
     * @type Function
     */
    '_': { 'escape': escape }
  }
};

module.exports = templateSettings;

},{"lodash._reinterpolate":35,"lodash.escape":38}],48:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var keys = require('lodash.keys');

/**
 * Creates an array composed of the own enumerable property values of `object`.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property values.
 * @example
 *
 * _.values({ 'one': 1, 'two': 2, 'three': 3 });
 * // => [1, 2, 3] (property order is not guaranteed across environments)
 */
function values(object) {
  var index = -1,
      props = keys(object),
      length = props.length,
      result = Array(length);

  while (++index < length) {
    result[index] = object[props[index]];
  }
  return result;
}

module.exports = values;

},{"lodash.keys":43}],49:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to generate unique IDs */
var idCounter = 0;

/**
 * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {string} [prefix] The value to prefix the ID with.
 * @returns {string} Returns the unique ID.
 * @example
 *
 * _.uniqueId('contact_');
 * // => 'contact_104'
 *
 * _.uniqueId();
 * // => '105'
 */
function uniqueId(prefix) {
  var id = ++idCounter;
  return String(prefix == null ? '' : prefix) + id;
}

module.exports = uniqueId;

},{}],50:[function(require,module,exports){
/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 */
(function(root, factory) {

  /* CommonJS */
  if (typeof exports == 'object')  module.exports = factory()

  /* AMD module */
  else if (typeof define == 'function' && define.amd) define(factory)

  /* Browser global */
  else root.Spinner = factory()
}
(this, function() {
  "use strict";

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for(n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins(parent /* child1, child2, ...*/) {
    for (var i=1, n=arguments.length; i<n; i++)
      parent.appendChild(arguments[i])

    return parent
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = (function() {
    var el = createEl('style', {type : 'text/css'})
    ins(document.getElementsByTagName('head')[0], el)
    return el.sheet || el.styleSheet
  }())

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor(el, prop) {
    var s = el.style
      , pp
      , i

    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop
      if(s[pp] !== undefined) return pp
    }
    if(s[prop] !== undefined) return prop
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop)
      el.style[vendor(el, n)||n] = prop[n]

    return el
  }

  /**
   * Fills in default values.
   */
  function merge(obj) {
    for (var i=1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def)
        if (obj[n] === undefined) obj[n] = def[n]
    }
    return obj
  }

  /**
   * Returns the absolute page-offset of the given element.
   */
  function pos(el) {
    var o = { x:el.offsetLeft, y:el.offsetTop }
    while((el = el.offsetParent))
      o.x+=el.offsetLeft, o.y+=el.offsetTop

    return o
  }

  /**
   * Returns the line color from the given string or array.
   */
  function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length]
  }

  // Built-in defaults

  var defaults = {
    lines: 12,            // The number of lines to draw
    length: 7,            // The length of each line
    width: 5,             // The line thickness
    radius: 10,           // The radius of the inner circle
    rotate: 0,            // Rotation offset
    corners: 1,           // Roundness (0..1)
    color: '#000',        // #rgb or #rrggbb
    direction: 1,         // 1: clockwise, -1: counterclockwise
    speed: 1,             // Rounds per second
    trail: 100,           // Afterglow percentage
    opacity: 1/4,         // Opacity of the lines
    fps: 20,              // Frames per second when using setTimeout()
    zIndex: 2e9,          // Use a high z-index by default
    className: 'spinner', // CSS class to assign to the element
    top: '50%',           // center vertically
    left: '50%',          // center horizontally
    position: 'absolute'  // element position
  }

  /** The constructor */
  function Spinner(o) {
    this.opts = merge(o || {}, Spinner.defaults, defaults)
  }

  // Global defaults that override the built-ins:
  Spinner.defaults = {}

  merge(Spinner.prototype, {

    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target b calling
     * stop() internally.
     */
    spin: function(target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = css(createEl(0, {className: o.className}), {position: o.position, width: 0, zIndex: o.zIndex})
        , mid = o.radius+o.length+o.width

      css(el, {
        left: o.left,
        top: o.top
      })
        
      if (target) {
        target.insertBefore(el, target.firstChild||null)
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps/o.speed
          , ostep = (1-o.opacity) / (f*o.trail / 100)
          , astep = f/o.lines

        ;(function anim() {
          i++;
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000/fps))
        })()
      }
      return self
    },

    /**
     * Stops and removes the Spinner.
     */
    stop: function() {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    },

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
    lines: function(el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill(color, shadow) {
        return css(createEl(), {
          position: 'absolute',
          width: (o.length+o.width) + 'px',
          height: o.width + 'px',
          background: color,
          boxShadow: shadow,
          transformOrigin: 'left',
          transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
          borderRadius: (o.corners * o.width>>1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute',
          top: 1+~(o.width/2) + 'px',
          transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
          opacity: o.opacity,
          animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}))
        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    },

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
    opacity: function(el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML() {

    /* Utility function to create a VML tag */
    function vml(tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function(el, o) {
      var r = o.length+o.width
        , s = 2*r

      function grp() {
        return css(
          vml('group', {
            coordsize: s + ' ' + s,
            coordorigin: -r + ' ' + -r
          }),
          { width: s, height: s }
        )
      }

      var margin = -(o.width+o.length)*2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg(i, dx, filter) {
        ins(g,
          ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
            ins(css(vml('roundrect', {arcsize: o.corners}), {
                width: r,
                height: o.width,
                left: o.radius,
                top: -o.width>>1,
                filter: filter
              }),
              vml('fill', {color: getColor(o.color, i), opacity: o.opacity}),
              vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++)
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function(el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i+o < c.childNodes.length) {
        c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

  if (!vendor(probe, 'transform') && probe.adj) initVML()
  else useCssAnimations = vendor(probe, 'animation')

  return Spinner

}));

},{}],51:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var Blocks = require('./blocks');

var BlockControl = function(type, instance_scope) {
  this.type = type;
  this.instance_scope = instance_scope;
  this.block_type = Blocks[this.type].prototype;
  this.can_be_rendered = this.block_type.toolbarEnabled;

  this._ensureElement();
};

Object.assign(BlockControl.prototype, require('./function-bind'), require('./renderable'), require('./events'), {

  tagName: 'a',
  className: "st-block-control",

  attributes: function() {
    return {
      'data-type': this.block_type.type
    };
  },

  render: function() {
    this.$el.html('<span class="st-icon">'+ _.result(this.block_type, 'icon_name') +'</span>' + _.result(this.block_type, 'title'));
    return this;
  }
});

module.exports = BlockControl;

},{"./blocks":69,"./events":77,"./function-bind":86,"./lodash":91,"./renderable":92}],52:[function(require,module,exports){
"use strict";

/*
 * SirTrevor Block Controls
 * --
 * Gives an interface for adding new Sir Trevor blocks.
 */


var Blocks = require('./blocks');
var BlockControl = require('./block-control');
var EventBus = require('./event-bus');

var BlockControls = function(available_types, instance_scope) {
  this.instance_scope = instance_scope;
  this.available_types = available_types || [];
  this._ensureElement();
  this._bindFunctions();
  this.initialize();
};

Object.assign(BlockControls.prototype, require('./function-bind'), require('./renderable'), require('./events'), {

  bound: ['handleControlButtonClick'],
  block_controls: null,

  className: "st-block-controls",

  html: "<a class='st-icon st-icon--close'>" + i18n.t("general:close") + "</a>",

  initialize: function() {
    for(var block_type in this.available_types) {
      if (Blocks.hasOwnProperty(block_type)) {
        var block_control = new BlockControl(block_type, this.instance_scope);
        if (block_control.can_be_rendered) {
          this.$el.append(block_control.render().$el);
        }
      }
    }

    this.$el.delegate('.st-block-control', 'click', this.handleControlButtonClick);
  },

  show: function() {
    this.$el.addClass('st-block-controls--active');

    EventBus.trigger('block:controls:shown');
  },

  hide: function() {
    this.$el.removeClass('st-block-controls--active');

    EventBus.trigger('block:controls:hidden');
  },

  handleControlButtonClick: function(e) {
    e.stopPropagation();

    this.trigger('createBlock', $(e.currentTarget).attr('data-type'));
  }

});

module.exports = BlockControls;

},{"./block-control":51,"./blocks":69,"./event-bus":76,"./events":77,"./function-bind":86,"./renderable":92}],53:[function(require,module,exports){
"use strict";

var BlockDeletion = function() {
  this._ensureElement();
  this._bindFunctions();
};

Object.assign(BlockDeletion.prototype, require('./function-bind'), require('./renderable'), {

  tagName: 'a',
  className: 'st-block-ui-btn st-block-ui-btn--delete st-icon',

  attributes: {
    html: 'delete',
    'data-icon': 'bin'
  }

});

module.exports = BlockDeletion;

},{"./function-bind":86,"./renderable":92}],54:[function(require,module,exports){
"use strict";

var _ = require('./lodash');

var config = require('./config');
var utils = require('./utils');
var stToHTML = require('./to-html');
var stToMarkdown = require('./to-markdown');
var BlockMixins = require('./block_mixins');

var SimpleBlock = require('./simple-block');
var BlockReorder = require('./block.reorder');
var BlockDeletion = require('./block.deletion');
var BlockPositioner = require('./block.positioner');
var Formatters = require('./formatters');
var EventBus = require('./event-bus');

var Spinner = require('spin.js');

var Block = function(data, instance_id) {
  SimpleBlock.apply(this, arguments);
};

Block.prototype = Object.create(SimpleBlock.prototype);
Block.prototype.constructor = Block;

var delete_template = [
  "<div class='st-block__ui-delete-controls'>",
  "<label class='st-block__delete-label'>",
  "<%= i18n.t('general:delete') %>",
  "</label>",
  "<a class='st-block-ui-btn st-block-ui-btn--confirm-delete st-icon' data-icon='tick'></a>",
  "<a class='st-block-ui-btn st-block-ui-btn--deny-delete st-icon' data-icon='close'></a>",
  "</div>"
].join("\n");

var drop_options = {
  html: ['<div class="st-block__dropzone">',
    '<span class="st-icon"><%= _.result(block, "icon_name") %></span>',
    '<p><%= i18n.t("general:drop", { block: "<span>" + _.result(block, "title") + "</span>" }) %>',
    '</p></div>'].join('\n'),
    re_render_on_reorder: false
};

var paste_options = {
  html: ['<input type="text" placeholder="<%= i18n.t("general:paste") %>"',
    ' class="st-block__paste-input st-paste-block">'].join('')
};

var upload_options = {
  html: [
    '<div class="st-block__upload-container">',
    '<input type="file" type="st-file-upload">',
    '<button class="st-upload-btn"><%= i18n.t("general:upload") %></button>',
    '</div>'
  ].join('\n')
};

config.defaults.Block = {
  drop_options: drop_options,
  paste_options: paste_options,
  upload_options: upload_options
};

Object.assign(Block.prototype, SimpleBlock.fn, require('./block.validations'), {

  bound: ["_handleContentPaste", "_onFocus", "_onBlur", "onDrop", "onDeleteClick",
    "clearInsertedStyles", "getSelectionForFormatter", "onBlockRender"],

    className: 'st-block st-icon--add',

    attributes: function() {
      return Object.assign(SimpleBlock.fn.attributes.call(this), {
        'data-icon-after' : "add"
      });
    },

    icon_name: 'default',

    validationFailMsg: function() {
      return i18n.t('errors:validation_fail', { type: this.title() });
    },

    editorHTML: '<div class="st-block__editor"></div>',

    toolbarEnabled: true,

    droppable: false,
    pastable: false,
    uploadable: false,
    fetchable: false,
    ajaxable: false,

    drop_options: {},
    paste_options: {},
    upload_options: {},

    formattable: true,

    _previousSelection: '',

    initialize: function() {},

    toMarkdown: function(markdown){ return markdown; },
    toHTML: function(html){ return html; },

    withMixin: function(mixin) {
      if (!_.isObject(mixin)) { return; }

      var initializeMethod = "initialize" + mixin.mixinName;

      if (_.isUndefined(this[initializeMethod])) {
        Object.assign(this, mixin);
        this[initializeMethod]();
      }
    },

    render: function() {
      this.beforeBlockRender();
      this._setBlockInner();

      this.$editor = this.$inner.children().first();

      if(this.droppable || this.pastable || this.uploadable) {
        var input_html = $("<div>", { 'class': 'st-block__inputs' });
        this.$inner.append(input_html);
        this.$inputs = input_html;
      }

      if (this.hasTextBlock) { this._initTextBlocks(); }
      if (this.droppable) { this.withMixin(BlockMixins.Droppable); }
      if (this.pastable) { this.withMixin(BlockMixins.Pastable); }
      if (this.uploadable) { this.withMixin(BlockMixins.Uploadable); }
      if (this.fetchable) { this.withMixin(BlockMixins.Fetchable); }
      if (this.controllable) { this.withMixin(BlockMixins.Controllable); }

      if (this.formattable) { this._initFormatting(); }

      this._blockPrepare();

      return this;
    },

    remove: function() {
      if (this.ajaxable) {
        this.resolveAllInQueue();
      }

      this.$el.remove();
    },

    loading: function() {
      if(!_.isUndefined(this.spinner)) { this.ready(); }

      this.spinner = new Spinner(config.defaults.spinner);
      this.spinner.spin(this.$el[0]);

      this.$el.addClass('st--is-loading');
    },

    ready: function() {
      this.$el.removeClass('st--is-loading');
      if (!_.isUndefined(this.spinner)) {
        this.spinner.stop();
        delete this.spinner;
      }
    },

    /* Generic toData implementation.
     * Can be overwritten, although hopefully this will cover most situations
     */
    toData: function() {
      utils.log("toData for " + this.blockID);

      var dataObj = {};

      /* Simple to start. Add conditions later */
      if (this.hasTextBlock()) {
        var content = this.getTextBlock().html();
        if (content.length > 0) {
          dataObj.text = stToMarkdown(content, this.type);
        }
      }

      // Add any inputs to the data attr
      if(this.$(':input').not('.st-paste-block').length > 0) {
        this.$(':input').each(function(index,input){
          if (input.getAttribute('name')) {
            dataObj[input.getAttribute('name')] = input.value;
          }
        });
      }

      // Set
      if(!_.isEmpty(dataObj)) {
        this.setData(dataObj);
      }
    },

    /* Generic implementation to tell us when the block is active */
    focus: function() {
      this.getTextBlock().focus();
    },

    blur: function() {
      this.getTextBlock().blur();
    },

    onFocus: function() {
      this.getTextBlock().bind('focus', this._onFocus);
    },

    onBlur: function() {
      this.getTextBlock().bind('blur', this._onBlur);
    },

    /*
     * Event handlers
     */

    _onFocus: function() {
      this.trigger('blockFocus', this.$el);
    },

    _onBlur: function() {},

    onDrop: function(dataTransferObj) {},

    onDeleteClick: function(ev) {
      ev.preventDefault();

      var onDeleteConfirm = function(e) {
        e.preventDefault();
        this.trigger('removeBlock', this.blockID);
      };

      var onDeleteDeny = function(e) {
        e.preventDefault();
        this.$el.removeClass('st-block--delete-active');
        $delete_el.remove();
      };

      if (this.isEmpty()) {
        onDeleteConfirm.call(this, new Event('click'));
        return;
      }

      this.$inner.append(_.template(delete_template));
      this.$el.addClass('st-block--delete-active');

      var $delete_el = this.$inner.find('.st-block__ui-delete-controls');

      this.$inner.on('click', '.st-block-ui-btn--confirm-delete',
                     onDeleteConfirm.bind(this))
                     .on('click', '.st-block-ui-btn--deny-delete',
                         onDeleteDeny.bind(this));
    },

    pastedMarkdownToHTML: function(content) {
      return stToHTML(stToMarkdown(content, this.type), this.type);
    },

    onContentPasted: function(event, target){
      target.html(this.pastedMarkdownToHTML(target[0].innerHTML));
      this.getTextBlock().caretToEnd();
    },

    beforeLoadingData: function() {
      this.loading();

      if(this.droppable || this.uploadable || this.pastable) {
        this.$editor.show();
        this.$inputs.hide();
      }

      SimpleBlock.fn.beforeLoadingData.call(this);

      this.ready();
    },

    _handleContentPaste: function(ev) {
      setTimeout(this.onContentPasted.bind(this, ev, $(ev.currentTarget)), 0);
    },

    _getBlockClass: function() {
      return 'st-block--' + this.className;
    },

    /*
     * Init functions for adding functionality
     */

    _initUIComponents: function() {

      var positioner = new BlockPositioner(this.$el, this.instanceID);

      this._withUIComponent(
        positioner, '.st-block-ui-btn--reorder', positioner.toggle
      );

      this._withUIComponent(
        new BlockReorder(this.$el)
      );

      this._withUIComponent(
        new BlockDeletion(), '.st-block-ui-btn--delete', this.onDeleteClick
      );

      this.onFocus();
      this.onBlur();
    },

    _initFormatting: function() {
      // Enable formatting keyboard input
      var formatter;
      for (var name in Formatters) {
        if (Formatters.hasOwnProperty(name)) {
          formatter = Formatters[name];
          if (!_.isUndefined(formatter.keyCode)) {
            formatter._bindToBlock(this.$el);
          }
        }
      }
    },

    _initTextBlocks: function() {
      this.getTextBlock()
      .bind('paste', this._handleContentPaste)
      .bind('keyup', this.getSelectionForFormatter)
      .bind('mouseup', this.getSelectionForFormatter)
      .bind('DOMNodeInserted', this.clearInsertedStyles);
    },

    getSelectionForFormatter: function() {
      var block = this;
      setTimeout(function() {
        var selection = window.getSelection(),
        selectionStr = selection.toString().trim(),
        eventType = (selectionStr === '') ? 'hide' : 'position';

        EventBus.trigger('formatter:' + eventType, block);
      }, 1);
    },

    clearInsertedStyles: function(e) {
      var target = e.target;
      target.removeAttribute('style'); // Hacky fix for Chrome.
    },

    hasTextBlock: function() {
      return this.getTextBlock().length > 0;
    },

    getTextBlock: function() {
      if (_.isUndefined(this.text_block)) {
        this.text_block = this.$('.st-text-block');
      }

      return this.text_block;
    },

    isEmpty: function() {
      return _.isEmpty(this.saveAndGetData());
    }

});

Block.extend = require('./helpers/extend'); // Allow our Block to be extended.

module.exports = Block;

},{"./block.deletion":53,"./block.positioner":55,"./block.reorder":56,"./block.validations":58,"./block_mixins":63,"./config":74,"./event-bus":76,"./formatters":85,"./helpers/extend":88,"./lodash":91,"./simple-block":93,"./to-html":94,"./to-markdown":95,"./utils":96,"spin.js":50}],55:[function(require,module,exports){
"use strict";


var EventBus = require('./event-bus');

var template = [
  "<div class='st-block-positioner__inner'>",
  "<span class='st-block-positioner__selected-value'></span>",
  "<select class='st-block-positioner__select'></select>",
  "</div>"
].join("\n");

var BlockPositioner = function(block_element, instance_id) {
  this.$block = block_element;
  this.instanceID = instance_id;
  this.total_blocks = 0;

  this._ensureElement();
  this._bindFunctions();

  this.initialize();
};

Object.assign(BlockPositioner.prototype, require('./function-bind'), require('./renderable'), {

  bound: ['onBlockCountChange', 'onSelectChange', 'toggle', 'show', 'hide'],

  className: 'st-block-positioner',
  visibleClass: 'st-block-positioner--is-visible',

  initialize: function(){
    this.$el.append(template);
    this.$select = this.$('.st-block-positioner__select');

    this.$select.on('change', this.onSelectChange);

    EventBus.on(this.instanceID + ":blocks:count_update", this.onBlockCountChange);
  },

  onBlockCountChange: function(new_count) {
    if (new_count !== this.total_blocks) {
      this.total_blocks = new_count;
      this.renderPositionList();
    }
  },

  onSelectChange: function() {
    var val = this.$select.val();
    if (val !== 0) {
      EventBus.trigger(this.instanceID + ":blocks:change_position",
                       this.$block, val, (val === 1 ? 'before' : 'after'));
                       this.toggle();
    }
  },

  renderPositionList: function() {
    var inner = "<option value='0'>" + i18n.t("general:position") + "</option>";
    for(var i = 1; i <= this.total_blocks; i++) {
      inner += "<option value="+i+">"+i+"</option>";
    }
    this.$select.html(inner);
  },

  toggle: function() {
    this.$select.val(0);
    this.$el.toggleClass(this.visibleClass);
  },

  show: function(){
    this.$el.addClass(this.visibleClass);
  },

  hide: function(){
    this.$el.removeClass(this.visibleClass);
  }

});

module.exports = BlockPositioner;

},{"./event-bus":76,"./function-bind":86,"./renderable":92}],56:[function(require,module,exports){
"use strict";

var _ = require('./lodash');

var EventBus = require('./event-bus');

var BlockReorder = function(block_element) {
  this.$block = block_element;
  this.blockID = this.$block.attr('id');

  this._ensureElement();
  this._bindFunctions();

  this.initialize();
};

Object.assign(BlockReorder.prototype, require('./function-bind'), require('./renderable'), {

  bound: ['onMouseDown', 'onClick', 'onDragStart', 'onDragEnd', 'onDrag', 'onDrop'],

  className: 'st-block-ui-btn st-block-ui-btn--reorder st-icon',
  tagName: 'a',

  attributes: function() {
    return {
      'html': 'reorder',
      'draggable': 'true',
      'data-icon': 'move'
    };
  },

  initialize: function() {
    this.$el.bind('mousedown touchstart', this.onMouseDown)
    .bind('click', this.onClick)
    .bind('dragstart', this.onDragStart)
    .bind('dragend touchend', this.onDragEnd)
    .bind('drag touchmove', this.onDrag);

    this.$block.dropArea()
    .bind('drop', this.onDrop);
  },

  onMouseDown: function() {
    EventBus.trigger("block:reorder:down", this.blockID);
  },

  onDrop: function(ev) {
    ev.preventDefault();

    var dropped_on = this.$block,
    item_id = ev.originalEvent.dataTransfer.getData("text/plain"),
    block = $('#' + item_id);

    if (!_.isUndefined(item_id) &&
        !_.isEmpty(block) &&
          dropped_on.attr('id') !== item_id &&
            dropped_on.attr('data-instance') === block.attr('data-instance')
       ) {
         dropped_on.after(block);
       }
       EventBus.trigger("block:reorder:dropped", item_id);
  },

  onDragStart: function(ev) {
    var btn = $(ev.currentTarget).parent();

    ev.originalEvent.dataTransfer.setDragImage(this.$block[0], btn.position().left, btn.position().top);
    ev.originalEvent.dataTransfer.setData('Text', this.blockID);

    EventBus.trigger("block:reorder:dragstart", this.blockID);
    this.$block.addClass('st-block--dragging');
  },

  onDragEnd: function(ev) {
    EventBus.trigger("block:reorder:dragend", this.blockID);
    this.$block.removeClass('st-block--dragging');
  },

  onDrag: function(ev){},

  onClick: function() {
  },

  render: function() {
    return this;
  }

});

module.exports = BlockReorder;

},{"./event-bus":76,"./function-bind":86,"./lodash":91,"./renderable":92}],57:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var utils = require('./utils');

var EventBus = require('./event-bus');

module.exports = {

  blockStorage: {},

  createStore: function(blockData) {
    this.blockStorage = {
      type: utils.underscored(this.type),
      data: blockData || {}
    };
  },

  save: function() { this.toData(); },

  saveAndReturnData: function() {
    this.save();
    return this.blockStorage;
  },

  saveAndGetData: function() {
    var store = this.saveAndReturnData();
    return store.data || store;
  },

  getData: function() {
    return this.blockStorage.data;
  },

  setData: function(blockData) {
    utils.log("Setting data for block " + this.blockID);
    Object.assign(this.blockStorage.data, blockData || {});
  },

  setAndRetrieveData: function(blockData) {
    this.setData(blockData);
    return this.getData();
  },

  setAndLoadData: function(blockData) {
    this.setData(blockData);
    this.beforeLoadingData();
  },

  toData: function() {},
  loadData: function() {},

  beforeLoadingData: function() {
    utils.log("loadData for " + this.blockID);
    EventBus.trigger("block:loadData", this.blockID);
    this.loadData(this.getData());
  },

  _loadData: function() {
    utils.log("_loadData is deprecated and will be removed in the future. Please use beforeLoadingData instead.");
    this.beforeLoadingData();
  },

  checkAndLoadData: function() {
    if (!_.isEmpty(this.getData())) {
      this.beforeLoadingData();
    }
  }

};

},{"./event-bus":76,"./lodash":91,"./utils":96}],58:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var utils = require('./utils');

var bestNameFromField = function(field) {
  var msg = field.attr("data-st-name") || field.attr("name");

  if (!msg) {
    msg = 'Field';
  }

  return utils.capitalize(msg);
};

module.exports = {

  errors: [],

  valid: function(){
    this.performValidations();
    return this.errors.length === 0;
  },

  // This method actually does the leg work
  // of running our validators and custom validators
  performValidations: function() {
    this.resetErrors();

    var required_fields = this.$('.st-required');
    required_fields.each(function (i, f) {
      this.validateField(f);
    }.bind(this));
    this.validations.forEach(this.runValidator, this);

    this.$el.toggleClass('st-block--with-errors', this.errors.length > 0);
  },

  // Everything in here should be a function that returns true or false
  validations: [],

  validateField: function(field) {
    field = $(field);

    var content = field.attr('contenteditable') ? field.text() : field.val();

    if (content.length === 0) {
      this.setError(field, i18n.t("errors:block_empty",
                                 { name: bestNameFromField(field) }));
    }
  },

  runValidator: function(validator) {
    if (!_.isUndefined(this[validator])) {
      this[validator].call(this);
    }
  },

  setError: function(field, reason) {
    var $msg = this.addMessage(reason, "st-msg--error");
    field.addClass('st-error');

    this.errors.push({ field: field, reason: reason, msg: $msg });
  },

  resetErrors: function() {
    this.errors.forEach(function(error){
      error.field.removeClass('st-error');
      error.msg.remove();
    });

    this.$messages.removeClass("st-block__messages--is-visible");
    this.errors = [];
  }

};

},{"./lodash":91,"./utils":96}],59:[function(require,module,exports){
"use strict";

var utils = require('../utils');

var EventBus = require('../event-bus');

module.exports = {

  mixinName: "Ajaxable",

  ajaxable: true,

  initializeAjaxable: function(){
    this._queued = [];
  },

  addQueuedItem: function(name, deferred) {
    utils.log("Adding queued item for " + this.blockID + " called " + name);
    EventBus.trigger("onUploadStart", this.blockID);

    this._queued.push({ name: name, deferred: deferred });
  },

  removeQueuedItem: function(name) {
    utils.log("Removing queued item for " + this.blockID + " called " + name);
    EventBus.trigger("onUploadStop", this.blockID);

    this._queued = this._queued.filter(function(queued) {
      return queued.name !== name;
    });
  },

  hasItemsInQueue: function() {
    return this._queued.length > 0;
  },

  resolveAllInQueue: function() {
    this._queued.forEach(function(item){
      utils.log("Aborting queued request: " + item.name);
      item.deferred.abort();
    }, this);
  }

};

},{"../event-bus":76,"../utils":96}],60:[function(require,module,exports){
"use strict";

var utils = require('../utils');

module.exports = {

  mixinName: "Controllable",

  initializeControllable: function() {
    utils.log("Adding controllable to block " + this.blockID);
    this.$control_ui = $('<div>', {'class': 'st-block__control-ui'});
    Object.keys(this.controls).forEach(
      function(cmd) {
        // Bind configured handler to current block context
        this.addUiControl(cmd, this.controls[cmd].bind(this));
      },
      this
    );
    this.$inner.append(this.$control_ui);
  },

  getControlTemplate: function(cmd) {
    return $("<a>",
      { 'data-icon': cmd,
        'class': 'st-icon st-block-control-ui-btn st-block-control-ui-btn--' + cmd
      });
  },

  addUiControl: function(cmd, handler) {
    this.$control_ui.append(this.getControlTemplate(cmd));
    this.$control_ui.on('click', '.st-block-control-ui-btn--' + cmd, handler);
  }
};

},{"../utils":96}],61:[function(require,module,exports){
"use strict";

/* Adds drop functionaltiy to this block */

var _ = require('../lodash');
var config = require('../config');
var utils = require('../utils');

var EventBus = require('../event-bus');

module.exports = {

  mixinName: "Droppable",
  valid_drop_file_types: ['File', 'Files', 'text/plain', 'text/uri-list'],

  initializeDroppable: function() {
    utils.log("Adding droppable to block " + this.blockID);

    this.drop_options = Object.assign({}, config.defaults.Block.drop_options, this.drop_options);

    var drop_html = $(_.template(this.drop_options.html)({ block: this, _: _ }));

    this.$editor.hide();
    this.$inputs.append(drop_html);
    this.$dropzone = drop_html;

    // Bind our drop event
    this.$dropzone.dropArea()
                  .bind('drop', this._handleDrop.bind(this));

    this.$inner.addClass('st-block__inner--droppable');
  },

  _handleDrop: function(e) {
    e.preventDefault();

    e = e.originalEvent;

    var el = $(e.target),
        types = e.dataTransfer.types;

    el.removeClass('st-dropzone--dragover');

    /*
      Check the type we just received,
      delegate it away to our blockTypes to process
    */

    if (types &&
        types.some(function(type) {
                     return this.valid_drop_file_types.includes(type);
                   }, this)) {
      this.onDrop(e.dataTransfer);
    }

    EventBus.trigger('block:content:dropped', this.blockID);
  }

};

},{"../config":74,"../event-bus":76,"../lodash":91,"../utils":96}],62:[function(require,module,exports){
"use strict";

var _ = require('../lodash');

module.exports = {

  mixinName: "Fetchable",

  initializeFetchable: function(){
    this.withMixin(require('./ajaxable'));
  },

  fetch: function(options, success, failure){
    var uid = _.uniqueId(this.blockID + "_fetch"),
        xhr = $.ajax(options);

    this.resetMessages();
    this.addQueuedItem(uid, xhr);

    if(!_.isUndefined(success)) {
      xhr.done(success.bind(this));
    }

    if(!_.isUndefined(failure)) {
      xhr.fail(failure.bind(this));
    }

    xhr.always(this.removeQueuedItem.bind(this, uid));

    return xhr;
  }

};

},{"../lodash":91,"./ajaxable":59}],63:[function(require,module,exports){
"use strict";

module.exports = {
  Ajaxable: require('./ajaxable.js'),
  Controllable: require('./controllable.js'),
  Droppable: require('./droppable.js'),
  Fetchable: require('./fetchable.js'),
  Pastable: require('./pastable.js'),
  Uploadable: require('./uploadable.js'),
};

},{"./ajaxable.js":59,"./controllable.js":60,"./droppable.js":61,"./fetchable.js":62,"./pastable.js":64,"./uploadable.js":65}],64:[function(require,module,exports){
"use strict";

var _ = require('../lodash');
var config = require('../config');
var utils = require('../utils');

module.exports = {

  mixinName: "Pastable",

  initializePastable: function() {
    utils.log("Adding pastable to block " + this.blockID);

    this.paste_options = Object.assign({}, config.defaults.Block.paste_options, this.paste_options);
    this.$inputs.append(_.template(this.paste_options.html, this));

    this.$('.st-paste-block')
      .bind('click', function(){ $(this).select(); })
      .bind('paste', this._handleContentPaste)
      .bind('submit', this._handleContentPaste);
  }

};

},{"../config":74,"../lodash":91,"../utils":96}],65:[function(require,module,exports){
"use strict";

var _ = require('../lodash');
var config = require('../config');
var utils = require('../utils');

var fileUploader = require('../extensions/sir-trevor.uploader');

module.exports = {

  mixinName: "Uploadable",

  uploadsCount: 0,

  initializeUploadable: function() {
    utils.log("Adding uploadable to block " + this.blockID);
    this.withMixin(require('./ajaxable'));

    this.upload_options = Object.assign({}, config.defaults.Block.upload_options, this.upload_options);
    this.$inputs.append(_.template(this.upload_options.html, this));
  },

  uploader: function(file, success, failure){
    return fileUploader(this, file, success, failure);
  }

};

},{"../config":74,"../extensions/sir-trevor.uploader":80,"../lodash":91,"../utils":96,"./ajaxable":59}],66:[function(require,module,exports){
"use strict";

/*
  Block Quote
*/

var _ = require('../lodash');

var Block = require('../block');
var stToHTML = require('../to-html');

var template = _.template([
  '<blockquote class="st-required st-text-block" contenteditable="true"></blockquote>',
  '<label class="st-input-label"> <%= i18n.t("blocks:quote:credit_field") %></label>',
  '<input maxlength="140" name="cite" placeholder="<%= i18n.t("blocks:quote:credit_field") %>"',
  ' class="st-input-string st-required js-cite-input" type="text" />'
].join("\n"));

module.exports = Block.extend({

  type: "quote",

  title: function(){ return i18n.t('blocks:quote:title'); },

  icon_name: 'quote',

  editorHTML: function() {
    return template(this);
  },

  loadData: function(data){
    this.getTextBlock().html(stToHTML(data.text, this.type));
    this.$('.js-cite-input').val(data.cite);
  },

  toMarkdown: function(markdown) {
    return markdown.replace(/^(.+)$/mg,"> $1");
  }

});

},{"../block":54,"../lodash":91,"../to-html":94}],67:[function(require,module,exports){
"use strict";

/*
  Heading Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');

module.exports = Block.extend({

  type: 'heading',

  title: function(){ return i18n.t('blocks:heading:title'); },

  editorHTML: '<div class="st-required st-text-block st-text-block--heading" contenteditable="true"></div>',

  icon_name: 'heading',

  loadData: function(data){
    this.getTextBlock().html(stToHTML(data.text, this.type));
  }
});

},{"../block":54,"../to-html":94}],68:[function(require,module,exports){
"use strict";

/*
  Simple Image Block
*/


var Block = require('../block');

module.exports = Block.extend({

  type: "image",
  title: function() { return i18n.t('blocks:image:title'); },

  droppable: true,
  uploadable: true,

  icon_name: 'image',

  loadData: function(data){
    // Create our image tag
    this.$editor.html($('<img>', { src: data.file.url }));
  },

  onBlockRender: function(){
    /* Setup the upload button */
    this.$inputs.find('button').bind('click', function(ev){ ev.preventDefault(); });
    this.$inputs.find('input').on('change', (function(ev) {
      this.onDrop(ev.currentTarget);
    }).bind(this));
  },

  onUploadSuccess : function(data) {
    this.setData(data);
    this.ready();
  },

  onUploadError : function(jqXHR, status, errorThrown){
    this.addMessage(i18n.t('blocks:image:upload_error'));
    this.ready();
  },

  onDrop: function(transferData){
    var file = transferData.files[0],
        urlAPI = (typeof URL !== "undefined") ? URL : (typeof webkitURL !== "undefined") ? webkitURL : null;

    // Handle one upload at a time
    if (/image/.test(file.type)) {
      this.loading();
      // Show this image on here
      this.$inputs.hide();
      this.$editor.html($('<img>', { src: urlAPI.createObjectURL(file) })).show();

      this.uploader(file, this.onUploadSuccess, this.onUploadError);
    }
  }
});

},{"../block":54}],69:[function(require,module,exports){
"use strict";

module.exports = {
  Text: require('./text'),
  Quote: require('./block-quote'),
  Image: require('./image'),
  Heading: require('./heading'),
  List: require('./unordered-list'),
  Tweet: require('./tweet'),
  Video: require('./video'),
};

},{"./block-quote":66,"./heading":67,"./image":68,"./text":70,"./tweet":71,"./unordered-list":72,"./video":73}],70:[function(require,module,exports){
"use strict";

/*
  Text Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');

module.exports = Block.extend({

  type: "text",

  title: function() { return i18n.t('blocks:text:title'); },

  editorHTML: '<div class="st-required st-text-block" contenteditable="true"></div>',

  icon_name: 'text',

  loadData: function(data){
    this.getTextBlock().html(stToHTML(data.text, this.type));
  }
});

},{"../block":54,"../to-html":94}],71:[function(require,module,exports){
"use strict";

var _ = require('../lodash');
var utils = require('../utils');

var Block = require('../block');

var tweet_template = _.template([
  "<blockquote class='twitter-tweet' align='center'>",
  "<p><%= text %></p>",
  "&mdash; <%= user.name %> (@<%= user.screen_name %>)",
  "<a href='<%= status_url %>' data-datetime='<%= created_at %>'><%= created_at %></a>",
  "</blockquote>",
  '<script src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'
].join("\n"));

module.exports = Block.extend({

  type: "tweet",
  droppable: true,
  pastable: true,
  fetchable: true,

  drop_options: {
    re_render_on_reorder: true
  },

  title: function(){ return i18n.t('blocks:tweet:title'); },

  fetchUrl: function(tweetID) {
    return "/tweets/?tweet_id=" + tweetID;
  },

  icon_name: 'twitter',

  loadData: function(data) {
    if (_.isUndefined(data.status_url)) { data.status_url = ''; }
    this.$inner.find('iframe').remove();
    this.$inner.prepend(tweet_template(data));
  },

  onContentPasted: function(event){
    // Content pasted. Delegate to the drop parse method
    var input = $(event.target),
    val = input.val();

    // Pass this to the same handler as onDrop
    this.handleTwitterDropPaste(val);
  },

  handleTwitterDropPaste: function(url){
    if (!this.validTweetUrl(url)) {
      utils.log("Invalid Tweet URL");
      return;
    }

    // Twitter status
    var tweetID = url.match(/[^\/]+$/);
    if (!_.isEmpty(tweetID)) {
      this.loading();
      tweetID = tweetID[0];

      var ajaxOptions = {
        url: this.fetchUrl(tweetID),
        dataType: "json"
      };

      this.fetch(ajaxOptions, this.onTweetSuccess, this.onTweetFail);
    }
  },

  validTweetUrl: function(url) {
    return (utils.isURI(url) &&
            url.indexOf("twitter") !== -1 &&
            url.indexOf("status") !== -1);
  },

  onTweetSuccess: function(data) {
    // Parse the twitter object into something a bit slimmer..
    var obj = {
      user: {
        profile_image_url: data.user.profile_image_url,
        profile_image_url_https: data.user.profile_image_url_https,
        screen_name: data.user.screen_name,
        name: data.user.name
      },
      id: data.id_str,
      text: data.text,
      created_at: data.created_at,
      entities: data.entities,
      status_url: "https://twitter.com/" + data.user.screen_name + "/status/" + data.id_str
    };

    this.setAndLoadData(obj);
    this.ready();
  },

  onTweetFail: function() {
    this.addMessage(i18n.t("blocks:tweet:fetch_error"));
    this.ready();
  },

  onDrop: function(transferData){
    var url = transferData.getData('text/plain');
    this.handleTwitterDropPaste(url);
  }
});

},{"../block":54,"../lodash":91,"../utils":96}],72:[function(require,module,exports){
"use strict";

/*
   Unordered List
   */

var _ = require('../lodash');

var Block = require('../block');
var stToHTML = require('../to-html');

var template = '<div class="st-text-block st-required" contenteditable="true"><ul><li></li></ul></div>';

module.exports = Block.extend({

  type: 'list',

  title: function() { return i18n.t('blocks:list:title'); },

  icon_name: 'list',

  editorHTML: function() {
    return _.template(template, this);
  },

  loadData: function(data){
    this.getTextBlock().html("<ul>" + stToHTML(data.text, this.type) + "</ul>");
  },

  onBlockRender: function() {
    this.checkForList = this.checkForList.bind(this);
    this.getTextBlock().on('click keyup', this.checkForList);
  },

  checkForList: function() {
    if (this.$('ul').length === 0) {
      document.execCommand("insertUnorderedList", false, false);
    }
  },

  toMarkdown: function(markdown) {
    return markdown.replace(/<\/li>/mg,"\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/^(.+)$/mg," - $1");
  },

  toHTML: function(html) {
    html = html.replace(/^ - (.+)$/mg,"<li>$1</li>")
    .replace(/\n/mg, "");

    return html;
  },

  onContentPasted: function(event, target) {
    this.$('ul').html(
      this.pastedMarkdownToHTML(target[0].innerHTML));
    this.getTextBlock().caretToEnd();
  },

  isEmpty: function() {
    return _.isEmpty(this.saveAndGetData().text);
  }

});

},{"../block":54,"../lodash":91,"../to-html":94}],73:[function(require,module,exports){
"use strict";

var _ = require('../lodash');
var utils = require('../utils');

var Block = require('../block');

module.exports = Block.extend({

  // more providers at https://gist.github.com/jeffling/a9629ae28e076785a14f
  providers: {
    vimeo: {
      regex: /(?:http[s]?:\/\/)?(?:www.)?vimeo.com\/(.+)/,
      html: "<iframe src=\"{{protocol}}//player.vimeo.com/video/{{remote_id}}?title=0&byline=0\" width=\"580\" height=\"320\" frameborder=\"0\"></iframe>"
    },
    youtube: {
      regex: /(?:http[s]?:\/\/)?(?:www.)?(?:(?:youtube.com\/watch\?(?:.*)(?:v=))|(?:youtu.be\/))([^&].+)/,
      html: "<iframe src=\"{{protocol}}//www.youtube.com/embed/{{remote_id}}\" width=\"580\" height=\"320\" frameborder=\"0\" allowfullscreen></iframe>"
    }
  },

  type: 'video',
  title: function() { return i18n.t('blocks:video:title'); },

  droppable: true,
  pastable: true,

  icon_name: 'video',

  loadData: function(data){
    if (!this.providers.hasOwnProperty(data.source)) { return; }

    if (this.providers[data.source].square) {
      this.$editor.addClass('st-block__editor--with-square-media');
    } else {
      this.$editor.addClass('st-block__editor--with-sixteen-by-nine-media');
    }

    var embed_string = this.providers[data.source].html
    .replace('{{protocol}}', window.location.protocol)
    .replace('{{remote_id}}', data.remote_id)
    .replace('{{width}}', this.$editor.width()); // for videos that can't resize automatically like vine

    this.$editor.html(embed_string);
  },

  onContentPasted: function(event){
    this.handleDropPaste($(event.target).val());
  },

  handleDropPaste: function(url){
    if(!utils.isURI(url)) {
      return;
    }

    var match, data;

    this.providers.forEach(function(provider, index) {
      match = provider.regex.exec(url);

      if(match !== null && !_.isUndefined(match[1])) {
        data = {
          source: index,
          remote_id: match[1]
        };

        this.setAndLoadData(data);
      }
    }, this);
  },

  onDrop: function(transferData){
    var url = transferData.getData('text/plain');
    this.handleDropPaste(url);
  }
});


},{"../block":54,"../lodash":91,"../utils":96}],74:[function(require,module,exports){
"use strict";

module.exports = {
  debug: false,
  skipValidation: false,
  version: "0.3.0",
  language: "en",

  instances: [],

  defaults: {
    defaultType: false,
    spinner: {
      className: 'st-spinner',
      lines: 9,
      length: 8,
      width: 3,
      radius: 6,
      color: '#000',
      speed: 1.4,
      trail: 57,
      shadow: false,
      left: '50%',
      top: '50%'
    },
    blockLimit: 0,
    blockTypeLimits: {},
    required: [],
    uploadUrl: '/attachments',
    baseImageUrl: '/sir-trevor-uploads/',
    errorsContainer: undefined,
    toMarkdown: {
      aggresiveHTMLStrip: false
    }
  }
};

},{}],75:[function(require,module,exports){
"use strict";

/*
 * Sir Trevor Editor
 * --
 * Represents one Sir Trevor editor instance (with multiple blocks)
 * Each block references this instance.
 * BlockTypes are global however.
 */

var _ = require('./lodash');
var config = require('./config');
var utils = require('./utils');

var EventBus = require('./event-bus');
var FormEvents = require('./form-events');
var Blocks = require('./blocks');
var BlockControls = require('./block-controls');
var FloatingBlockControls = require('./floating-block-controls');
var FormatBar = require('./format-bar');
var editorStore = require('./extensions/sir-trevor.editor-store');

var Editor = function(options) {
  this.initialize(options);
};

Object.assign(Editor.prototype, require('./function-bind'), require('./events'), {

  bound: ['onFormSubmit', 'showBlockControls', 'hideAllTheThings',
    'hideBlockControls', 'onNewBlockCreated', 'changeBlockPosition',
    'onBlockDragStart', 'onBlockDragEnd', 'removeBlockDragOver',
    'onBlockDropped', 'createBlock'], 

  events: {
    'block:reorder:down':       'hideBlockControls',
    'block:reorder:dragstart':  'onBlockDragStart',
    'block:reorder:dragend':    'onBlockDragEnd',
    'block:content:dropped':    'removeBlockDragOver',
    'block:reorder:dropped':    'onBlockDropped',
    'block:create:new':         'onNewBlockCreated'
  },

  initialize: function(options) {
    utils.log("Init SirTrevor.Editor");

    this.blockTypes = {};
    this.blockCounts = {}; // Cached block type counts
    this.blocks = []; // Block references
    this.errors = [];
    this.options = Object.assign({}, config.defaults, options || {});
    this.ID = _.uniqueId('st-editor-');

    if (!this._ensureAndSetElements()) { return false; }

    if(!_.isUndefined(this.options.onEditorRender) && _.isFunction(this.options.onEditorRender)) {
      this.onEditorRender = this.options.onEditorRender;
    }

    this._setRequired();
    this._setBlocksTypes();
    this._bindFunctions();

    this.store("create");

    config.instances.push(this);

    this.build();

    FormEvents.bindFormSubmit(this.$form);
  },

  /* Build the Editor instance.
   * Check to see if we've been passed JSON already, and if not try and create
   * a default block. If we have JSON then we need to build all of our blocks
   * from this.
   */
  build: function() {
    this.$el.hide();

    this.block_controls = new BlockControls(this.blockTypes, this.ID);
    this.fl_block_controls = new FloatingBlockControls(this.$wrapper, this.ID);
    this.formatBar = new FormatBar(this.options.formatBar);

    this.listenTo(this.block_controls, 'createBlock', this.createBlock);
    this.listenTo(this.fl_block_controls, 'showBlockControls', this.showBlockControls);

    this._setEvents();

    EventBus.on(this.ID + ":blocks:change_position", this.changeBlockPosition);
    EventBus.on("formatter:position", this.formatBar.renderBySelection);
    EventBus.on("formatter:hide", this.formatBar.hide);

    this.$wrapper.prepend(this.fl_block_controls.render().$el);
    $(document.body).append(this.formatBar.render().$el);
    this.$outer.append(this.block_controls.render().$el);

    $(window).bind('click.sirtrevor', this.hideAllTheThings);

    var store = this.store("read");

    if (store.data.length > 0) {
      store.data.forEach(function(block){
        utils.log('Creating: ' + block.type);
        this.createBlock(block.type, block.data);
      }, this);
    } else if (this.options.defaultType !== false) {
      this.createBlock(this.options.defaultType, {});
    }

    this.$wrapper.addClass('st-ready');

    if(!_.isUndefined(this.onEditorRender)) {
      this.onEditorRender();
    }
  },

  destroy: function() {
    // Destroy the rendered sub views
    this.formatBar.destroy();
    this.fl_block_controls.destroy();
    this.block_controls.destroy();

    // Destroy all blocks
    this.blocks.forEach(function(block) {
      this.removeBlock(block.blockID);
    }, this);

    // Stop listening to events
    this.stopListening();

    // Cleanup element
    var el = this.$el.detach();

    // Remove instance
    config.instances = config.instances.filter(function(instance) {
      return instance.ID !== this.ID;
    }, this);

    // Clear the store
    this.store("reset");

    this.$outer.replaceWith(el);
  },

  reinitialize: function(options) {
    this.destroy();
    this.initialize(options || this.options);
  },

  _setEvents: function() {
    Object.keys(this.events).forEach(function(type) {
      EventBus.on(type, this[this.events[type]], this);
    }, this);
  },

  hideAllTheThings: function(e) {
    this.block_controls.hide();
    this.formatBar.hide();

    if (!_.isUndefined(this.block_controls.current_container)) {
      this.block_controls.current_container.removeClass("with-st-controls");
    }
  },

  showBlockControls: function(container) {
    if (!_.isUndefined(this.block_controls.current_container)) {
      this.block_controls.current_container.removeClass("with-st-controls");
    }

    this.block_controls.show();

    container.append(this.block_controls.$el.detach());
    container.addClass('with-st-controls');

    this.block_controls.current_container = container;
  },

  store: function(method, options){
    return editorStore(this, method, options || {});
  },

  /* Create an instance of a block from an available type.  We have to check
   * the number of blocks we're allowed to create before adding one and handle
   * fails accordingly.  A block will have a reference to an Editor instance &
   * the parent BlockType.  We also have to remember to store static counts for
   * how many blocks we have, and keep a nice array of all the blocks
   * available.
   */
  createBlock: function(type, data, render_at) {
    type = utils.classify(type);

    if(this._blockLimitReached()) {
      utils.log("Cannot add any more blocks. Limit reached.");
      return false;
    }

    if (!this._isBlockTypeAvailable(type)) {
      utils.log("Block type not available " + type);
      return false;
    }

    // Can we have another one of these blocks?
    if (!this._canAddBlockType(type)) {
      utils.log("Block Limit reached for type " + type);
      return false;
    }

    var block = new Blocks[type](data, this.ID);

    this._renderInPosition(block.render().$el);

    this.listenTo(block, 'removeBlock', this.removeBlock);

    this.blocks.push(block);
    this._incrementBlockTypeCount(type);

    if(!data) {
      block.focus();
    }

    EventBus.trigger(data ? "block:create:existing" : "block:create:new", block);
    utils.log("Block created of type " + type);
    block.trigger("onRender");

    this.$wrapper.toggleClass('st--block-limit-reached', this._blockLimitReached());
    this.triggerBlockCountUpdate();
  },

  onNewBlockCreated: function(block) {
    if (block.instanceID === this.ID) {
      this.hideBlockControls();
      this.scrollTo(block.$el);
    }
  },

  scrollTo: function(element) {
    $('html, body').animate({ scrollTop: element.position().top }, 300, "linear");
  },

  blockFocus: function(block) {
    this.block_controls.current_container = null;
  },

  hideBlockControls: function() {
    if (!_.isUndefined(this.block_controls.current_container)) {
      this.block_controls.current_container.removeClass("with-st-controls");
    }

    this.block_controls.hide();
  },

  removeBlockDragOver: function() {
    this.$outer.find('.st-drag-over').removeClass('st-drag-over');
  },

  triggerBlockCountUpdate: function() {
    EventBus.trigger(this.ID + ":blocks:count_update", this.blocks.length);
  },

  changeBlockPosition: function($block, selectedPosition) {
    selectedPosition = selectedPosition - 1;

    var blockPosition = this.getBlockPosition($block);
    var $blockBy = this.$wrapper.find('.st-block').eq(selectedPosition);

    var where = (blockPosition > selectedPosition) ? "Before" : "After";

    if($blockBy && $blockBy.attr('id') !== $block.attr('id')) {
      this.hideAllTheThings();
      $block["insert" + where]($blockBy);
      this.scrollTo($block);
    }
  },

  onBlockDropped: function(block_id) {
    this.hideAllTheThings();
    var block = this.findBlockById(block_id);
    if (!_.isUndefined(block) &&
        !_.isEmpty(block.getData()) &&
          block.drop_options.re_render_on_reorder) {
      block.beforeLoadingData();
    }
  },

  onBlockDragStart: function() {
    this.hideBlockControls();
    this.$wrapper.addClass("st-outer--is-reordering");
  },

  onBlockDragEnd: function() {
    this.removeBlockDragOver();
    this.$wrapper.removeClass("st-outer--is-reordering");
  },

  _renderInPosition: function(block) {
    if (this.block_controls.current_container) {
      this.block_controls.current_container.after(block);
    } else {
      this.$wrapper.append(block);
    }
  },

  _incrementBlockTypeCount: function(type) {
    this.blockCounts[type] = (_.isUndefined(this.blockCounts[type])) ? 1: this.blockCounts[type] + 1;
  },

  _getBlockTypeCount: function(type) {
    return (_.isUndefined(this.blockCounts[type])) ? 0 : this.blockCounts[type];
  },

  _canAddBlockType: function(type) {
    var block_type_limit = this._getBlockTypeLimit(type);

    return !(block_type_limit !== 0 && this._getBlockTypeCount(type) >= block_type_limit);
  },

  _blockLimitReached: function() {
    return (this.options.blockLimit !== 0 && this.blocks.length >= this.options.blockLimit);
  },

  removeBlock: function(block_id) {
    var block = this.findBlockById(block_id),
    type = utils.classify(block.type),
    controls = block.$el.find('.st-block-controls');

    if (controls.length) {
      this.block_controls.hide();
      this.$wrapper.prepend(controls);
    }

    this.blockCounts[type] = this.blockCounts[type] - 1;
    this.blocks = this.blocks.filter(function(item) {
      return item.blockID !== block.blockID;
    });
    this.stopListening(block);

    block.remove();

    EventBus.trigger("block:remove", block);
    this.triggerBlockCountUpdate();

    this.$wrapper.toggleClass('st--block-limit-reached', this._blockLimitReached());
  },

  performValidations : function(block, should_validate) {
    var errors = 0;

    if (!config.skipValidation && should_validate) {
      if(!block.valid()){
        this.errors.push({ text: _.result(block, 'validationFailMsg') });
        utils.log("Block " + block.blockID + " failed validation");
        ++errors;
      }
    }

    return errors;
  },

  saveBlockStateToStore: function(block) {
    var store = block.saveAndReturnData();
    if(store && !_.isEmpty(store.data)) {
      utils.log("Adding data for block " + block.blockID + " to block store");
      this.store("add", { data: store });
    }
  },

  /* Handle a form submission of this Editor instance. Validate all of our
   * blocks, and serialise all data onto the JSON objects
   */
  onFormSubmit: function(should_validate) {
    // if undefined or null or anything other than false - treat as true
    should_validate = (should_validate === false) ? false : true;

    utils.log("Handling form submission for Editor " + this.ID);

    this.removeErrors();
    this.store("reset");

    this.validateBlocks(should_validate);
    this.validateBlockTypesExist(should_validate);

    this.renderErrors();
    this.store("save");

    return this.errors.length;
  },

  validateBlocks: function(should_validate) {
    if (!this.required && (config.skipValidation && !should_validate)) {
      return false;
    }

    this.$wrapper.find('.st-block').each(function(index, block) {
      var _block = this.blocks.find(function(b) {
        return (b.blockID === $(block).attr('id'));
      });

      if (_.isUndefined(_block)) { return false; }

      // Find our block
      this.performValidations(_block, should_validate);
      this.saveBlockStateToStore(_block);
    }.bind(this));
  },

  validateBlockTypesExist: function(should_validate) {
    if (!this.required && (config.skipValidation && !should_validate)) {
      return false;
    }

    var blockTypeIterator = function(type, index) {
      if (!this._isBlockTypeAvailable(type)) { return; }

      if (this._getBlockTypeCount(type) === 0) {
        utils.log("Failed validation on required block type " + type);
        this.errors.push({ text: i18n.t("errors:type_missing", { type: type }) });
      } else {
        var blocks = this.getBlocksByType(type).filter(function(b) {
          return !b.isEmpty();
        });

        if (blocks.length > 0) { return false; }

        this.errors.push({ text: i18n.t("errors:required_type_empty", { type: type }) });
        utils.log("A required block type " + type + " is empty");
      }
    };

    if (Array.isArray(this.required)) {
      this.required.forEach(blockTypeIterator, this);
    }
  },

  renderErrors: function() {
    if (this.errors.length === 0) { return false; }

    if (_.isUndefined(this.$errors)) {
      this.$errors = this._errorsContainer();
    }

    var str = "<ul>";

    this.errors.forEach(function(error) {
      str += '<li class="st-errors__msg">'+ error.text +'</li>';
    });

    str += "</ul>";

    this.$errors.append(str);
    this.$errors.show();
  },

  _errorsContainer: function() {
    if (_.isUndefined(this.options.errorsContainer)) {
      var $container = $("<div>", {
        'class': 'st-errors',
        html: "<p>" + i18n.t("errors:title") + " </p>"
      });

      this.$outer.prepend($container);
      return $container;
    }

    return $(this.options.errorsContainer);
  },

  removeErrors: function() {
    if (this.errors.length === 0) { return false; }

    this.$errors.hide().find('ul').html('');

    this.errors = [];
  },

  findBlockById: function(block_id) {
    return this.blocks.find(function(b) { return b.blockID === block_id; });
  },

  getBlocksByType: function(block_type) {
    return this.blocks.filter(function(b) {
      return utils.classify(b.type) === block_type;
    });
  },

  getBlocksByIDs: function(block_ids) {
    return this.blocks.filter(function(b) {
      return block_ids.includes(b.blockID);
    });
  },

  getBlockPosition: function($block) {
    return this.$wrapper.find('.st-block').index($block);
  },

  /* Get Block Type Limit
   * --
   * returns the limit for this block, which can be set on a per Editor
   * instance, or on a global blockType scope. */
  _getBlockTypeLimit: function(t) {
    if (!this._isBlockTypeAvailable(t)) { return 0; }

    return parseInt((_.isUndefined(this.options.blockTypeLimits[t])) ? 0 : this.options.blockTypeLimits[t], 10);
  },

  /* Availability helper methods
   * --
   * Checks if the object exists within the instance of the Editor. */

  _isBlockTypeAvailable: function(t) {
    return !_.isUndefined(this.blockTypes[t]);
  },

  _ensureAndSetElements: function() {
    if(_.isUndefined(this.options.el) || _.isEmpty(this.options.el)) {
      utils.log("You must provide an el");
      return false;
    }

    this.$el = this.options.el;
    this.el = this.options.el[0];
    this.$form = this.$el.parents('form');

    var $outer = $("<div>").attr({ 'id': this.ID, 'class': 'st-outer', 'dropzone': 'copy link move' });
    var $wrapper = $("<div>").attr({ 'class': 'st-blocks' });

    // Wrap our element in lots of containers *eww*
    this.$el.wrap($outer).wrap($wrapper);

    this.$outer = this.$form.find('#' + this.ID);
    this.$wrapper = this.$outer.find('.st-blocks');

    return true;
  },

  /* Set our blockTypes
   * These will either be set on a per Editor instance, or set on a global scope.
   */
  _setBlocksTypes: function() {
    this.blockTypes = {};
    var keys = this.options.blockTypes || Object.keys(Blocks);
    keys.forEach(function (k) {
      this.blockTypes[k] = true;
    }, this);
  },

  /* Get our required blocks (if any) */
  _setRequired: function() {
    if (Array.isArray(this.options.required) &&
        !_.isEmpty(this.options.required)) {
      this.required = this.options.required;
    } else {
      this.required = false;
    }
  }
});

module.exports = Editor;

},{"./block-controls":52,"./blocks":69,"./config":74,"./event-bus":76,"./events":77,"./extensions/sir-trevor.editor-store":78,"./floating-block-controls":81,"./form-events":82,"./format-bar":83,"./function-bind":86,"./lodash":91,"./utils":96}],76:[function(require,module,exports){
"use strict";

module.exports = Object.assign({}, require('./events'));

},{"./events":77}],77:[function(require,module,exports){
"use strict";

module.exports = require('eventablejs');

},{"eventablejs":2}],78:[function(require,module,exports){
"use strict";

/*
 * Sir Trevor Editor Store
 * By default we store the complete data on the instances $el
 * We can easily extend this and store it on some server or something
 */

var _ = require('../lodash');
var utils = require('../utils');

module.exports = function(editor, method, options) {
  var resp;

  options = options || {};

  switch(method) {

    case "create":
      // Grab our JSON from the textarea and clean any whitespace in case
      // there is a line wrap between the opening and closing textarea tags
      var content = editor.$el.val().trim();
      editor.dataStore = { data: [] };

      if (content.length > 0) {
        try {
          // Ensure the JSON string has a data element that's an array
          var str = JSON.parse(content);
          if (!_.isUndefined(str.data)) {
            // Set it
            editor.dataStore = str;
          }
        } catch(e) {
          editor.errors.push({ text: i18n.t("errors:load_fail") });
          editor.renderErrors();

          utils.log('Sorry there has been a problem with parsing the JSON');
          utils.log(e);
        }
      }
      break;

    case "reset":
      editor.dataStore = { data: [] };
      break;

    case "add":
      if (options.data) {
        editor.dataStore.data.push(options.data);
        resp = editor.dataStore;
      }
      break;

    case "save":
      // Store to our element
      editor.$el.val((editor.dataStore.data.length > 0) ? JSON.stringify(editor.dataStore) : '');
      break;

    case "read":
      resp = editor.dataStore;
      break;

  }

  if(resp) {
    return resp;
  }

};

},{"../lodash":91,"../utils":96}],79:[function(require,module,exports){
"use strict";

/*
 * SirTrevor.Submittable
 * --
 * We need a global way of setting if the editor can and can't be submitted,
 * and a way to disable the submit button and add messages (when appropriate)
 * We also need this to be highly extensible so it can be overridden.
 * This will be triggered *by anything* so it needs to subscribe to events.
 */


var utils = require('../utils');

var EventBus = require('../event-bus');

var submittable = function($form) {
  this.$form = $form;
  this.intialize();
};

Object.assign(submittable.prototype, {

  intialize: function(){
    this.$submitBtn = this.$form.find("input[type='submit']");

    var btnTitles = [];

    this.$submitBtn.each(function(i, btn){
      btnTitles.push($(btn).attr('value'));
    });

    this.submitBtnTitles = btnTitles;
    this.canSubmit = true;
    this.globalUploadCount = 0;
    this._bindEvents();
  },

  setSubmitButton: function(e, message) {
    this.$submitBtn.attr('value', message);
  },

  resetSubmitButton: function(){
    var titles = this.submitBtnTitles;
    this.$submitBtn.each(function(index, item) {
      $(item).attr('value', titles[index]);
    });
  },

  onUploadStart: function(e){
    this.globalUploadCount++;
    utils.log('onUploadStart called ' + this.globalUploadCount);

    if(this.globalUploadCount === 1) {
      this._disableSubmitButton();
    }
  },

  onUploadStop: function(e) {
    this.globalUploadCount = (this.globalUploadCount <= 0) ? 0 : this.globalUploadCount - 1;

    utils.log('onUploadStop called ' + this.globalUploadCount);

    if(this.globalUploadCount === 0) {
      this._enableSubmitButton();
    }
  },

  onError: function(e){
    utils.log('onError called');
    this.canSubmit = false;
  },

  _disableSubmitButton: function(message){
    this.setSubmitButton(null, message || i18n.t("general:wait"));
    this.$submitBtn
    .attr('disabled', 'disabled')
    .addClass('disabled');
  },

  _enableSubmitButton: function(){
    this.resetSubmitButton();
    this.$submitBtn
    .removeAttr('disabled')
    .removeClass('disabled');
  },

  _events : {
    "disableSubmitButton" : "_disableSubmitButton",
    "enableSubmitButton"  : "_enableSubmitButton",
    "setSubmitButton"     : "setSubmitButton",
    "resetSubmitButton"   : "resetSubmitButton",
    "onError"             : "onError",
    "onUploadStart"       : "onUploadStart",
    "onUploadStop"        : "onUploadStop"
  },

  _bindEvents: function(){
    Object.keys(this._events).forEach(function(type) {
      EventBus.on(type, this[this._events[type]], this);
    }, this);
  }

});

module.exports = submittable;


},{"../event-bus":76,"../utils":96}],80:[function(require,module,exports){
"use strict";

/*
*   Sir Trevor Uploader
*   Generic Upload implementation that can be extended for blocks
*/

var _ = require('../lodash');
var config = require('../config');
var utils = require('../utils');

module.exports = function(block, file, success, error) {

  var uid  = [block.blockID, (new Date()).getTime(), 'raw'].join('-');
  var data = new FormData();

  data.append('attachment[name]', file.name);
  data.append('attachment[file]', file);
  data.append('attachment[uid]', uid);

  block.resetMessages();

  var callbackSuccess = function(){
    utils.log('Upload callback called');

    if (!_.isUndefined(success) && _.isFunction(success)) {
      success.apply(block, arguments);
    }
  };

  var callbackError = function(){
    utils.log('Upload callback error called');

    if (!_.isUndefined(error) && _.isFunction(error)) {
      error.apply(block, arguments);
    }
  };

  var xhr = $.ajax({
    url: config.defaults.uploadUrl,
    data: data,
    cache: false,
    contentType: false,
    processData: false,
    dataType: 'json',
    type: 'POST'
  });

  block.addQueuedItem(uid, xhr);

  xhr.done(callbackSuccess)
     .fail(callbackError)
     .always(block.removeQueuedItem.bind(block, uid));

  return xhr;
};

},{"../config":74,"../lodash":91,"../utils":96}],81:[function(require,module,exports){
"use strict";

/*
   SirTrevor Floating Block Controls
   --
   Draws the 'plus' between blocks
   */

var _ = require('./lodash');

var EventBus = require('./event-bus');

var FloatingBlockControls = function(wrapper, instance_id) {
  this.$wrapper = wrapper;
  this.instance_id = instance_id;

  this._ensureElement();
  this._bindFunctions();

  this.initialize();
};

Object.assign(FloatingBlockControls.prototype, require('./function-bind'), require('./renderable'), require('./events'), {

  className: "st-block-controls__top",

  attributes: function() {
    return {
      'data-icon': 'add'
    };
  },

  bound: ['handleBlockMouseOut', 'handleBlockMouseOver', 'handleBlockClick', 'onDrop'],

  initialize: function() {
    this.$el.on('click', this.handleBlockClick)
    .dropArea()
    .bind('drop', this.onDrop);

    this.$wrapper.on('mouseover', '.st-block', this.handleBlockMouseOver)
    .on('mouseout', '.st-block', this.handleBlockMouseOut)
    .on('click', '.st-block--with-plus', this.handleBlockClick);
  },

  onDrop: function(ev) {
    ev.preventDefault();

    var dropped_on = this.$el,
    item_id = ev.originalEvent.dataTransfer.getData("text/plain"),
    block = $('#' + item_id);

    if (!_.isUndefined(item_id) &&
        !_.isEmpty(block) &&
          dropped_on.attr('id') !== item_id &&
            this.instance_id === block.attr('data-instance')
       ) {
         dropped_on.after(block);
       }

       EventBus.trigger("block:reorder:dropped", item_id);
  },

  handleBlockMouseOver: function(e) {
    var block = $(e.currentTarget);

    if (!block.hasClass('st-block--with-plus')) {
      block.addClass('st-block--with-plus');
    }
  },

  handleBlockMouseOut: function(e) {
    var block = $(e.currentTarget);

    if (block.hasClass('st-block--with-plus')) {
      block.removeClass('st-block--with-plus');
    }
  },

  handleBlockClick: function(e) {
    e.stopPropagation();

    var block = $(e.currentTarget);
    this.trigger('showBlockControls', block);
  }

});

module.exports = FloatingBlockControls;

},{"./event-bus":76,"./events":77,"./function-bind":86,"./lodash":91,"./renderable":92}],82:[function(require,module,exports){
"use strict";

var config = require('./config');
var utils = require('./utils');

var EventBus = require('./event-bus');
var Submittable = require('./extensions/sir-trevor.submittable');

var formBound = false; // Flag to tell us once we've bound our submit event

var FormEvents = {
  bindFormSubmit: function(form) {
    if (!formBound) {
      this.submittable = new Submittable(form);
      form.on('submit.sirtrevor', this.onFormSubmit);
      formBound = true;
    }
  },

  onBeforeSubmit: function(should_validate) {
    // Loop through all of our instances and do our form submits on them
    var errors = 0;
    config.instances.forEach(function(inst, i) {
      errors += inst.onFormSubmit(should_validate);
    });
    utils.log("Total errors: " + errors);

    return errors;
  },

  onFormSubmit: function(ev) {
    var errors = FormEvents.onBeforeSubmit();

    if(errors > 0) {
      EventBus.trigger("onError");
      ev.preventDefault();
    }
  },
};

module.exports = FormEvents;

},{"./config":74,"./event-bus":76,"./extensions/sir-trevor.submittable":79,"./utils":96}],83:[function(require,module,exports){
"use strict";

/*
   Format Bar
   --
   Displayed on focus on a text area.
   Renders with all available options for the editor instance
   */

var _ = require('./lodash');

var config = require('./config');
var Formatters = require('./formatters');

var FormatBar = function(options) {
  this.options = Object.assign({}, config.defaults.formatBar, options || {});
  this._ensureElement();
  this._bindFunctions();

  this.initialize.apply(this, arguments);
};

Object.assign(FormatBar.prototype, require('./function-bind'), require('./events'), require('./renderable'), {

  className: 'st-format-bar',

  bound: ["onFormatButtonClick", "renderBySelection", "hide"],

  initialize: function() {
    var formatName, format, btn;
    this.$btns = [];

    for (formatName in Formatters) {
      if (Formatters.hasOwnProperty(formatName)) {
        format = Formatters[formatName];
        btn = $("<button>", {
          'class': 'st-format-btn st-format-btn--' + formatName + ' ' + (format.iconName ? 'st-icon' : ''),
          'text': format.text,
          'data-type': formatName,
          'data-cmd': format.cmd
        });

        this.$btns.push(btn);
        btn.appendTo(this.$el);
      }
    }

    this.$b = $(document);
    this.$el.bind('click', '.st-format-btn', this.onFormatButtonClick);
  },

  hide: function() {
    this.$el.removeClass('st-format-bar--is-ready');
  },

  show: function() {
    this.$el.addClass('st-format-bar--is-ready');
  },

  remove: function(){ this.$el.remove(); },

  renderBySelection: function(rectangles) {

    var selection = window.getSelection(),
    range = selection.getRangeAt(0),
    boundary = range.getBoundingClientRect(),
    coords = {};

    coords.top = boundary.top + 20 + window.pageYOffset - this.$el.height() + 'px';
    coords.left = ((boundary.left + boundary.right) / 2) - (this.$el.width() / 2) + 'px';

    this.highlightSelectedButtons();
    this.show();

    this.$el.css(coords);
  },

  highlightSelectedButtons: function() {
    var formatter;
    this.$btns.forEach(function($btn) {
      formatter = Formatters[$btn.attr('data-type')];
      $btn.toggleClass("st-format-btn--is-active",
                       formatter.isActive());
    }, this);
  },

  onFormatButtonClick: function(ev){
    ev.stopPropagation();

    var btn = $(ev.target),
    format = Formatters[btn.attr('data-type')];

    if (_.isUndefined(format)) {
      return false;
    }

    // Do we have a click function defined on this formatter?
    if(!_.isUndefined(format.onClick) && _.isFunction(format.onClick)) {
      format.onClick(); // Delegate
    } else {
      // Call default
      document.execCommand(btn.attr('data-cmd'), false, format.param);
    }

    this.highlightSelectedButtons();
    return false;
  }

});

module.exports = FormatBar;

},{"./config":74,"./events":77,"./formatters":85,"./function-bind":86,"./lodash":91,"./renderable":92}],84:[function(require,module,exports){
"use strict";

var _ = require('./lodash');

var Formatter = function(options){
  this.formatId = _.uniqueId('format-');
  this._configure(options || {});
  this.initialize.apply(this, arguments);
};

var formatOptions = ["title", "className", "cmd", "keyCode", "param", "onClick", "toMarkdown", "toHTML"];

Object.assign(Formatter.prototype, {

  title: '',
  className: '',
  cmd: null,
  keyCode: null,
  param: null,

  toMarkdown: function(markdown){ return markdown; },
  toHTML: function(html){ return html; },

  initialize: function(){},

  _configure: function(options) {
    if (this.options) {
      options = Object.assign({}, this.options, options);
    }
    for (var i = 0, l = formatOptions.length; i < l; i++) {
      var attr = formatOptions[i];
      if (options[attr]) {
        this[attr] = options[attr];
      }
    }
    this.options = options;
  },

  isActive: function() {
    return document.queryCommandState(this.cmd);
  },

  _bindToBlock: function(block) {
    var formatter = this,
    ctrlDown = false;

    block
    .on('keyup','.st-text-block', function(ev) {
      if(ev.which === 17 || ev.which === 224 || ev.which === 91) {
        ctrlDown = false;
      }
    })
    .on('keydown','.st-text-block', { formatter: formatter }, function(ev) {
      if(ev.which === 17 || ev.which === 224 || ev.which === 91) {
        ctrlDown = true;
      }

      if(ev.which === ev.data.formatter.keyCode && ctrlDown === true) {
        document.execCommand(ev.data.formatter.cmd, false, true);
        ev.preventDefault();
        ctrlDown = false;
      }
    });
  }
});

// Allow our Formatters to be extended.
Formatter.extend = require('./helpers/extend');

module.exports = Formatter;

},{"./helpers/extend":88,"./lodash":91}],85:[function(require,module,exports){
"use strict";

/* Our base formatters */

var Formatter = require('./formatter');

var Bold = Formatter.extend({
  title: "bold",
  cmd: "bold",
  keyCode: 66,
  text : "B"
});

var Italic = Formatter.extend({
  title: "italic",
  cmd: "italic",
  keyCode: 73,
  text : "i"
});

var Link = Formatter.extend({

  title: "link",
  iconName: "link",
  cmd: "CreateLink",
  text : "link",

  onClick: function() {

    var link = window.prompt(i18n.t("general:link")),
    link_regex = /((ftp|http|https):\/\/.)|mailto(?=\:[-\.\w]+@)/;

    if(link && link.length > 0) {

      if (!link_regex.test(link)) {
        link = "http://" + link;
      }

      document.execCommand(this.cmd, false, link);
    }
  },

  isActive: function() {
    var selection = window.getSelection(),
    node;

    if (selection.rangeCount > 0) {
      node = selection.getRangeAt(0)
      .startContainer
      .parentNode;
    }

    return (node && node.nodeName === "A");
  }
});

var UnLink = Formatter.extend({
  title: "unlink",
  iconName: "link",
  cmd: "unlink",
  text : "link"
});


exports.Bold = new Bold();
exports.Italic = new Italic();
exports.Link = new Link();
exports.Unlink = new UnLink();

},{"./formatter":84}],86:[function(require,module,exports){
"use strict";

/* Generic function binding utility, used by lots of our classes */

module.exports = {
  bound: [],
  _bindFunctions: function(){
    this.bound.forEach(function(f) {
      this[f] = this[f].bind(this);
    }, this);
  }
};


},{}],87:[function(require,module,exports){
"use strict";

/*
 * Drop Area Plugin from @maccman
 * http://blog.alexmaccaw.com/svbtle-image-uploading
 * --
 * Tweaked so we use the parent class of dropzone
 */


function dragEnter(e) {
  e.preventDefault();
}

function dragOver(e) {
  e.originalEvent.dataTransfer.dropEffect = "copy";
  $(e.currentTarget).addClass('st-drag-over');
  e.preventDefault();
}

function dragLeave(e) {
  $(e.currentTarget).removeClass('st-drag-over');
  e.preventDefault();
}

$.fn.dropArea = function(){
  this.bind("dragenter", dragEnter).
    bind("dragover",  dragOver).
    bind("dragleave", dragLeave);
  return this;
};

$.fn.noDropArea = function(){
  this.unbind("dragenter").
    unbind("dragover").
    unbind("dragleave");
  return this;
};

$.fn.caretToEnd = function(){
  var range,selection;

  range = document.createRange();
  range.selectNodeContents(this[0]);
  range.collapse(false);

  selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  return this;
};


},{}],88:[function(require,module,exports){
"use strict";

/*
  Backbone Inheritence 
  --
  From: https://github.com/documentcloud/backbone/blob/master/backbone.js
  Backbone.js 0.9.2
  (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
*/

module.exports = function(protoProps, staticProps) {
  var parent = this;
  var child;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (protoProps && protoProps.hasOwnProperty('constructor')) {
    child = protoProps.constructor;
  } else {
    child = function(){ return parent.apply(this, arguments); };
  }

  // Add static properties to the constructor function, if supplied.
  Object.assign(child, parent, staticProps);

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function.
  var Surrogate = function(){ this.constructor = child; };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate; // jshint ignore:line

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (protoProps) {
    Object.assign(child.prototype, protoProps);
  }

  // Set a convenience property in case the parent's prototype is needed
  // later.
  child.__super__ = parent.prototype;

  return child;
};

},{}],89:[function(require,module,exports){
"use strict";

var _ = require('./lodash');

require('./helpers/event'); // extends jQuery itself
require('./vendor/array-includes'); // shims ES7 Array.prototype.includes

var SirTrevor = {

  config: require('./config'),

  log: require('./utils').log,
  Locales: require('./locales'),

  EventBus: require('./event-bus'),

  EditorStore: require('./extensions/sir-trevor.editor-store'),
  Submittable: require('./extensions/sir-trevor.submittable'),
  FileUploader: require('./extensions/sir-trevor.uploader'),

  BlockMixins: require('./block_mixins'),
  BlockPositioner: require('./block.positioner'),
  BlockReorder: require('./block.reorder'),
  BlockDeletion: require('./block.deletion'),
  BlockValidations: require('./block.validations'),
  BlockStore: require('./block.store'),

  SimpleBlock: require('./simple-block'),
  Block: require('./block'),
  Formatter: require('./formatter'),
  Formatters: require('./formatters'),

  Blocks: require('./blocks'),

  BlockControl: require('./block-control'),
  BlockControls: require('./block-controls'),
  FloatingBlockControls: require('./floating-block-controls'),

  FormatBar: require('./format-bar'),
  Editor: require('./editor'),

  toMarkdown: require('./to-markdown'),
  toHTML: require('./to-html'),

  setDefaults: function(options) {
    Object.assign(SirTrevor.config.defaults, options || {});
  },

  getInstance: function(identifier) {
    if (_.isUndefined(identifier)) {
      return this.config.instances[0];
    }

    if (_.isString(identifier)) {
      return this.config.instances.find(function(editor) {
        return editor.ID === identifier;
      });
    }

    return this.config.instances[identifier];
  },

  setBlockOptions: function(type, options) {
    var block = SirTrevor.Blocks[type];

    if (_.isUndefined(block)) {
      return;
    }

    Object.assign(block.prototype, options || {});
  },

  runOnAllInstances: function(method) {
    if (SirTrevor.Editor.prototype.hasOwnProperty(method)) {
      var methodArgs = Array.prototype.slice.call(arguments, 1);
      Array.prototype.forEach.call(SirTrevor.config.instances, function(i) {
        i[method].apply(null, methodArgs);
      });
    } else {
      SirTrevor.log("method doesn't exist");
    }
  },

};

Object.assign(SirTrevor, require('./form-events'));


module.exports = SirTrevor;

},{"./block":54,"./block-control":51,"./block-controls":52,"./block.deletion":53,"./block.positioner":55,"./block.reorder":56,"./block.store":57,"./block.validations":58,"./block_mixins":63,"./blocks":69,"./config":74,"./editor":75,"./event-bus":76,"./extensions/sir-trevor.editor-store":78,"./extensions/sir-trevor.submittable":79,"./extensions/sir-trevor.uploader":80,"./floating-block-controls":81,"./form-events":82,"./format-bar":83,"./formatter":84,"./formatters":85,"./helpers/event":87,"./locales":90,"./lodash":91,"./simple-block":93,"./to-html":94,"./to-markdown":95,"./utils":96,"./vendor/array-includes":97}],90:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var config = require('./config');
var utils = require('./utils');

var Locales = {
  en: {
    general: {
      'delete':           'Delete?',
      'drop':             'Drag __block__ here',
      'paste':            'Or paste URL here',
      'upload':           '...or choose a file',
      'close':            'close',
      'position':         'Position',
      'wait':             'Please wait...',
      'link':             'Enter a link'
    },
    errors: {
      'title': "You have the following errors:",
      'validation_fail': "__type__ block is invalid",
      'block_empty': "__name__ must not be empty",
      'type_missing': "You must have a block of type __type__",
      'required_type_empty': "A required block type __type__ is empty",
      'load_fail': "There was a problem loading the contents of the document"
    },
    blocks: {
      text: {
        'title': "Text"
      },
      list: {
        'title': "List"
      },
      quote: {
        'title': "Quote",
        'credit_field': "Credit"
      },
      image: {
        'title': "Image",
        'upload_error': "There was a problem with your upload"
      },
      video: {
        'title': "Video"
      },
      tweet: {
        'title': "Tweet",
        'fetch_error': "There was a problem fetching your tweet"
      },
      embedly: {
        'title': "Embedly",
        'fetch_error': "There was a problem fetching your embed",
        'key_missing': "An Embedly API key must be present"
      },
      heading: {
        'title': "Heading"
      }
    }
  }
};

if (window.i18n === undefined || window.i18n.init === undefined) {
  // Minimal i18n stub that only reads the English strings
  utils.log("Using i18n stub");
  window.i18n = {
    t: function(key, options) {
      var parts = key.split(':'), str, obj, part, i;

      obj = Locales[config.language];

      for(i = 0; i < parts.length; i++) {
        part = parts[i];

        if(!_.isUndefined(obj[part])) {
          obj = obj[part];
        }
      }

      str = obj;

      if (!_.isString(str)) { return ""; }

      if (str.indexOf('__') >= 0) {
        Object.keys(options).forEach(function(opt) {
          str = str.replace('__' + opt + '__', options[opt]);
        });
      }

      return str;
    }
  };
} else {
  utils.log("Using i18next");
  // Only use i18next when the library has been loaded by the user, keeps
  // dependencies slim
  i18n.init({ resStore: Locales, fallbackLng: config.language,
            ns: { namespaces: ['general', 'blocks'], defaultNs: 'general' }
  });
}

module.exports = Locales;

},{"./config":74,"./lodash":91,"./utils":96}],91:[function(require,module,exports){
"use strict";

exports.isEmpty = require('lodash.isempty');
exports.isFunction = require('lodash.isfunction');
exports.isObject = require('lodash.isobject');
exports.isString = require('lodash.isstring');
exports.isUndefined = require('lodash.isundefined');
exports.result = require('lodash.result');
exports.template = require('lodash.template');
exports.uniqueId = require('lodash.uniqueid');

},{"lodash.isempty":3,"lodash.isfunction":27,"lodash.isobject":28,"lodash.isstring":30,"lodash.isundefined":31,"lodash.result":32,"lodash.template":33,"lodash.uniqueid":49}],92:[function(require,module,exports){
"use strict";

var _ = require('./lodash');

module.exports = {
  tagName: 'div',
  className: 'sir-trevor__view',
  attributes: {},

  $: function(selector) {
    return this.$el.find(selector);
  },

  render: function() {
    return this;
  },

  destroy: function() {
    if (!_.isUndefined(this.stopListening)) { this.stopListening(); }
    this.$el.remove();
  },

  _ensureElement: function() {
    if (!this.el) {
      var attrs = Object.assign({}, _.result(this, 'attributes')),
      html;
      if (this.id) { attrs.id = this.id; }
      if (this.className) { attrs['class'] = this.className; }

      if (attrs.html) {
        html = attrs.html;
        delete attrs.html;
      }
      var $el = $('<' + this.tagName + '>').attr(attrs);
      if (html) { $el.html(html); }
      this._setElement($el);
    } else {
      this._setElement(this.el);
    }
  },

  _setElement: function(element) {
    this.$el = $(element);
    this.el = this.$el[0];
    return this;
  }
};


},{"./lodash":91}],93:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var utils = require('./utils');

var BlockReorder = require('./block.reorder');

var SimpleBlock = function(data, instance_id) {
  this.createStore(data);
  this.blockID = _.uniqueId('st-block-');
  this.instanceID = instance_id;

  this._ensureElement();
  this._bindFunctions();

  this.initialize.apply(this, arguments);
};

Object.assign(SimpleBlock.prototype, require('./function-bind'), require('./events'), require('./renderable'), require('./block.store'), {

  focus : function() {},

  valid : function() { return true; },

  className: 'st-block',

  block_template: _.template(
    "<div class='st-block__inner'><%= editor_html %></div>"
  ),

  attributes: function() {
    return {
      'id': this.blockID,
      'data-type': this.type,
      'data-instance': this.instanceID
    };
  },

  title: function() {
    return utils.titleize(this.type.replace(/[\W_]/g, ' '));
  },

  blockCSSClass: function() {
    this.blockCSSClass = utils.toSlug(this.type);
    return this.blockCSSClass;
  },

  type: '',

  'class': function() {
    return utils.classify(this.type);
  },

  editorHTML: '',

  initialize: function() {},

  onBlockRender: function(){},
  beforeBlockRender: function(){},

  _setBlockInner : function() {
    var editor_html = _.result(this, 'editorHTML');

    this.$el.append(
      this.block_template({ editor_html: editor_html })
    );

    this.$inner = this.$el.find('.st-block__inner');
    this.$inner.bind('click mouseover', function(e){ e.stopPropagation(); });
  },

  render: function() {
    this.beforeBlockRender();

    this._setBlockInner();
    this._blockPrepare();

    return this;
  },

  _blockPrepare : function() {
    this._initUI();
    this._initMessages();

    this.checkAndLoadData();

    this.$el.addClass('st-item-ready');
    this.on("onRender", this.onBlockRender);
    this.save();
  },

  _withUIComponent: function(component, className, callback) {
    this.$ui.append(component.render().$el);
    if (className && callback) {
      this.$ui.on('click', className, callback);
    }
  },

  _initUI : function() {
    var ui_element = $("<div>", { 'class': 'st-block__ui' });
    this.$inner.append(ui_element);
    this.$ui = ui_element;
    this._initUIComponents();
  },

  _initMessages: function() {
    var msgs_element = $("<div>", { 'class': 'st-block__messages' });
    this.$inner.prepend(msgs_element);
    this.$messages = msgs_element;
  },

  addMessage: function(msg, additionalClass) {
    var $msg = $("<span>", { html: msg, 'class': "st-msg " + additionalClass });
    this.$messages.append($msg)
    .addClass('st-block__messages--is-visible');
    return $msg;
  },

  resetMessages: function() {
    this.$messages.html('')
    .removeClass('st-block__messages--is-visible');
  },

  _initUIComponents: function() {
    this._withUIComponent(new BlockReorder(this.$el));
  }

});

SimpleBlock.fn = SimpleBlock.prototype;

// Allow our Block to be extended.
SimpleBlock.extend = require('./helpers/extend');

module.exports = SimpleBlock;

},{"./block.reorder":56,"./block.store":57,"./events":77,"./function-bind":86,"./helpers/extend":88,"./lodash":91,"./renderable":92,"./utils":96}],94:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var utils = require('./utils');

module.exports = function(markdown, type) {

  // Deferring requiring these to sidestep a circular dependency:
  // Block -> this -> Blocks -> Block
  var Blocks = require('./blocks');
  var Formatters = require('./formatters');

  // MD -> HTML
  type = utils.classify(type);

  var html = markdown,
      shouldWrap = type === "Text";

  if(_.isUndefined(shouldWrap)) { shouldWrap = false; }

  if (shouldWrap) {
    html = "<div>" + html;
  }

  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gm,function(match, p1, p2){
    return "<a href='"+p2+"'>"+p1.replace(/\r?\n/g, '')+"</a>";
  });

  // This may seem crazy, but because JS doesn't have a look behind,
  // we reverse the string to regex out the italic items (and bold)
  // and look for something that doesn't start (or end in the reversed strings case)
  // with a slash.
  html = utils.reverse(
           utils.reverse(html)
           .replace(/_(?!\\)((_\\|[^_])*)_(?=$|[^\\])/gm, function(match, p1) {
              return ">i/<"+ p1.replace(/\r?\n/g, '').replace(/[\s]+$/,'') +">i<";
           })
           .replace(/\*\*(?!\\)((\*\*\\|[^\*\*])*)\*\*(?=$|[^\\])/gm, function(match, p1){
              return ">b/<"+ p1.replace(/\r?\n/g, '').replace(/[\s]+$/,'') +">b<";
           })
          );

  html =  html.replace(/^\> (.+)$/mg,"$1");

  // Use custom formatters toHTML functions (if any exist)
  var formatName, format;
  for(formatName in Formatters) {
    if (Formatters.hasOwnProperty(formatName)) {
      format = Formatters[formatName];
      // Do we have a toHTML function?
      if (!_.isUndefined(format.toHTML) && _.isFunction(format.toHTML)) {
        html = format.toHTML(html);
      }
    }
  }

  // Use custom block toHTML functions (if any exist)
  var block;
  if (Blocks.hasOwnProperty(type)) {
    block = Blocks[type];
    // Do we have a toHTML function?
    if (!_.isUndefined(block.prototype.toHTML) && _.isFunction(block.prototype.toHTML)) {
      html = block.prototype.toHTML(html);
    }
  }

  if (shouldWrap) {
    html = html.replace(/\r?\n\r?\n/gm, "</div><div><br></div><div>");
    html = html.replace(/\r?\n/gm, "</div><div>");
  }

  html = html.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
             .replace(/\r?\n/g, "<br>")
             .replace(/\*\*/, "")
             .replace(/__/, "");  // Cleanup any markdown characters left

  // Replace escaped
  html = html.replace(/\\\*/g, "*")
             .replace(/\\\[/g, "[")
             .replace(/\\\]/g, "]")
             .replace(/\\\_/g, "_")
             .replace(/\\\(/g, "(")
             .replace(/\\\)/g, ")")
             .replace(/\\\-/g, "-");

  if (shouldWrap) {
    html += "</div>";
  }

  return html;
};

},{"./blocks":69,"./formatters":85,"./lodash":91,"./utils":96}],95:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var config = require('./config');
var utils = require('./utils');

module.exports = function(content, type) {

  // Deferring requiring these to sidestep a circular dependency:
  // Block -> this -> Blocks -> Block
  var Blocks = require('./blocks');
  var Formatters = require('./formatters');

  type = utils.classify(type);

  var markdown = content;

  //Normalise whitespace
  markdown = markdown.replace(/&nbsp;/g," ");

  // First of all, strip any additional formatting
  // MSWord, I'm looking at you, punk.
  markdown = markdown.replace(/( class=(")?Mso[a-zA-Z]+(")?)/g, '')
                     .replace(/<!--(.*?)-->/g, '')
                     .replace(/\/\*(.*?)\*\//g, '')
                     .replace(/<(\/)*(meta|link|span|\\?xml:|st1:|o:|font)(.*?)>/gi, '');

  var badTags = ['style', 'script', 'applet', 'embed', 'noframes', 'noscript'],
      tagStripper, i;

  for (i = 0; i< badTags.length; i++) {
    tagStripper = new RegExp('<'+badTags[i]+'.*?'+badTags[i]+'(.*?)>', 'gi');
    markdown = markdown.replace(tagStripper, '');
  }

  // Escape anything in here that *could* be considered as MD
  // Markdown chars we care about: * [] _ () -
  markdown = markdown.replace(/\*/g, "\\*")
                    .replace(/\[/g, "\\[")
                    .replace(/\]/g, "\\]")
                    .replace(/\_/g, "\\_")
                    .replace(/\(/g, "\\(")
                    .replace(/\)/g, "\\)")
                    .replace(/\-/g, "\\-");

  var inlineTags = ["em", "i", "strong", "b"];

  for (i = 0; i< inlineTags.length; i++) {
    tagStripper = new RegExp('<'+inlineTags[i]+'><br></'+inlineTags[i]+'>', 'gi');
    markdown = markdown.replace(tagStripper, '<br>');
  }

  function replaceBolds(match, p1, p2){
    if(_.isUndefined(p2)) { p2 = ''; }
    return "**" + p1.replace(/<(.)?br(.)?>/g, '') + "**" + p2;
  }

  function replaceItalics(match, p1, p2){
    if(_.isUndefined(p2)) { p2 = ''; }
    return "_" + p1.replace(/<(.)?br(.)?>/g, '') + "_" + p2;
  }

  markdown = markdown.replace(/<(\w+)(?:\s+\w+="[^"]+(?:"\$[^"]+"[^"]+)?")*>\s*<\/\1>/gim, '') //Empty elements
                      .replace(/\n/mg,"")
                      .replace(/<a.*?href=[""'](.*?)[""'].*?>(.*?)<\/a>/gim, function(match, p1, p2){
                        return "[" + p2.trim().replace(/<(.)?br(.)?>/g, '') + "]("+ p1 +")";
                      }) // Hyperlinks
                      .replace(/<strong>(?:\s*)(.*?)(\s)*?<\/strong>/gim, replaceBolds)
                      .replace(/<b>(?:\s*)(.*?)(\s*)?<\/b>/gim, replaceBolds)
                      .replace(/<em>(?:\s*)(.*?)(\s*)?<\/em>/gim, replaceItalics)
                      .replace(/<i>(?:\s*)(.*?)(\s*)?<\/i>/gim, replaceItalics);


  // Use custom formatters toMarkdown functions (if any exist)
  var formatName, format;
  for(formatName in Formatters) {
    if (Formatters.hasOwnProperty(formatName)) {
      format = Formatters[formatName];
      // Do we have a toMarkdown function?
      if (!_.isUndefined(format.toMarkdown) && _.isFunction(format.toMarkdown)) {
        markdown = format.toMarkdown(markdown);
      }
    }
  }

  // Do our generic stripping out
  markdown = markdown.replace(/([^<>]+)(<div>)/g,"$1\n$2")                                 // Divitis style line breaks (handle the first line)
                 .replace(/<div><div>/g,'\n<div>')                                         // ^ (double opening divs with one close from Chrome)
                 .replace(/(?:<div>)([^<>]+)(?:<div>)/g,"$1\n")                            // ^ (handle nested divs that start with content)
                 .replace(/(?:<div>)(?:<br>)?([^<>]+)(?:<br>)?(?:<\/div>)/g,"$1\n")        // ^ (handle content inside divs)
                 .replace(/<\/p>/g,"\n\n")                                               // P tags as line breaks
                 .replace(/<(.)?br(.)?>/g,"\n")                                            // Convert normal line breaks
                 .replace(/&lt;/g,"<").replace(/&gt;/g,">");                                 // Encoding

  // Use custom block toMarkdown functions (if any exist)
  var block;
  if (Blocks.hasOwnProperty(type)) {
    block = Blocks[type];
    // Do we have a toMarkdown function?
    if (!_.isUndefined(block.prototype.toMarkdown) && _.isFunction(block.prototype.toMarkdown)) {
      markdown = block.prototype.toMarkdown(markdown);
    }
  }

  // Strip remaining HTML
  if (config.defaults.toMarkdown.aggresiveHTMLStrip) {
    markdown = markdown.replace(/<\/?[^>]+(>|$)/g, "");
  } else {
    markdown = markdown.replace(/<(?=\S)\/?[^>]+(>|$)/ig, "");
  }

  return markdown;
};

},{"./blocks":69,"./config":74,"./formatters":85,"./lodash":91,"./utils":96}],96:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var config = require('./config');

var urlRegex = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;

var utils = {
  log: function() {
    if (!_.isUndefined(console) && config.debug) {
      console.log.apply(console, arguments);
    }
  },

  isURI : function(string) {
    return (urlRegex.test(string));
  },

  titleize: function(str){
    if (str === null) {
      return '';
    }
    str  = String(str).toLowerCase();
    return str.replace(/(?:^|\s|-)\S/g, function(c){ return c.toUpperCase(); });
  },

  classify: function(str){
    return utils.titleize(String(str).replace(/[\W_]/g, ' ')).replace(/\s/g, '');
  },

  capitalize : function(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  },

  underscored: function(str){
    return str.trim().replace(/([a-z\d])([A-Z]+)/g, '$1_$2')
    .replace(/[-\s]+/g, '_').toLowerCase();
  },

  reverse: function(str) {
    return str.split("").reverse().join("");
  },

  toSlug: function(str) {
    return str
    .toLowerCase()
    .replace(/[^\w ]+/g,'')
    .replace(/ +/g,'-');
  }

};

module.exports = utils;

},{"./config":74,"./lodash":91}],97:[function(require,module,exports){
"use strict";

// jshint freeze: false

if (![].includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    if (this === undefined || this === null) {
      throw new TypeError('Cannot convert this value to object');
    }
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {
        k = 0;
      }
    }
    while (k < len) {
      var currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) {
        return true;
      }
      k++;
    }
    return false;
  };
}

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudGFibGVqcy9ldmVudGFibGUuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLl9zZXRiaW5kZGF0YS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5fc2V0YmluZGRhdGEvbm9kZV9tb2R1bGVzL2xvZGFzaC5faXNuYXRpdmUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guX3NldGJpbmRkYXRhL25vZGVfbW9kdWxlcy9sb2Rhc2gubm9vcC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5iaW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fY3JlYXRld3JhcHBlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5iaW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guX2NyZWF0ZXdyYXBwZXIvbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWJpbmQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guYmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLl9jcmVhdGV3cmFwcGVyL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2ViaW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guYmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLl9jcmVhdGV3cmFwcGVyL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGV3cmFwcGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fc2xpY2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guaWRlbnRpdHkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guc3VwcG9ydC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9vYmplY3R0eXBlcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLmtleXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5rZXlzL25vZGVfbW9kdWxlcy9sb2Rhc2guX3NoaW1rZXlzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2Z1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc29iamVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNzdHJpbmcvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzdW5kZWZpbmVkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5yZXN1bHQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnRlbXBsYXRlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLl9lc2NhcGVzdHJpbmdjaGFyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLl9yZWludGVycG9sYXRlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLmRlZmF1bHRzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLmVzY2FwZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5lc2NhcGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5fZXNjYXBlaHRtbGNoYXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnRlbXBsYXRlL25vZGVfbW9kdWxlcy9sb2Rhc2guZXNjYXBlL25vZGVfbW9kdWxlcy9sb2Rhc2guX2VzY2FwZWh0bWxjaGFyL25vZGVfbW9kdWxlcy9sb2Rhc2guX2h0bWxlc2NhcGVzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLmVzY2FwZS9ub2RlX21vZHVsZXMvbG9kYXNoLl9yZXVuZXNjYXBlZGh0bWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnRlbXBsYXRlL25vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGVzZXR0aW5ncy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvbm9kZV9tb2R1bGVzL2xvZGFzaC52YWx1ZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnVuaXF1ZWlkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NwaW4uanMvc3Bpbi5qcyIsInNyYy9ibG9jay1jb250cm9sLmpzIiwic3JjL2Jsb2NrLWNvbnRyb2xzLmpzIiwic3JjL2Jsb2NrLmRlbGV0aW9uLmpzIiwic3JjL2Jsb2NrLmpzIiwic3JjL2Jsb2NrLnBvc2l0aW9uZXIuanMiLCJzcmMvYmxvY2sucmVvcmRlci5qcyIsInNyYy9ibG9jay5zdG9yZS5qcyIsInNyYy9ibG9jay52YWxpZGF0aW9ucy5qcyIsInNyYy9ibG9ja19taXhpbnMvYWpheGFibGUuanMiLCJzcmMvYmxvY2tfbWl4aW5zL2NvbnRyb2xsYWJsZS5qcyIsInNyYy9ibG9ja19taXhpbnMvZHJvcHBhYmxlLmpzIiwic3JjL2Jsb2NrX21peGlucy9mZXRjaGFibGUuanMiLCJzcmMvYmxvY2tfbWl4aW5zL2luZGV4LmpzIiwic3JjL2Jsb2NrX21peGlucy9wYXN0YWJsZS5qcyIsInNyYy9ibG9ja19taXhpbnMvdXBsb2FkYWJsZS5qcyIsInNyYy9ibG9ja3MvYmxvY2stcXVvdGUuanMiLCJzcmMvYmxvY2tzL2hlYWRpbmcuanMiLCJzcmMvYmxvY2tzL2ltYWdlLmpzIiwic3JjL2Jsb2Nrcy9pbmRleC5qcyIsInNyYy9ibG9ja3MvdGV4dC5qcyIsInNyYy9ibG9ja3MvdHdlZXQuanMiLCJzcmMvYmxvY2tzL3Vub3JkZXJlZC1saXN0LmpzIiwic3JjL2Jsb2Nrcy92aWRlby5qcyIsInNyYy9jb25maWcuanMiLCJzcmMvZWRpdG9yLmpzIiwic3JjL2V2ZW50LWJ1cy5qcyIsInNyYy9ldmVudHMuanMiLCJzcmMvZXh0ZW5zaW9ucy9zaXItdHJldm9yLmVkaXRvci1zdG9yZS5qcyIsInNyYy9leHRlbnNpb25zL3Npci10cmV2b3Iuc3VibWl0dGFibGUuanMiLCJzcmMvZXh0ZW5zaW9ucy9zaXItdHJldm9yLnVwbG9hZGVyLmpzIiwic3JjL2Zsb2F0aW5nLWJsb2NrLWNvbnRyb2xzLmpzIiwic3JjL2Zvcm0tZXZlbnRzLmpzIiwic3JjL2Zvcm1hdC1iYXIuanMiLCJzcmMvZm9ybWF0dGVyLmpzIiwic3JjL2Zvcm1hdHRlcnMuanMiLCJzcmMvZnVuY3Rpb24tYmluZC5qcyIsInNyYy9oZWxwZXJzL2V2ZW50LmpzIiwic3JjL2hlbHBlcnMvZXh0ZW5kLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL2xvY2FsZXMuanMiLCJzcmMvbG9kYXNoLmpzIiwic3JjL3JlbmRlcmFibGUuanMiLCJzcmMvc2ltcGxlLWJsb2NrLmpzIiwic3JjL3RvLWh0bWwuanMiLCJzcmMvdG8tbWFya2Rvd24uanMiLCJzcmMvdXRpbHMuanMiLCJzcmMvdmVuZG9yL2FycmF5LWluY2x1ZGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdpQkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL3NyYy8nKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhIG1vZHVsZS5cbiAgICBkZWZpbmUoJ2V2ZW50YWJsZScsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChyb290LkV2ZW50YWJsZSA9IGZhY3RvcnkoKSk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0IG9ubHkgQ29tbW9uSlMtbGlrZVxuICAgIC8vIGVudmlyb21lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cywgbGlrZSBOb2RlLlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIHJvb3QuRXZlbnRhYmxlID0gZmFjdG9yeSgpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uKCkge1xuXG4gIC8vIENvcHkgYW5kIHBhc3RlZCBzdHJhaWdodCBvdXQgb2YgQmFja2JvbmUgMS4wLjBcbiAgLy8gV2UnbGwgdHJ5IGFuZCBrZWVwIHRoaXMgdXBkYXRlZCB0byB0aGUgbGF0ZXN0XG5cbiAgdmFyIGFycmF5ID0gW107XG4gIHZhciBzbGljZSA9IGFycmF5LnNsaWNlO1xuXG4gIGZ1bmN0aW9uIG9uY2UoZnVuYykge1xuICAgIHZhciBtZW1vLCB0aW1lcyA9IDI7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA+IDApIHtcbiAgICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZ1bmMgPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfTtcbiAgfVxuXG4gIC8vIEJhY2tib25lLkV2ZW50c1xuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBBIG1vZHVsZSB0aGF0IGNhbiBiZSBtaXhlZCBpbiB0byAqYW55IG9iamVjdCogaW4gb3JkZXIgdG8gcHJvdmlkZSBpdCB3aXRoXG4gIC8vIGN1c3RvbSBldmVudHMuIFlvdSBtYXkgYmluZCB3aXRoIGBvbmAgb3IgcmVtb3ZlIHdpdGggYG9mZmAgY2FsbGJhY2tcbiAgLy8gZnVuY3Rpb25zIHRvIGFuIGV2ZW50OyBgdHJpZ2dlcmAtaW5nIGFuIGV2ZW50IGZpcmVzIGFsbCBjYWxsYmFja3MgaW5cbiAgLy8gc3VjY2Vzc2lvbi5cbiAgLy9cbiAgLy8gICAgIHZhciBvYmplY3QgPSB7fTtcbiAgLy8gICAgIGV4dGVuZChvYmplY3QsIEJhY2tib25lLkV2ZW50cyk7XG4gIC8vICAgICBvYmplY3Qub24oJ2V4cGFuZCcsIGZ1bmN0aW9uKCl7IGFsZXJ0KCdleHBhbmRlZCcpOyB9KTtcbiAgLy8gICAgIG9iamVjdC50cmlnZ2VyKCdleHBhbmQnKTtcbiAgLy9cbiAgdmFyIEV2ZW50YWJsZSA9IHtcblxuICAgIC8vIEJpbmQgYW4gZXZlbnQgdG8gYSBgY2FsbGJhY2tgIGZ1bmN0aW9uLiBQYXNzaW5nIGBcImFsbFwiYCB3aWxsIGJpbmRcbiAgICAvLyB0aGUgY2FsbGJhY2sgdG8gYWxsIGV2ZW50cyBmaXJlZC5cbiAgICBvbjogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIGlmICghZXZlbnRzQXBpKHRoaXMsICdvbicsIG5hbWUsIFtjYWxsYmFjaywgY29udGV4dF0pIHx8ICFjYWxsYmFjaykgcmV0dXJuIHRoaXM7XG4gICAgICB0aGlzLl9ldmVudHMgfHwgKHRoaXMuX2V2ZW50cyA9IHt9KTtcbiAgICAgIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHNbbmFtZV0gfHwgKHRoaXMuX2V2ZW50c1tuYW1lXSA9IFtdKTtcbiAgICAgIGV2ZW50cy5wdXNoKHtjYWxsYmFjazogY2FsbGJhY2ssIGNvbnRleHQ6IGNvbnRleHQsIGN0eDogY29udGV4dCB8fCB0aGlzfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gQmluZCBhbiBldmVudCB0byBvbmx5IGJlIHRyaWdnZXJlZCBhIHNpbmdsZSB0aW1lLiBBZnRlciB0aGUgZmlyc3QgdGltZVxuICAgIC8vIHRoZSBjYWxsYmFjayBpcyBpbnZva2VkLCBpdCB3aWxsIGJlIHJlbW92ZWQuXG4gICAgb25jZTogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIGlmICghZXZlbnRzQXBpKHRoaXMsICdvbmNlJywgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkgfHwgIWNhbGxiYWNrKSByZXR1cm4gdGhpcztcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBmdW5jID0gb25jZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5vZmYobmFtZSwgZnVuYyk7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9KTtcbiAgICAgIGZ1bmMuX2NhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICByZXR1cm4gdGhpcy5vbihuYW1lLCBmdW5jLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgLy8gUmVtb3ZlIG9uZSBvciBtYW55IGNhbGxiYWNrcy4gSWYgYGNvbnRleHRgIGlzIG51bGwsIHJlbW92ZXMgYWxsXG4gICAgLy8gY2FsbGJhY2tzIHdpdGggdGhhdCBmdW5jdGlvbi4gSWYgYGNhbGxiYWNrYCBpcyBudWxsLCByZW1vdmVzIGFsbFxuICAgIC8vIGNhbGxiYWNrcyBmb3IgdGhlIGV2ZW50LiBJZiBgbmFtZWAgaXMgbnVsbCwgcmVtb3ZlcyBhbGwgYm91bmRcbiAgICAvLyBjYWxsYmFja3MgZm9yIGFsbCBldmVudHMuXG4gICAgb2ZmOiBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgdmFyIHJldGFpbiwgZXYsIGV2ZW50cywgbmFtZXMsIGksIGwsIGosIGs7XG4gICAgICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhZXZlbnRzQXBpKHRoaXMsICdvZmYnLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSkgcmV0dXJuIHRoaXM7XG4gICAgICBpZiAoIW5hbWUgJiYgIWNhbGxiYWNrICYmICFjb250ZXh0KSB7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgbmFtZXMgPSBuYW1lID8gW25hbWVdIDogT2JqZWN0LmtleXModGhpcy5fZXZlbnRzKTtcbiAgICAgIGZvciAoaSA9IDAsIGwgPSBuYW1lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgbmFtZSA9IG5hbWVzW2ldO1xuICAgICAgICBpZiAoZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzW25hbWVdID0gcmV0YWluID0gW107XG4gICAgICAgICAgaWYgKGNhbGxiYWNrIHx8IGNvbnRleHQpIHtcbiAgICAgICAgICAgIGZvciAoaiA9IDAsIGsgPSBldmVudHMubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICAgIGV2ID0gZXZlbnRzW2pdO1xuICAgICAgICAgICAgICBpZiAoKGNhbGxiYWNrICYmIGNhbGxiYWNrICE9PSBldi5jYWxsYmFjayAmJiBjYWxsYmFjayAhPT0gZXYuY2FsbGJhY2suX2NhbGxiYWNrKSB8fFxuICAgICAgICAgICAgICAgICAgKGNvbnRleHQgJiYgY29udGV4dCAhPT0gZXYuY29udGV4dCkpIHtcbiAgICAgICAgICAgICAgICByZXRhaW4ucHVzaChldik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFyZXRhaW4ubGVuZ3RoKSBkZWxldGUgdGhpcy5fZXZlbnRzW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBUcmlnZ2VyIG9uZSBvciBtYW55IGV2ZW50cywgZmlyaW5nIGFsbCBib3VuZCBjYWxsYmFja3MuIENhbGxiYWNrcyBhcmVcbiAgICAvLyBwYXNzZWQgdGhlIHNhbWUgYXJndW1lbnRzIGFzIGB0cmlnZ2VyYCBpcywgYXBhcnQgZnJvbSB0aGUgZXZlbnQgbmFtZVxuICAgIC8vICh1bmxlc3MgeW91J3JlIGxpc3RlbmluZyBvbiBgXCJhbGxcImAsIHdoaWNoIHdpbGwgY2F1c2UgeW91ciBjYWxsYmFjayB0b1xuICAgIC8vIHJlY2VpdmUgdGhlIHRydWUgbmFtZSBvZiB0aGUgZXZlbnQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50KS5cbiAgICB0cmlnZ2VyOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XG4gICAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIGlmICghZXZlbnRzQXBpKHRoaXMsICd0cmlnZ2VyJywgbmFtZSwgYXJncykpIHJldHVybiB0aGlzO1xuICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXTtcbiAgICAgIHZhciBhbGxFdmVudHMgPSB0aGlzLl9ldmVudHMuYWxsO1xuICAgICAgaWYgKGV2ZW50cykgdHJpZ2dlckV2ZW50cyhldmVudHMsIGFyZ3MpO1xuICAgICAgaWYgKGFsbEV2ZW50cykgdHJpZ2dlckV2ZW50cyhhbGxFdmVudHMsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gVGVsbCB0aGlzIG9iamVjdCB0byBzdG9wIGxpc3RlbmluZyB0byBlaXRoZXIgc3BlY2lmaWMgZXZlbnRzIC4uLiBvclxuICAgIC8vIHRvIGV2ZXJ5IG9iamVjdCBpdCdzIGN1cnJlbnRseSBsaXN0ZW5pbmcgdG8uXG4gICAgc3RvcExpc3RlbmluZzogZnVuY3Rpb24ob2JqLCBuYW1lLCBjYWxsYmFjaykge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcbiAgICAgIGlmICghbGlzdGVuZXJzKSByZXR1cm4gdGhpcztcbiAgICAgIHZhciBkZWxldGVMaXN0ZW5lciA9ICFuYW1lICYmICFjYWxsYmFjaztcbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIGNhbGxiYWNrID0gdGhpcztcbiAgICAgIGlmIChvYmopIChsaXN0ZW5lcnMgPSB7fSlbb2JqLl9saXN0ZW5lcklkXSA9IG9iajtcbiAgICAgIGZvciAodmFyIGlkIGluIGxpc3RlbmVycykge1xuICAgICAgICBsaXN0ZW5lcnNbaWRdLm9mZihuYW1lLCBjYWxsYmFjaywgdGhpcyk7XG4gICAgICAgIGlmIChkZWxldGVMaXN0ZW5lcikgZGVsZXRlIHRoaXMuX2xpc3RlbmVyc1tpZF07XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgfTtcblxuICAvLyBSZWd1bGFyIGV4cHJlc3Npb24gdXNlZCB0byBzcGxpdCBldmVudCBzdHJpbmdzLlxuICB2YXIgZXZlbnRTcGxpdHRlciA9IC9cXHMrLztcblxuICAvLyBJbXBsZW1lbnQgZmFuY3kgZmVhdHVyZXMgb2YgdGhlIEV2ZW50cyBBUEkgc3VjaCBhcyBtdWx0aXBsZSBldmVudFxuICAvLyBuYW1lcyBgXCJjaGFuZ2UgYmx1clwiYCBhbmQgalF1ZXJ5LXN0eWxlIGV2ZW50IG1hcHMgYHtjaGFuZ2U6IGFjdGlvbn1gXG4gIC8vIGluIHRlcm1zIG9mIHRoZSBleGlzdGluZyBBUEkuXG4gIHZhciBldmVudHNBcGkgPSBmdW5jdGlvbihvYmosIGFjdGlvbiwgbmFtZSwgcmVzdCkge1xuICAgIGlmICghbmFtZSkgcmV0dXJuIHRydWU7XG5cbiAgICAvLyBIYW5kbGUgZXZlbnQgbWFwcy5cbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gbmFtZSkge1xuICAgICAgICBvYmpbYWN0aW9uXS5hcHBseShvYmosIFtrZXksIG5hbWVba2V5XV0uY29uY2F0KHJlc3QpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgc3BhY2Ugc2VwYXJhdGVkIGV2ZW50IG5hbWVzLlxuICAgIGlmIChldmVudFNwbGl0dGVyLnRlc3QobmFtZSkpIHtcbiAgICAgIHZhciBuYW1lcyA9IG5hbWUuc3BsaXQoZXZlbnRTcGxpdHRlcik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG5hbWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBvYmpbYWN0aW9uXS5hcHBseShvYmosIFtuYW1lc1tpXV0uY29uY2F0KHJlc3QpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBBIGRpZmZpY3VsdC10by1iZWxpZXZlLCBidXQgb3B0aW1pemVkIGludGVybmFsIGRpc3BhdGNoIGZ1bmN0aW9uIGZvclxuICAvLyB0cmlnZ2VyaW5nIGV2ZW50cy4gVHJpZXMgdG8ga2VlcCB0aGUgdXN1YWwgY2FzZXMgc3BlZWR5IChtb3N0IGludGVybmFsXG4gIC8vIEJhY2tib25lIGV2ZW50cyBoYXZlIDMgYXJndW1lbnRzKS5cbiAgdmFyIHRyaWdnZXJFdmVudHMgPSBmdW5jdGlvbihldmVudHMsIGFyZ3MpIHtcbiAgICB2YXIgZXYsIGkgPSAtMSwgbCA9IGV2ZW50cy5sZW5ndGgsIGExID0gYXJnc1swXSwgYTIgPSBhcmdzWzFdLCBhMyA9IGFyZ3NbMl07XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCk7IHJldHVybjtcbiAgICAgIGNhc2UgMTogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExKTsgcmV0dXJuO1xuICAgICAgY2FzZSAyOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEsIGEyKTsgcmV0dXJuO1xuICAgICAgY2FzZSAzOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEsIGEyLCBhMyk7IHJldHVybjtcbiAgICAgIGRlZmF1bHQ6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmFwcGx5KGV2LmN0eCwgYXJncyk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBsaXN0ZW5NZXRob2RzID0ge2xpc3RlblRvOiAnb24nLCBsaXN0ZW5Ub09uY2U6ICdvbmNlJ307XG5cbiAgLy8gSW52ZXJzaW9uLW9mLWNvbnRyb2wgdmVyc2lvbnMgb2YgYG9uYCBhbmQgYG9uY2VgLiBUZWxsICp0aGlzKiBvYmplY3QgdG9cbiAgLy8gbGlzdGVuIHRvIGFuIGV2ZW50IGluIGFub3RoZXIgb2JqZWN0IC4uLiBrZWVwaW5nIHRyYWNrIG9mIHdoYXQgaXQnc1xuICAvLyBsaXN0ZW5pbmcgdG8uXG4gIGZ1bmN0aW9uIGFkZExpc3Rlbk1ldGhvZChtZXRob2QsIGltcGxlbWVudGF0aW9uKSB7XG4gICAgRXZlbnRhYmxlW21ldGhvZF0gPSBmdW5jdGlvbihvYmosIG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzIHx8ICh0aGlzLl9saXN0ZW5lcnMgPSB7fSk7XG4gICAgICB2YXIgaWQgPSBvYmouX2xpc3RlbmVySWQgfHwgKG9iai5fbGlzdGVuZXJJZCA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpO1xuICAgICAgbGlzdGVuZXJzW2lkXSA9IG9iajtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIGNhbGxiYWNrID0gdGhpcztcbiAgICAgIG9ialtpbXBsZW1lbnRhdGlvbl0obmFtZSwgY2FsbGJhY2ssIHRoaXMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgfVxuXG4gIGFkZExpc3Rlbk1ldGhvZCgnbGlzdGVuVG8nLCAnb24nKTtcbiAgYWRkTGlzdGVuTWV0aG9kKCdsaXN0ZW5Ub09uY2UnLCAnb25jZScpO1xuXG4gIC8vIEFsaWFzZXMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICBFdmVudGFibGUuYmluZCAgID0gRXZlbnRhYmxlLm9uO1xuICBFdmVudGFibGUudW5iaW5kID0gRXZlbnRhYmxlLm9mZjtcblxuICByZXR1cm4gRXZlbnRhYmxlO1xuXG59KSk7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGZvck93biA9IHJlcXVpcmUoJ2xvZGFzaC5mb3Jvd24nKSxcbiAgICBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnbG9kYXNoLmlzZnVuY3Rpb24nKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCBzaG9ydGN1dHMgKi9cbnZhciBhcmdzQ2xhc3MgPSAnW29iamVjdCBBcmd1bWVudHNdJyxcbiAgICBhcnJheUNsYXNzID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBvYmplY3RDbGFzcyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHN0cmluZ0NsYXNzID0gJ1tvYmplY3QgU3RyaW5nXSc7XG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGludGVybmFsIFtbQ2xhc3NdXSBvZiB2YWx1ZXMgKi9cbnZhciB0b1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGVtcHR5LiBBcnJheXMsIHN0cmluZ3MsIG9yIGBhcmd1bWVudHNgIG9iamVjdHMgd2l0aCBhXG4gKiBsZW5ndGggb2YgYDBgIGFuZCBvYmplY3RzIHdpdGggbm8gb3duIGVudW1lcmFibGUgcHJvcGVydGllcyBhcmUgY29uc2lkZXJlZFxuICogXCJlbXB0eVwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSB2YWx1ZSBUaGUgdmFsdWUgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBlbXB0eSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRW1wdHkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0VtcHR5KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRW1wdHkoJycpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XG4gIHZhciByZXN1bHQgPSB0cnVlO1xuICBpZiAoIXZhbHVlKSB7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICB2YXIgY2xhc3NOYW1lID0gdG9TdHJpbmcuY2FsbCh2YWx1ZSksXG4gICAgICBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG5cbiAgaWYgKChjbGFzc05hbWUgPT0gYXJyYXlDbGFzcyB8fCBjbGFzc05hbWUgPT0gc3RyaW5nQ2xhc3MgfHwgY2xhc3NOYW1lID09IGFyZ3NDbGFzcyApIHx8XG4gICAgICAoY2xhc3NOYW1lID09IG9iamVjdENsYXNzICYmIHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicgJiYgaXNGdW5jdGlvbih2YWx1ZS5zcGxpY2UpKSkge1xuICAgIHJldHVybiAhbGVuZ3RoO1xuICB9XG4gIGZvck93bih2YWx1ZSwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChyZXN1bHQgPSBmYWxzZSk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRW1wdHk7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGJhc2VDcmVhdGVDYWxsYmFjayA9IHJlcXVpcmUoJ2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrJyksXG4gICAga2V5cyA9IHJlcXVpcmUoJ2xvZGFzaC5rZXlzJyksXG4gICAgb2JqZWN0VHlwZXMgPSByZXF1aXJlKCdsb2Rhc2guX29iamVjdHR5cGVzJyk7XG5cbi8qKlxuICogSXRlcmF0ZXMgb3ZlciBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdCwgZXhlY3V0aW5nIHRoZSBjYWxsYmFja1xuICogZm9yIGVhY2ggcHJvcGVydHkuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZVxuICogYXJndW1lbnRzOyAodmFsdWUsIGtleSwgb2JqZWN0KS4gQ2FsbGJhY2tzIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieVxuICogZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHR5cGUgRnVuY3Rpb25cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZm9yT3duKHsgJzAnOiAnemVybycsICcxJzogJ29uZScsICdsZW5ndGgnOiAyIH0sIGZ1bmN0aW9uKG51bSwga2V5KSB7XG4gKiAgIGNvbnNvbGUubG9nKGtleSk7XG4gKiB9KTtcbiAqIC8vID0+IGxvZ3MgJzAnLCAnMScsIGFuZCAnbGVuZ3RoJyAocHJvcGVydHkgb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50cylcbiAqL1xudmFyIGZvck93biA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gIHZhciBpbmRleCwgaXRlcmFibGUgPSBjb2xsZWN0aW9uLCByZXN1bHQgPSBpdGVyYWJsZTtcbiAgaWYgKCFpdGVyYWJsZSkgcmV0dXJuIHJlc3VsdDtcbiAgaWYgKCFvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdKSByZXR1cm4gcmVzdWx0O1xuICBjYWxsYmFjayA9IGNhbGxiYWNrICYmIHR5cGVvZiB0aGlzQXJnID09ICd1bmRlZmluZWQnID8gY2FsbGJhY2sgOiBiYXNlQ3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgIHZhciBvd25JbmRleCA9IC0xLFxuICAgICAgICBvd25Qcm9wcyA9IG9iamVjdFR5cGVzW3R5cGVvZiBpdGVyYWJsZV0gJiYga2V5cyhpdGVyYWJsZSksXG4gICAgICAgIGxlbmd0aCA9IG93blByb3BzID8gb3duUHJvcHMubGVuZ3RoIDogMDtcblxuICAgIHdoaWxlICgrK293bkluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBpbmRleCA9IG93blByb3BzW293bkluZGV4XTtcbiAgICAgIGlmIChjYWxsYmFjayhpdGVyYWJsZVtpbmRleF0sIGluZGV4LCBjb2xsZWN0aW9uKSA9PT0gZmFsc2UpIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICByZXR1cm4gcmVzdWx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZvck93bjtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgYmluZCA9IHJlcXVpcmUoJ2xvZGFzaC5iaW5kJyksXG4gICAgaWRlbnRpdHkgPSByZXF1aXJlKCdsb2Rhc2guaWRlbnRpdHknKSxcbiAgICBzZXRCaW5kRGF0YSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2V0YmluZGRhdGEnKSxcbiAgICBzdXBwb3J0ID0gcmVxdWlyZSgnbG9kYXNoLnN1cHBvcnQnKTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0ZWQgbmFtZWQgZnVuY3Rpb25zICovXG52YXIgcmVGdW5jTmFtZSA9IC9eXFxzKmZ1bmN0aW9uWyBcXG5cXHJcXHRdK1xcdy87XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBmdW5jdGlvbnMgY29udGFpbmluZyBhIGB0aGlzYCByZWZlcmVuY2UgKi9cbnZhciByZVRoaXMgPSAvXFxidGhpc1xcYi87XG5cbi8qKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyAqL1xudmFyIGZuVG9TdHJpbmcgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY3JlYXRlQ2FsbGJhY2tgIHdpdGhvdXQgc3VwcG9ydCBmb3IgY3JlYXRpbmdcbiAqIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSBbZnVuYz1pZGVudGl0eV0gVGhlIHZhbHVlIHRvIGNvbnZlcnQgdG8gYSBjYWxsYmFjay5cbiAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiB0aGUgY3JlYXRlZCBjYWxsYmFjay5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbYXJnQ291bnRdIFRoZSBudW1iZXIgb2YgYXJndW1lbnRzIHRoZSBjYWxsYmFjayBhY2NlcHRzLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGEgY2FsbGJhY2sgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VDcmVhdGVDYWxsYmFjayhmdW5jLCB0aGlzQXJnLCBhcmdDb3VudCkge1xuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBpZGVudGl0eTtcbiAgfVxuICAvLyBleGl0IGVhcmx5IGZvciBubyBgdGhpc0FyZ2Agb3IgYWxyZWFkeSBib3VuZCBieSBgRnVuY3Rpb24jYmluZGBcbiAgaWYgKHR5cGVvZiB0aGlzQXJnID09ICd1bmRlZmluZWQnIHx8ICEoJ3Byb3RvdHlwZScgaW4gZnVuYykpIHtcbiAgICByZXR1cm4gZnVuYztcbiAgfVxuICB2YXIgYmluZERhdGEgPSBmdW5jLl9fYmluZERhdGFfXztcbiAgaWYgKHR5cGVvZiBiaW5kRGF0YSA9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChzdXBwb3J0LmZ1bmNOYW1lcykge1xuICAgICAgYmluZERhdGEgPSAhZnVuYy5uYW1lO1xuICAgIH1cbiAgICBiaW5kRGF0YSA9IGJpbmREYXRhIHx8ICFzdXBwb3J0LmZ1bmNEZWNvbXA7XG4gICAgaWYgKCFiaW5kRGF0YSkge1xuICAgICAgdmFyIHNvdXJjZSA9IGZuVG9TdHJpbmcuY2FsbChmdW5jKTtcbiAgICAgIGlmICghc3VwcG9ydC5mdW5jTmFtZXMpIHtcbiAgICAgICAgYmluZERhdGEgPSAhcmVGdW5jTmFtZS50ZXN0KHNvdXJjZSk7XG4gICAgICB9XG4gICAgICBpZiAoIWJpbmREYXRhKSB7XG4gICAgICAgIC8vIGNoZWNrcyBpZiBgZnVuY2AgcmVmZXJlbmNlcyB0aGUgYHRoaXNgIGtleXdvcmQgYW5kIHN0b3JlcyB0aGUgcmVzdWx0XG4gICAgICAgIGJpbmREYXRhID0gcmVUaGlzLnRlc3Qoc291cmNlKTtcbiAgICAgICAgc2V0QmluZERhdGEoZnVuYywgYmluZERhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBleGl0IGVhcmx5IGlmIHRoZXJlIGFyZSBubyBgdGhpc2AgcmVmZXJlbmNlcyBvciBgZnVuY2AgaXMgYm91bmRcbiAgaWYgKGJpbmREYXRhID09PSBmYWxzZSB8fCAoYmluZERhdGEgIT09IHRydWUgJiYgYmluZERhdGFbMV0gJiAxKSkge1xuICAgIHJldHVybiBmdW5jO1xuICB9XG4gIHN3aXRjaCAoYXJnQ291bnQpIHtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCB2YWx1ZSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgfTtcbiAgICBjYXNlIDQ6IHJldHVybiBmdW5jdGlvbihhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGJpbmQoZnVuYywgdGhpc0FyZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNyZWF0ZUNhbGxiYWNrO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBpc05hdGl2ZSA9IHJlcXVpcmUoJ2xvZGFzaC5faXNuYXRpdmUnKSxcbiAgICBub29wID0gcmVxdWlyZSgnbG9kYXNoLm5vb3AnKTtcblxuLyoqIFVzZWQgYXMgdGhlIHByb3BlcnR5IGRlc2NyaXB0b3IgZm9yIGBfX2JpbmREYXRhX19gICovXG52YXIgZGVzY3JpcHRvciA9IHtcbiAgJ2NvbmZpZ3VyYWJsZSc6IGZhbHNlLFxuICAnZW51bWVyYWJsZSc6IGZhbHNlLFxuICAndmFsdWUnOiBudWxsLFxuICAnd3JpdGFibGUnOiBmYWxzZVxufTtcblxuLyoqIFVzZWQgdG8gc2V0IG1ldGEgZGF0YSBvbiBmdW5jdGlvbnMgKi9cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgLy8gSUUgOCBvbmx5IGFjY2VwdHMgRE9NIGVsZW1lbnRzXG4gIHRyeSB7XG4gICAgdmFyIG8gPSB7fSxcbiAgICAgICAgZnVuYyA9IGlzTmF0aXZlKGZ1bmMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkpICYmIGZ1bmMsXG4gICAgICAgIHJlc3VsdCA9IGZ1bmMobywgbywgbykgJiYgZnVuYztcbiAgfSBjYXRjaChlKSB7IH1cbiAgcmV0dXJuIHJlc3VsdDtcbn0oKSk7XG5cbi8qKlxuICogU2V0cyBgdGhpc2AgYmluZGluZyBkYXRhIG9uIGEgZ2l2ZW4gZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHNldCBkYXRhIG9uLlxuICogQHBhcmFtIHtBcnJheX0gdmFsdWUgVGhlIGRhdGEgYXJyYXkgdG8gc2V0LlxuICovXG52YXIgc2V0QmluZERhdGEgPSAhZGVmaW5lUHJvcGVydHkgPyBub29wIDogZnVuY3Rpb24oZnVuYywgdmFsdWUpIHtcbiAgZGVzY3JpcHRvci52YWx1ZSA9IHZhbHVlO1xuICBkZWZpbmVQcm9wZXJ0eShmdW5jLCAnX19iaW5kRGF0YV9fJywgZGVzY3JpcHRvcik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNldEJpbmREYXRhO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgaW50ZXJuYWwgW1tDbGFzc11dIG9mIHZhbHVlcyAqL1xudmFyIHRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBpZiBhIG1ldGhvZCBpcyBuYXRpdmUgKi9cbnZhciByZU5hdGl2ZSA9IFJlZ0V4cCgnXicgK1xuICBTdHJpbmcodG9TdHJpbmcpXG4gICAgLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJylcbiAgICAucmVwbGFjZSgvdG9TdHJpbmd8IGZvciBbXlxcXV0rL2csICcuKj8nKSArICckJ1xuKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNOYXRpdmUodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nICYmIHJlTmF0aXZlLnRlc3QodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTmF0aXZlO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBBIG5vLW9wZXJhdGlvbiBmdW5jdGlvbi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnbmFtZSc6ICdmcmVkJyB9O1xuICogXy5ub29wKG9iamVjdCkgPT09IHVuZGVmaW5lZDtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gbm9vcCgpIHtcbiAgLy8gbm8gb3BlcmF0aW9uIHBlcmZvcm1lZFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5vb3A7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGNyZWF0ZVdyYXBwZXIgPSByZXF1aXJlKCdsb2Rhc2guX2NyZWF0ZXdyYXBwZXInKSxcbiAgICBzbGljZSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2xpY2UnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIGludm9rZXMgYGZ1bmNgIHdpdGggdGhlIGB0aGlzYFxuICogYmluZGluZyBvZiBgdGhpc0FyZ2AgYW5kIHByZXBlbmRzIGFueSBhZGRpdGlvbmFsIGBiaW5kYCBhcmd1bWVudHMgdG8gdGhvc2VcbiAqIHByb3ZpZGVkIHRvIHRoZSBib3VuZCBmdW5jdGlvbi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYmluZC5cbiAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gKiBAcGFyYW0gey4uLip9IFthcmddIEFyZ3VtZW50cyB0byBiZSBwYXJ0aWFsbHkgYXBwbGllZC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJvdW5kIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgZnVuYyA9IGZ1bmN0aW9uKGdyZWV0aW5nKSB7XG4gKiAgIHJldHVybiBncmVldGluZyArICcgJyArIHRoaXMubmFtZTtcbiAqIH07XG4gKlxuICogZnVuYyA9IF8uYmluZChmdW5jLCB7ICduYW1lJzogJ2ZyZWQnIH0sICdoaScpO1xuICogZnVuYygpO1xuICogLy8gPT4gJ2hpIGZyZWQnXG4gKi9cbmZ1bmN0aW9uIGJpbmQoZnVuYywgdGhpc0FyZykge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDJcbiAgICA/IGNyZWF0ZVdyYXBwZXIoZnVuYywgMTcsIHNsaWNlKGFyZ3VtZW50cywgMiksIG51bGwsIHRoaXNBcmcpXG4gICAgOiBjcmVhdGVXcmFwcGVyKGZ1bmMsIDEsIG51bGwsIG51bGwsIHRoaXNBcmcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJpbmQ7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGJhc2VCaW5kID0gcmVxdWlyZSgnbG9kYXNoLl9iYXNlYmluZCcpLFxuICAgIGJhc2VDcmVhdGVXcmFwcGVyID0gcmVxdWlyZSgnbG9kYXNoLl9iYXNlY3JlYXRld3JhcHBlcicpLFxuICAgIGlzRnVuY3Rpb24gPSByZXF1aXJlKCdsb2Rhc2guaXNmdW5jdGlvbicpLFxuICAgIHNsaWNlID0gcmVxdWlyZSgnbG9kYXNoLl9zbGljZScpO1xuXG4vKipcbiAqIFVzZWQgZm9yIGBBcnJheWAgbWV0aG9kIHJlZmVyZW5jZXMuXG4gKlxuICogTm9ybWFsbHkgYEFycmF5LnByb3RvdHlwZWAgd291bGQgc3VmZmljZSwgaG93ZXZlciwgdXNpbmcgYW4gYXJyYXkgbGl0ZXJhbFxuICogYXZvaWRzIGlzc3VlcyBpbiBOYXJ3aGFsLlxuICovXG52YXIgYXJyYXlSZWYgPSBbXTtcblxuLyoqIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzICovXG52YXIgcHVzaCA9IGFycmF5UmVmLnB1c2gsXG4gICAgdW5zaGlmdCA9IGFycmF5UmVmLnVuc2hpZnQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCBlaXRoZXIgY3VycmllcyBvciBpbnZva2VzIGBmdW5jYFxuICogd2l0aCBhbiBvcHRpb25hbCBgdGhpc2AgYmluZGluZyBhbmQgcGFydGlhbGx5IGFwcGxpZWQgYXJndW1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufHN0cmluZ30gZnVuYyBUaGUgZnVuY3Rpb24gb3IgbWV0aG9kIG5hbWUgdG8gcmVmZXJlbmNlLlxuICogQHBhcmFtIHtudW1iZXJ9IGJpdG1hc2sgVGhlIGJpdG1hc2sgb2YgbWV0aG9kIGZsYWdzIHRvIGNvbXBvc2UuXG4gKiAgVGhlIGJpdG1hc2sgbWF5IGJlIGNvbXBvc2VkIG9mIHRoZSBmb2xsb3dpbmcgZmxhZ3M6XG4gKiAgMSAtIGBfLmJpbmRgXG4gKiAgMiAtIGBfLmJpbmRLZXlgXG4gKiAgNCAtIGBfLmN1cnJ5YFxuICogIDggLSBgXy5jdXJyeWAgKGJvdW5kKVxuICogIDE2IC0gYF8ucGFydGlhbGBcbiAqICAzMiAtIGBfLnBhcnRpYWxSaWdodGBcbiAqIEBwYXJhbSB7QXJyYXl9IFtwYXJ0aWFsQXJnc10gQW4gYXJyYXkgb2YgYXJndW1lbnRzIHRvIHByZXBlbmQgdG8gdGhvc2VcbiAqICBwcm92aWRlZCB0byB0aGUgbmV3IGZ1bmN0aW9uLlxuICogQHBhcmFtIHtBcnJheX0gW3BhcnRpYWxSaWdodEFyZ3NdIEFuIGFycmF5IG9mIGFyZ3VtZW50cyB0byBhcHBlbmQgdG8gdGhvc2VcbiAqICBwcm92aWRlZCB0byB0aGUgbmV3IGZ1bmN0aW9uLlxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBmdW5jYC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbYXJpdHldIFRoZSBhcml0eSBvZiBgZnVuY2AuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlV3JhcHBlcihmdW5jLCBiaXRtYXNrLCBwYXJ0aWFsQXJncywgcGFydGlhbFJpZ2h0QXJncywgdGhpc0FyZywgYXJpdHkpIHtcbiAgdmFyIGlzQmluZCA9IGJpdG1hc2sgJiAxLFxuICAgICAgaXNCaW5kS2V5ID0gYml0bWFzayAmIDIsXG4gICAgICBpc0N1cnJ5ID0gYml0bWFzayAmIDQsXG4gICAgICBpc0N1cnJ5Qm91bmQgPSBiaXRtYXNrICYgOCxcbiAgICAgIGlzUGFydGlhbCA9IGJpdG1hc2sgJiAxNixcbiAgICAgIGlzUGFydGlhbFJpZ2h0ID0gYml0bWFzayAmIDMyO1xuXG4gIGlmICghaXNCaW5kS2V5ICYmICFpc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgfVxuICBpZiAoaXNQYXJ0aWFsICYmICFwYXJ0aWFsQXJncy5sZW5ndGgpIHtcbiAgICBiaXRtYXNrICY9IH4xNjtcbiAgICBpc1BhcnRpYWwgPSBwYXJ0aWFsQXJncyA9IGZhbHNlO1xuICB9XG4gIGlmIChpc1BhcnRpYWxSaWdodCAmJiAhcGFydGlhbFJpZ2h0QXJncy5sZW5ndGgpIHtcbiAgICBiaXRtYXNrICY9IH4zMjtcbiAgICBpc1BhcnRpYWxSaWdodCA9IHBhcnRpYWxSaWdodEFyZ3MgPSBmYWxzZTtcbiAgfVxuICB2YXIgYmluZERhdGEgPSBmdW5jICYmIGZ1bmMuX19iaW5kRGF0YV9fO1xuICBpZiAoYmluZERhdGEgJiYgYmluZERhdGEgIT09IHRydWUpIHtcbiAgICAvLyBjbG9uZSBgYmluZERhdGFgXG4gICAgYmluZERhdGEgPSBzbGljZShiaW5kRGF0YSk7XG4gICAgaWYgKGJpbmREYXRhWzJdKSB7XG4gICAgICBiaW5kRGF0YVsyXSA9IHNsaWNlKGJpbmREYXRhWzJdKTtcbiAgICB9XG4gICAgaWYgKGJpbmREYXRhWzNdKSB7XG4gICAgICBiaW5kRGF0YVszXSA9IHNsaWNlKGJpbmREYXRhWzNdKTtcbiAgICB9XG4gICAgLy8gc2V0IGB0aGlzQmluZGluZ2AgaXMgbm90IHByZXZpb3VzbHkgYm91bmRcbiAgICBpZiAoaXNCaW5kICYmICEoYmluZERhdGFbMV0gJiAxKSkge1xuICAgICAgYmluZERhdGFbNF0gPSB0aGlzQXJnO1xuICAgIH1cbiAgICAvLyBzZXQgaWYgcHJldmlvdXNseSBib3VuZCBidXQgbm90IGN1cnJlbnRseSAoc3Vic2VxdWVudCBjdXJyaWVkIGZ1bmN0aW9ucylcbiAgICBpZiAoIWlzQmluZCAmJiBiaW5kRGF0YVsxXSAmIDEpIHtcbiAgICAgIGJpdG1hc2sgfD0gODtcbiAgICB9XG4gICAgLy8gc2V0IGN1cnJpZWQgYXJpdHkgaWYgbm90IHlldCBzZXRcbiAgICBpZiAoaXNDdXJyeSAmJiAhKGJpbmREYXRhWzFdICYgNCkpIHtcbiAgICAgIGJpbmREYXRhWzVdID0gYXJpdHk7XG4gICAgfVxuICAgIC8vIGFwcGVuZCBwYXJ0aWFsIGxlZnQgYXJndW1lbnRzXG4gICAgaWYgKGlzUGFydGlhbCkge1xuICAgICAgcHVzaC5hcHBseShiaW5kRGF0YVsyXSB8fCAoYmluZERhdGFbMl0gPSBbXSksIHBhcnRpYWxBcmdzKTtcbiAgICB9XG4gICAgLy8gYXBwZW5kIHBhcnRpYWwgcmlnaHQgYXJndW1lbnRzXG4gICAgaWYgKGlzUGFydGlhbFJpZ2h0KSB7XG4gICAgICB1bnNoaWZ0LmFwcGx5KGJpbmREYXRhWzNdIHx8IChiaW5kRGF0YVszXSA9IFtdKSwgcGFydGlhbFJpZ2h0QXJncyk7XG4gICAgfVxuICAgIC8vIG1lcmdlIGZsYWdzXG4gICAgYmluZERhdGFbMV0gfD0gYml0bWFzaztcbiAgICByZXR1cm4gY3JlYXRlV3JhcHBlci5hcHBseShudWxsLCBiaW5kRGF0YSk7XG4gIH1cbiAgLy8gZmFzdCBwYXRoIGZvciBgXy5iaW5kYFxuICB2YXIgY3JlYXRlciA9IChiaXRtYXNrID09IDEgfHwgYml0bWFzayA9PT0gMTcpID8gYmFzZUJpbmQgOiBiYXNlQ3JlYXRlV3JhcHBlcjtcbiAgcmV0dXJuIGNyZWF0ZXIoW2Z1bmMsIGJpdG1hc2ssIHBhcnRpYWxBcmdzLCBwYXJ0aWFsUmlnaHRBcmdzLCB0aGlzQXJnLCBhcml0eV0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVdyYXBwZXI7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGJhc2VDcmVhdGUgPSByZXF1aXJlKCdsb2Rhc2guX2Jhc2VjcmVhdGUnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC5pc29iamVjdCcpLFxuICAgIHNldEJpbmREYXRhID0gcmVxdWlyZSgnbG9kYXNoLl9zZXRiaW5kZGF0YScpLFxuICAgIHNsaWNlID0gcmVxdWlyZSgnbG9kYXNoLl9zbGljZScpO1xuXG4vKipcbiAqIFVzZWQgZm9yIGBBcnJheWAgbWV0aG9kIHJlZmVyZW5jZXMuXG4gKlxuICogTm9ybWFsbHkgYEFycmF5LnByb3RvdHlwZWAgd291bGQgc3VmZmljZSwgaG93ZXZlciwgdXNpbmcgYW4gYXJyYXkgbGl0ZXJhbFxuICogYXZvaWRzIGlzc3VlcyBpbiBOYXJ3aGFsLlxuICovXG52YXIgYXJyYXlSZWYgPSBbXTtcblxuLyoqIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzICovXG52YXIgcHVzaCA9IGFycmF5UmVmLnB1c2g7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uYmluZGAgdGhhdCBjcmVhdGVzIHRoZSBib3VuZCBmdW5jdGlvbiBhbmRcbiAqIHNldHMgaXRzIG1ldGEgZGF0YS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYmluZERhdGEgVGhlIGJpbmQgZGF0YSBhcnJheS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJvdW5kIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlQmluZChiaW5kRGF0YSkge1xuICB2YXIgZnVuYyA9IGJpbmREYXRhWzBdLFxuICAgICAgcGFydGlhbEFyZ3MgPSBiaW5kRGF0YVsyXSxcbiAgICAgIHRoaXNBcmcgPSBiaW5kRGF0YVs0XTtcblxuICBmdW5jdGlvbiBib3VuZCgpIHtcbiAgICAvLyBgRnVuY3Rpb24jYmluZGAgc3BlY1xuICAgIC8vIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTUuMy40LjVcbiAgICBpZiAocGFydGlhbEFyZ3MpIHtcbiAgICAgIC8vIGF2b2lkIGBhcmd1bWVudHNgIG9iamVjdCBkZW9wdGltaXphdGlvbnMgYnkgdXNpbmcgYHNsaWNlYCBpbnN0ZWFkXG4gICAgICAvLyBvZiBgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGxgIGFuZCBub3QgYXNzaWduaW5nIGBhcmd1bWVudHNgIHRvIGFcbiAgICAgIC8vIHZhcmlhYmxlIGFzIGEgdGVybmFyeSBleHByZXNzaW9uXG4gICAgICB2YXIgYXJncyA9IHNsaWNlKHBhcnRpYWxBcmdzKTtcbiAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICB9XG4gICAgLy8gbWltaWMgdGhlIGNvbnN0cnVjdG9yJ3MgYHJldHVybmAgYmVoYXZpb3JcbiAgICAvLyBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDEzLjIuMlxuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgYm91bmQpIHtcbiAgICAgIC8vIGVuc3VyZSBgbmV3IGJvdW5kYCBpcyBhbiBpbnN0YW5jZSBvZiBgZnVuY2BcbiAgICAgIHZhciB0aGlzQmluZGluZyA9IGJhc2VDcmVhdGUoZnVuYy5wcm90b3R5cGUpLFxuICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0JpbmRpbmcsIGFyZ3MgfHwgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBpc09iamVjdChyZXN1bHQpID8gcmVzdWx0IDogdGhpc0JpbmRpbmc7XG4gICAgfVxuICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MgfHwgYXJndW1lbnRzKTtcbiAgfVxuICBzZXRCaW5kRGF0YShib3VuZCwgYmluZERhdGEpO1xuICByZXR1cm4gYm91bmQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUJpbmQ7XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGlzTmF0aXZlID0gcmVxdWlyZSgnbG9kYXNoLl9pc25hdGl2ZScpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoLmlzb2JqZWN0JyksXG4gICAgbm9vcCA9IHJlcXVpcmUoJ2xvZGFzaC5ub29wJyk7XG5cbi8qIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzIGZvciBtZXRob2RzIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzICovXG52YXIgbmF0aXZlQ3JlYXRlID0gaXNOYXRpdmUobmF0aXZlQ3JlYXRlID0gT2JqZWN0LmNyZWF0ZSkgJiYgbmF0aXZlQ3JlYXRlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmNyZWF0ZWAgd2l0aG91dCBzdXBwb3J0IGZvciBhc3NpZ25pbmdcbiAqIHByb3BlcnRpZXMgdG8gdGhlIGNyZWF0ZWQgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvdG90eXBlIFRoZSBvYmplY3QgdG8gaW5oZXJpdCBmcm9tLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbmV3IG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gYmFzZUNyZWF0ZShwcm90b3R5cGUsIHByb3BlcnRpZXMpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHByb3RvdHlwZSkgPyBuYXRpdmVDcmVhdGUocHJvdG90eXBlKSA6IHt9O1xufVxuLy8gZmFsbGJhY2sgZm9yIGJyb3dzZXJzIHdpdGhvdXQgYE9iamVjdC5jcmVhdGVgXG5pZiAoIW5hdGl2ZUNyZWF0ZSkge1xuICBiYXNlQ3JlYXRlID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIE9iamVjdCgpIHt9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHByb3RvdHlwZSkge1xuICAgICAgaWYgKGlzT2JqZWN0KHByb3RvdHlwZSkpIHtcbiAgICAgICAgT2JqZWN0LnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBPYmplY3Q7XG4gICAgICAgIE9iamVjdC5wcm90b3R5cGUgPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdCB8fCBnbG9iYWwuT2JqZWN0KCk7XG4gICAgfTtcbiAgfSgpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQ3JlYXRlO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGJhc2VDcmVhdGUgPSByZXF1aXJlKCdsb2Rhc2guX2Jhc2VjcmVhdGUnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC5pc29iamVjdCcpLFxuICAgIHNldEJpbmREYXRhID0gcmVxdWlyZSgnbG9kYXNoLl9zZXRiaW5kZGF0YScpLFxuICAgIHNsaWNlID0gcmVxdWlyZSgnbG9kYXNoLl9zbGljZScpO1xuXG4vKipcbiAqIFVzZWQgZm9yIGBBcnJheWAgbWV0aG9kIHJlZmVyZW5jZXMuXG4gKlxuICogTm9ybWFsbHkgYEFycmF5LnByb3RvdHlwZWAgd291bGQgc3VmZmljZSwgaG93ZXZlciwgdXNpbmcgYW4gYXJyYXkgbGl0ZXJhbFxuICogYXZvaWRzIGlzc3VlcyBpbiBOYXJ3aGFsLlxuICovXG52YXIgYXJyYXlSZWYgPSBbXTtcblxuLyoqIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzICovXG52YXIgcHVzaCA9IGFycmF5UmVmLnB1c2g7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGNyZWF0ZVdyYXBwZXJgIHRoYXQgY3JlYXRlcyB0aGUgd3JhcHBlciBhbmRcbiAqIHNldHMgaXRzIG1ldGEgZGF0YS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYmluZERhdGEgVGhlIGJpbmQgZGF0YSBhcnJheS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlQ3JlYXRlV3JhcHBlcihiaW5kRGF0YSkge1xuICB2YXIgZnVuYyA9IGJpbmREYXRhWzBdLFxuICAgICAgYml0bWFzayA9IGJpbmREYXRhWzFdLFxuICAgICAgcGFydGlhbEFyZ3MgPSBiaW5kRGF0YVsyXSxcbiAgICAgIHBhcnRpYWxSaWdodEFyZ3MgPSBiaW5kRGF0YVszXSxcbiAgICAgIHRoaXNBcmcgPSBiaW5kRGF0YVs0XSxcbiAgICAgIGFyaXR5ID0gYmluZERhdGFbNV07XG5cbiAgdmFyIGlzQmluZCA9IGJpdG1hc2sgJiAxLFxuICAgICAgaXNCaW5kS2V5ID0gYml0bWFzayAmIDIsXG4gICAgICBpc0N1cnJ5ID0gYml0bWFzayAmIDQsXG4gICAgICBpc0N1cnJ5Qm91bmQgPSBiaXRtYXNrICYgOCxcbiAgICAgIGtleSA9IGZ1bmM7XG5cbiAgZnVuY3Rpb24gYm91bmQoKSB7XG4gICAgdmFyIHRoaXNCaW5kaW5nID0gaXNCaW5kID8gdGhpc0FyZyA6IHRoaXM7XG4gICAgaWYgKHBhcnRpYWxBcmdzKSB7XG4gICAgICB2YXIgYXJncyA9IHNsaWNlKHBhcnRpYWxBcmdzKTtcbiAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICB9XG4gICAgaWYgKHBhcnRpYWxSaWdodEFyZ3MgfHwgaXNDdXJyeSkge1xuICAgICAgYXJncyB8fCAoYXJncyA9IHNsaWNlKGFyZ3VtZW50cykpO1xuICAgICAgaWYgKHBhcnRpYWxSaWdodEFyZ3MpIHtcbiAgICAgICAgcHVzaC5hcHBseShhcmdzLCBwYXJ0aWFsUmlnaHRBcmdzKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc0N1cnJ5ICYmIGFyZ3MubGVuZ3RoIDwgYXJpdHkpIHtcbiAgICAgICAgYml0bWFzayB8PSAxNiAmIH4zMjtcbiAgICAgICAgcmV0dXJuIGJhc2VDcmVhdGVXcmFwcGVyKFtmdW5jLCAoaXNDdXJyeUJvdW5kID8gYml0bWFzayA6IGJpdG1hc2sgJiB+MyksIGFyZ3MsIG51bGwsIHRoaXNBcmcsIGFyaXR5XSk7XG4gICAgICB9XG4gICAgfVxuICAgIGFyZ3MgfHwgKGFyZ3MgPSBhcmd1bWVudHMpO1xuICAgIGlmIChpc0JpbmRLZXkpIHtcbiAgICAgIGZ1bmMgPSB0aGlzQmluZGluZ1trZXldO1xuICAgIH1cbiAgICBpZiAodGhpcyBpbnN0YW5jZW9mIGJvdW5kKSB7XG4gICAgICB0aGlzQmluZGluZyA9IGJhc2VDcmVhdGUoZnVuYy5wcm90b3R5cGUpO1xuICAgICAgdmFyIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0JpbmRpbmcsIGFyZ3MpO1xuICAgICAgcmV0dXJuIGlzT2JqZWN0KHJlc3VsdCkgPyByZXN1bHQgOiB0aGlzQmluZGluZztcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpc0JpbmRpbmcsIGFyZ3MpO1xuICB9XG4gIHNldEJpbmREYXRhKGJvdW5kLCBiaW5kRGF0YSk7XG4gIHJldHVybiBib3VuZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQ3JlYXRlV3JhcHBlcjtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKlxuICogU2xpY2VzIHRoZSBgY29sbGVjdGlvbmAgZnJvbSB0aGUgYHN0YXJ0YCBpbmRleCB1cCB0bywgYnV0IG5vdCBpbmNsdWRpbmcsXG4gKiB0aGUgYGVuZGAgaW5kZXguXG4gKlxuICogTm90ZTogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIGluc3RlYWQgb2YgYEFycmF5I3NsaWNlYCB0byBzdXBwb3J0IG5vZGUgbGlzdHNcbiAqIGluIElFIDwgOSBhbmQgdG8gZW5zdXJlIGRlbnNlIGFycmF5cyBhcmUgcmV0dXJuZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBzbGljZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydCBUaGUgc3RhcnQgaW5kZXguXG4gKiBAcGFyYW0ge251bWJlcn0gZW5kIFRoZSBlbmQgaW5kZXguXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBhcnJheS5cbiAqL1xuZnVuY3Rpb24gc2xpY2UoYXJyYXksIHN0YXJ0LCBlbmQpIHtcbiAgc3RhcnQgfHwgKHN0YXJ0ID0gMCk7XG4gIGlmICh0eXBlb2YgZW5kID09ICd1bmRlZmluZWQnKSB7XG4gICAgZW5kID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuICB9XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW5kIC0gc3RhcnQgfHwgMCxcbiAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoKTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHJlc3VsdFtpbmRleF0gPSBhcnJheVtzdGFydCArIGluZGV4XTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNsaWNlO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBmaXJzdCBhcmd1bWVudCBwcm92aWRlZCB0byBpdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICogQHBhcmFtIHsqfSB2YWx1ZSBBbnkgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyBgdmFsdWVgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnbmFtZSc6ICdmcmVkJyB9O1xuICogXy5pZGVudGl0eShvYmplY3QpID09PSBvYmplY3Q7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpZGVudGl0eTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgaXNOYXRpdmUgPSByZXF1aXJlKCdsb2Rhc2guX2lzbmF0aXZlJyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBmdW5jdGlvbnMgY29udGFpbmluZyBhIGB0aGlzYCByZWZlcmVuY2UgKi9cbnZhciByZVRoaXMgPSAvXFxidGhpc1xcYi87XG5cbi8qKlxuICogQW4gb2JqZWN0IHVzZWQgdG8gZmxhZyBlbnZpcm9ubWVudHMgZmVhdHVyZXMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEB0eXBlIE9iamVjdFxuICovXG52YXIgc3VwcG9ydCA9IHt9O1xuXG4vKipcbiAqIERldGVjdCBpZiBmdW5jdGlvbnMgY2FuIGJlIGRlY29tcGlsZWQgYnkgYEZ1bmN0aW9uI3RvU3RyaW5nYFxuICogKGFsbCBidXQgUFMzIGFuZCBvbGRlciBPcGVyYSBtb2JpbGUgYnJvd3NlcnMgJiBhdm9pZGVkIGluIFdpbmRvd3MgOCBhcHBzKS5cbiAqXG4gKiBAbWVtYmVyT2YgXy5zdXBwb3J0XG4gKiBAdHlwZSBib29sZWFuXG4gKi9cbnN1cHBvcnQuZnVuY0RlY29tcCA9ICFpc05hdGl2ZShnbG9iYWwuV2luUlRFcnJvcikgJiYgcmVUaGlzLnRlc3QoZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KTtcblxuLyoqXG4gKiBEZXRlY3QgaWYgYEZ1bmN0aW9uI25hbWVgIGlzIHN1cHBvcnRlZCAoYWxsIGJ1dCBJRSkuXG4gKlxuICogQG1lbWJlck9mIF8uc3VwcG9ydFxuICogQHR5cGUgYm9vbGVhblxuICovXG5zdXBwb3J0LmZ1bmNOYW1lcyA9IHR5cGVvZiBGdW5jdGlvbi5uYW1lID09ICdzdHJpbmcnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN1cHBvcnQ7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKiBVc2VkIHRvIGRldGVybWluZSBpZiB2YWx1ZXMgYXJlIG9mIHRoZSBsYW5ndWFnZSB0eXBlIE9iamVjdCAqL1xudmFyIG9iamVjdFR5cGVzID0ge1xuICAnYm9vbGVhbic6IGZhbHNlLFxuICAnZnVuY3Rpb24nOiB0cnVlLFxuICAnb2JqZWN0JzogdHJ1ZSxcbiAgJ251bWJlcic6IGZhbHNlLFxuICAnc3RyaW5nJzogZmFsc2UsXG4gICd1bmRlZmluZWQnOiBmYWxzZVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBvYmplY3RUeXBlcztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgaXNOYXRpdmUgPSByZXF1aXJlKCdsb2Rhc2guX2lzbmF0aXZlJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCdsb2Rhc2guaXNvYmplY3QnKSxcbiAgICBzaGltS2V5cyA9IHJlcXVpcmUoJ2xvZGFzaC5fc2hpbWtleXMnKTtcblxuLyogTmF0aXZlIG1ldGhvZCBzaG9ydGN1dHMgZm9yIG1ldGhvZHMgd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMgKi9cbnZhciBuYXRpdmVLZXlzID0gaXNOYXRpdmUobmF0aXZlS2V5cyA9IE9iamVjdC5rZXlzKSAmJiBuYXRpdmVLZXlzO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgY29tcG9zZWQgb2YgdGhlIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGFuIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGFuIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmtleXMoeyAnb25lJzogMSwgJ3R3byc6IDIsICd0aHJlZSc6IDMgfSk7XG4gKiAvLyA9PiBbJ29uZScsICd0d28nLCAndGhyZWUnXSAocHJvcGVydHkgb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50cylcbiAqL1xudmFyIGtleXMgPSAhbmF0aXZlS2V5cyA/IHNoaW1LZXlzIDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICByZXR1cm4gbmF0aXZlS2V5cyhvYmplY3QpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBrZXlzO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBvYmplY3RUeXBlcyA9IHJlcXVpcmUoJ2xvZGFzaC5fb2JqZWN0dHlwZXMnKTtcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBBIGZhbGxiYWNrIGltcGxlbWVudGF0aW9uIG9mIGBPYmplY3Qua2V5c2Agd2hpY2ggcHJvZHVjZXMgYW4gYXJyYXkgb2YgdGhlXG4gKiBnaXZlbiBvYmplY3QncyBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHR5cGUgRnVuY3Rpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGFuIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG52YXIgc2hpbUtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgdmFyIGluZGV4LCBpdGVyYWJsZSA9IG9iamVjdCwgcmVzdWx0ID0gW107XG4gIGlmICghaXRlcmFibGUpIHJldHVybiByZXN1bHQ7XG4gIGlmICghKG9iamVjdFR5cGVzW3R5cGVvZiBvYmplY3RdKSkgcmV0dXJuIHJlc3VsdDtcbiAgICBmb3IgKGluZGV4IGluIGl0ZXJhYmxlKSB7XG4gICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChpdGVyYWJsZSwgaW5kZXgpKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGluZGV4KTtcbiAgICAgIH1cbiAgICB9XG4gIHJldHVybiByZXN1bHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2hpbUtleXM7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24uXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbic7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvbjtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgb2JqZWN0VHlwZXMgPSByZXF1aXJlKCdsb2Rhc2guX29iamVjdHR5cGVzJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlIGxhbmd1YWdlIHR5cGUgb2YgT2JqZWN0LlxuICogKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoMSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICAvLyBjaGVjayBpZiB0aGUgdmFsdWUgaXMgdGhlIEVDTUFTY3JpcHQgbGFuZ3VhZ2UgdHlwZSBvZiBPYmplY3RcbiAgLy8gaHR0cDovL2VzNS5naXRodWIuaW8vI3g4XG4gIC8vIGFuZCBhdm9pZCBhIFY4IGJ1Z1xuICAvLyBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0yMjkxXG4gIHJldHVybiAhISh2YWx1ZSAmJiBvYmplY3RUeXBlc1t0eXBlb2YgdmFsdWVdKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgc2hvcnRjdXRzICovXG52YXIgc3RyaW5nQ2xhc3MgPSAnW29iamVjdCBTdHJpbmddJztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgaW50ZXJuYWwgW1tDbGFzc11dIG9mIHZhbHVlcyAqL1xudmFyIHRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBzdHJpbmcuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIHN0cmluZywgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3RyaW5nKCdmcmVkJyk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgfHxcbiAgICB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gc3RyaW5nQ2xhc3MgfHwgZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNTdHJpbmc7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGB1bmRlZmluZWRgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYHVuZGVmaW5lZGAsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1VuZGVmaW5lZCh2b2lkIDApO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICd1bmRlZmluZWQnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzVW5kZWZpbmVkO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnbG9kYXNoLmlzZnVuY3Rpb24nKTtcblxuLyoqXG4gKiBSZXNvbHZlcyB0aGUgdmFsdWUgb2YgcHJvcGVydHkgYGtleWAgb24gYG9iamVjdGAuIElmIGBrZXlgIGlzIGEgZnVuY3Rpb25cbiAqIGl0IHdpbGwgYmUgaW52b2tlZCB3aXRoIHRoZSBgdGhpc2AgYmluZGluZyBvZiBgb2JqZWN0YCBhbmQgaXRzIHJlc3VsdCByZXR1cm5lZCxcbiAqIGVsc2UgdGhlIHByb3BlcnR5IHZhbHVlIGlzIHJldHVybmVkLiBJZiBgb2JqZWN0YCBpcyBmYWxzZXkgdGhlbiBgdW5kZWZpbmVkYFxuICogaXMgcmV0dXJuZWQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gcmVzb2x2ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXNvbHZlZCB2YWx1ZS5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHtcbiAqICAgJ2NoZWVzZSc6ICdjcnVtcGV0cycsXG4gKiAgICdzdHVmZic6IGZ1bmN0aW9uKCkge1xuICogICAgIHJldHVybiAnbm9uc2Vuc2UnO1xuICogICB9XG4gKiB9O1xuICpcbiAqIF8ucmVzdWx0KG9iamVjdCwgJ2NoZWVzZScpO1xuICogLy8gPT4gJ2NydW1wZXRzJ1xuICpcbiAqIF8ucmVzdWx0KG9iamVjdCwgJ3N0dWZmJyk7XG4gKiAvLyA9PiAnbm9uc2Vuc2UnXG4gKi9cbmZ1bmN0aW9uIHJlc3VsdChvYmplY3QsIGtleSkge1xuICBpZiAob2JqZWN0KSB7XG4gICAgdmFyIHZhbHVlID0gb2JqZWN0W2tleV07XG4gICAgcmV0dXJuIGlzRnVuY3Rpb24odmFsdWUpID8gb2JqZWN0W2tleV0oKSA6IHZhbHVlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVzdWx0O1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJ2xvZGFzaC5kZWZhdWx0cycpLFxuICAgIGVzY2FwZSA9IHJlcXVpcmUoJ2xvZGFzaC5lc2NhcGUnKSxcbiAgICBlc2NhcGVTdHJpbmdDaGFyID0gcmVxdWlyZSgnbG9kYXNoLl9lc2NhcGVzdHJpbmdjaGFyJyksXG4gICAga2V5cyA9IHJlcXVpcmUoJ2xvZGFzaC5rZXlzJyksXG4gICAgcmVJbnRlcnBvbGF0ZSA9IHJlcXVpcmUoJ2xvZGFzaC5fcmVpbnRlcnBvbGF0ZScpLFxuICAgIHRlbXBsYXRlU2V0dGluZ3MgPSByZXF1aXJlKCdsb2Rhc2gudGVtcGxhdGVzZXR0aW5ncycpLFxuICAgIHZhbHVlcyA9IHJlcXVpcmUoJ2xvZGFzaC52YWx1ZXMnKTtcblxuLyoqIFVzZWQgdG8gbWF0Y2ggZW1wdHkgc3RyaW5nIGxpdGVyYWxzIGluIGNvbXBpbGVkIHRlbXBsYXRlIHNvdXJjZSAqL1xudmFyIHJlRW1wdHlTdHJpbmdMZWFkaW5nID0gL1xcYl9fcCBcXCs9ICcnOy9nLFxuICAgIHJlRW1wdHlTdHJpbmdNaWRkbGUgPSAvXFxiKF9fcCBcXCs9KSAnJyBcXCsvZyxcbiAgICByZUVtcHR5U3RyaW5nVHJhaWxpbmcgPSAvKF9fZVxcKC4qP1xcKXxcXGJfX3RcXCkpIFxcK1xcbicnOy9nO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2ggRVM2IHRlbXBsYXRlIGRlbGltaXRlcnNcbiAqIGh0dHA6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWxpdGVyYWxzLXN0cmluZy1saXRlcmFsc1xuICovXG52YXIgcmVFc1RlbXBsYXRlID0gL1xcJFxceyhbXlxcXFx9XSooPzpcXFxcLlteXFxcXH1dKikqKVxcfS9nO1xuXG4vKiogVXNlZCB0byBlbnN1cmUgY2FwdHVyaW5nIG9yZGVyIG9mIHRlbXBsYXRlIGRlbGltaXRlcnMgKi9cbnZhciByZU5vTWF0Y2ggPSAvKCReKS87XG5cbi8qKiBVc2VkIHRvIG1hdGNoIHVuZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGNvbXBpbGVkIHN0cmluZyBsaXRlcmFscyAqL1xudmFyIHJlVW5lc2NhcGVkU3RyaW5nID0gL1snXFxuXFxyXFx0XFx1MjAyOFxcdTIwMjlcXFxcXS9nO1xuXG4vKipcbiAqIEEgbWljcm8tdGVtcGxhdGluZyBtZXRob2QgdGhhdCBoYW5kbGVzIGFyYml0cmFyeSBkZWxpbWl0ZXJzLCBwcmVzZXJ2ZXNcbiAqIHdoaXRlc3BhY2UsIGFuZCBjb3JyZWN0bHkgZXNjYXBlcyBxdW90ZXMgd2l0aGluIGludGVycG9sYXRlZCBjb2RlLlxuICpcbiAqIE5vdGU6IEluIHRoZSBkZXZlbG9wbWVudCBidWlsZCwgYF8udGVtcGxhdGVgIHV0aWxpemVzIHNvdXJjZVVSTHMgZm9yIGVhc2llclxuICogZGVidWdnaW5nLiBTZWUgaHR0cDovL3d3dy5odG1sNXJvY2tzLmNvbS9lbi90dXRvcmlhbHMvZGV2ZWxvcGVydG9vbHMvc291cmNlbWFwcy8jdG9jLXNvdXJjZXVybFxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHByZWNvbXBpbGluZyB0ZW1wbGF0ZXMgc2VlOlxuICogaHR0cDovL2xvZGFzaC5jb20vY3VzdG9tLWJ1aWxkc1xuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIENocm9tZSBleHRlbnNpb24gc2FuZGJveGVzIHNlZTpcbiAqIGh0dHA6Ly9kZXZlbG9wZXIuY2hyb21lLmNvbS9zdGFibGUvZXh0ZW5zaW9ucy9zYW5kYm94aW5nRXZhbC5odG1sXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFRoZSB0ZW1wbGF0ZSB0ZXh0LlxuICogQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIGRhdGEgb2JqZWN0IHVzZWQgdG8gcG9wdWxhdGUgdGhlIHRleHQuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7UmVnRXhwfSBbb3B0aW9ucy5lc2NhcGVdIFRoZSBcImVzY2FwZVwiIGRlbGltaXRlci5cbiAqIEBwYXJhbSB7UmVnRXhwfSBbb3B0aW9ucy5ldmFsdWF0ZV0gVGhlIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXIuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnMuaW1wb3J0c10gQW4gb2JqZWN0IHRvIGltcG9ydCBpbnRvIHRoZSB0ZW1wbGF0ZSBhcyBsb2NhbCB2YXJpYWJsZXMuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuaW50ZXJwb2xhdGVdIFRoZSBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtzdHJpbmd9IFtzb3VyY2VVUkxdIFRoZSBzb3VyY2VVUkwgb2YgdGhlIHRlbXBsYXRlJ3MgY29tcGlsZWQgc291cmNlLlxuICogQHBhcmFtIHtzdHJpbmd9IFt2YXJpYWJsZV0gVGhlIGRhdGEgb2JqZWN0IHZhcmlhYmxlIG5hbWUuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb258c3RyaW5nfSBSZXR1cm5zIGEgY29tcGlsZWQgZnVuY3Rpb24gd2hlbiBubyBgZGF0YWAgb2JqZWN0XG4gKiAgaXMgZ2l2ZW4sIGVsc2UgaXQgcmV0dXJucyB0aGUgaW50ZXJwb2xhdGVkIHRleHQuXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIHVzaW5nIHRoZSBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyIHRvIGNyZWF0ZSBhIGNvbXBpbGVkIHRlbXBsYXRlXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyA8JT0gbmFtZSAlPicpO1xuICogY29tcGlsZWQoeyAnbmFtZSc6ICdmcmVkJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBmcmVkJ1xuICpcbiAqIC8vIHVzaW5nIHRoZSBcImVzY2FwZVwiIGRlbGltaXRlciB0byBlc2NhcGUgSFRNTCBpbiBkYXRhIHByb3BlcnR5IHZhbHVlc1xuICogXy50ZW1wbGF0ZSgnPGI+PCUtIHZhbHVlICU+PC9iPicsIHsgJ3ZhbHVlJzogJzxzY3JpcHQ+JyB9KTtcbiAqIC8vID0+ICc8Yj4mbHQ7c2NyaXB0Jmd0OzwvYj4nXG4gKlxuICogLy8gdXNpbmcgdGhlIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXIgdG8gZ2VuZXJhdGUgSFRNTFxuICogdmFyIGxpc3QgPSAnPCUgXy5mb3JFYWNoKHBlb3BsZSwgZnVuY3Rpb24obmFtZSkgeyAlPjxsaT48JS0gbmFtZSAlPjwvbGk+PCUgfSk7ICU+JztcbiAqIF8udGVtcGxhdGUobGlzdCwgeyAncGVvcGxlJzogWydmcmVkJywgJ2Jhcm5leSddIH0pO1xuICogLy8gPT4gJzxsaT5mcmVkPC9saT48bGk+YmFybmV5PC9saT4nXG4gKlxuICogLy8gdXNpbmcgdGhlIEVTNiBkZWxpbWl0ZXIgYXMgYW4gYWx0ZXJuYXRpdmUgdG8gdGhlIGRlZmF1bHQgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlclxuICogXy50ZW1wbGF0ZSgnaGVsbG8gJHsgbmFtZSB9JywgeyAnbmFtZSc6ICdwZWJibGVzJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBwZWJibGVzJ1xuICpcbiAqIC8vIHVzaW5nIHRoZSBpbnRlcm5hbCBgcHJpbnRgIGZ1bmN0aW9uIGluIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXJzXG4gKiBfLnRlbXBsYXRlKCc8JSBwcmludChcImhlbGxvIFwiICsgbmFtZSk7ICU+IScsIHsgJ25hbWUnOiAnYmFybmV5JyB9KTtcbiAqIC8vID0+ICdoZWxsbyBiYXJuZXkhJ1xuICpcbiAqIC8vIHVzaW5nIGEgY3VzdG9tIHRlbXBsYXRlIGRlbGltaXRlcnNcbiAqIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcbiAqICAgJ2ludGVycG9sYXRlJzogL3t7KFtcXHNcXFNdKz8pfX0vZ1xuICogfTtcbiAqXG4gKiBfLnRlbXBsYXRlKCdoZWxsbyB7eyBuYW1lIH19IScsIHsgJ25hbWUnOiAnbXVzdGFjaGUnIH0pO1xuICogLy8gPT4gJ2hlbGxvIG11c3RhY2hlISdcbiAqXG4gKiAvLyB1c2luZyB0aGUgYGltcG9ydHNgIG9wdGlvbiB0byBpbXBvcnQgalF1ZXJ5XG4gKiB2YXIgbGlzdCA9ICc8JSBqcS5lYWNoKHBlb3BsZSwgZnVuY3Rpb24obmFtZSkgeyAlPjxsaT48JS0gbmFtZSAlPjwvbGk+PCUgfSk7ICU+JztcbiAqIF8udGVtcGxhdGUobGlzdCwgeyAncGVvcGxlJzogWydmcmVkJywgJ2Jhcm5leSddIH0sIHsgJ2ltcG9ydHMnOiB7ICdqcSc6IGpRdWVyeSB9IH0pO1xuICogLy8gPT4gJzxsaT5mcmVkPC9saT48bGk+YmFybmV5PC9saT4nXG4gKlxuICogLy8gdXNpbmcgdGhlIGBzb3VyY2VVUkxgIG9wdGlvbiB0byBzcGVjaWZ5IGEgY3VzdG9tIHNvdXJjZVVSTCBmb3IgdGhlIHRlbXBsYXRlXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyA8JT0gbmFtZSAlPicsIG51bGwsIHsgJ3NvdXJjZVVSTCc6ICcvYmFzaWMvZ3JlZXRpbmcuanN0JyB9KTtcbiAqIGNvbXBpbGVkKGRhdGEpO1xuICogLy8gPT4gZmluZCB0aGUgc291cmNlIG9mIFwiZ3JlZXRpbmcuanN0XCIgdW5kZXIgdGhlIFNvdXJjZXMgdGFiIG9yIFJlc291cmNlcyBwYW5lbCBvZiB0aGUgd2ViIGluc3BlY3RvclxuICpcbiAqIC8vIHVzaW5nIHRoZSBgdmFyaWFibGVgIG9wdGlvbiB0byBlbnN1cmUgYSB3aXRoLXN0YXRlbWVudCBpc24ndCB1c2VkIGluIHRoZSBjb21waWxlZCB0ZW1wbGF0ZVxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGkgPCU9IGRhdGEubmFtZSAlPiEnLCBudWxsLCB7ICd2YXJpYWJsZSc6ICdkYXRhJyB9KTtcbiAqIGNvbXBpbGVkLnNvdXJjZTtcbiAqIC8vID0+IGZ1bmN0aW9uKGRhdGEpIHtcbiAqICAgdmFyIF9fdCwgX19wID0gJycsIF9fZSA9IF8uZXNjYXBlO1xuICogICBfX3AgKz0gJ2hpICcgKyAoKF9fdCA9ICggZGF0YS5uYW1lICkpID09IG51bGwgPyAnJyA6IF9fdCkgKyAnISc7XG4gKiAgIHJldHVybiBfX3A7XG4gKiB9XG4gKlxuICogLy8gdXNpbmcgdGhlIGBzb3VyY2VgIHByb3BlcnR5IHRvIGlubGluZSBjb21waWxlZCB0ZW1wbGF0ZXMgZm9yIG1lYW5pbmdmdWxcbiAqIC8vIGxpbmUgbnVtYmVycyBpbiBlcnJvciBtZXNzYWdlcyBhbmQgYSBzdGFjayB0cmFjZVxuICogZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4oY3dkLCAnanN0LmpzJyksICdcXFxuICogICB2YXIgSlNUID0ge1xcXG4gKiAgICAgXCJtYWluXCI6ICcgKyBfLnRlbXBsYXRlKG1haW5UZXh0KS5zb3VyY2UgKyAnXFxcbiAqICAgfTtcXFxuICogJyk7XG4gKi9cbmZ1bmN0aW9uIHRlbXBsYXRlKHRleHQsIGRhdGEsIG9wdGlvbnMpIHtcbiAgLy8gYmFzZWQgb24gSm9obiBSZXNpZydzIGB0bXBsYCBpbXBsZW1lbnRhdGlvblxuICAvLyBodHRwOi8vZWpvaG4ub3JnL2Jsb2cvamF2YXNjcmlwdC1taWNyby10ZW1wbGF0aW5nL1xuICAvLyBhbmQgTGF1cmEgRG9rdG9yb3ZhJ3MgZG9ULmpzXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9vbGFkby9kb1RcbiAgdmFyIHNldHRpbmdzID0gdGVtcGxhdGVTZXR0aW5ncy5pbXBvcnRzLl8udGVtcGxhdGVTZXR0aW5ncyB8fCB0ZW1wbGF0ZVNldHRpbmdzO1xuICB0ZXh0ID0gU3RyaW5nKHRleHQgfHwgJycpO1xuXG4gIC8vIGF2b2lkIG1pc3NpbmcgZGVwZW5kZW5jaWVzIHdoZW4gYGl0ZXJhdG9yVGVtcGxhdGVgIGlzIG5vdCBkZWZpbmVkXG4gIG9wdGlvbnMgPSBkZWZhdWx0cyh7fSwgb3B0aW9ucywgc2V0dGluZ3MpO1xuXG4gIHZhciBpbXBvcnRzID0gZGVmYXVsdHMoe30sIG9wdGlvbnMuaW1wb3J0cywgc2V0dGluZ3MuaW1wb3J0cyksXG4gICAgICBpbXBvcnRzS2V5cyA9IGtleXMoaW1wb3J0cyksXG4gICAgICBpbXBvcnRzVmFsdWVzID0gdmFsdWVzKGltcG9ydHMpO1xuXG4gIHZhciBpc0V2YWx1YXRpbmcsXG4gICAgICBpbmRleCA9IDAsXG4gICAgICBpbnRlcnBvbGF0ZSA9IG9wdGlvbnMuaW50ZXJwb2xhdGUgfHwgcmVOb01hdGNoLFxuICAgICAgc291cmNlID0gXCJfX3AgKz0gJ1wiO1xuXG4gIC8vIGNvbXBpbGUgdGhlIHJlZ2V4cCB0byBtYXRjaCBlYWNoIGRlbGltaXRlclxuICB2YXIgcmVEZWxpbWl0ZXJzID0gUmVnRXhwKFxuICAgIChvcHRpb25zLmVzY2FwZSB8fCByZU5vTWF0Y2gpLnNvdXJjZSArICd8JyArXG4gICAgaW50ZXJwb2xhdGUuc291cmNlICsgJ3wnICtcbiAgICAoaW50ZXJwb2xhdGUgPT09IHJlSW50ZXJwb2xhdGUgPyByZUVzVGVtcGxhdGUgOiByZU5vTWF0Y2gpLnNvdXJjZSArICd8JyArXG4gICAgKG9wdGlvbnMuZXZhbHVhdGUgfHwgcmVOb01hdGNoKS5zb3VyY2UgKyAnfCQnXG4gICwgJ2cnKTtcblxuICB0ZXh0LnJlcGxhY2UocmVEZWxpbWl0ZXJzLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlVmFsdWUsIGludGVycG9sYXRlVmFsdWUsIGVzVGVtcGxhdGVWYWx1ZSwgZXZhbHVhdGVWYWx1ZSwgb2Zmc2V0KSB7XG4gICAgaW50ZXJwb2xhdGVWYWx1ZSB8fCAoaW50ZXJwb2xhdGVWYWx1ZSA9IGVzVGVtcGxhdGVWYWx1ZSk7XG5cbiAgICAvLyBlc2NhcGUgY2hhcmFjdGVycyB0aGF0IGNhbm5vdCBiZSBpbmNsdWRlZCBpbiBzdHJpbmcgbGl0ZXJhbHNcbiAgICBzb3VyY2UgKz0gdGV4dC5zbGljZShpbmRleCwgb2Zmc2V0KS5yZXBsYWNlKHJlVW5lc2NhcGVkU3RyaW5nLCBlc2NhcGVTdHJpbmdDaGFyKTtcblxuICAgIC8vIHJlcGxhY2UgZGVsaW1pdGVycyB3aXRoIHNuaXBwZXRzXG4gICAgaWYgKGVzY2FwZVZhbHVlKSB7XG4gICAgICBzb3VyY2UgKz0gXCInICtcXG5fX2UoXCIgKyBlc2NhcGVWYWx1ZSArIFwiKSArXFxuJ1wiO1xuICAgIH1cbiAgICBpZiAoZXZhbHVhdGVWYWx1ZSkge1xuICAgICAgaXNFdmFsdWF0aW5nID0gdHJ1ZTtcbiAgICAgIHNvdXJjZSArPSBcIic7XFxuXCIgKyBldmFsdWF0ZVZhbHVlICsgXCI7XFxuX19wICs9ICdcIjtcbiAgICB9XG4gICAgaWYgKGludGVycG9sYXRlVmFsdWUpIHtcbiAgICAgIHNvdXJjZSArPSBcIicgK1xcbigoX190ID0gKFwiICsgaW50ZXJwb2xhdGVWYWx1ZSArIFwiKSkgPT0gbnVsbCA/ICcnIDogX190KSArXFxuJ1wiO1xuICAgIH1cbiAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcblxuICAgIC8vIHRoZSBKUyBlbmdpbmUgZW1iZWRkZWQgaW4gQWRvYmUgcHJvZHVjdHMgcmVxdWlyZXMgcmV0dXJuaW5nIHRoZSBgbWF0Y2hgXG4gICAgLy8gc3RyaW5nIGluIG9yZGVyIHRvIHByb2R1Y2UgdGhlIGNvcnJlY3QgYG9mZnNldGAgdmFsdWVcbiAgICByZXR1cm4gbWF0Y2g7XG4gIH0pO1xuXG4gIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgLy8gaWYgYHZhcmlhYmxlYCBpcyBub3Qgc3BlY2lmaWVkLCB3cmFwIGEgd2l0aC1zdGF0ZW1lbnQgYXJvdW5kIHRoZSBnZW5lcmF0ZWRcbiAgLy8gY29kZSB0byBhZGQgdGhlIGRhdGEgb2JqZWN0IHRvIHRoZSB0b3Agb2YgdGhlIHNjb3BlIGNoYWluXG4gIHZhciB2YXJpYWJsZSA9IG9wdGlvbnMudmFyaWFibGUsXG4gICAgICBoYXNWYXJpYWJsZSA9IHZhcmlhYmxlO1xuXG4gIGlmICghaGFzVmFyaWFibGUpIHtcbiAgICB2YXJpYWJsZSA9ICdvYmonO1xuICAgIHNvdXJjZSA9ICd3aXRoICgnICsgdmFyaWFibGUgKyAnKSB7XFxuJyArIHNvdXJjZSArICdcXG59XFxuJztcbiAgfVxuICAvLyBjbGVhbnVwIGNvZGUgYnkgc3RyaXBwaW5nIGVtcHR5IHN0cmluZ3NcbiAgc291cmNlID0gKGlzRXZhbHVhdGluZyA/IHNvdXJjZS5yZXBsYWNlKHJlRW1wdHlTdHJpbmdMZWFkaW5nLCAnJykgOiBzb3VyY2UpXG4gICAgLnJlcGxhY2UocmVFbXB0eVN0cmluZ01pZGRsZSwgJyQxJylcbiAgICAucmVwbGFjZShyZUVtcHR5U3RyaW5nVHJhaWxpbmcsICckMTsnKTtcblxuICAvLyBmcmFtZSBjb2RlIGFzIHRoZSBmdW5jdGlvbiBib2R5XG4gIHNvdXJjZSA9ICdmdW5jdGlvbignICsgdmFyaWFibGUgKyAnKSB7XFxuJyArXG4gICAgKGhhc1ZhcmlhYmxlID8gJycgOiB2YXJpYWJsZSArICcgfHwgKCcgKyB2YXJpYWJsZSArICcgPSB7fSk7XFxuJykgK1xuICAgIFwidmFyIF9fdCwgX19wID0gJycsIF9fZSA9IF8uZXNjYXBlXCIgK1xuICAgIChpc0V2YWx1YXRpbmdcbiAgICAgID8gJywgX19qID0gQXJyYXkucHJvdG90eXBlLmpvaW47XFxuJyArXG4gICAgICAgIFwiZnVuY3Rpb24gcHJpbnQoKSB7IF9fcCArPSBfX2ouY2FsbChhcmd1bWVudHMsICcnKSB9XFxuXCJcbiAgICAgIDogJztcXG4nXG4gICAgKSArXG4gICAgc291cmNlICtcbiAgICAncmV0dXJuIF9fcFxcbn0nO1xuXG4gIHRyeSB7XG4gICAgdmFyIHJlc3VsdCA9IEZ1bmN0aW9uKGltcG9ydHNLZXlzLCAncmV0dXJuICcgKyBzb3VyY2UgKS5hcHBseSh1bmRlZmluZWQsIGltcG9ydHNWYWx1ZXMpO1xuICB9IGNhdGNoKGUpIHtcbiAgICBlLnNvdXJjZSA9IHNvdXJjZTtcbiAgICB0aHJvdyBlO1xuICB9XG4gIGlmIChkYXRhKSB7XG4gICAgcmV0dXJuIHJlc3VsdChkYXRhKTtcbiAgfVxuICAvLyBwcm92aWRlIHRoZSBjb21waWxlZCBmdW5jdGlvbidzIHNvdXJjZSBieSBpdHMgYHRvU3RyaW5nYCBtZXRob2QsIGluXG4gIC8vIHN1cHBvcnRlZCBlbnZpcm9ubWVudHMsIG9yIHRoZSBgc291cmNlYCBwcm9wZXJ0eSBhcyBhIGNvbnZlbmllbmNlIGZvclxuICAvLyBpbmxpbmluZyBjb21waWxlZCB0ZW1wbGF0ZXMgZHVyaW5nIHRoZSBidWlsZCBwcm9jZXNzXG4gIHJlc3VsdC5zb3VyY2UgPSBzb3VyY2U7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogVXNlZCB0byBlc2NhcGUgY2hhcmFjdGVycyBmb3IgaW5jbHVzaW9uIGluIGNvbXBpbGVkIHN0cmluZyBsaXRlcmFscyAqL1xudmFyIHN0cmluZ0VzY2FwZXMgPSB7XG4gICdcXFxcJzogJ1xcXFwnLFxuICBcIidcIjogXCInXCIsXG4gICdcXG4nOiAnbicsXG4gICdcXHInOiAncicsXG4gICdcXHQnOiAndCcsXG4gICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgJ1xcdTIwMjknOiAndTIwMjknXG59O1xuXG4vKipcbiAqIFVzZWQgYnkgYHRlbXBsYXRlYCB0byBlc2NhcGUgY2hhcmFjdGVycyBmb3IgaW5jbHVzaW9uIGluIGNvbXBpbGVkXG4gKiBzdHJpbmcgbGl0ZXJhbHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBtYXRjaCBUaGUgbWF0Y2hlZCBjaGFyYWN0ZXIgdG8gZXNjYXBlLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBjaGFyYWN0ZXIuXG4gKi9cbmZ1bmN0aW9uIGVzY2FwZVN0cmluZ0NoYXIobWF0Y2gpIHtcbiAgcmV0dXJuICdcXFxcJyArIHN0cmluZ0VzY2FwZXNbbWF0Y2hdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVzY2FwZVN0cmluZ0NoYXI7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogVXNlZCB0byBtYXRjaCBcImludGVycG9sYXRlXCIgdGVtcGxhdGUgZGVsaW1pdGVycyAqL1xudmFyIHJlSW50ZXJwb2xhdGUgPSAvPCU9KFtcXHNcXFNdKz8pJT4vZztcblxubW9kdWxlLmV4cG9ydHMgPSByZUludGVycG9sYXRlO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBrZXlzID0gcmVxdWlyZSgnbG9kYXNoLmtleXMnKSxcbiAgICBvYmplY3RUeXBlcyA9IHJlcXVpcmUoJ2xvZGFzaC5fb2JqZWN0dHlwZXMnKTtcblxuLyoqXG4gKiBBc3NpZ25zIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb2Ygc291cmNlIG9iamVjdChzKSB0byB0aGUgZGVzdGluYXRpb25cbiAqIG9iamVjdCBmb3IgYWxsIGRlc3RpbmF0aW9uIHByb3BlcnRpZXMgdGhhdCByZXNvbHZlIHRvIGB1bmRlZmluZWRgLiBPbmNlIGFcbiAqIHByb3BlcnR5IGlzIHNldCwgYWRkaXRpb25hbCBkZWZhdWx0cyBvZiB0aGUgc2FtZSBwcm9wZXJ0eSB3aWxsIGJlIGlnbm9yZWQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEB0eXBlIEZ1bmN0aW9uXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHsuLi5PYmplY3R9IFtzb3VyY2VdIFRoZSBzb3VyY2Ugb2JqZWN0cy5cbiAqIEBwYXJhbS0ge09iamVjdH0gW2d1YXJkXSBBbGxvd3Mgd29ya2luZyB3aXRoIGBfLnJlZHVjZWAgd2l0aG91dCB1c2luZyBpdHNcbiAqICBga2V5YCBhbmQgYG9iamVjdGAgYXJndW1lbnRzIGFzIHNvdXJjZXMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICduYW1lJzogJ2Jhcm5leScgfTtcbiAqIF8uZGVmYXVsdHMob2JqZWN0LCB7ICduYW1lJzogJ2ZyZWQnLCAnZW1wbG95ZXInOiAnc2xhdGUnIH0pO1xuICogLy8gPT4geyAnbmFtZSc6ICdiYXJuZXknLCAnZW1wbG95ZXInOiAnc2xhdGUnIH1cbiAqL1xudmFyIGRlZmF1bHRzID0gZnVuY3Rpb24ob2JqZWN0LCBzb3VyY2UsIGd1YXJkKSB7XG4gIHZhciBpbmRleCwgaXRlcmFibGUgPSBvYmplY3QsIHJlc3VsdCA9IGl0ZXJhYmxlO1xuICBpZiAoIWl0ZXJhYmxlKSByZXR1cm4gcmVzdWx0O1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgIGFyZ3NJbmRleCA9IDAsXG4gICAgICBhcmdzTGVuZ3RoID0gdHlwZW9mIGd1YXJkID09ICdudW1iZXInID8gMiA6IGFyZ3MubGVuZ3RoO1xuICB3aGlsZSAoKythcmdzSW5kZXggPCBhcmdzTGVuZ3RoKSB7XG4gICAgaXRlcmFibGUgPSBhcmdzW2FyZ3NJbmRleF07XG4gICAgaWYgKGl0ZXJhYmxlICYmIG9iamVjdFR5cGVzW3R5cGVvZiBpdGVyYWJsZV0pIHtcbiAgICB2YXIgb3duSW5kZXggPSAtMSxcbiAgICAgICAgb3duUHJvcHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdICYmIGtleXMoaXRlcmFibGUpLFxuICAgICAgICBsZW5ndGggPSBvd25Qcm9wcyA/IG93blByb3BzLmxlbmd0aCA6IDA7XG5cbiAgICB3aGlsZSAoKytvd25JbmRleCA8IGxlbmd0aCkge1xuICAgICAgaW5kZXggPSBvd25Qcm9wc1tvd25JbmRleF07XG4gICAgICBpZiAodHlwZW9mIHJlc3VsdFtpbmRleF0gPT0gJ3VuZGVmaW5lZCcpIHJlc3VsdFtpbmRleF0gPSBpdGVyYWJsZVtpbmRleF07XG4gICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBlc2NhcGVIdG1sQ2hhciA9IHJlcXVpcmUoJ2xvZGFzaC5fZXNjYXBlaHRtbGNoYXInKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnbG9kYXNoLmtleXMnKSxcbiAgICByZVVuZXNjYXBlZEh0bWwgPSByZXF1aXJlKCdsb2Rhc2guX3JldW5lc2NhcGVkaHRtbCcpO1xuXG4vKipcbiAqIENvbnZlcnRzIHRoZSBjaGFyYWN0ZXJzIGAmYCwgYDxgLCBgPmAsIGBcImAsIGFuZCBgJ2AgaW4gYHN0cmluZ2AgdG8gdGhlaXJcbiAqIGNvcnJlc3BvbmRpbmcgSFRNTCBlbnRpdGllcy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmVzY2FwZSgnRnJlZCwgV2lsbWEsICYgUGViYmxlcycpO1xuICogLy8gPT4gJ0ZyZWQsIFdpbG1hLCAmYW1wOyBQZWJibGVzJ1xuICovXG5mdW5jdGlvbiBlc2NhcGUoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcgPT0gbnVsbCA/ICcnIDogU3RyaW5nKHN0cmluZykucmVwbGFjZShyZVVuZXNjYXBlZEh0bWwsIGVzY2FwZUh0bWxDaGFyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlc2NhcGU7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGh0bWxFc2NhcGVzID0gcmVxdWlyZSgnbG9kYXNoLl9odG1sZXNjYXBlcycpO1xuXG4vKipcbiAqIFVzZWQgYnkgYGVzY2FwZWAgdG8gY29udmVydCBjaGFyYWN0ZXJzIHRvIEhUTUwgZW50aXRpZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBtYXRjaCBUaGUgbWF0Y2hlZCBjaGFyYWN0ZXIgdG8gZXNjYXBlLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBjaGFyYWN0ZXIuXG4gKi9cbmZ1bmN0aW9uIGVzY2FwZUh0bWxDaGFyKG1hdGNoKSB7XG4gIHJldHVybiBodG1sRXNjYXBlc1ttYXRjaF07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXNjYXBlSHRtbENoYXI7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKipcbiAqIFVzZWQgdG8gY29udmVydCBjaGFyYWN0ZXJzIHRvIEhUTUwgZW50aXRpZXM6XG4gKlxuICogVGhvdWdoIHRoZSBgPmAgY2hhcmFjdGVyIGlzIGVzY2FwZWQgZm9yIHN5bW1ldHJ5LCBjaGFyYWN0ZXJzIGxpa2UgYD5gIGFuZCBgL2BcbiAqIGRvbid0IHJlcXVpcmUgZXNjYXBpbmcgaW4gSFRNTCBhbmQgaGF2ZSBubyBzcGVjaWFsIG1lYW5pbmcgdW5sZXNzIHRoZXkncmUgcGFydFxuICogb2YgYSB0YWcgb3IgYW4gdW5xdW90ZWQgYXR0cmlidXRlIHZhbHVlLlxuICogaHR0cDovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvYW1iaWd1b3VzLWFtcGVyc2FuZHMgKHVuZGVyIFwic2VtaS1yZWxhdGVkIGZ1biBmYWN0XCIpXG4gKi9cbnZhciBodG1sRXNjYXBlcyA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnLFxuICBcIidcIjogJyYjMzk7J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBodG1sRXNjYXBlcztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgaHRtbEVzY2FwZXMgPSByZXF1aXJlKCdsb2Rhc2guX2h0bWxlc2NhcGVzJyksXG4gICAga2V5cyA9IHJlcXVpcmUoJ2xvZGFzaC5rZXlzJyk7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIEhUTUwgZW50aXRpZXMgYW5kIEhUTUwgY2hhcmFjdGVycyAqL1xudmFyIHJlVW5lc2NhcGVkSHRtbCA9IFJlZ0V4cCgnWycgKyBrZXlzKGh0bWxFc2NhcGVzKS5qb2luKCcnKSArICddJywgJ2cnKTtcblxubW9kdWxlLmV4cG9ydHMgPSByZVVuZXNjYXBlZEh0bWw7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGVzY2FwZSA9IHJlcXVpcmUoJ2xvZGFzaC5lc2NhcGUnKSxcbiAgICByZUludGVycG9sYXRlID0gcmVxdWlyZSgnbG9kYXNoLl9yZWludGVycG9sYXRlJyk7XG5cbi8qKlxuICogQnkgZGVmYXVsdCwgdGhlIHRlbXBsYXRlIGRlbGltaXRlcnMgdXNlZCBieSBMby1EYXNoIGFyZSBzaW1pbGFyIHRvIHRob3NlIGluXG4gKiBlbWJlZGRlZCBSdWJ5IChFUkIpLiBDaGFuZ2UgdGhlIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmVcbiAqIGRlbGltaXRlcnMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEB0eXBlIE9iamVjdFxuICovXG52YXIgdGVtcGxhdGVTZXR0aW5ncyA9IHtcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgYGRhdGFgIHByb3BlcnR5IHZhbHVlcyB0byBiZSBIVE1MLWVzY2FwZWQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUgUmVnRXhwXG4gICAqL1xuICAnZXNjYXBlJzogLzwlLShbXFxzXFxTXSs/KSU+L2csXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZGV0ZWN0IGNvZGUgdG8gYmUgZXZhbHVhdGVkLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIFJlZ0V4cFxuICAgKi9cbiAgJ2V2YWx1YXRlJzogLzwlKFtcXHNcXFNdKz8pJT4vZyxcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgYGRhdGFgIHByb3BlcnR5IHZhbHVlcyB0byBpbmplY3QuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUgUmVnRXhwXG4gICAqL1xuICAnaW50ZXJwb2xhdGUnOiByZUludGVycG9sYXRlLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIHJlZmVyZW5jZSB0aGUgZGF0YSBvYmplY3QgaW4gdGhlIHRlbXBsYXRlIHRleHQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUgc3RyaW5nXG4gICAqL1xuICAndmFyaWFibGUnOiAnJyxcblxuICAvKipcbiAgICogVXNlZCB0byBpbXBvcnQgdmFyaWFibGVzIGludG8gdGhlIGNvbXBpbGVkIHRlbXBsYXRlLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIE9iamVjdFxuICAgKi9cbiAgJ2ltcG9ydHMnOiB7XG5cbiAgICAvKipcbiAgICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgYGxvZGFzaGAgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzLmltcG9ydHNcbiAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAqL1xuICAgICdfJzogeyAnZXNjYXBlJzogZXNjYXBlIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZVNldHRpbmdzO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBrZXlzID0gcmVxdWlyZSgnbG9kYXNoLmtleXMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IGNvbXBvc2VkIG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSB2YWx1ZXMgb2YgYG9iamVjdGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBwcm9wZXJ0eSB2YWx1ZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udmFsdWVzKHsgJ29uZSc6IDEsICd0d28nOiAyLCAndGhyZWUnOiAzIH0pO1xuICogLy8gPT4gWzEsIDIsIDNdIChwcm9wZXJ0eSBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCBhY3Jvc3MgZW52aXJvbm1lbnRzKVxuICovXG5mdW5jdGlvbiB2YWx1ZXMob2JqZWN0KSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcHJvcHMgPSBrZXlzKG9iamVjdCksXG4gICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IG9iamVjdFtwcm9wc1tpbmRleF1dO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdmFsdWVzO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqIFVzZWQgdG8gZ2VuZXJhdGUgdW5pcXVlIElEcyAqL1xudmFyIGlkQ291bnRlciA9IDA7XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgdW5pcXVlIElELiBJZiBgcHJlZml4YCBpcyBwcm92aWRlZCB0aGUgSUQgd2lsbCBiZSBhcHBlbmRlZCB0byBpdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICogQHBhcmFtIHtzdHJpbmd9IFtwcmVmaXhdIFRoZSB2YWx1ZSB0byBwcmVmaXggdGhlIElEIHdpdGguXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSB1bmlxdWUgSUQuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udW5pcXVlSWQoJ2NvbnRhY3RfJyk7XG4gKiAvLyA9PiAnY29udGFjdF8xMDQnXG4gKlxuICogXy51bmlxdWVJZCgpO1xuICogLy8gPT4gJzEwNSdcbiAqL1xuZnVuY3Rpb24gdW5pcXVlSWQocHJlZml4KSB7XG4gIHZhciBpZCA9ICsraWRDb3VudGVyO1xuICByZXR1cm4gU3RyaW5nKHByZWZpeCA9PSBudWxsID8gJycgOiBwcmVmaXgpICsgaWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdW5pcXVlSWQ7XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDE0IEZlbGl4IEduYXNzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuKGZ1bmN0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblxuICAvKiBDb21tb25KUyAqL1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcpICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKVxuXG4gIC8qIEFNRCBtb2R1bGUgKi9cbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShmYWN0b3J5KVxuXG4gIC8qIEJyb3dzZXIgZ2xvYmFsICovXG4gIGVsc2Ugcm9vdC5TcGlubmVyID0gZmFjdG9yeSgpXG59XG4odGhpcywgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBwcmVmaXhlcyA9IFsnd2Via2l0JywgJ01veicsICdtcycsICdPJ10gLyogVmVuZG9yIHByZWZpeGVzICovXG4gICAgLCBhbmltYXRpb25zID0ge30gLyogQW5pbWF0aW9uIHJ1bGVzIGtleWVkIGJ5IHRoZWlyIG5hbWUgKi9cbiAgICAsIHVzZUNzc0FuaW1hdGlvbnMgLyogV2hldGhlciB0byB1c2UgQ1NTIGFuaW1hdGlvbnMgb3Igc2V0VGltZW91dCAqL1xuXG4gIC8qKlxuICAgKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBlbGVtZW50cy4gSWYgbm8gdGFnIG5hbWUgaXMgZ2l2ZW4sXG4gICAqIGEgRElWIGlzIGNyZWF0ZWQuIE9wdGlvbmFsbHkgcHJvcGVydGllcyBjYW4gYmUgcGFzc2VkLlxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlRWwodGFnLCBwcm9wKSB7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcgfHwgJ2RpdicpXG4gICAgICAsIG5cblxuICAgIGZvcihuIGluIHByb3ApIGVsW25dID0gcHJvcFtuXVxuICAgIHJldHVybiBlbFxuICB9XG5cbiAgLyoqXG4gICAqIEFwcGVuZHMgY2hpbGRyZW4gYW5kIHJldHVybnMgdGhlIHBhcmVudC5cbiAgICovXG4gIGZ1bmN0aW9uIGlucyhwYXJlbnQgLyogY2hpbGQxLCBjaGlsZDIsIC4uLiovKSB7XG4gICAgZm9yICh2YXIgaT0xLCBuPWFyZ3VtZW50cy5sZW5ndGg7IGk8bjsgaSsrKVxuICAgICAgcGFyZW50LmFwcGVuZENoaWxkKGFyZ3VtZW50c1tpXSlcblxuICAgIHJldHVybiBwYXJlbnRcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYSBuZXcgc3R5bGVzaGVldCB0byBob2xkIHRoZSBAa2V5ZnJhbWUgb3IgVk1MIHJ1bGVzLlxuICAgKi9cbiAgdmFyIHNoZWV0ID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbCA9IGNyZWF0ZUVsKCdzdHlsZScsIHt0eXBlIDogJ3RleHQvY3NzJ30pXG4gICAgaW5zKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0sIGVsKVxuICAgIHJldHVybiBlbC5zaGVldCB8fCBlbC5zdHlsZVNoZWV0XG4gIH0oKSlcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBvcGFjaXR5IGtleWZyYW1lIGFuaW1hdGlvbiBydWxlIGFuZCByZXR1cm5zIGl0cyBuYW1lLlxuICAgKiBTaW5jZSBtb3N0IG1vYmlsZSBXZWJraXRzIGhhdmUgdGltaW5nIGlzc3VlcyB3aXRoIGFuaW1hdGlvbi1kZWxheSxcbiAgICogd2UgY3JlYXRlIHNlcGFyYXRlIHJ1bGVzIGZvciBlYWNoIGxpbmUvc2VnbWVudC5cbiAgICovXG4gIGZ1bmN0aW9uIGFkZEFuaW1hdGlvbihhbHBoYSwgdHJhaWwsIGksIGxpbmVzKSB7XG4gICAgdmFyIG5hbWUgPSBbJ29wYWNpdHknLCB0cmFpbCwgfn4oYWxwaGEqMTAwKSwgaSwgbGluZXNdLmpvaW4oJy0nKVxuICAgICAgLCBzdGFydCA9IDAuMDEgKyBpL2xpbmVzICogMTAwXG4gICAgICAsIHogPSBNYXRoLm1heCgxIC0gKDEtYWxwaGEpIC8gdHJhaWwgKiAoMTAwLXN0YXJ0KSwgYWxwaGEpXG4gICAgICAsIHByZWZpeCA9IHVzZUNzc0FuaW1hdGlvbnMuc3Vic3RyaW5nKDAsIHVzZUNzc0FuaW1hdGlvbnMuaW5kZXhPZignQW5pbWF0aW9uJykpLnRvTG93ZXJDYXNlKClcbiAgICAgICwgcHJlID0gcHJlZml4ICYmICctJyArIHByZWZpeCArICctJyB8fCAnJ1xuXG4gICAgaWYgKCFhbmltYXRpb25zW25hbWVdKSB7XG4gICAgICBzaGVldC5pbnNlcnRSdWxlKFxuICAgICAgICAnQCcgKyBwcmUgKyAna2V5ZnJhbWVzICcgKyBuYW1lICsgJ3snICtcbiAgICAgICAgJzAle29wYWNpdHk6JyArIHogKyAnfScgK1xuICAgICAgICBzdGFydCArICcle29wYWNpdHk6JyArIGFscGhhICsgJ30nICtcbiAgICAgICAgKHN0YXJ0KzAuMDEpICsgJyV7b3BhY2l0eToxfScgK1xuICAgICAgICAoc3RhcnQrdHJhaWwpICUgMTAwICsgJyV7b3BhY2l0eTonICsgYWxwaGEgKyAnfScgK1xuICAgICAgICAnMTAwJXtvcGFjaXR5OicgKyB6ICsgJ30nICtcbiAgICAgICAgJ30nLCBzaGVldC5jc3NSdWxlcy5sZW5ndGgpXG5cbiAgICAgIGFuaW1hdGlvbnNbbmFtZV0gPSAxXG4gICAgfVxuXG4gICAgcmV0dXJuIG5hbWVcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmllcyB2YXJpb3VzIHZlbmRvciBwcmVmaXhlcyBhbmQgcmV0dXJucyB0aGUgZmlyc3Qgc3VwcG9ydGVkIHByb3BlcnR5LlxuICAgKi9cbiAgZnVuY3Rpb24gdmVuZG9yKGVsLCBwcm9wKSB7XG4gICAgdmFyIHMgPSBlbC5zdHlsZVxuICAgICAgLCBwcFxuICAgICAgLCBpXG5cbiAgICBwcm9wID0gcHJvcC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHByb3Auc2xpY2UoMSlcbiAgICBmb3IoaT0wOyBpPHByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwcCA9IHByZWZpeGVzW2ldK3Byb3BcbiAgICAgIGlmKHNbcHBdICE9PSB1bmRlZmluZWQpIHJldHVybiBwcFxuICAgIH1cbiAgICBpZihzW3Byb3BdICE9PSB1bmRlZmluZWQpIHJldHVybiBwcm9wXG4gIH1cblxuICAvKipcbiAgICogU2V0cyBtdWx0aXBsZSBzdHlsZSBwcm9wZXJ0aWVzIGF0IG9uY2UuXG4gICAqL1xuICBmdW5jdGlvbiBjc3MoZWwsIHByb3ApIHtcbiAgICBmb3IgKHZhciBuIGluIHByb3ApXG4gICAgICBlbC5zdHlsZVt2ZW5kb3IoZWwsIG4pfHxuXSA9IHByb3Bbbl1cblxuICAgIHJldHVybiBlbFxuICB9XG5cbiAgLyoqXG4gICAqIEZpbGxzIGluIGRlZmF1bHQgdmFsdWVzLlxuICAgKi9cbiAgZnVuY3Rpb24gbWVyZ2Uob2JqKSB7XG4gICAgZm9yICh2YXIgaT0xOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGVmID0gYXJndW1lbnRzW2ldXG4gICAgICBmb3IgKHZhciBuIGluIGRlZilcbiAgICAgICAgaWYgKG9ialtuXSA9PT0gdW5kZWZpbmVkKSBvYmpbbl0gPSBkZWZbbl1cbiAgICB9XG4gICAgcmV0dXJuIG9ialxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFic29sdXRlIHBhZ2Utb2Zmc2V0IG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgKi9cbiAgZnVuY3Rpb24gcG9zKGVsKSB7XG4gICAgdmFyIG8gPSB7IHg6ZWwub2Zmc2V0TGVmdCwgeTplbC5vZmZzZXRUb3AgfVxuICAgIHdoaWxlKChlbCA9IGVsLm9mZnNldFBhcmVudCkpXG4gICAgICBvLngrPWVsLm9mZnNldExlZnQsIG8ueSs9ZWwub2Zmc2V0VG9wXG5cbiAgICByZXR1cm4gb1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGxpbmUgY29sb3IgZnJvbSB0aGUgZ2l2ZW4gc3RyaW5nIG9yIGFycmF5LlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0Q29sb3IoY29sb3IsIGlkeCkge1xuICAgIHJldHVybiB0eXBlb2YgY29sb3IgPT0gJ3N0cmluZycgPyBjb2xvciA6IGNvbG9yW2lkeCAlIGNvbG9yLmxlbmd0aF1cbiAgfVxuXG4gIC8vIEJ1aWx0LWluIGRlZmF1bHRzXG5cbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIGxpbmVzOiAxMiwgICAgICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICBsZW5ndGg6IDcsICAgICAgICAgICAgLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcbiAgICB3aWR0aDogNSwgICAgICAgICAgICAgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgcmFkaXVzOiAxMCwgICAgICAgICAgIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxuICAgIHJvdGF0ZTogMCwgICAgICAgICAgICAvLyBSb3RhdGlvbiBvZmZzZXRcbiAgICBjb3JuZXJzOiAxLCAgICAgICAgICAgLy8gUm91bmRuZXNzICgwLi4xKVxuICAgIGNvbG9yOiAnIzAwMCcsICAgICAgICAvLyAjcmdiIG9yICNycmdnYmJcbiAgICBkaXJlY3Rpb246IDEsICAgICAgICAgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxuICAgIHNwZWVkOiAxLCAgICAgICAgICAgICAvLyBSb3VuZHMgcGVyIHNlY29uZFxuICAgIHRyYWlsOiAxMDAsICAgICAgICAgICAvLyBBZnRlcmdsb3cgcGVyY2VudGFnZVxuICAgIG9wYWNpdHk6IDEvNCwgICAgICAgICAvLyBPcGFjaXR5IG9mIHRoZSBsaW5lc1xuICAgIGZwczogMjAsICAgICAgICAgICAgICAvLyBGcmFtZXMgcGVyIHNlY29uZCB3aGVuIHVzaW5nIHNldFRpbWVvdXQoKVxuICAgIHpJbmRleDogMmU5LCAgICAgICAgICAvLyBVc2UgYSBoaWdoIHotaW5kZXggYnkgZGVmYXVsdFxuICAgIGNsYXNzTmFtZTogJ3NwaW5uZXInLCAvLyBDU1MgY2xhc3MgdG8gYXNzaWduIHRvIHRoZSBlbGVtZW50XG4gICAgdG9wOiAnNTAlJywgICAgICAgICAgIC8vIGNlbnRlciB2ZXJ0aWNhbGx5XG4gICAgbGVmdDogJzUwJScsICAgICAgICAgIC8vIGNlbnRlciBob3Jpem9udGFsbHlcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyAgLy8gZWxlbWVudCBwb3NpdGlvblxuICB9XG5cbiAgLyoqIFRoZSBjb25zdHJ1Y3RvciAqL1xuICBmdW5jdGlvbiBTcGlubmVyKG8pIHtcbiAgICB0aGlzLm9wdHMgPSBtZXJnZShvIHx8IHt9LCBTcGlubmVyLmRlZmF1bHRzLCBkZWZhdWx0cylcbiAgfVxuXG4gIC8vIEdsb2JhbCBkZWZhdWx0cyB0aGF0IG92ZXJyaWRlIHRoZSBidWlsdC1pbnM6XG4gIFNwaW5uZXIuZGVmYXVsdHMgPSB7fVxuXG4gIG1lcmdlKFNwaW5uZXIucHJvdG90eXBlLCB7XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBzcGlubmVyIHRvIHRoZSBnaXZlbiB0YXJnZXQgZWxlbWVudC4gSWYgdGhpcyBpbnN0YW5jZSBpcyBhbHJlYWR5XG4gICAgICogc3Bpbm5pbmcsIGl0IGlzIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZCBmcm9tIGl0cyBwcmV2aW91cyB0YXJnZXQgYiBjYWxsaW5nXG4gICAgICogc3RvcCgpIGludGVybmFsbHkuXG4gICAgICovXG4gICAgc3BpbjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICB0aGlzLnN0b3AoKVxuXG4gICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgLCBvID0gc2VsZi5vcHRzXG4gICAgICAgICwgZWwgPSBzZWxmLmVsID0gY3NzKGNyZWF0ZUVsKDAsIHtjbGFzc05hbWU6IG8uY2xhc3NOYW1lfSksIHtwb3NpdGlvbjogby5wb3NpdGlvbiwgd2lkdGg6IDAsIHpJbmRleDogby56SW5kZXh9KVxuICAgICAgICAsIG1pZCA9IG8ucmFkaXVzK28ubGVuZ3RoK28ud2lkdGhcblxuICAgICAgY3NzKGVsLCB7XG4gICAgICAgIGxlZnQ6IG8ubGVmdCxcbiAgICAgICAgdG9wOiBvLnRvcFxuICAgICAgfSlcbiAgICAgICAgXG4gICAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgIHRhcmdldC5pbnNlcnRCZWZvcmUoZWwsIHRhcmdldC5maXJzdENoaWxkfHxudWxsKVxuICAgICAgfVxuXG4gICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAncHJvZ3Jlc3NiYXInKVxuICAgICAgc2VsZi5saW5lcyhlbCwgc2VsZi5vcHRzKVxuXG4gICAgICBpZiAoIXVzZUNzc0FuaW1hdGlvbnMpIHtcbiAgICAgICAgLy8gTm8gQ1NTIGFuaW1hdGlvbiBzdXBwb3J0LCB1c2Ugc2V0VGltZW91dCgpIGluc3RlYWRcbiAgICAgICAgdmFyIGkgPSAwXG4gICAgICAgICAgLCBzdGFydCA9IChvLmxpbmVzIC0gMSkgKiAoMSAtIG8uZGlyZWN0aW9uKSAvIDJcbiAgICAgICAgICAsIGFscGhhXG4gICAgICAgICAgLCBmcHMgPSBvLmZwc1xuICAgICAgICAgICwgZiA9IGZwcy9vLnNwZWVkXG4gICAgICAgICAgLCBvc3RlcCA9ICgxLW8ub3BhY2l0eSkgLyAoZipvLnRyYWlsIC8gMTAwKVxuICAgICAgICAgICwgYXN0ZXAgPSBmL28ubGluZXNcblxuICAgICAgICA7KGZ1bmN0aW9uIGFuaW0oKSB7XG4gICAgICAgICAgaSsrO1xuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgby5saW5lczsgaisrKSB7XG4gICAgICAgICAgICBhbHBoYSA9IE1hdGgubWF4KDEgLSAoaSArIChvLmxpbmVzIC0gaikgKiBhc3RlcCkgJSBmICogb3N0ZXAsIG8ub3BhY2l0eSlcblxuICAgICAgICAgICAgc2VsZi5vcGFjaXR5KGVsLCBqICogby5kaXJlY3Rpb24gKyBzdGFydCwgYWxwaGEsIG8pXG4gICAgICAgICAgfVxuICAgICAgICAgIHNlbGYudGltZW91dCA9IHNlbGYuZWwgJiYgc2V0VGltZW91dChhbmltLCB+figxMDAwL2ZwcykpXG4gICAgICAgIH0pKClcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZWxmXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0b3BzIGFuZCByZW1vdmVzIHRoZSBTcGlubmVyLlxuICAgICAqL1xuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGVsID0gdGhpcy5lbFxuICAgICAgaWYgKGVsKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpXG4gICAgICAgIGlmIChlbC5wYXJlbnROb2RlKSBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKVxuICAgICAgICB0aGlzLmVsID0gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnRlcm5hbCBtZXRob2QgdGhhdCBkcmF3cyB0aGUgaW5kaXZpZHVhbCBsaW5lcy4gV2lsbCBiZSBvdmVyd3JpdHRlblxuICAgICAqIGluIFZNTCBmYWxsYmFjayBtb2RlIGJlbG93LlxuICAgICAqL1xuICAgIGxpbmVzOiBmdW5jdGlvbihlbCwgbykge1xuICAgICAgdmFyIGkgPSAwXG4gICAgICAgICwgc3RhcnQgPSAoby5saW5lcyAtIDEpICogKDEgLSBvLmRpcmVjdGlvbikgLyAyXG4gICAgICAgICwgc2VnXG5cbiAgICAgIGZ1bmN0aW9uIGZpbGwoY29sb3IsIHNoYWRvdykge1xuICAgICAgICByZXR1cm4gY3NzKGNyZWF0ZUVsKCksIHtcbiAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICB3aWR0aDogKG8ubGVuZ3RoK28ud2lkdGgpICsgJ3B4JyxcbiAgICAgICAgICBoZWlnaHQ6IG8ud2lkdGggKyAncHgnLFxuICAgICAgICAgIGJhY2tncm91bmQ6IGNvbG9yLFxuICAgICAgICAgIGJveFNoYWRvdzogc2hhZG93LFxuICAgICAgICAgIHRyYW5zZm9ybU9yaWdpbjogJ2xlZnQnLFxuICAgICAgICAgIHRyYW5zZm9ybTogJ3JvdGF0ZSgnICsgfn4oMzYwL28ubGluZXMqaStvLnJvdGF0ZSkgKyAnZGVnKSB0cmFuc2xhdGUoJyArIG8ucmFkaXVzKydweCcgKycsMCknLFxuICAgICAgICAgIGJvcmRlclJhZGl1czogKG8uY29ybmVycyAqIG8ud2lkdGg+PjEpICsgJ3B4J1xuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBmb3IgKDsgaSA8IG8ubGluZXM7IGkrKykge1xuICAgICAgICBzZWcgPSBjc3MoY3JlYXRlRWwoKSwge1xuICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgIHRvcDogMSt+KG8ud2lkdGgvMikgKyAncHgnLFxuICAgICAgICAgIHRyYW5zZm9ybTogby5od2FjY2VsID8gJ3RyYW5zbGF0ZTNkKDAsMCwwKScgOiAnJyxcbiAgICAgICAgICBvcGFjaXR5OiBvLm9wYWNpdHksXG4gICAgICAgICAgYW5pbWF0aW9uOiB1c2VDc3NBbmltYXRpb25zICYmIGFkZEFuaW1hdGlvbihvLm9wYWNpdHksIG8udHJhaWwsIHN0YXJ0ICsgaSAqIG8uZGlyZWN0aW9uLCBvLmxpbmVzKSArICcgJyArIDEvby5zcGVlZCArICdzIGxpbmVhciBpbmZpbml0ZSdcbiAgICAgICAgfSlcblxuICAgICAgICBpZiAoby5zaGFkb3cpIGlucyhzZWcsIGNzcyhmaWxsKCcjMDAwJywgJzAgMCA0cHggJyArICcjMDAwJyksIHt0b3A6IDIrJ3B4J30pKVxuICAgICAgICBpbnMoZWwsIGlucyhzZWcsIGZpbGwoZ2V0Q29sb3Ioby5jb2xvciwgaSksICcwIDAgMXB4IHJnYmEoMCwwLDAsLjEpJykpKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGVsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludGVybmFsIG1ldGhvZCB0aGF0IGFkanVzdHMgdGhlIG9wYWNpdHkgb2YgYSBzaW5nbGUgbGluZS5cbiAgICAgKiBXaWxsIGJlIG92ZXJ3cml0dGVuIGluIFZNTCBmYWxsYmFjayBtb2RlIGJlbG93LlxuICAgICAqL1xuICAgIG9wYWNpdHk6IGZ1bmN0aW9uKGVsLCBpLCB2YWwpIHtcbiAgICAgIGlmIChpIDwgZWwuY2hpbGROb2Rlcy5sZW5ndGgpIGVsLmNoaWxkTm9kZXNbaV0uc3R5bGUub3BhY2l0eSA9IHZhbFxuICAgIH1cblxuICB9KVxuXG5cbiAgZnVuY3Rpb24gaW5pdFZNTCgpIHtcblxuICAgIC8qIFV0aWxpdHkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgVk1MIHRhZyAqL1xuICAgIGZ1bmN0aW9uIHZtbCh0YWcsIGF0dHIpIHtcbiAgICAgIHJldHVybiBjcmVhdGVFbCgnPCcgKyB0YWcgKyAnIHhtbG5zPVwidXJuOnNjaGVtYXMtbWljcm9zb2Z0LmNvbTp2bWxcIiBjbGFzcz1cInNwaW4tdm1sXCI+JywgYXR0cilcbiAgICB9XG5cbiAgICAvLyBObyBDU1MgdHJhbnNmb3JtcyBidXQgVk1MIHN1cHBvcnQsIGFkZCBhIENTUyBydWxlIGZvciBWTUwgZWxlbWVudHM6XG4gICAgc2hlZXQuYWRkUnVsZSgnLnNwaW4tdm1sJywgJ2JlaGF2aW9yOnVybCgjZGVmYXVsdCNWTUwpJylcblxuICAgIFNwaW5uZXIucHJvdG90eXBlLmxpbmVzID0gZnVuY3Rpb24oZWwsIG8pIHtcbiAgICAgIHZhciByID0gby5sZW5ndGgrby53aWR0aFxuICAgICAgICAsIHMgPSAyKnJcblxuICAgICAgZnVuY3Rpb24gZ3JwKCkge1xuICAgICAgICByZXR1cm4gY3NzKFxuICAgICAgICAgIHZtbCgnZ3JvdXAnLCB7XG4gICAgICAgICAgICBjb29yZHNpemU6IHMgKyAnICcgKyBzLFxuICAgICAgICAgICAgY29vcmRvcmlnaW46IC1yICsgJyAnICsgLXJcbiAgICAgICAgICB9KSxcbiAgICAgICAgICB7IHdpZHRoOiBzLCBoZWlnaHQ6IHMgfVxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIHZhciBtYXJnaW4gPSAtKG8ud2lkdGgrby5sZW5ndGgpKjIgKyAncHgnXG4gICAgICAgICwgZyA9IGNzcyhncnAoKSwge3Bvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6IG1hcmdpbiwgbGVmdDogbWFyZ2lufSlcbiAgICAgICAgLCBpXG5cbiAgICAgIGZ1bmN0aW9uIHNlZyhpLCBkeCwgZmlsdGVyKSB7XG4gICAgICAgIGlucyhnLFxuICAgICAgICAgIGlucyhjc3MoZ3JwKCksIHtyb3RhdGlvbjogMzYwIC8gby5saW5lcyAqIGkgKyAnZGVnJywgbGVmdDogfn5keH0pLFxuICAgICAgICAgICAgaW5zKGNzcyh2bWwoJ3JvdW5kcmVjdCcsIHthcmNzaXplOiBvLmNvcm5lcnN9KSwge1xuICAgICAgICAgICAgICAgIHdpZHRoOiByLFxuICAgICAgICAgICAgICAgIGhlaWdodDogby53aWR0aCxcbiAgICAgICAgICAgICAgICBsZWZ0OiBvLnJhZGl1cyxcbiAgICAgICAgICAgICAgICB0b3A6IC1vLndpZHRoPj4xLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogZmlsdGVyXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICB2bWwoJ2ZpbGwnLCB7Y29sb3I6IGdldENvbG9yKG8uY29sb3IsIGkpLCBvcGFjaXR5OiBvLm9wYWNpdHl9KSxcbiAgICAgICAgICAgICAgdm1sKCdzdHJva2UnLCB7b3BhY2l0eTogMH0pIC8vIHRyYW5zcGFyZW50IHN0cm9rZSB0byBmaXggY29sb3IgYmxlZWRpbmcgdXBvbiBvcGFjaXR5IGNoYW5nZVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfVxuXG4gICAgICBpZiAoby5zaGFkb3cpXG4gICAgICAgIGZvciAoaSA9IDE7IGkgPD0gby5saW5lczsgaSsrKVxuICAgICAgICAgIHNlZyhpLCAtMiwgJ3Byb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5CbHVyKHBpeGVscmFkaXVzPTIsbWFrZXNoYWRvdz0xLHNoYWRvd29wYWNpdHk9LjMpJylcblxuICAgICAgZm9yIChpID0gMTsgaSA8PSBvLmxpbmVzOyBpKyspIHNlZyhpKVxuICAgICAgcmV0dXJuIGlucyhlbCwgZylcbiAgICB9XG5cbiAgICBTcGlubmVyLnByb3RvdHlwZS5vcGFjaXR5ID0gZnVuY3Rpb24oZWwsIGksIHZhbCwgbykge1xuICAgICAgdmFyIGMgPSBlbC5maXJzdENoaWxkXG4gICAgICBvID0gby5zaGFkb3cgJiYgby5saW5lcyB8fCAwXG4gICAgICBpZiAoYyAmJiBpK28gPCBjLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgIGMgPSBjLmNoaWxkTm9kZXNbaStvXTsgYyA9IGMgJiYgYy5maXJzdENoaWxkOyBjID0gYyAmJiBjLmZpcnN0Q2hpbGRcbiAgICAgICAgaWYgKGMpIGMub3BhY2l0eSA9IHZhbFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZhciBwcm9iZSA9IGNzcyhjcmVhdGVFbCgnZ3JvdXAnKSwge2JlaGF2aW9yOiAndXJsKCNkZWZhdWx0I1ZNTCknfSlcblxuICBpZiAoIXZlbmRvcihwcm9iZSwgJ3RyYW5zZm9ybScpICYmIHByb2JlLmFkaikgaW5pdFZNTCgpXG4gIGVsc2UgdXNlQ3NzQW5pbWF0aW9ucyA9IHZlbmRvcihwcm9iZSwgJ2FuaW1hdGlvbicpXG5cbiAgcmV0dXJuIFNwaW5uZXJcblxufSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcbnZhciBCbG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xuXG52YXIgQmxvY2tDb250cm9sID0gZnVuY3Rpb24odHlwZSwgaW5zdGFuY2Vfc2NvcGUpIHtcbiAgdGhpcy50eXBlID0gdHlwZTtcbiAgdGhpcy5pbnN0YW5jZV9zY29wZSA9IGluc3RhbmNlX3Njb3BlO1xuICB0aGlzLmJsb2NrX3R5cGUgPSBCbG9ja3NbdGhpcy50eXBlXS5wcm90b3R5cGU7XG4gIHRoaXMuY2FuX2JlX3JlbmRlcmVkID0gdGhpcy5ibG9ja190eXBlLnRvb2xiYXJFbmFibGVkO1xuXG4gIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oQmxvY2tDb250cm9sLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vcmVuZGVyYWJsZScpLCByZXF1aXJlKCcuL2V2ZW50cycpLCB7XG5cbiAgdGFnTmFtZTogJ2EnLFxuICBjbGFzc05hbWU6IFwic3QtYmxvY2stY29udHJvbFwiLFxuXG4gIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAnZGF0YS10eXBlJzogdGhpcy5ibG9ja190eXBlLnR5cGVcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZWwuaHRtbCgnPHNwYW4gY2xhc3M9XCJzdC1pY29uXCI+JysgXy5yZXN1bHQodGhpcy5ibG9ja190eXBlLCAnaWNvbl9uYW1lJykgKyc8L3NwYW4+JyArIF8ucmVzdWx0KHRoaXMuYmxvY2tfdHlwZSwgJ3RpdGxlJykpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9ja0NvbnRyb2w7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAqIFNpclRyZXZvciBCbG9jayBDb250cm9sc1xuICogLS1cbiAqIEdpdmVzIGFuIGludGVyZmFjZSBmb3IgYWRkaW5nIG5ldyBTaXIgVHJldm9yIGJsb2Nrcy5cbiAqL1xuXG5cbnZhciBCbG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIEJsb2NrQ29udHJvbCA9IHJlcXVpcmUoJy4vYmxvY2stY29udHJvbCcpO1xudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi9ldmVudC1idXMnKTtcblxudmFyIEJsb2NrQ29udHJvbHMgPSBmdW5jdGlvbihhdmFpbGFibGVfdHlwZXMsIGluc3RhbmNlX3Njb3BlKSB7XG4gIHRoaXMuaW5zdGFuY2Vfc2NvcGUgPSBpbnN0YW5jZV9zY29wZTtcbiAgdGhpcy5hdmFpbGFibGVfdHlwZXMgPSBhdmFpbGFibGVfdHlwZXMgfHwgW107XG4gIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuICB0aGlzLmluaXRpYWxpemUoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oQmxvY2tDb250cm9scy5wcm90b3R5cGUsIHJlcXVpcmUoJy4vZnVuY3Rpb24tYmluZCcpLCByZXF1aXJlKCcuL3JlbmRlcmFibGUnKSwgcmVxdWlyZSgnLi9ldmVudHMnKSwge1xuXG4gIGJvdW5kOiBbJ2hhbmRsZUNvbnRyb2xCdXR0b25DbGljayddLFxuICBibG9ja19jb250cm9sczogbnVsbCxcblxuICBjbGFzc05hbWU6IFwic3QtYmxvY2stY29udHJvbHNcIixcblxuICBodG1sOiBcIjxhIGNsYXNzPSdzdC1pY29uIHN0LWljb24tLWNsb3NlJz5cIiArIGkxOG4udChcImdlbmVyYWw6Y2xvc2VcIikgKyBcIjwvYT5cIixcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICBmb3IodmFyIGJsb2NrX3R5cGUgaW4gdGhpcy5hdmFpbGFibGVfdHlwZXMpIHtcbiAgICAgIGlmIChCbG9ja3MuaGFzT3duUHJvcGVydHkoYmxvY2tfdHlwZSkpIHtcbiAgICAgICAgdmFyIGJsb2NrX2NvbnRyb2wgPSBuZXcgQmxvY2tDb250cm9sKGJsb2NrX3R5cGUsIHRoaXMuaW5zdGFuY2Vfc2NvcGUpO1xuICAgICAgICBpZiAoYmxvY2tfY29udHJvbC5jYW5fYmVfcmVuZGVyZWQpIHtcbiAgICAgICAgICB0aGlzLiRlbC5hcHBlbmQoYmxvY2tfY29udHJvbC5yZW5kZXIoKS4kZWwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy4kZWwuZGVsZWdhdGUoJy5zdC1ibG9jay1jb250cm9sJywgJ2NsaWNrJywgdGhpcy5oYW5kbGVDb250cm9sQnV0dG9uQ2xpY2spO1xuICB9LFxuXG4gIHNob3c6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLmFkZENsYXNzKCdzdC1ibG9jay1jb250cm9scy0tYWN0aXZlJyk7XG5cbiAgICBFdmVudEJ1cy50cmlnZ2VyKCdibG9jazpjb250cm9sczpzaG93bicpO1xuICB9LFxuXG4gIGhpZGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdzdC1ibG9jay1jb250cm9scy0tYWN0aXZlJyk7XG5cbiAgICBFdmVudEJ1cy50cmlnZ2VyKCdibG9jazpjb250cm9sczpoaWRkZW4nKTtcbiAgfSxcblxuICBoYW5kbGVDb250cm9sQnV0dG9uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgdGhpcy50cmlnZ2VyKCdjcmVhdGVCbG9jaycsICQoZS5jdXJyZW50VGFyZ2V0KS5hdHRyKCdkYXRhLXR5cGUnKSk7XG4gIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2tDb250cm9scztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgQmxvY2tEZWxldGlvbiA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gIHRoaXMuX2JpbmRGdW5jdGlvbnMoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oQmxvY2tEZWxldGlvbi5wcm90b3R5cGUsIHJlcXVpcmUoJy4vZnVuY3Rpb24tYmluZCcpLCByZXF1aXJlKCcuL3JlbmRlcmFibGUnKSwge1xuXG4gIHRhZ05hbWU6ICdhJyxcbiAgY2xhc3NOYW1lOiAnc3QtYmxvY2stdWktYnRuIHN0LWJsb2NrLXVpLWJ0bi0tZGVsZXRlIHN0LWljb24nLFxuXG4gIGF0dHJpYnV0ZXM6IHtcbiAgICBodG1sOiAnZGVsZXRlJyxcbiAgICAnZGF0YS1pY29uJzogJ2JpbidcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9ja0RlbGV0aW9uO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcblxudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgc3RUb0hUTUwgPSByZXF1aXJlKCcuL3RvLWh0bWwnKTtcbnZhciBzdFRvTWFya2Rvd24gPSByZXF1aXJlKCcuL3RvLW1hcmtkb3duJyk7XG52YXIgQmxvY2tNaXhpbnMgPSByZXF1aXJlKCcuL2Jsb2NrX21peGlucycpO1xuXG52YXIgU2ltcGxlQmxvY2sgPSByZXF1aXJlKCcuL3NpbXBsZS1ibG9jaycpO1xudmFyIEJsb2NrUmVvcmRlciA9IHJlcXVpcmUoJy4vYmxvY2sucmVvcmRlcicpO1xudmFyIEJsb2NrRGVsZXRpb24gPSByZXF1aXJlKCcuL2Jsb2NrLmRlbGV0aW9uJyk7XG52YXIgQmxvY2tQb3NpdGlvbmVyID0gcmVxdWlyZSgnLi9ibG9jay5wb3NpdGlvbmVyJyk7XG52YXIgRm9ybWF0dGVycyA9IHJlcXVpcmUoJy4vZm9ybWF0dGVycycpO1xudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi9ldmVudC1idXMnKTtcblxudmFyIFNwaW5uZXIgPSByZXF1aXJlKCdzcGluLmpzJyk7XG5cbnZhciBCbG9jayA9IGZ1bmN0aW9uKGRhdGEsIGluc3RhbmNlX2lkKSB7XG4gIFNpbXBsZUJsb2NrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG5CbG9jay5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFNpbXBsZUJsb2NrLnByb3RvdHlwZSk7XG5CbG9jay5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCbG9jaztcblxudmFyIGRlbGV0ZV90ZW1wbGF0ZSA9IFtcbiAgXCI8ZGl2IGNsYXNzPSdzdC1ibG9ja19fdWktZGVsZXRlLWNvbnRyb2xzJz5cIixcbiAgXCI8bGFiZWwgY2xhc3M9J3N0LWJsb2NrX19kZWxldGUtbGFiZWwnPlwiLFxuICBcIjwlPSBpMThuLnQoJ2dlbmVyYWw6ZGVsZXRlJykgJT5cIixcbiAgXCI8L2xhYmVsPlwiLFxuICBcIjxhIGNsYXNzPSdzdC1ibG9jay11aS1idG4gc3QtYmxvY2stdWktYnRuLS1jb25maXJtLWRlbGV0ZSBzdC1pY29uJyBkYXRhLWljb249J3RpY2snPjwvYT5cIixcbiAgXCI8YSBjbGFzcz0nc3QtYmxvY2stdWktYnRuIHN0LWJsb2NrLXVpLWJ0bi0tZGVueS1kZWxldGUgc3QtaWNvbicgZGF0YS1pY29uPSdjbG9zZSc+PC9hPlwiLFxuICBcIjwvZGl2PlwiXG5dLmpvaW4oXCJcXG5cIik7XG5cbnZhciBkcm9wX29wdGlvbnMgPSB7XG4gIGh0bWw6IFsnPGRpdiBjbGFzcz1cInN0LWJsb2NrX19kcm9wem9uZVwiPicsXG4gICAgJzxzcGFuIGNsYXNzPVwic3QtaWNvblwiPjwlPSBfLnJlc3VsdChibG9jaywgXCJpY29uX25hbWVcIikgJT48L3NwYW4+JyxcbiAgICAnPHA+PCU9IGkxOG4udChcImdlbmVyYWw6ZHJvcFwiLCB7IGJsb2NrOiBcIjxzcGFuPlwiICsgXy5yZXN1bHQoYmxvY2ssIFwidGl0bGVcIikgKyBcIjwvc3Bhbj5cIiB9KSAlPicsXG4gICAgJzwvcD48L2Rpdj4nXS5qb2luKCdcXG4nKSxcbiAgICByZV9yZW5kZXJfb25fcmVvcmRlcjogZmFsc2Vcbn07XG5cbnZhciBwYXN0ZV9vcHRpb25zID0ge1xuICBodG1sOiBbJzxpbnB1dCB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiPCU9IGkxOG4udChcImdlbmVyYWw6cGFzdGVcIikgJT5cIicsXG4gICAgJyBjbGFzcz1cInN0LWJsb2NrX19wYXN0ZS1pbnB1dCBzdC1wYXN0ZS1ibG9ja1wiPiddLmpvaW4oJycpXG59O1xuXG52YXIgdXBsb2FkX29wdGlvbnMgPSB7XG4gIGh0bWw6IFtcbiAgICAnPGRpdiBjbGFzcz1cInN0LWJsb2NrX191cGxvYWQtY29udGFpbmVyXCI+JyxcbiAgICAnPGlucHV0IHR5cGU9XCJmaWxlXCIgdHlwZT1cInN0LWZpbGUtdXBsb2FkXCI+JyxcbiAgICAnPGJ1dHRvbiBjbGFzcz1cInN0LXVwbG9hZC1idG5cIj48JT0gaTE4bi50KFwiZ2VuZXJhbDp1cGxvYWRcIikgJT48L2J1dHRvbj4nLFxuICAgICc8L2Rpdj4nXG4gIF0uam9pbignXFxuJylcbn07XG5cbmNvbmZpZy5kZWZhdWx0cy5CbG9jayA9IHtcbiAgZHJvcF9vcHRpb25zOiBkcm9wX29wdGlvbnMsXG4gIHBhc3RlX29wdGlvbnM6IHBhc3RlX29wdGlvbnMsXG4gIHVwbG9hZF9vcHRpb25zOiB1cGxvYWRfb3B0aW9uc1xufTtcblxuT2JqZWN0LmFzc2lnbihCbG9jay5wcm90b3R5cGUsIFNpbXBsZUJsb2NrLmZuLCByZXF1aXJlKCcuL2Jsb2NrLnZhbGlkYXRpb25zJyksIHtcblxuICBib3VuZDogW1wiX2hhbmRsZUNvbnRlbnRQYXN0ZVwiLCBcIl9vbkZvY3VzXCIsIFwiX29uQmx1clwiLCBcIm9uRHJvcFwiLCBcIm9uRGVsZXRlQ2xpY2tcIixcbiAgICBcImNsZWFySW5zZXJ0ZWRTdHlsZXNcIiwgXCJnZXRTZWxlY3Rpb25Gb3JGb3JtYXR0ZXJcIiwgXCJvbkJsb2NrUmVuZGVyXCJdLFxuXG4gICAgY2xhc3NOYW1lOiAnc3QtYmxvY2sgc3QtaWNvbi0tYWRkJyxcblxuICAgIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oU2ltcGxlQmxvY2suZm4uYXR0cmlidXRlcy5jYWxsKHRoaXMpLCB7XG4gICAgICAgICdkYXRhLWljb24tYWZ0ZXInIDogXCJhZGRcIlxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGljb25fbmFtZTogJ2RlZmF1bHQnLFxuXG4gICAgdmFsaWRhdGlvbkZhaWxNc2c6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGkxOG4udCgnZXJyb3JzOnZhbGlkYXRpb25fZmFpbCcsIHsgdHlwZTogdGhpcy50aXRsZSgpIH0pO1xuICAgIH0sXG5cbiAgICBlZGl0b3JIVE1MOiAnPGRpdiBjbGFzcz1cInN0LWJsb2NrX19lZGl0b3JcIj48L2Rpdj4nLFxuXG4gICAgdG9vbGJhckVuYWJsZWQ6IHRydWUsXG5cbiAgICBkcm9wcGFibGU6IGZhbHNlLFxuICAgIHBhc3RhYmxlOiBmYWxzZSxcbiAgICB1cGxvYWRhYmxlOiBmYWxzZSxcbiAgICBmZXRjaGFibGU6IGZhbHNlLFxuICAgIGFqYXhhYmxlOiBmYWxzZSxcblxuICAgIGRyb3Bfb3B0aW9uczoge30sXG4gICAgcGFzdGVfb3B0aW9uczoge30sXG4gICAgdXBsb2FkX29wdGlvbnM6IHt9LFxuXG4gICAgZm9ybWF0dGFibGU6IHRydWUsXG5cbiAgICBfcHJldmlvdXNTZWxlY3Rpb246ICcnLFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7fSxcblxuICAgIHRvTWFya2Rvd246IGZ1bmN0aW9uKG1hcmtkb3duKXsgcmV0dXJuIG1hcmtkb3duOyB9LFxuICAgIHRvSFRNTDogZnVuY3Rpb24oaHRtbCl7IHJldHVybiBodG1sOyB9LFxuXG4gICAgd2l0aE1peGluOiBmdW5jdGlvbihtaXhpbikge1xuICAgICAgaWYgKCFfLmlzT2JqZWN0KG1peGluKSkgeyByZXR1cm47IH1cblxuICAgICAgdmFyIGluaXRpYWxpemVNZXRob2QgPSBcImluaXRpYWxpemVcIiArIG1peGluLm1peGluTmFtZTtcblxuICAgICAgaWYgKF8uaXNVbmRlZmluZWQodGhpc1tpbml0aWFsaXplTWV0aG9kXSkpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBtaXhpbik7XG4gICAgICAgIHRoaXNbaW5pdGlhbGl6ZU1ldGhvZF0oKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYmVmb3JlQmxvY2tSZW5kZXIoKTtcbiAgICAgIHRoaXMuX3NldEJsb2NrSW5uZXIoKTtcblxuICAgICAgdGhpcy4kZWRpdG9yID0gdGhpcy4kaW5uZXIuY2hpbGRyZW4oKS5maXJzdCgpO1xuXG4gICAgICBpZih0aGlzLmRyb3BwYWJsZSB8fCB0aGlzLnBhc3RhYmxlIHx8IHRoaXMudXBsb2FkYWJsZSkge1xuICAgICAgICB2YXIgaW5wdXRfaHRtbCA9ICQoXCI8ZGl2PlwiLCB7ICdjbGFzcyc6ICdzdC1ibG9ja19faW5wdXRzJyB9KTtcbiAgICAgICAgdGhpcy4kaW5uZXIuYXBwZW5kKGlucHV0X2h0bWwpO1xuICAgICAgICB0aGlzLiRpbnB1dHMgPSBpbnB1dF9odG1sO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5oYXNUZXh0QmxvY2spIHsgdGhpcy5faW5pdFRleHRCbG9ja3MoKTsgfVxuICAgICAgaWYgKHRoaXMuZHJvcHBhYmxlKSB7IHRoaXMud2l0aE1peGluKEJsb2NrTWl4aW5zLkRyb3BwYWJsZSk7IH1cbiAgICAgIGlmICh0aGlzLnBhc3RhYmxlKSB7IHRoaXMud2l0aE1peGluKEJsb2NrTWl4aW5zLlBhc3RhYmxlKTsgfVxuICAgICAgaWYgKHRoaXMudXBsb2FkYWJsZSkgeyB0aGlzLndpdGhNaXhpbihCbG9ja01peGlucy5VcGxvYWRhYmxlKTsgfVxuICAgICAgaWYgKHRoaXMuZmV0Y2hhYmxlKSB7IHRoaXMud2l0aE1peGluKEJsb2NrTWl4aW5zLkZldGNoYWJsZSk7IH1cbiAgICAgIGlmICh0aGlzLmNvbnRyb2xsYWJsZSkgeyB0aGlzLndpdGhNaXhpbihCbG9ja01peGlucy5Db250cm9sbGFibGUpOyB9XG5cbiAgICAgIGlmICh0aGlzLmZvcm1hdHRhYmxlKSB7IHRoaXMuX2luaXRGb3JtYXR0aW5nKCk7IH1cblxuICAgICAgdGhpcy5fYmxvY2tQcmVwYXJlKCk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuYWpheGFibGUpIHtcbiAgICAgICAgdGhpcy5yZXNvbHZlQWxsSW5RdWV1ZSgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiRlbC5yZW1vdmUoKTtcbiAgICB9LFxuXG4gICAgbG9hZGluZzogZnVuY3Rpb24oKSB7XG4gICAgICBpZighXy5pc1VuZGVmaW5lZCh0aGlzLnNwaW5uZXIpKSB7IHRoaXMucmVhZHkoKTsgfVxuXG4gICAgICB0aGlzLnNwaW5uZXIgPSBuZXcgU3Bpbm5lcihjb25maWcuZGVmYXVsdHMuc3Bpbm5lcik7XG4gICAgICB0aGlzLnNwaW5uZXIuc3Bpbih0aGlzLiRlbFswXSk7XG5cbiAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdzdC0taXMtbG9hZGluZycpO1xuICAgIH0sXG5cbiAgICByZWFkeTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnc3QtLWlzLWxvYWRpbmcnKTtcbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZCh0aGlzLnNwaW5uZXIpKSB7XG4gICAgICAgIHRoaXMuc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnNwaW5uZXI7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qIEdlbmVyaWMgdG9EYXRhIGltcGxlbWVudGF0aW9uLlxuICAgICAqIENhbiBiZSBvdmVyd3JpdHRlbiwgYWx0aG91Z2ggaG9wZWZ1bGx5IHRoaXMgd2lsbCBjb3ZlciBtb3N0IHNpdHVhdGlvbnNcbiAgICAgKi9cbiAgICB0b0RhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgdXRpbHMubG9nKFwidG9EYXRhIGZvciBcIiArIHRoaXMuYmxvY2tJRCk7XG5cbiAgICAgIHZhciBkYXRhT2JqID0ge307XG5cbiAgICAgIC8qIFNpbXBsZSB0byBzdGFydC4gQWRkIGNvbmRpdGlvbnMgbGF0ZXIgKi9cbiAgICAgIGlmICh0aGlzLmhhc1RleHRCbG9jaygpKSB7XG4gICAgICAgIHZhciBjb250ZW50ID0gdGhpcy5nZXRUZXh0QmxvY2soKS5odG1sKCk7XG4gICAgICAgIGlmIChjb250ZW50Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBkYXRhT2JqLnRleHQgPSBzdFRvTWFya2Rvd24oY29udGVudCwgdGhpcy50eXBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBBZGQgYW55IGlucHV0cyB0byB0aGUgZGF0YSBhdHRyXG4gICAgICBpZih0aGlzLiQoJzppbnB1dCcpLm5vdCgnLnN0LXBhc3RlLWJsb2NrJykubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLiQoJzppbnB1dCcpLmVhY2goZnVuY3Rpb24oaW5kZXgsaW5wdXQpe1xuICAgICAgICAgIGlmIChpbnB1dC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSkge1xuICAgICAgICAgICAgZGF0YU9ialtpbnB1dC5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0gPSBpbnB1dC52YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBTZXRcbiAgICAgIGlmKCFfLmlzRW1wdHkoZGF0YU9iaikpIHtcbiAgICAgICAgdGhpcy5zZXREYXRhKGRhdGFPYmopO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKiBHZW5lcmljIGltcGxlbWVudGF0aW9uIHRvIHRlbGwgdXMgd2hlbiB0aGUgYmxvY2sgaXMgYWN0aXZlICovXG4gICAgZm9jdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nZXRUZXh0QmxvY2soKS5mb2N1cygpO1xuICAgIH0sXG5cbiAgICBibHVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ2V0VGV4dEJsb2NrKCkuYmx1cigpO1xuICAgIH0sXG5cbiAgICBvbkZvY3VzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ2V0VGV4dEJsb2NrKCkuYmluZCgnZm9jdXMnLCB0aGlzLl9vbkZvY3VzKTtcbiAgICB9LFxuXG4gICAgb25CbHVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ2V0VGV4dEJsb2NrKCkuYmluZCgnYmx1cicsIHRoaXMuX29uQmx1cik7XG4gICAgfSxcblxuICAgIC8qXG4gICAgICogRXZlbnQgaGFuZGxlcnNcbiAgICAgKi9cblxuICAgIF9vbkZvY3VzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMudHJpZ2dlcignYmxvY2tGb2N1cycsIHRoaXMuJGVsKTtcbiAgICB9LFxuXG4gICAgX29uQmx1cjogZnVuY3Rpb24oKSB7fSxcblxuICAgIG9uRHJvcDogZnVuY3Rpb24oZGF0YVRyYW5zZmVyT2JqKSB7fSxcblxuICAgIG9uRGVsZXRlQ2xpY2s6IGZ1bmN0aW9uKGV2KSB7XG4gICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICB2YXIgb25EZWxldGVDb25maXJtID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMudHJpZ2dlcigncmVtb3ZlQmxvY2snLCB0aGlzLmJsb2NrSUQpO1xuICAgICAgfTtcblxuICAgICAgdmFyIG9uRGVsZXRlRGVueSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnc3QtYmxvY2stLWRlbGV0ZS1hY3RpdmUnKTtcbiAgICAgICAgJGRlbGV0ZV9lbC5yZW1vdmUoKTtcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLmlzRW1wdHkoKSkge1xuICAgICAgICBvbkRlbGV0ZUNvbmZpcm0uY2FsbCh0aGlzLCBuZXcgRXZlbnQoJ2NsaWNrJykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuJGlubmVyLmFwcGVuZChfLnRlbXBsYXRlKGRlbGV0ZV90ZW1wbGF0ZSkpO1xuICAgICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ3N0LWJsb2NrLS1kZWxldGUtYWN0aXZlJyk7XG5cbiAgICAgIHZhciAkZGVsZXRlX2VsID0gdGhpcy4kaW5uZXIuZmluZCgnLnN0LWJsb2NrX191aS1kZWxldGUtY29udHJvbHMnKTtcblxuICAgICAgdGhpcy4kaW5uZXIub24oJ2NsaWNrJywgJy5zdC1ibG9jay11aS1idG4tLWNvbmZpcm0tZGVsZXRlJyxcbiAgICAgICAgICAgICAgICAgICAgIG9uRGVsZXRlQ29uZmlybS5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgICAgICAgICAgLm9uKCdjbGljaycsICcuc3QtYmxvY2stdWktYnRuLS1kZW55LWRlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgb25EZWxldGVEZW55LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBwYXN0ZWRNYXJrZG93blRvSFRNTDogZnVuY3Rpb24oY29udGVudCkge1xuICAgICAgcmV0dXJuIHN0VG9IVE1MKHN0VG9NYXJrZG93bihjb250ZW50LCB0aGlzLnR5cGUpLCB0aGlzLnR5cGUpO1xuICAgIH0sXG5cbiAgICBvbkNvbnRlbnRQYXN0ZWQ6IGZ1bmN0aW9uKGV2ZW50LCB0YXJnZXQpe1xuICAgICAgdGFyZ2V0Lmh0bWwodGhpcy5wYXN0ZWRNYXJrZG93blRvSFRNTCh0YXJnZXRbMF0uaW5uZXJIVE1MKSk7XG4gICAgICB0aGlzLmdldFRleHRCbG9jaygpLmNhcmV0VG9FbmQoKTtcbiAgICB9LFxuXG4gICAgYmVmb3JlTG9hZGluZ0RhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5sb2FkaW5nKCk7XG5cbiAgICAgIGlmKHRoaXMuZHJvcHBhYmxlIHx8IHRoaXMudXBsb2FkYWJsZSB8fCB0aGlzLnBhc3RhYmxlKSB7XG4gICAgICAgIHRoaXMuJGVkaXRvci5zaG93KCk7XG4gICAgICAgIHRoaXMuJGlucHV0cy5oaWRlKCk7XG4gICAgICB9XG5cbiAgICAgIFNpbXBsZUJsb2NrLmZuLmJlZm9yZUxvYWRpbmdEYXRhLmNhbGwodGhpcyk7XG5cbiAgICAgIHRoaXMucmVhZHkoKTtcbiAgICB9LFxuXG4gICAgX2hhbmRsZUNvbnRlbnRQYXN0ZTogZnVuY3Rpb24oZXYpIHtcbiAgICAgIHNldFRpbWVvdXQodGhpcy5vbkNvbnRlbnRQYXN0ZWQuYmluZCh0aGlzLCBldiwgJChldi5jdXJyZW50VGFyZ2V0KSksIDApO1xuICAgIH0sXG5cbiAgICBfZ2V0QmxvY2tDbGFzczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJ3N0LWJsb2NrLS0nICsgdGhpcy5jbGFzc05hbWU7XG4gICAgfSxcblxuICAgIC8qXG4gICAgICogSW5pdCBmdW5jdGlvbnMgZm9yIGFkZGluZyBmdW5jdGlvbmFsaXR5XG4gICAgICovXG5cbiAgICBfaW5pdFVJQ29tcG9uZW50czogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBwb3NpdGlvbmVyID0gbmV3IEJsb2NrUG9zaXRpb25lcih0aGlzLiRlbCwgdGhpcy5pbnN0YW5jZUlEKTtcblxuICAgICAgdGhpcy5fd2l0aFVJQ29tcG9uZW50KFxuICAgICAgICBwb3NpdGlvbmVyLCAnLnN0LWJsb2NrLXVpLWJ0bi0tcmVvcmRlcicsIHBvc2l0aW9uZXIudG9nZ2xlXG4gICAgICApO1xuXG4gICAgICB0aGlzLl93aXRoVUlDb21wb25lbnQoXG4gICAgICAgIG5ldyBCbG9ja1Jlb3JkZXIodGhpcy4kZWwpXG4gICAgICApO1xuXG4gICAgICB0aGlzLl93aXRoVUlDb21wb25lbnQoXG4gICAgICAgIG5ldyBCbG9ja0RlbGV0aW9uKCksICcuc3QtYmxvY2stdWktYnRuLS1kZWxldGUnLCB0aGlzLm9uRGVsZXRlQ2xpY2tcbiAgICAgICk7XG5cbiAgICAgIHRoaXMub25Gb2N1cygpO1xuICAgICAgdGhpcy5vbkJsdXIoKTtcbiAgICB9LFxuXG4gICAgX2luaXRGb3JtYXR0aW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEVuYWJsZSBmb3JtYXR0aW5nIGtleWJvYXJkIGlucHV0XG4gICAgICB2YXIgZm9ybWF0dGVyO1xuICAgICAgZm9yICh2YXIgbmFtZSBpbiBGb3JtYXR0ZXJzKSB7XG4gICAgICAgIGlmIChGb3JtYXR0ZXJzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgZm9ybWF0dGVyID0gRm9ybWF0dGVyc1tuYW1lXTtcbiAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoZm9ybWF0dGVyLmtleUNvZGUpKSB7XG4gICAgICAgICAgICBmb3JtYXR0ZXIuX2JpbmRUb0Jsb2NrKHRoaXMuJGVsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2luaXRUZXh0QmxvY2tzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ2V0VGV4dEJsb2NrKClcbiAgICAgIC5iaW5kKCdwYXN0ZScsIHRoaXMuX2hhbmRsZUNvbnRlbnRQYXN0ZSlcbiAgICAgIC5iaW5kKCdrZXl1cCcsIHRoaXMuZ2V0U2VsZWN0aW9uRm9yRm9ybWF0dGVyKVxuICAgICAgLmJpbmQoJ21vdXNldXAnLCB0aGlzLmdldFNlbGVjdGlvbkZvckZvcm1hdHRlcilcbiAgICAgIC5iaW5kKCdET01Ob2RlSW5zZXJ0ZWQnLCB0aGlzLmNsZWFySW5zZXJ0ZWRTdHlsZXMpO1xuICAgIH0sXG5cbiAgICBnZXRTZWxlY3Rpb25Gb3JGb3JtYXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGJsb2NrID0gdGhpcztcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCksXG4gICAgICAgIHNlbGVjdGlvblN0ciA9IHNlbGVjdGlvbi50b1N0cmluZygpLnRyaW0oKSxcbiAgICAgICAgZXZlbnRUeXBlID0gKHNlbGVjdGlvblN0ciA9PT0gJycpID8gJ2hpZGUnIDogJ3Bvc2l0aW9uJztcblxuICAgICAgICBFdmVudEJ1cy50cmlnZ2VyKCdmb3JtYXR0ZXI6JyArIGV2ZW50VHlwZSwgYmxvY2spO1xuICAgICAgfSwgMSk7XG4gICAgfSxcblxuICAgIGNsZWFySW5zZXJ0ZWRTdHlsZXM6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldDtcbiAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7IC8vIEhhY2t5IGZpeCBmb3IgQ2hyb21lLlxuICAgIH0sXG5cbiAgICBoYXNUZXh0QmxvY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGV4dEJsb2NrKCkubGVuZ3RoID4gMDtcbiAgICB9LFxuXG4gICAgZ2V0VGV4dEJsb2NrOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHRoaXMudGV4dF9ibG9jaykpIHtcbiAgICAgICAgdGhpcy50ZXh0X2Jsb2NrID0gdGhpcy4kKCcuc3QtdGV4dC1ibG9jaycpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy50ZXh0X2Jsb2NrO1xuICAgIH0sXG5cbiAgICBpc0VtcHR5OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLmlzRW1wdHkodGhpcy5zYXZlQW5kR2V0RGF0YSgpKTtcbiAgICB9XG5cbn0pO1xuXG5CbG9jay5leHRlbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvZXh0ZW5kJyk7IC8vIEFsbG93IG91ciBCbG9jayB0byBiZSBleHRlbmRlZC5cblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jaztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5cbnZhciBFdmVudEJ1cyA9IHJlcXVpcmUoJy4vZXZlbnQtYnVzJyk7XG5cbnZhciB0ZW1wbGF0ZSA9IFtcbiAgXCI8ZGl2IGNsYXNzPSdzdC1ibG9jay1wb3NpdGlvbmVyX19pbm5lcic+XCIsXG4gIFwiPHNwYW4gY2xhc3M9J3N0LWJsb2NrLXBvc2l0aW9uZXJfX3NlbGVjdGVkLXZhbHVlJz48L3NwYW4+XCIsXG4gIFwiPHNlbGVjdCBjbGFzcz0nc3QtYmxvY2stcG9zaXRpb25lcl9fc2VsZWN0Jz48L3NlbGVjdD5cIixcbiAgXCI8L2Rpdj5cIlxuXS5qb2luKFwiXFxuXCIpO1xuXG52YXIgQmxvY2tQb3NpdGlvbmVyID0gZnVuY3Rpb24oYmxvY2tfZWxlbWVudCwgaW5zdGFuY2VfaWQpIHtcbiAgdGhpcy4kYmxvY2sgPSBibG9ja19lbGVtZW50O1xuICB0aGlzLmluc3RhbmNlSUQgPSBpbnN0YW5jZV9pZDtcbiAgdGhpcy50b3RhbF9ibG9ja3MgPSAwO1xuXG4gIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihCbG9ja1Bvc2l0aW9uZXIucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHtcblxuICBib3VuZDogWydvbkJsb2NrQ291bnRDaGFuZ2UnLCAnb25TZWxlY3RDaGFuZ2UnLCAndG9nZ2xlJywgJ3Nob3cnLCAnaGlkZSddLFxuXG4gIGNsYXNzTmFtZTogJ3N0LWJsb2NrLXBvc2l0aW9uZXInLFxuICB2aXNpYmxlQ2xhc3M6ICdzdC1ibG9jay1wb3NpdGlvbmVyLS1pcy12aXNpYmxlJyxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpe1xuICAgIHRoaXMuJGVsLmFwcGVuZCh0ZW1wbGF0ZSk7XG4gICAgdGhpcy4kc2VsZWN0ID0gdGhpcy4kKCcuc3QtYmxvY2stcG9zaXRpb25lcl9fc2VsZWN0Jyk7XG5cbiAgICB0aGlzLiRzZWxlY3Qub24oJ2NoYW5nZScsIHRoaXMub25TZWxlY3RDaGFuZ2UpO1xuXG4gICAgRXZlbnRCdXMub24odGhpcy5pbnN0YW5jZUlEICsgXCI6YmxvY2tzOmNvdW50X3VwZGF0ZVwiLCB0aGlzLm9uQmxvY2tDb3VudENoYW5nZSk7XG4gIH0sXG5cbiAgb25CbG9ja0NvdW50Q2hhbmdlOiBmdW5jdGlvbihuZXdfY291bnQpIHtcbiAgICBpZiAobmV3X2NvdW50ICE9PSB0aGlzLnRvdGFsX2Jsb2Nrcykge1xuICAgICAgdGhpcy50b3RhbF9ibG9ja3MgPSBuZXdfY291bnQ7XG4gICAgICB0aGlzLnJlbmRlclBvc2l0aW9uTGlzdCgpO1xuICAgIH1cbiAgfSxcblxuICBvblNlbGVjdENoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbCA9IHRoaXMuJHNlbGVjdC52YWwoKTtcbiAgICBpZiAodmFsICE9PSAwKSB7XG4gICAgICBFdmVudEJ1cy50cmlnZ2VyKHRoaXMuaW5zdGFuY2VJRCArIFwiOmJsb2NrczpjaGFuZ2VfcG9zaXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kYmxvY2ssIHZhbCwgKHZhbCA9PT0gMSA/ICdiZWZvcmUnIDogJ2FmdGVyJykpO1xuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXJQb3NpdGlvbkxpc3Q6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbm5lciA9IFwiPG9wdGlvbiB2YWx1ZT0nMCc+XCIgKyBpMThuLnQoXCJnZW5lcmFsOnBvc2l0aW9uXCIpICsgXCI8L29wdGlvbj5cIjtcbiAgICBmb3IodmFyIGkgPSAxOyBpIDw9IHRoaXMudG90YWxfYmxvY2tzOyBpKyspIHtcbiAgICAgIGlubmVyICs9IFwiPG9wdGlvbiB2YWx1ZT1cIitpK1wiPlwiK2krXCI8L29wdGlvbj5cIjtcbiAgICB9XG4gICAgdGhpcy4kc2VsZWN0Lmh0bWwoaW5uZXIpO1xuICB9LFxuXG4gIHRvZ2dsZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kc2VsZWN0LnZhbCgwKTtcbiAgICB0aGlzLiRlbC50b2dnbGVDbGFzcyh0aGlzLnZpc2libGVDbGFzcyk7XG4gIH0sXG5cbiAgc2hvdzogZnVuY3Rpb24oKXtcbiAgICB0aGlzLiRlbC5hZGRDbGFzcyh0aGlzLnZpc2libGVDbGFzcyk7XG4gIH0sXG5cbiAgaGlkZTogZnVuY3Rpb24oKXtcbiAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcyh0aGlzLnZpc2libGVDbGFzcyk7XG4gIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2tQb3NpdGlvbmVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcblxudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi9ldmVudC1idXMnKTtcblxudmFyIEJsb2NrUmVvcmRlciA9IGZ1bmN0aW9uKGJsb2NrX2VsZW1lbnQpIHtcbiAgdGhpcy4kYmxvY2sgPSBibG9ja19lbGVtZW50O1xuICB0aGlzLmJsb2NrSUQgPSB0aGlzLiRibG9jay5hdHRyKCdpZCcpO1xuXG4gIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihCbG9ja1Jlb3JkZXIucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHtcblxuICBib3VuZDogWydvbk1vdXNlRG93bicsICdvbkNsaWNrJywgJ29uRHJhZ1N0YXJ0JywgJ29uRHJhZ0VuZCcsICdvbkRyYWcnLCAnb25Ecm9wJ10sXG5cbiAgY2xhc3NOYW1lOiAnc3QtYmxvY2stdWktYnRuIHN0LWJsb2NrLXVpLWJ0bi0tcmVvcmRlciBzdC1pY29uJyxcbiAgdGFnTmFtZTogJ2EnLFxuXG4gIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAnaHRtbCc6ICdyZW9yZGVyJyxcbiAgICAgICdkcmFnZ2FibGUnOiAndHJ1ZScsXG4gICAgICAnZGF0YS1pY29uJzogJ21vdmUnXG4gICAgfTtcbiAgfSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5iaW5kKCdtb3VzZWRvd24gdG91Y2hzdGFydCcsIHRoaXMub25Nb3VzZURvd24pXG4gICAgLmJpbmQoJ2NsaWNrJywgdGhpcy5vbkNsaWNrKVxuICAgIC5iaW5kKCdkcmFnc3RhcnQnLCB0aGlzLm9uRHJhZ1N0YXJ0KVxuICAgIC5iaW5kKCdkcmFnZW5kIHRvdWNoZW5kJywgdGhpcy5vbkRyYWdFbmQpXG4gICAgLmJpbmQoJ2RyYWcgdG91Y2htb3ZlJywgdGhpcy5vbkRyYWcpO1xuXG4gICAgdGhpcy4kYmxvY2suZHJvcEFyZWEoKVxuICAgIC5iaW5kKCdkcm9wJywgdGhpcy5vbkRyb3ApO1xuICB9LFxuXG4gIG9uTW91c2VEb3duOiBmdW5jdGlvbigpIHtcbiAgICBFdmVudEJ1cy50cmlnZ2VyKFwiYmxvY2s6cmVvcmRlcjpkb3duXCIsIHRoaXMuYmxvY2tJRCk7XG4gIH0sXG5cbiAgb25Ecm9wOiBmdW5jdGlvbihldikge1xuICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgZHJvcHBlZF9vbiA9IHRoaXMuJGJsb2NrLFxuICAgIGl0ZW1faWQgPSBldi5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKFwidGV4dC9wbGFpblwiKSxcbiAgICBibG9jayA9ICQoJyMnICsgaXRlbV9pZCk7XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoaXRlbV9pZCkgJiZcbiAgICAgICAgIV8uaXNFbXB0eShibG9jaykgJiZcbiAgICAgICAgICBkcm9wcGVkX29uLmF0dHIoJ2lkJykgIT09IGl0ZW1faWQgJiZcbiAgICAgICAgICAgIGRyb3BwZWRfb24uYXR0cignZGF0YS1pbnN0YW5jZScpID09PSBibG9jay5hdHRyKCdkYXRhLWluc3RhbmNlJylcbiAgICAgICApIHtcbiAgICAgICAgIGRyb3BwZWRfb24uYWZ0ZXIoYmxvY2spO1xuICAgICAgIH1cbiAgICAgICBFdmVudEJ1cy50cmlnZ2VyKFwiYmxvY2s6cmVvcmRlcjpkcm9wcGVkXCIsIGl0ZW1faWQpO1xuICB9LFxuXG4gIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldikge1xuICAgIHZhciBidG4gPSAkKGV2LmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpO1xuXG4gICAgZXYub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RHJhZ0ltYWdlKHRoaXMuJGJsb2NrWzBdLCBidG4ucG9zaXRpb24oKS5sZWZ0LCBidG4ucG9zaXRpb24oKS50b3ApO1xuICAgIGV2Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoJ1RleHQnLCB0aGlzLmJsb2NrSUQpO1xuXG4gICAgRXZlbnRCdXMudHJpZ2dlcihcImJsb2NrOnJlb3JkZXI6ZHJhZ3N0YXJ0XCIsIHRoaXMuYmxvY2tJRCk7XG4gICAgdGhpcy4kYmxvY2suYWRkQ2xhc3MoJ3N0LWJsb2NrLS1kcmFnZ2luZycpO1xuICB9LFxuXG4gIG9uRHJhZ0VuZDogZnVuY3Rpb24oZXYpIHtcbiAgICBFdmVudEJ1cy50cmlnZ2VyKFwiYmxvY2s6cmVvcmRlcjpkcmFnZW5kXCIsIHRoaXMuYmxvY2tJRCk7XG4gICAgdGhpcy4kYmxvY2sucmVtb3ZlQ2xhc3MoJ3N0LWJsb2NrLS1kcmFnZ2luZycpO1xuICB9LFxuXG4gIG9uRHJhZzogZnVuY3Rpb24oZXYpe30sXG5cbiAgb25DbGljazogZnVuY3Rpb24oKSB7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9ja1Jlb3JkZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuL2V2ZW50LWJ1cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBibG9ja1N0b3JhZ2U6IHt9LFxuXG4gIGNyZWF0ZVN0b3JlOiBmdW5jdGlvbihibG9ja0RhdGEpIHtcbiAgICB0aGlzLmJsb2NrU3RvcmFnZSA9IHtcbiAgICAgIHR5cGU6IHV0aWxzLnVuZGVyc2NvcmVkKHRoaXMudHlwZSksXG4gICAgICBkYXRhOiBibG9ja0RhdGEgfHwge31cbiAgICB9O1xuICB9LFxuXG4gIHNhdmU6IGZ1bmN0aW9uKCkgeyB0aGlzLnRvRGF0YSgpOyB9LFxuXG4gIHNhdmVBbmRSZXR1cm5EYXRhOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNhdmUoKTtcbiAgICByZXR1cm4gdGhpcy5ibG9ja1N0b3JhZ2U7XG4gIH0sXG5cbiAgc2F2ZUFuZEdldERhdGE6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdG9yZSA9IHRoaXMuc2F2ZUFuZFJldHVybkRhdGEoKTtcbiAgICByZXR1cm4gc3RvcmUuZGF0YSB8fCBzdG9yZTtcbiAgfSxcblxuICBnZXREYXRhOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja1N0b3JhZ2UuZGF0YTtcbiAgfSxcblxuICBzZXREYXRhOiBmdW5jdGlvbihibG9ja0RhdGEpIHtcbiAgICB1dGlscy5sb2coXCJTZXR0aW5nIGRhdGEgZm9yIGJsb2NrIFwiICsgdGhpcy5ibG9ja0lEKTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuYmxvY2tTdG9yYWdlLmRhdGEsIGJsb2NrRGF0YSB8fCB7fSk7XG4gIH0sXG5cbiAgc2V0QW5kUmV0cmlldmVEYXRhOiBmdW5jdGlvbihibG9ja0RhdGEpIHtcbiAgICB0aGlzLnNldERhdGEoYmxvY2tEYXRhKTtcbiAgICByZXR1cm4gdGhpcy5nZXREYXRhKCk7XG4gIH0sXG5cbiAgc2V0QW5kTG9hZERhdGE6IGZ1bmN0aW9uKGJsb2NrRGF0YSkge1xuICAgIHRoaXMuc2V0RGF0YShibG9ja0RhdGEpO1xuICAgIHRoaXMuYmVmb3JlTG9hZGluZ0RhdGEoKTtcbiAgfSxcblxuICB0b0RhdGE6IGZ1bmN0aW9uKCkge30sXG4gIGxvYWREYXRhOiBmdW5jdGlvbigpIHt9LFxuXG4gIGJlZm9yZUxvYWRpbmdEYXRhOiBmdW5jdGlvbigpIHtcbiAgICB1dGlscy5sb2coXCJsb2FkRGF0YSBmb3IgXCIgKyB0aGlzLmJsb2NrSUQpO1xuICAgIEV2ZW50QnVzLnRyaWdnZXIoXCJibG9jazpsb2FkRGF0YVwiLCB0aGlzLmJsb2NrSUQpO1xuICAgIHRoaXMubG9hZERhdGEodGhpcy5nZXREYXRhKCkpO1xuICB9LFxuXG4gIF9sb2FkRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgdXRpbHMubG9nKFwiX2xvYWREYXRhIGlzIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgZnV0dXJlLiBQbGVhc2UgdXNlIGJlZm9yZUxvYWRpbmdEYXRhIGluc3RlYWQuXCIpO1xuICAgIHRoaXMuYmVmb3JlTG9hZGluZ0RhdGEoKTtcbiAgfSxcblxuICBjaGVja0FuZExvYWREYXRhOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIV8uaXNFbXB0eSh0aGlzLmdldERhdGEoKSkpIHtcbiAgICAgIHRoaXMuYmVmb3JlTG9hZGluZ0RhdGEoKTtcbiAgICB9XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBiZXN0TmFtZUZyb21GaWVsZCA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gIHZhciBtc2cgPSBmaWVsZC5hdHRyKFwiZGF0YS1zdC1uYW1lXCIpIHx8IGZpZWxkLmF0dHIoXCJuYW1lXCIpO1xuXG4gIGlmICghbXNnKSB7XG4gICAgbXNnID0gJ0ZpZWxkJztcbiAgfVxuXG4gIHJldHVybiB1dGlscy5jYXBpdGFsaXplKG1zZyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBlcnJvcnM6IFtdLFxuXG4gIHZhbGlkOiBmdW5jdGlvbigpe1xuICAgIHRoaXMucGVyZm9ybVZhbGlkYXRpb25zKCk7XG4gICAgcmV0dXJuIHRoaXMuZXJyb3JzLmxlbmd0aCA9PT0gMDtcbiAgfSxcblxuICAvLyBUaGlzIG1ldGhvZCBhY3R1YWxseSBkb2VzIHRoZSBsZWcgd29ya1xuICAvLyBvZiBydW5uaW5nIG91ciB2YWxpZGF0b3JzIGFuZCBjdXN0b20gdmFsaWRhdG9yc1xuICBwZXJmb3JtVmFsaWRhdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVzZXRFcnJvcnMoKTtcblxuICAgIHZhciByZXF1aXJlZF9maWVsZHMgPSB0aGlzLiQoJy5zdC1yZXF1aXJlZCcpO1xuICAgIHJlcXVpcmVkX2ZpZWxkcy5lYWNoKGZ1bmN0aW9uIChpLCBmKSB7XG4gICAgICB0aGlzLnZhbGlkYXRlRmllbGQoZik7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnZhbGlkYXRpb25zLmZvckVhY2godGhpcy5ydW5WYWxpZGF0b3IsIHRoaXMpO1xuXG4gICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3MoJ3N0LWJsb2NrLS13aXRoLWVycm9ycycsIHRoaXMuZXJyb3JzLmxlbmd0aCA+IDApO1xuICB9LFxuXG4gIC8vIEV2ZXJ5dGhpbmcgaW4gaGVyZSBzaG91bGQgYmUgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdHJ1ZSBvciBmYWxzZVxuICB2YWxpZGF0aW9uczogW10sXG5cbiAgdmFsaWRhdGVGaWVsZDogZnVuY3Rpb24oZmllbGQpIHtcbiAgICBmaWVsZCA9ICQoZmllbGQpO1xuXG4gICAgdmFyIGNvbnRlbnQgPSBmaWVsZC5hdHRyKCdjb250ZW50ZWRpdGFibGUnKSA/IGZpZWxkLnRleHQoKSA6IGZpZWxkLnZhbCgpO1xuXG4gICAgaWYgKGNvbnRlbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLnNldEVycm9yKGZpZWxkLCBpMThuLnQoXCJlcnJvcnM6YmxvY2tfZW1wdHlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogYmVzdE5hbWVGcm9tRmllbGQoZmllbGQpIH0pKTtcbiAgICB9XG4gIH0sXG5cbiAgcnVuVmFsaWRhdG9yOiBmdW5jdGlvbih2YWxpZGF0b3IpIHtcbiAgICBpZiAoIV8uaXNVbmRlZmluZWQodGhpc1t2YWxpZGF0b3JdKSkge1xuICAgICAgdGhpc1t2YWxpZGF0b3JdLmNhbGwodGhpcyk7XG4gICAgfVxuICB9LFxuXG4gIHNldEVycm9yOiBmdW5jdGlvbihmaWVsZCwgcmVhc29uKSB7XG4gICAgdmFyICRtc2cgPSB0aGlzLmFkZE1lc3NhZ2UocmVhc29uLCBcInN0LW1zZy0tZXJyb3JcIik7XG4gICAgZmllbGQuYWRkQ2xhc3MoJ3N0LWVycm9yJyk7XG5cbiAgICB0aGlzLmVycm9ycy5wdXNoKHsgZmllbGQ6IGZpZWxkLCByZWFzb246IHJlYXNvbiwgbXNnOiAkbXNnIH0pO1xuICB9LFxuXG4gIHJlc2V0RXJyb3JzOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIGVycm9yLmZpZWxkLnJlbW92ZUNsYXNzKCdzdC1lcnJvcicpO1xuICAgICAgZXJyb3IubXNnLnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kbWVzc2FnZXMucmVtb3ZlQ2xhc3MoXCJzdC1ibG9ja19fbWVzc2FnZXMtLWlzLXZpc2libGVcIik7XG4gICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgfVxuXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbnZhciBFdmVudEJ1cyA9IHJlcXVpcmUoJy4uL2V2ZW50LWJ1cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBtaXhpbk5hbWU6IFwiQWpheGFibGVcIixcblxuICBhamF4YWJsZTogdHJ1ZSxcblxuICBpbml0aWFsaXplQWpheGFibGU6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5fcXVldWVkID0gW107XG4gIH0sXG5cbiAgYWRkUXVldWVkSXRlbTogZnVuY3Rpb24obmFtZSwgZGVmZXJyZWQpIHtcbiAgICB1dGlscy5sb2coXCJBZGRpbmcgcXVldWVkIGl0ZW0gZm9yIFwiICsgdGhpcy5ibG9ja0lEICsgXCIgY2FsbGVkIFwiICsgbmFtZSk7XG4gICAgRXZlbnRCdXMudHJpZ2dlcihcIm9uVXBsb2FkU3RhcnRcIiwgdGhpcy5ibG9ja0lEKTtcblxuICAgIHRoaXMuX3F1ZXVlZC5wdXNoKHsgbmFtZTogbmFtZSwgZGVmZXJyZWQ6IGRlZmVycmVkIH0pO1xuICB9LFxuXG4gIHJlbW92ZVF1ZXVlZEl0ZW06IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB1dGlscy5sb2coXCJSZW1vdmluZyBxdWV1ZWQgaXRlbSBmb3IgXCIgKyB0aGlzLmJsb2NrSUQgKyBcIiBjYWxsZWQgXCIgKyBuYW1lKTtcbiAgICBFdmVudEJ1cy50cmlnZ2VyKFwib25VcGxvYWRTdG9wXCIsIHRoaXMuYmxvY2tJRCk7XG5cbiAgICB0aGlzLl9xdWV1ZWQgPSB0aGlzLl9xdWV1ZWQuZmlsdGVyKGZ1bmN0aW9uKHF1ZXVlZCkge1xuICAgICAgcmV0dXJuIHF1ZXVlZC5uYW1lICE9PSBuYW1lO1xuICAgIH0pO1xuICB9LFxuXG4gIGhhc0l0ZW1zSW5RdWV1ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3F1ZXVlZC5sZW5ndGggPiAwO1xuICB9LFxuXG4gIHJlc29sdmVBbGxJblF1ZXVlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9xdWV1ZWQuZm9yRWFjaChmdW5jdGlvbihpdGVtKXtcbiAgICAgIHV0aWxzLmxvZyhcIkFib3J0aW5nIHF1ZXVlZCByZXF1ZXN0OiBcIiArIGl0ZW0ubmFtZSk7XG4gICAgICBpdGVtLmRlZmVycmVkLmFib3J0KCk7XG4gICAgfSwgdGhpcyk7XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBtaXhpbk5hbWU6IFwiQ29udHJvbGxhYmxlXCIsXG5cbiAgaW5pdGlhbGl6ZUNvbnRyb2xsYWJsZTogZnVuY3Rpb24oKSB7XG4gICAgdXRpbHMubG9nKFwiQWRkaW5nIGNvbnRyb2xsYWJsZSB0byBibG9jayBcIiArIHRoaXMuYmxvY2tJRCk7XG4gICAgdGhpcy4kY29udHJvbF91aSA9ICQoJzxkaXY+JywgeydjbGFzcyc6ICdzdC1ibG9ja19fY29udHJvbC11aSd9KTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLmNvbnRyb2xzKS5mb3JFYWNoKFxuICAgICAgZnVuY3Rpb24oY21kKSB7XG4gICAgICAgIC8vIEJpbmQgY29uZmlndXJlZCBoYW5kbGVyIHRvIGN1cnJlbnQgYmxvY2sgY29udGV4dFxuICAgICAgICB0aGlzLmFkZFVpQ29udHJvbChjbWQsIHRoaXMuY29udHJvbHNbY21kXS5iaW5kKHRoaXMpKTtcbiAgICAgIH0sXG4gICAgICB0aGlzXG4gICAgKTtcbiAgICB0aGlzLiRpbm5lci5hcHBlbmQodGhpcy4kY29udHJvbF91aSk7XG4gIH0sXG5cbiAgZ2V0Q29udHJvbFRlbXBsYXRlOiBmdW5jdGlvbihjbWQpIHtcbiAgICByZXR1cm4gJChcIjxhPlwiLFxuICAgICAgeyAnZGF0YS1pY29uJzogY21kLFxuICAgICAgICAnY2xhc3MnOiAnc3QtaWNvbiBzdC1ibG9jay1jb250cm9sLXVpLWJ0biBzdC1ibG9jay1jb250cm9sLXVpLWJ0bi0tJyArIGNtZFxuICAgICAgfSk7XG4gIH0sXG5cbiAgYWRkVWlDb250cm9sOiBmdW5jdGlvbihjbWQsIGhhbmRsZXIpIHtcbiAgICB0aGlzLiRjb250cm9sX3VpLmFwcGVuZCh0aGlzLmdldENvbnRyb2xUZW1wbGF0ZShjbWQpKTtcbiAgICB0aGlzLiRjb250cm9sX3VpLm9uKCdjbGljaycsICcuc3QtYmxvY2stY29udHJvbC11aS1idG4tLScgKyBjbWQsIGhhbmRsZXIpO1xuICB9XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIEFkZHMgZHJvcCBmdW5jdGlvbmFsdGl5IHRvIHRoaXMgYmxvY2sgKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi9sb2Rhc2gnKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuLi9jb25maWcnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbnZhciBFdmVudEJ1cyA9IHJlcXVpcmUoJy4uL2V2ZW50LWJ1cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBtaXhpbk5hbWU6IFwiRHJvcHBhYmxlXCIsXG4gIHZhbGlkX2Ryb3BfZmlsZV90eXBlczogWydGaWxlJywgJ0ZpbGVzJywgJ3RleHQvcGxhaW4nLCAndGV4dC91cmktbGlzdCddLFxuXG4gIGluaXRpYWxpemVEcm9wcGFibGU6IGZ1bmN0aW9uKCkge1xuICAgIHV0aWxzLmxvZyhcIkFkZGluZyBkcm9wcGFibGUgdG8gYmxvY2sgXCIgKyB0aGlzLmJsb2NrSUQpO1xuXG4gICAgdGhpcy5kcm9wX29wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBjb25maWcuZGVmYXVsdHMuQmxvY2suZHJvcF9vcHRpb25zLCB0aGlzLmRyb3Bfb3B0aW9ucyk7XG5cbiAgICB2YXIgZHJvcF9odG1sID0gJChfLnRlbXBsYXRlKHRoaXMuZHJvcF9vcHRpb25zLmh0bWwpKHsgYmxvY2s6IHRoaXMsIF86IF8gfSkpO1xuXG4gICAgdGhpcy4kZWRpdG9yLmhpZGUoKTtcbiAgICB0aGlzLiRpbnB1dHMuYXBwZW5kKGRyb3BfaHRtbCk7XG4gICAgdGhpcy4kZHJvcHpvbmUgPSBkcm9wX2h0bWw7XG5cbiAgICAvLyBCaW5kIG91ciBkcm9wIGV2ZW50XG4gICAgdGhpcy4kZHJvcHpvbmUuZHJvcEFyZWEoKVxuICAgICAgICAgICAgICAgICAgLmJpbmQoJ2Ryb3AnLCB0aGlzLl9oYW5kbGVEcm9wLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy4kaW5uZXIuYWRkQ2xhc3MoJ3N0LWJsb2NrX19pbm5lci0tZHJvcHBhYmxlJyk7XG4gIH0sXG5cbiAgX2hhbmRsZURyb3A6IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBlID0gZS5vcmlnaW5hbEV2ZW50O1xuXG4gICAgdmFyIGVsID0gJChlLnRhcmdldCksXG4gICAgICAgIHR5cGVzID0gZS5kYXRhVHJhbnNmZXIudHlwZXM7XG5cbiAgICBlbC5yZW1vdmVDbGFzcygnc3QtZHJvcHpvbmUtLWRyYWdvdmVyJyk7XG5cbiAgICAvKlxuICAgICAgQ2hlY2sgdGhlIHR5cGUgd2UganVzdCByZWNlaXZlZCxcbiAgICAgIGRlbGVnYXRlIGl0IGF3YXkgdG8gb3VyIGJsb2NrVHlwZXMgdG8gcHJvY2Vzc1xuICAgICovXG5cbiAgICBpZiAodHlwZXMgJiZcbiAgICAgICAgdHlwZXMuc29tZShmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZF9kcm9wX2ZpbGVfdHlwZXMuaW5jbHVkZXModHlwZSk7XG4gICAgICAgICAgICAgICAgICAgfSwgdGhpcykpIHtcbiAgICAgIHRoaXMub25Ecm9wKGUuZGF0YVRyYW5zZmVyKTtcbiAgICB9XG5cbiAgICBFdmVudEJ1cy50cmlnZ2VyKCdibG9jazpjb250ZW50OmRyb3BwZWQnLCB0aGlzLmJsb2NrSUQpO1xuICB9XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuLi9sb2Rhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbWl4aW5OYW1lOiBcIkZldGNoYWJsZVwiLFxuXG4gIGluaXRpYWxpemVGZXRjaGFibGU6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy53aXRoTWl4aW4ocmVxdWlyZSgnLi9hamF4YWJsZScpKTtcbiAgfSxcblxuICBmZXRjaDogZnVuY3Rpb24ob3B0aW9ucywgc3VjY2VzcywgZmFpbHVyZSl7XG4gICAgdmFyIHVpZCA9IF8udW5pcXVlSWQodGhpcy5ibG9ja0lEICsgXCJfZmV0Y2hcIiksXG4gICAgICAgIHhociA9ICQuYWpheChvcHRpb25zKTtcblxuICAgIHRoaXMucmVzZXRNZXNzYWdlcygpO1xuICAgIHRoaXMuYWRkUXVldWVkSXRlbSh1aWQsIHhocik7XG5cbiAgICBpZighXy5pc1VuZGVmaW5lZChzdWNjZXNzKSkge1xuICAgICAgeGhyLmRvbmUoc3VjY2Vzcy5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBpZighXy5pc1VuZGVmaW5lZChmYWlsdXJlKSkge1xuICAgICAgeGhyLmZhaWwoZmFpbHVyZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICB4aHIuYWx3YXlzKHRoaXMucmVtb3ZlUXVldWVkSXRlbS5iaW5kKHRoaXMsIHVpZCkpO1xuXG4gICAgcmV0dXJuIHhocjtcbiAgfVxuXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBBamF4YWJsZTogcmVxdWlyZSgnLi9hamF4YWJsZS5qcycpLFxuICBDb250cm9sbGFibGU6IHJlcXVpcmUoJy4vY29udHJvbGxhYmxlLmpzJyksXG4gIERyb3BwYWJsZTogcmVxdWlyZSgnLi9kcm9wcGFibGUuanMnKSxcbiAgRmV0Y2hhYmxlOiByZXF1aXJlKCcuL2ZldGNoYWJsZS5qcycpLFxuICBQYXN0YWJsZTogcmVxdWlyZSgnLi9wYXN0YWJsZS5qcycpLFxuICBVcGxvYWRhYmxlOiByZXF1aXJlKCcuL3VwbG9hZGFibGUuanMnKSxcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuLi9sb2Rhc2gnKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuLi9jb25maWcnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG1peGluTmFtZTogXCJQYXN0YWJsZVwiLFxuXG4gIGluaXRpYWxpemVQYXN0YWJsZTogZnVuY3Rpb24oKSB7XG4gICAgdXRpbHMubG9nKFwiQWRkaW5nIHBhc3RhYmxlIHRvIGJsb2NrIFwiICsgdGhpcy5ibG9ja0lEKTtcblxuICAgIHRoaXMucGFzdGVfb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmZpZy5kZWZhdWx0cy5CbG9jay5wYXN0ZV9vcHRpb25zLCB0aGlzLnBhc3RlX29wdGlvbnMpO1xuICAgIHRoaXMuJGlucHV0cy5hcHBlbmQoXy50ZW1wbGF0ZSh0aGlzLnBhc3RlX29wdGlvbnMuaHRtbCwgdGhpcykpO1xuXG4gICAgdGhpcy4kKCcuc3QtcGFzdGUtYmxvY2snKVxuICAgICAgLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXsgJCh0aGlzKS5zZWxlY3QoKTsgfSlcbiAgICAgIC5iaW5kKCdwYXN0ZScsIHRoaXMuX2hhbmRsZUNvbnRlbnRQYXN0ZSlcbiAgICAgIC5iaW5kKCdzdWJtaXQnLCB0aGlzLl9oYW5kbGVDb250ZW50UGFzdGUpO1xuICB9XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuLi9sb2Rhc2gnKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuLi9jb25maWcnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbnZhciBmaWxlVXBsb2FkZXIgPSByZXF1aXJlKCcuLi9leHRlbnNpb25zL3Npci10cmV2b3IudXBsb2FkZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbWl4aW5OYW1lOiBcIlVwbG9hZGFibGVcIixcblxuICB1cGxvYWRzQ291bnQ6IDAsXG5cbiAgaW5pdGlhbGl6ZVVwbG9hZGFibGU6IGZ1bmN0aW9uKCkge1xuICAgIHV0aWxzLmxvZyhcIkFkZGluZyB1cGxvYWRhYmxlIHRvIGJsb2NrIFwiICsgdGhpcy5ibG9ja0lEKTtcbiAgICB0aGlzLndpdGhNaXhpbihyZXF1aXJlKCcuL2FqYXhhYmxlJykpO1xuXG4gICAgdGhpcy51cGxvYWRfb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmZpZy5kZWZhdWx0cy5CbG9jay51cGxvYWRfb3B0aW9ucywgdGhpcy51cGxvYWRfb3B0aW9ucyk7XG4gICAgdGhpcy4kaW5wdXRzLmFwcGVuZChfLnRlbXBsYXRlKHRoaXMudXBsb2FkX29wdGlvbnMuaHRtbCwgdGhpcykpO1xuICB9LFxuXG4gIHVwbG9hZGVyOiBmdW5jdGlvbihmaWxlLCBzdWNjZXNzLCBmYWlsdXJlKXtcbiAgICByZXR1cm4gZmlsZVVwbG9hZGVyKHRoaXMsIGZpbGUsIHN1Y2Nlc3MsIGZhaWx1cmUpO1xuICB9XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgQmxvY2sgUXVvdGVcbiovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vbG9kYXNoJyk7XG5cbnZhciBCbG9jayA9IHJlcXVpcmUoJy4uL2Jsb2NrJyk7XG52YXIgc3RUb0hUTUwgPSByZXF1aXJlKCcuLi90by1odG1sJyk7XG5cbnZhciB0ZW1wbGF0ZSA9IF8udGVtcGxhdGUoW1xuICAnPGJsb2NrcXVvdGUgY2xhc3M9XCJzdC1yZXF1aXJlZCBzdC10ZXh0LWJsb2NrXCIgY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiPjwvYmxvY2txdW90ZT4nLFxuICAnPGxhYmVsIGNsYXNzPVwic3QtaW5wdXQtbGFiZWxcIj4gPCU9IGkxOG4udChcImJsb2NrczpxdW90ZTpjcmVkaXRfZmllbGRcIikgJT48L2xhYmVsPicsXG4gICc8aW5wdXQgbWF4bGVuZ3RoPVwiMTQwXCIgbmFtZT1cImNpdGVcIiBwbGFjZWhvbGRlcj1cIjwlPSBpMThuLnQoXCJibG9ja3M6cXVvdGU6Y3JlZGl0X2ZpZWxkXCIpICU+XCInLFxuICAnIGNsYXNzPVwic3QtaW5wdXQtc3RyaW5nIHN0LXJlcXVpcmVkIGpzLWNpdGUtaW5wdXRcIiB0eXBlPVwidGV4dFwiIC8+J1xuXS5qb2luKFwiXFxuXCIpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jay5leHRlbmQoe1xuXG4gIHR5cGU6IFwicXVvdGVcIixcblxuICB0aXRsZTogZnVuY3Rpb24oKXsgcmV0dXJuIGkxOG4udCgnYmxvY2tzOnF1b3RlOnRpdGxlJyk7IH0sXG5cbiAgaWNvbl9uYW1lOiAncXVvdGUnLFxuXG4gIGVkaXRvckhUTUw6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0ZW1wbGF0ZSh0aGlzKTtcbiAgfSxcblxuICBsb2FkRGF0YTogZnVuY3Rpb24oZGF0YSl7XG4gICAgdGhpcy5nZXRUZXh0QmxvY2soKS5odG1sKHN0VG9IVE1MKGRhdGEudGV4dCwgdGhpcy50eXBlKSk7XG4gICAgdGhpcy4kKCcuanMtY2l0ZS1pbnB1dCcpLnZhbChkYXRhLmNpdGUpO1xuICB9LFxuXG4gIHRvTWFya2Rvd246IGZ1bmN0aW9uKG1hcmtkb3duKSB7XG4gICAgcmV0dXJuIG1hcmtkb3duLnJlcGxhY2UoL14oLispJC9tZyxcIj4gJDFcIik7XG4gIH1cblxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgSGVhZGluZyBCbG9ja1xuKi9cblxudmFyIEJsb2NrID0gcmVxdWlyZSgnLi4vYmxvY2snKTtcbnZhciBzdFRvSFRNTCA9IHJlcXVpcmUoJy4uL3RvLWh0bWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jay5leHRlbmQoe1xuXG4gIHR5cGU6ICdoZWFkaW5nJyxcblxuICB0aXRsZTogZnVuY3Rpb24oKXsgcmV0dXJuIGkxOG4udCgnYmxvY2tzOmhlYWRpbmc6dGl0bGUnKTsgfSxcblxuICBlZGl0b3JIVE1MOiAnPGRpdiBjbGFzcz1cInN0LXJlcXVpcmVkIHN0LXRleHQtYmxvY2sgc3QtdGV4dC1ibG9jay0taGVhZGluZ1wiIGNvbnRlbnRlZGl0YWJsZT1cInRydWVcIj48L2Rpdj4nLFxuXG4gIGljb25fbmFtZTogJ2hlYWRpbmcnLFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbihkYXRhKXtcbiAgICB0aGlzLmdldFRleHRCbG9jaygpLmh0bWwoc3RUb0hUTUwoZGF0YS50ZXh0LCB0aGlzLnR5cGUpKTtcbiAgfVxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgU2ltcGxlIEltYWdlIEJsb2NrXG4qL1xuXG5cbnZhciBCbG9jayA9IHJlcXVpcmUoJy4uL2Jsb2NrJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2suZXh0ZW5kKHtcblxuICB0eXBlOiBcImltYWdlXCIsXG4gIHRpdGxlOiBmdW5jdGlvbigpIHsgcmV0dXJuIGkxOG4udCgnYmxvY2tzOmltYWdlOnRpdGxlJyk7IH0sXG5cbiAgZHJvcHBhYmxlOiB0cnVlLFxuICB1cGxvYWRhYmxlOiB0cnVlLFxuXG4gIGljb25fbmFtZTogJ2ltYWdlJyxcblxuICBsb2FkRGF0YTogZnVuY3Rpb24oZGF0YSl7XG4gICAgLy8gQ3JlYXRlIG91ciBpbWFnZSB0YWdcbiAgICB0aGlzLiRlZGl0b3IuaHRtbCgkKCc8aW1nPicsIHsgc3JjOiBkYXRhLmZpbGUudXJsIH0pKTtcbiAgfSxcblxuICBvbkJsb2NrUmVuZGVyOiBmdW5jdGlvbigpe1xuICAgIC8qIFNldHVwIHRoZSB1cGxvYWQgYnV0dG9uICovXG4gICAgdGhpcy4kaW5wdXRzLmZpbmQoJ2J1dHRvbicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZXYpeyBldi5wcmV2ZW50RGVmYXVsdCgpOyB9KTtcbiAgICB0aGlzLiRpbnB1dHMuZmluZCgnaW5wdXQnKS5vbignY2hhbmdlJywgKGZ1bmN0aW9uKGV2KSB7XG4gICAgICB0aGlzLm9uRHJvcChldi5jdXJyZW50VGFyZ2V0KTtcbiAgICB9KS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBvblVwbG9hZFN1Y2Nlc3MgOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5zZXREYXRhKGRhdGEpO1xuICAgIHRoaXMucmVhZHkoKTtcbiAgfSxcblxuICBvblVwbG9hZEVycm9yIDogZnVuY3Rpb24oanFYSFIsIHN0YXR1cywgZXJyb3JUaHJvd24pe1xuICAgIHRoaXMuYWRkTWVzc2FnZShpMThuLnQoJ2Jsb2NrczppbWFnZTp1cGxvYWRfZXJyb3InKSk7XG4gICAgdGhpcy5yZWFkeSgpO1xuICB9LFxuXG4gIG9uRHJvcDogZnVuY3Rpb24odHJhbnNmZXJEYXRhKXtcbiAgICB2YXIgZmlsZSA9IHRyYW5zZmVyRGF0YS5maWxlc1swXSxcbiAgICAgICAgdXJsQVBJID0gKHR5cGVvZiBVUkwgIT09IFwidW5kZWZpbmVkXCIpID8gVVJMIDogKHR5cGVvZiB3ZWJraXRVUkwgIT09IFwidW5kZWZpbmVkXCIpID8gd2Via2l0VVJMIDogbnVsbDtcblxuICAgIC8vIEhhbmRsZSBvbmUgdXBsb2FkIGF0IGEgdGltZVxuICAgIGlmICgvaW1hZ2UvLnRlc3QoZmlsZS50eXBlKSkge1xuICAgICAgdGhpcy5sb2FkaW5nKCk7XG4gICAgICAvLyBTaG93IHRoaXMgaW1hZ2Ugb24gaGVyZVxuICAgICAgdGhpcy4kaW5wdXRzLmhpZGUoKTtcbiAgICAgIHRoaXMuJGVkaXRvci5odG1sKCQoJzxpbWc+JywgeyBzcmM6IHVybEFQSS5jcmVhdGVPYmplY3RVUkwoZmlsZSkgfSkpLnNob3coKTtcblxuICAgICAgdGhpcy51cGxvYWRlcihmaWxlLCB0aGlzLm9uVXBsb2FkU3VjY2VzcywgdGhpcy5vblVwbG9hZEVycm9yKTtcbiAgICB9XG4gIH1cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBUZXh0OiByZXF1aXJlKCcuL3RleHQnKSxcbiAgUXVvdGU6IHJlcXVpcmUoJy4vYmxvY2stcXVvdGUnKSxcbiAgSW1hZ2U6IHJlcXVpcmUoJy4vaW1hZ2UnKSxcbiAgSGVhZGluZzogcmVxdWlyZSgnLi9oZWFkaW5nJyksXG4gIExpc3Q6IHJlcXVpcmUoJy4vdW5vcmRlcmVkLWxpc3QnKSxcbiAgVHdlZXQ6IHJlcXVpcmUoJy4vdHdlZXQnKSxcbiAgVmlkZW86IHJlcXVpcmUoJy4vdmlkZW8nKSxcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgVGV4dCBCbG9ja1xuKi9cblxudmFyIEJsb2NrID0gcmVxdWlyZSgnLi4vYmxvY2snKTtcbnZhciBzdFRvSFRNTCA9IHJlcXVpcmUoJy4uL3RvLWh0bWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jay5leHRlbmQoe1xuXG4gIHR5cGU6IFwidGV4dFwiLFxuXG4gIHRpdGxlOiBmdW5jdGlvbigpIHsgcmV0dXJuIGkxOG4udCgnYmxvY2tzOnRleHQ6dGl0bGUnKTsgfSxcblxuICBlZGl0b3JIVE1MOiAnPGRpdiBjbGFzcz1cInN0LXJlcXVpcmVkIHN0LXRleHQtYmxvY2tcIiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCI+PC9kaXY+JyxcblxuICBpY29uX25hbWU6ICd0ZXh0JyxcblxuICBsb2FkRGF0YTogZnVuY3Rpb24oZGF0YSl7XG4gICAgdGhpcy5nZXRUZXh0QmxvY2soKS5odG1sKHN0VG9IVE1MKGRhdGEudGV4dCwgdGhpcy50eXBlKSk7XG4gIH1cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xuXG52YXIgdHdlZXRfdGVtcGxhdGUgPSBfLnRlbXBsYXRlKFtcbiAgXCI8YmxvY2txdW90ZSBjbGFzcz0ndHdpdHRlci10d2VldCcgYWxpZ249J2NlbnRlcic+XCIsXG4gIFwiPHA+PCU9IHRleHQgJT48L3A+XCIsXG4gIFwiJm1kYXNoOyA8JT0gdXNlci5uYW1lICU+IChAPCU9IHVzZXIuc2NyZWVuX25hbWUgJT4pXCIsXG4gIFwiPGEgaHJlZj0nPCU9IHN0YXR1c191cmwgJT4nIGRhdGEtZGF0ZXRpbWU9JzwlPSBjcmVhdGVkX2F0ICU+Jz48JT0gY3JlYXRlZF9hdCAlPjwvYT5cIixcbiAgXCI8L2Jsb2NrcXVvdGU+XCIsXG4gICc8c2NyaXB0IHNyYz1cIi8vcGxhdGZvcm0udHdpdHRlci5jb20vd2lkZ2V0cy5qc1wiIGNoYXJzZXQ9XCJ1dGYtOFwiPjwvc2NyaXB0Pidcbl0uam9pbihcIlxcblwiKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2suZXh0ZW5kKHtcblxuICB0eXBlOiBcInR3ZWV0XCIsXG4gIGRyb3BwYWJsZTogdHJ1ZSxcbiAgcGFzdGFibGU6IHRydWUsXG4gIGZldGNoYWJsZTogdHJ1ZSxcblxuICBkcm9wX29wdGlvbnM6IHtcbiAgICByZV9yZW5kZXJfb25fcmVvcmRlcjogdHJ1ZVxuICB9LFxuXG4gIHRpdGxlOiBmdW5jdGlvbigpeyByZXR1cm4gaTE4bi50KCdibG9ja3M6dHdlZXQ6dGl0bGUnKTsgfSxcblxuICBmZXRjaFVybDogZnVuY3Rpb24odHdlZXRJRCkge1xuICAgIHJldHVybiBcIi90d2VldHMvP3R3ZWV0X2lkPVwiICsgdHdlZXRJRDtcbiAgfSxcblxuICBpY29uX25hbWU6ICd0d2l0dGVyJyxcblxuICBsb2FkRGF0YTogZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmIChfLmlzVW5kZWZpbmVkKGRhdGEuc3RhdHVzX3VybCkpIHsgZGF0YS5zdGF0dXNfdXJsID0gJyc7IH1cbiAgICB0aGlzLiRpbm5lci5maW5kKCdpZnJhbWUnKS5yZW1vdmUoKTtcbiAgICB0aGlzLiRpbm5lci5wcmVwZW5kKHR3ZWV0X3RlbXBsYXRlKGRhdGEpKTtcbiAgfSxcblxuICBvbkNvbnRlbnRQYXN0ZWQ6IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAvLyBDb250ZW50IHBhc3RlZC4gRGVsZWdhdGUgdG8gdGhlIGRyb3AgcGFyc2UgbWV0aG9kXG4gICAgdmFyIGlucHV0ID0gJChldmVudC50YXJnZXQpLFxuICAgIHZhbCA9IGlucHV0LnZhbCgpO1xuXG4gICAgLy8gUGFzcyB0aGlzIHRvIHRoZSBzYW1lIGhhbmRsZXIgYXMgb25Ecm9wXG4gICAgdGhpcy5oYW5kbGVUd2l0dGVyRHJvcFBhc3RlKHZhbCk7XG4gIH0sXG5cbiAgaGFuZGxlVHdpdHRlckRyb3BQYXN0ZTogZnVuY3Rpb24odXJsKXtcbiAgICBpZiAoIXRoaXMudmFsaWRUd2VldFVybCh1cmwpKSB7XG4gICAgICB1dGlscy5sb2coXCJJbnZhbGlkIFR3ZWV0IFVSTFwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUd2l0dGVyIHN0YXR1c1xuICAgIHZhciB0d2VldElEID0gdXJsLm1hdGNoKC9bXlxcL10rJC8pO1xuICAgIGlmICghXy5pc0VtcHR5KHR3ZWV0SUQpKSB7XG4gICAgICB0aGlzLmxvYWRpbmcoKTtcbiAgICAgIHR3ZWV0SUQgPSB0d2VldElEWzBdO1xuXG4gICAgICB2YXIgYWpheE9wdGlvbnMgPSB7XG4gICAgICAgIHVybDogdGhpcy5mZXRjaFVybCh0d2VldElEKSxcbiAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICB9O1xuXG4gICAgICB0aGlzLmZldGNoKGFqYXhPcHRpb25zLCB0aGlzLm9uVHdlZXRTdWNjZXNzLCB0aGlzLm9uVHdlZXRGYWlsKTtcbiAgICB9XG4gIH0sXG5cbiAgdmFsaWRUd2VldFVybDogZnVuY3Rpb24odXJsKSB7XG4gICAgcmV0dXJuICh1dGlscy5pc1VSSSh1cmwpICYmXG4gICAgICAgICAgICB1cmwuaW5kZXhPZihcInR3aXR0ZXJcIikgIT09IC0xICYmXG4gICAgICAgICAgICB1cmwuaW5kZXhPZihcInN0YXR1c1wiKSAhPT0gLTEpO1xuICB9LFxuXG4gIG9uVHdlZXRTdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy8gUGFyc2UgdGhlIHR3aXR0ZXIgb2JqZWN0IGludG8gc29tZXRoaW5nIGEgYml0IHNsaW1tZXIuLlxuICAgIHZhciBvYmogPSB7XG4gICAgICB1c2VyOiB7XG4gICAgICAgIHByb2ZpbGVfaW1hZ2VfdXJsOiBkYXRhLnVzZXIucHJvZmlsZV9pbWFnZV91cmwsXG4gICAgICAgIHByb2ZpbGVfaW1hZ2VfdXJsX2h0dHBzOiBkYXRhLnVzZXIucHJvZmlsZV9pbWFnZV91cmxfaHR0cHMsXG4gICAgICAgIHNjcmVlbl9uYW1lOiBkYXRhLnVzZXIuc2NyZWVuX25hbWUsXG4gICAgICAgIG5hbWU6IGRhdGEudXNlci5uYW1lXG4gICAgICB9LFxuICAgICAgaWQ6IGRhdGEuaWRfc3RyLFxuICAgICAgdGV4dDogZGF0YS50ZXh0LFxuICAgICAgY3JlYXRlZF9hdDogZGF0YS5jcmVhdGVkX2F0LFxuICAgICAgZW50aXRpZXM6IGRhdGEuZW50aXRpZXMsXG4gICAgICBzdGF0dXNfdXJsOiBcImh0dHBzOi8vdHdpdHRlci5jb20vXCIgKyBkYXRhLnVzZXIuc2NyZWVuX25hbWUgKyBcIi9zdGF0dXMvXCIgKyBkYXRhLmlkX3N0clxuICAgIH07XG5cbiAgICB0aGlzLnNldEFuZExvYWREYXRhKG9iaik7XG4gICAgdGhpcy5yZWFkeSgpO1xuICB9LFxuXG4gIG9uVHdlZXRGYWlsOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFkZE1lc3NhZ2UoaTE4bi50KFwiYmxvY2tzOnR3ZWV0OmZldGNoX2Vycm9yXCIpKTtcbiAgICB0aGlzLnJlYWR5KCk7XG4gIH0sXG5cbiAgb25Ecm9wOiBmdW5jdGlvbih0cmFuc2ZlckRhdGEpe1xuICAgIHZhciB1cmwgPSB0cmFuc2ZlckRhdGEuZ2V0RGF0YSgndGV4dC9wbGFpbicpO1xuICAgIHRoaXMuaGFuZGxlVHdpdHRlckRyb3BQYXN0ZSh1cmwpO1xuICB9XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICAgVW5vcmRlcmVkIExpc3RcbiAgICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vbG9kYXNoJyk7XG5cbnZhciBCbG9jayA9IHJlcXVpcmUoJy4uL2Jsb2NrJyk7XG52YXIgc3RUb0hUTUwgPSByZXF1aXJlKCcuLi90by1odG1sJyk7XG5cbnZhciB0ZW1wbGF0ZSA9ICc8ZGl2IGNsYXNzPVwic3QtdGV4dC1ibG9jayBzdC1yZXF1aXJlZFwiIGNvbnRlbnRlZGl0YWJsZT1cInRydWVcIj48dWw+PGxpPjwvbGk+PC91bD48L2Rpdj4nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrLmV4dGVuZCh7XG5cbiAgdHlwZTogJ2xpc3QnLFxuXG4gIHRpdGxlOiBmdW5jdGlvbigpIHsgcmV0dXJuIGkxOG4udCgnYmxvY2tzOmxpc3Q6dGl0bGUnKTsgfSxcblxuICBpY29uX25hbWU6ICdsaXN0JyxcblxuICBlZGl0b3JIVE1MOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy50ZW1wbGF0ZSh0ZW1wbGF0ZSwgdGhpcyk7XG4gIH0sXG5cbiAgbG9hZERhdGE6IGZ1bmN0aW9uKGRhdGEpe1xuICAgIHRoaXMuZ2V0VGV4dEJsb2NrKCkuaHRtbChcIjx1bD5cIiArIHN0VG9IVE1MKGRhdGEudGV4dCwgdGhpcy50eXBlKSArIFwiPC91bD5cIik7XG4gIH0sXG5cbiAgb25CbG9ja1JlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jaGVja0Zvckxpc3QgPSB0aGlzLmNoZWNrRm9yTGlzdC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZ2V0VGV4dEJsb2NrKCkub24oJ2NsaWNrIGtleXVwJywgdGhpcy5jaGVja0Zvckxpc3QpO1xuICB9LFxuXG4gIGNoZWNrRm9yTGlzdDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuJCgndWwnKS5sZW5ndGggPT09IDApIHtcbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiaW5zZXJ0VW5vcmRlcmVkTGlzdFwiLCBmYWxzZSwgZmFsc2UpO1xuICAgIH1cbiAgfSxcblxuICB0b01hcmtkb3duOiBmdW5jdGlvbihtYXJrZG93bikge1xuICAgIHJldHVybiBtYXJrZG93bi5yZXBsYWNlKC88XFwvbGk+L21nLFwiXFxuXCIpXG4gICAgLnJlcGxhY2UoLzxcXC8/W14+XSsoPnwkKS9nLCBcIlwiKVxuICAgIC5yZXBsYWNlKC9eKC4rKSQvbWcsXCIgLSAkMVwiKTtcbiAgfSxcblxuICB0b0hUTUw6IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICBodG1sID0gaHRtbC5yZXBsYWNlKC9eIC0gKC4rKSQvbWcsXCI8bGk+JDE8L2xpPlwiKVxuICAgIC5yZXBsYWNlKC9cXG4vbWcsIFwiXCIpO1xuXG4gICAgcmV0dXJuIGh0bWw7XG4gIH0sXG5cbiAgb25Db250ZW50UGFzdGVkOiBmdW5jdGlvbihldmVudCwgdGFyZ2V0KSB7XG4gICAgdGhpcy4kKCd1bCcpLmh0bWwoXG4gICAgICB0aGlzLnBhc3RlZE1hcmtkb3duVG9IVE1MKHRhcmdldFswXS5pbm5lckhUTUwpKTtcbiAgICB0aGlzLmdldFRleHRCbG9jaygpLmNhcmV0VG9FbmQoKTtcbiAgfSxcblxuICBpc0VtcHR5OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy5pc0VtcHR5KHRoaXMuc2F2ZUFuZEdldERhdGEoKS50ZXh0KTtcbiAgfVxuXG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIEJsb2NrID0gcmVxdWlyZSgnLi4vYmxvY2snKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jay5leHRlbmQoe1xuXG4gIC8vIG1vcmUgcHJvdmlkZXJzIGF0IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2plZmZsaW5nL2E5NjI5YWUyOGUwNzY3ODVhMTRmXG4gIHByb3ZpZGVyczoge1xuICAgIHZpbWVvOiB7XG4gICAgICByZWdleDogLyg/Omh0dHBbc10/OlxcL1xcLyk/KD86d3d3Lik/dmltZW8uY29tXFwvKC4rKS8sXG4gICAgICBodG1sOiBcIjxpZnJhbWUgc3JjPVxcXCJ7e3Byb3RvY29sfX0vL3BsYXllci52aW1lby5jb20vdmlkZW8ve3tyZW1vdGVfaWR9fT90aXRsZT0wJmJ5bGluZT0wXFxcIiB3aWR0aD1cXFwiNTgwXFxcIiBoZWlnaHQ9XFxcIjMyMFxcXCIgZnJhbWVib3JkZXI9XFxcIjBcXFwiPjwvaWZyYW1lPlwiXG4gICAgfSxcbiAgICB5b3V0dWJlOiB7XG4gICAgICByZWdleDogLyg/Omh0dHBbc10/OlxcL1xcLyk/KD86d3d3Lik/KD86KD86eW91dHViZS5jb21cXC93YXRjaFxcPyg/Oi4qKSg/OnY9KSl8KD86eW91dHUuYmVcXC8pKShbXiZdLispLyxcbiAgICAgIGh0bWw6IFwiPGlmcmFtZSBzcmM9XFxcInt7cHJvdG9jb2x9fS8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL3t7cmVtb3RlX2lkfX1cXFwiIHdpZHRoPVxcXCI1ODBcXFwiIGhlaWdodD1cXFwiMzIwXFxcIiBmcmFtZWJvcmRlcj1cXFwiMFxcXCIgYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPlwiXG4gICAgfVxuICB9LFxuXG4gIHR5cGU6ICd2aWRlbycsXG4gIHRpdGxlOiBmdW5jdGlvbigpIHsgcmV0dXJuIGkxOG4udCgnYmxvY2tzOnZpZGVvOnRpdGxlJyk7IH0sXG5cbiAgZHJvcHBhYmxlOiB0cnVlLFxuICBwYXN0YWJsZTogdHJ1ZSxcblxuICBpY29uX25hbWU6ICd2aWRlbycsXG5cbiAgbG9hZERhdGE6IGZ1bmN0aW9uKGRhdGEpe1xuICAgIGlmICghdGhpcy5wcm92aWRlcnMuaGFzT3duUHJvcGVydHkoZGF0YS5zb3VyY2UpKSB7IHJldHVybjsgfVxuXG4gICAgaWYgKHRoaXMucHJvdmlkZXJzW2RhdGEuc291cmNlXS5zcXVhcmUpIHtcbiAgICAgIHRoaXMuJGVkaXRvci5hZGRDbGFzcygnc3QtYmxvY2tfX2VkaXRvci0td2l0aC1zcXVhcmUtbWVkaWEnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4kZWRpdG9yLmFkZENsYXNzKCdzdC1ibG9ja19fZWRpdG9yLS13aXRoLXNpeHRlZW4tYnktbmluZS1tZWRpYScpO1xuICAgIH1cblxuICAgIHZhciBlbWJlZF9zdHJpbmcgPSB0aGlzLnByb3ZpZGVyc1tkYXRhLnNvdXJjZV0uaHRtbFxuICAgIC5yZXBsYWNlKCd7e3Byb3RvY29sfX0nLCB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wpXG4gICAgLnJlcGxhY2UoJ3t7cmVtb3RlX2lkfX0nLCBkYXRhLnJlbW90ZV9pZClcbiAgICAucmVwbGFjZSgne3t3aWR0aH19JywgdGhpcy4kZWRpdG9yLndpZHRoKCkpOyAvLyBmb3IgdmlkZW9zIHRoYXQgY2FuJ3QgcmVzaXplIGF1dG9tYXRpY2FsbHkgbGlrZSB2aW5lXG5cbiAgICB0aGlzLiRlZGl0b3IuaHRtbChlbWJlZF9zdHJpbmcpO1xuICB9LFxuXG4gIG9uQ29udGVudFBhc3RlZDogZnVuY3Rpb24oZXZlbnQpe1xuICAgIHRoaXMuaGFuZGxlRHJvcFBhc3RlKCQoZXZlbnQudGFyZ2V0KS52YWwoKSk7XG4gIH0sXG5cbiAgaGFuZGxlRHJvcFBhc3RlOiBmdW5jdGlvbih1cmwpe1xuICAgIGlmKCF1dGlscy5pc1VSSSh1cmwpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG1hdGNoLCBkYXRhO1xuXG4gICAgdGhpcy5wcm92aWRlcnMuZm9yRWFjaChmdW5jdGlvbihwcm92aWRlciwgaW5kZXgpIHtcbiAgICAgIG1hdGNoID0gcHJvdmlkZXIucmVnZXguZXhlYyh1cmwpO1xuXG4gICAgICBpZihtYXRjaCAhPT0gbnVsbCAmJiAhXy5pc1VuZGVmaW5lZChtYXRjaFsxXSkpIHtcbiAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICBzb3VyY2U6IGluZGV4LFxuICAgICAgICAgIHJlbW90ZV9pZDogbWF0Y2hbMV1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNldEFuZExvYWREYXRhKGRhdGEpO1xuICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICB9LFxuXG4gIG9uRHJvcDogZnVuY3Rpb24odHJhbnNmZXJEYXRhKXtcbiAgICB2YXIgdXJsID0gdHJhbnNmZXJEYXRhLmdldERhdGEoJ3RleHQvcGxhaW4nKTtcbiAgICB0aGlzLmhhbmRsZURyb3BQYXN0ZSh1cmwpO1xuICB9XG59KTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBkZWJ1ZzogZmFsc2UsXG4gIHNraXBWYWxpZGF0aW9uOiBmYWxzZSxcbiAgdmVyc2lvbjogXCIwLjMuMFwiLFxuICBsYW5ndWFnZTogXCJlblwiLFxuXG4gIGluc3RhbmNlczogW10sXG5cbiAgZGVmYXVsdHM6IHtcbiAgICBkZWZhdWx0VHlwZTogZmFsc2UsXG4gICAgc3Bpbm5lcjoge1xuICAgICAgY2xhc3NOYW1lOiAnc3Qtc3Bpbm5lcicsXG4gICAgICBsaW5lczogOSxcbiAgICAgIGxlbmd0aDogOCxcbiAgICAgIHdpZHRoOiAzLFxuICAgICAgcmFkaXVzOiA2LFxuICAgICAgY29sb3I6ICcjMDAwJyxcbiAgICAgIHNwZWVkOiAxLjQsXG4gICAgICB0cmFpbDogNTcsXG4gICAgICBzaGFkb3c6IGZhbHNlLFxuICAgICAgbGVmdDogJzUwJScsXG4gICAgICB0b3A6ICc1MCUnXG4gICAgfSxcbiAgICBibG9ja0xpbWl0OiAwLFxuICAgIGJsb2NrVHlwZUxpbWl0czoge30sXG4gICAgcmVxdWlyZWQ6IFtdLFxuICAgIHVwbG9hZFVybDogJy9hdHRhY2htZW50cycsXG4gICAgYmFzZUltYWdlVXJsOiAnL3Npci10cmV2b3ItdXBsb2Fkcy8nLFxuICAgIGVycm9yc0NvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIHRvTWFya2Rvd246IHtcbiAgICAgIGFnZ3Jlc2l2ZUhUTUxTdHJpcDogZmFsc2VcbiAgICB9XG4gIH1cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAqIFNpciBUcmV2b3IgRWRpdG9yXG4gKiAtLVxuICogUmVwcmVzZW50cyBvbmUgU2lyIFRyZXZvciBlZGl0b3IgaW5zdGFuY2UgKHdpdGggbXVsdGlwbGUgYmxvY2tzKVxuICogRWFjaCBibG9jayByZWZlcmVuY2VzIHRoaXMgaW5zdGFuY2UuXG4gKiBCbG9ja1R5cGVzIGFyZSBnbG9iYWwgaG93ZXZlci5cbiAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi9ldmVudC1idXMnKTtcbnZhciBGb3JtRXZlbnRzID0gcmVxdWlyZSgnLi9mb3JtLWV2ZW50cycpO1xudmFyIEJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgQmxvY2tDb250cm9scyA9IHJlcXVpcmUoJy4vYmxvY2stY29udHJvbHMnKTtcbnZhciBGbG9hdGluZ0Jsb2NrQ29udHJvbHMgPSByZXF1aXJlKCcuL2Zsb2F0aW5nLWJsb2NrLWNvbnRyb2xzJyk7XG52YXIgRm9ybWF0QmFyID0gcmVxdWlyZSgnLi9mb3JtYXQtYmFyJyk7XG52YXIgZWRpdG9yU3RvcmUgPSByZXF1aXJlKCcuL2V4dGVuc2lvbnMvc2lyLXRyZXZvci5lZGl0b3Itc3RvcmUnKTtcblxudmFyIEVkaXRvciA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdGhpcy5pbml0aWFsaXplKG9wdGlvbnMpO1xufTtcblxuT2JqZWN0LmFzc2lnbihFZGl0b3IucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9ldmVudHMnKSwge1xuXG4gIGJvdW5kOiBbJ29uRm9ybVN1Ym1pdCcsICdzaG93QmxvY2tDb250cm9scycsICdoaWRlQWxsVGhlVGhpbmdzJyxcbiAgICAnaGlkZUJsb2NrQ29udHJvbHMnLCAnb25OZXdCbG9ja0NyZWF0ZWQnLCAnY2hhbmdlQmxvY2tQb3NpdGlvbicsXG4gICAgJ29uQmxvY2tEcmFnU3RhcnQnLCAnb25CbG9ja0RyYWdFbmQnLCAncmVtb3ZlQmxvY2tEcmFnT3ZlcicsXG4gICAgJ29uQmxvY2tEcm9wcGVkJywgJ2NyZWF0ZUJsb2NrJ10sIFxuXG4gIGV2ZW50czoge1xuICAgICdibG9jazpyZW9yZGVyOmRvd24nOiAgICAgICAnaGlkZUJsb2NrQ29udHJvbHMnLFxuICAgICdibG9jazpyZW9yZGVyOmRyYWdzdGFydCc6ICAnb25CbG9ja0RyYWdTdGFydCcsXG4gICAgJ2Jsb2NrOnJlb3JkZXI6ZHJhZ2VuZCc6ICAgICdvbkJsb2NrRHJhZ0VuZCcsXG4gICAgJ2Jsb2NrOmNvbnRlbnQ6ZHJvcHBlZCc6ICAgICdyZW1vdmVCbG9ja0RyYWdPdmVyJyxcbiAgICAnYmxvY2s6cmVvcmRlcjpkcm9wcGVkJzogICAgJ29uQmxvY2tEcm9wcGVkJyxcbiAgICAnYmxvY2s6Y3JlYXRlOm5ldyc6ICAgICAgICAgJ29uTmV3QmxvY2tDcmVhdGVkJ1xuICB9LFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB1dGlscy5sb2coXCJJbml0IFNpclRyZXZvci5FZGl0b3JcIik7XG5cbiAgICB0aGlzLmJsb2NrVHlwZXMgPSB7fTtcbiAgICB0aGlzLmJsb2NrQ291bnRzID0ge307IC8vIENhY2hlZCBibG9jayB0eXBlIGNvdW50c1xuICAgIHRoaXMuYmxvY2tzID0gW107IC8vIEJsb2NrIHJlZmVyZW5jZXNcbiAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmZpZy5kZWZhdWx0cywgb3B0aW9ucyB8fCB7fSk7XG4gICAgdGhpcy5JRCA9IF8udW5pcXVlSWQoJ3N0LWVkaXRvci0nKTtcblxuICAgIGlmICghdGhpcy5fZW5zdXJlQW5kU2V0RWxlbWVudHMoKSkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIGlmKCFfLmlzVW5kZWZpbmVkKHRoaXMub3B0aW9ucy5vbkVkaXRvclJlbmRlcikgJiYgXy5pc0Z1bmN0aW9uKHRoaXMub3B0aW9ucy5vbkVkaXRvclJlbmRlcikpIHtcbiAgICAgIHRoaXMub25FZGl0b3JSZW5kZXIgPSB0aGlzLm9wdGlvbnMub25FZGl0b3JSZW5kZXI7XG4gICAgfVxuXG4gICAgdGhpcy5fc2V0UmVxdWlyZWQoKTtcbiAgICB0aGlzLl9zZXRCbG9ja3NUeXBlcygpO1xuICAgIHRoaXMuX2JpbmRGdW5jdGlvbnMoKTtcblxuICAgIHRoaXMuc3RvcmUoXCJjcmVhdGVcIik7XG5cbiAgICBjb25maWcuaW5zdGFuY2VzLnB1c2godGhpcyk7XG5cbiAgICB0aGlzLmJ1aWxkKCk7XG5cbiAgICBGb3JtRXZlbnRzLmJpbmRGb3JtU3VibWl0KHRoaXMuJGZvcm0pO1xuICB9LFxuXG4gIC8qIEJ1aWxkIHRoZSBFZGl0b3IgaW5zdGFuY2UuXG4gICAqIENoZWNrIHRvIHNlZSBpZiB3ZSd2ZSBiZWVuIHBhc3NlZCBKU09OIGFscmVhZHksIGFuZCBpZiBub3QgdHJ5IGFuZCBjcmVhdGVcbiAgICogYSBkZWZhdWx0IGJsb2NrLiBJZiB3ZSBoYXZlIEpTT04gdGhlbiB3ZSBuZWVkIHRvIGJ1aWxkIGFsbCBvZiBvdXIgYmxvY2tzXG4gICAqIGZyb20gdGhpcy5cbiAgICovXG4gIGJ1aWxkOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5oaWRlKCk7XG5cbiAgICB0aGlzLmJsb2NrX2NvbnRyb2xzID0gbmV3IEJsb2NrQ29udHJvbHModGhpcy5ibG9ja1R5cGVzLCB0aGlzLklEKTtcbiAgICB0aGlzLmZsX2Jsb2NrX2NvbnRyb2xzID0gbmV3IEZsb2F0aW5nQmxvY2tDb250cm9scyh0aGlzLiR3cmFwcGVyLCB0aGlzLklEKTtcbiAgICB0aGlzLmZvcm1hdEJhciA9IG5ldyBGb3JtYXRCYXIodGhpcy5vcHRpb25zLmZvcm1hdEJhcik7XG5cbiAgICB0aGlzLmxpc3RlblRvKHRoaXMuYmxvY2tfY29udHJvbHMsICdjcmVhdGVCbG9jaycsIHRoaXMuY3JlYXRlQmxvY2spO1xuICAgIHRoaXMubGlzdGVuVG8odGhpcy5mbF9ibG9ja19jb250cm9scywgJ3Nob3dCbG9ja0NvbnRyb2xzJywgdGhpcy5zaG93QmxvY2tDb250cm9scyk7XG5cbiAgICB0aGlzLl9zZXRFdmVudHMoKTtcblxuICAgIEV2ZW50QnVzLm9uKHRoaXMuSUQgKyBcIjpibG9ja3M6Y2hhbmdlX3Bvc2l0aW9uXCIsIHRoaXMuY2hhbmdlQmxvY2tQb3NpdGlvbik7XG4gICAgRXZlbnRCdXMub24oXCJmb3JtYXR0ZXI6cG9zaXRpb25cIiwgdGhpcy5mb3JtYXRCYXIucmVuZGVyQnlTZWxlY3Rpb24pO1xuICAgIEV2ZW50QnVzLm9uKFwiZm9ybWF0dGVyOmhpZGVcIiwgdGhpcy5mb3JtYXRCYXIuaGlkZSk7XG5cbiAgICB0aGlzLiR3cmFwcGVyLnByZXBlbmQodGhpcy5mbF9ibG9ja19jb250cm9scy5yZW5kZXIoKS4kZWwpO1xuICAgICQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKHRoaXMuZm9ybWF0QmFyLnJlbmRlcigpLiRlbCk7XG4gICAgdGhpcy4kb3V0ZXIuYXBwZW5kKHRoaXMuYmxvY2tfY29udHJvbHMucmVuZGVyKCkuJGVsKTtcblxuICAgICQod2luZG93KS5iaW5kKCdjbGljay5zaXJ0cmV2b3InLCB0aGlzLmhpZGVBbGxUaGVUaGluZ3MpO1xuXG4gICAgdmFyIHN0b3JlID0gdGhpcy5zdG9yZShcInJlYWRcIik7XG5cbiAgICBpZiAoc3RvcmUuZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICBzdG9yZS5kYXRhLmZvckVhY2goZnVuY3Rpb24oYmxvY2spe1xuICAgICAgICB1dGlscy5sb2coJ0NyZWF0aW5nOiAnICsgYmxvY2sudHlwZSk7XG4gICAgICAgIHRoaXMuY3JlYXRlQmxvY2soYmxvY2sudHlwZSwgYmxvY2suZGF0YSk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5kZWZhdWx0VHlwZSAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuY3JlYXRlQmxvY2sodGhpcy5vcHRpb25zLmRlZmF1bHRUeXBlLCB7fSk7XG4gICAgfVxuXG4gICAgdGhpcy4kd3JhcHBlci5hZGRDbGFzcygnc3QtcmVhZHknKTtcblxuICAgIGlmKCFfLmlzVW5kZWZpbmVkKHRoaXMub25FZGl0b3JSZW5kZXIpKSB7XG4gICAgICB0aGlzLm9uRWRpdG9yUmVuZGVyKCk7XG4gICAgfVxuICB9LFxuXG4gIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgIC8vIERlc3Ryb3kgdGhlIHJlbmRlcmVkIHN1YiB2aWV3c1xuICAgIHRoaXMuZm9ybWF0QmFyLmRlc3Ryb3koKTtcbiAgICB0aGlzLmZsX2Jsb2NrX2NvbnRyb2xzLmRlc3Ryb3koKTtcbiAgICB0aGlzLmJsb2NrX2NvbnRyb2xzLmRlc3Ryb3koKTtcblxuICAgIC8vIERlc3Ryb3kgYWxsIGJsb2Nrc1xuICAgIHRoaXMuYmxvY2tzLmZvckVhY2goZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHRoaXMucmVtb3ZlQmxvY2soYmxvY2suYmxvY2tJRCk7XG4gICAgfSwgdGhpcyk7XG5cbiAgICAvLyBTdG9wIGxpc3RlbmluZyB0byBldmVudHNcbiAgICB0aGlzLnN0b3BMaXN0ZW5pbmcoKTtcblxuICAgIC8vIENsZWFudXAgZWxlbWVudFxuICAgIHZhciBlbCA9IHRoaXMuJGVsLmRldGFjaCgpO1xuXG4gICAgLy8gUmVtb3ZlIGluc3RhbmNlXG4gICAgY29uZmlnLmluc3RhbmNlcyA9IGNvbmZpZy5pbnN0YW5jZXMuZmlsdGVyKGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gICAgICByZXR1cm4gaW5zdGFuY2UuSUQgIT09IHRoaXMuSUQ7XG4gICAgfSwgdGhpcyk7XG5cbiAgICAvLyBDbGVhciB0aGUgc3RvcmVcbiAgICB0aGlzLnN0b3JlKFwicmVzZXRcIik7XG5cbiAgICB0aGlzLiRvdXRlci5yZXBsYWNlV2l0aChlbCk7XG4gIH0sXG5cbiAgcmVpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gICAgdGhpcy5pbml0aWFsaXplKG9wdGlvbnMgfHwgdGhpcy5vcHRpb25zKTtcbiAgfSxcblxuICBfc2V0RXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICBPYmplY3Qua2V5cyh0aGlzLmV2ZW50cykuZm9yRWFjaChmdW5jdGlvbih0eXBlKSB7XG4gICAgICBFdmVudEJ1cy5vbih0eXBlLCB0aGlzW3RoaXMuZXZlbnRzW3R5cGVdXSwgdGhpcyk7XG4gICAgfSwgdGhpcyk7XG4gIH0sXG5cbiAgaGlkZUFsbFRoZVRoaW5nczogZnVuY3Rpb24oZSkge1xuICAgIHRoaXMuYmxvY2tfY29udHJvbHMuaGlkZSgpO1xuICAgIHRoaXMuZm9ybWF0QmFyLmhpZGUoKTtcblxuICAgIGlmICghXy5pc1VuZGVmaW5lZCh0aGlzLmJsb2NrX2NvbnRyb2xzLmN1cnJlbnRfY29udGFpbmVyKSkge1xuICAgICAgdGhpcy5ibG9ja19jb250cm9scy5jdXJyZW50X2NvbnRhaW5lci5yZW1vdmVDbGFzcyhcIndpdGgtc3QtY29udHJvbHNcIik7XG4gICAgfVxuICB9LFxuXG4gIHNob3dCbG9ja0NvbnRyb2xzOiBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICBpZiAoIV8uaXNVbmRlZmluZWQodGhpcy5ibG9ja19jb250cm9scy5jdXJyZW50X2NvbnRhaW5lcikpIHtcbiAgICAgIHRoaXMuYmxvY2tfY29udHJvbHMuY3VycmVudF9jb250YWluZXIucmVtb3ZlQ2xhc3MoXCJ3aXRoLXN0LWNvbnRyb2xzXCIpO1xuICAgIH1cblxuICAgIHRoaXMuYmxvY2tfY29udHJvbHMuc2hvdygpO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZCh0aGlzLmJsb2NrX2NvbnRyb2xzLiRlbC5kZXRhY2goKSk7XG4gICAgY29udGFpbmVyLmFkZENsYXNzKCd3aXRoLXN0LWNvbnRyb2xzJyk7XG5cbiAgICB0aGlzLmJsb2NrX2NvbnRyb2xzLmN1cnJlbnRfY29udGFpbmVyID0gY29udGFpbmVyO1xuICB9LFxuXG4gIHN0b3JlOiBmdW5jdGlvbihtZXRob2QsIG9wdGlvbnMpe1xuICAgIHJldHVybiBlZGl0b3JTdG9yZSh0aGlzLCBtZXRob2QsIG9wdGlvbnMgfHwge30pO1xuICB9LFxuXG4gIC8qIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBhIGJsb2NrIGZyb20gYW4gYXZhaWxhYmxlIHR5cGUuICBXZSBoYXZlIHRvIGNoZWNrXG4gICAqIHRoZSBudW1iZXIgb2YgYmxvY2tzIHdlJ3JlIGFsbG93ZWQgdG8gY3JlYXRlIGJlZm9yZSBhZGRpbmcgb25lIGFuZCBoYW5kbGVcbiAgICogZmFpbHMgYWNjb3JkaW5nbHkuICBBIGJsb2NrIHdpbGwgaGF2ZSBhIHJlZmVyZW5jZSB0byBhbiBFZGl0b3IgaW5zdGFuY2UgJlxuICAgKiB0aGUgcGFyZW50IEJsb2NrVHlwZS4gIFdlIGFsc28gaGF2ZSB0byByZW1lbWJlciB0byBzdG9yZSBzdGF0aWMgY291bnRzIGZvclxuICAgKiBob3cgbWFueSBibG9ja3Mgd2UgaGF2ZSwgYW5kIGtlZXAgYSBuaWNlIGFycmF5IG9mIGFsbCB0aGUgYmxvY2tzXG4gICAqIGF2YWlsYWJsZS5cbiAgICovXG4gIGNyZWF0ZUJsb2NrOiBmdW5jdGlvbih0eXBlLCBkYXRhLCByZW5kZXJfYXQpIHtcbiAgICB0eXBlID0gdXRpbHMuY2xhc3NpZnkodHlwZSk7XG5cbiAgICBpZih0aGlzLl9ibG9ja0xpbWl0UmVhY2hlZCgpKSB7XG4gICAgICB1dGlscy5sb2coXCJDYW5ub3QgYWRkIGFueSBtb3JlIGJsb2Nrcy4gTGltaXQgcmVhY2hlZC5cIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9pc0Jsb2NrVHlwZUF2YWlsYWJsZSh0eXBlKSkge1xuICAgICAgdXRpbHMubG9nKFwiQmxvY2sgdHlwZSBub3QgYXZhaWxhYmxlIFwiICsgdHlwZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQ2FuIHdlIGhhdmUgYW5vdGhlciBvbmUgb2YgdGhlc2UgYmxvY2tzP1xuICAgIGlmICghdGhpcy5fY2FuQWRkQmxvY2tUeXBlKHR5cGUpKSB7XG4gICAgICB1dGlscy5sb2coXCJCbG9jayBMaW1pdCByZWFjaGVkIGZvciB0eXBlIFwiICsgdHlwZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGJsb2NrID0gbmV3IEJsb2Nrc1t0eXBlXShkYXRhLCB0aGlzLklEKTtcblxuICAgIHRoaXMuX3JlbmRlckluUG9zaXRpb24oYmxvY2sucmVuZGVyKCkuJGVsKTtcblxuICAgIHRoaXMubGlzdGVuVG8oYmxvY2ssICdyZW1vdmVCbG9jaycsIHRoaXMucmVtb3ZlQmxvY2spO1xuXG4gICAgdGhpcy5ibG9ja3MucHVzaChibG9jayk7XG4gICAgdGhpcy5faW5jcmVtZW50QmxvY2tUeXBlQ291bnQodHlwZSk7XG5cbiAgICBpZighZGF0YSkge1xuICAgICAgYmxvY2suZm9jdXMoKTtcbiAgICB9XG5cbiAgICBFdmVudEJ1cy50cmlnZ2VyKGRhdGEgPyBcImJsb2NrOmNyZWF0ZTpleGlzdGluZ1wiIDogXCJibG9jazpjcmVhdGU6bmV3XCIsIGJsb2NrKTtcbiAgICB1dGlscy5sb2coXCJCbG9jayBjcmVhdGVkIG9mIHR5cGUgXCIgKyB0eXBlKTtcbiAgICBibG9jay50cmlnZ2VyKFwib25SZW5kZXJcIik7XG5cbiAgICB0aGlzLiR3cmFwcGVyLnRvZ2dsZUNsYXNzKCdzdC0tYmxvY2stbGltaXQtcmVhY2hlZCcsIHRoaXMuX2Jsb2NrTGltaXRSZWFjaGVkKCkpO1xuICAgIHRoaXMudHJpZ2dlckJsb2NrQ291bnRVcGRhdGUoKTtcbiAgfSxcblxuICBvbk5ld0Jsb2NrQ3JlYXRlZDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICBpZiAoYmxvY2suaW5zdGFuY2VJRCA9PT0gdGhpcy5JRCkge1xuICAgICAgdGhpcy5oaWRlQmxvY2tDb250cm9scygpO1xuICAgICAgdGhpcy5zY3JvbGxUbyhibG9jay4kZWwpO1xuICAgIH1cbiAgfSxcblxuICBzY3JvbGxUbzogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiBlbGVtZW50LnBvc2l0aW9uKCkudG9wIH0sIDMwMCwgXCJsaW5lYXJcIik7XG4gIH0sXG5cbiAgYmxvY2tGb2N1czogZnVuY3Rpb24oYmxvY2spIHtcbiAgICB0aGlzLmJsb2NrX2NvbnRyb2xzLmN1cnJlbnRfY29udGFpbmVyID0gbnVsbDtcbiAgfSxcblxuICBoaWRlQmxvY2tDb250cm9sczogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKHRoaXMuYmxvY2tfY29udHJvbHMuY3VycmVudF9jb250YWluZXIpKSB7XG4gICAgICB0aGlzLmJsb2NrX2NvbnRyb2xzLmN1cnJlbnRfY29udGFpbmVyLnJlbW92ZUNsYXNzKFwid2l0aC1zdC1jb250cm9sc1wiKTtcbiAgICB9XG5cbiAgICB0aGlzLmJsb2NrX2NvbnRyb2xzLmhpZGUoKTtcbiAgfSxcblxuICByZW1vdmVCbG9ja0RyYWdPdmVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRvdXRlci5maW5kKCcuc3QtZHJhZy1vdmVyJykucmVtb3ZlQ2xhc3MoJ3N0LWRyYWctb3ZlcicpO1xuICB9LFxuXG4gIHRyaWdnZXJCbG9ja0NvdW50VXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICBFdmVudEJ1cy50cmlnZ2VyKHRoaXMuSUQgKyBcIjpibG9ja3M6Y291bnRfdXBkYXRlXCIsIHRoaXMuYmxvY2tzLmxlbmd0aCk7XG4gIH0sXG5cbiAgY2hhbmdlQmxvY2tQb3NpdGlvbjogZnVuY3Rpb24oJGJsb2NrLCBzZWxlY3RlZFBvc2l0aW9uKSB7XG4gICAgc2VsZWN0ZWRQb3NpdGlvbiA9IHNlbGVjdGVkUG9zaXRpb24gLSAxO1xuXG4gICAgdmFyIGJsb2NrUG9zaXRpb24gPSB0aGlzLmdldEJsb2NrUG9zaXRpb24oJGJsb2NrKTtcbiAgICB2YXIgJGJsb2NrQnkgPSB0aGlzLiR3cmFwcGVyLmZpbmQoJy5zdC1ibG9jaycpLmVxKHNlbGVjdGVkUG9zaXRpb24pO1xuXG4gICAgdmFyIHdoZXJlID0gKGJsb2NrUG9zaXRpb24gPiBzZWxlY3RlZFBvc2l0aW9uKSA/IFwiQmVmb3JlXCIgOiBcIkFmdGVyXCI7XG5cbiAgICBpZigkYmxvY2tCeSAmJiAkYmxvY2tCeS5hdHRyKCdpZCcpICE9PSAkYmxvY2suYXR0cignaWQnKSkge1xuICAgICAgdGhpcy5oaWRlQWxsVGhlVGhpbmdzKCk7XG4gICAgICAkYmxvY2tbXCJpbnNlcnRcIiArIHdoZXJlXSgkYmxvY2tCeSk7XG4gICAgICB0aGlzLnNjcm9sbFRvKCRibG9jayk7XG4gICAgfVxuICB9LFxuXG4gIG9uQmxvY2tEcm9wcGVkOiBmdW5jdGlvbihibG9ja19pZCkge1xuICAgIHRoaXMuaGlkZUFsbFRoZVRoaW5ncygpO1xuICAgIHZhciBibG9jayA9IHRoaXMuZmluZEJsb2NrQnlJZChibG9ja19pZCk7XG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGJsb2NrKSAmJlxuICAgICAgICAhXy5pc0VtcHR5KGJsb2NrLmdldERhdGEoKSkgJiZcbiAgICAgICAgICBibG9jay5kcm9wX29wdGlvbnMucmVfcmVuZGVyX29uX3Jlb3JkZXIpIHtcbiAgICAgIGJsb2NrLmJlZm9yZUxvYWRpbmdEYXRhKCk7XG4gICAgfVxuICB9LFxuXG4gIG9uQmxvY2tEcmFnU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaGlkZUJsb2NrQ29udHJvbHMoKTtcbiAgICB0aGlzLiR3cmFwcGVyLmFkZENsYXNzKFwic3Qtb3V0ZXItLWlzLXJlb3JkZXJpbmdcIik7XG4gIH0sXG5cbiAgb25CbG9ja0RyYWdFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQmxvY2tEcmFnT3ZlcigpO1xuICAgIHRoaXMuJHdyYXBwZXIucmVtb3ZlQ2xhc3MoXCJzdC1vdXRlci0taXMtcmVvcmRlcmluZ1wiKTtcbiAgfSxcblxuICBfcmVuZGVySW5Qb3NpdGlvbjogZnVuY3Rpb24oYmxvY2spIHtcbiAgICBpZiAodGhpcy5ibG9ja19jb250cm9scy5jdXJyZW50X2NvbnRhaW5lcikge1xuICAgICAgdGhpcy5ibG9ja19jb250cm9scy5jdXJyZW50X2NvbnRhaW5lci5hZnRlcihibG9jayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuJHdyYXBwZXIuYXBwZW5kKGJsb2NrKTtcbiAgICB9XG4gIH0sXG5cbiAgX2luY3JlbWVudEJsb2NrVHlwZUNvdW50OiBmdW5jdGlvbih0eXBlKSB7XG4gICAgdGhpcy5ibG9ja0NvdW50c1t0eXBlXSA9IChfLmlzVW5kZWZpbmVkKHRoaXMuYmxvY2tDb3VudHNbdHlwZV0pKSA/IDE6IHRoaXMuYmxvY2tDb3VudHNbdHlwZV0gKyAxO1xuICB9LFxuXG4gIF9nZXRCbG9ja1R5cGVDb3VudDogZnVuY3Rpb24odHlwZSkge1xuICAgIHJldHVybiAoXy5pc1VuZGVmaW5lZCh0aGlzLmJsb2NrQ291bnRzW3R5cGVdKSkgPyAwIDogdGhpcy5ibG9ja0NvdW50c1t0eXBlXTtcbiAgfSxcblxuICBfY2FuQWRkQmxvY2tUeXBlOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgdmFyIGJsb2NrX3R5cGVfbGltaXQgPSB0aGlzLl9nZXRCbG9ja1R5cGVMaW1pdCh0eXBlKTtcblxuICAgIHJldHVybiAhKGJsb2NrX3R5cGVfbGltaXQgIT09IDAgJiYgdGhpcy5fZ2V0QmxvY2tUeXBlQ291bnQodHlwZSkgPj0gYmxvY2tfdHlwZV9saW1pdCk7XG4gIH0sXG5cbiAgX2Jsb2NrTGltaXRSZWFjaGVkOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKHRoaXMub3B0aW9ucy5ibG9ja0xpbWl0ICE9PSAwICYmIHRoaXMuYmxvY2tzLmxlbmd0aCA+PSB0aGlzLm9wdGlvbnMuYmxvY2tMaW1pdCk7XG4gIH0sXG5cbiAgcmVtb3ZlQmxvY2s6IGZ1bmN0aW9uKGJsb2NrX2lkKSB7XG4gICAgdmFyIGJsb2NrID0gdGhpcy5maW5kQmxvY2tCeUlkKGJsb2NrX2lkKSxcbiAgICB0eXBlID0gdXRpbHMuY2xhc3NpZnkoYmxvY2sudHlwZSksXG4gICAgY29udHJvbHMgPSBibG9jay4kZWwuZmluZCgnLnN0LWJsb2NrLWNvbnRyb2xzJyk7XG5cbiAgICBpZiAoY29udHJvbHMubGVuZ3RoKSB7XG4gICAgICB0aGlzLmJsb2NrX2NvbnRyb2xzLmhpZGUoKTtcbiAgICAgIHRoaXMuJHdyYXBwZXIucHJlcGVuZChjb250cm9scyk7XG4gICAgfVxuXG4gICAgdGhpcy5ibG9ja0NvdW50c1t0eXBlXSA9IHRoaXMuYmxvY2tDb3VudHNbdHlwZV0gLSAxO1xuICAgIHRoaXMuYmxvY2tzID0gdGhpcy5ibG9ja3MuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHJldHVybiBpdGVtLmJsb2NrSUQgIT09IGJsb2NrLmJsb2NrSUQ7XG4gICAgfSk7XG4gICAgdGhpcy5zdG9wTGlzdGVuaW5nKGJsb2NrKTtcblxuICAgIGJsb2NrLnJlbW92ZSgpO1xuXG4gICAgRXZlbnRCdXMudHJpZ2dlcihcImJsb2NrOnJlbW92ZVwiLCBibG9jayk7XG4gICAgdGhpcy50cmlnZ2VyQmxvY2tDb3VudFVwZGF0ZSgpO1xuXG4gICAgdGhpcy4kd3JhcHBlci50b2dnbGVDbGFzcygnc3QtLWJsb2NrLWxpbWl0LXJlYWNoZWQnLCB0aGlzLl9ibG9ja0xpbWl0UmVhY2hlZCgpKTtcbiAgfSxcblxuICBwZXJmb3JtVmFsaWRhdGlvbnMgOiBmdW5jdGlvbihibG9jaywgc2hvdWxkX3ZhbGlkYXRlKSB7XG4gICAgdmFyIGVycm9ycyA9IDA7XG5cbiAgICBpZiAoIWNvbmZpZy5za2lwVmFsaWRhdGlvbiAmJiBzaG91bGRfdmFsaWRhdGUpIHtcbiAgICAgIGlmKCFibG9jay52YWxpZCgpKXtcbiAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7IHRleHQ6IF8ucmVzdWx0KGJsb2NrLCAndmFsaWRhdGlvbkZhaWxNc2cnKSB9KTtcbiAgICAgICAgdXRpbHMubG9nKFwiQmxvY2sgXCIgKyBibG9jay5ibG9ja0lEICsgXCIgZmFpbGVkIHZhbGlkYXRpb25cIik7XG4gICAgICAgICsrZXJyb3JzO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBlcnJvcnM7XG4gIH0sXG5cbiAgc2F2ZUJsb2NrU3RhdGVUb1N0b3JlOiBmdW5jdGlvbihibG9jaykge1xuICAgIHZhciBzdG9yZSA9IGJsb2NrLnNhdmVBbmRSZXR1cm5EYXRhKCk7XG4gICAgaWYoc3RvcmUgJiYgIV8uaXNFbXB0eShzdG9yZS5kYXRhKSkge1xuICAgICAgdXRpbHMubG9nKFwiQWRkaW5nIGRhdGEgZm9yIGJsb2NrIFwiICsgYmxvY2suYmxvY2tJRCArIFwiIHRvIGJsb2NrIHN0b3JlXCIpO1xuICAgICAgdGhpcy5zdG9yZShcImFkZFwiLCB7IGRhdGE6IHN0b3JlIH0pO1xuICAgIH1cbiAgfSxcblxuICAvKiBIYW5kbGUgYSBmb3JtIHN1Ym1pc3Npb24gb2YgdGhpcyBFZGl0b3IgaW5zdGFuY2UuIFZhbGlkYXRlIGFsbCBvZiBvdXJcbiAgICogYmxvY2tzLCBhbmQgc2VyaWFsaXNlIGFsbCBkYXRhIG9udG8gdGhlIEpTT04gb2JqZWN0c1xuICAgKi9cbiAgb25Gb3JtU3VibWl0OiBmdW5jdGlvbihzaG91bGRfdmFsaWRhdGUpIHtcbiAgICAvLyBpZiB1bmRlZmluZWQgb3IgbnVsbCBvciBhbnl0aGluZyBvdGhlciB0aGFuIGZhbHNlIC0gdHJlYXQgYXMgdHJ1ZVxuICAgIHNob3VsZF92YWxpZGF0ZSA9IChzaG91bGRfdmFsaWRhdGUgPT09IGZhbHNlKSA/IGZhbHNlIDogdHJ1ZTtcblxuICAgIHV0aWxzLmxvZyhcIkhhbmRsaW5nIGZvcm0gc3VibWlzc2lvbiBmb3IgRWRpdG9yIFwiICsgdGhpcy5JRCk7XG5cbiAgICB0aGlzLnJlbW92ZUVycm9ycygpO1xuICAgIHRoaXMuc3RvcmUoXCJyZXNldFwiKTtcblxuICAgIHRoaXMudmFsaWRhdGVCbG9ja3Moc2hvdWxkX3ZhbGlkYXRlKTtcbiAgICB0aGlzLnZhbGlkYXRlQmxvY2tUeXBlc0V4aXN0KHNob3VsZF92YWxpZGF0ZSk7XG5cbiAgICB0aGlzLnJlbmRlckVycm9ycygpO1xuICAgIHRoaXMuc3RvcmUoXCJzYXZlXCIpO1xuXG4gICAgcmV0dXJuIHRoaXMuZXJyb3JzLmxlbmd0aDtcbiAgfSxcblxuICB2YWxpZGF0ZUJsb2NrczogZnVuY3Rpb24oc2hvdWxkX3ZhbGlkYXRlKSB7XG4gICAgaWYgKCF0aGlzLnJlcXVpcmVkICYmIChjb25maWcuc2tpcFZhbGlkYXRpb24gJiYgIXNob3VsZF92YWxpZGF0ZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLiR3cmFwcGVyLmZpbmQoJy5zdC1ibG9jaycpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGJsb2NrKSB7XG4gICAgICB2YXIgX2Jsb2NrID0gdGhpcy5ibG9ja3MuZmluZChmdW5jdGlvbihiKSB7XG4gICAgICAgIHJldHVybiAoYi5ibG9ja0lEID09PSAkKGJsb2NrKS5hdHRyKCdpZCcpKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoXy5pc1VuZGVmaW5lZChfYmxvY2spKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgICAvLyBGaW5kIG91ciBibG9ja1xuICAgICAgdGhpcy5wZXJmb3JtVmFsaWRhdGlvbnMoX2Jsb2NrLCBzaG91bGRfdmFsaWRhdGUpO1xuICAgICAgdGhpcy5zYXZlQmxvY2tTdGF0ZVRvU3RvcmUoX2Jsb2NrKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIHZhbGlkYXRlQmxvY2tUeXBlc0V4aXN0OiBmdW5jdGlvbihzaG91bGRfdmFsaWRhdGUpIHtcbiAgICBpZiAoIXRoaXMucmVxdWlyZWQgJiYgKGNvbmZpZy5za2lwVmFsaWRhdGlvbiAmJiAhc2hvdWxkX3ZhbGlkYXRlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBibG9ja1R5cGVJdGVyYXRvciA9IGZ1bmN0aW9uKHR5cGUsIGluZGV4KSB7XG4gICAgICBpZiAoIXRoaXMuX2lzQmxvY2tUeXBlQXZhaWxhYmxlKHR5cGUpKSB7IHJldHVybjsgfVxuXG4gICAgICBpZiAodGhpcy5fZ2V0QmxvY2tUeXBlQ291bnQodHlwZSkgPT09IDApIHtcbiAgICAgICAgdXRpbHMubG9nKFwiRmFpbGVkIHZhbGlkYXRpb24gb24gcmVxdWlyZWQgYmxvY2sgdHlwZSBcIiArIHR5cGUpO1xuICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHsgdGV4dDogaTE4bi50KFwiZXJyb3JzOnR5cGVfbWlzc2luZ1wiLCB7IHR5cGU6IHR5cGUgfSkgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgYmxvY2tzID0gdGhpcy5nZXRCbG9ja3NCeVR5cGUodHlwZSkuZmlsdGVyKGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgICByZXR1cm4gIWIuaXNFbXB0eSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYmxvY2tzLmxlbmd0aCA+IDApIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7IHRleHQ6IGkxOG4udChcImVycm9yczpyZXF1aXJlZF90eXBlX2VtcHR5XCIsIHsgdHlwZTogdHlwZSB9KSB9KTtcbiAgICAgICAgdXRpbHMubG9nKFwiQSByZXF1aXJlZCBibG9jayB0eXBlIFwiICsgdHlwZSArIFwiIGlzIGVtcHR5XCIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLnJlcXVpcmVkKSkge1xuICAgICAgdGhpcy5yZXF1aXJlZC5mb3JFYWNoKGJsb2NrVHlwZUl0ZXJhdG9yLCB0aGlzKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyRXJyb3JzOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5lcnJvcnMubGVuZ3RoID09PSAwKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgaWYgKF8uaXNVbmRlZmluZWQodGhpcy4kZXJyb3JzKSkge1xuICAgICAgdGhpcy4kZXJyb3JzID0gdGhpcy5fZXJyb3JzQ29udGFpbmVyKCk7XG4gICAgfVxuXG4gICAgdmFyIHN0ciA9IFwiPHVsPlwiO1xuXG4gICAgdGhpcy5lcnJvcnMuZm9yRWFjaChmdW5jdGlvbihlcnJvcikge1xuICAgICAgc3RyICs9ICc8bGkgY2xhc3M9XCJzdC1lcnJvcnNfX21zZ1wiPicrIGVycm9yLnRleHQgKyc8L2xpPic7XG4gICAgfSk7XG5cbiAgICBzdHIgKz0gXCI8L3VsPlwiO1xuXG4gICAgdGhpcy4kZXJyb3JzLmFwcGVuZChzdHIpO1xuICAgIHRoaXMuJGVycm9ycy5zaG93KCk7XG4gIH0sXG5cbiAgX2Vycm9yc0NvbnRhaW5lcjogZnVuY3Rpb24oKSB7XG4gICAgaWYgKF8uaXNVbmRlZmluZWQodGhpcy5vcHRpb25zLmVycm9yc0NvbnRhaW5lcikpIHtcbiAgICAgIHZhciAkY29udGFpbmVyID0gJChcIjxkaXY+XCIsIHtcbiAgICAgICAgJ2NsYXNzJzogJ3N0LWVycm9ycycsXG4gICAgICAgIGh0bWw6IFwiPHA+XCIgKyBpMThuLnQoXCJlcnJvcnM6dGl0bGVcIikgKyBcIiA8L3A+XCJcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLiRvdXRlci5wcmVwZW5kKCRjb250YWluZXIpO1xuICAgICAgcmV0dXJuICRjb250YWluZXI7XG4gICAgfVxuXG4gICAgcmV0dXJuICQodGhpcy5vcHRpb25zLmVycm9yc0NvbnRhaW5lcik7XG4gIH0sXG5cbiAgcmVtb3ZlRXJyb3JzOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5lcnJvcnMubGVuZ3RoID09PSAwKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgdGhpcy4kZXJyb3JzLmhpZGUoKS5maW5kKCd1bCcpLmh0bWwoJycpO1xuXG4gICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgfSxcblxuICBmaW5kQmxvY2tCeUlkOiBmdW5jdGlvbihibG9ja19pZCkge1xuICAgIHJldHVybiB0aGlzLmJsb2Nrcy5maW5kKGZ1bmN0aW9uKGIpIHsgcmV0dXJuIGIuYmxvY2tJRCA9PT0gYmxvY2tfaWQ7IH0pO1xuICB9LFxuXG4gIGdldEJsb2Nrc0J5VHlwZTogZnVuY3Rpb24oYmxvY2tfdHlwZSkge1xuICAgIHJldHVybiB0aGlzLmJsb2Nrcy5maWx0ZXIoZnVuY3Rpb24oYikge1xuICAgICAgcmV0dXJuIHV0aWxzLmNsYXNzaWZ5KGIudHlwZSkgPT09IGJsb2NrX3R5cGU7XG4gICAgfSk7XG4gIH0sXG5cbiAgZ2V0QmxvY2tzQnlJRHM6IGZ1bmN0aW9uKGJsb2NrX2lkcykge1xuICAgIHJldHVybiB0aGlzLmJsb2Nrcy5maWx0ZXIoZnVuY3Rpb24oYikge1xuICAgICAgcmV0dXJuIGJsb2NrX2lkcy5pbmNsdWRlcyhiLmJsb2NrSUQpO1xuICAgIH0pO1xuICB9LFxuXG4gIGdldEJsb2NrUG9zaXRpb246IGZ1bmN0aW9uKCRibG9jaykge1xuICAgIHJldHVybiB0aGlzLiR3cmFwcGVyLmZpbmQoJy5zdC1ibG9jaycpLmluZGV4KCRibG9jayk7XG4gIH0sXG5cbiAgLyogR2V0IEJsb2NrIFR5cGUgTGltaXRcbiAgICogLS1cbiAgICogcmV0dXJucyB0aGUgbGltaXQgZm9yIHRoaXMgYmxvY2ssIHdoaWNoIGNhbiBiZSBzZXQgb24gYSBwZXIgRWRpdG9yXG4gICAqIGluc3RhbmNlLCBvciBvbiBhIGdsb2JhbCBibG9ja1R5cGUgc2NvcGUuICovXG4gIF9nZXRCbG9ja1R5cGVMaW1pdDogZnVuY3Rpb24odCkge1xuICAgIGlmICghdGhpcy5faXNCbG9ja1R5cGVBdmFpbGFibGUodCkpIHsgcmV0dXJuIDA7IH1cblxuICAgIHJldHVybiBwYXJzZUludCgoXy5pc1VuZGVmaW5lZCh0aGlzLm9wdGlvbnMuYmxvY2tUeXBlTGltaXRzW3RdKSkgPyAwIDogdGhpcy5vcHRpb25zLmJsb2NrVHlwZUxpbWl0c1t0XSwgMTApO1xuICB9LFxuXG4gIC8qIEF2YWlsYWJpbGl0eSBoZWxwZXIgbWV0aG9kc1xuICAgKiAtLVxuICAgKiBDaGVja3MgaWYgdGhlIG9iamVjdCBleGlzdHMgd2l0aGluIHRoZSBpbnN0YW5jZSBvZiB0aGUgRWRpdG9yLiAqL1xuXG4gIF9pc0Jsb2NrVHlwZUF2YWlsYWJsZTogZnVuY3Rpb24odCkge1xuICAgIHJldHVybiAhXy5pc1VuZGVmaW5lZCh0aGlzLmJsb2NrVHlwZXNbdF0pO1xuICB9LFxuXG4gIF9lbnN1cmVBbmRTZXRFbGVtZW50czogZnVuY3Rpb24oKSB7XG4gICAgaWYoXy5pc1VuZGVmaW5lZCh0aGlzLm9wdGlvbnMuZWwpIHx8IF8uaXNFbXB0eSh0aGlzLm9wdGlvbnMuZWwpKSB7XG4gICAgICB1dGlscy5sb2coXCJZb3UgbXVzdCBwcm92aWRlIGFuIGVsXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuJGVsID0gdGhpcy5vcHRpb25zLmVsO1xuICAgIHRoaXMuZWwgPSB0aGlzLm9wdGlvbnMuZWxbMF07XG4gICAgdGhpcy4kZm9ybSA9IHRoaXMuJGVsLnBhcmVudHMoJ2Zvcm0nKTtcblxuICAgIHZhciAkb3V0ZXIgPSAkKFwiPGRpdj5cIikuYXR0cih7ICdpZCc6IHRoaXMuSUQsICdjbGFzcyc6ICdzdC1vdXRlcicsICdkcm9wem9uZSc6ICdjb3B5IGxpbmsgbW92ZScgfSk7XG4gICAgdmFyICR3cmFwcGVyID0gJChcIjxkaXY+XCIpLmF0dHIoeyAnY2xhc3MnOiAnc3QtYmxvY2tzJyB9KTtcblxuICAgIC8vIFdyYXAgb3VyIGVsZW1lbnQgaW4gbG90cyBvZiBjb250YWluZXJzICpld3cqXG4gICAgdGhpcy4kZWwud3JhcCgkb3V0ZXIpLndyYXAoJHdyYXBwZXIpO1xuXG4gICAgdGhpcy4kb3V0ZXIgPSB0aGlzLiRmb3JtLmZpbmQoJyMnICsgdGhpcy5JRCk7XG4gICAgdGhpcy4kd3JhcHBlciA9IHRoaXMuJG91dGVyLmZpbmQoJy5zdC1ibG9ja3MnKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIC8qIFNldCBvdXIgYmxvY2tUeXBlc1xuICAgKiBUaGVzZSB3aWxsIGVpdGhlciBiZSBzZXQgb24gYSBwZXIgRWRpdG9yIGluc3RhbmNlLCBvciBzZXQgb24gYSBnbG9iYWwgc2NvcGUuXG4gICAqL1xuICBfc2V0QmxvY2tzVHlwZXM6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYmxvY2tUeXBlcyA9IHt9O1xuICAgIHZhciBrZXlzID0gdGhpcy5vcHRpb25zLmJsb2NrVHlwZXMgfHwgT2JqZWN0LmtleXMoQmxvY2tzKTtcbiAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgIHRoaXMuYmxvY2tUeXBlc1trXSA9IHRydWU7XG4gICAgfSwgdGhpcyk7XG4gIH0sXG5cbiAgLyogR2V0IG91ciByZXF1aXJlZCBibG9ja3MgKGlmIGFueSkgKi9cbiAgX3NldFJlcXVpcmVkOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLm9wdGlvbnMucmVxdWlyZWQpICYmXG4gICAgICAgICFfLmlzRW1wdHkodGhpcy5vcHRpb25zLnJlcXVpcmVkKSkge1xuICAgICAgdGhpcy5yZXF1aXJlZCA9IHRoaXMub3B0aW9ucy5yZXF1aXJlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZXF1aXJlZCA9IGZhbHNlO1xuICAgIH1cbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbih7fSwgcmVxdWlyZSgnLi9ldmVudHMnKSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdldmVudGFibGVqcycpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gKiBTaXIgVHJldm9yIEVkaXRvciBTdG9yZVxuICogQnkgZGVmYXVsdCB3ZSBzdG9yZSB0aGUgY29tcGxldGUgZGF0YSBvbiB0aGUgaW5zdGFuY2VzICRlbFxuICogV2UgY2FuIGVhc2lseSBleHRlbmQgdGhpcyBhbmQgc3RvcmUgaXQgb24gc29tZSBzZXJ2ZXIgb3Igc29tZXRoaW5nXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi9sb2Rhc2gnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWRpdG9yLCBtZXRob2QsIG9wdGlvbnMpIHtcbiAgdmFyIHJlc3A7XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgc3dpdGNoKG1ldGhvZCkge1xuXG4gICAgY2FzZSBcImNyZWF0ZVwiOlxuICAgICAgLy8gR3JhYiBvdXIgSlNPTiBmcm9tIHRoZSB0ZXh0YXJlYSBhbmQgY2xlYW4gYW55IHdoaXRlc3BhY2UgaW4gY2FzZVxuICAgICAgLy8gdGhlcmUgaXMgYSBsaW5lIHdyYXAgYmV0d2VlbiB0aGUgb3BlbmluZyBhbmQgY2xvc2luZyB0ZXh0YXJlYSB0YWdzXG4gICAgICB2YXIgY29udGVudCA9IGVkaXRvci4kZWwudmFsKCkudHJpbSgpO1xuICAgICAgZWRpdG9yLmRhdGFTdG9yZSA9IHsgZGF0YTogW10gfTtcblxuICAgICAgaWYgKGNvbnRlbnQubGVuZ3RoID4gMCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIEVuc3VyZSB0aGUgSlNPTiBzdHJpbmcgaGFzIGEgZGF0YSBlbGVtZW50IHRoYXQncyBhbiBhcnJheVxuICAgICAgICAgIHZhciBzdHIgPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChzdHIuZGF0YSkpIHtcbiAgICAgICAgICAgIC8vIFNldCBpdFxuICAgICAgICAgICAgZWRpdG9yLmRhdGFTdG9yZSA9IHN0cjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgIGVkaXRvci5lcnJvcnMucHVzaCh7IHRleHQ6IGkxOG4udChcImVycm9yczpsb2FkX2ZhaWxcIikgfSk7XG4gICAgICAgICAgZWRpdG9yLnJlbmRlckVycm9ycygpO1xuXG4gICAgICAgICAgdXRpbHMubG9nKCdTb3JyeSB0aGVyZSBoYXMgYmVlbiBhIHByb2JsZW0gd2l0aCBwYXJzaW5nIHRoZSBKU09OJyk7XG4gICAgICAgICAgdXRpbHMubG9nKGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgXCJyZXNldFwiOlxuICAgICAgZWRpdG9yLmRhdGFTdG9yZSA9IHsgZGF0YTogW10gfTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBcImFkZFwiOlxuICAgICAgaWYgKG9wdGlvbnMuZGF0YSkge1xuICAgICAgICBlZGl0b3IuZGF0YVN0b3JlLmRhdGEucHVzaChvcHRpb25zLmRhdGEpO1xuICAgICAgICByZXNwID0gZWRpdG9yLmRhdGFTdG9yZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBcInNhdmVcIjpcbiAgICAgIC8vIFN0b3JlIHRvIG91ciBlbGVtZW50XG4gICAgICBlZGl0b3IuJGVsLnZhbCgoZWRpdG9yLmRhdGFTdG9yZS5kYXRhLmxlbmd0aCA+IDApID8gSlNPTi5zdHJpbmdpZnkoZWRpdG9yLmRhdGFTdG9yZSkgOiAnJyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgXCJyZWFkXCI6XG4gICAgICByZXNwID0gZWRpdG9yLmRhdGFTdG9yZTtcbiAgICAgIGJyZWFrO1xuXG4gIH1cblxuICBpZihyZXNwKSB7XG4gICAgcmV0dXJuIHJlc3A7XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICogU2lyVHJldm9yLlN1Ym1pdHRhYmxlXG4gKiAtLVxuICogV2UgbmVlZCBhIGdsb2JhbCB3YXkgb2Ygc2V0dGluZyBpZiB0aGUgZWRpdG9yIGNhbiBhbmQgY2FuJ3QgYmUgc3VibWl0dGVkLFxuICogYW5kIGEgd2F5IHRvIGRpc2FibGUgdGhlIHN1Ym1pdCBidXR0b24gYW5kIGFkZCBtZXNzYWdlcyAod2hlbiBhcHByb3ByaWF0ZSlcbiAqIFdlIGFsc28gbmVlZCB0aGlzIHRvIGJlIGhpZ2hseSBleHRlbnNpYmxlIHNvIGl0IGNhbiBiZSBvdmVycmlkZGVuLlxuICogVGhpcyB3aWxsIGJlIHRyaWdnZXJlZCAqYnkgYW55dGhpbmcqIHNvIGl0IG5lZWRzIHRvIHN1YnNjcmliZSB0byBldmVudHMuXG4gKi9cblxuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuLi9ldmVudC1idXMnKTtcblxudmFyIHN1Ym1pdHRhYmxlID0gZnVuY3Rpb24oJGZvcm0pIHtcbiAgdGhpcy4kZm9ybSA9ICRmb3JtO1xuICB0aGlzLmludGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihzdWJtaXR0YWJsZS5wcm90b3R5cGUsIHtcblxuICBpbnRpYWxpemU6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy4kc3VibWl0QnRuID0gdGhpcy4kZm9ybS5maW5kKFwiaW5wdXRbdHlwZT0nc3VibWl0J11cIik7XG5cbiAgICB2YXIgYnRuVGl0bGVzID0gW107XG5cbiAgICB0aGlzLiRzdWJtaXRCdG4uZWFjaChmdW5jdGlvbihpLCBidG4pe1xuICAgICAgYnRuVGl0bGVzLnB1c2goJChidG4pLmF0dHIoJ3ZhbHVlJykpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zdWJtaXRCdG5UaXRsZXMgPSBidG5UaXRsZXM7XG4gICAgdGhpcy5jYW5TdWJtaXQgPSB0cnVlO1xuICAgIHRoaXMuZ2xvYmFsVXBsb2FkQ291bnQgPSAwO1xuICAgIHRoaXMuX2JpbmRFdmVudHMoKTtcbiAgfSxcblxuICBzZXRTdWJtaXRCdXR0b246IGZ1bmN0aW9uKGUsIG1lc3NhZ2UpIHtcbiAgICB0aGlzLiRzdWJtaXRCdG4uYXR0cigndmFsdWUnLCBtZXNzYWdlKTtcbiAgfSxcblxuICByZXNldFN1Ym1pdEJ1dHRvbjogZnVuY3Rpb24oKXtcbiAgICB2YXIgdGl0bGVzID0gdGhpcy5zdWJtaXRCdG5UaXRsZXM7XG4gICAgdGhpcy4kc3VibWl0QnRuLmVhY2goZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICQoaXRlbSkuYXR0cigndmFsdWUnLCB0aXRsZXNbaW5kZXhdKTtcbiAgICB9KTtcbiAgfSxcblxuICBvblVwbG9hZFN0YXJ0OiBmdW5jdGlvbihlKXtcbiAgICB0aGlzLmdsb2JhbFVwbG9hZENvdW50Kys7XG4gICAgdXRpbHMubG9nKCdvblVwbG9hZFN0YXJ0IGNhbGxlZCAnICsgdGhpcy5nbG9iYWxVcGxvYWRDb3VudCk7XG5cbiAgICBpZih0aGlzLmdsb2JhbFVwbG9hZENvdW50ID09PSAxKSB7XG4gICAgICB0aGlzLl9kaXNhYmxlU3VibWl0QnV0dG9uKCk7XG4gICAgfVxuICB9LFxuXG4gIG9uVXBsb2FkU3RvcDogZnVuY3Rpb24oZSkge1xuICAgIHRoaXMuZ2xvYmFsVXBsb2FkQ291bnQgPSAodGhpcy5nbG9iYWxVcGxvYWRDb3VudCA8PSAwKSA/IDAgOiB0aGlzLmdsb2JhbFVwbG9hZENvdW50IC0gMTtcblxuICAgIHV0aWxzLmxvZygnb25VcGxvYWRTdG9wIGNhbGxlZCAnICsgdGhpcy5nbG9iYWxVcGxvYWRDb3VudCk7XG5cbiAgICBpZih0aGlzLmdsb2JhbFVwbG9hZENvdW50ID09PSAwKSB7XG4gICAgICB0aGlzLl9lbmFibGVTdWJtaXRCdXR0b24oKTtcbiAgICB9XG4gIH0sXG5cbiAgb25FcnJvcjogZnVuY3Rpb24oZSl7XG4gICAgdXRpbHMubG9nKCdvbkVycm9yIGNhbGxlZCcpO1xuICAgIHRoaXMuY2FuU3VibWl0ID0gZmFsc2U7XG4gIH0sXG5cbiAgX2Rpc2FibGVTdWJtaXRCdXR0b246IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgIHRoaXMuc2V0U3VibWl0QnV0dG9uKG51bGwsIG1lc3NhZ2UgfHwgaTE4bi50KFwiZ2VuZXJhbDp3YWl0XCIpKTtcbiAgICB0aGlzLiRzdWJtaXRCdG5cbiAgICAuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKVxuICAgIC5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgfSxcblxuICBfZW5hYmxlU3VibWl0QnV0dG9uOiBmdW5jdGlvbigpe1xuICAgIHRoaXMucmVzZXRTdWJtaXRCdXR0b24oKTtcbiAgICB0aGlzLiRzdWJtaXRCdG5cbiAgICAucmVtb3ZlQXR0cignZGlzYWJsZWQnKVxuICAgIC5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgfSxcblxuICBfZXZlbnRzIDoge1xuICAgIFwiZGlzYWJsZVN1Ym1pdEJ1dHRvblwiIDogXCJfZGlzYWJsZVN1Ym1pdEJ1dHRvblwiLFxuICAgIFwiZW5hYmxlU3VibWl0QnV0dG9uXCIgIDogXCJfZW5hYmxlU3VibWl0QnV0dG9uXCIsXG4gICAgXCJzZXRTdWJtaXRCdXR0b25cIiAgICAgOiBcInNldFN1Ym1pdEJ1dHRvblwiLFxuICAgIFwicmVzZXRTdWJtaXRCdXR0b25cIiAgIDogXCJyZXNldFN1Ym1pdEJ1dHRvblwiLFxuICAgIFwib25FcnJvclwiICAgICAgICAgICAgIDogXCJvbkVycm9yXCIsXG4gICAgXCJvblVwbG9hZFN0YXJ0XCIgICAgICAgOiBcIm9uVXBsb2FkU3RhcnRcIixcbiAgICBcIm9uVXBsb2FkU3RvcFwiICAgICAgICA6IFwib25VcGxvYWRTdG9wXCJcbiAgfSxcblxuICBfYmluZEV2ZW50czogZnVuY3Rpb24oKXtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9ldmVudHMpLmZvckVhY2goZnVuY3Rpb24odHlwZSkge1xuICAgICAgRXZlbnRCdXMub24odHlwZSwgdGhpc1t0aGlzLl9ldmVudHNbdHlwZV1dLCB0aGlzKTtcbiAgICB9LCB0aGlzKTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBzdWJtaXR0YWJsZTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4qICAgU2lyIFRyZXZvciBVcGxvYWRlclxuKiAgIEdlbmVyaWMgVXBsb2FkIGltcGxlbWVudGF0aW9uIHRoYXQgY2FuIGJlIGV4dGVuZGVkIGZvciBibG9ja3NcbiovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vbG9kYXNoJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vY29uZmlnJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGJsb2NrLCBmaWxlLCBzdWNjZXNzLCBlcnJvcikge1xuXG4gIHZhciB1aWQgID0gW2Jsb2NrLmJsb2NrSUQsIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCksICdyYXcnXS5qb2luKCctJyk7XG4gIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cbiAgZGF0YS5hcHBlbmQoJ2F0dGFjaG1lbnRbbmFtZV0nLCBmaWxlLm5hbWUpO1xuICBkYXRhLmFwcGVuZCgnYXR0YWNobWVudFtmaWxlXScsIGZpbGUpO1xuICBkYXRhLmFwcGVuZCgnYXR0YWNobWVudFt1aWRdJywgdWlkKTtcblxuICBibG9jay5yZXNldE1lc3NhZ2VzKCk7XG5cbiAgdmFyIGNhbGxiYWNrU3VjY2VzcyA9IGZ1bmN0aW9uKCl7XG4gICAgdXRpbHMubG9nKCdVcGxvYWQgY2FsbGJhY2sgY2FsbGVkJyk7XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoc3VjY2VzcykgJiYgXy5pc0Z1bmN0aW9uKHN1Y2Nlc3MpKSB7XG4gICAgICBzdWNjZXNzLmFwcGx5KGJsb2NrLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgY2FsbGJhY2tFcnJvciA9IGZ1bmN0aW9uKCl7XG4gICAgdXRpbHMubG9nKCdVcGxvYWQgY2FsbGJhY2sgZXJyb3IgY2FsbGVkJyk7XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoZXJyb3IpICYmIF8uaXNGdW5jdGlvbihlcnJvcikpIHtcbiAgICAgIGVycm9yLmFwcGx5KGJsb2NrLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgeGhyID0gJC5hamF4KHtcbiAgICB1cmw6IGNvbmZpZy5kZWZhdWx0cy51cGxvYWRVcmwsXG4gICAgZGF0YTogZGF0YSxcbiAgICBjYWNoZTogZmFsc2UsXG4gICAgY29udGVudFR5cGU6IGZhbHNlLFxuICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIHR5cGU6ICdQT1NUJ1xuICB9KTtcblxuICBibG9jay5hZGRRdWV1ZWRJdGVtKHVpZCwgeGhyKTtcblxuICB4aHIuZG9uZShjYWxsYmFja1N1Y2Nlc3MpXG4gICAgIC5mYWlsKGNhbGxiYWNrRXJyb3IpXG4gICAgIC5hbHdheXMoYmxvY2sucmVtb3ZlUXVldWVkSXRlbS5iaW5kKGJsb2NrLCB1aWQpKTtcblxuICByZXR1cm4geGhyO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICAgU2lyVHJldm9yIEZsb2F0aW5nIEJsb2NrIENvbnRyb2xzXG4gICAtLVxuICAgRHJhd3MgdGhlICdwbHVzJyBiZXR3ZWVuIGJsb2Nrc1xuICAgKi9cblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuL2V2ZW50LWJ1cycpO1xuXG52YXIgRmxvYXRpbmdCbG9ja0NvbnRyb2xzID0gZnVuY3Rpb24od3JhcHBlciwgaW5zdGFuY2VfaWQpIHtcbiAgdGhpcy4kd3JhcHBlciA9IHdyYXBwZXI7XG4gIHRoaXMuaW5zdGFuY2VfaWQgPSBpbnN0YW5jZV9pZDtcblxuICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gIHRoaXMuX2JpbmRGdW5jdGlvbnMoKTtcblxuICB0aGlzLmluaXRpYWxpemUoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oRmxvYXRpbmdCbG9ja0NvbnRyb2xzLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vcmVuZGVyYWJsZScpLCByZXF1aXJlKCcuL2V2ZW50cycpLCB7XG5cbiAgY2xhc3NOYW1lOiBcInN0LWJsb2NrLWNvbnRyb2xzX190b3BcIixcblxuICBhdHRyaWJ1dGVzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2RhdGEtaWNvbic6ICdhZGQnXG4gICAgfTtcbiAgfSxcblxuICBib3VuZDogWydoYW5kbGVCbG9ja01vdXNlT3V0JywgJ2hhbmRsZUJsb2NrTW91c2VPdmVyJywgJ2hhbmRsZUJsb2NrQ2xpY2snLCAnb25Ecm9wJ10sXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZWwub24oJ2NsaWNrJywgdGhpcy5oYW5kbGVCbG9ja0NsaWNrKVxuICAgIC5kcm9wQXJlYSgpXG4gICAgLmJpbmQoJ2Ryb3AnLCB0aGlzLm9uRHJvcCk7XG5cbiAgICB0aGlzLiR3cmFwcGVyLm9uKCdtb3VzZW92ZXInLCAnLnN0LWJsb2NrJywgdGhpcy5oYW5kbGVCbG9ja01vdXNlT3ZlcilcbiAgICAub24oJ21vdXNlb3V0JywgJy5zdC1ibG9jaycsIHRoaXMuaGFuZGxlQmxvY2tNb3VzZU91dClcbiAgICAub24oJ2NsaWNrJywgJy5zdC1ibG9jay0td2l0aC1wbHVzJywgdGhpcy5oYW5kbGVCbG9ja0NsaWNrKTtcbiAgfSxcblxuICBvbkRyb3A6IGZ1bmN0aW9uKGV2KSB7XG4gICAgZXYucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBkcm9wcGVkX29uID0gdGhpcy4kZWwsXG4gICAgaXRlbV9pZCA9IGV2Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoXCJ0ZXh0L3BsYWluXCIpLFxuICAgIGJsb2NrID0gJCgnIycgKyBpdGVtX2lkKTtcblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChpdGVtX2lkKSAmJlxuICAgICAgICAhXy5pc0VtcHR5KGJsb2NrKSAmJlxuICAgICAgICAgIGRyb3BwZWRfb24uYXR0cignaWQnKSAhPT0gaXRlbV9pZCAmJlxuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZV9pZCA9PT0gYmxvY2suYXR0cignZGF0YS1pbnN0YW5jZScpXG4gICAgICAgKSB7XG4gICAgICAgICBkcm9wcGVkX29uLmFmdGVyKGJsb2NrKTtcbiAgICAgICB9XG5cbiAgICAgICBFdmVudEJ1cy50cmlnZ2VyKFwiYmxvY2s6cmVvcmRlcjpkcm9wcGVkXCIsIGl0ZW1faWQpO1xuICB9LFxuXG4gIGhhbmRsZUJsb2NrTW91c2VPdmVyOiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGJsb2NrID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuXG4gICAgaWYgKCFibG9jay5oYXNDbGFzcygnc3QtYmxvY2stLXdpdGgtcGx1cycpKSB7XG4gICAgICBibG9jay5hZGRDbGFzcygnc3QtYmxvY2stLXdpdGgtcGx1cycpO1xuICAgIH1cbiAgfSxcblxuICBoYW5kbGVCbG9ja01vdXNlT3V0OiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGJsb2NrID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuXG4gICAgaWYgKGJsb2NrLmhhc0NsYXNzKCdzdC1ibG9jay0td2l0aC1wbHVzJykpIHtcbiAgICAgIGJsb2NrLnJlbW92ZUNsYXNzKCdzdC1ibG9jay0td2l0aC1wbHVzJyk7XG4gICAgfVxuICB9LFxuXG4gIGhhbmRsZUJsb2NrQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgdmFyIGJsb2NrID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgIHRoaXMudHJpZ2dlcignc2hvd0Jsb2NrQ29udHJvbHMnLCBibG9jayk7XG4gIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmxvYXRpbmdCbG9ja0NvbnRyb2xzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuL2V2ZW50LWJ1cycpO1xudmFyIFN1Ym1pdHRhYmxlID0gcmVxdWlyZSgnLi9leHRlbnNpb25zL3Npci10cmV2b3Iuc3VibWl0dGFibGUnKTtcblxudmFyIGZvcm1Cb3VuZCA9IGZhbHNlOyAvLyBGbGFnIHRvIHRlbGwgdXMgb25jZSB3ZSd2ZSBib3VuZCBvdXIgc3VibWl0IGV2ZW50XG5cbnZhciBGb3JtRXZlbnRzID0ge1xuICBiaW5kRm9ybVN1Ym1pdDogZnVuY3Rpb24oZm9ybSkge1xuICAgIGlmICghZm9ybUJvdW5kKSB7XG4gICAgICB0aGlzLnN1Ym1pdHRhYmxlID0gbmV3IFN1Ym1pdHRhYmxlKGZvcm0pO1xuICAgICAgZm9ybS5vbignc3VibWl0LnNpcnRyZXZvcicsIHRoaXMub25Gb3JtU3VibWl0KTtcbiAgICAgIGZvcm1Cb3VuZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG4gIG9uQmVmb3JlU3VibWl0OiBmdW5jdGlvbihzaG91bGRfdmFsaWRhdGUpIHtcbiAgICAvLyBMb29wIHRocm91Z2ggYWxsIG9mIG91ciBpbnN0YW5jZXMgYW5kIGRvIG91ciBmb3JtIHN1Ym1pdHMgb24gdGhlbVxuICAgIHZhciBlcnJvcnMgPSAwO1xuICAgIGNvbmZpZy5pbnN0YW5jZXMuZm9yRWFjaChmdW5jdGlvbihpbnN0LCBpKSB7XG4gICAgICBlcnJvcnMgKz0gaW5zdC5vbkZvcm1TdWJtaXQoc2hvdWxkX3ZhbGlkYXRlKTtcbiAgICB9KTtcbiAgICB1dGlscy5sb2coXCJUb3RhbCBlcnJvcnM6IFwiICsgZXJyb3JzKTtcblxuICAgIHJldHVybiBlcnJvcnM7XG4gIH0sXG5cbiAgb25Gb3JtU3VibWl0OiBmdW5jdGlvbihldikge1xuICAgIHZhciBlcnJvcnMgPSBGb3JtRXZlbnRzLm9uQmVmb3JlU3VibWl0KCk7XG5cbiAgICBpZihlcnJvcnMgPiAwKSB7XG4gICAgICBFdmVudEJ1cy50cmlnZ2VyKFwib25FcnJvclwiKTtcbiAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtRXZlbnRzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gICBGb3JtYXQgQmFyXG4gICAtLVxuICAgRGlzcGxheWVkIG9uIGZvY3VzIG9uIGEgdGV4dCBhcmVhLlxuICAgUmVuZGVycyB3aXRoIGFsbCBhdmFpbGFibGUgb3B0aW9ucyBmb3IgdGhlIGVkaXRvciBpbnN0YW5jZVxuICAgKi9cblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xuXG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcbnZhciBGb3JtYXR0ZXJzID0gcmVxdWlyZSgnLi9mb3JtYXR0ZXJzJyk7XG5cbnZhciBGb3JtYXRCYXIgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmZpZy5kZWZhdWx0cy5mb3JtYXRCYXIsIG9wdGlvbnMgfHwge30pO1xuICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gIHRoaXMuX2JpbmRGdW5jdGlvbnMoKTtcblxuICB0aGlzLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oRm9ybWF0QmFyLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vZXZlbnRzJyksIHJlcXVpcmUoJy4vcmVuZGVyYWJsZScpLCB7XG5cbiAgY2xhc3NOYW1lOiAnc3QtZm9ybWF0LWJhcicsXG5cbiAgYm91bmQ6IFtcIm9uRm9ybWF0QnV0dG9uQ2xpY2tcIiwgXCJyZW5kZXJCeVNlbGVjdGlvblwiLCBcImhpZGVcIl0sXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZvcm1hdE5hbWUsIGZvcm1hdCwgYnRuO1xuICAgIHRoaXMuJGJ0bnMgPSBbXTtcblxuICAgIGZvciAoZm9ybWF0TmFtZSBpbiBGb3JtYXR0ZXJzKSB7XG4gICAgICBpZiAoRm9ybWF0dGVycy5oYXNPd25Qcm9wZXJ0eShmb3JtYXROYW1lKSkge1xuICAgICAgICBmb3JtYXQgPSBGb3JtYXR0ZXJzW2Zvcm1hdE5hbWVdO1xuICAgICAgICBidG4gPSAkKFwiPGJ1dHRvbj5cIiwge1xuICAgICAgICAgICdjbGFzcyc6ICdzdC1mb3JtYXQtYnRuIHN0LWZvcm1hdC1idG4tLScgKyBmb3JtYXROYW1lICsgJyAnICsgKGZvcm1hdC5pY29uTmFtZSA/ICdzdC1pY29uJyA6ICcnKSxcbiAgICAgICAgICAndGV4dCc6IGZvcm1hdC50ZXh0LFxuICAgICAgICAgICdkYXRhLXR5cGUnOiBmb3JtYXROYW1lLFxuICAgICAgICAgICdkYXRhLWNtZCc6IGZvcm1hdC5jbWRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy4kYnRucy5wdXNoKGJ0bik7XG4gICAgICAgIGJ0bi5hcHBlbmRUbyh0aGlzLiRlbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy4kYiA9ICQoZG9jdW1lbnQpO1xuICAgIHRoaXMuJGVsLmJpbmQoJ2NsaWNrJywgJy5zdC1mb3JtYXQtYnRuJywgdGhpcy5vbkZvcm1hdEJ1dHRvbkNsaWNrKTtcbiAgfSxcblxuICBoaWRlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnc3QtZm9ybWF0LWJhci0taXMtcmVhZHknKTtcbiAgfSxcblxuICBzaG93OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5hZGRDbGFzcygnc3QtZm9ybWF0LWJhci0taXMtcmVhZHknKTtcbiAgfSxcblxuICByZW1vdmU6IGZ1bmN0aW9uKCl7IHRoaXMuJGVsLnJlbW92ZSgpOyB9LFxuXG4gIHJlbmRlckJ5U2VsZWN0aW9uOiBmdW5jdGlvbihyZWN0YW5nbGVzKSB7XG5cbiAgICB2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpLFxuICAgIHJhbmdlID0gc2VsZWN0aW9uLmdldFJhbmdlQXQoMCksXG4gICAgYm91bmRhcnkgPSByYW5nZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICBjb29yZHMgPSB7fTtcblxuICAgIGNvb3Jkcy50b3AgPSBib3VuZGFyeS50b3AgKyAyMCArIHdpbmRvdy5wYWdlWU9mZnNldCAtIHRoaXMuJGVsLmhlaWdodCgpICsgJ3B4JztcbiAgICBjb29yZHMubGVmdCA9ICgoYm91bmRhcnkubGVmdCArIGJvdW5kYXJ5LnJpZ2h0KSAvIDIpIC0gKHRoaXMuJGVsLndpZHRoKCkgLyAyKSArICdweCc7XG5cbiAgICB0aGlzLmhpZ2hsaWdodFNlbGVjdGVkQnV0dG9ucygpO1xuICAgIHRoaXMuc2hvdygpO1xuXG4gICAgdGhpcy4kZWwuY3NzKGNvb3Jkcyk7XG4gIH0sXG5cbiAgaGlnaGxpZ2h0U2VsZWN0ZWRCdXR0b25zOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZm9ybWF0dGVyO1xuICAgIHRoaXMuJGJ0bnMuZm9yRWFjaChmdW5jdGlvbigkYnRuKSB7XG4gICAgICBmb3JtYXR0ZXIgPSBGb3JtYXR0ZXJzWyRidG4uYXR0cignZGF0YS10eXBlJyldO1xuICAgICAgJGJ0bi50b2dnbGVDbGFzcyhcInN0LWZvcm1hdC1idG4tLWlzLWFjdGl2ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZXIuaXNBY3RpdmUoKSk7XG4gICAgfSwgdGhpcyk7XG4gIH0sXG5cbiAgb25Gb3JtYXRCdXR0b25DbGljazogZnVuY3Rpb24oZXYpe1xuICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgdmFyIGJ0biA9ICQoZXYudGFyZ2V0KSxcbiAgICBmb3JtYXQgPSBGb3JtYXR0ZXJzW2J0bi5hdHRyKCdkYXRhLXR5cGUnKV07XG5cbiAgICBpZiAoXy5pc1VuZGVmaW5lZChmb3JtYXQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gRG8gd2UgaGF2ZSBhIGNsaWNrIGZ1bmN0aW9uIGRlZmluZWQgb24gdGhpcyBmb3JtYXR0ZXI/XG4gICAgaWYoIV8uaXNVbmRlZmluZWQoZm9ybWF0Lm9uQ2xpY2spICYmIF8uaXNGdW5jdGlvbihmb3JtYXQub25DbGljaykpIHtcbiAgICAgIGZvcm1hdC5vbkNsaWNrKCk7IC8vIERlbGVnYXRlXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENhbGwgZGVmYXVsdFxuICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoYnRuLmF0dHIoJ2RhdGEtY21kJyksIGZhbHNlLCBmb3JtYXQucGFyYW0pO1xuICAgIH1cblxuICAgIHRoaXMuaGlnaGxpZ2h0U2VsZWN0ZWRCdXR0b25zKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcm1hdEJhcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG5cbnZhciBGb3JtYXR0ZXIgPSBmdW5jdGlvbihvcHRpb25zKXtcbiAgdGhpcy5mb3JtYXRJZCA9IF8udW5pcXVlSWQoJ2Zvcm1hdC0nKTtcbiAgdGhpcy5fY29uZmlndXJlKG9wdGlvbnMgfHwge30pO1xuICB0aGlzLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbnZhciBmb3JtYXRPcHRpb25zID0gW1widGl0bGVcIiwgXCJjbGFzc05hbWVcIiwgXCJjbWRcIiwgXCJrZXlDb2RlXCIsIFwicGFyYW1cIiwgXCJvbkNsaWNrXCIsIFwidG9NYXJrZG93blwiLCBcInRvSFRNTFwiXTtcblxuT2JqZWN0LmFzc2lnbihGb3JtYXR0ZXIucHJvdG90eXBlLCB7XG5cbiAgdGl0bGU6ICcnLFxuICBjbGFzc05hbWU6ICcnLFxuICBjbWQ6IG51bGwsXG4gIGtleUNvZGU6IG51bGwsXG4gIHBhcmFtOiBudWxsLFxuXG4gIHRvTWFya2Rvd246IGZ1bmN0aW9uKG1hcmtkb3duKXsgcmV0dXJuIG1hcmtkb3duOyB9LFxuICB0b0hUTUw6IGZ1bmN0aW9uKGh0bWwpeyByZXR1cm4gaHRtbDsgfSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpe30sXG5cbiAgX2NvbmZpZ3VyZTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGlmICh0aGlzLm9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGZvcm1hdE9wdGlvbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgYXR0ciA9IGZvcm1hdE9wdGlvbnNbaV07XG4gICAgICBpZiAob3B0aW9uc1thdHRyXSkge1xuICAgICAgICB0aGlzW2F0dHJdID0gb3B0aW9uc1thdHRyXTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgfSxcblxuICBpc0FjdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5Q29tbWFuZFN0YXRlKHRoaXMuY21kKTtcbiAgfSxcblxuICBfYmluZFRvQmxvY2s6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgdmFyIGZvcm1hdHRlciA9IHRoaXMsXG4gICAgY3RybERvd24gPSBmYWxzZTtcblxuICAgIGJsb2NrXG4gICAgLm9uKCdrZXl1cCcsJy5zdC10ZXh0LWJsb2NrJywgZnVuY3Rpb24oZXYpIHtcbiAgICAgIGlmKGV2LndoaWNoID09PSAxNyB8fCBldi53aGljaCA9PT0gMjI0IHx8IGV2LndoaWNoID09PSA5MSkge1xuICAgICAgICBjdHJsRG93biA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pXG4gICAgLm9uKCdrZXlkb3duJywnLnN0LXRleHQtYmxvY2snLCB7IGZvcm1hdHRlcjogZm9ybWF0dGVyIH0sIGZ1bmN0aW9uKGV2KSB7XG4gICAgICBpZihldi53aGljaCA9PT0gMTcgfHwgZXYud2hpY2ggPT09IDIyNCB8fCBldi53aGljaCA9PT0gOTEpIHtcbiAgICAgICAgY3RybERvd24gPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZihldi53aGljaCA9PT0gZXYuZGF0YS5mb3JtYXR0ZXIua2V5Q29kZSAmJiBjdHJsRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICBkb2N1bWVudC5leGVjQ29tbWFuZChldi5kYXRhLmZvcm1hdHRlci5jbWQsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY3RybERvd24gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufSk7XG5cbi8vIEFsbG93IG91ciBGb3JtYXR0ZXJzIHRvIGJlIGV4dGVuZGVkLlxuRm9ybWF0dGVyLmV4dGVuZCA9IHJlcXVpcmUoJy4vaGVscGVycy9leHRlbmQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtYXR0ZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLyogT3VyIGJhc2UgZm9ybWF0dGVycyAqL1xuXG52YXIgRm9ybWF0dGVyID0gcmVxdWlyZSgnLi9mb3JtYXR0ZXInKTtcblxudmFyIEJvbGQgPSBGb3JtYXR0ZXIuZXh0ZW5kKHtcbiAgdGl0bGU6IFwiYm9sZFwiLFxuICBjbWQ6IFwiYm9sZFwiLFxuICBrZXlDb2RlOiA2NixcbiAgdGV4dCA6IFwiQlwiXG59KTtcblxudmFyIEl0YWxpYyA9IEZvcm1hdHRlci5leHRlbmQoe1xuICB0aXRsZTogXCJpdGFsaWNcIixcbiAgY21kOiBcIml0YWxpY1wiLFxuICBrZXlDb2RlOiA3MyxcbiAgdGV4dCA6IFwiaVwiXG59KTtcblxudmFyIExpbmsgPSBGb3JtYXR0ZXIuZXh0ZW5kKHtcblxuICB0aXRsZTogXCJsaW5rXCIsXG4gIGljb25OYW1lOiBcImxpbmtcIixcbiAgY21kOiBcIkNyZWF0ZUxpbmtcIixcbiAgdGV4dCA6IFwibGlua1wiLFxuXG4gIG9uQ2xpY2s6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGxpbmsgPSB3aW5kb3cucHJvbXB0KGkxOG4udChcImdlbmVyYWw6bGlua1wiKSksXG4gICAgbGlua19yZWdleCA9IC8oKGZ0cHxodHRwfGh0dHBzKTpcXC9cXC8uKXxtYWlsdG8oPz1cXDpbLVxcLlxcd10rQCkvO1xuXG4gICAgaWYobGluayAmJiBsaW5rLmxlbmd0aCA+IDApIHtcblxuICAgICAgaWYgKCFsaW5rX3JlZ2V4LnRlc3QobGluaykpIHtcbiAgICAgICAgbGluayA9IFwiaHR0cDovL1wiICsgbGluaztcbiAgICAgIH1cblxuICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQodGhpcy5jbWQsIGZhbHNlLCBsaW5rKTtcbiAgICB9XG4gIH0sXG5cbiAgaXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCksXG4gICAgbm9kZTtcblxuICAgIGlmIChzZWxlY3Rpb24ucmFuZ2VDb3VudCA+IDApIHtcbiAgICAgIG5vZGUgPSBzZWxlY3Rpb24uZ2V0UmFuZ2VBdCgwKVxuICAgICAgLnN0YXJ0Q29udGFpbmVyXG4gICAgICAucGFyZW50Tm9kZTtcbiAgICB9XG5cbiAgICByZXR1cm4gKG5vZGUgJiYgbm9kZS5ub2RlTmFtZSA9PT0gXCJBXCIpO1xuICB9XG59KTtcblxudmFyIFVuTGluayA9IEZvcm1hdHRlci5leHRlbmQoe1xuICB0aXRsZTogXCJ1bmxpbmtcIixcbiAgaWNvbk5hbWU6IFwibGlua1wiLFxuICBjbWQ6IFwidW5saW5rXCIsXG4gIHRleHQgOiBcImxpbmtcIlxufSk7XG5cblxuZXhwb3J0cy5Cb2xkID0gbmV3IEJvbGQoKTtcbmV4cG9ydHMuSXRhbGljID0gbmV3IEl0YWxpYygpO1xuZXhwb3J0cy5MaW5rID0gbmV3IExpbmsoKTtcbmV4cG9ydHMuVW5saW5rID0gbmV3IFVuTGluaygpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIEdlbmVyaWMgZnVuY3Rpb24gYmluZGluZyB1dGlsaXR5LCB1c2VkIGJ5IGxvdHMgb2Ygb3VyIGNsYXNzZXMgKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGJvdW5kOiBbXSxcbiAgX2JpbmRGdW5jdGlvbnM6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5ib3VuZC5mb3JFYWNoKGZ1bmN0aW9uKGYpIHtcbiAgICAgIHRoaXNbZl0gPSB0aGlzW2ZdLmJpbmQodGhpcyk7XG4gICAgfSwgdGhpcyk7XG4gIH1cbn07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICogRHJvcCBBcmVhIFBsdWdpbiBmcm9tIEBtYWNjbWFuXG4gKiBodHRwOi8vYmxvZy5hbGV4bWFjY2F3LmNvbS9zdmJ0bGUtaW1hZ2UtdXBsb2FkaW5nXG4gKiAtLVxuICogVHdlYWtlZCBzbyB3ZSB1c2UgdGhlIHBhcmVudCBjbGFzcyBvZiBkcm9wem9uZVxuICovXG5cblxuZnVuY3Rpb24gZHJhZ0VudGVyKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG5mdW5jdGlvbiBkcmFnT3ZlcihlKSB7XG4gIGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IFwiY29weVwiO1xuICAkKGUuY3VycmVudFRhcmdldCkuYWRkQ2xhc3MoJ3N0LWRyYWctb3ZlcicpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59XG5cbmZ1bmN0aW9uIGRyYWdMZWF2ZShlKSB7XG4gICQoZS5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcygnc3QtZHJhZy1vdmVyJyk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbn1cblxuJC5mbi5kcm9wQXJlYSA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuYmluZChcImRyYWdlbnRlclwiLCBkcmFnRW50ZXIpLlxuICAgIGJpbmQoXCJkcmFnb3ZlclwiLCAgZHJhZ092ZXIpLlxuICAgIGJpbmQoXCJkcmFnbGVhdmVcIiwgZHJhZ0xlYXZlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4kLmZuLm5vRHJvcEFyZWEgPSBmdW5jdGlvbigpe1xuICB0aGlzLnVuYmluZChcImRyYWdlbnRlclwiKS5cbiAgICB1bmJpbmQoXCJkcmFnb3ZlclwiKS5cbiAgICB1bmJpbmQoXCJkcmFnbGVhdmVcIik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuJC5mbi5jYXJldFRvRW5kID0gZnVuY3Rpb24oKXtcbiAgdmFyIHJhbmdlLHNlbGVjdGlvbjtcblxuICByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyh0aGlzWzBdKTtcbiAgcmFuZ2UuY29sbGFwc2UoZmFsc2UpO1xuXG4gIHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICBzZWxlY3Rpb24uYWRkUmFuZ2UocmFuZ2UpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIEJhY2tib25lIEluaGVyaXRlbmNlIFxuICAtLVxuICBGcm9tOiBodHRwczovL2dpdGh1Yi5jb20vZG9jdW1lbnRjbG91ZC9iYWNrYm9uZS9ibG9iL21hc3Rlci9iYWNrYm9uZS5qc1xuICBCYWNrYm9uZS5qcyAwLjkuMlxuICAoYykgMjAxMC0yMDEyIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBJbmMuXG4qL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gIHZhciBwYXJlbnQgPSB0aGlzO1xuICB2YXIgY2hpbGQ7XG5cbiAgLy8gVGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgbmV3IHN1YmNsYXNzIGlzIGVpdGhlciBkZWZpbmVkIGJ5IHlvdVxuICAvLyAodGhlIFwiY29uc3RydWN0b3JcIiBwcm9wZXJ0eSBpbiB5b3VyIGBleHRlbmRgIGRlZmluaXRpb24pLCBvciBkZWZhdWx0ZWRcbiAgLy8gYnkgdXMgdG8gc2ltcGx5IGNhbGwgdGhlIHBhcmVudCdzIGNvbnN0cnVjdG9yLlxuICBpZiAocHJvdG9Qcm9wcyAmJiBwcm90b1Byb3BzLmhhc093blByb3BlcnR5KCdjb25zdHJ1Y3RvcicpKSB7XG4gICAgY2hpbGQgPSBwcm90b1Byb3BzLmNvbnN0cnVjdG9yO1xuICB9IGVsc2Uge1xuICAgIGNoaWxkID0gZnVuY3Rpb24oKXsgcmV0dXJuIHBhcmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9O1xuICB9XG5cbiAgLy8gQWRkIHN0YXRpYyBwcm9wZXJ0aWVzIHRvIHRoZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiwgaWYgc3VwcGxpZWQuXG4gIE9iamVjdC5hc3NpZ24oY2hpbGQsIHBhcmVudCwgc3RhdGljUHJvcHMpO1xuXG4gIC8vIFNldCB0aGUgcHJvdG90eXBlIGNoYWluIHRvIGluaGVyaXQgZnJvbSBgcGFyZW50YCwgd2l0aG91dCBjYWxsaW5nXG4gIC8vIGBwYXJlbnRgJ3MgY29uc3RydWN0b3IgZnVuY3Rpb24uXG4gIHZhciBTdXJyb2dhdGUgPSBmdW5jdGlvbigpeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH07XG4gIFN1cnJvZ2F0ZS5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlO1xuICBjaGlsZC5wcm90b3R5cGUgPSBuZXcgU3Vycm9nYXRlOyAvLyBqc2hpbnQgaWdub3JlOmxpbmVcblxuICAvLyBBZGQgcHJvdG90eXBlIHByb3BlcnRpZXMgKGluc3RhbmNlIHByb3BlcnRpZXMpIHRvIHRoZSBzdWJjbGFzcyxcbiAgLy8gaWYgc3VwcGxpZWQuXG4gIGlmIChwcm90b1Byb3BzKSB7XG4gICAgT2JqZWN0LmFzc2lnbihjaGlsZC5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICB9XG5cbiAgLy8gU2V0IGEgY29udmVuaWVuY2UgcHJvcGVydHkgaW4gY2FzZSB0aGUgcGFyZW50J3MgcHJvdG90eXBlIGlzIG5lZWRlZFxuICAvLyBsYXRlci5cbiAgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTtcblxuICByZXR1cm4gY2hpbGQ7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcblxucmVxdWlyZSgnLi9oZWxwZXJzL2V2ZW50Jyk7IC8vIGV4dGVuZHMgalF1ZXJ5IGl0c2VsZlxucmVxdWlyZSgnLi92ZW5kb3IvYXJyYXktaW5jbHVkZXMnKTsgLy8gc2hpbXMgRVM3IEFycmF5LnByb3RvdHlwZS5pbmNsdWRlc1xuXG52YXIgU2lyVHJldm9yID0ge1xuXG4gIGNvbmZpZzogcmVxdWlyZSgnLi9jb25maWcnKSxcblxuICBsb2c6IHJlcXVpcmUoJy4vdXRpbHMnKS5sb2csXG4gIExvY2FsZXM6IHJlcXVpcmUoJy4vbG9jYWxlcycpLFxuXG4gIEV2ZW50QnVzOiByZXF1aXJlKCcuL2V2ZW50LWJ1cycpLFxuXG4gIEVkaXRvclN0b3JlOiByZXF1aXJlKCcuL2V4dGVuc2lvbnMvc2lyLXRyZXZvci5lZGl0b3Itc3RvcmUnKSxcbiAgU3VibWl0dGFibGU6IHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9zaXItdHJldm9yLnN1Ym1pdHRhYmxlJyksXG4gIEZpbGVVcGxvYWRlcjogcmVxdWlyZSgnLi9leHRlbnNpb25zL3Npci10cmV2b3IudXBsb2FkZXInKSxcblxuICBCbG9ja01peGluczogcmVxdWlyZSgnLi9ibG9ja19taXhpbnMnKSxcbiAgQmxvY2tQb3NpdGlvbmVyOiByZXF1aXJlKCcuL2Jsb2NrLnBvc2l0aW9uZXInKSxcbiAgQmxvY2tSZW9yZGVyOiByZXF1aXJlKCcuL2Jsb2NrLnJlb3JkZXInKSxcbiAgQmxvY2tEZWxldGlvbjogcmVxdWlyZSgnLi9ibG9jay5kZWxldGlvbicpLFxuICBCbG9ja1ZhbGlkYXRpb25zOiByZXF1aXJlKCcuL2Jsb2NrLnZhbGlkYXRpb25zJyksXG4gIEJsb2NrU3RvcmU6IHJlcXVpcmUoJy4vYmxvY2suc3RvcmUnKSxcblxuICBTaW1wbGVCbG9jazogcmVxdWlyZSgnLi9zaW1wbGUtYmxvY2snKSxcbiAgQmxvY2s6IHJlcXVpcmUoJy4vYmxvY2snKSxcbiAgRm9ybWF0dGVyOiByZXF1aXJlKCcuL2Zvcm1hdHRlcicpLFxuICBGb3JtYXR0ZXJzOiByZXF1aXJlKCcuL2Zvcm1hdHRlcnMnKSxcblxuICBCbG9ja3M6IHJlcXVpcmUoJy4vYmxvY2tzJyksXG5cbiAgQmxvY2tDb250cm9sOiByZXF1aXJlKCcuL2Jsb2NrLWNvbnRyb2wnKSxcbiAgQmxvY2tDb250cm9sczogcmVxdWlyZSgnLi9ibG9jay1jb250cm9scycpLFxuICBGbG9hdGluZ0Jsb2NrQ29udHJvbHM6IHJlcXVpcmUoJy4vZmxvYXRpbmctYmxvY2stY29udHJvbHMnKSxcblxuICBGb3JtYXRCYXI6IHJlcXVpcmUoJy4vZm9ybWF0LWJhcicpLFxuICBFZGl0b3I6IHJlcXVpcmUoJy4vZWRpdG9yJyksXG5cbiAgdG9NYXJrZG93bjogcmVxdWlyZSgnLi90by1tYXJrZG93bicpLFxuICB0b0hUTUw6IHJlcXVpcmUoJy4vdG8taHRtbCcpLFxuXG4gIHNldERlZmF1bHRzOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgT2JqZWN0LmFzc2lnbihTaXJUcmV2b3IuY29uZmlnLmRlZmF1bHRzLCBvcHRpb25zIHx8IHt9KTtcbiAgfSxcblxuICBnZXRJbnN0YW5jZTogZnVuY3Rpb24oaWRlbnRpZmllcikge1xuICAgIGlmIChfLmlzVW5kZWZpbmVkKGlkZW50aWZpZXIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25maWcuaW5zdGFuY2VzWzBdO1xuICAgIH1cblxuICAgIGlmIChfLmlzU3RyaW5nKGlkZW50aWZpZXIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25maWcuaW5zdGFuY2VzLmZpbmQoZnVuY3Rpb24oZWRpdG9yKSB7XG4gICAgICAgIHJldHVybiBlZGl0b3IuSUQgPT09IGlkZW50aWZpZXI7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jb25maWcuaW5zdGFuY2VzW2lkZW50aWZpZXJdO1xuICB9LFxuXG4gIHNldEJsb2NrT3B0aW9uczogZnVuY3Rpb24odHlwZSwgb3B0aW9ucykge1xuICAgIHZhciBibG9jayA9IFNpclRyZXZvci5CbG9ja3NbdHlwZV07XG5cbiAgICBpZiAoXy5pc1VuZGVmaW5lZChibG9jaykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKGJsb2NrLnByb3RvdHlwZSwgb3B0aW9ucyB8fCB7fSk7XG4gIH0sXG5cbiAgcnVuT25BbGxJbnN0YW5jZXM6IGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgIGlmIChTaXJUcmV2b3IuRWRpdG9yLnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eShtZXRob2QpKSB7XG4gICAgICB2YXIgbWV0aG9kQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKFNpclRyZXZvci5jb25maWcuaW5zdGFuY2VzLCBmdW5jdGlvbihpKSB7XG4gICAgICAgIGlbbWV0aG9kXS5hcHBseShudWxsLCBtZXRob2RBcmdzKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBTaXJUcmV2b3IubG9nKFwibWV0aG9kIGRvZXNuJ3QgZXhpc3RcIik7XG4gICAgfVxuICB9LFxuXG59O1xuXG5PYmplY3QuYXNzaWduKFNpclRyZXZvciwgcmVxdWlyZSgnLi9mb3JtLWV2ZW50cycpKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpclRyZXZvcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIExvY2FsZXMgPSB7XG4gIGVuOiB7XG4gICAgZ2VuZXJhbDoge1xuICAgICAgJ2RlbGV0ZSc6ICAgICAgICAgICAnRGVsZXRlPycsXG4gICAgICAnZHJvcCc6ICAgICAgICAgICAgICdEcmFnIF9fYmxvY2tfXyBoZXJlJyxcbiAgICAgICdwYXN0ZSc6ICAgICAgICAgICAgJ09yIHBhc3RlIFVSTCBoZXJlJyxcbiAgICAgICd1cGxvYWQnOiAgICAgICAgICAgJy4uLm9yIGNob29zZSBhIGZpbGUnLFxuICAgICAgJ2Nsb3NlJzogICAgICAgICAgICAnY2xvc2UnLFxuICAgICAgJ3Bvc2l0aW9uJzogICAgICAgICAnUG9zaXRpb24nLFxuICAgICAgJ3dhaXQnOiAgICAgICAgICAgICAnUGxlYXNlIHdhaXQuLi4nLFxuICAgICAgJ2xpbmsnOiAgICAgICAgICAgICAnRW50ZXIgYSBsaW5rJ1xuICAgIH0sXG4gICAgZXJyb3JzOiB7XG4gICAgICAndGl0bGUnOiBcIllvdSBoYXZlIHRoZSBmb2xsb3dpbmcgZXJyb3JzOlwiLFxuICAgICAgJ3ZhbGlkYXRpb25fZmFpbCc6IFwiX190eXBlX18gYmxvY2sgaXMgaW52YWxpZFwiLFxuICAgICAgJ2Jsb2NrX2VtcHR5JzogXCJfX25hbWVfXyBtdXN0IG5vdCBiZSBlbXB0eVwiLFxuICAgICAgJ3R5cGVfbWlzc2luZyc6IFwiWW91IG11c3QgaGF2ZSBhIGJsb2NrIG9mIHR5cGUgX190eXBlX19cIixcbiAgICAgICdyZXF1aXJlZF90eXBlX2VtcHR5JzogXCJBIHJlcXVpcmVkIGJsb2NrIHR5cGUgX190eXBlX18gaXMgZW1wdHlcIixcbiAgICAgICdsb2FkX2ZhaWwnOiBcIlRoZXJlIHdhcyBhIHByb2JsZW0gbG9hZGluZyB0aGUgY29udGVudHMgb2YgdGhlIGRvY3VtZW50XCJcbiAgICB9LFxuICAgIGJsb2Nrczoge1xuICAgICAgdGV4dDoge1xuICAgICAgICAndGl0bGUnOiBcIlRleHRcIlxuICAgICAgfSxcbiAgICAgIGxpc3Q6IHtcbiAgICAgICAgJ3RpdGxlJzogXCJMaXN0XCJcbiAgICAgIH0sXG4gICAgICBxdW90ZToge1xuICAgICAgICAndGl0bGUnOiBcIlF1b3RlXCIsXG4gICAgICAgICdjcmVkaXRfZmllbGQnOiBcIkNyZWRpdFwiXG4gICAgICB9LFxuICAgICAgaW1hZ2U6IHtcbiAgICAgICAgJ3RpdGxlJzogXCJJbWFnZVwiLFxuICAgICAgICAndXBsb2FkX2Vycm9yJzogXCJUaGVyZSB3YXMgYSBwcm9ibGVtIHdpdGggeW91ciB1cGxvYWRcIlxuICAgICAgfSxcbiAgICAgIHZpZGVvOiB7XG4gICAgICAgICd0aXRsZSc6IFwiVmlkZW9cIlxuICAgICAgfSxcbiAgICAgIHR3ZWV0OiB7XG4gICAgICAgICd0aXRsZSc6IFwiVHdlZXRcIixcbiAgICAgICAgJ2ZldGNoX2Vycm9yJzogXCJUaGVyZSB3YXMgYSBwcm9ibGVtIGZldGNoaW5nIHlvdXIgdHdlZXRcIlxuICAgICAgfSxcbiAgICAgIGVtYmVkbHk6IHtcbiAgICAgICAgJ3RpdGxlJzogXCJFbWJlZGx5XCIsXG4gICAgICAgICdmZXRjaF9lcnJvcic6IFwiVGhlcmUgd2FzIGEgcHJvYmxlbSBmZXRjaGluZyB5b3VyIGVtYmVkXCIsXG4gICAgICAgICdrZXlfbWlzc2luZyc6IFwiQW4gRW1iZWRseSBBUEkga2V5IG11c3QgYmUgcHJlc2VudFwiXG4gICAgICB9LFxuICAgICAgaGVhZGluZzoge1xuICAgICAgICAndGl0bGUnOiBcIkhlYWRpbmdcIlxuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuaWYgKHdpbmRvdy5pMThuID09PSB1bmRlZmluZWQgfHwgd2luZG93LmkxOG4uaW5pdCA9PT0gdW5kZWZpbmVkKSB7XG4gIC8vIE1pbmltYWwgaTE4biBzdHViIHRoYXQgb25seSByZWFkcyB0aGUgRW5nbGlzaCBzdHJpbmdzXG4gIHV0aWxzLmxvZyhcIlVzaW5nIGkxOG4gc3R1YlwiKTtcbiAgd2luZG93LmkxOG4gPSB7XG4gICAgdDogZnVuY3Rpb24oa2V5LCBvcHRpb25zKSB7XG4gICAgICB2YXIgcGFydHMgPSBrZXkuc3BsaXQoJzonKSwgc3RyLCBvYmosIHBhcnQsIGk7XG5cbiAgICAgIG9iaiA9IExvY2FsZXNbY29uZmlnLmxhbmd1YWdlXTtcblxuICAgICAgZm9yKGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcGFydCA9IHBhcnRzW2ldO1xuXG4gICAgICAgIGlmKCFfLmlzVW5kZWZpbmVkKG9ialtwYXJ0XSkpIHtcbiAgICAgICAgICBvYmogPSBvYmpbcGFydF07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3RyID0gb2JqO1xuXG4gICAgICBpZiAoIV8uaXNTdHJpbmcoc3RyKSkgeyByZXR1cm4gXCJcIjsgfVxuXG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ19fJykgPj0gMCkge1xuICAgICAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uKG9wdCkge1xuICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKCdfXycgKyBvcHQgKyAnX18nLCBvcHRpb25zW29wdF0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gIH07XG59IGVsc2Uge1xuICB1dGlscy5sb2coXCJVc2luZyBpMThuZXh0XCIpO1xuICAvLyBPbmx5IHVzZSBpMThuZXh0IHdoZW4gdGhlIGxpYnJhcnkgaGFzIGJlZW4gbG9hZGVkIGJ5IHRoZSB1c2VyLCBrZWVwc1xuICAvLyBkZXBlbmRlbmNpZXMgc2xpbVxuICBpMThuLmluaXQoeyByZXNTdG9yZTogTG9jYWxlcywgZmFsbGJhY2tMbmc6IGNvbmZpZy5sYW5ndWFnZSxcbiAgICAgICAgICAgIG5zOiB7IG5hbWVzcGFjZXM6IFsnZ2VuZXJhbCcsICdibG9ja3MnXSwgZGVmYXVsdE5zOiAnZ2VuZXJhbCcgfVxuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMb2NhbGVzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuaXNFbXB0eSA9IHJlcXVpcmUoJ2xvZGFzaC5pc2VtcHR5Jyk7XG5leHBvcnRzLmlzRnVuY3Rpb24gPSByZXF1aXJlKCdsb2Rhc2guaXNmdW5jdGlvbicpO1xuZXhwb3J0cy5pc09iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC5pc29iamVjdCcpO1xuZXhwb3J0cy5pc1N0cmluZyA9IHJlcXVpcmUoJ2xvZGFzaC5pc3N0cmluZycpO1xuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IHJlcXVpcmUoJ2xvZGFzaC5pc3VuZGVmaW5lZCcpO1xuZXhwb3J0cy5yZXN1bHQgPSByZXF1aXJlKCdsb2Rhc2gucmVzdWx0Jyk7XG5leHBvcnRzLnRlbXBsYXRlID0gcmVxdWlyZSgnbG9kYXNoLnRlbXBsYXRlJyk7XG5leHBvcnRzLnVuaXF1ZUlkID0gcmVxdWlyZSgnbG9kYXNoLnVuaXF1ZWlkJyk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdGFnTmFtZTogJ2RpdicsXG4gIGNsYXNzTmFtZTogJ3Npci10cmV2b3JfX3ZpZXcnLFxuICBhdHRyaWJ1dGVzOiB7fSxcblxuICAkOiBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgIHJldHVybiB0aGlzLiRlbC5maW5kKHNlbGVjdG9yKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghXy5pc1VuZGVmaW5lZCh0aGlzLnN0b3BMaXN0ZW5pbmcpKSB7IHRoaXMuc3RvcExpc3RlbmluZygpOyB9XG4gICAgdGhpcy4kZWwucmVtb3ZlKCk7XG4gIH0sXG5cbiAgX2Vuc3VyZUVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5lbCkge1xuICAgICAgdmFyIGF0dHJzID0gT2JqZWN0LmFzc2lnbih7fSwgXy5yZXN1bHQodGhpcywgJ2F0dHJpYnV0ZXMnKSksXG4gICAgICBodG1sO1xuICAgICAgaWYgKHRoaXMuaWQpIHsgYXR0cnMuaWQgPSB0aGlzLmlkOyB9XG4gICAgICBpZiAodGhpcy5jbGFzc05hbWUpIHsgYXR0cnNbJ2NsYXNzJ10gPSB0aGlzLmNsYXNzTmFtZTsgfVxuXG4gICAgICBpZiAoYXR0cnMuaHRtbCkge1xuICAgICAgICBodG1sID0gYXR0cnMuaHRtbDtcbiAgICAgICAgZGVsZXRlIGF0dHJzLmh0bWw7XG4gICAgICB9XG4gICAgICB2YXIgJGVsID0gJCgnPCcgKyB0aGlzLnRhZ05hbWUgKyAnPicpLmF0dHIoYXR0cnMpO1xuICAgICAgaWYgKGh0bWwpIHsgJGVsLmh0bWwoaHRtbCk7IH1cbiAgICAgIHRoaXMuX3NldEVsZW1lbnQoJGVsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0RWxlbWVudCh0aGlzLmVsKTtcbiAgICB9XG4gIH0sXG5cbiAgX3NldEVsZW1lbnQ6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICB0aGlzLiRlbCA9ICQoZWxlbWVudCk7XG4gICAgdGhpcy5lbCA9IHRoaXMuJGVsWzBdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgQmxvY2tSZW9yZGVyID0gcmVxdWlyZSgnLi9ibG9jay5yZW9yZGVyJyk7XG5cbnZhciBTaW1wbGVCbG9jayA9IGZ1bmN0aW9uKGRhdGEsIGluc3RhbmNlX2lkKSB7XG4gIHRoaXMuY3JlYXRlU3RvcmUoZGF0YSk7XG4gIHRoaXMuYmxvY2tJRCA9IF8udW5pcXVlSWQoJ3N0LWJsb2NrLScpO1xuICB0aGlzLmluc3RhbmNlSUQgPSBpbnN0YW5jZV9pZDtcblxuICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gIHRoaXMuX2JpbmRGdW5jdGlvbnMoKTtcblxuICB0aGlzLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oU2ltcGxlQmxvY2sucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9ldmVudHMnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHJlcXVpcmUoJy4vYmxvY2suc3RvcmUnKSwge1xuXG4gIGZvY3VzIDogZnVuY3Rpb24oKSB7fSxcblxuICB2YWxpZCA6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdHJ1ZTsgfSxcblxuICBjbGFzc05hbWU6ICdzdC1ibG9jaycsXG5cbiAgYmxvY2tfdGVtcGxhdGU6IF8udGVtcGxhdGUoXG4gICAgXCI8ZGl2IGNsYXNzPSdzdC1ibG9ja19faW5uZXInPjwlPSBlZGl0b3JfaHRtbCAlPjwvZGl2PlwiXG4gICksXG5cbiAgYXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdpZCc6IHRoaXMuYmxvY2tJRCxcbiAgICAgICdkYXRhLXR5cGUnOiB0aGlzLnR5cGUsXG4gICAgICAnZGF0YS1pbnN0YW5jZSc6IHRoaXMuaW5zdGFuY2VJRFxuICAgIH07XG4gIH0sXG5cbiAgdGl0bGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB1dGlscy50aXRsZWl6ZSh0aGlzLnR5cGUucmVwbGFjZSgvW1xcV19dL2csICcgJykpO1xuICB9LFxuXG4gIGJsb2NrQ1NTQ2xhc3M6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYmxvY2tDU1NDbGFzcyA9IHV0aWxzLnRvU2x1Zyh0aGlzLnR5cGUpO1xuICAgIHJldHVybiB0aGlzLmJsb2NrQ1NTQ2xhc3M7XG4gIH0sXG5cbiAgdHlwZTogJycsXG5cbiAgJ2NsYXNzJzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHV0aWxzLmNsYXNzaWZ5KHRoaXMudHlwZSk7XG4gIH0sXG5cbiAgZWRpdG9ySFRNTDogJycsXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7fSxcblxuICBvbkJsb2NrUmVuZGVyOiBmdW5jdGlvbigpe30sXG4gIGJlZm9yZUJsb2NrUmVuZGVyOiBmdW5jdGlvbigpe30sXG5cbiAgX3NldEJsb2NrSW5uZXIgOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZWRpdG9yX2h0bWwgPSBfLnJlc3VsdCh0aGlzLCAnZWRpdG9ySFRNTCcpO1xuXG4gICAgdGhpcy4kZWwuYXBwZW5kKFxuICAgICAgdGhpcy5ibG9ja190ZW1wbGF0ZSh7IGVkaXRvcl9odG1sOiBlZGl0b3JfaHRtbCB9KVxuICAgICk7XG5cbiAgICB0aGlzLiRpbm5lciA9IHRoaXMuJGVsLmZpbmQoJy5zdC1ibG9ja19faW5uZXInKTtcbiAgICB0aGlzLiRpbm5lci5iaW5kKCdjbGljayBtb3VzZW92ZXInLCBmdW5jdGlvbihlKXsgZS5zdG9wUHJvcGFnYXRpb24oKTsgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmJlZm9yZUJsb2NrUmVuZGVyKCk7XG5cbiAgICB0aGlzLl9zZXRCbG9ja0lubmVyKCk7XG4gICAgdGhpcy5fYmxvY2tQcmVwYXJlKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBfYmxvY2tQcmVwYXJlIDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5faW5pdFVJKCk7XG4gICAgdGhpcy5faW5pdE1lc3NhZ2VzKCk7XG5cbiAgICB0aGlzLmNoZWNrQW5kTG9hZERhdGEoKTtcblxuICAgIHRoaXMuJGVsLmFkZENsYXNzKCdzdC1pdGVtLXJlYWR5Jyk7XG4gICAgdGhpcy5vbihcIm9uUmVuZGVyXCIsIHRoaXMub25CbG9ja1JlbmRlcik7XG4gICAgdGhpcy5zYXZlKCk7XG4gIH0sXG5cbiAgX3dpdGhVSUNvbXBvbmVudDogZnVuY3Rpb24oY29tcG9uZW50LCBjbGFzc05hbWUsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy4kdWkuYXBwZW5kKGNvbXBvbmVudC5yZW5kZXIoKS4kZWwpO1xuICAgIGlmIChjbGFzc05hbWUgJiYgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuJHVpLm9uKCdjbGljaycsIGNsYXNzTmFtZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgfSxcblxuICBfaW5pdFVJIDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHVpX2VsZW1lbnQgPSAkKFwiPGRpdj5cIiwgeyAnY2xhc3MnOiAnc3QtYmxvY2tfX3VpJyB9KTtcbiAgICB0aGlzLiRpbm5lci5hcHBlbmQodWlfZWxlbWVudCk7XG4gICAgdGhpcy4kdWkgPSB1aV9lbGVtZW50O1xuICAgIHRoaXMuX2luaXRVSUNvbXBvbmVudHMoKTtcbiAgfSxcblxuICBfaW5pdE1lc3NhZ2VzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbXNnc19lbGVtZW50ID0gJChcIjxkaXY+XCIsIHsgJ2NsYXNzJzogJ3N0LWJsb2NrX19tZXNzYWdlcycgfSk7XG4gICAgdGhpcy4kaW5uZXIucHJlcGVuZChtc2dzX2VsZW1lbnQpO1xuICAgIHRoaXMuJG1lc3NhZ2VzID0gbXNnc19lbGVtZW50O1xuICB9LFxuXG4gIGFkZE1lc3NhZ2U6IGZ1bmN0aW9uKG1zZywgYWRkaXRpb25hbENsYXNzKSB7XG4gICAgdmFyICRtc2cgPSAkKFwiPHNwYW4+XCIsIHsgaHRtbDogbXNnLCAnY2xhc3MnOiBcInN0LW1zZyBcIiArIGFkZGl0aW9uYWxDbGFzcyB9KTtcbiAgICB0aGlzLiRtZXNzYWdlcy5hcHBlbmQoJG1zZylcbiAgICAuYWRkQ2xhc3MoJ3N0LWJsb2NrX19tZXNzYWdlcy0taXMtdmlzaWJsZScpO1xuICAgIHJldHVybiAkbXNnO1xuICB9LFxuXG4gIHJlc2V0TWVzc2FnZXM6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJG1lc3NhZ2VzLmh0bWwoJycpXG4gICAgLnJlbW92ZUNsYXNzKCdzdC1ibG9ja19fbWVzc2FnZXMtLWlzLXZpc2libGUnKTtcbiAgfSxcblxuICBfaW5pdFVJQ29tcG9uZW50czogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fd2l0aFVJQ29tcG9uZW50KG5ldyBCbG9ja1Jlb3JkZXIodGhpcy4kZWwpKTtcbiAgfVxuXG59KTtcblxuU2ltcGxlQmxvY2suZm4gPSBTaW1wbGVCbG9jay5wcm90b3R5cGU7XG5cbi8vIEFsbG93IG91ciBCbG9jayB0byBiZSBleHRlbmRlZC5cblNpbXBsZUJsb2NrLmV4dGVuZCA9IHJlcXVpcmUoJy4vaGVscGVycy9leHRlbmQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVCbG9jaztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obWFya2Rvd24sIHR5cGUpIHtcblxuICAvLyBEZWZlcnJpbmcgcmVxdWlyaW5nIHRoZXNlIHRvIHNpZGVzdGVwIGEgY2lyY3VsYXIgZGVwZW5kZW5jeTpcbiAgLy8gQmxvY2sgLT4gdGhpcyAtPiBCbG9ja3MgLT4gQmxvY2tcbiAgdmFyIEJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG4gIHZhciBGb3JtYXR0ZXJzID0gcmVxdWlyZSgnLi9mb3JtYXR0ZXJzJyk7XG5cbiAgLy8gTUQgLT4gSFRNTFxuICB0eXBlID0gdXRpbHMuY2xhc3NpZnkodHlwZSk7XG5cbiAgdmFyIGh0bWwgPSBtYXJrZG93bixcbiAgICAgIHNob3VsZFdyYXAgPSB0eXBlID09PSBcIlRleHRcIjtcblxuICBpZihfLmlzVW5kZWZpbmVkKHNob3VsZFdyYXApKSB7IHNob3VsZFdyYXAgPSBmYWxzZTsgfVxuXG4gIGlmIChzaG91bGRXcmFwKSB7XG4gICAgaHRtbCA9IFwiPGRpdj5cIiArIGh0bWw7XG4gIH1cblxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXFsoW15cXF1dKylcXF1cXCgoW15cXCldKylcXCkvZ20sZnVuY3Rpb24obWF0Y2gsIHAxLCBwMil7XG4gICAgcmV0dXJuIFwiPGEgaHJlZj0nXCIrcDIrXCInPlwiK3AxLnJlcGxhY2UoL1xccj9cXG4vZywgJycpK1wiPC9hPlwiO1xuICB9KTtcblxuICAvLyBUaGlzIG1heSBzZWVtIGNyYXp5LCBidXQgYmVjYXVzZSBKUyBkb2Vzbid0IGhhdmUgYSBsb29rIGJlaGluZCxcbiAgLy8gd2UgcmV2ZXJzZSB0aGUgc3RyaW5nIHRvIHJlZ2V4IG91dCB0aGUgaXRhbGljIGl0ZW1zIChhbmQgYm9sZClcbiAgLy8gYW5kIGxvb2sgZm9yIHNvbWV0aGluZyB0aGF0IGRvZXNuJ3Qgc3RhcnQgKG9yIGVuZCBpbiB0aGUgcmV2ZXJzZWQgc3RyaW5ncyBjYXNlKVxuICAvLyB3aXRoIGEgc2xhc2guXG4gIGh0bWwgPSB1dGlscy5yZXZlcnNlKFxuICAgICAgICAgICB1dGlscy5yZXZlcnNlKGh0bWwpXG4gICAgICAgICAgIC5yZXBsYWNlKC9fKD8hXFxcXCkoKF9cXFxcfFteX10pKilfKD89JHxbXlxcXFxdKS9nbSwgZnVuY3Rpb24obWF0Y2gsIHAxKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIj5pLzxcIisgcDEucmVwbGFjZSgvXFxyP1xcbi9nLCAnJykucmVwbGFjZSgvW1xcc10rJC8sJycpICtcIj5pPFwiO1xuICAgICAgICAgICB9KVxuICAgICAgICAgICAucmVwbGFjZSgvXFwqXFwqKD8hXFxcXCkoKFxcKlxcKlxcXFx8W15cXCpcXCpdKSopXFwqXFwqKD89JHxbXlxcXFxdKS9nbSwgZnVuY3Rpb24obWF0Y2gsIHAxKXtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiPmIvPFwiKyBwMS5yZXBsYWNlKC9cXHI/XFxuL2csICcnKS5yZXBsYWNlKC9bXFxzXSskLywnJykgK1wiPmI8XCI7XG4gICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcblxuICBodG1sID0gIGh0bWwucmVwbGFjZSgvXlxcPiAoLispJC9tZyxcIiQxXCIpO1xuXG4gIC8vIFVzZSBjdXN0b20gZm9ybWF0dGVycyB0b0hUTUwgZnVuY3Rpb25zIChpZiBhbnkgZXhpc3QpXG4gIHZhciBmb3JtYXROYW1lLCBmb3JtYXQ7XG4gIGZvcihmb3JtYXROYW1lIGluIEZvcm1hdHRlcnMpIHtcbiAgICBpZiAoRm9ybWF0dGVycy5oYXNPd25Qcm9wZXJ0eShmb3JtYXROYW1lKSkge1xuICAgICAgZm9ybWF0ID0gRm9ybWF0dGVyc1tmb3JtYXROYW1lXTtcbiAgICAgIC8vIERvIHdlIGhhdmUgYSB0b0hUTUwgZnVuY3Rpb24/XG4gICAgICBpZiAoIV8uaXNVbmRlZmluZWQoZm9ybWF0LnRvSFRNTCkgJiYgXy5pc0Z1bmN0aW9uKGZvcm1hdC50b0hUTUwpKSB7XG4gICAgICAgIGh0bWwgPSBmb3JtYXQudG9IVE1MKGh0bWwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFVzZSBjdXN0b20gYmxvY2sgdG9IVE1MIGZ1bmN0aW9ucyAoaWYgYW55IGV4aXN0KVxuICB2YXIgYmxvY2s7XG4gIGlmIChCbG9ja3MuaGFzT3duUHJvcGVydHkodHlwZSkpIHtcbiAgICBibG9jayA9IEJsb2Nrc1t0eXBlXTtcbiAgICAvLyBEbyB3ZSBoYXZlIGEgdG9IVE1MIGZ1bmN0aW9uP1xuICAgIGlmICghXy5pc1VuZGVmaW5lZChibG9jay5wcm90b3R5cGUudG9IVE1MKSAmJiBfLmlzRnVuY3Rpb24oYmxvY2sucHJvdG90eXBlLnRvSFRNTCkpIHtcbiAgICAgIGh0bWwgPSBibG9jay5wcm90b3R5cGUudG9IVE1MKGh0bWwpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzaG91bGRXcmFwKSB7XG4gICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXFxyP1xcblxccj9cXG4vZ20sIFwiPC9kaXY+PGRpdj48YnI+PC9kaXY+PGRpdj5cIik7XG4gICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXFxyP1xcbi9nbSwgXCI8L2Rpdj48ZGl2PlwiKTtcbiAgfVxuXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcdC9nLCBcIiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1wiKVxuICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHI/XFxuL2csIFwiPGJyPlwiKVxuICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCpcXCovLCBcIlwiKVxuICAgICAgICAgICAgIC5yZXBsYWNlKC9fXy8sIFwiXCIpOyAgLy8gQ2xlYW51cCBhbnkgbWFya2Rvd24gY2hhcmFjdGVycyBsZWZ0XG5cbiAgLy8gUmVwbGFjZSBlc2NhcGVkXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcXFxcXCovZywgXCIqXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXFsvZywgXCJbXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXF0vZywgXCJdXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXF8vZywgXCJfXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXCgvZywgXCIoXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXCkvZywgXCIpXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXC0vZywgXCItXCIpO1xuXG4gIGlmIChzaG91bGRXcmFwKSB7XG4gICAgaHRtbCArPSBcIjwvZGl2PlwiO1xuICB9XG5cbiAgcmV0dXJuIGh0bWw7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNvbnRlbnQsIHR5cGUpIHtcblxuICAvLyBEZWZlcnJpbmcgcmVxdWlyaW5nIHRoZXNlIHRvIHNpZGVzdGVwIGEgY2lyY3VsYXIgZGVwZW5kZW5jeTpcbiAgLy8gQmxvY2sgLT4gdGhpcyAtPiBCbG9ja3MgLT4gQmxvY2tcbiAgdmFyIEJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG4gIHZhciBGb3JtYXR0ZXJzID0gcmVxdWlyZSgnLi9mb3JtYXR0ZXJzJyk7XG5cbiAgdHlwZSA9IHV0aWxzLmNsYXNzaWZ5KHR5cGUpO1xuXG4gIHZhciBtYXJrZG93biA9IGNvbnRlbnQ7XG5cbiAgLy9Ob3JtYWxpc2Ugd2hpdGVzcGFjZVxuICBtYXJrZG93biA9IG1hcmtkb3duLnJlcGxhY2UoLyZuYnNwOy9nLFwiIFwiKTtcblxuICAvLyBGaXJzdCBvZiBhbGwsIHN0cmlwIGFueSBhZGRpdGlvbmFsIGZvcm1hdHRpbmdcbiAgLy8gTVNXb3JkLCBJJ20gbG9va2luZyBhdCB5b3UsIHB1bmsuXG4gIG1hcmtkb3duID0gbWFya2Rvd24ucmVwbGFjZSgvKCBjbGFzcz0oXCIpP01zb1thLXpBLVpdKyhcIik/KS9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88IS0tKC4qPyktLT4vZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwvXFwqKC4qPylcXCpcXC8vZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPChcXC8pKihtZXRhfGxpbmt8c3BhbnxcXFxcP3htbDp8c3QxOnxvOnxmb250KSguKj8pPi9naSwgJycpO1xuXG4gIHZhciBiYWRUYWdzID0gWydzdHlsZScsICdzY3JpcHQnLCAnYXBwbGV0JywgJ2VtYmVkJywgJ25vZnJhbWVzJywgJ25vc2NyaXB0J10sXG4gICAgICB0YWdTdHJpcHBlciwgaTtcblxuICBmb3IgKGkgPSAwOyBpPCBiYWRUYWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGFnU3RyaXBwZXIgPSBuZXcgUmVnRXhwKCc8JytiYWRUYWdzW2ldKycuKj8nK2JhZFRhZ3NbaV0rJyguKj8pPicsICdnaScpO1xuICAgIG1hcmtkb3duID0gbWFya2Rvd24ucmVwbGFjZSh0YWdTdHJpcHBlciwgJycpO1xuICB9XG5cbiAgLy8gRXNjYXBlIGFueXRoaW5nIGluIGhlcmUgdGhhdCAqY291bGQqIGJlIGNvbnNpZGVyZWQgYXMgTURcbiAgLy8gTWFya2Rvd24gY2hhcnMgd2UgY2FyZSBhYm91dDogKiBbXSBfICgpIC1cbiAgbWFya2Rvd24gPSBtYXJrZG93bi5yZXBsYWNlKC9cXCovZywgXCJcXFxcKlwiKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxbL2csIFwiXFxcXFtcIilcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXS9nLCBcIlxcXFxdXCIpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXF8vZywgXCJcXFxcX1wiKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwoL2csIFwiXFxcXChcIilcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcKS9nLCBcIlxcXFwpXCIpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXC0vZywgXCJcXFxcLVwiKTtcblxuICB2YXIgaW5saW5lVGFncyA9IFtcImVtXCIsIFwiaVwiLCBcInN0cm9uZ1wiLCBcImJcIl07XG5cbiAgZm9yIChpID0gMDsgaTwgaW5saW5lVGFncy5sZW5ndGg7IGkrKykge1xuICAgIHRhZ1N0cmlwcGVyID0gbmV3IFJlZ0V4cCgnPCcraW5saW5lVGFnc1tpXSsnPjxicj48LycraW5saW5lVGFnc1tpXSsnPicsICdnaScpO1xuICAgIG1hcmtkb3duID0gbWFya2Rvd24ucmVwbGFjZSh0YWdTdHJpcHBlciwgJzxicj4nKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlcGxhY2VCb2xkcyhtYXRjaCwgcDEsIHAyKXtcbiAgICBpZihfLmlzVW5kZWZpbmVkKHAyKSkgeyBwMiA9ICcnOyB9XG4gICAgcmV0dXJuIFwiKipcIiArIHAxLnJlcGxhY2UoLzwoLik/YnIoLik/Pi9nLCAnJykgKyBcIioqXCIgKyBwMjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlcGxhY2VJdGFsaWNzKG1hdGNoLCBwMSwgcDIpe1xuICAgIGlmKF8uaXNVbmRlZmluZWQocDIpKSB7IHAyID0gJyc7IH1cbiAgICByZXR1cm4gXCJfXCIgKyBwMS5yZXBsYWNlKC88KC4pP2JyKC4pPz4vZywgJycpICsgXCJfXCIgKyBwMjtcbiAgfVxuXG4gIG1hcmtkb3duID0gbWFya2Rvd24ucmVwbGFjZSgvPChcXHcrKSg/OlxccytcXHcrPVwiW15cIl0rKD86XCJcXCRbXlwiXStcIlteXCJdKyk/XCIpKj5cXHMqPFxcL1xcMT4vZ2ltLCAnJykgLy9FbXB0eSBlbGVtZW50c1xuICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4vbWcsXCJcIilcbiAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPGEuKj9ocmVmPVtcIlwiJ10oLio/KVtcIlwiJ10uKj8+KC4qPyk8XFwvYT4vZ2ltLCBmdW5jdGlvbihtYXRjaCwgcDEsIHAyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcIltcIiArIHAyLnRyaW0oKS5yZXBsYWNlKC88KC4pP2JyKC4pPz4vZywgJycpICsgXCJdKFwiKyBwMSArXCIpXCI7XG4gICAgICAgICAgICAgICAgICAgICAgfSkgLy8gSHlwZXJsaW5rc1xuICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88c3Ryb25nPig/OlxccyopKC4qPykoXFxzKSo/PFxcL3N0cm9uZz4vZ2ltLCByZXBsYWNlQm9sZHMpXG4gICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzxiPig/OlxccyopKC4qPykoXFxzKik/PFxcL2I+L2dpbSwgcmVwbGFjZUJvbGRzKVxuICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88ZW0+KD86XFxzKikoLio/KShcXHMqKT88XFwvZW0+L2dpbSwgcmVwbGFjZUl0YWxpY3MpXG4gICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzxpPig/OlxccyopKC4qPykoXFxzKik/PFxcL2k+L2dpbSwgcmVwbGFjZUl0YWxpY3MpO1xuXG5cbiAgLy8gVXNlIGN1c3RvbSBmb3JtYXR0ZXJzIHRvTWFya2Rvd24gZnVuY3Rpb25zIChpZiBhbnkgZXhpc3QpXG4gIHZhciBmb3JtYXROYW1lLCBmb3JtYXQ7XG4gIGZvcihmb3JtYXROYW1lIGluIEZvcm1hdHRlcnMpIHtcbiAgICBpZiAoRm9ybWF0dGVycy5oYXNPd25Qcm9wZXJ0eShmb3JtYXROYW1lKSkge1xuICAgICAgZm9ybWF0ID0gRm9ybWF0dGVyc1tmb3JtYXROYW1lXTtcbiAgICAgIC8vIERvIHdlIGhhdmUgYSB0b01hcmtkb3duIGZ1bmN0aW9uP1xuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGZvcm1hdC50b01hcmtkb3duKSAmJiBfLmlzRnVuY3Rpb24oZm9ybWF0LnRvTWFya2Rvd24pKSB7XG4gICAgICAgIG1hcmtkb3duID0gZm9ybWF0LnRvTWFya2Rvd24obWFya2Rvd24pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIERvIG91ciBnZW5lcmljIHN0cmlwcGluZyBvdXRcbiAgbWFya2Rvd24gPSBtYXJrZG93bi5yZXBsYWNlKC8oW148Pl0rKSg8ZGl2PikvZyxcIiQxXFxuJDJcIikgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEaXZpdGlzIHN0eWxlIGxpbmUgYnJlYWtzIChoYW5kbGUgdGhlIGZpcnN0IGxpbmUpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88ZGl2PjxkaXY+L2csJ1xcbjxkaXY+JykgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIF4gKGRvdWJsZSBvcGVuaW5nIGRpdnMgd2l0aCBvbmUgY2xvc2UgZnJvbSBDaHJvbWUpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oPzo8ZGl2PikoW148Pl0rKSg/OjxkaXY+KS9nLFwiJDFcXG5cIikgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gXiAoaGFuZGxlIG5lc3RlZCBkaXZzIHRoYXQgc3RhcnQgd2l0aCBjb250ZW50KVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKD86PGRpdj4pKD86PGJyPik/KFtePD5dKykoPzo8YnI+KT8oPzo8XFwvZGl2PikvZyxcIiQxXFxuXCIpICAgICAgICAvLyBeIChoYW5kbGUgY29udGVudCBpbnNpZGUgZGl2cylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzxcXC9wPi9nLFwiXFxuXFxuXCIpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQIHRhZ3MgYXMgbGluZSBicmVha3NcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzwoLik/YnIoLik/Pi9nLFwiXFxuXCIpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IG5vcm1hbCBsaW5lIGJyZWFrc1xuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJmx0Oy9nLFwiPFwiKS5yZXBsYWNlKC8mZ3Q7L2csXCI+XCIpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVuY29kaW5nXG5cbiAgLy8gVXNlIGN1c3RvbSBibG9jayB0b01hcmtkb3duIGZ1bmN0aW9ucyAoaWYgYW55IGV4aXN0KVxuICB2YXIgYmxvY2s7XG4gIGlmIChCbG9ja3MuaGFzT3duUHJvcGVydHkodHlwZSkpIHtcbiAgICBibG9jayA9IEJsb2Nrc1t0eXBlXTtcbiAgICAvLyBEbyB3ZSBoYXZlIGEgdG9NYXJrZG93biBmdW5jdGlvbj9cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoYmxvY2sucHJvdG90eXBlLnRvTWFya2Rvd24pICYmIF8uaXNGdW5jdGlvbihibG9jay5wcm90b3R5cGUudG9NYXJrZG93bikpIHtcbiAgICAgIG1hcmtkb3duID0gYmxvY2sucHJvdG90eXBlLnRvTWFya2Rvd24obWFya2Rvd24pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFN0cmlwIHJlbWFpbmluZyBIVE1MXG4gIGlmIChjb25maWcuZGVmYXVsdHMudG9NYXJrZG93bi5hZ2dyZXNpdmVIVE1MU3RyaXApIHtcbiAgICBtYXJrZG93biA9IG1hcmtkb3duLnJlcGxhY2UoLzxcXC8/W14+XSsoPnwkKS9nLCBcIlwiKTtcbiAgfSBlbHNlIHtcbiAgICBtYXJrZG93biA9IG1hcmtkb3duLnJlcGxhY2UoLzwoPz1cXFMpXFwvP1tePl0rKD58JCkvaWcsIFwiXCIpO1xuICB9XG5cbiAgcmV0dXJuIG1hcmtkb3duO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcblxudmFyIHVybFJlZ2V4ID0gL14oPzooW0EtWmEtel0rKTopPyhcXC97MCwzfSkoWzAtOS5cXC1BLVphLXpdKykoPzo6KFxcZCspKT8oPzpcXC8oW14/I10qKSk/KD86XFw/KFteI10qKSk/KD86IyguKikpPyQvO1xuXG52YXIgdXRpbHMgPSB7XG4gIGxvZzogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGNvbnNvbGUpICYmIGNvbmZpZy5kZWJ1Zykge1xuICAgICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgICB9XG4gIH0sXG5cbiAgaXNVUkkgOiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICByZXR1cm4gKHVybFJlZ2V4LnRlc3Qoc3RyaW5nKSk7XG4gIH0sXG5cbiAgdGl0bGVpemU6IGZ1bmN0aW9uKHN0cil7XG4gICAgaWYgKHN0ciA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBzdHIgID0gU3RyaW5nKHN0cikudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyg/Ol58XFxzfC0pXFxTL2csIGZ1bmN0aW9uKGMpeyByZXR1cm4gYy50b1VwcGVyQ2FzZSgpOyB9KTtcbiAgfSxcblxuICBjbGFzc2lmeTogZnVuY3Rpb24oc3RyKXtcbiAgICByZXR1cm4gdXRpbHMudGl0bGVpemUoU3RyaW5nKHN0cikucmVwbGFjZSgvW1xcV19dL2csICcgJykpLnJlcGxhY2UoL1xccy9nLCAnJyk7XG4gIH0sXG5cbiAgY2FwaXRhbGl6ZSA6IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc3Vic3RyaW5nKDEpLnRvTG93ZXJDYXNlKCk7XG4gIH0sXG5cbiAgdW5kZXJzY29yZWQ6IGZ1bmN0aW9uKHN0cil7XG4gICAgcmV0dXJuIHN0ci50cmltKCkucmVwbGFjZSgvKFthLXpcXGRdKShbQS1aXSspL2csICckMV8kMicpXG4gICAgLnJlcGxhY2UoL1stXFxzXSsvZywgJ18nKS50b0xvd2VyQ2FzZSgpO1xuICB9LFxuXG4gIHJldmVyc2U6IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBzdHIuc3BsaXQoXCJcIikucmV2ZXJzZSgpLmpvaW4oXCJcIik7XG4gIH0sXG5cbiAgdG9TbHVnOiBmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gc3RyXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAucmVwbGFjZSgvW15cXHcgXSsvZywnJylcbiAgICAucmVwbGFjZSgvICsvZywnLScpO1xuICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbHM7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLy8ganNoaW50IGZyZWV6ZTogZmFsc2VcblxuaWYgKCFbXS5pbmNsdWRlcykge1xuICBBcnJheS5wcm90b3R5cGUuaW5jbHVkZXMgPSBmdW5jdGlvbihzZWFyY2hFbGVtZW50IC8qLCBmcm9tSW5kZXgqLyApIHtcbiAgICBpZiAodGhpcyA9PT0gdW5kZWZpbmVkIHx8IHRoaXMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IHRoaXMgdmFsdWUgdG8gb2JqZWN0Jyk7XG4gICAgfVxuICAgIHZhciBPID0gT2JqZWN0KHRoaXMpO1xuICAgIHZhciBsZW4gPSBwYXJzZUludChPLmxlbmd0aCkgfHwgMDtcbiAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBuID0gcGFyc2VJbnQoYXJndW1lbnRzWzFdKSB8fCAwO1xuICAgIHZhciBrO1xuICAgIGlmIChuID49IDApIHtcbiAgICAgIGsgPSBuO1xuICAgIH0gZWxzZSB7XG4gICAgICBrID0gbGVuICsgbjtcbiAgICAgIGlmIChrIDwgMCkge1xuICAgICAgICBrID0gMDtcbiAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUgKGsgPCBsZW4pIHtcbiAgICAgIHZhciBjdXJyZW50RWxlbWVudCA9IE9ba107XG4gICAgICBpZiAoc2VhcmNoRWxlbWVudCA9PT0gY3VycmVudEVsZW1lbnQgfHxcbiAgICAgICAgIChzZWFyY2hFbGVtZW50ICE9PSBzZWFyY2hFbGVtZW50ICYmIGN1cnJlbnRFbGVtZW50ICE9PSBjdXJyZW50RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBrKys7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbn1cbiJdfQ==
