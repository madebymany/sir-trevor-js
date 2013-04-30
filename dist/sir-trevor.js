(function ($, _){

  var root = this,
      SirTrevor;

  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  SirTrevor = root.SirTrevor = {};
  SirTrevor.DEBUG = true;
  SirTrevor.SKIP_VALIDATION = false;

  /*
   Define default attributes that can be extended through an object passed to the
   initialize function of SirTrevor
  */

  SirTrevor.DEFAULTS = {
    defaultType: "Text",
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
    baseImageUrl: '/sir-trevor-uploads/'
  };

  SirTrevor.BlockMixins = {};
  SirTrevor.Blocks = {};
  SirTrevor.Formatters = {};
  SirTrevor.instances = [];

  var formBound = false; // Flag to tell us once we've bound our submit event

  /* Generic function binding utility, used by lots of our classes */
  var FunctionBind = {
    bound: [],
    _bindFunctions: function(){
      var args = [];
      args.push(this);
      args.join(this.bound);
      _.bindAll.apply(this, args);
    }
  };

  var Renderable = {
    tagName: 'div',
    className: 'sir-trevor__view',
    attributes: {},

    $: function(selector) {
      return this.$el.find(selector);
    },

    render: function() {
      return this;
    },

    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes')),
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
      this.$el = element instanceof jQuery ? element : $(element);
      this.el = this.$el[0];
      return this;
    }
  };

  /*
    Given an array or object, flatten it and return only the key => true
  */
  
  function flattern(obj){
    var x = {};
    _.each(obj, function(a,b) {
      x[(_.isArray(obj)) ? a : b] = true;
    });
    return x;
  }
  /* Halt event execution */
  function halt(ev){
    ev.preventDefault();
  }
  
  /*
    Drop Area Plugin from @maccman
    http://blog.alexmaccaw.com/svbtle-image-uploading
    --
    Tweaked so we use the parent class of dropzone
  */
  
  (function($){
    function dragEnter(e) {
      halt(e);
    }
  
    function dragOver(e) {
      e.originalEvent.dataTransfer.dropEffect = "copy";
      $(e.currentTarget).addClass('st-drag-over');
      halt(e);
    }
  
    function dragLeave(e) {
      $(e.currentTarget).removeClass('st-drag-over');
      halt(e);
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
  
  })(jQuery);
  /*
    Backbone Inheritence 
    --
    From: https://github.com/documentcloud/backbone/blob/master/backbone.js
    Backbone.js 0.9.2
    (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
  */
  
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;
  
    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }
  
    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);
  
    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;
  
    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);
  
    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;
  
    return child;
  };
  /*
  * Ultra simple logging
  */
  
  SirTrevor.log = function(message) {
    if (!_.isUndefined(console) && SirTrevor.DEBUG) {
      console.log(message);
    }
  };
  /* String to slug */
  
  function toSlug(string)
  {
      return string
          .toLowerCase()
          .replace(/[^\w ]+/g,'')
          .replace(/ +/g,'-');
  }
  // Backbone.Events
  // ---------------
  
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
  
  // Optimized internal dispatch function for triggering events. Tries to
  // keep the usual cases speedy (most Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
  var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
  switch (args.length) {
  case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx);
  return;
  case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1);
  return;
  case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2);
  return;
  case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
  return;
  default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
  }
  };
  
  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = SirTrevor.Events = {
  
      // Bind one or more space separated events, or an events map,
      // to a `callback` function. Passing `"all"` will bind the callback to
      // all events fired.
      on: function(name, callback, context) {
        if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
        this._events || (this._events = {});
        var events = this._events[name] || (this._events[name] = []);
        events.push({callback: callback, context: context, ctx: context || this});
        return this;
      },
  
      // Bind events to only be triggered a single time. After the first time
      // the callback is invoked, it will be removed.
      once: function(name, callback, context) {
        if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
        var self = this;
        var once = _.once(function() {
          self.off(name, once);
          callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context);
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
  
        names = name ? [name] : _.keys(this._events);
        for (i = 0, l = names.length; i < l; i++) {
          name = names[i];
          if (events = this._events[name]) {
            this._events[name] = retain = [];
            if (callback || context) {
              for (j = 0, k = events.length; j < k; j++) {
                ev = events[j];
                if ((callback && callback !== ev.callback &&
                                 callback !== ev.callback._callback) ||
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
  
      var listenMethods = {listenTo: 'on', listenToOnce: 'once'};
  
      // An inversion-of-control versions of `on` and `once`. Tell *this* object to listen to
      // an event in another object ... keeping track of what it's listening to.
      _.each(listenMethods, function(implementation, method) {
      Events[method] = function(obj, name, callback) {
        var listeners = this._listeners || (this._listeners = {});
        var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
        listeners[id] = obj;
        if (typeof name === 'object') callback = this;
        obj[implementation](name, callback, this);
        return this;
      };
  });
  
  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;
  
  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  /* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
   * http://benalman.com/
   * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */
  var o = $(SirTrevor);
  SirTrevor.subscribe = SirTrevor.on = function() {
    o.on.apply(o, arguments);
  };
  SirTrevor.unsubscribe = SirTrevor.off = function() {
    o.off.apply(o, arguments);
  };
  SirTrevor.publish = SirTrevor.trigger = function() {
    o.trigger.apply(o, arguments);
  };
  SirTrevor.subscribeAll = function(subscriptions) {
    _.each(subscriptions, function(subscription) {
      o.on.apply(o, arguments);
    });
  };
  //fgnass.github.com/spin.js#v1.2.5
  (function(a,b,c){function g(a,c){var d=b.createElement(a||"div"),e;for(e in c)d[e]=c[e];return d}function h(a){for(var b=1,c=arguments.length;b<c;b++)a.appendChild(arguments[b]);return a}function j(a,b,c,d){var g=["opacity",b,~~(a*100),c,d].join("-"),h=.01+c/d*100,j=Math.max(1-(1-a)/b*(100-h),a),k=f.substring(0,f.indexOf("Animation")).toLowerCase(),l=k&&"-"+k+"-"||"";return e[g]||(i.insertRule("@"+l+"keyframes "+g+"{"+"0%{opacity:"+j+"}"+h+"%{opacity:"+a+"}"+(h+.01)+"%{opacity:1}"+(h+b)%100+"%{opacity:"+a+"}"+"100%{opacity:"+j+"}"+"}",0),e[g]=1),g}function k(a,b){var e=a.style,f,g;if(e[b]!==c)return b;b=b.charAt(0).toUpperCase()+b.slice(1);for(g=0;g<d.length;g++){f=d[g]+b;if(e[f]!==c)return f}}function l(a,b){for(var c in b)a.style[k(a,c)||c]=b[c];return a}function m(a){for(var b=1;b<arguments.length;b++){var d=arguments[b];for(var e in d)a[e]===c&&(a[e]=d[e])}return a}function n(a){var b={x:a.offsetLeft,y:a.offsetTop};while(a=a.offsetParent)b.x+=a.offsetLeft,b.y+=a.offsetTop;return b}var d=["webkit","Moz","ms","O"],e={},f,i=function(){var a=g("style");return h(b.getElementsByTagName("head")[0],a),a.sheet||a.styleSheet}(),o={lines:12,length:7,width:5,radius:10,rotate:0,color:"#000",speed:1,trail:100,opacity:.25,fps:20,zIndex:2e9,className:"spinner",top:"auto",left:"auto"},p=function q(a){if(!this.spin)return new q(a);this.opts=m(a||{},q.defaults,o)};p.defaults={},m(p.prototype,{spin:function(a){this.stop();var b=this,c=b.opts,d=b.el=l(g(0,{className:c.className}),{position:"relative",zIndex:c.zIndex}),e=c.radius+c.length+c.width,h,i;a&&(a.insertBefore(d,a.firstChild||null),i=n(a),h=n(d),l(d,{left:(c.left=="auto"?i.x-h.x+(a.offsetWidth>>1):c.left+e)+"px",top:(c.top=="auto"?i.y-h.y+(a.offsetHeight>>1):c.top+e)+"px"})),d.setAttribute("aria-role","progressbar"),b.lines(d,b.opts);if(!f){var j=0,k=c.fps,m=k/c.speed,o=(1-c.opacity)/(m*c.trail/100),p=m/c.lines;!function q(){j++;for(var a=c.lines;a;a--){var e=Math.max(1-(j+a*p)%m*o,c.opacity);b.opacity(d,c.lines-a,e,c)}b.timeout=b.el&&setTimeout(q,~~(1e3/k))}()}return b},stop:function(){var a=this.el;return a&&(clearTimeout(this.timeout),a.parentNode&&a.parentNode.removeChild(a),this.el=c),this},lines:function(a,b){function e(a,d){return l(g(),{position:"absolute",width:b.length+b.width+"px",height:b.width+"px",background:a,boxShadow:d,transformOrigin:"left",transform:"rotate("+~~(360/b.lines*c+b.rotate)+"deg) translate("+b.radius+"px"+",0)",borderRadius:(b.width>>1)+"px"})}var c=0,d;for(;c<b.lines;c++)d=l(g(),{position:"absolute",top:1+~(b.width/2)+"px",transform:b.hwaccel?"translate3d(0,0,0)":"",opacity:b.opacity,animation:f&&j(b.opacity,b.trail,c,b.lines)+" "+1/b.speed+"s linear infinite"}),b.shadow&&h(d,l(e("#000","0 0 4px #000"),{top:"2px"})),h(a,h(d,e(b.color,"0 0 1px rgba(0,0,0,.1)")));return a},opacity:function(a,b,c){b<a.childNodes.length&&(a.childNodes[b].style.opacity=c)}}),!function(){function a(a,b){return g("<"+a+' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">',b)}var b=l(g("group"),{behavior:"url(#default#VML)"});!k(b,"transform")&&b.adj?(i.addRule(".spin-vml","behavior:url(#default#VML)"),p.prototype.lines=function(b,c){function f(){return l(a("group",{coordsize:e+" "+e,coordorigin:-d+" "+ -d}),{width:e,height:e})}function k(b,e,g){h(i,h(l(f(),{rotation:360/c.lines*b+"deg",left:~~e}),h(l(a("roundrect",{arcsize:1}),{width:d,height:c.width,left:c.radius,top:-c.width>>1,filter:g}),a("fill",{color:c.color,opacity:c.opacity}),a("stroke",{opacity:0}))))}var d=c.length+c.width,e=2*d,g=-(c.width+c.length)*2+"px",i=l(f(),{position:"absolute",top:g,left:g}),j;if(c.shadow)for(j=1;j<=c.lines;j++)k(j,-2,"progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");for(j=1;j<=c.lines;j++)k(j);return h(b,i)},p.prototype.opacity=function(a,b,c,d){var e=a.firstChild;d=d.shadow&&d.lines||0,e&&b+d<e.childNodes.length&&(e=e.childNodes[b+d],e=e&&e.firstChild,e=e&&e.firstChild,e&&(e.opacity=c))}):f=k(b,"animation")}(),a.Spinner=p})(window,document);
  /* Soft character limits on inputs and textareas */
  
  (function($){
  
    $.fn.limit_chars = function() {
  
      if (this.length===0) return;
  
      // Remove browser maxlength, add soft limit
      if(this.attr('maxlength')) {
        this.attr('data-maxlength',this.attr('maxlength'));
        this.removeAttr('maxlength');
      }
  
      if(this.parents('.extended_input').length === 0) {
  
        count = (this.chars()<this.attr('data-maxlength')) ? this.chars() : '<em>'+this.chars()+'</em>';
  
        // Build UI
        this.wrap($('<div>',{
          "class": "extended_input"
        })).after($('<span>', {
          "class": "count",
          html: count+' of '+this.attr('data-maxlength')
        }));
  
        // Attach event
        this.bind('keydown keyup paste',function(ev){
          count = ($(this).chars()<$(this).attr('data-maxlength')) ? $(this).chars() : '<em>'+$(this).chars()+'</em>';
          $(this).parent().find('.count').html(count+' of '+$(this).attr('data-maxlength'));
        });
  
      }
  
    };
  
    $.fn.chars = function() {
      count = (this.attr('contenteditable')!==undefined) ? this.text().length : this.val().length;
      return count;
    };
  
    $.fn.too_long = function() {
      return this.chars() > this.attr('data-maxlength');
    };
  
  })(jQuery);
  /*
  * Sir Trevor Block Store
  * By default we store the data on the instance
  * We can easily extend this and store it on some server or something
  */
  
  SirTrevor.blockStore = function(method, block, options) {
  
    var resp;
  
    options = options || {};
  
    switch(method) {
  
      case "create":
        var data = options.data || {};
        block.dataStore = { type: block.type.toLowerCase(), data: data };
      break;
  
      case "save":
        if (options.data) {
          block.dataStore.data = options.data;
          resp = block.dataStore;
        }
      break;
  
      case "read":
        resp = block.dataStore;
      break;
  
    }
  
    if(resp) {
      return resp;
    }
  
  };
  /*
  * Sir Trevor Editor Store
  * By default we store the complete data on the instances $el
  * We can easily extend this and store it on some server or something
  */
  
  SirTrevor.editorStore = function(method, editor, options) {
  
    var resp;
  
    options = options || {};
  
    switch(method) {
  
      case "create":
        // Grab our JSON from the textarea and clean any whitespace incase there is a line wrap between the opening and closing textarea tags
        var content = _.trim(editor.$el.val());
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
            console.log('Sorry there has been a problem with parsing the JSON');
            console.log(e);
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
  /*
    SirTrevor.Submittable
    --
    We need a global way of setting if the editor can and can't be submitted,
    and a way to disable the submit button and add messages (when appropriate)
    We also need this to be highly extensible so it can be overridden.
    This will be triggered *by anything* so it needs to subscribe to events.
  */
  
  var Submittable = function(){
    this.intialize();
  };
  
  _.extend(Submittable.prototype, {
  
    intialize: function(){
      this.submitBtn = $("input[type='submit']");
  
      var btnTitles = [];
  
      _.each(this.submitBtn, function(btn){
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
      _.each(this.submitBtn, _.bind(function(item, index){
        $(item).attr('value', this.submitBtnTitles[index]);
      }, this));
    },
  
    onUploadStart: function(e){
      this.globalUploadCount++;
      SirTrevor.log('onUploadStart called ' + this.globalUploadCount);
  
      if(this.globalUploadCount === 1) {
        this._disableSubmitButton();
      }
    },
  
    onUploadStop: function(e) {
      this.globalUploadCount = (this.globalUploadCount <= 0) ? 0 : this.globalUploadCount - 1;
  
      SirTrevor.log('onUploadStop called ' + this.globalUploadCount);
  
      if(this.globalUploadCount === 0) {
        this._enableSubmitButton();
      }
    },
  
    onError: function(e){
      SirTrevor.log('onError called');
      this.canSubmit = false;
    },
  
    _disableSubmitButton: function(message){
      this.setSubmitButton(null, message || "Please wait...");
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
  
    _bindEvents: function(){
      SirTrevor.subscribe("disableSubmitButton", _.bind(this._disableSubmitButton, this));
      SirTrevor.subscribe("enableSubmitButton", _.bind(this._enableSubmitButton, this));
      SirTrevor.subscribe("setSubmitButton", _.bind(this.setSubmitButton, this));
      SirTrevor.subscribe("resetSubmitButton", _.bind(this.resetSubmitButton, this));
      SirTrevor.subscribe("onError", _.bind(this.onError, this));
      SirTrevor.subscribe("onUploadStart", _.bind(this.onUploadStart, this));
      SirTrevor.subscribe("onUploadStop", _.bind(this.onUploadStop, this));
    }
  
  });
  
  SirTrevor.submittable = function(){
    new Submittable();
  };
  /*
  *   Sir Trevor Uploader
  *   Generic Upload implementation that can be extended for blocks
  */
  
  SirTrevor.fileUploader = function(block, file, success, error) {
  
    SirTrevor.publish("onUploadStart");
  
    var uid  = [block.ID, (new Date()).getTime(), 'raw'].join('-');
  
    var data = new FormData();
  
    data.append('attachment[name]', file.name);
    data.append('attachment[file]', file);
    data.append('attachment[uid]', uid);
  
    var callbackSuccess = function(data){
      if (!_.isUndefined(success) && _.isFunction(success)) {
        SirTrevor.log('Upload callback called');
        SirTrevor.publish("onUploadStop");
        _.bind(success, block)(data);
      }
    };
  
    var callbackError = function(jqXHR, status, errorThrown){
      if (!_.isUndefined(error) && _.isFunction(error)) {
        SirTrevor.log('Upload callback error called');
        SirTrevor.publish("onUploadError");
        _.bind(error, block)(status);
      }
    };
  
    $.ajax({
      url: SirTrevor.DEFAULTS.uploadUrl,
      data: data,
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST',
      success: callbackSuccess,
      error: callbackError
    });
  
  };
  /*
    Underscore helpers
  */
  
  var url_regex = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
  
  _.mixin({
    isURI : function(string) {
      return (url_regex.test(string));
    },
  
    capitalize : function(string) {
      return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
    },
  
    trim : function(string) {
      return string.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }
  
  });
  
  SirTrevor.toHTML = function(markdown, type) {
    var html = markdown;
      
    // Use custom formatters toHTML functions (if any exist)
    var formatName, format;
    for(formatName in this.formatters) {
      if (SirTrevor.Formatters.hasOwnProperty(formatName)) {
        format = SirTrevor.Formatters[formatName];
        // Do we have a toHTML function?
        if (!_.isUndefined(format.toHTML) && _.isFunction(format.toHTML)) {
          html = format.toHTML(html);
        }
      }
    }
    
    // Use custom block toHTML functions (if any exist)
    var block;
    if (SirTrevor.Blocks.hasOwnProperty(type)) {
      
      block = SirTrevor.Blocks[type];
      // Do we have a toHTML function?
      if (!_.isUndefined(block.prototype.toHTML) && _.isFunction(block.prototype.toHTML)) {
        html = block.prototype.toHTML(html);
      }
    }
    
    html =  html.replace(/^\> (.+)$/mg,"$1")                                       // Blockquotes
                .replace(/\n\n/g,"<br>")                                           // Give me some <br>s
                .replace(/\[([^\]]+)\]\(([^\)]+)\)/g,"<a href='$2'>$1</a>")        // Links
                .replace(/(?:_)([^*|_(http)]+)(?:_)/g,"<i>$1</i>")                 // Italic, avoid italicizing two links with underscores next to each other
                .replace(/(?:\*\*)([^*|_]+)(?:\*\*)/g,"<b>$1</b>");                // Bold
       
    return html;
  };
  SirTrevor.toMarkdown = function(content, type) {
    var markdown;
      
    markdown = content.replace(/\n/mg,"")
                      .replace(/<a.*?href=[""'](.*?)[""'].*?>(.*?)<\/a>/g,"[$2]($1)")         // Hyperlinks
                      .replace(/<\/?b>/g,"**")
                      .replace(/<\/?STRONG>/g,"**")                   // Bold
                      .replace(/<\/?i>/g,"_")
                      .replace(/<\/?EM>/g,"_");                        // Italic
  
    // Use custom formatters toMarkdown functions (if any exist)
    var formatName, format;
    for(formatName in this.formatters) {
      if (SirTrevor.Formatters.hasOwnProperty(formatName)) {
        format = SirTrevor.Formatters[formatName];
        // Do we have a toMarkdown function?
        if (!_.isUndefined(format.toMarkdown) && _.isFunction(format.toMarkdown)) {
          markdown = format.toMarkdown(markdown);
        }
      }
    }
  
    // Do our generic stripping out
    markdown = markdown.replace(/([^<>]+)(<div>)/g,"$1\n\n$2")                                 // Divitis style line breaks (handle the first line)
                   .replace(/(?:<div>)([^<>]+)(?:<div>)/g,"$1\n\n")                            // ^ (handle nested divs that start with content)
                   .replace(/(?:<div>)(?:<br>)?([^<>]+)(?:<br>)?(?:<\/div>)/g,"$1\n\n")        // ^ (handle content inside divs)
                   .replace(/<\/p>/g,"\n\n\n\n")                                               // P tags as line breaks
                   .replace(/<(.)?br(.)?>/g,"\n\n")                                            // Convert normal line breaks
                   .replace(/&nbsp;/g," ")                                                     // Strip white-space entities
                   .replace(/&lt;/g,"<").replace(/&gt;/g,">");                                 // Encoding
  
  
    // Use custom block toMarkdown functions (if any exist)
    var block;
    if (SirTrevor.Blocks.hasOwnProperty(type)) {
      block = SirTrevor.Blocks[type];
      // Do we have a toMarkdown function?
      if (!_.isUndefined(block.prototype.toMarkdown) && _.isFunction(block.prototype.toMarkdown)) {
        markdown = block.prototype.toMarkdown(markdown);
      }
    }
  
    // Strip remaining HTML
    markdown = markdown.replace(/<\/?[^>]+(>|$)/g, "");
  
    return markdown;  
  };

  SirTrevor.EventBus = _.extend({}, SirTrevor.Events);

  /* Block Mixins */
  /* Adds drop functionaltiy to this block */
  
  SirTrevor.BlockMixins.Droppable = {
  
    name: "Droppable",
    valid_drop_file_types: ['File', 'text/plain', 'text/uri-list'],
  
    initializeDroppable: function() {
      SirTrevor.log("Adding drag and drop capabilities for block " + this.blockID);
  
      var drop_options = _.extend(default_drop_options, this.drop_options);
  
      // Build the dropzone interface
      var drop_html = $(_.template(drop_options.drop_html, this));
  
      if (this.drop_options.pastable) {
        drop_html.append(drop_options.paste_html);
      }
  
      if (this.drop_options.uploadable) {
        drop_html.append(drop_options.upload_html);
      }
  
      this.$editor.hide();
      this.$inner.append(drop_html).addClass('st-block__inner--droppable');
      this.$dropzone = drop_html;
  
      // Bind our drop event
      this.$dropzone.dropArea()
                    .bind('drop', _.bind(this._handleDrop, this));
    },
  
    _handleDrop: function(e) {
      e.preventDefault();
  
      e = e.originalEvent;
  
      SirTrevor.publish("editor/block/handleDrop");
  
      var el = $(e.target),
          types = e.dataTransfer.types,
          type, data = [];
  
      el.removeClass('st-dropzone--dragover');
  
      /*
        Check the type we just received,
        delegate it away to our blockTypes to process
      */
  
      if (!_.isUndefined(types) &&
        _.some(types, function(type){ return _.include(this.valid_drop_file_types, type); }, this)) {
        this.onDrop(e.dataTransfer);
      }
  
      SirTrevor.EventBus.trigger('block:content:dropped');
    }
  
  };
  /* Adds paste functionaltiy to this block */
  
  var Pastable = SirTrevor.BlockMixins.Pastable = {
  
    name: "Pastable",
  
    initializePastable: function() {
  
    }
  
  };
  /* Adds upload functionaltiy to this block */
  
  var Uploadable = SirTrevor.BlockMixins.Uploadable = {
    name: "Uploadable",
    initializeUploadable: function() {}
  };
  var BlockReorder = SirTrevor.BlockReorder = function(block_element) {
    this.$block = block_element;
  
    this._ensureElement();
    this._bindFunctions();
    this.initialize.apply(this, arguments);
  };
  
  _.extend(BlockReorder.prototype, FunctionBind, Renderable, {
  
    bound: ['onDragStart', 'onDragEnd', 'onDrag', 'onDrop'],
  
    className: 'st-block__reorder st-icon',
    tagName: 'a',
  
    attributes: function() {
      return {
        'html': 'reorder',
        'draggable': 'true'
      };
    },
  
    initialize: function() {
      this.$el.bind('dragstart', this.onDragStart)
              .bind('dragend', this.onDragEnd)
              .bind('drag', this.onDrag);
  
      this.$block.dropArea()
                 .bind('drop', this.onDrop);
    },
  
    onDrop: function(ev) {
      ev.preventDefault();
  
      var dropped_on = this.$block,
          item_id = ev.originalEvent.dataTransfer.getData("text/plain"),
          block = $('#' + item_id);
  
      if (!_.isUndefined(item_id) &&
        !_.isEmpty(block) &&
        dropped_on.attr('id') != item_id &&
        dropped_on.attr('data-instance') == block.attr('data-instance')
      ) {
        dropped_on.after(block);
      }
  
      SirTrevor.EventBus.trigger("block:reorder:drop");
    },
  
    onDragStart: function(ev) {
      var item = $(ev.target),
          block = item.parents('.st-block');
  
      ev.originalEvent.dataTransfer.setDragImage(block[0], 0, 0);
      ev.originalEvent.dataTransfer.setData('Text', block.attr('id'));
  
      SirTrevor.EventBus.trigger("block:reorder:dragstart");
      block.addClass('st-block--dragging');
    },
  
    onDragEnd: function(ev) {
      var item = $(ev.target),
          block = item.parents('.st-block');
  
      SirTrevor.EventBus.trigger("block:reorder:dragend");
      block.removeClass('st-block--dragging');
    },
  
    onDrag: function(ev){},
  
    render: function() {
      return this;
    }
  
  });
  var BlockDeletion = SirTrevor.BlockDeletion = function() {
    this._ensureElement();
    this._bindFunctions();
  };
  
  _.extend(BlockDeletion.prototype, FunctionBind, Renderable, {
  
    tagName: 'a',
    className: 'st-block__remove st-icon',
  
    attributes: {
      html: 'delete'
    }
  
  });
  var Block = SirTrevor.Block = function(data, instance_id) {
    this.store("create", this, { data: data || {} });
    this.blockID = _.uniqueId(this.className + '-');
    this.instanceID = instance_id;
  
    this._ensureElement();
    this._bindFunctions();
  
    this.initialize.apply(this, arguments);
  };
  
  var blockOptions = [
    "type",
    "toolbarEnabled",
  	"formattingEnabled",
    "droppable",
    "drop_options",
    "validationFailMsg",
    "title",
    "editorHTML",
    "dropzoneHTML",
    "validate",
    "loadData",
    "toData",
    "onDrop",
    "onContentPasted",
    "onBlockRender",
    "beforeBlockRender",
    "setTextLimit",
    "toMarkdown",
    "toHTML"
  ];
  
  var default_drop_options = {
    uploadable: false,
    pastable: false,
    drop_html: '<div class="st-block__dropzone"><span class="st-icon"><%= icon_name() %></span><p>Drag <span><%= type %></span> here</p></div>',
    upload_html: '<div class="st-block__upload-container"><input type="file" type="st-file-upload" /><button class="st-upload-btn">...or choose a file</button></div>',
    paste_html: '<input type="text" placeholder="Or paste URL here" class="st-block__paste-input st-paste-block">'
  };
  
  _.extend(Block.prototype, FunctionBind, Events, Renderable, {
  
    bound: ["_handleDrop", "_handleContentPaste", "_onFocus", "_onBlur", "onDrop", "onDeleteClick"],
  
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
      return _.capitalize(this.type);
    },
  
    icon_name: function() {
      return this.type.toLowerCase();
    },
  
    blockCSSClass: function() {
      // Memoize the slug.
      this.blockCSSClass = toSlug(this.type);
      return this.blockCSSClass;
    },
  
    validationFailMsg: function() {
      return this.type + ' block is invalid';
    },
  
    $$: function(selector) {
      return this.$el.find(selector);
    },
  
    /* Defaults to be overriden if required */
    type: '',
    editorHTML: '<div class="st-block__editor"></div>',
  
    toolbarEnabled: true,
  
    droppable: false,
    formattable: true,
  
  	formattingEnabled: true,
  
    uploadsCount: 0,
  
    initialize: function() {},
  
    loadData: function(data) {},
    onBlockRender: function(){},
    beforeBlockRender: function(){},
    setTextLimit: function() {},
    toMarkdown: function(markdown){ return markdown; },
    toHTML: function(html){ return html; },
  
    store: function(){ return SirTrevor.blockStore.apply(this, arguments); },
  
    _loadAndSetData: function() {
      var currentData = this.getData();
      if (!_.isUndefined(currentData) && !_.isEmpty(currentData)) {
        this._loadData();
      }
    },
  
    withMixin: function(mixin) {
      if (!_.isObject(mixin)) { return; }
      _.extend(this, mixin);
      this["initialize" + mixin.name]();
    },
  
    render: function() {
      this.beforeBlockRender();
  
      var editor_html = _.result(this, 'editorHTML');
  
      this.$el.append(
        this.block_template({ editor_html: editor_html })
      );
  
      this.$inner = this.$el.find('.st-block__inner');
      this.$editor = this.$inner.children().first();
  
      this.$inner.bind('click mouseover', function(e){ e.stopPropagation(); });
  
      this._loadAndSetData();
  
      if (this.hasTextBlock) { this._initTextBlocks(); }
      if (this.droppable) { this.withMixin(SirTrevor.BlockMixins.Droppable); }
      if (this.formattingEnabled) { this._initFormatting(); }
  
      this._initUIComponents();
      this._initPaste();
  
      this.$el.addClass('st-item-ready');
      this.save();
  
      this.onBlockRender();
  
      return this;
    },
  
    remove: function() {
      this.$el.remove();
    },
  
    /* Save the state of this block onto the blocks data attr */
    save: function() {
      this.toData();
      return this.store("read", this);
    },
  
    getData: function() {
      return this.store("read", this).data;
    },
  
    setData: function(data) {
      SirTrevor.log("Setting data for block " + this.blockID);
      this.store("save", this, { data: data });
    },
  
    loading: function() {
      if(!_.isUndefined(this.spinner)) { this.ready(); }
  
      this.spinner = new Spinner(SirTrevor.DEFAULTS.spinner);
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
  
    /* Generic implementations */
  
    validate: function() {
      this._beforeValidate();
  
      var fields = this.$$('.st-required, [data-maxlength]'),
          errors = 0;
  
      _.each(fields, _.bind(function(field) {
        field = $(field);
        var content = (field.attr('contenteditable')) ? field.text() : field.val(),
            too_long = (field.attr('data-maxlength') && field.too_long()),
            required = field.hasClass('st-required');
  
        if ((required && content.length === 0) || too_long) {
          // Error!
          field.addClass('st-error');
          errors++;
        }
      }, this));
  
      if (errors > 0) {
        this.$el.addClass('st-block--with-errors');
      }
  
      return (errors === 0);
    },
  
    /*
      Generic toData implementation.
      Can be overwritten, although hopefully this will cover most situations
    */
    toData: function() {
      SirTrevor.log("toData for " + this.blockID);
  
      var bl = this.$el,
          dataObj = {};
  
      /* Simple to start. Add conditions later */
      if (this.$$('.st-text-block').length > 0) {
        var content = this.$$('.st-text-block').html();
        if (content.length > 0) {
          dataObj.text = SirTrevor.toMarkdown(content, this.type);
        }
      }
  
      var hasTextAndData = (!_.isUndefined(dataObj.text) || this.$$('.st-text-block').length === 0);
  
      // Add any inputs to the data attr
      if(this.$$('input[type="text"]').not('.st-paste-block').length > 0) {
        this.$$('input[type="text"]').each(function(index,input){
          input = $(input);
          if (input.val().length > 0 && hasTextAndData) {
            dataObj[input.attr('name')] = input.val();
          }
        });
      }
  
      this.$$('select').each(function(index,input){
        input = $(input);
        if(input.val().length > 0 && hasTextAndData) {
          dataObj[input.attr('name')] = input.val();
        }
      });
  
      this.$$('input[type="file"]').each(function(index,input) {
        input = $(input);
        dataObj.file = input.data('json');
      });
  
      // Set
      if(!_.isEmpty(dataObj)) {
        this.setData(dataObj);
      }
    },
  
    /* Generic implementation to tell us when the block is active */
    focus: function() {
      this.$('.st-text-block').focus();
    },
  
    blur: function() {
      this.$('.st-text-block').blur();
    },
  
    onFocus: function() {
      this.$('.st-text-block').bind('focus', this._onFocus);
    },
  
    onBlur: function() {
      this.$('.st-text-block').bind('blur', this._onBlur);
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
      if (confirm('Are you sure you wish to delete this content?')) {
        this.remove();
        this.trigger('removeBlock', this.blockID, this.type);
        halt(ev);
      }
    },
  
    onContentPasted: function(ev){
      var textBlock = this.$$('.st-text-block');
      if (textBlock.length > 0) {
        textBlock.html(SirTrevor.toHTML(SirTrevor.toMarkdown(textBlock.html(), this.type), this.type));
      }
    },
  
    /*
      Generic Upload Attachment Function
      Designed to handle any attachments
    */
  
    uploader: function(file, callback){
      SirTrevor.fileUploader(this, file, callback);
    },
  
    /* Private methods */
  
    _loadData: function() {
      SirTrevor.log("loadData for " + this.blockID);
  
      this.loading();
  
      if(this.droppable) {
        this.$editor.show();
        this.$dropzone.hide();
      }
  
      SirTrevor.publish("editor/block/loadData");
  
      this.loadData(this.getData());
      this.ready();
    },
  
    _beforeValidate: function() {
      this.errors = [];
      var errorClass = 'st-error';
      this.$el.removeClass('st-block--with-errors');
      this.$('.' + errorClass).removeClass(errorClass);
    },
  
    _handleContentPaste: function(ev) {
      // We need a little timeout here
      var timed = function(ev){
        // Delegate this off to the super method that can be overwritten
        this.onContentPasted(ev);
      };
      _.delay(_.bind(timed, this, ev), 100);
    },
  
    _getBlockClass: function() {
      return 'st-block--' + this.className;
    },
  
    /*
    * Init functions for adding functionality
    */
  
    _initUIComponents: function() {
      var ui_element = $("<div>", { 'class': 'st-block__ui' });
      this.$inner.append(ui_element);
      this.$ui = ui_element;
  
      this.$ui.append(new SirTrevor.BlockReorder(this.$el).render().$el);
      this.$ui.append(new SirTrevor.BlockDeletion().render().$el);
  
      this.$ui.on('click', '.st-block__remove', this.onDeleteClick);
  
      this.onFocus();
      this.onBlur();
    },
  
    _initFormatting: function() {
      // Enable formatting keyboard input
      var formatter;
      for (var name in SirTrevor.Formatters) {
        if (SirTrevor.Formatters.hasOwnProperty(name)) {
          formatter = SirTrevor.Formatters[name];
          if (!_.isUndefined(formatter.keyCode)) {
            formatter._bindToBlock(this.$el);
          }
        }
      }
    },
  
    _initTextBlocks: function() {
      var shift_down = false;
  
      this.$$('.st-text-block')
        .bind('paste', this._handleContentPaste)
        .bind('keydown', function(e){
          var code = (e.keyCode ? e.keyCode : e.which);
          if (code == 16) shift_down = true;
        })
        .bind('keyup', _.bind(function(e){
          var code = (e.keyCode ? e.keyCode : e.which);
  
          if (shift_down && (code == 37 || code == 39 || code == 40 || code == 38)) {
            this.getSelectionForFormatter();
          }
  
          if (code == 16) {
            shift_down = false;
          }
  
        }, this))
        .bind('mouseup', this.getSelectionForFormatter);
    },
  
    getSelectionForFormatter: function() {
      var range = window.getSelection().getRangeAt(0),
          rects = range.getClientRects();
  
      if (!range.collapsed && rects.length) {
        SirTrevor.EventBus.trigger('formatter:positon', rects);
      } else {
        SirTrevor.EventBus.trigger('formatter:hide');
      }
    },
  
    hasTextBlock: function() {
      return this.$('.st-text-block').length > 0;
    },
  
    _initPaste: function() {
      this.$('.st-paste-block')
        .bind('click', function(){ $(this).select(); })
        .bind('paste', this._handleContentPaste)
        .bind('submit', this._handleContentPaste);
    }
  });
  
  Block.extend = extend; // Allow our Block to be extended.
  var Format = SirTrevor.Formatter = function(options){
    this.formatId = _.uniqueId('format-');
    this._configure(options || {});
    this.initialize.apply(this, arguments);
  };
  
  var formatOptions = ["title", "className", "cmd", "keyCode", "param", "onClick", "toMarkdown", "toHTML"];
  
  _.extend(Format.prototype, {
  
    title: '',
    className: '',
    cmd: null,
    keyCode: null,
    param: null,
    toMarkdown: function(markdown){ return markdown; },
    toHTML: function(html){ return html; },
  
    initialize: function(){},
  
    _configure: function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = formatOptions.length; i < l; i++) {
        var attr = formatOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },
  
    _bindToBlock: function(block) {
  
      var formatter = this,
          ctrlDown = false;
  
      block
        .on('keyup','.st-text-block', function(ev) {
          if(ev.which == 17 || ev.which == 224) {
            ctrlDown = false;
          }
        })
        .on('keydown','.st-text-block', { formatter: formatter }, function(ev) {
          if(ev.which == 17 || ev.which == 224) {
            ctrlDown = true;
          }
          if(ev.which == ev.data.formatter.keyCode && ctrlDown === true) {
            document.execCommand(ev.data.formatter.cmd, false, true);
            ev.preventDefault();
          }
        });
    }
  });
  
  Format.extend = extend; // Allow our Formatters to be extended.

  /* Default Blocks */
  /*
    Block Quote
  */
  
  SirTrevor.Blocks.Quote = SirTrevor.Block.extend({ 
    
    type: 'Quote',
    
    editorHTML: function() {
      return _.template('<blockquote class="st-required st-text-block <%= className %>" contenteditable="true"></blockquote>\
          <input maxlength="140" name="cite" placeholder="Credit" class="st-input-string st-required" type="text" />', this);
    },
    
    loadData: function(data){
      this.$$('.st-text-block').html(SirTrevor.toHTML(data.text, this.type));
      this.$$('input').val(data.cite);
    },
    
    toMarkdown: function(markdown) {
      return markdown.replace(/^(.+)$/mg,"> $1");
    }
    
  });
  /*
    Gallery
  */
  
  SirTrevor.Blocks.Gallery = SirTrevor.Block.extend({ 
    
    type: "Gallery",
    droppable: true,
  
    drop_options: {
      uploadable: true
    },
  
    editorHTML: "<div class=\"gallery-items\"><p>Gallery Contents:</p><ul></ul></div>",
    
    loadData: function(data){
      // Find all our gallery blocks and draw nice list items from it
      if (_.isArray(data)) {
        _.each(data, _.bind(function(item){
          // Create an image block from this
          this.renderGalleryThumb(item);
        }, this));
        
        // Show the dropzone too
        this.$dropzone.show();
      }
    },
    
    renderGalleryThumb: function(item) {
      
      if(_.isUndefined(item.data.file)) return false;
      
      var img = $("<img>", {
        src: item.data.file.thumb.url
      });
      
      var list = $('<li>', {
        id: _.uniqueId('gallery-item'),
        class: 'gallery-item',
        html: img
      });
      
      list.append($("<span>", {
        class: 'delete',
        click: _.bind(function(e){
          // Remove this item
          halt(e);
          
          if (confirm('Are you sure you wish to delete this image?')) {
            $(e.target).parent().remove();
            this.reindexData();
          }
        }, this)
      }));
      
      list.data('block', item);
      
      this.$$('ul').append(list);
      
      // Make it sortable
      list
        .dropArea()
        .bind('dragstart', _.bind(function(ev){
          var item = $(ev.target);
          ev.originalEvent.dataTransfer.setData('Text', item.parent().attr('id'));
          item.parent().addClass('dragging');
        }, this))
        
        .bind('drag', _.bind(function(ev){
          
        }, this))
        
        .bind('dragend', _.bind(function(ev){
          var item = $(ev.target);
          item.parent().removeClass('dragging');
        }, this))
        
        .bind('dragover', _.bind(function(ev){
          var item = $(ev.target);
          item.parents('li').addClass('dragover');
        }, this))
        
        .bind('dragleave', _.bind(function(ev){
          var item = $(ev.target);
          item.parents('li').removeClass('dragover');
        }, this))
        
        .bind('drop', _.bind(function(ev){
          
          var item = $(ev.target),
              parent = item.parent();
              
          item = (item.hasClass('gallery-item') ? item : parent);    
          
          this.$$('ul li.dragover').removeClass('dragover');
          
          // Get the item
          var target = $('#' + ev.originalEvent.dataTransfer.getData("text/plain"));
          
          if(target.attr('id') === item.attr('id')) return false;
          
          if (target.length > 0 && target.hasClass('gallery-item')) {
            item.before(target);
          }
          
          // Reindex the data
          this.reindexData();
                  
        }, this));
    },
    
    onBlockRender: function(){
      // We need to setup this block for reordering
       /* Setup the upload button */
        this.$dropzone.find('button').bind('click', halt);
        this.$dropzone.find('input').on('change', _.bind(function(ev){
          this.onDrop(ev.currentTarget);
        }, this));
    },
    
    reindexData: function() {
      var dataStruct = this.getData();
      dataStruct = [];
  
      _.each(this.$$('li.gallery-item'), function(li){
        li = $(li);
        dataStruct.push(li.data('block'));
      });
      
      this.setData(dataStruct);
    },
    
    onDrop: function(transferData){
          
      if (transferData.files.length > 0) {
        // Multi files 'ere
        var l = transferData.files.length,
            file, urlAPI = (typeof URL !== "undefined") ? URL : (typeof webkitURL !== "undefined") ? webkitURL : null;
  
        this.loading();
        
        while (l--) {
          file = transferData.files[l];
          if (/image/.test(file.type)) {
            // Inc the upload count
            this.uploadsCount += 1;
            this.$editor.show();
            
            /* Upload */
            this.uploader(file, function(data){
              
              this.uploadsCount -= 1;
              var dataStruct = this.getData();
              data = { type: "image", data: data };
              
              // Add to our struct
              if (!_.isArray(dataStruct)) {
                dataStruct = [];
              }
              dataStruct.push(data);
              this.setData(dataStruct);
              
              // Pass this off to our render gallery thumb method
              this.renderGalleryThumb(data);
              
              if(this.uploadsCount === 0) {
                this.ready();
              }
            });
          }
        }
      }
    }
    
  });
  /*
    Text Block
  */
  SirTrevor.Blocks.Heading = SirTrevor.Block.extend({
  
    type: 'Heading',
  
    editorHTML: '<h1 class="st-required st-text-block" contenteditable="true"></h1>',
  
    loadData: function(data){
      this.$$('.st-text-block').html(SirTrevor.toHTML(data.text, this.type));
    }
  });
  /*
    Simple Image Block
  */
  
  SirTrevor.Blocks.Image = SirTrevor.Block.extend({
  
    type: "Image",
    droppable: true,
  
    drop_options: {
      uploadable: true
    },
  
    loadData: function(data){
      // Create our image tag
      this.$editor.html($('<img>', {
        src: data.file.url
      }));
    },
  
    onBlockRender: function(){
      /* Setup the upload button */
      this.$dropzone.find('button').bind('click', halt);
      this.$dropzone.find('input').on('change', _.bind(function(ev){
        this.onDrop(ev.currentTarget);
      }, this));
    },
  
    onDrop: function(transferData){
      var file = transferData.files[0],
          urlAPI = (typeof URL !== "undefined") ? URL : (typeof webkitURL !== "undefined") ? webkitURL : null;
  
      // Handle one upload at a time
      if (/image/.test(file.type)) {
        this.loading();
        // Show this image on here
        this.$dropzone.hide();
        this.$editor.html($('<img>', {
          src: urlAPI.createObjectURL(file)
        }));
        this.$editor.show();
  
        // Upload!
        SirTrevor.publish('setSubmitButton', ['Please wait...']);
        this.uploader(
          file,
          function(data){
            // Store the data on this block
            this.setData(data);
            // Done
            this.ready();
          },
          function(error){
            alert('Error!');
          }
        );
      }
    }
  });
  /*
    Text Block
  */
  SirTrevor.Blocks.Text = SirTrevor.Block.extend({
  
    type: 'Text',
  
    editorHTML: '<div class="st-required st-text-block" contenteditable="true"></div>',
  
    loadData: function(data){
      this.$$('.st-text-block').html(SirTrevor.toHTML(data.text, this.type));
    }
  });
  var tweet_template = [
    "<blockquote class='twitter-tweet' align='center'>",
    "<p><%= text %></p>",
    "&mdash; <%= user.name %> (@<%= user.screen_name %>)",
    "<a href='<%= status_url %>' data-datetime='<%= created_at %>'><%= created_at %></a>",
    "</blockquote>",
    '<script src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'
  ].join("\n");
  
  SirTrevor.Blocks.Tweet = SirTrevor.Block.extend({
  
    type: "Tweet",
    droppable: true,
    drop_options: {
      pastable: true
    },
  
    icon_name: function() {
      return 'twitter';
    },
  
    loadData: function(data){
      this.$inner.prepend(_.template(tweet_template, data));
    },
  
    onContentPasted: function(event){
      // Content pasted. Delegate to the drop parse method
      var input = $(event.target),
          val = input.val();
  
      // Pass this to the same handler as onDrop
      this.handleTwitterDropPaste(val);
    },
  
    handleTwitterDropPaste: function(url){
  
      if(_.isURI(url))
      {
        if (url.indexOf("twitter") != -1 && url.indexOf("status") != -1) {
          // Twitter status
          var tweetID = url.match(/[^\/]+$/);
          if (!_.isEmpty(tweetID)) {
  
            this.loading();
  
            tweetID = tweetID[0];
  
            var tweetCallbackSuccess = function(data) {
              // Parse the twitter object into something a bit slimmer..
              var obj = {
                user: {
                  profile_image_url: data.user.profile_image_url,
                  profile_image_url_https: data.user.profile_image_url_https,
                  screen_name: data.user.screen_name,
                  name: data.user.name
                },
                text: data.text,
                created_at: data.created_at,
                status_url: url
              };
  
              // Save this data on the block
              this.setData(obj);
              this._loadData();
  
              this.ready();
            };
  
            var tweetCallbackFail = function(){
              this.ready();
            };
  
            // Make our AJAX call
            $.ajax({
              url: "http://api.twitter.com/1/statuses/show/" + tweetID + ".json",
              dataType: "JSONP",
              success: _.bind(tweetCallbackSuccess, this),
              error: _.bind(tweetCallbackFail, this)
            });
          }
        }
      }
  
    },
  
    onDrop: function(transferData){
      var url = transferData.getData('text/plain');
      this.handleTwitterDropPaste(url);
    }
  });
  /*
    Unordered List
  */
  
  var template = '<ul class="st-text-block" contenteditable="true"><li></li></ul>';
  
  SirTrevor.Blocks.Ul = SirTrevor.Block.extend({
  
    type: "List",
  
    editorHTML: function() {
      return _.template(template, this);
    },
  
    loadData: function(data){
      this.$$('.st-text-block').html("<ul>" + SirTrevor.toHTML(data.text, this.type) + "</ul>");
    },
  
    toMarkdown: function(markdown) {
      return markdown.replace(/<\/li>/mg,"\n")
                     .replace(/<\/?[^>]+(>|$)/g, "")
                     .replace(/^(.+)$/mg," - $1");
    },
  
    toHTML: function(html) {
  		html = html.replace(/^ - (.+)$/mg,"<li>$1</li>").replace(/\n/mg,"");
  		return "<ul>" + html + "</ul>";
    }
  
  });
  var video_regex = /http[s]?:\/\/(?:www.)?(?:(vimeo).com\/(.*))|(?:(youtu(?:be)?).(?:be|com)\/(?:watch\?v=)?([^&]*)(?:&(?:.))?)/;
  
  SirTrevor.Blocks.Video = SirTrevor.Block.extend({
  
    type: 'Video',
  
    droppable: true,
  
    drop_options: {
      pastable: true
    },
  
    loadData: function(data){
      this.$editor.show().addClass('st-block__editor--with-sixteen-by-nine-media');
  
      if(data.source == "youtube" || data.source == "youtu") {
        this.$editor.html("<iframe src=\""+window.location.protocol+"//www.youtube.com/embed/" + data.remote_id + "\" width=\"580\" height=\"320\" frameborder=\"0\" allowfullscreen></iframe>");
      } else if(data.source == "vimeo") {
        this.$editor.html("<iframe src=\""+window.location.protocol+"//player.vimeo.com/video/" + data.remote_id + "?title=0&byline=0\" width=\"580\" height=\"320\" frameborder=\"0\"></iframe>");
      }
    },
  
    onContentPasted: function(event){
      // Content pasted. Delegate to the drop parse method
      var input = $(event.target),
          val = input.val();
  
      // Pass this to the same handler as onDrop
      this.handleDropPaste(val);
    },
  
    handleDropPaste: function(url){
  
      if(_.isURI(url))
      {
        if (url.indexOf("youtu") != -1 || url.indexOf("vimeo") != -1) {
  
          var data = {},
          videos = url.match(video_regex);
  
          // Work out the source and extract ID
          if(videos[3] !== undefined) {
            data.source = videos[3];
            data.remote_id = videos[4];
          } else if (videos[1] !== undefined) {
            data.source = videos[1];
            data.remote_id = videos[2];
          }
  
          if (data.source == "youtu") {
            data.source = "youtube";
          }
  
          // Save the data
          this.setData(data);
  
          // Render
          this._loadData();
        }
      }
  
    },
  
    onDrop: function(transferData){
      var url = transferData.getData('text/plain');
      this.handleDropPaste(url);
    }
  });
  /* Default Formatters */
  /* Our base formatters */
  
  var Bold = SirTrevor.Formatter.extend({
    title: "bold",
    className: "bold",
    cmd: "bold",
    keyCode: 66
  });
  
  var Italic = SirTrevor.Formatter.extend({
    title: "italic",
    className: "italic",
    cmd: "italic",
    keyCode: 73
  });
  
  var Underline = SirTrevor.Formatter.extend({
    title: "underline",
    className: "underline",
    cmd: "underline"
  });
  
  var Link = SirTrevor.Formatter.extend({
  
    title: "link",
    className: "link",
    cmd: "CreateLink",
  
    onClick: function() {
  
      var link = prompt("Enter a link"),
          link_regex = /(ftp|http|https):\/\/./;
  
      if(link && link.length > 0) {
  
       if (!link_regex.test(link)) {
         link = "http://" + link;
       }
  
       document.execCommand(this.cmd, false, link);
      }
    }
  });
  
  var UnLink = SirTrevor.Formatter.extend({
    title: "unlink",
    className: "link",
    cmd: "unlink"
  });
  
  /*
    Create our formatters and add a static reference to them
  */
  SirTrevor.Formatters.Bold = new Bold();
  SirTrevor.Formatters.Italic = new Italic();
  SirTrevor.Formatters.Underline = new Underline();
  SirTrevor.Formatters.Link = new Link();
  SirTrevor.Formatters.Unlink = new UnLink();
  /* Marker */
  var BlockControl = SirTrevor.BlockControl = function(type, instance_scope) {
    this.type = type;
    this.instance_scope = instance_scope;
    this._ensureElement();
    this.initialize();
  };
  
  _.extend(BlockControl.prototype, FunctionBind, Renderable, Events, {
  
    tagName: 'a',
    className: "st-block-control",
  
    attributes: function() {
      return {
        'data-type': this.type
      };
    },
  
    initialize: function() {
      this.block_type = SirTrevor.Blocks[this.type].prototype;
      this.can_be_rendered = this.block_type.toolbarEnabled;
    },
  
    render: function() {
      this.$el.html('<span class="st-icon">'+ this.block_type.icon_name() +'</span>' + _.result(this.block_type, 'title'));
      return this;
    }
  });
  /*
    SirTrevor Block Controls
    --
    Gives an interface for adding new Sir Trevor blocks.
  */
  
  var BlockControls = SirTrevor.BlockControls = function(available_types, instance_scope) {
    this.instance_scope = instance_scope;
    this.available_types = available_types || [];
    this._ensureElement();
    this._bindFunctions();
    this.initialize();
  };
  
  _.extend(BlockControls.prototype, FunctionBind, Renderable, Events, {
  
    bound: ['handleControlButtonClick'],
    block_controls: null,
  
    className: "st-block-controls",
  
    initialize: function() {
      for(var block_type in this.available_types) {
        if (SirTrevor.Blocks.hasOwnProperty(block_type)) {
          var block_control = new SirTrevor.BlockControl(block_type, this.instance_scope);
          if (block_control.can_be_rendered) {
            this.$el.append(block_control.render().$el);
          }
        }
      }
  
      this.$el.delegate('.st-block-control', 'click', this.handleControlButtonClick);
    },
  
    show: function() {
      this.$el.addClass('st-block-controls--active');
    },
  
    hide: function() {
      this.$el.removeClass('st-block-controls--active');
    },
  
    handleControlButtonClick: function(e) {
      this.trigger('createBlock', e.currentTarget.dataset.type);
      this.hide();
    }
  
  });
  
  
  
  /*
    SirTrevor Floating Block Controls
    --
    Draws the 'plus' between blocks
  */
  
  var FloatingBlockControls = SirTrevor.FloatingBlockControls = function(wrapper) {
    this.$wrapper = wrapper;
    this._bindFunctions();
    this.initialize();
  };
  
  _.extend(FloatingBlockControls.prototype, FunctionBind, Events, {
  
    bound: ['handleWrapperMouseOver', 'handleBlockMouseOut', 'handleBlockClick'],
  
    initialize: function() {
      this.$wrapper.on('mouseover', '.st-block', this.handleBlockMouseOver);
      this.$wrapper.on('click', '.st-block--with-plus', this.handleBlockClick);
      this.$wrapper.on('mouseout', '.st-block', this.handleBlockMouseOut);
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
  /* FormatBar */
  /*
    Format Bar
    --
    Displayed on focus on a text area.
    Renders with all available options for the editor instance
  */
  
  var FormatBar = SirTrevor.FormatBar = function(options) {
    this.options = _.extend({}, SirTrevor.DEFAULTS.formatBar, options || {});
    this._ensureElement();
    this._bindFunctions();
  
    this.initialize.apply(this, arguments);
  };
  
  _.extend(FormatBar.prototype, FunctionBind, Events, Renderable, {
  
    className: 'st-format-bar',
  
    bound: ["onFormatButtonClick"],
  
    initialize: function() {
      var formatName, format;
  
      for (formatName in SirTrevor.Formatters) {
        if (SirTrevor.Formatters.hasOwnProperty(formatName)) {
          format = SirTrevor.Formatters[formatName];
          $("<button>", {
            'class': 'st-format-btn st-icon st-format-btn--' + formatName,
            'text': format.title,
            'data-type': formatName,
            'data-cmd': format.cmd
          }).appendTo(this.$el);
        }
      }
  
      this.$b = $(document.body);
      this.$el.bind('click', '.st-format-btn', this.onFormatButtonClick);
    },
  
    hide: function() {
      this.$el.removeClass('st-format-bar--is-ready');
    },
  
    show: function() {
      this.$el.addClass('st-format-bar--is-ready');
    },
  
    remove: function(){ this.$el.remove(); },
  
    render_by_selection: function(rectangles) {
      var coords = {},
          width = this.$el.width();
  
      if (rectangles.length == 1) {
        coords = {
          left: rectangles[0].left + ((rectangles[0].width - width) / 2),
          top: rectangles[0].top + this.$b.scrollTop()
        };
      } else {
        // Calculate the mid position
        var max_width = _.max(rectangles, function(rect){ return rect.width; });
        coords = {
          left: max_width.width / 2,
          top: rectangles[0].top + this.$b.scrollTop()
        };
      }
  
      this.show();
      this.$el.css(coords);
    },
  
    onFormatButtonClick: function(ev){
      ev.stopPropagation();
  
      var btn = $(ev.target),
          format = SirTrevor.Formatters[btn.attr('data-type')];
  
      // Do we have a click function defined on this formatter?
      if(!_.isUndefined(format.onClick) && _.isFunction(format.onClick)) {
        format.onClick(); // Delegate
      } else {
        // Call default
        document.execCommand(btn.attr('data-cmd'), false, format.param);
      }
  
      return false;
    }
  
  });
  /*
    Sir Trevor Editor
    --
    Represents one Sir Trevor editor instance (with multiple blocks)
    Each block references this instance.
    BlockTypes are global however.
  */
  
  var SirTrevorEditor = SirTrevor.Editor = function(options) {
    SirTrevor.log("Init SirTrevor.Editor");
  
    this.blockTypes = {};
    this.blockCounts = {}; // Cached block type counts
    this.blocks = []; // Block references
    this.errors = [];
    this.options = _.extend({}, SirTrevor.DEFAULTS, options || {});
    this.ID = _.uniqueId('st-editor-');
  
    if (!this._ensureAndSetElements()) { return false; }
  
    if(!_.isUndefined(this.options.onEditorRender) && _.isFunction(this.options.onEditorRender)) {
      this.onEditorRender = this.options.onEditorRender;
    }
  
    this._setRequired();
    this._setBlocksTypes();
    this._bindFunctions();
  
    this.store("create", this);
    this.build();
  
    SirTrevor.instances.push(this);
    SirTrevor.bindFormSubmit(this.$form);
  };
  
  _.extend(SirTrevorEditor.prototype, FunctionBind, Events, {
  
    bound: ['onFormSubmit', 'showBlockControls', 'hideAllTheThings'],
  
    initialize: function() {},
    /*
      Build the Editor instance.
      Check to see if we've been passed JSON already, and if not try and create a default block.
      If we have JSON then we need to build all of our blocks from this.
    */
    build: function() {
      this.$el.hide();
  
      this.block_controls = new SirTrevor.BlockControls(this.blockTypes, this.ID);
      this.fl_block_controls = new SirTrevor.FloatingBlockControls(this.$wrapper);
      this.formatBar = new SirTrevor.FormatBar(this.options.formatBar);
  
      this.listenTo(this.block_controls, 'createBlock', this.createBlock);
      this.listenTo(this.fl_block_controls, 'showBlockControls', this.showBlockControls);
  
      SirTrevor.EventBus.on("block:reorder:dragstart", this.hideBlockControls);
      SirTrevor.EventBus.on("block:reorder:dragend", this.removeBlockDragOver);
      SirTrevor.EventBus.on("block:content:dropped", this.removeBlockDragOver);
      SirTrevor.EventBus.on("formatter:positon", this.formatBar.render_by_selection);
      SirTrevor.EventBus.on("formatter:hide", this.formatBar.hide);
  
      this.$outer.append(this.formatBar.render().$el);
      this.$outer.append(this.block_controls.render().$el);
  
      $(window).bind('click', this.hideAllTheThings);
  
      var store = this.store("read", this);
  
      if (store.data.length === 0) {
        // Create a default instance
        this.createBlock(this.options.defaultType);
      } else {
        // We have data. Build our blocks from here.
        _.each(store.data, _.bind(function(block){
          SirTrevor.log('Creating: ', block);
          this.createBlock(block.type, block.data);
        }, this));
      }
  
      this.$wrapper.addClass('st-ready');
  
      if(!_.isUndefined(this.onEditorRender)) {
        this.onEditorRender();
      }
    },
  
    hideAllTheThings: function(e) {
      this.block_controls.hide();
      this.formatBar.hide();
    },
  
    showBlockControls: function(container) {
      this.block_controls.show();
      container.append(this.block_controls.$el.detach());
      this.block_controls.current_container = container;
    },
  
    store: function(){
      return SirTrevor.editorStore.apply(this, arguments);
    },
  
    /*
      Create an instance of a block from an available type.
      We have to check the number of blocks we're allowed to create before adding one and handle fails accordingly.
      A block will have a reference to an Editor instance & the parent BlockType.
      We also have to remember to store static counts for how many blocks we have, and keep a nice array of all the blocks available.
    */
    createBlock: function(type, data, render_at) {
      type = _.capitalize(type); // Proper case
  
      if (!this._isBlockTypeAvailable(type)) {
        SirTrevor.log("Block type not available " + type);
        return false;
      }
  
      // Can we have another one of these blocks?
      if (!this._canAddBlockType(type)) {
        SirTrevor.log("Block Limit reached for type " + type);
        return false;
      }
  
      var block = new SirTrevor.Blocks[type](data, this.ID);
      this._renderInPosition(block.render().$el);
  
      this.listenTo(block, 'removeBlock', this.removeBlock);
  
      this.blocks.push(block);
      this._incrementBlockTypeCount(type);
  
      block.focus();
  
      SirTrevor.publish("editor/block/createBlock");
      SirTrevor.log("Block created of type " + type);
    },
  
    blockFocus: function(block) {
      this.block_controls.current_container = null;
    },
  
    hideBlockControls: function() {
      this.block_controls.hide();
    },
  
    removeBlockDragOver: function() {
      this.$wrapper.find('.st-drag-over').removeClass('st-drag-over');
    },
  
    _renderInPosition: function(block) {
      if (this.block_controls.current_container) {
        this.block_controls.current_container.after(block);
      } else {
        this.$wrapper.append(block);
      }
    },
  
    _incrementBlockTypeCount: function(type) {
      this.blockCounts[type] = (_.isUndefined(this.blockCounts[type])) ? 0 : this.blockCounts[type] + 1;
    },
  
    _getBlockTypeCount: function(type) {
      return (_.isUndefined(this.blockCounts[type])) ? 0 : this.blockCounts[type];
    },
  
    _canAddBlockType: function(type) {
      var block_type_limit = this._getBlockTypeLimit(type);
  
      return !(block_type_limit !== 0 && this._getBlockTypeCount(type) > block_type_limit);
    },
  
    removeBlock: function(block_id, type) {
      this.blockCounts[type] = this.blockCounts[type] - 1;
      this.blocks = _.reject(this.blocks, function(item){ return (item.blockID == block_id); });
      SirTrevor.publish("editor/block/removeBlock");
    },
  
    performValidations : function(block, should_validate) {
      var errors = 0;
  
      block._beforeValidate();
  
      if (!SirTrevor.SKIP_VALIDATION && should_validate) {
        if(!block.validate()){
          this.errors.push({ text: _.result(block, 'validationFailMsg') });
          SirTrevor.log("Block " + block.blockID + " failed validation");
          ++errors;
        }
      }
  
      return errors;
    },
  
    saveBlockStateToStore: function(block) {
      var store = block.save();
      if(!_.isEmpty(store.data)) {
        SirTrevor.log("Adding data for block " + block.blockID + " to block store");
        this.store("add", this, { data: store });
      }
    },
  
    /*
      Handle a form submission of this Editor instance.
      Validate all of our blocks, and serialise all data onto the JSON objects
    */
    onFormSubmit: function(should_validate) {
      // if undefined or null or anything other than false - treat as true
      should_validate = (should_validate === false) ? false : true;
  
      SirTrevor.log("Handling form submission for Editor " + this.ID);
  
      this.removeErrors();
      this.store("reset", this);
  
      this.validateBlocks(should_validate);
      this.validateBlockTypesExist(should_validate);
  
      this.renderErrors();
      this.store("save", this);
  
      return this.errors.length;
    },
  
    validateBlocks: function(should_validate) {
      if (!this.required && (SirTrevor.SKIP_VALIDATION && !should_validate)) {
        return false;
      }
  
      var blockIterator = function(block,index) {
        // Find our block
        this.performValidations(block, should_validate);
        this.saveBlockStateToStore(block);
      };
  
      _.each(this.blocks, _.bind(blockIterator, this));
    },
  
    validateBlockTypesExist: function(should_validate) {
      if (!this.required && (SirTrevor.SKIP_VALIDATION && !should_validate)) {
        return false;
      }
  
      var blockTypeIterator = function(type, index) {
        if (this._isBlockTypeAvailable(type)) {
          if (this._getBlockTypeCount(type) === 0) {
            SirTrevor.log("Failed validation on required block type " + type);
            this.errors.push({ text: "You must have a block of type " + type });
          } else {
            var blocks = _.filter(this.blocks, function(b){ return (b.type == type && !_.isEmpty(b.getData())); });
            if (blocks.length > 0) { return false; }
  
            this.errors.push({ text: "A required block type " + type + " is empty" });
            SirTrevor.log("A required block type " + type + " is empty");
          }
        }
      };
  
      _.each(this.required, _.bind(blockTypeIterator, this));
    },
  
    renderErrors: function() {
      if (this.errors.length === 0) { return false; }
  
      if (_.isUndefined(this.$errors)) {
        this.$errors = $("<div>", {
          'class': 'st-errors',
          html: "<p>You have the following errors: </p><ul></ul>"
        });
        this.$outer.prepend(this.$errors);
      }
  
      var str = "";
  
      _.each(this.errors, function(error) {
        str += '<li class="st-errors__msg">'+ error.text +'</li>';
      });
  
      this.$errors.find('ul').append(str);
      this.$errors.show();
    },
  
    removeErrors: function() {
      if (this.errors.length === 0) { return false; }
  
      this.$errors.hide();
      this.$errors.find('ul').html('');
  
      this.errors = [];
    },
  
    /*
      Get Block Type Limit
      --
      returns the limit for this block, which can be set on a per Editor instance, or on a global blockType scope.
    */
    _getBlockTypeLimit: function(t) {
      if (!this._isBlockTypeAvailable(t)) { return 0; }
  
      return (_.isUndefined(this.options.blockTypeLimits[t])) ? 0 : this.options.blockTypeLimits[t];
    },
  
    /*
      Availability helper methods
      --
      Checks if the object exists within the instance of the Editor.
    */
    _isBlockTypeAvailable: function(t) {
      return !_.isUndefined(this.blockTypes[t]);
    },
  
    _ensureAndSetElements: function() {
      if(_.isUndefined(this.options.el) || _.isEmpty(this.options.el)) {
        SirTrevor.log("You must provide an el");
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
      this.$wrapper = this.$form.find('.st-blocks');
  
      return true;
    },
  
    /*
      Set our blockTypes
      These will either be set on a per Editor instance, or set on a global scope.
    */
    _setBlocksTypes: function() {
      this.blockTypes = flattern((_.isUndefined(this.options.blockTypes)) ? SirTrevor.Blocks : this.options.blockTypes);
    },
  
    /* Get our required blocks (if any) */
    _setRequired: function() {
      this.required = (_.isArray(this.options.required) && !_.isEmpty(this.options.required)) ? this.options.required : false;
    }
  });
  

  /* We need a form handler here to handle all the form submits */

  SirTrevor.bindFormSubmit = function(form) {
    if (!formBound) {
      SirTrevor.submittable();
      form.bind('submit', this.onFormSubmit);
      formBound = true;
    }
  };

  SirTrevor.onBeforeSubmit = function(should_validate) {
    // Loop through all of our instances and do our form submits on them
    var errors = 0;
    _.each(SirTrevor.instances, function(inst, i) {
      errors += inst.onFormSubmit(should_validate);
    });
    SirTrevor.log("Total errors: " + errors);

    return errors;
  };

  SirTrevor.onFormSubmit = function(ev) {
    var errors = SirTrevor.onBeforeSubmit();

    if(errors > 0) {
      SirTrevor.publish("onError");
      ev.preventDefault();
    }
  };

  SirTrevor.runOnAllInstances = function(method) {
    if (_.has(SirTrevor.Editor.prototype, method)) {
      // augment the arguments pseudo array and pass on to invoke()
      // this allows us to pass arguments on to the target methods
      [].unshift.call(arguments, SirTrevor.instances);
      _.invoke.apply(_, arguments);
    } else {
      SirTrevor.log("method doesn't exist");
    }
  };

}(jQuery, _));
