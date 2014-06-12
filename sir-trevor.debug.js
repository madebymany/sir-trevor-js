/*!
 * Sir Trevor JS v0.4.0
 *
 * Released under the MIT license
 * www.opensource.org/licenses/MIT
 *
 * 2014-12-03
 */


!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.SirTrevor=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./src/');

},{"./src/":91}],2:[function(require,module,exports){
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

var BlockControl = function(type) {
  this.type = type;
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

},{"./blocks":69,"./events":79,"./function-bind":88,"./lodash":93,"./renderable":95}],52:[function(require,module,exports){
"use strict";

/*
 * SirTrevor Block Controls
 * --
 * Gives an interface for adding new Sir Trevor blocks.
 */

var _ = require('./lodash');

var Blocks = require('./blocks');
var BlockControl = require('./block-control');
var EventBus = require('./event-bus');

var BlockControls = function(available_types, mediator) {
  this.available_types = available_types || [];
  this.mediator = mediator;

  this._ensureElement();
  this._bindFunctions();
  this._bindMediatedEvents();

  this.initialize();
};

Object.assign(BlockControls.prototype, require('./function-bind'), require('./mediated-events'), require('./renderable'), require('./events'), {

  bound: ['handleControlButtonClick'],
  block_controls: null,

  className: "st-block-controls",
  eventNamespace: 'block-controls',

  mediatedEvents: {
    'render': 'renderInContainer',
    'show': 'show',
    'hide': 'hide'
  },

  initialize: function() {
    for(var block_type in this.available_types) {
      if (Blocks.hasOwnProperty(block_type)) {
        var block_control = new BlockControl(block_type);
        if (block_control.can_be_rendered) {
          this.$el.append(block_control.render().$el);
        }
      }
    }

    this.$el.delegate('.st-block-control', 'click', this.handleControlButtonClick);
    this.mediator.on('block-controls:show', this.renderInContainer);
  },

  show: function() {
    this.$el.addClass('st-block-controls--active');

    EventBus.trigger('block:controls:shown');
  },

  hide: function() {
    this.removeCurrentContainer();
    this.$el.removeClass('st-block-controls--active');

    EventBus.trigger('block:controls:hidden');
  },

  handleControlButtonClick: function(e) {
    e.stopPropagation();

    this.mediator.trigger('block:create', $(e.currentTarget).attr('data-type'));
  },

  renderInContainer: function(container) {
    this.removeCurrentContainer();

    container.append(this.$el.detach());
    container.addClass('with-st-controls');

    this.currentContainer = container;
    this.show();
  },

  removeCurrentContainer: function() {
    if (!_.isUndefined(this.currentContainer)) {
      this.currentContainer.removeClass("with-st-controls");
      this.currentContainer = undefined;
    }
  }
});

module.exports = BlockControls;

},{"./block-control":51,"./blocks":69,"./event-bus":78,"./events":79,"./function-bind":88,"./lodash":93,"./mediated-events":94,"./renderable":95}],53:[function(require,module,exports){
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

},{"./function-bind":88,"./renderable":95}],54:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var utils = require('./utils');
var config = require('./config');

var EventBus = require('./event-bus');
var Blocks = require('./blocks');

var BlockManager = function(options, editorInstance, mediator) {
  this.options = options;
  this.instance_scope = editorInstance;
  this.mediator = mediator;

  this.blocks = [];
  this.blockCounts = {};
  this.blockTypes = {};

  this._setBlocksTypes();
  this._setRequired();
  this._bindMediatedEvents();

  this.initialize();
};

Object.assign(BlockManager.prototype, require('./function-bind'), require('./mediated-events'), require('./events'), {

  eventNamespace: 'block',

  mediatedEvents: {
    'create': 'createBlock',
    'remove': 'removeBlock',
    'rerender': 'rerenderBlock'
  },

  initialize: function() {},

  createBlock: function(type, data) {
    type = utils.classify(type);

    // Run validations
    if (!this.canCreateBlock(type)) { return; }

    var block = new Blocks[type](data, this.instance_scope, this.mediator);
    this.blocks.push(block);

    this._incrementBlockTypeCount(type);
    this.mediator.trigger('block:render', block);

    this.triggerBlockCountUpdate();
    this.mediator.trigger('block:limitReached', this.blockLimitReached());

    utils.log("Block created of type " + type);
  },

  removeBlock: function(blockID) {
    var block = this.findBlockById(blockID),
    type = utils.classify(block.type);

    this.mediator.trigger('block-controls:reset');
    this.blocks = this.blocks.filter(function(item) {
      return (item.blockID !== block.blockID);
    });

    this._decrementBlockTypeCount(type);
    this.triggerBlockCountUpdate();
    this.mediator.trigger('block:limitReached', this.blockLimitReached());

    EventBus.trigger("block:remove");
  },

  rerenderBlock: function(blockID) {
    var block = this.findBlockById(blockID);
    if (!_.isUndefined(block) && !block.isEmpty() &&
        block.drop_options.re_render_on_reorder) {
      block.beforeLoadingData();
    }
  },

  triggerBlockCountUpdate: function() {
    this.mediator.trigger('block:countUpdate', this.blocks.length);
  },

  canCreateBlock: function(type) {
    if(this.blockLimitReached()) {
      utils.log("Cannot add any more blocks. Limit reached.");
      return false;
    }

    if (!this.isBlockTypeAvailable(type)) {
      utils.log("Block type not available " + type);
      return false;
    }

    // Can we have another one of these blocks?
    if (!this.canAddBlockType(type)) {
      utils.log("Block Limit reached for type " + type);
      return false;
    }

    return true;
  },

  validateBlockTypesExist: function(shouldValidate) {
    if (config.skipValidation || !shouldValidate) { return false; }

    (this.required || []).forEach(function(type, index) {
      if (!this.isBlockTypeAvailable(type)) { return; }

      if (this._getBlockTypeCount(type) === 0) {
        utils.log("Failed validation on required block type " + type);
        this.mediator.trigger('errors:add',
                              { text: i18n.t("errors:type_missing", { type: type }) });

      } else {
        var blocks = this.getBlocksByType(type).filter(function(b) {
          return !b.isEmpty();
        });

        if (blocks.length > 0) { return false; }

        this.mediator.trigger('errors:add', {
          text: i18n.t("errors:required_type_empty", {type: type})
        });

        utils.log("A required block type " + type + " is empty");
      }
    }, this);
  },

  findBlockById: function(blockID) {
    return this.blocks.find(function(b) {
      return b.blockID === blockID;
    });
  },

  getBlocksByType: function(type) {
    return this.blocks.filter(function(b) {
      return utils.classify(b.type) === type;
    });
  },

  getBlocksByIDs: function(block_ids) {
    return this.blocks.filter(function(b) {
      return block_ids.includes(b.blockID);
    });
  },

  blockLimitReached: function() {
    return (this.options.blockLimit !== 0 && this.blocks.length >= this.options.blockLimit);
  },

  isBlockTypeAvailable: function(t) {
    return !_.isUndefined(this.blockTypes[t]);
  },

  canAddBlockType: function(type) {
    var block_type_limit = this._getBlockTypeLimit(type);
    return !(block_type_limit !== 0 && this._getBlockTypeCount(type) >= block_type_limit);
  },

  _setBlocksTypes: function() {
    this.blockTypes = utils.flatten(
      _.isUndefined(this.options.blockTypes) ?
      Blocks : this.options.blockTypes);
  },

  _setRequired: function() {
    this.required = false;

    if (Array.isArray(this.options.required) && !_.isEmpty(this.options.required)) {
      this.required = this.options.required;
    }
  },

  _incrementBlockTypeCount: function(type) {
    this.blockCounts[type] = (_.isUndefined(this.blockCounts[type])) ? 1 : this.blockCounts[type] + 1;
  },

  _decrementBlockTypeCount: function(type) {
    this.blockCounts[type] = (_.isUndefined(this.blockCounts[type])) ? 1 : this.blockCounts[type] - 1;
  },

  _getBlockTypeCount: function(type) {
    return (_.isUndefined(this.blockCounts[type])) ? 0 : this.blockCounts[type];
  },

  _blockLimitReached: function() {
    return (this.options.blockLimit !== 0 && this.blocks.length >= this.options.blockLimit);
  },

  _getBlockTypeLimit: function(t) {
    if (!this.isBlockTypeAvailable(t)) { return 0; }
    return parseInt((_.isUndefined(this.options.blockTypeLimits[t])) ? 0 : this.options.blockTypeLimits[t], 10);
  }

});

module.exports = BlockManager;


},{"./blocks":69,"./config":75,"./event-bus":78,"./events":79,"./function-bind":88,"./lodash":93,"./mediated-events":94,"./utils":99}],55:[function(require,module,exports){
"use strict";

var template = [
  "<div class='st-block-positioner__inner'>",
  "<span class='st-block-positioner__selected-value'></span>",
  "<select class='st-block-positioner__select'></select>",
  "</div>"
].join("\n");

var BlockPositioner = function(block_element, mediator) {
  this.mediator = mediator;
  this.$block = block_element;

  this._ensureElement();
  this._bindFunctions();

  this.initialize();
};

Object.assign(BlockPositioner.prototype, require('./function-bind'), require('./renderable'), {

  total_blocks: 0,

  bound: ['onBlockCountChange', 'onSelectChange', 'toggle', 'show', 'hide'],

  className: 'st-block-positioner',
  visibleClass: 'st-block-positioner--is-visible',

  initialize: function(){
    this.$el.append(template);
    this.$select = this.$('.st-block-positioner__select');

    this.$select.on('change', this.onSelectChange);

    this.mediator.on("blocks:countUpdate", this.onBlockCountChange);
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
      this.mediator.trigger(
        "blocks:changePosition", this.$block, val,
        (val === 1 ? 'before' : 'after'));
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

},{"./function-bind":88,"./renderable":95}],56:[function(require,module,exports){
"use strict";

var _ = require('./lodash');

var EventBus = require('./event-bus');

var BlockReorder = function(block_element, mediator) {
  this.$block = block_element;
  this.blockID = this.$block.attr('id');
  this.mediator = mediator;

  this._ensureElement();
  this._bindFunctions();

  this.initialize();
};

Object.assign(BlockReorder.prototype, require('./function-bind'), require('./renderable'), {

  bound: ['onMouseDown', 'onDragStart', 'onDragEnd', 'onDrop'],

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
      .bind('dragstart', this.onDragStart)
      .bind('dragend touchend', this.onDragEnd);

    this.$block.dropArea()
      .bind('drop', this.onDrop);
  },

  blockId: function() {
    return this.$block.attr('id');
  },

  onMouseDown: function() {
    this.mediator.trigger("block-controls:hide");
    EventBus.trigger("block:reorder:down");
  },

  onDrop: function(ev) {
    ev.preventDefault();

    var dropped_on = this.$block,
    item_id = ev.originalEvent.dataTransfer.getData("text/plain"),
    block = $('#' + item_id);

    if (!_.isUndefined(item_id) && !_.isEmpty(block) &&
        dropped_on.attr('id') !== item_id &&
          dropped_on.attr('data-instance') === block.attr('data-instance')
       ) {
       dropped_on.after(block);
     }
     this.mediator.trigger("block:rerender", item_id);
     EventBus.trigger("block:reorder:dropped", item_id);
  },

  onDragStart: function(ev) {
    var btn = $(ev.currentTarget).parent();

    ev.originalEvent.dataTransfer.setDragImage(this.$block[0], btn.position().left, btn.position().top);
    ev.originalEvent.dataTransfer.setData('Text', this.blockId());

    EventBus.trigger("block:reorder:dragstart");
    this.$block.addClass('st-block--dragging');
  },

  onDragEnd: function(ev) {
    EventBus.trigger("block:reorder:dragend");
    this.$block.removeClass('st-block--dragging');
  },

  render: function() {
    return this;
  }

});

module.exports = BlockReorder;

},{"./event-bus":78,"./function-bind":88,"./lodash":93,"./renderable":95}],57:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var utils = require('./utils');

var EventBus = require('./event-bus');

module.exports = {

  /**
   * Internal storage object for the block
   */
  blockStorage: {},

  /**
   * Initialize the store, including the block type
   */
  createStore: function(blockData) {
    this.blockStorage = {
      type: utils.underscored(this.type),
      data: blockData || {}
    };
  },

  /**
   * Serialize the block and save the data into the store
   */
  save: function() {
    var data = this._serializeData();

    if (!_.isEmpty(data)) {
      this.setData(data);
    }
  },

  getData: function() {
    this.save();
    return this.blockStorage;
  },

  getBlockData: function() {
    this.save();
    return this.blockStorage.data;
  },

  _getData: function() {
    return this.blockStorage.data;
  },

  /**
   * Set the block data.
   * This is used by the save() method.
   */
  setData: function(blockData) {
    utils.log("Setting data for block " + this.blockID);
    Object.assign(this.blockStorage.data, blockData || {});
  },

  setAndLoadData: function(blockData) {
    this.setData(blockData);
    this.beforeLoadingData();
  },

  _serializeData: function() {},
  loadData: function() {},

  beforeLoadingData: function() {
    utils.log("loadData for " + this.blockID);
    EventBus.trigger("editor/block/loadData");
    this.loadData(this._getData());
  },

  _loadData: function() {
    utils.log("_loadData is deprecated and will be removed in the future. Please use beforeLoadingData instead.");
    this.beforeLoadingData();
  },

  checkAndLoadData: function() {
    if (!_.isEmpty(this._getData())) {
      this.beforeLoadingData();
    }
  }

};

},{"./event-bus":78,"./lodash":93,"./utils":99}],58:[function(require,module,exports){
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

},{"./lodash":93,"./utils":99}],59:[function(require,module,exports){
"use strict";

var _ = require('./lodash');

var config = require('./config');
var utils = require('./utils');
var stToHTML = require('./to-html');
var stToMarkdown = require('./to-markdown');
var BlockMixins = require('./block_mixins');

var SimpleBlock = require('./simple-block');
var BlockReorder = require('./block-reorder');
var BlockDeletion = require('./block-deletion');
var BlockPositioner = require('./block-positioner');
var Formatters = require('./formatters');
var EventBus = require('./event-bus');

var Spinner = require('spin.js');

var Block = function(data, instance_id, mediator) {
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

Object.assign(Block.prototype, SimpleBlock.fn, require('./block-validations'), {

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

    availableMixins: ['droppable', 'pastable', 'uploadable', 'fetchable',
      'ajaxable', 'controllable'],

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

      this.availableMixins.forEach(function(mixin) {
        if (this[mixin]) {
          this.withMixin(BlockMixins[utils.classify(mixin)]);
        }
      }, this);

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

    /* Generic _serializeData implementation to serialize the block into a plain object.
     * Can be overwritten, although hopefully this will cover most situations.
     * If you want to get the data of your block use block.getBlockData()
     */
    _serializeData: function() {
      utils.log("toData for " + this.blockID);

      var data = {};

      /* Simple to start. Add conditions later */
      if (this.hasTextBlock()) {
        var content = this.getTextBlock().html();
        if (content.length > 0) {
          data.text = stToMarkdown(content, this.type);
        }
      }

      // Add any inputs to the data attr
      if (this.$(':input').not('.st-paste-block').length > 0) {
        this.$(':input').each(function(index,input){
          if (input.getAttribute('name')) {
            data[input.getAttribute('name')] = input.value;
          }
        });
      }

      return data;
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

    onBlockRender: function() {
      this.focus();
    },

    onDrop: function(dataTransferObj) {},

    onDeleteClick: function(ev) {
      ev.preventDefault();

      var onDeleteConfirm = function(e) {
        e.preventDefault();
        this.mediator.trigger('block:remove', this.blockID);
        this.remove();
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

      var positioner = new BlockPositioner(this.$el, this.mediator);

      this._withUIComponent(positioner, '.st-block-ui-btn--reorder',
                            positioner.toggle);

      this._withUIComponent(new BlockReorder(this.$el, this.mediator));

      this._withUIComponent(new BlockDeletion(), '.st-block-ui-btn--delete',
                            this.onDeleteClick);

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
            en = 'formatter:' + ((selectionStr === '') ? 'hide' : 'position');

        block.mediator.trigger(en, block);
        EventBus.trigger(en, block);
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
      return _.isEmpty(this.getBlockData());
    }

});

Block.extend = require('./helpers/extend'); // Allow our Block to be extended.

module.exports = Block;

},{"./block-deletion":53,"./block-positioner":55,"./block-reorder":56,"./block-validations":58,"./block_mixins":64,"./config":75,"./event-bus":78,"./formatters":87,"./helpers/extend":90,"./lodash":93,"./simple-block":96,"./to-html":97,"./to-markdown":98,"./utils":99,"spin.js":50}],60:[function(require,module,exports){
"use strict";

var utils = require('../utils');

module.exports = {

  mixinName: "Ajaxable",

  ajaxable: true,

  initializeAjaxable: function(){
    this._queued = [];
  },

  addQueuedItem: function(name, deferred) {
    utils.log("Adding queued item for " + this.blockID + " called " + name);

    this._queued.push({ name: name, deferred: deferred });
  },

  removeQueuedItem: function(name) {
    utils.log("Removing queued item for " + this.blockID + " called " + name);

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

},{"../utils":99}],61:[function(require,module,exports){
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

},{"../utils":99}],62:[function(require,module,exports){
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

    var drop_html = $(_.template(this.drop_options.html,
                                 { block: this, _: _ }));

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

},{"../config":75,"../event-bus":78,"../lodash":93,"../utils":99}],63:[function(require,module,exports){
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

},{"../lodash":93,"./ajaxable":60}],64:[function(require,module,exports){
"use strict";

module.exports = {
  Ajaxable: require('./ajaxable.js'),
  Controllable: require('./controllable.js'),
  Droppable: require('./droppable.js'),
  Fetchable: require('./fetchable.js'),
  Pastable: require('./pastable.js'),
  Uploadable: require('./uploadable.js'),
};

},{"./ajaxable.js":60,"./controllable.js":61,"./droppable.js":62,"./fetchable.js":63,"./pastable.js":65,"./uploadable.js":66}],65:[function(require,module,exports){
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

},{"../config":75,"../lodash":93,"../utils":99}],66:[function(require,module,exports){
"use strict";

var _ = require('../lodash');
var config = require('../config');
var utils = require('../utils');

var fileUploader = require('../extensions/file-uploader');

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

},{"../config":75,"../extensions/file-uploader":81,"../lodash":93,"../utils":99,"./ajaxable":60}],67:[function(require,module,exports){
"use strict";

/*
  Heading Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');

module.exports = Block.extend({

  type: 'Heading',

  title: function(){ return i18n.t('blocks:heading:title'); },

  editorHTML: '<div class="st-required st-text-block st-text-block--heading" contenteditable="true"></div>',

  icon_name: 'heading',

  loadData: function(data){
    this.getTextBlock().html(stToHTML(data.text, this.type));
  }
});

},{"../block":59,"../to-html":97}],68:[function(require,module,exports){
"use strict";

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

  onDrop: function(transferData){
    var file = transferData.files[0],
        urlAPI = (typeof URL !== "undefined") ? URL : (typeof webkitURL !== "undefined") ? webkitURL : null;

    // Handle one upload at a time
    if (/image/.test(file.type)) {
      this.loading();
      // Show this image on here
      this.$inputs.hide();
      this.$editor.html($('<img>', { src: urlAPI.createObjectURL(file) })).show();

      this.uploader(
        file,
        function(data) {
          this.setData(data);
          this.ready();
        },
        function(error) {
          this.addMessage(i18n.t('blocks:image:upload_error'));
          this.ready();
        }
      );
    }
  }
});

},{"../block":59}],69:[function(require,module,exports){
"use strict";

module.exports = {
  Text: require('./text'),
  Quote: require('./quote'),
  Image: require('./image'),
  Heading: require('./heading'),
  List: require('./list'),
  Tweet: require('./tweet'),
  Video: require('./video'),
};

},{"./heading":67,"./image":68,"./list":70,"./quote":71,"./text":72,"./tweet":73,"./video":74}],70:[function(require,module,exports){
"use strict";

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
    this.focus();
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
    return _.isEmpty(this.getBlockData().text);
  }

});

},{"../block":59,"../lodash":93,"../to-html":97}],71:[function(require,module,exports){
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

  title: function() { return i18n.t('blocks:quote:title'); },

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

},{"../block":59,"../lodash":93,"../to-html":97}],72:[function(require,module,exports){
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

},{"../block":59,"../to-html":97}],73:[function(require,module,exports){
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

},{"../block":59,"../lodash":93,"../utils":99}],74:[function(require,module,exports){
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


},{"../block":59,"../lodash":93,"../utils":99}],75:[function(require,module,exports){
"use strict";

module.exports = {
  debug: false,
  skipValidation: false,
  version: "0.4.0",
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
  }
};

},{}],76:[function(require,module,exports){
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

var Events = require('./events');
var EventBus = require('./event-bus');
var FormEvents = require('./form-events');
var BlockControls = require('./block-controls');
var BlockManager = require('./block-manager');
var FloatingBlockControls = require('./floating-block-controls');
var FormatBar = require('./format-bar');
var EditorStore = require('./extensions/editor-store');
var ErrorHandler = require('./error-handler');

var Editor = function(options) {
  this.initialize(options);
};

Object.assign(Editor.prototype, require('./function-bind'), require('./events'), {

  bound: ['onFormSubmit', 'hideAllTheThings', 'changeBlockPosition',
    'removeBlockDragOver', 'renderBlock', 'resetBlockControls',
    'blockLimitReached'], 

  events: {
    'block:reorder:dragend': 'removeBlockDragOver',
    'block:content:dropped': 'removeBlockDragOver'
  },

  initialize: function(options) {
    utils.log("Init SirTrevor.Editor");

    this.options = Object.assign({}, config.defaults, options || {});
    this.ID = _.uniqueId('st-editor-');

    if (!this._ensureAndSetElements()) { return false; }

    if(!_.isUndefined(this.options.onEditorRender) &&
       _.isFunction(this.options.onEditorRender)) {
      this.onEditorRender = this.options.onEditorRender;
    }

    // Mediated events for *this* Editor instance
    this.mediator = Object.assign({}, Events);

    this._bindFunctions();

    config.instances.push(this);

    this.build();

    FormEvents.bindFormSubmit(this.$form);
  },

  /*
   * Build the Editor instance.
   * Check to see if we've been passed JSON already, and if not try and
   * create a default block.
   * If we have JSON then we need to build all of our blocks from this.
   */
  build: function() {
    this.$el.hide();

    this.errorHandler = new ErrorHandler(this.$outer, this.mediator, this.options.errorsContainer);
    this.store = new EditorStore(this.$el.val(), this.mediator);
    this.block_manager = new BlockManager(this.options, this.ID, this.mediator);
    this.block_controls = new BlockControls(this.block_manager.blockTypes, this.mediator);
    this.fl_block_controls = new FloatingBlockControls(this.$wrapper, this.ID, this.mediator);
    this.formatBar = new FormatBar(this.options.formatBar, this.mediator);

    this.mediator.on('block:changePosition', this.changeBlockPosition);
    this.mediator.on('block-controls:reset', this.resetBlockControls);
    this.mediator.on('block:limitReached', this.blockLimitReached);
    this.mediator.on('block:render', this.renderBlock);

    this.dataStore = "Please use store.retrieve();";

    this._setEvents();

    this.$wrapper.prepend(this.fl_block_controls.render().$el);
    $(document.body).append(this.formatBar.render().$el);
    this.$outer.append(this.block_controls.render().$el);

    $(window).bind('click', this.hideAllTheThings);

    this.createBlocks();
    this.$wrapper.addClass('st-ready');

    if(!_.isUndefined(this.onEditorRender)) {
      this.onEditorRender();
    }
  },

  createBlocks: function() {
    var store = this.store.retrieve();

    if (store.data.length > 0) {
      store.data.forEach(function(block) {
        this.mediator.trigger('block:create', block.type, block.data);
      }, this);
    } else if (this.options.defaultType !== false) {
      this.mediator.trigger('block:create', this.options.defaultType, {});
    }
  },

  destroy: function() {
    // Destroy the rendered sub views
    this.formatBar.destroy();
    this.fl_block_controls.destroy();
    this.block_controls.destroy();

    // Destroy all blocks
    this.blocks.forEach(function(block) {
      this.mediator.trigger('block:remove', this.block.blockID);
    }, this);

    // Stop listening to events
    this.mediator.stopListening();
    this.stopListening();

    // Remove instance
    config.instances = config.instances.filter(function(instance) {
      return instance.ID !== this.ID;
    }, this);

    // Clear the store
    this.store.reset();
    this.$outer.replaceWith(this.$el.detach());
  },

  reinitialize: function(options) {
    this.destroy();
    this.initialize(options || this.options);
  },

  resetBlockControls: function() {
    this.block_controls.renderInContainer(this.$wrapper);
    this.block_controls.hide();
  },

  blockLimitReached: function(toggle) {
    this.$wrapper.toggleClass('st--block-limit-reached', toggle);
  },

  _setEvents: function() {
    Object.keys(this.events).forEach(function(type) {
      EventBus.on(type, this[this.events[type]], this);
    }, this);
  },

  hideAllTheThings: function(e) {
    this.block_controls.hide();
    this.formatBar.hide();
  },

  store: function(method, options){
    utils.log("The store method has been removed, please call store[methodName]");
    return this.store[method].call(this, options || {});
  },

  renderBlock: function(block) {
    this._renderInPosition(block.render().$el);
    this.hideAllTheThings();
    this.scrollTo(block.$el);

    block.trigger("onRender");
  },

  scrollTo: function(element) {
    $('html, body').animate({ scrollTop: element.position().top }, 300, "linear");
  },

  removeBlockDragOver: function() {
    this.$outer.find('.st-drag-over').removeClass('st-drag-over');
  },

  changeBlockPosition: function($block, selectedPosition) {
    selectedPosition = selectedPosition - 1;

    var blockPosition = this.getBlockPosition($block),
    $blockBy = this.$wrapper.find('.st-block').eq(selectedPosition);

    var where = (blockPosition > selectedPosition) ? "Before" : "After";

    if($blockBy && $blockBy.attr('id') !== $block.attr('id')) {
      this.hideAllTheThings();
      $block["insert" + where]($blockBy);
      this.scrollTo($block);
    }
  },

  _renderInPosition: function(block) {
    if (this.block_controls.currentContainer) {
      this.block_controls.currentContainer.after(block);
    } else {
      this.$wrapper.append(block);
    }
  },

  validateAndSaveBlock: function(block, shouldValidate) {
    if ((!config.skipValidation || shouldValidate) && !block.valid()) {
      this.mediator.trigger('errors:add', { text: _.result(block, 'validationFailMsg') });
      utils.log("Block " + block.blockID + " failed validation");
      return;
    }

    var blockData = block.getData();
    utils.log("Adding data for block " + block.blockID + " to block store:",
              blockData);
    this.store.addData(blockData);
  },

  /*
   * Handle a form submission of this Editor instance.
   * Validate all of our blocks, and serialise all data onto the JSON objects
   */
  onFormSubmit: function(shouldValidate) {
    // if undefined or null or anything other than false - treat as true
    shouldValidate = (shouldValidate === false) ? false : true;

    utils.log("Handling form submission for Editor " + this.ID);

    this.mediator.trigger('errors:reset');
    this.store.reset();

    this.validateBlocks(shouldValidate);
    this.block_manager.validateBlockTypesExist(shouldValidate);

    this.mediator.trigger('errors:render');
    this.$el.val(this.store.toString());

    return this.errorHandler.errors.length;
  },

  validateBlocks: function(shouldValidate) {
    var self = this;
    this.$wrapper.find('.st-block').each(function(idx, block) {
      var _block = self.block_manager.findBlockById($(block).attr('id'));
      if (!_.isUndefined(_block)) {
        self.validateAndSaveBlock(_block, shouldValidate);
      }
    });
  },

  findBlockById: function(block_id) {
    return this.block_manager.findBlockById(block_id);
  },

  getBlocksByType: function(block_type) {
    return this.block_manager.getBlocksByType(block_type);
  },

  getBlocksByIDs: function(block_ids) {
    return this.block_manager.getBlocksByIDs(block_ids);
  },

  getBlockPosition: function($block) {
    return this.$wrapper.find('.st-block').index($block);
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
  }

});

module.exports = Editor;



},{"./block-controls":52,"./block-manager":54,"./config":75,"./error-handler":77,"./event-bus":78,"./events":79,"./extensions/editor-store":80,"./floating-block-controls":83,"./form-events":84,"./format-bar":85,"./function-bind":88,"./lodash":93,"./utils":99}],77:[function(require,module,exports){
"use strict";

var _ = require('./lodash');

var ErrorHandler = function($wrapper, mediator, container) {
  this.$wrapper = $wrapper;
  this.mediator = mediator;
  this.$el = container;

  if (_.isUndefined(this.$el)) {
    this._ensureElement();
    this.$wrapper.prepend(this.$el);
  }

  this.$el.hide();
  this._bindFunctions();
  this._bindMediatedEvents();

  this.initialize();
};

Object.assign(ErrorHandler.prototype, require('./function-bind'), require('./mediated-events'), require('./renderable'), {

  errors: [],
  className: "st-errors",
  eventNamespace: 'errors',

  mediatedEvents: {
    'reset': 'reset',
    'add': 'addMessage',
    'render': 'render'
  },

  initialize: function() {
    var $list = $("<ul>");
    this.$el.append("<p>" + i18n.t("errors:title") + "</p>")
    .append($list);
    this.$list = $list;
  },

  render: function() {
    if (this.errors.length === 0) { return false; }
    this.errors.forEach(this.createErrorItem, this);
    this.$el.show();
  },

  createErrorItem: function(error) {
    var $error = $("<li>", { class: "st-errors__msg", html: error.text });
    this.$list.append($error);
  },

  addMessage: function(error) {
    this.errors.push(error);
  },

  reset: function() {
    if (this.errors.length === 0) { return false; }
    this.errors = [];
    this.$list.html('');
    this.$el.hide();
  }

});

module.exports = ErrorHandler;


},{"./function-bind":88,"./lodash":93,"./mediated-events":94,"./renderable":95}],78:[function(require,module,exports){
"use strict";

module.exports = Object.assign({}, require('./events'));

},{"./events":79}],79:[function(require,module,exports){
"use strict";

module.exports = require('eventablejs');

},{"eventablejs":2}],80:[function(require,module,exports){
"use strict";

/*
 * Sir Trevor Editor Store
 * By default we store the complete data on the instances $el
 * We can easily extend this and store it on some server or something
 */

var _ = require('../lodash');
var utils = require('../utils');


var EditorStore = function(data, mediator) {
  this.mediator = mediator;
  this.initialize(data ? data.trim() : '');
};

Object.assign(EditorStore.prototype, {

  initialize: function(data) {
    this.store = this._parseData(data) || { data: [] };
  },

  retrieve: function() {
    return this.store;
  },

  toString: function(space) {
    return JSON.stringify(this.store, undefined, space);
  },

  reset: function() {
    utils.log("Resetting the EditorStore");
    this.store = { data: [] };
  },

  addData: function(data) {
    this.store.data.push(data);
    return this.store;
  },

  _parseData: function(data) {
    var result;

    if (data.length === 0) { return result; }

    try {
      // Ensure the JSON string has a data element that's an array
      var jsonStr = JSON.parse(data);
      if (!_.isUndefined(jsonStr.data)) {
        result = jsonStr;
      }
    } catch(e) {
      this.mediator.trigger(
        'errors:add',
        { text: i18n.t("errors:load_fail") });

      this.mediator.trigger('errors:render');

      console.log('Sorry there has been a problem with parsing the JSON');
      console.log(e);
    }

    return result;
  }

});

module.exports = EditorStore;

},{"../lodash":93,"../utils":99}],81:[function(require,module,exports){
"use strict";

/*
*   Sir Trevor Uploader
*   Generic Upload implementation that can be extended for blocks
*/

var _ = require('../lodash');
var config = require('../config');
var utils = require('../utils');

var EventBus = require('../event-bus');

module.exports = function(block, file, success, error) {

  EventBus.trigger('onUploadStart');

  var uid  = [block.blockID, (new Date()).getTime(), 'raw'].join('-');
  var data = new FormData();

  data.append('attachment[name]', file.name);
  data.append('attachment[file]', file);
  data.append('attachment[uid]', uid);

  block.resetMessages();

  var callbackSuccess = function(data) {
    utils.log('Upload callback called');
    EventBus.trigger('onUploadStop');

    if (!_.isUndefined(success) && _.isFunction(success)) {
      success.apply(block, arguments);
    }
  };

  var callbackError = function(jqXHR, status, errorThrown) {
    utils.log('Upload callback error called');
    EventBus.trigger('onUploadStop');

    if (!_.isUndefined(error) && _.isFunction(error)) {
      error.call(block, status);
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

},{"../config":75,"../event-bus":78,"../lodash":93,"../utils":99}],82:[function(require,module,exports){
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

var Submittable = function($form) {
  this.$form = $form;
  this.intialize();
};

Object.assign(Submittable.prototype, {

  intialize: function(){
    this.submitBtn = this.$form.find("input[type='submit']");

    var btnTitles = [];

    this.submitBtn.each(function(i, btn){
      btnTitles.push($(btn).attr('value'));
    });

    this.submitBtnTitles = btnTitles;
    this.canSubmit = true;
    this.globalUploadCount = 0;
    this._bindEvents();
  },

  setSubmitButton: function(e, message) {
    this.submitBtn.attr('value', message);
  },

  resetSubmitButton: function(){
    var titles = this.submitBtnTitles;
    this.submitBtn.each(function(index, item) {
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
    this.submitBtn
    .attr('disabled', 'disabled')
    .addClass('disabled');
  },

  _enableSubmitButton: function(){
    this.resetSubmitButton();
    this.submitBtn
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

module.exports = Submittable;


},{"../event-bus":78,"../utils":99}],83:[function(require,module,exports){
"use strict";

/*
   SirTrevor Floating Block Controls
   --
   Draws the 'plus' between blocks
   */

var _ = require('./lodash');

var EventBus = require('./event-bus');

var FloatingBlockControls = function(wrapper, instance_id, mediator) {
  this.$wrapper = wrapper;
  this.instance_id = instance_id;
  this.mediator = mediator;

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
    this.mediator.trigger('block-controls:render', $(e.currentTarget));
  }

});

module.exports = FloatingBlockControls;

},{"./event-bus":78,"./events":79,"./function-bind":88,"./lodash":93,"./renderable":95}],84:[function(require,module,exports){
"use strict";

var config = require('./config');
var utils = require('./utils');

var EventBus = require('./event-bus');
var Submittable = require('./extensions/submittable');

var formBound = false; // Flag to tell us once we've bound our submit event

var FormEvents = {
  bindFormSubmit: function(form) {
    if (!formBound) {
      // XXX: should we have a formBound and submittable per-editor?
      // telling JSHint to ignore as it'll complain we shouldn't be creating
      // a new object, but otherwise `this` won't be set in the Submittable
      // initialiser. Bit weird.
      new Submittable(form); // jshint ignore:line
      form.bind('submit', this.onFormSubmit);
      formBound = true;
    }
  },

  onBeforeSubmit: function(shouldValidate) {
    // Loop through all of our instances and do our form submits on them
    var errors = 0;
    config.instances.forEach(function(inst, i) {
      errors += inst.onFormSubmit(shouldValidate);
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

},{"./config":75,"./event-bus":78,"./extensions/submittable":82,"./utils":99}],85:[function(require,module,exports){
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

var FormatBar = function(options, mediator) {
  this.options = Object.assign({}, config.defaults.formatBar, options || {});
  this.mediator = mediator;

  this._ensureElement();
  this._bindFunctions();
  this._bindMediatedEvents();

  this.initialize.apply(this, arguments);
};

Object.assign(FormatBar.prototype, require('./function-bind'), require('./mediated-events'), require('./events'), require('./renderable'), {

  className: 'st-format-bar',

  bound: ["onFormatButtonClick", "renderBySelection", "hide"],

  eventNamespace: 'formatter',

  mediatedEvents: {
    'positon': 'renderBySelection',
    'show': 'show',
    'hide': 'hide'
  },

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

  renderBySelection: function() {

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

},{"./config":75,"./events":79,"./formatters":87,"./function-bind":88,"./lodash":93,"./mediated-events":94,"./renderable":95}],86:[function(require,module,exports){
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

},{"./helpers/extend":90,"./lodash":93}],87:[function(require,module,exports){
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

},{"./formatter":86}],88:[function(require,module,exports){
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


},{}],89:[function(require,module,exports){
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


},{}],90:[function(require,module,exports){
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

},{}],91:[function(require,module,exports){
"use strict";

var _ = require('./lodash');

require('./helpers/event'); // extends jQuery itself
require('./vendor/array-includes'); // shims ES7 Array.prototype.includes

var SirTrevor = {

  config: require('./config'),

  log: require('./utils').log,
  Locales: require('./locales'),

  Events: require('./events'),
  EventBus: require('./event-bus'),

  EditorStore: require('./extensions/editor-store'),
  Submittable: require('./extensions/submittable'),
  FileUploader: require('./extensions/file-uploader'),

  BlockMixins: require('./block_mixins'),
  BlockPositioner: require('./block-positioner'),
  BlockReorder: require('./block-reorder'),
  BlockDeletion: require('./block-deletion'),
  BlockValidations: require('./block-validations'),
  BlockStore: require('./block-store'),
  BlockManager: require('./block-manager'),

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

},{"./block":59,"./block-control":51,"./block-controls":52,"./block-deletion":53,"./block-manager":54,"./block-positioner":55,"./block-reorder":56,"./block-store":57,"./block-validations":58,"./block_mixins":64,"./blocks":69,"./config":75,"./editor":76,"./event-bus":78,"./events":79,"./extensions/editor-store":80,"./extensions/file-uploader":81,"./extensions/submittable":82,"./floating-block-controls":83,"./form-events":84,"./format-bar":85,"./formatter":86,"./formatters":87,"./helpers/event":89,"./locales":92,"./lodash":93,"./simple-block":96,"./to-html":97,"./to-markdown":98,"./utils":99,"./vendor/array-includes":100}],92:[function(require,module,exports){
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

if (window.i18n === undefined) {
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

},{"./config":75,"./lodash":93,"./utils":99}],93:[function(require,module,exports){
"use strict";

exports.isEmpty = require('lodash.isempty');
exports.isFunction = require('lodash.isfunction');
exports.isObject = require('lodash.isobject');
exports.isString = require('lodash.isstring');
exports.isUndefined = require('lodash.isundefined');
exports.result = require('lodash.result');
exports.template = require('lodash.template');
exports.uniqueId = require('lodash.uniqueid');

},{"lodash.isempty":3,"lodash.isfunction":27,"lodash.isobject":28,"lodash.isstring":30,"lodash.isundefined":31,"lodash.result":32,"lodash.template":33,"lodash.uniqueid":49}],94:[function(require,module,exports){
"use strict";

module.exports = {
  mediatedEvents: {},
  eventNamespace: null,
  _bindMediatedEvents: function() {
    Object.keys(this.mediatedEvents).forEach(function(eventName){
      var cb = this.mediatedEvents[eventName];
      eventName = this.eventNamespace ?
        this.eventNamespace + ':' + eventName :
        eventName;
      this.mediator.on(eventName, this[cb].bind(this));
    }, this);
  }
};

},{}],95:[function(require,module,exports){
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


},{"./lodash":93}],96:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
var utils = require('./utils');

var BlockReorder = require('./block-reorder');

var SimpleBlock = function(data, instance_id, mediator) {
  this.createStore(data);
  this.blockID = _.uniqueId('st-block-');
  this.instanceID = instance_id;
  this.mediator = mediator;

  this._ensureElement();
  this._bindFunctions();

  this.initialize.apply(this, arguments);
};

Object.assign(SimpleBlock.prototype, require('./function-bind'), require('./events'), require('./renderable'), require('./block-store'), {

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

  class: function() {
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
    var $msg = $("<span>", { html: msg, class: "st-msg " + additionalClass });
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

},{"./block-reorder":56,"./block-store":57,"./events":79,"./function-bind":88,"./helpers/extend":90,"./lodash":93,"./renderable":95,"./utils":99}],97:[function(require,module,exports){
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
    return "<a href='"+p2+"'>"+p1.replace(/\n/g, '')+"</a>";
  });

  // This may seem crazy, but because JS doesn't have a look behind,
  // we reverse the string to regex out the italic items (and bold)
  // and look for something that doesn't start (or end in the reversed strings case)
  // with a slash.
  html = utils.reverse(
           utils.reverse(html)
           .replace(/_(?!\\)((_\\|[^_])*)_(?=$|[^\\])/gm, function(match, p1) {
              return ">i/<"+ p1.replace(/\n/g, '').replace(/[\s]+$/,'') +">i<";
           })
           .replace(/\*\*(?!\\)((\*\*\\|[^\*\*])*)\*\*(?=$|[^\\])/gm, function(match, p1){
              return ">b/<"+ p1.replace(/\n/g, '').replace(/[\s]+$/,'') +">b<";
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
    html = html.replace(/\n\n/gm, "</div><div><br></div><div>");
    html = html.replace(/\n/gm, "</div><div>");
  }

  html = html.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
             .replace(/\n/g, "<br>")
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

},{"./blocks":69,"./formatters":87,"./lodash":93,"./utils":99}],98:[function(require,module,exports){
"use strict";

var _ = require('./lodash');
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
  markdown = markdown.replace(/<\/?[^>]+(>|$)/g, "");

  return markdown;
};

},{"./blocks":69,"./formatters":87,"./lodash":93,"./utils":99}],99:[function(require,module,exports){
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

  flatten: function(obj) {
    var x = {};
    (Array.isArray(obj) ? obj : Object.keys(obj)).forEach(function (i) {
      x[i] = true;
    });
    /* _.each(obj, function(a,b) {
     *   x[(_.isArray(obj)) ? a : b] = true;
     * }); */
    return x;
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

},{"./config":75,"./lodash":93}],100:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudGFibGVqcy9ldmVudGFibGUuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLl9zZXRiaW5kZGF0YS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5fc2V0YmluZGRhdGEvbm9kZV9tb2R1bGVzL2xvZGFzaC5faXNuYXRpdmUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guX3NldGJpbmRkYXRhL25vZGVfbW9kdWxlcy9sb2Rhc2gubm9vcC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5iaW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fY3JlYXRld3JhcHBlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5iaW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guX2NyZWF0ZXdyYXBwZXIvbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWJpbmQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guYmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLl9jcmVhdGV3cmFwcGVyL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2ViaW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guYmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLl9jcmVhdGV3cmFwcGVyL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGV3cmFwcGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fc2xpY2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guaWRlbnRpdHkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guc3VwcG9ydC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9vYmplY3R0eXBlcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLmtleXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5rZXlzL25vZGVfbW9kdWxlcy9sb2Rhc2guX3NoaW1rZXlzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2Z1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc29iamVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNzdHJpbmcvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzdW5kZWZpbmVkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5yZXN1bHQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnRlbXBsYXRlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLl9lc2NhcGVzdHJpbmdjaGFyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLl9yZWludGVycG9sYXRlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLmRlZmF1bHRzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLmVzY2FwZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5lc2NhcGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5fZXNjYXBlaHRtbGNoYXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnRlbXBsYXRlL25vZGVfbW9kdWxlcy9sb2Rhc2guZXNjYXBlL25vZGVfbW9kdWxlcy9sb2Rhc2guX2VzY2FwZWh0bWxjaGFyL25vZGVfbW9kdWxlcy9sb2Rhc2guX2h0bWxlc2NhcGVzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLmVzY2FwZS9ub2RlX21vZHVsZXMvbG9kYXNoLl9yZXVuZXNjYXBlZGh0bWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnRlbXBsYXRlL25vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGVzZXR0aW5ncy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvbm9kZV9tb2R1bGVzL2xvZGFzaC52YWx1ZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnVuaXF1ZWlkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NwaW4uanMvc3Bpbi5qcyIsInNyYy9ibG9jay1jb250cm9sLmpzIiwic3JjL2Jsb2NrLWNvbnRyb2xzLmpzIiwic3JjL2Jsb2NrLWRlbGV0aW9uLmpzIiwic3JjL2Jsb2NrLW1hbmFnZXIuanMiLCJzcmMvYmxvY2stcG9zaXRpb25lci5qcyIsInNyYy9ibG9jay1yZW9yZGVyLmpzIiwic3JjL2Jsb2NrLXN0b3JlLmpzIiwic3JjL2Jsb2NrLXZhbGlkYXRpb25zLmpzIiwic3JjL2Jsb2NrLmpzIiwic3JjL2Jsb2NrX21peGlucy9hamF4YWJsZS5qcyIsInNyYy9ibG9ja19taXhpbnMvY29udHJvbGxhYmxlLmpzIiwic3JjL2Jsb2NrX21peGlucy9kcm9wcGFibGUuanMiLCJzcmMvYmxvY2tfbWl4aW5zL2ZldGNoYWJsZS5qcyIsInNyYy9ibG9ja19taXhpbnMvaW5kZXguanMiLCJzcmMvYmxvY2tfbWl4aW5zL3Bhc3RhYmxlLmpzIiwic3JjL2Jsb2NrX21peGlucy91cGxvYWRhYmxlLmpzIiwic3JjL2Jsb2Nrcy9oZWFkaW5nLmpzIiwic3JjL2Jsb2Nrcy9pbWFnZS5qcyIsInNyYy9ibG9ja3MvaW5kZXguanMiLCJzcmMvYmxvY2tzL2xpc3QuanMiLCJzcmMvYmxvY2tzL3F1b3RlLmpzIiwic3JjL2Jsb2Nrcy90ZXh0LmpzIiwic3JjL2Jsb2Nrcy90d2VldC5qcyIsInNyYy9ibG9ja3MvdmlkZW8uanMiLCJzcmMvY29uZmlnLmpzIiwic3JjL2VkaXRvci5qcyIsInNyYy9lcnJvci1oYW5kbGVyLmpzIiwic3JjL2V2ZW50LWJ1cy5qcyIsInNyYy9ldmVudHMuanMiLCJzcmMvZXh0ZW5zaW9ucy9lZGl0b3Itc3RvcmUuanMiLCJzcmMvZXh0ZW5zaW9ucy9maWxlLXVwbG9hZGVyLmpzIiwic3JjL2V4dGVuc2lvbnMvc3VibWl0dGFibGUuanMiLCJzcmMvZmxvYXRpbmctYmxvY2stY29udHJvbHMuanMiLCJzcmMvZm9ybS1ldmVudHMuanMiLCJzcmMvZm9ybWF0LWJhci5qcyIsInNyYy9mb3JtYXR0ZXIuanMiLCJzcmMvZm9ybWF0dGVycy5qcyIsInNyYy9mdW5jdGlvbi1iaW5kLmpzIiwic3JjL2hlbHBlcnMvZXZlbnQuanMiLCJzcmMvaGVscGVycy9leHRlbmQuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvbG9jYWxlcy5qcyIsInNyYy9sb2Rhc2guanMiLCJzcmMvbWVkaWF0ZWQtZXZlbnRzLmpzIiwic3JjL3JlbmRlcmFibGUuanMiLCJzcmMvc2ltcGxlLWJsb2NrLmpzIiwic3JjL3RvLWh0bWwuanMiLCJzcmMvdG8tbWFya2Rvd24uanMiLCJzcmMvdXRpbHMuanMiLCJzcmMvdmVuZG9yL2FycmF5LWluY2x1ZGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9zcmMvJyk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYSBtb2R1bGUuXG4gICAgZGVmaW5lKCdldmVudGFibGUnLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAocm9vdC5FdmVudGFibGUgPSBmYWN0b3J5KCkpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dCBvbmx5IENvbW1vbkpTLWxpa2VcbiAgICAvLyBlbnZpcm9tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsIGxpa2UgTm9kZS5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICByb290LkV2ZW50YWJsZSA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbigpIHtcblxuICAvLyBDb3B5IGFuZCBwYXN0ZWQgc3RyYWlnaHQgb3V0IG9mIEJhY2tib25lIDEuMC4wXG4gIC8vIFdlJ2xsIHRyeSBhbmQga2VlcCB0aGlzIHVwZGF0ZWQgdG8gdGhlIGxhdGVzdFxuXG4gIHZhciBhcnJheSA9IFtdO1xuICB2YXIgc2xpY2UgPSBhcnJheS5zbGljZTtcblxuICBmdW5jdGlvbiBvbmNlKGZ1bmMpIHtcbiAgICB2YXIgbWVtbywgdGltZXMgPSAyO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPiAwKSB7XG4gICAgICAgIG1lbW8gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmdW5jID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG4gIH1cblxuICAvLyBCYWNrYm9uZS5FdmVudHNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gQSBtb2R1bGUgdGhhdCBjYW4gYmUgbWl4ZWQgaW4gdG8gKmFueSBvYmplY3QqIGluIG9yZGVyIHRvIHByb3ZpZGUgaXQgd2l0aFxuICAvLyBjdXN0b20gZXZlbnRzLiBZb3UgbWF5IGJpbmQgd2l0aCBgb25gIG9yIHJlbW92ZSB3aXRoIGBvZmZgIGNhbGxiYWNrXG4gIC8vIGZ1bmN0aW9ucyB0byBhbiBldmVudDsgYHRyaWdnZXJgLWluZyBhbiBldmVudCBmaXJlcyBhbGwgY2FsbGJhY2tzIGluXG4gIC8vIHN1Y2Nlc3Npb24uXG4gIC8vXG4gIC8vICAgICB2YXIgb2JqZWN0ID0ge307XG4gIC8vICAgICBleHRlbmQob2JqZWN0LCBCYWNrYm9uZS5FdmVudHMpO1xuICAvLyAgICAgb2JqZWN0Lm9uKCdleHBhbmQnLCBmdW5jdGlvbigpeyBhbGVydCgnZXhwYW5kZWQnKTsgfSk7XG4gIC8vICAgICBvYmplY3QudHJpZ2dlcignZXhwYW5kJyk7XG4gIC8vXG4gIHZhciBFdmVudGFibGUgPSB7XG5cbiAgICAvLyBCaW5kIGFuIGV2ZW50IHRvIGEgYGNhbGxiYWNrYCBmdW5jdGlvbi4gUGFzc2luZyBgXCJhbGxcImAgd2lsbCBiaW5kXG4gICAgLy8gdGhlIGNhbGxiYWNrIHRvIGFsbCBldmVudHMgZmlyZWQuXG4gICAgb246IGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICBpZiAoIWV2ZW50c0FwaSh0aGlzLCAnb24nLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSB8fCAhY2FsbGJhY2spIHJldHVybiB0aGlzO1xuICAgICAgdGhpcy5fZXZlbnRzIHx8ICh0aGlzLl9ldmVudHMgPSB7fSk7XG4gICAgICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdIHx8ICh0aGlzLl9ldmVudHNbbmFtZV0gPSBbXSk7XG4gICAgICBldmVudHMucHVzaCh7Y2FsbGJhY2s6IGNhbGxiYWNrLCBjb250ZXh0OiBjb250ZXh0LCBjdHg6IGNvbnRleHQgfHwgdGhpc30pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIEJpbmQgYW4gZXZlbnQgdG8gb25seSBiZSB0cmlnZ2VyZWQgYSBzaW5nbGUgdGltZS4gQWZ0ZXIgdGhlIGZpcnN0IHRpbWVcbiAgICAvLyB0aGUgY2FsbGJhY2sgaXMgaW52b2tlZCwgaXQgd2lsbCBiZSByZW1vdmVkLlxuICAgIG9uY2U6IGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICBpZiAoIWV2ZW50c0FwaSh0aGlzLCAnb25jZScsIG5hbWUsIFtjYWxsYmFjaywgY29udGV4dF0pIHx8ICFjYWxsYmFjaykgcmV0dXJuIHRoaXM7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgZnVuYyA9IG9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYub2ZmKG5hbWUsIGZ1bmMpO1xuICAgICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfSk7XG4gICAgICBmdW5jLl9jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgcmV0dXJuIHRoaXMub24obmFtZSwgZnVuYywgY29udGV4dCk7XG4gICAgfSxcblxuICAgIC8vIFJlbW92ZSBvbmUgb3IgbWFueSBjYWxsYmFja3MuIElmIGBjb250ZXh0YCBpcyBudWxsLCByZW1vdmVzIGFsbFxuICAgIC8vIGNhbGxiYWNrcyB3aXRoIHRoYXQgZnVuY3Rpb24uIElmIGBjYWxsYmFja2AgaXMgbnVsbCwgcmVtb3ZlcyBhbGxcbiAgICAvLyBjYWxsYmFja3MgZm9yIHRoZSBldmVudC4gSWYgYG5hbWVgIGlzIG51bGwsIHJlbW92ZXMgYWxsIGJvdW5kXG4gICAgLy8gY2FsbGJhY2tzIGZvciBhbGwgZXZlbnRzLlxuICAgIG9mZjogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXRhaW4sIGV2LCBldmVudHMsIG5hbWVzLCBpLCBsLCBqLCBrO1xuICAgICAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIWV2ZW50c0FwaSh0aGlzLCAnb2ZmJywgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkpIHJldHVybiB0aGlzO1xuICAgICAgaWYgKCFuYW1lICYmICFjYWxsYmFjayAmJiAhY29udGV4dCkge1xuICAgICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIG5hbWVzID0gbmFtZSA/IFtuYW1lXSA6IE9iamVjdC5rZXlzKHRoaXMuX2V2ZW50cyk7XG4gICAgICBmb3IgKGkgPSAwLCBsID0gbmFtZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIG5hbWUgPSBuYW1lc1tpXTtcbiAgICAgICAgaWYgKGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXSkge1xuICAgICAgICAgIHRoaXMuX2V2ZW50c1tuYW1lXSA9IHJldGFpbiA9IFtdO1xuICAgICAgICAgIGlmIChjYWxsYmFjayB8fCBjb250ZXh0KSB7XG4gICAgICAgICAgICBmb3IgKGogPSAwLCBrID0gZXZlbnRzLmxlbmd0aDsgaiA8IGs7IGorKykge1xuICAgICAgICAgICAgICBldiA9IGV2ZW50c1tqXTtcbiAgICAgICAgICAgICAgaWYgKChjYWxsYmFjayAmJiBjYWxsYmFjayAhPT0gZXYuY2FsbGJhY2sgJiYgY2FsbGJhY2sgIT09IGV2LmNhbGxiYWNrLl9jYWxsYmFjaykgfHxcbiAgICAgICAgICAgICAgICAgIChjb250ZXh0ICYmIGNvbnRleHQgIT09IGV2LmNvbnRleHQpKSB7XG4gICAgICAgICAgICAgICAgcmV0YWluLnB1c2goZXYpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghcmV0YWluLmxlbmd0aCkgZGVsZXRlIHRoaXMuX2V2ZW50c1tuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gVHJpZ2dlciBvbmUgb3IgbWFueSBldmVudHMsIGZpcmluZyBhbGwgYm91bmQgY2FsbGJhY2tzLiBDYWxsYmFja3MgYXJlXG4gICAgLy8gcGFzc2VkIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyBgdHJpZ2dlcmAgaXMsIGFwYXJ0IGZyb20gdGhlIGV2ZW50IG5hbWVcbiAgICAvLyAodW5sZXNzIHlvdSdyZSBsaXN0ZW5pbmcgb24gYFwiYWxsXCJgLCB3aGljaCB3aWxsIGNhdXNlIHlvdXIgY2FsbGJhY2sgdG9cbiAgICAvLyByZWNlaXZlIHRoZSB0cnVlIG5hbWUgb2YgdGhlIGV2ZW50IGFzIHRoZSBmaXJzdCBhcmd1bWVudCkuXG4gICAgdHJpZ2dlcjogZnVuY3Rpb24obmFtZSkge1xuICAgICAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuICAgICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICBpZiAoIWV2ZW50c0FwaSh0aGlzLCAndHJpZ2dlcicsIG5hbWUsIGFyZ3MpKSByZXR1cm4gdGhpcztcbiAgICAgIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHNbbmFtZV07XG4gICAgICB2YXIgYWxsRXZlbnRzID0gdGhpcy5fZXZlbnRzLmFsbDtcbiAgICAgIGlmIChldmVudHMpIHRyaWdnZXJFdmVudHMoZXZlbnRzLCBhcmdzKTtcbiAgICAgIGlmIChhbGxFdmVudHMpIHRyaWdnZXJFdmVudHMoYWxsRXZlbnRzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIFRlbGwgdGhpcyBvYmplY3QgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gZWl0aGVyIHNwZWNpZmljIGV2ZW50cyAuLi4gb3JcbiAgICAvLyB0byBldmVyeSBvYmplY3QgaXQncyBjdXJyZW50bHkgbGlzdGVuaW5nIHRvLlxuICAgIHN0b3BMaXN0ZW5pbmc6IGZ1bmN0aW9uKG9iaiwgbmFtZSwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG4gICAgICBpZiAoIWxpc3RlbmVycykgcmV0dXJuIHRoaXM7XG4gICAgICB2YXIgZGVsZXRlTGlzdGVuZXIgPSAhbmFtZSAmJiAhY2FsbGJhY2s7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSBjYWxsYmFjayA9IHRoaXM7XG4gICAgICBpZiAob2JqKSAobGlzdGVuZXJzID0ge30pW29iai5fbGlzdGVuZXJJZF0gPSBvYmo7XG4gICAgICBmb3IgKHZhciBpZCBpbiBsaXN0ZW5lcnMpIHtcbiAgICAgICAgbGlzdGVuZXJzW2lkXS5vZmYobmFtZSwgY2FsbGJhY2ssIHRoaXMpO1xuICAgICAgICBpZiAoZGVsZXRlTGlzdGVuZXIpIGRlbGV0ZSB0aGlzLl9saXN0ZW5lcnNbaWRdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gIH07XG5cbiAgLy8gUmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gc3BsaXQgZXZlbnQgc3RyaW5ncy5cbiAgdmFyIGV2ZW50U3BsaXR0ZXIgPSAvXFxzKy87XG5cbiAgLy8gSW1wbGVtZW50IGZhbmN5IGZlYXR1cmVzIG9mIHRoZSBFdmVudHMgQVBJIHN1Y2ggYXMgbXVsdGlwbGUgZXZlbnRcbiAgLy8gbmFtZXMgYFwiY2hhbmdlIGJsdXJcImAgYW5kIGpRdWVyeS1zdHlsZSBldmVudCBtYXBzIGB7Y2hhbmdlOiBhY3Rpb259YFxuICAvLyBpbiB0ZXJtcyBvZiB0aGUgZXhpc3RpbmcgQVBJLlxuICB2YXIgZXZlbnRzQXBpID0gZnVuY3Rpb24ob2JqLCBhY3Rpb24sIG5hbWUsIHJlc3QpIHtcbiAgICBpZiAoIW5hbWUpIHJldHVybiB0cnVlO1xuXG4gICAgLy8gSGFuZGxlIGV2ZW50IG1hcHMuXG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgZm9yICh2YXIga2V5IGluIG5hbWUpIHtcbiAgICAgICAgb2JqW2FjdGlvbl0uYXBwbHkob2JqLCBba2V5LCBuYW1lW2tleV1dLmNvbmNhdChyZXN0KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHNwYWNlIHNlcGFyYXRlZCBldmVudCBuYW1lcy5cbiAgICBpZiAoZXZlbnRTcGxpdHRlci50ZXN0KG5hbWUpKSB7XG4gICAgICB2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KGV2ZW50U3BsaXR0ZXIpO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBuYW1lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgb2JqW2FjdGlvbl0uYXBwbHkob2JqLCBbbmFtZXNbaV1dLmNvbmNhdChyZXN0KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gQSBkaWZmaWN1bHQtdG8tYmVsaWV2ZSwgYnV0IG9wdGltaXplZCBpbnRlcm5hbCBkaXNwYXRjaCBmdW5jdGlvbiBmb3JcbiAgLy8gdHJpZ2dlcmluZyBldmVudHMuIFRyaWVzIHRvIGtlZXAgdGhlIHVzdWFsIGNhc2VzIHNwZWVkeSAobW9zdCBpbnRlcm5hbFxuICAvLyBCYWNrYm9uZSBldmVudHMgaGF2ZSAzIGFyZ3VtZW50cykuXG4gIHZhciB0cmlnZ2VyRXZlbnRzID0gZnVuY3Rpb24oZXZlbnRzLCBhcmdzKSB7XG4gICAgdmFyIGV2LCBpID0gLTEsIGwgPSBldmVudHMubGVuZ3RoLCBhMSA9IGFyZ3NbMF0sIGEyID0gYXJnc1sxXSwgYTMgPSBhcmdzWzJdO1xuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgpOyByZXR1cm47XG4gICAgICBjYXNlIDE6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4LCBhMSk7IHJldHVybjtcbiAgICAgIGNhc2UgMjogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExLCBhMik7IHJldHVybjtcbiAgICAgIGNhc2UgMzogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExLCBhMiwgYTMpOyByZXR1cm47XG4gICAgICBkZWZhdWx0OiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5hcHBseShldi5jdHgsIGFyZ3MpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgbGlzdGVuTWV0aG9kcyA9IHtsaXN0ZW5UbzogJ29uJywgbGlzdGVuVG9PbmNlOiAnb25jZSd9O1xuXG4gIC8vIEludmVyc2lvbi1vZi1jb250cm9sIHZlcnNpb25zIG9mIGBvbmAgYW5kIGBvbmNlYC4gVGVsbCAqdGhpcyogb2JqZWN0IHRvXG4gIC8vIGxpc3RlbiB0byBhbiBldmVudCBpbiBhbm90aGVyIG9iamVjdCAuLi4ga2VlcGluZyB0cmFjayBvZiB3aGF0IGl0J3NcbiAgLy8gbGlzdGVuaW5nIHRvLlxuICBmdW5jdGlvbiBhZGRMaXN0ZW5NZXRob2QobWV0aG9kLCBpbXBsZW1lbnRhdGlvbikge1xuICAgIEV2ZW50YWJsZVttZXRob2RdID0gZnVuY3Rpb24ob2JqLCBuYW1lLCBjYWxsYmFjaykge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycyB8fCAodGhpcy5fbGlzdGVuZXJzID0ge30pO1xuICAgICAgdmFyIGlkID0gb2JqLl9saXN0ZW5lcklkIHx8IChvYmouX2xpc3RlbmVySWQgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpKTtcbiAgICAgIGxpc3RlbmVyc1tpZF0gPSBvYmo7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSBjYWxsYmFjayA9IHRoaXM7XG4gICAgICBvYmpbaW1wbGVtZW50YXRpb25dKG5hbWUsIGNhbGxiYWNrLCB0aGlzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gIH1cblxuICBhZGRMaXN0ZW5NZXRob2QoJ2xpc3RlblRvJywgJ29uJyk7XG4gIGFkZExpc3Rlbk1ldGhvZCgnbGlzdGVuVG9PbmNlJywgJ29uY2UnKTtcblxuICAvLyBBbGlhc2VzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbiAgRXZlbnRhYmxlLmJpbmQgICA9IEV2ZW50YWJsZS5vbjtcbiAgRXZlbnRhYmxlLnVuYmluZCA9IEV2ZW50YWJsZS5vZmY7XG5cbiAgcmV0dXJuIEV2ZW50YWJsZTtcblxufSkpO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBmb3JPd24gPSByZXF1aXJlKCdsb2Rhc2guZm9yb3duJyksXG4gICAgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJ2xvZGFzaC5pc2Z1bmN0aW9uJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgc2hvcnRjdXRzICovXG52YXIgYXJnc0NsYXNzID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlDbGFzcyA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgb2JqZWN0Q2xhc3MgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICBzdHJpbmdDbGFzcyA9ICdbb2JqZWN0IFN0cmluZ10nO1xuXG4vKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBpbnRlcm5hbCBbW0NsYXNzXV0gb2YgdmFsdWVzICovXG52YXIgdG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBlbXB0eS4gQXJyYXlzLCBzdHJpbmdzLCBvciBgYXJndW1lbnRzYCBvYmplY3RzIHdpdGggYVxuICogbGVuZ3RoIG9mIGAwYCBhbmQgb2JqZWN0cyB3aXRoIG5vIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgYXJlIGNvbnNpZGVyZWRcbiAqIFwiZW1wdHlcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gdmFsdWUgVGhlIHZhbHVlIHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgZW1wdHksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0VtcHR5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNFbXB0eSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0VtcHR5KCcnKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgaWYgKCF2YWx1ZSkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwodmFsdWUpLFxuICAgICAgbGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xuXG4gIGlmICgoY2xhc3NOYW1lID09IGFycmF5Q2xhc3MgfHwgY2xhc3NOYW1lID09IHN0cmluZ0NsYXNzIHx8IGNsYXNzTmFtZSA9PSBhcmdzQ2xhc3MgKSB8fFxuICAgICAgKGNsYXNzTmFtZSA9PSBvYmplY3RDbGFzcyAmJiB0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInICYmIGlzRnVuY3Rpb24odmFsdWUuc3BsaWNlKSkpIHtcbiAgICByZXR1cm4gIWxlbmd0aDtcbiAgfVxuICBmb3JPd24odmFsdWUsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAocmVzdWx0ID0gZmFsc2UpO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0VtcHR5O1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBiYXNlQ3JlYXRlQ2FsbGJhY2sgPSByZXF1aXJlKCdsb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjaycpLFxuICAgIGtleXMgPSByZXF1aXJlKCdsb2Rhc2gua2V5cycpLFxuICAgIG9iamVjdFR5cGVzID0gcmVxdWlyZSgnbG9kYXNoLl9vYmplY3R0eXBlcycpO1xuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgb3duIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBhbiBvYmplY3QsIGV4ZWN1dGluZyB0aGUgY2FsbGJhY2tcbiAqIGZvciBlYWNoIHByb3BlcnR5LiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdGhyZWVcbiAqIGFyZ3VtZW50czsgKHZhbHVlLCBrZXksIG9iamVjdCkuIENhbGxiYWNrcyBtYXkgZXhpdCBpdGVyYXRpb24gZWFybHkgYnlcbiAqIGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEB0eXBlIEZ1bmN0aW9uXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmZvck93bih7ICcwJzogJ3plcm8nLCAnMSc6ICdvbmUnLCAnbGVuZ3RoJzogMiB9LCBmdW5jdGlvbihudW0sIGtleSkge1xuICogICBjb25zb2xlLmxvZyhrZXkpO1xuICogfSk7XG4gKiAvLyA9PiBsb2dzICcwJywgJzEnLCBhbmQgJ2xlbmd0aCcgKHByb3BlcnR5IG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkIGFjcm9zcyBlbnZpcm9ubWVudHMpXG4gKi9cbnZhciBmb3JPd24gPSBmdW5jdGlvbihjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICB2YXIgaW5kZXgsIGl0ZXJhYmxlID0gY29sbGVjdGlvbiwgcmVzdWx0ID0gaXRlcmFibGU7XG4gIGlmICghaXRlcmFibGUpIHJldHVybiByZXN1bHQ7XG4gIGlmICghb2JqZWN0VHlwZXNbdHlwZW9mIGl0ZXJhYmxlXSkgcmV0dXJuIHJlc3VsdDtcbiAgY2FsbGJhY2sgPSBjYWxsYmFjayAmJiB0eXBlb2YgdGhpc0FyZyA9PSAndW5kZWZpbmVkJyA/IGNhbGxiYWNrIDogYmFzZUNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICB2YXIgb3duSW5kZXggPSAtMSxcbiAgICAgICAgb3duUHJvcHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdICYmIGtleXMoaXRlcmFibGUpLFxuICAgICAgICBsZW5ndGggPSBvd25Qcm9wcyA/IG93blByb3BzLmxlbmd0aCA6IDA7XG5cbiAgICB3aGlsZSAoKytvd25JbmRleCA8IGxlbmd0aCkge1xuICAgICAgaW5kZXggPSBvd25Qcm9wc1tvd25JbmRleF07XG4gICAgICBpZiAoY2FsbGJhY2soaXRlcmFibGVbaW5kZXhdLCBpbmRleCwgY29sbGVjdGlvbikgPT09IGZhbHNlKSByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgcmV0dXJuIHJlc3VsdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmb3JPd247XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGJpbmQgPSByZXF1aXJlKCdsb2Rhc2guYmluZCcpLFxuICAgIGlkZW50aXR5ID0gcmVxdWlyZSgnbG9kYXNoLmlkZW50aXR5JyksXG4gICAgc2V0QmluZERhdGEgPSByZXF1aXJlKCdsb2Rhc2guX3NldGJpbmRkYXRhJyksXG4gICAgc3VwcG9ydCA9IHJlcXVpcmUoJ2xvZGFzaC5zdXBwb3J0Jyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdGVkIG5hbWVkIGZ1bmN0aW9ucyAqL1xudmFyIHJlRnVuY05hbWUgPSAvXlxccypmdW5jdGlvblsgXFxuXFxyXFx0XStcXHcvO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgZnVuY3Rpb25zIGNvbnRhaW5pbmcgYSBgdGhpc2AgcmVmZXJlbmNlICovXG52YXIgcmVUaGlzID0gL1xcYnRoaXNcXGIvO1xuXG4vKiogTmF0aXZlIG1ldGhvZCBzaG9ydGN1dHMgKi9cbnZhciBmblRvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmNyZWF0ZUNhbGxiYWNrYCB3aXRob3V0IHN1cHBvcnQgZm9yIGNyZWF0aW5nXG4gKiBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gW2Z1bmM9aWRlbnRpdHldIFRoZSB2YWx1ZSB0byBjb252ZXJ0IHRvIGEgY2FsbGJhY2suXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlIGNyZWF0ZWQgY2FsbGJhY2suXG4gKiBAcGFyYW0ge251bWJlcn0gW2FyZ0NvdW50XSBUaGUgbnVtYmVyIG9mIGFyZ3VtZW50cyB0aGUgY2FsbGJhY2sgYWNjZXB0cy5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBhIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlQ3JlYXRlQ2FsbGJhY2soZnVuYywgdGhpc0FyZywgYXJnQ291bnQpIHtcbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gaWRlbnRpdHk7XG4gIH1cbiAgLy8gZXhpdCBlYXJseSBmb3Igbm8gYHRoaXNBcmdgIG9yIGFscmVhZHkgYm91bmQgYnkgYEZ1bmN0aW9uI2JpbmRgXG4gIGlmICh0eXBlb2YgdGhpc0FyZyA9PSAndW5kZWZpbmVkJyB8fCAhKCdwcm90b3R5cGUnIGluIGZ1bmMpKSB7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH1cbiAgdmFyIGJpbmREYXRhID0gZnVuYy5fX2JpbmREYXRhX187XG4gIGlmICh0eXBlb2YgYmluZERhdGEgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoc3VwcG9ydC5mdW5jTmFtZXMpIHtcbiAgICAgIGJpbmREYXRhID0gIWZ1bmMubmFtZTtcbiAgICB9XG4gICAgYmluZERhdGEgPSBiaW5kRGF0YSB8fCAhc3VwcG9ydC5mdW5jRGVjb21wO1xuICAgIGlmICghYmluZERhdGEpIHtcbiAgICAgIHZhciBzb3VyY2UgPSBmblRvU3RyaW5nLmNhbGwoZnVuYyk7XG4gICAgICBpZiAoIXN1cHBvcnQuZnVuY05hbWVzKSB7XG4gICAgICAgIGJpbmREYXRhID0gIXJlRnVuY05hbWUudGVzdChzb3VyY2UpO1xuICAgICAgfVxuICAgICAgaWYgKCFiaW5kRGF0YSkge1xuICAgICAgICAvLyBjaGVja3MgaWYgYGZ1bmNgIHJlZmVyZW5jZXMgdGhlIGB0aGlzYCBrZXl3b3JkIGFuZCBzdG9yZXMgdGhlIHJlc3VsdFxuICAgICAgICBiaW5kRGF0YSA9IHJlVGhpcy50ZXN0KHNvdXJjZSk7XG4gICAgICAgIHNldEJpbmREYXRhKGZ1bmMsIGJpbmREYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gZXhpdCBlYXJseSBpZiB0aGVyZSBhcmUgbm8gYHRoaXNgIHJlZmVyZW5jZXMgb3IgYGZ1bmNgIGlzIGJvdW5kXG4gIGlmIChiaW5kRGF0YSA9PT0gZmFsc2UgfHwgKGJpbmREYXRhICE9PSB0cnVlICYmIGJpbmREYXRhWzFdICYgMSkpIHtcbiAgICByZXR1cm4gZnVuYztcbiAgfVxuICBzd2l0Y2ggKGFyZ0NvdW50KSB7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgdmFsdWUpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgIH07XG4gICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBiaW5kKGZ1bmMsIHRoaXNBcmcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VDcmVhdGVDYWxsYmFjaztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgaXNOYXRpdmUgPSByZXF1aXJlKCdsb2Rhc2guX2lzbmF0aXZlJyksXG4gICAgbm9vcCA9IHJlcXVpcmUoJ2xvZGFzaC5ub29wJyk7XG5cbi8qKiBVc2VkIGFzIHRoZSBwcm9wZXJ0eSBkZXNjcmlwdG9yIGZvciBgX19iaW5kRGF0YV9fYCAqL1xudmFyIGRlc2NyaXB0b3IgPSB7XG4gICdjb25maWd1cmFibGUnOiBmYWxzZSxcbiAgJ2VudW1lcmFibGUnOiBmYWxzZSxcbiAgJ3ZhbHVlJzogbnVsbCxcbiAgJ3dyaXRhYmxlJzogZmFsc2Vcbn07XG5cbi8qKiBVc2VkIHRvIHNldCBtZXRhIGRhdGEgb24gZnVuY3Rpb25zICovXG52YXIgZGVmaW5lUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIC8vIElFIDggb25seSBhY2NlcHRzIERPTSBlbGVtZW50c1xuICB0cnkge1xuICAgIHZhciBvID0ge30sXG4gICAgICAgIGZ1bmMgPSBpc05hdGl2ZShmdW5jID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KSAmJiBmdW5jLFxuICAgICAgICByZXN1bHQgPSBmdW5jKG8sIG8sIG8pICYmIGZ1bmM7XG4gIH0gY2F0Y2goZSkgeyB9XG4gIHJldHVybiByZXN1bHQ7XG59KCkpO1xuXG4vKipcbiAqIFNldHMgYHRoaXNgIGJpbmRpbmcgZGF0YSBvbiBhIGdpdmVuIGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBzZXQgZGF0YSBvbi5cbiAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlIFRoZSBkYXRhIGFycmF5IHRvIHNldC5cbiAqL1xudmFyIHNldEJpbmREYXRhID0gIWRlZmluZVByb3BlcnR5ID8gbm9vcCA6IGZ1bmN0aW9uKGZ1bmMsIHZhbHVlKSB7XG4gIGRlc2NyaXB0b3IudmFsdWUgPSB2YWx1ZTtcbiAgZGVmaW5lUHJvcGVydHkoZnVuYywgJ19fYmluZERhdGFfXycsIGRlc2NyaXB0b3IpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzZXRCaW5kRGF0YTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGludGVybmFsIFtbQ2xhc3NdXSBvZiB2YWx1ZXMgKi9cbnZhciB0b1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlICovXG52YXIgcmVOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgU3RyaW5nKHRvU3RyaW5nKVxuICAgIC5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpXG4gICAgLnJlcGxhY2UoL3RvU3RyaW5nfCBmb3IgW15cXF1dKy9nLCAnLio/JykgKyAnJCdcbik7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzTmF0aXZlKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJyAmJiByZU5hdGl2ZS50ZXN0KHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc05hdGl2ZTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKlxuICogQSBuby1vcGVyYXRpb24gZnVuY3Rpb24uXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ25hbWUnOiAnZnJlZCcgfTtcbiAqIF8ubm9vcChvYmplY3QpID09PSB1bmRlZmluZWQ7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIG5vb3AoKSB7XG4gIC8vIG5vIG9wZXJhdGlvbiBwZXJmb3JtZWRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBub29wO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBjcmVhdGVXcmFwcGVyID0gcmVxdWlyZSgnbG9kYXNoLl9jcmVhdGV3cmFwcGVyJyksXG4gICAgc2xpY2UgPSByZXF1aXJlKCdsb2Rhc2guX3NsaWNlJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCBpbnZva2VzIGBmdW5jYCB3aXRoIHRoZSBgdGhpc2BcbiAqIGJpbmRpbmcgb2YgYHRoaXNBcmdgIGFuZCBwcmVwZW5kcyBhbnkgYWRkaXRpb25hbCBgYmluZGAgYXJndW1lbnRzIHRvIHRob3NlXG4gKiBwcm92aWRlZCB0byB0aGUgYm91bmQgZnVuY3Rpb24uXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGJpbmQuXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGZ1bmNgLlxuICogQHBhcmFtIHsuLi4qfSBbYXJnXSBBcmd1bWVudHMgdG8gYmUgcGFydGlhbGx5IGFwcGxpZWQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBib3VuZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIGZ1bmMgPSBmdW5jdGlvbihncmVldGluZykge1xuICogICByZXR1cm4gZ3JlZXRpbmcgKyAnICcgKyB0aGlzLm5hbWU7XG4gKiB9O1xuICpcbiAqIGZ1bmMgPSBfLmJpbmQoZnVuYywgeyAnbmFtZSc6ICdmcmVkJyB9LCAnaGknKTtcbiAqIGZ1bmMoKTtcbiAqIC8vID0+ICdoaSBmcmVkJ1xuICovXG5mdW5jdGlvbiBiaW5kKGZ1bmMsIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPiAyXG4gICAgPyBjcmVhdGVXcmFwcGVyKGZ1bmMsIDE3LCBzbGljZShhcmd1bWVudHMsIDIpLCBudWxsLCB0aGlzQXJnKVxuICAgIDogY3JlYXRlV3JhcHBlcihmdW5jLCAxLCBudWxsLCBudWxsLCB0aGlzQXJnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiaW5kO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBiYXNlQmluZCA9IHJlcXVpcmUoJ2xvZGFzaC5fYmFzZWJpbmQnKSxcbiAgICBiYXNlQ3JlYXRlV3JhcHBlciA9IHJlcXVpcmUoJ2xvZGFzaC5fYmFzZWNyZWF0ZXdyYXBwZXInKSxcbiAgICBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnbG9kYXNoLmlzZnVuY3Rpb24nKSxcbiAgICBzbGljZSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2xpY2UnKTtcblxuLyoqXG4gKiBVc2VkIGZvciBgQXJyYXlgIG1ldGhvZCByZWZlcmVuY2VzLlxuICpcbiAqIE5vcm1hbGx5IGBBcnJheS5wcm90b3R5cGVgIHdvdWxkIHN1ZmZpY2UsIGhvd2V2ZXIsIHVzaW5nIGFuIGFycmF5IGxpdGVyYWxcbiAqIGF2b2lkcyBpc3N1ZXMgaW4gTmFyd2hhbC5cbiAqL1xudmFyIGFycmF5UmVmID0gW107XG5cbi8qKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyAqL1xudmFyIHB1c2ggPSBhcnJheVJlZi5wdXNoLFxuICAgIHVuc2hpZnQgPSBhcnJheVJlZi51bnNoaWZ0O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgZWl0aGVyIGN1cnJpZXMgb3IgaW52b2tlcyBgZnVuY2BcbiAqIHdpdGggYW4gb3B0aW9uYWwgYHRoaXNgIGJpbmRpbmcgYW5kIHBhcnRpYWxseSBhcHBsaWVkIGFyZ3VtZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbnxzdHJpbmd9IGZ1bmMgVGhlIGZ1bmN0aW9uIG9yIG1ldGhvZCBuYW1lIHRvIHJlZmVyZW5jZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBiaXRtYXNrIFRoZSBiaXRtYXNrIG9mIG1ldGhvZCBmbGFncyB0byBjb21wb3NlLlxuICogIFRoZSBiaXRtYXNrIG1heSBiZSBjb21wb3NlZCBvZiB0aGUgZm9sbG93aW5nIGZsYWdzOlxuICogIDEgLSBgXy5iaW5kYFxuICogIDIgLSBgXy5iaW5kS2V5YFxuICogIDQgLSBgXy5jdXJyeWBcbiAqICA4IC0gYF8uY3VycnlgIChib3VuZClcbiAqICAxNiAtIGBfLnBhcnRpYWxgXG4gKiAgMzIgLSBgXy5wYXJ0aWFsUmlnaHRgXG4gKiBAcGFyYW0ge0FycmF5fSBbcGFydGlhbEFyZ3NdIEFuIGFycmF5IG9mIGFyZ3VtZW50cyB0byBwcmVwZW5kIHRvIHRob3NlXG4gKiAgcHJvdmlkZWQgdG8gdGhlIG5ldyBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7QXJyYXl9IFtwYXJ0aWFsUmlnaHRBcmdzXSBBbiBhcnJheSBvZiBhcmd1bWVudHMgdG8gYXBwZW5kIHRvIHRob3NlXG4gKiAgcHJvdmlkZWQgdG8gdGhlIG5ldyBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gKiBAcGFyYW0ge251bWJlcn0gW2FyaXR5XSBUaGUgYXJpdHkgb2YgYGZ1bmNgLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVdyYXBwZXIoZnVuYywgYml0bWFzaywgcGFydGlhbEFyZ3MsIHBhcnRpYWxSaWdodEFyZ3MsIHRoaXNBcmcsIGFyaXR5KSB7XG4gIHZhciBpc0JpbmQgPSBiaXRtYXNrICYgMSxcbiAgICAgIGlzQmluZEtleSA9IGJpdG1hc2sgJiAyLFxuICAgICAgaXNDdXJyeSA9IGJpdG1hc2sgJiA0LFxuICAgICAgaXNDdXJyeUJvdW5kID0gYml0bWFzayAmIDgsXG4gICAgICBpc1BhcnRpYWwgPSBiaXRtYXNrICYgMTYsXG4gICAgICBpc1BhcnRpYWxSaWdodCA9IGJpdG1hc2sgJiAzMjtcblxuICBpZiAoIWlzQmluZEtleSAmJiAhaXNGdW5jdGlvbihmdW5jKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gIH1cbiAgaWYgKGlzUGFydGlhbCAmJiAhcGFydGlhbEFyZ3MubGVuZ3RoKSB7XG4gICAgYml0bWFzayAmPSB+MTY7XG4gICAgaXNQYXJ0aWFsID0gcGFydGlhbEFyZ3MgPSBmYWxzZTtcbiAgfVxuICBpZiAoaXNQYXJ0aWFsUmlnaHQgJiYgIXBhcnRpYWxSaWdodEFyZ3MubGVuZ3RoKSB7XG4gICAgYml0bWFzayAmPSB+MzI7XG4gICAgaXNQYXJ0aWFsUmlnaHQgPSBwYXJ0aWFsUmlnaHRBcmdzID0gZmFsc2U7XG4gIH1cbiAgdmFyIGJpbmREYXRhID0gZnVuYyAmJiBmdW5jLl9fYmluZERhdGFfXztcbiAgaWYgKGJpbmREYXRhICYmIGJpbmREYXRhICE9PSB0cnVlKSB7XG4gICAgLy8gY2xvbmUgYGJpbmREYXRhYFxuICAgIGJpbmREYXRhID0gc2xpY2UoYmluZERhdGEpO1xuICAgIGlmIChiaW5kRGF0YVsyXSkge1xuICAgICAgYmluZERhdGFbMl0gPSBzbGljZShiaW5kRGF0YVsyXSk7XG4gICAgfVxuICAgIGlmIChiaW5kRGF0YVszXSkge1xuICAgICAgYmluZERhdGFbM10gPSBzbGljZShiaW5kRGF0YVszXSk7XG4gICAgfVxuICAgIC8vIHNldCBgdGhpc0JpbmRpbmdgIGlzIG5vdCBwcmV2aW91c2x5IGJvdW5kXG4gICAgaWYgKGlzQmluZCAmJiAhKGJpbmREYXRhWzFdICYgMSkpIHtcbiAgICAgIGJpbmREYXRhWzRdID0gdGhpc0FyZztcbiAgICB9XG4gICAgLy8gc2V0IGlmIHByZXZpb3VzbHkgYm91bmQgYnV0IG5vdCBjdXJyZW50bHkgKHN1YnNlcXVlbnQgY3VycmllZCBmdW5jdGlvbnMpXG4gICAgaWYgKCFpc0JpbmQgJiYgYmluZERhdGFbMV0gJiAxKSB7XG4gICAgICBiaXRtYXNrIHw9IDg7XG4gICAgfVxuICAgIC8vIHNldCBjdXJyaWVkIGFyaXR5IGlmIG5vdCB5ZXQgc2V0XG4gICAgaWYgKGlzQ3VycnkgJiYgIShiaW5kRGF0YVsxXSAmIDQpKSB7XG4gICAgICBiaW5kRGF0YVs1XSA9IGFyaXR5O1xuICAgIH1cbiAgICAvLyBhcHBlbmQgcGFydGlhbCBsZWZ0IGFyZ3VtZW50c1xuICAgIGlmIChpc1BhcnRpYWwpIHtcbiAgICAgIHB1c2guYXBwbHkoYmluZERhdGFbMl0gfHwgKGJpbmREYXRhWzJdID0gW10pLCBwYXJ0aWFsQXJncyk7XG4gICAgfVxuICAgIC8vIGFwcGVuZCBwYXJ0aWFsIHJpZ2h0IGFyZ3VtZW50c1xuICAgIGlmIChpc1BhcnRpYWxSaWdodCkge1xuICAgICAgdW5zaGlmdC5hcHBseShiaW5kRGF0YVszXSB8fCAoYmluZERhdGFbM10gPSBbXSksIHBhcnRpYWxSaWdodEFyZ3MpO1xuICAgIH1cbiAgICAvLyBtZXJnZSBmbGFnc1xuICAgIGJpbmREYXRhWzFdIHw9IGJpdG1hc2s7XG4gICAgcmV0dXJuIGNyZWF0ZVdyYXBwZXIuYXBwbHkobnVsbCwgYmluZERhdGEpO1xuICB9XG4gIC8vIGZhc3QgcGF0aCBmb3IgYF8uYmluZGBcbiAgdmFyIGNyZWF0ZXIgPSAoYml0bWFzayA9PSAxIHx8IGJpdG1hc2sgPT09IDE3KSA/IGJhc2VCaW5kIDogYmFzZUNyZWF0ZVdyYXBwZXI7XG4gIHJldHVybiBjcmVhdGVyKFtmdW5jLCBiaXRtYXNrLCBwYXJ0aWFsQXJncywgcGFydGlhbFJpZ2h0QXJncywgdGhpc0FyZywgYXJpdHldKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVXcmFwcGVyO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBiYXNlQ3JlYXRlID0gcmVxdWlyZSgnbG9kYXNoLl9iYXNlY3JlYXRlJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCdsb2Rhc2guaXNvYmplY3QnKSxcbiAgICBzZXRCaW5kRGF0YSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2V0YmluZGRhdGEnKSxcbiAgICBzbGljZSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2xpY2UnKTtcblxuLyoqXG4gKiBVc2VkIGZvciBgQXJyYXlgIG1ldGhvZCByZWZlcmVuY2VzLlxuICpcbiAqIE5vcm1hbGx5IGBBcnJheS5wcm90b3R5cGVgIHdvdWxkIHN1ZmZpY2UsIGhvd2V2ZXIsIHVzaW5nIGFuIGFycmF5IGxpdGVyYWxcbiAqIGF2b2lkcyBpc3N1ZXMgaW4gTmFyd2hhbC5cbiAqL1xudmFyIGFycmF5UmVmID0gW107XG5cbi8qKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyAqL1xudmFyIHB1c2ggPSBhcnJheVJlZi5wdXNoO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmJpbmRgIHRoYXQgY3JlYXRlcyB0aGUgYm91bmQgZnVuY3Rpb24gYW5kXG4gKiBzZXRzIGl0cyBtZXRhIGRhdGEuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGJpbmREYXRhIFRoZSBiaW5kIGRhdGEgYXJyYXkuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBib3VuZCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZUJpbmQoYmluZERhdGEpIHtcbiAgdmFyIGZ1bmMgPSBiaW5kRGF0YVswXSxcbiAgICAgIHBhcnRpYWxBcmdzID0gYmluZERhdGFbMl0sXG4gICAgICB0aGlzQXJnID0gYmluZERhdGFbNF07XG5cbiAgZnVuY3Rpb24gYm91bmQoKSB7XG4gICAgLy8gYEZ1bmN0aW9uI2JpbmRgIHNwZWNcbiAgICAvLyBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjMuNC41XG4gICAgaWYgKHBhcnRpYWxBcmdzKSB7XG4gICAgICAvLyBhdm9pZCBgYXJndW1lbnRzYCBvYmplY3QgZGVvcHRpbWl6YXRpb25zIGJ5IHVzaW5nIGBzbGljZWAgaW5zdGVhZFxuICAgICAgLy8gb2YgYEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsYCBhbmQgbm90IGFzc2lnbmluZyBgYXJndW1lbnRzYCB0byBhXG4gICAgICAvLyB2YXJpYWJsZSBhcyBhIHRlcm5hcnkgZXhwcmVzc2lvblxuICAgICAgdmFyIGFyZ3MgPSBzbGljZShwYXJ0aWFsQXJncyk7XG4gICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgfVxuICAgIC8vIG1pbWljIHRoZSBjb25zdHJ1Y3RvcidzIGByZXR1cm5gIGJlaGF2aW9yXG4gICAgLy8gaHR0cDovL2VzNS5naXRodWIuaW8vI3gxMy4yLjJcbiAgICBpZiAodGhpcyBpbnN0YW5jZW9mIGJvdW5kKSB7XG4gICAgICAvLyBlbnN1cmUgYG5ldyBib3VuZGAgaXMgYW4gaW5zdGFuY2Ugb2YgYGZ1bmNgXG4gICAgICB2YXIgdGhpc0JpbmRpbmcgPSBiYXNlQ3JlYXRlKGZ1bmMucHJvdG90eXBlKSxcbiAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNCaW5kaW5nLCBhcmdzIHx8IGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gaXNPYmplY3QocmVzdWx0KSA/IHJlc3VsdCA6IHRoaXNCaW5kaW5nO1xuICAgIH1cbiAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzIHx8IGFyZ3VtZW50cyk7XG4gIH1cbiAgc2V0QmluZERhdGEoYm91bmQsIGJpbmREYXRhKTtcbiAgcmV0dXJuIGJvdW5kO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VCaW5kO1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBpc05hdGl2ZSA9IHJlcXVpcmUoJ2xvZGFzaC5faXNuYXRpdmUnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC5pc29iamVjdCcpLFxuICAgIG5vb3AgPSByZXF1aXJlKCdsb2Rhc2gubm9vcCcpO1xuXG4vKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyBmb3IgbWV0aG9kcyB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcyAqL1xudmFyIG5hdGl2ZUNyZWF0ZSA9IGlzTmF0aXZlKG5hdGl2ZUNyZWF0ZSA9IE9iamVjdC5jcmVhdGUpICYmIG5hdGl2ZUNyZWF0ZTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5jcmVhdGVgIHdpdGhvdXQgc3VwcG9ydCBmb3IgYXNzaWduaW5nXG4gKiBwcm9wZXJ0aWVzIHRvIHRoZSBjcmVhdGVkIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHByb3RvdHlwZSBUaGUgb2JqZWN0IHRvIGluaGVyaXQgZnJvbS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG5ldyBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIGJhc2VDcmVhdGUocHJvdG90eXBlLCBwcm9wZXJ0aWVzKSB7XG4gIHJldHVybiBpc09iamVjdChwcm90b3R5cGUpID8gbmF0aXZlQ3JlYXRlKHByb3RvdHlwZSkgOiB7fTtcbn1cbi8vIGZhbGxiYWNrIGZvciBicm93c2VycyB3aXRob3V0IGBPYmplY3QuY3JlYXRlYFxuaWYgKCFuYXRpdmVDcmVhdGUpIHtcbiAgYmFzZUNyZWF0ZSA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBPYmplY3QoKSB7fVxuICAgIHJldHVybiBmdW5jdGlvbihwcm90b3R5cGUpIHtcbiAgICAgIGlmIChpc09iamVjdChwcm90b3R5cGUpKSB7XG4gICAgICAgIE9iamVjdC5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgICAgIHZhciByZXN1bHQgPSBuZXcgT2JqZWN0O1xuICAgICAgICBPYmplY3QucHJvdG90eXBlID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQgfHwgZ2xvYmFsLk9iamVjdCgpO1xuICAgIH07XG4gIH0oKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNyZWF0ZTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBiYXNlQ3JlYXRlID0gcmVxdWlyZSgnbG9kYXNoLl9iYXNlY3JlYXRlJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCdsb2Rhc2guaXNvYmplY3QnKSxcbiAgICBzZXRCaW5kRGF0YSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2V0YmluZGRhdGEnKSxcbiAgICBzbGljZSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2xpY2UnKTtcblxuLyoqXG4gKiBVc2VkIGZvciBgQXJyYXlgIG1ldGhvZCByZWZlcmVuY2VzLlxuICpcbiAqIE5vcm1hbGx5IGBBcnJheS5wcm90b3R5cGVgIHdvdWxkIHN1ZmZpY2UsIGhvd2V2ZXIsIHVzaW5nIGFuIGFycmF5IGxpdGVyYWxcbiAqIGF2b2lkcyBpc3N1ZXMgaW4gTmFyd2hhbC5cbiAqL1xudmFyIGFycmF5UmVmID0gW107XG5cbi8qKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyAqL1xudmFyIHB1c2ggPSBhcnJheVJlZi5wdXNoO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBjcmVhdGVXcmFwcGVyYCB0aGF0IGNyZWF0ZXMgdGhlIHdyYXBwZXIgYW5kXG4gKiBzZXRzIGl0cyBtZXRhIGRhdGEuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGJpbmREYXRhIFRoZSBiaW5kIGRhdGEgYXJyYXkuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZUNyZWF0ZVdyYXBwZXIoYmluZERhdGEpIHtcbiAgdmFyIGZ1bmMgPSBiaW5kRGF0YVswXSxcbiAgICAgIGJpdG1hc2sgPSBiaW5kRGF0YVsxXSxcbiAgICAgIHBhcnRpYWxBcmdzID0gYmluZERhdGFbMl0sXG4gICAgICBwYXJ0aWFsUmlnaHRBcmdzID0gYmluZERhdGFbM10sXG4gICAgICB0aGlzQXJnID0gYmluZERhdGFbNF0sXG4gICAgICBhcml0eSA9IGJpbmREYXRhWzVdO1xuXG4gIHZhciBpc0JpbmQgPSBiaXRtYXNrICYgMSxcbiAgICAgIGlzQmluZEtleSA9IGJpdG1hc2sgJiAyLFxuICAgICAgaXNDdXJyeSA9IGJpdG1hc2sgJiA0LFxuICAgICAgaXNDdXJyeUJvdW5kID0gYml0bWFzayAmIDgsXG4gICAgICBrZXkgPSBmdW5jO1xuXG4gIGZ1bmN0aW9uIGJvdW5kKCkge1xuICAgIHZhciB0aGlzQmluZGluZyA9IGlzQmluZCA/IHRoaXNBcmcgOiB0aGlzO1xuICAgIGlmIChwYXJ0aWFsQXJncykge1xuICAgICAgdmFyIGFyZ3MgPSBzbGljZShwYXJ0aWFsQXJncyk7XG4gICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgfVxuICAgIGlmIChwYXJ0aWFsUmlnaHRBcmdzIHx8IGlzQ3VycnkpIHtcbiAgICAgIGFyZ3MgfHwgKGFyZ3MgPSBzbGljZShhcmd1bWVudHMpKTtcbiAgICAgIGlmIChwYXJ0aWFsUmlnaHRBcmdzKSB7XG4gICAgICAgIHB1c2guYXBwbHkoYXJncywgcGFydGlhbFJpZ2h0QXJncyk7XG4gICAgICB9XG4gICAgICBpZiAoaXNDdXJyeSAmJiBhcmdzLmxlbmd0aCA8IGFyaXR5KSB7XG4gICAgICAgIGJpdG1hc2sgfD0gMTYgJiB+MzI7XG4gICAgICAgIHJldHVybiBiYXNlQ3JlYXRlV3JhcHBlcihbZnVuYywgKGlzQ3VycnlCb3VuZCA/IGJpdG1hc2sgOiBiaXRtYXNrICYgfjMpLCBhcmdzLCBudWxsLCB0aGlzQXJnLCBhcml0eV0pO1xuICAgICAgfVxuICAgIH1cbiAgICBhcmdzIHx8IChhcmdzID0gYXJndW1lbnRzKTtcbiAgICBpZiAoaXNCaW5kS2V5KSB7XG4gICAgICBmdW5jID0gdGhpc0JpbmRpbmdba2V5XTtcbiAgICB9XG4gICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBib3VuZCkge1xuICAgICAgdGhpc0JpbmRpbmcgPSBiYXNlQ3JlYXRlKGZ1bmMucHJvdG90eXBlKTtcbiAgICAgIHZhciByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNCaW5kaW5nLCBhcmdzKTtcbiAgICAgIHJldHVybiBpc09iamVjdChyZXN1bHQpID8gcmVzdWx0IDogdGhpc0JpbmRpbmc7XG4gICAgfVxuICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXNCaW5kaW5nLCBhcmdzKTtcbiAgfVxuICBzZXRCaW5kRGF0YShib3VuZCwgYmluZERhdGEpO1xuICByZXR1cm4gYm91bmQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNyZWF0ZVdyYXBwZXI7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKipcbiAqIFNsaWNlcyB0aGUgYGNvbGxlY3Rpb25gIGZyb20gdGhlIGBzdGFydGAgaW5kZXggdXAgdG8sIGJ1dCBub3QgaW5jbHVkaW5nLFxuICogdGhlIGBlbmRgIGluZGV4LlxuICpcbiAqIE5vdGU6IFRoaXMgZnVuY3Rpb24gaXMgdXNlZCBpbnN0ZWFkIG9mIGBBcnJheSNzbGljZWAgdG8gc3VwcG9ydCBub2RlIGxpc3RzXG4gKiBpbiBJRSA8IDkgYW5kIHRvIGVuc3VyZSBkZW5zZSBhcnJheXMgYXJlIHJldHVybmVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gc2xpY2UuXG4gKiBAcGFyYW0ge251bWJlcn0gc3RhcnQgVGhlIHN0YXJ0IGluZGV4LlxuICogQHBhcmFtIHtudW1iZXJ9IGVuZCBUaGUgZW5kIGluZGV4LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIHNsaWNlKGFycmF5LCBzdGFydCwgZW5kKSB7XG4gIHN0YXJ0IHx8IChzdGFydCA9IDApO1xuICBpZiAodHlwZW9mIGVuZCA9PSAndW5kZWZpbmVkJykge1xuICAgIGVuZCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcbiAgfVxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVuZCAtIHN0YXJ0IHx8IDAsXG4gICAgICByZXN1bHQgPSBBcnJheShsZW5ndGggPCAwID8gMCA6IGxlbmd0aCk7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICByZXN1bHRbaW5kZXhdID0gYXJyYXlbc3RhcnQgKyBpbmRleF07XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzbGljZTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgZmlyc3QgYXJndW1lbnQgcHJvdmlkZWQgdG8gaXQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgQW55IHZhbHVlLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgYHZhbHVlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ25hbWUnOiAnZnJlZCcgfTtcbiAqIF8uaWRlbnRpdHkob2JqZWN0KSA9PT0gb2JqZWN0O1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpZGVudGl0eSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaWRlbnRpdHk7XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGlzTmF0aXZlID0gcmVxdWlyZSgnbG9kYXNoLl9pc25hdGl2ZScpO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgZnVuY3Rpb25zIGNvbnRhaW5pbmcgYSBgdGhpc2AgcmVmZXJlbmNlICovXG52YXIgcmVUaGlzID0gL1xcYnRoaXNcXGIvO1xuXG4vKipcbiAqIEFuIG9iamVjdCB1c2VkIHRvIGZsYWcgZW52aXJvbm1lbnRzIGZlYXR1cmVzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAdHlwZSBPYmplY3RcbiAqL1xudmFyIHN1cHBvcnQgPSB7fTtcblxuLyoqXG4gKiBEZXRlY3QgaWYgZnVuY3Rpb25zIGNhbiBiZSBkZWNvbXBpbGVkIGJ5IGBGdW5jdGlvbiN0b1N0cmluZ2BcbiAqIChhbGwgYnV0IFBTMyBhbmQgb2xkZXIgT3BlcmEgbW9iaWxlIGJyb3dzZXJzICYgYXZvaWRlZCBpbiBXaW5kb3dzIDggYXBwcykuXG4gKlxuICogQG1lbWJlck9mIF8uc3VwcG9ydFxuICogQHR5cGUgYm9vbGVhblxuICovXG5zdXBwb3J0LmZ1bmNEZWNvbXAgPSAhaXNOYXRpdmUoZ2xvYmFsLldpblJURXJyb3IpICYmIHJlVGhpcy50ZXN0KGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSk7XG5cbi8qKlxuICogRGV0ZWN0IGlmIGBGdW5jdGlvbiNuYW1lYCBpcyBzdXBwb3J0ZWQgKGFsbCBidXQgSUUpLlxuICpcbiAqIEBtZW1iZXJPZiBfLnN1cHBvcnRcbiAqIEB0eXBlIGJvb2xlYW5cbiAqL1xuc3VwcG9ydC5mdW5jTmFtZXMgPSB0eXBlb2YgRnVuY3Rpb24ubmFtZSA9PSAnc3RyaW5nJztcblxubW9kdWxlLmV4cG9ydHMgPSBzdXBwb3J0O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogVXNlZCB0byBkZXRlcm1pbmUgaWYgdmFsdWVzIGFyZSBvZiB0aGUgbGFuZ3VhZ2UgdHlwZSBPYmplY3QgKi9cbnZhciBvYmplY3RUeXBlcyA9IHtcbiAgJ2Jvb2xlYW4nOiBmYWxzZSxcbiAgJ2Z1bmN0aW9uJzogdHJ1ZSxcbiAgJ29iamVjdCc6IHRydWUsXG4gICdudW1iZXInOiBmYWxzZSxcbiAgJ3N0cmluZyc6IGZhbHNlLFxuICAndW5kZWZpbmVkJzogZmFsc2Vcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0VHlwZXM7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGlzTmF0aXZlID0gcmVxdWlyZSgnbG9kYXNoLl9pc25hdGl2ZScpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoLmlzb2JqZWN0JyksXG4gICAgc2hpbUtleXMgPSByZXF1aXJlKCdsb2Rhc2guX3NoaW1rZXlzJyk7XG5cbi8qIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzIGZvciBtZXRob2RzIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzICovXG52YXIgbmF0aXZlS2V5cyA9IGlzTmF0aXZlKG5hdGl2ZUtleXMgPSBPYmplY3Qua2V5cykgJiYgbmF0aXZlS2V5cztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IGNvbXBvc2VkIG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBhbiBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5rZXlzKHsgJ29uZSc6IDEsICd0d28nOiAyLCAndGhyZWUnOiAzIH0pO1xuICogLy8gPT4gWydvbmUnLCAndHdvJywgJ3RocmVlJ10gKHByb3BlcnR5IG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkIGFjcm9zcyBlbnZpcm9ubWVudHMpXG4gKi9cbnZhciBrZXlzID0gIW5hdGl2ZUtleXMgPyBzaGltS2V5cyA6IGZ1bmN0aW9uKG9iamVjdCkge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgcmV0dXJuIG5hdGl2ZUtleXMob2JqZWN0KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5cztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgb2JqZWN0VHlwZXMgPSByZXF1aXJlKCdsb2Rhc2guX29iamVjdHR5cGVzJyk7XG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQSBmYWxsYmFjayBpbXBsZW1lbnRhdGlvbiBvZiBgT2JqZWN0LmtleXNgIHdoaWNoIHByb2R1Y2VzIGFuIGFycmF5IG9mIHRoZVxuICogZ2l2ZW4gb2JqZWN0J3Mgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEB0eXBlIEZ1bmN0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xudmFyIHNoaW1LZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gIHZhciBpbmRleCwgaXRlcmFibGUgPSBvYmplY3QsIHJlc3VsdCA9IFtdO1xuICBpZiAoIWl0ZXJhYmxlKSByZXR1cm4gcmVzdWx0O1xuICBpZiAoIShvYmplY3RUeXBlc1t0eXBlb2Ygb2JqZWN0XSkpIHJldHVybiByZXN1bHQ7XG4gICAgZm9yIChpbmRleCBpbiBpdGVyYWJsZSkge1xuICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoaXRlcmFibGUsIGluZGV4KSkge1xuICAgICAgICByZXN1bHQucHVzaChpbmRleCk7XG4gICAgICB9XG4gICAgfVxuICByZXR1cm4gcmVzdWx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNoaW1LZXlzO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb247XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIG9iamVjdFR5cGVzID0gcmVxdWlyZSgnbG9kYXNoLl9vYmplY3R0eXBlcycpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZSBsYW5ndWFnZSB0eXBlIG9mIE9iamVjdC5cbiAqIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KDEpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgLy8gY2hlY2sgaWYgdGhlIHZhbHVlIGlzIHRoZSBFQ01BU2NyaXB0IGxhbmd1YWdlIHR5cGUgb2YgT2JqZWN0XG4gIC8vIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4OFxuICAvLyBhbmQgYXZvaWQgYSBWOCBidWdcbiAgLy8gaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MjI5MVxuICByZXR1cm4gISEodmFsdWUgJiYgb2JqZWN0VHlwZXNbdHlwZW9mIHZhbHVlXSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3Q7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHNob3J0Y3V0cyAqL1xudmFyIHN0cmluZ0NsYXNzID0gJ1tvYmplY3QgU3RyaW5nXSc7XG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGludGVybmFsIFtbQ2xhc3NdXSBvZiB2YWx1ZXMgKi9cbnZhciB0b1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgc3RyaW5nLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBzdHJpbmcsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N0cmluZygnZnJlZCcpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzdHJpbmcnIHx8XG4gICAgdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09IHN0cmluZ0NsYXNzIHx8IGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzU3RyaW5nO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBgdW5kZWZpbmVkYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGB1bmRlZmluZWRgLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNVbmRlZmluZWQodm9pZCAwKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAndW5kZWZpbmVkJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1VuZGVmaW5lZDtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJ2xvZGFzaC5pc2Z1bmN0aW9uJyk7XG5cbi8qKlxuICogUmVzb2x2ZXMgdGhlIHZhbHVlIG9mIHByb3BlcnR5IGBrZXlgIG9uIGBvYmplY3RgLiBJZiBga2V5YCBpcyBhIGZ1bmN0aW9uXG4gKiBpdCB3aWxsIGJlIGludm9rZWQgd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgYG9iamVjdGAgYW5kIGl0cyByZXN1bHQgcmV0dXJuZWQsXG4gKiBlbHNlIHRoZSBwcm9wZXJ0eSB2YWx1ZSBpcyByZXR1cm5lZC4gSWYgYG9iamVjdGAgaXMgZmFsc2V5IHRoZW4gYHVuZGVmaW5lZGBcbiAqIGlzIHJldHVybmVkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIHJlc29sdmUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcmVzb2x2ZWQgdmFsdWUuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7XG4gKiAgICdjaGVlc2UnOiAnY3J1bXBldHMnLFxuICogICAnc3R1ZmYnOiBmdW5jdGlvbigpIHtcbiAqICAgICByZXR1cm4gJ25vbnNlbnNlJztcbiAqICAgfVxuICogfTtcbiAqXG4gKiBfLnJlc3VsdChvYmplY3QsICdjaGVlc2UnKTtcbiAqIC8vID0+ICdjcnVtcGV0cydcbiAqXG4gKiBfLnJlc3VsdChvYmplY3QsICdzdHVmZicpO1xuICogLy8gPT4gJ25vbnNlbnNlJ1xuICovXG5mdW5jdGlvbiByZXN1bHQob2JqZWN0LCBrZXkpIHtcbiAgaWYgKG9iamVjdCkge1xuICAgIHZhciB2YWx1ZSA9IG9iamVjdFtrZXldO1xuICAgIHJldHVybiBpc0Z1bmN0aW9uKHZhbHVlKSA/IG9iamVjdFtrZXldKCkgOiB2YWx1ZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlc3VsdDtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCdsb2Rhc2guZGVmYXVsdHMnKSxcbiAgICBlc2NhcGUgPSByZXF1aXJlKCdsb2Rhc2guZXNjYXBlJyksXG4gICAgZXNjYXBlU3RyaW5nQ2hhciA9IHJlcXVpcmUoJ2xvZGFzaC5fZXNjYXBlc3RyaW5nY2hhcicpLFxuICAgIGtleXMgPSByZXF1aXJlKCdsb2Rhc2gua2V5cycpLFxuICAgIHJlSW50ZXJwb2xhdGUgPSByZXF1aXJlKCdsb2Rhc2guX3JlaW50ZXJwb2xhdGUnKSxcbiAgICB0ZW1wbGF0ZVNldHRpbmdzID0gcmVxdWlyZSgnbG9kYXNoLnRlbXBsYXRlc2V0dGluZ3MnKSxcbiAgICB2YWx1ZXMgPSByZXF1aXJlKCdsb2Rhc2gudmFsdWVzJyk7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIGVtcHR5IHN0cmluZyBsaXRlcmFscyBpbiBjb21waWxlZCB0ZW1wbGF0ZSBzb3VyY2UgKi9cbnZhciByZUVtcHR5U3RyaW5nTGVhZGluZyA9IC9cXGJfX3AgXFwrPSAnJzsvZyxcbiAgICByZUVtcHR5U3RyaW5nTWlkZGxlID0gL1xcYihfX3AgXFwrPSkgJycgXFwrL2csXG4gICAgcmVFbXB0eVN0cmluZ1RyYWlsaW5nID0gLyhfX2VcXCguKj9cXCl8XFxiX190XFwpKSBcXCtcXG4nJzsvZztcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoIEVTNiB0ZW1wbGF0ZSBkZWxpbWl0ZXJzXG4gKiBodHRwOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1saXRlcmFscy1zdHJpbmctbGl0ZXJhbHNcbiAqL1xudmFyIHJlRXNUZW1wbGF0ZSA9IC9cXCRcXHsoW15cXFxcfV0qKD86XFxcXC5bXlxcXFx9XSopKilcXH0vZztcblxuLyoqIFVzZWQgdG8gZW5zdXJlIGNhcHR1cmluZyBvcmRlciBvZiB0ZW1wbGF0ZSBkZWxpbWl0ZXJzICovXG52YXIgcmVOb01hdGNoID0gLygkXikvO1xuXG4vKiogVXNlZCB0byBtYXRjaCB1bmVzY2FwZWQgY2hhcmFjdGVycyBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMgKi9cbnZhciByZVVuZXNjYXBlZFN0cmluZyA9IC9bJ1xcblxcclxcdFxcdTIwMjhcXHUyMDI5XFxcXF0vZztcblxuLyoqXG4gKiBBIG1pY3JvLXRlbXBsYXRpbmcgbWV0aG9kIHRoYXQgaGFuZGxlcyBhcmJpdHJhcnkgZGVsaW1pdGVycywgcHJlc2VydmVzXG4gKiB3aGl0ZXNwYWNlLCBhbmQgY29ycmVjdGx5IGVzY2FwZXMgcXVvdGVzIHdpdGhpbiBpbnRlcnBvbGF0ZWQgY29kZS5cbiAqXG4gKiBOb3RlOiBJbiB0aGUgZGV2ZWxvcG1lbnQgYnVpbGQsIGBfLnRlbXBsYXRlYCB1dGlsaXplcyBzb3VyY2VVUkxzIGZvciBlYXNpZXJcbiAqIGRlYnVnZ2luZy4gU2VlIGh0dHA6Ly93d3cuaHRtbDVyb2Nrcy5jb20vZW4vdHV0b3JpYWxzL2RldmVsb3BlcnRvb2xzL3NvdXJjZW1hcHMvI3RvYy1zb3VyY2V1cmxcbiAqXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBwcmVjb21waWxpbmcgdGVtcGxhdGVzIHNlZTpcbiAqIGh0dHA6Ly9sb2Rhc2guY29tL2N1c3RvbS1idWlsZHNcbiAqXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBDaHJvbWUgZXh0ZW5zaW9uIHNhbmRib3hlcyBzZWU6XG4gKiBodHRwOi8vZGV2ZWxvcGVyLmNocm9tZS5jb20vc3RhYmxlL2V4dGVuc2lvbnMvc2FuZGJveGluZ0V2YWwuaHRtbFxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBUaGUgdGVtcGxhdGUgdGV4dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFRoZSBkYXRhIG9iamVjdCB1c2VkIHRvIHBvcHVsYXRlIHRoZSB0ZXh0LlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuZXNjYXBlXSBUaGUgXCJlc2NhcGVcIiBkZWxpbWl0ZXIuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuZXZhbHVhdGVdIFRoZSBcImV2YWx1YXRlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zLmltcG9ydHNdIEFuIG9iamVjdCB0byBpbXBvcnQgaW50byB0aGUgdGVtcGxhdGUgYXMgbG9jYWwgdmFyaWFibGVzLlxuICogQHBhcmFtIHtSZWdFeHB9IFtvcHRpb25zLmludGVycG9sYXRlXSBUaGUgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbc291cmNlVVJMXSBUaGUgc291cmNlVVJMIG9mIHRoZSB0ZW1wbGF0ZSdzIGNvbXBpbGVkIHNvdXJjZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbdmFyaWFibGVdIFRoZSBkYXRhIG9iamVjdCB2YXJpYWJsZSBuYW1lLlxuICogQHJldHVybnMge0Z1bmN0aW9ufHN0cmluZ30gUmV0dXJucyBhIGNvbXBpbGVkIGZ1bmN0aW9uIHdoZW4gbm8gYGRhdGFgIG9iamVjdFxuICogIGlzIGdpdmVuLCBlbHNlIGl0IHJldHVybnMgdGhlIGludGVycG9sYXRlZCB0ZXh0LlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyB1c2luZyB0aGUgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlciB0byBjcmVhdGUgYSBjb21waWxlZCB0ZW1wbGF0ZVxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8gPCU9IG5hbWUgJT4nKTtcbiAqIGNvbXBpbGVkKHsgJ25hbWUnOiAnZnJlZCcgfSk7XG4gKiAvLyA9PiAnaGVsbG8gZnJlZCdcbiAqXG4gKiAvLyB1c2luZyB0aGUgXCJlc2NhcGVcIiBkZWxpbWl0ZXIgdG8gZXNjYXBlIEhUTUwgaW4gZGF0YSBwcm9wZXJ0eSB2YWx1ZXNcbiAqIF8udGVtcGxhdGUoJzxiPjwlLSB2YWx1ZSAlPjwvYj4nLCB7ICd2YWx1ZSc6ICc8c2NyaXB0PicgfSk7XG4gKiAvLyA9PiAnPGI+Jmx0O3NjcmlwdCZndDs8L2I+J1xuICpcbiAqIC8vIHVzaW5nIHRoZSBcImV2YWx1YXRlXCIgZGVsaW1pdGVyIHRvIGdlbmVyYXRlIEhUTUxcbiAqIHZhciBsaXN0ID0gJzwlIF8uZm9yRWFjaChwZW9wbGUsIGZ1bmN0aW9uKG5hbWUpIHsgJT48bGk+PCUtIG5hbWUgJT48L2xpPjwlIH0pOyAlPic7XG4gKiBfLnRlbXBsYXRlKGxpc3QsIHsgJ3Blb3BsZSc6IFsnZnJlZCcsICdiYXJuZXknXSB9KTtcbiAqIC8vID0+ICc8bGk+ZnJlZDwvbGk+PGxpPmJhcm5leTwvbGk+J1xuICpcbiAqIC8vIHVzaW5nIHRoZSBFUzYgZGVsaW1pdGVyIGFzIGFuIGFsdGVybmF0aXZlIHRvIHRoZSBkZWZhdWx0IFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXJcbiAqIF8udGVtcGxhdGUoJ2hlbGxvICR7IG5hbWUgfScsIHsgJ25hbWUnOiAncGViYmxlcycgfSk7XG4gKiAvLyA9PiAnaGVsbG8gcGViYmxlcydcbiAqXG4gKiAvLyB1c2luZyB0aGUgaW50ZXJuYWwgYHByaW50YCBmdW5jdGlvbiBpbiBcImV2YWx1YXRlXCIgZGVsaW1pdGVyc1xuICogXy50ZW1wbGF0ZSgnPCUgcHJpbnQoXCJoZWxsbyBcIiArIG5hbWUpOyAlPiEnLCB7ICduYW1lJzogJ2Jhcm5leScgfSk7XG4gKiAvLyA9PiAnaGVsbG8gYmFybmV5ISdcbiAqXG4gKiAvLyB1c2luZyBhIGN1c3RvbSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzXG4gKiBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG4gKiAgICdpbnRlcnBvbGF0ZSc6IC97eyhbXFxzXFxTXSs/KX19L2dcbiAqIH07XG4gKlxuICogXy50ZW1wbGF0ZSgnaGVsbG8ge3sgbmFtZSB9fSEnLCB7ICduYW1lJzogJ211c3RhY2hlJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBtdXN0YWNoZSEnXG4gKlxuICogLy8gdXNpbmcgdGhlIGBpbXBvcnRzYCBvcHRpb24gdG8gaW1wb3J0IGpRdWVyeVxuICogdmFyIGxpc3QgPSAnPCUganEuZWFjaChwZW9wbGUsIGZ1bmN0aW9uKG5hbWUpIHsgJT48bGk+PCUtIG5hbWUgJT48L2xpPjwlIH0pOyAlPic7XG4gKiBfLnRlbXBsYXRlKGxpc3QsIHsgJ3Blb3BsZSc6IFsnZnJlZCcsICdiYXJuZXknXSB9LCB7ICdpbXBvcnRzJzogeyAnanEnOiBqUXVlcnkgfSB9KTtcbiAqIC8vID0+ICc8bGk+ZnJlZDwvbGk+PGxpPmJhcm5leTwvbGk+J1xuICpcbiAqIC8vIHVzaW5nIHRoZSBgc291cmNlVVJMYCBvcHRpb24gdG8gc3BlY2lmeSBhIGN1c3RvbSBzb3VyY2VVUkwgZm9yIHRoZSB0ZW1wbGF0ZVxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8gPCU9IG5hbWUgJT4nLCBudWxsLCB7ICdzb3VyY2VVUkwnOiAnL2Jhc2ljL2dyZWV0aW5nLmpzdCcgfSk7XG4gKiBjb21waWxlZChkYXRhKTtcbiAqIC8vID0+IGZpbmQgdGhlIHNvdXJjZSBvZiBcImdyZWV0aW5nLmpzdFwiIHVuZGVyIHRoZSBTb3VyY2VzIHRhYiBvciBSZXNvdXJjZXMgcGFuZWwgb2YgdGhlIHdlYiBpbnNwZWN0b3JcbiAqXG4gKiAvLyB1c2luZyB0aGUgYHZhcmlhYmxlYCBvcHRpb24gdG8gZW5zdXJlIGEgd2l0aC1zdGF0ZW1lbnQgaXNuJ3QgdXNlZCBpbiB0aGUgY29tcGlsZWQgdGVtcGxhdGVcbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hpIDwlPSBkYXRhLm5hbWUgJT4hJywgbnVsbCwgeyAndmFyaWFibGUnOiAnZGF0YScgfSk7XG4gKiBjb21waWxlZC5zb3VyY2U7XG4gKiAvLyA9PiBmdW5jdGlvbihkYXRhKSB7XG4gKiAgIHZhciBfX3QsIF9fcCA9ICcnLCBfX2UgPSBfLmVzY2FwZTtcbiAqICAgX19wICs9ICdoaSAnICsgKChfX3QgPSAoIGRhdGEubmFtZSApKSA9PSBudWxsID8gJycgOiBfX3QpICsgJyEnO1xuICogICByZXR1cm4gX19wO1xuICogfVxuICpcbiAqIC8vIHVzaW5nIHRoZSBgc291cmNlYCBwcm9wZXJ0eSB0byBpbmxpbmUgY29tcGlsZWQgdGVtcGxhdGVzIGZvciBtZWFuaW5nZnVsXG4gKiAvLyBsaW5lIG51bWJlcnMgaW4gZXJyb3IgbWVzc2FnZXMgYW5kIGEgc3RhY2sgdHJhY2VcbiAqIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKGN3ZCwgJ2pzdC5qcycpLCAnXFxcbiAqICAgdmFyIEpTVCA9IHtcXFxuICogICAgIFwibWFpblwiOiAnICsgXy50ZW1wbGF0ZShtYWluVGV4dCkuc291cmNlICsgJ1xcXG4gKiAgIH07XFxcbiAqICcpO1xuICovXG5mdW5jdGlvbiB0ZW1wbGF0ZSh0ZXh0LCBkYXRhLCBvcHRpb25zKSB7XG4gIC8vIGJhc2VkIG9uIEpvaG4gUmVzaWcncyBgdG1wbGAgaW1wbGVtZW50YXRpb25cbiAgLy8gaHR0cDovL2Vqb2huLm9yZy9ibG9nL2phdmFzY3JpcHQtbWljcm8tdGVtcGxhdGluZy9cbiAgLy8gYW5kIExhdXJhIERva3Rvcm92YSdzIGRvVC5qc1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vb2xhZG8vZG9UXG4gIHZhciBzZXR0aW5ncyA9IHRlbXBsYXRlU2V0dGluZ3MuaW1wb3J0cy5fLnRlbXBsYXRlU2V0dGluZ3MgfHwgdGVtcGxhdGVTZXR0aW5ncztcbiAgdGV4dCA9IFN0cmluZyh0ZXh0IHx8ICcnKTtcblxuICAvLyBhdm9pZCBtaXNzaW5nIGRlcGVuZGVuY2llcyB3aGVuIGBpdGVyYXRvclRlbXBsYXRlYCBpcyBub3QgZGVmaW5lZFxuICBvcHRpb25zID0gZGVmYXVsdHMoe30sIG9wdGlvbnMsIHNldHRpbmdzKTtcblxuICB2YXIgaW1wb3J0cyA9IGRlZmF1bHRzKHt9LCBvcHRpb25zLmltcG9ydHMsIHNldHRpbmdzLmltcG9ydHMpLFxuICAgICAgaW1wb3J0c0tleXMgPSBrZXlzKGltcG9ydHMpLFxuICAgICAgaW1wb3J0c1ZhbHVlcyA9IHZhbHVlcyhpbXBvcnRzKTtcblxuICB2YXIgaXNFdmFsdWF0aW5nLFxuICAgICAgaW5kZXggPSAwLFxuICAgICAgaW50ZXJwb2xhdGUgPSBvcHRpb25zLmludGVycG9sYXRlIHx8IHJlTm9NYXRjaCxcbiAgICAgIHNvdXJjZSA9IFwiX19wICs9ICdcIjtcblxuICAvLyBjb21waWxlIHRoZSByZWdleHAgdG8gbWF0Y2ggZWFjaCBkZWxpbWl0ZXJcbiAgdmFyIHJlRGVsaW1pdGVycyA9IFJlZ0V4cChcbiAgICAob3B0aW9ucy5lc2NhcGUgfHwgcmVOb01hdGNoKS5zb3VyY2UgKyAnfCcgK1xuICAgIGludGVycG9sYXRlLnNvdXJjZSArICd8JyArXG4gICAgKGludGVycG9sYXRlID09PSByZUludGVycG9sYXRlID8gcmVFc1RlbXBsYXRlIDogcmVOb01hdGNoKS5zb3VyY2UgKyAnfCcgK1xuICAgIChvcHRpb25zLmV2YWx1YXRlIHx8IHJlTm9NYXRjaCkuc291cmNlICsgJ3wkJ1xuICAsICdnJyk7XG5cbiAgdGV4dC5yZXBsYWNlKHJlRGVsaW1pdGVycywgZnVuY3Rpb24obWF0Y2gsIGVzY2FwZVZhbHVlLCBpbnRlcnBvbGF0ZVZhbHVlLCBlc1RlbXBsYXRlVmFsdWUsIGV2YWx1YXRlVmFsdWUsIG9mZnNldCkge1xuICAgIGludGVycG9sYXRlVmFsdWUgfHwgKGludGVycG9sYXRlVmFsdWUgPSBlc1RlbXBsYXRlVmFsdWUpO1xuXG4gICAgLy8gZXNjYXBlIGNoYXJhY3RlcnMgdGhhdCBjYW5ub3QgYmUgaW5jbHVkZWQgaW4gc3RyaW5nIGxpdGVyYWxzXG4gICAgc291cmNlICs9IHRleHQuc2xpY2UoaW5kZXgsIG9mZnNldCkucmVwbGFjZShyZVVuZXNjYXBlZFN0cmluZywgZXNjYXBlU3RyaW5nQ2hhcik7XG5cbiAgICAvLyByZXBsYWNlIGRlbGltaXRlcnMgd2l0aCBzbmlwcGV0c1xuICAgIGlmIChlc2NhcGVWYWx1ZSkge1xuICAgICAgc291cmNlICs9IFwiJyArXFxuX19lKFwiICsgZXNjYXBlVmFsdWUgKyBcIikgK1xcbidcIjtcbiAgICB9XG4gICAgaWYgKGV2YWx1YXRlVmFsdWUpIHtcbiAgICAgIGlzRXZhbHVhdGluZyA9IHRydWU7XG4gICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGVWYWx1ZSArIFwiO1xcbl9fcCArPSAnXCI7XG4gICAgfVxuICAgIGlmIChpbnRlcnBvbGF0ZVZhbHVlKSB7XG4gICAgICBzb3VyY2UgKz0gXCInICtcXG4oKF9fdCA9IChcIiArIGludGVycG9sYXRlVmFsdWUgKyBcIikpID09IG51bGwgPyAnJyA6IF9fdCkgK1xcbidcIjtcbiAgICB9XG4gICAgaW5kZXggPSBvZmZzZXQgKyBtYXRjaC5sZW5ndGg7XG5cbiAgICAvLyB0aGUgSlMgZW5naW5lIGVtYmVkZGVkIGluIEFkb2JlIHByb2R1Y3RzIHJlcXVpcmVzIHJldHVybmluZyB0aGUgYG1hdGNoYFxuICAgIC8vIHN0cmluZyBpbiBvcmRlciB0byBwcm9kdWNlIHRoZSBjb3JyZWN0IGBvZmZzZXRgIHZhbHVlXG4gICAgcmV0dXJuIG1hdGNoO1xuICB9KTtcblxuICBzb3VyY2UgKz0gXCInO1xcblwiO1xuXG4gIC8vIGlmIGB2YXJpYWJsZWAgaXMgbm90IHNwZWNpZmllZCwgd3JhcCBhIHdpdGgtc3RhdGVtZW50IGFyb3VuZCB0aGUgZ2VuZXJhdGVkXG4gIC8vIGNvZGUgdG8gYWRkIHRoZSBkYXRhIG9iamVjdCB0byB0aGUgdG9wIG9mIHRoZSBzY29wZSBjaGFpblxuICB2YXIgdmFyaWFibGUgPSBvcHRpb25zLnZhcmlhYmxlLFxuICAgICAgaGFzVmFyaWFibGUgPSB2YXJpYWJsZTtcblxuICBpZiAoIWhhc1ZhcmlhYmxlKSB7XG4gICAgdmFyaWFibGUgPSAnb2JqJztcbiAgICBzb3VyY2UgPSAnd2l0aCAoJyArIHZhcmlhYmxlICsgJykge1xcbicgKyBzb3VyY2UgKyAnXFxufVxcbic7XG4gIH1cbiAgLy8gY2xlYW51cCBjb2RlIGJ5IHN0cmlwcGluZyBlbXB0eSBzdHJpbmdzXG4gIHNvdXJjZSA9IChpc0V2YWx1YXRpbmcgPyBzb3VyY2UucmVwbGFjZShyZUVtcHR5U3RyaW5nTGVhZGluZywgJycpIDogc291cmNlKVxuICAgIC5yZXBsYWNlKHJlRW1wdHlTdHJpbmdNaWRkbGUsICckMScpXG4gICAgLnJlcGxhY2UocmVFbXB0eVN0cmluZ1RyYWlsaW5nLCAnJDE7Jyk7XG5cbiAgLy8gZnJhbWUgY29kZSBhcyB0aGUgZnVuY3Rpb24gYm9keVxuICBzb3VyY2UgPSAnZnVuY3Rpb24oJyArIHZhcmlhYmxlICsgJykge1xcbicgK1xuICAgIChoYXNWYXJpYWJsZSA/ICcnIDogdmFyaWFibGUgKyAnIHx8ICgnICsgdmFyaWFibGUgKyAnID0ge30pO1xcbicpICtcbiAgICBcInZhciBfX3QsIF9fcCA9ICcnLCBfX2UgPSBfLmVzY2FwZVwiICtcbiAgICAoaXNFdmFsdWF0aW5nXG4gICAgICA/ICcsIF9faiA9IEFycmF5LnByb3RvdHlwZS5qb2luO1xcbicgK1xuICAgICAgICBcImZ1bmN0aW9uIHByaW50KCkgeyBfX3AgKz0gX19qLmNhbGwoYXJndW1lbnRzLCAnJykgfVxcblwiXG4gICAgICA6ICc7XFxuJ1xuICAgICkgK1xuICAgIHNvdXJjZSArXG4gICAgJ3JldHVybiBfX3BcXG59JztcblxuICB0cnkge1xuICAgIHZhciByZXN1bHQgPSBGdW5jdGlvbihpbXBvcnRzS2V5cywgJ3JldHVybiAnICsgc291cmNlICkuYXBwbHkodW5kZWZpbmVkLCBpbXBvcnRzVmFsdWVzKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgZS5zb3VyY2UgPSBzb3VyY2U7XG4gICAgdGhyb3cgZTtcbiAgfVxuICBpZiAoZGF0YSkge1xuICAgIHJldHVybiByZXN1bHQoZGF0YSk7XG4gIH1cbiAgLy8gcHJvdmlkZSB0aGUgY29tcGlsZWQgZnVuY3Rpb24ncyBzb3VyY2UgYnkgaXRzIGB0b1N0cmluZ2AgbWV0aG9kLCBpblxuICAvLyBzdXBwb3J0ZWQgZW52aXJvbm1lbnRzLCBvciB0aGUgYHNvdXJjZWAgcHJvcGVydHkgYXMgYSBjb252ZW5pZW5jZSBmb3JcbiAgLy8gaW5saW5pbmcgY29tcGlsZWQgdGVtcGxhdGVzIGR1cmluZyB0aGUgYnVpbGQgcHJvY2Vzc1xuICByZXN1bHQuc291cmNlID0gc291cmNlO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqIFVzZWQgdG8gZXNjYXBlIGNoYXJhY3RlcnMgZm9yIGluY2x1c2lvbiBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMgKi9cbnZhciBzdHJpbmdFc2NhcGVzID0ge1xuICAnXFxcXCc6ICdcXFxcJyxcbiAgXCInXCI6IFwiJ1wiLFxuICAnXFxuJzogJ24nLFxuICAnXFxyJzogJ3InLFxuICAnXFx0JzogJ3QnLFxuICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICdcXHUyMDI5JzogJ3UyMDI5J1xufTtcblxuLyoqXG4gKiBVc2VkIGJ5IGB0ZW1wbGF0ZWAgdG8gZXNjYXBlIGNoYXJhY3RlcnMgZm9yIGluY2x1c2lvbiBpbiBjb21waWxlZFxuICogc3RyaW5nIGxpdGVyYWxzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gbWF0Y2ggVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICovXG5mdW5jdGlvbiBlc2NhcGVTdHJpbmdDaGFyKG1hdGNoKSB7XG4gIHJldHVybiAnXFxcXCcgKyBzdHJpbmdFc2NhcGVzW21hdGNoXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlc2NhcGVTdHJpbmdDaGFyO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqIFVzZWQgdG8gbWF0Y2ggXCJpbnRlcnBvbGF0ZVwiIHRlbXBsYXRlIGRlbGltaXRlcnMgKi9cbnZhciByZUludGVycG9sYXRlID0gLzwlPShbXFxzXFxTXSs/KSU+L2c7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVJbnRlcnBvbGF0ZTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIga2V5cyA9IHJlcXVpcmUoJ2xvZGFzaC5rZXlzJyksXG4gICAgb2JqZWN0VHlwZXMgPSByZXF1aXJlKCdsb2Rhc2guX29iamVjdHR5cGVzJyk7XG5cbi8qKlxuICogQXNzaWducyBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIHNvdXJjZSBvYmplY3QocykgdG8gdGhlIGRlc3RpbmF0aW9uXG4gKiBvYmplY3QgZm9yIGFsbCBkZXN0aW5hdGlvbiBwcm9wZXJ0aWVzIHRoYXQgcmVzb2x2ZSB0byBgdW5kZWZpbmVkYC4gT25jZSBhXG4gKiBwcm9wZXJ0eSBpcyBzZXQsIGFkZGl0aW9uYWwgZGVmYXVsdHMgb2YgdGhlIHNhbWUgcHJvcGVydHkgd2lsbCBiZSBpZ25vcmVkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAdHlwZSBGdW5jdGlvblxuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7Li4uT2JqZWN0fSBbc291cmNlXSBUaGUgc291cmNlIG9iamVjdHMuXG4gKiBAcGFyYW0tIHtPYmplY3R9IFtndWFyZF0gQWxsb3dzIHdvcmtpbmcgd2l0aCBgXy5yZWR1Y2VgIHdpdGhvdXQgdXNpbmcgaXRzXG4gKiAgYGtleWAgYW5kIGBvYmplY3RgIGFyZ3VtZW50cyBhcyBzb3VyY2VzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnbmFtZSc6ICdiYXJuZXknIH07XG4gKiBfLmRlZmF1bHRzKG9iamVjdCwgeyAnbmFtZSc6ICdmcmVkJywgJ2VtcGxveWVyJzogJ3NsYXRlJyB9KTtcbiAqIC8vID0+IHsgJ25hbWUnOiAnYmFybmV5JywgJ2VtcGxveWVyJzogJ3NsYXRlJyB9XG4gKi9cbnZhciBkZWZhdWx0cyA9IGZ1bmN0aW9uKG9iamVjdCwgc291cmNlLCBndWFyZCkge1xuICB2YXIgaW5kZXgsIGl0ZXJhYmxlID0gb2JqZWN0LCByZXN1bHQgPSBpdGVyYWJsZTtcbiAgaWYgKCFpdGVyYWJsZSkgcmV0dXJuIHJlc3VsdDtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICBhcmdzSW5kZXggPSAwLFxuICAgICAgYXJnc0xlbmd0aCA9IHR5cGVvZiBndWFyZCA9PSAnbnVtYmVyJyA/IDIgOiBhcmdzLmxlbmd0aDtcbiAgd2hpbGUgKCsrYXJnc0luZGV4IDwgYXJnc0xlbmd0aCkge1xuICAgIGl0ZXJhYmxlID0gYXJnc1thcmdzSW5kZXhdO1xuICAgIGlmIChpdGVyYWJsZSAmJiBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdKSB7XG4gICAgdmFyIG93bkluZGV4ID0gLTEsXG4gICAgICAgIG93blByb3BzID0gb2JqZWN0VHlwZXNbdHlwZW9mIGl0ZXJhYmxlXSAmJiBrZXlzKGl0ZXJhYmxlKSxcbiAgICAgICAgbGVuZ3RoID0gb3duUHJvcHMgPyBvd25Qcm9wcy5sZW5ndGggOiAwO1xuXG4gICAgd2hpbGUgKCsrb3duSW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIGluZGV4ID0gb3duUHJvcHNbb3duSW5kZXhdO1xuICAgICAgaWYgKHR5cGVvZiByZXN1bHRbaW5kZXhdID09ICd1bmRlZmluZWQnKSByZXN1bHRbaW5kZXhdID0gaXRlcmFibGVbaW5kZXhdO1xuICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgZXNjYXBlSHRtbENoYXIgPSByZXF1aXJlKCdsb2Rhc2guX2VzY2FwZWh0bWxjaGFyJyksXG4gICAga2V5cyA9IHJlcXVpcmUoJ2xvZGFzaC5rZXlzJyksXG4gICAgcmVVbmVzY2FwZWRIdG1sID0gcmVxdWlyZSgnbG9kYXNoLl9yZXVuZXNjYXBlZGh0bWwnKTtcblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUgY2hhcmFjdGVycyBgJmAsIGA8YCwgYD5gLCBgXCJgLCBhbmQgYCdgIGluIGBzdHJpbmdgIHRvIHRoZWlyXG4gKiBjb3JyZXNwb25kaW5nIEhUTUwgZW50aXRpZXMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgVGhlIHN0cmluZyB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5lc2NhcGUoJ0ZyZWQsIFdpbG1hLCAmIFBlYmJsZXMnKTtcbiAqIC8vID0+ICdGcmVkLCBXaWxtYSwgJmFtcDsgUGViYmxlcydcbiAqL1xuZnVuY3Rpb24gZXNjYXBlKHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nID09IG51bGwgPyAnJyA6IFN0cmluZyhzdHJpbmcpLnJlcGxhY2UocmVVbmVzY2FwZWRIdG1sLCBlc2NhcGVIdG1sQ2hhcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXNjYXBlO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBodG1sRXNjYXBlcyA9IHJlcXVpcmUoJ2xvZGFzaC5faHRtbGVzY2FwZXMnKTtcblxuLyoqXG4gKiBVc2VkIGJ5IGBlc2NhcGVgIHRvIGNvbnZlcnQgY2hhcmFjdGVycyB0byBIVE1MIGVudGl0aWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gbWF0Y2ggVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICovXG5mdW5jdGlvbiBlc2NhcGVIdG1sQ2hhcihtYXRjaCkge1xuICByZXR1cm4gaHRtbEVzY2FwZXNbbWF0Y2hdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVzY2FwZUh0bWxDaGFyO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBVc2VkIHRvIGNvbnZlcnQgY2hhcmFjdGVycyB0byBIVE1MIGVudGl0aWVzOlxuICpcbiAqIFRob3VnaCB0aGUgYD5gIGNoYXJhY3RlciBpcyBlc2NhcGVkIGZvciBzeW1tZXRyeSwgY2hhcmFjdGVycyBsaWtlIGA+YCBhbmQgYC9gXG4gKiBkb24ndCByZXF1aXJlIGVzY2FwaW5nIGluIEhUTUwgYW5kIGhhdmUgbm8gc3BlY2lhbCBtZWFuaW5nIHVubGVzcyB0aGV5J3JlIHBhcnRcbiAqIG9mIGEgdGFnIG9yIGFuIHVucXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZS5cbiAqIGh0dHA6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2FtYmlndW91cy1hbXBlcnNhbmRzICh1bmRlciBcInNlbWktcmVsYXRlZCBmdW4gZmFjdFwiKVxuICovXG52YXIgaHRtbEVzY2FwZXMgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7JyxcbiAgXCInXCI6ICcmIzM5Oydcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaHRtbEVzY2FwZXM7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGh0bWxFc2NhcGVzID0gcmVxdWlyZSgnbG9kYXNoLl9odG1sZXNjYXBlcycpLFxuICAgIGtleXMgPSByZXF1aXJlKCdsb2Rhc2gua2V5cycpO1xuXG4vKiogVXNlZCB0byBtYXRjaCBIVE1MIGVudGl0aWVzIGFuZCBIVE1MIGNoYXJhY3RlcnMgKi9cbnZhciByZVVuZXNjYXBlZEh0bWwgPSBSZWdFeHAoJ1snICsga2V5cyhodG1sRXNjYXBlcykuam9pbignJykgKyAnXScsICdnJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVVbmVzY2FwZWRIdG1sO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBlc2NhcGUgPSByZXF1aXJlKCdsb2Rhc2guZXNjYXBlJyksXG4gICAgcmVJbnRlcnBvbGF0ZSA9IHJlcXVpcmUoJ2xvZGFzaC5fcmVpbnRlcnBvbGF0ZScpO1xuXG4vKipcbiAqIEJ5IGRlZmF1bHQsIHRoZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzIHVzZWQgYnkgTG8tRGFzaCBhcmUgc2ltaWxhciB0byB0aG9zZSBpblxuICogZW1iZWRkZWQgUnVieSAoRVJCKS4gQ2hhbmdlIHRoZSBmb2xsb3dpbmcgdGVtcGxhdGUgc2V0dGluZ3MgdG8gdXNlIGFsdGVybmF0aXZlXG4gKiBkZWxpbWl0ZXJzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAdHlwZSBPYmplY3RcbiAqL1xudmFyIHRlbXBsYXRlU2V0dGluZ3MgPSB7XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZGV0ZWN0IGBkYXRhYCBwcm9wZXJ0eSB2YWx1ZXMgdG8gYmUgSFRNTC1lc2NhcGVkLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIFJlZ0V4cFxuICAgKi9cbiAgJ2VzY2FwZSc6IC88JS0oW1xcc1xcU10rPyklPi9nLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGRldGVjdCBjb2RlIHRvIGJlIGV2YWx1YXRlZC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSBSZWdFeHBcbiAgICovXG4gICdldmFsdWF0ZSc6IC88JShbXFxzXFxTXSs/KSU+L2csXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZGV0ZWN0IGBkYXRhYCBwcm9wZXJ0eSB2YWx1ZXMgdG8gaW5qZWN0LlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIFJlZ0V4cFxuICAgKi9cbiAgJ2ludGVycG9sYXRlJzogcmVJbnRlcnBvbGF0ZSxcblxuICAvKipcbiAgICogVXNlZCB0byByZWZlcmVuY2UgdGhlIGRhdGEgb2JqZWN0IGluIHRoZSB0ZW1wbGF0ZSB0ZXh0LlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIHN0cmluZ1xuICAgKi9cbiAgJ3ZhcmlhYmxlJzogJycsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gaW1wb3J0IHZhcmlhYmxlcyBpbnRvIHRoZSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSBPYmplY3RcbiAgICovXG4gICdpbXBvcnRzJzoge1xuXG4gICAgLyoqXG4gICAgICogQSByZWZlcmVuY2UgdG8gdGhlIGBsb2Rhc2hgIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5ncy5pbXBvcnRzXG4gICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgKi9cbiAgICAnXyc6IHsgJ2VzY2FwZSc6IGVzY2FwZSB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGVTZXR0aW5ncztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIga2V5cyA9IHJlcXVpcmUoJ2xvZGFzaC5rZXlzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBjb21wb3NlZCBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgdmFsdWVzIG9mIGBvYmplY3RgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2YgcHJvcGVydHkgdmFsdWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnZhbHVlcyh7ICdvbmUnOiAxLCAndHdvJzogMiwgJ3RocmVlJzogMyB9KTtcbiAqIC8vID0+IFsxLCAyLCAzXSAocHJvcGVydHkgb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50cylcbiAqL1xuZnVuY3Rpb24gdmFsdWVzKG9iamVjdCkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHByb3BzID0ga2V5cyhvYmplY3QpLFxuICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHJlc3VsdFtpbmRleF0gPSBvYmplY3RbcHJvcHNbaW5kZXhdXTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHZhbHVlcztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKiBVc2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRHMgKi9cbnZhciBpZENvdW50ZXIgPSAwO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHVuaXF1ZSBJRC4gSWYgYHByZWZpeGAgaXMgcHJvdmlkZWQgdGhlIElEIHdpbGwgYmUgYXBwZW5kZWQgdG8gaXQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAqIEBwYXJhbSB7c3RyaW5nfSBbcHJlZml4XSBUaGUgdmFsdWUgdG8gcHJlZml4IHRoZSBJRCB3aXRoLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgdW5pcXVlIElELlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnVuaXF1ZUlkKCdjb250YWN0XycpO1xuICogLy8gPT4gJ2NvbnRhY3RfMTA0J1xuICpcbiAqIF8udW5pcXVlSWQoKTtcbiAqIC8vID0+ICcxMDUnXG4gKi9cbmZ1bmN0aW9uIHVuaXF1ZUlkKHByZWZpeCkge1xuICB2YXIgaWQgPSArK2lkQ291bnRlcjtcbiAgcmV0dXJuIFN0cmluZyhwcmVmaXggPT0gbnVsbCA/ICcnIDogcHJlZml4KSArIGlkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHVuaXF1ZUlkO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxNCBGZWxpeCBHbmFzc1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbihmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XG5cbiAgLyogQ29tbW9uSlMgKi9cbiAgaWYgKHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnKSAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KClcblxuICAvKiBBTUQgbW9kdWxlICovXG4gIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoZmFjdG9yeSlcblxuICAvKiBCcm93c2VyIGdsb2JhbCAqL1xuICBlbHNlIHJvb3QuU3Bpbm5lciA9IGZhY3RvcnkoKVxufVxuKHRoaXMsIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgcHJlZml4ZXMgPSBbJ3dlYmtpdCcsICdNb3onLCAnbXMnLCAnTyddIC8qIFZlbmRvciBwcmVmaXhlcyAqL1xuICAgICwgYW5pbWF0aW9ucyA9IHt9IC8qIEFuaW1hdGlvbiBydWxlcyBrZXllZCBieSB0aGVpciBuYW1lICovXG4gICAgLCB1c2VDc3NBbmltYXRpb25zIC8qIFdoZXRoZXIgdG8gdXNlIENTUyBhbmltYXRpb25zIG9yIHNldFRpbWVvdXQgKi9cblxuICAvKipcbiAgICogVXRpbGl0eSBmdW5jdGlvbiB0byBjcmVhdGUgZWxlbWVudHMuIElmIG5vIHRhZyBuYW1lIGlzIGdpdmVuLFxuICAgKiBhIERJViBpcyBjcmVhdGVkLiBPcHRpb25hbGx5IHByb3BlcnRpZXMgY2FuIGJlIHBhc3NlZC5cbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZUVsKHRhZywgcHJvcCkge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnIHx8ICdkaXYnKVxuICAgICAgLCBuXG5cbiAgICBmb3IobiBpbiBwcm9wKSBlbFtuXSA9IHByb3Bbbl1cbiAgICByZXR1cm4gZWxcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmRzIGNoaWxkcmVuIGFuZCByZXR1cm5zIHRoZSBwYXJlbnQuXG4gICAqL1xuICBmdW5jdGlvbiBpbnMocGFyZW50IC8qIGNoaWxkMSwgY2hpbGQyLCAuLi4qLykge1xuICAgIGZvciAodmFyIGk9MSwgbj1hcmd1bWVudHMubGVuZ3RoOyBpPG47IGkrKylcbiAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChhcmd1bWVudHNbaV0pXG5cbiAgICByZXR1cm4gcGFyZW50XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0IGEgbmV3IHN0eWxlc2hlZXQgdG8gaG9sZCB0aGUgQGtleWZyYW1lIG9yIFZNTCBydWxlcy5cbiAgICovXG4gIHZhciBzaGVldCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgZWwgPSBjcmVhdGVFbCgnc3R5bGUnLCB7dHlwZSA6ICd0ZXh0L2Nzcyd9KVxuICAgIGlucyhkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLCBlbClcbiAgICByZXR1cm4gZWwuc2hlZXQgfHwgZWwuc3R5bGVTaGVldFxuICB9KCkpXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gb3BhY2l0eSBrZXlmcmFtZSBhbmltYXRpb24gcnVsZSBhbmQgcmV0dXJucyBpdHMgbmFtZS5cbiAgICogU2luY2UgbW9zdCBtb2JpbGUgV2Via2l0cyBoYXZlIHRpbWluZyBpc3N1ZXMgd2l0aCBhbmltYXRpb24tZGVsYXksXG4gICAqIHdlIGNyZWF0ZSBzZXBhcmF0ZSBydWxlcyBmb3IgZWFjaCBsaW5lL3NlZ21lbnQuXG4gICAqL1xuICBmdW5jdGlvbiBhZGRBbmltYXRpb24oYWxwaGEsIHRyYWlsLCBpLCBsaW5lcykge1xuICAgIHZhciBuYW1lID0gWydvcGFjaXR5JywgdHJhaWwsIH5+KGFscGhhKjEwMCksIGksIGxpbmVzXS5qb2luKCctJylcbiAgICAgICwgc3RhcnQgPSAwLjAxICsgaS9saW5lcyAqIDEwMFxuICAgICAgLCB6ID0gTWF0aC5tYXgoMSAtICgxLWFscGhhKSAvIHRyYWlsICogKDEwMC1zdGFydCksIGFscGhhKVxuICAgICAgLCBwcmVmaXggPSB1c2VDc3NBbmltYXRpb25zLnN1YnN0cmluZygwLCB1c2VDc3NBbmltYXRpb25zLmluZGV4T2YoJ0FuaW1hdGlvbicpKS50b0xvd2VyQ2FzZSgpXG4gICAgICAsIHByZSA9IHByZWZpeCAmJiAnLScgKyBwcmVmaXggKyAnLScgfHwgJydcblxuICAgIGlmICghYW5pbWF0aW9uc1tuYW1lXSkge1xuICAgICAgc2hlZXQuaW5zZXJ0UnVsZShcbiAgICAgICAgJ0AnICsgcHJlICsgJ2tleWZyYW1lcyAnICsgbmFtZSArICd7JyArXG4gICAgICAgICcwJXtvcGFjaXR5OicgKyB6ICsgJ30nICtcbiAgICAgICAgc3RhcnQgKyAnJXtvcGFjaXR5OicgKyBhbHBoYSArICd9JyArXG4gICAgICAgIChzdGFydCswLjAxKSArICcle29wYWNpdHk6MX0nICtcbiAgICAgICAgKHN0YXJ0K3RyYWlsKSAlIDEwMCArICcle29wYWNpdHk6JyArIGFscGhhICsgJ30nICtcbiAgICAgICAgJzEwMCV7b3BhY2l0eTonICsgeiArICd9JyArXG4gICAgICAgICd9Jywgc2hlZXQuY3NzUnVsZXMubGVuZ3RoKVxuXG4gICAgICBhbmltYXRpb25zW25hbWVdID0gMVxuICAgIH1cblxuICAgIHJldHVybiBuYW1lXG4gIH1cblxuICAvKipcbiAgICogVHJpZXMgdmFyaW91cyB2ZW5kb3IgcHJlZml4ZXMgYW5kIHJldHVybnMgdGhlIGZpcnN0IHN1cHBvcnRlZCBwcm9wZXJ0eS5cbiAgICovXG4gIGZ1bmN0aW9uIHZlbmRvcihlbCwgcHJvcCkge1xuICAgIHZhciBzID0gZWwuc3R5bGVcbiAgICAgICwgcHBcbiAgICAgICwgaVxuXG4gICAgcHJvcCA9IHByb3AuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLnNsaWNlKDEpXG4gICAgZm9yKGk9MDsgaTxwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuICAgICAgcHAgPSBwcmVmaXhlc1tpXStwcm9wXG4gICAgICBpZihzW3BwXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gcHBcbiAgICB9XG4gICAgaWYoc1twcm9wXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gcHJvcFxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgbXVsdGlwbGUgc3R5bGUgcHJvcGVydGllcyBhdCBvbmNlLlxuICAgKi9cbiAgZnVuY3Rpb24gY3NzKGVsLCBwcm9wKSB7XG4gICAgZm9yICh2YXIgbiBpbiBwcm9wKVxuICAgICAgZWwuc3R5bGVbdmVuZG9yKGVsLCBuKXx8bl0gPSBwcm9wW25dXG5cbiAgICByZXR1cm4gZWxcbiAgfVxuXG4gIC8qKlxuICAgKiBGaWxscyBpbiBkZWZhdWx0IHZhbHVlcy5cbiAgICovXG4gIGZ1bmN0aW9uIG1lcmdlKG9iaikge1xuICAgIGZvciAodmFyIGk9MTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlZiA9IGFyZ3VtZW50c1tpXVxuICAgICAgZm9yICh2YXIgbiBpbiBkZWYpXG4gICAgICAgIGlmIChvYmpbbl0gPT09IHVuZGVmaW5lZCkgb2JqW25dID0gZGVmW25dXG4gICAgfVxuICAgIHJldHVybiBvYmpcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhYnNvbHV0ZSBwYWdlLW9mZnNldCBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICovXG4gIGZ1bmN0aW9uIHBvcyhlbCkge1xuICAgIHZhciBvID0geyB4OmVsLm9mZnNldExlZnQsIHk6ZWwub2Zmc2V0VG9wIH1cbiAgICB3aGlsZSgoZWwgPSBlbC5vZmZzZXRQYXJlbnQpKVxuICAgICAgby54Kz1lbC5vZmZzZXRMZWZ0LCBvLnkrPWVsLm9mZnNldFRvcFxuXG4gICAgcmV0dXJuIG9cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBsaW5lIGNvbG9yIGZyb20gdGhlIGdpdmVuIHN0cmluZyBvciBhcnJheS5cbiAgICovXG4gIGZ1bmN0aW9uIGdldENvbG9yKGNvbG9yLCBpZHgpIHtcbiAgICByZXR1cm4gdHlwZW9mIGNvbG9yID09ICdzdHJpbmcnID8gY29sb3IgOiBjb2xvcltpZHggJSBjb2xvci5sZW5ndGhdXG4gIH1cblxuICAvLyBCdWlsdC1pbiBkZWZhdWx0c1xuXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBsaW5lczogMTIsICAgICAgICAgICAgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgbGVuZ3RoOiA3LCAgICAgICAgICAgIC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXG4gICAgd2lkdGg6IDUsICAgICAgICAgICAgIC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xuICAgIHJhZGl1czogMTAsICAgICAgICAgICAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcbiAgICByb3RhdGU6IDAsICAgICAgICAgICAgLy8gUm90YXRpb24gb2Zmc2V0XG4gICAgY29ybmVyczogMSwgICAgICAgICAgIC8vIFJvdW5kbmVzcyAoMC4uMSlcbiAgICBjb2xvcjogJyMwMDAnLCAgICAgICAgLy8gI3JnYiBvciAjcnJnZ2JiXG4gICAgZGlyZWN0aW9uOiAxLCAgICAgICAgIC8vIDE6IGNsb2Nrd2lzZSwgLTE6IGNvdW50ZXJjbG9ja3dpc2VcbiAgICBzcGVlZDogMSwgICAgICAgICAgICAgLy8gUm91bmRzIHBlciBzZWNvbmRcbiAgICB0cmFpbDogMTAwLCAgICAgICAgICAgLy8gQWZ0ZXJnbG93IHBlcmNlbnRhZ2VcbiAgICBvcGFjaXR5OiAxLzQsICAgICAgICAgLy8gT3BhY2l0eSBvZiB0aGUgbGluZXNcbiAgICBmcHM6IDIwLCAgICAgICAgICAgICAgLy8gRnJhbWVzIHBlciBzZWNvbmQgd2hlbiB1c2luZyBzZXRUaW1lb3V0KClcbiAgICB6SW5kZXg6IDJlOSwgICAgICAgICAgLy8gVXNlIGEgaGlnaCB6LWluZGV4IGJ5IGRlZmF1bHRcbiAgICBjbGFzc05hbWU6ICdzcGlubmVyJywgLy8gQ1NTIGNsYXNzIHRvIGFzc2lnbiB0byB0aGUgZWxlbWVudFxuICAgIHRvcDogJzUwJScsICAgICAgICAgICAvLyBjZW50ZXIgdmVydGljYWxseVxuICAgIGxlZnQ6ICc1MCUnLCAgICAgICAgICAvLyBjZW50ZXIgaG9yaXpvbnRhbGx5XG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScgIC8vIGVsZW1lbnQgcG9zaXRpb25cbiAgfVxuXG4gIC8qKiBUaGUgY29uc3RydWN0b3IgKi9cbiAgZnVuY3Rpb24gU3Bpbm5lcihvKSB7XG4gICAgdGhpcy5vcHRzID0gbWVyZ2UobyB8fCB7fSwgU3Bpbm5lci5kZWZhdWx0cywgZGVmYXVsdHMpXG4gIH1cblxuICAvLyBHbG9iYWwgZGVmYXVsdHMgdGhhdCBvdmVycmlkZSB0aGUgYnVpbHQtaW5zOlxuICBTcGlubmVyLmRlZmF1bHRzID0ge31cblxuICBtZXJnZShTcGlubmVyLnByb3RvdHlwZSwge1xuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgc3Bpbm5lciB0byB0aGUgZ2l2ZW4gdGFyZ2V0IGVsZW1lbnQuIElmIHRoaXMgaW5zdGFuY2UgaXMgYWxyZWFkeVxuICAgICAqIHNwaW5uaW5nLCBpdCBpcyBhdXRvbWF0aWNhbGx5IHJlbW92ZWQgZnJvbSBpdHMgcHJldmlvdXMgdGFyZ2V0IGIgY2FsbGluZ1xuICAgICAqIHN0b3AoKSBpbnRlcm5hbGx5LlxuICAgICAqL1xuICAgIHNwaW46IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgdGhpcy5zdG9wKClcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICwgbyA9IHNlbGYub3B0c1xuICAgICAgICAsIGVsID0gc2VsZi5lbCA9IGNzcyhjcmVhdGVFbCgwLCB7Y2xhc3NOYW1lOiBvLmNsYXNzTmFtZX0pLCB7cG9zaXRpb246IG8ucG9zaXRpb24sIHdpZHRoOiAwLCB6SW5kZXg6IG8uekluZGV4fSlcbiAgICAgICAgLCBtaWQgPSBvLnJhZGl1cytvLmxlbmd0aCtvLndpZHRoXG5cbiAgICAgIGNzcyhlbCwge1xuICAgICAgICBsZWZ0OiBvLmxlZnQsXG4gICAgICAgIHRvcDogby50b3BcbiAgICAgIH0pXG4gICAgICAgIFxuICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICB0YXJnZXQuaW5zZXJ0QmVmb3JlKGVsLCB0YXJnZXQuZmlyc3RDaGlsZHx8bnVsbClcbiAgICAgIH1cblxuICAgICAgZWwuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3Byb2dyZXNzYmFyJylcbiAgICAgIHNlbGYubGluZXMoZWwsIHNlbGYub3B0cylcblxuICAgICAgaWYgKCF1c2VDc3NBbmltYXRpb25zKSB7XG4gICAgICAgIC8vIE5vIENTUyBhbmltYXRpb24gc3VwcG9ydCwgdXNlIHNldFRpbWVvdXQoKSBpbnN0ZWFkXG4gICAgICAgIHZhciBpID0gMFxuICAgICAgICAgICwgc3RhcnQgPSAoby5saW5lcyAtIDEpICogKDEgLSBvLmRpcmVjdGlvbikgLyAyXG4gICAgICAgICAgLCBhbHBoYVxuICAgICAgICAgICwgZnBzID0gby5mcHNcbiAgICAgICAgICAsIGYgPSBmcHMvby5zcGVlZFxuICAgICAgICAgICwgb3N0ZXAgPSAoMS1vLm9wYWNpdHkpIC8gKGYqby50cmFpbCAvIDEwMClcbiAgICAgICAgICAsIGFzdGVwID0gZi9vLmxpbmVzXG5cbiAgICAgICAgOyhmdW5jdGlvbiBhbmltKCkge1xuICAgICAgICAgIGkrKztcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG8ubGluZXM7IGorKykge1xuICAgICAgICAgICAgYWxwaGEgPSBNYXRoLm1heCgxIC0gKGkgKyAoby5saW5lcyAtIGopICogYXN0ZXApICUgZiAqIG9zdGVwLCBvLm9wYWNpdHkpXG5cbiAgICAgICAgICAgIHNlbGYub3BhY2l0eShlbCwgaiAqIG8uZGlyZWN0aW9uICsgc3RhcnQsIGFscGhhLCBvKVxuICAgICAgICAgIH1cbiAgICAgICAgICBzZWxmLnRpbWVvdXQgPSBzZWxmLmVsICYmIHNldFRpbWVvdXQoYW5pbSwgfn4oMTAwMC9mcHMpKVxuICAgICAgICB9KSgpXG4gICAgICB9XG4gICAgICByZXR1cm4gc2VsZlxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdG9wcyBhbmQgcmVtb3ZlcyB0aGUgU3Bpbm5lci5cbiAgICAgKi9cbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbCA9IHRoaXMuZWxcbiAgICAgIGlmIChlbCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KVxuICAgICAgICBpZiAoZWwucGFyZW50Tm9kZSkgZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbClcbiAgICAgICAgdGhpcy5lbCA9IHVuZGVmaW5lZFxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW50ZXJuYWwgbWV0aG9kIHRoYXQgZHJhd3MgdGhlIGluZGl2aWR1YWwgbGluZXMuIFdpbGwgYmUgb3ZlcndyaXR0ZW5cbiAgICAgKiBpbiBWTUwgZmFsbGJhY2sgbW9kZSBiZWxvdy5cbiAgICAgKi9cbiAgICBsaW5lczogZnVuY3Rpb24oZWwsIG8pIHtcbiAgICAgIHZhciBpID0gMFxuICAgICAgICAsIHN0YXJ0ID0gKG8ubGluZXMgLSAxKSAqICgxIC0gby5kaXJlY3Rpb24pIC8gMlxuICAgICAgICAsIHNlZ1xuXG4gICAgICBmdW5jdGlvbiBmaWxsKGNvbG9yLCBzaGFkb3cpIHtcbiAgICAgICAgcmV0dXJuIGNzcyhjcmVhdGVFbCgpLCB7XG4gICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgd2lkdGg6IChvLmxlbmd0aCtvLndpZHRoKSArICdweCcsXG4gICAgICAgICAgaGVpZ2h0OiBvLndpZHRoICsgJ3B4JyxcbiAgICAgICAgICBiYWNrZ3JvdW5kOiBjb2xvcixcbiAgICAgICAgICBib3hTaGFkb3c6IHNoYWRvdyxcbiAgICAgICAgICB0cmFuc2Zvcm1PcmlnaW46ICdsZWZ0JyxcbiAgICAgICAgICB0cmFuc2Zvcm06ICdyb3RhdGUoJyArIH5+KDM2MC9vLmxpbmVzKmkrby5yb3RhdGUpICsgJ2RlZykgdHJhbnNsYXRlKCcgKyBvLnJhZGl1cysncHgnICsnLDApJyxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IChvLmNvcm5lcnMgKiBvLndpZHRoPj4xKSArICdweCdcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgZm9yICg7IGkgPCBvLmxpbmVzOyBpKyspIHtcbiAgICAgICAgc2VnID0gY3NzKGNyZWF0ZUVsKCksIHtcbiAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICB0b3A6IDErfihvLndpZHRoLzIpICsgJ3B4JyxcbiAgICAgICAgICB0cmFuc2Zvcm06IG8uaHdhY2NlbCA/ICd0cmFuc2xhdGUzZCgwLDAsMCknIDogJycsXG4gICAgICAgICAgb3BhY2l0eTogby5vcGFjaXR5LFxuICAgICAgICAgIGFuaW1hdGlvbjogdXNlQ3NzQW5pbWF0aW9ucyAmJiBhZGRBbmltYXRpb24oby5vcGFjaXR5LCBvLnRyYWlsLCBzdGFydCArIGkgKiBvLmRpcmVjdGlvbiwgby5saW5lcykgKyAnICcgKyAxL28uc3BlZWQgKyAncyBsaW5lYXIgaW5maW5pdGUnXG4gICAgICAgIH0pXG5cbiAgICAgICAgaWYgKG8uc2hhZG93KSBpbnMoc2VnLCBjc3MoZmlsbCgnIzAwMCcsICcwIDAgNHB4ICcgKyAnIzAwMCcpLCB7dG9wOiAyKydweCd9KSlcbiAgICAgICAgaW5zKGVsLCBpbnMoc2VnLCBmaWxsKGdldENvbG9yKG8uY29sb3IsIGkpLCAnMCAwIDFweCByZ2JhKDAsMCwwLC4xKScpKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnRlcm5hbCBtZXRob2QgdGhhdCBhZGp1c3RzIHRoZSBvcGFjaXR5IG9mIGEgc2luZ2xlIGxpbmUuXG4gICAgICogV2lsbCBiZSBvdmVyd3JpdHRlbiBpbiBWTUwgZmFsbGJhY2sgbW9kZSBiZWxvdy5cbiAgICAgKi9cbiAgICBvcGFjaXR5OiBmdW5jdGlvbihlbCwgaSwgdmFsKSB7XG4gICAgICBpZiAoaSA8IGVsLmNoaWxkTm9kZXMubGVuZ3RoKSBlbC5jaGlsZE5vZGVzW2ldLnN0eWxlLm9wYWNpdHkgPSB2YWxcbiAgICB9XG5cbiAgfSlcblxuXG4gIGZ1bmN0aW9uIGluaXRWTUwoKSB7XG5cbiAgICAvKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIFZNTCB0YWcgKi9cbiAgICBmdW5jdGlvbiB2bWwodGFnLCBhdHRyKSB7XG4gICAgICByZXR1cm4gY3JlYXRlRWwoJzwnICsgdGFnICsgJyB4bWxucz1cInVybjpzY2hlbWFzLW1pY3Jvc29mdC5jb206dm1sXCIgY2xhc3M9XCJzcGluLXZtbFwiPicsIGF0dHIpXG4gICAgfVxuXG4gICAgLy8gTm8gQ1NTIHRyYW5zZm9ybXMgYnV0IFZNTCBzdXBwb3J0LCBhZGQgYSBDU1MgcnVsZSBmb3IgVk1MIGVsZW1lbnRzOlxuICAgIHNoZWV0LmFkZFJ1bGUoJy5zcGluLXZtbCcsICdiZWhhdmlvcjp1cmwoI2RlZmF1bHQjVk1MKScpXG5cbiAgICBTcGlubmVyLnByb3RvdHlwZS5saW5lcyA9IGZ1bmN0aW9uKGVsLCBvKSB7XG4gICAgICB2YXIgciA9IG8ubGVuZ3RoK28ud2lkdGhcbiAgICAgICAgLCBzID0gMipyXG5cbiAgICAgIGZ1bmN0aW9uIGdycCgpIHtcbiAgICAgICAgcmV0dXJuIGNzcyhcbiAgICAgICAgICB2bWwoJ2dyb3VwJywge1xuICAgICAgICAgICAgY29vcmRzaXplOiBzICsgJyAnICsgcyxcbiAgICAgICAgICAgIGNvb3Jkb3JpZ2luOiAtciArICcgJyArIC1yXG4gICAgICAgICAgfSksXG4gICAgICAgICAgeyB3aWR0aDogcywgaGVpZ2h0OiBzIH1cbiAgICAgICAgKVxuICAgICAgfVxuXG4gICAgICB2YXIgbWFyZ2luID0gLShvLndpZHRoK28ubGVuZ3RoKSoyICsgJ3B4J1xuICAgICAgICAsIGcgPSBjc3MoZ3JwKCksIHtwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiBtYXJnaW4sIGxlZnQ6IG1hcmdpbn0pXG4gICAgICAgICwgaVxuXG4gICAgICBmdW5jdGlvbiBzZWcoaSwgZHgsIGZpbHRlcikge1xuICAgICAgICBpbnMoZyxcbiAgICAgICAgICBpbnMoY3NzKGdycCgpLCB7cm90YXRpb246IDM2MCAvIG8ubGluZXMgKiBpICsgJ2RlZycsIGxlZnQ6IH5+ZHh9KSxcbiAgICAgICAgICAgIGlucyhjc3Modm1sKCdyb3VuZHJlY3QnLCB7YXJjc2l6ZTogby5jb3JuZXJzfSksIHtcbiAgICAgICAgICAgICAgICB3aWR0aDogcixcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IG8ud2lkdGgsXG4gICAgICAgICAgICAgICAgbGVmdDogby5yYWRpdXMsXG4gICAgICAgICAgICAgICAgdG9wOiAtby53aWR0aD4+MSxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IGZpbHRlclxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgdm1sKCdmaWxsJywge2NvbG9yOiBnZXRDb2xvcihvLmNvbG9yLCBpKSwgb3BhY2l0eTogby5vcGFjaXR5fSksXG4gICAgICAgICAgICAgIHZtbCgnc3Ryb2tlJywge29wYWNpdHk6IDB9KSAvLyB0cmFuc3BhcmVudCBzdHJva2UgdG8gZml4IGNvbG9yIGJsZWVkaW5nIHVwb24gb3BhY2l0eSBjaGFuZ2VcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgaWYgKG8uc2hhZG93KVxuICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IG8ubGluZXM7IGkrKylcbiAgICAgICAgICBzZWcoaSwgLTIsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuQmx1cihwaXhlbHJhZGl1cz0yLG1ha2VzaGFkb3c9MSxzaGFkb3dvcGFjaXR5PS4zKScpXG5cbiAgICAgIGZvciAoaSA9IDE7IGkgPD0gby5saW5lczsgaSsrKSBzZWcoaSlcbiAgICAgIHJldHVybiBpbnMoZWwsIGcpXG4gICAgfVxuXG4gICAgU3Bpbm5lci5wcm90b3R5cGUub3BhY2l0eSA9IGZ1bmN0aW9uKGVsLCBpLCB2YWwsIG8pIHtcbiAgICAgIHZhciBjID0gZWwuZmlyc3RDaGlsZFxuICAgICAgbyA9IG8uc2hhZG93ICYmIG8ubGluZXMgfHwgMFxuICAgICAgaWYgKGMgJiYgaStvIDwgYy5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICBjID0gYy5jaGlsZE5vZGVzW2krb107IGMgPSBjICYmIGMuZmlyc3RDaGlsZDsgYyA9IGMgJiYgYy5maXJzdENoaWxkXG4gICAgICAgIGlmIChjKSBjLm9wYWNpdHkgPSB2YWxcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgcHJvYmUgPSBjc3MoY3JlYXRlRWwoJ2dyb3VwJyksIHtiZWhhdmlvcjogJ3VybCgjZGVmYXVsdCNWTUwpJ30pXG5cbiAgaWYgKCF2ZW5kb3IocHJvYmUsICd0cmFuc2Zvcm0nKSAmJiBwcm9iZS5hZGopIGluaXRWTUwoKVxuICBlbHNlIHVzZUNzc0FuaW1hdGlvbnMgPSB2ZW5kb3IocHJvYmUsICdhbmltYXRpb24nKVxuXG4gIHJldHVybiBTcGlubmVyXG5cbn0pKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgQmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcblxudmFyIEJsb2NrQ29udHJvbCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdGhpcy50eXBlID0gdHlwZTtcbiAgdGhpcy5ibG9ja190eXBlID0gQmxvY2tzW3RoaXMudHlwZV0ucHJvdG90eXBlO1xuICB0aGlzLmNhbl9iZV9yZW5kZXJlZCA9IHRoaXMuYmxvY2tfdHlwZS50b29sYmFyRW5hYmxlZDtcblxuICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG59O1xuXG5PYmplY3QuYXNzaWduKEJsb2NrQ29udHJvbC5wcm90b3R5cGUsIHJlcXVpcmUoJy4vZnVuY3Rpb24tYmluZCcpLCByZXF1aXJlKCcuL3JlbmRlcmFibGUnKSwgcmVxdWlyZSgnLi9ldmVudHMnKSwge1xuXG4gIHRhZ05hbWU6ICdhJyxcbiAgY2xhc3NOYW1lOiBcInN0LWJsb2NrLWNvbnRyb2xcIixcblxuICBhdHRyaWJ1dGVzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2RhdGEtdHlwZSc6IHRoaXMuYmxvY2tfdHlwZS50eXBlXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLmh0bWwoJzxzcGFuIGNsYXNzPVwic3QtaWNvblwiPicrIF8ucmVzdWx0KHRoaXMuYmxvY2tfdHlwZSwgJ2ljb25fbmFtZScpICsnPC9zcGFuPicgKyBfLnJlc3VsdCh0aGlzLmJsb2NrX3R5cGUsICd0aXRsZScpKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2tDb250cm9sO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gKiBTaXJUcmV2b3IgQmxvY2sgQ29udHJvbHNcbiAqIC0tXG4gKiBHaXZlcyBhbiBpbnRlcmZhY2UgZm9yIGFkZGluZyBuZXcgU2lyIFRyZXZvciBibG9ja3MuXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xuXG52YXIgQmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcbnZhciBCbG9ja0NvbnRyb2wgPSByZXF1aXJlKCcuL2Jsb2NrLWNvbnRyb2wnKTtcbnZhciBFdmVudEJ1cyA9IHJlcXVpcmUoJy4vZXZlbnQtYnVzJyk7XG5cbnZhciBCbG9ja0NvbnRyb2xzID0gZnVuY3Rpb24oYXZhaWxhYmxlX3R5cGVzLCBtZWRpYXRvcikge1xuICB0aGlzLmF2YWlsYWJsZV90eXBlcyA9IGF2YWlsYWJsZV90eXBlcyB8fCBbXTtcbiAgdGhpcy5tZWRpYXRvciA9IG1lZGlhdG9yO1xuXG4gIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuICB0aGlzLl9iaW5kTWVkaWF0ZWRFdmVudHMoKTtcblxuICB0aGlzLmluaXRpYWxpemUoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oQmxvY2tDb250cm9scy5wcm90b3R5cGUsIHJlcXVpcmUoJy4vZnVuY3Rpb24tYmluZCcpLCByZXF1aXJlKCcuL21lZGlhdGVkLWV2ZW50cycpLCByZXF1aXJlKCcuL3JlbmRlcmFibGUnKSwgcmVxdWlyZSgnLi9ldmVudHMnKSwge1xuXG4gIGJvdW5kOiBbJ2hhbmRsZUNvbnRyb2xCdXR0b25DbGljayddLFxuICBibG9ja19jb250cm9sczogbnVsbCxcblxuICBjbGFzc05hbWU6IFwic3QtYmxvY2stY29udHJvbHNcIixcbiAgZXZlbnROYW1lc3BhY2U6ICdibG9jay1jb250cm9scycsXG5cbiAgbWVkaWF0ZWRFdmVudHM6IHtcbiAgICAncmVuZGVyJzogJ3JlbmRlckluQ29udGFpbmVyJyxcbiAgICAnc2hvdyc6ICdzaG93JyxcbiAgICAnaGlkZSc6ICdoaWRlJ1xuICB9LFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgIGZvcih2YXIgYmxvY2tfdHlwZSBpbiB0aGlzLmF2YWlsYWJsZV90eXBlcykge1xuICAgICAgaWYgKEJsb2Nrcy5oYXNPd25Qcm9wZXJ0eShibG9ja190eXBlKSkge1xuICAgICAgICB2YXIgYmxvY2tfY29udHJvbCA9IG5ldyBCbG9ja0NvbnRyb2woYmxvY2tfdHlwZSk7XG4gICAgICAgIGlmIChibG9ja19jb250cm9sLmNhbl9iZV9yZW5kZXJlZCkge1xuICAgICAgICAgIHRoaXMuJGVsLmFwcGVuZChibG9ja19jb250cm9sLnJlbmRlcigpLiRlbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLiRlbC5kZWxlZ2F0ZSgnLnN0LWJsb2NrLWNvbnRyb2wnLCAnY2xpY2snLCB0aGlzLmhhbmRsZUNvbnRyb2xCdXR0b25DbGljayk7XG4gICAgdGhpcy5tZWRpYXRvci5vbignYmxvY2stY29udHJvbHM6c2hvdycsIHRoaXMucmVuZGVySW5Db250YWluZXIpO1xuICB9LFxuXG4gIHNob3c6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLmFkZENsYXNzKCdzdC1ibG9jay1jb250cm9scy0tYWN0aXZlJyk7XG5cbiAgICBFdmVudEJ1cy50cmlnZ2VyKCdibG9jazpjb250cm9sczpzaG93bicpO1xuICB9LFxuXG4gIGhpZGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQ3VycmVudENvbnRhaW5lcigpO1xuICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdzdC1ibG9jay1jb250cm9scy0tYWN0aXZlJyk7XG5cbiAgICBFdmVudEJ1cy50cmlnZ2VyKCdibG9jazpjb250cm9sczpoaWRkZW4nKTtcbiAgfSxcblxuICBoYW5kbGVDb250cm9sQnV0dG9uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdibG9jazpjcmVhdGUnLCAkKGUuY3VycmVudFRhcmdldCkuYXR0cignZGF0YS10eXBlJykpO1xuICB9LFxuXG4gIHJlbmRlckluQ29udGFpbmVyOiBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICB0aGlzLnJlbW92ZUN1cnJlbnRDb250YWluZXIoKTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmQodGhpcy4kZWwuZGV0YWNoKCkpO1xuICAgIGNvbnRhaW5lci5hZGRDbGFzcygnd2l0aC1zdC1jb250cm9scycpO1xuXG4gICAgdGhpcy5jdXJyZW50Q29udGFpbmVyID0gY29udGFpbmVyO1xuICAgIHRoaXMuc2hvdygpO1xuICB9LFxuXG4gIHJlbW92ZUN1cnJlbnRDb250YWluZXI6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghXy5pc1VuZGVmaW5lZCh0aGlzLmN1cnJlbnRDb250YWluZXIpKSB7XG4gICAgICB0aGlzLmN1cnJlbnRDb250YWluZXIucmVtb3ZlQ2xhc3MoXCJ3aXRoLXN0LWNvbnRyb2xzXCIpO1xuICAgICAgdGhpcy5jdXJyZW50Q29udGFpbmVyID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2tDb250cm9scztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgQmxvY2tEZWxldGlvbiA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gIHRoaXMuX2JpbmRGdW5jdGlvbnMoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oQmxvY2tEZWxldGlvbi5wcm90b3R5cGUsIHJlcXVpcmUoJy4vZnVuY3Rpb24tYmluZCcpLCByZXF1aXJlKCcuL3JlbmRlcmFibGUnKSwge1xuXG4gIHRhZ05hbWU6ICdhJyxcbiAgY2xhc3NOYW1lOiAnc3QtYmxvY2stdWktYnRuIHN0LWJsb2NrLXVpLWJ0bi0tZGVsZXRlIHN0LWljb24nLFxuXG4gIGF0dHJpYnV0ZXM6IHtcbiAgICBodG1sOiAnZGVsZXRlJyxcbiAgICAnZGF0YS1pY29uJzogJ2JpbidcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9ja0RlbGV0aW9uO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuL2V2ZW50LWJ1cycpO1xudmFyIEJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG5cbnZhciBCbG9ja01hbmFnZXIgPSBmdW5jdGlvbihvcHRpb25zLCBlZGl0b3JJbnN0YW5jZSwgbWVkaWF0b3IpIHtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgdGhpcy5pbnN0YW5jZV9zY29wZSA9IGVkaXRvckluc3RhbmNlO1xuICB0aGlzLm1lZGlhdG9yID0gbWVkaWF0b3I7XG5cbiAgdGhpcy5ibG9ja3MgPSBbXTtcbiAgdGhpcy5ibG9ja0NvdW50cyA9IHt9O1xuICB0aGlzLmJsb2NrVHlwZXMgPSB7fTtcblxuICB0aGlzLl9zZXRCbG9ja3NUeXBlcygpO1xuICB0aGlzLl9zZXRSZXF1aXJlZCgpO1xuICB0aGlzLl9iaW5kTWVkaWF0ZWRFdmVudHMoKTtcblxuICB0aGlzLmluaXRpYWxpemUoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oQmxvY2tNYW5hZ2VyLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vbWVkaWF0ZWQtZXZlbnRzJyksIHJlcXVpcmUoJy4vZXZlbnRzJyksIHtcblxuICBldmVudE5hbWVzcGFjZTogJ2Jsb2NrJyxcblxuICBtZWRpYXRlZEV2ZW50czoge1xuICAgICdjcmVhdGUnOiAnY3JlYXRlQmxvY2snLFxuICAgICdyZW1vdmUnOiAncmVtb3ZlQmxvY2snLFxuICAgICdyZXJlbmRlcic6ICdyZXJlbmRlckJsb2NrJ1xuICB9LFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge30sXG5cbiAgY3JlYXRlQmxvY2s6IGZ1bmN0aW9uKHR5cGUsIGRhdGEpIHtcbiAgICB0eXBlID0gdXRpbHMuY2xhc3NpZnkodHlwZSk7XG5cbiAgICAvLyBSdW4gdmFsaWRhdGlvbnNcbiAgICBpZiAoIXRoaXMuY2FuQ3JlYXRlQmxvY2sodHlwZSkpIHsgcmV0dXJuOyB9XG5cbiAgICB2YXIgYmxvY2sgPSBuZXcgQmxvY2tzW3R5cGVdKGRhdGEsIHRoaXMuaW5zdGFuY2Vfc2NvcGUsIHRoaXMubWVkaWF0b3IpO1xuICAgIHRoaXMuYmxvY2tzLnB1c2goYmxvY2spO1xuXG4gICAgdGhpcy5faW5jcmVtZW50QmxvY2tUeXBlQ291bnQodHlwZSk7XG4gICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdibG9jazpyZW5kZXInLCBibG9jayk7XG5cbiAgICB0aGlzLnRyaWdnZXJCbG9ja0NvdW50VXBkYXRlKCk7XG4gICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdibG9jazpsaW1pdFJlYWNoZWQnLCB0aGlzLmJsb2NrTGltaXRSZWFjaGVkKCkpO1xuXG4gICAgdXRpbHMubG9nKFwiQmxvY2sgY3JlYXRlZCBvZiB0eXBlIFwiICsgdHlwZSk7XG4gIH0sXG5cbiAgcmVtb3ZlQmxvY2s6IGZ1bmN0aW9uKGJsb2NrSUQpIHtcbiAgICB2YXIgYmxvY2sgPSB0aGlzLmZpbmRCbG9ja0J5SWQoYmxvY2tJRCksXG4gICAgdHlwZSA9IHV0aWxzLmNsYXNzaWZ5KGJsb2NrLnR5cGUpO1xuXG4gICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdibG9jay1jb250cm9sczpyZXNldCcpO1xuICAgIHRoaXMuYmxvY2tzID0gdGhpcy5ibG9ja3MuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHJldHVybiAoaXRlbS5ibG9ja0lEICE9PSBibG9jay5ibG9ja0lEKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2RlY3JlbWVudEJsb2NrVHlwZUNvdW50KHR5cGUpO1xuICAgIHRoaXMudHJpZ2dlckJsb2NrQ291bnRVcGRhdGUoKTtcbiAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Jsb2NrOmxpbWl0UmVhY2hlZCcsIHRoaXMuYmxvY2tMaW1pdFJlYWNoZWQoKSk7XG5cbiAgICBFdmVudEJ1cy50cmlnZ2VyKFwiYmxvY2s6cmVtb3ZlXCIpO1xuICB9LFxuXG4gIHJlcmVuZGVyQmxvY2s6IGZ1bmN0aW9uKGJsb2NrSUQpIHtcbiAgICB2YXIgYmxvY2sgPSB0aGlzLmZpbmRCbG9ja0J5SWQoYmxvY2tJRCk7XG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGJsb2NrKSAmJiAhYmxvY2suaXNFbXB0eSgpICYmXG4gICAgICAgIGJsb2NrLmRyb3Bfb3B0aW9ucy5yZV9yZW5kZXJfb25fcmVvcmRlcikge1xuICAgICAgYmxvY2suYmVmb3JlTG9hZGluZ0RhdGEoKTtcbiAgICB9XG4gIH0sXG5cbiAgdHJpZ2dlckJsb2NrQ291bnRVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignYmxvY2s6Y291bnRVcGRhdGUnLCB0aGlzLmJsb2Nrcy5sZW5ndGgpO1xuICB9LFxuXG4gIGNhbkNyZWF0ZUJsb2NrOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgaWYodGhpcy5ibG9ja0xpbWl0UmVhY2hlZCgpKSB7XG4gICAgICB1dGlscy5sb2coXCJDYW5ub3QgYWRkIGFueSBtb3JlIGJsb2Nrcy4gTGltaXQgcmVhY2hlZC5cIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmlzQmxvY2tUeXBlQXZhaWxhYmxlKHR5cGUpKSB7XG4gICAgICB1dGlscy5sb2coXCJCbG9jayB0eXBlIG5vdCBhdmFpbGFibGUgXCIgKyB0eXBlKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBDYW4gd2UgaGF2ZSBhbm90aGVyIG9uZSBvZiB0aGVzZSBibG9ja3M/XG4gICAgaWYgKCF0aGlzLmNhbkFkZEJsb2NrVHlwZSh0eXBlKSkge1xuICAgICAgdXRpbHMubG9nKFwiQmxvY2sgTGltaXQgcmVhY2hlZCBmb3IgdHlwZSBcIiArIHR5cGUpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIHZhbGlkYXRlQmxvY2tUeXBlc0V4aXN0OiBmdW5jdGlvbihzaG91bGRWYWxpZGF0ZSkge1xuICAgIGlmIChjb25maWcuc2tpcFZhbGlkYXRpb24gfHwgIXNob3VsZFZhbGlkYXRlKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgKHRoaXMucmVxdWlyZWQgfHwgW10pLmZvckVhY2goZnVuY3Rpb24odHlwZSwgaW5kZXgpIHtcbiAgICAgIGlmICghdGhpcy5pc0Jsb2NrVHlwZUF2YWlsYWJsZSh0eXBlKSkgeyByZXR1cm47IH1cblxuICAgICAgaWYgKHRoaXMuX2dldEJsb2NrVHlwZUNvdW50KHR5cGUpID09PSAwKSB7XG4gICAgICAgIHV0aWxzLmxvZyhcIkZhaWxlZCB2YWxpZGF0aW9uIG9uIHJlcXVpcmVkIGJsb2NrIHR5cGUgXCIgKyB0eXBlKTtcbiAgICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdlcnJvcnM6YWRkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGV4dDogaTE4bi50KFwiZXJyb3JzOnR5cGVfbWlzc2luZ1wiLCB7IHR5cGU6IHR5cGUgfSkgfSk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBibG9ja3MgPSB0aGlzLmdldEJsb2Nrc0J5VHlwZSh0eXBlKS5maWx0ZXIoZnVuY3Rpb24oYikge1xuICAgICAgICAgIHJldHVybiAhYi5pc0VtcHR5KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChibG9ja3MubGVuZ3RoID4gMCkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgICAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Vycm9yczphZGQnLCB7XG4gICAgICAgICAgdGV4dDogaTE4bi50KFwiZXJyb3JzOnJlcXVpcmVkX3R5cGVfZW1wdHlcIiwge3R5cGU6IHR5cGV9KVxuICAgICAgICB9KTtcblxuICAgICAgICB1dGlscy5sb2coXCJBIHJlcXVpcmVkIGJsb2NrIHR5cGUgXCIgKyB0eXBlICsgXCIgaXMgZW1wdHlcIik7XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG4gIH0sXG5cbiAgZmluZEJsb2NrQnlJZDogZnVuY3Rpb24oYmxvY2tJRCkge1xuICAgIHJldHVybiB0aGlzLmJsb2Nrcy5maW5kKGZ1bmN0aW9uKGIpIHtcbiAgICAgIHJldHVybiBiLmJsb2NrSUQgPT09IGJsb2NrSUQ7XG4gICAgfSk7XG4gIH0sXG5cbiAgZ2V0QmxvY2tzQnlUeXBlOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tzLmZpbHRlcihmdW5jdGlvbihiKSB7XG4gICAgICByZXR1cm4gdXRpbHMuY2xhc3NpZnkoYi50eXBlKSA9PT0gdHlwZTtcbiAgICB9KTtcbiAgfSxcblxuICBnZXRCbG9ja3NCeUlEczogZnVuY3Rpb24oYmxvY2tfaWRzKSB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tzLmZpbHRlcihmdW5jdGlvbihiKSB7XG4gICAgICByZXR1cm4gYmxvY2tfaWRzLmluY2x1ZGVzKGIuYmxvY2tJRCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgYmxvY2tMaW1pdFJlYWNoZWQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAodGhpcy5vcHRpb25zLmJsb2NrTGltaXQgIT09IDAgJiYgdGhpcy5ibG9ja3MubGVuZ3RoID49IHRoaXMub3B0aW9ucy5ibG9ja0xpbWl0KTtcbiAgfSxcblxuICBpc0Jsb2NrVHlwZUF2YWlsYWJsZTogZnVuY3Rpb24odCkge1xuICAgIHJldHVybiAhXy5pc1VuZGVmaW5lZCh0aGlzLmJsb2NrVHlwZXNbdF0pO1xuICB9LFxuXG4gIGNhbkFkZEJsb2NrVHlwZTogZnVuY3Rpb24odHlwZSkge1xuICAgIHZhciBibG9ja190eXBlX2xpbWl0ID0gdGhpcy5fZ2V0QmxvY2tUeXBlTGltaXQodHlwZSk7XG4gICAgcmV0dXJuICEoYmxvY2tfdHlwZV9saW1pdCAhPT0gMCAmJiB0aGlzLl9nZXRCbG9ja1R5cGVDb3VudCh0eXBlKSA+PSBibG9ja190eXBlX2xpbWl0KTtcbiAgfSxcblxuICBfc2V0QmxvY2tzVHlwZXM6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYmxvY2tUeXBlcyA9IHV0aWxzLmZsYXR0ZW4oXG4gICAgICBfLmlzVW5kZWZpbmVkKHRoaXMub3B0aW9ucy5ibG9ja1R5cGVzKSA/XG4gICAgICBCbG9ja3MgOiB0aGlzLm9wdGlvbnMuYmxvY2tUeXBlcyk7XG4gIH0sXG5cbiAgX3NldFJlcXVpcmVkOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlcXVpcmVkID0gZmFsc2U7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLm9wdGlvbnMucmVxdWlyZWQpICYmICFfLmlzRW1wdHkodGhpcy5vcHRpb25zLnJlcXVpcmVkKSkge1xuICAgICAgdGhpcy5yZXF1aXJlZCA9IHRoaXMub3B0aW9ucy5yZXF1aXJlZDtcbiAgICB9XG4gIH0sXG5cbiAgX2luY3JlbWVudEJsb2NrVHlwZUNvdW50OiBmdW5jdGlvbih0eXBlKSB7XG4gICAgdGhpcy5ibG9ja0NvdW50c1t0eXBlXSA9IChfLmlzVW5kZWZpbmVkKHRoaXMuYmxvY2tDb3VudHNbdHlwZV0pKSA/IDEgOiB0aGlzLmJsb2NrQ291bnRzW3R5cGVdICsgMTtcbiAgfSxcblxuICBfZGVjcmVtZW50QmxvY2tUeXBlQ291bnQ6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICB0aGlzLmJsb2NrQ291bnRzW3R5cGVdID0gKF8uaXNVbmRlZmluZWQodGhpcy5ibG9ja0NvdW50c1t0eXBlXSkpID8gMSA6IHRoaXMuYmxvY2tDb3VudHNbdHlwZV0gLSAxO1xuICB9LFxuXG4gIF9nZXRCbG9ja1R5cGVDb3VudDogZnVuY3Rpb24odHlwZSkge1xuICAgIHJldHVybiAoXy5pc1VuZGVmaW5lZCh0aGlzLmJsb2NrQ291bnRzW3R5cGVdKSkgPyAwIDogdGhpcy5ibG9ja0NvdW50c1t0eXBlXTtcbiAgfSxcblxuICBfYmxvY2tMaW1pdFJlYWNoZWQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAodGhpcy5vcHRpb25zLmJsb2NrTGltaXQgIT09IDAgJiYgdGhpcy5ibG9ja3MubGVuZ3RoID49IHRoaXMub3B0aW9ucy5ibG9ja0xpbWl0KTtcbiAgfSxcblxuICBfZ2V0QmxvY2tUeXBlTGltaXQ6IGZ1bmN0aW9uKHQpIHtcbiAgICBpZiAoIXRoaXMuaXNCbG9ja1R5cGVBdmFpbGFibGUodCkpIHsgcmV0dXJuIDA7IH1cbiAgICByZXR1cm4gcGFyc2VJbnQoKF8uaXNVbmRlZmluZWQodGhpcy5vcHRpb25zLmJsb2NrVHlwZUxpbWl0c1t0XSkpID8gMCA6IHRoaXMub3B0aW9ucy5ibG9ja1R5cGVMaW1pdHNbdF0sIDEwKTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9ja01hbmFnZXI7XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdGVtcGxhdGUgPSBbXG4gIFwiPGRpdiBjbGFzcz0nc3QtYmxvY2stcG9zaXRpb25lcl9faW5uZXInPlwiLFxuICBcIjxzcGFuIGNsYXNzPSdzdC1ibG9jay1wb3NpdGlvbmVyX19zZWxlY3RlZC12YWx1ZSc+PC9zcGFuPlwiLFxuICBcIjxzZWxlY3QgY2xhc3M9J3N0LWJsb2NrLXBvc2l0aW9uZXJfX3NlbGVjdCc+PC9zZWxlY3Q+XCIsXG4gIFwiPC9kaXY+XCJcbl0uam9pbihcIlxcblwiKTtcblxudmFyIEJsb2NrUG9zaXRpb25lciA9IGZ1bmN0aW9uKGJsb2NrX2VsZW1lbnQsIG1lZGlhdG9yKSB7XG4gIHRoaXMubWVkaWF0b3IgPSBtZWRpYXRvcjtcbiAgdGhpcy4kYmxvY2sgPSBibG9ja19lbGVtZW50O1xuXG4gIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihCbG9ja1Bvc2l0aW9uZXIucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHtcblxuICB0b3RhbF9ibG9ja3M6IDAsXG5cbiAgYm91bmQ6IFsnb25CbG9ja0NvdW50Q2hhbmdlJywgJ29uU2VsZWN0Q2hhbmdlJywgJ3RvZ2dsZScsICdzaG93JywgJ2hpZGUnXSxcblxuICBjbGFzc05hbWU6ICdzdC1ibG9jay1wb3NpdGlvbmVyJyxcbiAgdmlzaWJsZUNsYXNzOiAnc3QtYmxvY2stcG9zaXRpb25lci0taXMtdmlzaWJsZScsXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcbiAgICB0aGlzLiRlbC5hcHBlbmQodGVtcGxhdGUpO1xuICAgIHRoaXMuJHNlbGVjdCA9IHRoaXMuJCgnLnN0LWJsb2NrLXBvc2l0aW9uZXJfX3NlbGVjdCcpO1xuXG4gICAgdGhpcy4kc2VsZWN0Lm9uKCdjaGFuZ2UnLCB0aGlzLm9uU2VsZWN0Q2hhbmdlKTtcblxuICAgIHRoaXMubWVkaWF0b3Iub24oXCJibG9ja3M6Y291bnRVcGRhdGVcIiwgdGhpcy5vbkJsb2NrQ291bnRDaGFuZ2UpO1xuICB9LFxuXG4gIG9uQmxvY2tDb3VudENoYW5nZTogZnVuY3Rpb24obmV3X2NvdW50KSB7XG4gICAgaWYgKG5ld19jb3VudCAhPT0gdGhpcy50b3RhbF9ibG9ja3MpIHtcbiAgICAgIHRoaXMudG90YWxfYmxvY2tzID0gbmV3X2NvdW50O1xuICAgICAgdGhpcy5yZW5kZXJQb3NpdGlvbkxpc3QoKTtcbiAgICB9XG4gIH0sXG5cbiAgb25TZWxlY3RDaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWwgPSB0aGlzLiRzZWxlY3QudmFsKCk7XG4gICAgaWYgKHZhbCAhPT0gMCkge1xuICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKFxuICAgICAgICBcImJsb2NrczpjaGFuZ2VQb3NpdGlvblwiLCB0aGlzLiRibG9jaywgdmFsLFxuICAgICAgICAodmFsID09PSAxID8gJ2JlZm9yZScgOiAnYWZ0ZXInKSk7XG4gICAgICB0aGlzLnRvZ2dsZSgpO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXJQb3NpdGlvbkxpc3Q6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbm5lciA9IFwiPG9wdGlvbiB2YWx1ZT0nMCc+XCIgKyBpMThuLnQoXCJnZW5lcmFsOnBvc2l0aW9uXCIpICsgXCI8L29wdGlvbj5cIjtcbiAgICBmb3IodmFyIGkgPSAxOyBpIDw9IHRoaXMudG90YWxfYmxvY2tzOyBpKyspIHtcbiAgICAgIGlubmVyICs9IFwiPG9wdGlvbiB2YWx1ZT1cIitpK1wiPlwiK2krXCI8L29wdGlvbj5cIjtcbiAgICB9XG4gICAgdGhpcy4kc2VsZWN0Lmh0bWwoaW5uZXIpO1xuICB9LFxuXG4gIHRvZ2dsZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kc2VsZWN0LnZhbCgwKTtcbiAgICB0aGlzLiRlbC50b2dnbGVDbGFzcyh0aGlzLnZpc2libGVDbGFzcyk7XG4gIH0sXG5cbiAgc2hvdzogZnVuY3Rpb24oKXtcbiAgICB0aGlzLiRlbC5hZGRDbGFzcyh0aGlzLnZpc2libGVDbGFzcyk7XG4gIH0sXG5cbiAgaGlkZTogZnVuY3Rpb24oKXtcbiAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcyh0aGlzLnZpc2libGVDbGFzcyk7XG4gIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2tQb3NpdGlvbmVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcblxudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi9ldmVudC1idXMnKTtcblxudmFyIEJsb2NrUmVvcmRlciA9IGZ1bmN0aW9uKGJsb2NrX2VsZW1lbnQsIG1lZGlhdG9yKSB7XG4gIHRoaXMuJGJsb2NrID0gYmxvY2tfZWxlbWVudDtcbiAgdGhpcy5ibG9ja0lEID0gdGhpcy4kYmxvY2suYXR0cignaWQnKTtcbiAgdGhpcy5tZWRpYXRvciA9IG1lZGlhdG9yO1xuXG4gIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihCbG9ja1Jlb3JkZXIucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHtcblxuICBib3VuZDogWydvbk1vdXNlRG93bicsICdvbkRyYWdTdGFydCcsICdvbkRyYWdFbmQnLCAnb25Ecm9wJ10sXG5cbiAgY2xhc3NOYW1lOiAnc3QtYmxvY2stdWktYnRuIHN0LWJsb2NrLXVpLWJ0bi0tcmVvcmRlciBzdC1pY29uJyxcbiAgdGFnTmFtZTogJ2EnLFxuXG4gIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAnaHRtbCc6ICdyZW9yZGVyJyxcbiAgICAgICdkcmFnZ2FibGUnOiAndHJ1ZScsXG4gICAgICAnZGF0YS1pY29uJzogJ21vdmUnXG4gICAgfTtcbiAgfSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5iaW5kKCdtb3VzZWRvd24gdG91Y2hzdGFydCcsIHRoaXMub25Nb3VzZURvd24pXG4gICAgICAuYmluZCgnZHJhZ3N0YXJ0JywgdGhpcy5vbkRyYWdTdGFydClcbiAgICAgIC5iaW5kKCdkcmFnZW5kIHRvdWNoZW5kJywgdGhpcy5vbkRyYWdFbmQpO1xuXG4gICAgdGhpcy4kYmxvY2suZHJvcEFyZWEoKVxuICAgICAgLmJpbmQoJ2Ryb3AnLCB0aGlzLm9uRHJvcCk7XG4gIH0sXG5cbiAgYmxvY2tJZDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGJsb2NrLmF0dHIoJ2lkJyk7XG4gIH0sXG5cbiAgb25Nb3VzZURvd246IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcihcImJsb2NrLWNvbnRyb2xzOmhpZGVcIik7XG4gICAgRXZlbnRCdXMudHJpZ2dlcihcImJsb2NrOnJlb3JkZXI6ZG93blwiKTtcbiAgfSxcblxuICBvbkRyb3A6IGZ1bmN0aW9uKGV2KSB7XG4gICAgZXYucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBkcm9wcGVkX29uID0gdGhpcy4kYmxvY2ssXG4gICAgaXRlbV9pZCA9IGV2Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoXCJ0ZXh0L3BsYWluXCIpLFxuICAgIGJsb2NrID0gJCgnIycgKyBpdGVtX2lkKTtcblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChpdGVtX2lkKSAmJiAhXy5pc0VtcHR5KGJsb2NrKSAmJlxuICAgICAgICBkcm9wcGVkX29uLmF0dHIoJ2lkJykgIT09IGl0ZW1faWQgJiZcbiAgICAgICAgICBkcm9wcGVkX29uLmF0dHIoJ2RhdGEtaW5zdGFuY2UnKSA9PT0gYmxvY2suYXR0cignZGF0YS1pbnN0YW5jZScpXG4gICAgICAgKSB7XG4gICAgICAgZHJvcHBlZF9vbi5hZnRlcihibG9jayk7XG4gICAgIH1cbiAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKFwiYmxvY2s6cmVyZW5kZXJcIiwgaXRlbV9pZCk7XG4gICAgIEV2ZW50QnVzLnRyaWdnZXIoXCJibG9jazpyZW9yZGVyOmRyb3BwZWRcIiwgaXRlbV9pZCk7XG4gIH0sXG5cbiAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGV2KSB7XG4gICAgdmFyIGJ0biA9ICQoZXYuY3VycmVudFRhcmdldCkucGFyZW50KCk7XG5cbiAgICBldi5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5zZXREcmFnSW1hZ2UodGhpcy4kYmxvY2tbMF0sIGJ0bi5wb3NpdGlvbigpLmxlZnQsIGJ0bi5wb3NpdGlvbigpLnRvcCk7XG4gICAgZXYub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YSgnVGV4dCcsIHRoaXMuYmxvY2tJZCgpKTtcblxuICAgIEV2ZW50QnVzLnRyaWdnZXIoXCJibG9jazpyZW9yZGVyOmRyYWdzdGFydFwiKTtcbiAgICB0aGlzLiRibG9jay5hZGRDbGFzcygnc3QtYmxvY2stLWRyYWdnaW5nJyk7XG4gIH0sXG5cbiAgb25EcmFnRW5kOiBmdW5jdGlvbihldikge1xuICAgIEV2ZW50QnVzLnRyaWdnZXIoXCJibG9jazpyZW9yZGVyOmRyYWdlbmRcIik7XG4gICAgdGhpcy4kYmxvY2sucmVtb3ZlQ2xhc3MoJ3N0LWJsb2NrLS1kcmFnZ2luZycpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2tSZW9yZGVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi9ldmVudC1idXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLyoqXG4gICAqIEludGVybmFsIHN0b3JhZ2Ugb2JqZWN0IGZvciB0aGUgYmxvY2tcbiAgICovXG4gIGJsb2NrU3RvcmFnZToge30sXG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgdGhlIHN0b3JlLCBpbmNsdWRpbmcgdGhlIGJsb2NrIHR5cGVcbiAgICovXG4gIGNyZWF0ZVN0b3JlOiBmdW5jdGlvbihibG9ja0RhdGEpIHtcbiAgICB0aGlzLmJsb2NrU3RvcmFnZSA9IHtcbiAgICAgIHR5cGU6IHV0aWxzLnVuZGVyc2NvcmVkKHRoaXMudHlwZSksXG4gICAgICBkYXRhOiBibG9ja0RhdGEgfHwge31cbiAgICB9O1xuICB9LFxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemUgdGhlIGJsb2NrIGFuZCBzYXZlIHRoZSBkYXRhIGludG8gdGhlIHN0b3JlXG4gICAqL1xuICBzYXZlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGF0YSA9IHRoaXMuX3NlcmlhbGl6ZURhdGEoKTtcblxuICAgIGlmICghXy5pc0VtcHR5KGRhdGEpKSB7XG4gICAgICB0aGlzLnNldERhdGEoZGF0YSk7XG4gICAgfVxuICB9LFxuXG4gIGdldERhdGE6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2F2ZSgpO1xuICAgIHJldHVybiB0aGlzLmJsb2NrU3RvcmFnZTtcbiAgfSxcblxuICBnZXRCbG9ja0RhdGE6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2F2ZSgpO1xuICAgIHJldHVybiB0aGlzLmJsb2NrU3RvcmFnZS5kYXRhO1xuICB9LFxuXG4gIF9nZXREYXRhOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja1N0b3JhZ2UuZGF0YTtcbiAgfSxcblxuICAvKipcbiAgICogU2V0IHRoZSBibG9jayBkYXRhLlxuICAgKiBUaGlzIGlzIHVzZWQgYnkgdGhlIHNhdmUoKSBtZXRob2QuXG4gICAqL1xuICBzZXREYXRhOiBmdW5jdGlvbihibG9ja0RhdGEpIHtcbiAgICB1dGlscy5sb2coXCJTZXR0aW5nIGRhdGEgZm9yIGJsb2NrIFwiICsgdGhpcy5ibG9ja0lEKTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuYmxvY2tTdG9yYWdlLmRhdGEsIGJsb2NrRGF0YSB8fCB7fSk7XG4gIH0sXG5cbiAgc2V0QW5kTG9hZERhdGE6IGZ1bmN0aW9uKGJsb2NrRGF0YSkge1xuICAgIHRoaXMuc2V0RGF0YShibG9ja0RhdGEpO1xuICAgIHRoaXMuYmVmb3JlTG9hZGluZ0RhdGEoKTtcbiAgfSxcblxuICBfc2VyaWFsaXplRGF0YTogZnVuY3Rpb24oKSB7fSxcbiAgbG9hZERhdGE6IGZ1bmN0aW9uKCkge30sXG5cbiAgYmVmb3JlTG9hZGluZ0RhdGE6IGZ1bmN0aW9uKCkge1xuICAgIHV0aWxzLmxvZyhcImxvYWREYXRhIGZvciBcIiArIHRoaXMuYmxvY2tJRCk7XG4gICAgRXZlbnRCdXMudHJpZ2dlcihcImVkaXRvci9ibG9jay9sb2FkRGF0YVwiKTtcbiAgICB0aGlzLmxvYWREYXRhKHRoaXMuX2dldERhdGEoKSk7XG4gIH0sXG5cbiAgX2xvYWREYXRhOiBmdW5jdGlvbigpIHtcbiAgICB1dGlscy5sb2coXCJfbG9hZERhdGEgaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBmdXR1cmUuIFBsZWFzZSB1c2UgYmVmb3JlTG9hZGluZ0RhdGEgaW5zdGVhZC5cIik7XG4gICAgdGhpcy5iZWZvcmVMb2FkaW5nRGF0YSgpO1xuICB9LFxuXG4gIGNoZWNrQW5kTG9hZERhdGE6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghXy5pc0VtcHR5KHRoaXMuX2dldERhdGEoKSkpIHtcbiAgICAgIHRoaXMuYmVmb3JlTG9hZGluZ0RhdGEoKTtcbiAgICB9XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBiZXN0TmFtZUZyb21GaWVsZCA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gIHZhciBtc2cgPSBmaWVsZC5hdHRyKFwiZGF0YS1zdC1uYW1lXCIpIHx8IGZpZWxkLmF0dHIoXCJuYW1lXCIpO1xuXG4gIGlmICghbXNnKSB7XG4gICAgbXNnID0gJ0ZpZWxkJztcbiAgfVxuXG4gIHJldHVybiB1dGlscy5jYXBpdGFsaXplKG1zZyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBlcnJvcnM6IFtdLFxuXG4gIHZhbGlkOiBmdW5jdGlvbigpe1xuICAgIHRoaXMucGVyZm9ybVZhbGlkYXRpb25zKCk7XG4gICAgcmV0dXJuIHRoaXMuZXJyb3JzLmxlbmd0aCA9PT0gMDtcbiAgfSxcblxuICAvLyBUaGlzIG1ldGhvZCBhY3R1YWxseSBkb2VzIHRoZSBsZWcgd29ya1xuICAvLyBvZiBydW5uaW5nIG91ciB2YWxpZGF0b3JzIGFuZCBjdXN0b20gdmFsaWRhdG9yc1xuICBwZXJmb3JtVmFsaWRhdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVzZXRFcnJvcnMoKTtcblxuICAgIHZhciByZXF1aXJlZF9maWVsZHMgPSB0aGlzLiQoJy5zdC1yZXF1aXJlZCcpO1xuICAgIHJlcXVpcmVkX2ZpZWxkcy5lYWNoKGZ1bmN0aW9uIChpLCBmKSB7XG4gICAgICB0aGlzLnZhbGlkYXRlRmllbGQoZik7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnZhbGlkYXRpb25zLmZvckVhY2godGhpcy5ydW5WYWxpZGF0b3IsIHRoaXMpO1xuXG4gICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3MoJ3N0LWJsb2NrLS13aXRoLWVycm9ycycsIHRoaXMuZXJyb3JzLmxlbmd0aCA+IDApO1xuICB9LFxuXG4gIC8vIEV2ZXJ5dGhpbmcgaW4gaGVyZSBzaG91bGQgYmUgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdHJ1ZSBvciBmYWxzZVxuICB2YWxpZGF0aW9uczogW10sXG5cbiAgdmFsaWRhdGVGaWVsZDogZnVuY3Rpb24oZmllbGQpIHtcbiAgICBmaWVsZCA9ICQoZmllbGQpO1xuXG4gICAgdmFyIGNvbnRlbnQgPSBmaWVsZC5hdHRyKCdjb250ZW50ZWRpdGFibGUnKSA/IGZpZWxkLnRleHQoKSA6IGZpZWxkLnZhbCgpO1xuXG4gICAgaWYgKGNvbnRlbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLnNldEVycm9yKGZpZWxkLCBpMThuLnQoXCJlcnJvcnM6YmxvY2tfZW1wdHlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogYmVzdE5hbWVGcm9tRmllbGQoZmllbGQpIH0pKTtcbiAgICB9XG4gIH0sXG5cbiAgcnVuVmFsaWRhdG9yOiBmdW5jdGlvbih2YWxpZGF0b3IpIHtcbiAgICBpZiAoIV8uaXNVbmRlZmluZWQodGhpc1t2YWxpZGF0b3JdKSkge1xuICAgICAgdGhpc1t2YWxpZGF0b3JdLmNhbGwodGhpcyk7XG4gICAgfVxuICB9LFxuXG4gIHNldEVycm9yOiBmdW5jdGlvbihmaWVsZCwgcmVhc29uKSB7XG4gICAgdmFyICRtc2cgPSB0aGlzLmFkZE1lc3NhZ2UocmVhc29uLCBcInN0LW1zZy0tZXJyb3JcIik7XG4gICAgZmllbGQuYWRkQ2xhc3MoJ3N0LWVycm9yJyk7XG5cbiAgICB0aGlzLmVycm9ycy5wdXNoKHsgZmllbGQ6IGZpZWxkLCByZWFzb246IHJlYXNvbiwgbXNnOiAkbXNnIH0pO1xuICB9LFxuXG4gIHJlc2V0RXJyb3JzOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIGVycm9yLmZpZWxkLnJlbW92ZUNsYXNzKCdzdC1lcnJvcicpO1xuICAgICAgZXJyb3IubXNnLnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kbWVzc2FnZXMucmVtb3ZlQ2xhc3MoXCJzdC1ibG9ja19fbWVzc2FnZXMtLWlzLXZpc2libGVcIik7XG4gICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgfVxuXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcblxudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgc3RUb0hUTUwgPSByZXF1aXJlKCcuL3RvLWh0bWwnKTtcbnZhciBzdFRvTWFya2Rvd24gPSByZXF1aXJlKCcuL3RvLW1hcmtkb3duJyk7XG52YXIgQmxvY2tNaXhpbnMgPSByZXF1aXJlKCcuL2Jsb2NrX21peGlucycpO1xuXG52YXIgU2ltcGxlQmxvY2sgPSByZXF1aXJlKCcuL3NpbXBsZS1ibG9jaycpO1xudmFyIEJsb2NrUmVvcmRlciA9IHJlcXVpcmUoJy4vYmxvY2stcmVvcmRlcicpO1xudmFyIEJsb2NrRGVsZXRpb24gPSByZXF1aXJlKCcuL2Jsb2NrLWRlbGV0aW9uJyk7XG52YXIgQmxvY2tQb3NpdGlvbmVyID0gcmVxdWlyZSgnLi9ibG9jay1wb3NpdGlvbmVyJyk7XG52YXIgRm9ybWF0dGVycyA9IHJlcXVpcmUoJy4vZm9ybWF0dGVycycpO1xudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi9ldmVudC1idXMnKTtcblxudmFyIFNwaW5uZXIgPSByZXF1aXJlKCdzcGluLmpzJyk7XG5cbnZhciBCbG9jayA9IGZ1bmN0aW9uKGRhdGEsIGluc3RhbmNlX2lkLCBtZWRpYXRvcikge1xuICBTaW1wbGVCbG9jay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuQmxvY2sucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTaW1wbGVCbG9jay5wcm90b3R5cGUpO1xuQmxvY2sucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQmxvY2s7XG5cbnZhciBkZWxldGVfdGVtcGxhdGUgPSBbXG4gIFwiPGRpdiBjbGFzcz0nc3QtYmxvY2tfX3VpLWRlbGV0ZS1jb250cm9scyc+XCIsXG4gIFwiPGxhYmVsIGNsYXNzPSdzdC1ibG9ja19fZGVsZXRlLWxhYmVsJz5cIixcbiAgXCI8JT0gaTE4bi50KCdnZW5lcmFsOmRlbGV0ZScpICU+XCIsXG4gIFwiPC9sYWJlbD5cIixcbiAgXCI8YSBjbGFzcz0nc3QtYmxvY2stdWktYnRuIHN0LWJsb2NrLXVpLWJ0bi0tY29uZmlybS1kZWxldGUgc3QtaWNvbicgZGF0YS1pY29uPSd0aWNrJz48L2E+XCIsXG4gIFwiPGEgY2xhc3M9J3N0LWJsb2NrLXVpLWJ0biBzdC1ibG9jay11aS1idG4tLWRlbnktZGVsZXRlIHN0LWljb24nIGRhdGEtaWNvbj0nY2xvc2UnPjwvYT5cIixcbiAgXCI8L2Rpdj5cIlxuXS5qb2luKFwiXFxuXCIpO1xuXG52YXIgZHJvcF9vcHRpb25zID0ge1xuICBodG1sOiBbJzxkaXYgY2xhc3M9XCJzdC1ibG9ja19fZHJvcHpvbmVcIj4nLFxuICAgICc8c3BhbiBjbGFzcz1cInN0LWljb25cIj48JT0gXy5yZXN1bHQoYmxvY2ssIFwiaWNvbl9uYW1lXCIpICU+PC9zcGFuPicsXG4gICAgJzxwPjwlPSBpMThuLnQoXCJnZW5lcmFsOmRyb3BcIiwgeyBibG9jazogXCI8c3Bhbj5cIiArIF8ucmVzdWx0KGJsb2NrLCBcInRpdGxlXCIpICsgXCI8L3NwYW4+XCIgfSkgJT4nLFxuICAgICc8L3A+PC9kaXY+J10uam9pbignXFxuJyksXG4gICAgcmVfcmVuZGVyX29uX3Jlb3JkZXI6IGZhbHNlXG59O1xuXG52YXIgcGFzdGVfb3B0aW9ucyA9IHtcbiAgaHRtbDogWyc8aW5wdXQgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIjwlPSBpMThuLnQoXCJnZW5lcmFsOnBhc3RlXCIpICU+XCInLFxuICAgICcgY2xhc3M9XCJzdC1ibG9ja19fcGFzdGUtaW5wdXQgc3QtcGFzdGUtYmxvY2tcIj4nXS5qb2luKCcnKVxufTtcblxudmFyIHVwbG9hZF9vcHRpb25zID0ge1xuICBodG1sOiBbXG4gICAgJzxkaXYgY2xhc3M9XCJzdC1ibG9ja19fdXBsb2FkLWNvbnRhaW5lclwiPicsXG4gICAgJzxpbnB1dCB0eXBlPVwiZmlsZVwiIHR5cGU9XCJzdC1maWxlLXVwbG9hZFwiPicsXG4gICAgJzxidXR0b24gY2xhc3M9XCJzdC11cGxvYWQtYnRuXCI+PCU9IGkxOG4udChcImdlbmVyYWw6dXBsb2FkXCIpICU+PC9idXR0b24+JyxcbiAgICAnPC9kaXY+J1xuICBdLmpvaW4oJ1xcbicpXG59O1xuXG5jb25maWcuZGVmYXVsdHMuQmxvY2sgPSB7XG4gIGRyb3Bfb3B0aW9uczogZHJvcF9vcHRpb25zLFxuICBwYXN0ZV9vcHRpb25zOiBwYXN0ZV9vcHRpb25zLFxuICB1cGxvYWRfb3B0aW9uczogdXBsb2FkX29wdGlvbnNcbn07XG5cbk9iamVjdC5hc3NpZ24oQmxvY2sucHJvdG90eXBlLCBTaW1wbGVCbG9jay5mbiwgcmVxdWlyZSgnLi9ibG9jay12YWxpZGF0aW9ucycpLCB7XG5cbiAgYm91bmQ6IFtcIl9oYW5kbGVDb250ZW50UGFzdGVcIiwgXCJfb25Gb2N1c1wiLCBcIl9vbkJsdXJcIiwgXCJvbkRyb3BcIiwgXCJvbkRlbGV0ZUNsaWNrXCIsXG4gICAgXCJjbGVhckluc2VydGVkU3R5bGVzXCIsIFwiZ2V0U2VsZWN0aW9uRm9yRm9ybWF0dGVyXCIsIFwib25CbG9ja1JlbmRlclwiXSxcblxuICAgIGNsYXNzTmFtZTogJ3N0LWJsb2NrIHN0LWljb24tLWFkZCcsXG5cbiAgICBhdHRyaWJ1dGVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKFNpbXBsZUJsb2NrLmZuLmF0dHJpYnV0ZXMuY2FsbCh0aGlzKSwge1xuICAgICAgICAnZGF0YS1pY29uLWFmdGVyJyA6IFwiYWRkXCJcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBpY29uX25hbWU6ICdkZWZhdWx0JyxcblxuICAgIHZhbGlkYXRpb25GYWlsTXNnOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBpMThuLnQoJ2Vycm9yczp2YWxpZGF0aW9uX2ZhaWwnLCB7IHR5cGU6IHRoaXMudGl0bGUoKSB9KTtcbiAgICB9LFxuXG4gICAgZWRpdG9ySFRNTDogJzxkaXYgY2xhc3M9XCJzdC1ibG9ja19fZWRpdG9yXCI+PC9kaXY+JyxcblxuICAgIHRvb2xiYXJFbmFibGVkOiB0cnVlLFxuXG4gICAgYXZhaWxhYmxlTWl4aW5zOiBbJ2Ryb3BwYWJsZScsICdwYXN0YWJsZScsICd1cGxvYWRhYmxlJywgJ2ZldGNoYWJsZScsXG4gICAgICAnYWpheGFibGUnLCAnY29udHJvbGxhYmxlJ10sXG5cbiAgICBkcm9wcGFibGU6IGZhbHNlLFxuICAgIHBhc3RhYmxlOiBmYWxzZSxcbiAgICB1cGxvYWRhYmxlOiBmYWxzZSxcbiAgICBmZXRjaGFibGU6IGZhbHNlLFxuICAgIGFqYXhhYmxlOiBmYWxzZSxcblxuICAgIGRyb3Bfb3B0aW9uczoge30sXG4gICAgcGFzdGVfb3B0aW9uczoge30sXG4gICAgdXBsb2FkX29wdGlvbnM6IHt9LFxuXG4gICAgZm9ybWF0dGFibGU6IHRydWUsXG5cbiAgICBfcHJldmlvdXNTZWxlY3Rpb246ICcnLFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7fSxcblxuICAgIHRvTWFya2Rvd246IGZ1bmN0aW9uKG1hcmtkb3duKXsgcmV0dXJuIG1hcmtkb3duOyB9LFxuICAgIHRvSFRNTDogZnVuY3Rpb24oaHRtbCl7IHJldHVybiBodG1sOyB9LFxuXG4gICAgd2l0aE1peGluOiBmdW5jdGlvbihtaXhpbikge1xuICAgICAgaWYgKCFfLmlzT2JqZWN0KG1peGluKSkgeyByZXR1cm47IH1cblxuICAgICAgdmFyIGluaXRpYWxpemVNZXRob2QgPSBcImluaXRpYWxpemVcIiArIG1peGluLm1peGluTmFtZTtcblxuICAgICAgaWYgKF8uaXNVbmRlZmluZWQodGhpc1tpbml0aWFsaXplTWV0aG9kXSkpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBtaXhpbik7XG4gICAgICAgIHRoaXNbaW5pdGlhbGl6ZU1ldGhvZF0oKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYmVmb3JlQmxvY2tSZW5kZXIoKTtcbiAgICAgIHRoaXMuX3NldEJsb2NrSW5uZXIoKTtcblxuICAgICAgdGhpcy4kZWRpdG9yID0gdGhpcy4kaW5uZXIuY2hpbGRyZW4oKS5maXJzdCgpO1xuXG4gICAgICBpZih0aGlzLmRyb3BwYWJsZSB8fCB0aGlzLnBhc3RhYmxlIHx8IHRoaXMudXBsb2FkYWJsZSkge1xuICAgICAgICB2YXIgaW5wdXRfaHRtbCA9ICQoXCI8ZGl2PlwiLCB7ICdjbGFzcyc6ICdzdC1ibG9ja19faW5wdXRzJyB9KTtcbiAgICAgICAgdGhpcy4kaW5uZXIuYXBwZW5kKGlucHV0X2h0bWwpO1xuICAgICAgICB0aGlzLiRpbnB1dHMgPSBpbnB1dF9odG1sO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5oYXNUZXh0QmxvY2spIHsgdGhpcy5faW5pdFRleHRCbG9ja3MoKTsgfVxuXG4gICAgICB0aGlzLmF2YWlsYWJsZU1peGlucy5mb3JFYWNoKGZ1bmN0aW9uKG1peGluKSB7XG4gICAgICAgIGlmICh0aGlzW21peGluXSkge1xuICAgICAgICAgIHRoaXMud2l0aE1peGluKEJsb2NrTWl4aW5zW3V0aWxzLmNsYXNzaWZ5KG1peGluKV0pO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgaWYgKHRoaXMuZm9ybWF0dGFibGUpIHsgdGhpcy5faW5pdEZvcm1hdHRpbmcoKTsgfVxuXG4gICAgICB0aGlzLl9ibG9ja1ByZXBhcmUoKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIHJlbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5hamF4YWJsZSkge1xuICAgICAgICB0aGlzLnJlc29sdmVBbGxJblF1ZXVlKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuJGVsLnJlbW92ZSgpO1xuICAgIH0sXG5cbiAgICBsb2FkaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmKCFfLmlzVW5kZWZpbmVkKHRoaXMuc3Bpbm5lcikpIHsgdGhpcy5yZWFkeSgpOyB9XG5cbiAgICAgIHRoaXMuc3Bpbm5lciA9IG5ldyBTcGlubmVyKGNvbmZpZy5kZWZhdWx0cy5zcGlubmVyKTtcbiAgICAgIHRoaXMuc3Bpbm5lci5zcGluKHRoaXMuJGVsWzBdKTtcblxuICAgICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ3N0LS1pcy1sb2FkaW5nJyk7XG4gICAgfSxcblxuICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdzdC0taXMtbG9hZGluZycpO1xuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKHRoaXMuc3Bpbm5lcikpIHtcbiAgICAgICAgdGhpcy5zcGlubmVyLnN0b3AoKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuc3Bpbm5lcjtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyogR2VuZXJpYyBfc2VyaWFsaXplRGF0YSBpbXBsZW1lbnRhdGlvbiB0byBzZXJpYWxpemUgdGhlIGJsb2NrIGludG8gYSBwbGFpbiBvYmplY3QuXG4gICAgICogQ2FuIGJlIG92ZXJ3cml0dGVuLCBhbHRob3VnaCBob3BlZnVsbHkgdGhpcyB3aWxsIGNvdmVyIG1vc3Qgc2l0dWF0aW9ucy5cbiAgICAgKiBJZiB5b3Ugd2FudCB0byBnZXQgdGhlIGRhdGEgb2YgeW91ciBibG9jayB1c2UgYmxvY2suZ2V0QmxvY2tEYXRhKClcbiAgICAgKi9cbiAgICBfc2VyaWFsaXplRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICB1dGlscy5sb2coXCJ0b0RhdGEgZm9yIFwiICsgdGhpcy5ibG9ja0lEKTtcblxuICAgICAgdmFyIGRhdGEgPSB7fTtcblxuICAgICAgLyogU2ltcGxlIHRvIHN0YXJ0LiBBZGQgY29uZGl0aW9ucyBsYXRlciAqL1xuICAgICAgaWYgKHRoaXMuaGFzVGV4dEJsb2NrKCkpIHtcbiAgICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLmdldFRleHRCbG9jaygpLmh0bWwoKTtcbiAgICAgICAgaWYgKGNvbnRlbnQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGRhdGEudGV4dCA9IHN0VG9NYXJrZG93bihjb250ZW50LCB0aGlzLnR5cGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBhbnkgaW5wdXRzIHRvIHRoZSBkYXRhIGF0dHJcbiAgICAgIGlmICh0aGlzLiQoJzppbnB1dCcpLm5vdCgnLnN0LXBhc3RlLWJsb2NrJykubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLiQoJzppbnB1dCcpLmVhY2goZnVuY3Rpb24oaW5kZXgsaW5wdXQpe1xuICAgICAgICAgIGlmIChpbnB1dC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSkge1xuICAgICAgICAgICAgZGF0YVtpbnB1dC5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0gPSBpbnB1dC52YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxuXG4gICAgLyogR2VuZXJpYyBpbXBsZW1lbnRhdGlvbiB0byB0ZWxsIHVzIHdoZW4gdGhlIGJsb2NrIGlzIGFjdGl2ZSAqL1xuICAgIGZvY3VzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ2V0VGV4dEJsb2NrKCkuZm9jdXMoKTtcbiAgICB9LFxuXG4gICAgYmx1cjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdldFRleHRCbG9jaygpLmJsdXIoKTtcbiAgICB9LFxuXG4gICAgb25Gb2N1czogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdldFRleHRCbG9jaygpLmJpbmQoJ2ZvY3VzJywgdGhpcy5fb25Gb2N1cyk7XG4gICAgfSxcblxuICAgIG9uQmx1cjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdldFRleHRCbG9jaygpLmJpbmQoJ2JsdXInLCB0aGlzLl9vbkJsdXIpO1xuICAgIH0sXG5cbiAgICAvKlxuICAgICAqIEV2ZW50IGhhbmRsZXJzXG4gICAgICovXG5cbiAgICBfb25Gb2N1czogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2Jsb2NrRm9jdXMnLCB0aGlzLiRlbCk7XG4gICAgfSxcblxuICAgIF9vbkJsdXI6IGZ1bmN0aW9uKCkge30sXG5cbiAgICBvbkJsb2NrUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZm9jdXMoKTtcbiAgICB9LFxuXG4gICAgb25Ecm9wOiBmdW5jdGlvbihkYXRhVHJhbnNmZXJPYmopIHt9LFxuXG4gICAgb25EZWxldGVDbGljazogZnVuY3Rpb24oZXYpIHtcbiAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHZhciBvbkRlbGV0ZUNvbmZpcm0gPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdibG9jazpyZW1vdmUnLCB0aGlzLmJsb2NrSUQpO1xuICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgfTtcblxuICAgICAgdmFyIG9uRGVsZXRlRGVueSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnc3QtYmxvY2stLWRlbGV0ZS1hY3RpdmUnKTtcbiAgICAgICAgJGRlbGV0ZV9lbC5yZW1vdmUoKTtcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLmlzRW1wdHkoKSkge1xuICAgICAgICBvbkRlbGV0ZUNvbmZpcm0uY2FsbCh0aGlzLCBuZXcgRXZlbnQoJ2NsaWNrJykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuJGlubmVyLmFwcGVuZChfLnRlbXBsYXRlKGRlbGV0ZV90ZW1wbGF0ZSkpO1xuICAgICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ3N0LWJsb2NrLS1kZWxldGUtYWN0aXZlJyk7XG5cbiAgICAgIHZhciAkZGVsZXRlX2VsID0gdGhpcy4kaW5uZXIuZmluZCgnLnN0LWJsb2NrX191aS1kZWxldGUtY29udHJvbHMnKTtcblxuICAgICAgdGhpcy4kaW5uZXIub24oJ2NsaWNrJywgJy5zdC1ibG9jay11aS1idG4tLWNvbmZpcm0tZGVsZXRlJyxcbiAgICAgICAgICAgICAgICAgICAgIG9uRGVsZXRlQ29uZmlybS5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgICAgICAgICAgLm9uKCdjbGljaycsICcuc3QtYmxvY2stdWktYnRuLS1kZW55LWRlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgb25EZWxldGVEZW55LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBwYXN0ZWRNYXJrZG93blRvSFRNTDogZnVuY3Rpb24oY29udGVudCkge1xuICAgICAgcmV0dXJuIHN0VG9IVE1MKHN0VG9NYXJrZG93bihjb250ZW50LCB0aGlzLnR5cGUpLCB0aGlzLnR5cGUpO1xuICAgIH0sXG5cbiAgICBvbkNvbnRlbnRQYXN0ZWQ6IGZ1bmN0aW9uKGV2ZW50LCB0YXJnZXQpe1xuICAgICAgdGFyZ2V0Lmh0bWwodGhpcy5wYXN0ZWRNYXJrZG93blRvSFRNTCh0YXJnZXRbMF0uaW5uZXJIVE1MKSk7XG4gICAgICB0aGlzLmdldFRleHRCbG9jaygpLmNhcmV0VG9FbmQoKTtcbiAgICB9LFxuXG4gICAgYmVmb3JlTG9hZGluZ0RhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5sb2FkaW5nKCk7XG5cbiAgICAgIGlmKHRoaXMuZHJvcHBhYmxlIHx8IHRoaXMudXBsb2FkYWJsZSB8fCB0aGlzLnBhc3RhYmxlKSB7XG4gICAgICAgIHRoaXMuJGVkaXRvci5zaG93KCk7XG4gICAgICAgIHRoaXMuJGlucHV0cy5oaWRlKCk7XG4gICAgICB9XG5cbiAgICAgIFNpbXBsZUJsb2NrLmZuLmJlZm9yZUxvYWRpbmdEYXRhLmNhbGwodGhpcyk7XG5cbiAgICAgIHRoaXMucmVhZHkoKTtcbiAgICB9LFxuXG4gICAgX2hhbmRsZUNvbnRlbnRQYXN0ZTogZnVuY3Rpb24oZXYpIHtcbiAgICAgIHNldFRpbWVvdXQodGhpcy5vbkNvbnRlbnRQYXN0ZWQuYmluZCh0aGlzLCBldiwgJChldi5jdXJyZW50VGFyZ2V0KSksIDApO1xuICAgIH0sXG5cbiAgICBfZ2V0QmxvY2tDbGFzczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJ3N0LWJsb2NrLS0nICsgdGhpcy5jbGFzc05hbWU7XG4gICAgfSxcblxuICAgIC8qXG4gICAgICogSW5pdCBmdW5jdGlvbnMgZm9yIGFkZGluZyBmdW5jdGlvbmFsaXR5XG4gICAgICovXG5cbiAgICBfaW5pdFVJQ29tcG9uZW50czogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBwb3NpdGlvbmVyID0gbmV3IEJsb2NrUG9zaXRpb25lcih0aGlzLiRlbCwgdGhpcy5tZWRpYXRvcik7XG5cbiAgICAgIHRoaXMuX3dpdGhVSUNvbXBvbmVudChwb3NpdGlvbmVyLCAnLnN0LWJsb2NrLXVpLWJ0bi0tcmVvcmRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25lci50b2dnbGUpO1xuXG4gICAgICB0aGlzLl93aXRoVUlDb21wb25lbnQobmV3IEJsb2NrUmVvcmRlcih0aGlzLiRlbCwgdGhpcy5tZWRpYXRvcikpO1xuXG4gICAgICB0aGlzLl93aXRoVUlDb21wb25lbnQobmV3IEJsb2NrRGVsZXRpb24oKSwgJy5zdC1ibG9jay11aS1idG4tLWRlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkRlbGV0ZUNsaWNrKTtcblxuICAgICAgdGhpcy5vbkZvY3VzKCk7XG4gICAgICB0aGlzLm9uQmx1cigpO1xuICAgIH0sXG5cbiAgICBfaW5pdEZvcm1hdHRpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gRW5hYmxlIGZvcm1hdHRpbmcga2V5Ym9hcmQgaW5wdXRcbiAgICAgIHZhciBmb3JtYXR0ZXI7XG4gICAgICBmb3IgKHZhciBuYW1lIGluIEZvcm1hdHRlcnMpIHtcbiAgICAgICAgaWYgKEZvcm1hdHRlcnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICBmb3JtYXR0ZXIgPSBGb3JtYXR0ZXJzW25hbWVdO1xuICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChmb3JtYXR0ZXIua2V5Q29kZSkpIHtcbiAgICAgICAgICAgIGZvcm1hdHRlci5fYmluZFRvQmxvY2sodGhpcy4kZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBfaW5pdFRleHRCbG9ja3M6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nZXRUZXh0QmxvY2soKVxuICAgICAgLmJpbmQoJ3Bhc3RlJywgdGhpcy5faGFuZGxlQ29udGVudFBhc3RlKVxuICAgICAgLmJpbmQoJ2tleXVwJywgdGhpcy5nZXRTZWxlY3Rpb25Gb3JGb3JtYXR0ZXIpXG4gICAgICAuYmluZCgnbW91c2V1cCcsIHRoaXMuZ2V0U2VsZWN0aW9uRm9yRm9ybWF0dGVyKVxuICAgICAgLmJpbmQoJ0RPTU5vZGVJbnNlcnRlZCcsIHRoaXMuY2xlYXJJbnNlcnRlZFN0eWxlcyk7XG4gICAgfSxcblxuICAgIGdldFNlbGVjdGlvbkZvckZvcm1hdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYmxvY2sgPSB0aGlzO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKSxcbiAgICAgICAgICAgIHNlbGVjdGlvblN0ciA9IHNlbGVjdGlvbi50b1N0cmluZygpLnRyaW0oKSxcbiAgICAgICAgICAgIGVuID0gJ2Zvcm1hdHRlcjonICsgKChzZWxlY3Rpb25TdHIgPT09ICcnKSA/ICdoaWRlJyA6ICdwb3NpdGlvbicpO1xuXG4gICAgICAgIGJsb2NrLm1lZGlhdG9yLnRyaWdnZXIoZW4sIGJsb2NrKTtcbiAgICAgICAgRXZlbnRCdXMudHJpZ2dlcihlbiwgYmxvY2spO1xuICAgICAgfSwgMSk7XG4gICAgfSxcblxuICAgIGNsZWFySW5zZXJ0ZWRTdHlsZXM6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldDtcbiAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7IC8vIEhhY2t5IGZpeCBmb3IgQ2hyb21lLlxuICAgIH0sXG5cbiAgICBoYXNUZXh0QmxvY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGV4dEJsb2NrKCkubGVuZ3RoID4gMDtcbiAgICB9LFxuXG4gICAgZ2V0VGV4dEJsb2NrOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHRoaXMudGV4dF9ibG9jaykpIHtcbiAgICAgICAgdGhpcy50ZXh0X2Jsb2NrID0gdGhpcy4kKCcuc3QtdGV4dC1ibG9jaycpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy50ZXh0X2Jsb2NrO1xuICAgIH0sXG5cbiAgICBpc0VtcHR5OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLmlzRW1wdHkodGhpcy5nZXRCbG9ja0RhdGEoKSk7XG4gICAgfVxuXG59KTtcblxuQmxvY2suZXh0ZW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2V4dGVuZCcpOyAvLyBBbGxvdyBvdXIgQmxvY2sgdG8gYmUgZXh0ZW5kZWQuXG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2s7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbWl4aW5OYW1lOiBcIkFqYXhhYmxlXCIsXG5cbiAgYWpheGFibGU6IHRydWUsXG5cbiAgaW5pdGlhbGl6ZUFqYXhhYmxlOiBmdW5jdGlvbigpe1xuICAgIHRoaXMuX3F1ZXVlZCA9IFtdO1xuICB9LFxuXG4gIGFkZFF1ZXVlZEl0ZW06IGZ1bmN0aW9uKG5hbWUsIGRlZmVycmVkKSB7XG4gICAgdXRpbHMubG9nKFwiQWRkaW5nIHF1ZXVlZCBpdGVtIGZvciBcIiArIHRoaXMuYmxvY2tJRCArIFwiIGNhbGxlZCBcIiArIG5hbWUpO1xuXG4gICAgdGhpcy5fcXVldWVkLnB1c2goeyBuYW1lOiBuYW1lLCBkZWZlcnJlZDogZGVmZXJyZWQgfSk7XG4gIH0sXG5cbiAgcmVtb3ZlUXVldWVkSXRlbTogZnVuY3Rpb24obmFtZSkge1xuICAgIHV0aWxzLmxvZyhcIlJlbW92aW5nIHF1ZXVlZCBpdGVtIGZvciBcIiArIHRoaXMuYmxvY2tJRCArIFwiIGNhbGxlZCBcIiArIG5hbWUpO1xuXG4gICAgdGhpcy5fcXVldWVkID0gdGhpcy5fcXVldWVkLmZpbHRlcihmdW5jdGlvbihxdWV1ZWQpIHtcbiAgICAgIHJldHVybiBxdWV1ZWQubmFtZSAhPT0gbmFtZTtcbiAgICB9KTtcbiAgfSxcblxuICBoYXNJdGVtc0luUXVldWU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9xdWV1ZWQubGVuZ3RoID4gMDtcbiAgfSxcblxuICByZXNvbHZlQWxsSW5RdWV1ZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fcXVldWVkLmZvckVhY2goZnVuY3Rpb24oaXRlbSl7XG4gICAgICB1dGlscy5sb2coXCJBYm9ydGluZyBxdWV1ZWQgcmVxdWVzdDogXCIgKyBpdGVtLm5hbWUpO1xuICAgICAgaXRlbS5kZWZlcnJlZC5hYm9ydCgpO1xuICAgIH0sIHRoaXMpO1xuICB9XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbWl4aW5OYW1lOiBcIkNvbnRyb2xsYWJsZVwiLFxuXG4gIGluaXRpYWxpemVDb250cm9sbGFibGU6IGZ1bmN0aW9uKCkge1xuICAgIHV0aWxzLmxvZyhcIkFkZGluZyBjb250cm9sbGFibGUgdG8gYmxvY2sgXCIgKyB0aGlzLmJsb2NrSUQpO1xuICAgIHRoaXMuJGNvbnRyb2xfdWkgPSAkKCc8ZGl2PicsIHsnY2xhc3MnOiAnc3QtYmxvY2tfX2NvbnRyb2wtdWknfSk7XG4gICAgT2JqZWN0LmtleXModGhpcy5jb250cm9scykuZm9yRWFjaChcbiAgICAgIGZ1bmN0aW9uKGNtZCkge1xuICAgICAgICAvLyBCaW5kIGNvbmZpZ3VyZWQgaGFuZGxlciB0byBjdXJyZW50IGJsb2NrIGNvbnRleHRcbiAgICAgICAgdGhpcy5hZGRVaUNvbnRyb2woY21kLCB0aGlzLmNvbnRyb2xzW2NtZF0uYmluZCh0aGlzKSk7XG4gICAgICB9LFxuICAgICAgdGhpc1xuICAgICk7XG4gICAgdGhpcy4kaW5uZXIuYXBwZW5kKHRoaXMuJGNvbnRyb2xfdWkpO1xuICB9LFxuXG4gIGdldENvbnRyb2xUZW1wbGF0ZTogZnVuY3Rpb24oY21kKSB7XG4gICAgcmV0dXJuICQoXCI8YT5cIixcbiAgICAgIHsgJ2RhdGEtaWNvbic6IGNtZCxcbiAgICAgICAgJ2NsYXNzJzogJ3N0LWljb24gc3QtYmxvY2stY29udHJvbC11aS1idG4gc3QtYmxvY2stY29udHJvbC11aS1idG4tLScgKyBjbWRcbiAgICAgIH0pO1xuICB9LFxuXG4gIGFkZFVpQ29udHJvbDogZnVuY3Rpb24oY21kLCBoYW5kbGVyKSB7XG4gICAgdGhpcy4kY29udHJvbF91aS5hcHBlbmQodGhpcy5nZXRDb250cm9sVGVtcGxhdGUoY21kKSk7XG4gICAgdGhpcy4kY29udHJvbF91aS5vbignY2xpY2snLCAnLnN0LWJsb2NrLWNvbnRyb2wtdWktYnRuLS0nICsgY21kLCBoYW5kbGVyKTtcbiAgfVxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBBZGRzIGRyb3AgZnVuY3Rpb25hbHRpeSB0byB0aGlzIGJsb2NrICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vbG9kYXNoJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vY29uZmlnJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuLi9ldmVudC1idXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbWl4aW5OYW1lOiBcIkRyb3BwYWJsZVwiLFxuICB2YWxpZF9kcm9wX2ZpbGVfdHlwZXM6IFsnRmlsZScsICdGaWxlcycsICd0ZXh0L3BsYWluJywgJ3RleHQvdXJpLWxpc3QnXSxcblxuICBpbml0aWFsaXplRHJvcHBhYmxlOiBmdW5jdGlvbigpIHtcbiAgICB1dGlscy5sb2coXCJBZGRpbmcgZHJvcHBhYmxlIHRvIGJsb2NrIFwiICsgdGhpcy5ibG9ja0lEKTtcblxuICAgIHRoaXMuZHJvcF9vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnLmRlZmF1bHRzLkJsb2NrLmRyb3Bfb3B0aW9ucywgdGhpcy5kcm9wX29wdGlvbnMpO1xuXG4gICAgdmFyIGRyb3BfaHRtbCA9ICQoXy50ZW1wbGF0ZSh0aGlzLmRyb3Bfb3B0aW9ucy5odG1sLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBibG9jazogdGhpcywgXzogXyB9KSk7XG5cbiAgICB0aGlzLiRlZGl0b3IuaGlkZSgpO1xuICAgIHRoaXMuJGlucHV0cy5hcHBlbmQoZHJvcF9odG1sKTtcbiAgICB0aGlzLiRkcm9wem9uZSA9IGRyb3BfaHRtbDtcblxuICAgIC8vIEJpbmQgb3VyIGRyb3AgZXZlbnRcbiAgICB0aGlzLiRkcm9wem9uZS5kcm9wQXJlYSgpXG4gICAgICAgICAgICAgICAgICAuYmluZCgnZHJvcCcsIHRoaXMuX2hhbmRsZURyb3AuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLiRpbm5lci5hZGRDbGFzcygnc3QtYmxvY2tfX2lubmVyLS1kcm9wcGFibGUnKTtcbiAgfSxcblxuICBfaGFuZGxlRHJvcDogZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGUgPSBlLm9yaWdpbmFsRXZlbnQ7XG5cbiAgICB2YXIgZWwgPSAkKGUudGFyZ2V0KSxcbiAgICAgICAgdHlwZXMgPSBlLmRhdGFUcmFuc2Zlci50eXBlcztcblxuICAgIGVsLnJlbW92ZUNsYXNzKCdzdC1kcm9wem9uZS0tZHJhZ292ZXInKTtcblxuICAgIC8qXG4gICAgICBDaGVjayB0aGUgdHlwZSB3ZSBqdXN0IHJlY2VpdmVkLFxuICAgICAgZGVsZWdhdGUgaXQgYXdheSB0byBvdXIgYmxvY2tUeXBlcyB0byBwcm9jZXNzXG4gICAgKi9cblxuICAgIGlmICh0eXBlcyAmJlxuICAgICAgICB0eXBlcy5zb21lKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkX2Ryb3BfZmlsZV90eXBlcy5pbmNsdWRlcyh0eXBlKTtcbiAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSkge1xuICAgICAgdGhpcy5vbkRyb3AoZS5kYXRhVHJhbnNmZXIpO1xuICAgIH1cblxuICAgIEV2ZW50QnVzLnRyaWdnZXIoJ2Jsb2NrOmNvbnRlbnQ6ZHJvcHBlZCcsIHRoaXMuYmxvY2tJRCk7XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBtaXhpbk5hbWU6IFwiRmV0Y2hhYmxlXCIsXG5cbiAgaW5pdGlhbGl6ZUZldGNoYWJsZTogZnVuY3Rpb24oKXtcbiAgICB0aGlzLndpdGhNaXhpbihyZXF1aXJlKCcuL2FqYXhhYmxlJykpO1xuICB9LFxuXG4gIGZldGNoOiBmdW5jdGlvbihvcHRpb25zLCBzdWNjZXNzLCBmYWlsdXJlKXtcbiAgICB2YXIgdWlkID0gXy51bmlxdWVJZCh0aGlzLmJsb2NrSUQgKyBcIl9mZXRjaFwiKSxcbiAgICAgICAgeGhyID0gJC5hamF4KG9wdGlvbnMpO1xuXG4gICAgdGhpcy5yZXNldE1lc3NhZ2VzKCk7XG4gICAgdGhpcy5hZGRRdWV1ZWRJdGVtKHVpZCwgeGhyKTtcblxuICAgIGlmKCFfLmlzVW5kZWZpbmVkKHN1Y2Nlc3MpKSB7XG4gICAgICB4aHIuZG9uZShzdWNjZXNzLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGlmKCFfLmlzVW5kZWZpbmVkKGZhaWx1cmUpKSB7XG4gICAgICB4aHIuZmFpbChmYWlsdXJlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHhoci5hbHdheXModGhpcy5yZW1vdmVRdWV1ZWRJdGVtLmJpbmQodGhpcywgdWlkKSk7XG5cbiAgICByZXR1cm4geGhyO1xuICB9XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEFqYXhhYmxlOiByZXF1aXJlKCcuL2FqYXhhYmxlLmpzJyksXG4gIENvbnRyb2xsYWJsZTogcmVxdWlyZSgnLi9jb250cm9sbGFibGUuanMnKSxcbiAgRHJvcHBhYmxlOiByZXF1aXJlKCcuL2Ryb3BwYWJsZS5qcycpLFxuICBGZXRjaGFibGU6IHJlcXVpcmUoJy4vZmV0Y2hhYmxlLmpzJyksXG4gIFBhc3RhYmxlOiByZXF1aXJlKCcuL3Bhc3RhYmxlLmpzJyksXG4gIFVwbG9hZGFibGU6IHJlcXVpcmUoJy4vdXBsb2FkYWJsZS5qcycpLFxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uL2NvbmZpZycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbWl4aW5OYW1lOiBcIlBhc3RhYmxlXCIsXG5cbiAgaW5pdGlhbGl6ZVBhc3RhYmxlOiBmdW5jdGlvbigpIHtcbiAgICB1dGlscy5sb2coXCJBZGRpbmcgcGFzdGFibGUgdG8gYmxvY2sgXCIgKyB0aGlzLmJsb2NrSUQpO1xuXG4gICAgdGhpcy5wYXN0ZV9vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnLmRlZmF1bHRzLkJsb2NrLnBhc3RlX29wdGlvbnMsIHRoaXMucGFzdGVfb3B0aW9ucyk7XG4gICAgdGhpcy4kaW5wdXRzLmFwcGVuZChfLnRlbXBsYXRlKHRoaXMucGFzdGVfb3B0aW9ucy5odG1sLCB0aGlzKSk7XG5cbiAgICB0aGlzLiQoJy5zdC1wYXN0ZS1ibG9jaycpXG4gICAgICAuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpeyAkKHRoaXMpLnNlbGVjdCgpOyB9KVxuICAgICAgLmJpbmQoJ3Bhc3RlJywgdGhpcy5faGFuZGxlQ29udGVudFBhc3RlKVxuICAgICAgLmJpbmQoJ3N1Ym1pdCcsIHRoaXMuX2hhbmRsZUNvbnRlbnRQYXN0ZSk7XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uL2NvbmZpZycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIGZpbGVVcGxvYWRlciA9IHJlcXVpcmUoJy4uL2V4dGVuc2lvbnMvZmlsZS11cGxvYWRlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBtaXhpbk5hbWU6IFwiVXBsb2FkYWJsZVwiLFxuXG4gIHVwbG9hZHNDb3VudDogMCxcblxuICBpbml0aWFsaXplVXBsb2FkYWJsZTogZnVuY3Rpb24oKSB7XG4gICAgdXRpbHMubG9nKFwiQWRkaW5nIHVwbG9hZGFibGUgdG8gYmxvY2sgXCIgKyB0aGlzLmJsb2NrSUQpO1xuICAgIHRoaXMud2l0aE1peGluKHJlcXVpcmUoJy4vYWpheGFibGUnKSk7XG5cbiAgICB0aGlzLnVwbG9hZF9vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnLmRlZmF1bHRzLkJsb2NrLnVwbG9hZF9vcHRpb25zLCB0aGlzLnVwbG9hZF9vcHRpb25zKTtcbiAgICB0aGlzLiRpbnB1dHMuYXBwZW5kKF8udGVtcGxhdGUodGhpcy51cGxvYWRfb3B0aW9ucy5odG1sLCB0aGlzKSk7XG4gIH0sXG5cbiAgdXBsb2FkZXI6IGZ1bmN0aW9uKGZpbGUsIHN1Y2Nlc3MsIGZhaWx1cmUpe1xuICAgIHJldHVybiBmaWxlVXBsb2FkZXIodGhpcywgZmlsZSwgc3VjY2VzcywgZmFpbHVyZSk7XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBIZWFkaW5nIEJsb2NrXG4qL1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xudmFyIHN0VG9IVE1MID0gcmVxdWlyZSgnLi4vdG8taHRtbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrLmV4dGVuZCh7XG5cbiAgdHlwZTogJ0hlYWRpbmcnLFxuXG4gIHRpdGxlOiBmdW5jdGlvbigpeyByZXR1cm4gaTE4bi50KCdibG9ja3M6aGVhZGluZzp0aXRsZScpOyB9LFxuXG4gIGVkaXRvckhUTUw6ICc8ZGl2IGNsYXNzPVwic3QtcmVxdWlyZWQgc3QtdGV4dC1ibG9jayBzdC10ZXh0LWJsb2NrLS1oZWFkaW5nXCIgY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiPjwvZGl2PicsXG5cbiAgaWNvbl9uYW1lOiAnaGVhZGluZycsXG5cbiAgbG9hZERhdGE6IGZ1bmN0aW9uKGRhdGEpe1xuICAgIHRoaXMuZ2V0VGV4dEJsb2NrKCkuaHRtbChzdFRvSFRNTChkYXRhLnRleHQsIHRoaXMudHlwZSkpO1xuICB9XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrLmV4dGVuZCh7XG5cbiAgdHlwZTogXCJpbWFnZVwiLFxuICB0aXRsZTogZnVuY3Rpb24oKSB7IHJldHVybiBpMThuLnQoJ2Jsb2NrczppbWFnZTp0aXRsZScpOyB9LFxuXG4gIGRyb3BwYWJsZTogdHJ1ZSxcbiAgdXBsb2FkYWJsZTogdHJ1ZSxcblxuICBpY29uX25hbWU6ICdpbWFnZScsXG5cbiAgbG9hZERhdGE6IGZ1bmN0aW9uKGRhdGEpe1xuICAgIC8vIENyZWF0ZSBvdXIgaW1hZ2UgdGFnXG4gICAgdGhpcy4kZWRpdG9yLmh0bWwoJCgnPGltZz4nLCB7IHNyYzogZGF0YS5maWxlLnVybCB9KSk7XG4gIH0sXG5cbiAgb25CbG9ja1JlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAvKiBTZXR1cCB0aGUgdXBsb2FkIGJ1dHRvbiAqL1xuICAgIHRoaXMuJGlucHV0cy5maW5kKCdidXR0b24nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGV2KXsgZXYucHJldmVudERlZmF1bHQoKTsgfSk7XG4gICAgdGhpcy4kaW5wdXRzLmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsIChmdW5jdGlvbihldikge1xuICAgICAgdGhpcy5vbkRyb3AoZXYuY3VycmVudFRhcmdldCk7XG4gICAgfSkuYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgb25Ecm9wOiBmdW5jdGlvbih0cmFuc2ZlckRhdGEpe1xuICAgIHZhciBmaWxlID0gdHJhbnNmZXJEYXRhLmZpbGVzWzBdLFxuICAgICAgICB1cmxBUEkgPSAodHlwZW9mIFVSTCAhPT0gXCJ1bmRlZmluZWRcIikgPyBVUkwgOiAodHlwZW9mIHdlYmtpdFVSTCAhPT0gXCJ1bmRlZmluZWRcIikgPyB3ZWJraXRVUkwgOiBudWxsO1xuXG4gICAgLy8gSGFuZGxlIG9uZSB1cGxvYWQgYXQgYSB0aW1lXG4gICAgaWYgKC9pbWFnZS8udGVzdChmaWxlLnR5cGUpKSB7XG4gICAgICB0aGlzLmxvYWRpbmcoKTtcbiAgICAgIC8vIFNob3cgdGhpcyBpbWFnZSBvbiBoZXJlXG4gICAgICB0aGlzLiRpbnB1dHMuaGlkZSgpO1xuICAgICAgdGhpcy4kZWRpdG9yLmh0bWwoJCgnPGltZz4nLCB7IHNyYzogdXJsQVBJLmNyZWF0ZU9iamVjdFVSTChmaWxlKSB9KSkuc2hvdygpO1xuXG4gICAgICB0aGlzLnVwbG9hZGVyKFxuICAgICAgICBmaWxlLFxuICAgICAgICBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdGhpcy5zZXREYXRhKGRhdGEpO1xuICAgICAgICAgIHRoaXMucmVhZHkoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICB0aGlzLmFkZE1lc3NhZ2UoaTE4bi50KCdibG9ja3M6aW1hZ2U6dXBsb2FkX2Vycm9yJykpO1xuICAgICAgICAgIHRoaXMucmVhZHkoKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gIH1cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBUZXh0OiByZXF1aXJlKCcuL3RleHQnKSxcbiAgUXVvdGU6IHJlcXVpcmUoJy4vcXVvdGUnKSxcbiAgSW1hZ2U6IHJlcXVpcmUoJy4vaW1hZ2UnKSxcbiAgSGVhZGluZzogcmVxdWlyZSgnLi9oZWFkaW5nJyksXG4gIExpc3Q6IHJlcXVpcmUoJy4vbGlzdCcpLFxuICBUd2VldDogcmVxdWlyZSgnLi90d2VldCcpLFxuICBWaWRlbzogcmVxdWlyZSgnLi92aWRlbycpLFxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xudmFyIHN0VG9IVE1MID0gcmVxdWlyZSgnLi4vdG8taHRtbCcpO1xuXG52YXIgdGVtcGxhdGUgPSAnPGRpdiBjbGFzcz1cInN0LXRleHQtYmxvY2sgc3QtcmVxdWlyZWRcIiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCI+PHVsPjxsaT48L2xpPjwvdWw+PC9kaXY+JztcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jay5leHRlbmQoe1xuXG4gIHR5cGU6ICdsaXN0JyxcblxuICB0aXRsZTogZnVuY3Rpb24oKSB7IHJldHVybiBpMThuLnQoJ2Jsb2NrczpsaXN0OnRpdGxlJyk7IH0sXG5cbiAgaWNvbl9uYW1lOiAnbGlzdCcsXG5cbiAgZWRpdG9ySFRNTDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8udGVtcGxhdGUodGVtcGxhdGUsIHRoaXMpO1xuICB9LFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbihkYXRhKXtcbiAgICB0aGlzLmdldFRleHRCbG9jaygpLmh0bWwoXCI8dWw+XCIgKyBzdFRvSFRNTChkYXRhLnRleHQsIHRoaXMudHlwZSkgKyBcIjwvdWw+XCIpO1xuICB9LFxuXG4gIG9uQmxvY2tSZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2hlY2tGb3JMaXN0ID0gdGhpcy5jaGVja0Zvckxpc3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLmdldFRleHRCbG9jaygpLm9uKCdjbGljayBrZXl1cCcsIHRoaXMuY2hlY2tGb3JMaXN0KTtcbiAgICB0aGlzLmZvY3VzKCk7XG4gIH0sXG5cbiAgY2hlY2tGb3JMaXN0OiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy4kKCd1bCcpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJpbnNlcnRVbm9yZGVyZWRMaXN0XCIsIGZhbHNlLCBmYWxzZSk7XG4gICAgfVxuICB9LFxuXG4gIHRvTWFya2Rvd246IGZ1bmN0aW9uKG1hcmtkb3duKSB7XG4gICAgcmV0dXJuIG1hcmtkb3duLnJlcGxhY2UoLzxcXC9saT4vbWcsXCJcXG5cIilcbiAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPFxcLz9bXj5dKyg+fCQpL2csIFwiXCIpXG4gICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14oLispJC9tZyxcIiAtICQxXCIpO1xuICB9LFxuXG4gIHRvSFRNTDogZnVuY3Rpb24oaHRtbCkge1xuICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoL14gLSAoLispJC9tZyxcIjxsaT4kMTwvbGk+XCIpXG4gICAgICAgICAgICAgICAucmVwbGFjZSgvXFxuL21nLCBcIlwiKTtcblxuICAgIHJldHVybiBodG1sO1xuICB9LFxuXG4gIG9uQ29udGVudFBhc3RlZDogZnVuY3Rpb24oZXZlbnQsIHRhcmdldCkge1xuICAgIHRoaXMuJCgndWwnKS5odG1sKFxuICAgICAgdGhpcy5wYXN0ZWRNYXJrZG93blRvSFRNTCh0YXJnZXRbMF0uaW5uZXJIVE1MKSk7XG4gICAgdGhpcy5nZXRUZXh0QmxvY2soKS5jYXJldFRvRW5kKCk7XG4gIH0sXG5cbiAgaXNFbXB0eTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8uaXNFbXB0eSh0aGlzLmdldEJsb2NrRGF0YSgpLnRleHQpO1xuICB9XG5cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIEJsb2NrIFF1b3RlXG4qL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xudmFyIHN0VG9IVE1MID0gcmVxdWlyZSgnLi4vdG8taHRtbCcpO1xuXG52YXIgdGVtcGxhdGUgPSBfLnRlbXBsYXRlKFtcbiAgJzxibG9ja3F1b3RlIGNsYXNzPVwic3QtcmVxdWlyZWQgc3QtdGV4dC1ibG9ja1wiIGNvbnRlbnRlZGl0YWJsZT1cInRydWVcIj48L2Jsb2NrcXVvdGU+JyxcbiAgJzxsYWJlbCBjbGFzcz1cInN0LWlucHV0LWxhYmVsXCI+IDwlPSBpMThuLnQoXCJibG9ja3M6cXVvdGU6Y3JlZGl0X2ZpZWxkXCIpICU+PC9sYWJlbD4nLFxuICAnPGlucHV0IG1heGxlbmd0aD1cIjE0MFwiIG5hbWU9XCJjaXRlXCIgcGxhY2Vob2xkZXI9XCI8JT0gaTE4bi50KFwiYmxvY2tzOnF1b3RlOmNyZWRpdF9maWVsZFwiKSAlPlwiJyxcbiAgJyBjbGFzcz1cInN0LWlucHV0LXN0cmluZyBzdC1yZXF1aXJlZCBqcy1jaXRlLWlucHV0XCIgdHlwZT1cInRleHRcIiAvPidcbl0uam9pbihcIlxcblwiKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2suZXh0ZW5kKHtcblxuICB0eXBlOiBcInF1b3RlXCIsXG5cbiAgdGl0bGU6IGZ1bmN0aW9uKCkgeyByZXR1cm4gaTE4bi50KCdibG9ja3M6cXVvdGU6dGl0bGUnKTsgfSxcblxuICBpY29uX25hbWU6ICdxdW90ZScsXG5cbiAgZWRpdG9ySFRNTDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRlbXBsYXRlKHRoaXMpO1xuICB9LFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbihkYXRhKXtcbiAgICB0aGlzLmdldFRleHRCbG9jaygpLmh0bWwoc3RUb0hUTUwoZGF0YS50ZXh0LCB0aGlzLnR5cGUpKTtcbiAgICB0aGlzLiQoJy5qcy1jaXRlLWlucHV0JykudmFsKGRhdGEuY2l0ZSk7XG4gIH0sXG5cbiAgdG9NYXJrZG93bjogZnVuY3Rpb24obWFya2Rvd24pIHtcbiAgICByZXR1cm4gbWFya2Rvd24ucmVwbGFjZSgvXiguKykkL21nLFwiPiAkMVwiKTtcbiAgfVxuXG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBUZXh0IEJsb2NrXG4qL1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xudmFyIHN0VG9IVE1MID0gcmVxdWlyZSgnLi4vdG8taHRtbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrLmV4dGVuZCh7XG5cbiAgdHlwZTogXCJ0ZXh0XCIsXG5cbiAgdGl0bGU6IGZ1bmN0aW9uKCkgeyByZXR1cm4gaTE4bi50KCdibG9ja3M6dGV4dDp0aXRsZScpOyB9LFxuXG4gIGVkaXRvckhUTUw6ICc8ZGl2IGNsYXNzPVwic3QtcmVxdWlyZWQgc3QtdGV4dC1ibG9ja1wiIGNvbnRlbnRlZGl0YWJsZT1cInRydWVcIj48L2Rpdj4nLFxuXG4gIGljb25fbmFtZTogJ3RleHQnLFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbihkYXRhKXtcbiAgICB0aGlzLmdldFRleHRCbG9jaygpLmh0bWwoc3RUb0hUTUwoZGF0YS50ZXh0LCB0aGlzLnR5cGUpKTtcbiAgfVxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuLi9sb2Rhc2gnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbnZhciBCbG9jayA9IHJlcXVpcmUoJy4uL2Jsb2NrJyk7XG5cbnZhciB0d2VldF90ZW1wbGF0ZSA9IF8udGVtcGxhdGUoW1xuICBcIjxibG9ja3F1b3RlIGNsYXNzPSd0d2l0dGVyLXR3ZWV0JyBhbGlnbj0nY2VudGVyJz5cIixcbiAgXCI8cD48JT0gdGV4dCAlPjwvcD5cIixcbiAgXCImbWRhc2g7IDwlPSB1c2VyLm5hbWUgJT4gKEA8JT0gdXNlci5zY3JlZW5fbmFtZSAlPilcIixcbiAgXCI8YSBocmVmPSc8JT0gc3RhdHVzX3VybCAlPicgZGF0YS1kYXRldGltZT0nPCU9IGNyZWF0ZWRfYXQgJT4nPjwlPSBjcmVhdGVkX2F0ICU+PC9hPlwiLFxuICBcIjwvYmxvY2txdW90ZT5cIixcbiAgJzxzY3JpcHQgc3JjPVwiLy9wbGF0Zm9ybS50d2l0dGVyLmNvbS93aWRnZXRzLmpzXCIgY2hhcnNldD1cInV0Zi04XCI+PC9zY3JpcHQ+J1xuXS5qb2luKFwiXFxuXCIpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jay5leHRlbmQoe1xuXG4gIHR5cGU6IFwidHdlZXRcIixcbiAgZHJvcHBhYmxlOiB0cnVlLFxuICBwYXN0YWJsZTogdHJ1ZSxcbiAgZmV0Y2hhYmxlOiB0cnVlLFxuXG4gIGRyb3Bfb3B0aW9uczoge1xuICAgIHJlX3JlbmRlcl9vbl9yZW9yZGVyOiB0cnVlXG4gIH0sXG5cbiAgdGl0bGU6IGZ1bmN0aW9uKCl7IHJldHVybiBpMThuLnQoJ2Jsb2Nrczp0d2VldDp0aXRsZScpOyB9LFxuXG4gIGZldGNoVXJsOiBmdW5jdGlvbih0d2VldElEKSB7XG4gICAgcmV0dXJuIFwiL3R3ZWV0cy8/dHdlZXRfaWQ9XCIgKyB0d2VldElEO1xuICB9LFxuXG4gIGljb25fbmFtZTogJ3R3aXR0ZXInLFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKF8uaXNVbmRlZmluZWQoZGF0YS5zdGF0dXNfdXJsKSkgeyBkYXRhLnN0YXR1c191cmwgPSAnJzsgfVxuICAgIHRoaXMuJGlubmVyLmZpbmQoJ2lmcmFtZScpLnJlbW92ZSgpO1xuICAgIHRoaXMuJGlubmVyLnByZXBlbmQodHdlZXRfdGVtcGxhdGUoZGF0YSkpO1xuICB9LFxuXG4gIG9uQ29udGVudFBhc3RlZDogZnVuY3Rpb24oZXZlbnQpe1xuICAgIC8vIENvbnRlbnQgcGFzdGVkLiBEZWxlZ2F0ZSB0byB0aGUgZHJvcCBwYXJzZSBtZXRob2RcbiAgICB2YXIgaW5wdXQgPSAkKGV2ZW50LnRhcmdldCksXG4gICAgdmFsID0gaW5wdXQudmFsKCk7XG5cbiAgICAvLyBQYXNzIHRoaXMgdG8gdGhlIHNhbWUgaGFuZGxlciBhcyBvbkRyb3BcbiAgICB0aGlzLmhhbmRsZVR3aXR0ZXJEcm9wUGFzdGUodmFsKTtcbiAgfSxcblxuICBoYW5kbGVUd2l0dGVyRHJvcFBhc3RlOiBmdW5jdGlvbih1cmwpe1xuICAgIGlmICghdGhpcy52YWxpZFR3ZWV0VXJsKHVybCkpIHtcbiAgICAgIHV0aWxzLmxvZyhcIkludmFsaWQgVHdlZXQgVVJMXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFR3aXR0ZXIgc3RhdHVzXG4gICAgdmFyIHR3ZWV0SUQgPSB1cmwubWF0Y2goL1teXFwvXSskLyk7XG4gICAgaWYgKCFfLmlzRW1wdHkodHdlZXRJRCkpIHtcbiAgICAgIHRoaXMubG9hZGluZygpO1xuICAgICAgdHdlZXRJRCA9IHR3ZWV0SURbMF07XG5cbiAgICAgIHZhciBhamF4T3B0aW9ucyA9IHtcbiAgICAgICAgdXJsOiB0aGlzLmZldGNoVXJsKHR3ZWV0SUQpLFxuICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuZmV0Y2goYWpheE9wdGlvbnMsIHRoaXMub25Ud2VldFN1Y2Nlc3MsIHRoaXMub25Ud2VldEZhaWwpO1xuICAgIH1cbiAgfSxcblxuICB2YWxpZFR3ZWV0VXJsOiBmdW5jdGlvbih1cmwpIHtcbiAgICByZXR1cm4gKHV0aWxzLmlzVVJJKHVybCkgJiZcbiAgICAgICAgICAgIHVybC5pbmRleE9mKFwidHdpdHRlclwiKSAhPT0gLTEgJiZcbiAgICAgICAgICAgIHVybC5pbmRleE9mKFwic3RhdHVzXCIpICE9PSAtMSk7XG4gIH0sXG5cbiAgb25Ud2VldFN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAvLyBQYXJzZSB0aGUgdHdpdHRlciBvYmplY3QgaW50byBzb21ldGhpbmcgYSBiaXQgc2xpbW1lci4uXG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIHVzZXI6IHtcbiAgICAgICAgcHJvZmlsZV9pbWFnZV91cmw6IGRhdGEudXNlci5wcm9maWxlX2ltYWdlX3VybCxcbiAgICAgICAgcHJvZmlsZV9pbWFnZV91cmxfaHR0cHM6IGRhdGEudXNlci5wcm9maWxlX2ltYWdlX3VybF9odHRwcyxcbiAgICAgICAgc2NyZWVuX25hbWU6IGRhdGEudXNlci5zY3JlZW5fbmFtZSxcbiAgICAgICAgbmFtZTogZGF0YS51c2VyLm5hbWVcbiAgICAgIH0sXG4gICAgICBpZDogZGF0YS5pZF9zdHIsXG4gICAgICB0ZXh0OiBkYXRhLnRleHQsXG4gICAgICBjcmVhdGVkX2F0OiBkYXRhLmNyZWF0ZWRfYXQsXG4gICAgICBlbnRpdGllczogZGF0YS5lbnRpdGllcyxcbiAgICAgIHN0YXR1c191cmw6IFwiaHR0cHM6Ly90d2l0dGVyLmNvbS9cIiArIGRhdGEudXNlci5zY3JlZW5fbmFtZSArIFwiL3N0YXR1cy9cIiArIGRhdGEuaWRfc3RyXG4gICAgfTtcblxuICAgIHRoaXMuc2V0QW5kTG9hZERhdGEob2JqKTtcbiAgICB0aGlzLnJlYWR5KCk7XG4gIH0sXG5cbiAgb25Ud2VldEZhaWw6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYWRkTWVzc2FnZShpMThuLnQoXCJibG9ja3M6dHdlZXQ6ZmV0Y2hfZXJyb3JcIikpO1xuICAgIHRoaXMucmVhZHkoKTtcbiAgfSxcblxuICBvbkRyb3A6IGZ1bmN0aW9uKHRyYW5zZmVyRGF0YSl7XG4gICAgdmFyIHVybCA9IHRyYW5zZmVyRGF0YS5nZXREYXRhKCd0ZXh0L3BsYWluJyk7XG4gICAgdGhpcy5oYW5kbGVUd2l0dGVyRHJvcFBhc3RlKHVybCk7XG4gIH1cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrLmV4dGVuZCh7XG5cbiAgLy8gbW9yZSBwcm92aWRlcnMgYXQgaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vamVmZmxpbmcvYTk2MjlhZTI4ZTA3Njc4NWExNGZcbiAgcHJvdmlkZXJzOiB7XG4gICAgdmltZW86IHtcbiAgICAgIHJlZ2V4OiAvKD86aHR0cFtzXT86XFwvXFwvKT8oPzp3d3cuKT92aW1lby5jb21cXC8oLispLyxcbiAgICAgIGh0bWw6IFwiPGlmcmFtZSBzcmM9XFxcInt7cHJvdG9jb2x9fS8vcGxheWVyLnZpbWVvLmNvbS92aWRlby97e3JlbW90ZV9pZH19P3RpdGxlPTAmYnlsaW5lPTBcXFwiIHdpZHRoPVxcXCI1ODBcXFwiIGhlaWdodD1cXFwiMzIwXFxcIiBmcmFtZWJvcmRlcj1cXFwiMFxcXCI+PC9pZnJhbWU+XCJcbiAgICB9LFxuICAgIHlvdXR1YmU6IHtcbiAgICAgIHJlZ2V4OiAvKD86aHR0cFtzXT86XFwvXFwvKT8oPzp3d3cuKT8oPzooPzp5b3V0dWJlLmNvbVxcL3dhdGNoXFw/KD86LiopKD86dj0pKXwoPzp5b3V0dS5iZVxcLykpKFteJl0uKykvLFxuICAgICAgaHRtbDogXCI8aWZyYW1lIHNyYz1cXFwie3twcm90b2NvbH19Ly93d3cueW91dHViZS5jb20vZW1iZWQve3tyZW1vdGVfaWR9fVxcXCIgd2lkdGg9XFxcIjU4MFxcXCIgaGVpZ2h0PVxcXCIzMjBcXFwiIGZyYW1lYm9yZGVyPVxcXCIwXFxcIiBhbGxvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+XCJcbiAgICB9XG4gIH0sXG5cbiAgdHlwZTogJ3ZpZGVvJyxcbiAgdGl0bGU6IGZ1bmN0aW9uKCkgeyByZXR1cm4gaTE4bi50KCdibG9ja3M6dmlkZW86dGl0bGUnKTsgfSxcblxuICBkcm9wcGFibGU6IHRydWUsXG4gIHBhc3RhYmxlOiB0cnVlLFxuXG4gIGljb25fbmFtZTogJ3ZpZGVvJyxcblxuICBsb2FkRGF0YTogZnVuY3Rpb24oZGF0YSl7XG4gICAgaWYgKCF0aGlzLnByb3ZpZGVycy5oYXNPd25Qcm9wZXJ0eShkYXRhLnNvdXJjZSkpIHsgcmV0dXJuOyB9XG5cbiAgICBpZiAodGhpcy5wcm92aWRlcnNbZGF0YS5zb3VyY2VdLnNxdWFyZSkge1xuICAgICAgdGhpcy4kZWRpdG9yLmFkZENsYXNzKCdzdC1ibG9ja19fZWRpdG9yLS13aXRoLXNxdWFyZS1tZWRpYScpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiRlZGl0b3IuYWRkQ2xhc3MoJ3N0LWJsb2NrX19lZGl0b3ItLXdpdGgtc2l4dGVlbi1ieS1uaW5lLW1lZGlhJyk7XG4gICAgfVxuXG4gICAgdmFyIGVtYmVkX3N0cmluZyA9IHRoaXMucHJvdmlkZXJzW2RhdGEuc291cmNlXS5odG1sXG4gICAgLnJlcGxhY2UoJ3t7cHJvdG9jb2x9fScsIHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbClcbiAgICAucmVwbGFjZSgne3tyZW1vdGVfaWR9fScsIGRhdGEucmVtb3RlX2lkKVxuICAgIC5yZXBsYWNlKCd7e3dpZHRofX0nLCB0aGlzLiRlZGl0b3Iud2lkdGgoKSk7IC8vIGZvciB2aWRlb3MgdGhhdCBjYW4ndCByZXNpemUgYXV0b21hdGljYWxseSBsaWtlIHZpbmVcblxuICAgIHRoaXMuJGVkaXRvci5odG1sKGVtYmVkX3N0cmluZyk7XG4gIH0sXG5cbiAgb25Db250ZW50UGFzdGVkOiBmdW5jdGlvbihldmVudCl7XG4gICAgdGhpcy5oYW5kbGVEcm9wUGFzdGUoJChldmVudC50YXJnZXQpLnZhbCgpKTtcbiAgfSxcblxuICBoYW5kbGVEcm9wUGFzdGU6IGZ1bmN0aW9uKHVybCl7XG4gICAgaWYoIXV0aWxzLmlzVVJJKHVybCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbWF0Y2gsIGRhdGE7XG5cbiAgICB0aGlzLnByb3ZpZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHByb3ZpZGVyLCBpbmRleCkge1xuICAgICAgbWF0Y2ggPSBwcm92aWRlci5yZWdleC5leGVjKHVybCk7XG5cbiAgICAgIGlmKG1hdGNoICE9PSBudWxsICYmICFfLmlzVW5kZWZpbmVkKG1hdGNoWzFdKSkge1xuICAgICAgICBkYXRhID0ge1xuICAgICAgICAgIHNvdXJjZTogaW5kZXgsXG4gICAgICAgICAgcmVtb3RlX2lkOiBtYXRjaFsxXVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2V0QW5kTG9hZERhdGEoZGF0YSk7XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG4gIH0sXG5cbiAgb25Ecm9wOiBmdW5jdGlvbih0cmFuc2ZlckRhdGEpe1xuICAgIHZhciB1cmwgPSB0cmFuc2ZlckRhdGEuZ2V0RGF0YSgndGV4dC9wbGFpbicpO1xuICAgIHRoaXMuaGFuZGxlRHJvcFBhc3RlKHVybCk7XG4gIH1cbn0pO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRlYnVnOiBmYWxzZSxcbiAgc2tpcFZhbGlkYXRpb246IGZhbHNlLFxuICB2ZXJzaW9uOiBcIjAuNC4wXCIsXG4gIGxhbmd1YWdlOiBcImVuXCIsXG5cbiAgaW5zdGFuY2VzOiBbXSxcblxuICBkZWZhdWx0czoge1xuICAgIGRlZmF1bHRUeXBlOiBmYWxzZSxcbiAgICBzcGlubmVyOiB7XG4gICAgICBjbGFzc05hbWU6ICdzdC1zcGlubmVyJyxcbiAgICAgIGxpbmVzOiA5LFxuICAgICAgbGVuZ3RoOiA4LFxuICAgICAgd2lkdGg6IDMsXG4gICAgICByYWRpdXM6IDYsXG4gICAgICBjb2xvcjogJyMwMDAnLFxuICAgICAgc3BlZWQ6IDEuNCxcbiAgICAgIHRyYWlsOiA1NyxcbiAgICAgIHNoYWRvdzogZmFsc2UsXG4gICAgICBsZWZ0OiAnNTAlJyxcbiAgICAgIHRvcDogJzUwJSdcbiAgICB9LFxuICAgIGJsb2NrTGltaXQ6IDAsXG4gICAgYmxvY2tUeXBlTGltaXRzOiB7fSxcbiAgICByZXF1aXJlZDogW10sXG4gICAgdXBsb2FkVXJsOiAnL2F0dGFjaG1lbnRzJyxcbiAgICBiYXNlSW1hZ2VVcmw6ICcvc2lyLXRyZXZvci11cGxvYWRzLycsXG4gICAgZXJyb3JzQ29udGFpbmVyOiB1bmRlZmluZWQsXG4gIH1cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAqIFNpciBUcmV2b3IgRWRpdG9yXG4gKiAtLVxuICogUmVwcmVzZW50cyBvbmUgU2lyIFRyZXZvciBlZGl0b3IgaW5zdGFuY2UgKHdpdGggbXVsdGlwbGUgYmxvY2tzKVxuICogRWFjaCBibG9jayByZWZlcmVuY2VzIHRoaXMgaW5zdGFuY2UuXG4gKiBCbG9ja1R5cGVzIGFyZSBnbG9iYWwgaG93ZXZlci5cbiAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIEV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuL2V2ZW50LWJ1cycpO1xudmFyIEZvcm1FdmVudHMgPSByZXF1aXJlKCcuL2Zvcm0tZXZlbnRzJyk7XG52YXIgQmxvY2tDb250cm9scyA9IHJlcXVpcmUoJy4vYmxvY2stY29udHJvbHMnKTtcbnZhciBCbG9ja01hbmFnZXIgPSByZXF1aXJlKCcuL2Jsb2NrLW1hbmFnZXInKTtcbnZhciBGbG9hdGluZ0Jsb2NrQ29udHJvbHMgPSByZXF1aXJlKCcuL2Zsb2F0aW5nLWJsb2NrLWNvbnRyb2xzJyk7XG52YXIgRm9ybWF0QmFyID0gcmVxdWlyZSgnLi9mb3JtYXQtYmFyJyk7XG52YXIgRWRpdG9yU3RvcmUgPSByZXF1aXJlKCcuL2V4dGVuc2lvbnMvZWRpdG9yLXN0b3JlJyk7XG52YXIgRXJyb3JIYW5kbGVyID0gcmVxdWlyZSgnLi9lcnJvci1oYW5kbGVyJyk7XG5cbnZhciBFZGl0b3IgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHRoaXMuaW5pdGlhbGl6ZShvcHRpb25zKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oRWRpdG9yLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vZXZlbnRzJyksIHtcblxuICBib3VuZDogWydvbkZvcm1TdWJtaXQnLCAnaGlkZUFsbFRoZVRoaW5ncycsICdjaGFuZ2VCbG9ja1Bvc2l0aW9uJyxcbiAgICAncmVtb3ZlQmxvY2tEcmFnT3ZlcicsICdyZW5kZXJCbG9jaycsICdyZXNldEJsb2NrQ29udHJvbHMnLFxuICAgICdibG9ja0xpbWl0UmVhY2hlZCddLCBcblxuICBldmVudHM6IHtcbiAgICAnYmxvY2s6cmVvcmRlcjpkcmFnZW5kJzogJ3JlbW92ZUJsb2NrRHJhZ092ZXInLFxuICAgICdibG9jazpjb250ZW50OmRyb3BwZWQnOiAncmVtb3ZlQmxvY2tEcmFnT3ZlcidcbiAgfSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdXRpbHMubG9nKFwiSW5pdCBTaXJUcmV2b3IuRWRpdG9yXCIpO1xuXG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnLmRlZmF1bHRzLCBvcHRpb25zIHx8IHt9KTtcbiAgICB0aGlzLklEID0gXy51bmlxdWVJZCgnc3QtZWRpdG9yLScpO1xuXG4gICAgaWYgKCF0aGlzLl9lbnN1cmVBbmRTZXRFbGVtZW50cygpKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgaWYoIV8uaXNVbmRlZmluZWQodGhpcy5vcHRpb25zLm9uRWRpdG9yUmVuZGVyKSAmJlxuICAgICAgIF8uaXNGdW5jdGlvbih0aGlzLm9wdGlvbnMub25FZGl0b3JSZW5kZXIpKSB7XG4gICAgICB0aGlzLm9uRWRpdG9yUmVuZGVyID0gdGhpcy5vcHRpb25zLm9uRWRpdG9yUmVuZGVyO1xuICAgIH1cblxuICAgIC8vIE1lZGlhdGVkIGV2ZW50cyBmb3IgKnRoaXMqIEVkaXRvciBpbnN0YW5jZVxuICAgIHRoaXMubWVkaWF0b3IgPSBPYmplY3QuYXNzaWduKHt9LCBFdmVudHMpO1xuXG4gICAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuXG4gICAgY29uZmlnLmluc3RhbmNlcy5wdXNoKHRoaXMpO1xuXG4gICAgdGhpcy5idWlsZCgpO1xuXG4gICAgRm9ybUV2ZW50cy5iaW5kRm9ybVN1Ym1pdCh0aGlzLiRmb3JtKTtcbiAgfSxcblxuICAvKlxuICAgKiBCdWlsZCB0aGUgRWRpdG9yIGluc3RhbmNlLlxuICAgKiBDaGVjayB0byBzZWUgaWYgd2UndmUgYmVlbiBwYXNzZWQgSlNPTiBhbHJlYWR5LCBhbmQgaWYgbm90IHRyeSBhbmRcbiAgICogY3JlYXRlIGEgZGVmYXVsdCBibG9jay5cbiAgICogSWYgd2UgaGF2ZSBKU09OIHRoZW4gd2UgbmVlZCB0byBidWlsZCBhbGwgb2Ygb3VyIGJsb2NrcyBmcm9tIHRoaXMuXG4gICAqL1xuICBidWlsZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZWwuaGlkZSgpO1xuXG4gICAgdGhpcy5lcnJvckhhbmRsZXIgPSBuZXcgRXJyb3JIYW5kbGVyKHRoaXMuJG91dGVyLCB0aGlzLm1lZGlhdG9yLCB0aGlzLm9wdGlvbnMuZXJyb3JzQ29udGFpbmVyKTtcbiAgICB0aGlzLnN0b3JlID0gbmV3IEVkaXRvclN0b3JlKHRoaXMuJGVsLnZhbCgpLCB0aGlzLm1lZGlhdG9yKTtcbiAgICB0aGlzLmJsb2NrX21hbmFnZXIgPSBuZXcgQmxvY2tNYW5hZ2VyKHRoaXMub3B0aW9ucywgdGhpcy5JRCwgdGhpcy5tZWRpYXRvcik7XG4gICAgdGhpcy5ibG9ja19jb250cm9scyA9IG5ldyBCbG9ja0NvbnRyb2xzKHRoaXMuYmxvY2tfbWFuYWdlci5ibG9ja1R5cGVzLCB0aGlzLm1lZGlhdG9yKTtcbiAgICB0aGlzLmZsX2Jsb2NrX2NvbnRyb2xzID0gbmV3IEZsb2F0aW5nQmxvY2tDb250cm9scyh0aGlzLiR3cmFwcGVyLCB0aGlzLklELCB0aGlzLm1lZGlhdG9yKTtcbiAgICB0aGlzLmZvcm1hdEJhciA9IG5ldyBGb3JtYXRCYXIodGhpcy5vcHRpb25zLmZvcm1hdEJhciwgdGhpcy5tZWRpYXRvcik7XG5cbiAgICB0aGlzLm1lZGlhdG9yLm9uKCdibG9jazpjaGFuZ2VQb3NpdGlvbicsIHRoaXMuY2hhbmdlQmxvY2tQb3NpdGlvbik7XG4gICAgdGhpcy5tZWRpYXRvci5vbignYmxvY2stY29udHJvbHM6cmVzZXQnLCB0aGlzLnJlc2V0QmxvY2tDb250cm9scyk7XG4gICAgdGhpcy5tZWRpYXRvci5vbignYmxvY2s6bGltaXRSZWFjaGVkJywgdGhpcy5ibG9ja0xpbWl0UmVhY2hlZCk7XG4gICAgdGhpcy5tZWRpYXRvci5vbignYmxvY2s6cmVuZGVyJywgdGhpcy5yZW5kZXJCbG9jayk7XG5cbiAgICB0aGlzLmRhdGFTdG9yZSA9IFwiUGxlYXNlIHVzZSBzdG9yZS5yZXRyaWV2ZSgpO1wiO1xuXG4gICAgdGhpcy5fc2V0RXZlbnRzKCk7XG5cbiAgICB0aGlzLiR3cmFwcGVyLnByZXBlbmQodGhpcy5mbF9ibG9ja19jb250cm9scy5yZW5kZXIoKS4kZWwpO1xuICAgICQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKHRoaXMuZm9ybWF0QmFyLnJlbmRlcigpLiRlbCk7XG4gICAgdGhpcy4kb3V0ZXIuYXBwZW5kKHRoaXMuYmxvY2tfY29udHJvbHMucmVuZGVyKCkuJGVsKTtcblxuICAgICQod2luZG93KS5iaW5kKCdjbGljaycsIHRoaXMuaGlkZUFsbFRoZVRoaW5ncyk7XG5cbiAgICB0aGlzLmNyZWF0ZUJsb2NrcygpO1xuICAgIHRoaXMuJHdyYXBwZXIuYWRkQ2xhc3MoJ3N0LXJlYWR5Jyk7XG5cbiAgICBpZighXy5pc1VuZGVmaW5lZCh0aGlzLm9uRWRpdG9yUmVuZGVyKSkge1xuICAgICAgdGhpcy5vbkVkaXRvclJlbmRlcigpO1xuICAgIH1cbiAgfSxcblxuICBjcmVhdGVCbG9ja3M6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdG9yZSA9IHRoaXMuc3RvcmUucmV0cmlldmUoKTtcblxuICAgIGlmIChzdG9yZS5kYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgIHN0b3JlLmRhdGEuZm9yRWFjaChmdW5jdGlvbihibG9jaykge1xuICAgICAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Jsb2NrOmNyZWF0ZScsIGJsb2NrLnR5cGUsIGJsb2NrLmRhdGEpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZGVmYXVsdFR5cGUgIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Jsb2NrOmNyZWF0ZScsIHRoaXMub3B0aW9ucy5kZWZhdWx0VHlwZSwge30pO1xuICAgIH1cbiAgfSxcblxuICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAvLyBEZXN0cm95IHRoZSByZW5kZXJlZCBzdWIgdmlld3NcbiAgICB0aGlzLmZvcm1hdEJhci5kZXN0cm95KCk7XG4gICAgdGhpcy5mbF9ibG9ja19jb250cm9scy5kZXN0cm95KCk7XG4gICAgdGhpcy5ibG9ja19jb250cm9scy5kZXN0cm95KCk7XG5cbiAgICAvLyBEZXN0cm95IGFsbCBibG9ja3NcbiAgICB0aGlzLmJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Jsb2NrOnJlbW92ZScsIHRoaXMuYmxvY2suYmxvY2tJRCk7XG4gICAgfSwgdGhpcyk7XG5cbiAgICAvLyBTdG9wIGxpc3RlbmluZyB0byBldmVudHNcbiAgICB0aGlzLm1lZGlhdG9yLnN0b3BMaXN0ZW5pbmcoKTtcbiAgICB0aGlzLnN0b3BMaXN0ZW5pbmcoKTtcblxuICAgIC8vIFJlbW92ZSBpbnN0YW5jZVxuICAgIGNvbmZpZy5pbnN0YW5jZXMgPSBjb25maWcuaW5zdGFuY2VzLmZpbHRlcihmdW5jdGlvbihpbnN0YW5jZSkge1xuICAgICAgcmV0dXJuIGluc3RhbmNlLklEICE9PSB0aGlzLklEO1xuICAgIH0sIHRoaXMpO1xuXG4gICAgLy8gQ2xlYXIgdGhlIHN0b3JlXG4gICAgdGhpcy5zdG9yZS5yZXNldCgpO1xuICAgIHRoaXMuJG91dGVyLnJlcGxhY2VXaXRoKHRoaXMuJGVsLmRldGFjaCgpKTtcbiAgfSxcblxuICByZWluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICB0aGlzLmluaXRpYWxpemUob3B0aW9ucyB8fCB0aGlzLm9wdGlvbnMpO1xuICB9LFxuXG4gIHJlc2V0QmxvY2tDb250cm9sczogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5ibG9ja19jb250cm9scy5yZW5kZXJJbkNvbnRhaW5lcih0aGlzLiR3cmFwcGVyKTtcbiAgICB0aGlzLmJsb2NrX2NvbnRyb2xzLmhpZGUoKTtcbiAgfSxcblxuICBibG9ja0xpbWl0UmVhY2hlZDogZnVuY3Rpb24odG9nZ2xlKSB7XG4gICAgdGhpcy4kd3JhcHBlci50b2dnbGVDbGFzcygnc3QtLWJsb2NrLWxpbWl0LXJlYWNoZWQnLCB0b2dnbGUpO1xuICB9LFxuXG4gIF9zZXRFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMuZXZlbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIEV2ZW50QnVzLm9uKHR5cGUsIHRoaXNbdGhpcy5ldmVudHNbdHlwZV1dLCB0aGlzKTtcbiAgICB9LCB0aGlzKTtcbiAgfSxcblxuICBoaWRlQWxsVGhlVGhpbmdzOiBmdW5jdGlvbihlKSB7XG4gICAgdGhpcy5ibG9ja19jb250cm9scy5oaWRlKCk7XG4gICAgdGhpcy5mb3JtYXRCYXIuaGlkZSgpO1xuICB9LFxuXG4gIHN0b3JlOiBmdW5jdGlvbihtZXRob2QsIG9wdGlvbnMpe1xuICAgIHV0aWxzLmxvZyhcIlRoZSBzdG9yZSBtZXRob2QgaGFzIGJlZW4gcmVtb3ZlZCwgcGxlYXNlIGNhbGwgc3RvcmVbbWV0aG9kTmFtZV1cIik7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmVbbWV0aG9kXS5jYWxsKHRoaXMsIG9wdGlvbnMgfHwge30pO1xuICB9LFxuXG4gIHJlbmRlckJsb2NrOiBmdW5jdGlvbihibG9jaykge1xuICAgIHRoaXMuX3JlbmRlckluUG9zaXRpb24oYmxvY2sucmVuZGVyKCkuJGVsKTtcbiAgICB0aGlzLmhpZGVBbGxUaGVUaGluZ3MoKTtcbiAgICB0aGlzLnNjcm9sbFRvKGJsb2NrLiRlbCk7XG5cbiAgICBibG9jay50cmlnZ2VyKFwib25SZW5kZXJcIik7XG4gIH0sXG5cbiAgc2Nyb2xsVG86IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7IHNjcm9sbFRvcDogZWxlbWVudC5wb3NpdGlvbigpLnRvcCB9LCAzMDAsIFwibGluZWFyXCIpO1xuICB9LFxuXG4gIHJlbW92ZUJsb2NrRHJhZ092ZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJG91dGVyLmZpbmQoJy5zdC1kcmFnLW92ZXInKS5yZW1vdmVDbGFzcygnc3QtZHJhZy1vdmVyJyk7XG4gIH0sXG5cbiAgY2hhbmdlQmxvY2tQb3NpdGlvbjogZnVuY3Rpb24oJGJsb2NrLCBzZWxlY3RlZFBvc2l0aW9uKSB7XG4gICAgc2VsZWN0ZWRQb3NpdGlvbiA9IHNlbGVjdGVkUG9zaXRpb24gLSAxO1xuXG4gICAgdmFyIGJsb2NrUG9zaXRpb24gPSB0aGlzLmdldEJsb2NrUG9zaXRpb24oJGJsb2NrKSxcbiAgICAkYmxvY2tCeSA9IHRoaXMuJHdyYXBwZXIuZmluZCgnLnN0LWJsb2NrJykuZXEoc2VsZWN0ZWRQb3NpdGlvbik7XG5cbiAgICB2YXIgd2hlcmUgPSAoYmxvY2tQb3NpdGlvbiA+IHNlbGVjdGVkUG9zaXRpb24pID8gXCJCZWZvcmVcIiA6IFwiQWZ0ZXJcIjtcblxuICAgIGlmKCRibG9ja0J5ICYmICRibG9ja0J5LmF0dHIoJ2lkJykgIT09ICRibG9jay5hdHRyKCdpZCcpKSB7XG4gICAgICB0aGlzLmhpZGVBbGxUaGVUaGluZ3MoKTtcbiAgICAgICRibG9ja1tcImluc2VydFwiICsgd2hlcmVdKCRibG9ja0J5KTtcbiAgICAgIHRoaXMuc2Nyb2xsVG8oJGJsb2NrKTtcbiAgICB9XG4gIH0sXG5cbiAgX3JlbmRlckluUG9zaXRpb246IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgaWYgKHRoaXMuYmxvY2tfY29udHJvbHMuY3VycmVudENvbnRhaW5lcikge1xuICAgICAgdGhpcy5ibG9ja19jb250cm9scy5jdXJyZW50Q29udGFpbmVyLmFmdGVyKGJsb2NrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4kd3JhcHBlci5hcHBlbmQoYmxvY2spO1xuICAgIH1cbiAgfSxcblxuICB2YWxpZGF0ZUFuZFNhdmVCbG9jazogZnVuY3Rpb24oYmxvY2ssIHNob3VsZFZhbGlkYXRlKSB7XG4gICAgaWYgKCghY29uZmlnLnNraXBWYWxpZGF0aW9uIHx8IHNob3VsZFZhbGlkYXRlKSAmJiAhYmxvY2sudmFsaWQoKSkge1xuICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdlcnJvcnM6YWRkJywgeyB0ZXh0OiBfLnJlc3VsdChibG9jaywgJ3ZhbGlkYXRpb25GYWlsTXNnJykgfSk7XG4gICAgICB1dGlscy5sb2coXCJCbG9jayBcIiArIGJsb2NrLmJsb2NrSUQgKyBcIiBmYWlsZWQgdmFsaWRhdGlvblwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYmxvY2tEYXRhID0gYmxvY2suZ2V0RGF0YSgpO1xuICAgIHV0aWxzLmxvZyhcIkFkZGluZyBkYXRhIGZvciBibG9jayBcIiArIGJsb2NrLmJsb2NrSUQgKyBcIiB0byBibG9jayBzdG9yZTpcIixcbiAgICAgICAgICAgICAgYmxvY2tEYXRhKTtcbiAgICB0aGlzLnN0b3JlLmFkZERhdGEoYmxvY2tEYXRhKTtcbiAgfSxcblxuICAvKlxuICAgKiBIYW5kbGUgYSBmb3JtIHN1Ym1pc3Npb24gb2YgdGhpcyBFZGl0b3IgaW5zdGFuY2UuXG4gICAqIFZhbGlkYXRlIGFsbCBvZiBvdXIgYmxvY2tzLCBhbmQgc2VyaWFsaXNlIGFsbCBkYXRhIG9udG8gdGhlIEpTT04gb2JqZWN0c1xuICAgKi9cbiAgb25Gb3JtU3VibWl0OiBmdW5jdGlvbihzaG91bGRWYWxpZGF0ZSkge1xuICAgIC8vIGlmIHVuZGVmaW5lZCBvciBudWxsIG9yIGFueXRoaW5nIG90aGVyIHRoYW4gZmFsc2UgLSB0cmVhdCBhcyB0cnVlXG4gICAgc2hvdWxkVmFsaWRhdGUgPSAoc2hvdWxkVmFsaWRhdGUgPT09IGZhbHNlKSA/IGZhbHNlIDogdHJ1ZTtcblxuICAgIHV0aWxzLmxvZyhcIkhhbmRsaW5nIGZvcm0gc3VibWlzc2lvbiBmb3IgRWRpdG9yIFwiICsgdGhpcy5JRCk7XG5cbiAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Vycm9yczpyZXNldCcpO1xuICAgIHRoaXMuc3RvcmUucmVzZXQoKTtcblxuICAgIHRoaXMudmFsaWRhdGVCbG9ja3Moc2hvdWxkVmFsaWRhdGUpO1xuICAgIHRoaXMuYmxvY2tfbWFuYWdlci52YWxpZGF0ZUJsb2NrVHlwZXNFeGlzdChzaG91bGRWYWxpZGF0ZSk7XG5cbiAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Vycm9yczpyZW5kZXInKTtcbiAgICB0aGlzLiRlbC52YWwodGhpcy5zdG9yZS50b1N0cmluZygpKTtcblxuICAgIHJldHVybiB0aGlzLmVycm9ySGFuZGxlci5lcnJvcnMubGVuZ3RoO1xuICB9LFxuXG4gIHZhbGlkYXRlQmxvY2tzOiBmdW5jdGlvbihzaG91bGRWYWxpZGF0ZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLiR3cmFwcGVyLmZpbmQoJy5zdC1ibG9jaycpLmVhY2goZnVuY3Rpb24oaWR4LCBibG9jaykge1xuICAgICAgdmFyIF9ibG9jayA9IHNlbGYuYmxvY2tfbWFuYWdlci5maW5kQmxvY2tCeUlkKCQoYmxvY2spLmF0dHIoJ2lkJykpO1xuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKF9ibG9jaykpIHtcbiAgICAgICAgc2VsZi52YWxpZGF0ZUFuZFNhdmVCbG9jayhfYmxvY2ssIHNob3VsZFZhbGlkYXRlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBmaW5kQmxvY2tCeUlkOiBmdW5jdGlvbihibG9ja19pZCkge1xuICAgIHJldHVybiB0aGlzLmJsb2NrX21hbmFnZXIuZmluZEJsb2NrQnlJZChibG9ja19pZCk7XG4gIH0sXG5cbiAgZ2V0QmxvY2tzQnlUeXBlOiBmdW5jdGlvbihibG9ja190eXBlKSB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tfbWFuYWdlci5nZXRCbG9ja3NCeVR5cGUoYmxvY2tfdHlwZSk7XG4gIH0sXG5cbiAgZ2V0QmxvY2tzQnlJRHM6IGZ1bmN0aW9uKGJsb2NrX2lkcykge1xuICAgIHJldHVybiB0aGlzLmJsb2NrX21hbmFnZXIuZ2V0QmxvY2tzQnlJRHMoYmxvY2tfaWRzKTtcbiAgfSxcblxuICBnZXRCbG9ja1Bvc2l0aW9uOiBmdW5jdGlvbigkYmxvY2spIHtcbiAgICByZXR1cm4gdGhpcy4kd3JhcHBlci5maW5kKCcuc3QtYmxvY2snKS5pbmRleCgkYmxvY2spO1xuICB9LFxuXG4gIF9lbnN1cmVBbmRTZXRFbGVtZW50czogZnVuY3Rpb24oKSB7XG4gICAgaWYoXy5pc1VuZGVmaW5lZCh0aGlzLm9wdGlvbnMuZWwpIHx8IF8uaXNFbXB0eSh0aGlzLm9wdGlvbnMuZWwpKSB7XG4gICAgICB1dGlscy5sb2coXCJZb3UgbXVzdCBwcm92aWRlIGFuIGVsXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuJGVsID0gdGhpcy5vcHRpb25zLmVsO1xuICAgIHRoaXMuZWwgPSB0aGlzLm9wdGlvbnMuZWxbMF07XG4gICAgdGhpcy4kZm9ybSA9IHRoaXMuJGVsLnBhcmVudHMoJ2Zvcm0nKTtcblxuICAgIHZhciAkb3V0ZXIgPSAkKFwiPGRpdj5cIikuYXR0cih7ICdpZCc6IHRoaXMuSUQsICdjbGFzcyc6ICdzdC1vdXRlcicsICdkcm9wem9uZSc6ICdjb3B5IGxpbmsgbW92ZScgfSk7XG4gICAgdmFyICR3cmFwcGVyID0gJChcIjxkaXY+XCIpLmF0dHIoeyAnY2xhc3MnOiAnc3QtYmxvY2tzJyB9KTtcblxuICAgIC8vIFdyYXAgb3VyIGVsZW1lbnQgaW4gbG90cyBvZiBjb250YWluZXJzICpld3cqXG4gICAgdGhpcy4kZWwud3JhcCgkb3V0ZXIpLndyYXAoJHdyYXBwZXIpO1xuXG4gICAgdGhpcy4kb3V0ZXIgPSB0aGlzLiRmb3JtLmZpbmQoJyMnICsgdGhpcy5JRCk7XG4gICAgdGhpcy4kd3JhcHBlciA9IHRoaXMuJG91dGVyLmZpbmQoJy5zdC1ibG9ja3MnKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvcjtcblxuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xuXG52YXIgRXJyb3JIYW5kbGVyID0gZnVuY3Rpb24oJHdyYXBwZXIsIG1lZGlhdG9yLCBjb250YWluZXIpIHtcbiAgdGhpcy4kd3JhcHBlciA9ICR3cmFwcGVyO1xuICB0aGlzLm1lZGlhdG9yID0gbWVkaWF0b3I7XG4gIHRoaXMuJGVsID0gY29udGFpbmVyO1xuXG4gIGlmIChfLmlzVW5kZWZpbmVkKHRoaXMuJGVsKSkge1xuICAgIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgICB0aGlzLiR3cmFwcGVyLnByZXBlbmQodGhpcy4kZWwpO1xuICB9XG5cbiAgdGhpcy4kZWwuaGlkZSgpO1xuICB0aGlzLl9iaW5kRnVuY3Rpb25zKCk7XG4gIHRoaXMuX2JpbmRNZWRpYXRlZEV2ZW50cygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihFcnJvckhhbmRsZXIucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9tZWRpYXRlZC1ldmVudHMnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHtcblxuICBlcnJvcnM6IFtdLFxuICBjbGFzc05hbWU6IFwic3QtZXJyb3JzXCIsXG4gIGV2ZW50TmFtZXNwYWNlOiAnZXJyb3JzJyxcblxuICBtZWRpYXRlZEV2ZW50czoge1xuICAgICdyZXNldCc6ICdyZXNldCcsXG4gICAgJ2FkZCc6ICdhZGRNZXNzYWdlJyxcbiAgICAncmVuZGVyJzogJ3JlbmRlcidcbiAgfSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgJGxpc3QgPSAkKFwiPHVsPlwiKTtcbiAgICB0aGlzLiRlbC5hcHBlbmQoXCI8cD5cIiArIGkxOG4udChcImVycm9yczp0aXRsZVwiKSArIFwiPC9wPlwiKVxuICAgIC5hcHBlbmQoJGxpc3QpO1xuICAgIHRoaXMuJGxpc3QgPSAkbGlzdDtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmVycm9ycy5sZW5ndGggPT09IDApIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgdGhpcy5lcnJvcnMuZm9yRWFjaCh0aGlzLmNyZWF0ZUVycm9ySXRlbSwgdGhpcyk7XG4gICAgdGhpcy4kZWwuc2hvdygpO1xuICB9LFxuXG4gIGNyZWF0ZUVycm9ySXRlbTogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICB2YXIgJGVycm9yID0gJChcIjxsaT5cIiwgeyBjbGFzczogXCJzdC1lcnJvcnNfX21zZ1wiLCBodG1sOiBlcnJvci50ZXh0IH0pO1xuICAgIHRoaXMuJGxpc3QuYXBwZW5kKCRlcnJvcik7XG4gIH0sXG5cbiAgYWRkTWVzc2FnZTogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICB0aGlzLmVycm9ycy5wdXNoKGVycm9yKTtcbiAgfSxcblxuICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuZXJyb3JzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgIHRoaXMuJGxpc3QuaHRtbCgnJyk7XG4gICAgdGhpcy4kZWwuaGlkZSgpO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVycm9ySGFuZGxlcjtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbih7fSwgcmVxdWlyZSgnLi9ldmVudHMnKSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdldmVudGFibGVqcycpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gKiBTaXIgVHJldm9yIEVkaXRvciBTdG9yZVxuICogQnkgZGVmYXVsdCB3ZSBzdG9yZSB0aGUgY29tcGxldGUgZGF0YSBvbiB0aGUgaW5zdGFuY2VzICRlbFxuICogV2UgY2FuIGVhc2lseSBleHRlbmQgdGhpcyBhbmQgc3RvcmUgaXQgb24gc29tZSBzZXJ2ZXIgb3Igc29tZXRoaW5nXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi9sb2Rhc2gnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cblxudmFyIEVkaXRvclN0b3JlID0gZnVuY3Rpb24oZGF0YSwgbWVkaWF0b3IpIHtcbiAgdGhpcy5tZWRpYXRvciA9IG1lZGlhdG9yO1xuICB0aGlzLmluaXRpYWxpemUoZGF0YSA/IGRhdGEudHJpbSgpIDogJycpO1xufTtcblxuT2JqZWN0LmFzc2lnbihFZGl0b3JTdG9yZS5wcm90b3R5cGUsIHtcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5zdG9yZSA9IHRoaXMuX3BhcnNlRGF0YShkYXRhKSB8fCB7IGRhdGE6IFtdIH07XG4gIH0sXG5cbiAgcmV0cmlldmU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlO1xuICB9LFxuXG4gIHRvU3RyaW5nOiBmdW5jdGlvbihzcGFjZSkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLnN0b3JlLCB1bmRlZmluZWQsIHNwYWNlKTtcbiAgfSxcblxuICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgdXRpbHMubG9nKFwiUmVzZXR0aW5nIHRoZSBFZGl0b3JTdG9yZVwiKTtcbiAgICB0aGlzLnN0b3JlID0geyBkYXRhOiBbXSB9O1xuICB9LFxuXG4gIGFkZERhdGE6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB0aGlzLnN0b3JlLmRhdGEucHVzaChkYXRhKTtcbiAgICByZXR1cm4gdGhpcy5zdG9yZTtcbiAgfSxcblxuICBfcGFyc2VEYXRhOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHJlc3VsdDtcblxuICAgIGlmIChkYXRhLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gcmVzdWx0OyB9XG5cbiAgICB0cnkge1xuICAgICAgLy8gRW5zdXJlIHRoZSBKU09OIHN0cmluZyBoYXMgYSBkYXRhIGVsZW1lbnQgdGhhdCdzIGFuIGFycmF5XG4gICAgICB2YXIganNvblN0ciA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICBpZiAoIV8uaXNVbmRlZmluZWQoanNvblN0ci5kYXRhKSkge1xuICAgICAgICByZXN1bHQgPSBqc29uU3RyO1xuICAgICAgfVxuICAgIH0gY2F0Y2goZSkge1xuICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKFxuICAgICAgICAnZXJyb3JzOmFkZCcsXG4gICAgICAgIHsgdGV4dDogaTE4bi50KFwiZXJyb3JzOmxvYWRfZmFpbFwiKSB9KTtcblxuICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdlcnJvcnM6cmVuZGVyJyk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdTb3JyeSB0aGVyZSBoYXMgYmVlbiBhIHByb2JsZW0gd2l0aCBwYXJzaW5nIHRoZSBKU09OJyk7XG4gICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvclN0b3JlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4qICAgU2lyIFRyZXZvciBVcGxvYWRlclxuKiAgIEdlbmVyaWMgVXBsb2FkIGltcGxlbWVudGF0aW9uIHRoYXQgY2FuIGJlIGV4dGVuZGVkIGZvciBibG9ja3NcbiovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vbG9kYXNoJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vY29uZmlnJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuLi9ldmVudC1idXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihibG9jaywgZmlsZSwgc3VjY2VzcywgZXJyb3IpIHtcblxuICBFdmVudEJ1cy50cmlnZ2VyKCdvblVwbG9hZFN0YXJ0Jyk7XG5cbiAgdmFyIHVpZCAgPSBbYmxvY2suYmxvY2tJRCwgKG5ldyBEYXRlKCkpLmdldFRpbWUoKSwgJ3JhdyddLmpvaW4oJy0nKTtcbiAgdmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoKTtcblxuICBkYXRhLmFwcGVuZCgnYXR0YWNobWVudFtuYW1lXScsIGZpbGUubmFtZSk7XG4gIGRhdGEuYXBwZW5kKCdhdHRhY2htZW50W2ZpbGVdJywgZmlsZSk7XG4gIGRhdGEuYXBwZW5kKCdhdHRhY2htZW50W3VpZF0nLCB1aWQpO1xuXG4gIGJsb2NrLnJlc2V0TWVzc2FnZXMoKTtcblxuICB2YXIgY2FsbGJhY2tTdWNjZXNzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHV0aWxzLmxvZygnVXBsb2FkIGNhbGxiYWNrIGNhbGxlZCcpO1xuICAgIEV2ZW50QnVzLnRyaWdnZXIoJ29uVXBsb2FkU3RvcCcpO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKHN1Y2Nlc3MpICYmIF8uaXNGdW5jdGlvbihzdWNjZXNzKSkge1xuICAgICAgc3VjY2Vzcy5hcHBseShibG9jaywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGNhbGxiYWNrRXJyb3IgPSBmdW5jdGlvbihqcVhIUiwgc3RhdHVzLCBlcnJvclRocm93bikge1xuICAgIHV0aWxzLmxvZygnVXBsb2FkIGNhbGxiYWNrIGVycm9yIGNhbGxlZCcpO1xuICAgIEV2ZW50QnVzLnRyaWdnZXIoJ29uVXBsb2FkU3RvcCcpO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGVycm9yKSAmJiBfLmlzRnVuY3Rpb24oZXJyb3IpKSB7XG4gICAgICBlcnJvci5jYWxsKGJsb2NrLCBzdGF0dXMpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgeGhyID0gJC5hamF4KHtcbiAgICB1cmw6IGNvbmZpZy5kZWZhdWx0cy51cGxvYWRVcmwsXG4gICAgZGF0YTogZGF0YSxcbiAgICBjYWNoZTogZmFsc2UsXG4gICAgY29udGVudFR5cGU6IGZhbHNlLFxuICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIHR5cGU6ICdQT1NUJ1xuICB9KTtcblxuICBibG9jay5hZGRRdWV1ZWRJdGVtKHVpZCwgeGhyKTtcblxuICB4aHIuZG9uZShjYWxsYmFja1N1Y2Nlc3MpXG4gICAgIC5mYWlsKGNhbGxiYWNrRXJyb3IpXG4gICAgIC5hbHdheXMoYmxvY2sucmVtb3ZlUXVldWVkSXRlbS5iaW5kKGJsb2NrLCB1aWQpKTtcblxuICByZXR1cm4geGhyO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICogU2lyVHJldm9yLlN1Ym1pdHRhYmxlXG4gKiAtLVxuICogV2UgbmVlZCBhIGdsb2JhbCB3YXkgb2Ygc2V0dGluZyBpZiB0aGUgZWRpdG9yIGNhbiBhbmQgY2FuJ3QgYmUgc3VibWl0dGVkLFxuICogYW5kIGEgd2F5IHRvIGRpc2FibGUgdGhlIHN1Ym1pdCBidXR0b24gYW5kIGFkZCBtZXNzYWdlcyAod2hlbiBhcHByb3ByaWF0ZSlcbiAqIFdlIGFsc28gbmVlZCB0aGlzIHRvIGJlIGhpZ2hseSBleHRlbnNpYmxlIHNvIGl0IGNhbiBiZSBvdmVycmlkZGVuLlxuICogVGhpcyB3aWxsIGJlIHRyaWdnZXJlZCAqYnkgYW55dGhpbmcqIHNvIGl0IG5lZWRzIHRvIHN1YnNjcmliZSB0byBldmVudHMuXG4gKi9cblxuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuLi9ldmVudC1idXMnKTtcblxudmFyIFN1Ym1pdHRhYmxlID0gZnVuY3Rpb24oJGZvcm0pIHtcbiAgdGhpcy4kZm9ybSA9ICRmb3JtO1xuICB0aGlzLmludGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihTdWJtaXR0YWJsZS5wcm90b3R5cGUsIHtcblxuICBpbnRpYWxpemU6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5zdWJtaXRCdG4gPSB0aGlzLiRmb3JtLmZpbmQoXCJpbnB1dFt0eXBlPSdzdWJtaXQnXVwiKTtcblxuICAgIHZhciBidG5UaXRsZXMgPSBbXTtcblxuICAgIHRoaXMuc3VibWl0QnRuLmVhY2goZnVuY3Rpb24oaSwgYnRuKXtcbiAgICAgIGJ0blRpdGxlcy5wdXNoKCQoYnRuKS5hdHRyKCd2YWx1ZScpKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc3VibWl0QnRuVGl0bGVzID0gYnRuVGl0bGVzO1xuICAgIHRoaXMuY2FuU3VibWl0ID0gdHJ1ZTtcbiAgICB0aGlzLmdsb2JhbFVwbG9hZENvdW50ID0gMDtcbiAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG4gIH0sXG5cbiAgc2V0U3VibWl0QnV0dG9uOiBmdW5jdGlvbihlLCBtZXNzYWdlKSB7XG4gICAgdGhpcy5zdWJtaXRCdG4uYXR0cigndmFsdWUnLCBtZXNzYWdlKTtcbiAgfSxcblxuICByZXNldFN1Ym1pdEJ1dHRvbjogZnVuY3Rpb24oKXtcbiAgICB2YXIgdGl0bGVzID0gdGhpcy5zdWJtaXRCdG5UaXRsZXM7XG4gICAgdGhpcy5zdWJtaXRCdG4uZWFjaChmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgJChpdGVtKS5hdHRyKCd2YWx1ZScsIHRpdGxlc1tpbmRleF0pO1xuICAgIH0pO1xuICB9LFxuXG4gIG9uVXBsb2FkU3RhcnQ6IGZ1bmN0aW9uKGUpe1xuICAgIHRoaXMuZ2xvYmFsVXBsb2FkQ291bnQrKztcbiAgICB1dGlscy5sb2coJ29uVXBsb2FkU3RhcnQgY2FsbGVkICcgKyB0aGlzLmdsb2JhbFVwbG9hZENvdW50KTtcblxuICAgIGlmKHRoaXMuZ2xvYmFsVXBsb2FkQ291bnQgPT09IDEpIHtcbiAgICAgIHRoaXMuX2Rpc2FibGVTdWJtaXRCdXR0b24oKTtcbiAgICB9XG4gIH0sXG5cbiAgb25VcGxvYWRTdG9wOiBmdW5jdGlvbihlKSB7XG4gICAgdGhpcy5nbG9iYWxVcGxvYWRDb3VudCA9ICh0aGlzLmdsb2JhbFVwbG9hZENvdW50IDw9IDApID8gMCA6IHRoaXMuZ2xvYmFsVXBsb2FkQ291bnQgLSAxO1xuXG4gICAgdXRpbHMubG9nKCdvblVwbG9hZFN0b3AgY2FsbGVkICcgKyB0aGlzLmdsb2JhbFVwbG9hZENvdW50KTtcblxuICAgIGlmKHRoaXMuZ2xvYmFsVXBsb2FkQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX2VuYWJsZVN1Ym1pdEJ1dHRvbigpO1xuICAgIH1cbiAgfSxcblxuICBvbkVycm9yOiBmdW5jdGlvbihlKXtcbiAgICB1dGlscy5sb2coJ29uRXJyb3IgY2FsbGVkJyk7XG4gICAgdGhpcy5jYW5TdWJtaXQgPSBmYWxzZTtcbiAgfSxcblxuICBfZGlzYWJsZVN1Ym1pdEJ1dHRvbjogZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgdGhpcy5zZXRTdWJtaXRCdXR0b24obnVsbCwgbWVzc2FnZSB8fCBpMThuLnQoXCJnZW5lcmFsOndhaXRcIikpO1xuICAgIHRoaXMuc3VibWl0QnRuXG4gICAgLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJylcbiAgICAuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gIH0sXG5cbiAgX2VuYWJsZVN1Ym1pdEJ1dHRvbjogZnVuY3Rpb24oKXtcbiAgICB0aGlzLnJlc2V0U3VibWl0QnV0dG9uKCk7XG4gICAgdGhpcy5zdWJtaXRCdG5cbiAgICAucmVtb3ZlQXR0cignZGlzYWJsZWQnKVxuICAgIC5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgfSxcblxuICBfZXZlbnRzIDoge1xuICAgIFwiZGlzYWJsZVN1Ym1pdEJ1dHRvblwiIDogXCJfZGlzYWJsZVN1Ym1pdEJ1dHRvblwiLFxuICAgIFwiZW5hYmxlU3VibWl0QnV0dG9uXCIgIDogXCJfZW5hYmxlU3VibWl0QnV0dG9uXCIsXG4gICAgXCJzZXRTdWJtaXRCdXR0b25cIiAgICAgOiBcInNldFN1Ym1pdEJ1dHRvblwiLFxuICAgIFwicmVzZXRTdWJtaXRCdXR0b25cIiAgIDogXCJyZXNldFN1Ym1pdEJ1dHRvblwiLFxuICAgIFwib25FcnJvclwiICAgICAgICAgICAgIDogXCJvbkVycm9yXCIsXG4gICAgXCJvblVwbG9hZFN0YXJ0XCIgICAgICAgOiBcIm9uVXBsb2FkU3RhcnRcIixcbiAgICBcIm9uVXBsb2FkU3RvcFwiICAgICAgICA6IFwib25VcGxvYWRTdG9wXCJcbiAgfSxcblxuICBfYmluZEV2ZW50czogZnVuY3Rpb24oKXtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9ldmVudHMpLmZvckVhY2goZnVuY3Rpb24odHlwZSkge1xuICAgICAgRXZlbnRCdXMub24odHlwZSwgdGhpc1t0aGlzLl9ldmVudHNbdHlwZV1dLCB0aGlzKTtcbiAgICB9LCB0aGlzKTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdWJtaXR0YWJsZTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gICBTaXJUcmV2b3IgRmxvYXRpbmcgQmxvY2sgQ29udHJvbHNcbiAgIC0tXG4gICBEcmF3cyB0aGUgJ3BsdXMnIGJldHdlZW4gYmxvY2tzXG4gICAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG5cbnZhciBFdmVudEJ1cyA9IHJlcXVpcmUoJy4vZXZlbnQtYnVzJyk7XG5cbnZhciBGbG9hdGluZ0Jsb2NrQ29udHJvbHMgPSBmdW5jdGlvbih3cmFwcGVyLCBpbnN0YW5jZV9pZCwgbWVkaWF0b3IpIHtcbiAgdGhpcy4kd3JhcHBlciA9IHdyYXBwZXI7XG4gIHRoaXMuaW5zdGFuY2VfaWQgPSBpbnN0YW5jZV9pZDtcbiAgdGhpcy5tZWRpYXRvciA9IG1lZGlhdG9yO1xuXG4gIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihGbG9hdGluZ0Jsb2NrQ29udHJvbHMucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHJlcXVpcmUoJy4vZXZlbnRzJyksIHtcblxuICBjbGFzc05hbWU6IFwic3QtYmxvY2stY29udHJvbHNfX3RvcFwiLFxuXG4gIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAnZGF0YS1pY29uJzogJ2FkZCdcbiAgICB9O1xuICB9LFxuXG4gIGJvdW5kOiBbJ2hhbmRsZUJsb2NrTW91c2VPdXQnLCAnaGFuZGxlQmxvY2tNb3VzZU92ZXInLCAnaGFuZGxlQmxvY2tDbGljaycsICdvbkRyb3AnXSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5vbignY2xpY2snLCB0aGlzLmhhbmRsZUJsb2NrQ2xpY2spXG4gICAgLmRyb3BBcmVhKClcbiAgICAuYmluZCgnZHJvcCcsIHRoaXMub25Ecm9wKTtcblxuICAgIHRoaXMuJHdyYXBwZXIub24oJ21vdXNlb3ZlcicsICcuc3QtYmxvY2snLCB0aGlzLmhhbmRsZUJsb2NrTW91c2VPdmVyKVxuICAgIC5vbignbW91c2VvdXQnLCAnLnN0LWJsb2NrJywgdGhpcy5oYW5kbGVCbG9ja01vdXNlT3V0KVxuICAgIC5vbignY2xpY2snLCAnLnN0LWJsb2NrLS13aXRoLXBsdXMnLCB0aGlzLmhhbmRsZUJsb2NrQ2xpY2spO1xuICB9LFxuXG4gIG9uRHJvcDogZnVuY3Rpb24oZXYpIHtcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyIGRyb3BwZWRfb24gPSB0aGlzLiRlbCxcbiAgICBpdGVtX2lkID0gZXYub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcInRleHQvcGxhaW5cIiksXG4gICAgYmxvY2sgPSAkKCcjJyArIGl0ZW1faWQpO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGl0ZW1faWQpICYmXG4gICAgICAgICFfLmlzRW1wdHkoYmxvY2spICYmXG4gICAgICAgICAgZHJvcHBlZF9vbi5hdHRyKCdpZCcpICE9PSBpdGVtX2lkICYmXG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlX2lkID09PSBibG9jay5hdHRyKCdkYXRhLWluc3RhbmNlJylcbiAgICAgICApIHtcbiAgICAgICAgIGRyb3BwZWRfb24uYWZ0ZXIoYmxvY2spO1xuICAgICAgIH1cblxuICAgICAgIEV2ZW50QnVzLnRyaWdnZXIoXCJibG9jazpyZW9yZGVyOmRyb3BwZWRcIiwgaXRlbV9pZCk7XG4gIH0sXG5cbiAgaGFuZGxlQmxvY2tNb3VzZU92ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYmxvY2sgPSAkKGUuY3VycmVudFRhcmdldCk7XG5cbiAgICBpZiAoIWJsb2NrLmhhc0NsYXNzKCdzdC1ibG9jay0td2l0aC1wbHVzJykpIHtcbiAgICAgIGJsb2NrLmFkZENsYXNzKCdzdC1ibG9jay0td2l0aC1wbHVzJyk7XG4gICAgfVxuICB9LFxuXG4gIGhhbmRsZUJsb2NrTW91c2VPdXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYmxvY2sgPSAkKGUuY3VycmVudFRhcmdldCk7XG5cbiAgICBpZiAoYmxvY2suaGFzQ2xhc3MoJ3N0LWJsb2NrLS13aXRoLXBsdXMnKSkge1xuICAgICAgYmxvY2sucmVtb3ZlQ2xhc3MoJ3N0LWJsb2NrLS13aXRoLXBsdXMnKTtcbiAgICB9XG4gIH0sXG5cbiAgaGFuZGxlQmxvY2tDbGljazogZnVuY3Rpb24oZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdibG9jay1jb250cm9sczpyZW5kZXInLCAkKGUuY3VycmVudFRhcmdldCkpO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZsb2F0aW5nQmxvY2tDb250cm9scztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi9ldmVudC1idXMnKTtcbnZhciBTdWJtaXR0YWJsZSA9IHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9zdWJtaXR0YWJsZScpO1xuXG52YXIgZm9ybUJvdW5kID0gZmFsc2U7IC8vIEZsYWcgdG8gdGVsbCB1cyBvbmNlIHdlJ3ZlIGJvdW5kIG91ciBzdWJtaXQgZXZlbnRcblxudmFyIEZvcm1FdmVudHMgPSB7XG4gIGJpbmRGb3JtU3VibWl0OiBmdW5jdGlvbihmb3JtKSB7XG4gICAgaWYgKCFmb3JtQm91bmQpIHtcbiAgICAgIC8vIFhYWDogc2hvdWxkIHdlIGhhdmUgYSBmb3JtQm91bmQgYW5kIHN1Ym1pdHRhYmxlIHBlci1lZGl0b3I/XG4gICAgICAvLyB0ZWxsaW5nIEpTSGludCB0byBpZ25vcmUgYXMgaXQnbGwgY29tcGxhaW4gd2Ugc2hvdWxkbid0IGJlIGNyZWF0aW5nXG4gICAgICAvLyBhIG5ldyBvYmplY3QsIGJ1dCBvdGhlcndpc2UgYHRoaXNgIHdvbid0IGJlIHNldCBpbiB0aGUgU3VibWl0dGFibGVcbiAgICAgIC8vIGluaXRpYWxpc2VyLiBCaXQgd2VpcmQuXG4gICAgICBuZXcgU3VibWl0dGFibGUoZm9ybSk7IC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgZm9ybS5iaW5kKCdzdWJtaXQnLCB0aGlzLm9uRm9ybVN1Ym1pdCk7XG4gICAgICBmb3JtQm91bmQgPSB0cnVlO1xuICAgIH1cbiAgfSxcblxuICBvbkJlZm9yZVN1Ym1pdDogZnVuY3Rpb24oc2hvdWxkVmFsaWRhdGUpIHtcbiAgICAvLyBMb29wIHRocm91Z2ggYWxsIG9mIG91ciBpbnN0YW5jZXMgYW5kIGRvIG91ciBmb3JtIHN1Ym1pdHMgb24gdGhlbVxuICAgIHZhciBlcnJvcnMgPSAwO1xuICAgIGNvbmZpZy5pbnN0YW5jZXMuZm9yRWFjaChmdW5jdGlvbihpbnN0LCBpKSB7XG4gICAgICBlcnJvcnMgKz0gaW5zdC5vbkZvcm1TdWJtaXQoc2hvdWxkVmFsaWRhdGUpO1xuICAgIH0pO1xuICAgIHV0aWxzLmxvZyhcIlRvdGFsIGVycm9yczogXCIgKyBlcnJvcnMpO1xuXG4gICAgcmV0dXJuIGVycm9ycztcbiAgfSxcblxuICBvbkZvcm1TdWJtaXQ6IGZ1bmN0aW9uKGV2KSB7XG4gICAgdmFyIGVycm9ycyA9IEZvcm1FdmVudHMub25CZWZvcmVTdWJtaXQoKTtcblxuICAgIGlmKGVycm9ycyA+IDApIHtcbiAgICAgIEV2ZW50QnVzLnRyaWdnZXIoXCJvbkVycm9yXCIpO1xuICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcm1FdmVudHM7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgIEZvcm1hdCBCYXJcbiAgIC0tXG4gICBEaXNwbGF5ZWQgb24gZm9jdXMgb24gYSB0ZXh0IGFyZWEuXG4gICBSZW5kZXJzIHdpdGggYWxsIGF2YWlsYWJsZSBvcHRpb25zIGZvciB0aGUgZWRpdG9yIGluc3RhbmNlXG4gICAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG5cbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xudmFyIEZvcm1hdHRlcnMgPSByZXF1aXJlKCcuL2Zvcm1hdHRlcnMnKTtcblxudmFyIEZvcm1hdEJhciA9IGZ1bmN0aW9uKG9wdGlvbnMsIG1lZGlhdG9yKSB7XG4gIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmZpZy5kZWZhdWx0cy5mb3JtYXRCYXIsIG9wdGlvbnMgfHwge30pO1xuICB0aGlzLm1lZGlhdG9yID0gbWVkaWF0b3I7XG5cbiAgdGhpcy5fZW5zdXJlRWxlbWVudCgpO1xuICB0aGlzLl9iaW5kRnVuY3Rpb25zKCk7XG4gIHRoaXMuX2JpbmRNZWRpYXRlZEV2ZW50cygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuT2JqZWN0LmFzc2lnbihGb3JtYXRCYXIucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9tZWRpYXRlZC1ldmVudHMnKSwgcmVxdWlyZSgnLi9ldmVudHMnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHtcblxuICBjbGFzc05hbWU6ICdzdC1mb3JtYXQtYmFyJyxcblxuICBib3VuZDogW1wib25Gb3JtYXRCdXR0b25DbGlja1wiLCBcInJlbmRlckJ5U2VsZWN0aW9uXCIsIFwiaGlkZVwiXSxcblxuICBldmVudE5hbWVzcGFjZTogJ2Zvcm1hdHRlcicsXG5cbiAgbWVkaWF0ZWRFdmVudHM6IHtcbiAgICAncG9zaXRvbic6ICdyZW5kZXJCeVNlbGVjdGlvbicsXG4gICAgJ3Nob3cnOiAnc2hvdycsXG4gICAgJ2hpZGUnOiAnaGlkZSdcbiAgfSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZm9ybWF0TmFtZSwgZm9ybWF0LCBidG47XG4gICAgdGhpcy4kYnRucyA9IFtdO1xuXG4gICAgZm9yIChmb3JtYXROYW1lIGluIEZvcm1hdHRlcnMpIHtcbiAgICAgIGlmIChGb3JtYXR0ZXJzLmhhc093blByb3BlcnR5KGZvcm1hdE5hbWUpKSB7XG4gICAgICAgIGZvcm1hdCA9IEZvcm1hdHRlcnNbZm9ybWF0TmFtZV07XG4gICAgICAgIGJ0biA9ICQoXCI8YnV0dG9uPlwiLCB7XG4gICAgICAgICAgJ2NsYXNzJzogJ3N0LWZvcm1hdC1idG4gc3QtZm9ybWF0LWJ0bi0tJyArIGZvcm1hdE5hbWUgKyAnICcgKyAoZm9ybWF0Lmljb25OYW1lID8gJ3N0LWljb24nIDogJycpLFxuICAgICAgICAgICd0ZXh0JzogZm9ybWF0LnRleHQsXG4gICAgICAgICAgJ2RhdGEtdHlwZSc6IGZvcm1hdE5hbWUsXG4gICAgICAgICAgJ2RhdGEtY21kJzogZm9ybWF0LmNtZFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLiRidG5zLnB1c2goYnRuKTtcbiAgICAgICAgYnRuLmFwcGVuZFRvKHRoaXMuJGVsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLiRiID0gJChkb2N1bWVudCk7XG4gICAgdGhpcy4kZWwuYmluZCgnY2xpY2snLCAnLnN0LWZvcm1hdC1idG4nLCB0aGlzLm9uRm9ybWF0QnV0dG9uQ2xpY2spO1xuICB9LFxuXG4gIGhpZGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdzdC1mb3JtYXQtYmFyLS1pcy1yZWFkeScpO1xuICB9LFxuXG4gIHNob3c6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLmFkZENsYXNzKCdzdC1mb3JtYXQtYmFyLS1pcy1yZWFkeScpO1xuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24oKXsgdGhpcy4kZWwucmVtb3ZlKCk7IH0sXG5cbiAgcmVuZGVyQnlTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKSxcbiAgICByYW5nZSA9IHNlbGVjdGlvbi5nZXRSYW5nZUF0KDApLFxuICAgIGJvdW5kYXJ5ID0gcmFuZ2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgY29vcmRzID0ge307XG5cbiAgICBjb29yZHMudG9wID0gYm91bmRhcnkudG9wICsgMjAgKyB3aW5kb3cucGFnZVlPZmZzZXQgLSB0aGlzLiRlbC5oZWlnaHQoKSArICdweCc7XG4gICAgY29vcmRzLmxlZnQgPSAoKGJvdW5kYXJ5LmxlZnQgKyBib3VuZGFyeS5yaWdodCkgLyAyKSAtICh0aGlzLiRlbC53aWR0aCgpIC8gMikgKyAncHgnO1xuXG4gICAgdGhpcy5oaWdobGlnaHRTZWxlY3RlZEJ1dHRvbnMoKTtcbiAgICB0aGlzLnNob3coKTtcblxuICAgIHRoaXMuJGVsLmNzcyhjb29yZHMpO1xuICB9LFxuXG4gIGhpZ2hsaWdodFNlbGVjdGVkQnV0dG9uczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZvcm1hdHRlcjtcbiAgICB0aGlzLiRidG5zLmZvckVhY2goZnVuY3Rpb24oJGJ0bikge1xuICAgICAgZm9ybWF0dGVyID0gRm9ybWF0dGVyc1skYnRuLmF0dHIoJ2RhdGEtdHlwZScpXTtcbiAgICAgICRidG4udG9nZ2xlQ2xhc3MoXCJzdC1mb3JtYXQtYnRuLS1pcy1hY3RpdmVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVyLmlzQWN0aXZlKCkpO1xuICAgIH0sIHRoaXMpO1xuICB9LFxuXG4gIG9uRm9ybWF0QnV0dG9uQ2xpY2s6IGZ1bmN0aW9uKGV2KXtcbiAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIHZhciBidG4gPSAkKGV2LnRhcmdldCksXG4gICAgZm9ybWF0ID0gRm9ybWF0dGVyc1tidG4uYXR0cignZGF0YS10eXBlJyldO1xuXG4gICAgaWYgKF8uaXNVbmRlZmluZWQoZm9ybWF0KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIERvIHdlIGhhdmUgYSBjbGljayBmdW5jdGlvbiBkZWZpbmVkIG9uIHRoaXMgZm9ybWF0dGVyP1xuICAgIGlmKCFfLmlzVW5kZWZpbmVkKGZvcm1hdC5vbkNsaWNrKSAmJiBfLmlzRnVuY3Rpb24oZm9ybWF0Lm9uQ2xpY2spKSB7XG4gICAgICBmb3JtYXQub25DbGljaygpOyAvLyBEZWxlZ2F0ZVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDYWxsIGRlZmF1bHRcbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKGJ0bi5hdHRyKCdkYXRhLWNtZCcpLCBmYWxzZSwgZm9ybWF0LnBhcmFtKTtcbiAgICB9XG5cbiAgICB0aGlzLmhpZ2hsaWdodFNlbGVjdGVkQnV0dG9ucygpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtYXRCYXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xuXG52YXIgRm9ybWF0dGVyID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gIHRoaXMuZm9ybWF0SWQgPSBfLnVuaXF1ZUlkKCdmb3JtYXQtJyk7XG4gIHRoaXMuX2NvbmZpZ3VyZShvcHRpb25zIHx8IHt9KTtcbiAgdGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG52YXIgZm9ybWF0T3B0aW9ucyA9IFtcInRpdGxlXCIsIFwiY2xhc3NOYW1lXCIsIFwiY21kXCIsIFwia2V5Q29kZVwiLCBcInBhcmFtXCIsIFwib25DbGlja1wiLCBcInRvTWFya2Rvd25cIiwgXCJ0b0hUTUxcIl07XG5cbk9iamVjdC5hc3NpZ24oRm9ybWF0dGVyLnByb3RvdHlwZSwge1xuXG4gIHRpdGxlOiAnJyxcbiAgY2xhc3NOYW1lOiAnJyxcbiAgY21kOiBudWxsLFxuICBrZXlDb2RlOiBudWxsLFxuICBwYXJhbTogbnVsbCxcblxuICB0b01hcmtkb3duOiBmdW5jdGlvbihtYXJrZG93bil7IHJldHVybiBtYXJrZG93bjsgfSxcbiAgdG9IVE1MOiBmdW5jdGlvbihodG1sKXsgcmV0dXJuIGh0bWw7IH0sXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXt9LFxuXG4gIF9jb25maWd1cmU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBmb3JtYXRPcHRpb25zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGF0dHIgPSBmb3JtYXRPcHRpb25zW2ldO1xuICAgICAgaWYgKG9wdGlvbnNbYXR0cl0pIHtcbiAgICAgICAgdGhpc1thdHRyXSA9IG9wdGlvbnNbYXR0cl07XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIH0sXG5cbiAgaXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeUNvbW1hbmRTdGF0ZSh0aGlzLmNtZCk7XG4gIH0sXG5cbiAgX2JpbmRUb0Jsb2NrOiBmdW5jdGlvbihibG9jaykge1xuICAgIHZhciBmb3JtYXR0ZXIgPSB0aGlzLFxuICAgIGN0cmxEb3duID0gZmFsc2U7XG5cbiAgICBibG9ja1xuICAgIC5vbigna2V5dXAnLCcuc3QtdGV4dC1ibG9jaycsIGZ1bmN0aW9uKGV2KSB7XG4gICAgICBpZihldi53aGljaCA9PT0gMTcgfHwgZXYud2hpY2ggPT09IDIyNCB8fCBldi53aGljaCA9PT0gOTEpIHtcbiAgICAgICAgY3RybERvd24gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC5vbigna2V5ZG93bicsJy5zdC10ZXh0LWJsb2NrJywgeyBmb3JtYXR0ZXI6IGZvcm1hdHRlciB9LCBmdW5jdGlvbihldikge1xuICAgICAgaWYoZXYud2hpY2ggPT09IDE3IHx8IGV2LndoaWNoID09PSAyMjQgfHwgZXYud2hpY2ggPT09IDkxKSB7XG4gICAgICAgIGN0cmxEb3duID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYoZXYud2hpY2ggPT09IGV2LmRhdGEuZm9ybWF0dGVyLmtleUNvZGUgJiYgY3RybERvd24gPT09IHRydWUpIHtcbiAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoZXYuZGF0YS5mb3JtYXR0ZXIuY21kLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGN0cmxEb3duID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn0pO1xuXG4vLyBBbGxvdyBvdXIgRm9ybWF0dGVycyB0byBiZSBleHRlbmRlZC5cbkZvcm1hdHRlci5leHRlbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvZXh0ZW5kJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybWF0dGVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIE91ciBiYXNlIGZvcm1hdHRlcnMgKi9cblxudmFyIEZvcm1hdHRlciA9IHJlcXVpcmUoJy4vZm9ybWF0dGVyJyk7XG5cbnZhciBCb2xkID0gRm9ybWF0dGVyLmV4dGVuZCh7XG4gIHRpdGxlOiBcImJvbGRcIixcbiAgY21kOiBcImJvbGRcIixcbiAga2V5Q29kZTogNjYsXG4gIHRleHQgOiBcIkJcIlxufSk7XG5cbnZhciBJdGFsaWMgPSBGb3JtYXR0ZXIuZXh0ZW5kKHtcbiAgdGl0bGU6IFwiaXRhbGljXCIsXG4gIGNtZDogXCJpdGFsaWNcIixcbiAga2V5Q29kZTogNzMsXG4gIHRleHQgOiBcImlcIlxufSk7XG5cbnZhciBMaW5rID0gRm9ybWF0dGVyLmV4dGVuZCh7XG5cbiAgdGl0bGU6IFwibGlua1wiLFxuICBpY29uTmFtZTogXCJsaW5rXCIsXG4gIGNtZDogXCJDcmVhdGVMaW5rXCIsXG4gIHRleHQgOiBcImxpbmtcIixcblxuICBvbkNsaWNrOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBsaW5rID0gd2luZG93LnByb21wdChpMThuLnQoXCJnZW5lcmFsOmxpbmtcIikpLFxuICAgIGxpbmtfcmVnZXggPSAvKChmdHB8aHR0cHxodHRwcyk6XFwvXFwvLil8bWFpbHRvKD89XFw6Wy1cXC5cXHddK0ApLztcblxuICAgIGlmKGxpbmsgJiYgbGluay5sZW5ndGggPiAwKSB7XG5cbiAgICAgIGlmICghbGlua19yZWdleC50ZXN0KGxpbmspKSB7XG4gICAgICAgIGxpbmsgPSBcImh0dHA6Ly9cIiArIGxpbms7XG4gICAgICB9XG5cbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKHRoaXMuY21kLCBmYWxzZSwgbGluayk7XG4gICAgfVxuICB9LFxuXG4gIGlzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpLFxuICAgIG5vZGU7XG5cbiAgICBpZiAoc2VsZWN0aW9uLnJhbmdlQ291bnQgPiAwKSB7XG4gICAgICBub2RlID0gc2VsZWN0aW9uLmdldFJhbmdlQXQoMClcbiAgICAgIC5zdGFydENvbnRhaW5lclxuICAgICAgLnBhcmVudE5vZGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIChub2RlICYmIG5vZGUubm9kZU5hbWUgPT09IFwiQVwiKTtcbiAgfVxufSk7XG5cbnZhciBVbkxpbmsgPSBGb3JtYXR0ZXIuZXh0ZW5kKHtcbiAgdGl0bGU6IFwidW5saW5rXCIsXG4gIGljb25OYW1lOiBcImxpbmtcIixcbiAgY21kOiBcInVubGlua1wiLFxuICB0ZXh0IDogXCJsaW5rXCJcbn0pO1xuXG5cbmV4cG9ydHMuQm9sZCA9IG5ldyBCb2xkKCk7XG5leHBvcnRzLkl0YWxpYyA9IG5ldyBJdGFsaWMoKTtcbmV4cG9ydHMuTGluayA9IG5ldyBMaW5rKCk7XG5leHBvcnRzLlVubGluayA9IG5ldyBVbkxpbmsoKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBHZW5lcmljIGZ1bmN0aW9uIGJpbmRpbmcgdXRpbGl0eSwgdXNlZCBieSBsb3RzIG9mIG91ciBjbGFzc2VzICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBib3VuZDogW10sXG4gIF9iaW5kRnVuY3Rpb25zOiBmdW5jdGlvbigpe1xuICAgIHRoaXMuYm91bmQuZm9yRWFjaChmdW5jdGlvbihmKSB7XG4gICAgICB0aGlzW2ZdID0gdGhpc1tmXS5iaW5kKHRoaXMpO1xuICAgIH0sIHRoaXMpO1xuICB9XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAqIERyb3AgQXJlYSBQbHVnaW4gZnJvbSBAbWFjY21hblxuICogaHR0cDovL2Jsb2cuYWxleG1hY2Nhdy5jb20vc3ZidGxlLWltYWdlLXVwbG9hZGluZ1xuICogLS1cbiAqIFR3ZWFrZWQgc28gd2UgdXNlIHRoZSBwYXJlbnQgY2xhc3Mgb2YgZHJvcHpvbmVcbiAqL1xuXG5cbmZ1bmN0aW9uIGRyYWdFbnRlcihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbn1cblxuZnVuY3Rpb24gZHJhZ092ZXIoZSkge1xuICBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBcImNvcHlcIjtcbiAgJChlLmN1cnJlbnRUYXJnZXQpLmFkZENsYXNzKCdzdC1kcmFnLW92ZXInKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG5mdW5jdGlvbiBkcmFnTGVhdmUoZSkge1xuICAkKGUuY3VycmVudFRhcmdldCkucmVtb3ZlQ2xhc3MoJ3N0LWRyYWctb3ZlcicpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59XG5cbiQuZm4uZHJvcEFyZWEgPSBmdW5jdGlvbigpe1xuICB0aGlzLmJpbmQoXCJkcmFnZW50ZXJcIiwgZHJhZ0VudGVyKS5cbiAgICBiaW5kKFwiZHJhZ292ZXJcIiwgIGRyYWdPdmVyKS5cbiAgICBiaW5kKFwiZHJhZ2xlYXZlXCIsIGRyYWdMZWF2ZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuJC5mbi5ub0Ryb3BBcmVhID0gZnVuY3Rpb24oKXtcbiAgdGhpcy51bmJpbmQoXCJkcmFnZW50ZXJcIikuXG4gICAgdW5iaW5kKFwiZHJhZ292ZXJcIikuXG4gICAgdW5iaW5kKFwiZHJhZ2xlYXZlXCIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbiQuZm4uY2FyZXRUb0VuZCA9IGZ1bmN0aW9uKCl7XG4gIHZhciByYW5nZSxzZWxlY3Rpb247XG5cbiAgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHModGhpc1swXSk7XG4gIHJhbmdlLmNvbGxhcHNlKGZhbHNlKTtcblxuICBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBCYWNrYm9uZSBJbmhlcml0ZW5jZSBcbiAgLS1cbiAgRnJvbTogaHR0cHM6Ly9naXRodWIuY29tL2RvY3VtZW50Y2xvdWQvYmFja2JvbmUvYmxvYi9tYXN0ZXIvYmFja2JvbmUuanNcbiAgQmFja2JvbmUuanMgMC45LjJcbiAgKGMpIDIwMTAtMjAxMiBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgSW5jLlxuKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICB2YXIgcGFyZW50ID0gdGhpcztcbiAgdmFyIGNoaWxkO1xuXG4gIC8vIFRoZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgdGhlIG5ldyBzdWJjbGFzcyBpcyBlaXRoZXIgZGVmaW5lZCBieSB5b3VcbiAgLy8gKHRoZSBcImNvbnN0cnVjdG9yXCIgcHJvcGVydHkgaW4geW91ciBgZXh0ZW5kYCBkZWZpbml0aW9uKSwgb3IgZGVmYXVsdGVkXG4gIC8vIGJ5IHVzIHRvIHNpbXBseSBjYWxsIHRoZSBwYXJlbnQncyBjb25zdHJ1Y3Rvci5cbiAgaWYgKHByb3RvUHJvcHMgJiYgcHJvdG9Qcm9wcy5oYXNPd25Qcm9wZXJ0eSgnY29uc3RydWN0b3InKSkge1xuICAgIGNoaWxkID0gcHJvdG9Qcm9wcy5jb25zdHJ1Y3RvcjtcbiAgfSBlbHNlIHtcbiAgICBjaGlsZCA9IGZ1bmN0aW9uKCl7IHJldHVybiBwYXJlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcbiAgfVxuXG4gIC8vIEFkZCBzdGF0aWMgcHJvcGVydGllcyB0byB0aGUgY29uc3RydWN0b3IgZnVuY3Rpb24sIGlmIHN1cHBsaWVkLlxuICBPYmplY3QuYXNzaWduKGNoaWxkLCBwYXJlbnQsIHN0YXRpY1Byb3BzKTtcblxuICAvLyBTZXQgdGhlIHByb3RvdHlwZSBjaGFpbiB0byBpbmhlcml0IGZyb20gYHBhcmVudGAsIHdpdGhvdXQgY2FsbGluZ1xuICAvLyBgcGFyZW50YCdzIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLlxuICB2YXIgU3Vycm9nYXRlID0gZnVuY3Rpb24oKXsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9O1xuICBTdXJyb2dhdGUucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTtcbiAgY2hpbGQucHJvdG90eXBlID0gbmV3IFN1cnJvZ2F0ZTsgLy8ganNoaW50IGlnbm9yZTpsaW5lXG5cbiAgLy8gQWRkIHByb3RvdHlwZSBwcm9wZXJ0aWVzIChpbnN0YW5jZSBwcm9wZXJ0aWVzKSB0byB0aGUgc3ViY2xhc3MsXG4gIC8vIGlmIHN1cHBsaWVkLlxuICBpZiAocHJvdG9Qcm9wcykge1xuICAgIE9iamVjdC5hc3NpZ24oY2hpbGQucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgfVxuXG4gIC8vIFNldCBhIGNvbnZlbmllbmNlIHByb3BlcnR5IGluIGNhc2UgdGhlIHBhcmVudCdzIHByb3RvdHlwZSBpcyBuZWVkZWRcbiAgLy8gbGF0ZXIuXG4gIGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7XG5cbiAgcmV0dXJuIGNoaWxkO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG5cbnJlcXVpcmUoJy4vaGVscGVycy9ldmVudCcpOyAvLyBleHRlbmRzIGpRdWVyeSBpdHNlbGZcbnJlcXVpcmUoJy4vdmVuZG9yL2FycmF5LWluY2x1ZGVzJyk7IC8vIHNoaW1zIEVTNyBBcnJheS5wcm90b3R5cGUuaW5jbHVkZXNcblxudmFyIFNpclRyZXZvciA9IHtcblxuICBjb25maWc6IHJlcXVpcmUoJy4vY29uZmlnJyksXG5cbiAgbG9nOiByZXF1aXJlKCcuL3V0aWxzJykubG9nLFxuICBMb2NhbGVzOiByZXF1aXJlKCcuL2xvY2FsZXMnKSxcblxuICBFdmVudHM6IHJlcXVpcmUoJy4vZXZlbnRzJyksXG4gIEV2ZW50QnVzOiByZXF1aXJlKCcuL2V2ZW50LWJ1cycpLFxuXG4gIEVkaXRvclN0b3JlOiByZXF1aXJlKCcuL2V4dGVuc2lvbnMvZWRpdG9yLXN0b3JlJyksXG4gIFN1Ym1pdHRhYmxlOiByZXF1aXJlKCcuL2V4dGVuc2lvbnMvc3VibWl0dGFibGUnKSxcbiAgRmlsZVVwbG9hZGVyOiByZXF1aXJlKCcuL2V4dGVuc2lvbnMvZmlsZS11cGxvYWRlcicpLFxuXG4gIEJsb2NrTWl4aW5zOiByZXF1aXJlKCcuL2Jsb2NrX21peGlucycpLFxuICBCbG9ja1Bvc2l0aW9uZXI6IHJlcXVpcmUoJy4vYmxvY2stcG9zaXRpb25lcicpLFxuICBCbG9ja1Jlb3JkZXI6IHJlcXVpcmUoJy4vYmxvY2stcmVvcmRlcicpLFxuICBCbG9ja0RlbGV0aW9uOiByZXF1aXJlKCcuL2Jsb2NrLWRlbGV0aW9uJyksXG4gIEJsb2NrVmFsaWRhdGlvbnM6IHJlcXVpcmUoJy4vYmxvY2stdmFsaWRhdGlvbnMnKSxcbiAgQmxvY2tTdG9yZTogcmVxdWlyZSgnLi9ibG9jay1zdG9yZScpLFxuICBCbG9ja01hbmFnZXI6IHJlcXVpcmUoJy4vYmxvY2stbWFuYWdlcicpLFxuXG4gIFNpbXBsZUJsb2NrOiByZXF1aXJlKCcuL3NpbXBsZS1ibG9jaycpLFxuICBCbG9jazogcmVxdWlyZSgnLi9ibG9jaycpLFxuICBGb3JtYXR0ZXI6IHJlcXVpcmUoJy4vZm9ybWF0dGVyJyksXG4gIEZvcm1hdHRlcnM6IHJlcXVpcmUoJy4vZm9ybWF0dGVycycpLFxuXG4gIEJsb2NrczogcmVxdWlyZSgnLi9ibG9ja3MnKSxcblxuICBCbG9ja0NvbnRyb2w6IHJlcXVpcmUoJy4vYmxvY2stY29udHJvbCcpLFxuICBCbG9ja0NvbnRyb2xzOiByZXF1aXJlKCcuL2Jsb2NrLWNvbnRyb2xzJyksXG4gIEZsb2F0aW5nQmxvY2tDb250cm9sczogcmVxdWlyZSgnLi9mbG9hdGluZy1ibG9jay1jb250cm9scycpLFxuXG4gIEZvcm1hdEJhcjogcmVxdWlyZSgnLi9mb3JtYXQtYmFyJyksXG4gIEVkaXRvcjogcmVxdWlyZSgnLi9lZGl0b3InKSxcblxuICB0b01hcmtkb3duOiByZXF1aXJlKCcuL3RvLW1hcmtkb3duJyksXG4gIHRvSFRNTDogcmVxdWlyZSgnLi90by1odG1sJyksXG5cbiAgc2V0RGVmYXVsdHM6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBPYmplY3QuYXNzaWduKFNpclRyZXZvci5jb25maWcuZGVmYXVsdHMsIG9wdGlvbnMgfHwge30pO1xuICB9LFxuXG4gIGdldEluc3RhbmNlOiBmdW5jdGlvbihpZGVudGlmaWVyKSB7XG4gICAgaWYgKF8uaXNVbmRlZmluZWQoaWRlbnRpZmllcikpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5pbnN0YW5jZXNbMF07XG4gICAgfVxuXG4gICAgaWYgKF8uaXNTdHJpbmcoaWRlbnRpZmllcikpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5pbnN0YW5jZXMuZmluZChmdW5jdGlvbihlZGl0b3IpIHtcbiAgICAgICAgcmV0dXJuIGVkaXRvci5JRCA9PT0gaWRlbnRpZmllcjtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNvbmZpZy5pbnN0YW5jZXNbaWRlbnRpZmllcl07XG4gIH0sXG5cbiAgc2V0QmxvY2tPcHRpb25zOiBmdW5jdGlvbih0eXBlLCBvcHRpb25zKSB7XG4gICAgdmFyIGJsb2NrID0gU2lyVHJldm9yLkJsb2Nrc1t0eXBlXTtcblxuICAgIGlmIChfLmlzVW5kZWZpbmVkKGJsb2NrKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIE9iamVjdC5hc3NpZ24oYmxvY2sucHJvdG90eXBlLCBvcHRpb25zIHx8IHt9KTtcbiAgfSxcblxuICBydW5PbkFsbEluc3RhbmNlczogZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgaWYgKFNpclRyZXZvci5FZGl0b3IucHJvdG90eXBlLmhhc093blByb3BlcnR5KG1ldGhvZCkpIHtcbiAgICAgIHZhciBtZXRob2RBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoU2lyVHJldm9yLmNvbmZpZy5pbnN0YW5jZXMsIGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgaVttZXRob2RdLmFwcGx5KG51bGwsIG1ldGhvZEFyZ3MpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIFNpclRyZXZvci5sb2coXCJtZXRob2QgZG9lc24ndCBleGlzdFwiKTtcbiAgICB9XG4gIH0sXG5cbn07XG5cbk9iamVjdC5hc3NpZ24oU2lyVHJldm9yLCByZXF1aXJlKCcuL2Zvcm0tZXZlbnRzJykpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gU2lyVHJldm9yO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgTG9jYWxlcyA9IHtcbiAgZW46IHtcbiAgICBnZW5lcmFsOiB7XG4gICAgICAnZGVsZXRlJzogICAgICAgICAgICdEZWxldGU/JyxcbiAgICAgICdkcm9wJzogICAgICAgICAgICAgJ0RyYWcgX19ibG9ja19fIGhlcmUnLFxuICAgICAgJ3Bhc3RlJzogICAgICAgICAgICAnT3IgcGFzdGUgVVJMIGhlcmUnLFxuICAgICAgJ3VwbG9hZCc6ICAgICAgICAgICAnLi4ub3IgY2hvb3NlIGEgZmlsZScsXG4gICAgICAnY2xvc2UnOiAgICAgICAgICAgICdjbG9zZScsXG4gICAgICAncG9zaXRpb24nOiAgICAgICAgICdQb3NpdGlvbicsXG4gICAgICAnd2FpdCc6ICAgICAgICAgICAgICdQbGVhc2Ugd2FpdC4uLicsXG4gICAgICAnbGluayc6ICAgICAgICAgICAgICdFbnRlciBhIGxpbmsnXG4gICAgfSxcbiAgICBlcnJvcnM6IHtcbiAgICAgICd0aXRsZSc6IFwiWW91IGhhdmUgdGhlIGZvbGxvd2luZyBlcnJvcnM6XCIsXG4gICAgICAndmFsaWRhdGlvbl9mYWlsJzogXCJfX3R5cGVfXyBibG9jayBpcyBpbnZhbGlkXCIsXG4gICAgICAnYmxvY2tfZW1wdHknOiBcIl9fbmFtZV9fIG11c3Qgbm90IGJlIGVtcHR5XCIsXG4gICAgICAndHlwZV9taXNzaW5nJzogXCJZb3UgbXVzdCBoYXZlIGEgYmxvY2sgb2YgdHlwZSBfX3R5cGVfX1wiLFxuICAgICAgJ3JlcXVpcmVkX3R5cGVfZW1wdHknOiBcIkEgcmVxdWlyZWQgYmxvY2sgdHlwZSBfX3R5cGVfXyBpcyBlbXB0eVwiLFxuICAgICAgJ2xvYWRfZmFpbCc6IFwiVGhlcmUgd2FzIGEgcHJvYmxlbSBsb2FkaW5nIHRoZSBjb250ZW50cyBvZiB0aGUgZG9jdW1lbnRcIlxuICAgIH0sXG4gICAgYmxvY2tzOiB7XG4gICAgICB0ZXh0OiB7XG4gICAgICAgICd0aXRsZSc6IFwiVGV4dFwiXG4gICAgICB9LFxuICAgICAgbGlzdDoge1xuICAgICAgICAndGl0bGUnOiBcIkxpc3RcIlxuICAgICAgfSxcbiAgICAgIHF1b3RlOiB7XG4gICAgICAgICd0aXRsZSc6IFwiUXVvdGVcIixcbiAgICAgICAgJ2NyZWRpdF9maWVsZCc6IFwiQ3JlZGl0XCJcbiAgICAgIH0sXG4gICAgICBpbWFnZToge1xuICAgICAgICAndGl0bGUnOiBcIkltYWdlXCIsXG4gICAgICAgICd1cGxvYWRfZXJyb3InOiBcIlRoZXJlIHdhcyBhIHByb2JsZW0gd2l0aCB5b3VyIHVwbG9hZFwiXG4gICAgICB9LFxuICAgICAgdmlkZW86IHtcbiAgICAgICAgJ3RpdGxlJzogXCJWaWRlb1wiXG4gICAgICB9LFxuICAgICAgdHdlZXQ6IHtcbiAgICAgICAgJ3RpdGxlJzogXCJUd2VldFwiLFxuICAgICAgICAnZmV0Y2hfZXJyb3InOiBcIlRoZXJlIHdhcyBhIHByb2JsZW0gZmV0Y2hpbmcgeW91ciB0d2VldFwiXG4gICAgICB9LFxuICAgICAgZW1iZWRseToge1xuICAgICAgICAndGl0bGUnOiBcIkVtYmVkbHlcIixcbiAgICAgICAgJ2ZldGNoX2Vycm9yJzogXCJUaGVyZSB3YXMgYSBwcm9ibGVtIGZldGNoaW5nIHlvdXIgZW1iZWRcIixcbiAgICAgICAgJ2tleV9taXNzaW5nJzogXCJBbiBFbWJlZGx5IEFQSSBrZXkgbXVzdCBiZSBwcmVzZW50XCJcbiAgICAgIH0sXG4gICAgICBoZWFkaW5nOiB7XG4gICAgICAgICd0aXRsZSc6IFwiSGVhZGluZ1wiXG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5pZiAod2luZG93LmkxOG4gPT09IHVuZGVmaW5lZCkge1xuICAvLyBNaW5pbWFsIGkxOG4gc3R1YiB0aGF0IG9ubHkgcmVhZHMgdGhlIEVuZ2xpc2ggc3RyaW5nc1xuICB1dGlscy5sb2coXCJVc2luZyBpMThuIHN0dWJcIik7XG4gIHdpbmRvdy5pMThuID0ge1xuICAgIHQ6IGZ1bmN0aW9uKGtleSwgb3B0aW9ucykge1xuICAgICAgdmFyIHBhcnRzID0ga2V5LnNwbGl0KCc6JyksIHN0ciwgb2JqLCBwYXJ0LCBpO1xuXG4gICAgICBvYmogPSBMb2NhbGVzW2NvbmZpZy5sYW5ndWFnZV07XG5cbiAgICAgIGZvcihpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBhcnQgPSBwYXJ0c1tpXTtcblxuICAgICAgICBpZighXy5pc1VuZGVmaW5lZChvYmpbcGFydF0pKSB7XG4gICAgICAgICAgb2JqID0gb2JqW3BhcnRdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN0ciA9IG9iajtcblxuICAgICAgaWYgKCFfLmlzU3RyaW5nKHN0cikpIHsgcmV0dXJuIFwiXCI7IH1cblxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdfXycpID49IDApIHtcbiAgICAgICAgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaChmdW5jdGlvbihvcHQpIHtcbiAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgnX18nICsgb3B0ICsgJ19fJywgb3B0aW9uc1tvcHRdKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICB9O1xufSBlbHNlIHtcbiAgdXRpbHMubG9nKFwiVXNpbmcgaTE4bmV4dFwiKTtcbiAgLy8gT25seSB1c2UgaTE4bmV4dCB3aGVuIHRoZSBsaWJyYXJ5IGhhcyBiZWVuIGxvYWRlZCBieSB0aGUgdXNlciwga2VlcHNcbiAgLy8gZGVwZW5kZW5jaWVzIHNsaW1cbiAgaTE4bi5pbml0KHsgcmVzU3RvcmU6IExvY2FsZXMsIGZhbGxiYWNrTG5nOiBjb25maWcubGFuZ3VhZ2UsXG4gICAgICAgICAgICBuczogeyBuYW1lc3BhY2VzOiBbJ2dlbmVyYWwnLCAnYmxvY2tzJ10sIGRlZmF1bHROczogJ2dlbmVyYWwnIH1cbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9jYWxlcztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLmlzRW1wdHkgPSByZXF1aXJlKCdsb2Rhc2guaXNlbXB0eScpO1xuZXhwb3J0cy5pc0Z1bmN0aW9uID0gcmVxdWlyZSgnbG9kYXNoLmlzZnVuY3Rpb24nKTtcbmV4cG9ydHMuaXNPYmplY3QgPSByZXF1aXJlKCdsb2Rhc2guaXNvYmplY3QnKTtcbmV4cG9ydHMuaXNTdHJpbmcgPSByZXF1aXJlKCdsb2Rhc2guaXNzdHJpbmcnKTtcbmV4cG9ydHMuaXNVbmRlZmluZWQgPSByZXF1aXJlKCdsb2Rhc2guaXN1bmRlZmluZWQnKTtcbmV4cG9ydHMucmVzdWx0ID0gcmVxdWlyZSgnbG9kYXNoLnJlc3VsdCcpO1xuZXhwb3J0cy50ZW1wbGF0ZSA9IHJlcXVpcmUoJ2xvZGFzaC50ZW1wbGF0ZScpO1xuZXhwb3J0cy51bmlxdWVJZCA9IHJlcXVpcmUoJ2xvZGFzaC51bmlxdWVpZCcpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtZWRpYXRlZEV2ZW50czoge30sXG4gIGV2ZW50TmFtZXNwYWNlOiBudWxsLFxuICBfYmluZE1lZGlhdGVkRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICBPYmplY3Qua2V5cyh0aGlzLm1lZGlhdGVkRXZlbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50TmFtZSl7XG4gICAgICB2YXIgY2IgPSB0aGlzLm1lZGlhdGVkRXZlbnRzW2V2ZW50TmFtZV07XG4gICAgICBldmVudE5hbWUgPSB0aGlzLmV2ZW50TmFtZXNwYWNlID9cbiAgICAgICAgdGhpcy5ldmVudE5hbWVzcGFjZSArICc6JyArIGV2ZW50TmFtZSA6XG4gICAgICAgIGV2ZW50TmFtZTtcbiAgICAgIHRoaXMubWVkaWF0b3Iub24oZXZlbnROYW1lLCB0aGlzW2NiXS5iaW5kKHRoaXMpKTtcbiAgICB9LCB0aGlzKTtcbiAgfVxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB0YWdOYW1lOiAnZGl2JyxcbiAgY2xhc3NOYW1lOiAnc2lyLXRyZXZvcl9fdmlldycsXG4gIGF0dHJpYnV0ZXM6IHt9LFxuXG4gICQ6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoc2VsZWN0b3IpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKHRoaXMuc3RvcExpc3RlbmluZykpIHsgdGhpcy5zdG9wTGlzdGVuaW5nKCk7IH1cbiAgICB0aGlzLiRlbC5yZW1vdmUoKTtcbiAgfSxcblxuICBfZW5zdXJlRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLmVsKSB7XG4gICAgICB2YXIgYXR0cnMgPSBPYmplY3QuYXNzaWduKHt9LCBfLnJlc3VsdCh0aGlzLCAnYXR0cmlidXRlcycpKSxcbiAgICAgIGh0bWw7XG4gICAgICBpZiAodGhpcy5pZCkgeyBhdHRycy5pZCA9IHRoaXMuaWQ7IH1cbiAgICAgIGlmICh0aGlzLmNsYXNzTmFtZSkgeyBhdHRyc1snY2xhc3MnXSA9IHRoaXMuY2xhc3NOYW1lOyB9XG5cbiAgICAgIGlmIChhdHRycy5odG1sKSB7XG4gICAgICAgIGh0bWwgPSBhdHRycy5odG1sO1xuICAgICAgICBkZWxldGUgYXR0cnMuaHRtbDtcbiAgICAgIH1cbiAgICAgIHZhciAkZWwgPSAkKCc8JyArIHRoaXMudGFnTmFtZSArICc+JykuYXR0cihhdHRycyk7XG4gICAgICBpZiAoaHRtbCkgeyAkZWwuaHRtbChodG1sKTsgfVxuICAgICAgdGhpcy5fc2V0RWxlbWVudCgkZWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZXRFbGVtZW50KHRoaXMuZWwpO1xuICAgIH1cbiAgfSxcblxuICBfc2V0RWxlbWVudDogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHRoaXMuJGVsID0gJChlbGVtZW50KTtcbiAgICB0aGlzLmVsID0gdGhpcy4kZWxbMF07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBCbG9ja1Jlb3JkZXIgPSByZXF1aXJlKCcuL2Jsb2NrLXJlb3JkZXInKTtcblxudmFyIFNpbXBsZUJsb2NrID0gZnVuY3Rpb24oZGF0YSwgaW5zdGFuY2VfaWQsIG1lZGlhdG9yKSB7XG4gIHRoaXMuY3JlYXRlU3RvcmUoZGF0YSk7XG4gIHRoaXMuYmxvY2tJRCA9IF8udW5pcXVlSWQoJ3N0LWJsb2NrLScpO1xuICB0aGlzLmluc3RhbmNlSUQgPSBpbnN0YW5jZV9pZDtcbiAgdGhpcy5tZWRpYXRvciA9IG1lZGlhdG9yO1xuXG4gIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuT2JqZWN0LmFzc2lnbihTaW1wbGVCbG9jay5wcm90b3R5cGUsIHJlcXVpcmUoJy4vZnVuY3Rpb24tYmluZCcpLCByZXF1aXJlKCcuL2V2ZW50cycpLCByZXF1aXJlKCcuL3JlbmRlcmFibGUnKSwgcmVxdWlyZSgnLi9ibG9jay1zdG9yZScpLCB7XG5cbiAgZm9jdXMgOiBmdW5jdGlvbigpIHt9LFxuXG4gIHZhbGlkIDogZnVuY3Rpb24oKSB7IHJldHVybiB0cnVlOyB9LFxuXG4gIGNsYXNzTmFtZTogJ3N0LWJsb2NrJyxcblxuICBibG9ja190ZW1wbGF0ZTogXy50ZW1wbGF0ZShcbiAgICBcIjxkaXYgY2xhc3M9J3N0LWJsb2NrX19pbm5lcic+PCU9IGVkaXRvcl9odG1sICU+PC9kaXY+XCJcbiAgKSxcblxuICBhdHRyaWJ1dGVzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2lkJzogdGhpcy5ibG9ja0lELFxuICAgICAgJ2RhdGEtdHlwZSc6IHRoaXMudHlwZSxcbiAgICAgICdkYXRhLWluc3RhbmNlJzogdGhpcy5pbnN0YW5jZUlEXG4gICAgfTtcbiAgfSxcblxuICB0aXRsZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHV0aWxzLnRpdGxlaXplKHRoaXMudHlwZS5yZXBsYWNlKC9bXFxXX10vZywgJyAnKSk7XG4gIH0sXG5cbiAgYmxvY2tDU1NDbGFzczogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5ibG9ja0NTU0NsYXNzID0gdXRpbHMudG9TbHVnKHRoaXMudHlwZSk7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tDU1NDbGFzcztcbiAgfSxcblxuICB0eXBlOiAnJyxcblxuICBjbGFzczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHV0aWxzLmNsYXNzaWZ5KHRoaXMudHlwZSk7XG4gIH0sXG5cbiAgZWRpdG9ySFRNTDogJycsXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7fSxcblxuICBvbkJsb2NrUmVuZGVyOiBmdW5jdGlvbigpe30sXG4gIGJlZm9yZUJsb2NrUmVuZGVyOiBmdW5jdGlvbigpe30sXG5cbiAgX3NldEJsb2NrSW5uZXIgOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZWRpdG9yX2h0bWwgPSBfLnJlc3VsdCh0aGlzLCAnZWRpdG9ySFRNTCcpO1xuXG4gICAgdGhpcy4kZWwuYXBwZW5kKFxuICAgICAgdGhpcy5ibG9ja190ZW1wbGF0ZSh7IGVkaXRvcl9odG1sOiBlZGl0b3JfaHRtbCB9KVxuICAgICk7XG5cbiAgICB0aGlzLiRpbm5lciA9IHRoaXMuJGVsLmZpbmQoJy5zdC1ibG9ja19faW5uZXInKTtcbiAgICB0aGlzLiRpbm5lci5iaW5kKCdjbGljayBtb3VzZW92ZXInLCBmdW5jdGlvbihlKXsgZS5zdG9wUHJvcGFnYXRpb24oKTsgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmJlZm9yZUJsb2NrUmVuZGVyKCk7XG5cbiAgICB0aGlzLl9zZXRCbG9ja0lubmVyKCk7XG4gICAgdGhpcy5fYmxvY2tQcmVwYXJlKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBfYmxvY2tQcmVwYXJlIDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5faW5pdFVJKCk7XG4gICAgdGhpcy5faW5pdE1lc3NhZ2VzKCk7XG5cbiAgICB0aGlzLmNoZWNrQW5kTG9hZERhdGEoKTtcblxuICAgIHRoaXMuJGVsLmFkZENsYXNzKCdzdC1pdGVtLXJlYWR5Jyk7XG4gICAgdGhpcy5vbihcIm9uUmVuZGVyXCIsIHRoaXMub25CbG9ja1JlbmRlcik7XG4gICAgdGhpcy5zYXZlKCk7XG4gIH0sXG5cbiAgX3dpdGhVSUNvbXBvbmVudDogZnVuY3Rpb24oY29tcG9uZW50LCBjbGFzc05hbWUsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy4kdWkuYXBwZW5kKGNvbXBvbmVudC5yZW5kZXIoKS4kZWwpO1xuICAgIGlmIChjbGFzc05hbWUgJiYgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuJHVpLm9uKCdjbGljaycsIGNsYXNzTmFtZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgfSxcblxuICBfaW5pdFVJIDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHVpX2VsZW1lbnQgPSAkKFwiPGRpdj5cIiwgeyAnY2xhc3MnOiAnc3QtYmxvY2tfX3VpJyB9KTtcbiAgICB0aGlzLiRpbm5lci5hcHBlbmQodWlfZWxlbWVudCk7XG4gICAgdGhpcy4kdWkgPSB1aV9lbGVtZW50O1xuICAgIHRoaXMuX2luaXRVSUNvbXBvbmVudHMoKTtcbiAgfSxcblxuICBfaW5pdE1lc3NhZ2VzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbXNnc19lbGVtZW50ID0gJChcIjxkaXY+XCIsIHsgJ2NsYXNzJzogJ3N0LWJsb2NrX19tZXNzYWdlcycgfSk7XG4gICAgdGhpcy4kaW5uZXIucHJlcGVuZChtc2dzX2VsZW1lbnQpO1xuICAgIHRoaXMuJG1lc3NhZ2VzID0gbXNnc19lbGVtZW50O1xuICB9LFxuXG4gIGFkZE1lc3NhZ2U6IGZ1bmN0aW9uKG1zZywgYWRkaXRpb25hbENsYXNzKSB7XG4gICAgdmFyICRtc2cgPSAkKFwiPHNwYW4+XCIsIHsgaHRtbDogbXNnLCBjbGFzczogXCJzdC1tc2cgXCIgKyBhZGRpdGlvbmFsQ2xhc3MgfSk7XG4gICAgdGhpcy4kbWVzc2FnZXMuYXBwZW5kKCRtc2cpXG4gICAgLmFkZENsYXNzKCdzdC1ibG9ja19fbWVzc2FnZXMtLWlzLXZpc2libGUnKTtcbiAgICByZXR1cm4gJG1zZztcbiAgfSxcblxuICByZXNldE1lc3NhZ2VzOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRtZXNzYWdlcy5odG1sKCcnKVxuICAgIC5yZW1vdmVDbGFzcygnc3QtYmxvY2tfX21lc3NhZ2VzLS1pcy12aXNpYmxlJyk7XG4gIH0sXG5cbiAgX2luaXRVSUNvbXBvbmVudHM6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3dpdGhVSUNvbXBvbmVudChuZXcgQmxvY2tSZW9yZGVyKHRoaXMuJGVsKSk7XG4gIH1cblxufSk7XG5cblNpbXBsZUJsb2NrLmZuID0gU2ltcGxlQmxvY2sucHJvdG90eXBlO1xuXG4vLyBBbGxvdyBvdXIgQmxvY2sgdG8gYmUgZXh0ZW5kZWQuXG5TaW1wbGVCbG9jay5leHRlbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvZXh0ZW5kJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2ltcGxlQmxvY2s7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1hcmtkb3duLCB0eXBlKSB7XG5cbiAgLy8gRGVmZXJyaW5nIHJlcXVpcmluZyB0aGVzZSB0byBzaWRlc3RlcCBhIGNpcmN1bGFyIGRlcGVuZGVuY3k6XG4gIC8vIEJsb2NrIC0+IHRoaXMgLT4gQmxvY2tzIC0+IEJsb2NrXG4gIHZhciBCbG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xuICB2YXIgRm9ybWF0dGVycyA9IHJlcXVpcmUoJy4vZm9ybWF0dGVycycpO1xuXG4gIC8vIE1EIC0+IEhUTUxcbiAgdHlwZSA9IHV0aWxzLmNsYXNzaWZ5KHR5cGUpO1xuXG4gIHZhciBodG1sID0gbWFya2Rvd24sXG4gICAgICBzaG91bGRXcmFwID0gdHlwZSA9PT0gXCJUZXh0XCI7XG5cbiAgaWYoXy5pc1VuZGVmaW5lZChzaG91bGRXcmFwKSkgeyBzaG91bGRXcmFwID0gZmFsc2U7IH1cblxuICBpZiAoc2hvdWxkV3JhcCkge1xuICAgIGh0bWwgPSBcIjxkaXY+XCIgKyBodG1sO1xuICB9XG5cbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXFxbKFteXFxdXSspXFxdXFwoKFteXFwpXSspXFwpL2dtLGZ1bmN0aW9uKG1hdGNoLCBwMSwgcDIpe1xuICAgIHJldHVybiBcIjxhIGhyZWY9J1wiK3AyK1wiJz5cIitwMS5yZXBsYWNlKC9cXG4vZywgJycpK1wiPC9hPlwiO1xuICB9KTtcblxuICAvLyBUaGlzIG1heSBzZWVtIGNyYXp5LCBidXQgYmVjYXVzZSBKUyBkb2Vzbid0IGhhdmUgYSBsb29rIGJlaGluZCxcbiAgLy8gd2UgcmV2ZXJzZSB0aGUgc3RyaW5nIHRvIHJlZ2V4IG91dCB0aGUgaXRhbGljIGl0ZW1zIChhbmQgYm9sZClcbiAgLy8gYW5kIGxvb2sgZm9yIHNvbWV0aGluZyB0aGF0IGRvZXNuJ3Qgc3RhcnQgKG9yIGVuZCBpbiB0aGUgcmV2ZXJzZWQgc3RyaW5ncyBjYXNlKVxuICAvLyB3aXRoIGEgc2xhc2guXG4gIGh0bWwgPSB1dGlscy5yZXZlcnNlKFxuICAgICAgICAgICB1dGlscy5yZXZlcnNlKGh0bWwpXG4gICAgICAgICAgIC5yZXBsYWNlKC9fKD8hXFxcXCkoKF9cXFxcfFteX10pKilfKD89JHxbXlxcXFxdKS9nbSwgZnVuY3Rpb24obWF0Y2gsIHAxKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIj5pLzxcIisgcDEucmVwbGFjZSgvXFxuL2csICcnKS5yZXBsYWNlKC9bXFxzXSskLywnJykgK1wiPmk8XCI7XG4gICAgICAgICAgIH0pXG4gICAgICAgICAgIC5yZXBsYWNlKC9cXCpcXCooPyFcXFxcKSgoXFwqXFwqXFxcXHxbXlxcKlxcKl0pKilcXCpcXCooPz0kfFteXFxcXF0pL2dtLCBmdW5jdGlvbihtYXRjaCwgcDEpe1xuICAgICAgICAgICAgICByZXR1cm4gXCI+Yi88XCIrIHAxLnJlcGxhY2UoL1xcbi9nLCAnJykucmVwbGFjZSgvW1xcc10rJC8sJycpICtcIj5iPFwiO1xuICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG5cbiAgaHRtbCA9ICBodG1sLnJlcGxhY2UoL15cXD4gKC4rKSQvbWcsXCIkMVwiKTtcblxuICAvLyBVc2UgY3VzdG9tIGZvcm1hdHRlcnMgdG9IVE1MIGZ1bmN0aW9ucyAoaWYgYW55IGV4aXN0KVxuICB2YXIgZm9ybWF0TmFtZSwgZm9ybWF0O1xuICBmb3IoZm9ybWF0TmFtZSBpbiBGb3JtYXR0ZXJzKSB7XG4gICAgaWYgKEZvcm1hdHRlcnMuaGFzT3duUHJvcGVydHkoZm9ybWF0TmFtZSkpIHtcbiAgICAgIGZvcm1hdCA9IEZvcm1hdHRlcnNbZm9ybWF0TmFtZV07XG4gICAgICAvLyBEbyB3ZSBoYXZlIGEgdG9IVE1MIGZ1bmN0aW9uP1xuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGZvcm1hdC50b0hUTUwpICYmIF8uaXNGdW5jdGlvbihmb3JtYXQudG9IVE1MKSkge1xuICAgICAgICBodG1sID0gZm9ybWF0LnRvSFRNTChodG1sKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBVc2UgY3VzdG9tIGJsb2NrIHRvSFRNTCBmdW5jdGlvbnMgKGlmIGFueSBleGlzdClcbiAgdmFyIGJsb2NrO1xuICBpZiAoQmxvY2tzLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG4gICAgYmxvY2sgPSBCbG9ja3NbdHlwZV07XG4gICAgLy8gRG8gd2UgaGF2ZSBhIHRvSFRNTCBmdW5jdGlvbj9cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoYmxvY2sucHJvdG90eXBlLnRvSFRNTCkgJiYgXy5pc0Z1bmN0aW9uKGJsb2NrLnByb3RvdHlwZS50b0hUTUwpKSB7XG4gICAgICBodG1sID0gYmxvY2sucHJvdG90eXBlLnRvSFRNTChodG1sKTtcbiAgICB9XG4gIH1cblxuICBpZiAoc2hvdWxkV3JhcCkge1xuICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcblxcbi9nbSwgXCI8L2Rpdj48ZGl2Pjxicj48L2Rpdj48ZGl2PlwiKTtcbiAgICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXG4vZ20sIFwiPC9kaXY+PGRpdj5cIik7XG4gIH1cblxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXHQvZywgXCImbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcIilcbiAgICAgICAgICAgICAucmVwbGFjZSgvXFxuL2csIFwiPGJyPlwiKVxuICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCpcXCovLCBcIlwiKVxuICAgICAgICAgICAgIC5yZXBsYWNlKC9fXy8sIFwiXCIpOyAgLy8gQ2xlYW51cCBhbnkgbWFya2Rvd24gY2hhcmFjdGVycyBsZWZ0XG5cbiAgLy8gUmVwbGFjZSBlc2NhcGVkXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcXFxcXCovZywgXCIqXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXFsvZywgXCJbXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXF0vZywgXCJdXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXF8vZywgXCJfXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXCgvZywgXCIoXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXCkvZywgXCIpXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXC0vZywgXCItXCIpO1xuXG4gIGlmIChzaG91bGRXcmFwKSB7XG4gICAgaHRtbCArPSBcIjwvZGl2PlwiO1xuICB9XG5cbiAgcmV0dXJuIGh0bWw7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjb250ZW50LCB0eXBlKSB7XG5cbiAgLy8gRGVmZXJyaW5nIHJlcXVpcmluZyB0aGVzZSB0byBzaWRlc3RlcCBhIGNpcmN1bGFyIGRlcGVuZGVuY3k6XG4gIC8vIEJsb2NrIC0+IHRoaXMgLT4gQmxvY2tzIC0+IEJsb2NrXG4gIHZhciBCbG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xuICB2YXIgRm9ybWF0dGVycyA9IHJlcXVpcmUoJy4vZm9ybWF0dGVycycpO1xuXG4gIHR5cGUgPSB1dGlscy5jbGFzc2lmeSh0eXBlKTtcblxuICB2YXIgbWFya2Rvd24gPSBjb250ZW50O1xuXG4gIC8vTm9ybWFsaXNlIHdoaXRlc3BhY2VcbiAgbWFya2Rvd24gPSBtYXJrZG93bi5yZXBsYWNlKC8mbmJzcDsvZyxcIiBcIik7XG5cbiAgLy8gRmlyc3Qgb2YgYWxsLCBzdHJpcCBhbnkgYWRkaXRpb25hbCBmb3JtYXR0aW5nXG4gIC8vIE1TV29yZCwgSSdtIGxvb2tpbmcgYXQgeW91LCBwdW5rLlxuICBtYXJrZG93biA9IG1hcmtkb3duLnJlcGxhY2UoLyggY2xhc3M9KFwiKT9Nc29bYS16QS1aXSsoXCIpPykvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPCEtLSguKj8pLS0+L2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcL1xcKiguKj8pXFwqXFwvL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzwoXFwvKSoobWV0YXxsaW5rfHNwYW58XFxcXD94bWw6fHN0MTp8bzp8Zm9udCkoLio/KT4vZ2ksICcnKTtcblxuICB2YXIgYmFkVGFncyA9IFsnc3R5bGUnLCAnc2NyaXB0JywgJ2FwcGxldCcsICdlbWJlZCcsICdub2ZyYW1lcycsICdub3NjcmlwdCddLFxuICAgICAgdGFnU3RyaXBwZXIsIGk7XG5cbiAgZm9yIChpID0gMDsgaTwgYmFkVGFncy5sZW5ndGg7IGkrKykge1xuICAgIHRhZ1N0cmlwcGVyID0gbmV3IFJlZ0V4cCgnPCcrYmFkVGFnc1tpXSsnLio/JytiYWRUYWdzW2ldKycoLio/KT4nLCAnZ2knKTtcbiAgICBtYXJrZG93biA9IG1hcmtkb3duLnJlcGxhY2UodGFnU3RyaXBwZXIsICcnKTtcbiAgfVxuXG4gIC8vIEVzY2FwZSBhbnl0aGluZyBpbiBoZXJlIHRoYXQgKmNvdWxkKiBiZSBjb25zaWRlcmVkIGFzIE1EXG4gIC8vIE1hcmtkb3duIGNoYXJzIHdlIGNhcmUgYWJvdXQ6ICogW10gXyAoKSAtXG4gIG1hcmtkb3duID0gbWFya2Rvd24ucmVwbGFjZSgvXFwqL2csIFwiXFxcXCpcIilcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcWy9nLCBcIlxcXFxbXCIpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXF0vZywgXCJcXFxcXVwiKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxfL2csIFwiXFxcXF9cIilcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcKC9nLCBcIlxcXFwoXCIpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCkvZywgXCJcXFxcKVwiKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwtL2csIFwiXFxcXC1cIik7XG5cbiAgdmFyIGlubGluZVRhZ3MgPSBbXCJlbVwiLCBcImlcIiwgXCJzdHJvbmdcIiwgXCJiXCJdO1xuXG4gIGZvciAoaSA9IDA7IGk8IGlubGluZVRhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICB0YWdTdHJpcHBlciA9IG5ldyBSZWdFeHAoJzwnK2lubGluZVRhZ3NbaV0rJz48YnI+PC8nK2lubGluZVRhZ3NbaV0rJz4nLCAnZ2knKTtcbiAgICBtYXJrZG93biA9IG1hcmtkb3duLnJlcGxhY2UodGFnU3RyaXBwZXIsICc8YnI+Jyk7XG4gIH1cblxuICBmdW5jdGlvbiByZXBsYWNlQm9sZHMobWF0Y2gsIHAxLCBwMil7XG4gICAgaWYoXy5pc1VuZGVmaW5lZChwMikpIHsgcDIgPSAnJzsgfVxuICAgIHJldHVybiBcIioqXCIgKyBwMS5yZXBsYWNlKC88KC4pP2JyKC4pPz4vZywgJycpICsgXCIqKlwiICsgcDI7XG4gIH1cblxuICBmdW5jdGlvbiByZXBsYWNlSXRhbGljcyhtYXRjaCwgcDEsIHAyKXtcbiAgICBpZihfLmlzVW5kZWZpbmVkKHAyKSkgeyBwMiA9ICcnOyB9XG4gICAgcmV0dXJuIFwiX1wiICsgcDEucmVwbGFjZSgvPCguKT9iciguKT8+L2csICcnKSArIFwiX1wiICsgcDI7XG4gIH1cblxuICBtYXJrZG93biA9IG1hcmtkb3duLnJlcGxhY2UoLzwoXFx3KykoPzpcXHMrXFx3Kz1cIlteXCJdKyg/OlwiXFwkW15cIl0rXCJbXlwiXSspP1wiKSo+XFxzKjxcXC9cXDE+L2dpbSwgJycpIC8vRW1wdHkgZWxlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxuL21nLFwiXCIpXG4gICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzxhLio/aHJlZj1bXCJcIiddKC4qPylbXCJcIiddLio/PiguKj8pPFxcL2E+L2dpbSwgZnVuY3Rpb24obWF0Y2gsIHAxLCBwMil7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJbXCIgKyBwMi50cmltKCkucmVwbGFjZSgvPCguKT9iciguKT8+L2csICcnKSArIFwiXShcIisgcDEgK1wiKVwiO1xuICAgICAgICAgICAgICAgICAgICAgIH0pIC8vIEh5cGVybGlua3NcbiAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPHN0cm9uZz4oPzpcXHMqKSguKj8pKFxccykqPzxcXC9zdHJvbmc+L2dpbSwgcmVwbGFjZUJvbGRzKVxuICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88Yj4oPzpcXHMqKSguKj8pKFxccyopPzxcXC9iPi9naW0sIHJlcGxhY2VCb2xkcylcbiAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPGVtPig/OlxccyopKC4qPykoXFxzKik/PFxcL2VtPi9naW0sIHJlcGxhY2VJdGFsaWNzKVxuICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88aT4oPzpcXHMqKSguKj8pKFxccyopPzxcXC9pPi9naW0sIHJlcGxhY2VJdGFsaWNzKTtcblxuXG4gIC8vIFVzZSBjdXN0b20gZm9ybWF0dGVycyB0b01hcmtkb3duIGZ1bmN0aW9ucyAoaWYgYW55IGV4aXN0KVxuICB2YXIgZm9ybWF0TmFtZSwgZm9ybWF0O1xuICBmb3IoZm9ybWF0TmFtZSBpbiBGb3JtYXR0ZXJzKSB7XG4gICAgaWYgKEZvcm1hdHRlcnMuaGFzT3duUHJvcGVydHkoZm9ybWF0TmFtZSkpIHtcbiAgICAgIGZvcm1hdCA9IEZvcm1hdHRlcnNbZm9ybWF0TmFtZV07XG4gICAgICAvLyBEbyB3ZSBoYXZlIGEgdG9NYXJrZG93biBmdW5jdGlvbj9cbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZChmb3JtYXQudG9NYXJrZG93bikgJiYgXy5pc0Z1bmN0aW9uKGZvcm1hdC50b01hcmtkb3duKSkge1xuICAgICAgICBtYXJrZG93biA9IGZvcm1hdC50b01hcmtkb3duKG1hcmtkb3duKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBEbyBvdXIgZ2VuZXJpYyBzdHJpcHBpbmcgb3V0XG4gIG1hcmtkb3duID0gbWFya2Rvd24ucmVwbGFjZSgvKFtePD5dKykoPGRpdj4pL2csXCIkMVxcbiQyXCIpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGl2aXRpcyBzdHlsZSBsaW5lIGJyZWFrcyAoaGFuZGxlIHRoZSBmaXJzdCBsaW5lKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPGRpdj48ZGl2Pi9nLCdcXG48ZGl2PicpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBeIChkb3VibGUgb3BlbmluZyBkaXZzIHdpdGggb25lIGNsb3NlIGZyb20gQ2hyb21lKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKD86PGRpdj4pKFtePD5dKykoPzo8ZGl2PikvZyxcIiQxXFxuXCIpICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIF4gKGhhbmRsZSBuZXN0ZWQgZGl2cyB0aGF0IHN0YXJ0IHdpdGggY29udGVudClcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyg/OjxkaXY+KSg/Ojxicj4pPyhbXjw+XSspKD86PGJyPik/KD86PFxcL2Rpdj4pL2csXCIkMVxcblwiKSAgICAgICAgLy8gXiAoaGFuZGxlIGNvbnRlbnQgaW5zaWRlIGRpdnMpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88XFwvcD4vZyxcIlxcblxcblwiKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUCB0YWdzIGFzIGxpbmUgYnJlYWtzXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88KC4pP2JyKC4pPz4vZyxcIlxcblwiKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udmVydCBub3JtYWwgbGluZSBicmVha3NcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyZsdDsvZyxcIjxcIikucmVwbGFjZSgvJmd0Oy9nLFwiPlwiKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFbmNvZGluZ1xuXG4gIC8vIFVzZSBjdXN0b20gYmxvY2sgdG9NYXJrZG93biBmdW5jdGlvbnMgKGlmIGFueSBleGlzdClcbiAgdmFyIGJsb2NrO1xuICBpZiAoQmxvY2tzLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG4gICAgYmxvY2sgPSBCbG9ja3NbdHlwZV07XG4gICAgLy8gRG8gd2UgaGF2ZSBhIHRvTWFya2Rvd24gZnVuY3Rpb24/XG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGJsb2NrLnByb3RvdHlwZS50b01hcmtkb3duKSAmJiBfLmlzRnVuY3Rpb24oYmxvY2sucHJvdG90eXBlLnRvTWFya2Rvd24pKSB7XG4gICAgICBtYXJrZG93biA9IGJsb2NrLnByb3RvdHlwZS50b01hcmtkb3duKG1hcmtkb3duKTtcbiAgICB9XG4gIH1cblxuICAvLyBTdHJpcCByZW1haW5pbmcgSFRNTFxuICBtYXJrZG93biA9IG1hcmtkb3duLnJlcGxhY2UoLzxcXC8/W14+XSsoPnwkKS9nLCBcIlwiKTtcblxuICByZXR1cm4gbWFya2Rvd247XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xuXG52YXIgdXJsUmVnZXggPSAvXig/OihbQS1aYS16XSspOik/KFxcL3swLDN9KShbMC05LlxcLUEtWmEtel0rKSg/OjooXFxkKykpPyg/OlxcLyhbXj8jXSopKT8oPzpcXD8oW14jXSopKT8oPzojKC4qKSk/JC87XG5cbnZhciB1dGlscyA9IHtcbiAgbG9nOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoY29uc29sZSkgJiYgY29uZmlnLmRlYnVnKSB7XG4gICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfSxcblxuICBpc1VSSSA6IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHJldHVybiAodXJsUmVnZXgudGVzdChzdHJpbmcpKTtcbiAgfSxcblxuICB0aXRsZWl6ZTogZnVuY3Rpb24oc3RyKXtcbiAgICBpZiAoc3RyID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHN0ciAgPSBTdHJpbmcoc3RyKS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvKD86XnxcXHN8LSlcXFMvZywgZnVuY3Rpb24oYyl7IHJldHVybiBjLnRvVXBwZXJDYXNlKCk7IH0pO1xuICB9LFxuXG4gIGNsYXNzaWZ5OiBmdW5jdGlvbihzdHIpe1xuICAgIHJldHVybiB1dGlscy50aXRsZWl6ZShTdHJpbmcoc3RyKS5yZXBsYWNlKC9bXFxXX10vZywgJyAnKSkucmVwbGFjZSgvXFxzL2csICcnKTtcbiAgfSxcblxuICBjYXBpdGFsaXplIDogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zdWJzdHJpbmcoMSkudG9Mb3dlckNhc2UoKTtcbiAgfSxcblxuICBmbGF0dGVuOiBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgeCA9IHt9O1xuICAgIChBcnJheS5pc0FycmF5KG9iaikgPyBvYmogOiBPYmplY3Qua2V5cyhvYmopKS5mb3JFYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICB4W2ldID0gdHJ1ZTtcbiAgICB9KTtcbiAgICAvKiBfLmVhY2gob2JqLCBmdW5jdGlvbihhLGIpIHtcbiAgICAgKiAgIHhbKF8uaXNBcnJheShvYmopKSA/IGEgOiBiXSA9IHRydWU7XG4gICAgICogfSk7ICovXG4gICAgcmV0dXJuIHg7XG4gIH0sXG5cbiAgdW5kZXJzY29yZWQ6IGZ1bmN0aW9uKHN0cil7XG4gICAgcmV0dXJuIHN0ci50cmltKCkucmVwbGFjZSgvKFthLXpcXGRdKShbQS1aXSspL2csICckMV8kMicpXG4gICAgLnJlcGxhY2UoL1stXFxzXSsvZywgJ18nKS50b0xvd2VyQ2FzZSgpO1xuICB9LFxuXG4gIHJldmVyc2U6IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBzdHIuc3BsaXQoXCJcIikucmV2ZXJzZSgpLmpvaW4oXCJcIik7XG4gIH0sXG5cbiAgdG9TbHVnOiBmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gc3RyXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAucmVwbGFjZSgvW15cXHcgXSsvZywnJylcbiAgICAucmVwbGFjZSgvICsvZywnLScpO1xuICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbHM7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLy8ganNoaW50IGZyZWV6ZTogZmFsc2VcblxuaWYgKCFbXS5pbmNsdWRlcykge1xuICBBcnJheS5wcm90b3R5cGUuaW5jbHVkZXMgPSBmdW5jdGlvbihzZWFyY2hFbGVtZW50IC8qLCBmcm9tSW5kZXgqLyApIHtcbiAgICBpZiAodGhpcyA9PT0gdW5kZWZpbmVkIHx8IHRoaXMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IHRoaXMgdmFsdWUgdG8gb2JqZWN0Jyk7XG4gICAgfVxuICAgIHZhciBPID0gT2JqZWN0KHRoaXMpO1xuICAgIHZhciBsZW4gPSBwYXJzZUludChPLmxlbmd0aCkgfHwgMDtcbiAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBuID0gcGFyc2VJbnQoYXJndW1lbnRzWzFdKSB8fCAwO1xuICAgIHZhciBrO1xuICAgIGlmIChuID49IDApIHtcbiAgICAgIGsgPSBuO1xuICAgIH0gZWxzZSB7XG4gICAgICBrID0gbGVuICsgbjtcbiAgICAgIGlmIChrIDwgMCkge1xuICAgICAgICBrID0gMDtcbiAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUgKGsgPCBsZW4pIHtcbiAgICAgIHZhciBjdXJyZW50RWxlbWVudCA9IE9ba107XG4gICAgICBpZiAoc2VhcmNoRWxlbWVudCA9PT0gY3VycmVudEVsZW1lbnQgfHxcbiAgICAgICAgIChzZWFyY2hFbGVtZW50ICE9PSBzZWFyY2hFbGVtZW50ICYmIGN1cnJlbnRFbGVtZW50ICE9PSBjdXJyZW50RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBrKys7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbn1cbiJdfQ==
