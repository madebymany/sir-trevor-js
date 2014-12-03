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

},{"./src/":93}],2:[function(require,module,exports){
(function (process){
 /*!
  * https://github.com/paulmillr/es6-shim
  * @license es6-shim Copyright 2013-2014 by Paul Miller (http://paulmillr.com)
  *   and contributors,  MIT License
  * es6-shim: v0.21.0
  * see https://github.com/paulmillr/es6-shim/blob/master/LICENSE
  * Details and documentation:
  * https://github.com/paulmillr/es6-shim/
  */

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.returnExports = factory();
  }
}(this, function () {
  'use strict';

  var isCallableWithoutNew = function (func) {
    try { func(); }
    catch (e) { return false; }
    return true;
  };

  var supportsSubclassing = function (C, f) {
    /* jshint proto:true */
    try {
      var Sub = function () { C.apply(this, arguments); };
      if (!Sub.__proto__) { return false; /* skip test on IE < 11 */ }
      Object.setPrototypeOf(Sub, C);
      Sub.prototype = Object.create(C.prototype, {
        constructor: { value: C }
      });
      return f(Sub);
    } catch (e) {
      return false;
    }
  };

  var arePropertyDescriptorsSupported = function () {
    try {
      Object.defineProperty({}, 'x', {});
      return true;
    } catch (e) { /* this is IE 8. */
      return false;
    }
  };

  var startsWithRejectsRegex = function () {
    var rejectsRegex = false;
    if (String.prototype.startsWith) {
      try {
        '/a/'.startsWith(/a/);
      } catch (e) { /* this is spec compliant */
        rejectsRegex = true;
      }
    }
    return rejectsRegex;
  };

  /*jshint evil: true */
  var getGlobal = new Function('return this;');
  /*jshint evil: false */

  var globals = getGlobal();
  var global_isFinite = globals.isFinite;
  var supportsDescriptors = !!Object.defineProperty && arePropertyDescriptorsSupported();
  var startsWithIsCompliant = startsWithRejectsRegex();
  var _slice = Array.prototype.slice;
  var _indexOf = String.prototype.indexOf;
  var _toString = Object.prototype.toString;
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  var ArrayIterator; // make our implementation private

  var defineProperty = function (object, name, value, force) {
    if (!force && name in object) { return; }
    if (supportsDescriptors) {
      Object.defineProperty(object, name, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: value
      });
    } else {
      object[name] = value;
    }
  };

  // Define configurable, writable and non-enumerable props
  // if they don’t exist.
  var defineProperties = function (object, map) {
    Object.keys(map).forEach(function (name) {
      var method = map[name];
      defineProperty(object, name, method, false);
    });
  };

  // Simple shim for Object.create on ES3 browsers
  // (unlike real shim, no attempt to support `prototype === null`)
  var create = Object.create || function (prototype, properties) {
    function Type() {}
    Type.prototype = prototype;
    var object = new Type();
    if (typeof properties !== 'undefined') {
      defineProperties(object, properties);
    }
    return object;
  };

  // This is a private name in the es6 spec, equal to '[Symbol.iterator]'
  // we're going to use an arbitrary _-prefixed name to make our shims
  // work properly with each other, even though we don't have full Iterator
  // support.  That is, `Array.from(map.keys())` will work, but we don't
  // pretend to export a "real" Iterator interface.
  var $iterator$ = (typeof Symbol === 'function' && Symbol.iterator) || '_es6-shim iterator_';
  // Firefox ships a partial implementation using the name @@iterator.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=907077#c14
  // So use that name if we detect it.
  if (globals.Set && typeof new globals.Set()['@@iterator'] === 'function') {
    $iterator$ = '@@iterator';
  }
  var addIterator = function (prototype, impl) {
    if (!impl) { impl = function iterator() { return this; }; }
    var o = {};
    o[$iterator$] = impl;
    defineProperties(prototype, o);
    /* jshint notypeof: true */
    if (!prototype[$iterator$] && typeof $iterator$ === 'symbol') {
      // implementations are buggy when $iterator$ is a Symbol
      prototype[$iterator$] = impl;
    }
  };

  // taken directly from https://github.com/ljharb/is-arguments/blob/master/index.js
  // can be replaced with require('is-arguments') if we ever use a build process instead
  var isArguments = function isArguments(value) {
    var str = _toString.call(value);
    var result = str === '[object Arguments]';
    if (!result) {
      result = str !== '[object Array]' &&
        value !== null &&
        typeof value === 'object' &&
        typeof value.length === 'number' &&
        value.length >= 0 &&
        _toString.call(value.callee) === '[object Function]';
    }
    return result;
  };

  var emulateES6construct = function (o) {
    if (!ES.TypeIsObject(o)) { throw new TypeError('bad object'); }
    // es5 approximation to es6 subclass semantics: in es6, 'new Foo'
    // would invoke Foo.@@create to allocation/initialize the new object.
    // In es5 we just get the plain object.  So if we detect an
    // uninitialized object, invoke o.constructor.@@create
    if (!o._es6construct) {
      if (o.constructor && ES.IsCallable(o.constructor['@@create'])) {
        o = o.constructor['@@create'](o);
      }
      defineProperties(o, { _es6construct: true });
    }
    return o;
  };

  var ES = {
    CheckObjectCoercible: function (x, optMessage) {
      /* jshint eqnull:true */
      if (x == null) {
        throw new TypeError(optMessage || 'Cannot call method on ' + x);
      }
      return x;
    },

    TypeIsObject: function (x) {
      /* jshint eqnull:true */
      // this is expensive when it returns false; use this function
      // when you expect it to return true in the common case.
      return x != null && Object(x) === x;
    },

    ToObject: function (o, optMessage) {
      return Object(ES.CheckObjectCoercible(o, optMessage));
    },

    IsCallable: function (x) {
      return typeof x === 'function' &&
        // some versions of IE say that typeof /abc/ === 'function'
        _toString.call(x) === '[object Function]';
    },

    ToInt32: function (x) {
      return x >> 0;
    },

    ToUint32: function (x) {
      return x >>> 0;
    },

    ToInteger: function (value) {
      var number = +value;
      if (Number.isNaN(number)) { return 0; }
      if (number === 0 || !Number.isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    },

    ToLength: function (value) {
      var len = ES.ToInteger(value);
      if (len <= 0) { return 0; } // includes converting -0 to +0
      if (len > Number.MAX_SAFE_INTEGER) { return Number.MAX_SAFE_INTEGER; }
      return len;
    },

    SameValue: function (a, b) {
      if (a === b) {
        // 0 === -0, but they are not identical.
        if (a === 0) { return 1 / a === 1 / b; }
        return true;
      }
      return Number.isNaN(a) && Number.isNaN(b);
    },

    SameValueZero: function (a, b) {
      // same as SameValue except for SameValueZero(+0, -0) == true
      return (a === b) || (Number.isNaN(a) && Number.isNaN(b));
    },

    IsIterable: function (o) {
      return ES.TypeIsObject(o) &&
        (typeof o[$iterator$] !== 'undefined' || isArguments(o));
    },

    GetIterator: function (o) {
      if (isArguments(o)) {
        // special case support for `arguments`
        return new ArrayIterator(o, 'value');
      }
      var itFn = o[$iterator$];
      if (!ES.IsCallable(itFn)) {
        throw new TypeError('value is not an iterable');
      }
      var it = itFn.call(o);
      if (!ES.TypeIsObject(it)) {
        throw new TypeError('bad iterator');
      }
      return it;
    },

    IteratorNext: function (it) {
      var result = arguments.length > 1 ? it.next(arguments[1]) : it.next();
      if (!ES.TypeIsObject(result)) {
        throw new TypeError('bad iterator');
      }
      return result;
    },

    Construct: function (C, args) {
      // CreateFromConstructor
      var obj;
      if (ES.IsCallable(C['@@create'])) {
        obj = C['@@create']();
      } else {
        // OrdinaryCreateFromConstructor
        obj = create(C.prototype || null);
      }
      // Mark that we've used the es6 construct path
      // (see emulateES6construct)
      defineProperties(obj, { _es6construct: true });
      // Call the constructor.
      var result = C.apply(obj, args);
      return ES.TypeIsObject(result) ? result : obj;
    }
  };

  var numberConversion = (function () {
    // from https://github.com/inexorabletash/polyfill/blob/master/typedarray.js#L176-L266
    // with permission and license, per https://twitter.com/inexorabletash/status/372206509540659200

    function roundToEven(n) {
      var w = Math.floor(n), f = n - w;
      if (f < 0.5) {
        return w;
      }
      if (f > 0.5) {
        return w + 1;
      }
      return w % 2 ? w + 1 : w;
    }

    function packIEEE754(v, ebits, fbits) {
      var bias = (1 << (ebits - 1)) - 1,
        s, e, f,
        i, bits, str, bytes;

      // Compute sign, exponent, fraction
      if (v !== v) {
        // NaN
        // http://dev.w3.org/2006/webapi/WebIDL/#es-type-mapping
        e = (1 << ebits) - 1;
        f = Math.pow(2, fbits - 1);
        s = 0;
      } else if (v === Infinity || v === -Infinity) {
        e = (1 << ebits) - 1;
        f = 0;
        s = (v < 0) ? 1 : 0;
      } else if (v === 0) {
        e = 0;
        f = 0;
        s = (1 / v === -Infinity) ? 1 : 0;
      } else {
        s = v < 0;
        v = Math.abs(v);

        if (v >= Math.pow(2, 1 - bias)) {
          e = Math.min(Math.floor(Math.log(v) / Math.LN2), 1023);
          f = roundToEven(v / Math.pow(2, e) * Math.pow(2, fbits));
          if (f / Math.pow(2, fbits) >= 2) {
            e = e + 1;
            f = 1;
          }
          if (e > bias) {
            // Overflow
            e = (1 << ebits) - 1;
            f = 0;
          } else {
            // Normal
            e = e + bias;
            f = f - Math.pow(2, fbits);
          }
        } else {
          // Subnormal
          e = 0;
          f = roundToEven(v / Math.pow(2, 1 - bias - fbits));
        }
      }

      // Pack sign, exponent, fraction
      bits = [];
      for (i = fbits; i; i -= 1) {
        bits.push(f % 2 ? 1 : 0);
        f = Math.floor(f / 2);
      }
      for (i = ebits; i; i -= 1) {
        bits.push(e % 2 ? 1 : 0);
        e = Math.floor(e / 2);
      }
      bits.push(s ? 1 : 0);
      bits.reverse();
      str = bits.join('');

      // Bits to bytes
      bytes = [];
      while (str.length) {
        bytes.push(parseInt(str.slice(0, 8), 2));
        str = str.slice(8);
      }
      return bytes;
    }

    function unpackIEEE754(bytes, ebits, fbits) {
      // Bytes to bits
      var bits = [], i, j, b, str,
          bias, s, e, f;

      for (i = bytes.length; i; i -= 1) {
        b = bytes[i - 1];
        for (j = 8; j; j -= 1) {
          bits.push(b % 2 ? 1 : 0);
          b = b >> 1;
        }
      }
      bits.reverse();
      str = bits.join('');

      // Unpack sign, exponent, fraction
      bias = (1 << (ebits - 1)) - 1;
      s = parseInt(str.slice(0, 1), 2) ? -1 : 1;
      e = parseInt(str.slice(1, 1 + ebits), 2);
      f = parseInt(str.slice(1 + ebits), 2);

      // Produce number
      if (e === (1 << ebits) - 1) {
        return f !== 0 ? NaN : s * Infinity;
      } else if (e > 0) {
        // Normalized
        return s * Math.pow(2, e - bias) * (1 + f / Math.pow(2, fbits));
      } else if (f !== 0) {
        // Denormalized
        return s * Math.pow(2, -(bias - 1)) * (f / Math.pow(2, fbits));
      } else {
        return s < 0 ? -0 : 0;
      }
    }

    function unpackFloat64(b) { return unpackIEEE754(b, 11, 52); }
    function packFloat64(v) { return packIEEE754(v, 11, 52); }
    function unpackFloat32(b) { return unpackIEEE754(b, 8, 23); }
    function packFloat32(v) { return packIEEE754(v, 8, 23); }

    var conversions = {
      toFloat32: function (num) { return unpackFloat32(packFloat32(num)); }
    };
    if (typeof Float32Array !== 'undefined') {
      var float32array = new Float32Array(1);
      conversions.toFloat32 = function (num) {
        float32array[0] = num;
        return float32array[0];
      };
    }
    return conversions;
  }());

  defineProperties(String, {
    fromCodePoint: function fromCodePoint(_) { // length = 1
      var result = [];
      var next;
      for (var i = 0, length = arguments.length; i < length; i++) {
        next = Number(arguments[i]);
        if (!ES.SameValue(next, ES.ToInteger(next)) || next < 0 || next > 0x10FFFF) {
          throw new RangeError('Invalid code point ' + next);
        }

        if (next < 0x10000) {
          result.push(String.fromCharCode(next));
        } else {
          next -= 0x10000;
          result.push(String.fromCharCode((next >> 10) + 0xD800));
          result.push(String.fromCharCode((next % 0x400) + 0xDC00));
        }
      }
      return result.join('');
    },

    raw: function raw(callSite) { // raw.length===1
      var cooked = ES.ToObject(callSite, 'bad callSite');
      var rawValue = cooked.raw;
      var rawString = ES.ToObject(rawValue, 'bad raw value');
      var len = rawString.length;
      var literalsegments = ES.ToLength(len);
      if (literalsegments <= 0) {
        return '';
      }

      var stringElements = [];
      var nextIndex = 0;
      var nextKey, next, nextSeg, nextSub;
      while (nextIndex < literalsegments) {
        nextKey = String(nextIndex);
        next = rawString[nextKey];
        nextSeg = String(next);
        stringElements.push(nextSeg);
        if (nextIndex + 1 >= literalsegments) {
          break;
        }
        next = nextIndex + 1 < arguments.length ? arguments[nextIndex + 1] : '';
        nextSub = String(next);
        stringElements.push(nextSub);
        nextIndex++;
      }
      return stringElements.join('');
    }
  });

  // Firefox 31 reports this function's length as 0
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1062484
  if (String.fromCodePoint.length !== 1) {
    var originalFromCodePoint = String.fromCodePoint;
    defineProperty(String, 'fromCodePoint', function (_) { return originalFromCodePoint.apply(this, arguments); }, true);
  }

  var StringShims = {
    // Fast repeat, uses the `Exponentiation by squaring` algorithm.
    // Perf: http://jsperf.com/string-repeat2/2
    repeat: (function () {
      var repeat = function (s, times) {
        if (times < 1) { return ''; }
        if (times % 2) { return repeat(s, times - 1) + s; }
        var half = repeat(s, times / 2);
        return half + half;
      };

      return function (times) {
        var thisStr = String(ES.CheckObjectCoercible(this));
        times = ES.ToInteger(times);
        if (times < 0 || times === Infinity) {
          throw new RangeError('Invalid String#repeat value');
        }
        return repeat(thisStr, times);
      };
    })(),

    startsWith: function (searchStr) {
      var thisStr = String(ES.CheckObjectCoercible(this));
      if (_toString.call(searchStr) === '[object RegExp]') {
        throw new TypeError('Cannot call method "startsWith" with a regex');
      }
      searchStr = String(searchStr);
      var startArg = arguments.length > 1 ? arguments[1] : void 0;
      var start = Math.max(ES.ToInteger(startArg), 0);
      return thisStr.slice(start, start + searchStr.length) === searchStr;
    },

    endsWith: function (searchStr) {
      var thisStr = String(ES.CheckObjectCoercible(this));
      if (_toString.call(searchStr) === '[object RegExp]') {
        throw new TypeError('Cannot call method "endsWith" with a regex');
      }
      searchStr = String(searchStr);
      var thisLen = thisStr.length;
      var posArg = arguments.length > 1 ? arguments[1] : void 0;
      var pos = typeof posArg === 'undefined' ? thisLen : ES.ToInteger(posArg);
      var end = Math.min(Math.max(pos, 0), thisLen);
      return thisStr.slice(end - searchStr.length, end) === searchStr;
    },

    includes: function includes(searchString) {
      var position = arguments.length > 1 ? arguments[1] : void 0;
      // Somehow this trick makes method 100% compat with the spec.
      return _indexOf.call(this, searchString, position) !== -1;
    },

    codePointAt: function (pos) {
      var thisStr = String(ES.CheckObjectCoercible(this));
      var position = ES.ToInteger(pos);
      var length = thisStr.length;
      if (position < 0 || position >= length) { return; }
      var first = thisStr.charCodeAt(position);
      var isEnd = (position + 1 === length);
      if (first < 0xD800 || first > 0xDBFF || isEnd) { return first; }
      var second = thisStr.charCodeAt(position + 1);
      if (second < 0xDC00 || second > 0xDFFF) { return first; }
      return ((first - 0xD800) * 1024) + (second - 0xDC00) + 0x10000;
    }
  };
  defineProperties(String.prototype, StringShims);

  var hasStringTrimBug = '\u0085'.trim().length !== 1;
  if (hasStringTrimBug) {
    var originalStringTrim = String.prototype.trim;
    delete String.prototype.trim;
    // whitespace from: http://es5.github.io/#x15.5.4.20
    // implementation from https://github.com/es-shims/es5-shim/blob/v3.4.0/es5-shim.js#L1304-L1324
    var ws = [
      '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003',
      '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028',
      '\u2029\uFEFF'
    ].join('');
    var trimRegexp = new RegExp('(^[' + ws + ']+)|([' + ws + ']+$)', 'g');
    defineProperties(String.prototype, {
      trim: function () {
        if (typeof this === 'undefined' || this === null) {
          throw new TypeError("can't convert " + this + ' to object');
        }
        return String(this).replace(trimRegexp, '');
      }
    });
  }

  // see https://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype-@@iterator
  var StringIterator = function (s) {
    this._s = String(ES.CheckObjectCoercible(s));
    this._i = 0;
  };
  StringIterator.prototype.next = function () {
    var s = this._s, i = this._i;
    if (typeof s === 'undefined' || i >= s.length) {
      this._s = void 0;
      return { value: void 0, done: true };
    }
    var first = s.charCodeAt(i), second, len;
    if (first < 0xD800 || first > 0xDBFF || (i + 1) == s.length) {
      len = 1;
    } else {
      second = s.charCodeAt(i + 1);
      len = (second < 0xDC00 || second > 0xDFFF) ? 1 : 2;
    }
    this._i = i + len;
    return { value: s.substr(i, len), done: false };
  };
  addIterator(StringIterator.prototype);
  addIterator(String.prototype, function () {
    return new StringIterator(this);
  });

  if (!startsWithIsCompliant) {
    // Firefox has a noncompliant startsWith implementation
    String.prototype.startsWith = StringShims.startsWith;
    String.prototype.endsWith = StringShims.endsWith;
  }

  var ArrayShims = {
    from: function (iterable) {
      var mapFn = arguments.length > 1 ? arguments[1] : void 0;

      var list = ES.ToObject(iterable, 'bad iterable');
      if (typeof mapFn !== 'undefined' && !ES.IsCallable(mapFn)) {
        throw new TypeError('Array.from: when provided, the second argument must be a function');
      }

      var hasThisArg = arguments.length > 2;
      var thisArg = hasThisArg ? arguments[2] : void 0;

      var usingIterator = ES.IsIterable(list);
      // does the spec really mean that Arrays should use ArrayIterator?
      // https://bugs.ecmascript.org/show_bug.cgi?id=2416
      //if (Array.isArray(list)) { usingIterator=false; }

      var length;
      var result, i, value;
      if (usingIterator) {
        i = 0;
        result = ES.IsCallable(this) ? Object(new this()) : [];
        var it = usingIterator ? ES.GetIterator(list) : null;
        var iterationValue;

        do {
          iterationValue = ES.IteratorNext(it);
          if (!iterationValue.done) {
            value = iterationValue.value;
            if (mapFn) {
              result[i] = hasThisArg ? mapFn.call(thisArg, value, i) : mapFn(value, i);
            } else {
              result[i] = value;
            }
            i += 1;
          }
        } while (!iterationValue.done);
        length = i;
      } else {
        length = ES.ToLength(list.length);
        result = ES.IsCallable(this) ? Object(new this(length)) : new Array(length);
        for (i = 0; i < length; ++i) {
          value = list[i];
          if (mapFn) {
            result[i] = hasThisArg ? mapFn.call(thisArg, value, i) : mapFn(value, i);
          } else {
            result[i] = value;
          }
        }
      }

      result.length = length;
      return result;
    },

    of: function () {
      return Array.from(arguments);
    }
  };
  defineProperties(Array, ArrayShims);

  var arrayFromSwallowsNegativeLengths = function () {
    try {
      return Array.from({ length: -1 }).length === 0;
    } catch (e) {
      return false;
    }
  };
  // Fixes a Firefox bug in v32
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1063993
  if (!arrayFromSwallowsNegativeLengths()) {
    defineProperty(Array, 'from', ArrayShims.from, true);
  }

  // Our ArrayIterator is private; see
  // https://github.com/paulmillr/es6-shim/issues/252
  ArrayIterator = function (array, kind) {
      this.i = 0;
      this.array = array;
      this.kind = kind;
  };

  defineProperties(ArrayIterator.prototype, {
    next: function () {
      var i = this.i, array = this.array;
      if (!(this instanceof ArrayIterator)) {
        throw new TypeError('Not an ArrayIterator');
      }
      if (typeof array !== 'undefined') {
        var len = ES.ToLength(array.length);
        for (; i < len; i++) {
          var kind = this.kind;
          var retval;
          if (kind === 'key') {
            retval = i;
          } else if (kind === 'value') {
            retval = array[i];
          } else if (kind === 'entry') {
            retval = [i, array[i]];
          }
          this.i = i + 1;
          return { value: retval, done: false };
        }
      }
      this.array = void 0;
      return { value: void 0, done: true };
    }
  });
  addIterator(ArrayIterator.prototype);

  var ArrayPrototypeShims = {
    copyWithin: function (target, start) {
      var end = arguments[2]; // copyWithin.length must be 2
      var o = ES.ToObject(this);
      var len = ES.ToLength(o.length);
      target = ES.ToInteger(target);
      start = ES.ToInteger(start);
      var to = target < 0 ? Math.max(len + target, 0) : Math.min(target, len);
      var from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
      end = typeof end === 'undefined' ? len : ES.ToInteger(end);
      var fin = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);
      var count = Math.min(fin - from, len - to);
      var direction = 1;
      if (from < to && to < (from + count)) {
        direction = -1;
        from += count - 1;
        to += count - 1;
      }
      while (count > 0) {
        if (_hasOwnProperty.call(o, from)) {
          o[to] = o[from];
        } else {
          delete o[from];
        }
        from += direction;
        to += direction;
        count -= 1;
      }
      return o;
    },

    fill: function (value) {
      var start = arguments.length > 1 ? arguments[1] : void 0;
      var end = arguments.length > 2 ? arguments[2] : void 0;
      var O = ES.ToObject(this);
      var len = ES.ToLength(O.length);
      start = ES.ToInteger(typeof start === 'undefined' ? 0 : start);
      end = ES.ToInteger(typeof end === 'undefined' ? len : end);

      var relativeStart = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
      var relativeEnd = end < 0 ? len + end : end;

      for (var i = relativeStart; i < len && i < relativeEnd; ++i) {
        O[i] = value;
      }
      return O;
    },

    find: function find(predicate) {
      var list = ES.ToObject(this);
      var length = ES.ToLength(list.length);
      if (!ES.IsCallable(predicate)) {
        throw new TypeError('Array#find: predicate must be a function');
      }
      var thisArg = arguments.length > 1 ? arguments[1] : null;
      for (var i = 0, value; i < length; i++) {
        value = list[i];
        if (thisArg) {
          if (predicate.call(thisArg, value, i, list)) { return value; }
        } else {
          if (predicate(value, i, list)) { return value; }
        }
      }
      return;
    },

    findIndex: function findIndex(predicate) {
      var list = ES.ToObject(this);
      var length = ES.ToLength(list.length);
      if (!ES.IsCallable(predicate)) {
        throw new TypeError('Array#findIndex: predicate must be a function');
      }
      var thisArg = arguments.length > 1 ? arguments[1] : null;
      for (var i = 0; i < length; i++) {
        if (thisArg) {
          if (predicate.call(thisArg, list[i], i, list)) { return i; }
        } else {
          if (predicate(list[i], i, list)) { return i; }
        }
      }
      return -1;
    },

    keys: function () {
      return new ArrayIterator(this, 'key');
    },

    values: function () {
      return new ArrayIterator(this, 'value');
    },

    entries: function () {
      return new ArrayIterator(this, 'entry');
    }
  };
  // Safari 7.1 defines Array#keys and Array#entries natively,
  // but the resulting ArrayIterator objects don't have a "next" method.
  if (Array.prototype.keys && !ES.IsCallable([1].keys().next)) {
    delete Array.prototype.keys;
  }
  if (Array.prototype.entries && !ES.IsCallable([1].entries().next)) {
    delete Array.prototype.entries;
  }

  // Chrome 38 defines Array#keys and Array#entries, and Array#@@iterator, but not Array#values
  if (Array.prototype.keys && Array.prototype.entries && !Array.prototype.values && Array.prototype[$iterator$]) {
    defineProperties(Array.prototype, {
      values: Array.prototype[$iterator$]
    });
  }
  defineProperties(Array.prototype, ArrayPrototypeShims);

  addIterator(Array.prototype, function () { return this.values(); });
  // Chrome defines keys/values/entries on Array, but doesn't give us
  // any way to identify its iterator.  So add our own shimmed field.
  if (Object.getPrototypeOf) {
    addIterator(Object.getPrototypeOf([].values()));
  }

  var maxSafeInteger = Math.pow(2, 53) - 1;
  defineProperties(Number, {
    MAX_SAFE_INTEGER: maxSafeInteger,
    MIN_SAFE_INTEGER: -maxSafeInteger,
    EPSILON: 2.220446049250313e-16,

    parseInt: globals.parseInt,
    parseFloat: globals.parseFloat,

    isFinite: function (value) {
      return typeof value === 'number' && global_isFinite(value);
    },

    isInteger: function (value) {
      return Number.isFinite(value) &&
        ES.ToInteger(value) === value;
    },

    isSafeInteger: function (value) {
      return Number.isInteger(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER;
    },

    isNaN: function (value) {
      // NaN !== NaN, but they are identical.
      // NaNs are the only non-reflexive value, i.e., if x !== x,
      // then x is NaN.
      // isNaN is broken: it converts its argument to number, so
      // isNaN('foo') => true
      return value !== value;
    }

  });

  // Work around bugs in Array#find and Array#findIndex -- early
  // implementations skipped holes in sparse arrays. (Note that the
  // implementations of find/findIndex indirectly use shimmed
  // methods of Number, so this test has to happen down here.)
  if (![, 1].find(function (item, idx) { return idx === 0; })) {
    defineProperty(Array.prototype, 'find', ArrayPrototypeShims.find, true);
  }
  if ([, 1].findIndex(function (item, idx) { return idx === 0; }) !== 0) {
    defineProperty(Array.prototype, 'findIndex', ArrayPrototypeShims.findIndex, true);
  }

  if (supportsDescriptors) {
    defineProperties(Object, {
      getPropertyDescriptor: function (subject, name) {
        var pd = Object.getOwnPropertyDescriptor(subject, name);
        var proto = Object.getPrototypeOf(subject);
        while (typeof pd === 'undefined' && proto !== null) {
          pd = Object.getOwnPropertyDescriptor(proto, name);
          proto = Object.getPrototypeOf(proto);
        }
        return pd;
      },

      getPropertyNames: function (subject) {
        var result = Object.getOwnPropertyNames(subject);
        var proto = Object.getPrototypeOf(subject);

        var addProperty = function (property) {
          if (result.indexOf(property) === -1) {
            result.push(property);
          }
        };

        while (proto !== null) {
          Object.getOwnPropertyNames(proto).forEach(addProperty);
          proto = Object.getPrototypeOf(proto);
        }
        return result;
      }
    });

    defineProperties(Object, {
      // 19.1.3.1
      assign: function (target, source) {
        if (!ES.TypeIsObject(target)) {
          throw new TypeError('target must be an object');
        }
        return Array.prototype.reduce.call(arguments, function (target, source) {
          return Object.keys(Object(source)).reduce(function (target, key) {
            target[key] = source[key];
            return target;
          }, target);
        });
      },

      is: function (a, b) {
        return ES.SameValue(a, b);
      },

      // 19.1.3.9
      // shim from https://gist.github.com/WebReflection/5593554
      setPrototypeOf: (function (Object, magic) {
        var set;

        var checkArgs = function (O, proto) {
          if (!ES.TypeIsObject(O)) {
            throw new TypeError('cannot set prototype on a non-object');
          }
          if (!(proto === null || ES.TypeIsObject(proto))) {
            throw new TypeError('can only set prototype to an object or null' + proto);
          }
        };

        var setPrototypeOf = function (O, proto) {
          checkArgs(O, proto);
          set.call(O, proto);
          return O;
        };

        try {
          // this works already in Firefox and Safari
          set = Object.getOwnPropertyDescriptor(Object.prototype, magic).set;
          set.call({}, null);
        } catch (e) {
          if (Object.prototype !== {}[magic]) {
            // IE < 11 cannot be shimmed
            return;
          }
          // probably Chrome or some old Mobile stock browser
          set = function (proto) {
            this[magic] = proto;
          };
          // please note that this will **not** work
          // in those browsers that do not inherit
          // __proto__ by mistake from Object.prototype
          // in these cases we should probably throw an error
          // or at least be informed about the issue
          setPrototypeOf.polyfill = setPrototypeOf(
            setPrototypeOf({}, null),
            Object.prototype
          ) instanceof Object;
          // setPrototypeOf.polyfill === true means it works as meant
          // setPrototypeOf.polyfill === false means it's not 100% reliable
          // setPrototypeOf.polyfill === undefined
          // or
          // setPrototypeOf.polyfill ==  null means it's not a polyfill
          // which means it works as expected
          // we can even delete Object.prototype.__proto__;
        }
        return setPrototypeOf;
      })(Object, '__proto__')
    });
  }

  // Workaround bug in Opera 12 where setPrototypeOf(x, null) doesn't work,
  // but Object.create(null) does.
  if (Object.setPrototypeOf && Object.getPrototypeOf &&
      Object.getPrototypeOf(Object.setPrototypeOf({}, null)) !== null &&
      Object.getPrototypeOf(Object.create(null)) === null) {
    (function () {
      var FAKENULL = Object.create(null);
      var gpo = Object.getPrototypeOf, spo = Object.setPrototypeOf;
      Object.getPrototypeOf = function (o) {
        var result = gpo(o);
        return result === FAKENULL ? null : result;
      };
      Object.setPrototypeOf = function (o, p) {
        if (p === null) { p = FAKENULL; }
        return spo(o, p);
      };
      Object.setPrototypeOf.polyfill = false;
    })();
  }

  try {
    Object.keys('foo');
  } catch (e) {
    var originalObjectKeys = Object.keys;
    Object.keys = function (obj) {
      return originalObjectKeys(ES.ToObject(obj));
    };
  }

  var MathShims = {
    acosh: function (value) {
      value = Number(value);
      if (Number.isNaN(value) || value < 1) { return NaN; }
      if (value === 1) { return 0; }
      if (value === Infinity) { return value; }
      return Math.log(value + Math.sqrt(value * value - 1));
    },

    asinh: function (value) {
      value = Number(value);
      if (value === 0 || !global_isFinite(value)) {
        return value;
      }
      return value < 0 ? -Math.asinh(-value) : Math.log(value + Math.sqrt(value * value + 1));
    },

    atanh: function (value) {
      value = Number(value);
      if (Number.isNaN(value) || value < -1 || value > 1) {
        return NaN;
      }
      if (value === -1) { return -Infinity; }
      if (value === 1) { return Infinity; }
      if (value === 0) { return value; }
      return 0.5 * Math.log((1 + value) / (1 - value));
    },

    cbrt: function (value) {
      value = Number(value);
      if (value === 0) { return value; }
      var negate = value < 0, result;
      if (negate) { value = -value; }
      result = Math.pow(value, 1 / 3);
      return negate ? -result : result;
    },

    clz32: function (value) {
      // See https://bugs.ecmascript.org/show_bug.cgi?id=2465
      value = Number(value);
      var number = ES.ToUint32(value);
      if (number === 0) {
        return 32;
      }
      return 32 - (number).toString(2).length;
    },

    cosh: function (value) {
      value = Number(value);
      if (value === 0) { return 1; } // +0 or -0
      if (Number.isNaN(value)) { return NaN; }
      if (!global_isFinite(value)) { return Infinity; }
      if (value < 0) { value = -value; }
      if (value > 21) { return Math.exp(value) / 2; }
      return (Math.exp(value) + Math.exp(-value)) / 2;
    },

    expm1: function (value) {
      value = Number(value);
      if (value === -Infinity) { return -1; }
      if (!global_isFinite(value) || value === 0) { return value; }
      return Math.exp(value) - 1;
    },

    hypot: function (x, y) {
      var anyNaN = false;
      var allZero = true;
      var anyInfinity = false;
      var numbers = [];
      Array.prototype.every.call(arguments, function (arg) {
        var num = Number(arg);
        if (Number.isNaN(num)) {
          anyNaN = true;
        } else if (num === Infinity || num === -Infinity) {
          anyInfinity = true;
        } else if (num !== 0) {
          allZero = false;
        }
        if (anyInfinity) {
          return false;
        } else if (!anyNaN) {
          numbers.push(Math.abs(num));
        }
        return true;
      });
      if (anyInfinity) { return Infinity; }
      if (anyNaN) { return NaN; }
      if (allZero) { return 0; }

      numbers.sort(function (a, b) { return b - a; });
      var largest = numbers[0];
      var divided = numbers.map(function (number) { return number / largest; });
      var sum = divided.reduce(function (sum, number) { return sum += number * number; }, 0);
      return largest * Math.sqrt(sum);
    },

    log2: function (value) {
      return Math.log(value) * Math.LOG2E;
    },

    log10: function (value) {
      return Math.log(value) * Math.LOG10E;
    },

    log1p: function (value) {
      value = Number(value);
      if (value < -1 || Number.isNaN(value)) { return NaN; }
      if (value === 0 || value === Infinity) { return value; }
      if (value === -1) { return -Infinity; }
      var result = 0;
      var n = 50;

      if (value < 0 || value > 1) { return Math.log(1 + value); }
      for (var i = 1; i < n; i++) {
        if ((i % 2) === 0) {
          result -= Math.pow(value, i) / i;
        } else {
          result += Math.pow(value, i) / i;
        }
      }

      return result;
    },

    sign: function (value) {
      var number = +value;
      if (number === 0) { return number; }
      if (Number.isNaN(number)) { return number; }
      return number < 0 ? -1 : 1;
    },

    sinh: function (value) {
      value = Number(value);
      if (!global_isFinite(value) || value === 0) { return value; }
      return (Math.exp(value) - Math.exp(-value)) / 2;
    },

    tanh: function (value) {
      value = Number(value);
      if (Number.isNaN(value) || value === 0) { return value; }
      if (value === Infinity) { return 1; }
      if (value === -Infinity) { return -1; }
      return (Math.exp(value) - Math.exp(-value)) / (Math.exp(value) + Math.exp(-value));
    },

    trunc: function (value) {
      var number = Number(value);
      return number < 0 ? -Math.floor(-number) : Math.floor(number);
    },

    imul: function (x, y) {
      // taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
      x = ES.ToUint32(x);
      y = ES.ToUint32(y);
      var ah  = (x >>> 16) & 0xffff;
      var al = x & 0xffff;
      var bh  = (y >>> 16) & 0xffff;
      var bl = y & 0xffff;
      // the shift by 0 fixes the sign on the high part
      // the final |0 converts the unsigned value into a signed value
      return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)|0);
    },

    fround: function (x) {
      if (x === 0 || x === Infinity || x === -Infinity || Number.isNaN(x)) {
        return x;
      }
      var num = Number(x);
      return numberConversion.toFloat32(num);
    }
  };
  defineProperties(Math, MathShims);

  if (Math.imul(0xffffffff, 5) !== -5) {
    // Safari 6.1, at least, reports "0" for this value
    Math.imul = MathShims.imul;
  }

  // Promises
  // Simplest possible implementation; use a 3rd-party library if you
  // want the best possible speed and/or long stack traces.
  var PromiseShim = (function () {

    var Promise, Promise$prototype;

    ES.IsPromise = function (promise) {
      if (!ES.TypeIsObject(promise)) {
        return false;
      }
      if (!promise._promiseConstructor) {
        // _promiseConstructor is a bit more unique than _status, so we'll
        // check that instead of the [[PromiseStatus]] internal field.
        return false;
      }
      if (typeof promise._status === 'undefined') {
        return false; // uninitialized
      }
      return true;
    };

    // "PromiseCapability" in the spec is what most promise implementations
    // call a "deferred".
    var PromiseCapability = function (C) {
      if (!ES.IsCallable(C)) {
        throw new TypeError('bad promise constructor');
      }
      var capability = this;
      var resolver = function (resolve, reject) {
        capability.resolve = resolve;
        capability.reject = reject;
      };
      capability.promise = ES.Construct(C, [resolver]);
      // see https://bugs.ecmascript.org/show_bug.cgi?id=2478
      if (!capability.promise._es6construct) {
        throw new TypeError('bad promise constructor');
      }
      if (!(ES.IsCallable(capability.resolve) &&
            ES.IsCallable(capability.reject))) {
        throw new TypeError('bad promise constructor');
      }
    };

    // find an appropriate setImmediate-alike
    var setTimeout = globals.setTimeout;
    var makeZeroTimeout;
    if (typeof window !== 'undefined' && ES.IsCallable(window.postMessage)) {
      makeZeroTimeout = function () {
        // from http://dbaron.org/log/20100309-faster-timeouts
        var timeouts = [];
        var messageName = 'zero-timeout-message';
        var setZeroTimeout = function (fn) {
          timeouts.push(fn);
          window.postMessage(messageName, '*');
        };
        var handleMessage = function (event) {
          if (event.source == window && event.data == messageName) {
            event.stopPropagation();
            if (timeouts.length === 0) { return; }
            var fn = timeouts.shift();
            fn();
          }
        };
        window.addEventListener('message', handleMessage, true);
        return setZeroTimeout;
      };
    }
    var makePromiseAsap = function () {
      // An efficient task-scheduler based on a pre-existing Promise
      // implementation, which we can use even if we override the
      // global Promise below (in order to workaround bugs)
      // https://github.com/Raynos/observ-hash/issues/2#issuecomment-35857671
      var P = globals.Promise;
      return P && P.resolve && function (task) {
        return P.resolve().then(task);
      };
    };
    var enqueue = ES.IsCallable(globals.setImmediate) ?
      globals.setImmediate.bind(globals) :
      typeof process === 'object' && process.nextTick ? process.nextTick :
      makePromiseAsap() ||
      (ES.IsCallable(makeZeroTimeout) ? makeZeroTimeout() :
      function (task) { setTimeout(task, 0); }); // fallback

    var triggerPromiseReactions = function (reactions, x) {
      reactions.forEach(function (reaction) {
        enqueue(function () {
          // PromiseReactionTask
          var handler = reaction.handler;
          var capability = reaction.capability;
          var resolve = capability.resolve;
          var reject = capability.reject;
          try {
            var result = handler(x);
            if (result === capability.promise) {
              throw new TypeError('self resolution');
            }
            var updateResult =
              updatePromiseFromPotentialThenable(result, capability);
            if (!updateResult) {
              resolve(result);
            }
          } catch (e) {
            reject(e);
          }
        });
      });
    };

    var updatePromiseFromPotentialThenable = function (x, capability) {
      if (!ES.TypeIsObject(x)) {
        return false;
      }
      var resolve = capability.resolve;
      var reject = capability.reject;
      try {
        var then = x.then; // only one invocation of accessor
        if (!ES.IsCallable(then)) { return false; }
        then.call(x, resolve, reject);
      } catch (e) {
        reject(e);
      }
      return true;
    };

    var promiseResolutionHandler = function (promise, onFulfilled, onRejected) {
      return function (x) {
        if (x === promise) {
          return onRejected(new TypeError('self resolution'));
        }
        var C = promise._promiseConstructor;
        var capability = new PromiseCapability(C);
        var updateResult = updatePromiseFromPotentialThenable(x, capability);
        if (updateResult) {
          return capability.promise.then(onFulfilled, onRejected);
        } else {
          return onFulfilled(x);
        }
      };
    };

    Promise = function (resolver) {
      var promise = this;
      promise = emulateES6construct(promise);
      if (!promise._promiseConstructor) {
        // we use _promiseConstructor as a stand-in for the internal
        // [[PromiseStatus]] field; it's a little more unique.
        throw new TypeError('bad promise');
      }
      if (typeof promise._status !== 'undefined') {
        throw new TypeError('promise already initialized');
      }
      // see https://bugs.ecmascript.org/show_bug.cgi?id=2482
      if (!ES.IsCallable(resolver)) {
        throw new TypeError('not a valid resolver');
      }
      promise._status = 'unresolved';
      promise._resolveReactions = [];
      promise._rejectReactions = [];

      var resolve = function (resolution) {
        if (promise._status !== 'unresolved') { return; }
        var reactions = promise._resolveReactions;
        promise._result = resolution;
        promise._resolveReactions = void 0;
        promise._rejectReactions = void 0;
        promise._status = 'has-resolution';
        triggerPromiseReactions(reactions, resolution);
      };
      var reject = function (reason) {
        if (promise._status !== 'unresolved') { return; }
        var reactions = promise._rejectReactions;
        promise._result = reason;
        promise._resolveReactions = void 0;
        promise._rejectReactions = void 0;
        promise._status = 'has-rejection';
        triggerPromiseReactions(reactions, reason);
      };
      try {
        resolver(resolve, reject);
      } catch (e) {
        reject(e);
      }
      return promise;
    };
    Promise$prototype = Promise.prototype;
    defineProperties(Promise, {
      '@@create': function (obj) {
        var constructor = this;
        // AllocatePromise
        // The `obj` parameter is a hack we use for es5
        // compatibility.
        var prototype = constructor.prototype || Promise$prototype;
        obj = obj || create(prototype);
        defineProperties(obj, {
          _status: void 0,
          _result: void 0,
          _resolveReactions: void 0,
          _rejectReactions: void 0,
          _promiseConstructor: void 0
        });
        obj._promiseConstructor = constructor;
        return obj;
      }
    });

    var _promiseAllResolver = function (index, values, capability, remaining) {
      var done = false;
      return function (x) {
        if (done) { return; } // protect against being called multiple times
        done = true;
        values[index] = x;
        if ((--remaining.count) === 0) {
          var resolve = capability.resolve;
          resolve(values); // call w/ this===undefined
        }
      };
    };

    Promise.all = function (iterable) {
      var C = this;
      var capability = new PromiseCapability(C);
      var resolve = capability.resolve;
      var reject = capability.reject;
      try {
        if (!ES.IsIterable(iterable)) {
          throw new TypeError('bad iterable');
        }
        var it = ES.GetIterator(iterable);
        var values = [], remaining = { count: 1 };
        for (var index = 0; ; index++) {
          var next = ES.IteratorNext(it);
          if (next.done) {
            break;
          }
          var nextPromise = C.resolve(next.value);
          var resolveElement = _promiseAllResolver(
            index, values, capability, remaining
          );
          remaining.count++;
          nextPromise.then(resolveElement, capability.reject);
        }
        if ((--remaining.count) === 0) {
          resolve(values); // call w/ this===undefined
        }
      } catch (e) {
        reject(e);
      }
      return capability.promise;
    };

    Promise.race = function (iterable) {
      var C = this;
      var capability = new PromiseCapability(C);
      var resolve = capability.resolve;
      var reject = capability.reject;
      try {
        if (!ES.IsIterable(iterable)) {
          throw new TypeError('bad iterable');
        }
        var it = ES.GetIterator(iterable);
        while (true) {
          var next = ES.IteratorNext(it);
          if (next.done) {
            // If iterable has no items, resulting promise will never
            // resolve; see:
            // https://github.com/domenic/promises-unwrapping/issues/75
            // https://bugs.ecmascript.org/show_bug.cgi?id=2515
            break;
          }
          var nextPromise = C.resolve(next.value);
          nextPromise.then(resolve, reject);
        }
      } catch (e) {
        reject(e);
      }
      return capability.promise;
    };

    Promise.reject = function (reason) {
      var C = this;
      var capability = new PromiseCapability(C);
      var reject = capability.reject;
      reject(reason); // call with this===undefined
      return capability.promise;
    };

    Promise.resolve = function (v) {
      var C = this;
      if (ES.IsPromise(v)) {
        var constructor = v._promiseConstructor;
        if (constructor === C) { return v; }
      }
      var capability = new PromiseCapability(C);
      var resolve = capability.resolve;
      resolve(v); // call with this===undefined
      return capability.promise;
    };

    Promise.prototype['catch'] = function (onRejected) {
      return this.then(void 0, onRejected);
    };

    Promise.prototype.then = function (onFulfilled, onRejected) {
      var promise = this;
      if (!ES.IsPromise(promise)) { throw new TypeError('not a promise'); }
      // this.constructor not this._promiseConstructor; see
      // https://bugs.ecmascript.org/show_bug.cgi?id=2513
      var C = this.constructor;
      var capability = new PromiseCapability(C);
      if (!ES.IsCallable(onRejected)) {
        onRejected = function (e) { throw e; };
      }
      if (!ES.IsCallable(onFulfilled)) {
        onFulfilled = function (x) { return x; };
      }
      var resolutionHandler =
        promiseResolutionHandler(promise, onFulfilled, onRejected);
      var resolveReaction =
        { capability: capability, handler: resolutionHandler };
      var rejectReaction =
        { capability: capability, handler: onRejected };
      switch (promise._status) {
      case 'unresolved':
        promise._resolveReactions.push(resolveReaction);
        promise._rejectReactions.push(rejectReaction);
        break;
      case 'has-resolution':
        triggerPromiseReactions([resolveReaction], promise._result);
        break;
      case 'has-rejection':
        triggerPromiseReactions([rejectReaction], promise._result);
        break;
      default:
        throw new TypeError('unexpected');
      }
      return capability.promise;
    };

    return Promise;
  })();

  // Chrome's native Promise has extra methods that it shouldn't have. Let's remove them.
  if (globals.Promise) {
    delete globals.Promise.accept;
    delete globals.Promise.defer;
    delete globals.Promise.prototype.chain;
  }

  // export the Promise constructor.
  defineProperties(globals, { Promise: PromiseShim });
  // In Chrome 33 (and thereabouts) Promise is defined, but the
  // implementation is buggy in a number of ways.  Let's check subclassing
  // support to see if we have a buggy implementation.
  var promiseSupportsSubclassing = supportsSubclassing(globals.Promise, function (S) {
    return S.resolve(42) instanceof S;
  });
  var promiseIgnoresNonFunctionThenCallbacks = (function () {
    try {
      globals.Promise.reject(42).then(null, 5).then(null, function () {});
      return true;
    } catch (ex) {
      return false;
    }
  }());
  var promiseRequiresObjectContext = (function () {
    try { Promise.call(3, function () {}); } catch (e) { return true; }
    return false;
  }());
  if (!promiseSupportsSubclassing || !promiseIgnoresNonFunctionThenCallbacks || !promiseRequiresObjectContext) {
    globals.Promise = PromiseShim;
  }

  // Map and Set require a true ES5 environment
  // Their fast path also requires that the environment preserve
  // property insertion order, which is not guaranteed by the spec.
  var testOrder = function (a) {
    var b = Object.keys(a.reduce(function (o, k) {
      o[k] = true;
      return o;
    }, {}));
    return a.join(':') === b.join(':');
  };
  var preservesInsertionOrder = testOrder(['z', 'a', 'bb']);
  // some engines (eg, Chrome) only preserve insertion order for string keys
  var preservesNumericInsertionOrder = testOrder(['z', 1, 'a', '3', 2]);

  if (supportsDescriptors) {

    var fastkey = function fastkey(key) {
      if (!preservesInsertionOrder) {
        return null;
      }
      var type = typeof key;
      if (type === 'string') {
        return '$' + key;
      } else if (type === 'number') {
        // note that -0 will get coerced to "0" when used as a property key
        if (!preservesNumericInsertionOrder) {
          return 'n' + key;
        }
        return key;
      }
      return null;
    };

    var emptyObject = function emptyObject() {
      // accomodate some older not-quite-ES5 browsers
      return Object.create ? Object.create(null) : {};
    };

    var collectionShims = {
      Map: (function () {

        var empty = {};

        function MapEntry(key, value) {
          this.key = key;
          this.value = value;
          this.next = null;
          this.prev = null;
        }

        MapEntry.prototype.isRemoved = function () {
          return this.key === empty;
        };

        function MapIterator(map, kind) {
          this.head = map._head;
          this.i = this.head;
          this.kind = kind;
        }

        MapIterator.prototype = {
          next: function () {
            var i = this.i, kind = this.kind, head = this.head, result;
            if (typeof this.i === 'undefined') {
              return { value: void 0, done: true };
            }
            while (i.isRemoved() && i !== head) {
              // back up off of removed entries
              i = i.prev;
            }
            // advance to next unreturned element.
            while (i.next !== head) {
              i = i.next;
              if (!i.isRemoved()) {
                if (kind === 'key') {
                  result = i.key;
                } else if (kind === 'value') {
                  result = i.value;
                } else {
                  result = [i.key, i.value];
                }
                this.i = i;
                return { value: result, done: false };
              }
            }
            // once the iterator is done, it is done forever.
            this.i = void 0;
            return { value: void 0, done: true };
          }
        };
        addIterator(MapIterator.prototype);

        function Map(iterable) {
          var map = this;
          if (!ES.TypeIsObject(map)) {
            throw new TypeError('Map does not accept arguments when called as a function');
          }
          map = emulateES6construct(map);
          if (!map._es6map) {
            throw new TypeError('bad map');
          }

          var head = new MapEntry(null, null);
          // circular doubly-linked list.
          head.next = head.prev = head;

          defineProperties(map, {
            _head: head,
            _storage: emptyObject(),
            _size: 0
          });

          // Optionally initialize map from iterable
          if (typeof iterable !== 'undefined' && iterable !== null) {
            var it = ES.GetIterator(iterable);
            var adder = map.set;
            if (!ES.IsCallable(adder)) { throw new TypeError('bad map'); }
            while (true) {
              var next = ES.IteratorNext(it);
              if (next.done) { break; }
              var nextItem = next.value;
              if (!ES.TypeIsObject(nextItem)) {
                throw new TypeError('expected iterable of pairs');
              }
              adder.call(map, nextItem[0], nextItem[1]);
            }
          }
          return map;
        }
        var Map$prototype = Map.prototype;
        defineProperties(Map, {
          '@@create': function (obj) {
            var constructor = this;
            var prototype = constructor.prototype || Map$prototype;
            obj = obj || create(prototype);
            defineProperties(obj, { _es6map: true });
            return obj;
          }
        });

        Object.defineProperty(Map.prototype, 'size', {
          configurable: true,
          enumerable: false,
          get: function () {
            if (typeof this._size === 'undefined') {
              throw new TypeError('size method called on incompatible Map');
            }
            return this._size;
          }
        });

        defineProperties(Map.prototype, {
          get: function (key) {
            var fkey = fastkey(key);
            if (fkey !== null) {
              // fast O(1) path
              var entry = this._storage[fkey];
              if (entry) {
                return entry.value;
              } else {
                return;
              }
            }
            var head = this._head, i = head;
            while ((i = i.next) !== head) {
              if (ES.SameValueZero(i.key, key)) {
                return i.value;
              }
            }
            return;
          },

          has: function (key) {
            var fkey = fastkey(key);
            if (fkey !== null) {
              // fast O(1) path
              return typeof this._storage[fkey] !== 'undefined';
            }
            var head = this._head, i = head;
            while ((i = i.next) !== head) {
              if (ES.SameValueZero(i.key, key)) {
                return true;
              }
            }
            return false;
          },

          set: function (key, value) {
            var head = this._head, i = head, entry;
            var fkey = fastkey(key);
            if (fkey !== null) {
              // fast O(1) path
              if (typeof this._storage[fkey] !== 'undefined') {
                this._storage[fkey].value = value;
                return this;
              } else {
                entry = this._storage[fkey] = new MapEntry(key, value);
                i = head.prev;
                // fall through
              }
            }
            while ((i = i.next) !== head) {
              if (ES.SameValueZero(i.key, key)) {
                i.value = value;
                return this;
              }
            }
            entry = entry || new MapEntry(key, value);
            if (ES.SameValue(-0, key)) {
              entry.key = +0; // coerce -0 to +0 in entry
            }
            entry.next = this._head;
            entry.prev = this._head.prev;
            entry.prev.next = entry;
            entry.next.prev = entry;
            this._size += 1;
            return this;
          },

          'delete': function (key) {
            var head = this._head, i = head;
            var fkey = fastkey(key);
            if (fkey !== null) {
              // fast O(1) path
              if (typeof this._storage[fkey] === 'undefined') {
                return false;
              }
              i = this._storage[fkey].prev;
              delete this._storage[fkey];
              // fall through
            }
            while ((i = i.next) !== head) {
              if (ES.SameValueZero(i.key, key)) {
                i.key = i.value = empty;
                i.prev.next = i.next;
                i.next.prev = i.prev;
                this._size -= 1;
                return true;
              }
            }
            return false;
          },

          clear: function () {
            this._size = 0;
            this._storage = emptyObject();
            var head = this._head, i = head, p = i.next;
            while ((i = p) !== head) {
              i.key = i.value = empty;
              p = i.next;
              i.next = i.prev = head;
            }
            head.next = head.prev = head;
          },

          keys: function () {
            return new MapIterator(this, 'key');
          },

          values: function () {
            return new MapIterator(this, 'value');
          },

          entries: function () {
            return new MapIterator(this, 'key+value');
          },

          forEach: function (callback) {
            var context = arguments.length > 1 ? arguments[1] : null;
            var it = this.entries();
            for (var entry = it.next(); !entry.done; entry = it.next()) {
              if (context) {
                callback.call(context, entry.value[1], entry.value[0], this);
              } else {
                callback(entry.value[1], entry.value[0], this);
              }
            }
          }
        });
        addIterator(Map.prototype, function () { return this.entries(); });

        return Map;
      })(),

      Set: (function () {
        // Creating a Map is expensive.  To speed up the common case of
        // Sets containing only string or numeric keys, we use an object
        // as backing storage and lazily create a full Map only when
        // required.
        var SetShim = function Set(iterable) {
          var set = this;
          if (!ES.TypeIsObject(set)) {
            throw new TypeError('Set does not accept arguments when called as a function');
          }
          set = emulateES6construct(set);
          if (!set._es6set) {
            throw new TypeError('bad set');
          }

          defineProperties(set, {
            '[[SetData]]': null,
            _storage: emptyObject()
          });

          // Optionally initialize map from iterable
          if (typeof iterable !== 'undefined' && iterable !== null) {
            var it = ES.GetIterator(iterable);
            var adder = set.add;
            if (!ES.IsCallable(adder)) { throw new TypeError('bad set'); }
            while (true) {
              var next = ES.IteratorNext(it);
              if (next.done) { break; }
              var nextItem = next.value;
              adder.call(set, nextItem);
            }
          }
          return set;
        };
        var Set$prototype = SetShim.prototype;
        defineProperties(SetShim, {
          '@@create': function (obj) {
            var constructor = this;
            var prototype = constructor.prototype || Set$prototype;
            obj = obj || create(prototype);
            defineProperties(obj, { _es6set: true });
            return obj;
          }
        });

        // Switch from the object backing storage to a full Map.
        var ensureMap = function ensureMap(set) {
          if (!set['[[SetData]]']) {
            var m = set['[[SetData]]'] = new collectionShims.Map();
            Object.keys(set._storage).forEach(function (k) {
              // fast check for leading '$'
              if (k.charCodeAt(0) === 36) {
                k = k.slice(1);
              } else if (k.charAt(0) === 'n') {
                k = +k.slice(1);
              } else {
                k = +k;
              }
              m.set(k, k);
            });
            set._storage = null; // free old backing storage
          }
        };

        Object.defineProperty(SetShim.prototype, 'size', {
          configurable: true,
          enumerable: false,
          get: function () {
            if (typeof this._storage === 'undefined') {
              // https://github.com/paulmillr/es6-shim/issues/176
              throw new TypeError('size method called on incompatible Set');
            }
            ensureMap(this);
            return this['[[SetData]]'].size;
          }
        });

        defineProperties(SetShim.prototype, {
          has: function (key) {
            var fkey;
            if (this._storage && (fkey = fastkey(key)) !== null) {
              return !!this._storage[fkey];
            }
            ensureMap(this);
            return this['[[SetData]]'].has(key);
          },

          add: function (key) {
            var fkey;
            if (this._storage && (fkey = fastkey(key)) !== null) {
              this._storage[fkey] = true;
              return this;
            }
            ensureMap(this);
            this['[[SetData]]'].set(key, key);
            return this;
          },

          'delete': function (key) {
            var fkey;
            if (this._storage && (fkey = fastkey(key)) !== null) {
              var hasFKey = _hasOwnProperty.call(this._storage, fkey);
              return (delete this._storage[fkey]) && hasFKey;
            }
            ensureMap(this);
            return this['[[SetData]]']['delete'](key);
          },

          clear: function () {
            if (this._storage) {
              this._storage = emptyObject();
              return;
            }
            return this['[[SetData]]'].clear();
          },

          values: function () {
            ensureMap(this);
            return this['[[SetData]]'].values();
          },

          entries: function () {
            ensureMap(this);
            return this['[[SetData]]'].entries();
          },

          forEach: function (callback) {
            var context = arguments.length > 1 ? arguments[1] : null;
            var entireSet = this;
            ensureMap(entireSet);
            this['[[SetData]]'].forEach(function (value, key) {
              if (context) {
                callback.call(context, key, key, entireSet);
              } else {
                callback(key, key, entireSet);
              }
            });
          }
        });
        defineProperty(SetShim, 'keys', SetShim.values, true);
        addIterator(SetShim.prototype, function () { return this.values(); });

        return SetShim;
      })()
    };
    defineProperties(globals, collectionShims);

    if (globals.Map || globals.Set) {
      /*
        - In Firefox < 23, Map#size is a function.
        - In all current Firefox, Set#entries/keys/values & Map#clear do not exist
        - https://bugzilla.mozilla.org/show_bug.cgi?id=869996
        - In Firefox 24, Map and Set do not implement forEach
        - In Firefox 25 at least, Map and Set are callable without "new"
      */
      if (
        typeof globals.Map.prototype.clear !== 'function' ||
        new globals.Set().size !== 0 ||
        new globals.Map().size !== 0 ||
        typeof globals.Map.prototype.keys !== 'function' ||
        typeof globals.Set.prototype.keys !== 'function' ||
        typeof globals.Map.prototype.forEach !== 'function' ||
        typeof globals.Set.prototype.forEach !== 'function' ||
        isCallableWithoutNew(globals.Map) ||
        isCallableWithoutNew(globals.Set) ||
        !supportsSubclassing(globals.Map, function (M) {
          var m = new M([]);
          // Firefox 32 is ok with the instantiating the subclass but will
          // throw when the map is used.
          m.set(42, 42);
          return m instanceof M;
        })
      ) {
        globals.Map = collectionShims.Map;
        globals.Set = collectionShims.Set;
      }
    }
    if (globals.Set.prototype.keys !== globals.Set.prototype.values) {
      defineProperty(globals.Set.prototype, 'keys', globals.Set.prototype.values, true);
    }
    // Shim incomplete iterator implementations.
    addIterator(Object.getPrototypeOf((new globals.Map()).keys()));
    addIterator(Object.getPrototypeOf((new globals.Set()).keys()));
  }

  return globals;
}));


}).call(this,require('_process'))
},{"_process":4}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],5:[function(require,module,exports){
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

},{"lodash.forown":6,"lodash.isfunction":29}],6:[function(require,module,exports){
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

},{"lodash._basecreatecallback":7,"lodash._objecttypes":25,"lodash.keys":26}],7:[function(require,module,exports){
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

},{"lodash._setbinddata":8,"lodash.bind":11,"lodash.identity":22,"lodash.support":23}],8:[function(require,module,exports){
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

},{"lodash._isnative":9,"lodash.noop":10}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"lodash._createwrapper":12,"lodash._slice":21}],12:[function(require,module,exports){
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

},{"lodash._basebind":13,"lodash._basecreatewrapper":17,"lodash._slice":21,"lodash.isfunction":29}],13:[function(require,module,exports){
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

},{"lodash._basecreate":14,"lodash._setbinddata":8,"lodash._slice":21,"lodash.isobject":30}],14:[function(require,module,exports){
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
},{"lodash._isnative":15,"lodash.isobject":30,"lodash.noop":16}],15:[function(require,module,exports){
module.exports=require(9)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":9}],16:[function(require,module,exports){
module.exports=require(10)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":10}],17:[function(require,module,exports){
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

},{"lodash._basecreate":18,"lodash._setbinddata":8,"lodash._slice":21,"lodash.isobject":30}],18:[function(require,module,exports){
module.exports=require(14)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":14,"lodash._isnative":19,"lodash.isobject":30,"lodash.noop":20}],19:[function(require,module,exports){
module.exports=require(9)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":9}],20:[function(require,module,exports){
module.exports=require(10)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":10}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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
},{"lodash._isnative":24}],24:[function(require,module,exports){
module.exports=require(9)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":9}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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

},{"lodash._isnative":27,"lodash._shimkeys":28,"lodash.isobject":30}],27:[function(require,module,exports){
module.exports=require(9)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":9}],28:[function(require,module,exports){
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

},{"lodash._objecttypes":25}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
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

},{"lodash._objecttypes":31}],31:[function(require,module,exports){
module.exports=require(25)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._objecttypes/index.js":25}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
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

},{"lodash.isfunction":29}],35:[function(require,module,exports){
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

},{"lodash._escapestringchar":36,"lodash._reinterpolate":37,"lodash.defaults":38,"lodash.escape":40,"lodash.keys":45,"lodash.templatesettings":49,"lodash.values":50}],36:[function(require,module,exports){
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

},{}],37:[function(require,module,exports){
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

},{}],38:[function(require,module,exports){
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

},{"lodash._objecttypes":39,"lodash.keys":45}],39:[function(require,module,exports){
module.exports=require(25)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._objecttypes/index.js":25}],40:[function(require,module,exports){
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

},{"lodash._escapehtmlchar":41,"lodash._reunescapedhtml":43,"lodash.keys":45}],41:[function(require,module,exports){
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

},{"lodash._htmlescapes":42}],42:[function(require,module,exports){
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

},{}],43:[function(require,module,exports){
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

},{"lodash._htmlescapes":44,"lodash.keys":45}],44:[function(require,module,exports){
module.exports=require(42)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.template/node_modules/lodash.escape/node_modules/lodash._escapehtmlchar/node_modules/lodash._htmlescapes/index.js":42}],45:[function(require,module,exports){
module.exports=require(26)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash.keys/index.js":26,"lodash._isnative":46,"lodash._shimkeys":47,"lodash.isobject":30}],46:[function(require,module,exports){
module.exports=require(9)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":9}],47:[function(require,module,exports){
module.exports=require(28)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash.keys/node_modules/lodash._shimkeys/index.js":28,"lodash._objecttypes":48}],48:[function(require,module,exports){
module.exports=require(25)
},{"/Users/dan/Development/sir-trevor-js/node_modules/lodash.isempty/node_modules/lodash.forown/node_modules/lodash._objecttypes/index.js":25}],49:[function(require,module,exports){
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

},{"lodash._reinterpolate":37,"lodash.escape":40}],50:[function(require,module,exports){
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

},{"lodash.keys":45}],51:[function(require,module,exports){
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

},{}],52:[function(require,module,exports){
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

},{}],53:[function(require,module,exports){
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

},{"./blocks":71,"./events":81,"./function-bind":90,"./lodash":95,"./renderable":97}],54:[function(require,module,exports){
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

},{"./block-control":53,"./blocks":71,"./event-bus":80,"./events":81,"./function-bind":90,"./lodash":95,"./mediated-events":96,"./renderable":97}],55:[function(require,module,exports){
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

},{"./function-bind":90,"./renderable":97}],56:[function(require,module,exports){
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


},{"./blocks":71,"./config":77,"./event-bus":80,"./events":81,"./function-bind":90,"./lodash":95,"./mediated-events":96,"./utils":101}],57:[function(require,module,exports){
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

},{"./function-bind":90,"./renderable":97}],58:[function(require,module,exports){
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

},{"./event-bus":80,"./function-bind":90,"./lodash":95,"./renderable":97}],59:[function(require,module,exports){
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

},{"./event-bus":80,"./lodash":95,"./utils":101}],60:[function(require,module,exports){
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

},{"./lodash":95,"./utils":101}],61:[function(require,module,exports){
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

},{"./block-deletion":55,"./block-positioner":57,"./block-reorder":58,"./block-validations":60,"./block_mixins":66,"./config":77,"./event-bus":80,"./formatters":89,"./helpers/extend":92,"./lodash":95,"./simple-block":98,"./to-html":99,"./to-markdown":100,"./utils":101,"spin.js":52}],62:[function(require,module,exports){
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

},{"../utils":101}],63:[function(require,module,exports){
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

},{"../utils":101}],64:[function(require,module,exports){
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

},{"../config":77,"../event-bus":80,"../lodash":95,"../utils":101}],65:[function(require,module,exports){
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

},{"../lodash":95,"./ajaxable":62}],66:[function(require,module,exports){
"use strict";

module.exports = {
  Ajaxable: require('./ajaxable.js'),
  Controllable: require('./controllable.js'),
  Droppable: require('./droppable.js'),
  Fetchable: require('./fetchable.js'),
  Pastable: require('./pastable.js'),
  Uploadable: require('./uploadable.js'),
};

},{"./ajaxable.js":62,"./controllable.js":63,"./droppable.js":64,"./fetchable.js":65,"./pastable.js":67,"./uploadable.js":68}],67:[function(require,module,exports){
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

},{"../config":77,"../lodash":95,"../utils":101}],68:[function(require,module,exports){
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

},{"../config":77,"../extensions/file-uploader":83,"../lodash":95,"../utils":101,"./ajaxable":62}],69:[function(require,module,exports){
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

},{"../block":61,"../to-html":99}],70:[function(require,module,exports){
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

},{"../block":61}],71:[function(require,module,exports){
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

},{"./heading":69,"./image":70,"./list":72,"./quote":73,"./text":74,"./tweet":75,"./video":76}],72:[function(require,module,exports){
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

},{"../block":61,"../lodash":95,"../to-html":99}],73:[function(require,module,exports){
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

},{"../block":61,"../lodash":95,"../to-html":99}],74:[function(require,module,exports){
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

},{"../block":61,"../to-html":99}],75:[function(require,module,exports){
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

},{"../block":61,"../lodash":95,"../utils":101}],76:[function(require,module,exports){
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


},{"../block":61,"../lodash":95,"../utils":101}],77:[function(require,module,exports){
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

},{}],78:[function(require,module,exports){
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



},{"./block-controls":54,"./block-manager":56,"./config":77,"./error-handler":79,"./event-bus":80,"./events":81,"./extensions/editor-store":82,"./floating-block-controls":85,"./form-events":86,"./format-bar":87,"./function-bind":90,"./lodash":95,"./utils":101}],79:[function(require,module,exports){
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


},{"./function-bind":90,"./lodash":95,"./mediated-events":96,"./renderable":97}],80:[function(require,module,exports){
"use strict";

module.exports = Object.assign({}, require('./events'));

},{"./events":81}],81:[function(require,module,exports){
"use strict";

module.exports = require('eventablejs');

},{"eventablejs":3}],82:[function(require,module,exports){
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

},{"../lodash":95,"../utils":101}],83:[function(require,module,exports){
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

},{"../config":77,"../event-bus":80,"../lodash":95,"../utils":101}],84:[function(require,module,exports){
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


},{"../event-bus":80,"../utils":101}],85:[function(require,module,exports){
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

},{"./event-bus":80,"./events":81,"./function-bind":90,"./lodash":95,"./renderable":97}],86:[function(require,module,exports){
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

},{"./config":77,"./event-bus":80,"./extensions/submittable":84,"./utils":101}],87:[function(require,module,exports){
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

},{"./config":77,"./events":81,"./formatters":89,"./function-bind":90,"./lodash":95,"./mediated-events":96,"./renderable":97}],88:[function(require,module,exports){
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

},{"./helpers/extend":92,"./lodash":95}],89:[function(require,module,exports){
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

},{"./formatter":88}],90:[function(require,module,exports){
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


},{}],91:[function(require,module,exports){
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


},{}],92:[function(require,module,exports){
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

},{}],93:[function(require,module,exports){
"use strict";

var _ = require('./lodash');

require('es6-shim'); // bundling in for the moment as support is very rare
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

},{"./block":61,"./block-control":53,"./block-controls":54,"./block-deletion":55,"./block-manager":56,"./block-positioner":57,"./block-reorder":58,"./block-store":59,"./block-validations":60,"./block_mixins":66,"./blocks":71,"./config":77,"./editor":78,"./event-bus":80,"./events":81,"./extensions/editor-store":82,"./extensions/file-uploader":83,"./extensions/submittable":84,"./floating-block-controls":85,"./form-events":86,"./format-bar":87,"./formatter":88,"./formatters":89,"./helpers/event":91,"./locales":94,"./lodash":95,"./simple-block":98,"./to-html":99,"./to-markdown":100,"./utils":101,"./vendor/array-includes":102,"es6-shim":2}],94:[function(require,module,exports){
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

},{"./config":77,"./lodash":95,"./utils":101}],95:[function(require,module,exports){
"use strict";

exports.isEmpty = require('lodash.isempty');
exports.isFunction = require('lodash.isfunction');
exports.isObject = require('lodash.isobject');
exports.isString = require('lodash.isstring');
exports.isUndefined = require('lodash.isundefined');
exports.result = require('lodash.result');
exports.template = require('lodash.template');
exports.uniqueId = require('lodash.uniqueid');

},{"lodash.isempty":5,"lodash.isfunction":29,"lodash.isobject":30,"lodash.isstring":32,"lodash.isundefined":33,"lodash.result":34,"lodash.template":35,"lodash.uniqueid":51}],96:[function(require,module,exports){
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

},{}],97:[function(require,module,exports){
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


},{"./lodash":95}],98:[function(require,module,exports){
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

},{"./block-reorder":58,"./block-store":59,"./events":81,"./function-bind":90,"./helpers/extend":92,"./lodash":95,"./renderable":97,"./utils":101}],99:[function(require,module,exports){
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

},{"./blocks":71,"./formatters":89,"./lodash":95,"./utils":101}],100:[function(require,module,exports){
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

},{"./blocks":71,"./formatters":89,"./lodash":95,"./utils":101}],101:[function(require,module,exports){
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

},{"./config":77,"./lodash":95}],102:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9lczYtc2hpbS9lczYtc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudGFibGVqcy9ldmVudGFibGUuanMiLCJub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5fc2V0YmluZGRhdGEvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guX3NldGJpbmRkYXRhL25vZGVfbW9kdWxlcy9sb2Rhc2guX2lzbmF0aXZlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLl9zZXRiaW5kZGF0YS9ub2RlX21vZHVsZXMvbG9kYXNoLm5vb3AvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guYmluZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5iaW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guX2NyZWF0ZXdyYXBwZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guYmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLl9jcmVhdGV3cmFwcGVyL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2ViaW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fY3JlYXRld3JhcHBlci9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlYmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fY3JlYXRld3JhcHBlci9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRld3JhcHBlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNlbXB0eS9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5iaW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guX3NsaWNlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmlkZW50aXR5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLnN1cHBvcnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fb2JqZWN0dHlwZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzZW1wdHkvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5rZXlzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc2VtcHR5L25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2gua2V5cy9ub2RlX21vZHVsZXMvbG9kYXNoLl9zaGlta2V5cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNmdW5jdGlvbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2guaXNvYmplY3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzc3RyaW5nL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5pc3VuZGVmaW5lZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gucmVzdWx0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5fZXNjYXBlc3RyaW5nY2hhci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5fcmVpbnRlcnBvbGF0ZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5kZWZhdWx0cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5lc2NhcGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnRlbXBsYXRlL25vZGVfbW9kdWxlcy9sb2Rhc2guZXNjYXBlL25vZGVfbW9kdWxlcy9sb2Rhc2guX2VzY2FwZWh0bWxjaGFyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLmVzY2FwZS9ub2RlX21vZHVsZXMvbG9kYXNoLl9lc2NhcGVodG1sY2hhci9ub2RlX21vZHVsZXMvbG9kYXNoLl9odG1sZXNjYXBlcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudGVtcGxhdGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5lc2NhcGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5fcmV1bmVzY2FwZWRodG1sL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC50ZW1wbGF0ZS9ub2RlX21vZHVsZXMvbG9kYXNoLnRlbXBsYXRlc2V0dGluZ3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnRlbXBsYXRlL25vZGVfbW9kdWxlcy9sb2Rhc2gudmFsdWVzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC51bmlxdWVpZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zcGluLmpzL3NwaW4uanMiLCJzcmMvYmxvY2stY29udHJvbC5qcyIsInNyYy9ibG9jay1jb250cm9scy5qcyIsInNyYy9ibG9jay1kZWxldGlvbi5qcyIsInNyYy9ibG9jay1tYW5hZ2VyLmpzIiwic3JjL2Jsb2NrLXBvc2l0aW9uZXIuanMiLCJzcmMvYmxvY2stcmVvcmRlci5qcyIsInNyYy9ibG9jay1zdG9yZS5qcyIsInNyYy9ibG9jay12YWxpZGF0aW9ucy5qcyIsInNyYy9ibG9jay5qcyIsInNyYy9ibG9ja19taXhpbnMvYWpheGFibGUuanMiLCJzcmMvYmxvY2tfbWl4aW5zL2NvbnRyb2xsYWJsZS5qcyIsInNyYy9ibG9ja19taXhpbnMvZHJvcHBhYmxlLmpzIiwic3JjL2Jsb2NrX21peGlucy9mZXRjaGFibGUuanMiLCJzcmMvYmxvY2tfbWl4aW5zL2luZGV4LmpzIiwic3JjL2Jsb2NrX21peGlucy9wYXN0YWJsZS5qcyIsInNyYy9ibG9ja19taXhpbnMvdXBsb2FkYWJsZS5qcyIsInNyYy9ibG9ja3MvaGVhZGluZy5qcyIsInNyYy9ibG9ja3MvaW1hZ2UuanMiLCJzcmMvYmxvY2tzL2luZGV4LmpzIiwic3JjL2Jsb2Nrcy9saXN0LmpzIiwic3JjL2Jsb2Nrcy9xdW90ZS5qcyIsInNyYy9ibG9ja3MvdGV4dC5qcyIsInNyYy9ibG9ja3MvdHdlZXQuanMiLCJzcmMvYmxvY2tzL3ZpZGVvLmpzIiwic3JjL2NvbmZpZy5qcyIsInNyYy9lZGl0b3IuanMiLCJzcmMvZXJyb3ItaGFuZGxlci5qcyIsInNyYy9ldmVudC1idXMuanMiLCJzcmMvZXZlbnRzLmpzIiwic3JjL2V4dGVuc2lvbnMvZWRpdG9yLXN0b3JlLmpzIiwic3JjL2V4dGVuc2lvbnMvZmlsZS11cGxvYWRlci5qcyIsInNyYy9leHRlbnNpb25zL3N1Ym1pdHRhYmxlLmpzIiwic3JjL2Zsb2F0aW5nLWJsb2NrLWNvbnRyb2xzLmpzIiwic3JjL2Zvcm0tZXZlbnRzLmpzIiwic3JjL2Zvcm1hdC1iYXIuanMiLCJzcmMvZm9ybWF0dGVyLmpzIiwic3JjL2Zvcm1hdHRlcnMuanMiLCJzcmMvZnVuY3Rpb24tYmluZC5qcyIsInNyYy9oZWxwZXJzL2V2ZW50LmpzIiwic3JjL2hlbHBlcnMvZXh0ZW5kLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL2xvY2FsZXMuanMiLCJzcmMvbG9kYXNoLmpzIiwic3JjL21lZGlhdGVkLWV2ZW50cy5qcyIsInNyYy9yZW5kZXJhYmxlLmpzIiwic3JjL3NpbXBsZS1ibG9jay5qcyIsInNyYy90by1odG1sLmpzIiwic3JjL3RvLW1hcmtkb3duLmpzIiwic3JjL3V0aWxzLmpzIiwic3JjL3ZlbmRvci9hcnJheS1pbmNsdWRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzkrREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL3NyYy8nKTtcbiIsIihmdW5jdGlvbiAocHJvY2Vzcyl7XG4gLyohXG4gICogaHR0cHM6Ly9naXRodWIuY29tL3BhdWxtaWxsci9lczYtc2hpbVxuICAqIEBsaWNlbnNlIGVzNi1zaGltIENvcHlyaWdodCAyMDEzLTIwMTQgYnkgUGF1bCBNaWxsZXIgKGh0dHA6Ly9wYXVsbWlsbHIuY29tKVxuICAqICAgYW5kIGNvbnRyaWJ1dG9ycywgIE1JVCBMaWNlbnNlXG4gICogZXM2LXNoaW06IHYwLjIxLjBcbiAgKiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BhdWxtaWxsci9lczYtc2hpbS9ibG9iL21hc3Rlci9MSUNFTlNFXG4gICogRGV0YWlscyBhbmQgZG9jdW1lbnRhdGlvbjpcbiAgKiBodHRwczovL2dpdGh1Yi5jb20vcGF1bG1pbGxyL2VzNi1zaGltL1xuICAqL1xuXG4vLyBVTUQgKFVuaXZlcnNhbCBNb2R1bGUgRGVmaW5pdGlvbilcbi8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vdW1kanMvdW1kL2Jsb2IvbWFzdGVyL3JldHVybkV4cG9ydHMuanNcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShmYWN0b3J5KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAvLyBvbmx5IENvbW1vbkpTLWxpa2UgZW52aXJvbWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgIC8vIGxpa2UgTm9kZS5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHMgKHJvb3QgaXMgd2luZG93KVxuICAgIHJvb3QucmV0dXJuRXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgaXNDYWxsYWJsZVdpdGhvdXROZXcgPSBmdW5jdGlvbiAoZnVuYykge1xuICAgIHRyeSB7IGZ1bmMoKTsgfVxuICAgIGNhdGNoIChlKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIHZhciBzdXBwb3J0c1N1YmNsYXNzaW5nID0gZnVuY3Rpb24gKEMsIGYpIHtcbiAgICAvKiBqc2hpbnQgcHJvdG86dHJ1ZSAqL1xuICAgIHRyeSB7XG4gICAgICB2YXIgU3ViID0gZnVuY3Rpb24gKCkgeyBDLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgICBpZiAoIVN1Yi5fX3Byb3RvX18pIHsgcmV0dXJuIGZhbHNlOyAvKiBza2lwIHRlc3Qgb24gSUUgPCAxMSAqLyB9XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoU3ViLCBDKTtcbiAgICAgIFN1Yi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEMucHJvdG90eXBlLCB7XG4gICAgICAgIGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBDIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGYoU3ViKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIHZhciBhcmVQcm9wZXJ0eURlc2NyaXB0b3JzU3VwcG9ydGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICd4Jywge30pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkgeyAvKiB0aGlzIGlzIElFIDguICovXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIHZhciBzdGFydHNXaXRoUmVqZWN0c1JlZ2V4ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZWplY3RzUmVnZXggPSBmYWxzZTtcbiAgICBpZiAoU3RyaW5nLnByb3RvdHlwZS5zdGFydHNXaXRoKSB7XG4gICAgICB0cnkge1xuICAgICAgICAnL2EvJy5zdGFydHNXaXRoKC9hLyk7XG4gICAgICB9IGNhdGNoIChlKSB7IC8qIHRoaXMgaXMgc3BlYyBjb21wbGlhbnQgKi9cbiAgICAgICAgcmVqZWN0c1JlZ2V4ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlamVjdHNSZWdleDtcbiAgfTtcblxuICAvKmpzaGludCBldmlsOiB0cnVlICovXG4gIHZhciBnZXRHbG9iYWwgPSBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzOycpO1xuICAvKmpzaGludCBldmlsOiBmYWxzZSAqL1xuXG4gIHZhciBnbG9iYWxzID0gZ2V0R2xvYmFsKCk7XG4gIHZhciBnbG9iYWxfaXNGaW5pdGUgPSBnbG9iYWxzLmlzRmluaXRlO1xuICB2YXIgc3VwcG9ydHNEZXNjcmlwdG9ycyA9ICEhT2JqZWN0LmRlZmluZVByb3BlcnR5ICYmIGFyZVByb3BlcnR5RGVzY3JpcHRvcnNTdXBwb3J0ZWQoKTtcbiAgdmFyIHN0YXJ0c1dpdGhJc0NvbXBsaWFudCA9IHN0YXJ0c1dpdGhSZWplY3RzUmVnZXgoKTtcbiAgdmFyIF9zbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbiAgdmFyIF9pbmRleE9mID0gU3RyaW5nLnByb3RvdHlwZS5pbmRleE9mO1xuICB2YXIgX3RvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgdmFyIF9oYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIHZhciBBcnJheUl0ZXJhdG9yOyAvLyBtYWtlIG91ciBpbXBsZW1lbnRhdGlvbiBwcml2YXRlXG5cbiAgdmFyIGRlZmluZVByb3BlcnR5ID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSwgdmFsdWUsIGZvcmNlKSB7XG4gICAgaWYgKCFmb3JjZSAmJiBuYW1lIGluIG9iamVjdCkgeyByZXR1cm47IH1cbiAgICBpZiAoc3VwcG9ydHNEZXNjcmlwdG9ycykge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqZWN0W25hbWVdID0gdmFsdWU7XG4gICAgfVxuICB9O1xuXG4gIC8vIERlZmluZSBjb25maWd1cmFibGUsIHdyaXRhYmxlIGFuZCBub24tZW51bWVyYWJsZSBwcm9wc1xuICAvLyBpZiB0aGV5IGRvbuKAmXQgZXhpc3QuXG4gIHZhciBkZWZpbmVQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKG9iamVjdCwgbWFwKSB7XG4gICAgT2JqZWN0LmtleXMobWFwKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICB2YXIgbWV0aG9kID0gbWFwW25hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkob2JqZWN0LCBuYW1lLCBtZXRob2QsIGZhbHNlKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBTaW1wbGUgc2hpbSBmb3IgT2JqZWN0LmNyZWF0ZSBvbiBFUzMgYnJvd3NlcnNcbiAgLy8gKHVubGlrZSByZWFsIHNoaW0sIG5vIGF0dGVtcHQgdG8gc3VwcG9ydCBgcHJvdG90eXBlID09PSBudWxsYClcbiAgdmFyIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKHByb3RvdHlwZSwgcHJvcGVydGllcykge1xuICAgIGZ1bmN0aW9uIFR5cGUoKSB7fVxuICAgIFR5cGUucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgIHZhciBvYmplY3QgPSBuZXcgVHlwZSgpO1xuICAgIGlmICh0eXBlb2YgcHJvcGVydGllcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGRlZmluZVByb3BlcnRpZXMob2JqZWN0LCBwcm9wZXJ0aWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfTtcblxuICAvLyBUaGlzIGlzIGEgcHJpdmF0ZSBuYW1lIGluIHRoZSBlczYgc3BlYywgZXF1YWwgdG8gJ1tTeW1ib2wuaXRlcmF0b3JdJ1xuICAvLyB3ZSdyZSBnb2luZyB0byB1c2UgYW4gYXJiaXRyYXJ5IF8tcHJlZml4ZWQgbmFtZSB0byBtYWtlIG91ciBzaGltc1xuICAvLyB3b3JrIHByb3Blcmx5IHdpdGggZWFjaCBvdGhlciwgZXZlbiB0aG91Z2ggd2UgZG9uJ3QgaGF2ZSBmdWxsIEl0ZXJhdG9yXG4gIC8vIHN1cHBvcnQuICBUaGF0IGlzLCBgQXJyYXkuZnJvbShtYXAua2V5cygpKWAgd2lsbCB3b3JrLCBidXQgd2UgZG9uJ3RcbiAgLy8gcHJldGVuZCB0byBleHBvcnQgYSBcInJlYWxcIiBJdGVyYXRvciBpbnRlcmZhY2UuXG4gIHZhciAkaXRlcmF0b3IkID0gKHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgU3ltYm9sLml0ZXJhdG9yKSB8fCAnX2VzNi1zaGltIGl0ZXJhdG9yXyc7XG4gIC8vIEZpcmVmb3ggc2hpcHMgYSBwYXJ0aWFsIGltcGxlbWVudGF0aW9uIHVzaW5nIHRoZSBuYW1lIEBAaXRlcmF0b3IuXG4gIC8vIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTkwNzA3NyNjMTRcbiAgLy8gU28gdXNlIHRoYXQgbmFtZSBpZiB3ZSBkZXRlY3QgaXQuXG4gIGlmIChnbG9iYWxzLlNldCAmJiB0eXBlb2YgbmV3IGdsb2JhbHMuU2V0KClbJ0BAaXRlcmF0b3InXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICRpdGVyYXRvciQgPSAnQEBpdGVyYXRvcic7XG4gIH1cbiAgdmFyIGFkZEl0ZXJhdG9yID0gZnVuY3Rpb24gKHByb3RvdHlwZSwgaW1wbCkge1xuICAgIGlmICghaW1wbCkgeyBpbXBsID0gZnVuY3Rpb24gaXRlcmF0b3IoKSB7IHJldHVybiB0aGlzOyB9OyB9XG4gICAgdmFyIG8gPSB7fTtcbiAgICBvWyRpdGVyYXRvciRdID0gaW1wbDtcbiAgICBkZWZpbmVQcm9wZXJ0aWVzKHByb3RvdHlwZSwgbyk7XG4gICAgLyoganNoaW50IG5vdHlwZW9mOiB0cnVlICovXG4gICAgaWYgKCFwcm90b3R5cGVbJGl0ZXJhdG9yJF0gJiYgdHlwZW9mICRpdGVyYXRvciQgPT09ICdzeW1ib2wnKSB7XG4gICAgICAvLyBpbXBsZW1lbnRhdGlvbnMgYXJlIGJ1Z2d5IHdoZW4gJGl0ZXJhdG9yJCBpcyBhIFN5bWJvbFxuICAgICAgcHJvdG90eXBlWyRpdGVyYXRvciRdID0gaW1wbDtcbiAgICB9XG4gIH07XG5cbiAgLy8gdGFrZW4gZGlyZWN0bHkgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbGpoYXJiL2lzLWFyZ3VtZW50cy9ibG9iL21hc3Rlci9pbmRleC5qc1xuICAvLyBjYW4gYmUgcmVwbGFjZWQgd2l0aCByZXF1aXJlKCdpcy1hcmd1bWVudHMnKSBpZiB3ZSBldmVyIHVzZSBhIGJ1aWxkIHByb2Nlc3MgaW5zdGVhZFxuICB2YXIgaXNBcmd1bWVudHMgPSBmdW5jdGlvbiBpc0FyZ3VtZW50cyh2YWx1ZSkge1xuICAgIHZhciBzdHIgPSBfdG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gICAgdmFyIHJlc3VsdCA9IHN0ciA9PT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHJlc3VsdCA9IHN0ciAhPT0gJ1tvYmplY3QgQXJyYXldJyAmJlxuICAgICAgICB2YWx1ZSAhPT0gbnVsbCAmJlxuICAgICAgICB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXG4gICAgICAgIHR5cGVvZiB2YWx1ZS5sZW5ndGggPT09ICdudW1iZXInICYmXG4gICAgICAgIHZhbHVlLmxlbmd0aCA+PSAwICYmXG4gICAgICAgIF90b1N0cmluZy5jYWxsKHZhbHVlLmNhbGxlZSkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgdmFyIGVtdWxhdGVFUzZjb25zdHJ1Y3QgPSBmdW5jdGlvbiAobykge1xuICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KG8pKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ2JhZCBvYmplY3QnKTsgfVxuICAgIC8vIGVzNSBhcHByb3hpbWF0aW9uIHRvIGVzNiBzdWJjbGFzcyBzZW1hbnRpY3M6IGluIGVzNiwgJ25ldyBGb28nXG4gICAgLy8gd291bGQgaW52b2tlIEZvby5AQGNyZWF0ZSB0byBhbGxvY2F0aW9uL2luaXRpYWxpemUgdGhlIG5ldyBvYmplY3QuXG4gICAgLy8gSW4gZXM1IHdlIGp1c3QgZ2V0IHRoZSBwbGFpbiBvYmplY3QuICBTbyBpZiB3ZSBkZXRlY3QgYW5cbiAgICAvLyB1bmluaXRpYWxpemVkIG9iamVjdCwgaW52b2tlIG8uY29uc3RydWN0b3IuQEBjcmVhdGVcbiAgICBpZiAoIW8uX2VzNmNvbnN0cnVjdCkge1xuICAgICAgaWYgKG8uY29uc3RydWN0b3IgJiYgRVMuSXNDYWxsYWJsZShvLmNvbnN0cnVjdG9yWydAQGNyZWF0ZSddKSkge1xuICAgICAgICBvID0gby5jb25zdHJ1Y3RvclsnQEBjcmVhdGUnXShvKTtcbiAgICAgIH1cbiAgICAgIGRlZmluZVByb3BlcnRpZXMobywgeyBfZXM2Y29uc3RydWN0OiB0cnVlIH0pO1xuICAgIH1cbiAgICByZXR1cm4gbztcbiAgfTtcblxuICB2YXIgRVMgPSB7XG4gICAgQ2hlY2tPYmplY3RDb2VyY2libGU6IGZ1bmN0aW9uICh4LCBvcHRNZXNzYWdlKSB7XG4gICAgICAvKiBqc2hpbnQgZXFudWxsOnRydWUgKi9cbiAgICAgIGlmICh4ID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihvcHRNZXNzYWdlIHx8ICdDYW5ub3QgY2FsbCBtZXRob2Qgb24gJyArIHgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHg7XG4gICAgfSxcblxuICAgIFR5cGVJc09iamVjdDogZnVuY3Rpb24gKHgpIHtcbiAgICAgIC8qIGpzaGludCBlcW51bGw6dHJ1ZSAqL1xuICAgICAgLy8gdGhpcyBpcyBleHBlbnNpdmUgd2hlbiBpdCByZXR1cm5zIGZhbHNlOyB1c2UgdGhpcyBmdW5jdGlvblxuICAgICAgLy8gd2hlbiB5b3UgZXhwZWN0IGl0IHRvIHJldHVybiB0cnVlIGluIHRoZSBjb21tb24gY2FzZS5cbiAgICAgIHJldHVybiB4ICE9IG51bGwgJiYgT2JqZWN0KHgpID09PSB4O1xuICAgIH0sXG5cbiAgICBUb09iamVjdDogZnVuY3Rpb24gKG8sIG9wdE1lc3NhZ2UpIHtcbiAgICAgIHJldHVybiBPYmplY3QoRVMuQ2hlY2tPYmplY3RDb2VyY2libGUobywgb3B0TWVzc2FnZSkpO1xuICAgIH0sXG5cbiAgICBJc0NhbGxhYmxlOiBmdW5jdGlvbiAoeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAgIC8vIHNvbWUgdmVyc2lvbnMgb2YgSUUgc2F5IHRoYXQgdHlwZW9mIC9hYmMvID09PSAnZnVuY3Rpb24nXG4gICAgICAgIF90b1N0cmluZy5jYWxsKHgpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICAgIH0sXG5cbiAgICBUb0ludDMyOiBmdW5jdGlvbiAoeCkge1xuICAgICAgcmV0dXJuIHggPj4gMDtcbiAgICB9LFxuXG4gICAgVG9VaW50MzI6IGZ1bmN0aW9uICh4KSB7XG4gICAgICByZXR1cm4geCA+Pj4gMDtcbiAgICB9LFxuXG4gICAgVG9JbnRlZ2VyOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhciBudW1iZXIgPSArdmFsdWU7XG4gICAgICBpZiAoTnVtYmVyLmlzTmFOKG51bWJlcikpIHsgcmV0dXJuIDA7IH1cbiAgICAgIGlmIChudW1iZXIgPT09IDAgfHwgIU51bWJlci5pc0Zpbml0ZShudW1iZXIpKSB7IHJldHVybiBudW1iZXI7IH1cbiAgICAgIHJldHVybiAobnVtYmVyID4gMCA/IDEgOiAtMSkgKiBNYXRoLmZsb29yKE1hdGguYWJzKG51bWJlcikpO1xuICAgIH0sXG5cbiAgICBUb0xlbmd0aDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgbGVuID0gRVMuVG9JbnRlZ2VyKHZhbHVlKTtcbiAgICAgIGlmIChsZW4gPD0gMCkgeyByZXR1cm4gMDsgfSAvLyBpbmNsdWRlcyBjb252ZXJ0aW5nIC0wIHRvICswXG4gICAgICBpZiAobGVuID4gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIHsgcmV0dXJuIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSOyB9XG4gICAgICByZXR1cm4gbGVuO1xuICAgIH0sXG5cbiAgICBTYW1lVmFsdWU6IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICBpZiAoYSA9PT0gYikge1xuICAgICAgICAvLyAwID09PSAtMCwgYnV0IHRoZXkgYXJlIG5vdCBpZGVudGljYWwuXG4gICAgICAgIGlmIChhID09PSAwKSB7IHJldHVybiAxIC8gYSA9PT0gMSAvIGI7IH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gTnVtYmVyLmlzTmFOKGEpICYmIE51bWJlci5pc05hTihiKTtcbiAgICB9LFxuXG4gICAgU2FtZVZhbHVlWmVybzogZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIC8vIHNhbWUgYXMgU2FtZVZhbHVlIGV4Y2VwdCBmb3IgU2FtZVZhbHVlWmVybygrMCwgLTApID09IHRydWVcbiAgICAgIHJldHVybiAoYSA9PT0gYikgfHwgKE51bWJlci5pc05hTihhKSAmJiBOdW1iZXIuaXNOYU4oYikpO1xuICAgIH0sXG5cbiAgICBJc0l0ZXJhYmxlOiBmdW5jdGlvbiAobykge1xuICAgICAgcmV0dXJuIEVTLlR5cGVJc09iamVjdChvKSAmJlxuICAgICAgICAodHlwZW9mIG9bJGl0ZXJhdG9yJF0gIT09ICd1bmRlZmluZWQnIHx8IGlzQXJndW1lbnRzKG8pKTtcbiAgICB9LFxuXG4gICAgR2V0SXRlcmF0b3I6IGZ1bmN0aW9uIChvKSB7XG4gICAgICBpZiAoaXNBcmd1bWVudHMobykpIHtcbiAgICAgICAgLy8gc3BlY2lhbCBjYXNlIHN1cHBvcnQgZm9yIGBhcmd1bWVudHNgXG4gICAgICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcihvLCAndmFsdWUnKTtcbiAgICAgIH1cbiAgICAgIHZhciBpdEZuID0gb1skaXRlcmF0b3IkXTtcbiAgICAgIGlmICghRVMuSXNDYWxsYWJsZShpdEZuKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2YWx1ZSBpcyBub3QgYW4gaXRlcmFibGUnKTtcbiAgICAgIH1cbiAgICAgIHZhciBpdCA9IGl0Rm4uY2FsbChvKTtcbiAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KGl0KSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiYWQgaXRlcmF0b3InKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpdDtcbiAgICB9LFxuXG4gICAgSXRlcmF0b3JOZXh0OiBmdW5jdGlvbiAoaXQpIHtcbiAgICAgIHZhciByZXN1bHQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGl0Lm5leHQoYXJndW1lbnRzWzFdKSA6IGl0Lm5leHQoKTtcbiAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KHJlc3VsdCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYmFkIGl0ZXJhdG9yJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBDb25zdHJ1Y3Q6IGZ1bmN0aW9uIChDLCBhcmdzKSB7XG4gICAgICAvLyBDcmVhdGVGcm9tQ29uc3RydWN0b3JcbiAgICAgIHZhciBvYmo7XG4gICAgICBpZiAoRVMuSXNDYWxsYWJsZShDWydAQGNyZWF0ZSddKSkge1xuICAgICAgICBvYmogPSBDWydAQGNyZWF0ZSddKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBPcmRpbmFyeUNyZWF0ZUZyb21Db25zdHJ1Y3RvclxuICAgICAgICBvYmogPSBjcmVhdGUoQy5wcm90b3R5cGUgfHwgbnVsbCk7XG4gICAgICB9XG4gICAgICAvLyBNYXJrIHRoYXQgd2UndmUgdXNlZCB0aGUgZXM2IGNvbnN0cnVjdCBwYXRoXG4gICAgICAvLyAoc2VlIGVtdWxhdGVFUzZjb25zdHJ1Y3QpXG4gICAgICBkZWZpbmVQcm9wZXJ0aWVzKG9iaiwgeyBfZXM2Y29uc3RydWN0OiB0cnVlIH0pO1xuICAgICAgLy8gQ2FsbCB0aGUgY29uc3RydWN0b3IuXG4gICAgICB2YXIgcmVzdWx0ID0gQy5hcHBseShvYmosIGFyZ3MpO1xuICAgICAgcmV0dXJuIEVTLlR5cGVJc09iamVjdChyZXN1bHQpID8gcmVzdWx0IDogb2JqO1xuICAgIH1cbiAgfTtcblxuICB2YXIgbnVtYmVyQ29udmVyc2lvbiA9IChmdW5jdGlvbiAoKSB7XG4gICAgLy8gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vaW5leG9yYWJsZXRhc2gvcG9seWZpbGwvYmxvYi9tYXN0ZXIvdHlwZWRhcnJheS5qcyNMMTc2LUwyNjZcbiAgICAvLyB3aXRoIHBlcm1pc3Npb24gYW5kIGxpY2Vuc2UsIHBlciBodHRwczovL3R3aXR0ZXIuY29tL2luZXhvcmFibGV0YXNoL3N0YXR1cy8zNzIyMDY1MDk1NDA2NTkyMDBcblxuICAgIGZ1bmN0aW9uIHJvdW5kVG9FdmVuKG4pIHtcbiAgICAgIHZhciB3ID0gTWF0aC5mbG9vcihuKSwgZiA9IG4gLSB3O1xuICAgICAgaWYgKGYgPCAwLjUpIHtcbiAgICAgICAgcmV0dXJuIHc7XG4gICAgICB9XG4gICAgICBpZiAoZiA+IDAuNSkge1xuICAgICAgICByZXR1cm4gdyArIDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gdyAlIDIgPyB3ICsgMSA6IHc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFja0lFRUU3NTQodiwgZWJpdHMsIGZiaXRzKSB7XG4gICAgICB2YXIgYmlhcyA9ICgxIDw8IChlYml0cyAtIDEpKSAtIDEsXG4gICAgICAgIHMsIGUsIGYsXG4gICAgICAgIGksIGJpdHMsIHN0ciwgYnl0ZXM7XG5cbiAgICAgIC8vIENvbXB1dGUgc2lnbiwgZXhwb25lbnQsIGZyYWN0aW9uXG4gICAgICBpZiAodiAhPT0gdikge1xuICAgICAgICAvLyBOYU5cbiAgICAgICAgLy8gaHR0cDovL2Rldi53My5vcmcvMjAwNi93ZWJhcGkvV2ViSURMLyNlcy10eXBlLW1hcHBpbmdcbiAgICAgICAgZSA9ICgxIDw8IGViaXRzKSAtIDE7XG4gICAgICAgIGYgPSBNYXRoLnBvdygyLCBmYml0cyAtIDEpO1xuICAgICAgICBzID0gMDtcbiAgICAgIH0gZWxzZSBpZiAodiA9PT0gSW5maW5pdHkgfHwgdiA9PT0gLUluZmluaXR5KSB7XG4gICAgICAgIGUgPSAoMSA8PCBlYml0cykgLSAxO1xuICAgICAgICBmID0gMDtcbiAgICAgICAgcyA9ICh2IDwgMCkgPyAxIDogMDtcbiAgICAgIH0gZWxzZSBpZiAodiA9PT0gMCkge1xuICAgICAgICBlID0gMDtcbiAgICAgICAgZiA9IDA7XG4gICAgICAgIHMgPSAoMSAvIHYgPT09IC1JbmZpbml0eSkgPyAxIDogMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMgPSB2IDwgMDtcbiAgICAgICAgdiA9IE1hdGguYWJzKHYpO1xuXG4gICAgICAgIGlmICh2ID49IE1hdGgucG93KDIsIDEgLSBiaWFzKSkge1xuICAgICAgICAgIGUgPSBNYXRoLm1pbihNYXRoLmZsb29yKE1hdGgubG9nKHYpIC8gTWF0aC5MTjIpLCAxMDIzKTtcbiAgICAgICAgICBmID0gcm91bmRUb0V2ZW4odiAvIE1hdGgucG93KDIsIGUpICogTWF0aC5wb3coMiwgZmJpdHMpKTtcbiAgICAgICAgICBpZiAoZiAvIE1hdGgucG93KDIsIGZiaXRzKSA+PSAyKSB7XG4gICAgICAgICAgICBlID0gZSArIDE7XG4gICAgICAgICAgICBmID0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGUgPiBiaWFzKSB7XG4gICAgICAgICAgICAvLyBPdmVyZmxvd1xuICAgICAgICAgICAgZSA9ICgxIDw8IGViaXRzKSAtIDE7XG4gICAgICAgICAgICBmID0gMDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm9ybWFsXG4gICAgICAgICAgICBlID0gZSArIGJpYXM7XG4gICAgICAgICAgICBmID0gZiAtIE1hdGgucG93KDIsIGZiaXRzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gU3Vibm9ybWFsXG4gICAgICAgICAgZSA9IDA7XG4gICAgICAgICAgZiA9IHJvdW5kVG9FdmVuKHYgLyBNYXRoLnBvdygyLCAxIC0gYmlhcyAtIGZiaXRzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUGFjayBzaWduLCBleHBvbmVudCwgZnJhY3Rpb25cbiAgICAgIGJpdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IGZiaXRzOyBpOyBpIC09IDEpIHtcbiAgICAgICAgYml0cy5wdXNoKGYgJSAyID8gMSA6IDApO1xuICAgICAgICBmID0gTWF0aC5mbG9vcihmIC8gMik7XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSBlYml0czsgaTsgaSAtPSAxKSB7XG4gICAgICAgIGJpdHMucHVzaChlICUgMiA/IDEgOiAwKTtcbiAgICAgICAgZSA9IE1hdGguZmxvb3IoZSAvIDIpO1xuICAgICAgfVxuICAgICAgYml0cy5wdXNoKHMgPyAxIDogMCk7XG4gICAgICBiaXRzLnJldmVyc2UoKTtcbiAgICAgIHN0ciA9IGJpdHMuam9pbignJyk7XG5cbiAgICAgIC8vIEJpdHMgdG8gYnl0ZXNcbiAgICAgIGJ5dGVzID0gW107XG4gICAgICB3aGlsZSAoc3RyLmxlbmd0aCkge1xuICAgICAgICBieXRlcy5wdXNoKHBhcnNlSW50KHN0ci5zbGljZSgwLCA4KSwgMikpO1xuICAgICAgICBzdHIgPSBzdHIuc2xpY2UoOCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdW5wYWNrSUVFRTc1NChieXRlcywgZWJpdHMsIGZiaXRzKSB7XG4gICAgICAvLyBCeXRlcyB0byBiaXRzXG4gICAgICB2YXIgYml0cyA9IFtdLCBpLCBqLCBiLCBzdHIsXG4gICAgICAgICAgYmlhcywgcywgZSwgZjtcblxuICAgICAgZm9yIChpID0gYnl0ZXMubGVuZ3RoOyBpOyBpIC09IDEpIHtcbiAgICAgICAgYiA9IGJ5dGVzW2kgLSAxXTtcbiAgICAgICAgZm9yIChqID0gODsgajsgaiAtPSAxKSB7XG4gICAgICAgICAgYml0cy5wdXNoKGIgJSAyID8gMSA6IDApO1xuICAgICAgICAgIGIgPSBiID4+IDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGJpdHMucmV2ZXJzZSgpO1xuICAgICAgc3RyID0gYml0cy5qb2luKCcnKTtcblxuICAgICAgLy8gVW5wYWNrIHNpZ24sIGV4cG9uZW50LCBmcmFjdGlvblxuICAgICAgYmlhcyA9ICgxIDw8IChlYml0cyAtIDEpKSAtIDE7XG4gICAgICBzID0gcGFyc2VJbnQoc3RyLnNsaWNlKDAsIDEpLCAyKSA/IC0xIDogMTtcbiAgICAgIGUgPSBwYXJzZUludChzdHIuc2xpY2UoMSwgMSArIGViaXRzKSwgMik7XG4gICAgICBmID0gcGFyc2VJbnQoc3RyLnNsaWNlKDEgKyBlYml0cyksIDIpO1xuXG4gICAgICAvLyBQcm9kdWNlIG51bWJlclxuICAgICAgaWYgKGUgPT09ICgxIDw8IGViaXRzKSAtIDEpIHtcbiAgICAgICAgcmV0dXJuIGYgIT09IDAgPyBOYU4gOiBzICogSW5maW5pdHk7XG4gICAgICB9IGVsc2UgaWYgKGUgPiAwKSB7XG4gICAgICAgIC8vIE5vcm1hbGl6ZWRcbiAgICAgICAgcmV0dXJuIHMgKiBNYXRoLnBvdygyLCBlIC0gYmlhcykgKiAoMSArIGYgLyBNYXRoLnBvdygyLCBmYml0cykpO1xuICAgICAgfSBlbHNlIGlmIChmICE9PSAwKSB7XG4gICAgICAgIC8vIERlbm9ybWFsaXplZFxuICAgICAgICByZXR1cm4gcyAqIE1hdGgucG93KDIsIC0oYmlhcyAtIDEpKSAqIChmIC8gTWF0aC5wb3coMiwgZmJpdHMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzIDwgMCA/IC0wIDogMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1bnBhY2tGbG9hdDY0KGIpIHsgcmV0dXJuIHVucGFja0lFRUU3NTQoYiwgMTEsIDUyKTsgfVxuICAgIGZ1bmN0aW9uIHBhY2tGbG9hdDY0KHYpIHsgcmV0dXJuIHBhY2tJRUVFNzU0KHYsIDExLCA1Mik7IH1cbiAgICBmdW5jdGlvbiB1bnBhY2tGbG9hdDMyKGIpIHsgcmV0dXJuIHVucGFja0lFRUU3NTQoYiwgOCwgMjMpOyB9XG4gICAgZnVuY3Rpb24gcGFja0Zsb2F0MzIodikgeyByZXR1cm4gcGFja0lFRUU3NTQodiwgOCwgMjMpOyB9XG5cbiAgICB2YXIgY29udmVyc2lvbnMgPSB7XG4gICAgICB0b0Zsb2F0MzI6IGZ1bmN0aW9uIChudW0pIHsgcmV0dXJuIHVucGFja0Zsb2F0MzIocGFja0Zsb2F0MzIobnVtKSk7IH1cbiAgICB9O1xuICAgIGlmICh0eXBlb2YgRmxvYXQzMkFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdmFyIGZsb2F0MzJhcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoMSk7XG4gICAgICBjb252ZXJzaW9ucy50b0Zsb2F0MzIgPSBmdW5jdGlvbiAobnVtKSB7XG4gICAgICAgIGZsb2F0MzJhcnJheVswXSA9IG51bTtcbiAgICAgICAgcmV0dXJuIGZsb2F0MzJhcnJheVswXTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBjb252ZXJzaW9ucztcbiAgfSgpKTtcblxuICBkZWZpbmVQcm9wZXJ0aWVzKFN0cmluZywge1xuICAgIGZyb21Db2RlUG9pbnQ6IGZ1bmN0aW9uIGZyb21Db2RlUG9pbnQoXykgeyAvLyBsZW5ndGggPSAxXG4gICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICB2YXIgbmV4dDtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbmV4dCA9IE51bWJlcihhcmd1bWVudHNbaV0pO1xuICAgICAgICBpZiAoIUVTLlNhbWVWYWx1ZShuZXh0LCBFUy5Ub0ludGVnZXIobmV4dCkpIHx8IG5leHQgPCAwIHx8IG5leHQgPiAweDEwRkZGRikge1xuICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQgJyArIG5leHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5leHQgPCAweDEwMDAwKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZShuZXh0KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV4dCAtPSAweDEwMDAwO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoKG5leHQgPj4gMTApICsgMHhEODAwKSk7XG4gICAgICAgICAgcmVzdWx0LnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZSgobmV4dCAlIDB4NDAwKSArIDB4REMwMCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0LmpvaW4oJycpO1xuICAgIH0sXG5cbiAgICByYXc6IGZ1bmN0aW9uIHJhdyhjYWxsU2l0ZSkgeyAvLyByYXcubGVuZ3RoPT09MVxuICAgICAgdmFyIGNvb2tlZCA9IEVTLlRvT2JqZWN0KGNhbGxTaXRlLCAnYmFkIGNhbGxTaXRlJyk7XG4gICAgICB2YXIgcmF3VmFsdWUgPSBjb29rZWQucmF3O1xuICAgICAgdmFyIHJhd1N0cmluZyA9IEVTLlRvT2JqZWN0KHJhd1ZhbHVlLCAnYmFkIHJhdyB2YWx1ZScpO1xuICAgICAgdmFyIGxlbiA9IHJhd1N0cmluZy5sZW5ndGg7XG4gICAgICB2YXIgbGl0ZXJhbHNlZ21lbnRzID0gRVMuVG9MZW5ndGgobGVuKTtcbiAgICAgIGlmIChsaXRlcmFsc2VnbWVudHMgPD0gMCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIHZhciBzdHJpbmdFbGVtZW50cyA9IFtdO1xuICAgICAgdmFyIG5leHRJbmRleCA9IDA7XG4gICAgICB2YXIgbmV4dEtleSwgbmV4dCwgbmV4dFNlZywgbmV4dFN1YjtcbiAgICAgIHdoaWxlIChuZXh0SW5kZXggPCBsaXRlcmFsc2VnbWVudHMpIHtcbiAgICAgICAgbmV4dEtleSA9IFN0cmluZyhuZXh0SW5kZXgpO1xuICAgICAgICBuZXh0ID0gcmF3U3RyaW5nW25leHRLZXldO1xuICAgICAgICBuZXh0U2VnID0gU3RyaW5nKG5leHQpO1xuICAgICAgICBzdHJpbmdFbGVtZW50cy5wdXNoKG5leHRTZWcpO1xuICAgICAgICBpZiAobmV4dEluZGV4ICsgMSA+PSBsaXRlcmFsc2VnbWVudHMpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBuZXh0ID0gbmV4dEluZGV4ICsgMSA8IGFyZ3VtZW50cy5sZW5ndGggPyBhcmd1bWVudHNbbmV4dEluZGV4ICsgMV0gOiAnJztcbiAgICAgICAgbmV4dFN1YiA9IFN0cmluZyhuZXh0KTtcbiAgICAgICAgc3RyaW5nRWxlbWVudHMucHVzaChuZXh0U3ViKTtcbiAgICAgICAgbmV4dEluZGV4Kys7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RyaW5nRWxlbWVudHMuam9pbignJyk7XG4gICAgfVxuICB9KTtcblxuICAvLyBGaXJlZm94IDMxIHJlcG9ydHMgdGhpcyBmdW5jdGlvbidzIGxlbmd0aCBhcyAwXG4gIC8vIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTEwNjI0ODRcbiAgaWYgKFN0cmluZy5mcm9tQ29kZVBvaW50Lmxlbmd0aCAhPT0gMSkge1xuICAgIHZhciBvcmlnaW5hbEZyb21Db2RlUG9pbnQgPSBTdHJpbmcuZnJvbUNvZGVQb2ludDtcbiAgICBkZWZpbmVQcm9wZXJ0eShTdHJpbmcsICdmcm9tQ29kZVBvaW50JywgZnVuY3Rpb24gKF8pIHsgcmV0dXJuIG9yaWdpbmFsRnJvbUNvZGVQb2ludC5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9LCB0cnVlKTtcbiAgfVxuXG4gIHZhciBTdHJpbmdTaGltcyA9IHtcbiAgICAvLyBGYXN0IHJlcGVhdCwgdXNlcyB0aGUgYEV4cG9uZW50aWF0aW9uIGJ5IHNxdWFyaW5nYCBhbGdvcml0aG0uXG4gICAgLy8gUGVyZjogaHR0cDovL2pzcGVyZi5jb20vc3RyaW5nLXJlcGVhdDIvMlxuICAgIHJlcGVhdDogKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciByZXBlYXQgPSBmdW5jdGlvbiAocywgdGltZXMpIHtcbiAgICAgICAgaWYgKHRpbWVzIDwgMSkgeyByZXR1cm4gJyc7IH1cbiAgICAgICAgaWYgKHRpbWVzICUgMikgeyByZXR1cm4gcmVwZWF0KHMsIHRpbWVzIC0gMSkgKyBzOyB9XG4gICAgICAgIHZhciBoYWxmID0gcmVwZWF0KHMsIHRpbWVzIC8gMik7XG4gICAgICAgIHJldHVybiBoYWxmICsgaGFsZjtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbiAodGltZXMpIHtcbiAgICAgICAgdmFyIHRoaXNTdHIgPSBTdHJpbmcoRVMuQ2hlY2tPYmplY3RDb2VyY2libGUodGhpcykpO1xuICAgICAgICB0aW1lcyA9IEVTLlRvSW50ZWdlcih0aW1lcyk7XG4gICAgICAgIGlmICh0aW1lcyA8IDAgfHwgdGltZXMgPT09IEluZmluaXR5KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgU3RyaW5nI3JlcGVhdCB2YWx1ZScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXBlYXQodGhpc1N0ciwgdGltZXMpO1xuICAgICAgfTtcbiAgICB9KSgpLFxuXG4gICAgc3RhcnRzV2l0aDogZnVuY3Rpb24gKHNlYXJjaFN0cikge1xuICAgICAgdmFyIHRoaXNTdHIgPSBTdHJpbmcoRVMuQ2hlY2tPYmplY3RDb2VyY2libGUodGhpcykpO1xuICAgICAgaWYgKF90b1N0cmluZy5jYWxsKHNlYXJjaFN0cikgPT09ICdbb2JqZWN0IFJlZ0V4cF0nKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIG1ldGhvZCBcInN0YXJ0c1dpdGhcIiB3aXRoIGEgcmVnZXgnKTtcbiAgICAgIH1cbiAgICAgIHNlYXJjaFN0ciA9IFN0cmluZyhzZWFyY2hTdHIpO1xuICAgICAgdmFyIHN0YXJ0QXJnID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB2b2lkIDA7XG4gICAgICB2YXIgc3RhcnQgPSBNYXRoLm1heChFUy5Ub0ludGVnZXIoc3RhcnRBcmcpLCAwKTtcbiAgICAgIHJldHVybiB0aGlzU3RyLnNsaWNlKHN0YXJ0LCBzdGFydCArIHNlYXJjaFN0ci5sZW5ndGgpID09PSBzZWFyY2hTdHI7XG4gICAgfSxcblxuICAgIGVuZHNXaXRoOiBmdW5jdGlvbiAoc2VhcmNoU3RyKSB7XG4gICAgICB2YXIgdGhpc1N0ciA9IFN0cmluZyhFUy5DaGVja09iamVjdENvZXJjaWJsZSh0aGlzKSk7XG4gICAgICBpZiAoX3RvU3RyaW5nLmNhbGwoc2VhcmNoU3RyKSA9PT0gJ1tvYmplY3QgUmVnRXhwXScpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgbWV0aG9kIFwiZW5kc1dpdGhcIiB3aXRoIGEgcmVnZXgnKTtcbiAgICAgIH1cbiAgICAgIHNlYXJjaFN0ciA9IFN0cmluZyhzZWFyY2hTdHIpO1xuICAgICAgdmFyIHRoaXNMZW4gPSB0aGlzU3RyLmxlbmd0aDtcbiAgICAgIHZhciBwb3NBcmcgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHZvaWQgMDtcbiAgICAgIHZhciBwb3MgPSB0eXBlb2YgcG9zQXJnID09PSAndW5kZWZpbmVkJyA/IHRoaXNMZW4gOiBFUy5Ub0ludGVnZXIocG9zQXJnKTtcbiAgICAgIHZhciBlbmQgPSBNYXRoLm1pbihNYXRoLm1heChwb3MsIDApLCB0aGlzTGVuKTtcbiAgICAgIHJldHVybiB0aGlzU3RyLnNsaWNlKGVuZCAtIHNlYXJjaFN0ci5sZW5ndGgsIGVuZCkgPT09IHNlYXJjaFN0cjtcbiAgICB9LFxuXG4gICAgaW5jbHVkZXM6IGZ1bmN0aW9uIGluY2x1ZGVzKHNlYXJjaFN0cmluZykge1xuICAgICAgdmFyIHBvc2l0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB2b2lkIDA7XG4gICAgICAvLyBTb21laG93IHRoaXMgdHJpY2sgbWFrZXMgbWV0aG9kIDEwMCUgY29tcGF0IHdpdGggdGhlIHNwZWMuXG4gICAgICByZXR1cm4gX2luZGV4T2YuY2FsbCh0aGlzLCBzZWFyY2hTdHJpbmcsIHBvc2l0aW9uKSAhPT0gLTE7XG4gICAgfSxcblxuICAgIGNvZGVQb2ludEF0OiBmdW5jdGlvbiAocG9zKSB7XG4gICAgICB2YXIgdGhpc1N0ciA9IFN0cmluZyhFUy5DaGVja09iamVjdENvZXJjaWJsZSh0aGlzKSk7XG4gICAgICB2YXIgcG9zaXRpb24gPSBFUy5Ub0ludGVnZXIocG9zKTtcbiAgICAgIHZhciBsZW5ndGggPSB0aGlzU3RyLmxlbmd0aDtcbiAgICAgIGlmIChwb3NpdGlvbiA8IDAgfHwgcG9zaXRpb24gPj0gbGVuZ3RoKSB7IHJldHVybjsgfVxuICAgICAgdmFyIGZpcnN0ID0gdGhpc1N0ci5jaGFyQ29kZUF0KHBvc2l0aW9uKTtcbiAgICAgIHZhciBpc0VuZCA9IChwb3NpdGlvbiArIDEgPT09IGxlbmd0aCk7XG4gICAgICBpZiAoZmlyc3QgPCAweEQ4MDAgfHwgZmlyc3QgPiAweERCRkYgfHwgaXNFbmQpIHsgcmV0dXJuIGZpcnN0OyB9XG4gICAgICB2YXIgc2Vjb25kID0gdGhpc1N0ci5jaGFyQ29kZUF0KHBvc2l0aW9uICsgMSk7XG4gICAgICBpZiAoc2Vjb25kIDwgMHhEQzAwIHx8IHNlY29uZCA+IDB4REZGRikgeyByZXR1cm4gZmlyc3Q7IH1cbiAgICAgIHJldHVybiAoKGZpcnN0IC0gMHhEODAwKSAqIDEwMjQpICsgKHNlY29uZCAtIDB4REMwMCkgKyAweDEwMDAwO1xuICAgIH1cbiAgfTtcbiAgZGVmaW5lUHJvcGVydGllcyhTdHJpbmcucHJvdG90eXBlLCBTdHJpbmdTaGltcyk7XG5cbiAgdmFyIGhhc1N0cmluZ1RyaW1CdWcgPSAnXFx1MDA4NScudHJpbSgpLmxlbmd0aCAhPT0gMTtcbiAgaWYgKGhhc1N0cmluZ1RyaW1CdWcpIHtcbiAgICB2YXIgb3JpZ2luYWxTdHJpbmdUcmltID0gU3RyaW5nLnByb3RvdHlwZS50cmltO1xuICAgIGRlbGV0ZSBTdHJpbmcucHJvdG90eXBlLnRyaW07XG4gICAgLy8gd2hpdGVzcGFjZSBmcm9tOiBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjUuNC4yMFxuICAgIC8vIGltcGxlbWVudGF0aW9uIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2VzLXNoaW1zL2VzNS1zaGltL2Jsb2IvdjMuNC4wL2VzNS1zaGltLmpzI0wxMzA0LUwxMzI0XG4gICAgdmFyIHdzID0gW1xuICAgICAgJ1xceDA5XFx4MEFcXHgwQlxceDBDXFx4MERcXHgyMFxceEEwXFx1MTY4MFxcdTE4MEVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzJyxcbiAgICAgICdcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBBXFx1MjAyRlxcdTIwNUZcXHUzMDAwXFx1MjAyOCcsXG4gICAgICAnXFx1MjAyOVxcdUZFRkYnXG4gICAgXS5qb2luKCcnKTtcbiAgICB2YXIgdHJpbVJlZ2V4cCA9IG5ldyBSZWdFeHAoJyheWycgKyB3cyArICddKyl8KFsnICsgd3MgKyAnXSskKScsICdnJyk7XG4gICAgZGVmaW5lUHJvcGVydGllcyhTdHJpbmcucHJvdG90eXBlLCB7XG4gICAgICB0cmltOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcyA9PT0gJ3VuZGVmaW5lZCcgfHwgdGhpcyA9PT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJjYW4ndCBjb252ZXJ0IFwiICsgdGhpcyArICcgdG8gb2JqZWN0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFN0cmluZyh0aGlzKS5yZXBsYWNlKHRyaW1SZWdleHAsICcnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIHNlZSBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtc3RyaW5nLnByb3RvdHlwZS1AQGl0ZXJhdG9yXG4gIHZhciBTdHJpbmdJdGVyYXRvciA9IGZ1bmN0aW9uIChzKSB7XG4gICAgdGhpcy5fcyA9IFN0cmluZyhFUy5DaGVja09iamVjdENvZXJjaWJsZShzKSk7XG4gICAgdGhpcy5faSA9IDA7XG4gIH07XG4gIFN0cmluZ0l0ZXJhdG9yLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzID0gdGhpcy5fcywgaSA9IHRoaXMuX2k7XG4gICAgaWYgKHR5cGVvZiBzID09PSAndW5kZWZpbmVkJyB8fCBpID49IHMubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9zID0gdm9pZCAwO1xuICAgICAgcmV0dXJuIHsgdmFsdWU6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgIH1cbiAgICB2YXIgZmlyc3QgPSBzLmNoYXJDb2RlQXQoaSksIHNlY29uZCwgbGVuO1xuICAgIGlmIChmaXJzdCA8IDB4RDgwMCB8fCBmaXJzdCA+IDB4REJGRiB8fCAoaSArIDEpID09IHMubGVuZ3RoKSB7XG4gICAgICBsZW4gPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWNvbmQgPSBzLmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgbGVuID0gKHNlY29uZCA8IDB4REMwMCB8fCBzZWNvbmQgPiAweERGRkYpID8gMSA6IDI7XG4gICAgfVxuICAgIHRoaXMuX2kgPSBpICsgbGVuO1xuICAgIHJldHVybiB7IHZhbHVlOiBzLnN1YnN0cihpLCBsZW4pLCBkb25lOiBmYWxzZSB9O1xuICB9O1xuICBhZGRJdGVyYXRvcihTdHJpbmdJdGVyYXRvci5wcm90b3R5cGUpO1xuICBhZGRJdGVyYXRvcihTdHJpbmcucHJvdG90eXBlLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIG5ldyBTdHJpbmdJdGVyYXRvcih0aGlzKTtcbiAgfSk7XG5cbiAgaWYgKCFzdGFydHNXaXRoSXNDb21wbGlhbnQpIHtcbiAgICAvLyBGaXJlZm94IGhhcyBhIG5vbmNvbXBsaWFudCBzdGFydHNXaXRoIGltcGxlbWVudGF0aW9uXG4gICAgU3RyaW5nLnByb3RvdHlwZS5zdGFydHNXaXRoID0gU3RyaW5nU2hpbXMuc3RhcnRzV2l0aDtcbiAgICBTdHJpbmcucHJvdG90eXBlLmVuZHNXaXRoID0gU3RyaW5nU2hpbXMuZW5kc1dpdGg7XG4gIH1cblxuICB2YXIgQXJyYXlTaGltcyA9IHtcbiAgICBmcm9tOiBmdW5jdGlvbiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBtYXBGbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdm9pZCAwO1xuXG4gICAgICB2YXIgbGlzdCA9IEVTLlRvT2JqZWN0KGl0ZXJhYmxlLCAnYmFkIGl0ZXJhYmxlJyk7XG4gICAgICBpZiAodHlwZW9mIG1hcEZuICE9PSAndW5kZWZpbmVkJyAmJiAhRVMuSXNDYWxsYWJsZShtYXBGbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJyYXkuZnJvbTogd2hlbiBwcm92aWRlZCwgdGhlIHNlY29uZCBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGhhc1RoaXNBcmcgPSBhcmd1bWVudHMubGVuZ3RoID4gMjtcbiAgICAgIHZhciB0aGlzQXJnID0gaGFzVGhpc0FyZyA/IGFyZ3VtZW50c1syXSA6IHZvaWQgMDtcblxuICAgICAgdmFyIHVzaW5nSXRlcmF0b3IgPSBFUy5Jc0l0ZXJhYmxlKGxpc3QpO1xuICAgICAgLy8gZG9lcyB0aGUgc3BlYyByZWFsbHkgbWVhbiB0aGF0IEFycmF5cyBzaG91bGQgdXNlIEFycmF5SXRlcmF0b3I/XG4gICAgICAvLyBodHRwczovL2J1Z3MuZWNtYXNjcmlwdC5vcmcvc2hvd19idWcuY2dpP2lkPTI0MTZcbiAgICAgIC8vaWYgKEFycmF5LmlzQXJyYXkobGlzdCkpIHsgdXNpbmdJdGVyYXRvcj1mYWxzZTsgfVxuXG4gICAgICB2YXIgbGVuZ3RoO1xuICAgICAgdmFyIHJlc3VsdCwgaSwgdmFsdWU7XG4gICAgICBpZiAodXNpbmdJdGVyYXRvcikge1xuICAgICAgICBpID0gMDtcbiAgICAgICAgcmVzdWx0ID0gRVMuSXNDYWxsYWJsZSh0aGlzKSA/IE9iamVjdChuZXcgdGhpcygpKSA6IFtdO1xuICAgICAgICB2YXIgaXQgPSB1c2luZ0l0ZXJhdG9yID8gRVMuR2V0SXRlcmF0b3IobGlzdCkgOiBudWxsO1xuICAgICAgICB2YXIgaXRlcmF0aW9uVmFsdWU7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgIGl0ZXJhdGlvblZhbHVlID0gRVMuSXRlcmF0b3JOZXh0KGl0KTtcbiAgICAgICAgICBpZiAoIWl0ZXJhdGlvblZhbHVlLmRvbmUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gaXRlcmF0aW9uVmFsdWUudmFsdWU7XG4gICAgICAgICAgICBpZiAobWFwRm4pIHtcbiAgICAgICAgICAgICAgcmVzdWx0W2ldID0gaGFzVGhpc0FyZyA/IG1hcEZuLmNhbGwodGhpc0FyZywgdmFsdWUsIGkpIDogbWFwRm4odmFsdWUsIGkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzdWx0W2ldID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9IHdoaWxlICghaXRlcmF0aW9uVmFsdWUuZG9uZSk7XG4gICAgICAgIGxlbmd0aCA9IGk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZW5ndGggPSBFUy5Ub0xlbmd0aChsaXN0Lmxlbmd0aCk7XG4gICAgICAgIHJlc3VsdCA9IEVTLklzQ2FsbGFibGUodGhpcykgPyBPYmplY3QobmV3IHRoaXMobGVuZ3RoKSkgOiBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgdmFsdWUgPSBsaXN0W2ldO1xuICAgICAgICAgIGlmIChtYXBGbikge1xuICAgICAgICAgICAgcmVzdWx0W2ldID0gaGFzVGhpc0FyZyA/IG1hcEZuLmNhbGwodGhpc0FyZywgdmFsdWUsIGkpIDogbWFwRm4odmFsdWUsIGkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHRbaV0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVzdWx0Lmxlbmd0aCA9IGxlbmd0aDtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIG9mOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbShhcmd1bWVudHMpO1xuICAgIH1cbiAgfTtcbiAgZGVmaW5lUHJvcGVydGllcyhBcnJheSwgQXJyYXlTaGltcyk7XG5cbiAgdmFyIGFycmF5RnJvbVN3YWxsb3dzTmVnYXRpdmVMZW5ndGhzID0gZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbSh7IGxlbmd0aDogLTEgfSkubGVuZ3RoID09PSAwO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG4gIC8vIEZpeGVzIGEgRmlyZWZveCBidWcgaW4gdjMyXG4gIC8vIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTEwNjM5OTNcbiAgaWYgKCFhcnJheUZyb21Td2FsbG93c05lZ2F0aXZlTGVuZ3RocygpKSB7XG4gICAgZGVmaW5lUHJvcGVydHkoQXJyYXksICdmcm9tJywgQXJyYXlTaGltcy5mcm9tLCB0cnVlKTtcbiAgfVxuXG4gIC8vIE91ciBBcnJheUl0ZXJhdG9yIGlzIHByaXZhdGU7IHNlZVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGF1bG1pbGxyL2VzNi1zaGltL2lzc3Vlcy8yNTJcbiAgQXJyYXlJdGVyYXRvciA9IGZ1bmN0aW9uIChhcnJheSwga2luZCkge1xuICAgICAgdGhpcy5pID0gMDtcbiAgICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbiAgICAgIHRoaXMua2luZCA9IGtpbmQ7XG4gIH07XG5cbiAgZGVmaW5lUHJvcGVydGllcyhBcnJheUl0ZXJhdG9yLnByb3RvdHlwZSwge1xuICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpID0gdGhpcy5pLCBhcnJheSA9IHRoaXMuYXJyYXk7XG4gICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQXJyYXlJdGVyYXRvcikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTm90IGFuIEFycmF5SXRlcmF0b3InKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgYXJyYXkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhciBsZW4gPSBFUy5Ub0xlbmd0aChhcnJheS5sZW5ndGgpO1xuICAgICAgICBmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgdmFyIGtpbmQgPSB0aGlzLmtpbmQ7XG4gICAgICAgICAgdmFyIHJldHZhbDtcbiAgICAgICAgICBpZiAoa2luZCA9PT0gJ2tleScpIHtcbiAgICAgICAgICAgIHJldHZhbCA9IGk7XG4gICAgICAgICAgfSBlbHNlIGlmIChraW5kID09PSAndmFsdWUnKSB7XG4gICAgICAgICAgICByZXR2YWwgPSBhcnJheVtpXTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtpbmQgPT09ICdlbnRyeScpIHtcbiAgICAgICAgICAgIHJldHZhbCA9IFtpLCBhcnJheVtpXV07XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuaSA9IGkgKyAxO1xuICAgICAgICAgIHJldHVybiB7IHZhbHVlOiByZXR2YWwsIGRvbmU6IGZhbHNlIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuYXJyYXkgPSB2b2lkIDA7XG4gICAgICByZXR1cm4geyB2YWx1ZTogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgfVxuICB9KTtcbiAgYWRkSXRlcmF0b3IoQXJyYXlJdGVyYXRvci5wcm90b3R5cGUpO1xuXG4gIHZhciBBcnJheVByb3RvdHlwZVNoaW1zID0ge1xuICAgIGNvcHlXaXRoaW46IGZ1bmN0aW9uICh0YXJnZXQsIHN0YXJ0KSB7XG4gICAgICB2YXIgZW5kID0gYXJndW1lbnRzWzJdOyAvLyBjb3B5V2l0aGluLmxlbmd0aCBtdXN0IGJlIDJcbiAgICAgIHZhciBvID0gRVMuVG9PYmplY3QodGhpcyk7XG4gICAgICB2YXIgbGVuID0gRVMuVG9MZW5ndGgoby5sZW5ndGgpO1xuICAgICAgdGFyZ2V0ID0gRVMuVG9JbnRlZ2VyKHRhcmdldCk7XG4gICAgICBzdGFydCA9IEVTLlRvSW50ZWdlcihzdGFydCk7XG4gICAgICB2YXIgdG8gPSB0YXJnZXQgPCAwID8gTWF0aC5tYXgobGVuICsgdGFyZ2V0LCAwKSA6IE1hdGgubWluKHRhcmdldCwgbGVuKTtcbiAgICAgIHZhciBmcm9tID0gc3RhcnQgPCAwID8gTWF0aC5tYXgobGVuICsgc3RhcnQsIDApIDogTWF0aC5taW4oc3RhcnQsIGxlbik7XG4gICAgICBlbmQgPSB0eXBlb2YgZW5kID09PSAndW5kZWZpbmVkJyA/IGxlbiA6IEVTLlRvSW50ZWdlcihlbmQpO1xuICAgICAgdmFyIGZpbiA9IGVuZCA8IDAgPyBNYXRoLm1heChsZW4gKyBlbmQsIDApIDogTWF0aC5taW4oZW5kLCBsZW4pO1xuICAgICAgdmFyIGNvdW50ID0gTWF0aC5taW4oZmluIC0gZnJvbSwgbGVuIC0gdG8pO1xuICAgICAgdmFyIGRpcmVjdGlvbiA9IDE7XG4gICAgICBpZiAoZnJvbSA8IHRvICYmIHRvIDwgKGZyb20gKyBjb3VudCkpIHtcbiAgICAgICAgZGlyZWN0aW9uID0gLTE7XG4gICAgICAgIGZyb20gKz0gY291bnQgLSAxO1xuICAgICAgICB0byArPSBjb3VudCAtIDE7XG4gICAgICB9XG4gICAgICB3aGlsZSAoY291bnQgPiAwKSB7XG4gICAgICAgIGlmIChfaGFzT3duUHJvcGVydHkuY2FsbChvLCBmcm9tKSkge1xuICAgICAgICAgIG9bdG9dID0gb1tmcm9tXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgb1tmcm9tXTtcbiAgICAgICAgfVxuICAgICAgICBmcm9tICs9IGRpcmVjdGlvbjtcbiAgICAgICAgdG8gKz0gZGlyZWN0aW9uO1xuICAgICAgICBjb3VudCAtPSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG87XG4gICAgfSxcblxuICAgIGZpbGw6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFyIHN0YXJ0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB2b2lkIDA7XG4gICAgICB2YXIgZW5kID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBhcmd1bWVudHNbMl0gOiB2b2lkIDA7XG4gICAgICB2YXIgTyA9IEVTLlRvT2JqZWN0KHRoaXMpO1xuICAgICAgdmFyIGxlbiA9IEVTLlRvTGVuZ3RoKE8ubGVuZ3RoKTtcbiAgICAgIHN0YXJ0ID0gRVMuVG9JbnRlZ2VyKHR5cGVvZiBzdGFydCA9PT0gJ3VuZGVmaW5lZCcgPyAwIDogc3RhcnQpO1xuICAgICAgZW5kID0gRVMuVG9JbnRlZ2VyKHR5cGVvZiBlbmQgPT09ICd1bmRlZmluZWQnID8gbGVuIDogZW5kKTtcblxuICAgICAgdmFyIHJlbGF0aXZlU3RhcnQgPSBzdGFydCA8IDAgPyBNYXRoLm1heChsZW4gKyBzdGFydCwgMCkgOiBNYXRoLm1pbihzdGFydCwgbGVuKTtcbiAgICAgIHZhciByZWxhdGl2ZUVuZCA9IGVuZCA8IDAgPyBsZW4gKyBlbmQgOiBlbmQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSByZWxhdGl2ZVN0YXJ0OyBpIDwgbGVuICYmIGkgPCByZWxhdGl2ZUVuZDsgKytpKSB7XG4gICAgICAgIE9baV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBPO1xuICAgIH0sXG5cbiAgICBmaW5kOiBmdW5jdGlvbiBmaW5kKHByZWRpY2F0ZSkge1xuICAgICAgdmFyIGxpc3QgPSBFUy5Ub09iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW5ndGggPSBFUy5Ub0xlbmd0aChsaXN0Lmxlbmd0aCk7XG4gICAgICBpZiAoIUVTLklzQ2FsbGFibGUocHJlZGljYXRlKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcnJheSNmaW5kOiBwcmVkaWNhdGUgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICB9XG4gICAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogbnVsbDtcbiAgICAgIGZvciAodmFyIGkgPSAwLCB2YWx1ZTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gbGlzdFtpXTtcbiAgICAgICAgaWYgKHRoaXNBcmcpIHtcbiAgICAgICAgICBpZiAocHJlZGljYXRlLmNhbGwodGhpc0FyZywgdmFsdWUsIGksIGxpc3QpKSB7IHJldHVybiB2YWx1ZTsgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIGksIGxpc3QpKSB7IHJldHVybiB2YWx1ZTsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfSxcblxuICAgIGZpbmRJbmRleDogZnVuY3Rpb24gZmluZEluZGV4KHByZWRpY2F0ZSkge1xuICAgICAgdmFyIGxpc3QgPSBFUy5Ub09iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW5ndGggPSBFUy5Ub0xlbmd0aChsaXN0Lmxlbmd0aCk7XG4gICAgICBpZiAoIUVTLklzQ2FsbGFibGUocHJlZGljYXRlKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcnJheSNmaW5kSW5kZXg6IHByZWRpY2F0ZSBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgIH1cbiAgICAgIHZhciB0aGlzQXJnID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiBudWxsO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodGhpc0FyZykge1xuICAgICAgICAgIGlmIChwcmVkaWNhdGUuY2FsbCh0aGlzQXJnLCBsaXN0W2ldLCBpLCBsaXN0KSkgeyByZXR1cm4gaTsgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChwcmVkaWNhdGUobGlzdFtpXSwgaSwgbGlzdCkpIHsgcmV0dXJuIGk7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH0sXG5cbiAgICBrZXlzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IEFycmF5SXRlcmF0b3IodGhpcywgJ2tleScpO1xuICAgIH0sXG5cbiAgICB2YWx1ZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcih0aGlzLCAndmFsdWUnKTtcbiAgICB9LFxuXG4gICAgZW50cmllczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBBcnJheUl0ZXJhdG9yKHRoaXMsICdlbnRyeScpO1xuICAgIH1cbiAgfTtcbiAgLy8gU2FmYXJpIDcuMSBkZWZpbmVzIEFycmF5I2tleXMgYW5kIEFycmF5I2VudHJpZXMgbmF0aXZlbHksXG4gIC8vIGJ1dCB0aGUgcmVzdWx0aW5nIEFycmF5SXRlcmF0b3Igb2JqZWN0cyBkb24ndCBoYXZlIGEgXCJuZXh0XCIgbWV0aG9kLlxuICBpZiAoQXJyYXkucHJvdG90eXBlLmtleXMgJiYgIUVTLklzQ2FsbGFibGUoWzFdLmtleXMoKS5uZXh0KSkge1xuICAgIGRlbGV0ZSBBcnJheS5wcm90b3R5cGUua2V5cztcbiAgfVxuICBpZiAoQXJyYXkucHJvdG90eXBlLmVudHJpZXMgJiYgIUVTLklzQ2FsbGFibGUoWzFdLmVudHJpZXMoKS5uZXh0KSkge1xuICAgIGRlbGV0ZSBBcnJheS5wcm90b3R5cGUuZW50cmllcztcbiAgfVxuXG4gIC8vIENocm9tZSAzOCBkZWZpbmVzIEFycmF5I2tleXMgYW5kIEFycmF5I2VudHJpZXMsIGFuZCBBcnJheSNAQGl0ZXJhdG9yLCBidXQgbm90IEFycmF5I3ZhbHVlc1xuICBpZiAoQXJyYXkucHJvdG90eXBlLmtleXMgJiYgQXJyYXkucHJvdG90eXBlLmVudHJpZXMgJiYgIUFycmF5LnByb3RvdHlwZS52YWx1ZXMgJiYgQXJyYXkucHJvdG90eXBlWyRpdGVyYXRvciRdKSB7XG4gICAgZGVmaW5lUHJvcGVydGllcyhBcnJheS5wcm90b3R5cGUsIHtcbiAgICAgIHZhbHVlczogQXJyYXkucHJvdG90eXBlWyRpdGVyYXRvciRdXG4gICAgfSk7XG4gIH1cbiAgZGVmaW5lUHJvcGVydGllcyhBcnJheS5wcm90b3R5cGUsIEFycmF5UHJvdG90eXBlU2hpbXMpO1xuXG4gIGFkZEl0ZXJhdG9yKEFycmF5LnByb3RvdHlwZSwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy52YWx1ZXMoKTsgfSk7XG4gIC8vIENocm9tZSBkZWZpbmVzIGtleXMvdmFsdWVzL2VudHJpZXMgb24gQXJyYXksIGJ1dCBkb2Vzbid0IGdpdmUgdXNcbiAgLy8gYW55IHdheSB0byBpZGVudGlmeSBpdHMgaXRlcmF0b3IuICBTbyBhZGQgb3VyIG93biBzaGltbWVkIGZpZWxkLlxuICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKSB7XG4gICAgYWRkSXRlcmF0b3IoT2JqZWN0LmdldFByb3RvdHlwZU9mKFtdLnZhbHVlcygpKSk7XG4gIH1cblxuICB2YXIgbWF4U2FmZUludGVnZXIgPSBNYXRoLnBvdygyLCA1MykgLSAxO1xuICBkZWZpbmVQcm9wZXJ0aWVzKE51bWJlciwge1xuICAgIE1BWF9TQUZFX0lOVEVHRVI6IG1heFNhZmVJbnRlZ2VyLFxuICAgIE1JTl9TQUZFX0lOVEVHRVI6IC1tYXhTYWZlSW50ZWdlcixcbiAgICBFUFNJTE9OOiAyLjIyMDQ0NjA0OTI1MDMxM2UtMTYsXG5cbiAgICBwYXJzZUludDogZ2xvYmFscy5wYXJzZUludCxcbiAgICBwYXJzZUZsb2F0OiBnbG9iYWxzLnBhcnNlRmxvYXQsXG5cbiAgICBpc0Zpbml0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBnbG9iYWxfaXNGaW5pdGUodmFsdWUpO1xuICAgIH0sXG5cbiAgICBpc0ludGVnZXI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgJiZcbiAgICAgICAgRVMuVG9JbnRlZ2VyKHZhbHVlKSA9PT0gdmFsdWU7XG4gICAgfSxcblxuICAgIGlzU2FmZUludGVnZXI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIE51bWJlci5pc0ludGVnZXIodmFsdWUpICYmIE1hdGguYWJzKHZhbHVlKSA8PSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICB9LFxuXG4gICAgaXNOYU46IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgLy8gTmFOICE9PSBOYU4sIGJ1dCB0aGV5IGFyZSBpZGVudGljYWwuXG4gICAgICAvLyBOYU5zIGFyZSB0aGUgb25seSBub24tcmVmbGV4aXZlIHZhbHVlLCBpLmUuLCBpZiB4ICE9PSB4LFxuICAgICAgLy8gdGhlbiB4IGlzIE5hTi5cbiAgICAgIC8vIGlzTmFOIGlzIGJyb2tlbjogaXQgY29udmVydHMgaXRzIGFyZ3VtZW50IHRvIG51bWJlciwgc29cbiAgICAgIC8vIGlzTmFOKCdmb28nKSA9PiB0cnVlXG4gICAgICByZXR1cm4gdmFsdWUgIT09IHZhbHVlO1xuICAgIH1cblxuICB9KTtcblxuICAvLyBXb3JrIGFyb3VuZCBidWdzIGluIEFycmF5I2ZpbmQgYW5kIEFycmF5I2ZpbmRJbmRleCAtLSBlYXJseVxuICAvLyBpbXBsZW1lbnRhdGlvbnMgc2tpcHBlZCBob2xlcyBpbiBzcGFyc2UgYXJyYXlzLiAoTm90ZSB0aGF0IHRoZVxuICAvLyBpbXBsZW1lbnRhdGlvbnMgb2YgZmluZC9maW5kSW5kZXggaW5kaXJlY3RseSB1c2Ugc2hpbW1lZFxuICAvLyBtZXRob2RzIG9mIE51bWJlciwgc28gdGhpcyB0ZXN0IGhhcyB0byBoYXBwZW4gZG93biBoZXJlLilcbiAgaWYgKCFbLCAxXS5maW5kKGZ1bmN0aW9uIChpdGVtLCBpZHgpIHsgcmV0dXJuIGlkeCA9PT0gMDsgfSkpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsICdmaW5kJywgQXJyYXlQcm90b3R5cGVTaGltcy5maW5kLCB0cnVlKTtcbiAgfVxuICBpZiAoWywgMV0uZmluZEluZGV4KGZ1bmN0aW9uIChpdGVtLCBpZHgpIHsgcmV0dXJuIGlkeCA9PT0gMDsgfSkgIT09IDApIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsICdmaW5kSW5kZXgnLCBBcnJheVByb3RvdHlwZVNoaW1zLmZpbmRJbmRleCwgdHJ1ZSk7XG4gIH1cblxuICBpZiAoc3VwcG9ydHNEZXNjcmlwdG9ycykge1xuICAgIGRlZmluZVByb3BlcnRpZXMoT2JqZWN0LCB7XG4gICAgICBnZXRQcm9wZXJ0eURlc2NyaXB0b3I6IGZ1bmN0aW9uIChzdWJqZWN0LCBuYW1lKSB7XG4gICAgICAgIHZhciBwZCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc3ViamVjdCwgbmFtZSk7XG4gICAgICAgIHZhciBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihzdWJqZWN0KTtcbiAgICAgICAgd2hpbGUgKHR5cGVvZiBwZCA9PT0gJ3VuZGVmaW5lZCcgJiYgcHJvdG8gIT09IG51bGwpIHtcbiAgICAgICAgICBwZCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocHJvdG8sIG5hbWUpO1xuICAgICAgICAgIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGQ7XG4gICAgICB9LFxuXG4gICAgICBnZXRQcm9wZXJ0eU5hbWVzOiBmdW5jdGlvbiAoc3ViamVjdCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoc3ViamVjdCk7XG4gICAgICAgIHZhciBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihzdWJqZWN0KTtcblxuICAgICAgICB2YXIgYWRkUHJvcGVydHkgPSBmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgICAgICAgICBpZiAocmVzdWx0LmluZGV4T2YocHJvcGVydHkpID09PSAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2gocHJvcGVydHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB3aGlsZSAocHJvdG8gIT09IG51bGwpIHtcbiAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwcm90bykuZm9yRWFjaChhZGRQcm9wZXJ0eSk7XG4gICAgICAgICAgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YocHJvdG8pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBkZWZpbmVQcm9wZXJ0aWVzKE9iamVjdCwge1xuICAgICAgLy8gMTkuMS4zLjFcbiAgICAgIGFzc2lnbjogZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG4gICAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KHRhcmdldCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd0YXJnZXQgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnJlZHVjZS5jYWxsKGFyZ3VtZW50cywgZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG4gICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKE9iamVjdChzb3VyY2UpKS5yZWR1Y2UoZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgICAgICB9LCB0YXJnZXQpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG5cbiAgICAgIGlzOiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gRVMuU2FtZVZhbHVlKGEsIGIpO1xuICAgICAgfSxcblxuICAgICAgLy8gMTkuMS4zLjlcbiAgICAgIC8vIHNoaW0gZnJvbSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9XZWJSZWZsZWN0aW9uLzU1OTM1NTRcbiAgICAgIHNldFByb3RvdHlwZU9mOiAoZnVuY3Rpb24gKE9iamVjdCwgbWFnaWMpIHtcbiAgICAgICAgdmFyIHNldDtcblxuICAgICAgICB2YXIgY2hlY2tBcmdzID0gZnVuY3Rpb24gKE8sIHByb3RvKSB7XG4gICAgICAgICAgaWYgKCFFUy5UeXBlSXNPYmplY3QoTykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2Nhbm5vdCBzZXQgcHJvdG90eXBlIG9uIGEgbm9uLW9iamVjdCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIShwcm90byA9PT0gbnVsbCB8fCBFUy5UeXBlSXNPYmplY3QocHJvdG8pKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2FuIG9ubHkgc2V0IHByb3RvdHlwZSB0byBhbiBvYmplY3Qgb3IgbnVsbCcgKyBwcm90byk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBzZXRQcm90b3R5cGVPZiA9IGZ1bmN0aW9uIChPLCBwcm90bykge1xuICAgICAgICAgIGNoZWNrQXJncyhPLCBwcm90byk7XG4gICAgICAgICAgc2V0LmNhbGwoTywgcHJvdG8pO1xuICAgICAgICAgIHJldHVybiBPO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gdGhpcyB3b3JrcyBhbHJlYWR5IGluIEZpcmVmb3ggYW5kIFNhZmFyaVxuICAgICAgICAgIHNldCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoT2JqZWN0LnByb3RvdHlwZSwgbWFnaWMpLnNldDtcbiAgICAgICAgICBzZXQuY2FsbCh7fSwgbnVsbCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZSAhPT0ge31bbWFnaWNdKSB7XG4gICAgICAgICAgICAvLyBJRSA8IDExIGNhbm5vdCBiZSBzaGltbWVkXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHByb2JhYmx5IENocm9tZSBvciBzb21lIG9sZCBNb2JpbGUgc3RvY2sgYnJvd3NlclxuICAgICAgICAgIHNldCA9IGZ1bmN0aW9uIChwcm90bykge1xuICAgICAgICAgICAgdGhpc1ttYWdpY10gPSBwcm90bztcbiAgICAgICAgICB9O1xuICAgICAgICAgIC8vIHBsZWFzZSBub3RlIHRoYXQgdGhpcyB3aWxsICoqbm90Kiogd29ya1xuICAgICAgICAgIC8vIGluIHRob3NlIGJyb3dzZXJzIHRoYXQgZG8gbm90IGluaGVyaXRcbiAgICAgICAgICAvLyBfX3Byb3RvX18gYnkgbWlzdGFrZSBmcm9tIE9iamVjdC5wcm90b3R5cGVcbiAgICAgICAgICAvLyBpbiB0aGVzZSBjYXNlcyB3ZSBzaG91bGQgcHJvYmFibHkgdGhyb3cgYW4gZXJyb3JcbiAgICAgICAgICAvLyBvciBhdCBsZWFzdCBiZSBpbmZvcm1lZCBhYm91dCB0aGUgaXNzdWVcbiAgICAgICAgICBzZXRQcm90b3R5cGVPZi5wb2x5ZmlsbCA9IHNldFByb3RvdHlwZU9mKFxuICAgICAgICAgICAgc2V0UHJvdG90eXBlT2Yoe30sIG51bGwpLFxuICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZVxuICAgICAgICAgICkgaW5zdGFuY2VvZiBPYmplY3Q7XG4gICAgICAgICAgLy8gc2V0UHJvdG90eXBlT2YucG9seWZpbGwgPT09IHRydWUgbWVhbnMgaXQgd29ya3MgYXMgbWVhbnRcbiAgICAgICAgICAvLyBzZXRQcm90b3R5cGVPZi5wb2x5ZmlsbCA9PT0gZmFsc2UgbWVhbnMgaXQncyBub3QgMTAwJSByZWxpYWJsZVxuICAgICAgICAgIC8vIHNldFByb3RvdHlwZU9mLnBvbHlmaWxsID09PSB1bmRlZmluZWRcbiAgICAgICAgICAvLyBvclxuICAgICAgICAgIC8vIHNldFByb3RvdHlwZU9mLnBvbHlmaWxsID09ICBudWxsIG1lYW5zIGl0J3Mgbm90IGEgcG9seWZpbGxcbiAgICAgICAgICAvLyB3aGljaCBtZWFucyBpdCB3b3JrcyBhcyBleHBlY3RlZFxuICAgICAgICAgIC8vIHdlIGNhbiBldmVuIGRlbGV0ZSBPYmplY3QucHJvdG90eXBlLl9fcHJvdG9fXztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2V0UHJvdG90eXBlT2Y7XG4gICAgICB9KShPYmplY3QsICdfX3Byb3RvX18nKVxuICAgIH0pO1xuICB9XG5cbiAgLy8gV29ya2Fyb3VuZCBidWcgaW4gT3BlcmEgMTIgd2hlcmUgc2V0UHJvdG90eXBlT2YoeCwgbnVsbCkgZG9lc24ndCB3b3JrLFxuICAvLyBidXQgT2JqZWN0LmNyZWF0ZShudWxsKSBkb2VzLlxuICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZiAmJlxuICAgICAgT2JqZWN0LmdldFByb3RvdHlwZU9mKE9iamVjdC5zZXRQcm90b3R5cGVPZih7fSwgbnVsbCkpICE9PSBudWxsICYmXG4gICAgICBPYmplY3QuZ2V0UHJvdG90eXBlT2YoT2JqZWN0LmNyZWF0ZShudWxsKSkgPT09IG51bGwpIHtcbiAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIEZBS0VOVUxMID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgIHZhciBncG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YsIHNwbyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZjtcbiAgICAgIE9iamVjdC5nZXRQcm90b3R5cGVPZiA9IGZ1bmN0aW9uIChvKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBncG8obyk7XG4gICAgICAgIHJldHVybiByZXN1bHQgPT09IEZBS0VOVUxMID8gbnVsbCA6IHJlc3VsdDtcbiAgICAgIH07XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YgPSBmdW5jdGlvbiAobywgcCkge1xuICAgICAgICBpZiAocCA9PT0gbnVsbCkgeyBwID0gRkFLRU5VTEw7IH1cbiAgICAgICAgcmV0dXJuIHNwbyhvLCBwKTtcbiAgICAgIH07XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YucG9seWZpbGwgPSBmYWxzZTtcbiAgICB9KSgpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBPYmplY3Qua2V5cygnZm9vJyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB2YXIgb3JpZ2luYWxPYmplY3RLZXlzID0gT2JqZWN0LmtleXM7XG4gICAgT2JqZWN0LmtleXMgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICByZXR1cm4gb3JpZ2luYWxPYmplY3RLZXlzKEVTLlRvT2JqZWN0KG9iaikpO1xuICAgIH07XG4gIH1cblxuICB2YXIgTWF0aFNoaW1zID0ge1xuICAgIGFjb3NoOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgIGlmIChOdW1iZXIuaXNOYU4odmFsdWUpIHx8IHZhbHVlIDwgMSkgeyByZXR1cm4gTmFOOyB9XG4gICAgICBpZiAodmFsdWUgPT09IDEpIHsgcmV0dXJuIDA7IH1cbiAgICAgIGlmICh2YWx1ZSA9PT0gSW5maW5pdHkpIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgICByZXR1cm4gTWF0aC5sb2codmFsdWUgKyBNYXRoLnNxcnQodmFsdWUgKiB2YWx1ZSAtIDEpKTtcbiAgICB9LFxuXG4gICAgYXNpbmg6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgaWYgKHZhbHVlID09PSAwIHx8ICFnbG9iYWxfaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZSA8IDAgPyAtTWF0aC5hc2luaCgtdmFsdWUpIDogTWF0aC5sb2codmFsdWUgKyBNYXRoLnNxcnQodmFsdWUgKiB2YWx1ZSArIDEpKTtcbiAgICB9LFxuXG4gICAgYXRhbmg6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgaWYgKE51bWJlci5pc05hTih2YWx1ZSkgfHwgdmFsdWUgPCAtMSB8fCB2YWx1ZSA+IDEpIHtcbiAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgIH1cbiAgICAgIGlmICh2YWx1ZSA9PT0gLTEpIHsgcmV0dXJuIC1JbmZpbml0eTsgfVxuICAgICAgaWYgKHZhbHVlID09PSAxKSB7IHJldHVybiBJbmZpbml0eTsgfVxuICAgICAgaWYgKHZhbHVlID09PSAwKSB7IHJldHVybiB2YWx1ZTsgfVxuICAgICAgcmV0dXJuIDAuNSAqIE1hdGgubG9nKCgxICsgdmFsdWUpIC8gKDEgLSB2YWx1ZSkpO1xuICAgIH0sXG5cbiAgICBjYnJ0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gMCkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICAgIHZhciBuZWdhdGUgPSB2YWx1ZSA8IDAsIHJlc3VsdDtcbiAgICAgIGlmIChuZWdhdGUpIHsgdmFsdWUgPSAtdmFsdWU7IH1cbiAgICAgIHJlc3VsdCA9IE1hdGgucG93KHZhbHVlLCAxIC8gMyk7XG4gICAgICByZXR1cm4gbmVnYXRlID8gLXJlc3VsdCA6IHJlc3VsdDtcbiAgICB9LFxuXG4gICAgY2x6MzI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgLy8gU2VlIGh0dHBzOi8vYnVncy5lY21hc2NyaXB0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjQ2NVxuICAgICAgdmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgdmFyIG51bWJlciA9IEVTLlRvVWludDMyKHZhbHVlKTtcbiAgICAgIGlmIChudW1iZXIgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDMyO1xuICAgICAgfVxuICAgICAgcmV0dXJuIDMyIC0gKG51bWJlcikudG9TdHJpbmcoMikubGVuZ3RoO1xuICAgIH0sXG5cbiAgICBjb3NoOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gMCkgeyByZXR1cm4gMTsgfSAvLyArMCBvciAtMFxuICAgICAgaWYgKE51bWJlci5pc05hTih2YWx1ZSkpIHsgcmV0dXJuIE5hTjsgfVxuICAgICAgaWYgKCFnbG9iYWxfaXNGaW5pdGUodmFsdWUpKSB7IHJldHVybiBJbmZpbml0eTsgfVxuICAgICAgaWYgKHZhbHVlIDwgMCkgeyB2YWx1ZSA9IC12YWx1ZTsgfVxuICAgICAgaWYgKHZhbHVlID4gMjEpIHsgcmV0dXJuIE1hdGguZXhwKHZhbHVlKSAvIDI7IH1cbiAgICAgIHJldHVybiAoTWF0aC5leHAodmFsdWUpICsgTWF0aC5leHAoLXZhbHVlKSkgLyAyO1xuICAgIH0sXG5cbiAgICBleHBtMTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgPT09IC1JbmZpbml0eSkgeyByZXR1cm4gLTE7IH1cbiAgICAgIGlmICghZ2xvYmFsX2lzRmluaXRlKHZhbHVlKSB8fCB2YWx1ZSA9PT0gMCkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICAgIHJldHVybiBNYXRoLmV4cCh2YWx1ZSkgLSAxO1xuICAgIH0sXG5cbiAgICBoeXBvdDogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgIHZhciBhbnlOYU4gPSBmYWxzZTtcbiAgICAgIHZhciBhbGxaZXJvID0gdHJ1ZTtcbiAgICAgIHZhciBhbnlJbmZpbml0eSA9IGZhbHNlO1xuICAgICAgdmFyIG51bWJlcnMgPSBbXTtcbiAgICAgIEFycmF5LnByb3RvdHlwZS5ldmVyeS5jYWxsKGFyZ3VtZW50cywgZnVuY3Rpb24gKGFyZykge1xuICAgICAgICB2YXIgbnVtID0gTnVtYmVyKGFyZyk7XG4gICAgICAgIGlmIChOdW1iZXIuaXNOYU4obnVtKSkge1xuICAgICAgICAgIGFueU5hTiA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAobnVtID09PSBJbmZpbml0eSB8fCBudW0gPT09IC1JbmZpbml0eSkge1xuICAgICAgICAgIGFueUluZmluaXR5ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChudW0gIT09IDApIHtcbiAgICAgICAgICBhbGxaZXJvID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFueUluZmluaXR5KSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKCFhbnlOYU4pIHtcbiAgICAgICAgICBudW1iZXJzLnB1c2goTWF0aC5hYnMobnVtKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICAgIGlmIChhbnlJbmZpbml0eSkgeyByZXR1cm4gSW5maW5pdHk7IH1cbiAgICAgIGlmIChhbnlOYU4pIHsgcmV0dXJuIE5hTjsgfVxuICAgICAgaWYgKGFsbFplcm8pIHsgcmV0dXJuIDA7IH1cblxuICAgICAgbnVtYmVycy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBiIC0gYTsgfSk7XG4gICAgICB2YXIgbGFyZ2VzdCA9IG51bWJlcnNbMF07XG4gICAgICB2YXIgZGl2aWRlZCA9IG51bWJlcnMubWFwKGZ1bmN0aW9uIChudW1iZXIpIHsgcmV0dXJuIG51bWJlciAvIGxhcmdlc3Q7IH0pO1xuICAgICAgdmFyIHN1bSA9IGRpdmlkZWQucmVkdWNlKGZ1bmN0aW9uIChzdW0sIG51bWJlcikgeyByZXR1cm4gc3VtICs9IG51bWJlciAqIG51bWJlcjsgfSwgMCk7XG4gICAgICByZXR1cm4gbGFyZ2VzdCAqIE1hdGguc3FydChzdW0pO1xuICAgIH0sXG5cbiAgICBsb2cyOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiBNYXRoLmxvZyh2YWx1ZSkgKiBNYXRoLkxPRzJFO1xuICAgIH0sXG5cbiAgICBsb2cxMDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gTWF0aC5sb2codmFsdWUpICogTWF0aC5MT0cxMEU7XG4gICAgfSxcblxuICAgIGxvZzFwOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSA8IC0xIHx8IE51bWJlci5pc05hTih2YWx1ZSkpIHsgcmV0dXJuIE5hTjsgfVxuICAgICAgaWYgKHZhbHVlID09PSAwIHx8IHZhbHVlID09PSBJbmZpbml0eSkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICAgIGlmICh2YWx1ZSA9PT0gLTEpIHsgcmV0dXJuIC1JbmZpbml0eTsgfVxuICAgICAgdmFyIHJlc3VsdCA9IDA7XG4gICAgICB2YXIgbiA9IDUwO1xuXG4gICAgICBpZiAodmFsdWUgPCAwIHx8IHZhbHVlID4gMSkgeyByZXR1cm4gTWF0aC5sb2coMSArIHZhbHVlKTsgfVxuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgaWYgKChpICUgMikgPT09IDApIHtcbiAgICAgICAgICByZXN1bHQgLT0gTWF0aC5wb3codmFsdWUsIGkpIC8gaTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQgKz0gTWF0aC5wb3codmFsdWUsIGkpIC8gaTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBzaWduOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhciBudW1iZXIgPSArdmFsdWU7XG4gICAgICBpZiAobnVtYmVyID09PSAwKSB7IHJldHVybiBudW1iZXI7IH1cbiAgICAgIGlmIChOdW1iZXIuaXNOYU4obnVtYmVyKSkgeyByZXR1cm4gbnVtYmVyOyB9XG4gICAgICByZXR1cm4gbnVtYmVyIDwgMCA/IC0xIDogMTtcbiAgICB9LFxuXG4gICAgc2luaDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG4gICAgICBpZiAoIWdsb2JhbF9pc0Zpbml0ZSh2YWx1ZSkgfHwgdmFsdWUgPT09IDApIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgICByZXR1cm4gKE1hdGguZXhwKHZhbHVlKSAtIE1hdGguZXhwKC12YWx1ZSkpIC8gMjtcbiAgICB9LFxuXG4gICAgdGFuaDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG4gICAgICBpZiAoTnVtYmVyLmlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gMCkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICAgIGlmICh2YWx1ZSA9PT0gSW5maW5pdHkpIHsgcmV0dXJuIDE7IH1cbiAgICAgIGlmICh2YWx1ZSA9PT0gLUluZmluaXR5KSB7IHJldHVybiAtMTsgfVxuICAgICAgcmV0dXJuIChNYXRoLmV4cCh2YWx1ZSkgLSBNYXRoLmV4cCgtdmFsdWUpKSAvIChNYXRoLmV4cCh2YWx1ZSkgKyBNYXRoLmV4cCgtdmFsdWUpKTtcbiAgICB9LFxuXG4gICAgdHJ1bmM6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFyIG51bWJlciA9IE51bWJlcih2YWx1ZSk7XG4gICAgICByZXR1cm4gbnVtYmVyIDwgMCA/IC1NYXRoLmZsb29yKC1udW1iZXIpIDogTWF0aC5mbG9vcihudW1iZXIpO1xuICAgIH0sXG5cbiAgICBpbXVsOiBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgLy8gdGFrZW4gZnJvbSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9NYXRoL2ltdWxcbiAgICAgIHggPSBFUy5Ub1VpbnQzMih4KTtcbiAgICAgIHkgPSBFUy5Ub1VpbnQzMih5KTtcbiAgICAgIHZhciBhaCAgPSAoeCA+Pj4gMTYpICYgMHhmZmZmO1xuICAgICAgdmFyIGFsID0geCAmIDB4ZmZmZjtcbiAgICAgIHZhciBiaCAgPSAoeSA+Pj4gMTYpICYgMHhmZmZmO1xuICAgICAgdmFyIGJsID0geSAmIDB4ZmZmZjtcbiAgICAgIC8vIHRoZSBzaGlmdCBieSAwIGZpeGVzIHRoZSBzaWduIG9uIHRoZSBoaWdoIHBhcnRcbiAgICAgIC8vIHRoZSBmaW5hbCB8MCBjb252ZXJ0cyB0aGUgdW5zaWduZWQgdmFsdWUgaW50byBhIHNpZ25lZCB2YWx1ZVxuICAgICAgcmV0dXJuICgoYWwgKiBibCkgKyAoKChhaCAqIGJsICsgYWwgKiBiaCkgPDwgMTYpID4+PiAwKXwwKTtcbiAgICB9LFxuXG4gICAgZnJvdW5kOiBmdW5jdGlvbiAoeCkge1xuICAgICAgaWYgKHggPT09IDAgfHwgeCA9PT0gSW5maW5pdHkgfHwgeCA9PT0gLUluZmluaXR5IHx8IE51bWJlci5pc05hTih4KSkge1xuICAgICAgICByZXR1cm4geDtcbiAgICAgIH1cbiAgICAgIHZhciBudW0gPSBOdW1iZXIoeCk7XG4gICAgICByZXR1cm4gbnVtYmVyQ29udmVyc2lvbi50b0Zsb2F0MzIobnVtKTtcbiAgICB9XG4gIH07XG4gIGRlZmluZVByb3BlcnRpZXMoTWF0aCwgTWF0aFNoaW1zKTtcblxuICBpZiAoTWF0aC5pbXVsKDB4ZmZmZmZmZmYsIDUpICE9PSAtNSkge1xuICAgIC8vIFNhZmFyaSA2LjEsIGF0IGxlYXN0LCByZXBvcnRzIFwiMFwiIGZvciB0aGlzIHZhbHVlXG4gICAgTWF0aC5pbXVsID0gTWF0aFNoaW1zLmltdWw7XG4gIH1cblxuICAvLyBQcm9taXNlc1xuICAvLyBTaW1wbGVzdCBwb3NzaWJsZSBpbXBsZW1lbnRhdGlvbjsgdXNlIGEgM3JkLXBhcnR5IGxpYnJhcnkgaWYgeW91XG4gIC8vIHdhbnQgdGhlIGJlc3QgcG9zc2libGUgc3BlZWQgYW5kL29yIGxvbmcgc3RhY2sgdHJhY2VzLlxuICB2YXIgUHJvbWlzZVNoaW0gPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIFByb21pc2UsIFByb21pc2UkcHJvdG90eXBlO1xuXG4gICAgRVMuSXNQcm9taXNlID0gZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KHByb21pc2UpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICghcHJvbWlzZS5fcHJvbWlzZUNvbnN0cnVjdG9yKSB7XG4gICAgICAgIC8vIF9wcm9taXNlQ29uc3RydWN0b3IgaXMgYSBiaXQgbW9yZSB1bmlxdWUgdGhhbiBfc3RhdHVzLCBzbyB3ZSdsbFxuICAgICAgICAvLyBjaGVjayB0aGF0IGluc3RlYWQgb2YgdGhlIFtbUHJvbWlzZVN0YXR1c11dIGludGVybmFsIGZpZWxkLlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHByb21pc2UuX3N0YXR1cyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyB1bmluaXRpYWxpemVkXG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgLy8gXCJQcm9taXNlQ2FwYWJpbGl0eVwiIGluIHRoZSBzcGVjIGlzIHdoYXQgbW9zdCBwcm9taXNlIGltcGxlbWVudGF0aW9uc1xuICAgIC8vIGNhbGwgYSBcImRlZmVycmVkXCIuXG4gICAgdmFyIFByb21pc2VDYXBhYmlsaXR5ID0gZnVuY3Rpb24gKEMpIHtcbiAgICAgIGlmICghRVMuSXNDYWxsYWJsZShDKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiYWQgcHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xuICAgICAgfVxuICAgICAgdmFyIGNhcGFiaWxpdHkgPSB0aGlzO1xuICAgICAgdmFyIHJlc29sdmVyID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBjYXBhYmlsaXR5LnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICBjYXBhYmlsaXR5LnJlamVjdCA9IHJlamVjdDtcbiAgICAgIH07XG4gICAgICBjYXBhYmlsaXR5LnByb21pc2UgPSBFUy5Db25zdHJ1Y3QoQywgW3Jlc29sdmVyXSk7XG4gICAgICAvLyBzZWUgaHR0cHM6Ly9idWdzLmVjbWFzY3JpcHQub3JnL3Nob3dfYnVnLmNnaT9pZD0yNDc4XG4gICAgICBpZiAoIWNhcGFiaWxpdHkucHJvbWlzZS5fZXM2Y29uc3RydWN0KSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2JhZCBwcm9taXNlIGNvbnN0cnVjdG9yJyk7XG4gICAgICB9XG4gICAgICBpZiAoIShFUy5Jc0NhbGxhYmxlKGNhcGFiaWxpdHkucmVzb2x2ZSkgJiZcbiAgICAgICAgICAgIEVTLklzQ2FsbGFibGUoY2FwYWJpbGl0eS5yZWplY3QpKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiYWQgcHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBmaW5kIGFuIGFwcHJvcHJpYXRlIHNldEltbWVkaWF0ZS1hbGlrZVxuICAgIHZhciBzZXRUaW1lb3V0ID0gZ2xvYmFscy5zZXRUaW1lb3V0O1xuICAgIHZhciBtYWtlWmVyb1RpbWVvdXQ7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIEVTLklzQ2FsbGFibGUod2luZG93LnBvc3RNZXNzYWdlKSkge1xuICAgICAgbWFrZVplcm9UaW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBmcm9tIGh0dHA6Ly9kYmFyb24ub3JnL2xvZy8yMDEwMDMwOS1mYXN0ZXItdGltZW91dHNcbiAgICAgICAgdmFyIHRpbWVvdXRzID0gW107XG4gICAgICAgIHZhciBtZXNzYWdlTmFtZSA9ICd6ZXJvLXRpbWVvdXQtbWVzc2FnZSc7XG4gICAgICAgIHZhciBzZXRaZXJvVGltZW91dCA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgIHRpbWVvdXRzLnB1c2goZm4pO1xuICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZShtZXNzYWdlTmFtZSwgJyonKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGhhbmRsZU1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICBpZiAoZXZlbnQuc291cmNlID09IHdpbmRvdyAmJiBldmVudC5kYXRhID09IG1lc3NhZ2VOYW1lKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGlmICh0aW1lb3V0cy5sZW5ndGggPT09IDApIHsgcmV0dXJuOyB9XG4gICAgICAgICAgICB2YXIgZm4gPSB0aW1lb3V0cy5zaGlmdCgpO1xuICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgaGFuZGxlTWVzc2FnZSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBzZXRaZXJvVGltZW91dDtcbiAgICAgIH07XG4gICAgfVxuICAgIHZhciBtYWtlUHJvbWlzZUFzYXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBBbiBlZmZpY2llbnQgdGFzay1zY2hlZHVsZXIgYmFzZWQgb24gYSBwcmUtZXhpc3RpbmcgUHJvbWlzZVxuICAgICAgLy8gaW1wbGVtZW50YXRpb24sIHdoaWNoIHdlIGNhbiB1c2UgZXZlbiBpZiB3ZSBvdmVycmlkZSB0aGVcbiAgICAgIC8vIGdsb2JhbCBQcm9taXNlIGJlbG93IChpbiBvcmRlciB0byB3b3JrYXJvdW5kIGJ1Z3MpXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vUmF5bm9zL29ic2Vydi1oYXNoL2lzc3Vlcy8yI2lzc3VlY29tbWVudC0zNTg1NzY3MVxuICAgICAgdmFyIFAgPSBnbG9iYWxzLlByb21pc2U7XG4gICAgICByZXR1cm4gUCAmJiBQLnJlc29sdmUgJiYgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgcmV0dXJuIFAucmVzb2x2ZSgpLnRoZW4odGFzayk7XG4gICAgICB9O1xuICAgIH07XG4gICAgdmFyIGVucXVldWUgPSBFUy5Jc0NhbGxhYmxlKGdsb2JhbHMuc2V0SW1tZWRpYXRlKSA/XG4gICAgICBnbG9iYWxzLnNldEltbWVkaWF0ZS5iaW5kKGdsb2JhbHMpIDpcbiAgICAgIHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiBwcm9jZXNzLm5leHRUaWNrID8gcHJvY2Vzcy5uZXh0VGljayA6XG4gICAgICBtYWtlUHJvbWlzZUFzYXAoKSB8fFxuICAgICAgKEVTLklzQ2FsbGFibGUobWFrZVplcm9UaW1lb3V0KSA/IG1ha2VaZXJvVGltZW91dCgpIDpcbiAgICAgIGZ1bmN0aW9uICh0YXNrKSB7IHNldFRpbWVvdXQodGFzaywgMCk7IH0pOyAvLyBmYWxsYmFja1xuXG4gICAgdmFyIHRyaWdnZXJQcm9taXNlUmVhY3Rpb25zID0gZnVuY3Rpb24gKHJlYWN0aW9ucywgeCkge1xuICAgICAgcmVhY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKHJlYWN0aW9uKSB7XG4gICAgICAgIGVucXVldWUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIFByb21pc2VSZWFjdGlvblRhc2tcbiAgICAgICAgICB2YXIgaGFuZGxlciA9IHJlYWN0aW9uLmhhbmRsZXI7XG4gICAgICAgICAgdmFyIGNhcGFiaWxpdHkgPSByZWFjdGlvbi5jYXBhYmlsaXR5O1xuICAgICAgICAgIHZhciByZXNvbHZlID0gY2FwYWJpbGl0eS5yZXNvbHZlO1xuICAgICAgICAgIHZhciByZWplY3QgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGhhbmRsZXIoeCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSBjYXBhYmlsaXR5LnByb21pc2UpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc2VsZiByZXNvbHV0aW9uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdXBkYXRlUmVzdWx0ID1cbiAgICAgICAgICAgICAgdXBkYXRlUHJvbWlzZUZyb21Qb3RlbnRpYWxUaGVuYWJsZShyZXN1bHQsIGNhcGFiaWxpdHkpO1xuICAgICAgICAgICAgaWYgKCF1cGRhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciB1cGRhdGVQcm9taXNlRnJvbVBvdGVudGlhbFRoZW5hYmxlID0gZnVuY3Rpb24gKHgsIGNhcGFiaWxpdHkpIHtcbiAgICAgIGlmICghRVMuVHlwZUlzT2JqZWN0KHgpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciByZXNvbHZlID0gY2FwYWJpbGl0eS5yZXNvbHZlO1xuICAgICAgdmFyIHJlamVjdCA9IGNhcGFiaWxpdHkucmVqZWN0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIHRoZW4gPSB4LnRoZW47IC8vIG9ubHkgb25lIGludm9jYXRpb24gb2YgYWNjZXNzb3JcbiAgICAgICAgaWYgKCFFUy5Jc0NhbGxhYmxlKHRoZW4pKSB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICB0aGVuLmNhbGwoeCwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIHZhciBwcm9taXNlUmVzb2x1dGlvbkhhbmRsZXIgPSBmdW5jdGlvbiAocHJvbWlzZSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoeCkge1xuICAgICAgICBpZiAoeCA9PT0gcHJvbWlzZSkge1xuICAgICAgICAgIHJldHVybiBvblJlamVjdGVkKG5ldyBUeXBlRXJyb3IoJ3NlbGYgcmVzb2x1dGlvbicpKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgQyA9IHByb21pc2UuX3Byb21pc2VDb25zdHJ1Y3RvcjtcbiAgICAgICAgdmFyIGNhcGFiaWxpdHkgPSBuZXcgUHJvbWlzZUNhcGFiaWxpdHkoQyk7XG4gICAgICAgIHZhciB1cGRhdGVSZXN1bHQgPSB1cGRhdGVQcm9taXNlRnJvbVBvdGVudGlhbFRoZW5hYmxlKHgsIGNhcGFiaWxpdHkpO1xuICAgICAgICBpZiAodXBkYXRlUmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIGNhcGFiaWxpdHkucHJvbWlzZS50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gb25GdWxmaWxsZWQoeCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcblxuICAgIFByb21pc2UgPSBmdW5jdGlvbiAocmVzb2x2ZXIpIHtcbiAgICAgIHZhciBwcm9taXNlID0gdGhpcztcbiAgICAgIHByb21pc2UgPSBlbXVsYXRlRVM2Y29uc3RydWN0KHByb21pc2UpO1xuICAgICAgaWYgKCFwcm9taXNlLl9wcm9taXNlQ29uc3RydWN0b3IpIHtcbiAgICAgICAgLy8gd2UgdXNlIF9wcm9taXNlQ29uc3RydWN0b3IgYXMgYSBzdGFuZC1pbiBmb3IgdGhlIGludGVybmFsXG4gICAgICAgIC8vIFtbUHJvbWlzZVN0YXR1c11dIGZpZWxkOyBpdCdzIGEgbGl0dGxlIG1vcmUgdW5pcXVlLlxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiYWQgcHJvbWlzZScpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBwcm9taXNlLl9zdGF0dXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3Byb21pc2UgYWxyZWFkeSBpbml0aWFsaXplZCcpO1xuICAgICAgfVxuICAgICAgLy8gc2VlIGh0dHBzOi8vYnVncy5lY21hc2NyaXB0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjQ4MlxuICAgICAgaWYgKCFFUy5Jc0NhbGxhYmxlKHJlc29sdmVyKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdub3QgYSB2YWxpZCByZXNvbHZlcicpO1xuICAgICAgfVxuICAgICAgcHJvbWlzZS5fc3RhdHVzID0gJ3VucmVzb2x2ZWQnO1xuICAgICAgcHJvbWlzZS5fcmVzb2x2ZVJlYWN0aW9ucyA9IFtdO1xuICAgICAgcHJvbWlzZS5fcmVqZWN0UmVhY3Rpb25zID0gW107XG5cbiAgICAgIHZhciByZXNvbHZlID0gZnVuY3Rpb24gKHJlc29sdXRpb24pIHtcbiAgICAgICAgaWYgKHByb21pc2UuX3N0YXR1cyAhPT0gJ3VucmVzb2x2ZWQnKSB7IHJldHVybjsgfVxuICAgICAgICB2YXIgcmVhY3Rpb25zID0gcHJvbWlzZS5fcmVzb2x2ZVJlYWN0aW9ucztcbiAgICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gcmVzb2x1dGlvbjtcbiAgICAgICAgcHJvbWlzZS5fcmVzb2x2ZVJlYWN0aW9ucyA9IHZvaWQgMDtcbiAgICAgICAgcHJvbWlzZS5fcmVqZWN0UmVhY3Rpb25zID0gdm9pZCAwO1xuICAgICAgICBwcm9taXNlLl9zdGF0dXMgPSAnaGFzLXJlc29sdXRpb24nO1xuICAgICAgICB0cmlnZ2VyUHJvbWlzZVJlYWN0aW9ucyhyZWFjdGlvbnMsIHJlc29sdXRpb24pO1xuICAgICAgfTtcbiAgICAgIHZhciByZWplY3QgPSBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIGlmIChwcm9taXNlLl9zdGF0dXMgIT09ICd1bnJlc29sdmVkJykgeyByZXR1cm47IH1cbiAgICAgICAgdmFyIHJlYWN0aW9ucyA9IHByb21pc2UuX3JlamVjdFJlYWN0aW9ucztcbiAgICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gcmVhc29uO1xuICAgICAgICBwcm9taXNlLl9yZXNvbHZlUmVhY3Rpb25zID0gdm9pZCAwO1xuICAgICAgICBwcm9taXNlLl9yZWplY3RSZWFjdGlvbnMgPSB2b2lkIDA7XG4gICAgICAgIHByb21pc2UuX3N0YXR1cyA9ICdoYXMtcmVqZWN0aW9uJztcbiAgICAgICAgdHJpZ2dlclByb21pc2VSZWFjdGlvbnMocmVhY3Rpb25zLCByZWFzb24pO1xuICAgICAgfTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc29sdmVyKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG4gICAgUHJvbWlzZSRwcm90b3R5cGUgPSBQcm9taXNlLnByb3RvdHlwZTtcbiAgICBkZWZpbmVQcm9wZXJ0aWVzKFByb21pc2UsIHtcbiAgICAgICdAQGNyZWF0ZSc6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIGNvbnN0cnVjdG9yID0gdGhpcztcbiAgICAgICAgLy8gQWxsb2NhdGVQcm9taXNlXG4gICAgICAgIC8vIFRoZSBgb2JqYCBwYXJhbWV0ZXIgaXMgYSBoYWNrIHdlIHVzZSBmb3IgZXM1XG4gICAgICAgIC8vIGNvbXBhdGliaWxpdHkuXG4gICAgICAgIHZhciBwcm90b3R5cGUgPSBjb25zdHJ1Y3Rvci5wcm90b3R5cGUgfHwgUHJvbWlzZSRwcm90b3R5cGU7XG4gICAgICAgIG9iaiA9IG9iaiB8fCBjcmVhdGUocHJvdG90eXBlKTtcbiAgICAgICAgZGVmaW5lUHJvcGVydGllcyhvYmosIHtcbiAgICAgICAgICBfc3RhdHVzOiB2b2lkIDAsXG4gICAgICAgICAgX3Jlc3VsdDogdm9pZCAwLFxuICAgICAgICAgIF9yZXNvbHZlUmVhY3Rpb25zOiB2b2lkIDAsXG4gICAgICAgICAgX3JlamVjdFJlYWN0aW9uczogdm9pZCAwLFxuICAgICAgICAgIF9wcm9taXNlQ29uc3RydWN0b3I6IHZvaWQgMFxuICAgICAgICB9KTtcbiAgICAgICAgb2JqLl9wcm9taXNlQ29uc3RydWN0b3IgPSBjb25zdHJ1Y3RvcjtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBfcHJvbWlzZUFsbFJlc29sdmVyID0gZnVuY3Rpb24gKGluZGV4LCB2YWx1ZXMsIGNhcGFiaWxpdHksIHJlbWFpbmluZykge1xuICAgICAgdmFyIGRvbmUgPSBmYWxzZTtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoeCkge1xuICAgICAgICBpZiAoZG9uZSkgeyByZXR1cm47IH0gLy8gcHJvdGVjdCBhZ2FpbnN0IGJlaW5nIGNhbGxlZCBtdWx0aXBsZSB0aW1lc1xuICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgdmFsdWVzW2luZGV4XSA9IHg7XG4gICAgICAgIGlmICgoLS1yZW1haW5pbmcuY291bnQpID09PSAwKSB7XG4gICAgICAgICAgdmFyIHJlc29sdmUgPSBjYXBhYmlsaXR5LnJlc29sdmU7XG4gICAgICAgICAgcmVzb2x2ZSh2YWx1ZXMpOyAvLyBjYWxsIHcvIHRoaXM9PT11bmRlZmluZWRcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgUHJvbWlzZS5hbGwgPSBmdW5jdGlvbiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBDID0gdGhpcztcbiAgICAgIHZhciBjYXBhYmlsaXR5ID0gbmV3IFByb21pc2VDYXBhYmlsaXR5KEMpO1xuICAgICAgdmFyIHJlc29sdmUgPSBjYXBhYmlsaXR5LnJlc29sdmU7XG4gICAgICB2YXIgcmVqZWN0ID0gY2FwYWJpbGl0eS5yZWplY3Q7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIUVTLklzSXRlcmFibGUoaXRlcmFibGUpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYmFkIGl0ZXJhYmxlJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGl0ID0gRVMuR2V0SXRlcmF0b3IoaXRlcmFibGUpO1xuICAgICAgICB2YXIgdmFsdWVzID0gW10sIHJlbWFpbmluZyA9IHsgY291bnQ6IDEgfTtcbiAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyA7IGluZGV4KyspIHtcbiAgICAgICAgICB2YXIgbmV4dCA9IEVTLkl0ZXJhdG9yTmV4dChpdCk7XG4gICAgICAgICAgaWYgKG5leHQuZG9uZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBuZXh0UHJvbWlzZSA9IEMucmVzb2x2ZShuZXh0LnZhbHVlKTtcbiAgICAgICAgICB2YXIgcmVzb2x2ZUVsZW1lbnQgPSBfcHJvbWlzZUFsbFJlc29sdmVyKFxuICAgICAgICAgICAgaW5kZXgsIHZhbHVlcywgY2FwYWJpbGl0eSwgcmVtYWluaW5nXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZW1haW5pbmcuY291bnQrKztcbiAgICAgICAgICBuZXh0UHJvbWlzZS50aGVuKHJlc29sdmVFbGVtZW50LCBjYXBhYmlsaXR5LnJlamVjdCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCgtLXJlbWFpbmluZy5jb3VudCkgPT09IDApIHtcbiAgICAgICAgICByZXNvbHZlKHZhbHVlcyk7IC8vIGNhbGwgdy8gdGhpcz09PXVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gICAgfTtcblxuICAgIFByb21pc2UucmFjZSA9IGZ1bmN0aW9uIChpdGVyYWJsZSkge1xuICAgICAgdmFyIEMgPSB0aGlzO1xuICAgICAgdmFyIGNhcGFiaWxpdHkgPSBuZXcgUHJvbWlzZUNhcGFiaWxpdHkoQyk7XG4gICAgICB2YXIgcmVzb2x2ZSA9IGNhcGFiaWxpdHkucmVzb2x2ZTtcbiAgICAgIHZhciByZWplY3QgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghRVMuSXNJdGVyYWJsZShpdGVyYWJsZSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiYWQgaXRlcmFibGUnKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaXQgPSBFUy5HZXRJdGVyYXRvcihpdGVyYWJsZSk7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgdmFyIG5leHQgPSBFUy5JdGVyYXRvck5leHQoaXQpO1xuICAgICAgICAgIGlmIChuZXh0LmRvbmUpIHtcbiAgICAgICAgICAgIC8vIElmIGl0ZXJhYmxlIGhhcyBubyBpdGVtcywgcmVzdWx0aW5nIHByb21pc2Ugd2lsbCBuZXZlclxuICAgICAgICAgICAgLy8gcmVzb2x2ZTsgc2VlOlxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2RvbWVuaWMvcHJvbWlzZXMtdW53cmFwcGluZy9pc3N1ZXMvNzVcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vYnVncy5lY21hc2NyaXB0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjUxNVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBuZXh0UHJvbWlzZSA9IEMucmVzb2x2ZShuZXh0LnZhbHVlKTtcbiAgICAgICAgICBuZXh0UHJvbWlzZS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNhcGFiaWxpdHkucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgUHJvbWlzZS5yZWplY3QgPSBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICB2YXIgQyA9IHRoaXM7XG4gICAgICB2YXIgY2FwYWJpbGl0eSA9IG5ldyBQcm9taXNlQ2FwYWJpbGl0eShDKTtcbiAgICAgIHZhciByZWplY3QgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICAgIHJlamVjdChyZWFzb24pOyAvLyBjYWxsIHdpdGggdGhpcz09PXVuZGVmaW5lZFxuICAgICAgcmV0dXJuIGNhcGFiaWxpdHkucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgUHJvbWlzZS5yZXNvbHZlID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgIHZhciBDID0gdGhpcztcbiAgICAgIGlmIChFUy5Jc1Byb21pc2UodikpIHtcbiAgICAgICAgdmFyIGNvbnN0cnVjdG9yID0gdi5fcHJvbWlzZUNvbnN0cnVjdG9yO1xuICAgICAgICBpZiAoY29uc3RydWN0b3IgPT09IEMpIHsgcmV0dXJuIHY7IH1cbiAgICAgIH1cbiAgICAgIHZhciBjYXBhYmlsaXR5ID0gbmV3IFByb21pc2VDYXBhYmlsaXR5KEMpO1xuICAgICAgdmFyIHJlc29sdmUgPSBjYXBhYmlsaXR5LnJlc29sdmU7XG4gICAgICByZXNvbHZlKHYpOyAvLyBjYWxsIHdpdGggdGhpcz09PXVuZGVmaW5lZFxuICAgICAgcmV0dXJuIGNhcGFiaWxpdHkucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgUHJvbWlzZS5wcm90b3R5cGVbJ2NhdGNoJ10gPSBmdW5jdGlvbiAob25SZWplY3RlZCkge1xuICAgICAgcmV0dXJuIHRoaXMudGhlbih2b2lkIDAsIG9uUmVqZWN0ZWQpO1xuICAgIH07XG5cbiAgICBQcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gICAgICB2YXIgcHJvbWlzZSA9IHRoaXM7XG4gICAgICBpZiAoIUVTLklzUHJvbWlzZShwcm9taXNlKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdub3QgYSBwcm9taXNlJyk7IH1cbiAgICAgIC8vIHRoaXMuY29uc3RydWN0b3Igbm90IHRoaXMuX3Byb21pc2VDb25zdHJ1Y3Rvcjsgc2VlXG4gICAgICAvLyBodHRwczovL2J1Z3MuZWNtYXNjcmlwdC5vcmcvc2hvd19idWcuY2dpP2lkPTI1MTNcbiAgICAgIHZhciBDID0gdGhpcy5jb25zdHJ1Y3RvcjtcbiAgICAgIHZhciBjYXBhYmlsaXR5ID0gbmV3IFByb21pc2VDYXBhYmlsaXR5KEMpO1xuICAgICAgaWYgKCFFUy5Jc0NhbGxhYmxlKG9uUmVqZWN0ZWQpKSB7XG4gICAgICAgIG9uUmVqZWN0ZWQgPSBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9O1xuICAgICAgfVxuICAgICAgaWYgKCFFUy5Jc0NhbGxhYmxlKG9uRnVsZmlsbGVkKSkge1xuICAgICAgICBvbkZ1bGZpbGxlZCA9IGZ1bmN0aW9uICh4KSB7IHJldHVybiB4OyB9O1xuICAgICAgfVxuICAgICAgdmFyIHJlc29sdXRpb25IYW5kbGVyID1cbiAgICAgICAgcHJvbWlzZVJlc29sdXRpb25IYW5kbGVyKHByb21pc2UsIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKTtcbiAgICAgIHZhciByZXNvbHZlUmVhY3Rpb24gPVxuICAgICAgICB7IGNhcGFiaWxpdHk6IGNhcGFiaWxpdHksIGhhbmRsZXI6IHJlc29sdXRpb25IYW5kbGVyIH07XG4gICAgICB2YXIgcmVqZWN0UmVhY3Rpb24gPVxuICAgICAgICB7IGNhcGFiaWxpdHk6IGNhcGFiaWxpdHksIGhhbmRsZXI6IG9uUmVqZWN0ZWQgfTtcbiAgICAgIHN3aXRjaCAocHJvbWlzZS5fc3RhdHVzKSB7XG4gICAgICBjYXNlICd1bnJlc29sdmVkJzpcbiAgICAgICAgcHJvbWlzZS5fcmVzb2x2ZVJlYWN0aW9ucy5wdXNoKHJlc29sdmVSZWFjdGlvbik7XG4gICAgICAgIHByb21pc2UuX3JlamVjdFJlYWN0aW9ucy5wdXNoKHJlamVjdFJlYWN0aW9uKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdoYXMtcmVzb2x1dGlvbic6XG4gICAgICAgIHRyaWdnZXJQcm9taXNlUmVhY3Rpb25zKFtyZXNvbHZlUmVhY3Rpb25dLCBwcm9taXNlLl9yZXN1bHQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2hhcy1yZWplY3Rpb24nOlxuICAgICAgICB0cmlnZ2VyUHJvbWlzZVJlYWN0aW9ucyhbcmVqZWN0UmVhY3Rpb25dLCBwcm9taXNlLl9yZXN1bHQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3VuZXhwZWN0ZWQnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gICAgfTtcblxuICAgIHJldHVybiBQcm9taXNlO1xuICB9KSgpO1xuXG4gIC8vIENocm9tZSdzIG5hdGl2ZSBQcm9taXNlIGhhcyBleHRyYSBtZXRob2RzIHRoYXQgaXQgc2hvdWxkbid0IGhhdmUuIExldCdzIHJlbW92ZSB0aGVtLlxuICBpZiAoZ2xvYmFscy5Qcm9taXNlKSB7XG4gICAgZGVsZXRlIGdsb2JhbHMuUHJvbWlzZS5hY2NlcHQ7XG4gICAgZGVsZXRlIGdsb2JhbHMuUHJvbWlzZS5kZWZlcjtcbiAgICBkZWxldGUgZ2xvYmFscy5Qcm9taXNlLnByb3RvdHlwZS5jaGFpbjtcbiAgfVxuXG4gIC8vIGV4cG9ydCB0aGUgUHJvbWlzZSBjb25zdHJ1Y3Rvci5cbiAgZGVmaW5lUHJvcGVydGllcyhnbG9iYWxzLCB7IFByb21pc2U6IFByb21pc2VTaGltIH0pO1xuICAvLyBJbiBDaHJvbWUgMzMgKGFuZCB0aGVyZWFib3V0cykgUHJvbWlzZSBpcyBkZWZpbmVkLCBidXQgdGhlXG4gIC8vIGltcGxlbWVudGF0aW9uIGlzIGJ1Z2d5IGluIGEgbnVtYmVyIG9mIHdheXMuICBMZXQncyBjaGVjayBzdWJjbGFzc2luZ1xuICAvLyBzdXBwb3J0IHRvIHNlZSBpZiB3ZSBoYXZlIGEgYnVnZ3kgaW1wbGVtZW50YXRpb24uXG4gIHZhciBwcm9taXNlU3VwcG9ydHNTdWJjbGFzc2luZyA9IHN1cHBvcnRzU3ViY2xhc3NpbmcoZ2xvYmFscy5Qcm9taXNlLCBmdW5jdGlvbiAoUykge1xuICAgIHJldHVybiBTLnJlc29sdmUoNDIpIGluc3RhbmNlb2YgUztcbiAgfSk7XG4gIHZhciBwcm9taXNlSWdub3Jlc05vbkZ1bmN0aW9uVGhlbkNhbGxiYWNrcyA9IChmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGdsb2JhbHMuUHJvbWlzZS5yZWplY3QoNDIpLnRoZW4obnVsbCwgNSkudGhlbihudWxsLCBmdW5jdGlvbiAoKSB7fSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSgpKTtcbiAgdmFyIHByb21pc2VSZXF1aXJlc09iamVjdENvbnRleHQgPSAoZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7IFByb21pc2UuY2FsbCgzLCBmdW5jdGlvbiAoKSB7fSk7IH0gY2F0Y2ggKGUpIHsgcmV0dXJuIHRydWU7IH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0oKSk7XG4gIGlmICghcHJvbWlzZVN1cHBvcnRzU3ViY2xhc3NpbmcgfHwgIXByb21pc2VJZ25vcmVzTm9uRnVuY3Rpb25UaGVuQ2FsbGJhY2tzIHx8ICFwcm9taXNlUmVxdWlyZXNPYmplY3RDb250ZXh0KSB7XG4gICAgZ2xvYmFscy5Qcm9taXNlID0gUHJvbWlzZVNoaW07XG4gIH1cblxuICAvLyBNYXAgYW5kIFNldCByZXF1aXJlIGEgdHJ1ZSBFUzUgZW52aXJvbm1lbnRcbiAgLy8gVGhlaXIgZmFzdCBwYXRoIGFsc28gcmVxdWlyZXMgdGhhdCB0aGUgZW52aXJvbm1lbnQgcHJlc2VydmVcbiAgLy8gcHJvcGVydHkgaW5zZXJ0aW9uIG9yZGVyLCB3aGljaCBpcyBub3QgZ3VhcmFudGVlZCBieSB0aGUgc3BlYy5cbiAgdmFyIHRlc3RPcmRlciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIGIgPSBPYmplY3Qua2V5cyhhLnJlZHVjZShmdW5jdGlvbiAobywgaykge1xuICAgICAgb1trXSA9IHRydWU7XG4gICAgICByZXR1cm4gbztcbiAgICB9LCB7fSkpO1xuICAgIHJldHVybiBhLmpvaW4oJzonKSA9PT0gYi5qb2luKCc6Jyk7XG4gIH07XG4gIHZhciBwcmVzZXJ2ZXNJbnNlcnRpb25PcmRlciA9IHRlc3RPcmRlcihbJ3onLCAnYScsICdiYiddKTtcbiAgLy8gc29tZSBlbmdpbmVzIChlZywgQ2hyb21lKSBvbmx5IHByZXNlcnZlIGluc2VydGlvbiBvcmRlciBmb3Igc3RyaW5nIGtleXNcbiAgdmFyIHByZXNlcnZlc051bWVyaWNJbnNlcnRpb25PcmRlciA9IHRlc3RPcmRlcihbJ3onLCAxLCAnYScsICczJywgMl0pO1xuXG4gIGlmIChzdXBwb3J0c0Rlc2NyaXB0b3JzKSB7XG5cbiAgICB2YXIgZmFzdGtleSA9IGZ1bmN0aW9uIGZhc3RrZXkoa2V5KSB7XG4gICAgICBpZiAoIXByZXNlcnZlc0luc2VydGlvbk9yZGVyKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgdmFyIHR5cGUgPSB0eXBlb2Yga2V5O1xuICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiAnJCcgKyBrZXk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIC8vIG5vdGUgdGhhdCAtMCB3aWxsIGdldCBjb2VyY2VkIHRvIFwiMFwiIHdoZW4gdXNlZCBhcyBhIHByb3BlcnR5IGtleVxuICAgICAgICBpZiAoIXByZXNlcnZlc051bWVyaWNJbnNlcnRpb25PcmRlcikge1xuICAgICAgICAgIHJldHVybiAnbicgKyBrZXk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICB2YXIgZW1wdHlPYmplY3QgPSBmdW5jdGlvbiBlbXB0eU9iamVjdCgpIHtcbiAgICAgIC8vIGFjY29tb2RhdGUgc29tZSBvbGRlciBub3QtcXVpdGUtRVM1IGJyb3dzZXJzXG4gICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZSA/IE9iamVjdC5jcmVhdGUobnVsbCkgOiB7fTtcbiAgICB9O1xuXG4gICAgdmFyIGNvbGxlY3Rpb25TaGltcyA9IHtcbiAgICAgIE1hcDogKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgZW1wdHkgPSB7fTtcblxuICAgICAgICBmdW5jdGlvbiBNYXBFbnRyeShrZXksIHZhbHVlKSB7XG4gICAgICAgICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgICAgICAgdGhpcy5wcmV2ID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIE1hcEVudHJ5LnByb3RvdHlwZS5pc1JlbW92ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMua2V5ID09PSBlbXB0eTtcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBNYXBJdGVyYXRvcihtYXAsIGtpbmQpIHtcbiAgICAgICAgICB0aGlzLmhlYWQgPSBtYXAuX2hlYWQ7XG4gICAgICAgICAgdGhpcy5pID0gdGhpcy5oZWFkO1xuICAgICAgICAgIHRoaXMua2luZCA9IGtpbmQ7XG4gICAgICAgIH1cblxuICAgICAgICBNYXBJdGVyYXRvci5wcm90b3R5cGUgPSB7XG4gICAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGkgPSB0aGlzLmksIGtpbmQgPSB0aGlzLmtpbmQsIGhlYWQgPSB0aGlzLmhlYWQsIHJlc3VsdDtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5pID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aGlsZSAoaS5pc1JlbW92ZWQoKSAmJiBpICE9PSBoZWFkKSB7XG4gICAgICAgICAgICAgIC8vIGJhY2sgdXAgb2ZmIG9mIHJlbW92ZWQgZW50cmllc1xuICAgICAgICAgICAgICBpID0gaS5wcmV2O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gYWR2YW5jZSB0byBuZXh0IHVucmV0dXJuZWQgZWxlbWVudC5cbiAgICAgICAgICAgIHdoaWxlIChpLm5leHQgIT09IGhlYWQpIHtcbiAgICAgICAgICAgICAgaSA9IGkubmV4dDtcbiAgICAgICAgICAgICAgaWYgKCFpLmlzUmVtb3ZlZCgpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGtpbmQgPT09ICdrZXknKSB7XG4gICAgICAgICAgICAgICAgICByZXN1bHQgPSBpLmtleTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGtpbmQgPT09ICd2YWx1ZScpIHtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGkudmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IFtpLmtleSwgaS52YWx1ZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuaSA9IGk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHJlc3VsdCwgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gb25jZSB0aGUgaXRlcmF0b3IgaXMgZG9uZSwgaXQgaXMgZG9uZSBmb3JldmVyLlxuICAgICAgICAgICAgdGhpcy5pID0gdm9pZCAwO1xuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgYWRkSXRlcmF0b3IoTWFwSXRlcmF0b3IucHJvdG90eXBlKTtcblxuICAgICAgICBmdW5jdGlvbiBNYXAoaXRlcmFibGUpIHtcbiAgICAgICAgICB2YXIgbWFwID0gdGhpcztcbiAgICAgICAgICBpZiAoIUVTLlR5cGVJc09iamVjdChtYXApKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNYXAgZG9lcyBub3QgYWNjZXB0IGFyZ3VtZW50cyB3aGVuIGNhbGxlZCBhcyBhIGZ1bmN0aW9uJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG1hcCA9IGVtdWxhdGVFUzZjb25zdHJ1Y3QobWFwKTtcbiAgICAgICAgICBpZiAoIW1hcC5fZXM2bWFwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiYWQgbWFwJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIGhlYWQgPSBuZXcgTWFwRW50cnkobnVsbCwgbnVsbCk7XG4gICAgICAgICAgLy8gY2lyY3VsYXIgZG91Ymx5LWxpbmtlZCBsaXN0LlxuICAgICAgICAgIGhlYWQubmV4dCA9IGhlYWQucHJldiA9IGhlYWQ7XG5cbiAgICAgICAgICBkZWZpbmVQcm9wZXJ0aWVzKG1hcCwge1xuICAgICAgICAgICAgX2hlYWQ6IGhlYWQsXG4gICAgICAgICAgICBfc3RvcmFnZTogZW1wdHlPYmplY3QoKSxcbiAgICAgICAgICAgIF9zaXplOiAwXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBPcHRpb25hbGx5IGluaXRpYWxpemUgbWFwIGZyb20gaXRlcmFibGVcbiAgICAgICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlICE9PSAndW5kZWZpbmVkJyAmJiBpdGVyYWJsZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGl0ID0gRVMuR2V0SXRlcmF0b3IoaXRlcmFibGUpO1xuICAgICAgICAgICAgdmFyIGFkZGVyID0gbWFwLnNldDtcbiAgICAgICAgICAgIGlmICghRVMuSXNDYWxsYWJsZShhZGRlcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignYmFkIG1hcCcpOyB9XG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgICB2YXIgbmV4dCA9IEVTLkl0ZXJhdG9yTmV4dChpdCk7XG4gICAgICAgICAgICAgIGlmIChuZXh0LmRvbmUpIHsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgdmFyIG5leHRJdGVtID0gbmV4dC52YWx1ZTtcbiAgICAgICAgICAgICAgaWYgKCFFUy5UeXBlSXNPYmplY3QobmV4dEl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhwZWN0ZWQgaXRlcmFibGUgb2YgcGFpcnMnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBhZGRlci5jYWxsKG1hcCwgbmV4dEl0ZW1bMF0sIG5leHRJdGVtWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgTWFwJHByb3RvdHlwZSA9IE1hcC5wcm90b3R5cGU7XG4gICAgICAgIGRlZmluZVByb3BlcnRpZXMoTWFwLCB7XG4gICAgICAgICAgJ0BAY3JlYXRlJzogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgdmFyIGNvbnN0cnVjdG9yID0gdGhpcztcbiAgICAgICAgICAgIHZhciBwcm90b3R5cGUgPSBjb25zdHJ1Y3Rvci5wcm90b3R5cGUgfHwgTWFwJHByb3RvdHlwZTtcbiAgICAgICAgICAgIG9iaiA9IG9iaiB8fCBjcmVhdGUocHJvdG90eXBlKTtcbiAgICAgICAgICAgIGRlZmluZVByb3BlcnRpZXMob2JqLCB7IF9lczZtYXA6IHRydWUgfSk7XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE1hcC5wcm90b3R5cGUsICdzaXplJywge1xuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5fc2l6ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc2l6ZSBtZXRob2QgY2FsbGVkIG9uIGluY29tcGF0aWJsZSBNYXAnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zaXplO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGVmaW5lUHJvcGVydGllcyhNYXAucHJvdG90eXBlLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgZmtleSA9IGZhc3RrZXkoa2V5KTtcbiAgICAgICAgICAgIGlmIChma2V5ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIC8vIGZhc3QgTygxKSBwYXRoXG4gICAgICAgICAgICAgIHZhciBlbnRyeSA9IHRoaXMuX3N0b3JhZ2VbZmtleV07XG4gICAgICAgICAgICAgIGlmIChlbnRyeSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbnRyeS52YWx1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBoZWFkID0gdGhpcy5faGVhZCwgaSA9IGhlYWQ7XG4gICAgICAgICAgICB3aGlsZSAoKGkgPSBpLm5leHQpICE9PSBoZWFkKSB7XG4gICAgICAgICAgICAgIGlmIChFUy5TYW1lVmFsdWVaZXJvKGkua2V5LCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkudmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgaGFzOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgZmtleSA9IGZhc3RrZXkoa2V5KTtcbiAgICAgICAgICAgIGlmIChma2V5ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIC8vIGZhc3QgTygxKSBwYXRoXG4gICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgdGhpcy5fc3RvcmFnZVtma2V5XSAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaGVhZCA9IHRoaXMuX2hlYWQsIGkgPSBoZWFkO1xuICAgICAgICAgICAgd2hpbGUgKChpID0gaS5uZXh0KSAhPT0gaGVhZCkge1xuICAgICAgICAgICAgICBpZiAoRVMuU2FtZVZhbHVlWmVybyhpLmtleSwga2V5KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHNldDogZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBoZWFkID0gdGhpcy5faGVhZCwgaSA9IGhlYWQsIGVudHJ5O1xuICAgICAgICAgICAgdmFyIGZrZXkgPSBmYXN0a2V5KGtleSk7XG4gICAgICAgICAgICBpZiAoZmtleSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAvLyBmYXN0IE8oMSkgcGF0aFxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuX3N0b3JhZ2VbZmtleV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3RvcmFnZVtma2V5XS52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVudHJ5ID0gdGhpcy5fc3RvcmFnZVtma2V5XSA9IG5ldyBNYXBFbnRyeShrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBpID0gaGVhZC5wcmV2O1xuICAgICAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aGlsZSAoKGkgPSBpLm5leHQpICE9PSBoZWFkKSB7XG4gICAgICAgICAgICAgIGlmIChFUy5TYW1lVmFsdWVaZXJvKGkua2V5LCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgaS52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbnRyeSA9IGVudHJ5IHx8IG5ldyBNYXBFbnRyeShrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChFUy5TYW1lVmFsdWUoLTAsIGtleSkpIHtcbiAgICAgICAgICAgICAgZW50cnkua2V5ID0gKzA7IC8vIGNvZXJjZSAtMCB0byArMCBpbiBlbnRyeVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW50cnkubmV4dCA9IHRoaXMuX2hlYWQ7XG4gICAgICAgICAgICBlbnRyeS5wcmV2ID0gdGhpcy5faGVhZC5wcmV2O1xuICAgICAgICAgICAgZW50cnkucHJldi5uZXh0ID0gZW50cnk7XG4gICAgICAgICAgICBlbnRyeS5uZXh0LnByZXYgPSBlbnRyeTtcbiAgICAgICAgICAgIHRoaXMuX3NpemUgKz0gMTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICAnZGVsZXRlJzogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIGhlYWQgPSB0aGlzLl9oZWFkLCBpID0gaGVhZDtcbiAgICAgICAgICAgIHZhciBma2V5ID0gZmFzdGtleShrZXkpO1xuICAgICAgICAgICAgaWYgKGZrZXkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgLy8gZmFzdCBPKDEpIHBhdGhcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl9zdG9yYWdlW2ZrZXldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpID0gdGhpcy5fc3RvcmFnZVtma2V5XS5wcmV2O1xuICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fc3RvcmFnZVtma2V5XTtcbiAgICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aGlsZSAoKGkgPSBpLm5leHQpICE9PSBoZWFkKSB7XG4gICAgICAgICAgICAgIGlmIChFUy5TYW1lVmFsdWVaZXJvKGkua2V5LCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgaS5rZXkgPSBpLnZhbHVlID0gZW1wdHk7XG4gICAgICAgICAgICAgICAgaS5wcmV2Lm5leHQgPSBpLm5leHQ7XG4gICAgICAgICAgICAgICAgaS5uZXh0LnByZXYgPSBpLnByZXY7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2l6ZSAtPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9zaXplID0gMDtcbiAgICAgICAgICAgIHRoaXMuX3N0b3JhZ2UgPSBlbXB0eU9iamVjdCgpO1xuICAgICAgICAgICAgdmFyIGhlYWQgPSB0aGlzLl9oZWFkLCBpID0gaGVhZCwgcCA9IGkubmV4dDtcbiAgICAgICAgICAgIHdoaWxlICgoaSA9IHApICE9PSBoZWFkKSB7XG4gICAgICAgICAgICAgIGkua2V5ID0gaS52YWx1ZSA9IGVtcHR5O1xuICAgICAgICAgICAgICBwID0gaS5uZXh0O1xuICAgICAgICAgICAgICBpLm5leHQgPSBpLnByZXYgPSBoZWFkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaGVhZC5uZXh0ID0gaGVhZC5wcmV2ID0gaGVhZDtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAga2V5czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXBJdGVyYXRvcih0aGlzLCAna2V5Jyk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHZhbHVlczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXBJdGVyYXRvcih0aGlzLCAndmFsdWUnKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgZW50cmllczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXBJdGVyYXRvcih0aGlzLCAna2V5K3ZhbHVlJyk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGZvckVhY2g6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIGNvbnRleHQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IG51bGw7XG4gICAgICAgICAgICB2YXIgaXQgPSB0aGlzLmVudHJpZXMoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGVudHJ5ID0gaXQubmV4dCgpOyAhZW50cnkuZG9uZTsgZW50cnkgPSBpdC5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgaWYgKGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKGNvbnRleHQsIGVudHJ5LnZhbHVlWzFdLCBlbnRyeS52YWx1ZVswXSwgdGhpcyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZW50cnkudmFsdWVbMV0sIGVudHJ5LnZhbHVlWzBdLCB0aGlzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGFkZEl0ZXJhdG9yKE1hcC5wcm90b3R5cGUsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuZW50cmllcygpOyB9KTtcblxuICAgICAgICByZXR1cm4gTWFwO1xuICAgICAgfSkoKSxcblxuICAgICAgU2V0OiAoZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBDcmVhdGluZyBhIE1hcCBpcyBleHBlbnNpdmUuICBUbyBzcGVlZCB1cCB0aGUgY29tbW9uIGNhc2Ugb2ZcbiAgICAgICAgLy8gU2V0cyBjb250YWluaW5nIG9ubHkgc3RyaW5nIG9yIG51bWVyaWMga2V5cywgd2UgdXNlIGFuIG9iamVjdFxuICAgICAgICAvLyBhcyBiYWNraW5nIHN0b3JhZ2UgYW5kIGxhemlseSBjcmVhdGUgYSBmdWxsIE1hcCBvbmx5IHdoZW5cbiAgICAgICAgLy8gcmVxdWlyZWQuXG4gICAgICAgIHZhciBTZXRTaGltID0gZnVuY3Rpb24gU2V0KGl0ZXJhYmxlKSB7XG4gICAgICAgICAgdmFyIHNldCA9IHRoaXM7XG4gICAgICAgICAgaWYgKCFFUy5UeXBlSXNPYmplY3Qoc2V0KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU2V0IGRvZXMgbm90IGFjY2VwdCBhcmd1bWVudHMgd2hlbiBjYWxsZWQgYXMgYSBmdW5jdGlvbicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzZXQgPSBlbXVsYXRlRVM2Y29uc3RydWN0KHNldCk7XG4gICAgICAgICAgaWYgKCFzZXQuX2VzNnNldCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYmFkIHNldCcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRlZmluZVByb3BlcnRpZXMoc2V0LCB7XG4gICAgICAgICAgICAnW1tTZXREYXRhXV0nOiBudWxsLFxuICAgICAgICAgICAgX3N0b3JhZ2U6IGVtcHR5T2JqZWN0KClcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIE9wdGlvbmFsbHkgaW5pdGlhbGl6ZSBtYXAgZnJvbSBpdGVyYWJsZVxuICAgICAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUgIT09ICd1bmRlZmluZWQnICYmIGl0ZXJhYmxlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgaXQgPSBFUy5HZXRJdGVyYXRvcihpdGVyYWJsZSk7XG4gICAgICAgICAgICB2YXIgYWRkZXIgPSBzZXQuYWRkO1xuICAgICAgICAgICAgaWYgKCFFUy5Jc0NhbGxhYmxlKGFkZGVyKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdiYWQgc2V0Jyk7IH1cbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgIHZhciBuZXh0ID0gRVMuSXRlcmF0b3JOZXh0KGl0KTtcbiAgICAgICAgICAgICAgaWYgKG5leHQuZG9uZSkgeyBicmVhazsgfVxuICAgICAgICAgICAgICB2YXIgbmV4dEl0ZW0gPSBuZXh0LnZhbHVlO1xuICAgICAgICAgICAgICBhZGRlci5jYWxsKHNldCwgbmV4dEl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gc2V0O1xuICAgICAgICB9O1xuICAgICAgICB2YXIgU2V0JHByb3RvdHlwZSA9IFNldFNoaW0ucHJvdG90eXBlO1xuICAgICAgICBkZWZpbmVQcm9wZXJ0aWVzKFNldFNoaW0sIHtcbiAgICAgICAgICAnQEBjcmVhdGUnOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICB2YXIgY29uc3RydWN0b3IgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIHByb3RvdHlwZSA9IGNvbnN0cnVjdG9yLnByb3RvdHlwZSB8fCBTZXQkcHJvdG90eXBlO1xuICAgICAgICAgICAgb2JqID0gb2JqIHx8IGNyZWF0ZShwcm90b3R5cGUpO1xuICAgICAgICAgICAgZGVmaW5lUHJvcGVydGllcyhvYmosIHsgX2VzNnNldDogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTd2l0Y2ggZnJvbSB0aGUgb2JqZWN0IGJhY2tpbmcgc3RvcmFnZSB0byBhIGZ1bGwgTWFwLlxuICAgICAgICB2YXIgZW5zdXJlTWFwID0gZnVuY3Rpb24gZW5zdXJlTWFwKHNldCkge1xuICAgICAgICAgIGlmICghc2V0WydbW1NldERhdGFdXSddKSB7XG4gICAgICAgICAgICB2YXIgbSA9IHNldFsnW1tTZXREYXRhXV0nXSA9IG5ldyBjb2xsZWN0aW9uU2hpbXMuTWFwKCk7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhzZXQuX3N0b3JhZ2UpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgLy8gZmFzdCBjaGVjayBmb3IgbGVhZGluZyAnJCdcbiAgICAgICAgICAgICAgaWYgKGsuY2hhckNvZGVBdCgwKSA9PT0gMzYpIHtcbiAgICAgICAgICAgICAgICBrID0gay5zbGljZSgxKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChrLmNoYXJBdCgwKSA9PT0gJ24nKSB7XG4gICAgICAgICAgICAgICAgayA9ICtrLnNsaWNlKDEpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGsgPSAraztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBtLnNldChrLCBrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2V0Ll9zdG9yYWdlID0gbnVsbDsgLy8gZnJlZSBvbGQgYmFja2luZyBzdG9yYWdlXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTZXRTaGltLnByb3RvdHlwZSwgJ3NpemUnLCB7XG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl9zdG9yYWdlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGF1bG1pbGxyL2VzNi1zaGltL2lzc3Vlcy8xNzZcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc2l6ZSBtZXRob2QgY2FsbGVkIG9uIGluY29tcGF0aWJsZSBTZXQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVuc3VyZU1hcCh0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzWydbW1NldERhdGFdXSddLnNpemU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBkZWZpbmVQcm9wZXJ0aWVzKFNldFNoaW0ucHJvdG90eXBlLCB7XG4gICAgICAgICAgaGFzOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgZmtleTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdG9yYWdlICYmIChma2V5ID0gZmFzdGtleShrZXkpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICByZXR1cm4gISF0aGlzLl9zdG9yYWdlW2ZrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW5zdXJlTWFwKHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbJ1tbU2V0RGF0YV1dJ10uaGFzKGtleSk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGFkZDogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIGZrZXk7XG4gICAgICAgICAgICBpZiAodGhpcy5fc3RvcmFnZSAmJiAoZmtleSA9IGZhc3RrZXkoa2V5KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhpcy5fc3RvcmFnZVtma2V5XSA9IHRydWU7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW5zdXJlTWFwKHRoaXMpO1xuICAgICAgICAgICAgdGhpc1snW1tTZXREYXRhXV0nXS5zZXQoa2V5LCBrZXkpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgICdkZWxldGUnOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgZmtleTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdG9yYWdlICYmIChma2V5ID0gZmFzdGtleShrZXkpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICB2YXIgaGFzRktleSA9IF9oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuX3N0b3JhZ2UsIGZrZXkpO1xuICAgICAgICAgICAgICByZXR1cm4gKGRlbGV0ZSB0aGlzLl9zdG9yYWdlW2ZrZXldKSAmJiBoYXNGS2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW5zdXJlTWFwKHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbJ1tbU2V0RGF0YV1dJ11bJ2RlbGV0ZSddKGtleSk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fc3RvcmFnZSkge1xuICAgICAgICAgICAgICB0aGlzLl9zdG9yYWdlID0gZW1wdHlPYmplY3QoKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXNbJ1tbU2V0RGF0YV1dJ10uY2xlYXIoKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgdmFsdWVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBlbnN1cmVNYXAodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1snW1tTZXREYXRhXV0nXS52YWx1ZXMoKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgZW50cmllczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZW5zdXJlTWFwKHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbJ1tbU2V0RGF0YV1dJ10uZW50cmllcygpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBmb3JFYWNoOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiBudWxsO1xuICAgICAgICAgICAgdmFyIGVudGlyZVNldCA9IHRoaXM7XG4gICAgICAgICAgICBlbnN1cmVNYXAoZW50aXJlU2V0KTtcbiAgICAgICAgICAgIHRoaXNbJ1tbU2V0RGF0YV1dJ10uZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoY29udGV4dCwga2V5LCBrZXksIGVudGlyZVNldCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soa2V5LCBrZXksIGVudGlyZVNldCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGRlZmluZVByb3BlcnR5KFNldFNoaW0sICdrZXlzJywgU2V0U2hpbS52YWx1ZXMsIHRydWUpO1xuICAgICAgICBhZGRJdGVyYXRvcihTZXRTaGltLnByb3RvdHlwZSwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy52YWx1ZXMoKTsgfSk7XG5cbiAgICAgICAgcmV0dXJuIFNldFNoaW07XG4gICAgICB9KSgpXG4gICAgfTtcbiAgICBkZWZpbmVQcm9wZXJ0aWVzKGdsb2JhbHMsIGNvbGxlY3Rpb25TaGltcyk7XG5cbiAgICBpZiAoZ2xvYmFscy5NYXAgfHwgZ2xvYmFscy5TZXQpIHtcbiAgICAgIC8qXG4gICAgICAgIC0gSW4gRmlyZWZveCA8IDIzLCBNYXAjc2l6ZSBpcyBhIGZ1bmN0aW9uLlxuICAgICAgICAtIEluIGFsbCBjdXJyZW50IEZpcmVmb3gsIFNldCNlbnRyaWVzL2tleXMvdmFsdWVzICYgTWFwI2NsZWFyIGRvIG5vdCBleGlzdFxuICAgICAgICAtIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTg2OTk5NlxuICAgICAgICAtIEluIEZpcmVmb3ggMjQsIE1hcCBhbmQgU2V0IGRvIG5vdCBpbXBsZW1lbnQgZm9yRWFjaFxuICAgICAgICAtIEluIEZpcmVmb3ggMjUgYXQgbGVhc3QsIE1hcCBhbmQgU2V0IGFyZSBjYWxsYWJsZSB3aXRob3V0IFwibmV3XCJcbiAgICAgICovXG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiBnbG9iYWxzLk1hcC5wcm90b3R5cGUuY2xlYXIgIT09ICdmdW5jdGlvbicgfHxcbiAgICAgICAgbmV3IGdsb2JhbHMuU2V0KCkuc2l6ZSAhPT0gMCB8fFxuICAgICAgICBuZXcgZ2xvYmFscy5NYXAoKS5zaXplICE9PSAwIHx8XG4gICAgICAgIHR5cGVvZiBnbG9iYWxzLk1hcC5wcm90b3R5cGUua2V5cyAhPT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgICB0eXBlb2YgZ2xvYmFscy5TZXQucHJvdG90eXBlLmtleXMgIT09ICdmdW5jdGlvbicgfHxcbiAgICAgICAgdHlwZW9mIGdsb2JhbHMuTWFwLnByb3RvdHlwZS5mb3JFYWNoICE9PSAnZnVuY3Rpb24nIHx8XG4gICAgICAgIHR5cGVvZiBnbG9iYWxzLlNldC5wcm90b3R5cGUuZm9yRWFjaCAhPT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgICBpc0NhbGxhYmxlV2l0aG91dE5ldyhnbG9iYWxzLk1hcCkgfHxcbiAgICAgICAgaXNDYWxsYWJsZVdpdGhvdXROZXcoZ2xvYmFscy5TZXQpIHx8XG4gICAgICAgICFzdXBwb3J0c1N1YmNsYXNzaW5nKGdsb2JhbHMuTWFwLCBmdW5jdGlvbiAoTSkge1xuICAgICAgICAgIHZhciBtID0gbmV3IE0oW10pO1xuICAgICAgICAgIC8vIEZpcmVmb3ggMzIgaXMgb2sgd2l0aCB0aGUgaW5zdGFudGlhdGluZyB0aGUgc3ViY2xhc3MgYnV0IHdpbGxcbiAgICAgICAgICAvLyB0aHJvdyB3aGVuIHRoZSBtYXAgaXMgdXNlZC5cbiAgICAgICAgICBtLnNldCg0MiwgNDIpO1xuICAgICAgICAgIHJldHVybiBtIGluc3RhbmNlb2YgTTtcbiAgICAgICAgfSlcbiAgICAgICkge1xuICAgICAgICBnbG9iYWxzLk1hcCA9IGNvbGxlY3Rpb25TaGltcy5NYXA7XG4gICAgICAgIGdsb2JhbHMuU2V0ID0gY29sbGVjdGlvblNoaW1zLlNldDtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGdsb2JhbHMuU2V0LnByb3RvdHlwZS5rZXlzICE9PSBnbG9iYWxzLlNldC5wcm90b3R5cGUudmFsdWVzKSB7XG4gICAgICBkZWZpbmVQcm9wZXJ0eShnbG9iYWxzLlNldC5wcm90b3R5cGUsICdrZXlzJywgZ2xvYmFscy5TZXQucHJvdG90eXBlLnZhbHVlcywgdHJ1ZSk7XG4gICAgfVxuICAgIC8vIFNoaW0gaW5jb21wbGV0ZSBpdGVyYXRvciBpbXBsZW1lbnRhdGlvbnMuXG4gICAgYWRkSXRlcmF0b3IoT2JqZWN0LmdldFByb3RvdHlwZU9mKChuZXcgZ2xvYmFscy5NYXAoKSkua2V5cygpKSk7XG4gICAgYWRkSXRlcmF0b3IoT2JqZWN0LmdldFByb3RvdHlwZU9mKChuZXcgZ2xvYmFscy5TZXQoKSkua2V5cygpKSk7XG4gIH1cblxuICByZXR1cm4gZ2xvYmFscztcbn0pKTtcblxuXG59KS5jYWxsKHRoaXMscmVxdWlyZSgnX3Byb2Nlc3MnKSkiLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYSBtb2R1bGUuXG4gICAgZGVmaW5lKCdldmVudGFibGUnLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAocm9vdC5FdmVudGFibGUgPSBmYWN0b3J5KCkpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dCBvbmx5IENvbW1vbkpTLWxpa2VcbiAgICAvLyBlbnZpcm9tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsIGxpa2UgTm9kZS5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICByb290LkV2ZW50YWJsZSA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbigpIHtcblxuICAvLyBDb3B5IGFuZCBwYXN0ZWQgc3RyYWlnaHQgb3V0IG9mIEJhY2tib25lIDEuMC4wXG4gIC8vIFdlJ2xsIHRyeSBhbmQga2VlcCB0aGlzIHVwZGF0ZWQgdG8gdGhlIGxhdGVzdFxuXG4gIHZhciBhcnJheSA9IFtdO1xuICB2YXIgc2xpY2UgPSBhcnJheS5zbGljZTtcblxuICBmdW5jdGlvbiBvbmNlKGZ1bmMpIHtcbiAgICB2YXIgbWVtbywgdGltZXMgPSAyO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPiAwKSB7XG4gICAgICAgIG1lbW8gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmdW5jID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG4gIH1cblxuICAvLyBCYWNrYm9uZS5FdmVudHNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gQSBtb2R1bGUgdGhhdCBjYW4gYmUgbWl4ZWQgaW4gdG8gKmFueSBvYmplY3QqIGluIG9yZGVyIHRvIHByb3ZpZGUgaXQgd2l0aFxuICAvLyBjdXN0b20gZXZlbnRzLiBZb3UgbWF5IGJpbmQgd2l0aCBgb25gIG9yIHJlbW92ZSB3aXRoIGBvZmZgIGNhbGxiYWNrXG4gIC8vIGZ1bmN0aW9ucyB0byBhbiBldmVudDsgYHRyaWdnZXJgLWluZyBhbiBldmVudCBmaXJlcyBhbGwgY2FsbGJhY2tzIGluXG4gIC8vIHN1Y2Nlc3Npb24uXG4gIC8vXG4gIC8vICAgICB2YXIgb2JqZWN0ID0ge307XG4gIC8vICAgICBleHRlbmQob2JqZWN0LCBCYWNrYm9uZS5FdmVudHMpO1xuICAvLyAgICAgb2JqZWN0Lm9uKCdleHBhbmQnLCBmdW5jdGlvbigpeyBhbGVydCgnZXhwYW5kZWQnKTsgfSk7XG4gIC8vICAgICBvYmplY3QudHJpZ2dlcignZXhwYW5kJyk7XG4gIC8vXG4gIHZhciBFdmVudGFibGUgPSB7XG5cbiAgICAvLyBCaW5kIGFuIGV2ZW50IHRvIGEgYGNhbGxiYWNrYCBmdW5jdGlvbi4gUGFzc2luZyBgXCJhbGxcImAgd2lsbCBiaW5kXG4gICAgLy8gdGhlIGNhbGxiYWNrIHRvIGFsbCBldmVudHMgZmlyZWQuXG4gICAgb246IGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICBpZiAoIWV2ZW50c0FwaSh0aGlzLCAnb24nLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSB8fCAhY2FsbGJhY2spIHJldHVybiB0aGlzO1xuICAgICAgdGhpcy5fZXZlbnRzIHx8ICh0aGlzLl9ldmVudHMgPSB7fSk7XG4gICAgICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdIHx8ICh0aGlzLl9ldmVudHNbbmFtZV0gPSBbXSk7XG4gICAgICBldmVudHMucHVzaCh7Y2FsbGJhY2s6IGNhbGxiYWNrLCBjb250ZXh0OiBjb250ZXh0LCBjdHg6IGNvbnRleHQgfHwgdGhpc30pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIEJpbmQgYW4gZXZlbnQgdG8gb25seSBiZSB0cmlnZ2VyZWQgYSBzaW5nbGUgdGltZS4gQWZ0ZXIgdGhlIGZpcnN0IHRpbWVcbiAgICAvLyB0aGUgY2FsbGJhY2sgaXMgaW52b2tlZCwgaXQgd2lsbCBiZSByZW1vdmVkLlxuICAgIG9uY2U6IGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICBpZiAoIWV2ZW50c0FwaSh0aGlzLCAnb25jZScsIG5hbWUsIFtjYWxsYmFjaywgY29udGV4dF0pIHx8ICFjYWxsYmFjaykgcmV0dXJuIHRoaXM7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgZnVuYyA9IG9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYub2ZmKG5hbWUsIGZ1bmMpO1xuICAgICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfSk7XG4gICAgICBmdW5jLl9jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgcmV0dXJuIHRoaXMub24obmFtZSwgZnVuYywgY29udGV4dCk7XG4gICAgfSxcblxuICAgIC8vIFJlbW92ZSBvbmUgb3IgbWFueSBjYWxsYmFja3MuIElmIGBjb250ZXh0YCBpcyBudWxsLCByZW1vdmVzIGFsbFxuICAgIC8vIGNhbGxiYWNrcyB3aXRoIHRoYXQgZnVuY3Rpb24uIElmIGBjYWxsYmFja2AgaXMgbnVsbCwgcmVtb3ZlcyBhbGxcbiAgICAvLyBjYWxsYmFja3MgZm9yIHRoZSBldmVudC4gSWYgYG5hbWVgIGlzIG51bGwsIHJlbW92ZXMgYWxsIGJvdW5kXG4gICAgLy8gY2FsbGJhY2tzIGZvciBhbGwgZXZlbnRzLlxuICAgIG9mZjogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXRhaW4sIGV2LCBldmVudHMsIG5hbWVzLCBpLCBsLCBqLCBrO1xuICAgICAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIWV2ZW50c0FwaSh0aGlzLCAnb2ZmJywgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkpIHJldHVybiB0aGlzO1xuICAgICAgaWYgKCFuYW1lICYmICFjYWxsYmFjayAmJiAhY29udGV4dCkge1xuICAgICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIG5hbWVzID0gbmFtZSA/IFtuYW1lXSA6IE9iamVjdC5rZXlzKHRoaXMuX2V2ZW50cyk7XG4gICAgICBmb3IgKGkgPSAwLCBsID0gbmFtZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIG5hbWUgPSBuYW1lc1tpXTtcbiAgICAgICAgaWYgKGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXSkge1xuICAgICAgICAgIHRoaXMuX2V2ZW50c1tuYW1lXSA9IHJldGFpbiA9IFtdO1xuICAgICAgICAgIGlmIChjYWxsYmFjayB8fCBjb250ZXh0KSB7XG4gICAgICAgICAgICBmb3IgKGogPSAwLCBrID0gZXZlbnRzLmxlbmd0aDsgaiA8IGs7IGorKykge1xuICAgICAgICAgICAgICBldiA9IGV2ZW50c1tqXTtcbiAgICAgICAgICAgICAgaWYgKChjYWxsYmFjayAmJiBjYWxsYmFjayAhPT0gZXYuY2FsbGJhY2sgJiYgY2FsbGJhY2sgIT09IGV2LmNhbGxiYWNrLl9jYWxsYmFjaykgfHxcbiAgICAgICAgICAgICAgICAgIChjb250ZXh0ICYmIGNvbnRleHQgIT09IGV2LmNvbnRleHQpKSB7XG4gICAgICAgICAgICAgICAgcmV0YWluLnB1c2goZXYpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghcmV0YWluLmxlbmd0aCkgZGVsZXRlIHRoaXMuX2V2ZW50c1tuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gVHJpZ2dlciBvbmUgb3IgbWFueSBldmVudHMsIGZpcmluZyBhbGwgYm91bmQgY2FsbGJhY2tzLiBDYWxsYmFja3MgYXJlXG4gICAgLy8gcGFzc2VkIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyBgdHJpZ2dlcmAgaXMsIGFwYXJ0IGZyb20gdGhlIGV2ZW50IG5hbWVcbiAgICAvLyAodW5sZXNzIHlvdSdyZSBsaXN0ZW5pbmcgb24gYFwiYWxsXCJgLCB3aGljaCB3aWxsIGNhdXNlIHlvdXIgY2FsbGJhY2sgdG9cbiAgICAvLyByZWNlaXZlIHRoZSB0cnVlIG5hbWUgb2YgdGhlIGV2ZW50IGFzIHRoZSBmaXJzdCBhcmd1bWVudCkuXG4gICAgdHJpZ2dlcjogZnVuY3Rpb24obmFtZSkge1xuICAgICAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuICAgICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICBpZiAoIWV2ZW50c0FwaSh0aGlzLCAndHJpZ2dlcicsIG5hbWUsIGFyZ3MpKSByZXR1cm4gdGhpcztcbiAgICAgIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHNbbmFtZV07XG4gICAgICB2YXIgYWxsRXZlbnRzID0gdGhpcy5fZXZlbnRzLmFsbDtcbiAgICAgIGlmIChldmVudHMpIHRyaWdnZXJFdmVudHMoZXZlbnRzLCBhcmdzKTtcbiAgICAgIGlmIChhbGxFdmVudHMpIHRyaWdnZXJFdmVudHMoYWxsRXZlbnRzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIFRlbGwgdGhpcyBvYmplY3QgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gZWl0aGVyIHNwZWNpZmljIGV2ZW50cyAuLi4gb3JcbiAgICAvLyB0byBldmVyeSBvYmplY3QgaXQncyBjdXJyZW50bHkgbGlzdGVuaW5nIHRvLlxuICAgIHN0b3BMaXN0ZW5pbmc6IGZ1bmN0aW9uKG9iaiwgbmFtZSwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG4gICAgICBpZiAoIWxpc3RlbmVycykgcmV0dXJuIHRoaXM7XG4gICAgICB2YXIgZGVsZXRlTGlzdGVuZXIgPSAhbmFtZSAmJiAhY2FsbGJhY2s7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSBjYWxsYmFjayA9IHRoaXM7XG4gICAgICBpZiAob2JqKSAobGlzdGVuZXJzID0ge30pW29iai5fbGlzdGVuZXJJZF0gPSBvYmo7XG4gICAgICBmb3IgKHZhciBpZCBpbiBsaXN0ZW5lcnMpIHtcbiAgICAgICAgbGlzdGVuZXJzW2lkXS5vZmYobmFtZSwgY2FsbGJhY2ssIHRoaXMpO1xuICAgICAgICBpZiAoZGVsZXRlTGlzdGVuZXIpIGRlbGV0ZSB0aGlzLl9saXN0ZW5lcnNbaWRdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gIH07XG5cbiAgLy8gUmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gc3BsaXQgZXZlbnQgc3RyaW5ncy5cbiAgdmFyIGV2ZW50U3BsaXR0ZXIgPSAvXFxzKy87XG5cbiAgLy8gSW1wbGVtZW50IGZhbmN5IGZlYXR1cmVzIG9mIHRoZSBFdmVudHMgQVBJIHN1Y2ggYXMgbXVsdGlwbGUgZXZlbnRcbiAgLy8gbmFtZXMgYFwiY2hhbmdlIGJsdXJcImAgYW5kIGpRdWVyeS1zdHlsZSBldmVudCBtYXBzIGB7Y2hhbmdlOiBhY3Rpb259YFxuICAvLyBpbiB0ZXJtcyBvZiB0aGUgZXhpc3RpbmcgQVBJLlxuICB2YXIgZXZlbnRzQXBpID0gZnVuY3Rpb24ob2JqLCBhY3Rpb24sIG5hbWUsIHJlc3QpIHtcbiAgICBpZiAoIW5hbWUpIHJldHVybiB0cnVlO1xuXG4gICAgLy8gSGFuZGxlIGV2ZW50IG1hcHMuXG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgZm9yICh2YXIga2V5IGluIG5hbWUpIHtcbiAgICAgICAgb2JqW2FjdGlvbl0uYXBwbHkob2JqLCBba2V5LCBuYW1lW2tleV1dLmNvbmNhdChyZXN0KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHNwYWNlIHNlcGFyYXRlZCBldmVudCBuYW1lcy5cbiAgICBpZiAoZXZlbnRTcGxpdHRlci50ZXN0KG5hbWUpKSB7XG4gICAgICB2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KGV2ZW50U3BsaXR0ZXIpO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBuYW1lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgb2JqW2FjdGlvbl0uYXBwbHkob2JqLCBbbmFtZXNbaV1dLmNvbmNhdChyZXN0KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gQSBkaWZmaWN1bHQtdG8tYmVsaWV2ZSwgYnV0IG9wdGltaXplZCBpbnRlcm5hbCBkaXNwYXRjaCBmdW5jdGlvbiBmb3JcbiAgLy8gdHJpZ2dlcmluZyBldmVudHMuIFRyaWVzIHRvIGtlZXAgdGhlIHVzdWFsIGNhc2VzIHNwZWVkeSAobW9zdCBpbnRlcm5hbFxuICAvLyBCYWNrYm9uZSBldmVudHMgaGF2ZSAzIGFyZ3VtZW50cykuXG4gIHZhciB0cmlnZ2VyRXZlbnRzID0gZnVuY3Rpb24oZXZlbnRzLCBhcmdzKSB7XG4gICAgdmFyIGV2LCBpID0gLTEsIGwgPSBldmVudHMubGVuZ3RoLCBhMSA9IGFyZ3NbMF0sIGEyID0gYXJnc1sxXSwgYTMgPSBhcmdzWzJdO1xuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgpOyByZXR1cm47XG4gICAgICBjYXNlIDE6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4LCBhMSk7IHJldHVybjtcbiAgICAgIGNhc2UgMjogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExLCBhMik7IHJldHVybjtcbiAgICAgIGNhc2UgMzogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExLCBhMiwgYTMpOyByZXR1cm47XG4gICAgICBkZWZhdWx0OiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5hcHBseShldi5jdHgsIGFyZ3MpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgbGlzdGVuTWV0aG9kcyA9IHtsaXN0ZW5UbzogJ29uJywgbGlzdGVuVG9PbmNlOiAnb25jZSd9O1xuXG4gIC8vIEludmVyc2lvbi1vZi1jb250cm9sIHZlcnNpb25zIG9mIGBvbmAgYW5kIGBvbmNlYC4gVGVsbCAqdGhpcyogb2JqZWN0IHRvXG4gIC8vIGxpc3RlbiB0byBhbiBldmVudCBpbiBhbm90aGVyIG9iamVjdCAuLi4ga2VlcGluZyB0cmFjayBvZiB3aGF0IGl0J3NcbiAgLy8gbGlzdGVuaW5nIHRvLlxuICBmdW5jdGlvbiBhZGRMaXN0ZW5NZXRob2QobWV0aG9kLCBpbXBsZW1lbnRhdGlvbikge1xuICAgIEV2ZW50YWJsZVttZXRob2RdID0gZnVuY3Rpb24ob2JqLCBuYW1lLCBjYWxsYmFjaykge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycyB8fCAodGhpcy5fbGlzdGVuZXJzID0ge30pO1xuICAgICAgdmFyIGlkID0gb2JqLl9saXN0ZW5lcklkIHx8IChvYmouX2xpc3RlbmVySWQgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpKTtcbiAgICAgIGxpc3RlbmVyc1tpZF0gPSBvYmo7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSBjYWxsYmFjayA9IHRoaXM7XG4gICAgICBvYmpbaW1wbGVtZW50YXRpb25dKG5hbWUsIGNhbGxiYWNrLCB0aGlzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gIH1cblxuICBhZGRMaXN0ZW5NZXRob2QoJ2xpc3RlblRvJywgJ29uJyk7XG4gIGFkZExpc3Rlbk1ldGhvZCgnbGlzdGVuVG9PbmNlJywgJ29uY2UnKTtcblxuICAvLyBBbGlhc2VzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbiAgRXZlbnRhYmxlLmJpbmQgICA9IEV2ZW50YWJsZS5vbjtcbiAgRXZlbnRhYmxlLnVuYmluZCA9IEV2ZW50YWJsZS5vZmY7XG5cbiAgcmV0dXJuIEV2ZW50YWJsZTtcblxufSkpO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuTXV0YXRpb25PYnNlcnZlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXI7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgdmFyIHF1ZXVlID0gW107XG5cbiAgICBpZiAoY2FuTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICB2YXIgaGlkZGVuRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHF1ZXVlTGlzdCA9IHF1ZXVlLnNsaWNlKCk7XG4gICAgICAgICAgICBxdWV1ZS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgcXVldWVMaXN0LmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGhpZGRlbkRpdiwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgaWYgKCFxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBoaWRkZW5EaXYuc2V0QXR0cmlidXRlKCd5ZXMnLCAnbm8nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgZm9yT3duID0gcmVxdWlyZSgnbG9kYXNoLmZvcm93bicpLFxuICAgIGlzRnVuY3Rpb24gPSByZXF1aXJlKCdsb2Rhc2guaXNmdW5jdGlvbicpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHNob3J0Y3V0cyAqL1xudmFyIGFyZ3NDbGFzcyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5Q2xhc3MgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIG9iamVjdENsYXNzID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgc3RyaW5nQ2xhc3MgPSAnW29iamVjdCBTdHJpbmddJztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgaW50ZXJuYWwgW1tDbGFzc11dIG9mIHZhbHVlcyAqL1xudmFyIHRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgZW1wdHkuIEFycmF5cywgc3RyaW5ncywgb3IgYGFyZ3VtZW50c2Agb2JqZWN0cyB3aXRoIGFcbiAqIGxlbmd0aCBvZiBgMGAgYW5kIG9iamVjdHMgd2l0aCBubyBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGFyZSBjb25zaWRlcmVkXG4gKiBcImVtcHR5XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IHZhbHVlIFRoZSB2YWx1ZSB0byBpbnNwZWN0LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGVtcHR5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNFbXB0eShbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzRW1wdHkoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNFbXB0eSgnJyk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcbiAgdmFyIHJlc3VsdCA9IHRydWU7XG4gIGlmICghdmFsdWUpIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIHZhciBjbGFzc05hbWUgPSB0b1N0cmluZy5jYWxsKHZhbHVlKSxcbiAgICAgIGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcblxuICBpZiAoKGNsYXNzTmFtZSA9PSBhcnJheUNsYXNzIHx8IGNsYXNzTmFtZSA9PSBzdHJpbmdDbGFzcyB8fCBjbGFzc05hbWUgPT0gYXJnc0NsYXNzICkgfHxcbiAgICAgIChjbGFzc05hbWUgPT0gb2JqZWN0Q2xhc3MgJiYgdHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJyAmJiBpc0Z1bmN0aW9uKHZhbHVlLnNwbGljZSkpKSB7XG4gICAgcmV0dXJuICFsZW5ndGg7XG4gIH1cbiAgZm9yT3duKHZhbHVlLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKHJlc3VsdCA9IGZhbHNlKTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNFbXB0eTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgYmFzZUNyZWF0ZUNhbGxiYWNrID0gcmVxdWlyZSgnbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2snKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnbG9kYXNoLmtleXMnKSxcbiAgICBvYmplY3RUeXBlcyA9IHJlcXVpcmUoJ2xvZGFzaC5fb2JqZWN0dHlwZXMnKTtcblxuLyoqXG4gKiBJdGVyYXRlcyBvdmVyIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb2YgYW4gb2JqZWN0LCBleGVjdXRpbmcgdGhlIGNhbGxiYWNrXG4gKiBmb3IgZWFjaCBwcm9wZXJ0eS4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlXG4gKiBhcmd1bWVudHM7ICh2YWx1ZSwga2V5LCBvYmplY3QpLiBDYWxsYmFja3MgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5XG4gKiBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAdHlwZSBGdW5jdGlvblxuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5mb3JPd24oeyAnMCc6ICd6ZXJvJywgJzEnOiAnb25lJywgJ2xlbmd0aCc6IDIgfSwgZnVuY3Rpb24obnVtLCBrZXkpIHtcbiAqICAgY29uc29sZS5sb2coa2V5KTtcbiAqIH0pO1xuICogLy8gPT4gbG9ncyAnMCcsICcxJywgYW5kICdsZW5ndGgnIChwcm9wZXJ0eSBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCBhY3Jvc3MgZW52aXJvbm1lbnRzKVxuICovXG52YXIgZm9yT3duID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgdmFyIGluZGV4LCBpdGVyYWJsZSA9IGNvbGxlY3Rpb24sIHJlc3VsdCA9IGl0ZXJhYmxlO1xuICBpZiAoIWl0ZXJhYmxlKSByZXR1cm4gcmVzdWx0O1xuICBpZiAoIW9iamVjdFR5cGVzW3R5cGVvZiBpdGVyYWJsZV0pIHJldHVybiByZXN1bHQ7XG4gIGNhbGxiYWNrID0gY2FsbGJhY2sgJiYgdHlwZW9mIHRoaXNBcmcgPT0gJ3VuZGVmaW5lZCcgPyBjYWxsYmFjayA6IGJhc2VDcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgdmFyIG93bkluZGV4ID0gLTEsXG4gICAgICAgIG93blByb3BzID0gb2JqZWN0VHlwZXNbdHlwZW9mIGl0ZXJhYmxlXSAmJiBrZXlzKGl0ZXJhYmxlKSxcbiAgICAgICAgbGVuZ3RoID0gb3duUHJvcHMgPyBvd25Qcm9wcy5sZW5ndGggOiAwO1xuXG4gICAgd2hpbGUgKCsrb3duSW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIGluZGV4ID0gb3duUHJvcHNbb3duSW5kZXhdO1xuICAgICAgaWYgKGNhbGxiYWNrKGl0ZXJhYmxlW2luZGV4XSwgaW5kZXgsIGNvbGxlY3Rpb24pID09PSBmYWxzZSkgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIHJldHVybiByZXN1bHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZm9yT3duO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBiaW5kID0gcmVxdWlyZSgnbG9kYXNoLmJpbmQnKSxcbiAgICBpZGVudGl0eSA9IHJlcXVpcmUoJ2xvZGFzaC5pZGVudGl0eScpLFxuICAgIHNldEJpbmREYXRhID0gcmVxdWlyZSgnbG9kYXNoLl9zZXRiaW5kZGF0YScpLFxuICAgIHN1cHBvcnQgPSByZXF1aXJlKCdsb2Rhc2guc3VwcG9ydCcpO1xuXG4vKiogVXNlZCB0byBkZXRlY3RlZCBuYW1lZCBmdW5jdGlvbnMgKi9cbnZhciByZUZ1bmNOYW1lID0gL15cXHMqZnVuY3Rpb25bIFxcblxcclxcdF0rXFx3LztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGZ1bmN0aW9ucyBjb250YWluaW5nIGEgYHRoaXNgIHJlZmVyZW5jZSAqL1xudmFyIHJlVGhpcyA9IC9cXGJ0aGlzXFxiLztcblxuLyoqIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzICovXG52YXIgZm5Ub1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5jcmVhdGVDYWxsYmFja2Agd2l0aG91dCBzdXBwb3J0IGZvciBjcmVhdGluZ1xuICogXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IFtmdW5jPWlkZW50aXR5XSBUaGUgdmFsdWUgdG8gY29udmVydCB0byBhIGNhbGxiYWNrLlxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIHRoZSBjcmVhdGVkIGNhbGxiYWNrLlxuICogQHBhcmFtIHtudW1iZXJ9IFthcmdDb3VudF0gVGhlIG51bWJlciBvZiBhcmd1bWVudHMgdGhlIGNhbGxiYWNrIGFjY2VwdHMuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgYSBjYWxsYmFjayBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZUNyZWF0ZUNhbGxiYWNrKGZ1bmMsIHRoaXNBcmcsIGFyZ0NvdW50KSB7XG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGlkZW50aXR5O1xuICB9XG4gIC8vIGV4aXQgZWFybHkgZm9yIG5vIGB0aGlzQXJnYCBvciBhbHJlYWR5IGJvdW5kIGJ5IGBGdW5jdGlvbiNiaW5kYFxuICBpZiAodHlwZW9mIHRoaXNBcmcgPT0gJ3VuZGVmaW5lZCcgfHwgISgncHJvdG90eXBlJyBpbiBmdW5jKSkge1xuICAgIHJldHVybiBmdW5jO1xuICB9XG4gIHZhciBiaW5kRGF0YSA9IGZ1bmMuX19iaW5kRGF0YV9fO1xuICBpZiAodHlwZW9mIGJpbmREYXRhID09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHN1cHBvcnQuZnVuY05hbWVzKSB7XG4gICAgICBiaW5kRGF0YSA9ICFmdW5jLm5hbWU7XG4gICAgfVxuICAgIGJpbmREYXRhID0gYmluZERhdGEgfHwgIXN1cHBvcnQuZnVuY0RlY29tcDtcbiAgICBpZiAoIWJpbmREYXRhKSB7XG4gICAgICB2YXIgc291cmNlID0gZm5Ub1N0cmluZy5jYWxsKGZ1bmMpO1xuICAgICAgaWYgKCFzdXBwb3J0LmZ1bmNOYW1lcykge1xuICAgICAgICBiaW5kRGF0YSA9ICFyZUZ1bmNOYW1lLnRlc3Qoc291cmNlKTtcbiAgICAgIH1cbiAgICAgIGlmICghYmluZERhdGEpIHtcbiAgICAgICAgLy8gY2hlY2tzIGlmIGBmdW5jYCByZWZlcmVuY2VzIHRoZSBgdGhpc2Aga2V5d29yZCBhbmQgc3RvcmVzIHRoZSByZXN1bHRcbiAgICAgICAgYmluZERhdGEgPSByZVRoaXMudGVzdChzb3VyY2UpO1xuICAgICAgICBzZXRCaW5kRGF0YShmdW5jLCBiaW5kRGF0YSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vIGV4aXQgZWFybHkgaWYgdGhlcmUgYXJlIG5vIGB0aGlzYCByZWZlcmVuY2VzIG9yIGBmdW5jYCBpcyBib3VuZFxuICBpZiAoYmluZERhdGEgPT09IGZhbHNlIHx8IChiaW5kRGF0YSAhPT0gdHJ1ZSAmJiBiaW5kRGF0YVsxXSAmIDEpKSB7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH1cbiAgc3dpdGNoIChhcmdDb3VudCkge1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIHZhbHVlKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICB9O1xuICAgIGNhc2UgNDogcmV0dXJuIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gYmluZChmdW5jLCB0aGlzQXJnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQ3JlYXRlQ2FsbGJhY2s7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGlzTmF0aXZlID0gcmVxdWlyZSgnbG9kYXNoLl9pc25hdGl2ZScpLFxuICAgIG5vb3AgPSByZXF1aXJlKCdsb2Rhc2gubm9vcCcpO1xuXG4vKiogVXNlZCBhcyB0aGUgcHJvcGVydHkgZGVzY3JpcHRvciBmb3IgYF9fYmluZERhdGFfX2AgKi9cbnZhciBkZXNjcmlwdG9yID0ge1xuICAnY29uZmlndXJhYmxlJzogZmFsc2UsXG4gICdlbnVtZXJhYmxlJzogZmFsc2UsXG4gICd2YWx1ZSc6IG51bGwsXG4gICd3cml0YWJsZSc6IGZhbHNlXG59O1xuXG4vKiogVXNlZCB0byBzZXQgbWV0YSBkYXRhIG9uIGZ1bmN0aW9ucyAqL1xudmFyIGRlZmluZVByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICAvLyBJRSA4IG9ubHkgYWNjZXB0cyBET00gZWxlbWVudHNcbiAgdHJ5IHtcbiAgICB2YXIgbyA9IHt9LFxuICAgICAgICBmdW5jID0gaXNOYXRpdmUoZnVuYyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgJiYgZnVuYyxcbiAgICAgICAgcmVzdWx0ID0gZnVuYyhvLCBvLCBvKSAmJiBmdW5jO1xuICB9IGNhdGNoKGUpIHsgfVxuICByZXR1cm4gcmVzdWx0O1xufSgpKTtcblxuLyoqXG4gKiBTZXRzIGB0aGlzYCBiaW5kaW5nIGRhdGEgb24gYSBnaXZlbiBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gc2V0IGRhdGEgb24uXG4gKiBAcGFyYW0ge0FycmF5fSB2YWx1ZSBUaGUgZGF0YSBhcnJheSB0byBzZXQuXG4gKi9cbnZhciBzZXRCaW5kRGF0YSA9ICFkZWZpbmVQcm9wZXJ0eSA/IG5vb3AgOiBmdW5jdGlvbihmdW5jLCB2YWx1ZSkge1xuICBkZXNjcmlwdG9yLnZhbHVlID0gdmFsdWU7XG4gIGRlZmluZVByb3BlcnR5KGZ1bmMsICdfX2JpbmREYXRhX18nLCBkZXNjcmlwdG9yKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0QmluZERhdGE7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBpbnRlcm5hbCBbW0NsYXNzXV0gb2YgdmFsdWVzICovXG52YXIgdG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGlmIGEgbWV0aG9kIGlzIG5hdGl2ZSAqL1xudmFyIHJlTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gIFN0cmluZyh0b1N0cmluZylcbiAgICAucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKVxuICAgIC5yZXBsYWNlKC90b1N0cmluZ3wgZm9yIFteXFxdXSsvZywgJy4qPycpICsgJyQnXG4pO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc05hdGl2ZSh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbicgJiYgcmVOYXRpdmUudGVzdCh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNOYXRpdmU7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKipcbiAqIEEgbm8tb3BlcmF0aW9uIGZ1bmN0aW9uLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICduYW1lJzogJ2ZyZWQnIH07XG4gKiBfLm5vb3Aob2JqZWN0KSA9PT0gdW5kZWZpbmVkO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBub29wKCkge1xuICAvLyBubyBvcGVyYXRpb24gcGVyZm9ybWVkXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbm9vcDtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgY3JlYXRlV3JhcHBlciA9IHJlcXVpcmUoJ2xvZGFzaC5fY3JlYXRld3JhcHBlcicpLFxuICAgIHNsaWNlID0gcmVxdWlyZSgnbG9kYXNoLl9zbGljZScpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgaW52b2tlcyBgZnVuY2Agd2l0aCB0aGUgYHRoaXNgXG4gKiBiaW5kaW5nIG9mIGB0aGlzQXJnYCBhbmQgcHJlcGVuZHMgYW55IGFkZGl0aW9uYWwgYGJpbmRgIGFyZ3VtZW50cyB0byB0aG9zZVxuICogcHJvdmlkZWQgdG8gdGhlIGJvdW5kIGZ1bmN0aW9uLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25zXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBiaW5kLlxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBmdW5jYC5cbiAqIEBwYXJhbSB7Li4uKn0gW2FyZ10gQXJndW1lbnRzIHRvIGJlIHBhcnRpYWxseSBhcHBsaWVkLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYm91bmQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBmdW5jID0gZnVuY3Rpb24oZ3JlZXRpbmcpIHtcbiAqICAgcmV0dXJuIGdyZWV0aW5nICsgJyAnICsgdGhpcy5uYW1lO1xuICogfTtcbiAqXG4gKiBmdW5jID0gXy5iaW5kKGZ1bmMsIHsgJ25hbWUnOiAnZnJlZCcgfSwgJ2hpJyk7XG4gKiBmdW5jKCk7XG4gKiAvLyA9PiAnaGkgZnJlZCdcbiAqL1xuZnVuY3Rpb24gYmluZChmdW5jLCB0aGlzQXJnKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMlxuICAgID8gY3JlYXRlV3JhcHBlcihmdW5jLCAxNywgc2xpY2UoYXJndW1lbnRzLCAyKSwgbnVsbCwgdGhpc0FyZylcbiAgICA6IGNyZWF0ZVdyYXBwZXIoZnVuYywgMSwgbnVsbCwgbnVsbCwgdGhpc0FyZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmluZDtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgYmFzZUJpbmQgPSByZXF1aXJlKCdsb2Rhc2guX2Jhc2ViaW5kJyksXG4gICAgYmFzZUNyZWF0ZVdyYXBwZXIgPSByZXF1aXJlKCdsb2Rhc2guX2Jhc2VjcmVhdGV3cmFwcGVyJyksXG4gICAgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJ2xvZGFzaC5pc2Z1bmN0aW9uJyksXG4gICAgc2xpY2UgPSByZXF1aXJlKCdsb2Rhc2guX3NsaWNlJyk7XG5cbi8qKlxuICogVXNlZCBmb3IgYEFycmF5YCBtZXRob2QgcmVmZXJlbmNlcy5cbiAqXG4gKiBOb3JtYWxseSBgQXJyYXkucHJvdG90eXBlYCB3b3VsZCBzdWZmaWNlLCBob3dldmVyLCB1c2luZyBhbiBhcnJheSBsaXRlcmFsXG4gKiBhdm9pZHMgaXNzdWVzIGluIE5hcndoYWwuXG4gKi9cbnZhciBhcnJheVJlZiA9IFtdO1xuXG4vKiogTmF0aXZlIG1ldGhvZCBzaG9ydGN1dHMgKi9cbnZhciBwdXNoID0gYXJyYXlSZWYucHVzaCxcbiAgICB1bnNoaWZ0ID0gYXJyYXlSZWYudW5zaGlmdDtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIGVpdGhlciBjdXJyaWVzIG9yIGludm9rZXMgYGZ1bmNgXG4gKiB3aXRoIGFuIG9wdGlvbmFsIGB0aGlzYCBiaW5kaW5nIGFuZCBwYXJ0aWFsbHkgYXBwbGllZCBhcmd1bWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb258c3RyaW5nfSBmdW5jIFRoZSBmdW5jdGlvbiBvciBtZXRob2QgbmFtZSB0byByZWZlcmVuY2UuXG4gKiBAcGFyYW0ge251bWJlcn0gYml0bWFzayBUaGUgYml0bWFzayBvZiBtZXRob2QgZmxhZ3MgdG8gY29tcG9zZS5cbiAqICBUaGUgYml0bWFzayBtYXkgYmUgY29tcG9zZWQgb2YgdGhlIGZvbGxvd2luZyBmbGFnczpcbiAqICAxIC0gYF8uYmluZGBcbiAqICAyIC0gYF8uYmluZEtleWBcbiAqICA0IC0gYF8uY3VycnlgXG4gKiAgOCAtIGBfLmN1cnJ5YCAoYm91bmQpXG4gKiAgMTYgLSBgXy5wYXJ0aWFsYFxuICogIDMyIC0gYF8ucGFydGlhbFJpZ2h0YFxuICogQHBhcmFtIHtBcnJheX0gW3BhcnRpYWxBcmdzXSBBbiBhcnJheSBvZiBhcmd1bWVudHMgdG8gcHJlcGVuZCB0byB0aG9zZVxuICogIHByb3ZpZGVkIHRvIHRoZSBuZXcgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge0FycmF5fSBbcGFydGlhbFJpZ2h0QXJnc10gQW4gYXJyYXkgb2YgYXJndW1lbnRzIHRvIGFwcGVuZCB0byB0aG9zZVxuICogIHByb3ZpZGVkIHRvIHRoZSBuZXcgZnVuY3Rpb24uXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGZ1bmNgLlxuICogQHBhcmFtIHtudW1iZXJ9IFthcml0eV0gVGhlIGFyaXR5IG9mIGBmdW5jYC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVXcmFwcGVyKGZ1bmMsIGJpdG1hc2ssIHBhcnRpYWxBcmdzLCBwYXJ0aWFsUmlnaHRBcmdzLCB0aGlzQXJnLCBhcml0eSkge1xuICB2YXIgaXNCaW5kID0gYml0bWFzayAmIDEsXG4gICAgICBpc0JpbmRLZXkgPSBiaXRtYXNrICYgMixcbiAgICAgIGlzQ3VycnkgPSBiaXRtYXNrICYgNCxcbiAgICAgIGlzQ3VycnlCb3VuZCA9IGJpdG1hc2sgJiA4LFxuICAgICAgaXNQYXJ0aWFsID0gYml0bWFzayAmIDE2LFxuICAgICAgaXNQYXJ0aWFsUmlnaHQgPSBiaXRtYXNrICYgMzI7XG5cbiAgaWYgKCFpc0JpbmRLZXkgJiYgIWlzRnVuY3Rpb24oZnVuYykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICB9XG4gIGlmIChpc1BhcnRpYWwgJiYgIXBhcnRpYWxBcmdzLmxlbmd0aCkge1xuICAgIGJpdG1hc2sgJj0gfjE2O1xuICAgIGlzUGFydGlhbCA9IHBhcnRpYWxBcmdzID0gZmFsc2U7XG4gIH1cbiAgaWYgKGlzUGFydGlhbFJpZ2h0ICYmICFwYXJ0aWFsUmlnaHRBcmdzLmxlbmd0aCkge1xuICAgIGJpdG1hc2sgJj0gfjMyO1xuICAgIGlzUGFydGlhbFJpZ2h0ID0gcGFydGlhbFJpZ2h0QXJncyA9IGZhbHNlO1xuICB9XG4gIHZhciBiaW5kRGF0YSA9IGZ1bmMgJiYgZnVuYy5fX2JpbmREYXRhX187XG4gIGlmIChiaW5kRGF0YSAmJiBiaW5kRGF0YSAhPT0gdHJ1ZSkge1xuICAgIC8vIGNsb25lIGBiaW5kRGF0YWBcbiAgICBiaW5kRGF0YSA9IHNsaWNlKGJpbmREYXRhKTtcbiAgICBpZiAoYmluZERhdGFbMl0pIHtcbiAgICAgIGJpbmREYXRhWzJdID0gc2xpY2UoYmluZERhdGFbMl0pO1xuICAgIH1cbiAgICBpZiAoYmluZERhdGFbM10pIHtcbiAgICAgIGJpbmREYXRhWzNdID0gc2xpY2UoYmluZERhdGFbM10pO1xuICAgIH1cbiAgICAvLyBzZXQgYHRoaXNCaW5kaW5nYCBpcyBub3QgcHJldmlvdXNseSBib3VuZFxuICAgIGlmIChpc0JpbmQgJiYgIShiaW5kRGF0YVsxXSAmIDEpKSB7XG4gICAgICBiaW5kRGF0YVs0XSA9IHRoaXNBcmc7XG4gICAgfVxuICAgIC8vIHNldCBpZiBwcmV2aW91c2x5IGJvdW5kIGJ1dCBub3QgY3VycmVudGx5IChzdWJzZXF1ZW50IGN1cnJpZWQgZnVuY3Rpb25zKVxuICAgIGlmICghaXNCaW5kICYmIGJpbmREYXRhWzFdICYgMSkge1xuICAgICAgYml0bWFzayB8PSA4O1xuICAgIH1cbiAgICAvLyBzZXQgY3VycmllZCBhcml0eSBpZiBub3QgeWV0IHNldFxuICAgIGlmIChpc0N1cnJ5ICYmICEoYmluZERhdGFbMV0gJiA0KSkge1xuICAgICAgYmluZERhdGFbNV0gPSBhcml0eTtcbiAgICB9XG4gICAgLy8gYXBwZW5kIHBhcnRpYWwgbGVmdCBhcmd1bWVudHNcbiAgICBpZiAoaXNQYXJ0aWFsKSB7XG4gICAgICBwdXNoLmFwcGx5KGJpbmREYXRhWzJdIHx8IChiaW5kRGF0YVsyXSA9IFtdKSwgcGFydGlhbEFyZ3MpO1xuICAgIH1cbiAgICAvLyBhcHBlbmQgcGFydGlhbCByaWdodCBhcmd1bWVudHNcbiAgICBpZiAoaXNQYXJ0aWFsUmlnaHQpIHtcbiAgICAgIHVuc2hpZnQuYXBwbHkoYmluZERhdGFbM10gfHwgKGJpbmREYXRhWzNdID0gW10pLCBwYXJ0aWFsUmlnaHRBcmdzKTtcbiAgICB9XG4gICAgLy8gbWVyZ2UgZmxhZ3NcbiAgICBiaW5kRGF0YVsxXSB8PSBiaXRtYXNrO1xuICAgIHJldHVybiBjcmVhdGVXcmFwcGVyLmFwcGx5KG51bGwsIGJpbmREYXRhKTtcbiAgfVxuICAvLyBmYXN0IHBhdGggZm9yIGBfLmJpbmRgXG4gIHZhciBjcmVhdGVyID0gKGJpdG1hc2sgPT0gMSB8fCBiaXRtYXNrID09PSAxNykgPyBiYXNlQmluZCA6IGJhc2VDcmVhdGVXcmFwcGVyO1xuICByZXR1cm4gY3JlYXRlcihbZnVuYywgYml0bWFzaywgcGFydGlhbEFyZ3MsIHBhcnRpYWxSaWdodEFyZ3MsIHRoaXNBcmcsIGFyaXR5XSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlV3JhcHBlcjtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgYmFzZUNyZWF0ZSA9IHJlcXVpcmUoJ2xvZGFzaC5fYmFzZWNyZWF0ZScpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoLmlzb2JqZWN0JyksXG4gICAgc2V0QmluZERhdGEgPSByZXF1aXJlKCdsb2Rhc2guX3NldGJpbmRkYXRhJyksXG4gICAgc2xpY2UgPSByZXF1aXJlKCdsb2Rhc2guX3NsaWNlJyk7XG5cbi8qKlxuICogVXNlZCBmb3IgYEFycmF5YCBtZXRob2QgcmVmZXJlbmNlcy5cbiAqXG4gKiBOb3JtYWxseSBgQXJyYXkucHJvdG90eXBlYCB3b3VsZCBzdWZmaWNlLCBob3dldmVyLCB1c2luZyBhbiBhcnJheSBsaXRlcmFsXG4gKiBhdm9pZHMgaXNzdWVzIGluIE5hcndoYWwuXG4gKi9cbnZhciBhcnJheVJlZiA9IFtdO1xuXG4vKiogTmF0aXZlIG1ldGhvZCBzaG9ydGN1dHMgKi9cbnZhciBwdXNoID0gYXJyYXlSZWYucHVzaDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5iaW5kYCB0aGF0IGNyZWF0ZXMgdGhlIGJvdW5kIGZ1bmN0aW9uIGFuZFxuICogc2V0cyBpdHMgbWV0YSBkYXRhLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBiaW5kRGF0YSBUaGUgYmluZCBkYXRhIGFycmF5LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYm91bmQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VCaW5kKGJpbmREYXRhKSB7XG4gIHZhciBmdW5jID0gYmluZERhdGFbMF0sXG4gICAgICBwYXJ0aWFsQXJncyA9IGJpbmREYXRhWzJdLFxuICAgICAgdGhpc0FyZyA9IGJpbmREYXRhWzRdO1xuXG4gIGZ1bmN0aW9uIGJvdW5kKCkge1xuICAgIC8vIGBGdW5jdGlvbiNiaW5kYCBzcGVjXG4gICAgLy8gaHR0cDovL2VzNS5naXRodWIuaW8vI3gxNS4zLjQuNVxuICAgIGlmIChwYXJ0aWFsQXJncykge1xuICAgICAgLy8gYXZvaWQgYGFyZ3VtZW50c2Agb2JqZWN0IGRlb3B0aW1pemF0aW9ucyBieSB1c2luZyBgc2xpY2VgIGluc3RlYWRcbiAgICAgIC8vIG9mIGBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbGAgYW5kIG5vdCBhc3NpZ25pbmcgYGFyZ3VtZW50c2AgdG8gYVxuICAgICAgLy8gdmFyaWFibGUgYXMgYSB0ZXJuYXJ5IGV4cHJlc3Npb25cbiAgICAgIHZhciBhcmdzID0gc2xpY2UocGFydGlhbEFyZ3MpO1xuICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgICAvLyBtaW1pYyB0aGUgY29uc3RydWN0b3IncyBgcmV0dXJuYCBiZWhhdmlvclxuICAgIC8vIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTMuMi4yXG4gICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBib3VuZCkge1xuICAgICAgLy8gZW5zdXJlIGBuZXcgYm91bmRgIGlzIGFuIGluc3RhbmNlIG9mIGBmdW5jYFxuICAgICAgdmFyIHRoaXNCaW5kaW5nID0gYmFzZUNyZWF0ZShmdW5jLnByb3RvdHlwZSksXG4gICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQmluZGluZywgYXJncyB8fCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIGlzT2JqZWN0KHJlc3VsdCkgPyByZXN1bHQgOiB0aGlzQmluZGluZztcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyB8fCBhcmd1bWVudHMpO1xuICB9XG4gIHNldEJpbmREYXRhKGJvdW5kLCBiaW5kRGF0YSk7XG4gIHJldHVybiBib3VuZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQmluZDtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgaXNOYXRpdmUgPSByZXF1aXJlKCdsb2Rhc2guX2lzbmF0aXZlJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCdsb2Rhc2guaXNvYmplY3QnKSxcbiAgICBub29wID0gcmVxdWlyZSgnbG9kYXNoLm5vb3AnKTtcblxuLyogTmF0aXZlIG1ldGhvZCBzaG9ydGN1dHMgZm9yIG1ldGhvZHMgd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMgKi9cbnZhciBuYXRpdmVDcmVhdGUgPSBpc05hdGl2ZShuYXRpdmVDcmVhdGUgPSBPYmplY3QuY3JlYXRlKSAmJiBuYXRpdmVDcmVhdGU7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY3JlYXRlYCB3aXRob3V0IHN1cHBvcnQgZm9yIGFzc2lnbmluZ1xuICogcHJvcGVydGllcyB0byB0aGUgY3JlYXRlZCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBwcm90b3R5cGUgVGhlIG9iamVjdCB0byBpbmhlcml0IGZyb20uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBuZXcgb2JqZWN0LlxuICovXG5mdW5jdGlvbiBiYXNlQ3JlYXRlKHByb3RvdHlwZSwgcHJvcGVydGllcykge1xuICByZXR1cm4gaXNPYmplY3QocHJvdG90eXBlKSA/IG5hdGl2ZUNyZWF0ZShwcm90b3R5cGUpIDoge307XG59XG4vLyBmYWxsYmFjayBmb3IgYnJvd3NlcnMgd2l0aG91dCBgT2JqZWN0LmNyZWF0ZWBcbmlmICghbmF0aXZlQ3JlYXRlKSB7XG4gIGJhc2VDcmVhdGUgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gT2JqZWN0KCkge31cbiAgICByZXR1cm4gZnVuY3Rpb24ocHJvdG90eXBlKSB7XG4gICAgICBpZiAoaXNPYmplY3QocHJvdG90eXBlKSkge1xuICAgICAgICBPYmplY3QucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IE9iamVjdDtcbiAgICAgICAgT2JqZWN0LnByb3RvdHlwZSA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0IHx8IGdsb2JhbC5PYmplY3QoKTtcbiAgICB9O1xuICB9KCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VDcmVhdGU7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgYmFzZUNyZWF0ZSA9IHJlcXVpcmUoJ2xvZGFzaC5fYmFzZWNyZWF0ZScpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoLmlzb2JqZWN0JyksXG4gICAgc2V0QmluZERhdGEgPSByZXF1aXJlKCdsb2Rhc2guX3NldGJpbmRkYXRhJyksXG4gICAgc2xpY2UgPSByZXF1aXJlKCdsb2Rhc2guX3NsaWNlJyk7XG5cbi8qKlxuICogVXNlZCBmb3IgYEFycmF5YCBtZXRob2QgcmVmZXJlbmNlcy5cbiAqXG4gKiBOb3JtYWxseSBgQXJyYXkucHJvdG90eXBlYCB3b3VsZCBzdWZmaWNlLCBob3dldmVyLCB1c2luZyBhbiBhcnJheSBsaXRlcmFsXG4gKiBhdm9pZHMgaXNzdWVzIGluIE5hcndoYWwuXG4gKi9cbnZhciBhcnJheVJlZiA9IFtdO1xuXG4vKiogTmF0aXZlIG1ldGhvZCBzaG9ydGN1dHMgKi9cbnZhciBwdXNoID0gYXJyYXlSZWYucHVzaDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgY3JlYXRlV3JhcHBlcmAgdGhhdCBjcmVhdGVzIHRoZSB3cmFwcGVyIGFuZFxuICogc2V0cyBpdHMgbWV0YSBkYXRhLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBiaW5kRGF0YSBUaGUgYmluZCBkYXRhIGFycmF5LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VDcmVhdGVXcmFwcGVyKGJpbmREYXRhKSB7XG4gIHZhciBmdW5jID0gYmluZERhdGFbMF0sXG4gICAgICBiaXRtYXNrID0gYmluZERhdGFbMV0sXG4gICAgICBwYXJ0aWFsQXJncyA9IGJpbmREYXRhWzJdLFxuICAgICAgcGFydGlhbFJpZ2h0QXJncyA9IGJpbmREYXRhWzNdLFxuICAgICAgdGhpc0FyZyA9IGJpbmREYXRhWzRdLFxuICAgICAgYXJpdHkgPSBiaW5kRGF0YVs1XTtcblxuICB2YXIgaXNCaW5kID0gYml0bWFzayAmIDEsXG4gICAgICBpc0JpbmRLZXkgPSBiaXRtYXNrICYgMixcbiAgICAgIGlzQ3VycnkgPSBiaXRtYXNrICYgNCxcbiAgICAgIGlzQ3VycnlCb3VuZCA9IGJpdG1hc2sgJiA4LFxuICAgICAga2V5ID0gZnVuYztcblxuICBmdW5jdGlvbiBib3VuZCgpIHtcbiAgICB2YXIgdGhpc0JpbmRpbmcgPSBpc0JpbmQgPyB0aGlzQXJnIDogdGhpcztcbiAgICBpZiAocGFydGlhbEFyZ3MpIHtcbiAgICAgIHZhciBhcmdzID0gc2xpY2UocGFydGlhbEFyZ3MpO1xuICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgICBpZiAocGFydGlhbFJpZ2h0QXJncyB8fCBpc0N1cnJ5KSB7XG4gICAgICBhcmdzIHx8IChhcmdzID0gc2xpY2UoYXJndW1lbnRzKSk7XG4gICAgICBpZiAocGFydGlhbFJpZ2h0QXJncykge1xuICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIHBhcnRpYWxSaWdodEFyZ3MpO1xuICAgICAgfVxuICAgICAgaWYgKGlzQ3VycnkgJiYgYXJncy5sZW5ndGggPCBhcml0eSkge1xuICAgICAgICBiaXRtYXNrIHw9IDE2ICYgfjMyO1xuICAgICAgICByZXR1cm4gYmFzZUNyZWF0ZVdyYXBwZXIoW2Z1bmMsIChpc0N1cnJ5Qm91bmQgPyBiaXRtYXNrIDogYml0bWFzayAmIH4zKSwgYXJncywgbnVsbCwgdGhpc0FyZywgYXJpdHldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgYXJncyB8fCAoYXJncyA9IGFyZ3VtZW50cyk7XG4gICAgaWYgKGlzQmluZEtleSkge1xuICAgICAgZnVuYyA9IHRoaXNCaW5kaW5nW2tleV07XG4gICAgfVxuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgYm91bmQpIHtcbiAgICAgIHRoaXNCaW5kaW5nID0gYmFzZUNyZWF0ZShmdW5jLnByb3RvdHlwZSk7XG4gICAgICB2YXIgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQmluZGluZywgYXJncyk7XG4gICAgICByZXR1cm4gaXNPYmplY3QocmVzdWx0KSA/IHJlc3VsdCA6IHRoaXNCaW5kaW5nO1xuICAgIH1cbiAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQmluZGluZywgYXJncyk7XG4gIH1cbiAgc2V0QmluZERhdGEoYm91bmQsIGJpbmREYXRhKTtcbiAgcmV0dXJuIGJvdW5kO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VDcmVhdGVXcmFwcGVyO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBTbGljZXMgdGhlIGBjb2xsZWN0aW9uYCBmcm9tIHRoZSBgc3RhcnRgIGluZGV4IHVwIHRvLCBidXQgbm90IGluY2x1ZGluZyxcbiAqIHRoZSBgZW5kYCBpbmRleC5cbiAqXG4gKiBOb3RlOiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgaW5zdGVhZCBvZiBgQXJyYXkjc2xpY2VgIHRvIHN1cHBvcnQgbm9kZSBsaXN0c1xuICogaW4gSUUgPCA5IGFuZCB0byBlbnN1cmUgZGVuc2UgYXJyYXlzIGFyZSByZXR1cm5lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIHNsaWNlLlxuICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0IFRoZSBzdGFydCBpbmRleC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBlbmQgVGhlIGVuZCBpbmRleC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGFycmF5LlxuICovXG5mdW5jdGlvbiBzbGljZShhcnJheSwgc3RhcnQsIGVuZCkge1xuICBzdGFydCB8fCAoc3RhcnQgPSAwKTtcbiAgaWYgKHR5cGVvZiBlbmQgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBlbmQgPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDA7XG4gIH1cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbmQgLSBzdGFydCB8fCAwLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGgpO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGFycmF5W3N0YXJ0ICsgaW5kZXhdO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2xpY2U7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IHByb3ZpZGVkIHRvIGl0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gKiBAcGFyYW0geyp9IHZhbHVlIEFueSB2YWx1ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICduYW1lJzogJ2ZyZWQnIH07XG4gKiBfLmlkZW50aXR5KG9iamVjdCkgPT09IG9iamVjdDtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlkZW50aXR5O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBpc05hdGl2ZSA9IHJlcXVpcmUoJ2xvZGFzaC5faXNuYXRpdmUnKTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGZ1bmN0aW9ucyBjb250YWluaW5nIGEgYHRoaXNgIHJlZmVyZW5jZSAqL1xudmFyIHJlVGhpcyA9IC9cXGJ0aGlzXFxiLztcblxuLyoqXG4gKiBBbiBvYmplY3QgdXNlZCB0byBmbGFnIGVudmlyb25tZW50cyBmZWF0dXJlcy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHR5cGUgT2JqZWN0XG4gKi9cbnZhciBzdXBwb3J0ID0ge307XG5cbi8qKlxuICogRGV0ZWN0IGlmIGZ1bmN0aW9ucyBjYW4gYmUgZGVjb21waWxlZCBieSBgRnVuY3Rpb24jdG9TdHJpbmdgXG4gKiAoYWxsIGJ1dCBQUzMgYW5kIG9sZGVyIE9wZXJhIG1vYmlsZSBicm93c2VycyAmIGF2b2lkZWQgaW4gV2luZG93cyA4IGFwcHMpLlxuICpcbiAqIEBtZW1iZXJPZiBfLnN1cHBvcnRcbiAqIEB0eXBlIGJvb2xlYW5cbiAqL1xuc3VwcG9ydC5mdW5jRGVjb21wID0gIWlzTmF0aXZlKGdsb2JhbC5XaW5SVEVycm9yKSAmJiByZVRoaXMudGVzdChmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pO1xuXG4vKipcbiAqIERldGVjdCBpZiBgRnVuY3Rpb24jbmFtZWAgaXMgc3VwcG9ydGVkIChhbGwgYnV0IElFKS5cbiAqXG4gKiBAbWVtYmVyT2YgXy5zdXBwb3J0XG4gKiBAdHlwZSBib29sZWFuXG4gKi9cbnN1cHBvcnQuZnVuY05hbWVzID0gdHlwZW9mIEZ1bmN0aW9uLm5hbWUgPT0gJ3N0cmluZyc7XG5cbm1vZHVsZS5leHBvcnRzID0gc3VwcG9ydDtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqIFVzZWQgdG8gZGV0ZXJtaW5lIGlmIHZhbHVlcyBhcmUgb2YgdGhlIGxhbmd1YWdlIHR5cGUgT2JqZWN0ICovXG52YXIgb2JqZWN0VHlwZXMgPSB7XG4gICdib29sZWFuJzogZmFsc2UsXG4gICdmdW5jdGlvbic6IHRydWUsXG4gICdvYmplY3QnOiB0cnVlLFxuICAnbnVtYmVyJzogZmFsc2UsXG4gICdzdHJpbmcnOiBmYWxzZSxcbiAgJ3VuZGVmaW5lZCc6IGZhbHNlXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG9iamVjdFR5cGVzO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBpc05hdGl2ZSA9IHJlcXVpcmUoJ2xvZGFzaC5faXNuYXRpdmUnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC5pc29iamVjdCcpLFxuICAgIHNoaW1LZXlzID0gcmVxdWlyZSgnbG9kYXNoLl9zaGlta2V5cycpO1xuXG4vKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyBmb3IgbWV0aG9kcyB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcyAqL1xudmFyIG5hdGl2ZUtleXMgPSBpc05hdGl2ZShuYXRpdmVLZXlzID0gT2JqZWN0LmtleXMpICYmIG5hdGl2ZUtleXM7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBjb21wb3NlZCBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYW4gb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8ua2V5cyh7ICdvbmUnOiAxLCAndHdvJzogMiwgJ3RocmVlJzogMyB9KTtcbiAqIC8vID0+IFsnb25lJywgJ3R3bycsICd0aHJlZSddIChwcm9wZXJ0eSBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCBhY3Jvc3MgZW52aXJvbm1lbnRzKVxuICovXG52YXIga2V5cyA9ICFuYXRpdmVLZXlzID8gc2hpbUtleXMgOiBmdW5jdGlvbihvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIHJldHVybiBuYXRpdmVLZXlzKG9iamVjdCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGtleXM7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIG9iamVjdFR5cGVzID0gcmVxdWlyZSgnbG9kYXNoLl9vYmplY3R0eXBlcycpO1xuXG4vKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogTmF0aXZlIG1ldGhvZCBzaG9ydGN1dHMgKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEEgZmFsbGJhY2sgaW1wbGVtZW50YXRpb24gb2YgYE9iamVjdC5rZXlzYCB3aGljaCBwcm9kdWNlcyBhbiBhcnJheSBvZiB0aGVcbiAqIGdpdmVuIG9iamVjdCdzIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAdHlwZSBGdW5jdGlvblxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbnZhciBzaGltS2V5cyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICB2YXIgaW5kZXgsIGl0ZXJhYmxlID0gb2JqZWN0LCByZXN1bHQgPSBbXTtcbiAgaWYgKCFpdGVyYWJsZSkgcmV0dXJuIHJlc3VsdDtcbiAgaWYgKCEob2JqZWN0VHlwZXNbdHlwZW9mIG9iamVjdF0pKSByZXR1cm4gcmVzdWx0O1xuICAgIGZvciAoaW5kZXggaW4gaXRlcmFibGUpIHtcbiAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0ZXJhYmxlLCBpbmRleCkpIHtcbiAgICAgICAgcmVzdWx0LnB1c2goaW5kZXgpO1xuICAgICAgfVxuICAgIH1cbiAgcmV0dXJuIHJlc3VsdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzaGltS2V5cztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGEgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Z1bmN0aW9uKF8pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0Z1bmN0aW9uO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBvYmplY3RUeXBlcyA9IHJlcXVpcmUoJ2xvZGFzaC5fb2JqZWN0dHlwZXMnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGUgbGFuZ3VhZ2UgdHlwZSBvZiBPYmplY3QuXG4gKiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdCgxKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIC8vIGNoZWNrIGlmIHRoZSB2YWx1ZSBpcyB0aGUgRUNNQVNjcmlwdCBsYW5ndWFnZSB0eXBlIG9mIE9iamVjdFxuICAvLyBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDhcbiAgLy8gYW5kIGF2b2lkIGEgVjggYnVnXG4gIC8vIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTIyOTFcbiAgcmV0dXJuICEhKHZhbHVlICYmIG9iamVjdFR5cGVzW3R5cGVvZiB2YWx1ZV0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0O1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCBzaG9ydGN1dHMgKi9cbnZhciBzdHJpbmdDbGFzcyA9ICdbb2JqZWN0IFN0cmluZ10nO1xuXG4vKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBpbnRlcm5hbCBbW0NsYXNzXV0gb2YgdmFsdWVzICovXG52YXIgdG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHN0cmluZy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGEgc3RyaW5nLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTdHJpbmcoJ2ZyZWQnKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJyB8fFxuICAgIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PSBzdHJpbmdDbGFzcyB8fCBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1N0cmluZztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYHVuZGVmaW5lZGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBgdW5kZWZpbmVkYCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzVW5kZWZpbmVkKHZvaWQgMCk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3VuZGVmaW5lZCc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNVbmRlZmluZWQ7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCdsb2Rhc2guaXNmdW5jdGlvbicpO1xuXG4vKipcbiAqIFJlc29sdmVzIHRoZSB2YWx1ZSBvZiBwcm9wZXJ0eSBga2V5YCBvbiBgb2JqZWN0YC4gSWYgYGtleWAgaXMgYSBmdW5jdGlvblxuICogaXQgd2lsbCBiZSBpbnZva2VkIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBvYmplY3RgIGFuZCBpdHMgcmVzdWx0IHJldHVybmVkLFxuICogZWxzZSB0aGUgcHJvcGVydHkgdmFsdWUgaXMgcmV0dXJuZWQuIElmIGBvYmplY3RgIGlzIGZhbHNleSB0aGVuIGB1bmRlZmluZWRgXG4gKiBpcyByZXR1cm5lZC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGluc3BlY3QuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byByZXNvbHZlLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc29sdmVkIHZhbHVlLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0ge1xuICogICAnY2hlZXNlJzogJ2NydW1wZXRzJyxcbiAqICAgJ3N0dWZmJzogZnVuY3Rpb24oKSB7XG4gKiAgICAgcmV0dXJuICdub25zZW5zZSc7XG4gKiAgIH1cbiAqIH07XG4gKlxuICogXy5yZXN1bHQob2JqZWN0LCAnY2hlZXNlJyk7XG4gKiAvLyA9PiAnY3J1bXBldHMnXG4gKlxuICogXy5yZXN1bHQob2JqZWN0LCAnc3R1ZmYnKTtcbiAqIC8vID0+ICdub25zZW5zZSdcbiAqL1xuZnVuY3Rpb24gcmVzdWx0KG9iamVjdCwga2V5KSB7XG4gIGlmIChvYmplY3QpIHtcbiAgICB2YXIgdmFsdWUgPSBvYmplY3Rba2V5XTtcbiAgICByZXR1cm4gaXNGdW5jdGlvbih2YWx1ZSkgPyBvYmplY3Rba2V5XSgpIDogdmFsdWU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZXN1bHQ7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnbG9kYXNoLmRlZmF1bHRzJyksXG4gICAgZXNjYXBlID0gcmVxdWlyZSgnbG9kYXNoLmVzY2FwZScpLFxuICAgIGVzY2FwZVN0cmluZ0NoYXIgPSByZXF1aXJlKCdsb2Rhc2guX2VzY2FwZXN0cmluZ2NoYXInKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnbG9kYXNoLmtleXMnKSxcbiAgICByZUludGVycG9sYXRlID0gcmVxdWlyZSgnbG9kYXNoLl9yZWludGVycG9sYXRlJyksXG4gICAgdGVtcGxhdGVTZXR0aW5ncyA9IHJlcXVpcmUoJ2xvZGFzaC50ZW1wbGF0ZXNldHRpbmdzJyksXG4gICAgdmFsdWVzID0gcmVxdWlyZSgnbG9kYXNoLnZhbHVlcycpO1xuXG4vKiogVXNlZCB0byBtYXRjaCBlbXB0eSBzdHJpbmcgbGl0ZXJhbHMgaW4gY29tcGlsZWQgdGVtcGxhdGUgc291cmNlICovXG52YXIgcmVFbXB0eVN0cmluZ0xlYWRpbmcgPSAvXFxiX19wIFxcKz0gJyc7L2csXG4gICAgcmVFbXB0eVN0cmluZ01pZGRsZSA9IC9cXGIoX19wIFxcKz0pICcnIFxcKy9nLFxuICAgIHJlRW1wdHlTdHJpbmdUcmFpbGluZyA9IC8oX19lXFwoLio/XFwpfFxcYl9fdFxcKSkgXFwrXFxuJyc7L2c7XG5cbi8qKlxuICogVXNlZCB0byBtYXRjaCBFUzYgdGVtcGxhdGUgZGVsaW1pdGVyc1xuICogaHR0cDovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtbGl0ZXJhbHMtc3RyaW5nLWxpdGVyYWxzXG4gKi9cbnZhciByZUVzVGVtcGxhdGUgPSAvXFwkXFx7KFteXFxcXH1dKig/OlxcXFwuW15cXFxcfV0qKSopXFx9L2c7XG5cbi8qKiBVc2VkIHRvIGVuc3VyZSBjYXB0dXJpbmcgb3JkZXIgb2YgdGVtcGxhdGUgZGVsaW1pdGVycyAqL1xudmFyIHJlTm9NYXRjaCA9IC8oJF4pLztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggdW5lc2NhcGVkIGNoYXJhY3RlcnMgaW4gY29tcGlsZWQgc3RyaW5nIGxpdGVyYWxzICovXG52YXIgcmVVbmVzY2FwZWRTdHJpbmcgPSAvWydcXG5cXHJcXHRcXHUyMDI4XFx1MjAyOVxcXFxdL2c7XG5cbi8qKlxuICogQSBtaWNyby10ZW1wbGF0aW5nIG1ldGhvZCB0aGF0IGhhbmRsZXMgYXJiaXRyYXJ5IGRlbGltaXRlcnMsIHByZXNlcnZlc1xuICogd2hpdGVzcGFjZSwgYW5kIGNvcnJlY3RseSBlc2NhcGVzIHF1b3RlcyB3aXRoaW4gaW50ZXJwb2xhdGVkIGNvZGUuXG4gKlxuICogTm90ZTogSW4gdGhlIGRldmVsb3BtZW50IGJ1aWxkLCBgXy50ZW1wbGF0ZWAgdXRpbGl6ZXMgc291cmNlVVJMcyBmb3IgZWFzaWVyXG4gKiBkZWJ1Z2dpbmcuIFNlZSBodHRwOi8vd3d3Lmh0bWw1cm9ja3MuY29tL2VuL3R1dG9yaWFscy9kZXZlbG9wZXJ0b29scy9zb3VyY2VtYXBzLyN0b2Mtc291cmNldXJsXG4gKlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gcHJlY29tcGlsaW5nIHRlbXBsYXRlcyBzZWU6XG4gKiBodHRwOi8vbG9kYXNoLmNvbS9jdXN0b20tYnVpbGRzXG4gKlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gQ2hyb21lIGV4dGVuc2lvbiBzYW5kYm94ZXMgc2VlOlxuICogaHR0cDovL2RldmVsb3Blci5jaHJvbWUuY29tL3N0YWJsZS9leHRlbnNpb25zL3NhbmRib3hpbmdFdmFsLmh0bWxcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgVGhlIHRlbXBsYXRlIHRleHQuXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgZGF0YSBvYmplY3QgdXNlZCB0byBwb3B1bGF0ZSB0aGUgdGV4dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtSZWdFeHB9IFtvcHRpb25zLmVzY2FwZV0gVGhlIFwiZXNjYXBlXCIgZGVsaW1pdGVyLlxuICogQHBhcmFtIHtSZWdFeHB9IFtvcHRpb25zLmV2YWx1YXRlXSBUaGUgXCJldmFsdWF0ZVwiIGRlbGltaXRlci5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy5pbXBvcnRzXSBBbiBvYmplY3QgdG8gaW1wb3J0IGludG8gdGhlIHRlbXBsYXRlIGFzIGxvY2FsIHZhcmlhYmxlcy5cbiAqIEBwYXJhbSB7UmVnRXhwfSBbb3B0aW9ucy5pbnRlcnBvbGF0ZV0gVGhlIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gW3NvdXJjZVVSTF0gVGhlIHNvdXJjZVVSTCBvZiB0aGUgdGVtcGxhdGUncyBjb21waWxlZCBzb3VyY2UuXG4gKiBAcGFyYW0ge3N0cmluZ30gW3ZhcmlhYmxlXSBUaGUgZGF0YSBvYmplY3QgdmFyaWFibGUgbmFtZS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbnxzdHJpbmd9IFJldHVybnMgYSBjb21waWxlZCBmdW5jdGlvbiB3aGVuIG5vIGBkYXRhYCBvYmplY3RcbiAqICBpcyBnaXZlbiwgZWxzZSBpdCByZXR1cm5zIHRoZSBpbnRlcnBvbGF0ZWQgdGV4dC5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gdXNpbmcgdGhlIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIgdG8gY3JlYXRlIGEgY29tcGlsZWQgdGVtcGxhdGVcbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvIDwlPSBuYW1lICU+Jyk7XG4gKiBjb21waWxlZCh7ICduYW1lJzogJ2ZyZWQnIH0pO1xuICogLy8gPT4gJ2hlbGxvIGZyZWQnXG4gKlxuICogLy8gdXNpbmcgdGhlIFwiZXNjYXBlXCIgZGVsaW1pdGVyIHRvIGVzY2FwZSBIVE1MIGluIGRhdGEgcHJvcGVydHkgdmFsdWVzXG4gKiBfLnRlbXBsYXRlKCc8Yj48JS0gdmFsdWUgJT48L2I+JywgeyAndmFsdWUnOiAnPHNjcmlwdD4nIH0pO1xuICogLy8gPT4gJzxiPiZsdDtzY3JpcHQmZ3Q7PC9iPidcbiAqXG4gKiAvLyB1c2luZyB0aGUgXCJldmFsdWF0ZVwiIGRlbGltaXRlciB0byBnZW5lcmF0ZSBIVE1MXG4gKiB2YXIgbGlzdCA9ICc8JSBfLmZvckVhY2gocGVvcGxlLCBmdW5jdGlvbihuYW1lKSB7ICU+PGxpPjwlLSBuYW1lICU+PC9saT48JSB9KTsgJT4nO1xuICogXy50ZW1wbGF0ZShsaXN0LCB7ICdwZW9wbGUnOiBbJ2ZyZWQnLCAnYmFybmV5J10gfSk7XG4gKiAvLyA9PiAnPGxpPmZyZWQ8L2xpPjxsaT5iYXJuZXk8L2xpPidcbiAqXG4gKiAvLyB1c2luZyB0aGUgRVM2IGRlbGltaXRlciBhcyBhbiBhbHRlcm5hdGl2ZSB0byB0aGUgZGVmYXVsdCBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyXG4gKiBfLnRlbXBsYXRlKCdoZWxsbyAkeyBuYW1lIH0nLCB7ICduYW1lJzogJ3BlYmJsZXMnIH0pO1xuICogLy8gPT4gJ2hlbGxvIHBlYmJsZXMnXG4gKlxuICogLy8gdXNpbmcgdGhlIGludGVybmFsIGBwcmludGAgZnVuY3Rpb24gaW4gXCJldmFsdWF0ZVwiIGRlbGltaXRlcnNcbiAqIF8udGVtcGxhdGUoJzwlIHByaW50KFwiaGVsbG8gXCIgKyBuYW1lKTsgJT4hJywgeyAnbmFtZSc6ICdiYXJuZXknIH0pO1xuICogLy8gPT4gJ2hlbGxvIGJhcm5leSEnXG4gKlxuICogLy8gdXNpbmcgYSBjdXN0b20gdGVtcGxhdGUgZGVsaW1pdGVyc1xuICogXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICogICAnaW50ZXJwb2xhdGUnOiAve3soW1xcc1xcU10rPyl9fS9nXG4gKiB9O1xuICpcbiAqIF8udGVtcGxhdGUoJ2hlbGxvIHt7IG5hbWUgfX0hJywgeyAnbmFtZSc6ICdtdXN0YWNoZScgfSk7XG4gKiAvLyA9PiAnaGVsbG8gbXVzdGFjaGUhJ1xuICpcbiAqIC8vIHVzaW5nIHRoZSBgaW1wb3J0c2Agb3B0aW9uIHRvIGltcG9ydCBqUXVlcnlcbiAqIHZhciBsaXN0ID0gJzwlIGpxLmVhY2gocGVvcGxlLCBmdW5jdGlvbihuYW1lKSB7ICU+PGxpPjwlLSBuYW1lICU+PC9saT48JSB9KTsgJT4nO1xuICogXy50ZW1wbGF0ZShsaXN0LCB7ICdwZW9wbGUnOiBbJ2ZyZWQnLCAnYmFybmV5J10gfSwgeyAnaW1wb3J0cyc6IHsgJ2pxJzogalF1ZXJ5IH0gfSk7XG4gKiAvLyA9PiAnPGxpPmZyZWQ8L2xpPjxsaT5iYXJuZXk8L2xpPidcbiAqXG4gKiAvLyB1c2luZyB0aGUgYHNvdXJjZVVSTGAgb3B0aW9uIHRvIHNwZWNpZnkgYSBjdXN0b20gc291cmNlVVJMIGZvciB0aGUgdGVtcGxhdGVcbiAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvIDwlPSBuYW1lICU+JywgbnVsbCwgeyAnc291cmNlVVJMJzogJy9iYXNpYy9ncmVldGluZy5qc3QnIH0pO1xuICogY29tcGlsZWQoZGF0YSk7XG4gKiAvLyA9PiBmaW5kIHRoZSBzb3VyY2Ugb2YgXCJncmVldGluZy5qc3RcIiB1bmRlciB0aGUgU291cmNlcyB0YWIgb3IgUmVzb3VyY2VzIHBhbmVsIG9mIHRoZSB3ZWIgaW5zcGVjdG9yXG4gKlxuICogLy8gdXNpbmcgdGhlIGB2YXJpYWJsZWAgb3B0aW9uIHRvIGVuc3VyZSBhIHdpdGgtc3RhdGVtZW50IGlzbid0IHVzZWQgaW4gdGhlIGNvbXBpbGVkIHRlbXBsYXRlXG4gKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoaSA8JT0gZGF0YS5uYW1lICU+IScsIG51bGwsIHsgJ3ZhcmlhYmxlJzogJ2RhdGEnIH0pO1xuICogY29tcGlsZWQuc291cmNlO1xuICogLy8gPT4gZnVuY3Rpb24oZGF0YSkge1xuICogICB2YXIgX190LCBfX3AgPSAnJywgX19lID0gXy5lc2NhcGU7XG4gKiAgIF9fcCArPSAnaGkgJyArICgoX190ID0gKCBkYXRhLm5hbWUgKSkgPT0gbnVsbCA/ICcnIDogX190KSArICchJztcbiAqICAgcmV0dXJuIF9fcDtcbiAqIH1cbiAqXG4gKiAvLyB1c2luZyB0aGUgYHNvdXJjZWAgcHJvcGVydHkgdG8gaW5saW5lIGNvbXBpbGVkIHRlbXBsYXRlcyBmb3IgbWVhbmluZ2Z1bFxuICogLy8gbGluZSBudW1iZXJzIGluIGVycm9yIG1lc3NhZ2VzIGFuZCBhIHN0YWNrIHRyYWNlXG4gKiBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihjd2QsICdqc3QuanMnKSwgJ1xcXG4gKiAgIHZhciBKU1QgPSB7XFxcbiAqICAgICBcIm1haW5cIjogJyArIF8udGVtcGxhdGUobWFpblRleHQpLnNvdXJjZSArICdcXFxuICogICB9O1xcXG4gKiAnKTtcbiAqL1xuZnVuY3Rpb24gdGVtcGxhdGUodGV4dCwgZGF0YSwgb3B0aW9ucykge1xuICAvLyBiYXNlZCBvbiBKb2huIFJlc2lnJ3MgYHRtcGxgIGltcGxlbWVudGF0aW9uXG4gIC8vIGh0dHA6Ly9lam9obi5vcmcvYmxvZy9qYXZhc2NyaXB0LW1pY3JvLXRlbXBsYXRpbmcvXG4gIC8vIGFuZCBMYXVyYSBEb2t0b3JvdmEncyBkb1QuanNcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL29sYWRvL2RvVFxuICB2YXIgc2V0dGluZ3MgPSB0ZW1wbGF0ZVNldHRpbmdzLmltcG9ydHMuXy50ZW1wbGF0ZVNldHRpbmdzIHx8IHRlbXBsYXRlU2V0dGluZ3M7XG4gIHRleHQgPSBTdHJpbmcodGV4dCB8fCAnJyk7XG5cbiAgLy8gYXZvaWQgbWlzc2luZyBkZXBlbmRlbmNpZXMgd2hlbiBgaXRlcmF0b3JUZW1wbGF0ZWAgaXMgbm90IGRlZmluZWRcbiAgb3B0aW9ucyA9IGRlZmF1bHRzKHt9LCBvcHRpb25zLCBzZXR0aW5ncyk7XG5cbiAgdmFyIGltcG9ydHMgPSBkZWZhdWx0cyh7fSwgb3B0aW9ucy5pbXBvcnRzLCBzZXR0aW5ncy5pbXBvcnRzKSxcbiAgICAgIGltcG9ydHNLZXlzID0ga2V5cyhpbXBvcnRzKSxcbiAgICAgIGltcG9ydHNWYWx1ZXMgPSB2YWx1ZXMoaW1wb3J0cyk7XG5cbiAgdmFyIGlzRXZhbHVhdGluZyxcbiAgICAgIGluZGV4ID0gMCxcbiAgICAgIGludGVycG9sYXRlID0gb3B0aW9ucy5pbnRlcnBvbGF0ZSB8fCByZU5vTWF0Y2gsXG4gICAgICBzb3VyY2UgPSBcIl9fcCArPSAnXCI7XG5cbiAgLy8gY29tcGlsZSB0aGUgcmVnZXhwIHRvIG1hdGNoIGVhY2ggZGVsaW1pdGVyXG4gIHZhciByZURlbGltaXRlcnMgPSBSZWdFeHAoXG4gICAgKG9wdGlvbnMuZXNjYXBlIHx8IHJlTm9NYXRjaCkuc291cmNlICsgJ3wnICtcbiAgICBpbnRlcnBvbGF0ZS5zb3VyY2UgKyAnfCcgK1xuICAgIChpbnRlcnBvbGF0ZSA9PT0gcmVJbnRlcnBvbGF0ZSA/IHJlRXNUZW1wbGF0ZSA6IHJlTm9NYXRjaCkuc291cmNlICsgJ3wnICtcbiAgICAob3B0aW9ucy5ldmFsdWF0ZSB8fCByZU5vTWF0Y2gpLnNvdXJjZSArICd8JCdcbiAgLCAnZycpO1xuXG4gIHRleHQucmVwbGFjZShyZURlbGltaXRlcnMsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGVWYWx1ZSwgaW50ZXJwb2xhdGVWYWx1ZSwgZXNUZW1wbGF0ZVZhbHVlLCBldmFsdWF0ZVZhbHVlLCBvZmZzZXQpIHtcbiAgICBpbnRlcnBvbGF0ZVZhbHVlIHx8IChpbnRlcnBvbGF0ZVZhbHVlID0gZXNUZW1wbGF0ZVZhbHVlKTtcblxuICAgIC8vIGVzY2FwZSBjaGFyYWN0ZXJzIHRoYXQgY2Fubm90IGJlIGluY2x1ZGVkIGluIHN0cmluZyBsaXRlcmFsc1xuICAgIHNvdXJjZSArPSB0ZXh0LnNsaWNlKGluZGV4LCBvZmZzZXQpLnJlcGxhY2UocmVVbmVzY2FwZWRTdHJpbmcsIGVzY2FwZVN0cmluZ0NoYXIpO1xuXG4gICAgLy8gcmVwbGFjZSBkZWxpbWl0ZXJzIHdpdGggc25pcHBldHNcbiAgICBpZiAoZXNjYXBlVmFsdWUpIHtcbiAgICAgIHNvdXJjZSArPSBcIicgK1xcbl9fZShcIiArIGVzY2FwZVZhbHVlICsgXCIpICtcXG4nXCI7XG4gICAgfVxuICAgIGlmIChldmFsdWF0ZVZhbHVlKSB7XG4gICAgICBpc0V2YWx1YXRpbmcgPSB0cnVlO1xuICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlVmFsdWUgKyBcIjtcXG5fX3AgKz0gJ1wiO1xuICAgIH1cbiAgICBpZiAoaW50ZXJwb2xhdGVWYWx1ZSkge1xuICAgICAgc291cmNlICs9IFwiJyArXFxuKChfX3QgPSAoXCIgKyBpbnRlcnBvbGF0ZVZhbHVlICsgXCIpKSA9PSBudWxsID8gJycgOiBfX3QpICtcXG4nXCI7XG4gICAgfVxuICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuXG4gICAgLy8gdGhlIEpTIGVuZ2luZSBlbWJlZGRlZCBpbiBBZG9iZSBwcm9kdWN0cyByZXF1aXJlcyByZXR1cm5pbmcgdGhlIGBtYXRjaGBcbiAgICAvLyBzdHJpbmcgaW4gb3JkZXIgdG8gcHJvZHVjZSB0aGUgY29ycmVjdCBgb2Zmc2V0YCB2YWx1ZVxuICAgIHJldHVybiBtYXRjaDtcbiAgfSk7XG5cbiAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAvLyBpZiBgdmFyaWFibGVgIGlzIG5vdCBzcGVjaWZpZWQsIHdyYXAgYSB3aXRoLXN0YXRlbWVudCBhcm91bmQgdGhlIGdlbmVyYXRlZFxuICAvLyBjb2RlIHRvIGFkZCB0aGUgZGF0YSBvYmplY3QgdG8gdGhlIHRvcCBvZiB0aGUgc2NvcGUgY2hhaW5cbiAgdmFyIHZhcmlhYmxlID0gb3B0aW9ucy52YXJpYWJsZSxcbiAgICAgIGhhc1ZhcmlhYmxlID0gdmFyaWFibGU7XG5cbiAgaWYgKCFoYXNWYXJpYWJsZSkge1xuICAgIHZhcmlhYmxlID0gJ29iaic7XG4gICAgc291cmNlID0gJ3dpdGggKCcgKyB2YXJpYWJsZSArICcpIHtcXG4nICsgc291cmNlICsgJ1xcbn1cXG4nO1xuICB9XG4gIC8vIGNsZWFudXAgY29kZSBieSBzdHJpcHBpbmcgZW1wdHkgc3RyaW5nc1xuICBzb3VyY2UgPSAoaXNFdmFsdWF0aW5nID8gc291cmNlLnJlcGxhY2UocmVFbXB0eVN0cmluZ0xlYWRpbmcsICcnKSA6IHNvdXJjZSlcbiAgICAucmVwbGFjZShyZUVtcHR5U3RyaW5nTWlkZGxlLCAnJDEnKVxuICAgIC5yZXBsYWNlKHJlRW1wdHlTdHJpbmdUcmFpbGluZywgJyQxOycpO1xuXG4gIC8vIGZyYW1lIGNvZGUgYXMgdGhlIGZ1bmN0aW9uIGJvZHlcbiAgc291cmNlID0gJ2Z1bmN0aW9uKCcgKyB2YXJpYWJsZSArICcpIHtcXG4nICtcbiAgICAoaGFzVmFyaWFibGUgPyAnJyA6IHZhcmlhYmxlICsgJyB8fCAoJyArIHZhcmlhYmxlICsgJyA9IHt9KTtcXG4nKSArXG4gICAgXCJ2YXIgX190LCBfX3AgPSAnJywgX19lID0gXy5lc2NhcGVcIiArXG4gICAgKGlzRXZhbHVhdGluZ1xuICAgICAgPyAnLCBfX2ogPSBBcnJheS5wcm90b3R5cGUuam9pbjtcXG4nICtcbiAgICAgICAgXCJmdW5jdGlvbiBwcmludCgpIHsgX19wICs9IF9fai5jYWxsKGFyZ3VtZW50cywgJycpIH1cXG5cIlxuICAgICAgOiAnO1xcbidcbiAgICApICtcbiAgICBzb3VyY2UgK1xuICAgICdyZXR1cm4gX19wXFxufSc7XG5cbiAgdHJ5IHtcbiAgICB2YXIgcmVzdWx0ID0gRnVuY3Rpb24oaW1wb3J0c0tleXMsICdyZXR1cm4gJyArIHNvdXJjZSApLmFwcGx5KHVuZGVmaW5lZCwgaW1wb3J0c1ZhbHVlcyk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGUuc291cmNlID0gc291cmNlO1xuICAgIHRocm93IGU7XG4gIH1cbiAgaWYgKGRhdGEpIHtcbiAgICByZXR1cm4gcmVzdWx0KGRhdGEpO1xuICB9XG4gIC8vIHByb3ZpZGUgdGhlIGNvbXBpbGVkIGZ1bmN0aW9uJ3Mgc291cmNlIGJ5IGl0cyBgdG9TdHJpbmdgIG1ldGhvZCwgaW5cbiAgLy8gc3VwcG9ydGVkIGVudmlyb25tZW50cywgb3IgdGhlIGBzb3VyY2VgIHByb3BlcnR5IGFzIGEgY29udmVuaWVuY2UgZm9yXG4gIC8vIGlubGluaW5nIGNvbXBpbGVkIHRlbXBsYXRlcyBkdXJpbmcgdGhlIGJ1aWxkIHByb2Nlc3NcbiAgcmVzdWx0LnNvdXJjZSA9IHNvdXJjZTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKiBVc2VkIHRvIGVzY2FwZSBjaGFyYWN0ZXJzIGZvciBpbmNsdXNpb24gaW4gY29tcGlsZWQgc3RyaW5nIGxpdGVyYWxzICovXG52YXIgc3RyaW5nRXNjYXBlcyA9IHtcbiAgJ1xcXFwnOiAnXFxcXCcsXG4gIFwiJ1wiOiBcIidcIixcbiAgJ1xcbic6ICduJyxcbiAgJ1xccic6ICdyJyxcbiAgJ1xcdCc6ICd0JyxcbiAgJ1xcdTIwMjgnOiAndTIwMjgnLFxuICAnXFx1MjAyOSc6ICd1MjAyOSdcbn07XG5cbi8qKlxuICogVXNlZCBieSBgdGVtcGxhdGVgIHRvIGVzY2FwZSBjaGFyYWN0ZXJzIGZvciBpbmNsdXNpb24gaW4gY29tcGlsZWRcbiAqIHN0cmluZyBsaXRlcmFscy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IG1hdGNoIFRoZSBtYXRjaGVkIGNoYXJhY3RlciB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIGNoYXJhY3Rlci5cbiAqL1xuZnVuY3Rpb24gZXNjYXBlU3RyaW5nQ2hhcihtYXRjaCkge1xuICByZXR1cm4gJ1xcXFwnICsgc3RyaW5nRXNjYXBlc1ttYXRjaF07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXNjYXBlU3RyaW5nQ2hhcjtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKiBVc2VkIHRvIG1hdGNoIFwiaW50ZXJwb2xhdGVcIiB0ZW1wbGF0ZSBkZWxpbWl0ZXJzICovXG52YXIgcmVJbnRlcnBvbGF0ZSA9IC88JT0oW1xcc1xcU10rPyklPi9nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlSW50ZXJwb2xhdGU7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGtleXMgPSByZXF1aXJlKCdsb2Rhc2gua2V5cycpLFxuICAgIG9iamVjdFR5cGVzID0gcmVxdWlyZSgnbG9kYXNoLl9vYmplY3R0eXBlcycpO1xuXG4vKipcbiAqIEFzc2lnbnMgb3duIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBzb3VyY2Ugb2JqZWN0KHMpIHRvIHRoZSBkZXN0aW5hdGlvblxuICogb2JqZWN0IGZvciBhbGwgZGVzdGluYXRpb24gcHJvcGVydGllcyB0aGF0IHJlc29sdmUgdG8gYHVuZGVmaW5lZGAuIE9uY2UgYVxuICogcHJvcGVydHkgaXMgc2V0LCBhZGRpdGlvbmFsIGRlZmF1bHRzIG9mIHRoZSBzYW1lIHByb3BlcnR5IHdpbGwgYmUgaWdub3JlZC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHR5cGUgRnVuY3Rpb25cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0gey4uLk9iamVjdH0gW3NvdXJjZV0gVGhlIHNvdXJjZSBvYmplY3RzLlxuICogQHBhcmFtLSB7T2JqZWN0fSBbZ3VhcmRdIEFsbG93cyB3b3JraW5nIHdpdGggYF8ucmVkdWNlYCB3aXRob3V0IHVzaW5nIGl0c1xuICogIGBrZXlgIGFuZCBgb2JqZWN0YCBhcmd1bWVudHMgYXMgc291cmNlcy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ25hbWUnOiAnYmFybmV5JyB9O1xuICogXy5kZWZhdWx0cyhvYmplY3QsIHsgJ25hbWUnOiAnZnJlZCcsICdlbXBsb3llcic6ICdzbGF0ZScgfSk7XG4gKiAvLyA9PiB7ICduYW1lJzogJ2Jhcm5leScsICdlbXBsb3llcic6ICdzbGF0ZScgfVxuICovXG52YXIgZGVmYXVsdHMgPSBmdW5jdGlvbihvYmplY3QsIHNvdXJjZSwgZ3VhcmQpIHtcbiAgdmFyIGluZGV4LCBpdGVyYWJsZSA9IG9iamVjdCwgcmVzdWx0ID0gaXRlcmFibGU7XG4gIGlmICghaXRlcmFibGUpIHJldHVybiByZXN1bHQ7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgYXJnc0luZGV4ID0gMCxcbiAgICAgIGFyZ3NMZW5ndGggPSB0eXBlb2YgZ3VhcmQgPT0gJ251bWJlcicgPyAyIDogYXJncy5sZW5ndGg7XG4gIHdoaWxlICgrK2FyZ3NJbmRleCA8IGFyZ3NMZW5ndGgpIHtcbiAgICBpdGVyYWJsZSA9IGFyZ3NbYXJnc0luZGV4XTtcbiAgICBpZiAoaXRlcmFibGUgJiYgb2JqZWN0VHlwZXNbdHlwZW9mIGl0ZXJhYmxlXSkge1xuICAgIHZhciBvd25JbmRleCA9IC0xLFxuICAgICAgICBvd25Qcm9wcyA9IG9iamVjdFR5cGVzW3R5cGVvZiBpdGVyYWJsZV0gJiYga2V5cyhpdGVyYWJsZSksXG4gICAgICAgIGxlbmd0aCA9IG93blByb3BzID8gb3duUHJvcHMubGVuZ3RoIDogMDtcblxuICAgIHdoaWxlICgrK293bkluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBpbmRleCA9IG93blByb3BzW293bkluZGV4XTtcbiAgICAgIGlmICh0eXBlb2YgcmVzdWx0W2luZGV4XSA9PSAndW5kZWZpbmVkJykgcmVzdWx0W2luZGV4XSA9IGl0ZXJhYmxlW2luZGV4XTtcbiAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGVzY2FwZUh0bWxDaGFyID0gcmVxdWlyZSgnbG9kYXNoLl9lc2NhcGVodG1sY2hhcicpLFxuICAgIGtleXMgPSByZXF1aXJlKCdsb2Rhc2gua2V5cycpLFxuICAgIHJlVW5lc2NhcGVkSHRtbCA9IHJlcXVpcmUoJ2xvZGFzaC5fcmV1bmVzY2FwZWRodG1sJyk7XG5cbi8qKlxuICogQ29udmVydHMgdGhlIGNoYXJhY3RlcnMgYCZgLCBgPGAsIGA+YCwgYFwiYCwgYW5kIGAnYCBpbiBgc3RyaW5nYCB0byB0aGVpclxuICogY29ycmVzcG9uZGluZyBIVE1MIGVudGl0aWVzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIFRoZSBzdHJpbmcgdG8gZXNjYXBlLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBzdHJpbmcuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZXNjYXBlKCdGcmVkLCBXaWxtYSwgJiBQZWJibGVzJyk7XG4gKiAvLyA9PiAnRnJlZCwgV2lsbWEsICZhbXA7IFBlYmJsZXMnXG4gKi9cbmZ1bmN0aW9uIGVzY2FwZShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZyA9PSBudWxsID8gJycgOiBTdHJpbmcoc3RyaW5nKS5yZXBsYWNlKHJlVW5lc2NhcGVkSHRtbCwgZXNjYXBlSHRtbENoYXIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVzY2FwZTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgaHRtbEVzY2FwZXMgPSByZXF1aXJlKCdsb2Rhc2guX2h0bWxlc2NhcGVzJyk7XG5cbi8qKlxuICogVXNlZCBieSBgZXNjYXBlYCB0byBjb252ZXJ0IGNoYXJhY3RlcnMgdG8gSFRNTCBlbnRpdGllcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IG1hdGNoIFRoZSBtYXRjaGVkIGNoYXJhY3RlciB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIGNoYXJhY3Rlci5cbiAqL1xuZnVuY3Rpb24gZXNjYXBlSHRtbENoYXIobWF0Y2gpIHtcbiAgcmV0dXJuIGh0bWxFc2NhcGVzW21hdGNoXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlc2NhcGVIdG1sQ2hhcjtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKlxuICogVXNlZCB0byBjb252ZXJ0IGNoYXJhY3RlcnMgdG8gSFRNTCBlbnRpdGllczpcbiAqXG4gKiBUaG91Z2ggdGhlIGA+YCBjaGFyYWN0ZXIgaXMgZXNjYXBlZCBmb3Igc3ltbWV0cnksIGNoYXJhY3RlcnMgbGlrZSBgPmAgYW5kIGAvYFxuICogZG9uJ3QgcmVxdWlyZSBlc2NhcGluZyBpbiBIVE1MIGFuZCBoYXZlIG5vIHNwZWNpYWwgbWVhbmluZyB1bmxlc3MgdGhleSdyZSBwYXJ0XG4gKiBvZiBhIHRhZyBvciBhbiB1bnF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUuXG4gKiBodHRwOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9hbWJpZ3VvdXMtYW1wZXJzYW5kcyAodW5kZXIgXCJzZW1pLXJlbGF0ZWQgZnVuIGZhY3RcIilcbiAqL1xudmFyIGh0bWxFc2NhcGVzID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gIFwiJ1wiOiAnJiMzOTsnXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGh0bWxFc2NhcGVzO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBodG1sRXNjYXBlcyA9IHJlcXVpcmUoJ2xvZGFzaC5faHRtbGVzY2FwZXMnKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnbG9kYXNoLmtleXMnKTtcblxuLyoqIFVzZWQgdG8gbWF0Y2ggSFRNTCBlbnRpdGllcyBhbmQgSFRNTCBjaGFyYWN0ZXJzICovXG52YXIgcmVVbmVzY2FwZWRIdG1sID0gUmVnRXhwKCdbJyArIGtleXMoaHRtbEVzY2FwZXMpLmpvaW4oJycpICsgJ10nLCAnZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlVW5lc2NhcGVkSHRtbDtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgZXNjYXBlID0gcmVxdWlyZSgnbG9kYXNoLmVzY2FwZScpLFxuICAgIHJlSW50ZXJwb2xhdGUgPSByZXF1aXJlKCdsb2Rhc2guX3JlaW50ZXJwb2xhdGUnKTtcblxuLyoqXG4gKiBCeSBkZWZhdWx0LCB0aGUgdGVtcGxhdGUgZGVsaW1pdGVycyB1c2VkIGJ5IExvLURhc2ggYXJlIHNpbWlsYXIgdG8gdGhvc2UgaW5cbiAqIGVtYmVkZGVkIFJ1YnkgKEVSQikuIENoYW5nZSB0aGUgZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZVxuICogZGVsaW1pdGVycy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHR5cGUgT2JqZWN0XG4gKi9cbnZhciB0ZW1wbGF0ZVNldHRpbmdzID0ge1xuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGRldGVjdCBgZGF0YWAgcHJvcGVydHkgdmFsdWVzIHRvIGJlIEhUTUwtZXNjYXBlZC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSBSZWdFeHBcbiAgICovXG4gICdlc2NhcGUnOiAvPCUtKFtcXHNcXFNdKz8pJT4vZyxcblxuICAvKipcbiAgICogVXNlZCB0byBkZXRlY3QgY29kZSB0byBiZSBldmFsdWF0ZWQuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUgUmVnRXhwXG4gICAqL1xuICAnZXZhbHVhdGUnOiAvPCUoW1xcc1xcU10rPyklPi9nLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGRldGVjdCBgZGF0YWAgcHJvcGVydHkgdmFsdWVzIHRvIGluamVjdC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSBSZWdFeHBcbiAgICovXG4gICdpbnRlcnBvbGF0ZSc6IHJlSW50ZXJwb2xhdGUsXG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gcmVmZXJlbmNlIHRoZSBkYXRhIG9iamVjdCBpbiB0aGUgdGVtcGxhdGUgdGV4dC5cbiAgICpcbiAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgKiBAdHlwZSBzdHJpbmdcbiAgICovXG4gICd2YXJpYWJsZSc6ICcnLFxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGltcG9ydCB2YXJpYWJsZXMgaW50byB0aGUgY29tcGlsZWQgdGVtcGxhdGUuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICogQHR5cGUgT2JqZWN0XG4gICAqL1xuICAnaW1wb3J0cyc6IHtcblxuICAgIC8qKlxuICAgICAqIEEgcmVmZXJlbmNlIHRvIHRoZSBgbG9kYXNoYCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3MuaW1wb3J0c1xuICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICovXG4gICAgJ18nOiB7ICdlc2NhcGUnOiBlc2NhcGUgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlU2V0dGluZ3M7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGtleXMgPSByZXF1aXJlKCdsb2Rhc2gua2V5cycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgY29tcG9zZWQgb2YgdGhlIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IHZhbHVlcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGFuIGFycmF5IG9mIHByb3BlcnR5IHZhbHVlcy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy52YWx1ZXMoeyAnb25lJzogMSwgJ3R3byc6IDIsICd0aHJlZSc6IDMgfSk7XG4gKiAvLyA9PiBbMSwgMiwgM10gKHByb3BlcnR5IG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkIGFjcm9zcyBlbnZpcm9ubWVudHMpXG4gKi9cbmZ1bmN0aW9uIHZhbHVlcyhvYmplY3QpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBwcm9wcyA9IGtleXMob2JqZWN0KSxcbiAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aCxcbiAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICByZXN1bHRbaW5kZXhdID0gb2JqZWN0W3Byb3BzW2luZGV4XV07XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB2YWx1ZXM7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogVXNlZCB0byBnZW5lcmF0ZSB1bmlxdWUgSURzICovXG52YXIgaWRDb3VudGVyID0gMDtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSB1bmlxdWUgSUQuIElmIGBwcmVmaXhgIGlzIHByb3ZpZGVkIHRoZSBJRCB3aWxsIGJlIGFwcGVuZGVkIHRvIGl0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gKiBAcGFyYW0ge3N0cmluZ30gW3ByZWZpeF0gVGhlIHZhbHVlIHRvIHByZWZpeCB0aGUgSUQgd2l0aC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHVuaXF1ZSBJRC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy51bmlxdWVJZCgnY29udGFjdF8nKTtcbiAqIC8vID0+ICdjb250YWN0XzEwNCdcbiAqXG4gKiBfLnVuaXF1ZUlkKCk7XG4gKiAvLyA9PiAnMTA1J1xuICovXG5mdW5jdGlvbiB1bmlxdWVJZChwcmVmaXgpIHtcbiAgdmFyIGlkID0gKytpZENvdW50ZXI7XG4gIHJldHVybiBTdHJpbmcocHJlZml4ID09IG51bGwgPyAnJyA6IHByZWZpeCkgKyBpZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB1bmlxdWVJZDtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTQgRmVsaXggR25hc3NcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG4oZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuXG4gIC8qIENvbW1vbkpTICovXG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JykgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpXG5cbiAgLyogQU1EIG1vZHVsZSAqL1xuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGZhY3RvcnkpXG5cbiAgLyogQnJvd3NlciBnbG9iYWwgKi9cbiAgZWxzZSByb290LlNwaW5uZXIgPSBmYWN0b3J5KClcbn1cbih0aGlzLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIHByZWZpeGVzID0gWyd3ZWJraXQnLCAnTW96JywgJ21zJywgJ08nXSAvKiBWZW5kb3IgcHJlZml4ZXMgKi9cbiAgICAsIGFuaW1hdGlvbnMgPSB7fSAvKiBBbmltYXRpb24gcnVsZXMga2V5ZWQgYnkgdGhlaXIgbmFtZSAqL1xuICAgICwgdXNlQ3NzQW5pbWF0aW9ucyAvKiBXaGV0aGVyIHRvIHVzZSBDU1MgYW5pbWF0aW9ucyBvciBzZXRUaW1lb3V0ICovXG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gY3JlYXRlIGVsZW1lbnRzLiBJZiBubyB0YWcgbmFtZSBpcyBnaXZlbixcbiAgICogYSBESVYgaXMgY3JlYXRlZC4gT3B0aW9uYWxseSBwcm9wZXJ0aWVzIGNhbiBiZSBwYXNzZWQuXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVFbCh0YWcsIHByb3ApIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyB8fCAnZGl2JylcbiAgICAgICwgblxuXG4gICAgZm9yKG4gaW4gcHJvcCkgZWxbbl0gPSBwcm9wW25dXG4gICAgcmV0dXJuIGVsXG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyBjaGlsZHJlbiBhbmQgcmV0dXJucyB0aGUgcGFyZW50LlxuICAgKi9cbiAgZnVuY3Rpb24gaW5zKHBhcmVudCAvKiBjaGlsZDEsIGNoaWxkMiwgLi4uKi8pIHtcbiAgICBmb3IgKHZhciBpPTEsIG49YXJndW1lbnRzLmxlbmd0aDsgaTxuOyBpKyspXG4gICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoYXJndW1lbnRzW2ldKVxuXG4gICAgcmV0dXJuIHBhcmVudFxuICB9XG5cbiAgLyoqXG4gICAqIEluc2VydCBhIG5ldyBzdHlsZXNoZWV0IHRvIGhvbGQgdGhlIEBrZXlmcmFtZSBvciBWTUwgcnVsZXMuXG4gICAqL1xuICB2YXIgc2hlZXQgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVsID0gY3JlYXRlRWwoJ3N0eWxlJywge3R5cGUgOiAndGV4dC9jc3MnfSlcbiAgICBpbnMoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSwgZWwpXG4gICAgcmV0dXJuIGVsLnNoZWV0IHx8IGVsLnN0eWxlU2hlZXRcbiAgfSgpKVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIG9wYWNpdHkga2V5ZnJhbWUgYW5pbWF0aW9uIHJ1bGUgYW5kIHJldHVybnMgaXRzIG5hbWUuXG4gICAqIFNpbmNlIG1vc3QgbW9iaWxlIFdlYmtpdHMgaGF2ZSB0aW1pbmcgaXNzdWVzIHdpdGggYW5pbWF0aW9uLWRlbGF5LFxuICAgKiB3ZSBjcmVhdGUgc2VwYXJhdGUgcnVsZXMgZm9yIGVhY2ggbGluZS9zZWdtZW50LlxuICAgKi9cbiAgZnVuY3Rpb24gYWRkQW5pbWF0aW9uKGFscGhhLCB0cmFpbCwgaSwgbGluZXMpIHtcbiAgICB2YXIgbmFtZSA9IFsnb3BhY2l0eScsIHRyYWlsLCB+fihhbHBoYSoxMDApLCBpLCBsaW5lc10uam9pbignLScpXG4gICAgICAsIHN0YXJ0ID0gMC4wMSArIGkvbGluZXMgKiAxMDBcbiAgICAgICwgeiA9IE1hdGgubWF4KDEgLSAoMS1hbHBoYSkgLyB0cmFpbCAqICgxMDAtc3RhcnQpLCBhbHBoYSlcbiAgICAgICwgcHJlZml4ID0gdXNlQ3NzQW5pbWF0aW9ucy5zdWJzdHJpbmcoMCwgdXNlQ3NzQW5pbWF0aW9ucy5pbmRleE9mKCdBbmltYXRpb24nKSkudG9Mb3dlckNhc2UoKVxuICAgICAgLCBwcmUgPSBwcmVmaXggJiYgJy0nICsgcHJlZml4ICsgJy0nIHx8ICcnXG5cbiAgICBpZiAoIWFuaW1hdGlvbnNbbmFtZV0pIHtcbiAgICAgIHNoZWV0Lmluc2VydFJ1bGUoXG4gICAgICAgICdAJyArIHByZSArICdrZXlmcmFtZXMgJyArIG5hbWUgKyAneycgK1xuICAgICAgICAnMCV7b3BhY2l0eTonICsgeiArICd9JyArXG4gICAgICAgIHN0YXJ0ICsgJyV7b3BhY2l0eTonICsgYWxwaGEgKyAnfScgK1xuICAgICAgICAoc3RhcnQrMC4wMSkgKyAnJXtvcGFjaXR5OjF9JyArXG4gICAgICAgIChzdGFydCt0cmFpbCkgJSAxMDAgKyAnJXtvcGFjaXR5OicgKyBhbHBoYSArICd9JyArXG4gICAgICAgICcxMDAle29wYWNpdHk6JyArIHogKyAnfScgK1xuICAgICAgICAnfScsIHNoZWV0LmNzc1J1bGVzLmxlbmd0aClcblxuICAgICAgYW5pbWF0aW9uc1tuYW1lXSA9IDFcbiAgICB9XG5cbiAgICByZXR1cm4gbmFtZVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWVzIHZhcmlvdXMgdmVuZG9yIHByZWZpeGVzIGFuZCByZXR1cm5zIHRoZSBmaXJzdCBzdXBwb3J0ZWQgcHJvcGVydHkuXG4gICAqL1xuICBmdW5jdGlvbiB2ZW5kb3IoZWwsIHByb3ApIHtcbiAgICB2YXIgcyA9IGVsLnN0eWxlXG4gICAgICAsIHBwXG4gICAgICAsIGlcblxuICAgIHByb3AgPSBwcm9wLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zbGljZSgxKVxuICAgIGZvcihpPTA7IGk8cHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHBwID0gcHJlZml4ZXNbaV0rcHJvcFxuICAgICAgaWYoc1twcF0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIHBwXG4gICAgfVxuICAgIGlmKHNbcHJvcF0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByb3BcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIG11bHRpcGxlIHN0eWxlIHByb3BlcnRpZXMgYXQgb25jZS5cbiAgICovXG4gIGZ1bmN0aW9uIGNzcyhlbCwgcHJvcCkge1xuICAgIGZvciAodmFyIG4gaW4gcHJvcClcbiAgICAgIGVsLnN0eWxlW3ZlbmRvcihlbCwgbil8fG5dID0gcHJvcFtuXVxuXG4gICAgcmV0dXJuIGVsXG4gIH1cblxuICAvKipcbiAgICogRmlsbHMgaW4gZGVmYXVsdCB2YWx1ZXMuXG4gICAqL1xuICBmdW5jdGlvbiBtZXJnZShvYmopIHtcbiAgICBmb3IgKHZhciBpPTE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZWYgPSBhcmd1bWVudHNbaV1cbiAgICAgIGZvciAodmFyIG4gaW4gZGVmKVxuICAgICAgICBpZiAob2JqW25dID09PSB1bmRlZmluZWQpIG9ialtuXSA9IGRlZltuXVxuICAgIH1cbiAgICByZXR1cm4gb2JqXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYWJzb2x1dGUgcGFnZS1vZmZzZXQgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqL1xuICBmdW5jdGlvbiBwb3MoZWwpIHtcbiAgICB2YXIgbyA9IHsgeDplbC5vZmZzZXRMZWZ0LCB5OmVsLm9mZnNldFRvcCB9XG4gICAgd2hpbGUoKGVsID0gZWwub2Zmc2V0UGFyZW50KSlcbiAgICAgIG8ueCs9ZWwub2Zmc2V0TGVmdCwgby55Kz1lbC5vZmZzZXRUb3BcblxuICAgIHJldHVybiBvXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGluZSBjb2xvciBmcm9tIHRoZSBnaXZlbiBzdHJpbmcgb3IgYXJyYXkuXG4gICAqL1xuICBmdW5jdGlvbiBnZXRDb2xvcihjb2xvciwgaWR4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBjb2xvciA9PSAnc3RyaW5nJyA/IGNvbG9yIDogY29sb3JbaWR4ICUgY29sb3IubGVuZ3RoXVxuICB9XG5cbiAgLy8gQnVpbHQtaW4gZGVmYXVsdHNcblxuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgbGluZXM6IDEyLCAgICAgICAgICAgIC8vIFRoZSBudW1iZXIgb2YgbGluZXMgdG8gZHJhd1xuICAgIGxlbmd0aDogNywgICAgICAgICAgICAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAgIHdpZHRoOiA1LCAgICAgICAgICAgICAvLyBUaGUgbGluZSB0aGlja25lc3NcbiAgICByYWRpdXM6IDEwLCAgICAgICAgICAgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgcm90YXRlOiAwLCAgICAgICAgICAgIC8vIFJvdGF0aW9uIG9mZnNldFxuICAgIGNvcm5lcnM6IDEsICAgICAgICAgICAvLyBSb3VuZG5lc3MgKDAuLjEpXG4gICAgY29sb3I6ICcjMDAwJywgICAgICAgIC8vICNyZ2Igb3IgI3JyZ2diYlxuICAgIGRpcmVjdGlvbjogMSwgICAgICAgICAvLyAxOiBjbG9ja3dpc2UsIC0xOiBjb3VudGVyY2xvY2t3aXNlXG4gICAgc3BlZWQ6IDEsICAgICAgICAgICAgIC8vIFJvdW5kcyBwZXIgc2Vjb25kXG4gICAgdHJhaWw6IDEwMCwgICAgICAgICAgIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXG4gICAgb3BhY2l0eTogMS80LCAgICAgICAgIC8vIE9wYWNpdHkgb2YgdGhlIGxpbmVzXG4gICAgZnBzOiAyMCwgICAgICAgICAgICAgIC8vIEZyYW1lcyBwZXIgc2Vjb25kIHdoZW4gdXNpbmcgc2V0VGltZW91dCgpXG4gICAgekluZGV4OiAyZTksICAgICAgICAgIC8vIFVzZSBhIGhpZ2ggei1pbmRleCBieSBkZWZhdWx0XG4gICAgY2xhc3NOYW1lOiAnc3Bpbm5lcicsIC8vIENTUyBjbGFzcyB0byBhc3NpZ24gdG8gdGhlIGVsZW1lbnRcbiAgICB0b3A6ICc1MCUnLCAgICAgICAgICAgLy8gY2VudGVyIHZlcnRpY2FsbHlcbiAgICBsZWZ0OiAnNTAlJywgICAgICAgICAgLy8gY2VudGVyIGhvcml6b250YWxseVxuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnICAvLyBlbGVtZW50IHBvc2l0aW9uXG4gIH1cblxuICAvKiogVGhlIGNvbnN0cnVjdG9yICovXG4gIGZ1bmN0aW9uIFNwaW5uZXIobykge1xuICAgIHRoaXMub3B0cyA9IG1lcmdlKG8gfHwge30sIFNwaW5uZXIuZGVmYXVsdHMsIGRlZmF1bHRzKVxuICB9XG5cbiAgLy8gR2xvYmFsIGRlZmF1bHRzIHRoYXQgb3ZlcnJpZGUgdGhlIGJ1aWx0LWluczpcbiAgU3Bpbm5lci5kZWZhdWx0cyA9IHt9XG5cbiAgbWVyZ2UoU3Bpbm5lci5wcm90b3R5cGUsIHtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIHNwaW5uZXIgdG8gdGhlIGdpdmVuIHRhcmdldCBlbGVtZW50LiBJZiB0aGlzIGluc3RhbmNlIGlzIGFscmVhZHlcbiAgICAgKiBzcGlubmluZywgaXQgaXMgYXV0b21hdGljYWxseSByZW1vdmVkIGZyb20gaXRzIHByZXZpb3VzIHRhcmdldCBiIGNhbGxpbmdcbiAgICAgKiBzdG9wKCkgaW50ZXJuYWxseS5cbiAgICAgKi9cbiAgICBzcGluOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIHRoaXMuc3RvcCgpXG5cbiAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAsIG8gPSBzZWxmLm9wdHNcbiAgICAgICAgLCBlbCA9IHNlbGYuZWwgPSBjc3MoY3JlYXRlRWwoMCwge2NsYXNzTmFtZTogby5jbGFzc05hbWV9KSwge3Bvc2l0aW9uOiBvLnBvc2l0aW9uLCB3aWR0aDogMCwgekluZGV4OiBvLnpJbmRleH0pXG4gICAgICAgICwgbWlkID0gby5yYWRpdXMrby5sZW5ndGgrby53aWR0aFxuXG4gICAgICBjc3MoZWwsIHtcbiAgICAgICAgbGVmdDogby5sZWZ0LFxuICAgICAgICB0b3A6IG8udG9wXG4gICAgICB9KVxuICAgICAgICBcbiAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgdGFyZ2V0Lmluc2VydEJlZm9yZShlbCwgdGFyZ2V0LmZpcnN0Q2hpbGR8fG51bGwpXG4gICAgICB9XG5cbiAgICAgIGVsLnNldEF0dHJpYnV0ZSgncm9sZScsICdwcm9ncmVzc2JhcicpXG4gICAgICBzZWxmLmxpbmVzKGVsLCBzZWxmLm9wdHMpXG5cbiAgICAgIGlmICghdXNlQ3NzQW5pbWF0aW9ucykge1xuICAgICAgICAvLyBObyBDU1MgYW5pbWF0aW9uIHN1cHBvcnQsIHVzZSBzZXRUaW1lb3V0KCkgaW5zdGVhZFxuICAgICAgICB2YXIgaSA9IDBcbiAgICAgICAgICAsIHN0YXJ0ID0gKG8ubGluZXMgLSAxKSAqICgxIC0gby5kaXJlY3Rpb24pIC8gMlxuICAgICAgICAgICwgYWxwaGFcbiAgICAgICAgICAsIGZwcyA9IG8uZnBzXG4gICAgICAgICAgLCBmID0gZnBzL28uc3BlZWRcbiAgICAgICAgICAsIG9zdGVwID0gKDEtby5vcGFjaXR5KSAvIChmKm8udHJhaWwgLyAxMDApXG4gICAgICAgICAgLCBhc3RlcCA9IGYvby5saW5lc1xuXG4gICAgICAgIDsoZnVuY3Rpb24gYW5pbSgpIHtcbiAgICAgICAgICBpKys7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBvLmxpbmVzOyBqKyspIHtcbiAgICAgICAgICAgIGFscGhhID0gTWF0aC5tYXgoMSAtIChpICsgKG8ubGluZXMgLSBqKSAqIGFzdGVwKSAlIGYgKiBvc3RlcCwgby5vcGFjaXR5KVxuXG4gICAgICAgICAgICBzZWxmLm9wYWNpdHkoZWwsIGogKiBvLmRpcmVjdGlvbiArIHN0YXJ0LCBhbHBoYSwgbylcbiAgICAgICAgICB9XG4gICAgICAgICAgc2VsZi50aW1lb3V0ID0gc2VsZi5lbCAmJiBzZXRUaW1lb3V0KGFuaW0sIH5+KDEwMDAvZnBzKSlcbiAgICAgICAgfSkoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHNlbGZcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RvcHMgYW5kIHJlbW92ZXMgdGhlIFNwaW5uZXIuXG4gICAgICovXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZWwgPSB0aGlzLmVsXG4gICAgICBpZiAoZWwpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dClcbiAgICAgICAgaWYgKGVsLnBhcmVudE5vZGUpIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpXG4gICAgICAgIHRoaXMuZWwgPSB1bmRlZmluZWRcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludGVybmFsIG1ldGhvZCB0aGF0IGRyYXdzIHRoZSBpbmRpdmlkdWFsIGxpbmVzLiBXaWxsIGJlIG92ZXJ3cml0dGVuXG4gICAgICogaW4gVk1MIGZhbGxiYWNrIG1vZGUgYmVsb3cuXG4gICAgICovXG4gICAgbGluZXM6IGZ1bmN0aW9uKGVsLCBvKSB7XG4gICAgICB2YXIgaSA9IDBcbiAgICAgICAgLCBzdGFydCA9IChvLmxpbmVzIC0gMSkgKiAoMSAtIG8uZGlyZWN0aW9uKSAvIDJcbiAgICAgICAgLCBzZWdcblxuICAgICAgZnVuY3Rpb24gZmlsbChjb2xvciwgc2hhZG93KSB7XG4gICAgICAgIHJldHVybiBjc3MoY3JlYXRlRWwoKSwge1xuICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgIHdpZHRoOiAoby5sZW5ndGgrby53aWR0aCkgKyAncHgnLFxuICAgICAgICAgIGhlaWdodDogby53aWR0aCArICdweCcsXG4gICAgICAgICAgYmFja2dyb3VuZDogY29sb3IsXG4gICAgICAgICAgYm94U2hhZG93OiBzaGFkb3csXG4gICAgICAgICAgdHJhbnNmb3JtT3JpZ2luOiAnbGVmdCcsXG4gICAgICAgICAgdHJhbnNmb3JtOiAncm90YXRlKCcgKyB+figzNjAvby5saW5lcyppK28ucm90YXRlKSArICdkZWcpIHRyYW5zbGF0ZSgnICsgby5yYWRpdXMrJ3B4JyArJywwKScsXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiAoby5jb3JuZXJzICogby53aWR0aD4+MSkgKyAncHgnXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGZvciAoOyBpIDwgby5saW5lczsgaSsrKSB7XG4gICAgICAgIHNlZyA9IGNzcyhjcmVhdGVFbCgpLCB7XG4gICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgdG9wOiAxK34oby53aWR0aC8yKSArICdweCcsXG4gICAgICAgICAgdHJhbnNmb3JtOiBvLmh3YWNjZWwgPyAndHJhbnNsYXRlM2QoMCwwLDApJyA6ICcnLFxuICAgICAgICAgIG9wYWNpdHk6IG8ub3BhY2l0eSxcbiAgICAgICAgICBhbmltYXRpb246IHVzZUNzc0FuaW1hdGlvbnMgJiYgYWRkQW5pbWF0aW9uKG8ub3BhY2l0eSwgby50cmFpbCwgc3RhcnQgKyBpICogby5kaXJlY3Rpb24sIG8ubGluZXMpICsgJyAnICsgMS9vLnNwZWVkICsgJ3MgbGluZWFyIGluZmluaXRlJ1xuICAgICAgICB9KVxuXG4gICAgICAgIGlmIChvLnNoYWRvdykgaW5zKHNlZywgY3NzKGZpbGwoJyMwMDAnLCAnMCAwIDRweCAnICsgJyMwMDAnKSwge3RvcDogMisncHgnfSkpXG4gICAgICAgIGlucyhlbCwgaW5zKHNlZywgZmlsbChnZXRDb2xvcihvLmNvbG9yLCBpKSwgJzAgMCAxcHggcmdiYSgwLDAsMCwuMSknKSkpXG4gICAgICB9XG4gICAgICByZXR1cm4gZWxcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW50ZXJuYWwgbWV0aG9kIHRoYXQgYWRqdXN0cyB0aGUgb3BhY2l0eSBvZiBhIHNpbmdsZSBsaW5lLlxuICAgICAqIFdpbGwgYmUgb3ZlcndyaXR0ZW4gaW4gVk1MIGZhbGxiYWNrIG1vZGUgYmVsb3cuXG4gICAgICovXG4gICAgb3BhY2l0eTogZnVuY3Rpb24oZWwsIGksIHZhbCkge1xuICAgICAgaWYgKGkgPCBlbC5jaGlsZE5vZGVzLmxlbmd0aCkgZWwuY2hpbGROb2Rlc1tpXS5zdHlsZS5vcGFjaXR5ID0gdmFsXG4gICAgfVxuXG4gIH0pXG5cblxuICBmdW5jdGlvbiBpbml0Vk1MKCkge1xuXG4gICAgLyogVXRpbGl0eSBmdW5jdGlvbiB0byBjcmVhdGUgYSBWTUwgdGFnICovXG4gICAgZnVuY3Rpb24gdm1sKHRhZywgYXR0cikge1xuICAgICAgcmV0dXJuIGNyZWF0ZUVsKCc8JyArIHRhZyArICcgeG1sbnM9XCJ1cm46c2NoZW1hcy1taWNyb3NvZnQuY29tOnZtbFwiIGNsYXNzPVwic3Bpbi12bWxcIj4nLCBhdHRyKVxuICAgIH1cblxuICAgIC8vIE5vIENTUyB0cmFuc2Zvcm1zIGJ1dCBWTUwgc3VwcG9ydCwgYWRkIGEgQ1NTIHJ1bGUgZm9yIFZNTCBlbGVtZW50czpcbiAgICBzaGVldC5hZGRSdWxlKCcuc3Bpbi12bWwnLCAnYmVoYXZpb3I6dXJsKCNkZWZhdWx0I1ZNTCknKVxuXG4gICAgU3Bpbm5lci5wcm90b3R5cGUubGluZXMgPSBmdW5jdGlvbihlbCwgbykge1xuICAgICAgdmFyIHIgPSBvLmxlbmd0aCtvLndpZHRoXG4gICAgICAgICwgcyA9IDIqclxuXG4gICAgICBmdW5jdGlvbiBncnAoKSB7XG4gICAgICAgIHJldHVybiBjc3MoXG4gICAgICAgICAgdm1sKCdncm91cCcsIHtcbiAgICAgICAgICAgIGNvb3Jkc2l6ZTogcyArICcgJyArIHMsXG4gICAgICAgICAgICBjb29yZG9yaWdpbjogLXIgKyAnICcgKyAtclxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHsgd2lkdGg6IHMsIGhlaWdodDogcyB9XG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgdmFyIG1hcmdpbiA9IC0oby53aWR0aCtvLmxlbmd0aCkqMiArICdweCdcbiAgICAgICAgLCBnID0gY3NzKGdycCgpLCB7cG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogbWFyZ2luLCBsZWZ0OiBtYXJnaW59KVxuICAgICAgICAsIGlcblxuICAgICAgZnVuY3Rpb24gc2VnKGksIGR4LCBmaWx0ZXIpIHtcbiAgICAgICAgaW5zKGcsXG4gICAgICAgICAgaW5zKGNzcyhncnAoKSwge3JvdGF0aW9uOiAzNjAgLyBvLmxpbmVzICogaSArICdkZWcnLCBsZWZ0OiB+fmR4fSksXG4gICAgICAgICAgICBpbnMoY3NzKHZtbCgncm91bmRyZWN0Jywge2FyY3NpemU6IG8uY29ybmVyc30pLCB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHIsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBvLndpZHRoLFxuICAgICAgICAgICAgICAgIGxlZnQ6IG8ucmFkaXVzLFxuICAgICAgICAgICAgICAgIHRvcDogLW8ud2lkdGg+PjEsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBmaWx0ZXJcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIHZtbCgnZmlsbCcsIHtjb2xvcjogZ2V0Q29sb3Ioby5jb2xvciwgaSksIG9wYWNpdHk6IG8ub3BhY2l0eX0pLFxuICAgICAgICAgICAgICB2bWwoJ3N0cm9rZScsIHtvcGFjaXR5OiAwfSkgLy8gdHJhbnNwYXJlbnQgc3Ryb2tlIHRvIGZpeCBjb2xvciBibGVlZGluZyB1cG9uIG9wYWNpdHkgY2hhbmdlXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIGlmIChvLnNoYWRvdylcbiAgICAgICAgZm9yIChpID0gMTsgaSA8PSBvLmxpbmVzOyBpKyspXG4gICAgICAgICAgc2VnKGksIC0yLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LkJsdXIocGl4ZWxyYWRpdXM9MixtYWtlc2hhZG93PTEsc2hhZG93b3BhY2l0eT0uMyknKVxuXG4gICAgICBmb3IgKGkgPSAxOyBpIDw9IG8ubGluZXM7IGkrKykgc2VnKGkpXG4gICAgICByZXR1cm4gaW5zKGVsLCBnKVxuICAgIH1cblxuICAgIFNwaW5uZXIucHJvdG90eXBlLm9wYWNpdHkgPSBmdW5jdGlvbihlbCwgaSwgdmFsLCBvKSB7XG4gICAgICB2YXIgYyA9IGVsLmZpcnN0Q2hpbGRcbiAgICAgIG8gPSBvLnNoYWRvdyAmJiBvLmxpbmVzIHx8IDBcbiAgICAgIGlmIChjICYmIGkrbyA8IGMuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgYyA9IGMuY2hpbGROb2Rlc1tpK29dOyBjID0gYyAmJiBjLmZpcnN0Q2hpbGQ7IGMgPSBjICYmIGMuZmlyc3RDaGlsZFxuICAgICAgICBpZiAoYykgYy5vcGFjaXR5ID0gdmFsXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIHByb2JlID0gY3NzKGNyZWF0ZUVsKCdncm91cCcpLCB7YmVoYXZpb3I6ICd1cmwoI2RlZmF1bHQjVk1MKSd9KVxuXG4gIGlmICghdmVuZG9yKHByb2JlLCAndHJhbnNmb3JtJykgJiYgcHJvYmUuYWRqKSBpbml0Vk1MKClcbiAgZWxzZSB1c2VDc3NBbmltYXRpb25zID0gdmVuZG9yKHByb2JlLCAnYW5pbWF0aW9uJylcblxuICByZXR1cm4gU3Bpbm5lclxuXG59KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xudmFyIEJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG5cbnZhciBCbG9ja0NvbnRyb2wgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHRoaXMudHlwZSA9IHR5cGU7XG4gIHRoaXMuYmxvY2tfdHlwZSA9IEJsb2Nrc1t0aGlzLnR5cGVdLnByb3RvdHlwZTtcbiAgdGhpcy5jYW5fYmVfcmVuZGVyZWQgPSB0aGlzLmJsb2NrX3R5cGUudG9vbGJhckVuYWJsZWQ7XG5cbiAgdGhpcy5fZW5zdXJlRWxlbWVudCgpO1xufTtcblxuT2JqZWN0LmFzc2lnbihCbG9ja0NvbnRyb2wucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHJlcXVpcmUoJy4vZXZlbnRzJyksIHtcblxuICB0YWdOYW1lOiAnYScsXG4gIGNsYXNzTmFtZTogXCJzdC1ibG9jay1jb250cm9sXCIsXG5cbiAgYXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdkYXRhLXR5cGUnOiB0aGlzLmJsb2NrX3R5cGUudHlwZVxuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5odG1sKCc8c3BhbiBjbGFzcz1cInN0LWljb25cIj4nKyBfLnJlc3VsdCh0aGlzLmJsb2NrX3R5cGUsICdpY29uX25hbWUnKSArJzwvc3Bhbj4nICsgXy5yZXN1bHQodGhpcy5ibG9ja190eXBlLCAndGl0bGUnKSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrQ29udHJvbDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICogU2lyVHJldm9yIEJsb2NrIENvbnRyb2xzXG4gKiAtLVxuICogR2l2ZXMgYW4gaW50ZXJmYWNlIGZvciBhZGRpbmcgbmV3IFNpciBUcmV2b3IgYmxvY2tzLlxuICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcblxudmFyIEJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgQmxvY2tDb250cm9sID0gcmVxdWlyZSgnLi9ibG9jay1jb250cm9sJyk7XG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuL2V2ZW50LWJ1cycpO1xuXG52YXIgQmxvY2tDb250cm9scyA9IGZ1bmN0aW9uKGF2YWlsYWJsZV90eXBlcywgbWVkaWF0b3IpIHtcbiAgdGhpcy5hdmFpbGFibGVfdHlwZXMgPSBhdmFpbGFibGVfdHlwZXMgfHwgW107XG4gIHRoaXMubWVkaWF0b3IgPSBtZWRpYXRvcjtcblxuICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gIHRoaXMuX2JpbmRGdW5jdGlvbnMoKTtcbiAgdGhpcy5fYmluZE1lZGlhdGVkRXZlbnRzKCk7XG5cbiAgdGhpcy5pbml0aWFsaXplKCk7XG59O1xuXG5PYmplY3QuYXNzaWduKEJsb2NrQ29udHJvbHMucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9tZWRpYXRlZC1ldmVudHMnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHJlcXVpcmUoJy4vZXZlbnRzJyksIHtcblxuICBib3VuZDogWydoYW5kbGVDb250cm9sQnV0dG9uQ2xpY2snXSxcbiAgYmxvY2tfY29udHJvbHM6IG51bGwsXG5cbiAgY2xhc3NOYW1lOiBcInN0LWJsb2NrLWNvbnRyb2xzXCIsXG4gIGV2ZW50TmFtZXNwYWNlOiAnYmxvY2stY29udHJvbHMnLFxuXG4gIG1lZGlhdGVkRXZlbnRzOiB7XG4gICAgJ3JlbmRlcic6ICdyZW5kZXJJbkNvbnRhaW5lcicsXG4gICAgJ3Nob3cnOiAnc2hvdycsXG4gICAgJ2hpZGUnOiAnaGlkZSdcbiAgfSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICBmb3IodmFyIGJsb2NrX3R5cGUgaW4gdGhpcy5hdmFpbGFibGVfdHlwZXMpIHtcbiAgICAgIGlmIChCbG9ja3MuaGFzT3duUHJvcGVydHkoYmxvY2tfdHlwZSkpIHtcbiAgICAgICAgdmFyIGJsb2NrX2NvbnRyb2wgPSBuZXcgQmxvY2tDb250cm9sKGJsb2NrX3R5cGUpO1xuICAgICAgICBpZiAoYmxvY2tfY29udHJvbC5jYW5fYmVfcmVuZGVyZWQpIHtcbiAgICAgICAgICB0aGlzLiRlbC5hcHBlbmQoYmxvY2tfY29udHJvbC5yZW5kZXIoKS4kZWwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy4kZWwuZGVsZWdhdGUoJy5zdC1ibG9jay1jb250cm9sJywgJ2NsaWNrJywgdGhpcy5oYW5kbGVDb250cm9sQnV0dG9uQ2xpY2spO1xuICAgIHRoaXMubWVkaWF0b3Iub24oJ2Jsb2NrLWNvbnRyb2xzOnNob3cnLCB0aGlzLnJlbmRlckluQ29udGFpbmVyKTtcbiAgfSxcblxuICBzaG93OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5hZGRDbGFzcygnc3QtYmxvY2stY29udHJvbHMtLWFjdGl2ZScpO1xuXG4gICAgRXZlbnRCdXMudHJpZ2dlcignYmxvY2s6Y29udHJvbHM6c2hvd24nKTtcbiAgfSxcblxuICBoaWRlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUN1cnJlbnRDb250YWluZXIoKTtcbiAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnc3QtYmxvY2stY29udHJvbHMtLWFjdGl2ZScpO1xuXG4gICAgRXZlbnRCdXMudHJpZ2dlcignYmxvY2s6Y29udHJvbHM6aGlkZGVuJyk7XG4gIH0sXG5cbiAgaGFuZGxlQ29udHJvbEJ1dHRvbkNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignYmxvY2s6Y3JlYXRlJywgJChlLmN1cnJlbnRUYXJnZXQpLmF0dHIoJ2RhdGEtdHlwZScpKTtcbiAgfSxcblxuICByZW5kZXJJbkNvbnRhaW5lcjogZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgdGhpcy5yZW1vdmVDdXJyZW50Q29udGFpbmVyKCk7XG5cbiAgICBjb250YWluZXIuYXBwZW5kKHRoaXMuJGVsLmRldGFjaCgpKTtcbiAgICBjb250YWluZXIuYWRkQ2xhc3MoJ3dpdGgtc3QtY29udHJvbHMnKTtcblxuICAgIHRoaXMuY3VycmVudENvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICB0aGlzLnNob3coKTtcbiAgfSxcblxuICByZW1vdmVDdXJyZW50Q29udGFpbmVyOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIV8uaXNVbmRlZmluZWQodGhpcy5jdXJyZW50Q29udGFpbmVyKSkge1xuICAgICAgdGhpcy5jdXJyZW50Q29udGFpbmVyLnJlbW92ZUNsYXNzKFwid2l0aC1zdC1jb250cm9sc1wiKTtcbiAgICAgIHRoaXMuY3VycmVudENvbnRhaW5lciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrQ29udHJvbHM7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIEJsb2NrRGVsZXRpb24gPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fZW5zdXJlRWxlbWVudCgpO1xuICB0aGlzLl9iaW5kRnVuY3Rpb25zKCk7XG59O1xuXG5PYmplY3QuYXNzaWduKEJsb2NrRGVsZXRpb24ucHJvdG90eXBlLCByZXF1aXJlKCcuL2Z1bmN0aW9uLWJpbmQnKSwgcmVxdWlyZSgnLi9yZW5kZXJhYmxlJyksIHtcblxuICB0YWdOYW1lOiAnYScsXG4gIGNsYXNzTmFtZTogJ3N0LWJsb2NrLXVpLWJ0biBzdC1ibG9jay11aS1idG4tLWRlbGV0ZSBzdC1pY29uJyxcblxuICBhdHRyaWJ1dGVzOiB7XG4gICAgaHRtbDogJ2RlbGV0ZScsXG4gICAgJ2RhdGEtaWNvbic6ICdiaW4nXG4gIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2tEZWxldGlvbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcblxudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi9ldmVudC1idXMnKTtcbnZhciBCbG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xuXG52YXIgQmxvY2tNYW5hZ2VyID0gZnVuY3Rpb24ob3B0aW9ucywgZWRpdG9ySW5zdGFuY2UsIG1lZGlhdG9yKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIHRoaXMuaW5zdGFuY2Vfc2NvcGUgPSBlZGl0b3JJbnN0YW5jZTtcbiAgdGhpcy5tZWRpYXRvciA9IG1lZGlhdG9yO1xuXG4gIHRoaXMuYmxvY2tzID0gW107XG4gIHRoaXMuYmxvY2tDb3VudHMgPSB7fTtcbiAgdGhpcy5ibG9ja1R5cGVzID0ge307XG5cbiAgdGhpcy5fc2V0QmxvY2tzVHlwZXMoKTtcbiAgdGhpcy5fc2V0UmVxdWlyZWQoKTtcbiAgdGhpcy5fYmluZE1lZGlhdGVkRXZlbnRzKCk7XG5cbiAgdGhpcy5pbml0aWFsaXplKCk7XG59O1xuXG5PYmplY3QuYXNzaWduKEJsb2NrTWFuYWdlci5wcm90b3R5cGUsIHJlcXVpcmUoJy4vZnVuY3Rpb24tYmluZCcpLCByZXF1aXJlKCcuL21lZGlhdGVkLWV2ZW50cycpLCByZXF1aXJlKCcuL2V2ZW50cycpLCB7XG5cbiAgZXZlbnROYW1lc3BhY2U6ICdibG9jaycsXG5cbiAgbWVkaWF0ZWRFdmVudHM6IHtcbiAgICAnY3JlYXRlJzogJ2NyZWF0ZUJsb2NrJyxcbiAgICAncmVtb3ZlJzogJ3JlbW92ZUJsb2NrJyxcbiAgICAncmVyZW5kZXInOiAncmVyZW5kZXJCbG9jaydcbiAgfSxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHt9LFxuXG4gIGNyZWF0ZUJsb2NrOiBmdW5jdGlvbih0eXBlLCBkYXRhKSB7XG4gICAgdHlwZSA9IHV0aWxzLmNsYXNzaWZ5KHR5cGUpO1xuXG4gICAgLy8gUnVuIHZhbGlkYXRpb25zXG4gICAgaWYgKCF0aGlzLmNhbkNyZWF0ZUJsb2NrKHR5cGUpKSB7IHJldHVybjsgfVxuXG4gICAgdmFyIGJsb2NrID0gbmV3IEJsb2Nrc1t0eXBlXShkYXRhLCB0aGlzLmluc3RhbmNlX3Njb3BlLCB0aGlzLm1lZGlhdG9yKTtcbiAgICB0aGlzLmJsb2Nrcy5wdXNoKGJsb2NrKTtcblxuICAgIHRoaXMuX2luY3JlbWVudEJsb2NrVHlwZUNvdW50KHR5cGUpO1xuICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignYmxvY2s6cmVuZGVyJywgYmxvY2spO1xuXG4gICAgdGhpcy50cmlnZ2VyQmxvY2tDb3VudFVwZGF0ZSgpO1xuICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignYmxvY2s6bGltaXRSZWFjaGVkJywgdGhpcy5ibG9ja0xpbWl0UmVhY2hlZCgpKTtcblxuICAgIHV0aWxzLmxvZyhcIkJsb2NrIGNyZWF0ZWQgb2YgdHlwZSBcIiArIHR5cGUpO1xuICB9LFxuXG4gIHJlbW92ZUJsb2NrOiBmdW5jdGlvbihibG9ja0lEKSB7XG4gICAgdmFyIGJsb2NrID0gdGhpcy5maW5kQmxvY2tCeUlkKGJsb2NrSUQpLFxuICAgIHR5cGUgPSB1dGlscy5jbGFzc2lmeShibG9jay50eXBlKTtcblxuICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignYmxvY2stY29udHJvbHM6cmVzZXQnKTtcbiAgICB0aGlzLmJsb2NrcyA9IHRoaXMuYmxvY2tzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICByZXR1cm4gKGl0ZW0uYmxvY2tJRCAhPT0gYmxvY2suYmxvY2tJRCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9kZWNyZW1lbnRCbG9ja1R5cGVDb3VudCh0eXBlKTtcbiAgICB0aGlzLnRyaWdnZXJCbG9ja0NvdW50VXBkYXRlKCk7XG4gICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdibG9jazpsaW1pdFJlYWNoZWQnLCB0aGlzLmJsb2NrTGltaXRSZWFjaGVkKCkpO1xuXG4gICAgRXZlbnRCdXMudHJpZ2dlcihcImJsb2NrOnJlbW92ZVwiKTtcbiAgfSxcblxuICByZXJlbmRlckJsb2NrOiBmdW5jdGlvbihibG9ja0lEKSB7XG4gICAgdmFyIGJsb2NrID0gdGhpcy5maW5kQmxvY2tCeUlkKGJsb2NrSUQpO1xuICAgIGlmICghXy5pc1VuZGVmaW5lZChibG9jaykgJiYgIWJsb2NrLmlzRW1wdHkoKSAmJlxuICAgICAgICBibG9jay5kcm9wX29wdGlvbnMucmVfcmVuZGVyX29uX3Jlb3JkZXIpIHtcbiAgICAgIGJsb2NrLmJlZm9yZUxvYWRpbmdEYXRhKCk7XG4gICAgfVxuICB9LFxuXG4gIHRyaWdnZXJCbG9ja0NvdW50VXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoJ2Jsb2NrOmNvdW50VXBkYXRlJywgdGhpcy5ibG9ja3MubGVuZ3RoKTtcbiAgfSxcblxuICBjYW5DcmVhdGVCbG9jazogZnVuY3Rpb24odHlwZSkge1xuICAgIGlmKHRoaXMuYmxvY2tMaW1pdFJlYWNoZWQoKSkge1xuICAgICAgdXRpbHMubG9nKFwiQ2Fubm90IGFkZCBhbnkgbW9yZSBibG9ja3MuIExpbWl0IHJlYWNoZWQuXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pc0Jsb2NrVHlwZUF2YWlsYWJsZSh0eXBlKSkge1xuICAgICAgdXRpbHMubG9nKFwiQmxvY2sgdHlwZSBub3QgYXZhaWxhYmxlIFwiICsgdHlwZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQ2FuIHdlIGhhdmUgYW5vdGhlciBvbmUgb2YgdGhlc2UgYmxvY2tzP1xuICAgIGlmICghdGhpcy5jYW5BZGRCbG9ja1R5cGUodHlwZSkpIHtcbiAgICAgIHV0aWxzLmxvZyhcIkJsb2NrIExpbWl0IHJlYWNoZWQgZm9yIHR5cGUgXCIgKyB0eXBlKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICB2YWxpZGF0ZUJsb2NrVHlwZXNFeGlzdDogZnVuY3Rpb24oc2hvdWxkVmFsaWRhdGUpIHtcbiAgICBpZiAoY29uZmlnLnNraXBWYWxpZGF0aW9uIHx8ICFzaG91bGRWYWxpZGF0ZSkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgICh0aGlzLnJlcXVpcmVkIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUsIGluZGV4KSB7XG4gICAgICBpZiAoIXRoaXMuaXNCbG9ja1R5cGVBdmFpbGFibGUodHlwZSkpIHsgcmV0dXJuOyB9XG5cbiAgICAgIGlmICh0aGlzLl9nZXRCbG9ja1R5cGVDb3VudCh0eXBlKSA9PT0gMCkge1xuICAgICAgICB1dGlscy5sb2coXCJGYWlsZWQgdmFsaWRhdGlvbiBvbiByZXF1aXJlZCBibG9jayB0eXBlIFwiICsgdHlwZSk7XG4gICAgICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignZXJyb3JzOmFkZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHRleHQ6IGkxOG4udChcImVycm9yczp0eXBlX21pc3NpbmdcIiwgeyB0eXBlOiB0eXBlIH0pIH0pO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgYmxvY2tzID0gdGhpcy5nZXRCbG9ja3NCeVR5cGUodHlwZSkuZmlsdGVyKGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgICByZXR1cm4gIWIuaXNFbXB0eSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYmxvY2tzLmxlbmd0aCA+IDApIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdlcnJvcnM6YWRkJywge1xuICAgICAgICAgIHRleHQ6IGkxOG4udChcImVycm9yczpyZXF1aXJlZF90eXBlX2VtcHR5XCIsIHt0eXBlOiB0eXBlfSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdXRpbHMubG9nKFwiQSByZXF1aXJlZCBibG9jayB0eXBlIFwiICsgdHlwZSArIFwiIGlzIGVtcHR5XCIpO1xuICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICB9LFxuXG4gIGZpbmRCbG9ja0J5SWQ6IGZ1bmN0aW9uKGJsb2NrSUQpIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja3MuZmluZChmdW5jdGlvbihiKSB7XG4gICAgICByZXR1cm4gYi5ibG9ja0lEID09PSBibG9ja0lEO1xuICAgIH0pO1xuICB9LFxuXG4gIGdldEJsb2Nrc0J5VHlwZTogZnVuY3Rpb24odHlwZSkge1xuICAgIHJldHVybiB0aGlzLmJsb2Nrcy5maWx0ZXIoZnVuY3Rpb24oYikge1xuICAgICAgcmV0dXJuIHV0aWxzLmNsYXNzaWZ5KGIudHlwZSkgPT09IHR5cGU7XG4gICAgfSk7XG4gIH0sXG5cbiAgZ2V0QmxvY2tzQnlJRHM6IGZ1bmN0aW9uKGJsb2NrX2lkcykge1xuICAgIHJldHVybiB0aGlzLmJsb2Nrcy5maWx0ZXIoZnVuY3Rpb24oYikge1xuICAgICAgcmV0dXJuIGJsb2NrX2lkcy5pbmNsdWRlcyhiLmJsb2NrSUQpO1xuICAgIH0pO1xuICB9LFxuXG4gIGJsb2NrTGltaXRSZWFjaGVkOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKHRoaXMub3B0aW9ucy5ibG9ja0xpbWl0ICE9PSAwICYmIHRoaXMuYmxvY2tzLmxlbmd0aCA+PSB0aGlzLm9wdGlvbnMuYmxvY2tMaW1pdCk7XG4gIH0sXG5cbiAgaXNCbG9ja1R5cGVBdmFpbGFibGU6IGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gIV8uaXNVbmRlZmluZWQodGhpcy5ibG9ja1R5cGVzW3RdKTtcbiAgfSxcblxuICBjYW5BZGRCbG9ja1R5cGU6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICB2YXIgYmxvY2tfdHlwZV9saW1pdCA9IHRoaXMuX2dldEJsb2NrVHlwZUxpbWl0KHR5cGUpO1xuICAgIHJldHVybiAhKGJsb2NrX3R5cGVfbGltaXQgIT09IDAgJiYgdGhpcy5fZ2V0QmxvY2tUeXBlQ291bnQodHlwZSkgPj0gYmxvY2tfdHlwZV9saW1pdCk7XG4gIH0sXG5cbiAgX3NldEJsb2Nrc1R5cGVzOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmJsb2NrVHlwZXMgPSB1dGlscy5mbGF0dGVuKFxuICAgICAgXy5pc1VuZGVmaW5lZCh0aGlzLm9wdGlvbnMuYmxvY2tUeXBlcykgP1xuICAgICAgQmxvY2tzIDogdGhpcy5vcHRpb25zLmJsb2NrVHlwZXMpO1xuICB9LFxuXG4gIF9zZXRSZXF1aXJlZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZXF1aXJlZCA9IGZhbHNlO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5vcHRpb25zLnJlcXVpcmVkKSAmJiAhXy5pc0VtcHR5KHRoaXMub3B0aW9ucy5yZXF1aXJlZCkpIHtcbiAgICAgIHRoaXMucmVxdWlyZWQgPSB0aGlzLm9wdGlvbnMucmVxdWlyZWQ7XG4gICAgfVxuICB9LFxuXG4gIF9pbmNyZW1lbnRCbG9ja1R5cGVDb3VudDogZnVuY3Rpb24odHlwZSkge1xuICAgIHRoaXMuYmxvY2tDb3VudHNbdHlwZV0gPSAoXy5pc1VuZGVmaW5lZCh0aGlzLmJsb2NrQ291bnRzW3R5cGVdKSkgPyAxIDogdGhpcy5ibG9ja0NvdW50c1t0eXBlXSArIDE7XG4gIH0sXG5cbiAgX2RlY3JlbWVudEJsb2NrVHlwZUNvdW50OiBmdW5jdGlvbih0eXBlKSB7XG4gICAgdGhpcy5ibG9ja0NvdW50c1t0eXBlXSA9IChfLmlzVW5kZWZpbmVkKHRoaXMuYmxvY2tDb3VudHNbdHlwZV0pKSA/IDEgOiB0aGlzLmJsb2NrQ291bnRzW3R5cGVdIC0gMTtcbiAgfSxcblxuICBfZ2V0QmxvY2tUeXBlQ291bnQ6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICByZXR1cm4gKF8uaXNVbmRlZmluZWQodGhpcy5ibG9ja0NvdW50c1t0eXBlXSkpID8gMCA6IHRoaXMuYmxvY2tDb3VudHNbdHlwZV07XG4gIH0sXG5cbiAgX2Jsb2NrTGltaXRSZWFjaGVkOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKHRoaXMub3B0aW9ucy5ibG9ja0xpbWl0ICE9PSAwICYmIHRoaXMuYmxvY2tzLmxlbmd0aCA+PSB0aGlzLm9wdGlvbnMuYmxvY2tMaW1pdCk7XG4gIH0sXG5cbiAgX2dldEJsb2NrVHlwZUxpbWl0OiBmdW5jdGlvbih0KSB7XG4gICAgaWYgKCF0aGlzLmlzQmxvY2tUeXBlQXZhaWxhYmxlKHQpKSB7IHJldHVybiAwOyB9XG4gICAgcmV0dXJuIHBhcnNlSW50KChfLmlzVW5kZWZpbmVkKHRoaXMub3B0aW9ucy5ibG9ja1R5cGVMaW1pdHNbdF0pKSA/IDAgOiB0aGlzLm9wdGlvbnMuYmxvY2tUeXBlTGltaXRzW3RdLCAxMCk7XG4gIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2tNYW5hZ2VyO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHRlbXBsYXRlID0gW1xuICBcIjxkaXYgY2xhc3M9J3N0LWJsb2NrLXBvc2l0aW9uZXJfX2lubmVyJz5cIixcbiAgXCI8c3BhbiBjbGFzcz0nc3QtYmxvY2stcG9zaXRpb25lcl9fc2VsZWN0ZWQtdmFsdWUnPjwvc3Bhbj5cIixcbiAgXCI8c2VsZWN0IGNsYXNzPSdzdC1ibG9jay1wb3NpdGlvbmVyX19zZWxlY3QnPjwvc2VsZWN0PlwiLFxuICBcIjwvZGl2PlwiXG5dLmpvaW4oXCJcXG5cIik7XG5cbnZhciBCbG9ja1Bvc2l0aW9uZXIgPSBmdW5jdGlvbihibG9ja19lbGVtZW50LCBtZWRpYXRvcikge1xuICB0aGlzLm1lZGlhdG9yID0gbWVkaWF0b3I7XG4gIHRoaXMuJGJsb2NrID0gYmxvY2tfZWxlbWVudDtcblxuICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gIHRoaXMuX2JpbmRGdW5jdGlvbnMoKTtcblxuICB0aGlzLmluaXRpYWxpemUoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oQmxvY2tQb3NpdGlvbmVyLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vcmVuZGVyYWJsZScpLCB7XG5cbiAgdG90YWxfYmxvY2tzOiAwLFxuXG4gIGJvdW5kOiBbJ29uQmxvY2tDb3VudENoYW5nZScsICdvblNlbGVjdENoYW5nZScsICd0b2dnbGUnLCAnc2hvdycsICdoaWRlJ10sXG5cbiAgY2xhc3NOYW1lOiAnc3QtYmxvY2stcG9zaXRpb25lcicsXG4gIHZpc2libGVDbGFzczogJ3N0LWJsb2NrLXBvc2l0aW9uZXItLWlzLXZpc2libGUnLFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy4kZWwuYXBwZW5kKHRlbXBsYXRlKTtcbiAgICB0aGlzLiRzZWxlY3QgPSB0aGlzLiQoJy5zdC1ibG9jay1wb3NpdGlvbmVyX19zZWxlY3QnKTtcblxuICAgIHRoaXMuJHNlbGVjdC5vbignY2hhbmdlJywgdGhpcy5vblNlbGVjdENoYW5nZSk7XG5cbiAgICB0aGlzLm1lZGlhdG9yLm9uKFwiYmxvY2tzOmNvdW50VXBkYXRlXCIsIHRoaXMub25CbG9ja0NvdW50Q2hhbmdlKTtcbiAgfSxcblxuICBvbkJsb2NrQ291bnRDaGFuZ2U6IGZ1bmN0aW9uKG5ld19jb3VudCkge1xuICAgIGlmIChuZXdfY291bnQgIT09IHRoaXMudG90YWxfYmxvY2tzKSB7XG4gICAgICB0aGlzLnRvdGFsX2Jsb2NrcyA9IG5ld19jb3VudDtcbiAgICAgIHRoaXMucmVuZGVyUG9zaXRpb25MaXN0KCk7XG4gICAgfVxuICB9LFxuXG4gIG9uU2VsZWN0Q2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsID0gdGhpcy4kc2VsZWN0LnZhbCgpO1xuICAgIGlmICh2YWwgIT09IDApIHtcbiAgICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcihcbiAgICAgICAgXCJibG9ja3M6Y2hhbmdlUG9zaXRpb25cIiwgdGhpcy4kYmxvY2ssIHZhbCxcbiAgICAgICAgKHZhbCA9PT0gMSA/ICdiZWZvcmUnIDogJ2FmdGVyJykpO1xuICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyUG9zaXRpb25MaXN0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgaW5uZXIgPSBcIjxvcHRpb24gdmFsdWU9JzAnPlwiICsgaTE4bi50KFwiZ2VuZXJhbDpwb3NpdGlvblwiKSArIFwiPC9vcHRpb24+XCI7XG4gICAgZm9yKHZhciBpID0gMTsgaSA8PSB0aGlzLnRvdGFsX2Jsb2NrczsgaSsrKSB7XG4gICAgICBpbm5lciArPSBcIjxvcHRpb24gdmFsdWU9XCIraStcIj5cIitpK1wiPC9vcHRpb24+XCI7XG4gICAgfVxuICAgIHRoaXMuJHNlbGVjdC5odG1sKGlubmVyKTtcbiAgfSxcblxuICB0b2dnbGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJHNlbGVjdC52YWwoMCk7XG4gICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3ModGhpcy52aXNpYmxlQ2xhc3MpO1xuICB9LFxuXG4gIHNob3c6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy4kZWwuYWRkQ2xhc3ModGhpcy52aXNpYmxlQ2xhc3MpO1xuICB9LFxuXG4gIGhpZGU6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3ModGhpcy52aXNpYmxlQ2xhc3MpO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrUG9zaXRpb25lcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG5cbnZhciBFdmVudEJ1cyA9IHJlcXVpcmUoJy4vZXZlbnQtYnVzJyk7XG5cbnZhciBCbG9ja1Jlb3JkZXIgPSBmdW5jdGlvbihibG9ja19lbGVtZW50LCBtZWRpYXRvcikge1xuICB0aGlzLiRibG9jayA9IGJsb2NrX2VsZW1lbnQ7XG4gIHRoaXMuYmxvY2tJRCA9IHRoaXMuJGJsb2NrLmF0dHIoJ2lkJyk7XG4gIHRoaXMubWVkaWF0b3IgPSBtZWRpYXRvcjtcblxuICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gIHRoaXMuX2JpbmRGdW5jdGlvbnMoKTtcblxuICB0aGlzLmluaXRpYWxpemUoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oQmxvY2tSZW9yZGVyLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vcmVuZGVyYWJsZScpLCB7XG5cbiAgYm91bmQ6IFsnb25Nb3VzZURvd24nLCAnb25EcmFnU3RhcnQnLCAnb25EcmFnRW5kJywgJ29uRHJvcCddLFxuXG4gIGNsYXNzTmFtZTogJ3N0LWJsb2NrLXVpLWJ0biBzdC1ibG9jay11aS1idG4tLXJlb3JkZXIgc3QtaWNvbicsXG4gIHRhZ05hbWU6ICdhJyxcblxuICBhdHRyaWJ1dGVzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2h0bWwnOiAncmVvcmRlcicsXG4gICAgICAnZHJhZ2dhYmxlJzogJ3RydWUnLFxuICAgICAgJ2RhdGEtaWNvbic6ICdtb3ZlJ1xuICAgIH07XG4gIH0sXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZWwuYmluZCgnbW91c2Vkb3duIHRvdWNoc3RhcnQnLCB0aGlzLm9uTW91c2VEb3duKVxuICAgICAgLmJpbmQoJ2RyYWdzdGFydCcsIHRoaXMub25EcmFnU3RhcnQpXG4gICAgICAuYmluZCgnZHJhZ2VuZCB0b3VjaGVuZCcsIHRoaXMub25EcmFnRW5kKTtcblxuICAgIHRoaXMuJGJsb2NrLmRyb3BBcmVhKClcbiAgICAgIC5iaW5kKCdkcm9wJywgdGhpcy5vbkRyb3ApO1xuICB9LFxuXG4gIGJsb2NrSWQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRibG9jay5hdHRyKCdpZCcpO1xuICB9LFxuXG4gIG9uTW91c2VEb3duOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm1lZGlhdG9yLnRyaWdnZXIoXCJibG9jay1jb250cm9sczpoaWRlXCIpO1xuICAgIEV2ZW50QnVzLnRyaWdnZXIoXCJibG9jazpyZW9yZGVyOmRvd25cIik7XG4gIH0sXG5cbiAgb25Ecm9wOiBmdW5jdGlvbihldikge1xuICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgZHJvcHBlZF9vbiA9IHRoaXMuJGJsb2NrLFxuICAgIGl0ZW1faWQgPSBldi5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKFwidGV4dC9wbGFpblwiKSxcbiAgICBibG9jayA9ICQoJyMnICsgaXRlbV9pZCk7XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoaXRlbV9pZCkgJiYgIV8uaXNFbXB0eShibG9jaykgJiZcbiAgICAgICAgZHJvcHBlZF9vbi5hdHRyKCdpZCcpICE9PSBpdGVtX2lkICYmXG4gICAgICAgICAgZHJvcHBlZF9vbi5hdHRyKCdkYXRhLWluc3RhbmNlJykgPT09IGJsb2NrLmF0dHIoJ2RhdGEtaW5zdGFuY2UnKVxuICAgICAgICkge1xuICAgICAgIGRyb3BwZWRfb24uYWZ0ZXIoYmxvY2spO1xuICAgICB9XG4gICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcihcImJsb2NrOnJlcmVuZGVyXCIsIGl0ZW1faWQpO1xuICAgICBFdmVudEJ1cy50cmlnZ2VyKFwiYmxvY2s6cmVvcmRlcjpkcm9wcGVkXCIsIGl0ZW1faWQpO1xuICB9LFxuXG4gIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldikge1xuICAgIHZhciBidG4gPSAkKGV2LmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpO1xuXG4gICAgZXYub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RHJhZ0ltYWdlKHRoaXMuJGJsb2NrWzBdLCBidG4ucG9zaXRpb24oKS5sZWZ0LCBidG4ucG9zaXRpb24oKS50b3ApO1xuICAgIGV2Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoJ1RleHQnLCB0aGlzLmJsb2NrSWQoKSk7XG5cbiAgICBFdmVudEJ1cy50cmlnZ2VyKFwiYmxvY2s6cmVvcmRlcjpkcmFnc3RhcnRcIik7XG4gICAgdGhpcy4kYmxvY2suYWRkQ2xhc3MoJ3N0LWJsb2NrLS1kcmFnZ2luZycpO1xuICB9LFxuXG4gIG9uRHJhZ0VuZDogZnVuY3Rpb24oZXYpIHtcbiAgICBFdmVudEJ1cy50cmlnZ2VyKFwiYmxvY2s6cmVvcmRlcjpkcmFnZW5kXCIpO1xuICAgIHRoaXMuJGJsb2NrLnJlbW92ZUNsYXNzKCdzdC1ibG9jay0tZHJhZ2dpbmcnKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrUmVvcmRlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBFdmVudEJ1cyA9IHJlcXVpcmUoJy4vZXZlbnQtYnVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8qKlxuICAgKiBJbnRlcm5hbCBzdG9yYWdlIG9iamVjdCBmb3IgdGhlIGJsb2NrXG4gICAqL1xuICBibG9ja1N0b3JhZ2U6IHt9LFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHRoZSBzdG9yZSwgaW5jbHVkaW5nIHRoZSBibG9jayB0eXBlXG4gICAqL1xuICBjcmVhdGVTdG9yZTogZnVuY3Rpb24oYmxvY2tEYXRhKSB7XG4gICAgdGhpcy5ibG9ja1N0b3JhZ2UgPSB7XG4gICAgICB0eXBlOiB1dGlscy51bmRlcnNjb3JlZCh0aGlzLnR5cGUpLFxuICAgICAgZGF0YTogYmxvY2tEYXRhIHx8IHt9XG4gICAgfTtcbiAgfSxcblxuICAvKipcbiAgICogU2VyaWFsaXplIHRoZSBibG9jayBhbmQgc2F2ZSB0aGUgZGF0YSBpbnRvIHRoZSBzdG9yZVxuICAgKi9cbiAgc2F2ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzLl9zZXJpYWxpemVEYXRhKCk7XG5cbiAgICBpZiAoIV8uaXNFbXB0eShkYXRhKSkge1xuICAgICAgdGhpcy5zZXREYXRhKGRhdGEpO1xuICAgIH1cbiAgfSxcblxuICBnZXREYXRhOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNhdmUoKTtcbiAgICByZXR1cm4gdGhpcy5ibG9ja1N0b3JhZ2U7XG4gIH0sXG5cbiAgZ2V0QmxvY2tEYXRhOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNhdmUoKTtcbiAgICByZXR1cm4gdGhpcy5ibG9ja1N0b3JhZ2UuZGF0YTtcbiAgfSxcblxuICBfZ2V0RGF0YTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tTdG9yYWdlLmRhdGE7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNldCB0aGUgYmxvY2sgZGF0YS5cbiAgICogVGhpcyBpcyB1c2VkIGJ5IHRoZSBzYXZlKCkgbWV0aG9kLlxuICAgKi9cbiAgc2V0RGF0YTogZnVuY3Rpb24oYmxvY2tEYXRhKSB7XG4gICAgdXRpbHMubG9nKFwiU2V0dGluZyBkYXRhIGZvciBibG9jayBcIiArIHRoaXMuYmxvY2tJRCk7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLmJsb2NrU3RvcmFnZS5kYXRhLCBibG9ja0RhdGEgfHwge30pO1xuICB9LFxuXG4gIHNldEFuZExvYWREYXRhOiBmdW5jdGlvbihibG9ja0RhdGEpIHtcbiAgICB0aGlzLnNldERhdGEoYmxvY2tEYXRhKTtcbiAgICB0aGlzLmJlZm9yZUxvYWRpbmdEYXRhKCk7XG4gIH0sXG5cbiAgX3NlcmlhbGl6ZURhdGE6IGZ1bmN0aW9uKCkge30sXG4gIGxvYWREYXRhOiBmdW5jdGlvbigpIHt9LFxuXG4gIGJlZm9yZUxvYWRpbmdEYXRhOiBmdW5jdGlvbigpIHtcbiAgICB1dGlscy5sb2coXCJsb2FkRGF0YSBmb3IgXCIgKyB0aGlzLmJsb2NrSUQpO1xuICAgIEV2ZW50QnVzLnRyaWdnZXIoXCJlZGl0b3IvYmxvY2svbG9hZERhdGFcIik7XG4gICAgdGhpcy5sb2FkRGF0YSh0aGlzLl9nZXREYXRhKCkpO1xuICB9LFxuXG4gIF9sb2FkRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgdXRpbHMubG9nKFwiX2xvYWREYXRhIGlzIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgZnV0dXJlLiBQbGVhc2UgdXNlIGJlZm9yZUxvYWRpbmdEYXRhIGluc3RlYWQuXCIpO1xuICAgIHRoaXMuYmVmb3JlTG9hZGluZ0RhdGEoKTtcbiAgfSxcblxuICBjaGVja0FuZExvYWREYXRhOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIV8uaXNFbXB0eSh0aGlzLl9nZXREYXRhKCkpKSB7XG4gICAgICB0aGlzLmJlZm9yZUxvYWRpbmdEYXRhKCk7XG4gICAgfVxuICB9XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgYmVzdE5hbWVGcm9tRmllbGQgPSBmdW5jdGlvbihmaWVsZCkge1xuICB2YXIgbXNnID0gZmllbGQuYXR0cihcImRhdGEtc3QtbmFtZVwiKSB8fCBmaWVsZC5hdHRyKFwibmFtZVwiKTtcblxuICBpZiAoIW1zZykge1xuICAgIG1zZyA9ICdGaWVsZCc7XG4gIH1cblxuICByZXR1cm4gdXRpbHMuY2FwaXRhbGl6ZShtc2cpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgZXJyb3JzOiBbXSxcblxuICB2YWxpZDogZnVuY3Rpb24oKXtcbiAgICB0aGlzLnBlcmZvcm1WYWxpZGF0aW9ucygpO1xuICAgIHJldHVybiB0aGlzLmVycm9ycy5sZW5ndGggPT09IDA7XG4gIH0sXG5cbiAgLy8gVGhpcyBtZXRob2QgYWN0dWFsbHkgZG9lcyB0aGUgbGVnIHdvcmtcbiAgLy8gb2YgcnVubmluZyBvdXIgdmFsaWRhdG9ycyBhbmQgY3VzdG9tIHZhbGlkYXRvcnNcbiAgcGVyZm9ybVZhbGlkYXRpb25zOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlc2V0RXJyb3JzKCk7XG5cbiAgICB2YXIgcmVxdWlyZWRfZmllbGRzID0gdGhpcy4kKCcuc3QtcmVxdWlyZWQnKTtcbiAgICByZXF1aXJlZF9maWVsZHMuZWFjaChmdW5jdGlvbiAoaSwgZikge1xuICAgICAgdGhpcy52YWxpZGF0ZUZpZWxkKGYpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgdGhpcy52YWxpZGF0aW9ucy5mb3JFYWNoKHRoaXMucnVuVmFsaWRhdG9yLCB0aGlzKTtcblxuICAgIHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCdzdC1ibG9jay0td2l0aC1lcnJvcnMnLCB0aGlzLmVycm9ycy5sZW5ndGggPiAwKTtcbiAgfSxcblxuICAvLyBFdmVyeXRoaW5nIGluIGhlcmUgc2hvdWxkIGJlIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRydWUgb3IgZmFsc2VcbiAgdmFsaWRhdGlvbnM6IFtdLFxuXG4gIHZhbGlkYXRlRmllbGQ6IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgZmllbGQgPSAkKGZpZWxkKTtcblxuICAgIHZhciBjb250ZW50ID0gZmllbGQuYXR0cignY29udGVudGVkaXRhYmxlJykgPyBmaWVsZC50ZXh0KCkgOiBmaWVsZC52YWwoKTtcblxuICAgIGlmIChjb250ZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5zZXRFcnJvcihmaWVsZCwgaTE4bi50KFwiZXJyb3JzOmJsb2NrX2VtcHR5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6IGJlc3ROYW1lRnJvbUZpZWxkKGZpZWxkKSB9KSk7XG4gICAgfVxuICB9LFxuXG4gIHJ1blZhbGlkYXRvcjogZnVuY3Rpb24odmFsaWRhdG9yKSB7XG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKHRoaXNbdmFsaWRhdG9yXSkpIHtcbiAgICAgIHRoaXNbdmFsaWRhdG9yXS5jYWxsKHRoaXMpO1xuICAgIH1cbiAgfSxcblxuICBzZXRFcnJvcjogZnVuY3Rpb24oZmllbGQsIHJlYXNvbikge1xuICAgIHZhciAkbXNnID0gdGhpcy5hZGRNZXNzYWdlKHJlYXNvbiwgXCJzdC1tc2ctLWVycm9yXCIpO1xuICAgIGZpZWxkLmFkZENsYXNzKCdzdC1lcnJvcicpO1xuXG4gICAgdGhpcy5lcnJvcnMucHVzaCh7IGZpZWxkOiBmaWVsZCwgcmVhc29uOiByZWFzb24sIG1zZzogJG1zZyB9KTtcbiAgfSxcblxuICByZXNldEVycm9yczogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lcnJvcnMuZm9yRWFjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBlcnJvci5maWVsZC5yZW1vdmVDbGFzcygnc3QtZXJyb3InKTtcbiAgICAgIGVycm9yLm1zZy5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuJG1lc3NhZ2VzLnJlbW92ZUNsYXNzKFwic3QtYmxvY2tfX21lc3NhZ2VzLS1pcy12aXNpYmxlXCIpO1xuICAgIHRoaXMuZXJyb3JzID0gW107XG4gIH1cblxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG5cbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIHN0VG9IVE1MID0gcmVxdWlyZSgnLi90by1odG1sJyk7XG52YXIgc3RUb01hcmtkb3duID0gcmVxdWlyZSgnLi90by1tYXJrZG93bicpO1xudmFyIEJsb2NrTWl4aW5zID0gcmVxdWlyZSgnLi9ibG9ja19taXhpbnMnKTtcblxudmFyIFNpbXBsZUJsb2NrID0gcmVxdWlyZSgnLi9zaW1wbGUtYmxvY2snKTtcbnZhciBCbG9ja1Jlb3JkZXIgPSByZXF1aXJlKCcuL2Jsb2NrLXJlb3JkZXInKTtcbnZhciBCbG9ja0RlbGV0aW9uID0gcmVxdWlyZSgnLi9ibG9jay1kZWxldGlvbicpO1xudmFyIEJsb2NrUG9zaXRpb25lciA9IHJlcXVpcmUoJy4vYmxvY2stcG9zaXRpb25lcicpO1xudmFyIEZvcm1hdHRlcnMgPSByZXF1aXJlKCcuL2Zvcm1hdHRlcnMnKTtcbnZhciBFdmVudEJ1cyA9IHJlcXVpcmUoJy4vZXZlbnQtYnVzJyk7XG5cbnZhciBTcGlubmVyID0gcmVxdWlyZSgnc3Bpbi5qcycpO1xuXG52YXIgQmxvY2sgPSBmdW5jdGlvbihkYXRhLCBpbnN0YW5jZV9pZCwgbWVkaWF0b3IpIHtcbiAgU2ltcGxlQmxvY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbkJsb2NrLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU2ltcGxlQmxvY2sucHJvdG90eXBlKTtcbkJsb2NrLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJsb2NrO1xuXG52YXIgZGVsZXRlX3RlbXBsYXRlID0gW1xuICBcIjxkaXYgY2xhc3M9J3N0LWJsb2NrX191aS1kZWxldGUtY29udHJvbHMnPlwiLFxuICBcIjxsYWJlbCBjbGFzcz0nc3QtYmxvY2tfX2RlbGV0ZS1sYWJlbCc+XCIsXG4gIFwiPCU9IGkxOG4udCgnZ2VuZXJhbDpkZWxldGUnKSAlPlwiLFxuICBcIjwvbGFiZWw+XCIsXG4gIFwiPGEgY2xhc3M9J3N0LWJsb2NrLXVpLWJ0biBzdC1ibG9jay11aS1idG4tLWNvbmZpcm0tZGVsZXRlIHN0LWljb24nIGRhdGEtaWNvbj0ndGljayc+PC9hPlwiLFxuICBcIjxhIGNsYXNzPSdzdC1ibG9jay11aS1idG4gc3QtYmxvY2stdWktYnRuLS1kZW55LWRlbGV0ZSBzdC1pY29uJyBkYXRhLWljb249J2Nsb3NlJz48L2E+XCIsXG4gIFwiPC9kaXY+XCJcbl0uam9pbihcIlxcblwiKTtcblxudmFyIGRyb3Bfb3B0aW9ucyA9IHtcbiAgaHRtbDogWyc8ZGl2IGNsYXNzPVwic3QtYmxvY2tfX2Ryb3B6b25lXCI+JyxcbiAgICAnPHNwYW4gY2xhc3M9XCJzdC1pY29uXCI+PCU9IF8ucmVzdWx0KGJsb2NrLCBcImljb25fbmFtZVwiKSAlPjwvc3Bhbj4nLFxuICAgICc8cD48JT0gaTE4bi50KFwiZ2VuZXJhbDpkcm9wXCIsIHsgYmxvY2s6IFwiPHNwYW4+XCIgKyBfLnJlc3VsdChibG9jaywgXCJ0aXRsZVwiKSArIFwiPC9zcGFuPlwiIH0pICU+JyxcbiAgICAnPC9wPjwvZGl2PiddLmpvaW4oJ1xcbicpLFxuICAgIHJlX3JlbmRlcl9vbl9yZW9yZGVyOiBmYWxzZVxufTtcblxudmFyIHBhc3RlX29wdGlvbnMgPSB7XG4gIGh0bWw6IFsnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCI8JT0gaTE4bi50KFwiZ2VuZXJhbDpwYXN0ZVwiKSAlPlwiJyxcbiAgICAnIGNsYXNzPVwic3QtYmxvY2tfX3Bhc3RlLWlucHV0IHN0LXBhc3RlLWJsb2NrXCI+J10uam9pbignJylcbn07XG5cbnZhciB1cGxvYWRfb3B0aW9ucyA9IHtcbiAgaHRtbDogW1xuICAgICc8ZGl2IGNsYXNzPVwic3QtYmxvY2tfX3VwbG9hZC1jb250YWluZXJcIj4nLFxuICAgICc8aW5wdXQgdHlwZT1cImZpbGVcIiB0eXBlPVwic3QtZmlsZS11cGxvYWRcIj4nLFxuICAgICc8YnV0dG9uIGNsYXNzPVwic3QtdXBsb2FkLWJ0blwiPjwlPSBpMThuLnQoXCJnZW5lcmFsOnVwbG9hZFwiKSAlPjwvYnV0dG9uPicsXG4gICAgJzwvZGl2PidcbiAgXS5qb2luKCdcXG4nKVxufTtcblxuY29uZmlnLmRlZmF1bHRzLkJsb2NrID0ge1xuICBkcm9wX29wdGlvbnM6IGRyb3Bfb3B0aW9ucyxcbiAgcGFzdGVfb3B0aW9uczogcGFzdGVfb3B0aW9ucyxcbiAgdXBsb2FkX29wdGlvbnM6IHVwbG9hZF9vcHRpb25zXG59O1xuXG5PYmplY3QuYXNzaWduKEJsb2NrLnByb3RvdHlwZSwgU2ltcGxlQmxvY2suZm4sIHJlcXVpcmUoJy4vYmxvY2stdmFsaWRhdGlvbnMnKSwge1xuXG4gIGJvdW5kOiBbXCJfaGFuZGxlQ29udGVudFBhc3RlXCIsIFwiX29uRm9jdXNcIiwgXCJfb25CbHVyXCIsIFwib25Ecm9wXCIsIFwib25EZWxldGVDbGlja1wiLFxuICAgIFwiY2xlYXJJbnNlcnRlZFN0eWxlc1wiLCBcImdldFNlbGVjdGlvbkZvckZvcm1hdHRlclwiLCBcIm9uQmxvY2tSZW5kZXJcIl0sXG5cbiAgICBjbGFzc05hbWU6ICdzdC1ibG9jayBzdC1pY29uLS1hZGQnLFxuXG4gICAgYXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihTaW1wbGVCbG9jay5mbi5hdHRyaWJ1dGVzLmNhbGwodGhpcyksIHtcbiAgICAgICAgJ2RhdGEtaWNvbi1hZnRlcicgOiBcImFkZFwiXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgaWNvbl9uYW1lOiAnZGVmYXVsdCcsXG5cbiAgICB2YWxpZGF0aW9uRmFpbE1zZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gaTE4bi50KCdlcnJvcnM6dmFsaWRhdGlvbl9mYWlsJywgeyB0eXBlOiB0aGlzLnRpdGxlKCkgfSk7XG4gICAgfSxcblxuICAgIGVkaXRvckhUTUw6ICc8ZGl2IGNsYXNzPVwic3QtYmxvY2tfX2VkaXRvclwiPjwvZGl2PicsXG5cbiAgICB0b29sYmFyRW5hYmxlZDogdHJ1ZSxcblxuICAgIGF2YWlsYWJsZU1peGluczogWydkcm9wcGFibGUnLCAncGFzdGFibGUnLCAndXBsb2FkYWJsZScsICdmZXRjaGFibGUnLFxuICAgICAgJ2FqYXhhYmxlJywgJ2NvbnRyb2xsYWJsZSddLFxuXG4gICAgZHJvcHBhYmxlOiBmYWxzZSxcbiAgICBwYXN0YWJsZTogZmFsc2UsXG4gICAgdXBsb2FkYWJsZTogZmFsc2UsXG4gICAgZmV0Y2hhYmxlOiBmYWxzZSxcbiAgICBhamF4YWJsZTogZmFsc2UsXG5cbiAgICBkcm9wX29wdGlvbnM6IHt9LFxuICAgIHBhc3RlX29wdGlvbnM6IHt9LFxuICAgIHVwbG9hZF9vcHRpb25zOiB7fSxcblxuICAgIGZvcm1hdHRhYmxlOiB0cnVlLFxuXG4gICAgX3ByZXZpb3VzU2VsZWN0aW9uOiAnJyxcblxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge30sXG5cbiAgICB0b01hcmtkb3duOiBmdW5jdGlvbihtYXJrZG93bil7IHJldHVybiBtYXJrZG93bjsgfSxcbiAgICB0b0hUTUw6IGZ1bmN0aW9uKGh0bWwpeyByZXR1cm4gaHRtbDsgfSxcblxuICAgIHdpdGhNaXhpbjogZnVuY3Rpb24obWl4aW4pIHtcbiAgICAgIGlmICghXy5pc09iamVjdChtaXhpbikpIHsgcmV0dXJuOyB9XG5cbiAgICAgIHZhciBpbml0aWFsaXplTWV0aG9kID0gXCJpbml0aWFsaXplXCIgKyBtaXhpbi5taXhpbk5hbWU7XG5cbiAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHRoaXNbaW5pdGlhbGl6ZU1ldGhvZF0pKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgbWl4aW4pO1xuICAgICAgICB0aGlzW2luaXRpYWxpemVNZXRob2RdKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmJlZm9yZUJsb2NrUmVuZGVyKCk7XG4gICAgICB0aGlzLl9zZXRCbG9ja0lubmVyKCk7XG5cbiAgICAgIHRoaXMuJGVkaXRvciA9IHRoaXMuJGlubmVyLmNoaWxkcmVuKCkuZmlyc3QoKTtcblxuICAgICAgaWYodGhpcy5kcm9wcGFibGUgfHwgdGhpcy5wYXN0YWJsZSB8fCB0aGlzLnVwbG9hZGFibGUpIHtcbiAgICAgICAgdmFyIGlucHV0X2h0bWwgPSAkKFwiPGRpdj5cIiwgeyAnY2xhc3MnOiAnc3QtYmxvY2tfX2lucHV0cycgfSk7XG4gICAgICAgIHRoaXMuJGlubmVyLmFwcGVuZChpbnB1dF9odG1sKTtcbiAgICAgICAgdGhpcy4kaW5wdXRzID0gaW5wdXRfaHRtbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaGFzVGV4dEJsb2NrKSB7IHRoaXMuX2luaXRUZXh0QmxvY2tzKCk7IH1cblxuICAgICAgdGhpcy5hdmFpbGFibGVNaXhpbnMuZm9yRWFjaChmdW5jdGlvbihtaXhpbikge1xuICAgICAgICBpZiAodGhpc1ttaXhpbl0pIHtcbiAgICAgICAgICB0aGlzLndpdGhNaXhpbihCbG9ja01peGluc1t1dGlscy5jbGFzc2lmeShtaXhpbildKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIGlmICh0aGlzLmZvcm1hdHRhYmxlKSB7IHRoaXMuX2luaXRGb3JtYXR0aW5nKCk7IH1cblxuICAgICAgdGhpcy5fYmxvY2tQcmVwYXJlKCk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuYWpheGFibGUpIHtcbiAgICAgICAgdGhpcy5yZXNvbHZlQWxsSW5RdWV1ZSgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiRlbC5yZW1vdmUoKTtcbiAgICB9LFxuXG4gICAgbG9hZGluZzogZnVuY3Rpb24oKSB7XG4gICAgICBpZighXy5pc1VuZGVmaW5lZCh0aGlzLnNwaW5uZXIpKSB7IHRoaXMucmVhZHkoKTsgfVxuXG4gICAgICB0aGlzLnNwaW5uZXIgPSBuZXcgU3Bpbm5lcihjb25maWcuZGVmYXVsdHMuc3Bpbm5lcik7XG4gICAgICB0aGlzLnNwaW5uZXIuc3Bpbih0aGlzLiRlbFswXSk7XG5cbiAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdzdC0taXMtbG9hZGluZycpO1xuICAgIH0sXG5cbiAgICByZWFkeTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnc3QtLWlzLWxvYWRpbmcnKTtcbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZCh0aGlzLnNwaW5uZXIpKSB7XG4gICAgICAgIHRoaXMuc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnNwaW5uZXI7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qIEdlbmVyaWMgX3NlcmlhbGl6ZURhdGEgaW1wbGVtZW50YXRpb24gdG8gc2VyaWFsaXplIHRoZSBibG9jayBpbnRvIGEgcGxhaW4gb2JqZWN0LlxuICAgICAqIENhbiBiZSBvdmVyd3JpdHRlbiwgYWx0aG91Z2ggaG9wZWZ1bGx5IHRoaXMgd2lsbCBjb3ZlciBtb3N0IHNpdHVhdGlvbnMuXG4gICAgICogSWYgeW91IHdhbnQgdG8gZ2V0IHRoZSBkYXRhIG9mIHlvdXIgYmxvY2sgdXNlIGJsb2NrLmdldEJsb2NrRGF0YSgpXG4gICAgICovXG4gICAgX3NlcmlhbGl6ZURhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgdXRpbHMubG9nKFwidG9EYXRhIGZvciBcIiArIHRoaXMuYmxvY2tJRCk7XG5cbiAgICAgIHZhciBkYXRhID0ge307XG5cbiAgICAgIC8qIFNpbXBsZSB0byBzdGFydC4gQWRkIGNvbmRpdGlvbnMgbGF0ZXIgKi9cbiAgICAgIGlmICh0aGlzLmhhc1RleHRCbG9jaygpKSB7XG4gICAgICAgIHZhciBjb250ZW50ID0gdGhpcy5nZXRUZXh0QmxvY2soKS5odG1sKCk7XG4gICAgICAgIGlmIChjb250ZW50Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBkYXRhLnRleHQgPSBzdFRvTWFya2Rvd24oY29udGVudCwgdGhpcy50eXBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBBZGQgYW55IGlucHV0cyB0byB0aGUgZGF0YSBhdHRyXG4gICAgICBpZiAodGhpcy4kKCc6aW5wdXQnKS5ub3QoJy5zdC1wYXN0ZS1ibG9jaycpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy4kKCc6aW5wdXQnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LGlucHV0KXtcbiAgICAgICAgICBpZiAoaW5wdXQuZ2V0QXR0cmlidXRlKCduYW1lJykpIHtcbiAgICAgICAgICAgIGRhdGFbaW5wdXQuZ2V0QXR0cmlidXRlKCduYW1lJyldID0gaW5wdXQudmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSxcblxuICAgIC8qIEdlbmVyaWMgaW1wbGVtZW50YXRpb24gdG8gdGVsbCB1cyB3aGVuIHRoZSBibG9jayBpcyBhY3RpdmUgKi9cbiAgICBmb2N1czogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdldFRleHRCbG9jaygpLmZvY3VzKCk7XG4gICAgfSxcblxuICAgIGJsdXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nZXRUZXh0QmxvY2soKS5ibHVyKCk7XG4gICAgfSxcblxuICAgIG9uRm9jdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nZXRUZXh0QmxvY2soKS5iaW5kKCdmb2N1cycsIHRoaXMuX29uRm9jdXMpO1xuICAgIH0sXG5cbiAgICBvbkJsdXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nZXRUZXh0QmxvY2soKS5iaW5kKCdibHVyJywgdGhpcy5fb25CbHVyKTtcbiAgICB9LFxuXG4gICAgLypcbiAgICAgKiBFdmVudCBoYW5kbGVyc1xuICAgICAqL1xuXG4gICAgX29uRm9jdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy50cmlnZ2VyKCdibG9ja0ZvY3VzJywgdGhpcy4kZWwpO1xuICAgIH0sXG5cbiAgICBfb25CbHVyOiBmdW5jdGlvbigpIHt9LFxuXG4gICAgb25CbG9ja1JlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmZvY3VzKCk7XG4gICAgfSxcblxuICAgIG9uRHJvcDogZnVuY3Rpb24oZGF0YVRyYW5zZmVyT2JqKSB7fSxcblxuICAgIG9uRGVsZXRlQ2xpY2s6IGZ1bmN0aW9uKGV2KSB7XG4gICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICB2YXIgb25EZWxldGVDb25maXJtID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignYmxvY2s6cmVtb3ZlJywgdGhpcy5ibG9ja0lEKTtcbiAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBvbkRlbGV0ZURlbnkgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ3N0LWJsb2NrLS1kZWxldGUtYWN0aXZlJyk7XG4gICAgICAgICRkZWxldGVfZWwucmVtb3ZlKCk7XG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5pc0VtcHR5KCkpIHtcbiAgICAgICAgb25EZWxldGVDb25maXJtLmNhbGwodGhpcywgbmV3IEV2ZW50KCdjbGljaycpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiRpbm5lci5hcHBlbmQoXy50ZW1wbGF0ZShkZWxldGVfdGVtcGxhdGUpKTtcbiAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdzdC1ibG9jay0tZGVsZXRlLWFjdGl2ZScpO1xuXG4gICAgICB2YXIgJGRlbGV0ZV9lbCA9IHRoaXMuJGlubmVyLmZpbmQoJy5zdC1ibG9ja19fdWktZGVsZXRlLWNvbnRyb2xzJyk7XG5cbiAgICAgIHRoaXMuJGlubmVyLm9uKCdjbGljaycsICcuc3QtYmxvY2stdWktYnRuLS1jb25maXJtLWRlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICBvbkRlbGV0ZUNvbmZpcm0uYmluZCh0aGlzKSlcbiAgICAgICAgICAgICAgICAgICAgIC5vbignY2xpY2snLCAnLnN0LWJsb2NrLXVpLWJ0bi0tZGVueS1kZWxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgIG9uRGVsZXRlRGVueS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgcGFzdGVkTWFya2Rvd25Ub0hUTUw6IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgICAgIHJldHVybiBzdFRvSFRNTChzdFRvTWFya2Rvd24oY29udGVudCwgdGhpcy50eXBlKSwgdGhpcy50eXBlKTtcbiAgICB9LFxuXG4gICAgb25Db250ZW50UGFzdGVkOiBmdW5jdGlvbihldmVudCwgdGFyZ2V0KXtcbiAgICAgIHRhcmdldC5odG1sKHRoaXMucGFzdGVkTWFya2Rvd25Ub0hUTUwodGFyZ2V0WzBdLmlubmVySFRNTCkpO1xuICAgICAgdGhpcy5nZXRUZXh0QmxvY2soKS5jYXJldFRvRW5kKCk7XG4gICAgfSxcblxuICAgIGJlZm9yZUxvYWRpbmdEYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubG9hZGluZygpO1xuXG4gICAgICBpZih0aGlzLmRyb3BwYWJsZSB8fCB0aGlzLnVwbG9hZGFibGUgfHwgdGhpcy5wYXN0YWJsZSkge1xuICAgICAgICB0aGlzLiRlZGl0b3Iuc2hvdygpO1xuICAgICAgICB0aGlzLiRpbnB1dHMuaGlkZSgpO1xuICAgICAgfVxuXG4gICAgICBTaW1wbGVCbG9jay5mbi5iZWZvcmVMb2FkaW5nRGF0YS5jYWxsKHRoaXMpO1xuXG4gICAgICB0aGlzLnJlYWR5KCk7XG4gICAgfSxcblxuICAgIF9oYW5kbGVDb250ZW50UGFzdGU6IGZ1bmN0aW9uKGV2KSB7XG4gICAgICBzZXRUaW1lb3V0KHRoaXMub25Db250ZW50UGFzdGVkLmJpbmQodGhpcywgZXYsICQoZXYuY3VycmVudFRhcmdldCkpLCAwKTtcbiAgICB9LFxuXG4gICAgX2dldEJsb2NrQ2xhc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICdzdC1ibG9jay0tJyArIHRoaXMuY2xhc3NOYW1lO1xuICAgIH0sXG5cbiAgICAvKlxuICAgICAqIEluaXQgZnVuY3Rpb25zIGZvciBhZGRpbmcgZnVuY3Rpb25hbGl0eVxuICAgICAqL1xuXG4gICAgX2luaXRVSUNvbXBvbmVudHM6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgcG9zaXRpb25lciA9IG5ldyBCbG9ja1Bvc2l0aW9uZXIodGhpcy4kZWwsIHRoaXMubWVkaWF0b3IpO1xuXG4gICAgICB0aGlzLl93aXRoVUlDb21wb25lbnQocG9zaXRpb25lciwgJy5zdC1ibG9jay11aS1idG4tLXJlb3JkZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uZXIudG9nZ2xlKTtcblxuICAgICAgdGhpcy5fd2l0aFVJQ29tcG9uZW50KG5ldyBCbG9ja1Jlb3JkZXIodGhpcy4kZWwsIHRoaXMubWVkaWF0b3IpKTtcblxuICAgICAgdGhpcy5fd2l0aFVJQ29tcG9uZW50KG5ldyBCbG9ja0RlbGV0aW9uKCksICcuc3QtYmxvY2stdWktYnRuLS1kZWxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25EZWxldGVDbGljayk7XG5cbiAgICAgIHRoaXMub25Gb2N1cygpO1xuICAgICAgdGhpcy5vbkJsdXIoKTtcbiAgICB9LFxuXG4gICAgX2luaXRGb3JtYXR0aW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEVuYWJsZSBmb3JtYXR0aW5nIGtleWJvYXJkIGlucHV0XG4gICAgICB2YXIgZm9ybWF0dGVyO1xuICAgICAgZm9yICh2YXIgbmFtZSBpbiBGb3JtYXR0ZXJzKSB7XG4gICAgICAgIGlmIChGb3JtYXR0ZXJzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgZm9ybWF0dGVyID0gRm9ybWF0dGVyc1tuYW1lXTtcbiAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoZm9ybWF0dGVyLmtleUNvZGUpKSB7XG4gICAgICAgICAgICBmb3JtYXR0ZXIuX2JpbmRUb0Jsb2NrKHRoaXMuJGVsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2luaXRUZXh0QmxvY2tzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ2V0VGV4dEJsb2NrKClcbiAgICAgIC5iaW5kKCdwYXN0ZScsIHRoaXMuX2hhbmRsZUNvbnRlbnRQYXN0ZSlcbiAgICAgIC5iaW5kKCdrZXl1cCcsIHRoaXMuZ2V0U2VsZWN0aW9uRm9yRm9ybWF0dGVyKVxuICAgICAgLmJpbmQoJ21vdXNldXAnLCB0aGlzLmdldFNlbGVjdGlvbkZvckZvcm1hdHRlcilcbiAgICAgIC5iaW5kKCdET01Ob2RlSW5zZXJ0ZWQnLCB0aGlzLmNsZWFySW5zZXJ0ZWRTdHlsZXMpO1xuICAgIH0sXG5cbiAgICBnZXRTZWxlY3Rpb25Gb3JGb3JtYXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGJsb2NrID0gdGhpcztcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCksXG4gICAgICAgICAgICBzZWxlY3Rpb25TdHIgPSBzZWxlY3Rpb24udG9TdHJpbmcoKS50cmltKCksXG4gICAgICAgICAgICBlbiA9ICdmb3JtYXR0ZXI6JyArICgoc2VsZWN0aW9uU3RyID09PSAnJykgPyAnaGlkZScgOiAncG9zaXRpb24nKTtcblxuICAgICAgICBibG9jay5tZWRpYXRvci50cmlnZ2VyKGVuLCBibG9jayk7XG4gICAgICAgIEV2ZW50QnVzLnRyaWdnZXIoZW4sIGJsb2NrKTtcbiAgICAgIH0sIDEpO1xuICAgIH0sXG5cbiAgICBjbGVhckluc2VydGVkU3R5bGVzOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgICB0YXJnZXQucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpOyAvLyBIYWNreSBmaXggZm9yIENocm9tZS5cbiAgICB9LFxuXG4gICAgaGFzVGV4dEJsb2NrOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRleHRCbG9jaygpLmxlbmd0aCA+IDA7XG4gICAgfSxcblxuICAgIGdldFRleHRCbG9jazogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoXy5pc1VuZGVmaW5lZCh0aGlzLnRleHRfYmxvY2spKSB7XG4gICAgICAgIHRoaXMudGV4dF9ibG9jayA9IHRoaXMuJCgnLnN0LXRleHQtYmxvY2snKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMudGV4dF9ibG9jaztcbiAgICB9LFxuXG4gICAgaXNFbXB0eTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy5pc0VtcHR5KHRoaXMuZ2V0QmxvY2tEYXRhKCkpO1xuICAgIH1cblxufSk7XG5cbkJsb2NrLmV4dGVuZCA9IHJlcXVpcmUoJy4vaGVscGVycy9leHRlbmQnKTsgLy8gQWxsb3cgb3VyIEJsb2NrIHRvIGJlIGV4dGVuZGVkLlxuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG1peGluTmFtZTogXCJBamF4YWJsZVwiLFxuXG4gIGFqYXhhYmxlOiB0cnVlLFxuXG4gIGluaXRpYWxpemVBamF4YWJsZTogZnVuY3Rpb24oKXtcbiAgICB0aGlzLl9xdWV1ZWQgPSBbXTtcbiAgfSxcblxuICBhZGRRdWV1ZWRJdGVtOiBmdW5jdGlvbihuYW1lLCBkZWZlcnJlZCkge1xuICAgIHV0aWxzLmxvZyhcIkFkZGluZyBxdWV1ZWQgaXRlbSBmb3IgXCIgKyB0aGlzLmJsb2NrSUQgKyBcIiBjYWxsZWQgXCIgKyBuYW1lKTtcblxuICAgIHRoaXMuX3F1ZXVlZC5wdXNoKHsgbmFtZTogbmFtZSwgZGVmZXJyZWQ6IGRlZmVycmVkIH0pO1xuICB9LFxuXG4gIHJlbW92ZVF1ZXVlZEl0ZW06IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB1dGlscy5sb2coXCJSZW1vdmluZyBxdWV1ZWQgaXRlbSBmb3IgXCIgKyB0aGlzLmJsb2NrSUQgKyBcIiBjYWxsZWQgXCIgKyBuYW1lKTtcblxuICAgIHRoaXMuX3F1ZXVlZCA9IHRoaXMuX3F1ZXVlZC5maWx0ZXIoZnVuY3Rpb24ocXVldWVkKSB7XG4gICAgICByZXR1cm4gcXVldWVkLm5hbWUgIT09IG5hbWU7XG4gICAgfSk7XG4gIH0sXG5cbiAgaGFzSXRlbXNJblF1ZXVlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fcXVldWVkLmxlbmd0aCA+IDA7XG4gIH0sXG5cbiAgcmVzb2x2ZUFsbEluUXVldWU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3F1ZXVlZC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgdXRpbHMubG9nKFwiQWJvcnRpbmcgcXVldWVkIHJlcXVlc3Q6IFwiICsgaXRlbS5uYW1lKTtcbiAgICAgIGl0ZW0uZGVmZXJyZWQuYWJvcnQoKTtcbiAgICB9LCB0aGlzKTtcbiAgfVxuXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG1peGluTmFtZTogXCJDb250cm9sbGFibGVcIixcblxuICBpbml0aWFsaXplQ29udHJvbGxhYmxlOiBmdW5jdGlvbigpIHtcbiAgICB1dGlscy5sb2coXCJBZGRpbmcgY29udHJvbGxhYmxlIHRvIGJsb2NrIFwiICsgdGhpcy5ibG9ja0lEKTtcbiAgICB0aGlzLiRjb250cm9sX3VpID0gJCgnPGRpdj4nLCB7J2NsYXNzJzogJ3N0LWJsb2NrX19jb250cm9sLXVpJ30pO1xuICAgIE9iamVjdC5rZXlzKHRoaXMuY29udHJvbHMpLmZvckVhY2goXG4gICAgICBmdW5jdGlvbihjbWQpIHtcbiAgICAgICAgLy8gQmluZCBjb25maWd1cmVkIGhhbmRsZXIgdG8gY3VycmVudCBibG9jayBjb250ZXh0XG4gICAgICAgIHRoaXMuYWRkVWlDb250cm9sKGNtZCwgdGhpcy5jb250cm9sc1tjbWRdLmJpbmQodGhpcykpO1xuICAgICAgfSxcbiAgICAgIHRoaXNcbiAgICApO1xuICAgIHRoaXMuJGlubmVyLmFwcGVuZCh0aGlzLiRjb250cm9sX3VpKTtcbiAgfSxcblxuICBnZXRDb250cm9sVGVtcGxhdGU6IGZ1bmN0aW9uKGNtZCkge1xuICAgIHJldHVybiAkKFwiPGE+XCIsXG4gICAgICB7ICdkYXRhLWljb24nOiBjbWQsXG4gICAgICAgICdjbGFzcyc6ICdzdC1pY29uIHN0LWJsb2NrLWNvbnRyb2wtdWktYnRuIHN0LWJsb2NrLWNvbnRyb2wtdWktYnRuLS0nICsgY21kXG4gICAgICB9KTtcbiAgfSxcblxuICBhZGRVaUNvbnRyb2w6IGZ1bmN0aW9uKGNtZCwgaGFuZGxlcikge1xuICAgIHRoaXMuJGNvbnRyb2xfdWkuYXBwZW5kKHRoaXMuZ2V0Q29udHJvbFRlbXBsYXRlKGNtZCkpO1xuICAgIHRoaXMuJGNvbnRyb2xfdWkub24oJ2NsaWNrJywgJy5zdC1ibG9jay1jb250cm9sLXVpLWJ0bi0tJyArIGNtZCwgaGFuZGxlcik7XG4gIH1cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLyogQWRkcyBkcm9wIGZ1bmN0aW9uYWx0aXkgdG8gdGhpcyBibG9jayAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uL2NvbmZpZycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi4vZXZlbnQtYnVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG1peGluTmFtZTogXCJEcm9wcGFibGVcIixcbiAgdmFsaWRfZHJvcF9maWxlX3R5cGVzOiBbJ0ZpbGUnLCAnRmlsZXMnLCAndGV4dC9wbGFpbicsICd0ZXh0L3VyaS1saXN0J10sXG5cbiAgaW5pdGlhbGl6ZURyb3BwYWJsZTogZnVuY3Rpb24oKSB7XG4gICAgdXRpbHMubG9nKFwiQWRkaW5nIGRyb3BwYWJsZSB0byBibG9jayBcIiArIHRoaXMuYmxvY2tJRCk7XG5cbiAgICB0aGlzLmRyb3Bfb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmZpZy5kZWZhdWx0cy5CbG9jay5kcm9wX29wdGlvbnMsIHRoaXMuZHJvcF9vcHRpb25zKTtcblxuICAgIHZhciBkcm9wX2h0bWwgPSAkKF8udGVtcGxhdGUodGhpcy5kcm9wX29wdGlvbnMuaHRtbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgYmxvY2s6IHRoaXMsIF86IF8gfSkpO1xuXG4gICAgdGhpcy4kZWRpdG9yLmhpZGUoKTtcbiAgICB0aGlzLiRpbnB1dHMuYXBwZW5kKGRyb3BfaHRtbCk7XG4gICAgdGhpcy4kZHJvcHpvbmUgPSBkcm9wX2h0bWw7XG5cbiAgICAvLyBCaW5kIG91ciBkcm9wIGV2ZW50XG4gICAgdGhpcy4kZHJvcHpvbmUuZHJvcEFyZWEoKVxuICAgICAgICAgICAgICAgICAgLmJpbmQoJ2Ryb3AnLCB0aGlzLl9oYW5kbGVEcm9wLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy4kaW5uZXIuYWRkQ2xhc3MoJ3N0LWJsb2NrX19pbm5lci0tZHJvcHBhYmxlJyk7XG4gIH0sXG5cbiAgX2hhbmRsZURyb3A6IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBlID0gZS5vcmlnaW5hbEV2ZW50O1xuXG4gICAgdmFyIGVsID0gJChlLnRhcmdldCksXG4gICAgICAgIHR5cGVzID0gZS5kYXRhVHJhbnNmZXIudHlwZXM7XG5cbiAgICBlbC5yZW1vdmVDbGFzcygnc3QtZHJvcHpvbmUtLWRyYWdvdmVyJyk7XG5cbiAgICAvKlxuICAgICAgQ2hlY2sgdGhlIHR5cGUgd2UganVzdCByZWNlaXZlZCxcbiAgICAgIGRlbGVnYXRlIGl0IGF3YXkgdG8gb3VyIGJsb2NrVHlwZXMgdG8gcHJvY2Vzc1xuICAgICovXG5cbiAgICBpZiAodHlwZXMgJiZcbiAgICAgICAgdHlwZXMuc29tZShmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZF9kcm9wX2ZpbGVfdHlwZXMuaW5jbHVkZXModHlwZSk7XG4gICAgICAgICAgICAgICAgICAgfSwgdGhpcykpIHtcbiAgICAgIHRoaXMub25Ecm9wKGUuZGF0YVRyYW5zZmVyKTtcbiAgICB9XG5cbiAgICBFdmVudEJ1cy50cmlnZ2VyKCdibG9jazpjb250ZW50OmRyb3BwZWQnLCB0aGlzLmJsb2NrSUQpO1xuICB9XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuLi9sb2Rhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbWl4aW5OYW1lOiBcIkZldGNoYWJsZVwiLFxuXG4gIGluaXRpYWxpemVGZXRjaGFibGU6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy53aXRoTWl4aW4ocmVxdWlyZSgnLi9hamF4YWJsZScpKTtcbiAgfSxcblxuICBmZXRjaDogZnVuY3Rpb24ob3B0aW9ucywgc3VjY2VzcywgZmFpbHVyZSl7XG4gICAgdmFyIHVpZCA9IF8udW5pcXVlSWQodGhpcy5ibG9ja0lEICsgXCJfZmV0Y2hcIiksXG4gICAgICAgIHhociA9ICQuYWpheChvcHRpb25zKTtcblxuICAgIHRoaXMucmVzZXRNZXNzYWdlcygpO1xuICAgIHRoaXMuYWRkUXVldWVkSXRlbSh1aWQsIHhocik7XG5cbiAgICBpZighXy5pc1VuZGVmaW5lZChzdWNjZXNzKSkge1xuICAgICAgeGhyLmRvbmUoc3VjY2Vzcy5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBpZighXy5pc1VuZGVmaW5lZChmYWlsdXJlKSkge1xuICAgICAgeGhyLmZhaWwoZmFpbHVyZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICB4aHIuYWx3YXlzKHRoaXMucmVtb3ZlUXVldWVkSXRlbS5iaW5kKHRoaXMsIHVpZCkpO1xuXG4gICAgcmV0dXJuIHhocjtcbiAgfVxuXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBBamF4YWJsZTogcmVxdWlyZSgnLi9hamF4YWJsZS5qcycpLFxuICBDb250cm9sbGFibGU6IHJlcXVpcmUoJy4vY29udHJvbGxhYmxlLmpzJyksXG4gIERyb3BwYWJsZTogcmVxdWlyZSgnLi9kcm9wcGFibGUuanMnKSxcbiAgRmV0Y2hhYmxlOiByZXF1aXJlKCcuL2ZldGNoYWJsZS5qcycpLFxuICBQYXN0YWJsZTogcmVxdWlyZSgnLi9wYXN0YWJsZS5qcycpLFxuICBVcGxvYWRhYmxlOiByZXF1aXJlKCcuL3VwbG9hZGFibGUuanMnKSxcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuLi9sb2Rhc2gnKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuLi9jb25maWcnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG1peGluTmFtZTogXCJQYXN0YWJsZVwiLFxuXG4gIGluaXRpYWxpemVQYXN0YWJsZTogZnVuY3Rpb24oKSB7XG4gICAgdXRpbHMubG9nKFwiQWRkaW5nIHBhc3RhYmxlIHRvIGJsb2NrIFwiICsgdGhpcy5ibG9ja0lEKTtcblxuICAgIHRoaXMucGFzdGVfb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmZpZy5kZWZhdWx0cy5CbG9jay5wYXN0ZV9vcHRpb25zLCB0aGlzLnBhc3RlX29wdGlvbnMpO1xuICAgIHRoaXMuJGlucHV0cy5hcHBlbmQoXy50ZW1wbGF0ZSh0aGlzLnBhc3RlX29wdGlvbnMuaHRtbCwgdGhpcykpO1xuXG4gICAgdGhpcy4kKCcuc3QtcGFzdGUtYmxvY2snKVxuICAgICAgLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXsgJCh0aGlzKS5zZWxlY3QoKTsgfSlcbiAgICAgIC5iaW5kKCdwYXN0ZScsIHRoaXMuX2hhbmRsZUNvbnRlbnRQYXN0ZSlcbiAgICAgIC5iaW5kKCdzdWJtaXQnLCB0aGlzLl9oYW5kbGVDb250ZW50UGFzdGUpO1xuICB9XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuLi9sb2Rhc2gnKTtcbnZhciBjb25maWcgPSByZXF1aXJlKCcuLi9jb25maWcnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbnZhciBmaWxlVXBsb2FkZXIgPSByZXF1aXJlKCcuLi9leHRlbnNpb25zL2ZpbGUtdXBsb2FkZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbWl4aW5OYW1lOiBcIlVwbG9hZGFibGVcIixcblxuICB1cGxvYWRzQ291bnQ6IDAsXG5cbiAgaW5pdGlhbGl6ZVVwbG9hZGFibGU6IGZ1bmN0aW9uKCkge1xuICAgIHV0aWxzLmxvZyhcIkFkZGluZyB1cGxvYWRhYmxlIHRvIGJsb2NrIFwiICsgdGhpcy5ibG9ja0lEKTtcbiAgICB0aGlzLndpdGhNaXhpbihyZXF1aXJlKCcuL2FqYXhhYmxlJykpO1xuXG4gICAgdGhpcy51cGxvYWRfb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmZpZy5kZWZhdWx0cy5CbG9jay51cGxvYWRfb3B0aW9ucywgdGhpcy51cGxvYWRfb3B0aW9ucyk7XG4gICAgdGhpcy4kaW5wdXRzLmFwcGVuZChfLnRlbXBsYXRlKHRoaXMudXBsb2FkX29wdGlvbnMuaHRtbCwgdGhpcykpO1xuICB9LFxuXG4gIHVwbG9hZGVyOiBmdW5jdGlvbihmaWxlLCBzdWNjZXNzLCBmYWlsdXJlKXtcbiAgICByZXR1cm4gZmlsZVVwbG9hZGVyKHRoaXMsIGZpbGUsIHN1Y2Nlc3MsIGZhaWx1cmUpO1xuICB9XG5cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgSGVhZGluZyBCbG9ja1xuKi9cblxudmFyIEJsb2NrID0gcmVxdWlyZSgnLi4vYmxvY2snKTtcbnZhciBzdFRvSFRNTCA9IHJlcXVpcmUoJy4uL3RvLWh0bWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jay5leHRlbmQoe1xuXG4gIHR5cGU6ICdIZWFkaW5nJyxcblxuICB0aXRsZTogZnVuY3Rpb24oKXsgcmV0dXJuIGkxOG4udCgnYmxvY2tzOmhlYWRpbmc6dGl0bGUnKTsgfSxcblxuICBlZGl0b3JIVE1MOiAnPGRpdiBjbGFzcz1cInN0LXJlcXVpcmVkIHN0LXRleHQtYmxvY2sgc3QtdGV4dC1ibG9jay0taGVhZGluZ1wiIGNvbnRlbnRlZGl0YWJsZT1cInRydWVcIj48L2Rpdj4nLFxuXG4gIGljb25fbmFtZTogJ2hlYWRpbmcnLFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbihkYXRhKXtcbiAgICB0aGlzLmdldFRleHRCbG9jaygpLmh0bWwoc3RUb0hUTUwoZGF0YS50ZXh0LCB0aGlzLnR5cGUpKTtcbiAgfVxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIEJsb2NrID0gcmVxdWlyZSgnLi4vYmxvY2snKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jay5leHRlbmQoe1xuXG4gIHR5cGU6IFwiaW1hZ2VcIixcbiAgdGl0bGU6IGZ1bmN0aW9uKCkgeyByZXR1cm4gaTE4bi50KCdibG9ja3M6aW1hZ2U6dGl0bGUnKTsgfSxcblxuICBkcm9wcGFibGU6IHRydWUsXG4gIHVwbG9hZGFibGU6IHRydWUsXG5cbiAgaWNvbl9uYW1lOiAnaW1hZ2UnLFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbihkYXRhKXtcbiAgICAvLyBDcmVhdGUgb3VyIGltYWdlIHRhZ1xuICAgIHRoaXMuJGVkaXRvci5odG1sKCQoJzxpbWc+JywgeyBzcmM6IGRhdGEuZmlsZS51cmwgfSkpO1xuICB9LFxuXG4gIG9uQmxvY2tSZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgLyogU2V0dXAgdGhlIHVwbG9hZCBidXR0b24gKi9cbiAgICB0aGlzLiRpbnB1dHMuZmluZCgnYnV0dG9uJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbihldil7IGV2LnByZXZlbnREZWZhdWx0KCk7IH0pO1xuICAgIHRoaXMuJGlucHV0cy5maW5kKCdpbnB1dCcpLm9uKCdjaGFuZ2UnLCAoZnVuY3Rpb24oZXYpIHtcbiAgICAgIHRoaXMub25Ecm9wKGV2LmN1cnJlbnRUYXJnZXQpO1xuICAgIH0pLmJpbmQodGhpcykpO1xuICB9LFxuXG4gIG9uRHJvcDogZnVuY3Rpb24odHJhbnNmZXJEYXRhKXtcbiAgICB2YXIgZmlsZSA9IHRyYW5zZmVyRGF0YS5maWxlc1swXSxcbiAgICAgICAgdXJsQVBJID0gKHR5cGVvZiBVUkwgIT09IFwidW5kZWZpbmVkXCIpID8gVVJMIDogKHR5cGVvZiB3ZWJraXRVUkwgIT09IFwidW5kZWZpbmVkXCIpID8gd2Via2l0VVJMIDogbnVsbDtcblxuICAgIC8vIEhhbmRsZSBvbmUgdXBsb2FkIGF0IGEgdGltZVxuICAgIGlmICgvaW1hZ2UvLnRlc3QoZmlsZS50eXBlKSkge1xuICAgICAgdGhpcy5sb2FkaW5nKCk7XG4gICAgICAvLyBTaG93IHRoaXMgaW1hZ2Ugb24gaGVyZVxuICAgICAgdGhpcy4kaW5wdXRzLmhpZGUoKTtcbiAgICAgIHRoaXMuJGVkaXRvci5odG1sKCQoJzxpbWc+JywgeyBzcmM6IHVybEFQSS5jcmVhdGVPYmplY3RVUkwoZmlsZSkgfSkpLnNob3coKTtcblxuICAgICAgdGhpcy51cGxvYWRlcihcbiAgICAgICAgZmlsZSxcbiAgICAgICAgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHRoaXMuc2V0RGF0YShkYXRhKTtcbiAgICAgICAgICB0aGlzLnJlYWR5KCk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgdGhpcy5hZGRNZXNzYWdlKGkxOG4udCgnYmxvY2tzOmltYWdlOnVwbG9hZF9lcnJvcicpKTtcbiAgICAgICAgICB0aGlzLnJlYWR5KCk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuICB9XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVGV4dDogcmVxdWlyZSgnLi90ZXh0JyksXG4gIFF1b3RlOiByZXF1aXJlKCcuL3F1b3RlJyksXG4gIEltYWdlOiByZXF1aXJlKCcuL2ltYWdlJyksXG4gIEhlYWRpbmc6IHJlcXVpcmUoJy4vaGVhZGluZycpLFxuICBMaXN0OiByZXF1aXJlKCcuL2xpc3QnKSxcbiAgVHdlZXQ6IHJlcXVpcmUoJy4vdHdlZXQnKSxcbiAgVmlkZW86IHJlcXVpcmUoJy4vdmlkZW8nKSxcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuLi9sb2Rhc2gnKTtcblxudmFyIEJsb2NrID0gcmVxdWlyZSgnLi4vYmxvY2snKTtcbnZhciBzdFRvSFRNTCA9IHJlcXVpcmUoJy4uL3RvLWh0bWwnKTtcblxudmFyIHRlbXBsYXRlID0gJzxkaXYgY2xhc3M9XCJzdC10ZXh0LWJsb2NrIHN0LXJlcXVpcmVkXCIgY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiPjx1bD48bGk+PC9saT48L3VsPjwvZGl2Pic7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2suZXh0ZW5kKHtcblxuICB0eXBlOiAnbGlzdCcsXG5cbiAgdGl0bGU6IGZ1bmN0aW9uKCkgeyByZXR1cm4gaTE4bi50KCdibG9ja3M6bGlzdDp0aXRsZScpOyB9LFxuXG4gIGljb25fbmFtZTogJ2xpc3QnLFxuXG4gIGVkaXRvckhUTUw6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnRlbXBsYXRlKHRlbXBsYXRlLCB0aGlzKTtcbiAgfSxcblxuICBsb2FkRGF0YTogZnVuY3Rpb24oZGF0YSl7XG4gICAgdGhpcy5nZXRUZXh0QmxvY2soKS5odG1sKFwiPHVsPlwiICsgc3RUb0hUTUwoZGF0YS50ZXh0LCB0aGlzLnR5cGUpICsgXCI8L3VsPlwiKTtcbiAgfSxcblxuICBvbkJsb2NrUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNoZWNrRm9yTGlzdCA9IHRoaXMuY2hlY2tGb3JMaXN0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5nZXRUZXh0QmxvY2soKS5vbignY2xpY2sga2V5dXAnLCB0aGlzLmNoZWNrRm9yTGlzdCk7XG4gICAgdGhpcy5mb2N1cygpO1xuICB9LFxuXG4gIGNoZWNrRm9yTGlzdDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuJCgndWwnKS5sZW5ndGggPT09IDApIHtcbiAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiaW5zZXJ0VW5vcmRlcmVkTGlzdFwiLCBmYWxzZSwgZmFsc2UpO1xuICAgIH1cbiAgfSxcblxuICB0b01hcmtkb3duOiBmdW5jdGlvbihtYXJrZG93bikge1xuICAgIHJldHVybiBtYXJrZG93bi5yZXBsYWNlKC88XFwvbGk+L21nLFwiXFxuXCIpXG4gICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzxcXC8/W14+XSsoPnwkKS9nLCBcIlwiKVxuICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9eKC4rKSQvbWcsXCIgLSAkMVwiKTtcbiAgfSxcblxuICB0b0hUTUw6IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICBodG1sID0gaHRtbC5yZXBsYWNlKC9eIC0gKC4rKSQvbWcsXCI8bGk+JDE8L2xpPlwiKVxuICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcbi9tZywgXCJcIik7XG5cbiAgICByZXR1cm4gaHRtbDtcbiAgfSxcblxuICBvbkNvbnRlbnRQYXN0ZWQ6IGZ1bmN0aW9uKGV2ZW50LCB0YXJnZXQpIHtcbiAgICB0aGlzLiQoJ3VsJykuaHRtbChcbiAgICAgIHRoaXMucGFzdGVkTWFya2Rvd25Ub0hUTUwodGFyZ2V0WzBdLmlubmVySFRNTCkpO1xuICAgIHRoaXMuZ2V0VGV4dEJsb2NrKCkuY2FyZXRUb0VuZCgpO1xuICB9LFxuXG4gIGlzRW1wdHk6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLmlzRW1wdHkodGhpcy5nZXRCbG9ja0RhdGEoKS50ZXh0KTtcbiAgfVxuXG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBCbG9jayBRdW90ZVxuKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi9sb2Rhc2gnKTtcblxudmFyIEJsb2NrID0gcmVxdWlyZSgnLi4vYmxvY2snKTtcbnZhciBzdFRvSFRNTCA9IHJlcXVpcmUoJy4uL3RvLWh0bWwnKTtcblxudmFyIHRlbXBsYXRlID0gXy50ZW1wbGF0ZShbXG4gICc8YmxvY2txdW90ZSBjbGFzcz1cInN0LXJlcXVpcmVkIHN0LXRleHQtYmxvY2tcIiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCI+PC9ibG9ja3F1b3RlPicsXG4gICc8bGFiZWwgY2xhc3M9XCJzdC1pbnB1dC1sYWJlbFwiPiA8JT0gaTE4bi50KFwiYmxvY2tzOnF1b3RlOmNyZWRpdF9maWVsZFwiKSAlPjwvbGFiZWw+JyxcbiAgJzxpbnB1dCBtYXhsZW5ndGg9XCIxNDBcIiBuYW1lPVwiY2l0ZVwiIHBsYWNlaG9sZGVyPVwiPCU9IGkxOG4udChcImJsb2NrczpxdW90ZTpjcmVkaXRfZmllbGRcIikgJT5cIicsXG4gICcgY2xhc3M9XCJzdC1pbnB1dC1zdHJpbmcgc3QtcmVxdWlyZWQganMtY2l0ZS1pbnB1dFwiIHR5cGU9XCJ0ZXh0XCIgLz4nXG5dLmpvaW4oXCJcXG5cIikpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrLmV4dGVuZCh7XG5cbiAgdHlwZTogXCJxdW90ZVwiLFxuXG4gIHRpdGxlOiBmdW5jdGlvbigpIHsgcmV0dXJuIGkxOG4udCgnYmxvY2tzOnF1b3RlOnRpdGxlJyk7IH0sXG5cbiAgaWNvbl9uYW1lOiAncXVvdGUnLFxuXG4gIGVkaXRvckhUTUw6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0ZW1wbGF0ZSh0aGlzKTtcbiAgfSxcblxuICBsb2FkRGF0YTogZnVuY3Rpb24oZGF0YSl7XG4gICAgdGhpcy5nZXRUZXh0QmxvY2soKS5odG1sKHN0VG9IVE1MKGRhdGEudGV4dCwgdGhpcy50eXBlKSk7XG4gICAgdGhpcy4kKCcuanMtY2l0ZS1pbnB1dCcpLnZhbChkYXRhLmNpdGUpO1xuICB9LFxuXG4gIHRvTWFya2Rvd246IGZ1bmN0aW9uKG1hcmtkb3duKSB7XG4gICAgcmV0dXJuIG1hcmtkb3duLnJlcGxhY2UoL14oLispJC9tZyxcIj4gJDFcIik7XG4gIH1cblxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgVGV4dCBCbG9ja1xuKi9cblxudmFyIEJsb2NrID0gcmVxdWlyZSgnLi4vYmxvY2snKTtcbnZhciBzdFRvSFRNTCA9IHJlcXVpcmUoJy4uL3RvLWh0bWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jay5leHRlbmQoe1xuXG4gIHR5cGU6IFwidGV4dFwiLFxuXG4gIHRpdGxlOiBmdW5jdGlvbigpIHsgcmV0dXJuIGkxOG4udCgnYmxvY2tzOnRleHQ6dGl0bGUnKTsgfSxcblxuICBlZGl0b3JIVE1MOiAnPGRpdiBjbGFzcz1cInN0LXJlcXVpcmVkIHN0LXRleHQtYmxvY2tcIiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCI+PC9kaXY+JyxcblxuICBpY29uX25hbWU6ICd0ZXh0JyxcblxuICBsb2FkRGF0YTogZnVuY3Rpb24oZGF0YSl7XG4gICAgdGhpcy5nZXRUZXh0QmxvY2soKS5odG1sKHN0VG9IVE1MKGRhdGEudGV4dCwgdGhpcy50eXBlKSk7XG4gIH1cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgQmxvY2sgPSByZXF1aXJlKCcuLi9ibG9jaycpO1xuXG52YXIgdHdlZXRfdGVtcGxhdGUgPSBfLnRlbXBsYXRlKFtcbiAgXCI8YmxvY2txdW90ZSBjbGFzcz0ndHdpdHRlci10d2VldCcgYWxpZ249J2NlbnRlcic+XCIsXG4gIFwiPHA+PCU9IHRleHQgJT48L3A+XCIsXG4gIFwiJm1kYXNoOyA8JT0gdXNlci5uYW1lICU+IChAPCU9IHVzZXIuc2NyZWVuX25hbWUgJT4pXCIsXG4gIFwiPGEgaHJlZj0nPCU9IHN0YXR1c191cmwgJT4nIGRhdGEtZGF0ZXRpbWU9JzwlPSBjcmVhdGVkX2F0ICU+Jz48JT0gY3JlYXRlZF9hdCAlPjwvYT5cIixcbiAgXCI8L2Jsb2NrcXVvdGU+XCIsXG4gICc8c2NyaXB0IHNyYz1cIi8vcGxhdGZvcm0udHdpdHRlci5jb20vd2lkZ2V0cy5qc1wiIGNoYXJzZXQ9XCJ1dGYtOFwiPjwvc2NyaXB0Pidcbl0uam9pbihcIlxcblwiKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2suZXh0ZW5kKHtcblxuICB0eXBlOiBcInR3ZWV0XCIsXG4gIGRyb3BwYWJsZTogdHJ1ZSxcbiAgcGFzdGFibGU6IHRydWUsXG4gIGZldGNoYWJsZTogdHJ1ZSxcblxuICBkcm9wX29wdGlvbnM6IHtcbiAgICByZV9yZW5kZXJfb25fcmVvcmRlcjogdHJ1ZVxuICB9LFxuXG4gIHRpdGxlOiBmdW5jdGlvbigpeyByZXR1cm4gaTE4bi50KCdibG9ja3M6dHdlZXQ6dGl0bGUnKTsgfSxcblxuICBmZXRjaFVybDogZnVuY3Rpb24odHdlZXRJRCkge1xuICAgIHJldHVybiBcIi90d2VldHMvP3R3ZWV0X2lkPVwiICsgdHdlZXRJRDtcbiAgfSxcblxuICBpY29uX25hbWU6ICd0d2l0dGVyJyxcblxuICBsb2FkRGF0YTogZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmIChfLmlzVW5kZWZpbmVkKGRhdGEuc3RhdHVzX3VybCkpIHsgZGF0YS5zdGF0dXNfdXJsID0gJyc7IH1cbiAgICB0aGlzLiRpbm5lci5maW5kKCdpZnJhbWUnKS5yZW1vdmUoKTtcbiAgICB0aGlzLiRpbm5lci5wcmVwZW5kKHR3ZWV0X3RlbXBsYXRlKGRhdGEpKTtcbiAgfSxcblxuICBvbkNvbnRlbnRQYXN0ZWQ6IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAvLyBDb250ZW50IHBhc3RlZC4gRGVsZWdhdGUgdG8gdGhlIGRyb3AgcGFyc2UgbWV0aG9kXG4gICAgdmFyIGlucHV0ID0gJChldmVudC50YXJnZXQpLFxuICAgIHZhbCA9IGlucHV0LnZhbCgpO1xuXG4gICAgLy8gUGFzcyB0aGlzIHRvIHRoZSBzYW1lIGhhbmRsZXIgYXMgb25Ecm9wXG4gICAgdGhpcy5oYW5kbGVUd2l0dGVyRHJvcFBhc3RlKHZhbCk7XG4gIH0sXG5cbiAgaGFuZGxlVHdpdHRlckRyb3BQYXN0ZTogZnVuY3Rpb24odXJsKXtcbiAgICBpZiAoIXRoaXMudmFsaWRUd2VldFVybCh1cmwpKSB7XG4gICAgICB1dGlscy5sb2coXCJJbnZhbGlkIFR3ZWV0IFVSTFwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUd2l0dGVyIHN0YXR1c1xuICAgIHZhciB0d2VldElEID0gdXJsLm1hdGNoKC9bXlxcL10rJC8pO1xuICAgIGlmICghXy5pc0VtcHR5KHR3ZWV0SUQpKSB7XG4gICAgICB0aGlzLmxvYWRpbmcoKTtcbiAgICAgIHR3ZWV0SUQgPSB0d2VldElEWzBdO1xuXG4gICAgICB2YXIgYWpheE9wdGlvbnMgPSB7XG4gICAgICAgIHVybDogdGhpcy5mZXRjaFVybCh0d2VldElEKSxcbiAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICB9O1xuXG4gICAgICB0aGlzLmZldGNoKGFqYXhPcHRpb25zLCB0aGlzLm9uVHdlZXRTdWNjZXNzLCB0aGlzLm9uVHdlZXRGYWlsKTtcbiAgICB9XG4gIH0sXG5cbiAgdmFsaWRUd2VldFVybDogZnVuY3Rpb24odXJsKSB7XG4gICAgcmV0dXJuICh1dGlscy5pc1VSSSh1cmwpICYmXG4gICAgICAgICAgICB1cmwuaW5kZXhPZihcInR3aXR0ZXJcIikgIT09IC0xICYmXG4gICAgICAgICAgICB1cmwuaW5kZXhPZihcInN0YXR1c1wiKSAhPT0gLTEpO1xuICB9LFxuXG4gIG9uVHdlZXRTdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy8gUGFyc2UgdGhlIHR3aXR0ZXIgb2JqZWN0IGludG8gc29tZXRoaW5nIGEgYml0IHNsaW1tZXIuLlxuICAgIHZhciBvYmogPSB7XG4gICAgICB1c2VyOiB7XG4gICAgICAgIHByb2ZpbGVfaW1hZ2VfdXJsOiBkYXRhLnVzZXIucHJvZmlsZV9pbWFnZV91cmwsXG4gICAgICAgIHByb2ZpbGVfaW1hZ2VfdXJsX2h0dHBzOiBkYXRhLnVzZXIucHJvZmlsZV9pbWFnZV91cmxfaHR0cHMsXG4gICAgICAgIHNjcmVlbl9uYW1lOiBkYXRhLnVzZXIuc2NyZWVuX25hbWUsXG4gICAgICAgIG5hbWU6IGRhdGEudXNlci5uYW1lXG4gICAgICB9LFxuICAgICAgaWQ6IGRhdGEuaWRfc3RyLFxuICAgICAgdGV4dDogZGF0YS50ZXh0LFxuICAgICAgY3JlYXRlZF9hdDogZGF0YS5jcmVhdGVkX2F0LFxuICAgICAgZW50aXRpZXM6IGRhdGEuZW50aXRpZXMsXG4gICAgICBzdGF0dXNfdXJsOiBcImh0dHBzOi8vdHdpdHRlci5jb20vXCIgKyBkYXRhLnVzZXIuc2NyZWVuX25hbWUgKyBcIi9zdGF0dXMvXCIgKyBkYXRhLmlkX3N0clxuICAgIH07XG5cbiAgICB0aGlzLnNldEFuZExvYWREYXRhKG9iaik7XG4gICAgdGhpcy5yZWFkeSgpO1xuICB9LFxuXG4gIG9uVHdlZXRGYWlsOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFkZE1lc3NhZ2UoaTE4bi50KFwiYmxvY2tzOnR3ZWV0OmZldGNoX2Vycm9yXCIpKTtcbiAgICB0aGlzLnJlYWR5KCk7XG4gIH0sXG5cbiAgb25Ecm9wOiBmdW5jdGlvbih0cmFuc2ZlckRhdGEpe1xuICAgIHZhciB1cmwgPSB0cmFuc2ZlckRhdGEuZ2V0RGF0YSgndGV4dC9wbGFpbicpO1xuICAgIHRoaXMuaGFuZGxlVHdpdHRlckRyb3BQYXN0ZSh1cmwpO1xuICB9XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIEJsb2NrID0gcmVxdWlyZSgnLi4vYmxvY2snKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jay5leHRlbmQoe1xuXG4gIC8vIG1vcmUgcHJvdmlkZXJzIGF0IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2plZmZsaW5nL2E5NjI5YWUyOGUwNzY3ODVhMTRmXG4gIHByb3ZpZGVyczoge1xuICAgIHZpbWVvOiB7XG4gICAgICByZWdleDogLyg/Omh0dHBbc10/OlxcL1xcLyk/KD86d3d3Lik/dmltZW8uY29tXFwvKC4rKS8sXG4gICAgICBodG1sOiBcIjxpZnJhbWUgc3JjPVxcXCJ7e3Byb3RvY29sfX0vL3BsYXllci52aW1lby5jb20vdmlkZW8ve3tyZW1vdGVfaWR9fT90aXRsZT0wJmJ5bGluZT0wXFxcIiB3aWR0aD1cXFwiNTgwXFxcIiBoZWlnaHQ9XFxcIjMyMFxcXCIgZnJhbWVib3JkZXI9XFxcIjBcXFwiPjwvaWZyYW1lPlwiXG4gICAgfSxcbiAgICB5b3V0dWJlOiB7XG4gICAgICByZWdleDogLyg/Omh0dHBbc10/OlxcL1xcLyk/KD86d3d3Lik/KD86KD86eW91dHViZS5jb21cXC93YXRjaFxcPyg/Oi4qKSg/OnY9KSl8KD86eW91dHUuYmVcXC8pKShbXiZdLispLyxcbiAgICAgIGh0bWw6IFwiPGlmcmFtZSBzcmM9XFxcInt7cHJvdG9jb2x9fS8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL3t7cmVtb3RlX2lkfX1cXFwiIHdpZHRoPVxcXCI1ODBcXFwiIGhlaWdodD1cXFwiMzIwXFxcIiBmcmFtZWJvcmRlcj1cXFwiMFxcXCIgYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPlwiXG4gICAgfVxuICB9LFxuXG4gIHR5cGU6ICd2aWRlbycsXG4gIHRpdGxlOiBmdW5jdGlvbigpIHsgcmV0dXJuIGkxOG4udCgnYmxvY2tzOnZpZGVvOnRpdGxlJyk7IH0sXG5cbiAgZHJvcHBhYmxlOiB0cnVlLFxuICBwYXN0YWJsZTogdHJ1ZSxcblxuICBpY29uX25hbWU6ICd2aWRlbycsXG5cbiAgbG9hZERhdGE6IGZ1bmN0aW9uKGRhdGEpe1xuICAgIGlmICghdGhpcy5wcm92aWRlcnMuaGFzT3duUHJvcGVydHkoZGF0YS5zb3VyY2UpKSB7IHJldHVybjsgfVxuXG4gICAgaWYgKHRoaXMucHJvdmlkZXJzW2RhdGEuc291cmNlXS5zcXVhcmUpIHtcbiAgICAgIHRoaXMuJGVkaXRvci5hZGRDbGFzcygnc3QtYmxvY2tfX2VkaXRvci0td2l0aC1zcXVhcmUtbWVkaWEnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4kZWRpdG9yLmFkZENsYXNzKCdzdC1ibG9ja19fZWRpdG9yLS13aXRoLXNpeHRlZW4tYnktbmluZS1tZWRpYScpO1xuICAgIH1cblxuICAgIHZhciBlbWJlZF9zdHJpbmcgPSB0aGlzLnByb3ZpZGVyc1tkYXRhLnNvdXJjZV0uaHRtbFxuICAgIC5yZXBsYWNlKCd7e3Byb3RvY29sfX0nLCB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wpXG4gICAgLnJlcGxhY2UoJ3t7cmVtb3RlX2lkfX0nLCBkYXRhLnJlbW90ZV9pZClcbiAgICAucmVwbGFjZSgne3t3aWR0aH19JywgdGhpcy4kZWRpdG9yLndpZHRoKCkpOyAvLyBmb3IgdmlkZW9zIHRoYXQgY2FuJ3QgcmVzaXplIGF1dG9tYXRpY2FsbHkgbGlrZSB2aW5lXG5cbiAgICB0aGlzLiRlZGl0b3IuaHRtbChlbWJlZF9zdHJpbmcpO1xuICB9LFxuXG4gIG9uQ29udGVudFBhc3RlZDogZnVuY3Rpb24oZXZlbnQpe1xuICAgIHRoaXMuaGFuZGxlRHJvcFBhc3RlKCQoZXZlbnQudGFyZ2V0KS52YWwoKSk7XG4gIH0sXG5cbiAgaGFuZGxlRHJvcFBhc3RlOiBmdW5jdGlvbih1cmwpe1xuICAgIGlmKCF1dGlscy5pc1VSSSh1cmwpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG1hdGNoLCBkYXRhO1xuXG4gICAgdGhpcy5wcm92aWRlcnMuZm9yRWFjaChmdW5jdGlvbihwcm92aWRlciwgaW5kZXgpIHtcbiAgICAgIG1hdGNoID0gcHJvdmlkZXIucmVnZXguZXhlYyh1cmwpO1xuXG4gICAgICBpZihtYXRjaCAhPT0gbnVsbCAmJiAhXy5pc1VuZGVmaW5lZChtYXRjaFsxXSkpIHtcbiAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICBzb3VyY2U6IGluZGV4LFxuICAgICAgICAgIHJlbW90ZV9pZDogbWF0Y2hbMV1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNldEFuZExvYWREYXRhKGRhdGEpO1xuICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICB9LFxuXG4gIG9uRHJvcDogZnVuY3Rpb24odHJhbnNmZXJEYXRhKXtcbiAgICB2YXIgdXJsID0gdHJhbnNmZXJEYXRhLmdldERhdGEoJ3RleHQvcGxhaW4nKTtcbiAgICB0aGlzLmhhbmRsZURyb3BQYXN0ZSh1cmwpO1xuICB9XG59KTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBkZWJ1ZzogZmFsc2UsXG4gIHNraXBWYWxpZGF0aW9uOiBmYWxzZSxcbiAgdmVyc2lvbjogXCIwLjQuMFwiLFxuICBsYW5ndWFnZTogXCJlblwiLFxuXG4gIGluc3RhbmNlczogW10sXG5cbiAgZGVmYXVsdHM6IHtcbiAgICBkZWZhdWx0VHlwZTogZmFsc2UsXG4gICAgc3Bpbm5lcjoge1xuICAgICAgY2xhc3NOYW1lOiAnc3Qtc3Bpbm5lcicsXG4gICAgICBsaW5lczogOSxcbiAgICAgIGxlbmd0aDogOCxcbiAgICAgIHdpZHRoOiAzLFxuICAgICAgcmFkaXVzOiA2LFxuICAgICAgY29sb3I6ICcjMDAwJyxcbiAgICAgIHNwZWVkOiAxLjQsXG4gICAgICB0cmFpbDogNTcsXG4gICAgICBzaGFkb3c6IGZhbHNlLFxuICAgICAgbGVmdDogJzUwJScsXG4gICAgICB0b3A6ICc1MCUnXG4gICAgfSxcbiAgICBibG9ja0xpbWl0OiAwLFxuICAgIGJsb2NrVHlwZUxpbWl0czoge30sXG4gICAgcmVxdWlyZWQ6IFtdLFxuICAgIHVwbG9hZFVybDogJy9hdHRhY2htZW50cycsXG4gICAgYmFzZUltYWdlVXJsOiAnL3Npci10cmV2b3ItdXBsb2Fkcy8nLFxuICAgIGVycm9yc0NvbnRhaW5lcjogdW5kZWZpbmVkLFxuICB9XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gKiBTaXIgVHJldm9yIEVkaXRvclxuICogLS1cbiAqIFJlcHJlc2VudHMgb25lIFNpciBUcmV2b3IgZWRpdG9yIGluc3RhbmNlICh3aXRoIG11bHRpcGxlIGJsb2NrcylcbiAqIEVhY2ggYmxvY2sgcmVmZXJlbmNlcyB0aGlzIGluc3RhbmNlLlxuICogQmxvY2tUeXBlcyBhcmUgZ2xvYmFsIGhvd2V2ZXIuXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBFdmVudHMgPSByZXF1aXJlKCcuL2V2ZW50cycpO1xudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi9ldmVudC1idXMnKTtcbnZhciBGb3JtRXZlbnRzID0gcmVxdWlyZSgnLi9mb3JtLWV2ZW50cycpO1xudmFyIEJsb2NrQ29udHJvbHMgPSByZXF1aXJlKCcuL2Jsb2NrLWNvbnRyb2xzJyk7XG52YXIgQmxvY2tNYW5hZ2VyID0gcmVxdWlyZSgnLi9ibG9jay1tYW5hZ2VyJyk7XG52YXIgRmxvYXRpbmdCbG9ja0NvbnRyb2xzID0gcmVxdWlyZSgnLi9mbG9hdGluZy1ibG9jay1jb250cm9scycpO1xudmFyIEZvcm1hdEJhciA9IHJlcXVpcmUoJy4vZm9ybWF0LWJhcicpO1xudmFyIEVkaXRvclN0b3JlID0gcmVxdWlyZSgnLi9leHRlbnNpb25zL2VkaXRvci1zdG9yZScpO1xudmFyIEVycm9ySGFuZGxlciA9IHJlcXVpcmUoJy4vZXJyb3ItaGFuZGxlcicpO1xuXG52YXIgRWRpdG9yID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICB0aGlzLmluaXRpYWxpemUob3B0aW9ucyk7XG59O1xuXG5PYmplY3QuYXNzaWduKEVkaXRvci5wcm90b3R5cGUsIHJlcXVpcmUoJy4vZnVuY3Rpb24tYmluZCcpLCByZXF1aXJlKCcuL2V2ZW50cycpLCB7XG5cbiAgYm91bmQ6IFsnb25Gb3JtU3VibWl0JywgJ2hpZGVBbGxUaGVUaGluZ3MnLCAnY2hhbmdlQmxvY2tQb3NpdGlvbicsXG4gICAgJ3JlbW92ZUJsb2NrRHJhZ092ZXInLCAncmVuZGVyQmxvY2snLCAncmVzZXRCbG9ja0NvbnRyb2xzJyxcbiAgICAnYmxvY2tMaW1pdFJlYWNoZWQnXSwgXG5cbiAgZXZlbnRzOiB7XG4gICAgJ2Jsb2NrOnJlb3JkZXI6ZHJhZ2VuZCc6ICdyZW1vdmVCbG9ja0RyYWdPdmVyJyxcbiAgICAnYmxvY2s6Y29udGVudDpkcm9wcGVkJzogJ3JlbW92ZUJsb2NrRHJhZ092ZXInXG4gIH0sXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHV0aWxzLmxvZyhcIkluaXQgU2lyVHJldm9yLkVkaXRvclwiKTtcblxuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmZpZy5kZWZhdWx0cywgb3B0aW9ucyB8fCB7fSk7XG4gICAgdGhpcy5JRCA9IF8udW5pcXVlSWQoJ3N0LWVkaXRvci0nKTtcblxuICAgIGlmICghdGhpcy5fZW5zdXJlQW5kU2V0RWxlbWVudHMoKSkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIGlmKCFfLmlzVW5kZWZpbmVkKHRoaXMub3B0aW9ucy5vbkVkaXRvclJlbmRlcikgJiZcbiAgICAgICBfLmlzRnVuY3Rpb24odGhpcy5vcHRpb25zLm9uRWRpdG9yUmVuZGVyKSkge1xuICAgICAgdGhpcy5vbkVkaXRvclJlbmRlciA9IHRoaXMub3B0aW9ucy5vbkVkaXRvclJlbmRlcjtcbiAgICB9XG5cbiAgICAvLyBNZWRpYXRlZCBldmVudHMgZm9yICp0aGlzKiBFZGl0b3IgaW5zdGFuY2VcbiAgICB0aGlzLm1lZGlhdG9yID0gT2JqZWN0LmFzc2lnbih7fSwgRXZlbnRzKTtcblxuICAgIHRoaXMuX2JpbmRGdW5jdGlvbnMoKTtcblxuICAgIGNvbmZpZy5pbnN0YW5jZXMucHVzaCh0aGlzKTtcblxuICAgIHRoaXMuYnVpbGQoKTtcblxuICAgIEZvcm1FdmVudHMuYmluZEZvcm1TdWJtaXQodGhpcy4kZm9ybSk7XG4gIH0sXG5cbiAgLypcbiAgICogQnVpbGQgdGhlIEVkaXRvciBpbnN0YW5jZS5cbiAgICogQ2hlY2sgdG8gc2VlIGlmIHdlJ3ZlIGJlZW4gcGFzc2VkIEpTT04gYWxyZWFkeSwgYW5kIGlmIG5vdCB0cnkgYW5kXG4gICAqIGNyZWF0ZSBhIGRlZmF1bHQgYmxvY2suXG4gICAqIElmIHdlIGhhdmUgSlNPTiB0aGVuIHdlIG5lZWQgdG8gYnVpbGQgYWxsIG9mIG91ciBibG9ja3MgZnJvbSB0aGlzLlxuICAgKi9cbiAgYnVpbGQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGVsLmhpZGUoKTtcblxuICAgIHRoaXMuZXJyb3JIYW5kbGVyID0gbmV3IEVycm9ySGFuZGxlcih0aGlzLiRvdXRlciwgdGhpcy5tZWRpYXRvciwgdGhpcy5vcHRpb25zLmVycm9yc0NvbnRhaW5lcik7XG4gICAgdGhpcy5zdG9yZSA9IG5ldyBFZGl0b3JTdG9yZSh0aGlzLiRlbC52YWwoKSwgdGhpcy5tZWRpYXRvcik7XG4gICAgdGhpcy5ibG9ja19tYW5hZ2VyID0gbmV3IEJsb2NrTWFuYWdlcih0aGlzLm9wdGlvbnMsIHRoaXMuSUQsIHRoaXMubWVkaWF0b3IpO1xuICAgIHRoaXMuYmxvY2tfY29udHJvbHMgPSBuZXcgQmxvY2tDb250cm9scyh0aGlzLmJsb2NrX21hbmFnZXIuYmxvY2tUeXBlcywgdGhpcy5tZWRpYXRvcik7XG4gICAgdGhpcy5mbF9ibG9ja19jb250cm9scyA9IG5ldyBGbG9hdGluZ0Jsb2NrQ29udHJvbHModGhpcy4kd3JhcHBlciwgdGhpcy5JRCwgdGhpcy5tZWRpYXRvcik7XG4gICAgdGhpcy5mb3JtYXRCYXIgPSBuZXcgRm9ybWF0QmFyKHRoaXMub3B0aW9ucy5mb3JtYXRCYXIsIHRoaXMubWVkaWF0b3IpO1xuXG4gICAgdGhpcy5tZWRpYXRvci5vbignYmxvY2s6Y2hhbmdlUG9zaXRpb24nLCB0aGlzLmNoYW5nZUJsb2NrUG9zaXRpb24pO1xuICAgIHRoaXMubWVkaWF0b3Iub24oJ2Jsb2NrLWNvbnRyb2xzOnJlc2V0JywgdGhpcy5yZXNldEJsb2NrQ29udHJvbHMpO1xuICAgIHRoaXMubWVkaWF0b3Iub24oJ2Jsb2NrOmxpbWl0UmVhY2hlZCcsIHRoaXMuYmxvY2tMaW1pdFJlYWNoZWQpO1xuICAgIHRoaXMubWVkaWF0b3Iub24oJ2Jsb2NrOnJlbmRlcicsIHRoaXMucmVuZGVyQmxvY2spO1xuXG4gICAgdGhpcy5kYXRhU3RvcmUgPSBcIlBsZWFzZSB1c2Ugc3RvcmUucmV0cmlldmUoKTtcIjtcblxuICAgIHRoaXMuX3NldEV2ZW50cygpO1xuXG4gICAgdGhpcy4kd3JhcHBlci5wcmVwZW5kKHRoaXMuZmxfYmxvY2tfY29udHJvbHMucmVuZGVyKCkuJGVsKTtcbiAgICAkKGRvY3VtZW50LmJvZHkpLmFwcGVuZCh0aGlzLmZvcm1hdEJhci5yZW5kZXIoKS4kZWwpO1xuICAgIHRoaXMuJG91dGVyLmFwcGVuZCh0aGlzLmJsb2NrX2NvbnRyb2xzLnJlbmRlcigpLiRlbCk7XG5cbiAgICAkKHdpbmRvdykuYmluZCgnY2xpY2snLCB0aGlzLmhpZGVBbGxUaGVUaGluZ3MpO1xuXG4gICAgdGhpcy5jcmVhdGVCbG9ja3MoKTtcbiAgICB0aGlzLiR3cmFwcGVyLmFkZENsYXNzKCdzdC1yZWFkeScpO1xuXG4gICAgaWYoIV8uaXNVbmRlZmluZWQodGhpcy5vbkVkaXRvclJlbmRlcikpIHtcbiAgICAgIHRoaXMub25FZGl0b3JSZW5kZXIoKTtcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlQmxvY2tzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RvcmUgPSB0aGlzLnN0b3JlLnJldHJpZXZlKCk7XG5cbiAgICBpZiAoc3RvcmUuZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICBzdG9yZS5kYXRhLmZvckVhY2goZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdibG9jazpjcmVhdGUnLCBibG9jay50eXBlLCBibG9jay5kYXRhKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmRlZmF1bHRUeXBlICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdibG9jazpjcmVhdGUnLCB0aGlzLm9wdGlvbnMuZGVmYXVsdFR5cGUsIHt9KTtcbiAgICB9XG4gIH0sXG5cbiAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgLy8gRGVzdHJveSB0aGUgcmVuZGVyZWQgc3ViIHZpZXdzXG4gICAgdGhpcy5mb3JtYXRCYXIuZGVzdHJveSgpO1xuICAgIHRoaXMuZmxfYmxvY2tfY29udHJvbHMuZGVzdHJveSgpO1xuICAgIHRoaXMuYmxvY2tfY29udHJvbHMuZGVzdHJveSgpO1xuXG4gICAgLy8gRGVzdHJveSBhbGwgYmxvY2tzXG4gICAgdGhpcy5ibG9ja3MuZm9yRWFjaChmdW5jdGlvbihibG9jaykge1xuICAgICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdibG9jazpyZW1vdmUnLCB0aGlzLmJsb2NrLmJsb2NrSUQpO1xuICAgIH0sIHRoaXMpO1xuXG4gICAgLy8gU3RvcCBsaXN0ZW5pbmcgdG8gZXZlbnRzXG4gICAgdGhpcy5tZWRpYXRvci5zdG9wTGlzdGVuaW5nKCk7XG4gICAgdGhpcy5zdG9wTGlzdGVuaW5nKCk7XG5cbiAgICAvLyBSZW1vdmUgaW5zdGFuY2VcbiAgICBjb25maWcuaW5zdGFuY2VzID0gY29uZmlnLmluc3RhbmNlcy5maWx0ZXIoZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgICAgIHJldHVybiBpbnN0YW5jZS5JRCAhPT0gdGhpcy5JRDtcbiAgICB9LCB0aGlzKTtcblxuICAgIC8vIENsZWFyIHRoZSBzdG9yZVxuICAgIHRoaXMuc3RvcmUucmVzZXQoKTtcbiAgICB0aGlzLiRvdXRlci5yZXBsYWNlV2l0aCh0aGlzLiRlbC5kZXRhY2goKSk7XG4gIH0sXG5cbiAgcmVpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gICAgdGhpcy5pbml0aWFsaXplKG9wdGlvbnMgfHwgdGhpcy5vcHRpb25zKTtcbiAgfSxcblxuICByZXNldEJsb2NrQ29udHJvbHM6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYmxvY2tfY29udHJvbHMucmVuZGVySW5Db250YWluZXIodGhpcy4kd3JhcHBlcik7XG4gICAgdGhpcy5ibG9ja19jb250cm9scy5oaWRlKCk7XG4gIH0sXG5cbiAgYmxvY2tMaW1pdFJlYWNoZWQ6IGZ1bmN0aW9uKHRvZ2dsZSkge1xuICAgIHRoaXMuJHdyYXBwZXIudG9nZ2xlQ2xhc3MoJ3N0LS1ibG9jay1saW1pdC1yZWFjaGVkJywgdG9nZ2xlKTtcbiAgfSxcblxuICBfc2V0RXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICBPYmplY3Qua2V5cyh0aGlzLmV2ZW50cykuZm9yRWFjaChmdW5jdGlvbih0eXBlKSB7XG4gICAgICBFdmVudEJ1cy5vbih0eXBlLCB0aGlzW3RoaXMuZXZlbnRzW3R5cGVdXSwgdGhpcyk7XG4gICAgfSwgdGhpcyk7XG4gIH0sXG5cbiAgaGlkZUFsbFRoZVRoaW5nczogZnVuY3Rpb24oZSkge1xuICAgIHRoaXMuYmxvY2tfY29udHJvbHMuaGlkZSgpO1xuICAgIHRoaXMuZm9ybWF0QmFyLmhpZGUoKTtcbiAgfSxcblxuICBzdG9yZTogZnVuY3Rpb24obWV0aG9kLCBvcHRpb25zKXtcbiAgICB1dGlscy5sb2coXCJUaGUgc3RvcmUgbWV0aG9kIGhhcyBiZWVuIHJlbW92ZWQsIHBsZWFzZSBjYWxsIHN0b3JlW21ldGhvZE5hbWVdXCIpO1xuICAgIHJldHVybiB0aGlzLnN0b3JlW21ldGhvZF0uY2FsbCh0aGlzLCBvcHRpb25zIHx8IHt9KTtcbiAgfSxcblxuICByZW5kZXJCbG9jazogZnVuY3Rpb24oYmxvY2spIHtcbiAgICB0aGlzLl9yZW5kZXJJblBvc2l0aW9uKGJsb2NrLnJlbmRlcigpLiRlbCk7XG4gICAgdGhpcy5oaWRlQWxsVGhlVGhpbmdzKCk7XG4gICAgdGhpcy5zY3JvbGxUbyhibG9jay4kZWwpO1xuXG4gICAgYmxvY2sudHJpZ2dlcihcIm9uUmVuZGVyXCIpO1xuICB9LFxuXG4gIHNjcm9sbFRvOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IGVsZW1lbnQucG9zaXRpb24oKS50b3AgfSwgMzAwLCBcImxpbmVhclwiKTtcbiAgfSxcblxuICByZW1vdmVCbG9ja0RyYWdPdmVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRvdXRlci5maW5kKCcuc3QtZHJhZy1vdmVyJykucmVtb3ZlQ2xhc3MoJ3N0LWRyYWctb3ZlcicpO1xuICB9LFxuXG4gIGNoYW5nZUJsb2NrUG9zaXRpb246IGZ1bmN0aW9uKCRibG9jaywgc2VsZWN0ZWRQb3NpdGlvbikge1xuICAgIHNlbGVjdGVkUG9zaXRpb24gPSBzZWxlY3RlZFBvc2l0aW9uIC0gMTtcblxuICAgIHZhciBibG9ja1Bvc2l0aW9uID0gdGhpcy5nZXRCbG9ja1Bvc2l0aW9uKCRibG9jayksXG4gICAgJGJsb2NrQnkgPSB0aGlzLiR3cmFwcGVyLmZpbmQoJy5zdC1ibG9jaycpLmVxKHNlbGVjdGVkUG9zaXRpb24pO1xuXG4gICAgdmFyIHdoZXJlID0gKGJsb2NrUG9zaXRpb24gPiBzZWxlY3RlZFBvc2l0aW9uKSA/IFwiQmVmb3JlXCIgOiBcIkFmdGVyXCI7XG5cbiAgICBpZigkYmxvY2tCeSAmJiAkYmxvY2tCeS5hdHRyKCdpZCcpICE9PSAkYmxvY2suYXR0cignaWQnKSkge1xuICAgICAgdGhpcy5oaWRlQWxsVGhlVGhpbmdzKCk7XG4gICAgICAkYmxvY2tbXCJpbnNlcnRcIiArIHdoZXJlXSgkYmxvY2tCeSk7XG4gICAgICB0aGlzLnNjcm9sbFRvKCRibG9jayk7XG4gICAgfVxuICB9LFxuXG4gIF9yZW5kZXJJblBvc2l0aW9uOiBmdW5jdGlvbihibG9jaykge1xuICAgIGlmICh0aGlzLmJsb2NrX2NvbnRyb2xzLmN1cnJlbnRDb250YWluZXIpIHtcbiAgICAgIHRoaXMuYmxvY2tfY29udHJvbHMuY3VycmVudENvbnRhaW5lci5hZnRlcihibG9jayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuJHdyYXBwZXIuYXBwZW5kKGJsb2NrKTtcbiAgICB9XG4gIH0sXG5cbiAgdmFsaWRhdGVBbmRTYXZlQmxvY2s6IGZ1bmN0aW9uKGJsb2NrLCBzaG91bGRWYWxpZGF0ZSkge1xuICAgIGlmICgoIWNvbmZpZy5za2lwVmFsaWRhdGlvbiB8fCBzaG91bGRWYWxpZGF0ZSkgJiYgIWJsb2NrLnZhbGlkKCkpIHtcbiAgICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignZXJyb3JzOmFkZCcsIHsgdGV4dDogXy5yZXN1bHQoYmxvY2ssICd2YWxpZGF0aW9uRmFpbE1zZycpIH0pO1xuICAgICAgdXRpbHMubG9nKFwiQmxvY2sgXCIgKyBibG9jay5ibG9ja0lEICsgXCIgZmFpbGVkIHZhbGlkYXRpb25cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJsb2NrRGF0YSA9IGJsb2NrLmdldERhdGEoKTtcbiAgICB1dGlscy5sb2coXCJBZGRpbmcgZGF0YSBmb3IgYmxvY2sgXCIgKyBibG9jay5ibG9ja0lEICsgXCIgdG8gYmxvY2sgc3RvcmU6XCIsXG4gICAgICAgICAgICAgIGJsb2NrRGF0YSk7XG4gICAgdGhpcy5zdG9yZS5hZGREYXRhKGJsb2NrRGF0YSk7XG4gIH0sXG5cbiAgLypcbiAgICogSGFuZGxlIGEgZm9ybSBzdWJtaXNzaW9uIG9mIHRoaXMgRWRpdG9yIGluc3RhbmNlLlxuICAgKiBWYWxpZGF0ZSBhbGwgb2Ygb3VyIGJsb2NrcywgYW5kIHNlcmlhbGlzZSBhbGwgZGF0YSBvbnRvIHRoZSBKU09OIG9iamVjdHNcbiAgICovXG4gIG9uRm9ybVN1Ym1pdDogZnVuY3Rpb24oc2hvdWxkVmFsaWRhdGUpIHtcbiAgICAvLyBpZiB1bmRlZmluZWQgb3IgbnVsbCBvciBhbnl0aGluZyBvdGhlciB0aGFuIGZhbHNlIC0gdHJlYXQgYXMgdHJ1ZVxuICAgIHNob3VsZFZhbGlkYXRlID0gKHNob3VsZFZhbGlkYXRlID09PSBmYWxzZSkgPyBmYWxzZSA6IHRydWU7XG5cbiAgICB1dGlscy5sb2coXCJIYW5kbGluZyBmb3JtIHN1Ym1pc3Npb24gZm9yIEVkaXRvciBcIiArIHRoaXMuSUQpO1xuXG4gICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdlcnJvcnM6cmVzZXQnKTtcbiAgICB0aGlzLnN0b3JlLnJlc2V0KCk7XG5cbiAgICB0aGlzLnZhbGlkYXRlQmxvY2tzKHNob3VsZFZhbGlkYXRlKTtcbiAgICB0aGlzLmJsb2NrX21hbmFnZXIudmFsaWRhdGVCbG9ja1R5cGVzRXhpc3Qoc2hvdWxkVmFsaWRhdGUpO1xuXG4gICAgdGhpcy5tZWRpYXRvci50cmlnZ2VyKCdlcnJvcnM6cmVuZGVyJyk7XG4gICAgdGhpcy4kZWwudmFsKHRoaXMuc3RvcmUudG9TdHJpbmcoKSk7XG5cbiAgICByZXR1cm4gdGhpcy5lcnJvckhhbmRsZXIuZXJyb3JzLmxlbmd0aDtcbiAgfSxcblxuICB2YWxpZGF0ZUJsb2NrczogZnVuY3Rpb24oc2hvdWxkVmFsaWRhdGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy4kd3JhcHBlci5maW5kKCcuc3QtYmxvY2snKS5lYWNoKGZ1bmN0aW9uKGlkeCwgYmxvY2spIHtcbiAgICAgIHZhciBfYmxvY2sgPSBzZWxmLmJsb2NrX21hbmFnZXIuZmluZEJsb2NrQnlJZCgkKGJsb2NrKS5hdHRyKCdpZCcpKTtcbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZChfYmxvY2spKSB7XG4gICAgICAgIHNlbGYudmFsaWRhdGVBbmRTYXZlQmxvY2soX2Jsb2NrLCBzaG91bGRWYWxpZGF0ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgZmluZEJsb2NrQnlJZDogZnVuY3Rpb24oYmxvY2tfaWQpIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja19tYW5hZ2VyLmZpbmRCbG9ja0J5SWQoYmxvY2tfaWQpO1xuICB9LFxuXG4gIGdldEJsb2Nrc0J5VHlwZTogZnVuY3Rpb24oYmxvY2tfdHlwZSkge1xuICAgIHJldHVybiB0aGlzLmJsb2NrX21hbmFnZXIuZ2V0QmxvY2tzQnlUeXBlKGJsb2NrX3R5cGUpO1xuICB9LFxuXG4gIGdldEJsb2Nrc0J5SURzOiBmdW5jdGlvbihibG9ja19pZHMpIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja19tYW5hZ2VyLmdldEJsb2Nrc0J5SURzKGJsb2NrX2lkcyk7XG4gIH0sXG5cbiAgZ2V0QmxvY2tQb3NpdGlvbjogZnVuY3Rpb24oJGJsb2NrKSB7XG4gICAgcmV0dXJuIHRoaXMuJHdyYXBwZXIuZmluZCgnLnN0LWJsb2NrJykuaW5kZXgoJGJsb2NrKTtcbiAgfSxcblxuICBfZW5zdXJlQW5kU2V0RWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuICAgIGlmKF8uaXNVbmRlZmluZWQodGhpcy5vcHRpb25zLmVsKSB8fCBfLmlzRW1wdHkodGhpcy5vcHRpb25zLmVsKSkge1xuICAgICAgdXRpbHMubG9nKFwiWW91IG11c3QgcHJvdmlkZSBhbiBlbFwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLiRlbCA9IHRoaXMub3B0aW9ucy5lbDtcbiAgICB0aGlzLmVsID0gdGhpcy5vcHRpb25zLmVsWzBdO1xuICAgIHRoaXMuJGZvcm0gPSB0aGlzLiRlbC5wYXJlbnRzKCdmb3JtJyk7XG5cbiAgICB2YXIgJG91dGVyID0gJChcIjxkaXY+XCIpLmF0dHIoeyAnaWQnOiB0aGlzLklELCAnY2xhc3MnOiAnc3Qtb3V0ZXInLCAnZHJvcHpvbmUnOiAnY29weSBsaW5rIG1vdmUnIH0pO1xuICAgIHZhciAkd3JhcHBlciA9ICQoXCI8ZGl2PlwiKS5hdHRyKHsgJ2NsYXNzJzogJ3N0LWJsb2NrcycgfSk7XG5cbiAgICAvLyBXcmFwIG91ciBlbGVtZW50IGluIGxvdHMgb2YgY29udGFpbmVycyAqZXd3KlxuICAgIHRoaXMuJGVsLndyYXAoJG91dGVyKS53cmFwKCR3cmFwcGVyKTtcblxuICAgIHRoaXMuJG91dGVyID0gdGhpcy4kZm9ybS5maW5kKCcjJyArIHRoaXMuSUQpO1xuICAgIHRoaXMuJHdyYXBwZXIgPSB0aGlzLiRvdXRlci5maW5kKCcuc3QtYmxvY2tzJyk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3I7XG5cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcblxudmFyIEVycm9ySGFuZGxlciA9IGZ1bmN0aW9uKCR3cmFwcGVyLCBtZWRpYXRvciwgY29udGFpbmVyKSB7XG4gIHRoaXMuJHdyYXBwZXIgPSAkd3JhcHBlcjtcbiAgdGhpcy5tZWRpYXRvciA9IG1lZGlhdG9yO1xuICB0aGlzLiRlbCA9IGNvbnRhaW5lcjtcblxuICBpZiAoXy5pc1VuZGVmaW5lZCh0aGlzLiRlbCkpIHtcbiAgICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gICAgdGhpcy4kd3JhcHBlci5wcmVwZW5kKHRoaXMuJGVsKTtcbiAgfVxuXG4gIHRoaXMuJGVsLmhpZGUoKTtcbiAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuICB0aGlzLl9iaW5kTWVkaWF0ZWRFdmVudHMoKTtcblxuICB0aGlzLmluaXRpYWxpemUoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oRXJyb3JIYW5kbGVyLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vbWVkaWF0ZWQtZXZlbnRzJyksIHJlcXVpcmUoJy4vcmVuZGVyYWJsZScpLCB7XG5cbiAgZXJyb3JzOiBbXSxcbiAgY2xhc3NOYW1lOiBcInN0LWVycm9yc1wiLFxuICBldmVudE5hbWVzcGFjZTogJ2Vycm9ycycsXG5cbiAgbWVkaWF0ZWRFdmVudHM6IHtcbiAgICAncmVzZXQnOiAncmVzZXQnLFxuICAgICdhZGQnOiAnYWRkTWVzc2FnZScsXG4gICAgJ3JlbmRlcic6ICdyZW5kZXInXG4gIH0sXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyICRsaXN0ID0gJChcIjx1bD5cIik7XG4gICAgdGhpcy4kZWwuYXBwZW5kKFwiPHA+XCIgKyBpMThuLnQoXCJlcnJvcnM6dGl0bGVcIikgKyBcIjwvcD5cIilcbiAgICAuYXBwZW5kKCRsaXN0KTtcbiAgICB0aGlzLiRsaXN0ID0gJGxpc3Q7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5lcnJvcnMubGVuZ3RoID09PSAwKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIHRoaXMuZXJyb3JzLmZvckVhY2godGhpcy5jcmVhdGVFcnJvckl0ZW0sIHRoaXMpO1xuICAgIHRoaXMuJGVsLnNob3coKTtcbiAgfSxcblxuICBjcmVhdGVFcnJvckl0ZW06IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgdmFyICRlcnJvciA9ICQoXCI8bGk+XCIsIHsgY2xhc3M6IFwic3QtZXJyb3JzX19tc2dcIiwgaHRtbDogZXJyb3IudGV4dCB9KTtcbiAgICB0aGlzLiRsaXN0LmFwcGVuZCgkZXJyb3IpO1xuICB9LFxuXG4gIGFkZE1lc3NhZ2U6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgdGhpcy5lcnJvcnMucHVzaChlcnJvcik7XG4gIH0sXG5cbiAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmVycm9ycy5sZW5ndGggPT09IDApIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICB0aGlzLiRsaXN0Lmh0bWwoJycpO1xuICAgIHRoaXMuJGVsLmhpZGUoKTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBFcnJvckhhbmRsZXI7XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oe30sIHJlcXVpcmUoJy4vZXZlbnRzJykpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnZXZlbnRhYmxlanMnKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICogU2lyIFRyZXZvciBFZGl0b3IgU3RvcmVcbiAqIEJ5IGRlZmF1bHQgd2Ugc3RvcmUgdGhlIGNvbXBsZXRlIGRhdGEgb24gdGhlIGluc3RhbmNlcyAkZWxcbiAqIFdlIGNhbiBlYXNpbHkgZXh0ZW5kIHRoaXMgYW5kIHN0b3JlIGl0IG9uIHNvbWUgc2VydmVyIG9yIHNvbWV0aGluZ1xuICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5cbnZhciBFZGl0b3JTdG9yZSA9IGZ1bmN0aW9uKGRhdGEsIG1lZGlhdG9yKSB7XG4gIHRoaXMubWVkaWF0b3IgPSBtZWRpYXRvcjtcbiAgdGhpcy5pbml0aWFsaXplKGRhdGEgPyBkYXRhLnRyaW0oKSA6ICcnKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oRWRpdG9yU3RvcmUucHJvdG90eXBlLCB7XG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oZGF0YSkge1xuICAgIHRoaXMuc3RvcmUgPSB0aGlzLl9wYXJzZURhdGEoZGF0YSkgfHwgeyBkYXRhOiBbXSB9O1xuICB9LFxuXG4gIHJldHJpZXZlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZTtcbiAgfSxcblxuICB0b1N0cmluZzogZnVuY3Rpb24oc3BhY2UpIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5zdG9yZSwgdW5kZWZpbmVkLCBzcGFjZSk7XG4gIH0sXG5cbiAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgIHV0aWxzLmxvZyhcIlJlc2V0dGluZyB0aGUgRWRpdG9yU3RvcmVcIik7XG4gICAgdGhpcy5zdG9yZSA9IHsgZGF0YTogW10gfTtcbiAgfSxcblxuICBhZGREYXRhOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5zdG9yZS5kYXRhLnB1c2goZGF0YSk7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmU7XG4gIH0sXG5cbiAgX3BhcnNlRGF0YTogZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciByZXN1bHQ7XG5cbiAgICBpZiAoZGF0YS5sZW5ndGggPT09IDApIHsgcmV0dXJuIHJlc3VsdDsgfVxuXG4gICAgdHJ5IHtcbiAgICAgIC8vIEVuc3VyZSB0aGUgSlNPTiBzdHJpbmcgaGFzIGEgZGF0YSBlbGVtZW50IHRoYXQncyBhbiBhcnJheVxuICAgICAgdmFyIGpzb25TdHIgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGpzb25TdHIuZGF0YSkpIHtcbiAgICAgICAgcmVzdWx0ID0ganNvblN0cjtcbiAgICAgIH1cbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcihcbiAgICAgICAgJ2Vycm9yczphZGQnLFxuICAgICAgICB7IHRleHQ6IGkxOG4udChcImVycm9yczpsb2FkX2ZhaWxcIikgfSk7XG5cbiAgICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignZXJyb3JzOnJlbmRlcicpO1xuXG4gICAgICBjb25zb2xlLmxvZygnU29ycnkgdGhlcmUgaGFzIGJlZW4gYSBwcm9ibGVtIHdpdGggcGFyc2luZyB0aGUgSlNPTicpO1xuICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3JTdG9yZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuKiAgIFNpciBUcmV2b3IgVXBsb2FkZXJcbiogICBHZW5lcmljIFVwbG9hZCBpbXBsZW1lbnRhdGlvbiB0aGF0IGNhbiBiZSBleHRlbmRlZCBmb3IgYmxvY2tzXG4qL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL2xvZGFzaCcpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uL2NvbmZpZycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi4vZXZlbnQtYnVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYmxvY2ssIGZpbGUsIHN1Y2Nlc3MsIGVycm9yKSB7XG5cbiAgRXZlbnRCdXMudHJpZ2dlcignb25VcGxvYWRTdGFydCcpO1xuXG4gIHZhciB1aWQgID0gW2Jsb2NrLmJsb2NrSUQsIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCksICdyYXcnXS5qb2luKCctJyk7XG4gIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cbiAgZGF0YS5hcHBlbmQoJ2F0dGFjaG1lbnRbbmFtZV0nLCBmaWxlLm5hbWUpO1xuICBkYXRhLmFwcGVuZCgnYXR0YWNobWVudFtmaWxlXScsIGZpbGUpO1xuICBkYXRhLmFwcGVuZCgnYXR0YWNobWVudFt1aWRdJywgdWlkKTtcblxuICBibG9jay5yZXNldE1lc3NhZ2VzKCk7XG5cbiAgdmFyIGNhbGxiYWNrU3VjY2VzcyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB1dGlscy5sb2coJ1VwbG9hZCBjYWxsYmFjayBjYWxsZWQnKTtcbiAgICBFdmVudEJ1cy50cmlnZ2VyKCdvblVwbG9hZFN0b3AnKTtcblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChzdWNjZXNzKSAmJiBfLmlzRnVuY3Rpb24oc3VjY2VzcykpIHtcbiAgICAgIHN1Y2Nlc3MuYXBwbHkoYmxvY2ssIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBjYWxsYmFja0Vycm9yID0gZnVuY3Rpb24oanFYSFIsIHN0YXR1cywgZXJyb3JUaHJvd24pIHtcbiAgICB1dGlscy5sb2coJ1VwbG9hZCBjYWxsYmFjayBlcnJvciBjYWxsZWQnKTtcbiAgICBFdmVudEJ1cy50cmlnZ2VyKCdvblVwbG9hZFN0b3AnKTtcblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChlcnJvcikgJiYgXy5pc0Z1bmN0aW9uKGVycm9yKSkge1xuICAgICAgZXJyb3IuY2FsbChibG9jaywgc3RhdHVzKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHhociA9ICQuYWpheCh7XG4gICAgdXJsOiBjb25maWcuZGVmYXVsdHMudXBsb2FkVXJsLFxuICAgIGRhdGE6IGRhdGEsXG4gICAgY2FjaGU6IGZhbHNlLFxuICAgIGNvbnRlbnRUeXBlOiBmYWxzZSxcbiAgICBwcm9jZXNzRGF0YTogZmFsc2UsXG4gICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICB0eXBlOiAnUE9TVCdcbiAgfSk7XG5cbiAgYmxvY2suYWRkUXVldWVkSXRlbSh1aWQsIHhocik7XG5cbiAgeGhyLmRvbmUoY2FsbGJhY2tTdWNjZXNzKVxuICAgICAuZmFpbChjYWxsYmFja0Vycm9yKVxuICAgICAuYWx3YXlzKGJsb2NrLnJlbW92ZVF1ZXVlZEl0ZW0uYmluZChibG9jaywgdWlkKSk7XG5cbiAgcmV0dXJuIHhocjtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAqIFNpclRyZXZvci5TdWJtaXR0YWJsZVxuICogLS1cbiAqIFdlIG5lZWQgYSBnbG9iYWwgd2F5IG9mIHNldHRpbmcgaWYgdGhlIGVkaXRvciBjYW4gYW5kIGNhbid0IGJlIHN1Ym1pdHRlZCxcbiAqIGFuZCBhIHdheSB0byBkaXNhYmxlIHRoZSBzdWJtaXQgYnV0dG9uIGFuZCBhZGQgbWVzc2FnZXMgKHdoZW4gYXBwcm9wcmlhdGUpXG4gKiBXZSBhbHNvIG5lZWQgdGhpcyB0byBiZSBoaWdobHkgZXh0ZW5zaWJsZSBzbyBpdCBjYW4gYmUgb3ZlcnJpZGRlbi5cbiAqIFRoaXMgd2lsbCBiZSB0cmlnZ2VyZWQgKmJ5IGFueXRoaW5nKiBzbyBpdCBuZWVkcyB0byBzdWJzY3JpYmUgdG8gZXZlbnRzLlxuICovXG5cblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIEV2ZW50QnVzID0gcmVxdWlyZSgnLi4vZXZlbnQtYnVzJyk7XG5cbnZhciBTdWJtaXR0YWJsZSA9IGZ1bmN0aW9uKCRmb3JtKSB7XG4gIHRoaXMuJGZvcm0gPSAkZm9ybTtcbiAgdGhpcy5pbnRpYWxpemUoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oU3VibWl0dGFibGUucHJvdG90eXBlLCB7XG5cbiAgaW50aWFsaXplOiBmdW5jdGlvbigpe1xuICAgIHRoaXMuc3VibWl0QnRuID0gdGhpcy4kZm9ybS5maW5kKFwiaW5wdXRbdHlwZT0nc3VibWl0J11cIik7XG5cbiAgICB2YXIgYnRuVGl0bGVzID0gW107XG5cbiAgICB0aGlzLnN1Ym1pdEJ0bi5lYWNoKGZ1bmN0aW9uKGksIGJ0bil7XG4gICAgICBidG5UaXRsZXMucHVzaCgkKGJ0bikuYXR0cigndmFsdWUnKSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnN1Ym1pdEJ0blRpdGxlcyA9IGJ0blRpdGxlcztcbiAgICB0aGlzLmNhblN1Ym1pdCA9IHRydWU7XG4gICAgdGhpcy5nbG9iYWxVcGxvYWRDb3VudCA9IDA7XG4gICAgdGhpcy5fYmluZEV2ZW50cygpO1xuICB9LFxuXG4gIHNldFN1Ym1pdEJ1dHRvbjogZnVuY3Rpb24oZSwgbWVzc2FnZSkge1xuICAgIHRoaXMuc3VibWl0QnRuLmF0dHIoJ3ZhbHVlJywgbWVzc2FnZSk7XG4gIH0sXG5cbiAgcmVzZXRTdWJtaXRCdXR0b246IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRpdGxlcyA9IHRoaXMuc3VibWl0QnRuVGl0bGVzO1xuICAgIHRoaXMuc3VibWl0QnRuLmVhY2goZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICQoaXRlbSkuYXR0cigndmFsdWUnLCB0aXRsZXNbaW5kZXhdKTtcbiAgICB9KTtcbiAgfSxcblxuICBvblVwbG9hZFN0YXJ0OiBmdW5jdGlvbihlKXtcbiAgICB0aGlzLmdsb2JhbFVwbG9hZENvdW50Kys7XG4gICAgdXRpbHMubG9nKCdvblVwbG9hZFN0YXJ0IGNhbGxlZCAnICsgdGhpcy5nbG9iYWxVcGxvYWRDb3VudCk7XG5cbiAgICBpZih0aGlzLmdsb2JhbFVwbG9hZENvdW50ID09PSAxKSB7XG4gICAgICB0aGlzLl9kaXNhYmxlU3VibWl0QnV0dG9uKCk7XG4gICAgfVxuICB9LFxuXG4gIG9uVXBsb2FkU3RvcDogZnVuY3Rpb24oZSkge1xuICAgIHRoaXMuZ2xvYmFsVXBsb2FkQ291bnQgPSAodGhpcy5nbG9iYWxVcGxvYWRDb3VudCA8PSAwKSA/IDAgOiB0aGlzLmdsb2JhbFVwbG9hZENvdW50IC0gMTtcblxuICAgIHV0aWxzLmxvZygnb25VcGxvYWRTdG9wIGNhbGxlZCAnICsgdGhpcy5nbG9iYWxVcGxvYWRDb3VudCk7XG5cbiAgICBpZih0aGlzLmdsb2JhbFVwbG9hZENvdW50ID09PSAwKSB7XG4gICAgICB0aGlzLl9lbmFibGVTdWJtaXRCdXR0b24oKTtcbiAgICB9XG4gIH0sXG5cbiAgb25FcnJvcjogZnVuY3Rpb24oZSl7XG4gICAgdXRpbHMubG9nKCdvbkVycm9yIGNhbGxlZCcpO1xuICAgIHRoaXMuY2FuU3VibWl0ID0gZmFsc2U7XG4gIH0sXG5cbiAgX2Rpc2FibGVTdWJtaXRCdXR0b246IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgIHRoaXMuc2V0U3VibWl0QnV0dG9uKG51bGwsIG1lc3NhZ2UgfHwgaTE4bi50KFwiZ2VuZXJhbDp3YWl0XCIpKTtcbiAgICB0aGlzLnN1Ym1pdEJ0blxuICAgIC5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpXG4gICAgLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICB9LFxuXG4gIF9lbmFibGVTdWJtaXRCdXR0b246IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5yZXNldFN1Ym1pdEJ1dHRvbigpO1xuICAgIHRoaXMuc3VibWl0QnRuXG4gICAgLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJylcbiAgICAucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gIH0sXG5cbiAgX2V2ZW50cyA6IHtcbiAgICBcImRpc2FibGVTdWJtaXRCdXR0b25cIiA6IFwiX2Rpc2FibGVTdWJtaXRCdXR0b25cIixcbiAgICBcImVuYWJsZVN1Ym1pdEJ1dHRvblwiICA6IFwiX2VuYWJsZVN1Ym1pdEJ1dHRvblwiLFxuICAgIFwic2V0U3VibWl0QnV0dG9uXCIgICAgIDogXCJzZXRTdWJtaXRCdXR0b25cIixcbiAgICBcInJlc2V0U3VibWl0QnV0dG9uXCIgICA6IFwicmVzZXRTdWJtaXRCdXR0b25cIixcbiAgICBcIm9uRXJyb3JcIiAgICAgICAgICAgICA6IFwib25FcnJvclwiLFxuICAgIFwib25VcGxvYWRTdGFydFwiICAgICAgIDogXCJvblVwbG9hZFN0YXJ0XCIsXG4gICAgXCJvblVwbG9hZFN0b3BcIiAgICAgICAgOiBcIm9uVXBsb2FkU3RvcFwiXG4gIH0sXG5cbiAgX2JpbmRFdmVudHM6IGZ1bmN0aW9uKCl7XG4gICAgT2JqZWN0LmtleXModGhpcy5fZXZlbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIEV2ZW50QnVzLm9uKHR5cGUsIHRoaXNbdGhpcy5fZXZlbnRzW3R5cGVdXSwgdGhpcyk7XG4gICAgfSwgdGhpcyk7XG4gIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3VibWl0dGFibGU7XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICAgU2lyVHJldm9yIEZsb2F0aW5nIEJsb2NrIENvbnRyb2xzXG4gICAtLVxuICAgRHJhd3MgdGhlICdwbHVzJyBiZXR3ZWVuIGJsb2Nrc1xuICAgKi9cblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xuXG52YXIgRXZlbnRCdXMgPSByZXF1aXJlKCcuL2V2ZW50LWJ1cycpO1xuXG52YXIgRmxvYXRpbmdCbG9ja0NvbnRyb2xzID0gZnVuY3Rpb24od3JhcHBlciwgaW5zdGFuY2VfaWQsIG1lZGlhdG9yKSB7XG4gIHRoaXMuJHdyYXBwZXIgPSB3cmFwcGVyO1xuICB0aGlzLmluc3RhbmNlX2lkID0gaW5zdGFuY2VfaWQ7XG4gIHRoaXMubWVkaWF0b3IgPSBtZWRpYXRvcjtcblxuICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gIHRoaXMuX2JpbmRGdW5jdGlvbnMoKTtcblxuICB0aGlzLmluaXRpYWxpemUoKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oRmxvYXRpbmdCbG9ja0NvbnRyb2xzLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vcmVuZGVyYWJsZScpLCByZXF1aXJlKCcuL2V2ZW50cycpLCB7XG5cbiAgY2xhc3NOYW1lOiBcInN0LWJsb2NrLWNvbnRyb2xzX190b3BcIixcblxuICBhdHRyaWJ1dGVzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2RhdGEtaWNvbic6ICdhZGQnXG4gICAgfTtcbiAgfSxcblxuICBib3VuZDogWydoYW5kbGVCbG9ja01vdXNlT3V0JywgJ2hhbmRsZUJsb2NrTW91c2VPdmVyJywgJ2hhbmRsZUJsb2NrQ2xpY2snLCAnb25Ecm9wJ10sXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZWwub24oJ2NsaWNrJywgdGhpcy5oYW5kbGVCbG9ja0NsaWNrKVxuICAgIC5kcm9wQXJlYSgpXG4gICAgLmJpbmQoJ2Ryb3AnLCB0aGlzLm9uRHJvcCk7XG5cbiAgICB0aGlzLiR3cmFwcGVyLm9uKCdtb3VzZW92ZXInLCAnLnN0LWJsb2NrJywgdGhpcy5oYW5kbGVCbG9ja01vdXNlT3ZlcilcbiAgICAub24oJ21vdXNlb3V0JywgJy5zdC1ibG9jaycsIHRoaXMuaGFuZGxlQmxvY2tNb3VzZU91dClcbiAgICAub24oJ2NsaWNrJywgJy5zdC1ibG9jay0td2l0aC1wbHVzJywgdGhpcy5oYW5kbGVCbG9ja0NsaWNrKTtcbiAgfSxcblxuICBvbkRyb3A6IGZ1bmN0aW9uKGV2KSB7XG4gICAgZXYucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBkcm9wcGVkX29uID0gdGhpcy4kZWwsXG4gICAgaXRlbV9pZCA9IGV2Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoXCJ0ZXh0L3BsYWluXCIpLFxuICAgIGJsb2NrID0gJCgnIycgKyBpdGVtX2lkKTtcblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChpdGVtX2lkKSAmJlxuICAgICAgICAhXy5pc0VtcHR5KGJsb2NrKSAmJlxuICAgICAgICAgIGRyb3BwZWRfb24uYXR0cignaWQnKSAhPT0gaXRlbV9pZCAmJlxuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZV9pZCA9PT0gYmxvY2suYXR0cignZGF0YS1pbnN0YW5jZScpXG4gICAgICAgKSB7XG4gICAgICAgICBkcm9wcGVkX29uLmFmdGVyKGJsb2NrKTtcbiAgICAgICB9XG5cbiAgICAgICBFdmVudEJ1cy50cmlnZ2VyKFwiYmxvY2s6cmVvcmRlcjpkcm9wcGVkXCIsIGl0ZW1faWQpO1xuICB9LFxuXG4gIGhhbmRsZUJsb2NrTW91c2VPdmVyOiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGJsb2NrID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuXG4gICAgaWYgKCFibG9jay5oYXNDbGFzcygnc3QtYmxvY2stLXdpdGgtcGx1cycpKSB7XG4gICAgICBibG9jay5hZGRDbGFzcygnc3QtYmxvY2stLXdpdGgtcGx1cycpO1xuICAgIH1cbiAgfSxcblxuICBoYW5kbGVCbG9ja01vdXNlT3V0OiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGJsb2NrID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuXG4gICAgaWYgKGJsb2NrLmhhc0NsYXNzKCdzdC1ibG9jay0td2l0aC1wbHVzJykpIHtcbiAgICAgIGJsb2NrLnJlbW92ZUNsYXNzKCdzdC1ibG9jay0td2l0aC1wbHVzJyk7XG4gICAgfVxuICB9LFxuXG4gIGhhbmRsZUJsb2NrQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIHRoaXMubWVkaWF0b3IudHJpZ2dlcignYmxvY2stY29udHJvbHM6cmVuZGVyJywgJChlLmN1cnJlbnRUYXJnZXQpKTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGbG9hdGluZ0Jsb2NrQ29udHJvbHM7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBFdmVudEJ1cyA9IHJlcXVpcmUoJy4vZXZlbnQtYnVzJyk7XG52YXIgU3VibWl0dGFibGUgPSByZXF1aXJlKCcuL2V4dGVuc2lvbnMvc3VibWl0dGFibGUnKTtcblxudmFyIGZvcm1Cb3VuZCA9IGZhbHNlOyAvLyBGbGFnIHRvIHRlbGwgdXMgb25jZSB3ZSd2ZSBib3VuZCBvdXIgc3VibWl0IGV2ZW50XG5cbnZhciBGb3JtRXZlbnRzID0ge1xuICBiaW5kRm9ybVN1Ym1pdDogZnVuY3Rpb24oZm9ybSkge1xuICAgIGlmICghZm9ybUJvdW5kKSB7XG4gICAgICAvLyBYWFg6IHNob3VsZCB3ZSBoYXZlIGEgZm9ybUJvdW5kIGFuZCBzdWJtaXR0YWJsZSBwZXItZWRpdG9yP1xuICAgICAgLy8gdGVsbGluZyBKU0hpbnQgdG8gaWdub3JlIGFzIGl0J2xsIGNvbXBsYWluIHdlIHNob3VsZG4ndCBiZSBjcmVhdGluZ1xuICAgICAgLy8gYSBuZXcgb2JqZWN0LCBidXQgb3RoZXJ3aXNlIGB0aGlzYCB3b24ndCBiZSBzZXQgaW4gdGhlIFN1Ym1pdHRhYmxlXG4gICAgICAvLyBpbml0aWFsaXNlci4gQml0IHdlaXJkLlxuICAgICAgbmV3IFN1Ym1pdHRhYmxlKGZvcm0pOyAvLyBqc2hpbnQgaWdub3JlOmxpbmVcbiAgICAgIGZvcm0uYmluZCgnc3VibWl0JywgdGhpcy5vbkZvcm1TdWJtaXQpO1xuICAgICAgZm9ybUJvdW5kID0gdHJ1ZTtcbiAgICB9XG4gIH0sXG5cbiAgb25CZWZvcmVTdWJtaXQ6IGZ1bmN0aW9uKHNob3VsZFZhbGlkYXRlKSB7XG4gICAgLy8gTG9vcCB0aHJvdWdoIGFsbCBvZiBvdXIgaW5zdGFuY2VzIGFuZCBkbyBvdXIgZm9ybSBzdWJtaXRzIG9uIHRoZW1cbiAgICB2YXIgZXJyb3JzID0gMDtcbiAgICBjb25maWcuaW5zdGFuY2VzLmZvckVhY2goZnVuY3Rpb24oaW5zdCwgaSkge1xuICAgICAgZXJyb3JzICs9IGluc3Qub25Gb3JtU3VibWl0KHNob3VsZFZhbGlkYXRlKTtcbiAgICB9KTtcbiAgICB1dGlscy5sb2coXCJUb3RhbCBlcnJvcnM6IFwiICsgZXJyb3JzKTtcblxuICAgIHJldHVybiBlcnJvcnM7XG4gIH0sXG5cbiAgb25Gb3JtU3VibWl0OiBmdW5jdGlvbihldikge1xuICAgIHZhciBlcnJvcnMgPSBGb3JtRXZlbnRzLm9uQmVmb3JlU3VibWl0KCk7XG5cbiAgICBpZihlcnJvcnMgPiAwKSB7XG4gICAgICBFdmVudEJ1cy50cmlnZ2VyKFwib25FcnJvclwiKTtcbiAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtRXZlbnRzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gICBGb3JtYXQgQmFyXG4gICAtLVxuICAgRGlzcGxheWVkIG9uIGZvY3VzIG9uIGEgdGV4dCBhcmVhLlxuICAgUmVuZGVycyB3aXRoIGFsbCBhdmFpbGFibGUgb3B0aW9ucyBmb3IgdGhlIGVkaXRvciBpbnN0YW5jZVxuICAgKi9cblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xuXG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcbnZhciBGb3JtYXR0ZXJzID0gcmVxdWlyZSgnLi9mb3JtYXR0ZXJzJyk7XG5cbnZhciBGb3JtYXRCYXIgPSBmdW5jdGlvbihvcHRpb25zLCBtZWRpYXRvcikge1xuICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBjb25maWcuZGVmYXVsdHMuZm9ybWF0QmFyLCBvcHRpb25zIHx8IHt9KTtcbiAgdGhpcy5tZWRpYXRvciA9IG1lZGlhdG9yO1xuXG4gIHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcbiAgdGhpcy5fYmluZEZ1bmN0aW9ucygpO1xuICB0aGlzLl9iaW5kTWVkaWF0ZWRFdmVudHMoKTtcblxuICB0aGlzLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oRm9ybWF0QmFyLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vbWVkaWF0ZWQtZXZlbnRzJyksIHJlcXVpcmUoJy4vZXZlbnRzJyksIHJlcXVpcmUoJy4vcmVuZGVyYWJsZScpLCB7XG5cbiAgY2xhc3NOYW1lOiAnc3QtZm9ybWF0LWJhcicsXG5cbiAgYm91bmQ6IFtcIm9uRm9ybWF0QnV0dG9uQ2xpY2tcIiwgXCJyZW5kZXJCeVNlbGVjdGlvblwiLCBcImhpZGVcIl0sXG5cbiAgZXZlbnROYW1lc3BhY2U6ICdmb3JtYXR0ZXInLFxuXG4gIG1lZGlhdGVkRXZlbnRzOiB7XG4gICAgJ3Bvc2l0b24nOiAncmVuZGVyQnlTZWxlY3Rpb24nLFxuICAgICdzaG93JzogJ3Nob3cnLFxuICAgICdoaWRlJzogJ2hpZGUnXG4gIH0sXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZvcm1hdE5hbWUsIGZvcm1hdCwgYnRuO1xuICAgIHRoaXMuJGJ0bnMgPSBbXTtcblxuICAgIGZvciAoZm9ybWF0TmFtZSBpbiBGb3JtYXR0ZXJzKSB7XG4gICAgICBpZiAoRm9ybWF0dGVycy5oYXNPd25Qcm9wZXJ0eShmb3JtYXROYW1lKSkge1xuICAgICAgICBmb3JtYXQgPSBGb3JtYXR0ZXJzW2Zvcm1hdE5hbWVdO1xuICAgICAgICBidG4gPSAkKFwiPGJ1dHRvbj5cIiwge1xuICAgICAgICAgICdjbGFzcyc6ICdzdC1mb3JtYXQtYnRuIHN0LWZvcm1hdC1idG4tLScgKyBmb3JtYXROYW1lICsgJyAnICsgKGZvcm1hdC5pY29uTmFtZSA/ICdzdC1pY29uJyA6ICcnKSxcbiAgICAgICAgICAndGV4dCc6IGZvcm1hdC50ZXh0LFxuICAgICAgICAgICdkYXRhLXR5cGUnOiBmb3JtYXROYW1lLFxuICAgICAgICAgICdkYXRhLWNtZCc6IGZvcm1hdC5jbWRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy4kYnRucy5wdXNoKGJ0bik7XG4gICAgICAgIGJ0bi5hcHBlbmRUbyh0aGlzLiRlbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy4kYiA9ICQoZG9jdW1lbnQpO1xuICAgIHRoaXMuJGVsLmJpbmQoJ2NsaWNrJywgJy5zdC1mb3JtYXQtYnRuJywgdGhpcy5vbkZvcm1hdEJ1dHRvbkNsaWNrKTtcbiAgfSxcblxuICBoaWRlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnc3QtZm9ybWF0LWJhci0taXMtcmVhZHknKTtcbiAgfSxcblxuICBzaG93OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRlbC5hZGRDbGFzcygnc3QtZm9ybWF0LWJhci0taXMtcmVhZHknKTtcbiAgfSxcblxuICByZW1vdmU6IGZ1bmN0aW9uKCl7IHRoaXMuJGVsLnJlbW92ZSgpOyB9LFxuXG4gIHJlbmRlckJ5U2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCksXG4gICAgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0UmFuZ2VBdCgwKSxcbiAgICBib3VuZGFyeSA9IHJhbmdlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgIGNvb3JkcyA9IHt9O1xuXG4gICAgY29vcmRzLnRvcCA9IGJvdW5kYXJ5LnRvcCArIDIwICsgd2luZG93LnBhZ2VZT2Zmc2V0IC0gdGhpcy4kZWwuaGVpZ2h0KCkgKyAncHgnO1xuICAgIGNvb3Jkcy5sZWZ0ID0gKChib3VuZGFyeS5sZWZ0ICsgYm91bmRhcnkucmlnaHQpIC8gMikgLSAodGhpcy4kZWwud2lkdGgoKSAvIDIpICsgJ3B4JztcblxuICAgIHRoaXMuaGlnaGxpZ2h0U2VsZWN0ZWRCdXR0b25zKCk7XG4gICAgdGhpcy5zaG93KCk7XG5cbiAgICB0aGlzLiRlbC5jc3MoY29vcmRzKTtcbiAgfSxcblxuICBoaWdobGlnaHRTZWxlY3RlZEJ1dHRvbnM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmb3JtYXR0ZXI7XG4gICAgdGhpcy4kYnRucy5mb3JFYWNoKGZ1bmN0aW9uKCRidG4pIHtcbiAgICAgIGZvcm1hdHRlciA9IEZvcm1hdHRlcnNbJGJ0bi5hdHRyKCdkYXRhLXR5cGUnKV07XG4gICAgICAkYnRuLnRvZ2dsZUNsYXNzKFwic3QtZm9ybWF0LWJ0bi0taXMtYWN0aXZlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlci5pc0FjdGl2ZSgpKTtcbiAgICB9LCB0aGlzKTtcbiAgfSxcblxuICBvbkZvcm1hdEJ1dHRvbkNsaWNrOiBmdW5jdGlvbihldil7XG4gICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICB2YXIgYnRuID0gJChldi50YXJnZXQpLFxuICAgIGZvcm1hdCA9IEZvcm1hdHRlcnNbYnRuLmF0dHIoJ2RhdGEtdHlwZScpXTtcblxuICAgIGlmIChfLmlzVW5kZWZpbmVkKGZvcm1hdCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBEbyB3ZSBoYXZlIGEgY2xpY2sgZnVuY3Rpb24gZGVmaW5lZCBvbiB0aGlzIGZvcm1hdHRlcj9cbiAgICBpZighXy5pc1VuZGVmaW5lZChmb3JtYXQub25DbGljaykgJiYgXy5pc0Z1bmN0aW9uKGZvcm1hdC5vbkNsaWNrKSkge1xuICAgICAgZm9ybWF0Lm9uQ2xpY2soKTsgLy8gRGVsZWdhdGVcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ2FsbCBkZWZhdWx0XG4gICAgICBkb2N1bWVudC5leGVjQ29tbWFuZChidG4uYXR0cignZGF0YS1jbWQnKSwgZmFsc2UsIGZvcm1hdC5wYXJhbSk7XG4gICAgfVxuXG4gICAgdGhpcy5oaWdobGlnaHRTZWxlY3RlZEJ1dHRvbnMoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybWF0QmFyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcblxudmFyIEZvcm1hdHRlciA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICB0aGlzLmZvcm1hdElkID0gXy51bmlxdWVJZCgnZm9ybWF0LScpO1xuICB0aGlzLl9jb25maWd1cmUob3B0aW9ucyB8fCB7fSk7XG4gIHRoaXMuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxudmFyIGZvcm1hdE9wdGlvbnMgPSBbXCJ0aXRsZVwiLCBcImNsYXNzTmFtZVwiLCBcImNtZFwiLCBcImtleUNvZGVcIiwgXCJwYXJhbVwiLCBcIm9uQ2xpY2tcIiwgXCJ0b01hcmtkb3duXCIsIFwidG9IVE1MXCJdO1xuXG5PYmplY3QuYXNzaWduKEZvcm1hdHRlci5wcm90b3R5cGUsIHtcblxuICB0aXRsZTogJycsXG4gIGNsYXNzTmFtZTogJycsXG4gIGNtZDogbnVsbCxcbiAga2V5Q29kZTogbnVsbCxcbiAgcGFyYW06IG51bGwsXG5cbiAgdG9NYXJrZG93bjogZnVuY3Rpb24obWFya2Rvd24peyByZXR1cm4gbWFya2Rvd247IH0sXG4gIHRvSFRNTDogZnVuY3Rpb24oaHRtbCl7IHJldHVybiBodG1sOyB9LFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7fSxcblxuICBfY29uZmlndXJlOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gZm9ybWF0T3B0aW9ucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBhdHRyID0gZm9ybWF0T3B0aW9uc1tpXTtcbiAgICAgIGlmIChvcHRpb25zW2F0dHJdKSB7XG4gICAgICAgIHRoaXNbYXR0cl0gPSBvcHRpb25zW2F0dHJdO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB9LFxuXG4gIGlzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlDb21tYW5kU3RhdGUodGhpcy5jbWQpO1xuICB9LFxuXG4gIF9iaW5kVG9CbG9jazogZnVuY3Rpb24oYmxvY2spIHtcbiAgICB2YXIgZm9ybWF0dGVyID0gdGhpcyxcbiAgICBjdHJsRG93biA9IGZhbHNlO1xuXG4gICAgYmxvY2tcbiAgICAub24oJ2tleXVwJywnLnN0LXRleHQtYmxvY2snLCBmdW5jdGlvbihldikge1xuICAgICAgaWYoZXYud2hpY2ggPT09IDE3IHx8IGV2LndoaWNoID09PSAyMjQgfHwgZXYud2hpY2ggPT09IDkxKSB7XG4gICAgICAgIGN0cmxEb3duID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSlcbiAgICAub24oJ2tleWRvd24nLCcuc3QtdGV4dC1ibG9jaycsIHsgZm9ybWF0dGVyOiBmb3JtYXR0ZXIgfSwgZnVuY3Rpb24oZXYpIHtcbiAgICAgIGlmKGV2LndoaWNoID09PSAxNyB8fCBldi53aGljaCA9PT0gMjI0IHx8IGV2LndoaWNoID09PSA5MSkge1xuICAgICAgICBjdHJsRG93biA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmKGV2LndoaWNoID09PSBldi5kYXRhLmZvcm1hdHRlci5rZXlDb2RlICYmIGN0cmxEb3duID09PSB0cnVlKSB7XG4gICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKGV2LmRhdGEuZm9ybWF0dGVyLmNtZCwgZmFsc2UsIHRydWUpO1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjdHJsRG93biA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59KTtcblxuLy8gQWxsb3cgb3VyIEZvcm1hdHRlcnMgdG8gYmUgZXh0ZW5kZWQuXG5Gb3JtYXR0ZXIuZXh0ZW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2V4dGVuZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcm1hdHRlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBPdXIgYmFzZSBmb3JtYXR0ZXJzICovXG5cbnZhciBGb3JtYXR0ZXIgPSByZXF1aXJlKCcuL2Zvcm1hdHRlcicpO1xuXG52YXIgQm9sZCA9IEZvcm1hdHRlci5leHRlbmQoe1xuICB0aXRsZTogXCJib2xkXCIsXG4gIGNtZDogXCJib2xkXCIsXG4gIGtleUNvZGU6IDY2LFxuICB0ZXh0IDogXCJCXCJcbn0pO1xuXG52YXIgSXRhbGljID0gRm9ybWF0dGVyLmV4dGVuZCh7XG4gIHRpdGxlOiBcIml0YWxpY1wiLFxuICBjbWQ6IFwiaXRhbGljXCIsXG4gIGtleUNvZGU6IDczLFxuICB0ZXh0IDogXCJpXCJcbn0pO1xuXG52YXIgTGluayA9IEZvcm1hdHRlci5leHRlbmQoe1xuXG4gIHRpdGxlOiBcImxpbmtcIixcbiAgaWNvbk5hbWU6IFwibGlua1wiLFxuICBjbWQ6IFwiQ3JlYXRlTGlua1wiLFxuICB0ZXh0IDogXCJsaW5rXCIsXG5cbiAgb25DbGljazogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgbGluayA9IHdpbmRvdy5wcm9tcHQoaTE4bi50KFwiZ2VuZXJhbDpsaW5rXCIpKSxcbiAgICBsaW5rX3JlZ2V4ID0gLygoZnRwfGh0dHB8aHR0cHMpOlxcL1xcLy4pfG1haWx0byg/PVxcOlstXFwuXFx3XStAKS87XG5cbiAgICBpZihsaW5rICYmIGxpbmsubGVuZ3RoID4gMCkge1xuXG4gICAgICBpZiAoIWxpbmtfcmVnZXgudGVzdChsaW5rKSkge1xuICAgICAgICBsaW5rID0gXCJodHRwOi8vXCIgKyBsaW5rO1xuICAgICAgfVxuXG4gICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCh0aGlzLmNtZCwgZmFsc2UsIGxpbmspO1xuICAgIH1cbiAgfSxcblxuICBpc0FjdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKSxcbiAgICBub2RlO1xuXG4gICAgaWYgKHNlbGVjdGlvbi5yYW5nZUNvdW50ID4gMCkge1xuICAgICAgbm9kZSA9IHNlbGVjdGlvbi5nZXRSYW5nZUF0KDApXG4gICAgICAuc3RhcnRDb250YWluZXJcbiAgICAgIC5wYXJlbnROb2RlO1xuICAgIH1cblxuICAgIHJldHVybiAobm9kZSAmJiBub2RlLm5vZGVOYW1lID09PSBcIkFcIik7XG4gIH1cbn0pO1xuXG52YXIgVW5MaW5rID0gRm9ybWF0dGVyLmV4dGVuZCh7XG4gIHRpdGxlOiBcInVubGlua1wiLFxuICBpY29uTmFtZTogXCJsaW5rXCIsXG4gIGNtZDogXCJ1bmxpbmtcIixcbiAgdGV4dCA6IFwibGlua1wiXG59KTtcblxuXG5leHBvcnRzLkJvbGQgPSBuZXcgQm9sZCgpO1xuZXhwb3J0cy5JdGFsaWMgPSBuZXcgSXRhbGljKCk7XG5leHBvcnRzLkxpbmsgPSBuZXcgTGluaygpO1xuZXhwb3J0cy5VbmxpbmsgPSBuZXcgVW5MaW5rKCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLyogR2VuZXJpYyBmdW5jdGlvbiBiaW5kaW5nIHV0aWxpdHksIHVzZWQgYnkgbG90cyBvZiBvdXIgY2xhc3NlcyAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYm91bmQ6IFtdLFxuICBfYmluZEZ1bmN0aW9uczogZnVuY3Rpb24oKXtcbiAgICB0aGlzLmJvdW5kLmZvckVhY2goZnVuY3Rpb24oZikge1xuICAgICAgdGhpc1tmXSA9IHRoaXNbZl0uYmluZCh0aGlzKTtcbiAgICB9LCB0aGlzKTtcbiAgfVxufTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gKiBEcm9wIEFyZWEgUGx1Z2luIGZyb20gQG1hY2NtYW5cbiAqIGh0dHA6Ly9ibG9nLmFsZXhtYWNjYXcuY29tL3N2YnRsZS1pbWFnZS11cGxvYWRpbmdcbiAqIC0tXG4gKiBUd2Vha2VkIHNvIHdlIHVzZSB0aGUgcGFyZW50IGNsYXNzIG9mIGRyb3B6b25lXG4gKi9cblxuXG5mdW5jdGlvbiBkcmFnRW50ZXIoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59XG5cbmZ1bmN0aW9uIGRyYWdPdmVyKGUpIHtcbiAgZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gXCJjb3B5XCI7XG4gICQoZS5jdXJyZW50VGFyZ2V0KS5hZGRDbGFzcygnc3QtZHJhZy1vdmVyJyk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbn1cblxuZnVuY3Rpb24gZHJhZ0xlYXZlKGUpIHtcbiAgJChlLmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzKCdzdC1kcmFnLW92ZXInKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG4kLmZuLmRyb3BBcmVhID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5iaW5kKFwiZHJhZ2VudGVyXCIsIGRyYWdFbnRlcikuXG4gICAgYmluZChcImRyYWdvdmVyXCIsICBkcmFnT3ZlcikuXG4gICAgYmluZChcImRyYWdsZWF2ZVwiLCBkcmFnTGVhdmUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbiQuZm4ubm9Ecm9wQXJlYSA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMudW5iaW5kKFwiZHJhZ2VudGVyXCIpLlxuICAgIHVuYmluZChcImRyYWdvdmVyXCIpLlxuICAgIHVuYmluZChcImRyYWdsZWF2ZVwiKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4kLmZuLmNhcmV0VG9FbmQgPSBmdW5jdGlvbigpe1xuICB2YXIgcmFuZ2Usc2VsZWN0aW9uO1xuXG4gIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKHRoaXNbMF0pO1xuICByYW5nZS5jb2xsYXBzZShmYWxzZSk7XG5cbiAgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gIHNlbGVjdGlvbi5hZGRSYW5nZShyYW5nZSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgQmFja2JvbmUgSW5oZXJpdGVuY2UgXG4gIC0tXG4gIEZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS9kb2N1bWVudGNsb3VkL2JhY2tib25lL2Jsb2IvbWFzdGVyL2JhY2tib25lLmpzXG4gIEJhY2tib25lLmpzIDAuOS4yXG4gIChjKSAyMDEwLTIwMTIgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIEluYy5cbiovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgdmFyIHBhcmVudCA9IHRoaXM7XG4gIHZhciBjaGlsZDtcblxuICAvLyBUaGUgY29uc3RydWN0b3IgZnVuY3Rpb24gZm9yIHRoZSBuZXcgc3ViY2xhc3MgaXMgZWl0aGVyIGRlZmluZWQgYnkgeW91XG4gIC8vICh0aGUgXCJjb25zdHJ1Y3RvclwiIHByb3BlcnR5IGluIHlvdXIgYGV4dGVuZGAgZGVmaW5pdGlvbiksIG9yIGRlZmF1bHRlZFxuICAvLyBieSB1cyB0byBzaW1wbHkgY2FsbCB0aGUgcGFyZW50J3MgY29uc3RydWN0b3IuXG4gIGlmIChwcm90b1Byb3BzICYmIHByb3RvUHJvcHMuaGFzT3duUHJvcGVydHkoJ2NvbnN0cnVjdG9yJykpIHtcbiAgICBjaGlsZCA9IHByb3RvUHJvcHMuY29uc3RydWN0b3I7XG4gIH0gZWxzZSB7XG4gICAgY2hpbGQgPSBmdW5jdGlvbigpeyByZXR1cm4gcGFyZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gIH1cblxuICAvLyBBZGQgc3RhdGljIHByb3BlcnRpZXMgdG8gdGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLCBpZiBzdXBwbGllZC5cbiAgT2JqZWN0LmFzc2lnbihjaGlsZCwgcGFyZW50LCBzdGF0aWNQcm9wcyk7XG5cbiAgLy8gU2V0IHRoZSBwcm90b3R5cGUgY2hhaW4gdG8gaW5oZXJpdCBmcm9tIGBwYXJlbnRgLCB3aXRob3V0IGNhbGxpbmdcbiAgLy8gYHBhcmVudGAncyBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cbiAgdmFyIFN1cnJvZ2F0ZSA9IGZ1bmN0aW9uKCl7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfTtcbiAgU3Vycm9nYXRlLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7XG4gIGNoaWxkLnByb3RvdHlwZSA9IG5ldyBTdXJyb2dhdGU7IC8vIGpzaGludCBpZ25vcmU6bGluZVxuXG4gIC8vIEFkZCBwcm90b3R5cGUgcHJvcGVydGllcyAoaW5zdGFuY2UgcHJvcGVydGllcykgdG8gdGhlIHN1YmNsYXNzLFxuICAvLyBpZiBzdXBwbGllZC5cbiAgaWYgKHByb3RvUHJvcHMpIHtcbiAgICBPYmplY3QuYXNzaWduKGNoaWxkLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gIH1cblxuICAvLyBTZXQgYSBjb252ZW5pZW5jZSBwcm9wZXJ0eSBpbiBjYXNlIHRoZSBwYXJlbnQncyBwcm90b3R5cGUgaXMgbmVlZGVkXG4gIC8vIGxhdGVyLlxuICBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlO1xuXG4gIHJldHVybiBjaGlsZDtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xuXG5yZXF1aXJlKCdlczYtc2hpbScpOyAvLyBidW5kbGluZyBpbiBmb3IgdGhlIG1vbWVudCBhcyBzdXBwb3J0IGlzIHZlcnkgcmFyZVxucmVxdWlyZSgnLi9oZWxwZXJzL2V2ZW50Jyk7IC8vIGV4dGVuZHMgalF1ZXJ5IGl0c2VsZlxucmVxdWlyZSgnLi92ZW5kb3IvYXJyYXktaW5jbHVkZXMnKTsgLy8gc2hpbXMgRVM3IEFycmF5LnByb3RvdHlwZS5pbmNsdWRlc1xuXG52YXIgU2lyVHJldm9yID0ge1xuXG4gIGNvbmZpZzogcmVxdWlyZSgnLi9jb25maWcnKSxcblxuICBsb2c6IHJlcXVpcmUoJy4vdXRpbHMnKS5sb2csXG4gIExvY2FsZXM6IHJlcXVpcmUoJy4vbG9jYWxlcycpLFxuXG4gIEV2ZW50czogcmVxdWlyZSgnLi9ldmVudHMnKSxcbiAgRXZlbnRCdXM6IHJlcXVpcmUoJy4vZXZlbnQtYnVzJyksXG5cbiAgRWRpdG9yU3RvcmU6IHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9lZGl0b3Itc3RvcmUnKSxcbiAgU3VibWl0dGFibGU6IHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9zdWJtaXR0YWJsZScpLFxuICBGaWxlVXBsb2FkZXI6IHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9maWxlLXVwbG9hZGVyJyksXG5cbiAgQmxvY2tNaXhpbnM6IHJlcXVpcmUoJy4vYmxvY2tfbWl4aW5zJyksXG4gIEJsb2NrUG9zaXRpb25lcjogcmVxdWlyZSgnLi9ibG9jay1wb3NpdGlvbmVyJyksXG4gIEJsb2NrUmVvcmRlcjogcmVxdWlyZSgnLi9ibG9jay1yZW9yZGVyJyksXG4gIEJsb2NrRGVsZXRpb246IHJlcXVpcmUoJy4vYmxvY2stZGVsZXRpb24nKSxcbiAgQmxvY2tWYWxpZGF0aW9uczogcmVxdWlyZSgnLi9ibG9jay12YWxpZGF0aW9ucycpLFxuICBCbG9ja1N0b3JlOiByZXF1aXJlKCcuL2Jsb2NrLXN0b3JlJyksXG4gIEJsb2NrTWFuYWdlcjogcmVxdWlyZSgnLi9ibG9jay1tYW5hZ2VyJyksXG5cbiAgU2ltcGxlQmxvY2s6IHJlcXVpcmUoJy4vc2ltcGxlLWJsb2NrJyksXG4gIEJsb2NrOiByZXF1aXJlKCcuL2Jsb2NrJyksXG4gIEZvcm1hdHRlcjogcmVxdWlyZSgnLi9mb3JtYXR0ZXInKSxcbiAgRm9ybWF0dGVyczogcmVxdWlyZSgnLi9mb3JtYXR0ZXJzJyksXG5cbiAgQmxvY2tzOiByZXF1aXJlKCcuL2Jsb2NrcycpLFxuXG4gIEJsb2NrQ29udHJvbDogcmVxdWlyZSgnLi9ibG9jay1jb250cm9sJyksXG4gIEJsb2NrQ29udHJvbHM6IHJlcXVpcmUoJy4vYmxvY2stY29udHJvbHMnKSxcbiAgRmxvYXRpbmdCbG9ja0NvbnRyb2xzOiByZXF1aXJlKCcuL2Zsb2F0aW5nLWJsb2NrLWNvbnRyb2xzJyksXG5cbiAgRm9ybWF0QmFyOiByZXF1aXJlKCcuL2Zvcm1hdC1iYXInKSxcbiAgRWRpdG9yOiByZXF1aXJlKCcuL2VkaXRvcicpLFxuXG4gIHRvTWFya2Rvd246IHJlcXVpcmUoJy4vdG8tbWFya2Rvd24nKSxcbiAgdG9IVE1MOiByZXF1aXJlKCcuL3RvLWh0bWwnKSxcblxuICBzZXREZWZhdWx0czogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIE9iamVjdC5hc3NpZ24oU2lyVHJldm9yLmNvbmZpZy5kZWZhdWx0cywgb3B0aW9ucyB8fCB7fSk7XG4gIH0sXG5cbiAgZ2V0SW5zdGFuY2U6IGZ1bmN0aW9uKGlkZW50aWZpZXIpIHtcbiAgICBpZiAoXy5pc1VuZGVmaW5lZChpZGVudGlmaWVyKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLmluc3RhbmNlc1swXTtcbiAgICB9XG5cbiAgICBpZiAoXy5pc1N0cmluZyhpZGVudGlmaWVyKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLmluc3RhbmNlcy5maW5kKGZ1bmN0aW9uKGVkaXRvcikge1xuICAgICAgICByZXR1cm4gZWRpdG9yLklEID09PSBpZGVudGlmaWVyO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLmluc3RhbmNlc1tpZGVudGlmaWVyXTtcbiAgfSxcblxuICBzZXRCbG9ja09wdGlvbnM6IGZ1bmN0aW9uKHR5cGUsIG9wdGlvbnMpIHtcbiAgICB2YXIgYmxvY2sgPSBTaXJUcmV2b3IuQmxvY2tzW3R5cGVdO1xuXG4gICAgaWYgKF8uaXNVbmRlZmluZWQoYmxvY2spKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgT2JqZWN0LmFzc2lnbihibG9jay5wcm90b3R5cGUsIG9wdGlvbnMgfHwge30pO1xuICB9LFxuXG4gIHJ1bk9uQWxsSW5zdGFuY2VzOiBmdW5jdGlvbihtZXRob2QpIHtcbiAgICBpZiAoU2lyVHJldm9yLkVkaXRvci5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgdmFyIG1ldGhvZEFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChTaXJUcmV2b3IuY29uZmlnLmluc3RhbmNlcywgZnVuY3Rpb24oaSkge1xuICAgICAgICBpW21ldGhvZF0uYXBwbHkobnVsbCwgbWV0aG9kQXJncyk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgU2lyVHJldm9yLmxvZyhcIm1ldGhvZCBkb2Vzbid0IGV4aXN0XCIpO1xuICAgIH1cbiAgfSxcblxufTtcblxuT2JqZWN0LmFzc2lnbihTaXJUcmV2b3IsIHJlcXVpcmUoJy4vZm9ybS1ldmVudHMnKSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBTaXJUcmV2b3I7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBMb2NhbGVzID0ge1xuICBlbjoge1xuICAgIGdlbmVyYWw6IHtcbiAgICAgICdkZWxldGUnOiAgICAgICAgICAgJ0RlbGV0ZT8nLFxuICAgICAgJ2Ryb3AnOiAgICAgICAgICAgICAnRHJhZyBfX2Jsb2NrX18gaGVyZScsXG4gICAgICAncGFzdGUnOiAgICAgICAgICAgICdPciBwYXN0ZSBVUkwgaGVyZScsXG4gICAgICAndXBsb2FkJzogICAgICAgICAgICcuLi5vciBjaG9vc2UgYSBmaWxlJyxcbiAgICAgICdjbG9zZSc6ICAgICAgICAgICAgJ2Nsb3NlJyxcbiAgICAgICdwb3NpdGlvbic6ICAgICAgICAgJ1Bvc2l0aW9uJyxcbiAgICAgICd3YWl0JzogICAgICAgICAgICAgJ1BsZWFzZSB3YWl0Li4uJyxcbiAgICAgICdsaW5rJzogICAgICAgICAgICAgJ0VudGVyIGEgbGluaydcbiAgICB9LFxuICAgIGVycm9yczoge1xuICAgICAgJ3RpdGxlJzogXCJZb3UgaGF2ZSB0aGUgZm9sbG93aW5nIGVycm9yczpcIixcbiAgICAgICd2YWxpZGF0aW9uX2ZhaWwnOiBcIl9fdHlwZV9fIGJsb2NrIGlzIGludmFsaWRcIixcbiAgICAgICdibG9ja19lbXB0eSc6IFwiX19uYW1lX18gbXVzdCBub3QgYmUgZW1wdHlcIixcbiAgICAgICd0eXBlX21pc3NpbmcnOiBcIllvdSBtdXN0IGhhdmUgYSBibG9jayBvZiB0eXBlIF9fdHlwZV9fXCIsXG4gICAgICAncmVxdWlyZWRfdHlwZV9lbXB0eSc6IFwiQSByZXF1aXJlZCBibG9jayB0eXBlIF9fdHlwZV9fIGlzIGVtcHR5XCIsXG4gICAgICAnbG9hZF9mYWlsJzogXCJUaGVyZSB3YXMgYSBwcm9ibGVtIGxvYWRpbmcgdGhlIGNvbnRlbnRzIG9mIHRoZSBkb2N1bWVudFwiXG4gICAgfSxcbiAgICBibG9ja3M6IHtcbiAgICAgIHRleHQ6IHtcbiAgICAgICAgJ3RpdGxlJzogXCJUZXh0XCJcbiAgICAgIH0sXG4gICAgICBsaXN0OiB7XG4gICAgICAgICd0aXRsZSc6IFwiTGlzdFwiXG4gICAgICB9LFxuICAgICAgcXVvdGU6IHtcbiAgICAgICAgJ3RpdGxlJzogXCJRdW90ZVwiLFxuICAgICAgICAnY3JlZGl0X2ZpZWxkJzogXCJDcmVkaXRcIlxuICAgICAgfSxcbiAgICAgIGltYWdlOiB7XG4gICAgICAgICd0aXRsZSc6IFwiSW1hZ2VcIixcbiAgICAgICAgJ3VwbG9hZF9lcnJvcic6IFwiVGhlcmUgd2FzIGEgcHJvYmxlbSB3aXRoIHlvdXIgdXBsb2FkXCJcbiAgICAgIH0sXG4gICAgICB2aWRlbzoge1xuICAgICAgICAndGl0bGUnOiBcIlZpZGVvXCJcbiAgICAgIH0sXG4gICAgICB0d2VldDoge1xuICAgICAgICAndGl0bGUnOiBcIlR3ZWV0XCIsXG4gICAgICAgICdmZXRjaF9lcnJvcic6IFwiVGhlcmUgd2FzIGEgcHJvYmxlbSBmZXRjaGluZyB5b3VyIHR3ZWV0XCJcbiAgICAgIH0sXG4gICAgICBlbWJlZGx5OiB7XG4gICAgICAgICd0aXRsZSc6IFwiRW1iZWRseVwiLFxuICAgICAgICAnZmV0Y2hfZXJyb3InOiBcIlRoZXJlIHdhcyBhIHByb2JsZW0gZmV0Y2hpbmcgeW91ciBlbWJlZFwiLFxuICAgICAgICAna2V5X21pc3NpbmcnOiBcIkFuIEVtYmVkbHkgQVBJIGtleSBtdXN0IGJlIHByZXNlbnRcIlxuICAgICAgfSxcbiAgICAgIGhlYWRpbmc6IHtcbiAgICAgICAgJ3RpdGxlJzogXCJIZWFkaW5nXCJcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbmlmICh3aW5kb3cuaTE4biA9PT0gdW5kZWZpbmVkKSB7XG4gIC8vIE1pbmltYWwgaTE4biBzdHViIHRoYXQgb25seSByZWFkcyB0aGUgRW5nbGlzaCBzdHJpbmdzXG4gIHV0aWxzLmxvZyhcIlVzaW5nIGkxOG4gc3R1YlwiKTtcbiAgd2luZG93LmkxOG4gPSB7XG4gICAgdDogZnVuY3Rpb24oa2V5LCBvcHRpb25zKSB7XG4gICAgICB2YXIgcGFydHMgPSBrZXkuc3BsaXQoJzonKSwgc3RyLCBvYmosIHBhcnQsIGk7XG5cbiAgICAgIG9iaiA9IExvY2FsZXNbY29uZmlnLmxhbmd1YWdlXTtcblxuICAgICAgZm9yKGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcGFydCA9IHBhcnRzW2ldO1xuXG4gICAgICAgIGlmKCFfLmlzVW5kZWZpbmVkKG9ialtwYXJ0XSkpIHtcbiAgICAgICAgICBvYmogPSBvYmpbcGFydF07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3RyID0gb2JqO1xuXG4gICAgICBpZiAoIV8uaXNTdHJpbmcoc3RyKSkgeyByZXR1cm4gXCJcIjsgfVxuXG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ19fJykgPj0gMCkge1xuICAgICAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uKG9wdCkge1xuICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKCdfXycgKyBvcHQgKyAnX18nLCBvcHRpb25zW29wdF0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gIH07XG59IGVsc2Uge1xuICB1dGlscy5sb2coXCJVc2luZyBpMThuZXh0XCIpO1xuICAvLyBPbmx5IHVzZSBpMThuZXh0IHdoZW4gdGhlIGxpYnJhcnkgaGFzIGJlZW4gbG9hZGVkIGJ5IHRoZSB1c2VyLCBrZWVwc1xuICAvLyBkZXBlbmRlbmNpZXMgc2xpbVxuICBpMThuLmluaXQoeyByZXNTdG9yZTogTG9jYWxlcywgZmFsbGJhY2tMbmc6IGNvbmZpZy5sYW5ndWFnZSxcbiAgICAgICAgICAgIG5zOiB7IG5hbWVzcGFjZXM6IFsnZ2VuZXJhbCcsICdibG9ja3MnXSwgZGVmYXVsdE5zOiAnZ2VuZXJhbCcgfVxuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMb2NhbGVzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuaXNFbXB0eSA9IHJlcXVpcmUoJ2xvZGFzaC5pc2VtcHR5Jyk7XG5leHBvcnRzLmlzRnVuY3Rpb24gPSByZXF1aXJlKCdsb2Rhc2guaXNmdW5jdGlvbicpO1xuZXhwb3J0cy5pc09iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC5pc29iamVjdCcpO1xuZXhwb3J0cy5pc1N0cmluZyA9IHJlcXVpcmUoJ2xvZGFzaC5pc3N0cmluZycpO1xuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IHJlcXVpcmUoJ2xvZGFzaC5pc3VuZGVmaW5lZCcpO1xuZXhwb3J0cy5yZXN1bHQgPSByZXF1aXJlKCdsb2Rhc2gucmVzdWx0Jyk7XG5leHBvcnRzLnRlbXBsYXRlID0gcmVxdWlyZSgnbG9kYXNoLnRlbXBsYXRlJyk7XG5leHBvcnRzLnVuaXF1ZUlkID0gcmVxdWlyZSgnbG9kYXNoLnVuaXF1ZWlkJyk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1lZGlhdGVkRXZlbnRzOiB7fSxcbiAgZXZlbnROYW1lc3BhY2U6IG51bGwsXG4gIF9iaW5kTWVkaWF0ZWRFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMubWVkaWF0ZWRFdmVudHMpLmZvckVhY2goZnVuY3Rpb24oZXZlbnROYW1lKXtcbiAgICAgIHZhciBjYiA9IHRoaXMubWVkaWF0ZWRFdmVudHNbZXZlbnROYW1lXTtcbiAgICAgIGV2ZW50TmFtZSA9IHRoaXMuZXZlbnROYW1lc3BhY2UgP1xuICAgICAgICB0aGlzLmV2ZW50TmFtZXNwYWNlICsgJzonICsgZXZlbnROYW1lIDpcbiAgICAgICAgZXZlbnROYW1lO1xuICAgICAgdGhpcy5tZWRpYXRvci5vbihldmVudE5hbWUsIHRoaXNbY2JdLmJpbmQodGhpcykpO1xuICAgIH0sIHRoaXMpO1xuICB9XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHRhZ05hbWU6ICdkaXYnLFxuICBjbGFzc05hbWU6ICdzaXItdHJldm9yX192aWV3JyxcbiAgYXR0cmlidXRlczoge30sXG5cbiAgJDogZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gdGhpcy4kZWwuZmluZChzZWxlY3Rvcik7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIV8uaXNVbmRlZmluZWQodGhpcy5zdG9wTGlzdGVuaW5nKSkgeyB0aGlzLnN0b3BMaXN0ZW5pbmcoKTsgfVxuICAgIHRoaXMuJGVsLnJlbW92ZSgpO1xuICB9LFxuXG4gIF9lbnN1cmVFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuZWwpIHtcbiAgICAgIHZhciBhdHRycyA9IE9iamVjdC5hc3NpZ24oe30sIF8ucmVzdWx0KHRoaXMsICdhdHRyaWJ1dGVzJykpLFxuICAgICAgaHRtbDtcbiAgICAgIGlmICh0aGlzLmlkKSB7IGF0dHJzLmlkID0gdGhpcy5pZDsgfVxuICAgICAgaWYgKHRoaXMuY2xhc3NOYW1lKSB7IGF0dHJzWydjbGFzcyddID0gdGhpcy5jbGFzc05hbWU7IH1cblxuICAgICAgaWYgKGF0dHJzLmh0bWwpIHtcbiAgICAgICAgaHRtbCA9IGF0dHJzLmh0bWw7XG4gICAgICAgIGRlbGV0ZSBhdHRycy5odG1sO1xuICAgICAgfVxuICAgICAgdmFyICRlbCA9ICQoJzwnICsgdGhpcy50YWdOYW1lICsgJz4nKS5hdHRyKGF0dHJzKTtcbiAgICAgIGlmIChodG1sKSB7ICRlbC5odG1sKGh0bWwpOyB9XG4gICAgICB0aGlzLl9zZXRFbGVtZW50KCRlbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NldEVsZW1lbnQodGhpcy5lbCk7XG4gICAgfVxuICB9LFxuXG4gIF9zZXRFbGVtZW50OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgdGhpcy4kZWwgPSAkKGVsZW1lbnQpO1xuICAgIHRoaXMuZWwgPSB0aGlzLiRlbFswXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZSgnLi9sb2Rhc2gnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIEJsb2NrUmVvcmRlciA9IHJlcXVpcmUoJy4vYmxvY2stcmVvcmRlcicpO1xuXG52YXIgU2ltcGxlQmxvY2sgPSBmdW5jdGlvbihkYXRhLCBpbnN0YW5jZV9pZCwgbWVkaWF0b3IpIHtcbiAgdGhpcy5jcmVhdGVTdG9yZShkYXRhKTtcbiAgdGhpcy5ibG9ja0lEID0gXy51bmlxdWVJZCgnc3QtYmxvY2stJyk7XG4gIHRoaXMuaW5zdGFuY2VJRCA9IGluc3RhbmNlX2lkO1xuICB0aGlzLm1lZGlhdG9yID0gbWVkaWF0b3I7XG5cbiAgdGhpcy5fZW5zdXJlRWxlbWVudCgpO1xuICB0aGlzLl9iaW5kRnVuY3Rpb25zKCk7XG5cbiAgdGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG5PYmplY3QuYXNzaWduKFNpbXBsZUJsb2NrLnByb3RvdHlwZSwgcmVxdWlyZSgnLi9mdW5jdGlvbi1iaW5kJyksIHJlcXVpcmUoJy4vZXZlbnRzJyksIHJlcXVpcmUoJy4vcmVuZGVyYWJsZScpLCByZXF1aXJlKCcuL2Jsb2NrLXN0b3JlJyksIHtcblxuICBmb2N1cyA6IGZ1bmN0aW9uKCkge30sXG5cbiAgdmFsaWQgOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRydWU7IH0sXG5cbiAgY2xhc3NOYW1lOiAnc3QtYmxvY2snLFxuXG4gIGJsb2NrX3RlbXBsYXRlOiBfLnRlbXBsYXRlKFxuICAgIFwiPGRpdiBjbGFzcz0nc3QtYmxvY2tfX2lubmVyJz48JT0gZWRpdG9yX2h0bWwgJT48L2Rpdj5cIlxuICApLFxuXG4gIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAnaWQnOiB0aGlzLmJsb2NrSUQsXG4gICAgICAnZGF0YS10eXBlJzogdGhpcy50eXBlLFxuICAgICAgJ2RhdGEtaW5zdGFuY2UnOiB0aGlzLmluc3RhbmNlSURcbiAgICB9O1xuICB9LFxuXG4gIHRpdGxlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdXRpbHMudGl0bGVpemUodGhpcy50eXBlLnJlcGxhY2UoL1tcXFdfXS9nLCAnICcpKTtcbiAgfSxcblxuICBibG9ja0NTU0NsYXNzOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmJsb2NrQ1NTQ2xhc3MgPSB1dGlscy50b1NsdWcodGhpcy50eXBlKTtcbiAgICByZXR1cm4gdGhpcy5ibG9ja0NTU0NsYXNzO1xuICB9LFxuXG4gIHR5cGU6ICcnLFxuXG4gIGNsYXNzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdXRpbHMuY2xhc3NpZnkodGhpcy50eXBlKTtcbiAgfSxcblxuICBlZGl0b3JIVE1MOiAnJyxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHt9LFxuXG4gIG9uQmxvY2tSZW5kZXI6IGZ1bmN0aW9uKCl7fSxcbiAgYmVmb3JlQmxvY2tSZW5kZXI6IGZ1bmN0aW9uKCl7fSxcblxuICBfc2V0QmxvY2tJbm5lciA6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlZGl0b3JfaHRtbCA9IF8ucmVzdWx0KHRoaXMsICdlZGl0b3JIVE1MJyk7XG5cbiAgICB0aGlzLiRlbC5hcHBlbmQoXG4gICAgICB0aGlzLmJsb2NrX3RlbXBsYXRlKHsgZWRpdG9yX2h0bWw6IGVkaXRvcl9odG1sIH0pXG4gICAgKTtcblxuICAgIHRoaXMuJGlubmVyID0gdGhpcy4kZWwuZmluZCgnLnN0LWJsb2NrX19pbm5lcicpO1xuICAgIHRoaXMuJGlubmVyLmJpbmQoJ2NsaWNrIG1vdXNlb3ZlcicsIGZ1bmN0aW9uKGUpeyBlLnN0b3BQcm9wYWdhdGlvbigpOyB9KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYmVmb3JlQmxvY2tSZW5kZXIoKTtcblxuICAgIHRoaXMuX3NldEJsb2NrSW5uZXIoKTtcbiAgICB0aGlzLl9ibG9ja1ByZXBhcmUoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIF9ibG9ja1ByZXBhcmUgOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9pbml0VUkoKTtcbiAgICB0aGlzLl9pbml0TWVzc2FnZXMoKTtcblxuICAgIHRoaXMuY2hlY2tBbmRMb2FkRGF0YSgpO1xuXG4gICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ3N0LWl0ZW0tcmVhZHknKTtcbiAgICB0aGlzLm9uKFwib25SZW5kZXJcIiwgdGhpcy5vbkJsb2NrUmVuZGVyKTtcbiAgICB0aGlzLnNhdmUoKTtcbiAgfSxcblxuICBfd2l0aFVJQ29tcG9uZW50OiBmdW5jdGlvbihjb21wb25lbnQsIGNsYXNzTmFtZSwgY2FsbGJhY2spIHtcbiAgICB0aGlzLiR1aS5hcHBlbmQoY29tcG9uZW50LnJlbmRlcigpLiRlbCk7XG4gICAgaWYgKGNsYXNzTmFtZSAmJiBjYWxsYmFjaykge1xuICAgICAgdGhpcy4kdWkub24oJ2NsaWNrJywgY2xhc3NOYW1lLCBjYWxsYmFjayk7XG4gICAgfVxuICB9LFxuXG4gIF9pbml0VUkgOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdWlfZWxlbWVudCA9ICQoXCI8ZGl2PlwiLCB7ICdjbGFzcyc6ICdzdC1ibG9ja19fdWknIH0pO1xuICAgIHRoaXMuJGlubmVyLmFwcGVuZCh1aV9lbGVtZW50KTtcbiAgICB0aGlzLiR1aSA9IHVpX2VsZW1lbnQ7XG4gICAgdGhpcy5faW5pdFVJQ29tcG9uZW50cygpO1xuICB9LFxuXG4gIF9pbml0TWVzc2FnZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtc2dzX2VsZW1lbnQgPSAkKFwiPGRpdj5cIiwgeyAnY2xhc3MnOiAnc3QtYmxvY2tfX21lc3NhZ2VzJyB9KTtcbiAgICB0aGlzLiRpbm5lci5wcmVwZW5kKG1zZ3NfZWxlbWVudCk7XG4gICAgdGhpcy4kbWVzc2FnZXMgPSBtc2dzX2VsZW1lbnQ7XG4gIH0sXG5cbiAgYWRkTWVzc2FnZTogZnVuY3Rpb24obXNnLCBhZGRpdGlvbmFsQ2xhc3MpIHtcbiAgICB2YXIgJG1zZyA9ICQoXCI8c3Bhbj5cIiwgeyBodG1sOiBtc2csIGNsYXNzOiBcInN0LW1zZyBcIiArIGFkZGl0aW9uYWxDbGFzcyB9KTtcbiAgICB0aGlzLiRtZXNzYWdlcy5hcHBlbmQoJG1zZylcbiAgICAuYWRkQ2xhc3MoJ3N0LWJsb2NrX19tZXNzYWdlcy0taXMtdmlzaWJsZScpO1xuICAgIHJldHVybiAkbXNnO1xuICB9LFxuXG4gIHJlc2V0TWVzc2FnZXM6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJG1lc3NhZ2VzLmh0bWwoJycpXG4gICAgLnJlbW92ZUNsYXNzKCdzdC1ibG9ja19fbWVzc2FnZXMtLWlzLXZpc2libGUnKTtcbiAgfSxcblxuICBfaW5pdFVJQ29tcG9uZW50czogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fd2l0aFVJQ29tcG9uZW50KG5ldyBCbG9ja1Jlb3JkZXIodGhpcy4kZWwpKTtcbiAgfVxuXG59KTtcblxuU2ltcGxlQmxvY2suZm4gPSBTaW1wbGVCbG9jay5wcm90b3R5cGU7XG5cbi8vIEFsbG93IG91ciBCbG9jayB0byBiZSBleHRlbmRlZC5cblNpbXBsZUJsb2NrLmV4dGVuZCA9IHJlcXVpcmUoJy4vaGVscGVycy9leHRlbmQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVCbG9jaztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vbG9kYXNoJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obWFya2Rvd24sIHR5cGUpIHtcblxuICAvLyBEZWZlcnJpbmcgcmVxdWlyaW5nIHRoZXNlIHRvIHNpZGVzdGVwIGEgY2lyY3VsYXIgZGVwZW5kZW5jeTpcbiAgLy8gQmxvY2sgLT4gdGhpcyAtPiBCbG9ja3MgLT4gQmxvY2tcbiAgdmFyIEJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG4gIHZhciBGb3JtYXR0ZXJzID0gcmVxdWlyZSgnLi9mb3JtYXR0ZXJzJyk7XG5cbiAgLy8gTUQgLT4gSFRNTFxuICB0eXBlID0gdXRpbHMuY2xhc3NpZnkodHlwZSk7XG5cbiAgdmFyIGh0bWwgPSBtYXJrZG93bixcbiAgICAgIHNob3VsZFdyYXAgPSB0eXBlID09PSBcIlRleHRcIjtcblxuICBpZihfLmlzVW5kZWZpbmVkKHNob3VsZFdyYXApKSB7IHNob3VsZFdyYXAgPSBmYWxzZTsgfVxuXG4gIGlmIChzaG91bGRXcmFwKSB7XG4gICAgaHRtbCA9IFwiPGRpdj5cIiArIGh0bWw7XG4gIH1cblxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXFsoW15cXF1dKylcXF1cXCgoW15cXCldKylcXCkvZ20sZnVuY3Rpb24obWF0Y2gsIHAxLCBwMil7XG4gICAgcmV0dXJuIFwiPGEgaHJlZj0nXCIrcDIrXCInPlwiK3AxLnJlcGxhY2UoL1xcbi9nLCAnJykrXCI8L2E+XCI7XG4gIH0pO1xuXG4gIC8vIFRoaXMgbWF5IHNlZW0gY3JhenksIGJ1dCBiZWNhdXNlIEpTIGRvZXNuJ3QgaGF2ZSBhIGxvb2sgYmVoaW5kLFxuICAvLyB3ZSByZXZlcnNlIHRoZSBzdHJpbmcgdG8gcmVnZXggb3V0IHRoZSBpdGFsaWMgaXRlbXMgKGFuZCBib2xkKVxuICAvLyBhbmQgbG9vayBmb3Igc29tZXRoaW5nIHRoYXQgZG9lc24ndCBzdGFydCAob3IgZW5kIGluIHRoZSByZXZlcnNlZCBzdHJpbmdzIGNhc2UpXG4gIC8vIHdpdGggYSBzbGFzaC5cbiAgaHRtbCA9IHV0aWxzLnJldmVyc2UoXG4gICAgICAgICAgIHV0aWxzLnJldmVyc2UoaHRtbClcbiAgICAgICAgICAgLnJlcGxhY2UoL18oPyFcXFxcKSgoX1xcXFx8W15fXSkqKV8oPz0kfFteXFxcXF0pL2dtLCBmdW5jdGlvbihtYXRjaCwgcDEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiPmkvPFwiKyBwMS5yZXBsYWNlKC9cXG4vZywgJycpLnJlcGxhY2UoL1tcXHNdKyQvLCcnKSArXCI+aTxcIjtcbiAgICAgICAgICAgfSlcbiAgICAgICAgICAgLnJlcGxhY2UoL1xcKlxcKig/IVxcXFwpKChcXCpcXCpcXFxcfFteXFwqXFwqXSkqKVxcKlxcKig/PSR8W15cXFxcXSkvZ20sIGZ1bmN0aW9uKG1hdGNoLCBwMSl7XG4gICAgICAgICAgICAgIHJldHVybiBcIj5iLzxcIisgcDEucmVwbGFjZSgvXFxuL2csICcnKS5yZXBsYWNlKC9bXFxzXSskLywnJykgK1wiPmI8XCI7XG4gICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcblxuICBodG1sID0gIGh0bWwucmVwbGFjZSgvXlxcPiAoLispJC9tZyxcIiQxXCIpO1xuXG4gIC8vIFVzZSBjdXN0b20gZm9ybWF0dGVycyB0b0hUTUwgZnVuY3Rpb25zIChpZiBhbnkgZXhpc3QpXG4gIHZhciBmb3JtYXROYW1lLCBmb3JtYXQ7XG4gIGZvcihmb3JtYXROYW1lIGluIEZvcm1hdHRlcnMpIHtcbiAgICBpZiAoRm9ybWF0dGVycy5oYXNPd25Qcm9wZXJ0eShmb3JtYXROYW1lKSkge1xuICAgICAgZm9ybWF0ID0gRm9ybWF0dGVyc1tmb3JtYXROYW1lXTtcbiAgICAgIC8vIERvIHdlIGhhdmUgYSB0b0hUTUwgZnVuY3Rpb24/XG4gICAgICBpZiAoIV8uaXNVbmRlZmluZWQoZm9ybWF0LnRvSFRNTCkgJiYgXy5pc0Z1bmN0aW9uKGZvcm1hdC50b0hUTUwpKSB7XG4gICAgICAgIGh0bWwgPSBmb3JtYXQudG9IVE1MKGh0bWwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFVzZSBjdXN0b20gYmxvY2sgdG9IVE1MIGZ1bmN0aW9ucyAoaWYgYW55IGV4aXN0KVxuICB2YXIgYmxvY2s7XG4gIGlmIChCbG9ja3MuaGFzT3duUHJvcGVydHkodHlwZSkpIHtcbiAgICBibG9jayA9IEJsb2Nrc1t0eXBlXTtcbiAgICAvLyBEbyB3ZSBoYXZlIGEgdG9IVE1MIGZ1bmN0aW9uP1xuICAgIGlmICghXy5pc1VuZGVmaW5lZChibG9jay5wcm90b3R5cGUudG9IVE1MKSAmJiBfLmlzRnVuY3Rpb24oYmxvY2sucHJvdG90eXBlLnRvSFRNTCkpIHtcbiAgICAgIGh0bWwgPSBibG9jay5wcm90b3R5cGUudG9IVE1MKGh0bWwpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzaG91bGRXcmFwKSB7XG4gICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXFxuXFxuL2dtLCBcIjwvZGl2PjxkaXY+PGJyPjwvZGl2PjxkaXY+XCIpO1xuICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcbi9nbSwgXCI8L2Rpdj48ZGl2PlwiKTtcbiAgfVxuXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcdC9nLCBcIiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1wiKVxuICAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4vZywgXCI8YnI+XCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL1xcKlxcKi8sIFwiXCIpXG4gICAgICAgICAgICAgLnJlcGxhY2UoL19fLywgXCJcIik7ICAvLyBDbGVhbnVwIGFueSBtYXJrZG93biBjaGFyYWN0ZXJzIGxlZnRcblxuICAvLyBSZXBsYWNlIGVzY2FwZWRcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXFxcXFxcKi9nLCBcIipcIilcbiAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFxcWy9nLCBcIltcIilcbiAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFxcXS9nLCBcIl1cIilcbiAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFxcXy9nLCBcIl9cIilcbiAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFxcKC9nLCBcIihcIilcbiAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFxcKS9nLCBcIilcIilcbiAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFxcLS9nLCBcIi1cIik7XG5cbiAgaWYgKHNob3VsZFdyYXApIHtcbiAgICBodG1sICs9IFwiPC9kaXY+XCI7XG4gIH1cblxuICByZXR1cm4gaHRtbDtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNvbnRlbnQsIHR5cGUpIHtcblxuICAvLyBEZWZlcnJpbmcgcmVxdWlyaW5nIHRoZXNlIHRvIHNpZGVzdGVwIGEgY2lyY3VsYXIgZGVwZW5kZW5jeTpcbiAgLy8gQmxvY2sgLT4gdGhpcyAtPiBCbG9ja3MgLT4gQmxvY2tcbiAgdmFyIEJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG4gIHZhciBGb3JtYXR0ZXJzID0gcmVxdWlyZSgnLi9mb3JtYXR0ZXJzJyk7XG5cbiAgdHlwZSA9IHV0aWxzLmNsYXNzaWZ5KHR5cGUpO1xuXG4gIHZhciBtYXJrZG93biA9IGNvbnRlbnQ7XG5cbiAgLy9Ob3JtYWxpc2Ugd2hpdGVzcGFjZVxuICBtYXJrZG93biA9IG1hcmtkb3duLnJlcGxhY2UoLyZuYnNwOy9nLFwiIFwiKTtcblxuICAvLyBGaXJzdCBvZiBhbGwsIHN0cmlwIGFueSBhZGRpdGlvbmFsIGZvcm1hdHRpbmdcbiAgLy8gTVNXb3JkLCBJJ20gbG9va2luZyBhdCB5b3UsIHB1bmsuXG4gIG1hcmtkb3duID0gbWFya2Rvd24ucmVwbGFjZSgvKCBjbGFzcz0oXCIpP01zb1thLXpBLVpdKyhcIik/KS9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88IS0tKC4qPyktLT4vZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwvXFwqKC4qPylcXCpcXC8vZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPChcXC8pKihtZXRhfGxpbmt8c3BhbnxcXFxcP3htbDp8c3QxOnxvOnxmb250KSguKj8pPi9naSwgJycpO1xuXG4gIHZhciBiYWRUYWdzID0gWydzdHlsZScsICdzY3JpcHQnLCAnYXBwbGV0JywgJ2VtYmVkJywgJ25vZnJhbWVzJywgJ25vc2NyaXB0J10sXG4gICAgICB0YWdTdHJpcHBlciwgaTtcblxuICBmb3IgKGkgPSAwOyBpPCBiYWRUYWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGFnU3RyaXBwZXIgPSBuZXcgUmVnRXhwKCc8JytiYWRUYWdzW2ldKycuKj8nK2JhZFRhZ3NbaV0rJyguKj8pPicsICdnaScpO1xuICAgIG1hcmtkb3duID0gbWFya2Rvd24ucmVwbGFjZSh0YWdTdHJpcHBlciwgJycpO1xuICB9XG5cbiAgLy8gRXNjYXBlIGFueXRoaW5nIGluIGhlcmUgdGhhdCAqY291bGQqIGJlIGNvbnNpZGVyZWQgYXMgTURcbiAgLy8gTWFya2Rvd24gY2hhcnMgd2UgY2FyZSBhYm91dDogKiBbXSBfICgpIC1cbiAgbWFya2Rvd24gPSBtYXJrZG93bi5yZXBsYWNlKC9cXCovZywgXCJcXFxcKlwiKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxbL2csIFwiXFxcXFtcIilcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXS9nLCBcIlxcXFxdXCIpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXF8vZywgXCJcXFxcX1wiKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwoL2csIFwiXFxcXChcIilcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcKS9nLCBcIlxcXFwpXCIpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXC0vZywgXCJcXFxcLVwiKTtcblxuICB2YXIgaW5saW5lVGFncyA9IFtcImVtXCIsIFwiaVwiLCBcInN0cm9uZ1wiLCBcImJcIl07XG5cbiAgZm9yIChpID0gMDsgaTwgaW5saW5lVGFncy5sZW5ndGg7IGkrKykge1xuICAgIHRhZ1N0cmlwcGVyID0gbmV3IFJlZ0V4cCgnPCcraW5saW5lVGFnc1tpXSsnPjxicj48LycraW5saW5lVGFnc1tpXSsnPicsICdnaScpO1xuICAgIG1hcmtkb3duID0gbWFya2Rvd24ucmVwbGFjZSh0YWdTdHJpcHBlciwgJzxicj4nKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlcGxhY2VCb2xkcyhtYXRjaCwgcDEsIHAyKXtcbiAgICBpZihfLmlzVW5kZWZpbmVkKHAyKSkgeyBwMiA9ICcnOyB9XG4gICAgcmV0dXJuIFwiKipcIiArIHAxLnJlcGxhY2UoLzwoLik/YnIoLik/Pi9nLCAnJykgKyBcIioqXCIgKyBwMjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlcGxhY2VJdGFsaWNzKG1hdGNoLCBwMSwgcDIpe1xuICAgIGlmKF8uaXNVbmRlZmluZWQocDIpKSB7IHAyID0gJyc7IH1cbiAgICByZXR1cm4gXCJfXCIgKyBwMS5yZXBsYWNlKC88KC4pP2JyKC4pPz4vZywgJycpICsgXCJfXCIgKyBwMjtcbiAgfVxuXG4gIG1hcmtkb3duID0gbWFya2Rvd24ucmVwbGFjZSgvPChcXHcrKSg/OlxccytcXHcrPVwiW15cIl0rKD86XCJcXCRbXlwiXStcIlteXCJdKyk/XCIpKj5cXHMqPFxcL1xcMT4vZ2ltLCAnJykgLy9FbXB0eSBlbGVtZW50c1xuICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4vbWcsXCJcIilcbiAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPGEuKj9ocmVmPVtcIlwiJ10oLio/KVtcIlwiJ10uKj8+KC4qPyk8XFwvYT4vZ2ltLCBmdW5jdGlvbihtYXRjaCwgcDEsIHAyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcIltcIiArIHAyLnRyaW0oKS5yZXBsYWNlKC88KC4pP2JyKC4pPz4vZywgJycpICsgXCJdKFwiKyBwMSArXCIpXCI7XG4gICAgICAgICAgICAgICAgICAgICAgfSkgLy8gSHlwZXJsaW5rc1xuICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88c3Ryb25nPig/OlxccyopKC4qPykoXFxzKSo/PFxcL3N0cm9uZz4vZ2ltLCByZXBsYWNlQm9sZHMpXG4gICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzxiPig/OlxccyopKC4qPykoXFxzKik/PFxcL2I+L2dpbSwgcmVwbGFjZUJvbGRzKVxuICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88ZW0+KD86XFxzKikoLio/KShcXHMqKT88XFwvZW0+L2dpbSwgcmVwbGFjZUl0YWxpY3MpXG4gICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzxpPig/OlxccyopKC4qPykoXFxzKik/PFxcL2k+L2dpbSwgcmVwbGFjZUl0YWxpY3MpO1xuXG5cbiAgLy8gVXNlIGN1c3RvbSBmb3JtYXR0ZXJzIHRvTWFya2Rvd24gZnVuY3Rpb25zIChpZiBhbnkgZXhpc3QpXG4gIHZhciBmb3JtYXROYW1lLCBmb3JtYXQ7XG4gIGZvcihmb3JtYXROYW1lIGluIEZvcm1hdHRlcnMpIHtcbiAgICBpZiAoRm9ybWF0dGVycy5oYXNPd25Qcm9wZXJ0eShmb3JtYXROYW1lKSkge1xuICAgICAgZm9ybWF0ID0gRm9ybWF0dGVyc1tmb3JtYXROYW1lXTtcbiAgICAgIC8vIERvIHdlIGhhdmUgYSB0b01hcmtkb3duIGZ1bmN0aW9uP1xuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGZvcm1hdC50b01hcmtkb3duKSAmJiBfLmlzRnVuY3Rpb24oZm9ybWF0LnRvTWFya2Rvd24pKSB7XG4gICAgICAgIG1hcmtkb3duID0gZm9ybWF0LnRvTWFya2Rvd24obWFya2Rvd24pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIERvIG91ciBnZW5lcmljIHN0cmlwcGluZyBvdXRcbiAgbWFya2Rvd24gPSBtYXJrZG93bi5yZXBsYWNlKC8oW148Pl0rKSg8ZGl2PikvZyxcIiQxXFxuJDJcIikgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEaXZpdGlzIHN0eWxlIGxpbmUgYnJlYWtzIChoYW5kbGUgdGhlIGZpcnN0IGxpbmUpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88ZGl2PjxkaXY+L2csJ1xcbjxkaXY+JykgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIF4gKGRvdWJsZSBvcGVuaW5nIGRpdnMgd2l0aCBvbmUgY2xvc2UgZnJvbSBDaHJvbWUpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oPzo8ZGl2PikoW148Pl0rKSg/OjxkaXY+KS9nLFwiJDFcXG5cIikgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gXiAoaGFuZGxlIG5lc3RlZCBkaXZzIHRoYXQgc3RhcnQgd2l0aCBjb250ZW50KVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKD86PGRpdj4pKD86PGJyPik/KFtePD5dKykoPzo8YnI+KT8oPzo8XFwvZGl2PikvZyxcIiQxXFxuXCIpICAgICAgICAvLyBeIChoYW5kbGUgY29udGVudCBpbnNpZGUgZGl2cylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzxcXC9wPi9nLFwiXFxuXFxuXCIpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQIHRhZ3MgYXMgbGluZSBicmVha3NcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzwoLik/YnIoLik/Pi9nLFwiXFxuXCIpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IG5vcm1hbCBsaW5lIGJyZWFrc1xuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJmx0Oy9nLFwiPFwiKS5yZXBsYWNlKC8mZ3Q7L2csXCI+XCIpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVuY29kaW5nXG5cbiAgLy8gVXNlIGN1c3RvbSBibG9jayB0b01hcmtkb3duIGZ1bmN0aW9ucyAoaWYgYW55IGV4aXN0KVxuICB2YXIgYmxvY2s7XG4gIGlmIChCbG9ja3MuaGFzT3duUHJvcGVydHkodHlwZSkpIHtcbiAgICBibG9jayA9IEJsb2Nrc1t0eXBlXTtcbiAgICAvLyBEbyB3ZSBoYXZlIGEgdG9NYXJrZG93biBmdW5jdGlvbj9cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoYmxvY2sucHJvdG90eXBlLnRvTWFya2Rvd24pICYmIF8uaXNGdW5jdGlvbihibG9jay5wcm90b3R5cGUudG9NYXJrZG93bikpIHtcbiAgICAgIG1hcmtkb3duID0gYmxvY2sucHJvdG90eXBlLnRvTWFya2Rvd24obWFya2Rvd24pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFN0cmlwIHJlbWFpbmluZyBIVE1MXG4gIG1hcmtkb3duID0gbWFya2Rvd24ucmVwbGFjZSgvPFxcLz9bXj5dKyg+fCQpL2csIFwiXCIpO1xuXG4gIHJldHVybiBtYXJrZG93bjtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKCcuL2xvZGFzaCcpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyk7XG5cbnZhciB1cmxSZWdleCA9IC9eKD86KFtBLVphLXpdKyk6KT8oXFwvezAsM30pKFswLTkuXFwtQS1aYS16XSspKD86OihcXGQrKSk/KD86XFwvKFtePyNdKikpPyg/OlxcPyhbXiNdKikpPyg/OiMoLiopKT8kLztcblxudmFyIHV0aWxzID0ge1xuICBsb2c6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghXy5pc1VuZGVmaW5lZChjb25zb2xlKSAmJiBjb25maWcuZGVidWcpIHtcbiAgICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9LFxuXG4gIGlzVVJJIDogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgcmV0dXJuICh1cmxSZWdleC50ZXN0KHN0cmluZykpO1xuICB9LFxuXG4gIHRpdGxlaXplOiBmdW5jdGlvbihzdHIpe1xuICAgIGlmIChzdHIgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgc3RyICA9IFN0cmluZyhzdHIpLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oPzpefFxcc3wtKVxcUy9nLCBmdW5jdGlvbihjKXsgcmV0dXJuIGMudG9VcHBlckNhc2UoKTsgfSk7XG4gIH0sXG5cbiAgY2xhc3NpZnk6IGZ1bmN0aW9uKHN0cil7XG4gICAgcmV0dXJuIHV0aWxzLnRpdGxlaXplKFN0cmluZyhzdHIpLnJlcGxhY2UoL1tcXFdfXS9nLCAnICcpKS5yZXBsYWNlKC9cXHMvZywgJycpO1xuICB9LFxuXG4gIGNhcGl0YWxpemUgOiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyaW5nLnN1YnN0cmluZygxKS50b0xvd2VyQ2FzZSgpO1xuICB9LFxuXG4gIGZsYXR0ZW46IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciB4ID0ge307XG4gICAgKEFycmF5LmlzQXJyYXkob2JqKSA/IG9iaiA6IE9iamVjdC5rZXlzKG9iaikpLmZvckVhY2goZnVuY3Rpb24gKGkpIHtcbiAgICAgIHhbaV0gPSB0cnVlO1xuICAgIH0pO1xuICAgIC8qIF8uZWFjaChvYmosIGZ1bmN0aW9uKGEsYikge1xuICAgICAqICAgeFsoXy5pc0FycmF5KG9iaikpID8gYSA6IGJdID0gdHJ1ZTtcbiAgICAgKiB9KTsgKi9cbiAgICByZXR1cm4geDtcbiAgfSxcblxuICB1bmRlcnNjb3JlZDogZnVuY3Rpb24oc3RyKXtcbiAgICByZXR1cm4gc3RyLnRyaW0oKS5yZXBsYWNlKC8oW2EtelxcZF0pKFtBLVpdKykvZywgJyQxXyQyJylcbiAgICAucmVwbGFjZSgvWy1cXHNdKy9nLCAnXycpLnRvTG93ZXJDYXNlKCk7XG4gIH0sXG5cbiAgcmV2ZXJzZTogZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5zcGxpdChcIlwiKS5yZXZlcnNlKCkuam9pbihcIlwiKTtcbiAgfSxcblxuICB0b1NsdWc6IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBzdHJcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC5yZXBsYWNlKC9bXlxcdyBdKy9nLCcnKVxuICAgIC5yZXBsYWNlKC8gKy9nLCctJyk7XG4gIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlscztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vLyBqc2hpbnQgZnJlZXplOiBmYWxzZVxuXG5pZiAoIVtdLmluY2x1ZGVzKSB7XG4gIEFycmF5LnByb3RvdHlwZS5pbmNsdWRlcyA9IGZ1bmN0aW9uKHNlYXJjaEVsZW1lbnQgLyosIGZyb21JbmRleCovICkge1xuICAgIGlmICh0aGlzID09PSB1bmRlZmluZWQgfHwgdGhpcyA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgdGhpcyB2YWx1ZSB0byBvYmplY3QnKTtcbiAgICB9XG4gICAgdmFyIE8gPSBPYmplY3QodGhpcyk7XG4gICAgdmFyIGxlbiA9IHBhcnNlSW50KE8ubGVuZ3RoKSB8fCAwO1xuICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIG4gPSBwYXJzZUludChhcmd1bWVudHNbMV0pIHx8IDA7XG4gICAgdmFyIGs7XG4gICAgaWYgKG4gPj0gMCkge1xuICAgICAgayA9IG47XG4gICAgfSBlbHNlIHtcbiAgICAgIGsgPSBsZW4gKyBuO1xuICAgICAgaWYgKGsgPCAwKSB7XG4gICAgICAgIGsgPSAwO1xuICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAoayA8IGxlbikge1xuICAgICAgdmFyIGN1cnJlbnRFbGVtZW50ID0gT1trXTtcbiAgICAgIGlmIChzZWFyY2hFbGVtZW50ID09PSBjdXJyZW50RWxlbWVudCB8fFxuICAgICAgICAgKHNlYXJjaEVsZW1lbnQgIT09IHNlYXJjaEVsZW1lbnQgJiYgY3VycmVudEVsZW1lbnQgIT09IGN1cnJlbnRFbGVtZW50KSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGsrKztcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xufVxuIl19
