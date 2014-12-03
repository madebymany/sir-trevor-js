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

  bound: [
    "_handleContentPaste", "_onFocus", "_onBlur", "onDrop", "onDeleteClick",
    "clearInsertedStyles", "getSelectionForFormatter", "onBlockRender",
  ],

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
    'position': 'renderBySelection',
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