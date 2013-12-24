/*!
 * Sir Trevor JS v0.3.2
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

  blockStorage: {},

  createStore: function(blockData) {
    this.blockStorage = {
      type: utils.underscored(this.type),
      data: blockData || {}
    };
  },

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

  setData: function(blockData) {
    utils.log("Setting data for block " + this.blockID);
    Object.assign(this.blockStorage.data, blockData || {});
  },

  setAndRetrieveData: function(blockData) {
    this.setData(blockData);
    return this._getData();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudGFibGVqcy9ldmVudGFibGUuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLl9zZXRiaW5kZGF0YS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5fc2V0YmluZGRhdGEvbm9kZV9tb2R1bGVzL2xvZGFzaC5faXNuYXRpdmUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guX3NldGJpbmRkYXRhL25vZGVfbW9kdWxlcy9sb2Rhc2gubm9vcC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5iaW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fY3JlYXRld3JhcHBlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5iaW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guX2NyZWF0ZXdyYXBwZXIvbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWJpbmQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guYmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLl9jcmVhdGV3cmFwcGVyL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2ViaW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guYmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLl9jcmVhdGV3cmFwcGVyL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGV3cmFwcGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fc2xpY2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guaWRlbnRpdHkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guc3VwcG9ydC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9vYmplY3R0eXBlcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLmtleXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5rZXlzL25vZGVfbW9kdWxlcy9sb2Rhc2guX3NoaW1rZXlzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2Z1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc29iamVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNzdHJpbmcvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzdW5kZWZpbmVkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5yZXN1bHQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnRlbXBsYXRlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLl9lc2NhcGVzdHJpbmdjaGFyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLl9yZWludGVycG9sYXRlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLmRlZmF1bHRzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLmVzY2FwZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5lc2NhcGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5fZXNjYXBlaHRtbGNoYXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnRlbXBsYXRlL25vZGVfbW9kdWxlcy9sb2Rhc2guZXNjYXBlL25vZGVfbW9kdWxlcy9sb2Rhc2guX2VzY2FwZWh0bWxjaGFyL25vZGVfbW9kdWxlcy9sb2Rhc2guX2h0bWxlc2NhcGVzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLmVzY2FwZS9ub2RlX21vZHVsZXMvbG9kYXNoLl9yZXVuZXNjYXBlZGh0bWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnRlbXBsYXRlL25vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGVzZXR0aW5ncy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvbm9kZV9tb2R1bGVzL2xvZGFzaC52YWx1ZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnVuaXF1ZWlkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NwaW4uanMvc3Bpbi5qcyIsInNyYy9ibG9jay1jb250cm9sLmpzIiwic3JjL2Jsb2NrLWNvbnRyb2xzLmpzIiwic3JjL2Jsb2NrLWRlbGV0aW9uLmpzIiwic3JjL2Jsb2NrLW1hbmFnZXIuanMiLCJzcmMvYmxvY2stcG9zaXRpb25lci5qcyIsInNyYy9ibG9jay1yZW9yZGVyLmpzIiwic3JjL2Jsb2NrLXN0b3JlLmpzIiwic3JjL2Jsb2NrLXZhbGlkYXRpb25zLmpzIiwic3JjL2Jsb2NrLmpzIiwic3JjL2Jsb2NrX21peGlucy9hamF4YWJsZS5qcyIsInNyYy9ibG9ja19taXhpbnMvY29udHJvbGxhYmxlLmpzIiwic3JjL2Jsb2NrX21peGlucy9kcm9wcGFibGUuanMiLCJzcmMvYmxvY2tfbWl4aW5zL2ZldGNoYWJsZS5qcyIsInNyYy9ibG9ja19taXhpbnMvaW5kZXguanMiLCJzcmMvYmxvY2tfbWl4aW5zL3Bhc3RhYmxlLmpzIiwic3JjL2Jsb2NrX21peGlucy91cGxvYWRhYmxlLmpzIiwic3JjL2Jsb2Nrcy9oZWFkaW5nLmpzIiwic3JjL2Jsb2Nrcy9pbWFnZS5qcyIsInNyYy9ibG9ja3MvaW5kZXguanMiLCJzcmMvYmxvY2tzL2xpc3QuanMiLCJzcmMvYmxvY2tzL3F1b3RlLmpzIiwic3JjL2Jsb2Nrcy90ZXh0LmpzIiwic3JjL2Jsb2Nrcy90d2VldC5qcyIsInNyYy9ibG9ja3MvdmlkZW8uanMiLCJzcmMvY29uZmlnLmpzIiwic3JjL2VkaXRvci5qcyIsInNyYy9lcnJvci1oYW5kbGVyLmpzIiwic3JjL2V2ZW50LWJ1cy5qcyIsInNyYy9ldmVudHMuanMiLCJzcmMvZXh0ZW5zaW9ucy9lZGl0b3Itc3RvcmUuanMiLCJzcmMvZXh0ZW5zaW9ucy9maWxlLXVwbG9hZGVyLmpzIiwic3JjL2V4dGVuc2lvbnMvc3VibWl0dGFibGUuanMiLCJzcmMvZmxvYXRpbmctYmxvY2stY29udHJvbHMuanMiLCJzcmMvZm9ybS1ldmVudHMuanMiLCJzcmMvZm9ybWF0LWJhci5qcyIsInNyYy9mb3JtYXR0ZXIuanMiLCJzcmMvZm9ybWF0dGVycy5qcyIsInNyYy9mdW5jdGlvbi1iaW5kLmpzIiwic3JjL2hlbHBlcnMvZXZlbnQuanMiLCJzcmMvaGVscGVycy9leHRlbmQuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvbG9jYWxlcy5qcyIsInNyYy9sb2Rhc2guanMiLCJzcmMvbWVkaWF0ZWQtZXZlbnRzLmpzIiwic3JjL3JlbmRlcmFibGUuanMiLCJzcmMvc2ltcGxlLWJsb2NrLmpzIiwic3JjL3RvLWh0bWwuanMiLCJzcmMvdG8tbWFya2Rvd24uanMiLCJzcmMvdXRpbHMuanMiLCJzcmMvdmVuZG9yL2FycmF5LWluY2x1ZGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL3NyYy8nKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhIG1vZHVsZS5cbiAgICBkZWZpbmUoJ2V2ZW50YWJsZScsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChyb290LkV2ZW50YWJsZSA9IGZhY3RvcnkoKSk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0IG9ubHkgQ29tbW9uSlMtbGlrZVxuICAgIC8vIGVudmlyb21lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cywgbGlrZSBOb2RlLlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIHJvb3QuRXZlbnRhYmxlID0gZmFjdG9yeSgpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uKCkge1xuXG4gIC8vIENvcHkgYW5kIHBhc3RlZCBzdHJhaWdodCBvdXQgb2YgQmFja2JvbmUgMS4wLjBcbiAgLy8gV2UnbGwgdHJ5IGFuZCBrZWVwIHRoaXMgdXBkYXRlZCB0byB0aGUgbGF0ZXN0XG5cbiAgdmFyIGFycmF5ID0gW107XG4gIHZhciBzbGljZSA9IGFycmF5LnNsaWNlO1xuXG4gIGZ1bmN0aW9uIG9uY2UoZnVuYykge1xuICAgIHZhciBtZW1vLCB0aW1lcyA9IDI7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA+IDApIHtcbiAgICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZ1bmMgPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfTtcbiAgfVxuXG4gIC8vIEJhY2tib25lLkV2ZW50c1xuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBBIG1vZHVsZSB0aGF0IGNhbiBiZSBtaXhlZCBpbiB0byAqYW55IG9iamVjdCogaW4gb3JkZXIgdG8gcHJvdmlkZSBpdCB3aXRoXG4gIC8vIGN1c3RvbSBldmVudHMuIFlvdSBtYXkgYmluZCB3aXRoIGBvbmAgb3IgcmVtb3ZlIHdpdGggYG9mZmAgY2FsbGJhY2tcbiAgLy8gZnVuY3Rpb25zIHRvIGFuIGV2ZW50OyBgdHJpZ2dlcmAtaW5nIGFuIGV2ZW50IGZpcmVzIGFsbCBjYWxsYmFja3MgaW5cbiAgLy8gc3VjY2Vzc2lvbi5cbiAgLy9cbiAgLy8gICAgIHZhciBvYmplY3QgPSB7fTtcbiAgLy8gICAgIGV4dGVuZChvYmplY3QsIEJhY2tib25lLkV2ZW50cyk7XG4gIC8vICAgICBvYmplY3Qub24oJ2V4cGFuZCcsIGZ1bmN0aW9uKCl7IGFsZXJ0KCdleHBhbmRlZCcpOyB9KTtcbiAgLy8gICAgIG9iamVjdC50cmlnZ2VyKCdleHBhbmQnKTtcbiAgLy9cbiAgdmFyIEV2ZW50YWJsZSA9IHtcblxuICAgIC8vIEJpbmQgYW4gZXZlbnQgdG8gYSBgY2FsbGJhY2tgIGZ1bmN0aW9uLiBQYXNzaW5nIGBcImFsbFwiYCB3aWxsIGJpbmRcbiAgICAvLyB0aGUgY2FsbGJhY2sgdG8gYWxsIGV2ZW50cyBmaXJlZC5cbiAgICBvbjogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIGlmICghZXZlbnRzQXBpKHRoaXMsICdvbicsIG5hbWUsIFtjYWxsYmFjaywgY29udGV4dF0pIHx8ICFjYWxsYmFjaykgcmV0dXJuIHRoaXM7XG4gICAgICB0aGlzLl9ldmVudHMgfHwgKHRoaXMuX2V2ZW50cyA9IHt9KTtcbiAgICAgIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHNbbmFtZV0gfHwgKHRoaXMuX2V2ZW50c1tuYW1lXSA9IFtdKTtcbiAgICAgIGV2ZW50cy5wdXNoKHtjYWxsYmFjazogY2FsbGJhY2ssIGNvbnRleHQ6IGNvbnRleHQsIGN0eDogY29udGV4dCB8fCB0aGlzfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gQmluZCBhbiBldmVudCB0byBvbmx5IGJlIHRyaWdnZXJlZCBhIHNpbmdsZSB0aW1lLiBBZnRlciB0aGUgZmlyc3QgdGltZVxuICAgIC8vIHRoZSBjYWxsYmFjayBpcyBpbnZva2VkLCBpdCB3aWxsIGJlIHJlbW92ZWQuXG4gICAgb25jZTogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIGlmICghZXZlbnRzQXBpKHRoaXMsICdvbmNlJywgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkgfHwgIWNhbGxiYWNrKSByZXR1cm4gdGhpcztcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBmdW5jID0gb25jZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5vZmYobmFtZSwgZnVuYyk7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9KTtcbiAgICAgIGZ1bmMuX2NhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICByZXR1cm4gdGhpcy5vbihuYW1lLCBmdW5jLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgLy8gUmVtb3ZlIG9uZSBvciBtYW55IGNhbGxiYWNrcy4gSWYgYGNvbnRleHRgIGlzIG51bGwsIHJlbW92ZXMgYWxsXG4gICAgLy8gY2FsbGJhY2tzIHdpdGggdGhhdCBmdW5jdGlvbi4gSWYgYGNhbGxiYWNrYCBpcyBudWxsLCByZW1vdmVzIGFsbFxuICAgIC8vIGNhbGxiYWNrcyBmb3IgdGhlIGV2ZW50LiBJZiBgbmFtZWAgaXMgbnVsbCwgcmVtb3ZlcyBhbGwgYm91bmRcbiAgICAvLyBjYWxsYmFja3MgZm9yIGFsbCBldmVudHMuXG4gICAgb2ZmOiBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgdmFyIHJldGFpbiwgZXYsIGV2ZW50cywgbmFtZXMsIGksIGwsIGosIGs7XG4gICAgICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhZXZlbnRzQXBpKHRoaXMsICdvZmYnLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSkgcmV0dXJuIHRoaXM7XG4gICAgICBpZiAoIW5hbWUgJiYgIWNhbGxiYWNrICYmICFjb250ZXh0KSB7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgbmFtZXMgPSBuYW1lID8gW25hbWVdIDogT2JqZWN0LmtleXModGhpcy5fZXZlbnRzKTtcbiAgICAgIGZvciAoaSA9IDAsIGwgPSBuYW1lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgbmFtZSA9IG5hbWVzW2ldO1xuICAgICAgICBpZiAoZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzW25hbWVdID0gcmV0YWluID0gW107XG4gICAgICAgICAgaWYgKGNhbGxiYWNrIHx8IGNvbnRleHQpIHtcbiAgICAgICAgICAgIGZvciAoaiA9IDAsIGsgPSBldmVudHMubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICAgIGV2ID0gZXZlbnRzW2pdO1xuICAgICAgICAgICAgICBpZiAoKGNhbGxiYWNrICYmIGNhbGxiYWNrICE9PSBldi5jYWxsYmFjayAmJiBjYWxsYmFjayAhPT0gZXYuY2FsbGJhY2suX2NhbGxiYWNrKSB8fFxuICAgICAgICAgICAgICAgICAgKGNvbnRleHQgJiYgY29udGV4dCAhPT0gZXYuY29udGV4dCkpIHtcbiAgICAgICAgICAgICAgICByZXRhaW4ucHVzaChldik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFyZXRhaW4ubGVuZ3RoKSBkZWxldGUgdGhpcy5fZXZlbnRzW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBUcmlnZ2VyIG9uZSBvciBtYW55IGV2ZW50cywgZmlyaW5nIGFsbCBib3VuZCBjYWxsYmFja3MuIENhbGxiYWNrcyBhcmVcbiAgICAvLyBwYXNzZWQgdGhlIHNhbWUgYXJndW1lbnRzIGFzIGB0cmlnZ2VyYCBpcywgYXBhcnQgZnJvbSB0aGUgZXZlbnQgbmFtZVxuICAgIC8vICh1bmxlc3MgeW91J3JlIGxpc3RlbmluZyBvbiBgXCJhbGxcImAsIHdoaWNoIHdpbGwgY2F1c2UgeW91ciBjYWxsYmFjayB0b1xuICAgIC8vIHJlY2VpdmUgdGhlIHRydWUgbmFtZSBvZiB0aGUgZXZlbnQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50KS5cbiAgICB0cmlnZ2VyOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XG4gICAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIGlmICghZXZlbnRzQXBpKHRoaXMsICd0cmlnZ2VyJywgbmFtZSwgYXJncykpIHJldHVybiB0aGlzO1xuICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXTtcbiAgICAgIHZhciBhbGxFdmVudHMgPSB0aGlzLl9ldmVudHMuYWxsO1xuICAgICAgaWYgKGV2ZW50cykgdHJpZ2dlckV2ZW50cyhldmVudHMsIGFyZ3MpO1xuICAgICAgaWYgKGFsbEV2ZW50cykgdHJpZ2dlckV2ZW50cyhhbGxFdmVudHMsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gVGVsbCB0aGlzIG9iamVjdCB0byBzdG9wIGxpc3RlbmluZyB0byBlaXRoZXIgc3BlY2lmaWMgZXZlbnRzIC4uLiBvclxuICAgIC8vIHRvIGV2ZXJ5IG9iamVjdCBpdCdzIGN1cnJlbnRseSBsaXN0ZW5pbmcgdG8uXG4gICAgc3RvcExpc3RlbmluZzogZnVuY3Rpb24ob2JqLCBuYW1lLCBjYWxsYmFjaykge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcbiAgICAgIGlmICghbGlzdGVuZXJzKSByZXR1cm4gdGhpcztcbiAgICAgIHZhciBkZWxldGVMaXN0ZW5lciA9ICFuYW1lICYmICFjYWxsYmFjaztcbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIGNhbGxiYWNrID0gdGhpcztcbiAgICAgIGlmIChvYmopIChsaXN0ZW5lcnMgPSB7fSlbb2JqLl9saXN0ZW5lcklkXSA9IG9iajtcbiAgICAgIGZvciAodmFyIGlkIGluIGxpc3RlbmVycykge1xuICAgICAgICBsaXN0ZW5lcnNbaWRdLm9mZihuYW1lLCBjYWxsYmFjaywgdGhpcyk7XG4gICAgICAgIGlmIChkZWxldGVMaXN0ZW5lcikgZGVsZXRlIHRoaXMuX2xpc3RlbmVyc1tpZF07XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgfTtcblxuICAvLyBSZWd1bGFyIGV4cHJlc3Npb24gdXNlZCB0byBzcGxpdCBldmVudCBzdHJpbmdzLlxuICB2YXIgZXZlbnRTcGxpdHRlciA9IC9cXHMrLztcblxuICAvLyBJbXBsZW1lbnQgZmFuY3kgZmVhdHVyZXMgb2YgdGhlIEV2ZW50cyBBUEkgc3VjaCBhcyBtdWx0aXBsZSBldmVudFxuICAvLyBuYW1lcyBgXCJjaGFuZ2UgYmx1clwiYCBhbmQgalF1ZXJ5LXN0eWxlIGV2ZW50IG1hcHMgYHtjaGFuZ2U6IGFjdGlvbn1gXG4gIC8vIGluIHRlcm1zIG9mIHRoZSBleGlzdGluZyBBUEkuXG4gIHZhciBldmVudHNBcGkgPSBmdW5jdGlvbihvYmosIGFjdGlvbiwgbmFtZSwgcmVzdCkge1xuICAgIGlmICghbmFtZSkgcmV0dXJuIHRydWU7XG5cbiAgICAvLyBIYW5kbGUgZXZlbnQgbWFwcy5cbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gbmFtZSkge1xuICAgICAgICBvYmpbYWN0aW9uXS5hcHBseShvYmosIFtrZXksIG5hbWVba2V5XV0uY29uY2F0KHJlc3QpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgc3BhY2Ugc2VwYXJhdGVkIGV2ZW50IG5hbWVzLlxuICAgIGlmIChldmVudFNwbGl0dGVyLnRlc3QobmFtZSkpIHtcbiAgICAgIHZhciBuYW1lcyA9IG5hbWUuc3BsaXQoZXZlbnRTcGxpdHRlcik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG5hbWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBvYmpbYWN0aW9uXS5hcHBseShvYmosIFtuYW1lc1tpXV0uY29uY2F0KHJlc3QpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBBIGRpZmZpY3VsdC10by1iZWxpZXZlLCBidXQgb3B0aW1pemVkIGludGVybmFsIGRpc3BhdGNoIGZ1bmN0aW9uIGZvclxuICAvLyB0cmlnZ2VyaW5nIGV2ZW50cy4gVHJpZXMgdG8ga2VlcCB0aGUgdXN1YWwgY2FzZXMgc3BlZWR5IChtb3N0IGludGVybmFsXG4gIC8vIEJhY2tib25lIGV2ZW50cyBoYXZlIDMgYXJndW1lbnRzKS5cbiAgdmFyIHRyaWdnZXJFdmVudHMgPSBmdW5jdGlvbihldmVudHMsIGFyZ3MpIHtcbiAgICB2YXIgZXYsIGkgPSAtMSwgbCA9IGV2ZW50cy5sZW5ndGgsIGExID0gYXJnc1swXSwgYTIgPSBhcmdzWzFdLCBhMyA9IGFyZ3NbMl07XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCk7IHJldHVybjtcbiAgICAgIGNhc2UgMTogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExKTsgcmV0dXJuO1xuICAgICAgY2FzZSAyOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEsIGEyKTsgcmV0dXJuO1xuICAgICAgY2FzZSAzOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEsIGEyLCBhMyk7IHJldHVybjtcbiAgICAgIGRlZmF1bHQ6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmFwcGx5KGV2LmN0eCwgYXJncyk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBsaXN0ZW5NZXRob2RzID0ge2xpc3RlblRvOiAnb24nLCBsaXN0ZW5Ub09uY2U6ICdvbmNlJ307XG5cbiAgLy8gSW52ZXJzaW9uLW9mLWNvbnRyb2wgdmVyc2lvbnMgb2YgYG9uYCBhbmQgYG9uY2VgLiBUZWxsICp0aGlzKiBvYmplY3QgdG9cbiAgLy8gbGlzdGVuIHRvIGFuIGV2ZW50IGluIGFub3RoZXIgb2JqZWN0IC4uLiBrZWVwaW5nIHRyYWNrIG9mIHdoYXQgaXQnc1xuICAvLyBsaXN0ZW5pbmcgdG8uXG4gIGZ1bmN0aW9uIGFkZExpc3Rlbk1ldGhvZChtZXRob2QsIGltcGxlbWVudGF0aW9uKSB7XG4gICAgRXZlbnRhYmxlW21ldGhvZF0gPSBmdW5jdGlvbihvYmosIG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzIHx8ICh0aGlzLl9saXN0ZW5lcnMgPSB7fSk7XG4gICAgICB2YXIgaWQgPSBvYmouX2xpc3RlbmVySWQgfHwgKG9iai5fbGlzdGVuZXJJZCA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpO1xuICAgICAgbGlzdGVuZXJzW2lkXSA9IG9iajtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIGNhbGxiYWNrID0gdGhpcztcbiAgICAgIG9ialtpbXBsZW1lbnRhdGlvbl0obmFtZSwgY2FsbGJhY2ssIHRoaXMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgfVxuXG4gIGFkZExpc3Rlbk1ldGhvZCgnbGlzdGVuVG8nLCAnb24nKTtcbiAgYWRkTGlzdGVuTWV0aG9kKCdsaXN0ZW5Ub09uY2UnLCAnb25jZScpO1xuXG4gIC8vIEFsaWFzZXMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICBFdmVudGFibGUuYmluZCAgID0gRXZlbnRhYmxlLm9uO1xuICBFdmVudGFibGUudW5iaW5kID0gRXZlbnRhYmxlLm9mZjtcblxuICByZXR1cm4gRXZlbnRhYmxlO1xuXG59KSk7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGZvck93biA9IHJlcXVpcmUoJ2xvZGFzaC5mb3Jvd24nKSxcbiAgICBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnbG9kYXNoLmlzZnVuY3Rpb24nKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCBzaG9ydGN1dHMgKi9cbnZhciBhcmdzQ2xhc3MgPSAnW29iamVjdCBBcmd1bWVudHNdJyxcbiAgICBhcnJheUNsYXNzID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBvYmplY3RDbGFzcyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHN0cmluZ0NsYXNzID0gJ1tvYmplY3QgU3RyaW5nXSc7XG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGludGVybmFsIFtbQ2xhc3NdXSBvZiB2YWx1ZXMgKi9cbnZhciB0b1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGVtcHR5LiBBcnJheXMsIHN0cmluZ3MsIG9yIGBhcmd1bWVudHNgIG9iamVjdHMgd2l0aCBhXG4gKiBsZW5ndGggb2YgYDBgIGFuZCBvYmplY3RzIHdpdGggbm8gb3duIGVudW1lcmFibGUgcHJvcGVydGllcyBhcmUgY29uc2lkZXJlZFxuICogXCJlbXB0eVwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSB2YWx1ZSBUaGUgdmFsdWUgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBlbXB0eSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRW1wdHkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0VtcHR5KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRW1wdHkoJycpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XG4gIHZhciByZXN1bHQgPSB0cnVlO1xuICBpZiAoIXZhbHVlKSB7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICB2YXIgY2xhc3NOYW1lID0gdG9TdHJpbmcuY2FsbCh2YWx1ZSksXG4gICAgICBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG5cbiAgaWYgKChjbGFzc05hbWUgPT0gYXJyYXlDbGFzcyB8fCBjbGFzc05hbWUgPT0gc3RyaW5nQ2xhc3MgfHwgY2xhc3NOYW1lID09IGFyZ3NDbGFzcyApIHx8XG4gICAgICAoY2xhc3NOYW1lID09IG9iamVjdENsYXNzICYmIHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicgJiYgaXNGdW5jdGlvbih2YWx1ZS5zcGxpY2UpKSkge1xuICAgIHJldHVybiAhbGVuZ3RoO1xuICB9XG4gIGZvck93bih2YWx1ZSwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChyZXN1bHQgPSBmYWxzZSk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRW1wdHk7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGJhc2VDcmVhdGVDYWxsYmFjayA9IHJlcXVpcmUoJ2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrJyksXG4gICAga2V5cyA9IHJlcXVpcmUoJ2xvZGFzaC5rZXlzJyksXG4gICAgb2JqZWN0VHlwZXMgPSByZXF1aXJlKCdsb2Rhc2guX29iamVjdHR5cGVzJyk7XG5cbi8qKlxuICogSXRlcmF0ZXMgb3ZlciBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdCwgZXhlY3V0aW5nIHRoZSBjYWxsYmFja1xuICogZm9yIGVhY2ggcHJvcGVydHkuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZVxuICogYXJndW1lbnRzOyAodmFsdWUsIGtleSwgb2JqZWN0KS4gQ2FsbGJhY2tzIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieVxuICogZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHR5cGUgRnVuY3Rpb25cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZm9yT3duKHsgJzAnOiAnemVybycsICcxJzogJ29uZScsICdsZW5ndGgnOiAyIH0sIGZ1bmN0aW9uKG51bSwga2V5KSB7XG4gKiAgIGNvbnNvbGUubG9nKGtleSk7XG4gKiB9KTtcbiAqIC8vID0+IGxvZ3MgJzAnLCAnMScsIGFuZCAnbGVuZ3RoJyAocHJvcGVydHkgb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50cylcbiAqL1xudmFyIGZvck93biA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gIHZhciBpbmRleCwgaXRlcmFibGUgPSBjb2xsZWN0aW9uLCByZXN1bHQgPSBpdGVyYWJsZTtcbiAgaWYgKCFpdGVyYWJsZSkgcmV0dXJuIHJlc3VsdDtcbiAgaWYgKCFvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdKSByZXR1cm4gcmVzdWx0O1xuICBjYWxsYmFjayA9IGNhbGxiYWNrICYmIHR5cGVvZiB0aGlzQXJnID09ICd1bmRlZmluZWQnID8gY2FsbGJhY2sgOiBiYXNlQ3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgIHZhciBvd25JbmRleCA9IC0xLFxuICAgICAgICBvd25Qcm9wcyA9IG9iamVjdFR5cGVzW3R5cGVvZiBpdGVyYWJsZV0gJiYga2V5cyhpdGVyYWJsZSksXG4gICAgICAgIGxlbmd0aCA9IG93blByb3BzID8gb3duUHJvcHMubGVuZ3RoIDogMDtcblxuICAgIHdoaWxlICgrK293bkluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBpbmRleCA9IG93blByb3BzW293bkluZGV4XTtcbiAgICAgIGlmIChjYWxsYmFjayhpdGVyYWJsZVtpbmRleF0sIGluZGV4LCBjb2xsZWN0aW9uKSA9PT0gZmFsc2UpIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICByZXR1cm4gcmVzdWx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZvck93bjtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgYmluZCA9IHJlcXVpcmUoJ2xvZGFzaC5iaW5kJyksXG4gICAgaWRlbnRpdHkgPSByZXF1aXJlKCdsb2Rhc2guaWRlbnRpdHknKSxcbiAgICBzZXRCaW5kRGF0YSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2V0YmluZGRhdGEnKSxcbiAgICBzdXBwb3J0ID0gcmVxdWlyZSgnbG9kYXNoLnN1cHBvcnQnKTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0ZWQgbmFtZWQgZnVuY3Rpb25zICovXG52YXIgcmVGdW5jTmFtZSA9IC9eXFxzKmZ1bmN0aW9uWyBcXG5cXHJcXHRdK1xcdy87XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBmdW5jdGlvbnMgY29udGFpbmluZyBhIGB0aGlzYCByZWZlcmVuY2UgKi9cbnZhciByZVRoaXMgPSAvXFxidGhpc1xcYi87XG5cbi8qKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyAqL1xudmFyIGZuVG9TdHJpbmcgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY3JlYXRlQ2FsbGJhY2tgIHdpdGhvdXQgc3VwcG9ydCBmb3IgY3JlYXRpbmdcbiAqIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSBbZnVuYz1pZGVudGl0eV0gVGhlIHZhbHVlIHRvIGNvbnZlcnQgdG8gYSBjYWxsYmFjay5cbiAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiB0aGUgY3JlYXRlZCBjYWxsYmFjay5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbYXJnQ291bnRdIFRoZSBudW1iZXIgb2YgYXJndW1lbnRzIHRoZSBjYWxsYmFjayBhY2NlcHRzLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGEgY2FsbGJhY2sgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VDcmVhdGVDYWxsYmFjayhmdW5jLCB0aGlzQXJnLCBhcmdDb3VudCkge1xuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBpZGVudGl0eTtcbiAgfVxuICAvLyBleGl0IGVhcmx5IGZvciBubyBgdGhpc0FyZ2Agb3IgYWxyZWFkeSBib3VuZCBieSBgRnVuY3Rpb24jYmluZGBcbiAgaWYgKHR5cGVvZiB0aGlzQXJnID09ICd1bmRlZmluZWQnIHx8ICEoJ3Byb3RvdHlwZScgaW4gZnVuYykpIHtcbiAgICByZXR1cm4gZnVuYztcbiAgfVxuICB2YXIgYmluZERhdGEgPSBmdW5jLl9fYmluZERhdGFfXztcbiAgaWYgKHR5cGVvZiBiaW5kRGF0YSA9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChzdXBwb3J0LmZ1bmNOYW1lcykge1xuICAgICAgYmluZERhdGEgPSAhZnVuYy5uYW1lO1xuICAgIH1cbiAgICBiaW5kRGF0YSA9IGJpbmREYXRhIHx8ICFzdXBwb3J0LmZ1bmNEZWNvbXA7XG4gICAgaWYgKCFiaW5kRGF0YSkge1xuICAgICAgdmFyIHNvdXJjZSA9IGZuVG9TdHJpbmcuY2FsbChmdW5jKTtcbiAgICAgIGlmICghc3VwcG9ydC5mdW5jTmFtZXMpIHtcbiAgICAgICAgYmluZERhdGEgPSAhcmVGdW5jTmFtZS50ZXN0KHNvdXJjZSk7XG4gICAgICB9XG4gICAgICBpZiAoIWJpbmREYXRhKSB7XG4gICAgICAgIC8vIGNoZWNrcyBpZiBgZnVuY2AgcmVmZXJlbmNlcyB0aGUgYHRoaXNgIGtleXdvcmQgYW5kIHN0b3JlcyB0aGUgcmVzdWx0XG4gICAgICAgIGJpbmREYXRhID0gcmVUaGlzLnRlc3Qoc291cmNlKTtcbiAgICAgICAgc2V0QmluZERhdGEoZnVuYywgYmluZERhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBleGl0IGVhcmx5IGlmIHRoZXJlIGFyZSBubyBgdGhpc2AgcmVmZXJlbmNlcyBvciBgZnVuY2AgaXMgYm91bmRcbiAgaWYgKGJpbmREYXRhID09PSBmYWxzZSB8fCAoYmluZERhdGEgIT09IHRydWUgJiYgYmluZERhdGFbMV0gJiAxKSkge1xuICAgIHJldHVybiBmdW5jO1xuICB9XG4gIHN3aXRjaCAoYXJnQ291bnQpIHtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCB2YWx1ZSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgfTtcbiAgICBjYXNlIDQ6IHJldHVybiBmdW5jdGlvbihhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGJpbmQoZnVuYywgdGhpc0FyZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNyZWF0ZUNhbGxiYWNrO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBpc05hdGl2ZSA9IHJlcXVpcmUoJ2xvZGFzaC5faXNuYXRpdmUnKSxcbiAgICBub29wID0gcmVxdWlyZSgnbG9kYXNoLm5vb3AnKTtcblxuLyoqIFVzZWQgYXMgdGhlIHByb3BlcnR5IGRlc2NyaXB0b3IgZm9yIGBfX2JpbmREYXRhX19gICovXG52YXIgZGVzY3JpcHRvciA9IHtcbiAgJ2NvbmZpZ3VyYWJsZSc6IGZhbHNlLFxuICAnZW51bWVyYWJsZSc6IGZhbHNlLFxuICAndmFsdWUnOiBudWxsLFxuICAnd3JpdGFibGUnOiBmYWxzZVxufTtcblxuLyoqIFVzZWQgdG8gc2V0IG1ldGEgZGF0YSBvbiBmdW5jdGlvbnMgKi9cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgLy8gSUUgOCBvbmx5IGFjY2VwdHMgRE9NIGVsZW1lbnRzXG4gIHRyeSB7XG4gICAgdmFyIG8gPSB7fSxcbiAgICAgICAgZnVuYyA9IGlzTmF0aXZlKGZ1bmMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkpICYmIGZ1bmMsXG4gICAgICAgIHJlc3VsdCA9IGZ1bmMobywgbywgbykgJiYgZnVuYztcbiAgfSBjYXRjaChlKSB7IH1cbiAgcmV0dXJuIHJlc3VsdDtcbn0oKSk7XG5cbi8qKlxuICogU2V0cyBgdGhpc2AgYmluZGluZyBkYXRhIG9uIGEgZ2l2ZW4gZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHNldCBkYXRhIG9uLlxuICogQHBhcmFtIHtBcnJheX0gdmFsdWUgVGhlIGRhdGEgYXJyYXkgdG8gc2V0LlxuICovXG52YXIgc2V0QmluZERhdGEgPSAhZGVmaW5lUHJvcGVydHkgPyBub29wIDogZnVuY3Rpb24oZnVuYywgdmFsdWUpIHtcbiAgZGVzY3JpcHRvci52YWx1ZSA9IHZhbHVlO1xuICBkZWZpbmVQcm9wZXJ0eShmdW5jLCAnX19iaW5kRGF0YV9fJywgZGVzY3JpcHRvcik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNldEJpbmREYXRhO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgaW50ZXJuYWwgW1tDbGFzc11dIG9mIHZhbHVlcyAqL1xudmFyIHRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBpZiBhIG1ldGhvZCBpcyBuYXRpdmUgKi9cbnZhciByZU5hdGl2ZSA9IFJlZ0V4cCgnXicgK1xuICBTdHJpbmcodG9TdHJpbmcpXG4gICAgLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJylcbiAgICAucmVwbGFjZSgvdG9TdHJpbmd8IGZvciBbXlxcXV0rL2csICcuKj8nKSArICckJ1xuKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNOYXRpdmUodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nICYmIHJlTmF0aXZlLnRlc3QodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTmF0aXZlO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBBIG5vLW9wZXJhdGlvbiBmdW5jdGlvbi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnbmFtZSc6ICdmcmVkJyB9O1xuICogXy5ub29wKG9iamVjdCkgPT09IHVuZGVmaW5lZDtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gbm9vcCgpIHtcbiAgLy8gbm8gb3BlcmF0aW9uIHBlcmZvcm1lZFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5vb3A7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGNyZWF0ZVdyYXBwZXIgPSByZXF1aXJlKCdsb2Rhc2guX2NyZWF0ZXdyYXBwZXInKSxcbiAgICBzbGljZSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2xpY2UnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIGludm9rZXMgYGZ1bmNgIHdpdGggdGhlIGB0aGlzYFxuICogYmluZGluZyBvZiBgdGhpc0FyZ2AgYW5kIHByZXBlbmRzIGFueSBhZGRpdGlvbmFsIGBiaW5kYCBhcmd1bWVudHMgdG8gdGhvc2VcbiAqIHByb3ZpZGVkIHRvIHRoZSBib3VuZCBmdW5jdGlvbi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYmluZC5cbiAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gKiBAcGFyYW0gey4uLip9IFthcmddIEFyZ3VtZW50cyB0byBiZSBwYXJ0aWFsbHkgYXBwbGllZC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJvdW5kIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgZnVuYyA9IGZ1bmN0aW9uKGdyZWV0aW5nKSB7XG4gKiAgIHJldHVybiBncmVldGluZyArICcgJyArIHRoaXMubmFtZTtcbiAqIH07XG4gKlxuICogZnVuYyA9IF8uYmluZChmdW5jLCB7ICduYW1lJzogJ2ZyZWQnIH0sICdoaScpO1xuICogZnVuYygpO1xuICogLy8gPT4gJ2hpIGZyZWQnXG4gKi9cbmZ1bmN0aW9uIGJpbmQoZnVuYywgdGhpc0FyZykge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDJcbiAgICA/IGNyZWF0ZVdyYXBwZXIoZnVuYywgMTcsIHNsaWNlKGFyZ3VtZW50cywgMiksIG51bGwsIHRoaXNBcmcpXG4gICAgOiBjcmVhdGVXcmFwcGVyKGZ1bmMsIDEsIG51bGwsIG51bGwsIHRoaXNBcmcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJpbmQ7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGJhc2VCaW5kID0gcmVxdWlyZSgnbG9kYXNoLl9iYXNlYmluZCcpLFxuICAgIGJhc2VDcmVhdGVXcmFwcGVyID0gcmVxdWlyZSgnbG9kYXNoLl9iYXNlY3JlYXRld3JhcHBlcicpLFxuICAgIGlzRnVuY3Rpb24gPSByZXF1aXJlKCdsb2Rhc2guaXNmdW5jdGlvbicpLFxuICAgIHNsaWNlID0gcmVxdWlyZSgnbG9kYXNoLl9zbGljZScpO1xuXG4vKipcbiAqIFVzZWQgZm9yIGBBcnJheWAgbWV0aG9kIHJlZmVyZW5jZXMuXG4gKlxuICogTm9ybWFsbHkgYEFycmF5LnByb3RvdHlwZWAgd291bGQgc3VmZmljZSwgaG93ZXZlciwgdXNpbmcgYW4gYXJyYXkgbGl0ZXJhbFxuICogYXZvaWRzIGlzc3VlcyBpbiBOYXJ3aGFsLlxuICovXG52YXIgYXJyYXlSZWYgPSBbXTtcblxuLyoqIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzICovXG52YXIgcHVzaCA9IGFycmF5UmVmLnB1c2gsXG4gICAgdW5zaGlmdCA9IGFycmF5UmVmLnVuc2hpZnQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCBlaXRoZXIgY3VycmllcyBvciBpbnZva2VzIGBmdW5jYFxuICogd2l0aCBhbiBvcHRpb25hbCBgdGhpc2AgYmluZGluZyBhbmQgcGFydGlhbGx5IGFwcGxpZWQgYXJndW1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufHN0cmluZ30gZnVuYyBUaGUgZnVuY3Rpb24gb3IgbWV0aG9kIG5hbWUgdG8gcmVmZXJlbmNlLlxuICogQHBhcmFtIHtudW1iZXJ9IGJpdG1hc2sgVGhlIGJpdG1hc2sgb2YgbWV0aG9kIGZsYWdzIHRvIGNvbXBvc2UuXG4gKiAgVGhlIGJpdG1hc2sgbWF5IGJlIGNvbXBvc2VkIG9mIHRoZSBmb2xsb3dpbmcgZmxhZ3M6XG4gKiAgMSAtIGBfLmJpbmRgXG4gKiAgMiAtIGBfLmJpbmRLZXlgXG4gKiAgNCAtIGBfLmN1cnJ5YFxuICogIDggLSBgXy5jdXJyeWAgKGJvdW5kKVxuICogIDE2IC0gYF8ucGFydGlhbGBcbiAqICAzMiAtIGBfLnBhcnRpYWxSaWdodGBcbiAqIEBwYXJhbSB7QXJyYXl9IFtwYXJ0aWFsQXJnc10gQW4gYXJyYXkgb2YgYXJndW1lbnRzIHRvIHByZXBlbmQgdG8gdGhvc2VcbiAqICBwcm92aWRlZCB0byB0aGUgbmV3IGZ1bmN0aW9uLlxuICogQHBhcmFtIHtBcnJheX0gW3BhcnRpYWxSaWdodEFyZ3NdIEFuIGFycmF5IG9mIGFyZ3VtZW50cyB0byBhcHBlbmQgdG8gdGhvc2VcbiAqICBwcm92aWRlZCB0byB0aGUgbmV3IGZ1bmN0aW9uLlxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBmdW5jYC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbYXJpdHldIFRoZSBhcml0eSBvZiBgZnVuY2AuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlV3JhcHBlcihmdW5jLCBiaXRtYXNrLCBwYXJ0aWFsQXJncywgcGFydGlhbFJpZ2h0QXJncywgdGhpc0FyZywgYXJpdHkpIHtcbiAgdmFyIGlzQmluZCA9IGJpdG1hc2sgJiAxLFxuICAgICAgaXNCaW5kS2V5ID0gYml0bWFzayAmIDIsXG4gICAgICBpc0N1cnJ5ID0gYml0bWFzayAmIDQsXG4gICAgICBpc0N1cnJ5Qm91bmQgPSBiaXRtYXNrICYgOCxcbiAgICAgIGlzUGFydGlhbCA9IGJpdG1hc2sgJiAxNixcbiAgICAgIGlzUGFydGlhbFJpZ2h0ID0gYml0bWFzayAmIDMyO1xuXG4gIGlmICghaXNCaW5kS2V5ICYmICFpc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgfVxuICBpZiAoaXNQYXJ0aWFsICYmICFwYXJ0aWFsQXJncy5sZW5ndGgpIHtcbiAgICBiaXRtYXNrICY9IH4xNjtcbiAgICBpc1BhcnRpYWwgPSBwYXJ0aWFsQXJncyA9IGZhbHNlO1xuICB9XG4gIGlmIChpc1BhcnRpYWxSaWdodCAmJiAhcGFydGlhbFJpZ2h0QXJncy5sZW5ndGgpIHtcbiAgICBiaXRtYXNrICY9IH4zMjtcbiAgICBpc1BhcnRpYWxSaWdodCA9IHBhcnRpYWxSaWdodEFyZ3MgPSBmYWxzZTtcbiAgfVxuICB2YXIgYmluZERhdGEgPSBmdW5jICYmIGZ1bmMuX19iaW5kRGF0YV9fO1xuICBpZiAoYmluZERhdGEgJiYgYmluZERhdGEgIT09IHRydWUpIHtcbiAgICAvLyBjbG9uZSBgYmluZERhdGFgXG4gICAgYmluZERhdGEgPSBzbGljZShiaW5kRGF0YSk7XG4gICAgaWYgKGJpbmREYXRhWzJdKSB7XG4gICAgICBiaW5kRGF0YVsyXSA9IHNsaWNlKGJpbmREYXRhWzJdKTtcbiAgICB9XG4gICAgaWYgKGJpbmREYXRhWzNdKSB7XG4gICAgICBiaW5kRGF0YVszXSA9IHNsaWNlKGJpbmREYXRhWzNdKTtcbiAgICB9XG4gICAgLy8gc2V0IGB0aGlzQmluZGluZ2AgaXMgbm90IHByZXZpb3VzbHkgYm91bmRcbiAgICBpZiAoaXNCaW5kICYmICEoYmluZERhdGFbMV0gJiAxKSkge1xuICAgICAgYmluZERhdGFbNF0gPSB0aGlzQXJnO1xuICAgIH1cbiAgICAvLyBzZXQgaWYgcHJldmlvdXNseSBib3VuZCBidXQgbm90IGN1cnJlbnRseSAoc3Vic2VxdWVudCBjdXJyaWVkIGZ1bmN0aW9ucylcbiAgICBpZiAoIWlzQmluZCAmJiBiaW5kRGF0YVsxXSAmIDEpIHtcbiAgICAgIGJpdG1hc2sgfD0gODtcbiAgICB9XG4gICAgLy8gc2V0IGN1cnJpZWQgYXJpdHkgaWYgbm90IHlldCBzZXRcbiAgICBpZiAoaXNDdXJyeSAmJiAhKGJpbmREYXRhWzFdICYgNCkpIHtcbiAgICAgIGJpbmREYXRhWzVdID0gYXJpdHk7XG4gICAgfVxuICAgIC8vIGFwcGVuZCBwYXJ0aWFsIGxlZnQgYXJndW1lbnRzXG4gICAgaWYgKGlzUGFydGlhbCkge1xuICAgICAgcHVzaC5hcHBseShiaW5kRGF0YVsyXSB8fCAoYmluZERhdGFbMl0gPSBbXSksIHBhcnRpYWxBcmdzKTtcbiAgICB9XG4gICAgLy8gYXBwZW5kIHBhcnRpYWwgcmlnaHQgYXJndW1lbnRzXG4gICAgaWYgKGlzUGFydGlhbFJpZ2h0KSB7XG4gICAgICB1bnNoaWZ0LmFwcGx5KGJpbmREYXRhWzNdIHx8IChiaW5kRGF0YVszXSA9IFtdKSwgcGFydGlhbFJpZ2h0QXJncyk7XG4gICAgfVxuICAgIC8vIG1lcmdlIGZsYWdzXG4gICAgYmluZERhdGFbMV0gfD0gYml0bWFzaztcbiAgICByZXR1cm4gY3JlYXRlV3JhcHBlci5hcHBseShudWxsLCBiaW5kRGF0YSk7XG4gIH1cbiAgLy8gZmFzdCBwYXRoIGZvciBgXy5iaW5kYFxuICB2YXIgY3JlYXRlciA9IChiaXRtYXNrID09IDEgfHwgYml0bWFzayA9PT0gMTcpID8gYmFzZUJpbmQgOiBiYXNlQ3JlYXRlV3JhcHBlcjtcbiAgcmV0dXJuIGNyZWF0ZXIoW2Z1bmMsIGJpdG1hc2ssIHBhcnRpYWxBcmdzLCBwYXJ0aWFsUmlnaHRBcmdzLCB0aGlzQXJnLCBhcml0eV0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVdyYXBwZXI7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGJhc2VDcmVhdGUgPSByZXF1aXJlKCdsb2Rhc2guX2Jhc2VjcmVhdGUnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC5pc29iamVjdCcpLFxuICAgIHNldEJpbmREYXRhID0gcmVxdWlyZSgnbG9kYXNoLl9zZXRiaW5kZGF0YScpLFxuICAgIHNsaWNlID0gcmVxdWlyZSgnbG9kYXNoLl9zbGljZScpO1xuXG4vKipcbiAqIFVzZWQgZm9yIGBBcnJheWAgbWV0aG9kIHJlZmVyZW5jZXMuXG4gKlxuICogTm9ybWFsbHkgYEFycmF5LnByb3RvdHlwZWAgd291bGQgc3VmZmljZSwgaG93ZXZlciwgdXNpbmcgYW4gYXJyYXkgbGl0ZXJhbFxuICogYXZvaWRzIGlzc3VlcyBpbiBOYXJ3aGFsLlxuICovXG52YXIgYXJyYXlSZWYgPSBbXTtcblxuLyoqIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzICovXG52YXIgcHVzaCA9IGFycmF5UmVmLnB1c2g7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uYmluZGAgdGhhdCBjcmVhdGVzIHRoZSBib3VuZCBmdW5jdGlvbiBhbmRcbiAqIHNldHMgaXRzIG1ldGEgZGF0YS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYmluZERhdGEgVGhlIGJpbmQgZGF0YSBhcnJheS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJvdW5kIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlQmluZChiaW5kRGF0YSkge1xuICB2YXIgZnVuYyA9IGJpbmREYXRhWzBdLFxuICAgICAgcGFydGlhbEFyZ3MgPSBiaW5kRGF0YVsyXSxcbiAgICAgIHRoaXNBcmcgPSBiaW5kRGF0YVs0XTtcblxuICBmdW5jdGlvbiBib3VuZCgpIHtcbiAgICAvLyBgRnVuY3Rpb24jYmluZGAgc3BlY1xuICAgIC8vIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTUuMy40LjVcbiAgICBpZiAocGFydGlhbEFyZ3MpIHtcbiAgICAgIC8vIGF2b2lkIGBhcmd1bWVudHNgIG9iamVjdCBkZW9wdGltaXphdGlvbnMgYnkgdXNpbmcgYHNsaWNlYCBpbnN0ZWFkXG4gICAgICAvLyBvZiBgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGxgIGFuZCBub3QgYXNzaWduaW5nIGBhcmd1bWVudHNgIHRvIGFcbiAgICAgIC8vIHZhcmlhYmxlIGFzIGEgdGVybmFyeSBleHByZXNzaW9uXG4gICAgICB2YXIgYXJncyA9IHNsaWNlKHBhcnRpYWxBcmdzKTtcbiAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICB9XG4gICAgLy8gbWltaWMgdGhlIGNvbnN0cnVjdG9yJ3MgYHJldHVybmAgYmVoYXZpb3JcbiAgICAvLyBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDEzLjIuMlxuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgYm91bmQpIHtcbiAgICAgIC8vIGVuc3VyZSBgbmV3IGJvdW5kYCBpcyBhbiBpbnN0YW5jZSBvZiBgZnVuY2BcbiAgICAgIHZhciB0aGlzQmluZGluZyA9IGJhc2VDcmVhdGUoZnVuYy5wcm90b3R5cGUpLFxuICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0JpbmRpbmcsIGFyZ3MgfHwgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBpc09iamVjdChyZXN1bHQpID8gcmVzdWx0IDogdGhpc0JpbmRpbmc7XG4gICAgfVxuICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MgfHwgYXJndW1lbnRzKTtcbiAgfVxuICBzZXRCaW5kRGF0YShib3VuZCwgYmluZERhdGEpO1xuICByZXR1cm4gYm91bmQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUJpbmQ7XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGlzTmF0aXZlID0gcmVxdWlyZSgnbG9kYXNoLl9pc25hdGl2ZScpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoLmlzb2JqZWN0JyksXG4gICAgbm9vcCA9IHJlcXVpcmUoJ2xvZGFzaC5ub29wJyk7XG5cbi8qIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzIGZvciBtZXRob2RzIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzICovXG52YXIgbmF0aXZlQ3JlYXRlID0gaXNOYXRpdmUobmF0aXZlQ3JlYXRlID0gT2JqZWN0LmNyZWF0ZSkgJiYgbmF0aXZlQ3JlYXRlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmNyZWF0ZWAgd2l0aG91dCBzdXBwb3J0IGZvciBhc3NpZ25pbmdcbiAqIHByb3BlcnRpZXMgdG8gdGhlIGNyZWF0ZWQgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvdG90eXBlIFRoZSBvYmplY3QgdG8gaW5oZXJpdCBmcm9tLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbmV3IG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gYmFzZUNyZWF0ZShwcm90b3R5cGUsIHByb3BlcnRpZXMpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHByb3RvdHlwZSkgPyBuYXRpdmVDcmVhdGUocHJvdG90eXBlKSA6IHt9O1xufVxuLy8gZmFsbGJhY2sgZm9yIGJyb3dzZXJzIHdpdGhvdXQgYE9iamVjdC5jcmVhdGVgXG5pZiAoIW5hdGl2ZUNyZWF0ZSkge1xuICBiYXNlQ3JlYXRlID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIE9iamVjdCgpIHt9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHByb3RvdHlwZSkge1xuICAgICAgaWYgKGlzT2JqZWN0KHByb3RvdHlwZSkpIHtcbiAgICAgICAgT2JqZWN0LnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBPYmplY3Q7XG4gICAgICAgIE9iamVjdC5wcm90b3R5cGUgPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdCB8fCBnbG9iYWwuT2JqZWN0KCk7XG4gICAgfTtcbiAgfSgpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQ3JlYXRlO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGJhc2VDcmVhdGUgPSByZXF1aXJlKCdsb2Rhc2guX2Jhc2VjcmVhdGUnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC5pc29iamVjdCcpLFxuICAgIHNldEJpbmREYXRhID0gcmVxdWlyZSgnbG9kYXNoLl9zZXRiaW5kZGF0YScpLFxuICAgIHNsaWNlID0gcmVxdWlyZSgnbG9kYXNoLl9zbGljZScpO1xuXG4vKipcbiAqIFVzZWQgZm9yIGBBcnJheWAgbWV0aG9kIHJlZmVyZW5jZXMuXG4gKlxuICogTm9ybWFsbHkgYEFycmF5LnByb3RvdHlwZWAgd291bGQgc3VmZmljZSwgaG93ZXZlciwgdXNpbmcgYW4gYXJyYXkgbGl0ZXJhbFxuICogYXZvaWRzIGlzc3VlcyBpbiBOYXJ3aGFsLlxuICovXG52YXIgYXJyYXlSZWYgPSBbXTtcblxuLyoqIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzICovXG52YXIgcHVzaCA9IGFycmF5UmVmLnB1c2g7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGNyZWF0ZVdyYXBwZXJgIHRoYXQgY3JlYXRlcyB0aGUgd3JhcHBlciBhbmRcbiAqIHNldHMgaXRzIG1ldGEgZGF0YS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYmluZERhdGEgVGhlIGJpbmQgZGF0YSBhcnJheS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlQ3JlYXRlV3JhcHBlcihiaW5kRGF0YSkge1xuICB2YXIgZnVuYyA9IGJpbmREYXRhWzBdLFxuICAgICAgYml0bWFzayA9IGJpbmREYXRhWzFdLFxuICAgICAgcGFydGlhbEFyZ3MgPSBiaW5kRGF0YVsyXSxcbiAgICAgIHBhcnRpYWxSaWdodEFyZ3MgPSBiaW5kRGF0YVszXSxcbiAgICAgIHRoaXNBcmcgPSBiaW5kRGF0YVs0XSxcbiAgICAgIGFyaXR5ID0gYmluZERhdGFbNV07XG5cbiAgdmFyIGlzQmluZCA9IGJpdG1hc2sgJiAxLFxuICAgICAgaXNCaW5kS2V5ID0gYml0bWFzayAmIDIsXG4gICAgICBpc0N1cnJ5ID0gYml0bWFzayAmIDQsXG4gICAgICBpc0N1cnJ5Qm91bmQgPSBiaXRtYXNrICYgOCxcbiAgICAgIGtleSA9IGZ1bmM7XG5cbiAgZnVuY3Rpb24gYm91bmQoKSB7XG4gICAgdmFyIHRoaXNCaW5kaW5nID0gaXNCaW5kID8gdGhpc0FyZyA6IHRoaXM7XG4gICAgaWYgKHBhcnRpYWxBcmdzKSB7XG4gICAgICB2YXIgYXJncyA9IHNsaWNlKHBhcnRpYWxBcmdzKTtcbiAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICB9XG4gICAgaWYgKHBhcnRpYWxSaWdodEFyZ3MgfHwgaXNDdXJyeSkge1xuICAgICAgYXJncyB8fCAoYXJncyA9IHNsaWNlKGFyZ3VtZW50cykpO1xuICAgICAgaWYgKHBhcnRpYWxSaWdodEFyZ3MpIHtcbiAgICAgICAgcHVzaC5hcHBseShhcmdzLCBwYXJ0aWFsUmlnaHRBcmdzKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc0N1cnJ5ICYmIGFyZ3MubGVuZ3RoIDwgYXJpdHkpIHtcbiAgICAgICAgYml0bWFzayB8PSAxNiAmIH4zMjtcbiAgICAgICAgcmV0dXJuIGJhc2VDcmVhdGVXcmFwcGVyKFtmdW5jLCAoaXNDdXJyeUJvdW5kID8gYml0bWFzayA6IGJpdG1hc2sgJiB+MyksIGFyZ3MsIG51bGwsIHRoaXNBcmcsIGFyaXR5XSk7XG4gICAgICB9XG4gICAgfVxuICAgIGFyZ3MgfHwgKGFyZ3MgPSBhcmd1bWVudHMpO1xuICAgIGlmIChpc0JpbmRLZXkpIHtcbiAgICAgIGZ1bmMgPSB0aGlzQmluZGluZ1trZXldO1xuICAgIH1cbiAgICBpZiAodGhpcyBpbnN0YW5jZW9mIGJvdW5kKSB7XG4gICAgICB0aGlzQmluZGluZyA9IGJhc2VDcmVhdGUoZnVuYy5wcm90b3R5cGUpO1xuICAgICAgdmFyIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0JpbmRpbmcsIGFyZ3MpO1xuICAgICAgcmV0dXJuIGlzT2JqZWN0KHJlc3VsdCkgPyByZXN1bHQgOiB0aGlzQmluZGluZztcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpc0JpbmRpbmcsIGFyZ3MpO1xuICB9XG4gIHNldEJpbmREYXRhKGJvdW5kLCBiaW5kRGF0YSk7XG4gIHJldHVybiBib3VuZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQ3JlYXRlV3JhcHBlcjtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKlxuICogU2xpY2VzIHRoZSBgY29sbGVjdGlvbmAgZnJvbSB0aGUgYHN0YXJ0YCBpbmRleCB1cCB0bywgYnV0IG5vdCBpbmNsdWRpbmcsXG4gKiB0aGUgYGVuZGAgaW5kZXguXG4gKlxuICogTm90ZTogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIGluc3RlYWQgb2YgYEFycmF5I3NsaWNlYCB0byBzdXBwb3J0IG5vZGUgbGlzdHNcbiAqIGluIElFIDwgOSBhbmQgdG8gZW5zdXJlIGRlbnNlIGFycmF5cyBhcmUgcmV0dXJuZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBzbGljZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydCBUaGUgc3RhcnQgaW5kZXguXG4gKiBAcGFyYW0ge251bWJlcn0gZW5kIFRoZSBlbmQgaW5kZXguXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBhcnJheS5cbiAqL1xuZnVuY3Rpb24gc2xpY2UoYXJyYXksIHN0YXJ0LCBlbmQpIHtcbiAgc3RhcnQgfHwgKHN0YXJ0ID0gMCk7XG4gIGlmICh0eXBlb2YgZW5kID09ICd1bmRlZmluZWQnKSB7XG4gICAgZW5kID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuICB9XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW5kIC0gc3RhcnQgfHwgMCxcbiAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoKTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHJlc3VsdFtpbmRleF0gPSBhcnJheVtzdGFydCArIGluZGV4XTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNsaWNlO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBmaXJzdCBhcmd1bWVudCBwcm92aWRlZCB0byBpdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICogQHBhcmFtIHsqfSB2YWx1ZSBBbnkgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyBgdmFsdWVgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnbmFtZSc6ICdmcmVkJyB9O1xuICogXy5pZGVudGl0eShvYmplY3QpID09PSBvYmplY3Q7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpZGVudGl0eTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgaXNOYXRpdmUgPSByZXF1aXJlKCdsb2Rhc2guX2lzbmF0aXZlJyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBmdW5jdGlvbnMgY29udGFpbmluZyBhIGB0aGlzYCByZWZlcmVuY2UgKi9cbnZhciByZVRoaXMgPSAvXFxidGhpc1xcYi87XG5cbi8qKlxuICogQW4gb2JqZWN0IHVzZWQgdG8gZmxhZyBlbnZpcm9ubWVudHMgZmVhdHVyZXMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEB0eXBlIE9iamVjdFxuICovXG52YXIgc3VwcG9ydCA9IHt9O1xuXG4vKipcbiAqIERldGVjdCBpZiBmdW5jdGlvbnMgY2FuIGJlIGRlY29tcGlsZWQgYnkgYEZ1bmN0aW9uI3RvU3RyaW5nYFxuICogKGFsbCBidXQgUFMzIGFuZCBvbGRlciBPcGVyYSBtb2JpbGUgYnJvd3NlcnMgJiBhdm9pZGVkIGluIFdpbmRvd3MgOCBhcHBzKS5cbiAqXG4gKiBAbWVtYmVyT2YgXy5zdXBwb3J0XG4gKiBAdHlwZSBib29sZWFuXG4gKi9cbnN1cHBvcnQuZnVuY0RlY29tcCA9ICFpc05hdGl2ZShnbG9iYWwuV2luUlRFcnJvcikgJiYgcmVUaGlzLnRlc3QoZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KTtcblxuLyoqXG4gKiBEZXRlY3QgaWYgYEZ1bmN0aW9uI25hbWVgIGlzIHN1cHBvcnRlZCAoYWxsIGJ1dCBJRSkuXG4gKlxuICogQG1lbWJlck9mIF8uc3VwcG9ydFxuICogQHR5cGUgYm9vbGVhblxuICovXG5zdXBwb3J0LmZ1bmNOYW1lcyA9IHR5cGVvZiBGdW5jdGlvbi5uYW1lID09ICdzdHJpbmcnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN1cHBvcnQ7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKiBVc2VkIHRvIGRldGVybWluZSBpZiB2YWx1ZXMgYXJlIG9mIHRoZSBsYW5ndWFnZSB0eXBlIE9iamVjdCAqL1xudmFyIG9iamVjdFR5cGVzID0ge1xuICAnYm9vbGVhbic6IGZhbHNlLFxuICAnZnVuY3Rpb24nOiB0cnVlLFxuICAnb2JqZWN0JzogdHJ1ZSxcbiAgJ251bWJlcic6IGZhbHNlLFxuICAnc3RyaW5nJzogZmFsc2UsXG4gICd1bmRlZmluZWQnOiBmYWxzZVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBvYmplY3RUeXBlcztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgaXNOYXRpdmUgPSByZXF1aXJlKCdsb2Rhc2guX2lzbmF0aXZlJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCdsb2Rhc2guaXNvYmplY3QnKSxcbiAgICBzaGltS2V5cyA9IHJlcXVpcmUoJ2xvZGFzaC5fc2hpbWtleXMnKTtcblxuLyogTmF0aXZlIG1ldGhvZCBzaG9ydGN1dHMgZm9yIG1ldGhvZHMgd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMgKi9cbnZhciBuYXRpdmVLZXlzID0gaXNOYXRpdmUobmF0aXZlS2V5cyA9IE9iamVjdC5rZXlzKSAmJiBuYXRpdmVLZXlzO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgY29tcG9zZWQgb2YgdGhlIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGFuIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGFuIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmtleXMoeyAnb25lJzogMSwgJ3R3byc6IDIsICd0aHJlZSc6IDMgfSk7XG4gKiAvLyA9PiBbJ29uZScsICd0d28nLCAndGhyZWUnXSAocHJvcGVydHkgb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50cylcbiAqL1xudmFyIGtleXMgPSAhbmF0aXZlS2V5cyA/IHNoaW1LZXlzIDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICByZXR1cm4gbmF0aXZlS2V5cyhvYmplY3QpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBrZXlzO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBvYmplY3RUeXBlcyA9IHJlcXVpcmUoJ2xvZGFzaC5fb2JqZWN0dHlwZXMnKTtcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBBIGZhbGxiYWNrIGltcGxlbWVudGF0aW9uIG9mIGBPYmplY3Qua2V5c2Agd2hpY2ggcHJvZHVjZXMgYW4gYXJyYXkgb2YgdGhlXG4gKiBnaXZlbiBvYmplY3QncyBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHR5cGUgRnVuY3Rpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGFuIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG52YXIgc2hpbUtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgdmFyIGluZGV4LCBpdGVyYWJsZSA9IG9iamVjdCwgcmVzdWx0ID0gW107XG4gIGlmICghaXRlcmFibGUpIHJldHVybiByZXN1bHQ7XG4gIGlmICghKG9iamVjdFR5cGVzW3R5cGVvZiBvYmplY3RdKSkgcmV0dXJuIHJlc3VsdDtcbiAgICBmb3IgKGluZGV4IGluIGl0ZXJhYmxlKSB7XG4gICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChpdGVyYWJsZSwgaW5kZXgpKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGluZGV4KTtcbiAgICAgIH1cbiAgICB9XG4gIHJldHVybiByZXN1bHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2hpbUtleXM7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24uXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbic7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvbjtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgb2JqZWN0VHlwZXMgPSByZXF1aXJlKCdsb2Rhc2guX29iamVjdHR5cGVzJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlIGxhbmd1YWdlIHR5cGUgb2YgT2JqZWN0LlxuICogKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoMSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICAvLyBjaGVjayBpZiB0aGUgdmFsdWUgaXMgdGhlIEVDTUFTY3JpcHQgbGFuZ3VhZ2UgdHlwZSBvZiBPYmplY3RcbiAgLy8gaHR0cDovL2VzNS5naXRodWIuaW8vI3g4XG4gIC8vIGFuZCBhdm9pZCBhIFY4IGJ1Z1xuICAvLyBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0yMjkxXG4gIHJldHVybiAhISh2YWx1ZSAmJiBvYmplY3RUeXBlc1t0eXBlb2YgdmFsdWVdKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgc2hvcnRjdXRzICovXG52YXIgc3RyaW5nQ2xhc3MgPSAnW29iamVjdCBTdHJpbmddJztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgaW50ZXJuYWwgW1tDbGFzc11dIG9mIHZhbHVlcyAqL1xudmFyIHRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBzdHJpbmcuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIHN0cmluZywgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3RyaW5nKCdmcmVkJyk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgfHxcbiAgICB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gc3RyaW5nQ2xhc3MgfHwgZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNTdHJpbmc7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGB1bmRlZmluZWRgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYHVuZGVmaW5lZGAsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1VuZGVmaW5lZCh2b2lkIDApO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICd1bmRlZmluZWQnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzVW5kZWZpbmVkO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnbG9kYXNoLmlzZnVuY3Rpb24nKTtcblxuLyoqXG4gKiBSZXNvbHZlcyB0aGUgdmFsdWUgb2YgcHJvcGVydHkgYGtleWAgb24gYG9iamVjdGAuIElmIGBrZXlgIGlzIGEgZnVuY3Rpb25cbiAqIGl0IHdpbGwgYmUgaW52b2tlZCB3aXRoIHRoZSBgdGhpc2AgYmluZGluZyBvZiBgb2JqZWN0YCBhbmQgaXRzIHJlc3VsdCByZXR1cm5lZCxcbiAqIGVsc2UgdGhlIHByb3BlcnR5IHZhbHVlIGlzIHJldHVybmVkLiBJZiBgb2JqZWN0YCBpcyBmYWxzZXkgdGhlbiBgdW5kZWZpbmVkYFxuICogaXMgcmV0dXJuZWQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gcmVzb2x2ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXNvbHZlZCB2YWx1ZS5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHtcbiAqICAgJ2NoZWVzZSc6ICdjcnVtcGV0cycsXG4gKiAgICdzdHVmZic6IGZ1bmN0aW9uKCkge1xuICogICAgIHJldHVybiAnbm9uc2Vuc2UnO1xuICogICB9XG4gKiB9O1xuICpcbiAqIF8ucmVzdWx0KG9iamVjdCwgJ2NoZWVzZScpO1xuICogLy8gPT4gJ2NydW1wZXRzJ1xuICpcbiAqIF8ucmVzdWx0KG9iamVjdCwgJ3N0dWZmJyk7XG4gKiAvLyA9PiAnbm9uc2Vuc2UnXG4gKi9cbmZ1bmN0aW9uIHJlc3VsdChvYmplY3QsIGtleSkge1xuICBpZiAob2JqZWN0KSB7XG4gICAgdmFyIHZhbHVlID0gb2JqZWN0W2tleV07XG4gICAgcmV0dXJuIGlzRnVuY3Rpb24odmFsdWUpID8gb2JqZWN0W2tleV0oKSA6IHZhbHVlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVzdWx0O1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJ2xvZGFzaC5kZWZhdWx0cycpLFxuICAgIGVzY2FwZSA9IHJlcXVpcmUoJ2xvZGFzaC5lc2NhcGUnKSxcbiAgICBlc2NhcGVTdHJpbmdDaGFyID0gcmVxdWlyZSgnbG9kYXNoLl9lc2NhcGVzdHJpbmdjaGFyJyksXG4gICAga2V5cyA9IHJlcXVpcmUoJ2xvZGFzaC5rZXlzJyksXG4gICAgcmVJbnRlcnBvbGF0ZSA9IHJlcXVpcmUoJ2xvZGFzaC5fcmVpbnRlcnBvbGF0ZScpLFxuICAgIHRlbXBsYXRlU2V0dGluZ3MgPSByZXF1aXJlKCdsb2Rhc2gudGVtcGxhdGVzZXR0aW5ncycpLFxuICAgIHZhbHVlcyA9IHJlcXVpcmUoJ2xvZGFzaC52YWx1ZXMnKTtcblxuLyoqIFVzZWQgdG8gbWF0Y2ggZW1wdHkgc3RyaW5nIGxpdGVyYWxzIGluIGNvbXBpbGVkIHRlbXBsYXRlIHNvdXJjZSAqL1xudmFyIHJlRW1wdHlTdHJpbmdMZWFkaW5nID0gL1xcYl9fcCBcXCs9ICcnOy9nLFxuICAgIHJlRW1wdHlTdHJpbmdNaWRkbGUgPSAvXFxiKF9fcCBcXCs9KSAnJyBcXCsvZyxcbiAgICByZUVtcHR5U3RyaW5nVHJhaWxpbmcgPSAvKF9fZVxcKC4qP1xcKXxcXGJfX3RcXCkpIFxcK1xcbicnOy9nO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2ggRVM2IHRlbXBsYXRlIGRlbGltaXRlcnNcbiAqIGh0dHA6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWxpdGVyYWxzLXN0cmluZy1saXRlcmFsc1xuICovXG52YXIgcmVFc1RlbXBsYXRlID0gL1xcJFxceyhbXlxcXFx9XSooPzpcXFxcLlteXFxcXH1dKikqKVxcfS9nO1xuXG4vKiogVXNlZCB0byBlbnN1cmUgY2FwdHVyaW5nIG9yZGVyIG9mIHRlbXBsYXRlIGRlbGltaXRlcnMgKi9cbnZhciByZU5vTWF0Y2ggPSAvKCReKS87XG5cbi8qKiBVc2VkIHRvIG1hdGNoIHVuZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGNvbXBpbGVkIHN0cmluZyBsaXRlcmFscyAqL1xudmFyIHJlVW5lc2NhcGVkU3RyaW5nID0gL1snXFxuXFxyXFx0XFx1MjAyOFxcdTIwMjlcXFxcXS9nO1xuXG4vKipcbiAqIEEgbWljcm8tdGVtcGxhdGluZyBtZXRob2QgdGhhdCBoYW5kbGVzIGFyYml0cmFyeSBkZWxpbWl0ZXJzLCBwcmVzZXJ2ZXNcbiAqIHdoaXRlc3BhY2UsIGFuZCBjb3JyZWN0bHkgZXNjYXBlcyBxdW90ZXMgd2l0aGluIGludGVycG9sYXRlZCBjb2RlLlxuICpcbiAqIE5vdGU6IEluIHRoZSBkZXZlbG9wbWVudCBidWlsZCwgYF8udGVtcGxhdGVgIHV0aWxpemVzIHNvdXJjZVVSTHMgZm9yIGVhc2llclxuICogZGVidWdnaW5nLiBTZWUgaHR0cDovL3d3dy5odG1sNXJvY2tzLmNvbS9lbi90dXRvcmlhbHMvZGV2ZWxvcGVydG9vbHMvc291cmNlbWFwcy8jdG9jLXNvdXJjZXVybFxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHByZWNvbXBpbGluZyB0ZW1wbGF0ZXMgc2VlOlxuICogaHR0cDovL2xvZGFzaC5jb20vY3VzdG9tLWJ1aWxkc1xuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIENocm9tZSBleHRlbnNpb24gc2FuZGJveGVzIHNlZTpcbiAqIGh0dHA6Ly9kZXZlbG9wZXIuY2hyb21lLmNvbS9zdGFibGUvZXh0ZW5zaW9ucy9zYW5kYm94aW5nRXZhbC5odG1sXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFRoZSB0ZW1wbGF0ZSB0ZXh0LlxuICogQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIGRhdGEgb2JqZWN0IHVzZWQgdG8gcG9wdWxhdGUgdGhlIHRleHQuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7UmVnRXhwfSBbb3B0aW9ucy5lc2NhcGVdIFRoZSBcImVzY2FwZVwiIGRlbGltaXRlci5cbiAqIEBwYXJhbSB7UmVnRXhwfSBbb3B0aW9ucy5ldmFsdWF0ZV0gVGhlIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXIuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnMuaW1wb3J0c10gQW4gb2JqZWN0IHRvIGltcG9ydCBpbnRvIHRoZSB0ZW1wbGF0ZSBhcyBsb2NhbCB2YXJpYWJsZXMuXG4gKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuaW50ZXJwb2xhdGVdIFRoZSBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtzdHJpbmd9IFtzb3VyY2VVUkxdIFRoZSBzb3VyY2VVUkwgb2YgdGhlIHRlbXBsYXRlJ3MgY29tcGlsZWQgc291cmNlLlxuICogQHBhcmFtIHtzdHJpbmd9IFt2YXJpYWJsZV0gVGhlIGRhdGEgb2JqZWN0IHZhcmlhYmxlIG5hbWUuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb258c3RyaW5nfSBSZXR1cm5zIGEgY29tcGlsZWQgZnVuY3Rpb24gd2hlbiBubyBgZGF0YWAgb2JqZWN0XG4gKiAgaXMgZ2l2ZW4sIGVsc2UgaXQgcmV0dXJucyB0aGUgaW50ZXJwb2xhdGVkIHRleHQuXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIHVzaW5nIHRoZSBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyIHRvIGNyZWF0ZSBhIGNvbXBpbGVkIHRlbXBsYXRlXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyA8JT0gbmFtZSAlPicpO1xuICogY29tcGlsZWQoeyAnbmFtZSc6ICdmcmVkJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBmcmVkJ1xuICpcbiAqIC8vIHVzaW5nIHRoZSBcImVzY2FwZVwiIGRlbGltaXRlciB0byBlc2NhcGUgSFRNTCBpbiBkYXRhIHByb3BlcnR5IHZhbHVlc1xuICogXy50ZW1wbGF0ZSgnPGI+PCUtIHZhbHVlICU+PC9iPicsIHsgJ3ZhbHVlJzogJzxzY3JpcHQ+JyB9KTtcbiAqIC8vID0+ICc8Yj4mbHQ7c2NyaXB0Jmd0OzwvYj4nXG4gKlxuICogLy8gdXNpbmcgdGhlIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXIgdG8gZ2VuZXJhdGUgSFRNTFxuICogdmFyIGxpc3QgPSAnPCUgXy5mb3JFYWNoKHBlb3BsZSwgZnVuY3Rpb24obmFtZSkgeyAlPjxsaT48JS0gbmFtZSAlPjwvbGk+PCUgfSk7ICU+JztcbiAqIF8udGVtcGxhdGUobGlzdCwgeyAncGVvcGxlJzogWydmcmVkJywgJ2Jhcm5leSddIH0pO1xuICogLy8gPT4gJzxsaT5mcmVkPC9saT48bGk+YmFybmV5PC9saT4nXG4gKlxuICogLy8gdXNpbmcgdGhlIEVTNiBkZWxpbWl0ZXIgYXMgYW4gYWx0ZXJuYXRpdmUgdG8gdGhlIGRlZmF1bHQgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlclxuICogXy50ZW1wbGF0ZSgnaGVsbG8gJHsgbmFtZSB9JywgeyAnbmFtZSc6ICdwZWJibGVzJyB9KTtcbiAqIC8vID0+ICdoZWxsbyBwZWJibGVzJ1xuICpcbiAqIC8vIHVzaW5nIHRoZSBpbnRlcm5hbCBgcHJpbnRgIGZ1bmN0aW9uIGluIFwiZXZhbHVhdGVcIiBkZWxpbWl0ZXJzXG4gKiBfLnRlbXBsYXRlKCc8JSBwcmludChcImhlbGxvIFwiICsgbmFtZSk7ICU+IScsIHsgJ25hbWUnOiAnYmFybmV5JyB9KTtcbiAqIC8vID0+ICdoZWxsbyBiYXJuZXkhJ1xuICpcbiAqIC8vIHVzaW5nIGEgY3VzdG9tIHRlbXBsYXRlIGRlbGltaXRlcnNcbiAqIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcbiAqICAgJ2ludGVycG9sYXRlJzogL3t7KFtcXHNcXFNdKz8pfX0vZ1xuICogfTtcbiAqXG4gKiBfLnRlbXBsYXRlKCdoZWxsbyB7eyBuYW1lIH19IScsIHsgJ25hbWUnOiAnbXVzdGFjaGUnIH0pO1xuICogLy8gPT4gJ2hlbGxvIG11c3RhY2hlISdcbiAqXG4gKiAvLyB1c2luZyB0aGUgYGltcG9ydHNgIG9wdGlvbiB0byBpbXBvcnQgalF1ZXJ5XG4gKiB2YXIgbGlzdCA9ICc8JSBqcS5lYWNoKHBlb3BsZSwgZnVuY3Rpb24obmFtZSkgeyAlPjxsaT48JS0gbmFtZSAlPjwvbGk+PCUgfSk7ICU+JztcbiAqIF8udGVtcGxhdGUobGlzdCwgeyAncGVvcGxlJzogWydmcmVkJywgJ2Jhcm5leSddIH0sIHsgJ2ltcG9ydHMnOiB7ICdqcSc6IGpRdWVyeSB9IH0pO1xuICogLy8gPT4gJzxsaT5mcmVkPC9saT48bGk+YmFybmV5PC9saT4nXG4gKlxuICogLy8gdXNpbmcgdGhlIGBzb3VyY2VVUkxgIG9wdGlvbiB0byBzcGVjaWZ5IGEgY3VzdG9tIHNvdXJjZVVSTCBmb3IgdGhlIHRlbXBsYXRlXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyA8JT0gbmFtZSAlPicsIG51bGwsIHsgJ3NvdXJjZVVSTCc6ICcvYmFzaWMvZ3JlZXRpbmcuanN0JyB9KTtcbiAqIGNvbXBpbGVkKGRhdGEpO1xuICogLy8gPT4gZmluZCB0aGUgc291cmNlIG9mIFwiZ3JlZXRpbmcuanN0XCIgdW5kZXIgdGhlIFNvdXJjZXMgdGFiIG9yIFJlc291cmNlcyBwYW5lbCBvZiB0aGUgd2ViIGluc3BlY3RvclxuICpcbiAqIC8vIHVzaW5nIHRoZSBgdmFyaWFibGVgIG9wdGlvbiB0byBlbnN1cmUgYSB3aXRoLXN0YXRlbWVudCBpc24ndCB1c2VkIGluIHRoZSBjb21waWxlZCB0ZW1wbGF0ZVxuICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGkgPCU9IGRhdGEubmFtZSAlPiEnLCBudWxsLCB7ICd2YXJpYWJsZSc6ICdkYXRhJyB9KTtcbiAqIGNvbXBpbGVkLnNvdXJjZTtcbiAqIC8vID0+IGZ1bmN0aW9uKGRhdGEpIHtcbiAqICAgdmFyIF9fdCwgX19wID0gJycsIF9fZSA9IF8uZXNjYXBlO1xuICogICBfX3AgKz0gJ2hpICcgKyAoKF9fdCA9ICggZGF0YS5uYW1lICkpID09IG51bGwgPyAnJyA6IF9fdCkgKyAnISc7XG4gKiAgIHJldHVybiBfX3A7XG4gKiB9XG4gKlxuICogLy8gdXNpbmcgdGhlIGBzb3VyY2VgIHByb3BlcnR5IHRvIGlubGluZSBjb21waWxlZCB0ZW1wbGF0ZXMgZm9yIG1lYW5pbmdmdWxcbiAqIC8vIGxpbmUgbnVtYmVycyBpbiBlcnJvciBtZXNzYWdlcyBhbmQgYSBzdGFjayB0cmFjZVxuICogZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4oY3dkLCAnanN0LmpzJyksICdcXFxuICogICB2YXIgSlNUID0ge1xcXG4gKiAgICAgXCJtYWluXCI6ICcgKyBfLnRlbXBsYXRlKG1haW5UZXh0KS5zb3VyY2UgKyAnXFxcbiAqICAgfTtcXFxuICogJyk7XG4gKi9cbmZ1bmN0aW9uIHRlbXBsYXRlKHRleHQsIGRhdGEsIG9wdGlvbnMpIHtcbiAgLy8gYmFzZWQgb24gSm9obiBSZXNpZydzIGB0bXBsYCBpbXBsZW1lbnRhdGlvblxuICAvLyBodHRwOi8vZWpvaG4ub3JnL2Jsb2cvamF2YXNjcmlwdC1taWNyby10ZW1wbGF0aW5nL1xuICAvLyBhbmQgTGF1cmEgRG9rdG9yb3ZhJ3MgZG9ULmpzXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9vbGFkby9kb1RcbiAgdmFyIHNldHRpbmdzID0gdGVtcGxhdGVTZXR0aW5ncy5pbXBvcnRzLl8udGVtcGxhdGVTZXR0aW5ncyB8fCB0ZW1wbGF0ZVNldHRpbmdzO1xuICB0ZXh0ID0gU3RyaW5nKHRleHQgfHwgJycpO1xuXG4gIC8vIGF2b2lkIG1pc3NpbmcgZGVwZW5kZW5jaWVzIHdoZW4gYGl0ZXJhdG9yVGVtcGxhdGVgIGlzIG5vdCBkZWZpbmVkXG4gIG9wdGlvbnMgPSBkZWZhdWx0cyh7fSwgb3B0aW9ucywgc2V0dGluZ3MpO1xuXG4gIHZhciBpbXBvcnRzID0gZGVmYXVsdHMoe30sIG9wdGlvbnMuaW1wb3J0cywgc2V0dGluZ3MuaW1wb3J0cyksXG4gICAgICBpbXBvcnRzS2V5cyA9IGtleXMoaW1wb3J0cyksXG4gICAgICBpbXBvcnRzVmFsdWVzID0gdmFsdWVzKGltcG9ydHMpO1xuXG4gIHZhciBpc0V2YWx1YXRpbmcsXG4gICAgICBpbmRleCA9IDAsXG4gICAgICBpbnRlcnBvbGF0ZSA9IG9wdGlvbnMuaW50ZXJwb2xhdGUgfHwgcmVOb01hdGNoLFxuICAgICAgc291cmNlID0gXCJfX3AgKz0gJ1wiO1xuXG4gIC8vIGNvbXBpbGUgdGhlIHJlZ2V4cCB0byBtYXRjaCBlYWNoIGRlbGltaXRlclxuICB2YXIgcmVEZWxpbWl0ZXJzID0gUmVnRXhwKFxuICAgIChvcHRpb25zLmVzY2FwZSB8fCByZU5vTWF0Y2gpLnNvdXJjZSArICd8JyArXG4gICAgaW50ZXJwb2xhdGUuc291cmNlICsgJ3wnICtcbiAgICAoaW50ZXJwb2xhdGUgPT09IHJlSW50ZXJwb2xhdGUgPyByZUVzVGVtcGxhdGUgOiByZU5vTWF0Y2gpLnNvdXJjZSArICd8JyArXG4gICAgKG9wdGlvbnMuZXZhbHVhdGUgfHwgcmVOb01hdGNoKS5zb3VyY2UgKyAnfCQnXG4gICwgJ2cnKTtcblxuICB0ZXh0LnJlcGxhY2UocmVEZWxpbWl0ZXJzLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlVmFsdWUsIGludGVycG9sYXRlVmFsdWUsIGVzVGVtcGxhdGVWYWx1ZSwgZXZhbHVhdGVWYWx1ZSwgb2Zmc2V0KSB7XG4gICAgaW50ZXJwb2xhdGVWYWx1ZSB8fCAoaW50ZXJwb2xhdGVWYWx1ZSA9IGVzVGVtcGxhdGVWYWx1ZSk7XG5cbiAgICAvLyBlc2NhcGUgY2hhcmFjdGVycyB0aGF0IGNhbm5vdCBiZSBpbmNsdWRlZCBpbiBzdHJpbmcgbGl0ZXJhbHNcbiAgICBzb3VyY2UgKz0gdGV4dC5zbGljZShpbmRleCwgb2Zmc2V0KS5yZXBsYWNlKHJlVW5lc2NhcGVkU3RyaW5nLCBlc2NhcGVTdHJpbmdDaGFyKTtcblxuICAgIC8vIHJlcGxhY2UgZGVsaW1pdGVycyB3aXRoIHNuaXBwZXRzXG4gICAgaWYgKGVzY2FwZVZhbHVlKSB7XG4gICAgICBzb3VyY2UgKz0gXCInICtcXG5fX2UoXCIgKyBlc2NhcGVWYWx1ZSArIFwiKSArXFxuJ1wiO1xuICAgIH1cbiAgICBpZiAoZXZhbHVhdGVWYWx1ZSkge1xuICAgICAgaXNFdmFsdWF0aW5nID0gdHJ1ZTtcbiAgICAgIHNvdXJjZSArPSBcIic7XFxuXCIgKyBldmFsdWF0ZVZhbHVlICsgXCI7XFxuX19wICs9ICdcIjtcbiAgICB9XG4gICAgaWYgKGludGVycG9sYXRlVmFsdWUpIHtcbiAgICAgIHNvdXJjZSArPSBcIicgK1xcbigoX190ID0gKFwiICsgaW50ZXJwb2xhdGVWYWx1ZSArIFwiKSkgPT0gbnVsbCA/ICcnIDogX190KSArXFxuJ1wiO1xuICAgIH1cbiAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcblxuICAgIC8vIHRoZSBKUyBlbmdpbmUgZW1iZWRkZWQgaW4gQWRvYmUgcHJvZHVjdHMgcmVxdWlyZXMgcmV0dXJuaW5nIHRoZSBgbWF0Y2hgXG4gICAgLy8gc3RyaW5nIGluIG9yZGVyIHRvIHByb2R1Y2UgdGhlIGNvcnJlY3QgYG9mZnNldGAgdmFsdWVcbiAgICByZXR1cm4gbWF0Y2g7XG4gIH0pO1xuXG4gIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgLy8gaWYgYHZhcmlhYmxlYCBpcyBub3Qgc3BlY2lmaWVkLCB3cmFwIGEgd2l0aC1zdGF0ZW1lbnQgYXJvdW5kIHRoZSBnZW5lcmF0ZWRcbiAgLy8gY29kZSB0byBhZGQgdGhlIGRhdGEgb2JqZWN0IHRvIHRoZSB0b3Agb2YgdGhlIHNjb3BlIGNoYWluXG4gIHZhciB2YXJpYWJsZSA9IG9wdGlvbnMudmFyaWFibGUsXG4gICAgICBoYXNWYXJpYWJsZSA9IHZhcmlhYmxlO1xuXG4gIGlmICghaGFzVmFyaWFibGUpIHtcbiAgICB2YXJpYWJsZSA9ICdvYmonO1xuICAgIHNvdXJjZSA9ICd3aXRoICgnICsgdmFyaWFibGUgKyAnKSB7XFxuJyArIHNvdXJjZSArICdcXG59XFxuJztcbiAgfVxuICAvLyBjbGVhbnVwIGNvZGUgYnkgc3RyaXBwaW5nIGVtcHR5IHN0cmluZ3NcbiAgc291cmNlID0gKGlzRXZhbHVhdGluZyA/IHNvdXJjZS5yZXBsYWNlKHJlRW1wdHlTdHJpbmdMZWFkaW5nLCAnJykgOiBzb3VyY2UpXG4gICAgLnJlcGxhY2UocmVFbXB0eVN0cmluZ01pZGRsZSwgJyQxJylcbiAgICAucmVwbGFjZShyZUVtcHR5U3RyaW5nVHJhaWxpbmcsICckMTsnKTtcblxuICAvLyBmcmFtZSBjb2RlIGFzIHRoZSBmdW5jdGlvbiBib2R5XG4gIHNvdXJjZSA9ICdmdW5jdGlvbignICsgdmFyaWFibGUgKyAnKSB7XFxuJyArXG4gICAgKGhhc1ZhcmlhYmxlID8gJycgOiB2YXJpYWJsZSArICcgfHwgKCcgKyB2YXJpYWJsZSArICcgPSB7fSk7XFxuJykgK1xuICAgIFwidmFyIF9fdCwgX19wID0gJycsIF9fZSA9IF8uZXNjYXBlXCIgK1xuICAgIChpc0V2YWx1YXRpbmdcbiAgICAgID8gJywgX19qID0gQXJyYXkucHJvdG90eXBlLmpvaW47XFxuJyArXG4gICAgICAgIFwiZnVuY3Rpb24gcHJpbnQoKSB7IF9fcCArPSBfX2ouY2FsbChhcmd1bWVudHMsICcnKSB9XFxuXCJcbiAgICAgIDogJztcXG4nXG4gICAgKSArXG4gICAgc291cmNlICtcbiAgICAncmV0dXJuIF9fcFxcbn0nO1xuXG4gIHRyeSB7XG4gICAgdmFyIHJlc3VsdCA9IEZ1bmN0aW9uKGltcG9ydHNLZXlzLCAncmV0dXJuICcgKyBzb3VyY2UgKS5hcHBseSh1bmRlZmluZWQsIGltcG9ydHNWYWx1ZXMpO1xuICB9IGNhdGNoKGUpIHtcbiAgICBlLnNvdXJjZSA9IHNvdXJjZTtcbiAgICB0aHJvdyBlO1xuICB9XG4gIGlmIChkYXRhKSB7XG4gICAgcmV0dXJuIHJlc3VsdChkYXRhKTtcbiAgfVxuICAvLyBwcm92aWRlIHRoZSBjb21waWxlZCBmdW5jdGlvbidzIHNvdXJjZSBieSBpdHMgYHRvU3RyaW5nYCBtZXRob2QsIGluXG4gIC8vIHN1cHBvcnRlZCBlbnZpcm9ubWVudHMsIG9yIHRoZSBgc291cmNlYCBwcm9wZXJ0eSBhcyBhIGNvbnZlbmllbmNlIGZvclxuICAvLyBpbmxpbmluZyBjb21waWxlZCB0ZW1wbGF0ZXMgZHVyaW5nIHRoZSBidWlsZCBwcm9jZXNzXG4gIHJlc3VsdC5zb3VyY2UgPSBzb3VyY2U7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogVXNlZCB0byBlc2NhcGUgY2hhcmFjdGVycyBmb3IgaW5jbHVzaW9uIGluIGNvbXBpbGVkIHN0cmluZyBsaXRlcmFscyAqL1xudmFyIHN0cmluZ0VzY2FwZXMgPSB7XG4gICdcXFxcJzogJ1xcXFwnLFxuICBcIidcIjogXCInXCIsXG4gICdcXG4nOiAnbicsXG4gICdcXHInOiAncicsXG4gICdcXHQnOiAndCcsXG4gICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgJ1xcdTIwMjknOiAndTIwMjknXG59O1xuXG4vKipcbiAqIFVzZWQgYnkgYHRlbXBsYXRlYCB0byBlc2NhcGUgY2hhcmFjdGVycyBmb3IgaW5jbHVzaW9uIGluIGNvbXBpbGVkXG4gKiBzdHJpbmcgbGl0ZXJhbHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBtYXRjaCBUaGUgbWF0Y2hlZCBjaGFyYWN0ZXIgdG8gZXNjYXBlLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBjaGFyYWN0ZXIuXG4gKi9cbmZ1bmN0aW9uIGVzY2FwZVN0cmluZ0NoYXIobWF0Y2gpIHtcbiAgcmV0dXJuICdcXFxcJyArIHN0cmluZ0VzY2FwZXNbbWF0Y2hdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVzY2FwZVN0cmluZ0NoYXI7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogVXNlZCB0byBtYXRjaCBcImludGVycG9sYXRlXCIgdGVtcGxhdGUgZGVsaW1pdGVycyAqL1xudmFyIHJlSW50ZXJwb2xhdGUgPSAvPCU9KFtcXHNcXFNdKz8pJT4vZztcblxubW9kdWxlLmV4cG9ydHMgPSByZUludGVycG9sYXRlO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBrZXlzID0gcmVxdWlyZSgnbG9kYXNoLmtleXMnKSxcbiAgICBvYmplY3RUeXBlcyA9IHJlcXVpcmUoJ2xvZGFzaC5fb2JqZWN0dHlwZXMnKTtcblxuLyoqXG4gKiBBc3NpZ25zIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb2Ygc291cmNlIG9iamVjdChzKSB0byB0aGUgZGVzdGluYXRpb25cbiAqIG9iamVjdCBmb3IgYWxsIGRlc3RpbmF0aW9uIHByb3BlcnRpZXMgdGhhdCByZXNvbHZlIHRvIGB1bmRlZmluZWRgLiBPbmNlIGFcbiAqIHByb3BlcnR5IGlzIHNldCwgYWRkaXRpb25hbCBkZWZhdWx0cyBvZiB0aGUgc2FtZSBwcm9wZXJ0eSB3aWxsIGJlIGlnbm9yZWQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEB0eXBlIEZ1bmN0aW9uXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHsuLi5PYmplY3R9IFtzb3VyY2VdIFRoZSBzb3VyY2Ugb2JqZWN0cy5cbiAqIEBwYXJhbS0ge09iamVjdH0gW2d1YXJkXSBBbGxvd3Mgd29ya2luZyB3aXRoIGBfLnJlZHVjZWAgd2l0aG91dCB1c2luZyBpdHNcbiAqICBga2V5YCBhbmQgYG9iamVjdGAgYXJndW1lbnRzIGFzIHNvdXJjZXMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICduYW1lJzogJ2Jhcm5leScgfTtcbiAqIF8uZGVmYXVsdHMob2JqZWN0LCB7ICduYW1lJzogJ2ZyZWQnLCAnZW1wbG95ZXInOiAnc2xhdGUnIH0pO1xuICogLy8gPT4geyAnbmFtZSc6ICdiYXJuZXknLCAnZW1wbG95ZXInOiAnc2xhdGUnIH1cbiAqL1xudmFyIGRlZmF1bHRzID0gZnVuY3Rpb24ob2JqZWN0LCBzb3VyY2UsIGd1YXJkKSB7XG4gIHZhciBpbmRleCwgaXRlcmFibGUgPSBvYmplY3QsIHJlc3VsdCA9IGl0ZXJhYmxlO1xuICBpZiAoIWl0ZXJhYmxlKSByZXR1cm4gcmVzdWx0O1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgIGFyZ3NJbmRleCA9IDAsXG4gICAgICBhcmdzTGVuZ3RoID0gdHlwZW9mIGd1YXJkID09ICdudW1iZXInID8gMiA6IGFyZ3MubGVuZ3RoO1xuICB3aGlsZSAoKythcmdzSW5kZXggPCBhcmdzTGVuZ3RoKSB7XG4gICAgaXRlcmFibGUgPSBhcmdzW2FyZ3NJbmRleF07XG4gICAgaWYgKGl0ZXJhYmxlICYmIG9iamVjdFR5cGVzW3R5cGVvZiBpdGVyYWJsZV0pIHtcbiAgICB2YXIgb3duSW5kZXggPSAtMSxcbiAgICAgICAgb3duUHJvcHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdICYmIGtleXMoaXRlcmFibGUpLFxuICAgICAgICBsZW5ndGggPSBvd25Qcm9wcyA/IG93blByb3BzLmxlbmd0aCA6IDA7XG5cbiAgICB3aGlsZSAoKytvd25JbmRleCA8IGxlbmd0aCkge1xuICAgICAgaW5kZXggPSBvd25Qcm9wc1tvd25JbmRleF07XG4gICAgICBpZiAodHlwZW9mIHJlc3VsdFtpbmRleF0gPT0gJ3VuZGVmaW5lZCcpIHJlc3VsdFtpbmRleF0gPSBpdGVyYWJsZVtpbmRleF07XG4gICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBlc2NhcGVIdG1sQ2hhciA9IHJlcXVpcmUoJ2xvZGFzaC5fZXNjYXBlaHRtbGNoYXInKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnbG9kYXNoLmtleXMnKSxcbiAgICByZVVuZXNjYXBlZEh0bWwgPSByZXF1aXJlKCdsb2Rhc2guX3JldW5lc2NhcGVkaHRtbCcpO1xuXG4vKipcbiAqIENvbnZlcnRzIHRoZSBjaGFyYWN0ZXJzIGAmYCwgYDxgLCBgPmAsIGBcImAsIGFuZCBgJ2AgaW4gYHN0cmluZ2AgdG8gdGhlaXJcbiAqIGNvcnJlc3BvbmRpbmcgSFRNTCBlbnRpdGllcy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmVzY2FwZSgnRnJlZCwgV2lsbWEsICYgUGViYmxlcycpO1xuICogLy8gPT4gJ0ZyZWQsIFdpbG1hLCAmYW1wOyBQZWJibGVzJ1xuICovXG5mdW5jdGlvbiBlc2NhcGUoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcgPT0gbnVsbCA/ICcnIDogU3RyaW5nKHN0cmluZykucmVwbGFjZShyZVVuZXNjYXBlZEh0bWwsIGVzY2FwZUh0bWxDaGFyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlc2NhcGU7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGh0bWxFc2NhcGVzID0gcmVxdWlyZSgnbG9kYXNoLl9odG1sZXNjYXBlcycpO1xuXG4vKipcbiAqIFVzZWQgYnkgYGVzY2FwZWAgdG8gY29udmVydCBjaGFyYWN0ZXJzIHRvIEhUTUwgZW50aXRpZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBtYXRjaCBUaGUgbWF0Y2hlZCBjaGFyYWN0ZXIgdG8gZXNjYXBlLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBjaGFyYWN0ZXIuXG4gKi9cbmZ1bmN0aW9uIGVzY2FwZUh0bWxDaGFyKG1hdGNoKSB7XG4gIHJldHVybiBodG1sRXNjYXBlc1ttYXRjaF07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXNjYXBlSHRtbENoYXI7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKipcbiAqIFVzZWQgdG8gY29udmVydCBjaGFyYWN0ZXJzIHRvIEhUTUwgZW50aXRpZXM6XG4gKlxuICogVGhvdWdoIHRoZSBgPmAgY2hhcmFjdGVyIGlzIGVzY2FwZWQgZm9yIHN5bW1ldHJ5LCBjaGFyYWN0ZXJzIGxpa2UgYD5gIGFuZCBgL2BcbiAqIGRvbid0IHJlcXVpcmUgZXNjYXBpbmcgaW4gSFRNTCBhbmQgaGF2ZSBubyBzcGVjaWFsIG1lYW5pbmcgdW5sZXNzIHRoZXkncmUgcGFydFxuICogb2YgYSB0YWcgb3IgYW4gdW5xdW90ZWQgYXR0cmlidXRlIHZhbHVlLlxuICogaHR0cDovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvYW1iaWd1b3VzLWFtcGVyc2FuZHMgKHVuZGVyIFwic2VtaS1yZWxhdGVkIGZ1biBmYWN0XCIpXG4gKi9cbnZhciBodG1sRXNjYXBlcyA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnLFxuICBcIidcIjogJyYjMzk7J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBodG1sRXNjYXBlcztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgaHRtbEVzY2FwZXMgPSByZXF1aXJlKCdsb2Rhc2guX2h0bWxlc2NhcGVzJyksXG4gICAga2V5cyA9IHJlcXVpcmUoJ2xvZGFzaC5rZXlzJyk7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIEhUTUwgZW50aXRpZXMgYW5kIEhUTUwgY2hhcmFjdGVycyAqL1xudmFyIHJlVW5lc2NhcGVkSHRtbCA9IFJlZ0V4cCgnWycgKyBrZXlzKGh0bWxFc2NhcGVzKS5qb2luKCcnKSArICddJywgJ2cnKTtcblxubW9kdWxlLmV4cG9ydHMgPSByZVVuZXNjYXBlZEh0bWw7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGVzY2FwZSA9IHJlcXVpcmUoJ2xvZGFzaC5lc2NhcGUnKSxcbiAgICByZUludGVycG9sYXRlID0gcmVxdWlyZSgnbG9kYXNoLl9yZWludGVycG9sYXRlJyk7XG5cbi8qKlxuICogQnkgZGVmYXVsdCwgdGhlIHRlbXBsYXRlIGRlbGltaXRlcnMgdXNlZCBieSBMby1EYXNoIGFyZSBzaW1pbGFyIHRvIHRob3NlIGluXG4gKiBlbWJlZGRlZCBSdWJ5IChFUkIpLiBDaGFuZ2UgdGhlIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmVcbiAqIGRlbGltaXRlcnMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEB0eXBlIE9iamVjdFxuICovXG52YXIgdGVtcGxhdGVTZXR0aW5ncyA9IHtcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgYGRhdGFgIHByb3BlcnR5IHZhbHVlcyB0byBiZSBIVE1MLWVzY2FwZWQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUgUmVnRXhwXG4gICAqL1xuICAnZXNjYXBlJzogLzwlLShbXFxzXFxTXSs/KSU+L2csXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZGV0ZWN0IGNvZGUgdG8gYmUgZXZhbHVhdGVkLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIFJlZ0V4cFxuICAgKi9cbiAgJ2V2YWx1YXRlJzogLzwlKFtcXHNcXFNdKz8pJT4vZyxcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgYGRhdGFgIHByb3BlcnR5IHZhbHVlcyB0byBpbmplY3QuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUgUmVnRXhwXG4gICAqL1xuICAnaW50ZXJwb2xhdGUnOiByZUludGVycG9sYXRlLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIHJlZmVyZW5jZSB0aGUgZGF0YSBvYmplY3QgaW4gdGhlIHRlbXBsYXRlIHRleHQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUgc3RyaW5nXG4gICAqL1xuICAndmFyaWFibGUnOiAnJyxcblxuICAvKipcbiAgICogVXNlZCB0byBpbXBvcnQgdmFyaWFibGVzIGludG8gdGhlIGNvbXBpbGVkIHRlbXBsYXRlLlxuICAgKlxuICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAqIEB0eXBlIE9iamVjdFxuICAgKi9cbiAgJ2ltcG9ydHMnOiB7XG5cbiAgICAvKipcbiAgICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgYGxvZGFzaGAgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzLmltcG9ydHNcbiAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAqL1xuICAgICdfJzogeyAnZXNjYXBlJzogZXNjYXBlIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZVNldHRpbmdzO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBrZXlzID0gcmVxdWlyZSgnbG9kYXNoLmtleXMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IGNvbXBvc2VkIG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSB2YWx1ZXMgb2YgYG9iamVjdGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBwcm9wZXJ0eSB2YWx1ZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udmFsdWVzKHsgJ29uZSc6IDEsICd0d28nOiAyLCAndGhyZWUnOiAzIH0pO1xuICogLy8gPT4gWzEsIDIsIDNdIChwcm9wZXJ0eSBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCBhY3Jvc3MgZW52aXJvbm1lbnRzKVxuICovXG5mdW5jdGlvbiB2YWx1ZXMob2JqZWN0KSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcHJvcHMgPSBrZXlzKG9iamVjdCksXG4gICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IG9iamVjdFtwcm9wc1tpbmRleF1dO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdmFsdWVzO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqIFVzZWQgdG8gZ2VuZXJhdGUgdW5pcXVlIElEcyAqL1xudmFyIGlkQ291bnRlciA9IDA7XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgdW5pcXVlIElELiBJZiBgcHJlZml4YCBpcyBwcm92aWRlZCB0aGUgSUQgd2lsbCBiZSBhcHBlbmRlZCB0byBpdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICogQHBhcmFtIHtzdHJpbmd9IFtwcmVmaXhdIFRoZSB2YWx1ZSB0byBwcmVmaXggdGhlIElEIHdpdGguXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSB1bmlxdWUgSUQuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udW5pcXVlSWQoJ2NvbnRhY3RfJyk7XG4gKiAvLyA9PiAnY29udGFjdF8xMDQnXG4gKlxuICogXy51bmlxdWVJZCgpO1xuICogLy8gPT4gJzEwNSdcbiAqL1xuZnVuY3Rpb24gdW5pcXVlSWQocHJlZml4KSB7XG4gIHZhciBpZCA9ICsraWRDb3VudGVyO1xuICByZXR1cm4gU3RyaW5nKHByZWZpeCA9PSBudWxsID8gJycgOiBwcmVmaXgpICsgaWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdW5pcXVlSWQ7XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDE0IEZlbGl4IEduYXNzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuKGZ1bmN0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblxuICAvKiBDb21tb25KUyAqL1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcpICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKVxuXG4gIC8qIEFNRCBtb2R1bGUgKi9cbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShmYWN0b3J5KVxuXG4gIC8qIEJyb3dzZXIgZ2xvYmFsICovXG4gIGVsc2Ugcm9vdC5TcGlubmVyID0gZmFjdG9yeSgpXG59XG4odGhpcywgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBwcmVmaXhlcyA9IFsnd2Via2l0JywgJ01veicsICdtcycsICdPJ10gLyogVmVuZG9yIHByZWZpeGVzICovXG4gICAgLCBhbmltYXRpb25zID0ge30gLyogQW5pbWF0aW9uIHJ1bGVzIGtleWVkIGJ5IHRoZWlyIG5hbWUgKi9cbiAgICAsIHVzZUNzc0FuaW1hdGlvbnMgLyogV2hldGhlciB0byB1c2UgQ1NTIGFuaW1hdGlvbnMgb3Igc2V0VGltZW91dCAqL1xuXG4gIC8qKlxuICAgKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBlbGVtZW50cy4gSWYgbm8gdGFnIG5hbWUgaXMgZ2l2ZW4sXG4gICAqIGEgRElWIGlzIGNyZWF0ZWQuIE9wdGlvbmFsbHkgcHJvcGVydGllcyBjYW4gYmUgcGFzc2VkLlxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlRWwodGFnLCBwcm9wKSB7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcgfHwgJ2RpdicpXG4gICAgICAsIG5cblxuICAgIGZvcihuIGluIHByb3ApIGVsW25dID0gcHJvcFtuXVxuICAgIHJldHVybiBlbFxuICB9XG5cbiAgLyoqXG4gICAqIEFwcGVuZHMgY2hpbGRyZW4gYW5kIHJldHVybnMgdGhlIHBhcmVudC5cbiAgICovXG4gIGZ1bmN0aW9uIGlucyhwYXJlbnQgLyogY2hpbGQxLCBjaGlsZDIsIC4uLiovKSB7XG4gICAgZm9yICh2YXIgaT0xLCBuPWFyZ3VtZW50cy5sZW5ndGg7IGk8bjsgaSsrKVxuICAgICAgcGFyZW50LmFwcGVuZENoaWxkKGFyZ3VtZW50c1tpXSlcblxuICAgIHJldHVybiBwYXJlbnRcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYSBuZXcgc3R5bGVzaGVldCB0byBob2xkIHRoZSBAa2V5ZnJhbWUgb3IgVk1MIHJ1bGVzLlxuICAgKi9cbiAgdmFyIHNoZWV0ID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbCA9IGNyZWF0ZUVsKCdzdHlsZScsIHt0eXBlIDogJ3RleHQvY3NzJ30pXG4gICAgaW5zKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0sIGVsKVxuICAgIHJldHVybiBlbC5zaGVldCB8fCBlbC5zdHlsZVNoZWV0XG4gIH0oKSlcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBvcGFjaXR5IGtleWZyYW1lIGFuaW1hdGlvbiBydWxlIGFuZCByZXR1cm5zIGl0cyBuYW1lLlxuICAgKiBTaW5jZSBtb3N0IG1vYmlsZSBXZWJraXRzIGhhdmUgdGltaW5nIGlzc3VlcyB3aXRoIGFuaW1hdGlvbi1kZWxheSxcbiAgICogd2UgY3JlYXRlIHNlcGFyYXRlIHJ1bGVzIGZvciBlYWNoIGxpbmUvc2VnbWVudC5cbiAgICovXG4gIGZ1bmN0aW9uIGFkZEFuaW1hdGlvbihhbHBoYSwgdHJhaWwsIGksIGxpbmVzKSB7XG4gICAgdmFyIG5hbWUgPSBbJ29wYWNpdHknLCB0cmFpbCwgfn4oYWxwaGEqMTAwKSwgaSwgbGluZXNdLmpvaW4oJy0nKVxuICAgICAgLCBzdGFydCA9IDAuMDEgKyBpL2xpbmVzICogMTAwXG4gICAgICAsIHogPSBNYXRoLm1heCgxIC0gKDEtYWxwaGEpIC8gdHJhaWwgKiAoMTAwLXN0YXJ0KSwgYWxwaGEpXG4gICAgICAsIHByZWZpeCA9IHVzZUNzc0FuaW1hdGlvbnMuc3Vic3RyaW5nKDAsIHVzZUNzc0FuaW1hdGlvbnMuaW5kZXhPZignQW5pbWF0aW9uJykpLnRvTG93ZXJDYXNlKClcbiAgICAgICwgcHJlID0gcHJlZml4ICYmICctJyArIHByZWZpeCArICctJyB8fCAnJ1xuXG4gICAgaWYgKCFhbmltYXRpb25zW25hbWVdKSB7XG4gICAgICBzaGVldC5pbnNlcnRSdWxlKFxuICAgICAgICAnQCcgKyBwcmUgKyAna2V5ZnJhbWVzICcgKyBuYW1lICsgJ3snICtcbiAgICAgICAgJzAle29wYWNpdHk6JyArIHogKyAnfScgK1xuICAgICAgICBzdGFydCArICcle29wYWNpdHk6JyArIGFscGhhICsgJ30nICtcbiAgICAgICAgKHN0YXJ0KzAuMDEpICsgJyV7b3BhY2l0eToxfScgK1xuICAgICAgICAoc3RhcnQrdHJhaWwpICUgMTAwICsgJyV7b3BhY2l0eTonICsgYWxwaGEgKyAnfScgK1xuICAgICAgICAnMTAwJXtvcGFjaXR5OicgKyB6ICsgJ30nICtcbiAgICAgICAgJ30nLCBzaGVldC5jc3NSdWxlcy5sZW5ndGgpXG5cbiAgICAgIGFuaW1hdGlvbnNbbmFtZV0gPSAxXG4gICAgfVxuXG4gICAgcmV0dXJuIG5hbWVcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmllcyB2YXJpb3VzIHZlbmRvciBwcmVmaXhlcyBhbmQgcmV0dXJucyB0aGUgZmlyc3Qgc3VwcG9ydGVkIHByb3BlcnR5LlxuICAgKi9cbiAgZnVuY3Rpb24gdmVuZG9yKGVsLCBwcm9wKSB7XG4gICAgdmFyIHMgPSBlbC5zdHlsZVxuICAgICAgLCBwcFxuICAgICAgLCBpXG5cbiAgICBwcm9wID0gcHJvcC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHByb3Auc2xpY2UoMSlcbiAgICBmb3IoaT0wOyBpPHByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwcCA9IHByZWZpeGVzW2ldK3Byb3BcbiAgICAgIGlmKHNbcHBdICE9PSB1bmRlZmluZWQpIHJldHVybiBwcFxuICAgIH1cbiAgICBpZihzW3Byb3BdICE9PSB1bmRlZmluZWQpIHJldHVybiBwcm9wXG4gIH1cblxuICAvKipcbiAgICogU2V0cyBtdWx0aXBsZSBzdHlsZSBwcm9wZXJ0aWVzIGF0IG9uY2UuXG4gICAqL1xuICBmdW5jdGlvbiBjc3MoZWwsIHByb3ApIHtcbiAgICBmb3IgKHZhciBuIGluIHByb3ApXG4gICAgICBlbC5zdHlsZVt2ZW5kb3IoZWwsIG4pfHxuXSA9IHByb3Bbbl1cblxuICAgIHJldHVybiBlbFxuICB9XG5cbiAgLyoqXG4gICAqIEZpbGxzIGluIGRlZmF1bHQgdmFsdWVzLlxuICAgKi9cbiAgZnVuY3Rpb24gbWVyZ2Uob2JqKSB7XG4gICAgZm9yICh2YXIgaT0xOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGVmID0gYXJndW1lbnRzW2ldXG4gICAgICBmb3IgKHZhciBuIGluIGRlZilcbiAgICAgICAgaWYgKG9ialtuXSA9PT0gdW5kZWZpbmVkKSBvYmpbbl0gPSBkZWZbbl1cbiAgICB9XG4gICAgcmV0dXJuIG9ialxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFic29sdXRlIHBhZ2Utb2Zmc2V0IG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgKi9cbiAgZnVuY3Rpb24gcG9zKGVsKSB7XG4gICAgdmFyIG8gPSB7IHg6ZWwub2Zmc2V0TGVmdCwgeTplbC5vZmZzZXRUb3AgfVxuICAgIHdoaWxlKChlbCA9IGVsLm9mZnNldFBhcmVudCkpXG4gICAgICBvLngrPWVsLm9mZnNldExlZnQsIG8ueSs9ZWwub2Zmc2V0VG9wXG5cbiAgICByZXR1cm4gb1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGxpbmUgY29sb3IgZnJvbSB0aGUgZ2l2ZW4gc3RyaW5nIG9yIGFycmF5LlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0Q29sb3IoY29sb3IsIGlkeCkge1xuICAgIHJldHVybiB0eXBlb2YgY29sb3IgPT0gJ3N0cmluZycgPyBjb2xvciA6IGNvbG9yW2lkeCAlIGNvbG9yLmxlbmd0aF1cbiAgfVxuXG4gIC8vIEJ1aWx0LWluIGRlZmF1bHRzXG5cbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIGxpbmVzOiAxMiwgICAgICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICBsZW5ndGg6IDcsICAgICAgICAgICAgLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcbiAgICB3aWR0aDogNSwgICAgICAgICAgICAgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgcmFkaXVzOiAxMCwgICAgICAgICAgIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxuICAgIHJvdGF0ZTogMCwgICAgICAgICAgICAvLyBSb3RhdGlvbiBvZmZzZXRcbiAgICBjb3JuZXJzOiAxLCAgICAgICAgICAgLy8gUm91bmRuZXNzICgwLi4xKVxuICAgIGNvbG9yOiAnIzAwMCcsICAgICAgICAvLyAjcmdiIG9yICNycmdnYmJcbiAgICBkaXJlY3Rpb246IDEsICAgICAgICAgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxuICAgIHNwZWVkOiAxLCAgICAgICAgICAgICAvLyBSb3VuZHMgcGVyIHNlY29uZFxuICAgIHRyYWlsOiAxMDAsICAgICAgICAgICAvLyBBZnRlcmdsb3cgcGVyY2VudGFnZVxuICAgIG9wYWNpdHk6IDEvNCwgICAgICAgICAvLyBPcGFjaXR5IG9mIHRoZSBsaW5lc1xuICAgIGZwczogMjAsICAgICAgICAgICAgICAvLyBGcmFtZXMgcGVyIHNlY29uZCB3aGVuIHVzaW5nIHNldFRpbWVvdXQoKVxuICAgIHpJbmRleDogMmU5LCAgICAgICAgICAvLyBVc2UgYSBoaWdoIHotaW5kZXggYnkgZGVmYXVsdFxuICAgIGNsYXNzTmFtZTogJ3NwaW5uZXInLCAvLyBDU1MgY2xhc3MgdG8gYXNzaWduIHRvIHRoZSBlbGVtZW50XG4gICAgdG9wOiAnNTAlJywgICAgICAgICAgIC8vIGNlbnRlciB2ZXJ0aWNhbGx5XG4gICAgbGVmdDogJzUwJScsICAgICAgICAgIC8vIGNlbnRlciBob3Jpem9udGFsbHlcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyAgLy8gZWxlbWVudCBwb3NpdGlvblxuICB9XG5cbiAgLyoqIFRoZSBjb25zdHJ1Y3RvciAqL1xuICBmdW5jdGlvbiBTcGlubmVyKG8pIHtcbiAgICB0aGlzLm9wdHMgPSBtZXJnZShvIHx8IHt9LCBTcGlubmVyLmRlZmF1bHRzLCBkZWZhdWx0cylcbiAgfVxuXG4gIC8vIEdsb2JhbCBkZWZhdWx0cyB0aGF0IG92ZXJyaWRlIHRoZSBidWlsdC1pbnM6XG4gIFNwaW5uZXIuZGVmYXVsdHMgPSB7fVxuXG4gIG1lcmdlKFNwaW5uZXIucHJvdG90eXBlLCB7XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBzcGlubmVyIHRvIHRoZSBnaXZlbiB0YXJnZXQgZWxlbWVudC4gSWYgdGhpcyBpbnN0YW5jZSBpcyBhbHJlYWR5XG4gICAgICogc3Bpbm5pbmcsIGl0IGlzIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZCBmcm9tIGl0cyBwcmV2aW91cyB0YXJnZXQgYiBjYWxsaW5nXG4gICAgICogc3RvcCgpIGludGVybmFsbHkuXG4gICAgICovXG4gICAgc3BpbjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICB0aGlzLnN0b3AoKVxuXG4gICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgLCBvID0gc2VsZi5vcHRzXG4gICAgICAgICwgZWwgPSBzZWxmLmVsID0gY3NzKGNyZWF0ZUVsKDAsIHtjbGFzc05hbWU6IG8uY2xhc3NOYW1lfSksIHtwb3NpdGlvbjogby5wb3NpdGlvbiwgd2lkdGg6IDAsIHpJbmRleDogby56SW5kZXh9KVxuICAgICAgICAsIG1pZCA9IG8ucmFkaXVzK28ubGVuZ3RoK28ud2lkdGhcblxuICAgICAgY3NzKGVsLCB7XG4gICAgICAgIGxlZnQ6IG8ubGVmdCxcbiAgICAgICAgdG9wOiBvLnRvcFxuICAgICAgfSlcbiAgICAgICAgXG4gICAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgIHRhcmdldC5pbnNlcnRCZWZvcmUoZWwsIHRhcmdldC5maXJzdENoaWxkfHxudWxsKVxuICAgICAgfVxuXG4gICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAncHJvZ3Jlc3NiYXInKVxuICAgICAgc2VsZi5saW5lcyhlbCwgc2VsZi5vcHRzKVxuXG4gICAgICBpZiAoIXVzZUNzc0FuaW1hdGlvbnMpIHtcbiAgICAgICAgLy8gTm8gQ1NTIGFuaW1hdGlvbiBzdXBwb3J0LCB1c2Ugc2V0VGltZW91dCgpIGluc3RlYWRcbiAgICAgICAgdmFyIGkgPSAwXG4gICAgICAgICAgLCBzdGFydCA9IChvLmxpbmVzIC0gMSkgKiAoMSAtIG8uZGlyZWN0aW9uKSAvIDJcbiAgICAgICAgICAsIGFscGhhXG4gICAgICAgICAgLCBmcHMgPSBvLmZwc1xuICAgICAgICAgICwgZiA9IGZwcy9vLnNwZWVkXG4gICAgICAgICAgLCBvc3RlcCA9ICgxLW8ub3BhY2l0eSkgLyAoZipvLnRyYWlsIC8gMTAwKVxuICAgICAgICAgICwgYXN0ZXAgPSBmL28ubGluZXNcblxuICAgICAgICA7KGZ1bmN0aW9uIGFuaW0oKSB7XG4gICAgICAgICAgaSsrO1xuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgby5saW5lczsgaisrKSB7XG4gICAgICAgICAgICBhbHBoYSA9IE1hdGgubWF4KDEgLSAoaSArIChvLmxpbmVzIC0gaikgKiBhc3RlcCkgJSBmICogb3N0ZXAsIG8ub3BhY2l0eSlcblxuICAgICAgICAgICAgc2VsZi5vcGFjaXR5KGVsLCBqICogby5kaXJlY3Rpb24gKyBzdGFydCwgYWxwaGEsIG8pXG4gICAgICAgICAgfVxuICAgICAgICAgIHNlbGYudGltZW91dCA9IHNlbGYuZWwgJiYgc2V0VGltZW91dChhbmltLCB+figxMDAwL2ZwcykpXG4gICAgICAgIH0pKClcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZWxmXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0b3BzIGFuZCByZW1vdmVzIHRoZSBTcGlubmVyLlxuICAgICAqL1xuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGVsID0gdGhpcy5lbFxuICAgICAgaWYgKGVsKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpXG4gICAgICAgIGlmIChlbC5wYXJlbnROb2RlKSBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKVxuICAgICAgICB0aGlzLmVsID0gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnRlcm5hbCBtZXRob2QgdGhhdCBkcmF3cyB0aGUgaW5kaXZpZHVhbCBsaW5lcy4gV2lsbCBiZSBvdmVyd3JpdHRlblxuICAgICAqIGluIFZNTCBmYWxsYmFjayBtb2RlIGJlbG93LlxuICAgICAqL1xuICAgIGxpbmVzOiBmdW5jdGlvbihlbCwgbykge1xuICAgICAgdmFyIGkgPSAwXG4gICAgICAgICwgc3RhcnQgPSAoby5saW5lcyAtIDEpICogKDEgLSBvLmRpcmVjdGlvbikgLyAyXG4gICAgICAgICwgc2VnXG5cbiAgICAgIGZ1bmN0aW9uIGZpbGwoY29sb3IsIHNoYWRvdykge1xuICAgICAgICByZXR1cm4gY3NzKGNyZWF0ZUVsKCksIHtcbiAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICB3aWR0aDogKG8ubGVuZ3RoK28ud2lkdGgpICsgJ3B4JyxcbiAgICAgICAgICBoZWlnaHQ6IG8ud2lkdGggKyAncHgnLFxuICAgICAgICAgIGJhY2tncm91bmQ6IGNvbG9yLFxuICAgICAgICAgIGJveFNoYWRvdzogc2hhZG93LFxuICAgICAgICAgIHRyYW5zZm9ybU9yaWdpbjogJ2xlZnQnLFxuICAgICAgICAgIHRyYW5zZm9ybTogJ3JvdGF0ZSgnICsgfn4oMzYwL28ubGluZXMqaStvLnJvdGF0ZSkgKyAnZGVnKSB0cmFuc2xhdGUoJyArIG8ucmFkaXVzKydweCcgKycsMCknLFxuICAgICAgICAgIGJvcmRlclJhZGl1czogKG8uY29ybmVycyAqIG8ud2lkdGg+PjEpICsgJ3B4J1xuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBmb3IgKDsgaSA8IG8ubGluZXM7IGkrKykge1xuICAgICAgICBzZWcgPSBjc3MoY3JlYXRlRWwoKSwge1xuICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgIHRvcDogMSt+KG8ud2lkdGgvMikgKyAncHgnLFxuICAgICAgICAgIHRyYW5zZm9ybTogby5od2FjY2VsID8gJ3RyYW5zbGF0ZTNkKDAsMCwwKScgOiAnJyxcbiAgICAgICAgICBvcGFjaXR5OiBvLm9wYWNpdHksXG4gICAgICAgICAgYW5pbWF0aW9uOiB1c2VDc3NBbmltYXRpb25zICYmIGFkZEFuaW1hdGlvbihvLm9wYWNpdHksIG8udHJhaWwsIHN0YXJ0ICsgaSAqIG8uZGlyZWN0aW9uLCBvLmxpbmVzKSArICcgJyArIDEvby5zcGVlZCArICdzIGxpbmVhciBpbmZpbml0ZSdcbiAgICAgICAgfSlcblxuICAgICAgICBpZiAoby5zaGFkb3cpIGlucyhzZWcsIGNzcyhmaWxsKCcjMDAwJywgJzAgMCA0cHggJyArICcjMDAwJyksIHt0b3A6IDIrJ3B4J30pKVxuICAgICAgICBpbnMoZWwsIGlucyhzZWcsIGZpbGwoZ2V0Q29sb3Ioby5jb2xvciwgaSksICcwIDAgMXB4IHJnYmEoMCwwLDAsLjEpJykpKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGVsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludGVybmFsIG1ldGhvZCB0aGF0IGFkanVzdHMgdGhlIG9wYWNpdHkgb2YgYSBzaW5nbGUgbGluZS5cbiAgICAgKiBXaWxsIGJlIG92ZXJ3cml0dGVuIGluIFZNTCBmYWxsYmFjayBtb2RlIGJlbG93LlxuICAgICAqL1xuICAgIG9wYWNpdHk6IGZ1bmN0aW9uKGVsLCBpLCB2YWwpIHtcbiAgICAgIGlmIChpIDwgZWwuY2hpbGROb2Rlcy5sZW5ndGgpIGVsLmNoaWxkTm9kZXNbaV0uc3R5bGUub3BhY2l0eSA9IHZhbFxuICAgIH1cblxuICB9KVxuXG5cbiAgZnVuY3Rpb24gaW5pdFZNTCgpIHtcblxuICAgIC8qIFV0aWxpdHkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgVk1MIHRhZyAqL1xuICAgIGZ1bmN0aW9uIHZtbCh0YWcsIGF0dHIpIHtcbiAgICAgIHJldHVybiBjcmVhdGVFbCgnPCcgKyB0YWcgKyAnIHhtbG5zPVwidXJuOnNjaGVtYXMtbWljcm9zb2Z0LmNvbTp2bWxcIiBjbGFzcz1cInNwaW4tdm1sXCI+JywgYXR0cilcbiAgICB9XG5cbiAgICAvLyBObyBDU1MgdHJhbnNmb3JtcyBidXQgVk1MIHN1cHBvcnQsIGFkZCBhIENTUyBydWxlIGZvciBWTUwgZWxlbWVudHM6XG4gICAgc2hlZXQuYWRkUnVsZSgnLnNwaW4tdm1sJywgJ2JlaGF2aW9yOnVybCgjZGVmYXVsdCNWTUwpJylcblxuICAgIFNwaW5uZXIucHJvdG90eXBlLmxpbmVzID0gZnVuY3Rpb24oZWwsIG8pIHtcbiAgICAgIHZhciByID0gby5sZW5ndGgrby53aWR0aFxuICAgICAgICAsIHMgPSAyKnJcblxuICAgICAgZnVuY3Rpb24gZ3JwKCkge1xuICAgICAgICByZXR1cm4gY3NzKFxuICAgICAgICAgIHZtbCgnZ3JvdXAnLCB7XG4gICAgICAgICAgICBjb29yZHNpemU6IHMgKyAnICcgKyBzLFxuICAgICAgICAgICAgY29vcmRvcmlnaW46IC1yICsgJyAnICsgLXJcbiAgICAgICAgICB9KSxcbiAgICAgICAgICB7IHdpZHRoOiBzLCBoZWlnaHQ6IHMgfVxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIHZhciBtYXJnaW4gPSAtKG8ud2lkdGgrby5sZW5ndGgpKjIgKyAncHgnXG4gICAgICAgICwgZyA9IGNzcyhncnAoKSwge3Bvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6IG1hcmdpbiwgbGVmdDogbWFyZ2lufSlcbiAgICAgICAgLCBpXG5cbiAgICAgIGZ1bmN0aW9uIHNlZyhpLCBkeCwgZmlsdGVyKSB7XG4gICAgICAgIGlucyhnLFxuICAgICAgICAgIGlucyhjc3MoZ3JwKCksIHtyb3RhdGlvbjogMzYwIC8gby5saW5lcyAqIGkgKyAnZGVnJywgbGVmdDogfn5keH0pLFxuICAgICAgICAgICAgaW5zKGNzcyh2bWwoJ3JvdW5kcmVjdCcsIHthcmNzaXplOiBvLmNvcm5lcnN9KSwge1xuICAgICAgICAgICAgICAgIHdpZHRoOiByLFxuICAgICAgICAgICAgICAgIGhlaWdodDogby53aWR0aCxcbiAgICAgICAgICAgICAgICBsZWZ0OiBvLnJhZGl1cyxcbiAgICAgICAgICAgICAgICB0b3A6IC1vLndpZHRoPj4xLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogZmlsdGVyXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICB2bWwoJ2ZpbGwnLCB7Y29sb3I6IGdldENvbG9yKG8uY29sb3IsIGkpLCBvcGFjaXR5OiBvLm9wYWNpdHl9KSxcbiAgICAgICAgICAgICAgdm1sKCdzdHJva2UnLCB7b3BhY2l0eTogMH0pIC8vIHRyYW5zcGFyZW50IHN0cm9rZSB0byBmaXggY29sb3IgYmxlZWRpbmcgdXBvbiBvcGFjaXR5IGNoYW5nZVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfVxuXG4gICAgICBpZiAoby5zaGFkb3cpXG4gICAgICAgIGZvciAoaSA9IDE7IGkgPD0gby5saW5lczsgaSsrKVxuICAgICAgICAgIHNlZyhpLCAtMiwgJ3Byb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5CbHVyKHBpeGVscmFkaXVzPTIsbWFrZXNoYWRvdz0xLHNoYWRvd29wYWNpdHk9LjMpJylcblxuICAgICAgZm9yIChpID0gMTsgaSA8PSBvLmxpbmVzOyBpKyspIHNlZyhpKVxuICAgICAgcmV0dXJuIGlucyhlbCwgZylcbiAgICB9XG5cbiAgICBTcGlubmVyLnByb3RvdHlwZS5vcGFjaXR5ID0gZnVuY3Rpb24oZWwsIGksIHZhbCwgbykge1xuICAgICAgdmFyIGMgPSBlbC5maXJzdENoaWxkXG4gICAgICBvID0gby5zaGFkb3cgJiYgby5saW5lcyB8fCAwXG4gICAgICBpZiAoYyAmJiBpK28gPCBjLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgIGMgPSBjLmNoaWxkTm9kZXNbaStvXTsgYyA9IGMgJiYgYy5maXJzdENoaWxkOyBjID0gYyAmJiBjLmZpcnN0Q2hpbGRcbiAgICAgICAgaWYgKGMpIGMub3BhY2l0eSA9IHZhbFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZhciBwcm9iZSA9IGNzcyhjcmVhdGVFbCgnZ3JvdXAnKSwge2JlaGF2aW9yOiAndXJsKCNkZWZhdWx0I1ZNTCknfSlcblxuICBpZiAoIXZlbmRvcihwcm9iZSwgJ3RyYW5zZm9ybScpICYmIHByb2JlLmFkaikgaW5pdFZNTCgpXG4gIGVsc2UgdXNlQ3NzQW5pbWF0aW9ucyA9IHZlbmRvcihwcm9iZSwgJ2FuaW1hdGlvbicpXG5cbiAgcmV0dXJuIFNwaW5uZXJcblxufSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcbnZhciBCbG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xuXG52YXIgQmxvY2tDb250cm9sID0gZnVuY3Rpb24odHlwZSkge1xuICB0aGlzLnR5cGUgPSB0eXBlO1xuICB0aGlzLmJsb2NrX3R5cGUgPSBCbG9ja3NbdGhpcy50eXBlXS5wcm90b3R5cGU7XG4gIHRoaXMuY2FuX2JlX3JlbmRlcmVkID0gdGhpcy5ibG9ja190eXBlLnRvb2xiYXJFbmFibGVkO1xuXG4gIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oQmxvY2tDb250cm9sLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vcmVuZGVyYWJsZScpLCByZXF1aXJlKCcuL2V2ZW50cycpLCB7XG5cbiAgdGFnTmFtZTogJ2EnLFxuICBjbGFzc05hbWU6IFwic3QtYmxvY2stY29udHJvbFwiLFxuXG4gIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAnZGF0YS10eXBlJzogdGhpcy5ibG9ja190eXBlLnR5cGVcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZWwuaHRtbCgnPHNwYW4gY2xhc3M9XCJzdC1pY29uXCI+JysgXy5yZXN1bHQodGhpcy5ibG9ja190eXBlLCAnaWNvbl9uYW1lJykgKyc8L3NwYW4+JyArIF8ucmVzdWx0KHRoaXMuYmxvY2tfdHlwZSwgJ3RpdGxlJykpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9ja0NvbnRyb2w7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAqIFNpclRyZXZvciBCbG9jayBDb250cm9sc1xuICogLS1cbiAqIEdpdmVzIGFuIGludGVyZmFjZSBmb3IgYWRkaW5nIG5ldyBTaXIgVHJldm9yIGJsb2Nrcy5cbiAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG5cbnZhciBCbG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIEJsb2NrQ29udHJvbCA9IHJlcXVpcmUoJy4vYmxvY2stY29udHJvbCcpO1xudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi9ldmVudC1idXMnKTtcblxudmFyIEJsb2NrQ29udHJvbHMgPSBmdW5jdGlvbihhdmFpbGFibGVfdHlwZXMsIG1lZGlhdG9yKSB7XG4gIHRoaXMuYXZhaWxhYmxlX3R5cGVzID0gYXZhaWxhYmxlX3R5cGVzIHx8IFtdO1xuICB0aGlzLm1lZGlhdG9yID0gbWVkaWF0b3I7XG5cbiAgdGhpcy5fZW5zdXJlRWxlbWVudCgpO1xuICB0aGlzLl9iaW5kRnVuY3Rpb25zKCk7XG4gIHRoaXMuX2JpbmRNZWRpYXRlZEV2ZW50cygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihCbG9ja0NvbnRyb2xzLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vbWVkaWF0ZWQtZXZlbnRzJyksIHJlcXVpcmUoJy4vcmVuZGVyYWJsZScpLCByZXF1aXJlKCcuL2V2ZW50cycpLCB7XG5cbiAgYm91bmQ6IFsnaGFuZGxlQ29udHJvbEJ1dHRvbkNsaWNrJ10sXG4gIGJsb2NrX2NvbnRyb2xzOiBudWxsLFxuXG4gIGNsYXNzTmFtZTogXCJzdC1ibG9jay1jb250cm9sc1wiLFxuICBldmVudE5hbWVzcGFjZTogJ2Jsb2NrLWNvbnRyb2xzJyxcblxuICBtZWRpYXRlZEV2ZW50czoge1xuICAgICdyZW5kZXInOiAncmVuZGVySW5Db250YWluZXInLFxuICAgICdzaG93JzogJ3Nob3cnLFxuICAgICdoaWRlJzogJ2hpZGUnXG4gIH0sXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgZm9yKHZhciBibG9ja190eXBlIGluIHRoaXMuYXZhaWxhYmxlX3R5cGVzKSB7XG4gICAgICBpZiAoQmxvY2tzLmhhc093blByb3BlcnR5KGJsb2NrX3R5cGUpKSB7XG4gICAgICAgIHZhciBibG9ja19jb250cm9sID0gbmV3IEJsb2NrQ29udHJvbChibG9ja190eXBlKTtcbiAgICAgICAgaWYgKGJsb2NrX2NvbnRyb2wuY2FuX2JlX3JlbmRlcmVkKSB7XG4gICAgICAgICAgdGhpcy4kZWwuYXBwZW5kKGJsb2NrX2NvbnRyb2wucmVuZGVyKCkuJGVsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuJGVsLmRlbGVnYXRlKCcuc3QtYmxvY2stY29udHJvbCcsICdjbGljaycsIHRoaXMuaGFuZGxlQ29udHJvbEJ1dHRvbkNsaWNrKTtcbiAgICB0aGlzLm1lZGlhdG9yLm9uKCdibG9jay1jb250cm9sczpzaG93JywgdGhpcy5yZW5kZXJJbkNvbnRhaW5lcik7XG4gIH0sXG5cbiAgc2hvdzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ3N0LWJsb2NrLWNvbnRyb2xzLS1hY3RpdmUnKTtcblxuICAgIEV2ZW50QnVzLnRyaWdnZXIoJ2Jsb2NrOmNvbnRyb2xzOnNob3duJyk7XG4gIH0sXG5cbiAgaGlkZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW1vdmVDdXJyZW50Q29udGFpbmVyKCk7XG4gICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ3N0LWJsb2NrLWNvbnRyb2xzLS1hY3RpdmUnKTtcblxuICAgIEV2ZW50QnVzLnRyaWdnZXIoJ2Jsb2NrOmNvbnRyb2xzOmhpZGRlbicpO1xuICB9LFxuXG4gIGhhbmRsZUNvbnRyb2xCdXR0b25DbGljazogZnVuY3Rpb24oZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Jsb2NrOmNyZWF0ZScsICQoZS5jdXJyZW50VGFyZ2V0KS5hdHRyKCdkYXRhLXR5cGUnKSk7XG4gIH0sXG5cbiAgcmVuZGVySW5Db250YWluZXI6IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgIHRoaXMucmVtb3ZlQ3VycmVudENvbnRhaW5lcigpO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZCh0aGlzLiRlbC5kZXRhY2goKSk7XG4gICAgY29udGFpbmVyLmFkZENsYXNzKCd3aXRoLXN0LWNvbnRyb2xzJyk7XG5cbiAgICB0aGlzLmN1cnJlbnRDb250YWluZXIgPSBjb250YWluZXI7XG4gICAgdGhpcy5zaG93KCk7XG4gIH0sXG5cbiAgcmVtb3ZlQ3VycmVudENvbnRhaW5lcjogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKHRoaXMuY3VycmVudENvbnRhaW5lcikpIHtcbiAgICAgIHRoaXMuY3VycmVudENvbnRhaW5lci5yZW1vdmVDbGFzcyhcIndpdGgtc3QtY29udHJvbHNcIik7XG4gICAgICB0aGlzLmN1cnJlbnRDb250YWluZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9ja0NvbnRyb2xzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBCbG9ja0RlbGV0aW9uID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xufTtcblxuT2JqZWN0LmFzc2lnbihCbG9ja0RlbGV0aW9uLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vcmVuZGVyYWJsZScpLCB7XG5cbiAgdGFnTmFtZTogJ2EnLFxuICBjbGFzc05hbWU6ICdzdC1ibG9jay11aS1idG4gc3QtYmxvY2stdWktYnRuLS1kZWxldGUgc3QtaWNvbicsXG5cbiAgYXR0cmlidXRlczoge1xuICAgIGh0bWw6ICdkZWxldGUnLFxuICAgICdkYXRhLWljb24nOiAnYmluJ1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrRGVsZXRpb247XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyk7XG5cbnZhciBFdmVudEJ1cyA9IHJlcXVpcmUoJy4vZXZlbnQtYnVzJyk7XG52YXIgQmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcblxudmFyIEJsb2NrTWFuYWdlciA9IGZ1bmN0aW9uKG9wdGlvbnMsIGVkaXRvckluc3RhbmNlLCBtZWRpYXRvcikge1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB0aGlzLmluc3RhbmNlX3Njb3BlID0gZWRpdG9ySW5zdGFuY2U7XG4gIHRoaXMubWVkaWF0b3IgPSBtZWRpYXRvcjtcblxuICB0aGlzLmJsb2NrcyA9IFtdO1xuICB0aGlzLmJsb2NrQ291bnRzID0ge307XG4gIHRoaXMuYmxvY2tUeXBlcyA9IHt9O1xuXG4gIHRoaXMuX3NldEJsb2Nrc1R5cGVzKCk7XG4gIHRoaXMuX3NldFJlcXVpcmVkKCk7XG4gIHRoaXMuX2JpbmRNZWRpYXRlZEV2ZW50cygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihCbG9ja01hbmFnZXIucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9tZWRpYXRlZC1ldmVudHMnKSwgcmVxdWlyZSgnLi9ldmVudHMnKSwge1xuXG4gIGV2ZW50TmFtZXNwYWNlOiAnYmxvY2snLFxuXG4gIG1lZGlhdGVkRXZlbnRzOiB7XG4gICAgJ2NyZWF0ZSc6ICdjcmVhdGVCbG9jaycsXG4gICAgJ3JlbW92ZSc6ICdyZW1vdmVCbG9jaycsXG4gICAgJ3JlcmVuZGVyJzogJ3JlcmVuZGVyQmxvY2snXG4gIH0sXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7fSxcblxuICBjcmVhdGVCbG9jazogZnVuY3Rpb24odHlwZSwgZGF0YSkge1xuICAgIHR5cGUgPSB1dGlscy5jbGFzc2lmeSh0eXBlKTtcblxuICAgIC8vIFJ1biB2YWxpZGF0aW9uc1xuICAgIGlmICghdGhpcy5jYW5DcmVhdGVCbG9jayh0eXBlKSkgeyByZXR1cm47IH1cblxuICAgIHZhciBibG9jayA9IG5ldyBCbG9ja3NbdHlwZV0oZGF0YSwgdGhpcy5pbnN0YW5jZV9zY29wZSwgdGhpcy5tZWRpYXRvcik7XG4gICAgdGhpcy5ibG9ja3MucHVzaChibG9jayk7XG5cbiAgICB0aGlzLl9pbmNyZW1lbnRCbG9ja1R5cGVDb3VudCh0eXBlKTtcbiAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Jsb2NrOnJlbmRlcicsIGJsb2NrKTtcblxuICAgIHRoaXMudHJpZ2dlckJsb2NrQ291bnRVcGRhdGUoKTtcbiAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Jsb2NrOmxpbWl0UmVhY2hlZCcsIHRoaXMuYmxvY2tMaW1pdFJlYWNoZWQoKSk7XG5cbiAgICB1dGlscy5sb2coXCJCbG9jayBjcmVhdGVkIG9mIHR5cGUgXCIgKyB0eXBlKTtcbiAgfSxcblxuICByZW1vdmVCbG9jazogZnVuY3Rpb24oYmxvY2tJRCkge1xuICAgIHZhciBibG9jayA9IHRoaXMuZmluZEJsb2NrQnlJZChibG9ja0lEKSxcbiAgICB0eXBlID0gdXRpbHMuY2xhc3NpZnkoYmxvY2sudHlwZSk7XG5cbiAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Jsb2NrLWNvbnRyb2xzOnJlc2V0Jyk7XG4gICAgdGhpcy5ibG9ja3MgPSB0aGlzLmJsb2Nrcy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgcmV0dXJuIChpdGVtLmJsb2NrSUQgIT09IGJsb2NrLmJsb2NrSUQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fZGVjcmVtZW50QmxvY2tUeXBlQ291bnQodHlwZSk7XG4gICAgdGhpcy50cmlnZ2VyQmxvY2tDb3VudFVwZGF0ZSgpO1xuICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignYmxvY2s6bGltaXRSZWFjaGVkJywgdGhpcy5ibG9ja0xpbWl0UmVhY2hlZCgpKTtcblxuICAgIEV2ZW50QnVzLnRyaWdnZXIoXCJibG9jazpyZW1vdmVcIik7XG4gIH0sXG5cbiAgcmVyZW5kZXJCbG9jazogZnVuY3Rpb24oYmxvY2tJRCkge1xuICAgIHZhciBibG9jayA9IHRoaXMuZmluZEJsb2NrQnlJZChibG9ja0lEKTtcbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoYmxvY2spICYmICFibG9jay5pc0VtcHR5KCkgJiZcbiAgICAgICAgYmxvY2suZHJvcF9vcHRpb25zLnJlX3JlbmRlcl9vbl9yZW9yZGVyKSB7XG4gICAgICBibG9jay5iZWZvcmVMb2FkaW5nRGF0YSgpO1xuICAgIH1cbiAgfSxcblxuICB0cmlnZ2VyQmxvY2tDb3VudFVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdibG9jazpjb3VudFVwZGF0ZScsIHRoaXMuYmxvY2tzLmxlbmd0aCk7XG4gIH0sXG5cbiAgY2FuQ3JlYXRlQmxvY2s6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICBpZih0aGlzLmJsb2NrTGltaXRSZWFjaGVkKCkpIHtcbiAgICAgIHV0aWxzLmxvZyhcIkNhbm5vdCBhZGQgYW55IG1vcmUgYmxvY2tzLiBMaW1pdCByZWFjaGVkLlwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaXNCbG9ja1R5cGVBdmFpbGFibGUodHlwZSkpIHtcbiAgICAgIHV0aWxzLmxvZyhcIkJsb2NrIHR5cGUgbm90IGF2YWlsYWJsZSBcIiArIHR5cGUpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIENhbiB3ZSBoYXZlIGFub3RoZXIgb25lIG9mIHRoZXNlIGJsb2Nrcz9cbiAgICBpZiAoIXRoaXMuY2FuQWRkQmxvY2tUeXBlKHR5cGUpKSB7XG4gICAgICB1dGlscy5sb2coXCJCbG9jayBMaW1pdCByZWFjaGVkIGZvciB0eXBlIFwiICsgdHlwZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgdmFsaWRhdGVCbG9ja1R5cGVzRXhpc3Q6IGZ1bmN0aW9uKHNob3VsZFZhbGlkYXRlKSB7XG4gICAgaWYgKGNvbmZpZy5za2lwVmFsaWRhdGlvbiB8fCAhc2hvdWxkVmFsaWRhdGUpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAodGhpcy5yZXF1aXJlZCB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbih0eXBlLCBpbmRleCkge1xuICAgICAgaWYgKCF0aGlzLmlzQmxvY2tUeXBlQXZhaWxhYmxlKHR5cGUpKSB7IHJldHVybjsgfVxuXG4gICAgICBpZiAodGhpcy5fZ2V0QmxvY2tUeXBlQ291bnQodHlwZSkgPT09IDApIHtcbiAgICAgICAgdXRpbHMubG9nKFwiRmFpbGVkIHZhbGlkYXRpb24gb24gcmVxdWlyZWQgYmxvY2sgdHlwZSBcIiArIHR5cGUpO1xuICAgICAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Vycm9yczphZGQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0ZXh0OiBpMThuLnQoXCJlcnJvcnM6dHlwZV9taXNzaW5nXCIsIHsgdHlwZTogdHlwZSB9KSB9KTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGJsb2NrcyA9IHRoaXMuZ2V0QmxvY2tzQnlUeXBlKHR5cGUpLmZpbHRlcihmdW5jdGlvbihiKSB7XG4gICAgICAgICAgcmV0dXJuICFiLmlzRW1wdHkoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGJsb2Nrcy5sZW5ndGggPiAwKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignZXJyb3JzOmFkZCcsIHtcbiAgICAgICAgICB0ZXh0OiBpMThuLnQoXCJlcnJvcnM6cmVxdWlyZWRfdHlwZV9lbXB0eVwiLCB7dHlwZTogdHlwZX0pXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHV0aWxzLmxvZyhcIkEgcmVxdWlyZWQgYmxvY2sgdHlwZSBcIiArIHR5cGUgKyBcIiBpcyBlbXB0eVwiKTtcbiAgICAgIH1cbiAgICB9LCB0aGlzKTtcbiAgfSxcblxuICBmaW5kQmxvY2tCeUlkOiBmdW5jdGlvbihibG9ja0lEKSB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tzLmZpbmQoZnVuY3Rpb24oYikge1xuICAgICAgcmV0dXJuIGIuYmxvY2tJRCA9PT0gYmxvY2tJRDtcbiAgICB9KTtcbiAgfSxcblxuICBnZXRCbG9ja3NCeVR5cGU6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja3MuZmlsdGVyKGZ1bmN0aW9uKGIpIHtcbiAgICAgIHJldHVybiB1dGlscy5jbGFzc2lmeShiLnR5cGUpID09PSB0eXBlO1xuICAgIH0pO1xuICB9LFxuXG4gIGdldEJsb2Nrc0J5SURzOiBmdW5jdGlvbihibG9ja19pZHMpIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja3MuZmlsdGVyKGZ1bmN0aW9uKGIpIHtcbiAgICAgIHJldHVybiBibG9ja19pZHMuaW5jbHVkZXMoYi5ibG9ja0lEKTtcbiAgICB9KTtcbiAgfSxcblxuICBibG9ja0xpbWl0UmVhY2hlZDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICh0aGlzLm9wdGlvbnMuYmxvY2tMaW1pdCAhPT0gMCAmJiB0aGlzLmJsb2Nrcy5sZW5ndGggPj0gdGhpcy5vcHRpb25zLmJsb2NrTGltaXQpO1xuICB9LFxuXG4gIGlzQmxvY2tUeXBlQXZhaWxhYmxlOiBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuICFfLmlzVW5kZWZpbmVkKHRoaXMuYmxvY2tUeXBlc1t0XSk7XG4gIH0sXG5cbiAgY2FuQWRkQmxvY2tUeXBlOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgdmFyIGJsb2NrX3R5cGVfbGltaXQgPSB0aGlzLl9nZXRCbG9ja1R5cGVMaW1pdCh0eXBlKTtcbiAgICByZXR1cm4gIShibG9ja190eXBlX2xpbWl0ICE9PSAwICYmIHRoaXMuX2dldEJsb2NrVHlwZUNvdW50KHR5cGUpID49IGJsb2NrX3R5cGVfbGltaXQpO1xuICB9LFxuXG4gIF9zZXRCbG9ja3NUeXBlczogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5ibG9ja1R5cGVzID0gdXRpbHMuZmxhdHRlbihcbiAgICAgIF8uaXNVbmRlZmluZWQodGhpcy5vcHRpb25zLmJsb2NrVHlwZXMpID9cbiAgICAgIEJsb2NrcyA6IHRoaXMub3B0aW9ucy5ibG9ja1R5cGVzKTtcbiAgfSxcblxuICBfc2V0UmVxdWlyZWQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVxdWlyZWQgPSBmYWxzZTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMub3B0aW9ucy5yZXF1aXJlZCkgJiYgIV8uaXNFbXB0eSh0aGlzLm9wdGlvbnMucmVxdWlyZWQpKSB7XG4gICAgICB0aGlzLnJlcXVpcmVkID0gdGhpcy5vcHRpb25zLnJlcXVpcmVkO1xuICAgIH1cbiAgfSxcblxuICBfaW5jcmVtZW50QmxvY2tUeXBlQ291bnQ6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICB0aGlzLmJsb2NrQ291bnRzW3R5cGVdID0gKF8uaXNVbmRlZmluZWQodGhpcy5ibG9ja0NvdW50c1t0eXBlXSkpID8gMSA6IHRoaXMuYmxvY2tDb3VudHNbdHlwZV0gKyAxO1xuICB9LFxuXG4gIF9kZWNyZW1lbnRCbG9ja1R5cGVDb3VudDogZnVuY3Rpb24odHlwZSkge1xuICAgIHRoaXMuYmxvY2tDb3VudHNbdHlwZV0gPSAoXy5pc1VuZGVmaW5lZCh0aGlzLmJsb2NrQ291bnRzW3R5cGVdKSkgPyAxIDogdGhpcy5ibG9ja0NvdW50c1t0eXBlXSAtIDE7XG4gIH0sXG5cbiAgX2dldEJsb2NrVHlwZUNvdW50OiBmdW5jdGlvbih0eXBlKSB7XG4gICAgcmV0dXJuIChfLmlzVW5kZWZpbmVkKHRoaXMuYmxvY2tDb3VudHNbdHlwZV0pKSA/IDAgOiB0aGlzLmJsb2NrQ291bnRzW3R5cGVdO1xuICB9LFxuXG4gIF9ibG9ja0xpbWl0UmVhY2hlZDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICh0aGlzLm9wdGlvbnMuYmxvY2tMaW1pdCAhPT0gMCAmJiB0aGlzLmJsb2Nrcy5sZW5ndGggPj0gdGhpcy5vcHRpb25zLmJsb2NrTGltaXQpO1xuICB9LFxuXG4gIF9nZXRCbG9ja1R5cGVMaW1pdDogZnVuY3Rpb24odCkge1xuICAgIGlmICghdGhpcy5pc0Jsb2NrVHlwZUF2YWlsYWJsZSh0KSkgeyByZXR1cm4gMDsgfVxuICAgIHJldHVybiBwYXJzZUludCgoXy5pc1VuZGVmaW5lZCh0aGlzLm9wdGlvbnMuYmxvY2tUeXBlTGltaXRzW3RdKSkgPyAwIDogdGhpcy5vcHRpb25zLmJsb2NrVHlwZUxpbWl0c1t0XSwgMTApO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrTWFuYWdlcjtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB0ZW1wbGF0ZSA9IFtcbiAgXCI8ZGl2IGNsYXNzPSdzdC1ibG9jay1wb3NpdGlvbmVyX19pbm5lcic+XCIsXG4gIFwiPHNwYW4gY2xhc3M9J3N0LWJsb2NrLXBvc2l0aW9uZXJfX3NlbGVjdGVkLXZhbHVlJz48L3NwYW4+XCIsXG4gIFwiPHNlbGVjdCBjbGFzcz0nc3QtYmxvY2stcG9zaXRpb25lcl9fc2VsZWN0Jz48L3NlbGVjdD5cIixcbiAgXCI8L2Rpdj5cIlxuXS5qb2luKFwiXFxuXCIpO1xuXG52YXIgQmxvY2tQb3NpdGlvbmVyID0gZnVuY3Rpb24oYmxvY2tfZWxlbWVudCwgbWVkaWF0b3IpIHtcbiAgdGhpcy5tZWRpYXRvciA9IG1lZGlhdG9yO1xuICB0aGlzLiRibG9jayA9IGJsb2NrX2VsZW1lbnQ7XG5cbiAgdGhpcy5fZW5zdXJlRWxlbWVudCgpO1xuICB0aGlzLl9iaW5kRnVuY3Rpb25zKCk7XG5cbiAgdGhpcy5pbml0aWFsaXplKCk7XG59O1xuXG5PYmplY3QuYXNzaWduKEJsb2NrUG9zaXRpb25lci5wcm90b3R5cGUsIHJlcXVpcmUoJy4vZnVuY3Rpb24tYmluZCcpLCByZXF1aXJlKCcuL3JlbmRlcmFibGUnKSwge1xuXG4gIHRvdGFsX2Jsb2NrczogMCxcblxuICBib3VuZDogWydvbkJsb2NrQ291bnRDaGFuZ2UnLCAnb25TZWxlY3RDaGFuZ2UnLCAndG9nZ2xlJywgJ3Nob3cnLCAnaGlkZSddLFxuXG4gIGNsYXNzTmFtZTogJ3N0LWJsb2NrLXBvc2l0aW9uZXInLFxuICB2aXNpYmxlQ2xhc3M6ICdzdC1ibG9jay1wb3NpdGlvbmVyLS1pcy12aXNpYmxlJyxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpe1xuICAgIHRoaXMuJGVsLmFwcGVuZCh0ZW1wbGF0ZSk7XG4gICAgdGhpcy4kc2VsZWN0ID0gdGhpcy4kKCcuc3QtYmxvY2stcG9zaXRpb25lcl9fc2VsZWN0Jyk7XG5cbiAgICB0aGlzLiRzZWxlY3Qub24oJ2NoYW5nZScsIHRoaXMub25TZWxlY3RDaGFuZ2UpO1xuXG4gICAgdGhpcy5tZWRpYXRvci5vbihcImJsb2Nrczpjb3VudFVwZGF0ZVwiLCB0aGlzLm9uQmxvY2tDb3VudENoYW5nZSk7XG4gIH0sXG5cbiAgb25CbG9ja0NvdW50Q2hhbmdlOiBmdW5jdGlvbihuZXdfY291bnQpIHtcbiAgICBpZiAobmV3X2NvdW50ICE9PSB0aGlzLnRvdGFsX2Jsb2Nrcykge1xuICAgICAgdGhpcy50b3RhbF9ibG9ja3MgPSBuZXdfY291bnQ7XG4gICAgICB0aGlzLnJlbmRlclBvc2l0aW9uTGlzdCgpO1xuICAgIH1cbiAgfSxcblxuICBvblNlbGVjdENoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbCA9IHRoaXMuJHNlbGVjdC52YWwoKTtcbiAgICBpZiAodmFsICE9PSAwKSB7XG4gICAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoXG4gICAgICAgIFwiYmxvY2tzOmNoYW5nZVBvc2l0aW9uXCIsIHRoaXMuJGJsb2NrLCB2YWwsXG4gICAgICAgICh2YWwgPT09IDEgPyAnYmVmb3JlJyA6ICdhZnRlcicpKTtcbiAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlclBvc2l0aW9uTGlzdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlubmVyID0gXCI8b3B0aW9uIHZhbHVlPScwJz5cIiArIGkxOG4udChcImdlbmVyYWw6cG9zaXRpb25cIikgKyBcIjwvb3B0aW9uPlwiO1xuICAgIGZvcih2YXIgaSA9IDE7IGkgPD0gdGhpcy50b3RhbF9ibG9ja3M7IGkrKykge1xuICAgICAgaW5uZXIgKz0gXCI8b3B0aW9uIHZhbHVlPVwiK2krXCI+XCIraStcIjwvb3B0aW9uPlwiO1xuICAgIH1cbiAgICB0aGlzLiRzZWxlY3QuaHRtbChpbm5lcik7XG4gIH0sXG5cbiAgdG9nZ2xlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRzZWxlY3QudmFsKDApO1xuICAgIHRoaXMuJGVsLnRvZ2dsZUNsYXNzKHRoaXMudmlzaWJsZUNsYXNzKTtcbiAgfSxcblxuICBzaG93OiBmdW5jdGlvbigpe1xuICAgIHRoaXMuJGVsLmFkZENsYXNzKHRoaXMudmlzaWJsZUNsYXNzKTtcbiAgfSxcblxuICBoaWRlOiBmdW5jdGlvbigpe1xuICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKHRoaXMudmlzaWJsZUNsYXNzKTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9ja1Bvc2l0aW9uZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuL2V2ZW50LWJ1cycpO1xuXG52YXIgQmxvY2tSZW9yZGVyID0gZnVuY3Rpb24oYmxvY2tfZWxlbWVudCwgbWVkaWF0b3IpIHtcbiAgdGhpcy4kYmxvY2sgPSBibG9ja19lbGVtZW50O1xuICB0aGlzLmJsb2NrSUQgPSB0aGlzLiRibG9jay5hdHRyKCdpZCcpO1xuICB0aGlzLm1lZGlhdG9yID0gbWVkaWF0b3I7XG5cbiAgdGhpcy5fZW5zdXJlRWxlbWVudCgpO1xuICB0aGlzLl9iaW5kRnVuY3Rpb25zKCk7XG5cbiAgdGhpcy5pbml0aWFsaXplKCk7XG59O1xuXG5PYmplY3QuYXNzaWduKEJsb2NrUmVvcmRlci5wcm90b3R5cGUsIHJlcXVpcmUoJy4vZnVuY3Rpb24tYmluZCcpLCByZXF1aXJlKCcuL3JlbmRlcmFibGUnKSwge1xuXG4gIGJvdW5kOiBbJ29uTW91c2VEb3duJywgJ29uRHJhZ1N0YXJ0JywgJ29uRHJhZ0VuZCcsICdvbkRyb3AnXSxcblxuICBjbGFzc05hbWU6ICdzdC1ibG9jay11aS1idG4gc3QtYmxvY2stdWktYnRuLS1yZW9yZGVyIHN0LWljb24nLFxuICB0YWdOYW1lOiAnYScsXG5cbiAgYXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdodG1sJzogJ3Jlb3JkZXInLFxuICAgICAgJ2RyYWdnYWJsZSc6ICd0cnVlJyxcbiAgICAgICdkYXRhLWljb24nOiAnbW92ZSdcbiAgICB9O1xuICB9LFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLmJpbmQoJ21vdXNlZG93biB0b3VjaHN0YXJ0JywgdGhpcy5vbk1vdXNlRG93bilcbiAgICAgIC5iaW5kKCdkcmFnc3RhcnQnLCB0aGlzLm9uRHJhZ1N0YXJ0KVxuICAgICAgLmJpbmQoJ2RyYWdlbmQgdG91Y2hlbmQnLCB0aGlzLm9uRHJhZ0VuZCk7XG5cbiAgICB0aGlzLiRibG9jay5kcm9wQXJlYSgpXG4gICAgICAuYmluZCgnZHJvcCcsIHRoaXMub25Ecm9wKTtcbiAgfSxcblxuICBibG9ja0lkOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kYmxvY2suYXR0cignaWQnKTtcbiAgfSxcblxuICBvbk1vdXNlRG93bjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKFwiYmxvY2stY29udHJvbHM6aGlkZVwiKTtcbiAgICBFdmVudEJ1cy50cmlnZ2VyKFwiYmxvY2s6cmVvcmRlcjpkb3duXCIpO1xuICB9LFxuXG4gIG9uRHJvcDogZnVuY3Rpb24oZXYpIHtcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyIGRyb3BwZWRfb24gPSB0aGlzLiRibG9jayxcbiAgICBpdGVtX2lkID0gZXYub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcInRleHQvcGxhaW5cIiksXG4gICAgYmxvY2sgPSAkKCcjJyArIGl0ZW1faWQpO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGl0ZW1faWQpICYmICFfLmlzRW1wdHkoYmxvY2spICYmXG4gICAgICAgIGRyb3BwZWRfb24uYXR0cignaWQnKSAhPT0gaXRlbV9pZCAmJlxuICAgICAgICAgIGRyb3BwZWRfb24uYXR0cignZGF0YS1pbnN0YW5jZScpID09PSBibG9jay5hdHRyKCdkYXRhLWluc3RhbmNlJylcbiAgICAgICApIHtcbiAgICAgICBkcm9wcGVkX29uLmFmdGVyKGJsb2NrKTtcbiAgICAgfVxuICAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoXCJibG9jazpyZXJlbmRlclwiLCBpdGVtX2lkKTtcbiAgICAgRXZlbnRCdXMudHJpZ2dlcihcImJsb2NrOnJlb3JkZXI6ZHJvcHBlZFwiLCBpdGVtX2lkKTtcbiAgfSxcblxuICBvbkRyYWdTdGFydDogZnVuY3Rpb24oZXYpIHtcbiAgICB2YXIgYnRuID0gJChldi5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKTtcblxuICAgIGV2Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERyYWdJbWFnZSh0aGlzLiRibG9ja1swXSwgYnRuLnBvc2l0aW9uKCkubGVmdCwgYnRuLnBvc2l0aW9uKCkudG9wKTtcbiAgICBldi5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhKCdUZXh0JywgdGhpcy5ibG9ja0lkKCkpO1xuXG4gICAgRXZlbnRCdXMudHJpZ2dlcihcImJsb2NrOnJlb3JkZXI6ZHJhZ3N0YXJ0XCIpO1xuICAgIHRoaXMuJGJsb2NrLmFkZENsYXNzKCdzdC1ibG9jay0tZHJhZ2dpbmcnKTtcbiAgfSxcblxuICBvbkRyYWdFbmQ6IGZ1bmN0aW9uKGV2KSB7XG4gICAgRXZlbnRCdXMudHJpZ2dlcihcImJsb2NrOnJlb3JkZXI6ZHJhZ2VuZFwiKTtcbiAgICB0aGlzLiRibG9jay5yZW1vdmVDbGFzcygnc3QtYmxvY2stLWRyYWdnaW5nJyk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9ja1Jlb3JkZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuL2V2ZW50LWJ1cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBibG9ja1N0b3JhZ2U6IHt9LFxuXG4gIGNyZWF0ZVN0b3JlOiBmdW5jdGlvbihibG9ja0RhdGEpIHtcbiAgICB0aGlzLmJsb2NrU3RvcmFnZSA9IHtcbiAgICAgIHR5cGU6IHV0aWxzLnVuZGVyc2NvcmVkKHRoaXMudHlwZSksXG4gICAgICBkYXRhOiBibG9ja0RhdGEgfHwge31cbiAgICB9O1xuICB9LFxuXG4gIHNhdmU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkYXRhID0gdGhpcy5fc2VyaWFsaXplRGF0YSgpO1xuXG4gICAgaWYgKCFfLmlzRW1wdHkoZGF0YSkpIHtcbiAgICAgIHRoaXMuc2V0RGF0YShkYXRhKTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0RGF0YTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zYXZlKCk7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tTdG9yYWdlO1xuICB9LFxuXG4gIGdldEJsb2NrRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zYXZlKCk7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tTdG9yYWdlLmRhdGE7XG4gIH0sXG5cbiAgX2dldERhdGE6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmJsb2NrU3RvcmFnZS5kYXRhO1xuICB9LFxuXG4gIHNldERhdGE6IGZ1bmN0aW9uKGJsb2NrRGF0YSkge1xuICAgIHV0aWxzLmxvZyhcIlNldHRpbmcgZGF0YSBmb3IgYmxvY2sgXCIgKyB0aGlzLmJsb2NrSUQpO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5ibG9ja1N0b3JhZ2UuZGF0YSwgYmxvY2tEYXRhIHx8IHt9KTtcbiAgfSxcblxuICBzZXRBbmRSZXRyaWV2ZURhdGE6IGZ1bmN0aW9uKGJsb2NrRGF0YSkge1xuICAgIHRoaXMuc2V0RGF0YShibG9ja0RhdGEpO1xuICAgIHJldHVybiB0aGlzLl9nZXREYXRhKCk7XG4gIH0sXG5cbiAgc2V0QW5kTG9hZERhdGE6IGZ1bmN0aW9uKGJsb2NrRGF0YSkge1xuICAgIHRoaXMuc2V0RGF0YShibG9ja0RhdGEpO1xuICAgIHRoaXMuYmVmb3JlTG9hZGluZ0RhdGEoKTtcbiAgfSxcblxuICBfc2VyaWFsaXplRGF0YTogZnVuY3Rpb24oKSB7fSxcbiAgbG9hZERhdGE6IGZ1bmN0aW9uKCkge30sXG5cbiAgYmVmb3JlTG9hZGluZ0RhdGE6IGZ1bmN0aW9uKCkge1xuICAgIHV0aWxzLmxvZyhcImxvYWREYXRhIGZvciBcIiArIHRoaXMuYmxvY2tJRCk7XG4gICAgRXZlbnRCdXMudHJpZ2dlcihcImVkaXRvci9ibG9jay9sb2FkRGF0YVwiKTtcbiAgICB0aGlzLmxvYWREYXRhKHRoaXMuX2dldERhdGEoKSk7XG4gIH0sXG5cbiAgX2xvYWREYXRhOiBmdW5jdGlvbigpIHtcbiAgICB1dGlscy5sb2coXCJfbG9hZERhdGEgaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBmdXR1cmUuIFBsZWFzZSB1c2UgYmVmb3JlTG9hZGluZ0RhdGEgaW5zdGVhZC5cIik7XG4gICAgdGhpcy5iZWZvcmVMb2FkaW5nRGF0YSgpO1xuICB9LFxuXG4gIGNoZWNrQW5kTG9hZERhdGE6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghXy5pc0VtcHR5KHRoaXMuX2dldERhdGEoKSkpIHtcbiAgICAgIHRoaXMuYmVmb3JlTG9hZGluZ0RhdGEoKTtcbiAgICB9XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBiZXN0TmFtZUZyb21GaWVsZCA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gIHZhciBtc2cgPSBmaWVsZC5hdHRyKFwiZGF0YS1zdC1uYW1lXCIpIHx8IGZpZWxkLmF0dHIoXCJuYW1lXCIpO1xuXG4gIGlmICghbXNnKSB7XG4gICAgbXNnID0gJ0ZpZWxkJztcbiAgfVxuXG4gIHJldHVybiB1dGlscy5jYXBpdGFsaXplKG1zZyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBlcnJvcnM6IFtdLFxuXG4gIHZhbGlkOiBmdW5jdGlvbigpe1xuICAgIHRoaXMucGVyZm9ybVZhbGlkYXRpb25zKCk7XG4gICAgcmV0dXJuIHRoaXMuZXJyb3JzLmxlbmd0aCA9PT0gMDtcbiAgfSxcblxuICAvLyBUaGlzIG1ldGhvZCBhY3R1YWxseSBkb2VzIHRoZSBsZWcgd29ya1xuICAvLyBvZiBydW5uaW5nIG91ciB2YWxpZGF0b3JzIGFuZCBjdXN0b20gdmFsaWRhdG9yc1xuICBwZXJmb3JtVmFsaWRhdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVzZXRFcnJvcnMoKTtcblxuICAgIHZhciByZXF1aXJlZF9maWVsZHMgPSB0aGlzLiQoJy5zdC1yZXF1aXJlZCcpO1xuICAgIHJlcXVpcmVkX2ZpZWxkcy5lYWNoKGZ1bmN0aW9uIChpLCBmKSB7XG4gICAgICB0aGlzLnZhbGlkYXRlRmllbGQoZik7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnZhbGlkYXRpb25zLmZvckVhY2godGhpcy5ydW5WYWxpZGF0b3IsIHRoaXMpO1xuXG4gICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3MoJ3N0LWJsb2NrLS13aXRoLWVycm9ycycsIHRoaXMuZXJyb3JzLmxlbmd0aCA+IDApO1xuICB9LFxuXG4gIC8vIEV2ZXJ5dGhpbmcgaW4gaGVyZSBzaG91bGQgYmUgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdHJ1ZSBvciBmYWxzZVxuICB2YWxpZGF0aW9uczogW10sXG5cbiAgdmFsaWRhdGVGaWVsZDogZnVuY3Rpb24oZmllbGQpIHtcbiAgICBmaWVsZCA9ICQoZmllbGQpO1xuXG4gICAgdmFyIGNvbnRlbnQgPSBmaWVsZC5hdHRyKCdjb250ZW50ZWRpdGFibGUnKSA/IGZpZWxkLnRleHQoKSA6IGZpZWxkLnZhbCgpO1xuXG4gICAgaWYgKGNvbnRlbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLnNldEVycm9yKGZpZWxkLCBpMThuLnQoXCJlcnJvcnM6YmxvY2tfZW1wdHlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogYmVzdE5hbWVGcm9tRmllbGQoZmllbGQpIH0pKTtcbiAgICB9XG4gIH0sXG5cbiAgcnVuVmFsaWRhdG9yOiBmdW5jdGlvbih2YWxpZGF0b3IpIHtcbiAgICBpZiAoIV8uaXNVbmRlZmluZWQodGhpc1t2YWxpZGF0b3JdKSkge1xuICAgICAgdGhpc1t2YWxpZGF0b3JdLmNhbGwodGhpcyk7XG4gICAgfVxuICB9LFxuXG4gIHNldEVycm9yOiBmdW5jdGlvbihmaWVsZCwgcmVhc29uKSB7XG4gICAgdmFyICRtc2cgPSB0aGlzLmFkZE1lc3NhZ2UocmVhc29uLCBcInN0LW1zZy0tZXJyb3JcIik7XG4gICAgZmllbGQuYWRkQ2xhc3MoJ3N0LWVycm9yJyk7XG5cbiAgICB0aGlzLmVycm9ycy5wdXNoKHsgZmllbGQ6IGZpZWxkLCByZWFzb246IHJlYXNvbiwgbXNnOiAkbXNnIH0pO1xuICB9LFxuXG4gIHJlc2V0RXJyb3JzOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIGVycm9yLmZpZWxkLnJlbW92ZUNsYXNzKCdzdC1lcnJvcicpO1xuICAgICAgZXJyb3IubXNnLnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kbWVzc2FnZXMucmVtb3ZlQ2xhc3MoXCJzdC1ibG9ja19fbWVzc2FnZXMtLWlzLXZpc2libGVcIik7XG4gICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgfVxuXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcblxudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgc3RUb0hUTUwgPSByZXF1aXJlKCcuL3RvLWh0bWwnKTtcbnZhciBzdFRvTWFya2Rvd24gPSByZXF1aXJlKCcuL3RvLW1hcmtkb3duJyk7XG52YXIgQmxvY2tNaXhpbnMgPSByZXF1aXJlKCcuL2Jsb2NrX21peGlucycpO1xuXG52YXIgU2ltcGxlQmxvY2sgPSByZXF1aXJlKCcuL3NpbXBsZS1ibG9jaycpO1xudmFyIEJsb2NrUmVvcmRlciA9IHJlcXVpcmUoJy4vYmxvY2stcmVvcmRlcicpO1xudmFyIEJsb2NrRGVsZXRpb24gPSByZXF1aXJlKCcuL2Jsb2NrLWRlbGV0aW9uJyk7XG52YXIgQmxvY2tQb3NpdGlvbmVyID0gcmVxdWlyZSgnLi9ibG9jay1wb3NpdGlvbmVyJyk7XG52YXIgRm9ybWF0dGVycyA9IHJlcXVpcmUoJy4vZm9ybWF0dGVycycpO1xudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi9ldmVudC1idXMnKTtcblxudmFyIFNwaW5uZXIgPSByZXF1aXJlKCdzcGluLmpzJyk7XG5cbnZhciBCbG9jayA9IGZ1bmN0aW9uKGRhdGEsIGluc3RhbmNlX2lkLCBtZWRpYXRvcikge1xuICBTaW1wbGVCbG9jay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuQmxvY2sucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTaW1wbGVCbG9jay5wcm90b3R5cGUpO1xuQmxvY2sucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQmxvY2s7XG5cbnZhciBkZWxldGVfdGVtcGxhdGUgPSBbXG4gIFwiPGRpdiBjbGFzcz0nc3QtYmxvY2tfX3VpLWRlbGV0ZS1jb250cm9scyc+XCIsXG4gIFwiPGxhYmVsIGNsYXNzPSdzdC1ibG9ja19fZGVsZXRlLWxhYmVsJz5cIixcbiAgXCI8JT0gaTE4bi50KCdnZW5lcmFsOmRlbGV0ZScpICU+XCIsXG4gIFwiPC9sYWJlbD5cIixcbiAgXCI8YSBjbGFzcz0nc3QtYmxvY2stdWktYnRuIHN0LWJsb2NrLXVpLWJ0bi0tY29uZmlybS1kZWxldGUgc3QtaWNvbicgZGF0YS1pY29uPSd0aWNrJz48L2E+XCIsXG4gIFwiPGEgY2xhc3M9J3N0LWJsb2NrLXVpLWJ0biBzdC1ibG9jay11aS1idG4tLWRlbnktZGVsZXRlIHN0LWljb24nIGRhdGEtaWNvbj0nY2xvc2UnPjwvYT5cIixcbiAgXCI8L2Rpdj5cIlxuXS5qb2luKFwiXFxuXCIpO1xuXG52YXIgZHJvcF9vcHRpb25zID0ge1xuICBodG1sOiBbJzxkaXYgY2xhc3M9XCJzdC1ibG9ja19fZHJvcHpvbmVcIj4nLFxuICAgICc8c3BhbiBjbGFzcz1cInN0LWljb25cIj48JT0gXy5yZXN1bHQoYmxvY2ssIFwiaWNvbl9uYW1lXCIpICU+PC9zcGFuPicsXG4gICAgJzxwPjwlPSBpMThuLnQoXCJnZW5lcmFsOmRyb3BcIiwgeyBibG9jazogXCI8c3Bhbj5cIiArIF8ucmVzdWx0KGJsb2NrLCBcInRpdGxlXCIpICsgXCI8L3NwYW4+XCIgfSkgJT4nLFxuICAgICc8L3A+PC9kaXY+J10uam9pbignXFxuJyksXG4gICAgcmVfcmVuZGVyX29uX3Jlb3JkZXI6IGZhbHNlXG59O1xuXG52YXIgcGFzdGVfb3B0aW9ucyA9IHtcbiAgaHRtbDogWyc8aW5wdXQgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIjwlPSBpMThuLnQoXCJnZW5lcmFsOnBhc3RlXCIpICU+XCInLFxuICAgICcgY2xhc3M9XCJzdC1ibG9ja19fcGFzdGUtaW5wdXQgc3QtcGFzdGUtYmxvY2tcIj4nXS5qb2luKCcnKVxufTtcblxudmFyIHVwbG9hZF9vcHRpb25zID0ge1xuICBodG1sOiBbXG4gICAgJzxkaXYgY2xhc3M9XCJzdC1ibG9ja19fdXBsb2FkLWNvbnRhaW5lclwiPicsXG4gICAgJzxpbnB1dCB0eXBlPVwiZmlsZVwiIHR5cGU9XCJzdC1maWxlLXVwbG9hZFwiPicsXG4gICAgJzxidXR0b24gY2xhc3M9XCJzdC11cGxvYWQtYnRuXCI+PCU9IGkxOG4udChcImdlbmVyYWw6dXBsb2FkXCIpICU+PC9idXR0b24+JyxcbiAgICAnPC9kaXY+J1xuICBdLmpvaW4oJ1xcbicpXG59O1xuXG5jb25maWcuZGVmYXVsdHMuQmxvY2sgPSB7XG4gIGRyb3Bfb3B0aW9uczogZHJvcF9vcHRpb25zLFxuICBwYXN0ZV9vcHRpb25zOiBwYXN0ZV9vcHRpb25zLFxuICB1cGxvYWRfb3B0aW9uczogdXBsb2FkX29wdGlvbnNcbn07XG5cbk9iamVjdC5hc3NpZ24oQmxvY2sucHJvdG90eXBlLCBTaW1wbGVCbG9jay5mbiwgcmVxdWlyZSgnLi9ibG9jay12YWxpZGF0aW9ucycpLCB7XG5cbiAgYm91bmQ6IFtcIl9oYW5kbGVDb250ZW50UGFzdGVcIiwgXCJfb25Gb2N1c1wiLCBcIl9vbkJsdXJcIiwgXCJvbkRyb3BcIiwgXCJvbkRlbGV0ZUNsaWNrXCIsXG4gICAgXCJjbGVhckluc2VydGVkU3R5bGVzXCIsIFwiZ2V0U2VsZWN0aW9uRm9yRm9ybWF0dGVyXCIsIFwib25CbG9ja1JlbmRlclwiXSxcblxuICAgIGNsYXNzTmFtZTogJ3N0LWJsb2NrIHN0LWljb24tLWFkZCcsXG5cbiAgICBhdHRyaWJ1dGVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKFNpbXBsZUJsb2NrLmZuLmF0dHJpYnV0ZXMuY2FsbCh0aGlzKSwge1xuICAgICAgICAnZGF0YS1pY29uLWFmdGVyJyA6IFwiYWRkXCJcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBpY29uX25hbWU6ICdkZWZhdWx0JyxcblxuICAgIHZhbGlkYXRpb25GYWlsTXNnOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBpMThuLnQoJ2Vycm9yczp2YWxpZGF0aW9uX2ZhaWwnLCB7IHR5cGU6IHRoaXMudGl0bGUoKSB9KTtcbiAgICB9LFxuXG4gICAgZWRpdG9ySFRNTDogJzxkaXYgY2xhc3M9XCJzdC1ibG9ja19fZWRpdG9yXCI+PC9kaXY+JyxcblxuICAgIHRvb2xiYXJFbmFibGVkOiB0cnVlLFxuXG4gICAgYXZhaWxhYmxlTWl4aW5zOiBbJ2Ryb3BwYWJsZScsICdwYXN0YWJsZScsICd1cGxvYWRhYmxlJywgJ2ZldGNoYWJsZScsXG4gICAgICAnYWpheGFibGUnLCAnY29udHJvbGxhYmxlJ10sXG5cbiAgICBkcm9wcGFibGU6IGZhbHNlLFxuICAgIHBhc3RhYmxlOiBmYWxzZSxcbiAgICB1cGxvYWRhYmxlOiBmYWxzZSxcbiAgICBmZXRjaGFibGU6IGZhbHNlLFxuICAgIGFqYXhhYmxlOiBmYWxzZSxcblxuICAgIGRyb3Bfb3B0aW9uczoge30sXG4gICAgcGFzdGVfb3B0aW9uczoge30sXG4gICAgdXBsb2FkX29wdGlvbnM6IHt9LFxuXG4gICAgZm9ybWF0dGFibGU6IHRydWUsXG5cbiAgICBfcHJldmlvdXNTZWxlY3Rpb246ICcnLFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7fSxcblxuICAgIHRvTWFya2Rvd246IGZ1bmN0aW9uKG1hcmtkb3duKXsgcmV0dXJuIG1hcmtkb3duOyB9LFxuICAgIHRvSFRNTDogZnVuY3Rpb24oaHRtbCl7IHJldHVybiBodG1sOyB9LFxuXG4gICAgd2l0aE1peGluOiBmdW5jdGlvbihtaXhpbikge1xuICAgICAgaWYgKCFfLmlzT2JqZWN0KG1peGluKSkgeyByZXR1cm47IH1cblxuICAgICAgdmFyIGluaXRpYWxpemVNZXRob2QgPSBcImluaXRpYWxpemVcIiArIG1peGluLm1peGluTmFtZTtcblxuICAgICAgaWYgKF8uaXNVbmRlZmluZWQodGhpc1tpbml0aWFsaXplTWV0aG9kXSkpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBtaXhpbik7XG4gICAgICAgIHRoaXNbaW5pdGlhbGl6ZU1ldGhvZF0oKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYmVmb3JlQmxvY2tSZW5kZXIoKTtcbiAgICAgIHRoaXMuX3NldEJsb2NrSW5uZXIoKTtcblxuICAgICAgdGhpcy4kZWRpdG9yID0gdGhpcy4kaW5uZXIuY2hpbGRyZW4oKS5maXJzdCgpO1xuXG4gICAgICBpZih0aGlzLmRyb3BwYWJsZSB8fCB0aGlzLnBhc3RhYmxlIHx8IHRoaXMudXBsb2FkYWJsZSkge1xuICAgICAgICB2YXIgaW5wdXRfaHRtbCA9ICQoXCI8ZGl2PlwiLCB7ICdjbGFzcyc6ICdzdC1ibG9ja19faW5wdXRzJyB9KTtcbiAgICAgICAgdGhpcy4kaW5uZXIuYXBwZW5kKGlucHV0X2h0bWwpO1xuICAgICAgICB0aGlzLiRpbnB1dHMgPSBpbnB1dF9odG1sO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5oYXNUZXh0QmxvY2spIHsgdGhpcy5faW5pdFRleHRCbG9ja3MoKTsgfVxuXG4gICAgICB0aGlzLmF2YWlsYWJsZU1peGlucy5mb3JFYWNoKGZ1bmN0aW9uKG1peGluKSB7XG4gICAgICAgIGlmICh0aGlzW21peGluXSkge1xuICAgICAgICAgIHRoaXMud2l0aE1peGluKEJsb2NrTWl4aW5zW3V0aWxzLmNsYXNzaWZ5KG1peGluKV0pO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgaWYgKHRoaXMuZm9ybWF0dGFibGUpIHsgdGhpcy5faW5pdEZvcm1hdHRpbmcoKTsgfVxuXG4gICAgICB0aGlzLl9ibG9ja1ByZXBhcmUoKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIHJlbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5hamF4YWJsZSkge1xuICAgICAgICB0aGlzLnJlc29sdmVBbGxJblF1ZXVlKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuJGVsLnJlbW92ZSgpO1xuICAgIH0sXG5cbiAgICBsb2FkaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmKCFfLmlzVW5kZWZpbmVkKHRoaXMuc3Bpbm5lcikpIHsgdGhpcy5yZWFkeSgpOyB9XG5cbiAgICAgIHRoaXMuc3Bpbm5lciA9IG5ldyBTcGlubmVyKGNvbmZpZy5kZWZhdWx0cy5zcGlubmVyKTtcbiAgICAgIHRoaXMuc3Bpbm5lci5zcGluKHRoaXMuJGVsWzBdKTtcblxuICAgICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ3N0LS1pcy1sb2FkaW5nJyk7XG4gICAgfSxcblxuICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdzdC0taXMtbG9hZGluZycpO1xuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKHRoaXMuc3Bpbm5lcikpIHtcbiAgICAgICAgdGhpcy5zcGlubmVyLnN0b3AoKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuc3Bpbm5lcjtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyogR2VuZXJpYyBfc2VyaWFsaXplRGF0YSBpbXBsZW1lbnRhdGlvbiB0byBzZXJpYWxpemUgdGhlIGJsb2NrIGludG8gYSBwbGFpbiBvYmplY3QuXG4gICAgICogQ2FuIGJlIG92ZXJ3cml0dGVuLCBhbHRob3VnaCBob3BlZnVsbHkgdGhpcyB3aWxsIGNvdmVyIG1vc3Qgc2l0dWF0aW9ucy5cbiAgICAgKiBJZiB5b3Ugd2FudCB0byBnZXQgdGhlIGRhdGEgb2YgeW91ciBibG9jayB1c2UgYmxvY2suZ2V0QmxvY2tEYXRhKClcbiAgICAgKi9cbiAgICBfc2VyaWFsaXplRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICB1dGlscy5sb2coXCJ0b0RhdGEgZm9yIFwiICsgdGhpcy5ibG9ja0lEKTtcblxuICAgICAgdmFyIGRhdGEgPSB7fTtcblxuICAgICAgLyogU2ltcGxlIHRvIHN0YXJ0LiBBZGQgY29uZGl0aW9ucyBsYXRlciAqL1xuICAgICAgaWYgKHRoaXMuaGFzVGV4dEJsb2NrKCkpIHtcbiAgICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLmdldFRleHRCbG9jaygpLmh0bWwoKTtcbiAgICAgICAgaWYgKGNvbnRlbnQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGRhdGEudGV4dCA9IHN0VG9NYXJrZG93bihjb250ZW50LCB0aGlzLnR5cGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBhbnkgaW5wdXRzIHRvIHRoZSBkYXRhIGF0dHJcbiAgICAgIGlmICh0aGlzLiQoJzppbnB1dCcpLm5vdCgnLnN0LXBhc3RlLWJsb2NrJykubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLiQoJzppbnB1dCcpLmVhY2goZnVuY3Rpb24oaW5kZXgsaW5wdXQpe1xuICAgICAgICAgIGlmIChpbnB1dC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSkge1xuICAgICAgICAgICAgZGF0YVtpbnB1dC5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0gPSBpbnB1dC52YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxuXG4gICAgLyogR2VuZXJpYyBpbXBsZW1lbnRhdGlvbiB0byB0ZWxsIHVzIHdoZW4gdGhlIGJsb2NrIGlzIGFjdGl2ZSAqL1xuICAgIGZvY3VzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ2V0VGV4dEJsb2NrKCkuZm9jdXMoKTtcbiAgICB9LFxuXG4gICAgYmx1cjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdldFRleHRCbG9jaygpLmJsdXIoKTtcbiAgICB9LFxuXG4gICAgb25Gb2N1czogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdldFRleHRCbG9jaygpLmJpbmQoJ2ZvY3VzJywgdGhpcy5fb25Gb2N1cyk7XG4gICAgfSxcblxuICAgIG9uQmx1cjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdldFRleHRCbG9jaygpLmJpbmQoJ2JsdXInLCB0aGlzLl9vbkJsdXIpO1xuICAgIH0sXG5cbiAgICAvKlxuICAgICAqIEV2ZW50IGhhbmRsZXJzXG4gICAgICovXG5cbiAgICBfb25Gb2N1czogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2Jsb2NrRm9jdXMnLCB0aGlzLiRlbCk7XG4gICAgfSxcblxuICAgIF9vbkJsdXI6IGZ1bmN0aW9uKCkge30sXG5cbiAgICBvbkJsb2NrUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZm9jdXMoKTtcbiAgICB9LFxuXG4gICAgb25Ecm9wOiBmdW5jdGlvbihkYXRhVHJhbnNmZXJPYmopIHt9LFxuXG4gICAgb25EZWxldGVDbGljazogZnVuY3Rpb24oZXYpIHtcbiAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHZhciBvbkRlbGV0ZUNvbmZpcm0gPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdibG9jazpyZW1vdmUnLCB0aGlzLmJsb2NrSUQpO1xuICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgfTtcblxuICAgICAgdmFyIG9uRGVsZXRlRGVueSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnc3QtYmxvY2stLWRlbGV0ZS1hY3RpdmUnKTtcbiAgICAgICAgJGRlbGV0ZV9lbC5yZW1vdmUoKTtcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLmlzRW1wdHkoKSkge1xuICAgICAgICBvbkRlbGV0ZUNvbmZpcm0uY2FsbCh0aGlzLCBuZXcgRXZlbnQoJ2NsaWNrJykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuJGlubmVyLmFwcGVuZChfLnRlbXBsYXRlKGRlbGV0ZV90ZW1wbGF0ZSkpO1xuICAgICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ3N0LWJsb2NrLS1kZWxldGUtYWN0aXZlJyk7XG5cbiAgICAgIHZhciAkZGVsZXRlX2VsID0gdGhpcy4kaW5uZXIuZmluZCgnLnN0LWJsb2NrX191aS1kZWxldGUtY29udHJvbHMnKTtcblxuICAgICAgdGhpcy4kaW5uZXIub24oJ2NsaWNrJywgJy5zdC1ibG9jay11aS1idG4tLWNvbmZpcm0tZGVsZXRlJyxcbiAgICAgICAgICAgICAgICAgICAgIG9uRGVsZXRlQ29uZmlybS5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgICAgICAgICAgLm9uKCdjbGljaycsICcuc3QtYmxvY2stdWktYnRuLS1kZW55LWRlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgb25EZWxldGVEZW55LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBwYXN0ZWRNYXJrZG93blRvSFRNTDogZnVuY3Rpb24oY29udGVudCkge1xuICAgICAgcmV0dXJuIHN0VG9IVE1MKHN0VG9NYXJrZG93bihjb250ZW50LCB0aGlzLnR5cGUpLCB0aGlzLnR5cGUpO1xuICAgIH0sXG5cbiAgICBvbkNvbnRlbnRQYXN0ZWQ6IGZ1bmN0aW9uKGV2ZW50LCB0YXJnZXQpe1xuICAgICAgdGFyZ2V0Lmh0bWwodGhpcy5wYXN0ZWRNYXJrZG93blRvSFRNTCh0YXJnZXRbMF0uaW5uZXJIVE1MKSk7XG4gICAgICB0aGlzLmdldFRleHRCbG9jaygpLmNhcmV0VG9FbmQoKTtcbiAgICB9LFxuXG4gICAgYmVmb3JlTG9hZGluZ0RhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5sb2FkaW5nKCk7XG5cbiAgICAgIGlmKHRoaXMuZHJvcHBhYmxlIHx8IHRoaXMudXBsb2FkYWJsZSB8fCB0aGlzLnBhc3RhYmxlKSB7XG4gICAgICAgIHRoaXMuJGVkaXRvci5zaG93KCk7XG4gICAgICAgIHRoaXMuJGlucHV0cy5oaWRlKCk7XG4gICAgICB9XG5cbiAgICAgIFNpbXBsZUJsb2NrLmZuLmJlZm9yZUxvYWRpbmdEYXRhLmNhbGwodGhpcyk7XG5cbiAgICAgIHRoaXMucmVhZHkoKTtcbiAgICB9LFxuXG4gICAgX2hhbmRsZUNvbnRlbnRQYXN0ZTogZnVuY3Rpb24oZXYpIHtcbiAgICAgIHNldFRpbWVvdXQodGhpcy5vbkNvbnRlbnRQYXN0ZWQuYmluZCh0aGlzLCBldiwgJChldi5jdXJyZW50VGFyZ2V0KSksIDApO1xuICAgIH0sXG5cbiAgICBfZ2V0QmxvY2tDbGFzczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJ3N0LWJsb2NrLS0nICsgdGhpcy5jbGFzc05hbWU7XG4gICAgfSxcblxuICAgIC8qXG4gICAgICogSW5pdCBmdW5jdGlvbnMgZm9yIGFkZGluZyBmdW5jdGlvbmFsaXR5XG4gICAgICovXG5cbiAgICBfaW5pdFVJQ29tcG9uZW50czogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBwb3NpdGlvbmVyID0gbmV3IEJsb2NrUG9zaXRpb25lcih0aGlzLiRlbCwgdGhpcy5tZWRpYXRvcik7XG5cbiAgICAgIHRoaXMuX3dpdGhVSUNvbXBvbmVudChwb3NpdGlvbmVyLCAnLnN0LWJsb2NrLXVpLWJ0bi0tcmVvcmRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25lci50b2dnbGUpO1xuXG4gICAgICB0aGlzLl93aXRoVUlDb21wb25lbnQobmV3IEJsb2NrUmVvcmRlcih0aGlzLiRlbCwgdGhpcy5tZWRpYXRvcikpO1xuXG4gICAgICB0aGlzLl93aXRoVUlDb21wb25lbnQobmV3IEJsb2NrRGVsZXRpb24oKSwgJy5zdC1ibG9jay11aS1idG4tLWRlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkRlbGV0ZUNsaWNrKTtcblxuICAgICAgdGhpcy5vbkZvY3VzKCk7XG4gICAgICB0aGlzLm9uQmx1cigpO1xuICAgIH0sXG5cbiAgICBfaW5pdEZvcm1hdHRpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gRW5hYmxlIGZvcm1hdHRpbmcga2V5Ym9hcmQgaW5wdXRcbiAgICAgIHZhciBmb3JtYXR0ZXI7XG4gICAgICBmb3IgKHZhciBuYW1lIGluIEZvcm1hdHRlcnMpIHtcbiAgICAgICAgaWYgKEZvcm1hdHRlcnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICBmb3JtYXR0ZXIgPSBGb3JtYXR0ZXJzW25hbWVdO1xuICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChmb3JtYXR0ZXIua2V5Q29kZSkpIHtcbiAgICAgICAgICAgIGZvcm1hdHRlci5fYmluZFRvQmxvY2sodGhpcy4kZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBfaW5pdFRleHRCbG9ja3M6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nZXRUZXh0QmxvY2soKVxuICAgICAgLmJpbmQoJ3Bhc3RlJywgdGhpcy5faGFuZGxlQ29udGVudFBhc3RlKVxuICAgICAgLmJpbmQoJ2tleXVwJywgdGhpcy5nZXRTZWxlY3Rpb25Gb3JGb3JtYXR0ZXIpXG4gICAgICAuYmluZCgnbW91c2V1cCcsIHRoaXMuZ2V0U2VsZWN0aW9uRm9yRm9ybWF0dGVyKVxuICAgICAgLmJpbmQoJ0RPTU5vZGVJbnNlcnRlZCcsIHRoaXMuY2xlYXJJbnNlcnRlZFN0eWxlcyk7XG4gICAgfSxcblxuICAgIGdldFNlbGVjdGlvbkZvckZvcm1hdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYmxvY2sgPSB0aGlzO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKSxcbiAgICAgICAgICAgIHNlbGVjdGlvblN0ciA9IHNlbGVjdGlvbi50b1N0cmluZygpLnRyaW0oKSxcbiAgICAgICAgICAgIGVuID0gJ2Zvcm1hdHRlcjonICsgKChzZWxlY3Rpb25TdHIgPT09ICcnKSA/ICdoaWRlJyA6ICdwb3NpdGlvbicpO1xuXG4gICAgICAgIGJsb2NrLm1lZGlhdG9yLnRyaWdnZXIoZW4sIGJsb2NrKTtcbiAgICAgICAgRXZlbnRCdXMudHJpZ2dlcihlbiwgYmxvY2spO1xuICAgICAgfSwgMSk7XG4gICAgfSxcblxuICAgIGNsZWFySW5zZXJ0ZWRTdHlsZXM6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldDtcbiAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7IC8vIEhhY2t5IGZpeCBmb3IgQ2hyb21lLlxuICAgIH0sXG5cbiAgICBoYXNUZXh0QmxvY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGV4dEJsb2NrKCkubGVuZ3RoID4gMDtcbiAgICB9LFxuXG4gICAgZ2V0VGV4dEJsb2NrOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHRoaXMudGV4dF9ibG9jaykpIHtcbiAgICAgICAgdGhpcy50ZXh0X2Jsb2NrID0gdGhpcy4kKCcuc3QtdGV4dC1ibG9jaycpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy50ZXh0X2Jsb2NrO1xuICAgIH0sXG5cbiAgICBpc0VtcHR5OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLmlzRW1wdHkodGhpcy5nZXRCbG9ja0RhdGEoKSk7XG4gICAgfVxuXG59KTtcblxuQmxvY2suZXh0ZW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2V4dGVuZCcpOyAvLyBBbGxvdyBvdXIgQmxvY2sgdG8gYmUgZXh0ZW5kZWQuXG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2s7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbWl4aW5OYW1lOiBcIkFqYXhhYmxlXCIsXG5cbiAgYWpheGFibGU6IHRydWUsXG5cbiAgaW5pdGlhbGl6ZUFqYXhhYmxlOiBmdW5jdGlvbigpe1xuICAgIHRoaXMuX3F1ZXVlZCA9IFtdO1xuICB9LFxuXG4gIGFkZFF1ZXVlZEl0ZW06IGZ1bmN0aW9uKG5hbWUsIGRlZmVycmVkKSB7XG4gICAgdXRpbHMubG9nKFwiQWRkaW5nIHF1ZXVlZCBpdGVtIGZvciBcIiArIHRoaXMuYmxvY2tJRCArIFwiIGNhbGxlZCBcIiArIG5hbWUpO1xuXG4gICAgdGhpcy5fcXVldWVkLnB1c2goeyBuYW1lOiBuYW1lLCBkZWZlcnJlZDogZGVmZXJyZWQgfSk7XG4gIH0sXG5cbiAgcmVtb3ZlUXVldWVkSXRlbTogZnVuY3Rpb24obmFtZSkge1xuICAgIHV0aWxzLmxvZyhcIlJlbW92aW5nIHF1ZXVlZCBpdGVtIGZvciBcIiArIHRoaXMuYmxvY2tJRCArIFwiIGNhbGxlZCBcIiArIG5hbWUpO1xuXG4gICAgdGhpcy5fcXVldWVkID0gdGhpcy5fcXVldWVkLmZpbHRlcihmdW5jdGlvbihxdWV1ZWQpIHtcbiAgICAgIHJldHVybiBxdWV1ZWQubmFtZSAhPT0gbmFtZTtcbiAgICB9KTtcbiAgfSxcblxuICBoYXNJdGVtc0luUXVldWU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9xdWV1ZWQubGVuZ3RoID4gMDtcbiAgfSxcblxuICByZXNvbHZlQWxsSW5RdWV1ZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fcXVldWVkLmZvckVhY2goZnVuY3Rpb24oaXRlbSl7XG4gICAgICB1dGlscy5sb2coXCJBYm9ydGluZyBxdWV1ZWQgcmVxdWVzdDogXCIgKyBpdGVtLm5hbWUpO1xuICAgICAgaXRlbS5kZWZlcnJlZC5hYm9ydCgpO1xuICAgIH0sIHRoaXMpO1xuICB9XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbWl4aW5OYW1lOiBcIkNvbnRyb2xsYWJsZVwiLFxuXG4gIGluaXRpYWxpemVDb250cm9sbGFibGU6IGZ1bmN0aW9uKCkge1xuICAgIHV0aWxzLmxvZyhcIkFkZGluZyBjb250cm9sbGFibGUgdG8gYmxvY2sgXCIgKyB0aGlzLmJsb2NrSUQpO1xuICAgIHRoaXMuJGNvbnRyb2xfdWkgPSAkKCc8ZGl2PicsIHsnY2xhc3MnOiAnc3QtYmxvY2tfX2NvbnRyb2wtdWknfSk7XG4gICAgT2JqZWN0LmtleXModGhpcy5jb250cm9scykuZm9yRWFjaChcbiAgICAgIGZ1bmN0aW9uKGNtZCkge1xuICAgICAgICAvLyBCaW5kIGNvbmZpZ3VyZWQgaGFuZGxlciB0byBjdXJyZW50IGJsb2NrIGNvbnRleHRcbiAgICAgICAgdGhpcy5hZGRVaUNvbnRyb2woY21kLCB0aGlzLmNvbnRyb2xzW2NtZF0uYmluZCh0aGlzKSk7XG4gICAgICB9LFxuICAgICAgdGhpc1xuICAgICk7XG4gICAgdGhpcy4kaW5uZXIuYXBwZW5kKHRoaXMuJGNvbnRyb2xfdWkpO1xuICB9LFxuXG4gIGdldENvbnRyb2xUZW1wbGF0ZTogZnVuY3Rpb24oY21kKSB7XG4gICAgcmV0dXJuICQoXCI8YT5cIixcbiAgICAgIHsgJ2RhdGEtaWNvbic6IGNtZCxcbiAgICAgICAgJ2NsYXNzJzogJ3N0LWljb24gc3QtYmxvY2stY29udHJvbC11aS1idG4gc3QtYmxvY2stY29udHJvbC11aS1idG4tLScgKyBjbWRcbiAgICAgIH0pO1xuICB9LFxuXG4gIGFkZFVpQ29udHJvbDogZnVuY3Rpb24oY21kLCBoYW5kbGVyKSB7XG4gICAgdGhpcy4kY29udHJvbF91aS5hcHBlbmQodGhpcy5nZXRDb250cm9sVGVtcGxhdGUoY21kKSk7XG4gICAgdGhpcy4kY29udHJvbF91aS5vbignY2xpY2snLCAnLnN0LWJsb2NrLWNvbnRyb2wtdWktYnRuLS0nICsgY21kLCBoYW5kbGVyKTtcbiAgfVxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBBZGRzIGRyb3AgZnVuY3Rpb25hbHRpeSB0byB0aGlzIGJsb2NrICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vbG9kYXNoJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vY29uZmlnJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuLi9ldmVudC1idXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbWl4aW5OYW1lOiBcIkRyb3BwYWJsZVwiLFxuICB2YWxpZF9kcm9wX2ZpbGVfdHlwZXM6IFsnRmlsZScsICdGaWxlcycsICd0ZXh0L3BsYWluJywgJ3RleHQvdXJpLWxpc3QnXSxcblxuICBpbml0aWFsaXplRHJvcHBhYmxlOiBmdW5jdGlvbigpIHtcbiAgICB1dGlscy5sb2coXCJBZGRpbmcgZHJvcHBhYmxlIHRvIGJsb2NrIFwiICsgdGhpcy5ibG9ja0lEKTtcblxuICAgIHRoaXMuZHJvcF9vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnLmRlZmF1bHRzLkJsb2NrLmRyb3Bfb3B0aW9ucywgdGhpcy5kcm9wX29wdGlvbnMpO1xuXG4gICAgdmFyIGRyb3BfaHRtbCA9ICQoXy50ZW1wbGF0ZSh0aGlzLmRyb3Bfb3B0aW9ucy5odG1sLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBibG9jazogdGhpcywgXzogXyB9KSk7XG5cbiAgICB0aGlzLiRlZGl0b3IuaGlkZSgpO1xuICAgIHRoaXMuJGlucHV0cy5hcHBlbmQoZHJvcF9odG1sKTtcbiAgICB0aGlzLiRkcm9wem9uZSA9IGRyb3BfaHRtbDtcblxuICAgIC8vIEJpbmQgb3VyIGRyb3AgZXZlbnRcbiAgICB0aGlzLiRkcm9wem9uZS5kcm9wQXJlYSgpXG4gICAgICAgICAgICAgICAgICAuYmluZCgnZHJvcCcsIHRoaXMuX2hhbmRsZURyb3AuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLiRpbm5lci5hZGRDbGFzcygnc3QtYmxvY2tfX2lubmVyLS1kcm9wcGFibGUnKTtcbiAgfSxcblxuICBfaGFuZGxlRHJvcDogZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGUgPSBlLm9yaWdpbmFsRXZlbnQ7XG5cbiAgICB2YXIgZWwgPSAkKGUudGFyZ2V0KSxcbiAgICAgICAgdHlwZXMgPSBlLmRhdGFUcmFuc2Zlci50eXBlcztcblxuICAgIGVsLnJlbW92ZUNsYXNzKCdzdC1kcm9wem9uZS0tZHJhZ292ZXInKTtcblxuICAgIC8qXG4gICAgICBDaGVjayB0aGUgdHlwZSB3ZSBqdXN0IHJlY2VpdmVkLFxuICAgICAgZGVsZWdhdGUgaXQgYXdheSB0byBvdXIgYmxvY2tUeXBlcyB0byBwcm9jZXNzXG4gICAgKi9cblxuICAgIGlmICh0eXBlcyAmJlxuICAgICAgICB0eXBlcy5zb21lKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkX2Ryb3BfZmlsZV90eXBlcy5pbmNsdWRlcyh0eXBlKTtcbiAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSkge1xuICAgICAgdGhpcy5vbkRyb3AoZS5kYXRhVHJhbnNmZXIpO1xuICAgIH1cblxuICAgIEV2ZW50QnVzLnRyaWdnZXIoJ2Jsb2NrOmNvbnRlbnQ6ZHJvcHBlZCcsIHRoaXMuYmxvY2tJRCk7XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBtaXhpbk5hbWU6IFwiRmV0Y2hhYmxlXCIsXG5cbiAgaW5pdGlhbGl6ZUZldGNoYWJsZTogZnVuY3Rpb24oKXtcbiAgICB0aGlzLndpdGhNaXhpbihyZXF1aXJlKCcuL2FqYXhhYmxlJykpO1xuICB9LFxuXG4gIGZldGNoOiBmdW5jdGlvbihvcHRpb25zLCBzdWNjZXNzLCBmYWlsdXJlKXtcbiAgICB2YXIgdWlkID0gXy51bmlxdWVJZCh0aGlzLmJsb2NrSUQgKyBcIl9mZXRjaFwiKSxcbiAgICAgICAgeGhyID0gJC5hamF4KG9wdGlvbnMpO1xuXG4gICAgdGhpcy5yZXNldE1lc3NhZ2VzKCk7XG4gICAgdGhpcy5hZGRRdWV1ZWRJdGVtKHVpZCwgeGhyKTtcblxuICAgIGlmKCFfLmlzVW5kZWZpbmVkKHN1Y2Nlc3MpKSB7XG4gICAgICB4aHIuZG9uZShzdWNjZXNzLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGlmKCFfLmlzVW5kZWZpbmVkKGZhaWx1cmUpKSB7XG4gICAgICB4aHIuZmFpbChmYWlsdXJlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHhoci5hbHdheXModGhpcy5yZW1vdmVRdWV1ZWRJdGVtLmJpbmQodGhpcywgdWlkKSk7XG5cbiAgICByZXR1cm4geGhyO1xuICB9XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEFqYXhhYmxlOiByZXF1aXJlKCcuL2FqYXhhYmxlLmpzJyksXG4gIENvbnRyb2xsYWJsZTogcmVxdWlyZSgnLi9jb250cm9sbGFibGUuanMnKSxcbiAgRHJvcHBhYmxlOiByZXF1aXJlKCcuL2Ryb3BwYWJsZS5qcycpLFxuICBGZXRjaGFibGU6IHJlcXVpcmUoJy4vZmV0Y2hhYmxlLmpzJyksXG4gIFBhc3RhYmxlOiByZXF1aXJlKCcuL3Bhc3RhYmxlLmpzJyksXG4gIFVwbG9hZGFibGU6IHJlcXVpcmUoJy4vdXBsb2FkYWJsZS5qcycpLFxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uL2NvbmZpZycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbWl4aW5OYW1lOiBcIlBhc3RhYmxlXCIsXG5cbiAgaW5pdGlhbGl6ZVBhc3RhYmxlOiBmdW5jdGlvbigpIHtcbiAgICB1dGlscy5sb2coXCJBZGRpbmcgcGFzdGFibGUgdG8gYmxvY2sgXCIgKyB0aGlzLmJsb2NrSUQpO1xuXG4gICAgdGhpcy5wYXN0ZV9vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnLmRlZmF1bHRzLkJsb2NrLnBhc3RlX29wdGlvbnMsIHRoaXMucGFzdGVfb3B0aW9ucyk7XG4gICAgdGhpcy4kaW5wdXRzLmFwcGVuZChfLnRlbXBsYXRlKHRoaXMucGFzdGVfb3B0aW9ucy5odG1sLCB0aGlzKSk7XG5cbiAgICB0aGlzLiQoJy5zdC1wYXN0ZS1ibG9jaycpXG4gICAgICAuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpeyAkKHRoaXMpLnNlbGVjdCgpOyB9KVxuICAgICAgLmJpbmQoJ3Bhc3RlJywgdGhpcy5faGFuZGxlQ29udGVudFBhc3RlKVxuICAgICAgLmJpbmQoJ3N1Ym1pdCcsIHRoaXMuX2hhbmRsZUNvbnRlbnRQYXN0ZSk7XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uL2NvbmZpZycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIGZpbGVVcGxvYWRlciA9IHJlcXVpcmUoJy4uL2V4dGVuc2lvbnMvZmlsZS11cGxvYWRlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBtaXhpbk5hbWU6IFwiVXBsb2FkYWJsZVwiLFxuXG4gIHVwbG9hZHNDb3VudDogMCxcblxuICBpbml0aWFsaXplVXBsb2FkYWJsZTogZnVuY3Rpb24oKSB7XG4gICAgdXRpbHMubG9nKFwiQWRkaW5nIHVwbG9hZGFibGUgdG8gYmxvY2sgXCIgKyB0aGlzLmJsb2NrSUQpO1xuICAgIHRoaXMud2l0aE1peGluKHJlcXVpcmUoJy4vYWpheGFibGUnKSk7XG5cbiAgICB0aGlzLnVwbG9hZF9vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnLmRlZmF1bHRzLkJsb2NrLnVwbG9hZF9vcHRpb25zLCB0aGlzLnVwbG9hZF9vcHRpb25zKTtcbiAgICB0aGlzLiRpbnB1dHMuYXBwZW5kKF8udGVtcGxhdGUodGhpcy51cGxvYWRfb3B0aW9ucy5odG1sLCB0aGlzKSk7XG4gIH0sXG5cbiAgdXBsb2FkZXI6IGZ1bmN0aW9uKGZpbGUsIHN1Y2Nlc3MsIGZhaWx1cmUpe1xuICAgIHJldHVybiBmaWxlVXBsb2FkZXIodGhpcywgZmlsZSwgc3VjY2VzcywgZmFpbHVyZSk7XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBIZWFkaW5nIEJsb2NrXG4qL1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xudmFyIHN0VG9IVE1MID0gcmVxdWlyZSgnLi4vdG8taHRtbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrLmV4dGVuZCh7XG5cbiAgdHlwZTogJ0hlYWRpbmcnLFxuXG4gIHRpdGxlOiBmdW5jdGlvbigpeyByZXR1cm4gaTE4bi50KCdibG9ja3M6aGVhZGluZzp0aXRsZScpOyB9LFxuXG4gIGVkaXRvckhUTUw6ICc8ZGl2IGNsYXNzPVwic3QtcmVxdWlyZWQgc3QtdGV4dC1ibG9jayBzdC10ZXh0LWJsb2NrLS1oZWFkaW5nXCIgY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiPjwvZGl2PicsXG5cbiAgaWNvbl9uYW1lOiAnaGVhZGluZycsXG5cbiAgbG9hZERhdGE6IGZ1bmN0aW9uKGRhdGEpe1xuICAgIHRoaXMuZ2V0VGV4dEJsb2NrKCkuaHRtbChzdFRvSFRNTChkYXRhLnRleHQsIHRoaXMudHlwZSkpO1xuICB9XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrLmV4dGVuZCh7XG5cbiAgdHlwZTogXCJpbWFnZVwiLFxuICB0aXRsZTogZnVuY3Rpb24oKSB7IHJldHVybiBpMThuLnQoJ2Jsb2NrczppbWFnZTp0aXRsZScpOyB9LFxuXG4gIGRyb3BwYWJsZTogdHJ1ZSxcbiAgdXBsb2FkYWJsZTogdHJ1ZSxcblxuICBpY29uX25hbWU6ICdpbWFnZScsXG5cbiAgbG9hZERhdGE6IGZ1bmN0aW9uKGRhdGEpe1xuICAgIC8vIENyZWF0ZSBvdXIgaW1hZ2UgdGFnXG4gICAgdGhpcy4kZWRpdG9yLmh0bWwoJCgnPGltZz4nLCB7IHNyYzogZGF0YS5maWxlLnVybCB9KSk7XG4gIH0sXG5cbiAgb25CbG9ja1JlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAvKiBTZXR1cCB0aGUgdXBsb2FkIGJ1dHRvbiAqL1xuICAgIHRoaXMuJGlucHV0cy5maW5kKCdidXR0b24nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKGV2KXsgZXYucHJldmVudERlZmF1bHQoKTsgfSk7XG4gICAgdGhpcy4kaW5wdXRzLmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsIChmdW5jdGlvbihldikge1xuICAgICAgdGhpcy5vbkRyb3AoZXYuY3VycmVudFRhcmdldCk7XG4gICAgfSkuYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgb25Ecm9wOiBmdW5jdGlvbih0cmFuc2ZlckRhdGEpe1xuICAgIHZhciBmaWxlID0gdHJhbnNmZXJEYXRhLmZpbGVzWzBdLFxuICAgICAgICB1cmxBUEkgPSAodHlwZW9mIFVSTCAhPT0gXCJ1bmRlZmluZWRcIikgPyBVUkwgOiAodHlwZW9mIHdlYmtpdFVSTCAhPT0gXCJ1bmRlZmluZWRcIikgPyB3ZWJraXRVUkwgOiBudWxsO1xuXG4gICAgLy8gSGFuZGxlIG9uZSB1cGxvYWQgYXQgYSB0aW1lXG4gICAgaWYgKC9pbWFnZS8udGVzdChmaWxlLnR5cGUpKSB7XG4gICAgICB0aGlzLmxvYWRpbmcoKTtcbiAgICAgIC8vIFNob3cgdGhpcyBpbWFnZSBvbiBoZXJlXG4gICAgICB0aGlzLiRpbnB1dHMuaGlkZSgpO1xuICAgICAgdGhpcy4kZWRpdG9yLmh0bWwoJCgnPGltZz4nLCB7IHNyYzogdXJsQVBJLmNyZWF0ZU9iamVjdFVSTChmaWxlKSB9KSkuc2hvdygpO1xuXG4gICAgICB0aGlzLnVwbG9hZGVyKFxuICAgICAgICBmaWxlLFxuICAgICAgICBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdGhpcy5zZXREYXRhKGRhdGEpO1xuICAgICAgICAgIHRoaXMucmVhZHkoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICB0aGlzLmFkZE1lc3NhZ2UoaTE4bi50KCdibG9ja3M6aW1hZ2U6dXBsb2FkX2Vycm9yJykpO1xuICAgICAgICAgIHRoaXMucmVhZHkoKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gIH1cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBUZXh0OiByZXF1aXJlKCcuL3RleHQnKSxcbiAgUXVvdGU6IHJlcXVpcmUoJy4vcXVvdGUnKSxcbiAgSW1hZ2U6IHJlcXVpcmUoJy4vaW1hZ2UnKSxcbiAgSGVhZGluZzogcmVxdWlyZSgnLi9oZWFkaW5nJyksXG4gIExpc3Q6IHJlcXVpcmUoJy4vbGlzdCcpLFxuICBUd2VldDogcmVxdWlyZSgnLi90d2VldCcpLFxuICBWaWRlbzogcmVxdWlyZSgnLi92aWRlbycpLFxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xudmFyIHN0VG9IVE1MID0gcmVxdWlyZSgnLi4vdG8taHRtbCcpO1xuXG52YXIgdGVtcGxhdGUgPSAnPGRpdiBjbGFzcz1cInN0LXRleHQtYmxvY2sgc3QtcmVxdWlyZWRcIiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCI+PHVsPjxsaT48L2xpPjwvdWw+PC9kaXY+JztcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jay5leHRlbmQoe1xuXG4gIHR5cGU6ICdsaXN0JyxcblxuICB0aXRsZTogZnVuY3Rpb24oKSB7IHJldHVybiBpMThuLnQoJ2Jsb2NrczpsaXN0OnRpdGxlJyk7IH0sXG5cbiAgaWNvbl9uYW1lOiAnbGlzdCcsXG5cbiAgZWRpdG9ySFRNTDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8udGVtcGxhdGUodGVtcGxhdGUsIHRoaXMpO1xuICB9LFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbihkYXRhKXtcbiAgICB0aGlzLmdldFRleHRCbG9jaygpLmh0bWwoXCI8dWw+XCIgKyBzdFRvSFRNTChkYXRhLnRleHQsIHRoaXMudHlwZSkgKyBcIjwvdWw+XCIpO1xuICB9LFxuXG4gIG9uQmxvY2tSZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2hlY2tGb3JMaXN0ID0gdGhpcy5jaGVja0Zvckxpc3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLmdldFRleHRCbG9jaygpLm9uKCdjbGljayBrZXl1cCcsIHRoaXMuY2hlY2tGb3JMaXN0KTtcbiAgICB0aGlzLmZvY3VzKCk7XG4gIH0sXG5cbiAgY2hlY2tGb3JMaXN0OiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy4kKCd1bCcpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJpbnNlcnRVbm9yZGVyZWRMaXN0XCIsIGZhbHNlLCBmYWxzZSk7XG4gICAgfVxuICB9LFxuXG4gIHRvTWFya2Rvd246IGZ1bmN0aW9uKG1hcmtkb3duKSB7XG4gICAgcmV0dXJuIG1hcmtkb3duLnJlcGxhY2UoLzxcXC9saT4vbWcsXCJcXG5cIilcbiAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPFxcLz9bXj5dKyg+fCQpL2csIFwiXCIpXG4gICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14oLispJC9tZyxcIiAtICQxXCIpO1xuICB9LFxuXG4gIHRvSFRNTDogZnVuY3Rpb24oaHRtbCkge1xuICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoL14gLSAoLispJC9tZyxcIjxsaT4kMTwvbGk+XCIpXG4gICAgICAgICAgICAgICAucmVwbGFjZSgvXFxuL21nLCBcIlwiKTtcblxuICAgIHJldHVybiBodG1sO1xuICB9LFxuXG4gIG9uQ29udGVudFBhc3RlZDogZnVuY3Rpb24oZXZlbnQsIHRhcmdldCkge1xuICAgIHRoaXMuJCgndWwnKS5odG1sKFxuICAgICAgdGhpcy5wYXN0ZWRNYXJrZG93blRvSFRNTCh0YXJnZXRbMF0uaW5uZXJIVE1MKSk7XG4gICAgdGhpcy5nZXRUZXh0QmxvY2soKS5jYXJldFRvRW5kKCk7XG4gIH0sXG5cbiAgaXNFbXB0eTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8uaXNFbXB0eSh0aGlzLmdldEJsb2NrRGF0YSgpLnRleHQpO1xuICB9XG5cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIEJsb2NrIFF1b3RlXG4qL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xudmFyIHN0VG9IVE1MID0gcmVxdWlyZSgnLi4vdG8taHRtbCcpO1xuXG52YXIgdGVtcGxhdGUgPSBfLnRlbXBsYXRlKFtcbiAgJzxibG9ja3F1b3RlIGNsYXNzPVwic3QtcmVxdWlyZWQgc3QtdGV4dC1ibG9ja1wiIGNvbnRlbnRlZGl0YWJsZT1cInRydWVcIj48L2Jsb2NrcXVvdGU+JyxcbiAgJzxsYWJlbCBjbGFzcz1cInN0LWlucHV0LWxhYmVsXCI+IDwlPSBpMThuLnQoXCJibG9ja3M6cXVvdGU6Y3JlZGl0X2ZpZWxkXCIpICU+PC9sYWJlbD4nLFxuICAnPGlucHV0IG1heGxlbmd0aD1cIjE0MFwiIG5hbWU9XCJjaXRlXCIgcGxhY2Vob2xkZXI9XCI8JT0gaTE4bi50KFwiYmxvY2tzOnF1b3RlOmNyZWRpdF9maWVsZFwiKSAlPlwiJyxcbiAgJyBjbGFzcz1cInN0LWlucHV0LXN0cmluZyBzdC1yZXF1aXJlZCBqcy1jaXRlLWlucHV0XCIgdHlwZT1cInRleHRcIiAvPidcbl0uam9pbihcIlxcblwiKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2suZXh0ZW5kKHtcblxuICB0eXBlOiBcInF1b3RlXCIsXG5cbiAgdGl0bGU6IGZ1bmN0aW9uKCkgeyByZXR1cm4gaTE4bi50KCdibG9ja3M6cXVvdGU6dGl0bGUnKTsgfSxcblxuICBpY29uX25hbWU6ICdxdW90ZScsXG5cbiAgZWRpdG9ySFRNTDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRlbXBsYXRlKHRoaXMpO1xuICB9LFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbihkYXRhKXtcbiAgICB0aGlzLmdldFRleHRCbG9jaygpLmh0bWwoc3RUb0hUTUwoZGF0YS50ZXh0LCB0aGlzLnR5cGUpKTtcbiAgICB0aGlzLiQoJy5qcy1jaXRlLWlucHV0JykudmFsKGRhdGEuY2l0ZSk7XG4gIH0sXG5cbiAgdG9NYXJrZG93bjogZnVuY3Rpb24obWFya2Rvd24pIHtcbiAgICByZXR1cm4gbWFya2Rvd24ucmVwbGFjZSgvXiguKykkL21nLFwiPiAkMVwiKTtcbiAgfVxuXG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBUZXh0IEJsb2NrXG4qL1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xudmFyIHN0VG9IVE1MID0gcmVxdWlyZSgnLi4vdG8taHRtbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrLmV4dGVuZCh7XG5cbiAgdHlwZTogXCJ0ZXh0XCIsXG5cbiAgdGl0bGU6IGZ1bmN0aW9uKCkgeyByZXR1cm4gaTE4bi50KCdibG9ja3M6dGV4dDp0aXRsZScpOyB9LFxuXG4gIGVkaXRvckhUTUw6ICc8ZGl2IGNsYXNzPVwic3QtcmVxdWlyZWQgc3QtdGV4dC1ibG9ja1wiIGNvbnRlbnRlZGl0YWJsZT1cInRydWVcIj48L2Rpdj4nLFxuXG4gIGljb25fbmFtZTogJ3RleHQnLFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbihkYXRhKXtcbiAgICB0aGlzLmdldFRleHRCbG9jaygpLmh0bWwoc3RUb0hUTUwoZGF0YS50ZXh0LCB0aGlzLnR5cGUpKTtcbiAgfVxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuLi9sb2Rhc2gnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbnZhciBCbG9jayA9IHJlcXVpcmUoJy4uL2Jsb2NrJyk7XG5cbnZhciB0d2VldF90ZW1wbGF0ZSA9IF8udGVtcGxhdGUoW1xuICBcIjxibG9ja3F1b3RlIGNsYXNzPSd0d2l0dGVyLXR3ZWV0JyBhbGlnbj0nY2VudGVyJz5cIixcbiAgXCI8cD48JT0gdGV4dCAlPjwvcD5cIixcbiAgXCImbWRhc2g7IDwlPSB1c2VyLm5hbWUgJT4gKEA8JT0gdXNlci5zY3JlZW5fbmFtZSAlPilcIixcbiAgXCI8YSBocmVmPSc8JT0gc3RhdHVzX3VybCAlPicgZGF0YS1kYXRldGltZT0nPCU9IGNyZWF0ZWRfYXQgJT4nPjwlPSBjcmVhdGVkX2F0ICU+PC9hPlwiLFxuICBcIjwvYmxvY2txdW90ZT5cIixcbiAgJzxzY3JpcHQgc3JjPVwiLy9wbGF0Zm9ybS50d2l0dGVyLmNvbS93aWRnZXRzLmpzXCIgY2hhcnNldD1cInV0Zi04XCI+PC9zY3JpcHQ+J1xuXS5qb2luKFwiXFxuXCIpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jay5leHRlbmQoe1xuXG4gIHR5cGU6IFwidHdlZXRcIixcbiAgZHJvcHBhYmxlOiB0cnVlLFxuICBwYXN0YWJsZTogdHJ1ZSxcbiAgZmV0Y2hhYmxlOiB0cnVlLFxuXG4gIGRyb3Bfb3B0aW9uczoge1xuICAgIHJlX3JlbmRlcl9vbl9yZW9yZGVyOiB0cnVlXG4gIH0sXG5cbiAgdGl0bGU6IGZ1bmN0aW9uKCl7IHJldHVybiBpMThuLnQoJ2Jsb2Nrczp0d2VldDp0aXRsZScpOyB9LFxuXG4gIGZldGNoVXJsOiBmdW5jdGlvbih0d2VldElEKSB7XG4gICAgcmV0dXJuIFwiL3R3ZWV0cy8/dHdlZXRfaWQ9XCIgKyB0d2VldElEO1xuICB9LFxuXG4gIGljb25fbmFtZTogJ3R3aXR0ZXInLFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKF8uaXNVbmRlZmluZWQoZGF0YS5zdGF0dXNfdXJsKSkgeyBkYXRhLnN0YXR1c191cmwgPSAnJzsgfVxuICAgIHRoaXMuJGlubmVyLmZpbmQoJ2lmcmFtZScpLnJlbW92ZSgpO1xuICAgIHRoaXMuJGlubmVyLnByZXBlbmQodHdlZXRfdGVtcGxhdGUoZGF0YSkpO1xuICB9LFxuXG4gIG9uQ29udGVudFBhc3RlZDogZnVuY3Rpb24oZXZlbnQpe1xuICAgIC8vIENvbnRlbnQgcGFzdGVkLiBEZWxlZ2F0ZSB0byB0aGUgZHJvcCBwYXJzZSBtZXRob2RcbiAgICB2YXIgaW5wdXQgPSAkKGV2ZW50LnRhcmdldCksXG4gICAgdmFsID0gaW5wdXQudmFsKCk7XG5cbiAgICAvLyBQYXNzIHRoaXMgdG8gdGhlIHNhbWUgaGFuZGxlciBhcyBvbkRyb3BcbiAgICB0aGlzLmhhbmRsZVR3aXR0ZXJEcm9wUGFzdGUodmFsKTtcbiAgfSxcblxuICBoYW5kbGVUd2l0dGVyRHJvcFBhc3RlOiBmdW5jdGlvbih1cmwpe1xuICAgIGlmICghdGhpcy52YWxpZFR3ZWV0VXJsKHVybCkpIHtcbiAgICAgIHV0aWxzLmxvZyhcIkludmFsaWQgVHdlZXQgVVJMXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFR3aXR0ZXIgc3RhdHVzXG4gICAgdmFyIHR3ZWV0SUQgPSB1cmwubWF0Y2goL1teXFwvXSskLyk7XG4gICAgaWYgKCFfLmlzRW1wdHkodHdlZXRJRCkpIHtcbiAgICAgIHRoaXMubG9hZGluZygpO1xuICAgICAgdHdlZXRJRCA9IHR3ZWV0SURbMF07XG5cbiAgICAgIHZhciBhamF4T3B0aW9ucyA9IHtcbiAgICAgICAgdXJsOiB0aGlzLmZldGNoVXJsKHR3ZWV0SUQpLFxuICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuZmV0Y2goYWpheE9wdGlvbnMsIHRoaXMub25Ud2VldFN1Y2Nlc3MsIHRoaXMub25Ud2VldEZhaWwpO1xuICAgIH1cbiAgfSxcblxuICB2YWxpZFR3ZWV0VXJsOiBmdW5jdGlvbih1cmwpIHtcbiAgICByZXR1cm4gKHV0aWxzLmlzVVJJKHVybCkgJiZcbiAgICAgICAgICAgIHVybC5pbmRleE9mKFwidHdpdHRlclwiKSAhPT0gLTEgJiZcbiAgICAgICAgICAgIHVybC5pbmRleE9mKFwic3RhdHVzXCIpICE9PSAtMSk7XG4gIH0sXG5cbiAgb25Ud2VldFN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAvLyBQYXJzZSB0aGUgdHdpdHRlciBvYmplY3QgaW50byBzb21ldGhpbmcgYSBiaXQgc2xpbW1lci4uXG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIHVzZXI6IHtcbiAgICAgICAgcHJvZmlsZV9pbWFnZV91cmw6IGRhdGEudXNlci5wcm9maWxlX2ltYWdlX3VybCxcbiAgICAgICAgcHJvZmlsZV9pbWFnZV91cmxfaHR0cHM6IGRhdGEudXNlci5wcm9maWxlX2ltYWdlX3VybF9odHRwcyxcbiAgICAgICAgc2NyZWVuX25hbWU6IGRhdGEudXNlci5zY3JlZW5fbmFtZSxcbiAgICAgICAgbmFtZTogZGF0YS51c2VyLm5hbWVcbiAgICAgIH0sXG4gICAgICBpZDogZGF0YS5pZF9zdHIsXG4gICAgICB0ZXh0OiBkYXRhLnRleHQsXG4gICAgICBjcmVhdGVkX2F0OiBkYXRhLmNyZWF0ZWRfYXQsXG4gICAgICBlbnRpdGllczogZGF0YS5lbnRpdGllcyxcbiAgICAgIHN0YXR1c191cmw6IFwiaHR0cHM6Ly90d2l0dGVyLmNvbS9cIiArIGRhdGEudXNlci5zY3JlZW5fbmFtZSArIFwiL3N0YXR1cy9cIiArIGRhdGEuaWRfc3RyXG4gICAgfTtcblxuICAgIHRoaXMuc2V0QW5kTG9hZERhdGEob2JqKTtcbiAgICB0aGlzLnJlYWR5KCk7XG4gIH0sXG5cbiAgb25Ud2VldEZhaWw6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYWRkTWVzc2FnZShpMThuLnQoXCJibG9ja3M6dHdlZXQ6ZmV0Y2hfZXJyb3JcIikpO1xuICAgIHRoaXMucmVhZHkoKTtcbiAgfSxcblxuICBvbkRyb3A6IGZ1bmN0aW9uKHRyYW5zZmVyRGF0YSl7XG4gICAgdmFyIHVybCA9IHRyYW5zZmVyRGF0YS5nZXREYXRhKCd0ZXh0L3BsYWluJyk7XG4gICAgdGhpcy5oYW5kbGVUd2l0dGVyRHJvcFBhc3RlKHVybCk7XG4gIH1cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrLmV4dGVuZCh7XG5cbiAgLy8gbW9yZSBwcm92aWRlcnMgYXQgaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vamVmZmxpbmcvYTk2MjlhZTI4ZTA3Njc4NWExNGZcbiAgcHJvdmlkZXJzOiB7XG4gICAgdmltZW86IHtcbiAgICAgIHJlZ2V4OiAvKD86aHR0cFtzXT86XFwvXFwvKT8oPzp3d3cuKT92aW1lby5jb21cXC8oLispLyxcbiAgICAgIGh0bWw6IFwiPGlmcmFtZSBzcmM9XFxcInt7cHJvdG9jb2x9fS8vcGxheWVyLnZpbWVvLmNvbS92aWRlby97e3JlbW90ZV9pZH19P3RpdGxlPTAmYnlsaW5lPTBcXFwiIHdpZHRoPVxcXCI1ODBcXFwiIGhlaWdodD1cXFwiMzIwXFxcIiBmcmFtZWJvcmRlcj1cXFwiMFxcXCI+PC9pZnJhbWU+XCJcbiAgICB9LFxuICAgIHlvdXR1YmU6IHtcbiAgICAgIHJlZ2V4OiAvKD86aHR0cFtzXT86XFwvXFwvKT8oPzp3d3cuKT8oPzooPzp5b3V0dWJlLmNvbVxcL3dhdGNoXFw/KD86LiopKD86dj0pKXwoPzp5b3V0dS5iZVxcLykpKFteJl0uKykvLFxuICAgICAgaHRtbDogXCI8aWZyYW1lIHNyYz1cXFwie3twcm90b2NvbH19Ly93d3cueW91dHViZS5jb20vZW1iZWQve3tyZW1vdGVfaWR9fVxcXCIgd2lkdGg9XFxcIjU4MFxcXCIgaGVpZ2h0PVxcXCIzMjBcXFwiIGZyYW1lYm9yZGVyPVxcXCIwXFxcIiBhbGxvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+XCJcbiAgICB9XG4gIH0sXG5cbiAgdHlwZTogJ3ZpZGVvJyxcbiAgdGl0bGU6IGZ1bmN0aW9uKCkgeyByZXR1cm4gaTE4bi50KCdibG9ja3M6dmlkZW86dGl0bGUnKTsgfSxcblxuICBkcm9wcGFibGU6IHRydWUsXG4gIHBhc3RhYmxlOiB0cnVlLFxuXG4gIGljb25fbmFtZTogJ3ZpZGVvJyxcblxuICBsb2FkRGF0YTogZnVuY3Rpb24oZGF0YSl7XG4gICAgaWYgKCF0aGlzLnByb3ZpZGVycy5oYXNPd25Qcm9wZXJ0eShkYXRhLnNvdXJjZSkpIHsgcmV0dXJuOyB9XG5cbiAgICBpZiAodGhpcy5wcm92aWRlcnNbZGF0YS5zb3VyY2VdLnNxdWFyZSkge1xuICAgICAgdGhpcy4kZWRpdG9yLmFkZENsYXNzKCdzdC1ibG9ja19fZWRpdG9yLS13aXRoLXNxdWFyZS1tZWRpYScpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiRlZGl0b3IuYWRkQ2xhc3MoJ3N0LWJsb2NrX19lZGl0b3ItLXdpdGgtc2l4dGVlbi1ieS1uaW5lLW1lZGlhJyk7XG4gICAgfVxuXG4gICAgdmFyIGVtYmVkX3N0cmluZyA9IHRoaXMucHJvdmlkZXJzW2RhdGEuc291cmNlXS5odG1sXG4gICAgLnJlcGxhY2UoJ3t7cHJvdG9jb2x9fScsIHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbClcbiAgICAucmVwbGFjZSgne3tyZW1vdGVfaWR9fScsIGRhdGEucmVtb3RlX2lkKVxuICAgIC5yZXBsYWNlKCd7e3dpZHRofX0nLCB0aGlzLiRlZGl0b3Iud2lkdGgoKSk7IC8vIGZvciB2aWRlb3MgdGhhdCBjYW4ndCByZXNpemUgYXV0b21hdGljYWxseSBsaWtlIHZpbmVcblxuICAgIHRoaXMuJGVkaXRvci5odG1sKGVtYmVkX3N0cmluZyk7XG4gIH0sXG5cbiAgb25Db250ZW50UGFzdGVkOiBmdW5jdGlvbihldmVudCl7XG4gICAgdGhpcy5oYW5kbGVEcm9wUGFzdGUoJChldmVudC50YXJnZXQpLnZhbCgpKTtcbiAgfSxcblxuICBoYW5kbGVEcm9wUGFzdGU6IGZ1bmN0aW9uKHVybCl7XG4gICAgaWYoIXV0aWxzLmlzVVJJKHVybCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbWF0Y2gsIGRhdGE7XG5cbiAgICB0aGlzLnByb3ZpZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHByb3ZpZGVyLCBpbmRleCkge1xuICAgICAgbWF0Y2ggPSBwcm92aWRlci5yZWdleC5leGVjKHVybCk7XG5cbiAgICAgIGlmKG1hdGNoICE9PSBudWxsICYmICFfLmlzVW5kZWZpbmVkKG1hdGNoWzFdKSkge1xuICAgICAgICBkYXRhID0ge1xuICAgICAgICAgIHNvdXJjZTogaW5kZXgsXG4gICAgICAgICAgcmVtb3RlX2lkOiBtYXRjaFsxXVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2V0QW5kTG9hZERhdGEoZGF0YSk7XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG4gIH0sXG5cbiAgb25Ecm9wOiBmdW5jdGlvbih0cmFuc2ZlckRhdGEpe1xuICAgIHZhciB1cmwgPSB0cmFuc2ZlckRhdGEuZ2V0RGF0YSgndGV4dC9wbGFpbicpO1xuICAgIHRoaXMuaGFuZGxlRHJvcFBhc3RlKHVybCk7XG4gIH1cbn0pO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRlYnVnOiBmYWxzZSxcbiAgc2tpcFZhbGlkYXRpb246IGZhbHNlLFxuICB2ZXJzaW9uOiBcIjAuMy4wXCIsXG4gIGxhbmd1YWdlOiBcImVuXCIsXG5cbiAgaW5zdGFuY2VzOiBbXSxcblxuICBkZWZhdWx0czoge1xuICAgIGRlZmF1bHRUeXBlOiBmYWxzZSxcbiAgICBzcGlubmVyOiB7XG4gICAgICBjbGFzc05hbWU6ICdzdC1zcGlubmVyJyxcbiAgICAgIGxpbmVzOiA5LFxuICAgICAgbGVuZ3RoOiA4LFxuICAgICAgd2lkdGg6IDMsXG4gICAgICByYWRpdXM6IDYsXG4gICAgICBjb2xvcjogJyMwMDAnLFxuICAgICAgc3BlZWQ6IDEuNCxcbiAgICAgIHRyYWlsOiA1NyxcbiAgICAgIHNoYWRvdzogZmFsc2UsXG4gICAgICBsZWZ0OiAnNTAlJyxcbiAgICAgIHRvcDogJzUwJSdcbiAgICB9LFxuICAgIGJsb2NrTGltaXQ6IDAsXG4gICAgYmxvY2tUeXBlTGltaXRzOiB7fSxcbiAgICByZXF1aXJlZDogW10sXG4gICAgdXBsb2FkVXJsOiAnL2F0dGFjaG1lbnRzJyxcbiAgICBiYXNlSW1hZ2VVcmw6ICcvc2lyLXRyZXZvci11cGxvYWRzLycsXG4gICAgZXJyb3JzQ29udGFpbmVyOiB1bmRlZmluZWQsXG4gIH1cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAqIFNpciBUcmV2b3IgRWRpdG9yXG4gKiAtLVxuICogUmVwcmVzZW50cyBvbmUgU2lyIFRyZXZvciBlZGl0b3IgaW5zdGFuY2UgKHdpdGggbXVsdGlwbGUgYmxvY2tzKVxuICogRWFjaCBibG9jayByZWZlcmVuY2VzIHRoaXMgaW5zdGFuY2UuXG4gKiBCbG9ja1R5cGVzIGFyZSBnbG9iYWwgaG93ZXZlci5cbiAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIEV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuL2V2ZW50LWJ1cycpO1xudmFyIEZvcm1FdmVudHMgPSByZXF1aXJlKCcuL2Zvcm0tZXZlbnRzJyk7XG52YXIgQmxvY2tDb250cm9scyA9IHJlcXVpcmUoJy4vYmxvY2stY29udHJvbHMnKTtcbnZhciBCbG9ja01hbmFnZXIgPSByZXF1aXJlKCcuL2Jsb2NrLW1hbmFnZXInKTtcbnZhciBGbG9hdGluZ0Jsb2NrQ29udHJvbHMgPSByZXF1aXJlKCcuL2Zsb2F0aW5nLWJsb2NrLWNvbnRyb2xzJyk7XG52YXIgRm9ybWF0QmFyID0gcmVxdWlyZSgnLi9mb3JtYXQtYmFyJyk7XG52YXIgRWRpdG9yU3RvcmUgPSByZXF1aXJlKCcuL2V4dGVuc2lvbnMvZWRpdG9yLXN0b3JlJyk7XG52YXIgRXJyb3JIYW5kbGVyID0gcmVxdWlyZSgnLi9lcnJvci1oYW5kbGVyJyk7XG5cbnZhciBFZGl0b3IgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHRoaXMuaW5pdGlhbGl6ZShvcHRpb25zKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oRWRpdG9yLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vZXZlbnRzJyksIHtcblxuICBib3VuZDogWydvbkZvcm1TdWJtaXQnLCAnaGlkZUFsbFRoZVRoaW5ncycsICdjaGFuZ2VCbG9ja1Bvc2l0aW9uJyxcbiAgICAncmVtb3ZlQmxvY2tEcmFnT3ZlcicsICdyZW5kZXJCbG9jaycsICdyZXNldEJsb2NrQ29udHJvbHMnLFxuICAgICdibG9ja0xpbWl0UmVhY2hlZCddLCBcblxuICBldmVudHM6IHtcbiAgICAnYmxvY2s6cmVvcmRlcjpkcmFnZW5kJzogJ3JlbW92ZUJsb2NrRHJhZ092ZXInLFxuICAgICdibG9jazpjb250ZW50OmRyb3BwZWQnOiAncmVtb3ZlQmxvY2tEcmFnT3ZlcidcbiAgfSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdXRpbHMubG9nKFwiSW5pdCBTaXJUcmV2b3IuRWRpdG9yXCIpO1xuXG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnLmRlZmF1bHRzLCBvcHRpb25zIHx8IHt9KTtcbiAgICB0aGlzLklEID0gXy51bmlxdWVJZCgnc3QtZWRpdG9yLScpO1xuXG4gICAgaWYgKCF0aGlzLl9lbnN1cmVBbmRTZXRFbGVtZW50cygpKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgaWYoIV8uaXNVbmRlZmluZWQodGhpcy5vcHRpb25zLm9uRWRpdG9yUmVuZGVyKSAmJlxuICAgICAgIF8uaXNGdW5jdGlvbih0aGlzLm9wdGlvbnMub25FZGl0b3JSZW5kZXIpKSB7XG4gICAgICB0aGlzLm9uRWRpdG9yUmVuZGVyID0gdGhpcy5vcHRpb25zLm9uRWRpdG9yUmVuZGVyO1xuICAgIH1cblxuICAgIC8vIE1lZGlhdGVkIGV2ZW50cyBmb3IgKnRoaXMqIEVkaXRvciBpbnN0YW5jZVxuICAgIHRoaXMubWVkaWF0b3IgPSBPYmplY3QuYXNzaWduKHt9LCBFdmVudHMpO1xuXG4gICAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuXG4gICAgY29uZmlnLmluc3RhbmNlcy5wdXNoKHRoaXMpO1xuXG4gICAgdGhpcy5idWlsZCgpO1xuXG4gICAgRm9ybUV2ZW50cy5iaW5kRm9ybVN1Ym1pdCh0aGlzLiRmb3JtKTtcbiAgfSxcblxuICAvKlxuICAgKiBCdWlsZCB0aGUgRWRpdG9yIGluc3RhbmNlLlxuICAgKiBDaGVjayB0byBzZWUgaWYgd2UndmUgYmVlbiBwYXNzZWQgSlNPTiBhbHJlYWR5LCBhbmQgaWYgbm90IHRyeSBhbmRcbiAgICogY3JlYXRlIGEgZGVmYXVsdCBibG9jay5cbiAgICogSWYgd2UgaGF2ZSBKU09OIHRoZW4gd2UgbmVlZCB0byBidWlsZCBhbGwgb2Ygb3VyIGJsb2NrcyBmcm9tIHRoaXMuXG4gICAqL1xuICBidWlsZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZWwuaGlkZSgpO1xuXG4gICAgdGhpcy5lcnJvckhhbmRsZXIgPSBuZXcgRXJyb3JIYW5kbGVyKHRoaXMuJG91dGVyLCB0aGlzLm1lZGlhdG9yLCB0aGlzLm9wdGlvbnMuZXJyb3JzQ29udGFpbmVyKTtcbiAgICB0aGlzLnN0b3JlID0gbmV3IEVkaXRvclN0b3JlKHRoaXMuJGVsLnZhbCgpLCB0aGlzLm1lZGlhdG9yKTtcbiAgICB0aGlzLmJsb2NrX21hbmFnZXIgPSBuZXcgQmxvY2tNYW5hZ2VyKHRoaXMub3B0aW9ucywgdGhpcy5JRCwgdGhpcy5tZWRpYXRvcik7XG4gICAgdGhpcy5ibG9ja19jb250cm9scyA9IG5ldyBCbG9ja0NvbnRyb2xzKHRoaXMuYmxvY2tfbWFuYWdlci5ibG9ja1R5cGVzLCB0aGlzLm1lZGlhdG9yKTtcbiAgICB0aGlzLmZsX2Jsb2NrX2NvbnRyb2xzID0gbmV3IEZsb2F0aW5nQmxvY2tDb250cm9scyh0aGlzLiR3cmFwcGVyLCB0aGlzLklELCB0aGlzLm1lZGlhdG9yKTtcbiAgICB0aGlzLmZvcm1hdEJhciA9IG5ldyBGb3JtYXRCYXIodGhpcy5vcHRpb25zLmZvcm1hdEJhciwgdGhpcy5tZWRpYXRvcik7XG5cbiAgICB0aGlzLm1lZGlhdG9yLm9uKCdibG9jazpjaGFuZ2VQb3NpdGlvbicsIHRoaXMuY2hhbmdlQmxvY2tQb3NpdGlvbik7XG4gICAgdGhpcy5tZWRpYXRvci5vbignYmxvY2stY29udHJvbHM6cmVzZXQnLCB0aGlzLnJlc2V0QmxvY2tDb250cm9scyk7XG4gICAgdGhpcy5tZWRpYXRvci5vbignYmxvY2s6bGltaXRSZWFjaGVkJywgdGhpcy5ibG9ja0xpbWl0UmVhY2hlZCk7XG4gICAgdGhpcy5tZWRpYXRvci5vbignYmxvY2s6cmVuZGVyJywgdGhpcy5yZW5kZXJCbG9jayk7XG5cbiAgICB0aGlzLmRhdGFTdG9yZSA9IFwiUGxlYXNlIHVzZSBzdG9yZS5yZXRyaWV2ZSgpO1wiO1xuXG4gICAgdGhpcy5fc2V0RXZlbnRzKCk7XG5cbiAgICB0aGlzLiR3cmFwcGVyLnByZXBlbmQodGhpcy5mbF9ibG9ja19jb250cm9scy5yZW5kZXIoKS4kZWwpO1xuICAgICQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKHRoaXMuZm9ybWF0QmFyLnJlbmRlcigpLiRlbCk7XG4gICAgdGhpcy4kb3V0ZXIuYXBwZW5kKHRoaXMuYmxvY2tfY29udHJvbHMucmVuZGVyKCkuJGVsKTtcblxuICAgICQod2luZG93KS5iaW5kKCdjbGljaycsIHRoaXMuaGlkZUFsbFRoZVRoaW5ncyk7XG5cbiAgICB0aGlzLmNyZWF0ZUJsb2NrcygpO1xuICAgIHRoaXMuJHdyYXBwZXIuYWRkQ2xhc3MoJ3N0LXJlYWR5Jyk7XG5cbiAgICBpZighXy5pc1VuZGVmaW5lZCh0aGlzLm9uRWRpdG9yUmVuZGVyKSkge1xuICAgICAgdGhpcy5vbkVkaXRvclJlbmRlcigpO1xuICAgIH1cbiAgfSxcblxuICBjcmVhdGVCbG9ja3M6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdG9yZSA9IHRoaXMuc3RvcmUucmV0cmlldmUoKTtcblxuICAgIGlmIChzdG9yZS5kYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgIHN0b3JlLmRhdGEuZm9yRWFjaChmdW5jdGlvbihibG9jaykge1xuICAgICAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Jsb2NrOmNyZWF0ZScsIGJsb2NrLnR5cGUsIGJsb2NrLmRhdGEpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZGVmYXVsdFR5cGUgIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Jsb2NrOmNyZWF0ZScsIHRoaXMub3B0aW9ucy5kZWZhdWx0VHlwZSwge30pO1xuICAgIH1cbiAgfSxcblxuICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAvLyBEZXN0cm95IHRoZSByZW5kZXJlZCBzdWIgdmlld3NcbiAgICB0aGlzLmZvcm1hdEJhci5kZXN0cm95KCk7XG4gICAgdGhpcy5mbF9ibG9ja19jb250cm9scy5kZXN0cm95KCk7XG4gICAgdGhpcy5ibG9ja19jb250cm9scy5kZXN0cm95KCk7XG5cbiAgICAvLyBEZXN0cm95IGFsbCBibG9ja3NcbiAgICB0aGlzLmJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Jsb2NrOnJlbW92ZScsIHRoaXMuYmxvY2suYmxvY2tJRCk7XG4gICAgfSwgdGhpcyk7XG5cbiAgICAvLyBTdG9wIGxpc3RlbmluZyB0byBldmVudHNcbiAgICB0aGlzLm1lZGlhdG9yLnN0b3BMaXN0ZW5pbmcoKTtcbiAgICB0aGlzLnN0b3BMaXN0ZW5pbmcoKTtcblxuICAgIC8vIFJlbW92ZSBpbnN0YW5jZVxuICAgIGNvbmZpZy5pbnN0YW5jZXMgPSBjb25maWcuaW5zdGFuY2VzLmZpbHRlcihmdW5jdGlvbihpbnN0YW5jZSkge1xuICAgICAgcmV0dXJuIGluc3RhbmNlLklEICE9PSB0aGlzLklEO1xuICAgIH0sIHRoaXMpO1xuXG4gICAgLy8gQ2xlYXIgdGhlIHN0b3JlXG4gICAgdGhpcy5zdG9yZS5yZXNldCgpO1xuICAgIHRoaXMuJG91dGVyLnJlcGxhY2VXaXRoKHRoaXMuJGVsLmRldGFjaCgpKTtcbiAgfSxcblxuICByZWluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICB0aGlzLmluaXRpYWxpemUob3B0aW9ucyB8fCB0aGlzLm9wdGlvbnMpO1xuICB9LFxuXG4gIHJlc2V0QmxvY2tDb250cm9sczogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5ibG9ja19jb250cm9scy5yZW5kZXJJbkNvbnRhaW5lcih0aGlzLiR3cmFwcGVyKTtcbiAgICB0aGlzLmJsb2NrX2NvbnRyb2xzLmhpZGUoKTtcbiAgfSxcblxuICBibG9ja0xpbWl0UmVhY2hlZDogZnVuY3Rpb24odG9nZ2xlKSB7XG4gICAgdGhpcy4kd3JhcHBlci50b2dnbGVDbGFzcygnc3QtLWJsb2NrLWxpbWl0LXJlYWNoZWQnLCB0b2dnbGUpO1xuICB9LFxuXG4gIF9zZXRFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMuZXZlbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIEV2ZW50QnVzLm9uKHR5cGUsIHRoaXNbdGhpcy5ldmVudHNbdHlwZV1dLCB0aGlzKTtcbiAgICB9LCB0aGlzKTtcbiAgfSxcblxuICBoaWRlQWxsVGhlVGhpbmdzOiBmdW5jdGlvbihlKSB7XG4gICAgdGhpcy5ibG9ja19jb250cm9scy5oaWRlKCk7XG4gICAgdGhpcy5mb3JtYXRCYXIuaGlkZSgpO1xuICB9LFxuXG4gIHN0b3JlOiBmdW5jdGlvbihtZXRob2QsIG9wdGlvbnMpe1xuICAgIHV0aWxzLmxvZyhcIlRoZSBzdG9yZSBtZXRob2QgaGFzIGJlZW4gcmVtb3ZlZCwgcGxlYXNlIGNhbGwgc3RvcmVbbWV0aG9kTmFtZV1cIik7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmVbbWV0aG9kXS5jYWxsKHRoaXMsIG9wdGlvbnMgfHwge30pO1xuICB9LFxuXG4gIHJlbmRlckJsb2NrOiBmdW5jdGlvbihibG9jaykge1xuICAgIHRoaXMuX3JlbmRlckluUG9zaXRpb24oYmxvY2sucmVuZGVyKCkuJGVsKTtcbiAgICB0aGlzLmhpZGVBbGxUaGVUaGluZ3MoKTtcbiAgICB0aGlzLnNjcm9sbFRvKGJsb2NrLiRlbCk7XG5cbiAgICBibG9jay50cmlnZ2VyKFwib25SZW5kZXJcIik7XG4gIH0sXG5cbiAgc2Nyb2xsVG86IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7IHNjcm9sbFRvcDogZWxlbWVudC5wb3NpdGlvbigpLnRvcCB9LCAzMDAsIFwibGluZWFyXCIpO1xuICB9LFxuXG4gIHJlbW92ZUJsb2NrRHJhZ092ZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJG91dGVyLmZpbmQoJy5zdC1kcmFnLW92ZXInKS5yZW1vdmVDbGFzcygnc3QtZHJhZy1vdmVyJyk7XG4gIH0sXG5cbiAgY2hhbmdlQmxvY2tQb3NpdGlvbjogZnVuY3Rpb24oJGJsb2NrLCBzZWxlY3RlZFBvc2l0aW9uKSB7XG4gICAgc2VsZWN0ZWRQb3NpdGlvbiA9IHNlbGVjdGVkUG9zaXRpb24gLSAxO1xuXG4gICAgdmFyIGJsb2NrUG9zaXRpb24gPSB0aGlzLmdldEJsb2NrUG9zaXRpb24oJGJsb2NrKSxcbiAgICAkYmxvY2tCeSA9IHRoaXMuJHdyYXBwZXIuZmluZCgnLnN0LWJsb2NrJykuZXEoc2VsZWN0ZWRQb3NpdGlvbik7XG5cbiAgICB2YXIgd2hlcmUgPSAoYmxvY2tQb3NpdGlvbiA+IHNlbGVjdGVkUG9zaXRpb24pID8gXCJCZWZvcmVcIiA6IFwiQWZ0ZXJcIjtcblxuICAgIGlmKCRibG9ja0J5ICYmICRibG9ja0J5LmF0dHIoJ2lkJykgIT09ICRibG9jay5hdHRyKCdpZCcpKSB7XG4gICAgICB0aGlzLmhpZGVBbGxUaGVUaGluZ3MoKTtcbiAgICAgICRibG9ja1tcImluc2VydFwiICsgd2hlcmVdKCRibG9ja0J5KTtcbiAgICAgIHRoaXMuc2Nyb2xsVG8oJGJsb2NrKTtcbiAgICB9XG4gIH0sXG5cbiAgX3JlbmRlckluUG9zaXRpb246IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgaWYgKHRoaXMuYmxvY2tfY29udHJvbHMuY3VycmVudENvbnRhaW5lcikge1xuICAgICAgdGhpcy5ibG9ja19jb250cm9scy5jdXJyZW50Q29udGFpbmVyLmFmdGVyKGJsb2NrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4kd3JhcHBlci5hcHBlbmQoYmxvY2spO1xuICAgIH1cbiAgfSxcblxuICB2YWxpZGF0ZUFuZFNhdmVCbG9jazogZnVuY3Rpb24oYmxvY2ssIHNob3VsZFZhbGlkYXRlKSB7XG4gICAgaWYgKCghY29uZmlnLnNraXBWYWxpZGF0aW9uIHx8IHNob3VsZFZhbGlkYXRlKSAmJiAhYmxvY2sudmFsaWQoKSkge1xuICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdlcnJvcnM6YWRkJywgeyB0ZXh0OiBfLnJlc3VsdChibG9jaywgJ3ZhbGlkYXRpb25GYWlsTXNnJykgfSk7XG4gICAgICB1dGlscy5sb2coXCJCbG9jayBcIiArIGJsb2NrLmJsb2NrSUQgKyBcIiBmYWlsZWQgdmFsaWRhdGlvblwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYmxvY2tEYXRhID0gYmxvY2suZ2V0RGF0YSgpO1xuICAgIHV0aWxzLmxvZyhcIkFkZGluZyBkYXRhIGZvciBibG9jayBcIiArIGJsb2NrLmJsb2NrSUQgKyBcIiB0byBibG9jayBzdG9yZTpcIixcbiAgICAgICAgICAgICAgYmxvY2tEYXRhKTtcbiAgICB0aGlzLnN0b3JlLmFkZERhdGEoYmxvY2tEYXRhKTtcbiAgfSxcblxuICAvKlxuICAgKiBIYW5kbGUgYSBmb3JtIHN1Ym1pc3Npb24gb2YgdGhpcyBFZGl0b3IgaW5zdGFuY2UuXG4gICAqIFZhbGlkYXRlIGFsbCBvZiBvdXIgYmxvY2tzLCBhbmQgc2VyaWFsaXNlIGFsbCBkYXRhIG9udG8gdGhlIEpTT04gb2JqZWN0c1xuICAgKi9cbiAgb25Gb3JtU3VibWl0OiBmdW5jdGlvbihzaG91bGRWYWxpZGF0ZSkge1xuICAgIC8vIGlmIHVuZGVmaW5lZCBvciBudWxsIG9yIGFueXRoaW5nIG90aGVyIHRoYW4gZmFsc2UgLSB0cmVhdCBhcyB0cnVlXG4gICAgc2hvdWxkVmFsaWRhdGUgPSAoc2hvdWxkVmFsaWRhdGUgPT09IGZhbHNlKSA/IGZhbHNlIDogdHJ1ZTtcblxuICAgIHV0aWxzLmxvZyhcIkhhbmRsaW5nIGZvcm0gc3VibWlzc2lvbiBmb3IgRWRpdG9yIFwiICsgdGhpcy5JRCk7XG5cbiAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Vycm9yczpyZXNldCcpO1xuICAgIHRoaXMuc3RvcmUucmVzZXQoKTtcblxuICAgIHRoaXMudmFsaWRhdGVCbG9ja3Moc2hvdWxkVmFsaWRhdGUpO1xuICAgIHRoaXMuYmxvY2tfbWFuYWdlci52YWxpZGF0ZUJsb2NrVHlwZXNFeGlzdChzaG91bGRWYWxpZGF0ZSk7XG5cbiAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Vycm9yczpyZW5kZXInKTtcbiAgICB0aGlzLiRlbC52YWwodGhpcy5zdG9yZS50b1N0cmluZygpKTtcblxuICAgIHJldHVybiB0aGlzLmVycm9ySGFuZGxlci5lcnJvcnMubGVuZ3RoO1xuICB9LFxuXG4gIHZhbGlkYXRlQmxvY2tzOiBmdW5jdGlvbihzaG91bGRWYWxpZGF0ZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLiR3cmFwcGVyLmZpbmQoJy5zdC1ibG9jaycpLmVhY2goZnVuY3Rpb24oaWR4LCBibG9jaykge1xuICAgICAgdmFyIF9ibG9jayA9IHNlbGYuYmxvY2tfbWFuYWdlci5maW5kQmxvY2tCeUlkKCQoYmxvY2spLmF0dHIoJ2lkJykpO1xuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKF9ibG9jaykpIHtcbiAgICAgICAgc2VsZi52YWxpZGF0ZUFuZFNhdmVCbG9jayhfYmxvY2ssIHNob3VsZFZhbGlkYXRlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBmaW5kQmxvY2tCeUlkOiBmdW5jdGlvbihibG9ja19pZCkge1xuICAgIHJldHVybiB0aGlzLmJsb2NrX21hbmFnZXIuZmluZEJsb2NrQnlJZChibG9ja19pZCk7XG4gIH0sXG5cbiAgZ2V0QmxvY2tzQnlUeXBlOiBmdW5jdGlvbihibG9ja190eXBlKSB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tfbWFuYWdlci5nZXRCbG9ja3NCeVR5cGUoYmxvY2tfdHlwZSk7XG4gIH0sXG5cbiAgZ2V0QmxvY2tzQnlJRHM6IGZ1bmN0aW9uKGJsb2NrX2lkcykge1xuICAgIHJldHVybiB0aGlzLmJsb2NrX21hbmFnZXIuZ2V0QmxvY2tzQnlJRHMoYmxvY2tfaWRzKTtcbiAgfSxcblxuICBnZXRCbG9ja1Bvc2l0aW9uOiBmdW5jdGlvbigkYmxvY2spIHtcbiAgICByZXR1cm4gdGhpcy4kd3JhcHBlci5maW5kKCcuc3QtYmxvY2snKS5pbmRleCgkYmxvY2spO1xuICB9LFxuXG4gIF9lbnN1cmVBbmRTZXRFbGVtZW50czogZnVuY3Rpb24oKSB7XG4gICAgaWYoXy5pc1VuZGVmaW5lZCh0aGlzLm9wdGlvbnMuZWwpIHx8IF8uaXNFbXB0eSh0aGlzLm9wdGlvbnMuZWwpKSB7XG4gICAgICB1dGlscy5sb2coXCJZb3UgbXVzdCBwcm92aWRlIGFuIGVsXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuJGVsID0gdGhpcy5vcHRpb25zLmVsO1xuICAgIHRoaXMuZWwgPSB0aGlzLm9wdGlvbnMuZWxbMF07XG4gICAgdGhpcy4kZm9ybSA9IHRoaXMuJGVsLnBhcmVudHMoJ2Zvcm0nKTtcblxuICAgIHZhciAkb3V0ZXIgPSAkKFwiPGRpdj5cIikuYXR0cih7ICdpZCc6IHRoaXMuSUQsICdjbGFzcyc6ICdzdC1vdXRlcicsICdkcm9wem9uZSc6ICdjb3B5IGxpbmsgbW92ZScgfSk7XG4gICAgdmFyICR3cmFwcGVyID0gJChcIjxkaXY+XCIpLmF0dHIoeyAnY2xhc3MnOiAnc3QtYmxvY2tzJyB9KTtcblxuICAgIC8vIFdyYXAgb3VyIGVsZW1lbnQgaW4gbG90cyBvZiBjb250YWluZXJzICpld3cqXG4gICAgdGhpcy4kZWwud3JhcCgkb3V0ZXIpLndyYXAoJHdyYXBwZXIpO1xuXG4gICAgdGhpcy4kb3V0ZXIgPSB0aGlzLiRmb3JtLmZpbmQoJyMnICsgdGhpcy5JRCk7XG4gICAgdGhpcy4kd3JhcHBlciA9IHRoaXMuJG91dGVyLmZpbmQoJy5zdC1ibG9ja3MnKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvcjtcblxuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xuXG52YXIgRXJyb3JIYW5kbGVyID0gZnVuY3Rpb24oJHdyYXBwZXIsIG1lZGlhdG9yLCBjb250YWluZXIpIHtcbiAgdGhpcy4kd3JhcHBlciA9ICR3cmFwcGVyO1xuICB0aGlzLm1lZGlhdG9yID0gbWVkaWF0b3I7XG4gIHRoaXMuJGVsID0gY29udGFpbmVyO1xuXG4gIGlmIChfLmlzVW5kZWZpbmVkKHRoaXMuJGVsKSkge1xuICAgIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgICB0aGlzLiR3cmFwcGVyLnByZXBlbmQodGhpcy4kZWwpO1xuICB9XG5cbiAgdGhpcy4kZWwuaGlkZSgpO1xuICB0aGlzLl9iaW5kRnVuY3Rpb25zKCk7XG4gIHRoaXMuX2JpbmRNZWRpYXRlZEV2ZW50cygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihFcnJvckhhbmRsZXIucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9tZWRpYXRlZC1ldmVudHMnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHtcblxuICBlcnJvcnM6IFtdLFxuICBjbGFzc05hbWU6IFwic3QtZXJyb3JzXCIsXG4gIGV2ZW50TmFtZXNwYWNlOiAnZXJyb3JzJyxcblxuICBtZWRpYXRlZEV2ZW50czoge1xuICAgICdyZXNldCc6ICdyZXNldCcsXG4gICAgJ2FkZCc6ICdhZGRNZXNzYWdlJyxcbiAgICAncmVuZGVyJzogJ3JlbmRlcidcbiAgfSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgJGxpc3QgPSAkKFwiPHVsPlwiKTtcbiAgICB0aGlzLiRlbC5hcHBlbmQoXCI8cD5cIiArIGkxOG4udChcImVycm9yczp0aXRsZVwiKSArIFwiPC9wPlwiKVxuICAgIC5hcHBlbmQoJGxpc3QpO1xuICAgIHRoaXMuJGxpc3QgPSAkbGlzdDtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmVycm9ycy5sZW5ndGggPT09IDApIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgdGhpcy5lcnJvcnMuZm9yRWFjaCh0aGlzLmNyZWF0ZUVycm9ySXRlbSwgdGhpcyk7XG4gICAgdGhpcy4kZWwuc2hvdygpO1xuICB9LFxuXG4gIGNyZWF0ZUVycm9ySXRlbTogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICB2YXIgJGVycm9yID0gJChcIjxsaT5cIiwgeyBjbGFzczogXCJzdC1lcnJvcnNfX21zZ1wiLCBodG1sOiBlcnJvci50ZXh0IH0pO1xuICAgIHRoaXMuJGxpc3QuYXBwZW5kKCRlcnJvcik7XG4gIH0sXG5cbiAgYWRkTWVzc2FnZTogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICB0aGlzLmVycm9ycy5wdXNoKGVycm9yKTtcbiAgfSxcblxuICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuZXJyb3JzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgIHRoaXMuJGxpc3QuaHRtbCgnJyk7XG4gICAgdGhpcy4kZWwuaGlkZSgpO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVycm9ySGFuZGxlcjtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbih7fSwgcmVxdWlyZSgnLi9ldmVudHMnKSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdldmVudGFibGVqcycpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gKiBTaXIgVHJldm9yIEVkaXRvciBTdG9yZVxuICogQnkgZGVmYXVsdCB3ZSBzdG9yZSB0aGUgY29tcGxldGUgZGF0YSBvbiB0aGUgaW5zdGFuY2VzICRlbFxuICogV2UgY2FuIGVhc2lseSBleHRlbmQgdGhpcyBhbmQgc3RvcmUgaXQgb24gc29tZSBzZXJ2ZXIgb3Igc29tZXRoaW5nXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi9sb2Rhc2gnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cblxudmFyIEVkaXRvclN0b3JlID0gZnVuY3Rpb24oZGF0YSwgbWVkaWF0b3IpIHtcbiAgdGhpcy5tZWRpYXRvciA9IG1lZGlhdG9yO1xuICB0aGlzLmluaXRpYWxpemUoZGF0YSA/IGRhdGEudHJpbSgpIDogJycpO1xufTtcblxuT2JqZWN0LmFzc2lnbihFZGl0b3JTdG9yZS5wcm90b3R5cGUsIHtcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5zdG9yZSA9IHRoaXMuX3BhcnNlRGF0YShkYXRhKSB8fCB7IGRhdGE6IFtdIH07XG4gIH0sXG5cbiAgcmV0cmlldmU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlO1xuICB9LFxuXG4gIHRvU3RyaW5nOiBmdW5jdGlvbihzcGFjZSkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLnN0b3JlLCB1bmRlZmluZWQsIHNwYWNlKTtcbiAgfSxcblxuICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgdXRpbHMubG9nKFwiUmVzZXR0aW5nIHRoZSBFZGl0b3JTdG9yZVwiKTtcbiAgICB0aGlzLnN0b3JlID0geyBkYXRhOiBbXSB9O1xuICB9LFxuXG4gIGFkZERhdGE6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB0aGlzLnN0b3JlLmRhdGEucHVzaChkYXRhKTtcbiAgICByZXR1cm4gdGhpcy5zdG9yZTtcbiAgfSxcblxuICBfcGFyc2VEYXRhOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHJlc3VsdDtcblxuICAgIGlmIChkYXRhLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gcmVzdWx0OyB9XG5cbiAgICB0cnkge1xuICAgICAgLy8gRW5zdXJlIHRoZSBKU09OIHN0cmluZyBoYXMgYSBkYXRhIGVsZW1lbnQgdGhhdCdzIGFuIGFycmF5XG4gICAgICB2YXIganNvblN0ciA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICBpZiAoIV8uaXNVbmRlZmluZWQoanNvblN0ci5kYXRhKSkge1xuICAgICAgICByZXN1bHQgPSBqc29uU3RyO1xuICAgICAgfVxuICAgIH0gY2F0Y2goZSkge1xuICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKFxuICAgICAgICAnZXJyb3JzOmFkZCcsXG4gICAgICAgIHsgdGV4dDogaTE4bi50KFwiZXJyb3JzOmxvYWRfZmFpbFwiKSB9KTtcblxuICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdlcnJvcnM6cmVuZGVyJyk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdTb3JyeSB0aGVyZSBoYXMgYmVlbiBhIHByb2JsZW0gd2l0aCBwYXJzaW5nIHRoZSBKU09OJyk7XG4gICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvclN0b3JlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4qICAgU2lyIFRyZXZvciBVcGxvYWRlclxuKiAgIEdlbmVyaWMgVXBsb2FkIGltcGxlbWVudGF0aW9uIHRoYXQgY2FuIGJlIGV4dGVuZGVkIGZvciBibG9ja3NcbiovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vbG9kYXNoJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vY29uZmlnJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuLi9ldmVudC1idXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihibG9jaywgZmlsZSwgc3VjY2VzcywgZXJyb3IpIHtcblxuICBFdmVudEJ1cy50cmlnZ2VyKCdvblVwbG9hZFN0YXJ0Jyk7XG5cbiAgdmFyIHVpZCAgPSBbYmxvY2suYmxvY2tJRCwgKG5ldyBEYXRlKCkpLmdldFRpbWUoKSwgJ3JhdyddLmpvaW4oJy0nKTtcbiAgdmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoKTtcblxuICBkYXRhLmFwcGVuZCgnYXR0YWNobWVudFtuYW1lXScsIGZpbGUubmFtZSk7XG4gIGRhdGEuYXBwZW5kKCdhdHRhY2htZW50W2ZpbGVdJywgZmlsZSk7XG4gIGRhdGEuYXBwZW5kKCdhdHRhY2htZW50W3VpZF0nLCB1aWQpO1xuXG4gIGJsb2NrLnJlc2V0TWVzc2FnZXMoKTtcblxuICB2YXIgY2FsbGJhY2tTdWNjZXNzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHV0aWxzLmxvZygnVXBsb2FkIGNhbGxiYWNrIGNhbGxlZCcpO1xuICAgIEV2ZW50QnVzLnRyaWdnZXIoJ29uVXBsb2FkU3RvcCcpO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKHN1Y2Nlc3MpICYmIF8uaXNGdW5jdGlvbihzdWNjZXNzKSkge1xuICAgICAgc3VjY2Vzcy5hcHBseShibG9jaywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGNhbGxiYWNrRXJyb3IgPSBmdW5jdGlvbihqcVhIUiwgc3RhdHVzLCBlcnJvclRocm93bikge1xuICAgIHV0aWxzLmxvZygnVXBsb2FkIGNhbGxiYWNrIGVycm9yIGNhbGxlZCcpO1xuICAgIEV2ZW50QnVzLnRyaWdnZXIoJ29uVXBsb2FkU3RvcCcpO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGVycm9yKSAmJiBfLmlzRnVuY3Rpb24oZXJyb3IpKSB7XG4gICAgICBlcnJvci5jYWxsKGJsb2NrLCBzdGF0dXMpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgeGhyID0gJC5hamF4KHtcbiAgICB1cmw6IGNvbmZpZy5kZWZhdWx0cy51cGxvYWRVcmwsXG4gICAgZGF0YTogZGF0YSxcbiAgICBjYWNoZTogZmFsc2UsXG4gICAgY29udGVudFR5cGU6IGZhbHNlLFxuICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIHR5cGU6ICdQT1NUJ1xuICB9KTtcblxuICBibG9jay5hZGRRdWV1ZWRJdGVtKHVpZCwgeGhyKTtcblxuICB4aHIuZG9uZShjYWxsYmFja1N1Y2Nlc3MpXG4gICAgIC5mYWlsKGNhbGxiYWNrRXJyb3IpXG4gICAgIC5hbHdheXMoYmxvY2sucmVtb3ZlUXVldWVkSXRlbS5iaW5kKGJsb2NrLCB1aWQpKTtcblxuICByZXR1cm4geGhyO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICogU2lyVHJldm9yLlN1Ym1pdHRhYmxlXG4gKiAtLVxuICogV2UgbmVlZCBhIGdsb2JhbCB3YXkgb2Ygc2V0dGluZyBpZiB0aGUgZWRpdG9yIGNhbiBhbmQgY2FuJ3QgYmUgc3VibWl0dGVkLFxuICogYW5kIGEgd2F5IHRvIGRpc2FibGUgdGhlIHN1Ym1pdCBidXR0b24gYW5kIGFkZCBtZXNzYWdlcyAod2hlbiBhcHByb3ByaWF0ZSlcbiAqIFdlIGFsc28gbmVlZCB0aGlzIHRvIGJlIGhpZ2hseSBleHRlbnNpYmxlIHNvIGl0IGNhbiBiZSBvdmVycmlkZGVuLlxuICogVGhpcyB3aWxsIGJlIHRyaWdnZXJlZCAqYnkgYW55dGhpbmcqIHNvIGl0IG5lZWRzIHRvIHN1YnNjcmliZSB0byBldmVudHMuXG4gKi9cblxuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuLi9ldmVudC1idXMnKTtcblxudmFyIFN1Ym1pdHRhYmxlID0gZnVuY3Rpb24oJGZvcm0pIHtcbiAgdGhpcy4kZm9ybSA9ICRmb3JtO1xuICB0aGlzLmludGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihTdWJtaXR0YWJsZS5wcm90b3R5cGUsIHtcblxuICBpbnRpYWxpemU6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5zdWJtaXRCdG4gPSB0aGlzLiRmb3JtLmZpbmQoXCJpbnB1dFt0eXBlPSdzdWJtaXQnXVwiKTtcblxuICAgIHZhciBidG5UaXRsZXMgPSBbXTtcblxuICAgIHRoaXMuc3VibWl0QnRuLmVhY2goZnVuY3Rpb24oaSwgYnRuKXtcbiAgICAgIGJ0blRpdGxlcy5wdXNoKCQoYnRuKS5hdHRyKCd2YWx1ZScpKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc3VibWl0QnRuVGl0bGVzID0gYnRuVGl0bGVzO1xuICAgIHRoaXMuY2FuU3VibWl0ID0gdHJ1ZTtcbiAgICB0aGlzLmdsb2JhbFVwbG9hZENvdW50ID0gMDtcbiAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG4gIH0sXG5cbiAgc2V0U3VibWl0QnV0dG9uOiBmdW5jdGlvbihlLCBtZXNzYWdlKSB7XG4gICAgdGhpcy5zdWJtaXRCdG4uYXR0cigndmFsdWUnLCBtZXNzYWdlKTtcbiAgfSxcblxuICByZXNldFN1Ym1pdEJ1dHRvbjogZnVuY3Rpb24oKXtcbiAgICB2YXIgdGl0bGVzID0gdGhpcy5zdWJtaXRCdG5UaXRsZXM7XG4gICAgdGhpcy5zdWJtaXRCdG4uZWFjaChmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgJChpdGVtKS5hdHRyKCd2YWx1ZScsIHRpdGxlc1tpbmRleF0pO1xuICAgIH0pO1xuICB9LFxuXG4gIG9uVXBsb2FkU3RhcnQ6IGZ1bmN0aW9uKGUpe1xuICAgIHRoaXMuZ2xvYmFsVXBsb2FkQ291bnQrKztcbiAgICB1dGlscy5sb2coJ29uVXBsb2FkU3RhcnQgY2FsbGVkICcgKyB0aGlzLmdsb2JhbFVwbG9hZENvdW50KTtcblxuICAgIGlmKHRoaXMuZ2xvYmFsVXBsb2FkQ291bnQgPT09IDEpIHtcbiAgICAgIHRoaXMuX2Rpc2FibGVTdWJtaXRCdXR0b24oKTtcbiAgICB9XG4gIH0sXG5cbiAgb25VcGxvYWRTdG9wOiBmdW5jdGlvbihlKSB7XG4gICAgdGhpcy5nbG9iYWxVcGxvYWRDb3VudCA9ICh0aGlzLmdsb2JhbFVwbG9hZENvdW50IDw9IDApID8gMCA6IHRoaXMuZ2xvYmFsVXBsb2FkQ291bnQgLSAxO1xuXG4gICAgdXRpbHMubG9nKCdvblVwbG9hZFN0b3AgY2FsbGVkICcgKyB0aGlzLmdsb2JhbFVwbG9hZENvdW50KTtcblxuICAgIGlmKHRoaXMuZ2xvYmFsVXBsb2FkQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX2VuYWJsZVN1Ym1pdEJ1dHRvbigpO1xuICAgIH1cbiAgfSxcblxuICBvbkVycm9yOiBmdW5jdGlvbihlKXtcbiAgICB1dGlscy5sb2coJ29uRXJyb3IgY2FsbGVkJyk7XG4gICAgdGhpcy5jYW5TdWJtaXQgPSBmYWxzZTtcbiAgfSxcblxuICBfZGlzYWJsZVN1Ym1pdEJ1dHRvbjogZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgdGhpcy5zZXRTdWJtaXRCdXR0b24obnVsbCwgbWVzc2FnZSB8fCBpMThuLnQoXCJnZW5lcmFsOndhaXRcIikpO1xuICAgIHRoaXMuc3VibWl0QnRuXG4gICAgLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJylcbiAgICAuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gIH0sXG5cbiAgX2VuYWJsZVN1Ym1pdEJ1dHRvbjogZnVuY3Rpb24oKXtcbiAgICB0aGlzLnJlc2V0U3VibWl0QnV0dG9uKCk7XG4gICAgdGhpcy5zdWJtaXRCdG5cbiAgICAucmVtb3ZlQXR0cignZGlzYWJsZWQnKVxuICAgIC5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgfSxcblxuICBfZXZlbnRzIDoge1xuICAgIFwiZGlzYWJsZVN1Ym1pdEJ1dHRvblwiIDogXCJfZGlzYWJsZVN1Ym1pdEJ1dHRvblwiLFxuICAgIFwiZW5hYmxlU3VibWl0QnV0dG9uXCIgIDogXCJfZW5hYmxlU3VibWl0QnV0dG9uXCIsXG4gICAgXCJzZXRTdWJtaXRCdXR0b25cIiAgICAgOiBcInNldFN1Ym1pdEJ1dHRvblwiLFxuICAgIFwicmVzZXRTdWJtaXRCdXR0b25cIiAgIDogXCJyZXNldFN1Ym1pdEJ1dHRvblwiLFxuICAgIFwib25FcnJvclwiICAgICAgICAgICAgIDogXCJvbkVycm9yXCIsXG4gICAgXCJvblVwbG9hZFN0YXJ0XCIgICAgICAgOiBcIm9uVXBsb2FkU3RhcnRcIixcbiAgICBcIm9uVXBsb2FkU3RvcFwiICAgICAgICA6IFwib25VcGxvYWRTdG9wXCJcbiAgfSxcblxuICBfYmluZEV2ZW50czogZnVuY3Rpb24oKXtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9ldmVudHMpLmZvckVhY2goZnVuY3Rpb24odHlwZSkge1xuICAgICAgRXZlbnRCdXMub24odHlwZSwgdGhpc1t0aGlzLl9ldmVudHNbdHlwZV1dLCB0aGlzKTtcbiAgICB9LCB0aGlzKTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdWJtaXR0YWJsZTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gICBTaXJUcmV2b3IgRmxvYXRpbmcgQmxvY2sgQ29udHJvbHNcbiAgIC0tXG4gICBEcmF3cyB0aGUgJ3BsdXMnIGJldHdlZW4gYmxvY2tzXG4gICAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG5cbnZhciBFdmVudEJ1cyA9IHJlcXVpcmUoJy4vZXZlbnQtYnVzJyk7XG5cbnZhciBGbG9hdGluZ0Jsb2NrQ29udHJvbHMgPSBmdW5jdGlvbih3cmFwcGVyLCBpbnN0YW5jZV9pZCwgbWVkaWF0b3IpIHtcbiAgdGhpcy4kd3JhcHBlciA9IHdyYXBwZXI7XG4gIHRoaXMuaW5zdGFuY2VfaWQgPSBpbnN0YW5jZV9pZDtcbiAgdGhpcy5tZWRpYXRvciA9IG1lZGlhdG9yO1xuXG4gIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZSgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihGbG9hdGluZ0Jsb2NrQ29udHJvbHMucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHJlcXVpcmUoJy4vZXZlbnRzJyksIHtcblxuICBjbGFzc05hbWU6IFwic3QtYmxvY2stY29udHJvbHNfX3RvcFwiLFxuXG4gIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAnZGF0YS1pY29uJzogJ2FkZCdcbiAgICB9O1xuICB9LFxuXG4gIGJvdW5kOiBbJ2hhbmRsZUJsb2NrTW91c2VPdXQnLCAnaGFuZGxlQmxvY2tNb3VzZU92ZXInLCAnaGFuZGxlQmxvY2tDbGljaycsICdvbkRyb3AnXSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5vbignY2xpY2snLCB0aGlzLmhhbmRsZUJsb2NrQ2xpY2spXG4gICAgLmRyb3BBcmVhKClcbiAgICAuYmluZCgnZHJvcCcsIHRoaXMub25Ecm9wKTtcblxuICAgIHRoaXMuJHdyYXBwZXIub24oJ21vdXNlb3ZlcicsICcuc3QtYmxvY2snLCB0aGlzLmhhbmRsZUJsb2NrTW91c2VPdmVyKVxuICAgIC5vbignbW91c2VvdXQnLCAnLnN0LWJsb2NrJywgdGhpcy5oYW5kbGVCbG9ja01vdXNlT3V0KVxuICAgIC5vbignY2xpY2snLCAnLnN0LWJsb2NrLS13aXRoLXBsdXMnLCB0aGlzLmhhbmRsZUJsb2NrQ2xpY2spO1xuICB9LFxuXG4gIG9uRHJvcDogZnVuY3Rpb24oZXYpIHtcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyIGRyb3BwZWRfb24gPSB0aGlzLiRlbCxcbiAgICBpdGVtX2lkID0gZXYub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcInRleHQvcGxhaW5cIiksXG4gICAgYmxvY2sgPSAkKCcjJyArIGl0ZW1faWQpO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGl0ZW1faWQpICYmXG4gICAgICAgICFfLmlzRW1wdHkoYmxvY2spICYmXG4gICAgICAgICAgZHJvcHBlZF9vbi5hdHRyKCdpZCcpICE9PSBpdGVtX2lkICYmXG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlX2lkID09PSBibG9jay5hdHRyKCdkYXRhLWluc3RhbmNlJylcbiAgICAgICApIHtcbiAgICAgICAgIGRyb3BwZWRfb24uYWZ0ZXIoYmxvY2spO1xuICAgICAgIH1cblxuICAgICAgIEV2ZW50QnVzLnRyaWdnZXIoXCJibG9jazpyZW9yZGVyOmRyb3BwZWRcIiwgaXRlbV9pZCk7XG4gIH0sXG5cbiAgaGFuZGxlQmxvY2tNb3VzZU92ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYmxvY2sgPSAkKGUuY3VycmVudFRhcmdldCk7XG5cbiAgICBpZiAoIWJsb2NrLmhhc0NsYXNzKCdzdC1ibG9jay0td2l0aC1wbHVzJykpIHtcbiAgICAgIGJsb2NrLmFkZENsYXNzKCdzdC1ibG9jay0td2l0aC1wbHVzJyk7XG4gICAgfVxuICB9LFxuXG4gIGhhbmRsZUJsb2NrTW91c2VPdXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYmxvY2sgPSAkKGUuY3VycmVudFRhcmdldCk7XG5cbiAgICBpZiAoYmxvY2suaGFzQ2xhc3MoJ3N0LWJsb2NrLS13aXRoLXBsdXMnKSkge1xuICAgICAgYmxvY2sucmVtb3ZlQ2xhc3MoJ3N0LWJsb2NrLS13aXRoLXBsdXMnKTtcbiAgICB9XG4gIH0sXG5cbiAgaGFuZGxlQmxvY2tDbGljazogZnVuY3Rpb24oZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdibG9jay1jb250cm9sczpyZW5kZXInLCAkKGUuY3VycmVudFRhcmdldCkpO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZsb2F0aW5nQmxvY2tDb250cm9scztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi9ldmVudC1idXMnKTtcbnZhciBTdWJtaXR0YWJsZSA9IHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9zdWJtaXR0YWJsZScpO1xuXG52YXIgZm9ybUJvdW5kID0gZmFsc2U7IC8vIEZsYWcgdG8gdGVsbCB1cyBvbmNlIHdlJ3ZlIGJvdW5kIG91ciBzdWJtaXQgZXZlbnRcblxudmFyIEZvcm1FdmVudHMgPSB7XG4gIGJpbmRGb3JtU3VibWl0OiBmdW5jdGlvbihmb3JtKSB7XG4gICAgaWYgKCFmb3JtQm91bmQpIHtcbiAgICAgIC8vIFhYWDogc2hvdWxkIHdlIGhhdmUgYSBmb3JtQm91bmQgYW5kIHN1Ym1pdHRhYmxlIHBlci1lZGl0b3I/XG4gICAgICAvLyB0ZWxsaW5nIEpTSGludCB0byBpZ25vcmUgYXMgaXQnbGwgY29tcGxhaW4gd2Ugc2hvdWxkbid0IGJlIGNyZWF0aW5nXG4gICAgICAvLyBhIG5ldyBvYmplY3QsIGJ1dCBvdGhlcndpc2UgYHRoaXNgIHdvbid0IGJlIHNldCBpbiB0aGUgU3VibWl0dGFibGVcbiAgICAgIC8vIGluaXRpYWxpc2VyLiBCaXQgd2VpcmQuXG4gICAgICBuZXcgU3VibWl0dGFibGUoZm9ybSk7IC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgZm9ybS5iaW5kKCdzdWJtaXQnLCB0aGlzLm9uRm9ybVN1Ym1pdCk7XG4gICAgICBmb3JtQm91bmQgPSB0cnVlO1xuICAgIH1cbiAgfSxcblxuICBvbkJlZm9yZVN1Ym1pdDogZnVuY3Rpb24oc2hvdWxkVmFsaWRhdGUpIHtcbiAgICAvLyBMb29wIHRocm91Z2ggYWxsIG9mIG91ciBpbnN0YW5jZXMgYW5kIGRvIG91ciBmb3JtIHN1Ym1pdHMgb24gdGhlbVxuICAgIHZhciBlcnJvcnMgPSAwO1xuICAgIGNvbmZpZy5pbnN0YW5jZXMuZm9yRWFjaChmdW5jdGlvbihpbnN0LCBpKSB7XG4gICAgICBlcnJvcnMgKz0gaW5zdC5vbkZvcm1TdWJtaXQoc2hvdWxkVmFsaWRhdGUpO1xuICAgIH0pO1xuICAgIHV0aWxzLmxvZyhcIlRvdGFsIGVycm9yczogXCIgKyBlcnJvcnMpO1xuXG4gICAgcmV0dXJuIGVycm9ycztcbiAgfSxcblxuICBvbkZvcm1TdWJtaXQ6IGZ1bmN0aW9uKGV2KSB7XG4gICAgdmFyIGVycm9ycyA9IEZvcm1FdmVudHMub25CZWZvcmVTdWJtaXQoKTtcblxuICAgIGlmKGVycm9ycyA+IDApIHtcbiAgICAgIEV2ZW50QnVzLnRyaWdnZXIoXCJvbkVycm9yXCIpO1xuICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcm1FdmVudHM7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgIEZvcm1hdCBCYXJcbiAgIC0tXG4gICBEaXNwbGF5ZWQgb24gZm9jdXMgb24gYSB0ZXh0IGFyZWEuXG4gICBSZW5kZXJzIHdpdGggYWxsIGF2YWlsYWJsZSBvcHRpb25zIGZvciB0aGUgZWRpdG9yIGluc3RhbmNlXG4gICAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG5cbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xudmFyIEZvcm1hdHRlcnMgPSByZXF1aXJlKCcuL2Zvcm1hdHRlcnMnKTtcblxudmFyIEZvcm1hdEJhciA9IGZ1bmN0aW9uKG9wdGlvbnMsIG1lZGlhdG9yKSB7XG4gIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmZpZy5kZWZhdWx0cy5mb3JtYXRCYXIsIG9wdGlvbnMgfHwge30pO1xuICB0aGlzLm1lZGlhdG9yID0gbWVkaWF0b3I7XG5cbiAgdGhpcy5fZW5zdXJlRWxlbWVudCgpO1xuICB0aGlzLl9iaW5kRnVuY3Rpb25zKCk7XG4gIHRoaXMuX2JpbmRNZWRpYXRlZEV2ZW50cygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuT2JqZWN0LmFzc2lnbihGb3JtYXRCYXIucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9tZWRpYXRlZC1ldmVudHMnKSwgcmVxdWlyZSgnLi9ldmVudHMnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHtcblxuICBjbGFzc05hbWU6ICdzdC1mb3JtYXQtYmFyJyxcblxuICBib3VuZDogW1wib25Gb3JtYXRCdXR0b25DbGlja1wiLCBcInJlbmRlckJ5U2VsZWN0aW9uXCIsIFwiaGlkZVwiXSxcblxuICBldmVudE5hbWVzcGFjZTogJ2Zvcm1hdHRlcicsXG5cbiAgbWVkaWF0ZWRFdmVudHM6IHtcbiAgICAncG9zaXRvbic6ICdyZW5kZXJCeVNlbGVjdGlvbicsXG4gICAgJ3Nob3cnOiAnc2hvdycsXG4gICAgJ2hpZGUnOiAnaGlkZSdcbiAgfSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZm9ybWF0TmFtZSwgZm9ybWF0LCBidG47XG4gICAgdGhpcy4kYnRucyA9IFtdO1xuXG4gICAgZm9yIChmb3JtYXROYW1lIGluIEZvcm1hdHRlcnMpIHtcbiAgICAgIGlmIChGb3JtYXR0ZXJzLmhhc093blByb3BlcnR5KGZvcm1hdE5hbWUpKSB7XG4gICAgICAgIGZvcm1hdCA9IEZvcm1hdHRlcnNbZm9ybWF0TmFtZV07XG4gICAgICAgIGJ0biA9ICQoXCI8YnV0dG9uPlwiLCB7XG4gICAgICAgICAgJ2NsYXNzJzogJ3N0LWZvcm1hdC1idG4gc3QtZm9ybWF0LWJ0bi0tJyArIGZvcm1hdE5hbWUgKyAnICcgKyAoZm9ybWF0Lmljb25OYW1lID8gJ3N0LWljb24nIDogJycpLFxuICAgICAgICAgICd0ZXh0JzogZm9ybWF0LnRleHQsXG4gICAgICAgICAgJ2RhdGEtdHlwZSc6IGZvcm1hdE5hbWUsXG4gICAgICAgICAgJ2RhdGEtY21kJzogZm9ybWF0LmNtZFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLiRidG5zLnB1c2goYnRuKTtcbiAgICAgICAgYnRuLmFwcGVuZFRvKHRoaXMuJGVsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLiRiID0gJChkb2N1bWVudCk7XG4gICAgdGhpcy4kZWwuYmluZCgnY2xpY2snLCAnLnN0LWZvcm1hdC1idG4nLCB0aGlzLm9uRm9ybWF0QnV0dG9uQ2xpY2spO1xuICB9LFxuXG4gIGhpZGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdzdC1mb3JtYXQtYmFyLS1pcy1yZWFkeScpO1xuICB9LFxuXG4gIHNob3c6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLmFkZENsYXNzKCdzdC1mb3JtYXQtYmFyLS1pcy1yZWFkeScpO1xuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24oKXsgdGhpcy4kZWwucmVtb3ZlKCk7IH0sXG5cbiAgcmVuZGVyQnlTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKSxcbiAgICByYW5nZSA9IHNlbGVjdGlvbi5nZXRSYW5nZUF0KDApLFxuICAgIGJvdW5kYXJ5ID0gcmFuZ2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgY29vcmRzID0ge307XG5cbiAgICBjb29yZHMudG9wID0gYm91bmRhcnkudG9wICsgMjAgKyB3aW5kb3cucGFnZVlPZmZzZXQgLSB0aGlzLiRlbC5oZWlnaHQoKSArICdweCc7XG4gICAgY29vcmRzLmxlZnQgPSAoKGJvdW5kYXJ5LmxlZnQgKyBib3VuZGFyeS5yaWdodCkgLyAyKSAtICh0aGlzLiRlbC53aWR0aCgpIC8gMikgKyAncHgnO1xuXG4gICAgdGhpcy5oaWdobGlnaHRTZWxlY3RlZEJ1dHRvbnMoKTtcbiAgICB0aGlzLnNob3coKTtcblxuICAgIHRoaXMuJGVsLmNzcyhjb29yZHMpO1xuICB9LFxuXG4gIGhpZ2hsaWdodFNlbGVjdGVkQnV0dG9uczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZvcm1hdHRlcjtcbiAgICB0aGlzLiRidG5zLmZvckVhY2goZnVuY3Rpb24oJGJ0bikge1xuICAgICAgZm9ybWF0dGVyID0gRm9ybWF0dGVyc1skYnRuLmF0dHIoJ2RhdGEtdHlwZScpXTtcbiAgICAgICRidG4udG9nZ2xlQ2xhc3MoXCJzdC1mb3JtYXQtYnRuLS1pcy1hY3RpdmVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVyLmlzQWN0aXZlKCkpO1xuICAgIH0sIHRoaXMpO1xuICB9LFxuXG4gIG9uRm9ybWF0QnV0dG9uQ2xpY2s6IGZ1bmN0aW9uKGV2KXtcbiAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIHZhciBidG4gPSAkKGV2LnRhcmdldCksXG4gICAgZm9ybWF0ID0gRm9ybWF0dGVyc1tidG4uYXR0cignZGF0YS10eXBlJyldO1xuXG4gICAgaWYgKF8uaXNVbmRlZmluZWQoZm9ybWF0KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIERvIHdlIGhhdmUgYSBjbGljayBmdW5jdGlvbiBkZWZpbmVkIG9uIHRoaXMgZm9ybWF0dGVyP1xuICAgIGlmKCFfLmlzVW5kZWZpbmVkKGZvcm1hdC5vbkNsaWNrKSAmJiBfLmlzRnVuY3Rpb24oZm9ybWF0Lm9uQ2xpY2spKSB7XG4gICAgICBmb3JtYXQub25DbGljaygpOyAvLyBEZWxlZ2F0ZVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDYWxsIGRlZmF1bHRcbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKGJ0bi5hdHRyKCdkYXRhLWNtZCcpLCBmYWxzZSwgZm9ybWF0LnBhcmFtKTtcbiAgICB9XG5cbiAgICB0aGlzLmhpZ2hsaWdodFNlbGVjdGVkQnV0dG9ucygpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtYXRCYXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xuXG52YXIgRm9ybWF0dGVyID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gIHRoaXMuZm9ybWF0SWQgPSBfLnVuaXF1ZUlkKCdmb3JtYXQtJyk7XG4gIHRoaXMuX2NvbmZpZ3VyZShvcHRpb25zIHx8IHt9KTtcbiAgdGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG52YXIgZm9ybWF0T3B0aW9ucyA9IFtcInRpdGxlXCIsIFwiY2xhc3NOYW1lXCIsIFwiY21kXCIsIFwia2V5Q29kZVwiLCBcInBhcmFtXCIsIFwib25DbGlja1wiLCBcInRvTWFya2Rvd25cIiwgXCJ0b0hUTUxcIl07XG5cbk9iamVjdC5hc3NpZ24oRm9ybWF0dGVyLnByb3RvdHlwZSwge1xuXG4gIHRpdGxlOiAnJyxcbiAgY2xhc3NOYW1lOiAnJyxcbiAgY21kOiBudWxsLFxuICBrZXlDb2RlOiBudWxsLFxuICBwYXJhbTogbnVsbCxcblxuICB0b01hcmtkb3duOiBmdW5jdGlvbihtYXJrZG93bil7IHJldHVybiBtYXJrZG93bjsgfSxcbiAgdG9IVE1MOiBmdW5jdGlvbihodG1sKXsgcmV0dXJuIGh0bWw7IH0sXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXt9LFxuXG4gIF9jb25maWd1cmU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBmb3JtYXRPcHRpb25zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGF0dHIgPSBmb3JtYXRPcHRpb25zW2ldO1xuICAgICAgaWYgKG9wdGlvbnNbYXR0cl0pIHtcbiAgICAgICAgdGhpc1thdHRyXSA9IG9wdGlvbnNbYXR0cl07XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIH0sXG5cbiAgaXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeUNvbW1hbmRTdGF0ZSh0aGlzLmNtZCk7XG4gIH0sXG5cbiAgX2JpbmRUb0Jsb2NrOiBmdW5jdGlvbihibG9jaykge1xuICAgIHZhciBmb3JtYXR0ZXIgPSB0aGlzLFxuICAgIGN0cmxEb3duID0gZmFsc2U7XG5cbiAgICBibG9ja1xuICAgIC5vbigna2V5dXAnLCcuc3QtdGV4dC1ibG9jaycsIGZ1bmN0aW9uKGV2KSB7XG4gICAgICBpZihldi53aGljaCA9PT0gMTcgfHwgZXYud2hpY2ggPT09IDIyNCB8fCBldi53aGljaCA9PT0gOTEpIHtcbiAgICAgICAgY3RybERvd24gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC5vbigna2V5ZG93bicsJy5zdC10ZXh0LWJsb2NrJywgeyBmb3JtYXR0ZXI6IGZvcm1hdHRlciB9LCBmdW5jdGlvbihldikge1xuICAgICAgaWYoZXYud2hpY2ggPT09IDE3IHx8IGV2LndoaWNoID09PSAyMjQgfHwgZXYud2hpY2ggPT09IDkxKSB7XG4gICAgICAgIGN0cmxEb3duID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYoZXYud2hpY2ggPT09IGV2LmRhdGEuZm9ybWF0dGVyLmtleUNvZGUgJiYgY3RybERvd24gPT09IHRydWUpIHtcbiAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoZXYuZGF0YS5mb3JtYXR0ZXIuY21kLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGN0cmxEb3duID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn0pO1xuXG4vLyBBbGxvdyBvdXIgRm9ybWF0dGVycyB0byBiZSBleHRlbmRlZC5cbkZvcm1hdHRlci5leHRlbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvZXh0ZW5kJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybWF0dGVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIE91ciBiYXNlIGZvcm1hdHRlcnMgKi9cblxudmFyIEZvcm1hdHRlciA9IHJlcXVpcmUoJy4vZm9ybWF0dGVyJyk7XG5cbnZhciBCb2xkID0gRm9ybWF0dGVyLmV4dGVuZCh7XG4gIHRpdGxlOiBcImJvbGRcIixcbiAgY21kOiBcImJvbGRcIixcbiAga2V5Q29kZTogNjYsXG4gIHRleHQgOiBcIkJcIlxufSk7XG5cbnZhciBJdGFsaWMgPSBGb3JtYXR0ZXIuZXh0ZW5kKHtcbiAgdGl0bGU6IFwiaXRhbGljXCIsXG4gIGNtZDogXCJpdGFsaWNcIixcbiAga2V5Q29kZTogNzMsXG4gIHRleHQgOiBcImlcIlxufSk7XG5cbnZhciBMaW5rID0gRm9ybWF0dGVyLmV4dGVuZCh7XG5cbiAgdGl0bGU6IFwibGlua1wiLFxuICBpY29uTmFtZTogXCJsaW5rXCIsXG4gIGNtZDogXCJDcmVhdGVMaW5rXCIsXG4gIHRleHQgOiBcImxpbmtcIixcblxuICBvbkNsaWNrOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBsaW5rID0gd2luZG93LnByb21wdChpMThuLnQoXCJnZW5lcmFsOmxpbmtcIikpLFxuICAgIGxpbmtfcmVnZXggPSAvKChmdHB8aHR0cHxodHRwcyk6XFwvXFwvLil8bWFpbHRvKD89XFw6Wy1cXC5cXHddK0ApLztcblxuICAgIGlmKGxpbmsgJiYgbGluay5sZW5ndGggPiAwKSB7XG5cbiAgICAgIGlmICghbGlua19yZWdleC50ZXN0KGxpbmspKSB7XG4gICAgICAgIGxpbmsgPSBcImh0dHA6Ly9cIiArIGxpbms7XG4gICAgICB9XG5cbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKHRoaXMuY21kLCBmYWxzZSwgbGluayk7XG4gICAgfVxuICB9LFxuXG4gIGlzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpLFxuICAgIG5vZGU7XG5cbiAgICBpZiAoc2VsZWN0aW9uLnJhbmdlQ291bnQgPiAwKSB7XG4gICAgICBub2RlID0gc2VsZWN0aW9uLmdldFJhbmdlQXQoMClcbiAgICAgIC5zdGFydENvbnRhaW5lclxuICAgICAgLnBhcmVudE5vZGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIChub2RlICYmIG5vZGUubm9kZU5hbWUgPT09IFwiQVwiKTtcbiAgfVxufSk7XG5cbnZhciBVbkxpbmsgPSBGb3JtYXR0ZXIuZXh0ZW5kKHtcbiAgdGl0bGU6IFwidW5saW5rXCIsXG4gIGljb25OYW1lOiBcImxpbmtcIixcbiAgY21kOiBcInVubGlua1wiLFxuICB0ZXh0IDogXCJsaW5rXCJcbn0pO1xuXG5cbmV4cG9ydHMuQm9sZCA9IG5ldyBCb2xkKCk7XG5leHBvcnRzLkl0YWxpYyA9IG5ldyBJdGFsaWMoKTtcbmV4cG9ydHMuTGluayA9IG5ldyBMaW5rKCk7XG5leHBvcnRzLlVubGluayA9IG5ldyBVbkxpbmsoKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBHZW5lcmljIGZ1bmN0aW9uIGJpbmRpbmcgdXRpbGl0eSwgdXNlZCBieSBsb3RzIG9mIG91ciBjbGFzc2VzICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBib3VuZDogW10sXG4gIF9iaW5kRnVuY3Rpb25zOiBmdW5jdGlvbigpe1xuICAgIHRoaXMuYm91bmQuZm9yRWFjaChmdW5jdGlvbihmKSB7XG4gICAgICB0aGlzW2ZdID0gdGhpc1tmXS5iaW5kKHRoaXMpO1xuICAgIH0sIHRoaXMpO1xuICB9XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAqIERyb3AgQXJlYSBQbHVnaW4gZnJvbSBAbWFjY21hblxuICogaHR0cDovL2Jsb2cuYWxleG1hY2Nhdy5jb20vc3ZidGxlLWltYWdlLXVwbG9hZGluZ1xuICogLS1cbiAqIFR3ZWFrZWQgc28gd2UgdXNlIHRoZSBwYXJlbnQgY2xhc3Mgb2YgZHJvcHpvbmVcbiAqL1xuXG5cbmZ1bmN0aW9uIGRyYWdFbnRlcihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbn1cblxuZnVuY3Rpb24gZHJhZ092ZXIoZSkge1xuICBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBcImNvcHlcIjtcbiAgJChlLmN1cnJlbnRUYXJnZXQpLmFkZENsYXNzKCdzdC1kcmFnLW92ZXInKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG5mdW5jdGlvbiBkcmFnTGVhdmUoZSkge1xuICAkKGUuY3VycmVudFRhcmdldCkucmVtb3ZlQ2xhc3MoJ3N0LWRyYWctb3ZlcicpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59XG5cbiQuZm4uZHJvcEFyZWEgPSBmdW5jdGlvbigpe1xuICB0aGlzLmJpbmQoXCJkcmFnZW50ZXJcIiwgZHJhZ0VudGVyKS5cbiAgICBiaW5kKFwiZHJhZ292ZXJcIiwgIGRyYWdPdmVyKS5cbiAgICBiaW5kKFwiZHJhZ2xlYXZlXCIsIGRyYWdMZWF2ZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuJC5mbi5ub0Ryb3BBcmVhID0gZnVuY3Rpb24oKXtcbiAgdGhpcy51bmJpbmQoXCJkcmFnZW50ZXJcIikuXG4gICAgdW5iaW5kKFwiZHJhZ292ZXJcIikuXG4gICAgdW5iaW5kKFwiZHJhZ2xlYXZlXCIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbiQuZm4uY2FyZXRUb0VuZCA9IGZ1bmN0aW9uKCl7XG4gIHZhciByYW5nZSxzZWxlY3Rpb247XG5cbiAgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHModGhpc1swXSk7XG4gIHJhbmdlLmNvbGxhcHNlKGZhbHNlKTtcblxuICBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBCYWNrYm9uZSBJbmhlcml0ZW5jZSBcbiAgLS1cbiAgRnJvbTogaHR0cHM6Ly9naXRodWIuY29tL2RvY3VtZW50Y2xvdWQvYmFja2JvbmUvYmxvYi9tYXN0ZXIvYmFja2JvbmUuanNcbiAgQmFja2JvbmUuanMgMC45LjJcbiAgKGMpIDIwMTAtMjAxMiBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgSW5jLlxuKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICB2YXIgcGFyZW50ID0gdGhpcztcbiAgdmFyIGNoaWxkO1xuXG4gIC8vIFRoZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgdGhlIG5ldyBzdWJjbGFzcyBpcyBlaXRoZXIgZGVmaW5lZCBieSB5b3VcbiAgLy8gKHRoZSBcImNvbnN0cnVjdG9yXCIgcHJvcGVydHkgaW4geW91ciBgZXh0ZW5kYCBkZWZpbml0aW9uKSwgb3IgZGVmYXVsdGVkXG4gIC8vIGJ5IHVzIHRvIHNpbXBseSBjYWxsIHRoZSBwYXJlbnQncyBjb25zdHJ1Y3Rvci5cbiAgaWYgKHByb3RvUHJvcHMgJiYgcHJvdG9Qcm9wcy5oYXNPd25Qcm9wZXJ0eSgnY29uc3RydWN0b3InKSkge1xuICAgIGNoaWxkID0gcHJvdG9Qcm9wcy5jb25zdHJ1Y3RvcjtcbiAgfSBlbHNlIHtcbiAgICBjaGlsZCA9IGZ1bmN0aW9uKCl7IHJldHVybiBwYXJlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcbiAgfVxuXG4gIC8vIEFkZCBzdGF0aWMgcHJvcGVydGllcyB0byB0aGUgY29uc3RydWN0b3IgZnVuY3Rpb24sIGlmIHN1cHBsaWVkLlxuICBPYmplY3QuYXNzaWduKGNoaWxkLCBwYXJlbnQsIHN0YXRpY1Byb3BzKTtcblxuICAvLyBTZXQgdGhlIHByb3RvdHlwZSBjaGFpbiB0byBpbmhlcml0IGZyb20gYHBhcmVudGAsIHdpdGhvdXQgY2FsbGluZ1xuICAvLyBgcGFyZW50YCdzIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLlxuICB2YXIgU3Vycm9nYXRlID0gZnVuY3Rpb24oKXsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9O1xuICBTdXJyb2dhdGUucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTtcbiAgY2hpbGQucHJvdG90eXBlID0gbmV3IFN1cnJvZ2F0ZTsgLy8ganNoaW50IGlnbm9yZTpsaW5lXG5cbiAgLy8gQWRkIHByb3RvdHlwZSBwcm9wZXJ0aWVzIChpbnN0YW5jZSBwcm9wZXJ0aWVzKSB0byB0aGUgc3ViY2xhc3MsXG4gIC8vIGlmIHN1cHBsaWVkLlxuICBpZiAocHJvdG9Qcm9wcykge1xuICAgIE9iamVjdC5hc3NpZ24oY2hpbGQucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgfVxuXG4gIC8vIFNldCBhIGNvbnZlbmllbmNlIHByb3BlcnR5IGluIGNhc2UgdGhlIHBhcmVudCdzIHByb3RvdHlwZSBpcyBuZWVkZWRcbiAgLy8gbGF0ZXIuXG4gIGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7XG5cbiAgcmV0dXJuIGNoaWxkO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG5cbnJlcXVpcmUoJy4vaGVscGVycy9ldmVudCcpOyAvLyBleHRlbmRzIGpRdWVyeSBpdHNlbGZcbnJlcXVpcmUoJy4vdmVuZG9yL2FycmF5LWluY2x1ZGVzJyk7IC8vIHNoaW1zIEVTNyBBcnJheS5wcm90b3R5cGUuaW5jbHVkZXNcblxudmFyIFNpclRyZXZvciA9IHtcblxuICBjb25maWc6IHJlcXVpcmUoJy4vY29uZmlnJyksXG5cbiAgbG9nOiByZXF1aXJlKCcuL3V0aWxzJykubG9nLFxuICBMb2NhbGVzOiByZXF1aXJlKCcuL2xvY2FsZXMnKSxcblxuICBFdmVudHM6IHJlcXVpcmUoJy4vZXZlbnRzJyksXG4gIEV2ZW50QnVzOiByZXF1aXJlKCcuL2V2ZW50LWJ1cycpLFxuXG4gIEVkaXRvclN0b3JlOiByZXF1aXJlKCcuL2V4dGVuc2lvbnMvZWRpdG9yLXN0b3JlJyksXG4gIFN1Ym1pdHRhYmxlOiByZXF1aXJlKCcuL2V4dGVuc2lvbnMvc3VibWl0dGFibGUnKSxcbiAgRmlsZVVwbG9hZGVyOiByZXF1aXJlKCcuL2V4dGVuc2lvbnMvZmlsZS11cGxvYWRlcicpLFxuXG4gIEJsb2NrTWl4aW5zOiByZXF1aXJlKCcuL2Jsb2NrX21peGlucycpLFxuICBCbG9ja1Bvc2l0aW9uZXI6IHJlcXVpcmUoJy4vYmxvY2stcG9zaXRpb25lcicpLFxuICBCbG9ja1Jlb3JkZXI6IHJlcXVpcmUoJy4vYmxvY2stcmVvcmRlcicpLFxuICBCbG9ja0RlbGV0aW9uOiByZXF1aXJlKCcuL2Jsb2NrLWRlbGV0aW9uJyksXG4gIEJsb2NrVmFsaWRhdGlvbnM6IHJlcXVpcmUoJy4vYmxvY2stdmFsaWRhdGlvbnMnKSxcbiAgQmxvY2tTdG9yZTogcmVxdWlyZSgnLi9ibG9jay1zdG9yZScpLFxuICBCbG9ja01hbmFnZXI6IHJlcXVpcmUoJy4vYmxvY2stbWFuYWdlcicpLFxuXG4gIFNpbXBsZUJsb2NrOiByZXF1aXJlKCcuL3NpbXBsZS1ibG9jaycpLFxuICBCbG9jazogcmVxdWlyZSgnLi9ibG9jaycpLFxuICBGb3JtYXR0ZXI6IHJlcXVpcmUoJy4vZm9ybWF0dGVyJyksXG4gIEZvcm1hdHRlcnM6IHJlcXVpcmUoJy4vZm9ybWF0dGVycycpLFxuXG4gIEJsb2NrczogcmVxdWlyZSgnLi9ibG9ja3MnKSxcblxuICBCbG9ja0NvbnRyb2w6IHJlcXVpcmUoJy4vYmxvY2stY29udHJvbCcpLFxuICBCbG9ja0NvbnRyb2xzOiByZXF1aXJlKCcuL2Jsb2NrLWNvbnRyb2xzJyksXG4gIEZsb2F0aW5nQmxvY2tDb250cm9sczogcmVxdWlyZSgnLi9mbG9hdGluZy1ibG9jay1jb250cm9scycpLFxuXG4gIEZvcm1hdEJhcjogcmVxdWlyZSgnLi9mb3JtYXQtYmFyJyksXG4gIEVkaXRvcjogcmVxdWlyZSgnLi9lZGl0b3InKSxcblxuICB0b01hcmtkb3duOiByZXF1aXJlKCcuL3RvLW1hcmtkb3duJyksXG4gIHRvSFRNTDogcmVxdWlyZSgnLi90by1odG1sJyksXG5cbiAgc2V0RGVmYXVsdHM6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBPYmplY3QuYXNzaWduKFNpclRyZXZvci5jb25maWcuZGVmYXVsdHMsIG9wdGlvbnMgfHwge30pO1xuICB9LFxuXG4gIGdldEluc3RhbmNlOiBmdW5jdGlvbihpZGVudGlmaWVyKSB7XG4gICAgaWYgKF8uaXNVbmRlZmluZWQoaWRlbnRpZmllcikpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5pbnN0YW5jZXNbMF07XG4gICAgfVxuXG4gICAgaWYgKF8uaXNTdHJpbmcoaWRlbnRpZmllcikpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5pbnN0YW5jZXMuZmluZChmdW5jdGlvbihlZGl0b3IpIHtcbiAgICAgICAgcmV0dXJuIGVkaXRvci5JRCA9PT0gaWRlbnRpZmllcjtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNvbmZpZy5pbnN0YW5jZXNbaWRlbnRpZmllcl07XG4gIH0sXG5cbiAgc2V0QmxvY2tPcHRpb25zOiBmdW5jdGlvbih0eXBlLCBvcHRpb25zKSB7XG4gICAgdmFyIGJsb2NrID0gU2lyVHJldm9yLkJsb2Nrc1t0eXBlXTtcblxuICAgIGlmIChfLmlzVW5kZWZpbmVkKGJsb2NrKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIE9iamVjdC5hc3NpZ24oYmxvY2sucHJvdG90eXBlLCBvcHRpb25zIHx8IHt9KTtcbiAgfSxcblxuICBydW5PbkFsbEluc3RhbmNlczogZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgaWYgKFNpclRyZXZvci5FZGl0b3IucHJvdG90eXBlLmhhc093blByb3BlcnR5KG1ldGhvZCkpIHtcbiAgICAgIHZhciBtZXRob2RBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoU2lyVHJldm9yLmNvbmZpZy5pbnN0YW5jZXMsIGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgaVttZXRob2RdLmFwcGx5KG51bGwsIG1ldGhvZEFyZ3MpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIFNpclRyZXZvci5sb2coXCJtZXRob2QgZG9lc24ndCBleGlzdFwiKTtcbiAgICB9XG4gIH0sXG5cbn07XG5cbk9iamVjdC5hc3NpZ24oU2lyVHJldm9yLCByZXF1aXJlKCcuL2Zvcm0tZXZlbnRzJykpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gU2lyVHJldm9yO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgTG9jYWxlcyA9IHtcbiAgZW46IHtcbiAgICBnZW5lcmFsOiB7XG4gICAgICAnZGVsZXRlJzogICAgICAgICAgICdEZWxldGU/JyxcbiAgICAgICdkcm9wJzogICAgICAgICAgICAgJ0RyYWcgX19ibG9ja19fIGhlcmUnLFxuICAgICAgJ3Bhc3RlJzogICAgICAgICAgICAnT3IgcGFzdGUgVVJMIGhlcmUnLFxuICAgICAgJ3VwbG9hZCc6ICAgICAgICAgICAnLi4ub3IgY2hvb3NlIGEgZmlsZScsXG4gICAgICAnY2xvc2UnOiAgICAgICAgICAgICdjbG9zZScsXG4gICAgICAncG9zaXRpb24nOiAgICAgICAgICdQb3NpdGlvbicsXG4gICAgICAnd2FpdCc6ICAgICAgICAgICAgICdQbGVhc2Ugd2FpdC4uLicsXG4gICAgICAnbGluayc6ICAgICAgICAgICAgICdFbnRlciBhIGxpbmsnXG4gICAgfSxcbiAgICBlcnJvcnM6IHtcbiAgICAgICd0aXRsZSc6IFwiWW91IGhhdmUgdGhlIGZvbGxvd2luZyBlcnJvcnM6XCIsXG4gICAgICAndmFsaWRhdGlvbl9mYWlsJzogXCJfX3R5cGVfXyBibG9jayBpcyBpbnZhbGlkXCIsXG4gICAgICAnYmxvY2tfZW1wdHknOiBcIl9fbmFtZV9fIG11c3Qgbm90IGJlIGVtcHR5XCIsXG4gICAgICAndHlwZV9taXNzaW5nJzogXCJZb3UgbXVzdCBoYXZlIGEgYmxvY2sgb2YgdHlwZSBfX3R5cGVfX1wiLFxuICAgICAgJ3JlcXVpcmVkX3R5cGVfZW1wdHknOiBcIkEgcmVxdWlyZWQgYmxvY2sgdHlwZSBfX3R5cGVfXyBpcyBlbXB0eVwiLFxuICAgICAgJ2xvYWRfZmFpbCc6IFwiVGhlcmUgd2FzIGEgcHJvYmxlbSBsb2FkaW5nIHRoZSBjb250ZW50cyBvZiB0aGUgZG9jdW1lbnRcIlxuICAgIH0sXG4gICAgYmxvY2tzOiB7XG4gICAgICB0ZXh0OiB7XG4gICAgICAgICd0aXRsZSc6IFwiVGV4dFwiXG4gICAgICB9LFxuICAgICAgbGlzdDoge1xuICAgICAgICAndGl0bGUnOiBcIkxpc3RcIlxuICAgICAgfSxcbiAgICAgIHF1b3RlOiB7XG4gICAgICAgICd0aXRsZSc6IFwiUXVvdGVcIixcbiAgICAgICAgJ2NyZWRpdF9maWVsZCc6IFwiQ3JlZGl0XCJcbiAgICAgIH0sXG4gICAgICBpbWFnZToge1xuICAgICAgICAndGl0bGUnOiBcIkltYWdlXCIsXG4gICAgICAgICd1cGxvYWRfZXJyb3InOiBcIlRoZXJlIHdhcyBhIHByb2JsZW0gd2l0aCB5b3VyIHVwbG9hZFwiXG4gICAgICB9LFxuICAgICAgdmlkZW86IHtcbiAgICAgICAgJ3RpdGxlJzogXCJWaWRlb1wiXG4gICAgICB9LFxuICAgICAgdHdlZXQ6IHtcbiAgICAgICAgJ3RpdGxlJzogXCJUd2VldFwiLFxuICAgICAgICAnZmV0Y2hfZXJyb3InOiBcIlRoZXJlIHdhcyBhIHByb2JsZW0gZmV0Y2hpbmcgeW91ciB0d2VldFwiXG4gICAgICB9LFxuICAgICAgZW1iZWRseToge1xuICAgICAgICAndGl0bGUnOiBcIkVtYmVkbHlcIixcbiAgICAgICAgJ2ZldGNoX2Vycm9yJzogXCJUaGVyZSB3YXMgYSBwcm9ibGVtIGZldGNoaW5nIHlvdXIgZW1iZWRcIixcbiAgICAgICAgJ2tleV9taXNzaW5nJzogXCJBbiBFbWJlZGx5IEFQSSBrZXkgbXVzdCBiZSBwcmVzZW50XCJcbiAgICAgIH0sXG4gICAgICBoZWFkaW5nOiB7XG4gICAgICAgICd0aXRsZSc6IFwiSGVhZGluZ1wiXG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5pZiAod2luZG93LmkxOG4gPT09IHVuZGVmaW5lZCkge1xuICAvLyBNaW5pbWFsIGkxOG4gc3R1YiB0aGF0IG9ubHkgcmVhZHMgdGhlIEVuZ2xpc2ggc3RyaW5nc1xuICB1dGlscy5sb2coXCJVc2luZyBpMThuIHN0dWJcIik7XG4gIHdpbmRvdy5pMThuID0ge1xuICAgIHQ6IGZ1bmN0aW9uKGtleSwgb3B0aW9ucykge1xuICAgICAgdmFyIHBhcnRzID0ga2V5LnNwbGl0KCc6JyksIHN0ciwgb2JqLCBwYXJ0LCBpO1xuXG4gICAgICBvYmogPSBMb2NhbGVzW2NvbmZpZy5sYW5ndWFnZV07XG5cbiAgICAgIGZvcihpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBhcnQgPSBwYXJ0c1tpXTtcblxuICAgICAgICBpZighXy5pc1VuZGVmaW5lZChvYmpbcGFydF0pKSB7XG4gICAgICAgICAgb2JqID0gb2JqW3BhcnRdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN0ciA9IG9iajtcblxuICAgICAgaWYgKCFfLmlzU3RyaW5nKHN0cikpIHsgcmV0dXJuIFwiXCI7IH1cblxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdfXycpID49IDApIHtcbiAgICAgICAgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaChmdW5jdGlvbihvcHQpIHtcbiAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgnX18nICsgb3B0ICsgJ19fJywgb3B0aW9uc1tvcHRdKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICB9O1xufSBlbHNlIHtcbiAgdXRpbHMubG9nKFwiVXNpbmcgaTE4bmV4dFwiKTtcbiAgLy8gT25seSB1c2UgaTE4bmV4dCB3aGVuIHRoZSBsaWJyYXJ5IGhhcyBiZWVuIGxvYWRlZCBieSB0aGUgdXNlciwga2VlcHNcbiAgLy8gZGVwZW5kZW5jaWVzIHNsaW1cbiAgaTE4bi5pbml0KHsgcmVzU3RvcmU6IExvY2FsZXMsIGZhbGxiYWNrTG5nOiBjb25maWcubGFuZ3VhZ2UsXG4gICAgICAgICAgICBuczogeyBuYW1lc3BhY2VzOiBbJ2dlbmVyYWwnLCAnYmxvY2tzJ10sIGRlZmF1bHROczogJ2dlbmVyYWwnIH1cbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9jYWxlcztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLmlzRW1wdHkgPSByZXF1aXJlKCdsb2Rhc2guaXNlbXB0eScpO1xuZXhwb3J0cy5pc0Z1bmN0aW9uID0gcmVxdWlyZSgnbG9kYXNoLmlzZnVuY3Rpb24nKTtcbmV4cG9ydHMuaXNPYmplY3QgPSByZXF1aXJlKCdsb2Rhc2guaXNvYmplY3QnKTtcbmV4cG9ydHMuaXNTdHJpbmcgPSByZXF1aXJlKCdsb2Rhc2guaXNzdHJpbmcnKTtcbmV4cG9ydHMuaXNVbmRlZmluZWQgPSByZXF1aXJlKCdsb2Rhc2guaXN1bmRlZmluZWQnKTtcbmV4cG9ydHMucmVzdWx0ID0gcmVxdWlyZSgnbG9kYXNoLnJlc3VsdCcpO1xuZXhwb3J0cy50ZW1wbGF0ZSA9IHJlcXVpcmUoJ2xvZGFzaC50ZW1wbGF0ZScpO1xuZXhwb3J0cy51bmlxdWVJZCA9IHJlcXVpcmUoJ2xvZGFzaC51bmlxdWVpZCcpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtZWRpYXRlZEV2ZW50czoge30sXG4gIGV2ZW50TmFtZXNwYWNlOiBudWxsLFxuICBfYmluZE1lZGlhdGVkRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICBPYmplY3Qua2V5cyh0aGlzLm1lZGlhdGVkRXZlbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50TmFtZSl7XG4gICAgICB2YXIgY2IgPSB0aGlzLm1lZGlhdGVkRXZlbnRzW2V2ZW50TmFtZV07XG4gICAgICBldmVudE5hbWUgPSB0aGlzLmV2ZW50TmFtZXNwYWNlID9cbiAgICAgICAgdGhpcy5ldmVudE5hbWVzcGFjZSArICc6JyArIGV2ZW50TmFtZSA6XG4gICAgICAgIGV2ZW50TmFtZTtcbiAgICAgIHRoaXMubWVkaWF0b3Iub24oZXZlbnROYW1lLCB0aGlzW2NiXS5iaW5kKHRoaXMpKTtcbiAgICB9LCB0aGlzKTtcbiAgfVxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB0YWdOYW1lOiAnZGl2JyxcbiAgY2xhc3NOYW1lOiAnc2lyLXRyZXZvcl9fdmlldycsXG4gIGF0dHJpYnV0ZXM6IHt9LFxuXG4gICQ6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoc2VsZWN0b3IpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKHRoaXMuc3RvcExpc3RlbmluZykpIHsgdGhpcy5zdG9wTGlzdGVuaW5nKCk7IH1cbiAgICB0aGlzLiRlbC5yZW1vdmUoKTtcbiAgfSxcblxuICBfZW5zdXJlRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLmVsKSB7XG4gICAgICB2YXIgYXR0cnMgPSBPYmplY3QuYXNzaWduKHt9LCBfLnJlc3VsdCh0aGlzLCAnYXR0cmlidXRlcycpKSxcbiAgICAgIGh0bWw7XG4gICAgICBpZiAodGhpcy5pZCkgeyBhdHRycy5pZCA9IHRoaXMuaWQ7IH1cbiAgICAgIGlmICh0aGlzLmNsYXNzTmFtZSkgeyBhdHRyc1snY2xhc3MnXSA9IHRoaXMuY2xhc3NOYW1lOyB9XG5cbiAgICAgIGlmIChhdHRycy5odG1sKSB7XG4gICAgICAgIGh0bWwgPSBhdHRycy5odG1sO1xuICAgICAgICBkZWxldGUgYXR0cnMuaHRtbDtcbiAgICAgIH1cbiAgICAgIHZhciAkZWwgPSAkKCc8JyArIHRoaXMudGFnTmFtZSArICc+JykuYXR0cihhdHRycyk7XG4gICAgICBpZiAoaHRtbCkgeyAkZWwuaHRtbChodG1sKTsgfVxuICAgICAgdGhpcy5fc2V0RWxlbWVudCgkZWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZXRFbGVtZW50KHRoaXMuZWwpO1xuICAgIH1cbiAgfSxcblxuICBfc2V0RWxlbWVudDogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHRoaXMuJGVsID0gJChlbGVtZW50KTtcbiAgICB0aGlzLmVsID0gdGhpcy4kZWxbMF07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBCbG9ja1Jlb3JkZXIgPSByZXF1aXJlKCcuL2Jsb2NrLXJlb3JkZXInKTtcblxudmFyIFNpbXBsZUJsb2NrID0gZnVuY3Rpb24oZGF0YSwgaW5zdGFuY2VfaWQsIG1lZGlhdG9yKSB7XG4gIHRoaXMuY3JlYXRlU3RvcmUoZGF0YSk7XG4gIHRoaXMuYmxvY2tJRCA9IF8udW5pcXVlSWQoJ3N0LWJsb2NrLScpO1xuICB0aGlzLmluc3RhbmNlSUQgPSBpbnN0YW5jZV9pZDtcbiAgdGhpcy5tZWRpYXRvciA9IG1lZGlhdG9yO1xuXG4gIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuXG4gIHRoaXMuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuT2JqZWN0LmFzc2lnbihTaW1wbGVCbG9jay5wcm90b3R5cGUsIHJlcXVpcmUoJy4vZnVuY3Rpb24tYmluZCcpLCByZXF1aXJlKCcuL2V2ZW50cycpLCByZXF1aXJlKCcuL3JlbmRlcmFibGUnKSwgcmVxdWlyZSgnLi9ibG9jay1zdG9yZScpLCB7XG5cbiAgZm9jdXMgOiBmdW5jdGlvbigpIHt9LFxuXG4gIHZhbGlkIDogZnVuY3Rpb24oKSB7IHJldHVybiB0cnVlOyB9LFxuXG4gIGNsYXNzTmFtZTogJ3N0LWJsb2NrJyxcblxuICBibG9ja190ZW1wbGF0ZTogXy50ZW1wbGF0ZShcbiAgICBcIjxkaXYgY2xhc3M9J3N0LWJsb2NrX19pbm5lcic+PCU9IGVkaXRvcl9odG1sICU+PC9kaXY+XCJcbiAgKSxcblxuICBhdHRyaWJ1dGVzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2lkJzogdGhpcy5ibG9ja0lELFxuICAgICAgJ2RhdGEtdHlwZSc6IHRoaXMudHlwZSxcbiAgICAgICdkYXRhLWluc3RhbmNlJzogdGhpcy5pbnN0YW5jZUlEXG4gICAgfTtcbiAgfSxcblxuICB0aXRsZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHV0aWxzLnRpdGxlaXplKHRoaXMudHlwZS5yZXBsYWNlKC9bXFxXX10vZywgJyAnKSk7XG4gIH0sXG5cbiAgYmxvY2tDU1NDbGFzczogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5ibG9ja0NTU0NsYXNzID0gdXRpbHMudG9TbHVnKHRoaXMudHlwZSk7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tDU1NDbGFzcztcbiAgfSxcblxuICB0eXBlOiAnJyxcblxuICBjbGFzczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHV0aWxzLmNsYXNzaWZ5KHRoaXMudHlwZSk7XG4gIH0sXG5cbiAgZWRpdG9ySFRNTDogJycsXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7fSxcblxuICBvbkJsb2NrUmVuZGVyOiBmdW5jdGlvbigpe30sXG4gIGJlZm9yZUJsb2NrUmVuZGVyOiBmdW5jdGlvbigpe30sXG5cbiAgX3NldEJsb2NrSW5uZXIgOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZWRpdG9yX2h0bWwgPSBfLnJlc3VsdCh0aGlzLCAnZWRpdG9ySFRNTCcpO1xuXG4gICAgdGhpcy4kZWwuYXBwZW5kKFxuICAgICAgdGhpcy5ibG9ja190ZW1wbGF0ZSh7IGVkaXRvcl9odG1sOiBlZGl0b3JfaHRtbCB9KVxuICAgICk7XG5cbiAgICB0aGlzLiRpbm5lciA9IHRoaXMuJGVsLmZpbmQoJy5zdC1ibG9ja19faW5uZXInKTtcbiAgICB0aGlzLiRpbm5lci5iaW5kKCdjbGljayBtb3VzZW92ZXInLCBmdW5jdGlvbihlKXsgZS5zdG9wUHJvcGFnYXRpb24oKTsgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmJlZm9yZUJsb2NrUmVuZGVyKCk7XG5cbiAgICB0aGlzLl9zZXRCbG9ja0lubmVyKCk7XG4gICAgdGhpcy5fYmxvY2tQcmVwYXJlKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBfYmxvY2tQcmVwYXJlIDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5faW5pdFVJKCk7XG4gICAgdGhpcy5faW5pdE1lc3NhZ2VzKCk7XG5cbiAgICB0aGlzLmNoZWNrQW5kTG9hZERhdGEoKTtcblxuICAgIHRoaXMuJGVsLmFkZENsYXNzKCdzdC1pdGVtLXJlYWR5Jyk7XG4gICAgdGhpcy5vbihcIm9uUmVuZGVyXCIsIHRoaXMub25CbG9ja1JlbmRlcik7XG4gICAgdGhpcy5zYXZlKCk7XG4gIH0sXG5cbiAgX3dpdGhVSUNvbXBvbmVudDogZnVuY3Rpb24oY29tcG9uZW50LCBjbGFzc05hbWUsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy4kdWkuYXBwZW5kKGNvbXBvbmVudC5yZW5kZXIoKS4kZWwpO1xuICAgIGlmIChjbGFzc05hbWUgJiYgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuJHVpLm9uKCdjbGljaycsIGNsYXNzTmFtZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgfSxcblxuICBfaW5pdFVJIDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHVpX2VsZW1lbnQgPSAkKFwiPGRpdj5cIiwgeyAnY2xhc3MnOiAnc3QtYmxvY2tfX3VpJyB9KTtcbiAgICB0aGlzLiRpbm5lci5hcHBlbmQodWlfZWxlbWVudCk7XG4gICAgdGhpcy4kdWkgPSB1aV9lbGVtZW50O1xuICAgIHRoaXMuX2luaXRVSUNvbXBvbmVudHMoKTtcbiAgfSxcblxuICBfaW5pdE1lc3NhZ2VzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbXNnc19lbGVtZW50ID0gJChcIjxkaXY+XCIsIHsgJ2NsYXNzJzogJ3N0LWJsb2NrX19tZXNzYWdlcycgfSk7XG4gICAgdGhpcy4kaW5uZXIucHJlcGVuZChtc2dzX2VsZW1lbnQpO1xuICAgIHRoaXMuJG1lc3NhZ2VzID0gbXNnc19lbGVtZW50O1xuICB9LFxuXG4gIGFkZE1lc3NhZ2U6IGZ1bmN0aW9uKG1zZywgYWRkaXRpb25hbENsYXNzKSB7XG4gICAgdmFyICRtc2cgPSAkKFwiPHNwYW4+XCIsIHsgaHRtbDogbXNnLCBjbGFzczogXCJzdC1tc2cgXCIgKyBhZGRpdGlvbmFsQ2xhc3MgfSk7XG4gICAgdGhpcy4kbWVzc2FnZXMuYXBwZW5kKCRtc2cpXG4gICAgLmFkZENsYXNzKCdzdC1ibG9ja19fbWVzc2FnZXMtLWlzLXZpc2libGUnKTtcbiAgICByZXR1cm4gJG1zZztcbiAgfSxcblxuICByZXNldE1lc3NhZ2VzOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRtZXNzYWdlcy5odG1sKCcnKVxuICAgIC5yZW1vdmVDbGFzcygnc3QtYmxvY2tfX21lc3NhZ2VzLS1pcy12aXNpYmxlJyk7XG4gIH0sXG5cbiAgX2luaXRVSUNvbXBvbmVudHM6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3dpdGhVSUNvbXBvbmVudChuZXcgQmxvY2tSZW9yZGVyKHRoaXMuJGVsKSk7XG4gIH1cblxufSk7XG5cblNpbXBsZUJsb2NrLmZuID0gU2ltcGxlQmxvY2sucHJvdG90eXBlO1xuXG4vLyBBbGxvdyBvdXIgQmxvY2sgdG8gYmUgZXh0ZW5kZWQuXG5TaW1wbGVCbG9jay5leHRlbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvZXh0ZW5kJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2ltcGxlQmxvY2s7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1hcmtkb3duLCB0eXBlKSB7XG5cbiAgLy8gRGVmZXJyaW5nIHJlcXVpcmluZyB0aGVzZSB0byBzaWRlc3RlcCBhIGNpcmN1bGFyIGRlcGVuZGVuY3k6XG4gIC8vIEJsb2NrIC0+IHRoaXMgLT4gQmxvY2tzIC0+IEJsb2NrXG4gIHZhciBCbG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xuICB2YXIgRm9ybWF0dGVycyA9IHJlcXVpcmUoJy4vZm9ybWF0dGVycycpO1xuXG4gIC8vIE1EIC0+IEhUTUxcbiAgdHlwZSA9IHV0aWxzLmNsYXNzaWZ5KHR5cGUpO1xuXG4gIHZhciBodG1sID0gbWFya2Rvd24sXG4gICAgICBzaG91bGRXcmFwID0gdHlwZSA9PT0gXCJUZXh0XCI7XG5cbiAgaWYoXy5pc1VuZGVmaW5lZChzaG91bGRXcmFwKSkgeyBzaG91bGRXcmFwID0gZmFsc2U7IH1cblxuICBpZiAoc2hvdWxkV3JhcCkge1xuICAgIGh0bWwgPSBcIjxkaXY+XCIgKyBodG1sO1xuICB9XG5cbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXFxbKFteXFxdXSspXFxdXFwoKFteXFwpXSspXFwpL2dtLGZ1bmN0aW9uKG1hdGNoLCBwMSwgcDIpe1xuICAgIHJldHVybiBcIjxhIGhyZWY9J1wiK3AyK1wiJz5cIitwMS5yZXBsYWNlKC9cXG4vZywgJycpK1wiPC9hPlwiO1xuICB9KTtcblxuICAvLyBUaGlzIG1heSBzZWVtIGNyYXp5LCBidXQgYmVjYXVzZSBKUyBkb2Vzbid0IGhhdmUgYSBsb29rIGJlaGluZCxcbiAgLy8gd2UgcmV2ZXJzZSB0aGUgc3RyaW5nIHRvIHJlZ2V4IG91dCB0aGUgaXRhbGljIGl0ZW1zIChhbmQgYm9sZClcbiAgLy8gYW5kIGxvb2sgZm9yIHNvbWV0aGluZyB0aGF0IGRvZXNuJ3Qgc3RhcnQgKG9yIGVuZCBpbiB0aGUgcmV2ZXJzZWQgc3RyaW5ncyBjYXNlKVxuICAvLyB3aXRoIGEgc2xhc2guXG4gIGh0bWwgPSB1dGlscy5yZXZlcnNlKFxuICAgICAgICAgICB1dGlscy5yZXZlcnNlKGh0bWwpXG4gICAgICAgICAgIC5yZXBsYWNlKC9fKD8hXFxcXCkoKF9cXFxcfFteX10pKilfKD89JHxbXlxcXFxdKS9nbSwgZnVuY3Rpb24obWF0Y2gsIHAxKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIj5pLzxcIisgcDEucmVwbGFjZSgvXFxuL2csICcnKS5yZXBsYWNlKC9bXFxzXSskLywnJykgK1wiPmk8XCI7XG4gICAgICAgICAgIH0pXG4gICAgICAgICAgIC5yZXBsYWNlKC9cXCpcXCooPyFcXFxcKSgoXFwqXFwqXFxcXHxbXlxcKlxcKl0pKilcXCpcXCooPz0kfFteXFxcXF0pL2dtLCBmdW5jdGlvbihtYXRjaCwgcDEpe1xuICAgICAgICAgICAgICByZXR1cm4gXCI+Yi88XCIrIHAxLnJlcGxhY2UoL1xcbi9nLCAnJykucmVwbGFjZSgvW1xcc10rJC8sJycpICtcIj5iPFwiO1xuICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG5cbiAgaHRtbCA9ICBodG1sLnJlcGxhY2UoL15cXD4gKC4rKSQvbWcsXCIkMVwiKTtcblxuICAvLyBVc2UgY3VzdG9tIGZvcm1hdHRlcnMgdG9IVE1MIGZ1bmN0aW9ucyAoaWYgYW55IGV4aXN0KVxuICB2YXIgZm9ybWF0TmFtZSwgZm9ybWF0O1xuICBmb3IoZm9ybWF0TmFtZSBpbiBGb3JtYXR0ZXJzKSB7XG4gICAgaWYgKEZvcm1hdHRlcnMuaGFzT3duUHJvcGVydHkoZm9ybWF0TmFtZSkpIHtcbiAgICAgIGZvcm1hdCA9IEZvcm1hdHRlcnNbZm9ybWF0TmFtZV07XG4gICAgICAvLyBEbyB3ZSBoYXZlIGEgdG9IVE1MIGZ1bmN0aW9uP1xuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGZvcm1hdC50b0hUTUwpICYmIF8uaXNGdW5jdGlvbihmb3JtYXQudG9IVE1MKSkge1xuICAgICAgICBodG1sID0gZm9ybWF0LnRvSFRNTChodG1sKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBVc2UgY3VzdG9tIGJsb2NrIHRvSFRNTCBmdW5jdGlvbnMgKGlmIGFueSBleGlzdClcbiAgdmFyIGJsb2NrO1xuICBpZiAoQmxvY2tzLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG4gICAgYmxvY2sgPSBCbG9ja3NbdHlwZV07XG4gICAgLy8gRG8gd2UgaGF2ZSBhIHRvSFRNTCBmdW5jdGlvbj9cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoYmxvY2sucHJvdG90eXBlLnRvSFRNTCkgJiYgXy5pc0Z1bmN0aW9uKGJsb2NrLnByb3RvdHlwZS50b0hUTUwpKSB7XG4gICAgICBodG1sID0gYmxvY2sucHJvdG90eXBlLnRvSFRNTChodG1sKTtcbiAgICB9XG4gIH1cblxuICBpZiAoc2hvdWxkV3JhcCkge1xuICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcblxcbi9nbSwgXCI8L2Rpdj48ZGl2Pjxicj48L2Rpdj48ZGl2PlwiKTtcbiAgICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXG4vZ20sIFwiPC9kaXY+PGRpdj5cIik7XG4gIH1cblxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXHQvZywgXCImbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcIilcbiAgICAgICAgICAgICAucmVwbGFjZSgvXFxuL2csIFwiPGJyPlwiKVxuICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCpcXCovLCBcIlwiKVxuICAgICAgICAgICAgIC5yZXBsYWNlKC9fXy8sIFwiXCIpOyAgLy8gQ2xlYW51cCBhbnkgbWFya2Rvd24gY2hhcmFjdGVycyBsZWZ0XG5cbiAgLy8gUmVwbGFjZSBlc2NhcGVkXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcXFxcXCovZywgXCIqXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXFsvZywgXCJbXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXF0vZywgXCJdXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXF8vZywgXCJfXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXCgvZywgXCIoXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXCkvZywgXCIpXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXC0vZywgXCItXCIpO1xuXG4gIGlmIChzaG91bGRXcmFwKSB7XG4gICAgaHRtbCArPSBcIjwvZGl2PlwiO1xuICB9XG5cbiAgcmV0dXJuIGh0bWw7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjb250ZW50LCB0eXBlKSB7XG5cbiAgLy8gRGVmZXJyaW5nIHJlcXVpcmluZyB0aGVzZSB0byBzaWRlc3RlcCBhIGNpcmN1bGFyIGRlcGVuZGVuY3k6XG4gIC8vIEJsb2NrIC0+IHRoaXMgLT4gQmxvY2tzIC0+IEJsb2NrXG4gIHZhciBCbG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xuICB2YXIgRm9ybWF0dGVycyA9IHJlcXVpcmUoJy4vZm9ybWF0dGVycycpO1xuXG4gIHR5cGUgPSB1dGlscy5jbGFzc2lmeSh0eXBlKTtcblxuICB2YXIgbWFya2Rvd24gPSBjb250ZW50O1xuXG4gIC8vTm9ybWFsaXNlIHdoaXRlc3BhY2VcbiAgbWFya2Rvd24gPSBtYXJrZG93bi5yZXBsYWNlKC8mbmJzcDsvZyxcIiBcIik7XG5cbiAgLy8gRmlyc3Qgb2YgYWxsLCBzdHJpcCBhbnkgYWRkaXRpb25hbCBmb3JtYXR0aW5nXG4gIC8vIE1TV29yZCwgSSdtIGxvb2tpbmcgYXQgeW91LCBwdW5rLlxuICBtYXJrZG93biA9IG1hcmtkb3duLnJlcGxhY2UoLyggY2xhc3M9KFwiKT9Nc29bYS16QS1aXSsoXCIpPykvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPCEtLSguKj8pLS0+L2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcL1xcKiguKj8pXFwqXFwvL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzwoXFwvKSoobWV0YXxsaW5rfHNwYW58XFxcXD94bWw6fHN0MTp8bzp8Zm9udCkoLio/KT4vZ2ksICcnKTtcblxuICB2YXIgYmFkVGFncyA9IFsnc3R5bGUnLCAnc2NyaXB0JywgJ2FwcGxldCcsICdlbWJlZCcsICdub2ZyYW1lcycsICdub3NjcmlwdCddLFxuICAgICAgdGFnU3RyaXBwZXIsIGk7XG5cbiAgZm9yIChpID0gMDsgaTwgYmFkVGFncy5sZW5ndGg7IGkrKykge1xuICAgIHRhZ1N0cmlwcGVyID0gbmV3IFJlZ0V4cCgnPCcrYmFkVGFnc1tpXSsnLio/JytiYWRUYWdzW2ldKycoLio/KT4nLCAnZ2knKTtcbiAgICBtYXJrZG93biA9IG1hcmtkb3duLnJlcGxhY2UodGFnU3RyaXBwZXIsICcnKTtcbiAgfVxuXG4gIC8vIEVzY2FwZSBhbnl0aGluZyBpbiBoZXJlIHRoYXQgKmNvdWxkKiBiZSBjb25zaWRlcmVkIGFzIE1EXG4gIC8vIE1hcmtkb3duIGNoYXJzIHdlIGNhcmUgYWJvdXQ6ICogW10gXyAoKSAtXG4gIG1hcmtkb3duID0gbWFya2Rvd24ucmVwbGFjZSgvXFwqL2csIFwiXFxcXCpcIilcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcWy9nLCBcIlxcXFxbXCIpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXF0vZywgXCJcXFxcXVwiKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxfL2csIFwiXFxcXF9cIilcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcKC9nLCBcIlxcXFwoXCIpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCkvZywgXCJcXFxcKVwiKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwtL2csIFwiXFxcXC1cIik7XG5cbiAgdmFyIGlubGluZVRhZ3MgPSBbXCJlbVwiLCBcImlcIiwgXCJzdHJvbmdcIiwgXCJiXCJdO1xuXG4gIGZvciAoaSA9IDA7IGk8IGlubGluZVRhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICB0YWdTdHJpcHBlciA9IG5ldyBSZWdFeHAoJzwnK2lubGluZVRhZ3NbaV0rJz48YnI+PC8nK2lubGluZVRhZ3NbaV0rJz4nLCAnZ2knKTtcbiAgICBtYXJrZG93biA9IG1hcmtkb3duLnJlcGxhY2UodGFnU3RyaXBwZXIsICc8YnI+Jyk7XG4gIH1cblxuICBmdW5jdGlvbiByZXBsYWNlQm9sZHMobWF0Y2gsIHAxLCBwMil7XG4gICAgaWYoXy5pc1VuZGVmaW5lZChwMikpIHsgcDIgPSAnJzsgfVxuICAgIHJldHVybiBcIioqXCIgKyBwMS5yZXBsYWNlKC88KC4pP2JyKC4pPz4vZywgJycpICsgXCIqKlwiICsgcDI7XG4gIH1cblxuICBmdW5jdGlvbiByZXBsYWNlSXRhbGljcyhtYXRjaCwgcDEsIHAyKXtcbiAgICBpZihfLmlzVW5kZWZpbmVkKHAyKSkgeyBwMiA9ICcnOyB9XG4gICAgcmV0dXJuIFwiX1wiICsgcDEucmVwbGFjZSgvPCguKT9iciguKT8+L2csICcnKSArIFwiX1wiICsgcDI7XG4gIH1cblxuICBtYXJrZG93biA9IG1hcmtkb3duLnJlcGxhY2UoLzwoXFx3KykoPzpcXHMrXFx3Kz1cIlteXCJdKyg/OlwiXFwkW15cIl0rXCJbXlwiXSspP1wiKSo+XFxzKjxcXC9cXDE+L2dpbSwgJycpIC8vRW1wdHkgZWxlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxuL21nLFwiXCIpXG4gICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzxhLio/aHJlZj1bXCJcIiddKC4qPylbXCJcIiddLio/PiguKj8pPFxcL2E+L2dpbSwgZnVuY3Rpb24obWF0Y2gsIHAxLCBwMil7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJbXCIgKyBwMi50cmltKCkucmVwbGFjZSgvPCguKT9iciguKT8+L2csICcnKSArIFwiXShcIisgcDEgK1wiKVwiO1xuICAgICAgICAgICAgICAgICAgICAgIH0pIC8vIEh5cGVybGlua3NcbiAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPHN0cm9uZz4oPzpcXHMqKSguKj8pKFxccykqPzxcXC9zdHJvbmc+L2dpbSwgcmVwbGFjZUJvbGRzKVxuICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88Yj4oPzpcXHMqKSguKj8pKFxccyopPzxcXC9iPi9naW0sIHJlcGxhY2VCb2xkcylcbiAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPGVtPig/OlxccyopKC4qPykoXFxzKik/PFxcL2VtPi9naW0sIHJlcGxhY2VJdGFsaWNzKVxuICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88aT4oPzpcXHMqKSguKj8pKFxccyopPzxcXC9pPi9naW0sIHJlcGxhY2VJdGFsaWNzKTtcblxuXG4gIC8vIFVzZSBjdXN0b20gZm9ybWF0dGVycyB0b01hcmtkb3duIGZ1bmN0aW9ucyAoaWYgYW55IGV4aXN0KVxuICB2YXIgZm9ybWF0TmFtZSwgZm9ybWF0O1xuICBmb3IoZm9ybWF0TmFtZSBpbiBGb3JtYXR0ZXJzKSB7XG4gICAgaWYgKEZvcm1hdHRlcnMuaGFzT3duUHJvcGVydHkoZm9ybWF0TmFtZSkpIHtcbiAgICAgIGZvcm1hdCA9IEZvcm1hdHRlcnNbZm9ybWF0TmFtZV07XG4gICAgICAvLyBEbyB3ZSBoYXZlIGEgdG9NYXJrZG93biBmdW5jdGlvbj9cbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZChmb3JtYXQudG9NYXJrZG93bikgJiYgXy5pc0Z1bmN0aW9uKGZvcm1hdC50b01hcmtkb3duKSkge1xuICAgICAgICBtYXJrZG93biA9IGZvcm1hdC50b01hcmtkb3duKG1hcmtkb3duKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBEbyBvdXIgZ2VuZXJpYyBzdHJpcHBpbmcgb3V0XG4gIG1hcmtkb3duID0gbWFya2Rvd24ucmVwbGFjZSgvKFtePD5dKykoPGRpdj4pL2csXCIkMVxcbiQyXCIpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGl2aXRpcyBzdHlsZSBsaW5lIGJyZWFrcyAoaGFuZGxlIHRoZSBmaXJzdCBsaW5lKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPGRpdj48ZGl2Pi9nLCdcXG48ZGl2PicpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBeIChkb3VibGUgb3BlbmluZyBkaXZzIHdpdGggb25lIGNsb3NlIGZyb20gQ2hyb21lKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKD86PGRpdj4pKFtePD5dKykoPzo8ZGl2PikvZyxcIiQxXFxuXCIpICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIF4gKGhhbmRsZSBuZXN0ZWQgZGl2cyB0aGF0IHN0YXJ0IHdpdGggY29udGVudClcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyg/OjxkaXY+KSg/Ojxicj4pPyhbXjw+XSspKD86PGJyPik/KD86PFxcL2Rpdj4pL2csXCIkMVxcblwiKSAgICAgICAgLy8gXiAoaGFuZGxlIGNvbnRlbnQgaW5zaWRlIGRpdnMpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88XFwvcD4vZyxcIlxcblxcblwiKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUCB0YWdzIGFzIGxpbmUgYnJlYWtzXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88KC4pP2JyKC4pPz4vZyxcIlxcblwiKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udmVydCBub3JtYWwgbGluZSBicmVha3NcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyZsdDsvZyxcIjxcIikucmVwbGFjZSgvJmd0Oy9nLFwiPlwiKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFbmNvZGluZ1xuXG4gIC8vIFVzZSBjdXN0b20gYmxvY2sgdG9NYXJrZG93biBmdW5jdGlvbnMgKGlmIGFueSBleGlzdClcbiAgdmFyIGJsb2NrO1xuICBpZiAoQmxvY2tzLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG4gICAgYmxvY2sgPSBCbG9ja3NbdHlwZV07XG4gICAgLy8gRG8gd2UgaGF2ZSBhIHRvTWFya2Rvd24gZnVuY3Rpb24/XG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGJsb2NrLnByb3RvdHlwZS50b01hcmtkb3duKSAmJiBfLmlzRnVuY3Rpb24oYmxvY2sucHJvdG90eXBlLnRvTWFya2Rvd24pKSB7XG4gICAgICBtYXJrZG93biA9IGJsb2NrLnByb3RvdHlwZS50b01hcmtkb3duKG1hcmtkb3duKTtcbiAgICB9XG4gIH1cblxuICAvLyBTdHJpcCByZW1haW5pbmcgSFRNTFxuICBtYXJrZG93biA9IG1hcmtkb3duLnJlcGxhY2UoLzxcXC8/W14+XSsoPnwkKS9nLCBcIlwiKTtcblxuICByZXR1cm4gbWFya2Rvd247XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xuXG52YXIgdXJsUmVnZXggPSAvXig/OihbQS1aYS16XSspOik/KFxcL3swLDN9KShbMC05LlxcLUEtWmEtel0rKSg/OjooXFxkKykpPyg/OlxcLyhbXj8jXSopKT8oPzpcXD8oW14jXSopKT8oPzojKC4qKSk/JC87XG5cbnZhciB1dGlscyA9IHtcbiAgbG9nOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoY29uc29sZSkgJiYgY29uZmlnLmRlYnVnKSB7XG4gICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfSxcblxuICBpc1VSSSA6IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHJldHVybiAodXJsUmVnZXgudGVzdChzdHJpbmcpKTtcbiAgfSxcblxuICB0aXRsZWl6ZTogZnVuY3Rpb24oc3RyKXtcbiAgICBpZiAoc3RyID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHN0ciAgPSBTdHJpbmcoc3RyKS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvKD86XnxcXHN8LSlcXFMvZywgZnVuY3Rpb24oYyl7IHJldHVybiBjLnRvVXBwZXJDYXNlKCk7IH0pO1xuICB9LFxuXG4gIGNsYXNzaWZ5OiBmdW5jdGlvbihzdHIpe1xuICAgIHJldHVybiB1dGlscy50aXRsZWl6ZShTdHJpbmcoc3RyKS5yZXBsYWNlKC9bXFxXX10vZywgJyAnKSkucmVwbGFjZSgvXFxzL2csICcnKTtcbiAgfSxcblxuICBjYXBpdGFsaXplIDogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zdWJzdHJpbmcoMSkudG9Mb3dlckNhc2UoKTtcbiAgfSxcblxuICBmbGF0dGVuOiBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgeCA9IHt9O1xuICAgIChBcnJheS5pc0FycmF5KG9iaikgPyBvYmogOiBPYmplY3Qua2V5cyhvYmopKS5mb3JFYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICB4W2ldID0gdHJ1ZTtcbiAgICB9KTtcbiAgICAvKiBfLmVhY2gob2JqLCBmdW5jdGlvbihhLGIpIHtcbiAgICAgKiAgIHhbKF8uaXNBcnJheShvYmopKSA/IGEgOiBiXSA9IHRydWU7XG4gICAgICogfSk7ICovXG4gICAgcmV0dXJuIHg7XG4gIH0sXG5cbiAgdW5kZXJzY29yZWQ6IGZ1bmN0aW9uKHN0cil7XG4gICAgcmV0dXJuIHN0ci50cmltKCkucmVwbGFjZSgvKFthLXpcXGRdKShbQS1aXSspL2csICckMV8kMicpXG4gICAgLnJlcGxhY2UoL1stXFxzXSsvZywgJ18nKS50b0xvd2VyQ2FzZSgpO1xuICB9LFxuXG4gIHJldmVyc2U6IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBzdHIuc3BsaXQoXCJcIikucmV2ZXJzZSgpLmpvaW4oXCJcIik7XG4gIH0sXG5cbiAgdG9TbHVnOiBmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gc3RyXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAucmVwbGFjZSgvW15cXHcgXSsvZywnJylcbiAgICAucmVwbGFjZSgvICsvZywnLScpO1xuICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbHM7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLy8ganNoaW50IGZyZWV6ZTogZmFsc2VcblxuaWYgKCFbXS5pbmNsdWRlcykge1xuICBBcnJheS5wcm90b3R5cGUuaW5jbHVkZXMgPSBmdW5jdGlvbihzZWFyY2hFbGVtZW50IC8qLCBmcm9tSW5kZXgqLyApIHtcbiAgICBpZiAodGhpcyA9PT0gdW5kZWZpbmVkIHx8IHRoaXMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IHRoaXMgdmFsdWUgdG8gb2JqZWN0Jyk7XG4gICAgfVxuICAgIHZhciBPID0gT2JqZWN0KHRoaXMpO1xuICAgIHZhciBsZW4gPSBwYXJzZUludChPLmxlbmd0aCkgfHwgMDtcbiAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBuID0gcGFyc2VJbnQoYXJndW1lbnRzWzFdKSB8fCAwO1xuICAgIHZhciBrO1xuICAgIGlmIChuID49IDApIHtcbiAgICAgIGsgPSBuO1xuICAgIH0gZWxzZSB7XG4gICAgICBrID0gbGVuICsgbjtcbiAgICAgIGlmIChrIDwgMCkge1xuICAgICAgICBrID0gMDtcbiAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUgKGsgPCBsZW4pIHtcbiAgICAgIHZhciBjdXJyZW50RWxlbWVudCA9IE9ba107XG4gICAgICBpZiAoc2VhcmNoRWxlbWVudCA9PT0gY3VycmVudEVsZW1lbnQgfHxcbiAgICAgICAgIChzZWFyY2hFbGVtZW50ICE9PSBzZWFyY2hFbGVtZW50ICYmIGN1cnJlbnRFbGVtZW50ICE9PSBjdXJyZW50RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBrKys7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbn1cbiJdfQ==
