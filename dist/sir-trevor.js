(function ($, _){
  
  var root = this,
      SirTrevor;
   
  SirTrevor = root.SirTrevor = {};
  SirTrevor.DEBUG = false;
  SirTrevor.SKIP_VALIDATION = false;
  
  /*
   Define default attributes that can be extended through an object passed to the
   initialize function of SirTrevor
  */
  
  SirTrevor.DEFAULTS = {
    baseCSSClass: "sir-trevor",
    errorClass: "error",
    defaultType: "Text",
    spinner: {
      className: 'spinner',
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
    marker: {
      baseCSSClass: "marker",
      buttonClass: "button",
      addText: "Click to add:",
      dropText: "Drop to place content"
    },
    formatBar: {
      baseCSSClass: "formatting-control"
    },
    blockLimit: 0,
    blockTypeLimits: {},
    required: [],
    uploadUrl: '/attachments',
    baseImageUrl: '/sir-trevor-uploads/'
  };

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
    ev.stopPropagation();
  }
  
  function controlKeyDown(ev){
    return (ev.which == 17 || ev.which == 224);
  }
  
  function isElementNear($element, distance, event) {
    var left = $element.offset().left - distance,
        top = $element.offset().top - distance,
        right = left + $element.width() + ( 2 * distance ),
        bottom = top + $element.height() + ( 2 * distance ),
        x = event.pageX,
        y = event.pageY;
  
    return ( x > left && x < right && y > top && y < bottom );
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
      halt(e);
    }
  
    function dragLeave(e) {
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
  
  // The self-propagating extend function that Backbone classes use.
  var extend = function(protoProps, classProps) {
    return inherits(this, protoProps, classProps);
  };
  
  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function(){};
  
  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;
  
    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ parent.apply(this, arguments); };
    }
  
    // Inherit class (static) properties from parent.
    _.extend(child, parent);
  
    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  
    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);
  
    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);
  
    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;
  
    // Set a convenience property in case the parent's prototype is needed later.
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
    
    var uid  = [block.instance.ID, (new Date()).getTime(), 'raw'].join('-');
    
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
      url: block.instance.options.uploadUrl,
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
  
  var Block = SirTrevor.Block = function(instance, data) {
    this.instance = instance;
    this.type = this._getBlockType();
    
    this.store("create", this, { data: data });
    
    this.uploadsCount = 0;
    this.blockID = _.uniqueId(this.className + '-');
      
    this._setBaseElements();
    this._bindFunctions();
    
    this.render();
    
    this.initialize.apply(this, arguments);
  };
  
  var blockOptions = [
    "className",
    "toolbarEnabled",
  	"formattingEnabled",
    "dropEnabled",
    "title",
    "limit",
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
  
  _.extend(Block.prototype, FunctionBind, {
    
    bound: ["_handleDrop", "_handleContentPaste", "onBlockFocus", "onBlockBlur", "onDrop", "onDragStart", "onDragEnd"],
    
    $: function(selector) {
      return this.$el.find(selector);
    },
    
    $$: function(selector) {
      return this.$editor.find(selector);
    },
    
    /* Defaults to be overriden if required */
    className: '',
    title: '',
    limit: 0,
    editorHTML: '<div></div>',
    dropzoneHTML: '<div class="dropzone"><p>Drop content here</p></div>',
    toolbarEnabled: true,
    dropEnabled: false,
  	formattingEnabled: true,
    
    initialize: function() {},
    
    loadData: function(data) {},
    onBlockRender: function(){},
    beforeBlockRender: function(){},
    setTextLimit: function() {},
    toMarkdown: function(markdown){ return markdown; },
    toHTML: function(html){ return html; },
    
    store: function(){
      return SirTrevor.blockStore.apply(this, arguments);
    },
    
    render: function() {
      
      this.beforeBlockRender();
          
      // Insert before the marker
      this.instance.marker.hide();
      this.instance.marker.$el.before(this.$el);
      
      // Do we have a dropzone?
      if (this.dropEnabled) {
        this._initDragDrop();
      }
      
      // Has data already?
      var currentData = this.getData();
      
      if (!_.isUndefined(currentData) && !_.isEmpty(currentData)) {
        this._loadData();
      }
      
      // And save the state
      this.save();
      
      // Add UI elements
      this.$el.append($('<span>',{ 'class': this.instance.baseCSS("drag-handle"), draggable: true }));
      this.$el.append($('<span>',{ 'class': this.instance.baseCSS("remove-block") }));
      
      // Stop events propagating through to the container
      this.$el
        .bind('drop', halt)
        .bind('mouseover', halt)
        .bind('mouseout', halt)
        .bind('dragleave', halt)
        .bind('mouseover', function(ev){ $(this).siblings().removeClass('active'); $(this).addClass('active'); })
        .bind('mouseout', function(ev){ $(this).removeClass('active'); })
        .bind('dragover', function(ev){ ev.preventDefault(); });
  
      // Handle pastes
      this._initPaste();
      
      // Delete
      this.$('.' + this.instance.baseCSS("remove-block")).bind('click', this.onDeleteClick);
      
      // Handle text blocks
      if (this.$$('.text-block').length > 0) {
        document.execCommand("styleWithCSS", false, false);
        document.execCommand("insertBrOnReturn", false, true);
        
        // Strip out all the HTML on paste
        this.$$('.text-block')
          .bind('paste', this._handleContentPaste)
          .bind('focus', this.onBlockFocus)
          .bind('blur', this.onBlockBlur);
        
        // Formatting
        this._initFormatting();
      }
      
      // Focus if we're adding an empty block, but only if not
  		// the only block (i.e. page has just loaded a new editor)
      if (_.isEmpty(currentData.data) && this.instance.blocks.length > 0) {
        var inputs = this.$$('[contenteditable="true"], input');
        if (inputs.length > 0 && !this.dropEnabled) {
          inputs[0].focus();
        }
      }
      
      // Reorderable
      this._initReordering();
      
      // Set ready state
      this.$el.addClass(this.instance.baseCSS('item-ready'));
      
      this.setTextLimit();
      this.onBlockRender();
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
      
      if(!_.isUndefined(this.spinner)) {
        this.ready();
      }
      
      this.spinner = new Spinner(this.instance.options.spinner);
      this.spinner.spin(this.$el[0]);
      
      this.$el.addClass('loading');
    },
    
    ready: function() {
      this.$el.removeClass('loading');
      if (!_.isUndefined(this.spinner)) {
        this.spinner.stop();
        delete this.spinner;
      }
    },
    
    /* Generic implementations */
    
    validate: function() {
      
      this._beforeValidate();
      
      var fields = this.$$('.required, [data-maxlength]'),
          errors = 0;
          
      _.each(fields, _.bind(function(field) {
        field = $(field);
        var content = (field.attr('contenteditable')) ? field.text() : field.val(),
            too_long = (field.attr('data-maxlength') && field.too_long()),
            required = field.hasClass('required');
  
        if ((required && content.length === 0) || too_long) {
          // Error!
          field.addClass(this.instance.baseCSS(this.instance.options.errorClass));
          errors++;
        }
      }, this));
  
      if (errors > 0) {
        this.$el.addClass(this.instance.baseCSS('block-with-errors'));
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
      if (this.$$('.text-block').length > 0) {
        var content = this.$$('.text-block').html();
        if (content.length > 0) {
          dataObj.text = this.instance._toMarkdown(content, this.type);
        }
      }
      
      var hasTextAndData = (!_.isUndefined(dataObj.text) || this.$$('.text-block').length === 0);
      
      // Add any inputs to the data attr
      if(this.$$('input[type="text"]').not('.paste-block').length > 0) {
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
    
    /*
    * Event handlers
    */
    
    onDrop: function(dataTransferObj) {},
  
    onDragStart: function(ev){
      var item = $(ev.target);
      ev.originalEvent.dataTransfer.setDragImage(item.parent()[0], 13, 25);
      ev.originalEvent.dataTransfer.setData('Text', item.parent().attr('id'));
      item.parent().addClass('dragging');
      this.instance.formatBar.hide();
    },
    
    onDragEnd: function(ev){
      var item = $(ev.target);
      item.parent().removeClass('dragging');
      this.instance.marker.hide();
      this.instance.formatBar.show();
    },
    
    onDeleteClick: function(ev) {
      if (confirm('Are you sure you wish to delete this content?')) {
        this.instance.removeBlock(this);
        halt(ev);
      }
    },
    
    onContentPasted: function(ev){
      var textBlock = this.$$('.text-block');
      if (textBlock.length > 0) {
        textBlock.html(this.instance._toHTML(this.instance._toMarkdown(textBlock.html(), this.type),this.type));
      }
    },
  
    onBlockFocus: function(e) {
      this.$el.addClass('focussed');
    },
  
    onBlockBlur: function(e) {
      this.$el.removeClass('focussed');
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
      
      if(this.dropEnabled) {
        this.$dropzone.hide();
        this.$editor.show();
      }
      
      SirTrevor.publish("editor/block/loadData");
      
      this.loadData(this.getData());
      this.ready();
    },
    
    _beforeValidate: function() {
      this.errors = [];
      var errorClass = this.instance.baseCSS("error");
      this.$el.removeClass(this.instance.baseCSS('block-with-errors'));
      this.$('.' + errorClass).removeClass(errorClass);
      this.$('.error-marker').remove();
    },
    
    _handleContentPaste: function(ev) {
      // We need a little timeout here
      var timed = function(ev){
        // Delegate this off to the super method that can be overwritten
        this.onContentPasted(ev);
      };
      _.delay(_.bind(timed, this, ev), 100);
    },
    
    _handleDrop: function(e) {
      
      e.preventDefault();
      e = e.originalEvent;
      
      SirTrevor.publish("editor/block/handleDrop");
    
      var el = $(e.target),
          types = e.dataTransfer.types,
          type, data = [];
      
      this.instance.marker.hide();
      this.$dropzone.removeClass('drag-enter');
          
      /*
        Check the type we just received,
        delegate it away to our blockTypes to process
      */
      
      if (!_.isUndefined(types)) {
        if (_.include(types, 'Files') || _.include(types, 'text/plain') || _.include(types, 'text/uri-list')) {
          this.onDrop(e.dataTransfer);
        }
      }
    },
  
    _setBaseElements: function(){
      var el = (_.isFunction(this.editorHTML)) ? this.editorHTML() : this.editorHTML;
      
      // Set
      var editor = $('<div>', {
        'class': this.instance.baseCSS("editor-block") + ' ' + this._getBlockClass(),
        html: el
      });
      
      this.$el = $('<div>', {
        'class': this.instance.baseCSS("block"),
        id: this.blockID,
        "data-type": this.type,
        "data-instance": this.instance.ID,
        html: editor
      });
      
      // Set our element references
      this.el = this.$el[0];
      this.$editor = editor;
    },
    
    _getBlockType: function() {
      var objName = "";
      for (var block in SirTrevor.Blocks) {
        if (SirTrevor.Blocks[block].prototype == Object.getPrototypeOf(this)) {
          objName = block;
        }
      }
      return objName;
    },
  
    _getBlockClass: function() {
      return this.className + '-block';
    },
    
    /*
    * Init functions for adding functionality
    */
    
    _initDragDrop: function() {
      SirTrevor.log("Adding drag and drop capabilities for block " + this.blockID);
      
      this.$dropzone = $("<div>", {
        html: this.dropzoneHTML,
        'class': "dropzone " + this._getBlockClass()
      });
      this.$el.append(this.$dropzone);
      this.$editor.hide();
  
      // Bind our drop event
      this.$dropzone.bind('drop', this._handleDrop)
                    .bind('dragenter', function(e) { halt(e); $(this).addClass('drag-enter'); })
                    .bind('dragover', function(e) {
                      e.originalEvent.dataTransfer.dropEffect = "copy";
                      halt(e);
                      $(this).addClass('drag-enter');
                    })
                    .bind('dragleave', function(e) { halt(e); $(this).removeClass('drag-enter'); });
    },
    
    _initReordering: function() {
      this.$('.' + this.instance.baseCSS("drag-handle"))
        .bind('dragstart', this.onDragStart)
        .bind('dragend', this.onDragEnd)
        .bind('drag', this.instance.marker.show);
    },
    
    _initFormatting: function() {
      // Enable formatting keyboard input
      var formatter;
      for (var name in this.instance.formatters) {
        if (this.instance.formatters.hasOwnProperty(name)) {
          formatter = SirTrevor.Formatters[name];
          if (!_.isUndefined(formatter.keyCode)) {
            formatter._bindToBlock(this.$editor);
          }
        }
      }
    },
    
    _initPaste: function() {
      this.$('.paste-block')
        .bind('click', function(){ $(this).select(); })
        .bind('paste', this._handleContentPaste)
        .bind('submit', this._handleContentPaste);
    },
    
    _initTextLimits: function() {
      this.$$('input[maxlength!=-1][maxlength!=524288][maxlength!=2147483647]').limit_chars();
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
        .on('keyup','.text-block', function(ev) {
          if(ev.which == 17 || ev.which == 224) { 
            ctrlDown = false;
          }
        })
        .on('keydown','.text-block', { formatter: formatter }, function(ev) {
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
    
    title: "Quote",
    className: "quote",
    limit: 0,
    
    editorHTML: function() {
      return _.template('<blockquote class="required text-block <%= className %>" contenteditable="true"></blockquote><div class="input text"><label>Credit</label><input maxlength="140" name="cite" class="input-string required" type="text" /></div>', this);
    },
    
    loadData: function(data){
      this.$$('.text-block').html(this.instance._toHTML(data.text, this.type));
      this.$$('input').val(data.cite);
    },
    
    toMarkdown: function(markdown) {
      return markdown.replace(/^(.+)$/mg,"> $1");
    }
    
  });
  /*
    Gallery
  */
  
  var dropzone_templ = "<p>Drop images here</p><div class=\"input submit\"><input type=\"file\" multiple=\"multiple\" /></div><button>...or choose file(s)</button>";
  
  SirTrevor.Blocks.Gallery = SirTrevor.Block.extend({ 
    
    title: "Gallery",
    className: "gallery",
    dropEnabled: true,
    editorHTML: "<div class=\"gallery-items\"><p>Gallery Contents:</p><ul></ul></div>",
    dropzoneHTML: dropzone_templ,
    
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
    Simple Image Block
  */
  
  var dropzone_templ = "<p>Drop image here</p><div class=\"input submit\"><input type=\"file\" /></div><button>...or choose a file</button>";
  
  
  SirTrevor.Blocks.Image = SirTrevor.Block.extend({ 
    
    title: "Image",
    className: "image",
    dropEnabled: true,
    
    dropzoneHTML: dropzone_templ,
    
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
    
    title: "Text",
    className: "text",
    limit: 0,
    
    editorHTML: '<div class="required text-block" contenteditable="true"></div>',
    
    loadData: function(data){
      this.$$('.text-block').html(this.instance._toHTML(data.text, this.type));
    }
  });
  var t_template = '<p>Drop tweet link here</p><div class="input text"><label>or paste URL:</label><input type="text" class="paste-block"></div>';
  var tweet_template = '<div class="tweet"><img src="<%= user.profile_image_url %>" class="tweet-avatar"><div class="tweet-body"><p class="tweet-user"><a href="http://twitter.com/#!/<%= user.screen_name %>" class="tweet-user">@<%= user.screen_name %></a> on Twitter</p><p class="tweet-text"><%= text %></p><time><%= created_at %></time></div></div>';
  
  SirTrevor.Blocks.Tweet = SirTrevor.Block.extend({ 
    
    title: "Tweet",
    className: "tweet",
    dropEnabled: true,
    
    dropzoneHTML: t_template,
    
    loadData: function(data){
      this.$editor.html(_.template(tweet_template, data));
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
  
  var template = '<div class="text-block <%= className %>" contenteditable="true"></div>';
  
  SirTrevor.Blocks.Ul = SirTrevor.Block.extend({ 
    
    title: "List",
    className: "list",
    
    editorHTML: function() {
      return _.template(template, this);
    },
    
    onBlockRender: function() {
      this.$$('.text-block').bind('click', function(){
        if($(this).html().length === 0){
          document.execCommand("insertUnorderedList",false,false);
        }
      });
      
      // Put in a list
      if (_.isEmpty(this.data)) {
        this.$$('.text-block').focus().click();
      }
      
    },
      
    loadData: function(data){
      this.$$('.text-block').html("<ul>" + this.instance._toHTML(data.text, this.type) + "</ul>");
    },
    
    toMarkdown: function(markdown) {
      return markdown.replace(/<\/li>/mg,"\n")
                     .replace(/<\/?[^>]+(>|$)/g, "")
                     .replace(/^(.+)$/mg," - $1"); 
    },
    
    toHTML: function(html) {
  		html = html.replace(/^ - (.+)$/mg,"<li>$1</li>")
  							 .replace(/\n/mg,"");
  							
  		html = "<ul>" + html + "</ul>"
  		
  		return html
    }
  
  });
  var video_drop_template = '<p>Drop video link here</p><div class="input text"><label>or paste URL:</label><input type="text" class="paste-block"></div>';
  var video_regex = /http[s]?:\/\/(?:www.)?(?:(vimeo).com\/(.*))|(?:(youtu(?:be)?).(?:be|com)\/(?:watch\?v=)?([^&]*)(?:&(?:.))?)/;
  
  SirTrevor.Blocks.Video = SirTrevor.Block.extend({ 
    
    title: "Video",
    className: "video",
    dropEnabled: true,
    
    dropzoneHTML: video_drop_template,
    
    loadData: function(data){    
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
    title: "B",
    className: "bold",
    cmd: "bold",
    keyCode: 66
  });
  
  var Italic = SirTrevor.Formatter.extend({
    title: "I",
    className: "italic",
    cmd: "italic",
    keyCode: 73
  });
  
  var Underline = SirTrevor.Formatter.extend({
    title: "U",
    className: "underline",
    cmd: "underline"
  });
  
  var Link = SirTrevor.Formatter.extend({
    
    title: "Link",
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
    title: "Unlink",
    className: "link",
    cmd: "unlink"
  });
  
  /*
    Create our formatters and add a static reference to them
  */
  SirTrevor.Formatters.Bold = new Bold();
  SirTrevor.Formatters.Italic = new Italic();
  SirTrevor.Formatters.Link = new Link();
  SirTrevor.Formatters.Unlink = new UnLink();
  /* Marker */
  /*
    SirTrevor Marker
    --
    This is our toolbar. It's attached to a SirTrveor.Editor instance. 
  */
  
  var Marker = SirTrevor.Marker = function(options, editorInstance){
    this.instance = editorInstance;
    this.options = _.extend({}, SirTrevor.DEFAULTS.marker, options || {});
    this._bindFunctions();
  };
  
  _.extend(Marker.prototype, FunctionBind, {
    
    bound: ["onButtonClick", "show", "hide", "onDrop"],
    
    render: function() {
  
      var marker = $('<div>', {
        'class': this.instance.baseCSS(this.options.baseCSSClass),
        html: '<p>' + this.options.addText + '</p>'
      });
  
      var btns_cont = $("<div>", {
        'class': this.instance.baseCSS("buttons")
      });
  
      marker.append(btns_cont);
      
      // Bind to the wrapper
      this.instance.$wrapper.append(marker);
      
      // Cache our elements for later use
      this.$el = marker;
      this.$btns = btns_cont;
      this.$p = this.$el.find('p');
      
      // Add all of our buttons
      var blockName, block;
      
      for (blockName in this.instance.blockTypes) {
        if (SirTrevor.Blocks.hasOwnProperty(blockName)) {
          block = SirTrevor.Blocks[blockName];
          if (block.prototype.toolbarEnabled) {
            this.$btns.append(
             $("<a>", {
              "href": "#",
              "class": this.instance.baseCSS(this.options.buttonClass) + " new-" + block.prototype.className,
              "data-type": blockName,
              "text": block.prototype.title,
              click: this.onButtonClick
             })
            );
          }
        }
      }
      
      // Do we have any buttons?
      if(this.$btns.children().length === 0) this.$el.addClass('hidden');
      
      // Bind our marker to the wrapper
      var throttled_show = _.throttle(this.show, 0),
          throttled_hide = _.throttle(this.hide, 0);
  
      this.instance.$outer.bind('mouseover', throttled_show)
                          .bind('mouseout', throttled_hide)
                          .bind('dragover', throttled_show);
  
      this.$el.bind('dragover', halt);
      
      // Bind the drop function onto here
      this.instance.$outer.dropArea()
                          .bind('dragleave', throttled_hide)
                          .bind('drop', this.onDrop);
      
      this.$el.addClass(this.instance.baseCSS("item-ready"));
    },
      
    show: function(ev) {
      var target = $(ev.target),
          target_parent = target.parent();
  
      if (target.is(this.$el) || target.is(this.$btns) || target_parent.is(this.$el) || target_parent.is(this.$btns)) {
        this.$el.addClass(this.instance.baseCSS("item-ready"));
        return;
      }
  
      if(ev.type == 'drag' || ev.type == 'dragover') {
        this.$el.addClass('drop-zone');
        this.$p.text(this.options.dropText);
        this.$btns.hide();
      } else {
        this.$el.removeClass('drop-zone');
        this.$p.text(this.options.addText);
        this.$btns.show();
      }
  
      // Check to see we're not over the formatting bar
      if (target.is(this.instance.formatBar.$el) || target_parent.is(this.instance.formatBar.$el)) {
        return this.hide();
      }
      
      var mouse_enter = (ev) ? ev.originalEvent.pageY : 0;
    
      // Do we have any sedit blocks?
      if (this.instance.blocks.length > 0) {
      
        // Find the closest block to this position
        var closest_block = this.findClosestBlock(mouse_enter);
              
        // Position it
        if (closest_block) {
          this.$el.insertBefore(closest_block);
        } else if(mouse_enter > 0) {
          this.$el.insertAfter(this.instance.cachedDomBlocks.last());
        } else {
          this.$el.insertBefore(this.instance.cachedDomBlocks.first());
        }
      }
      this.$el.addClass(this.instance.baseCSS("item-ready"));
    },
  
    hide: function(ev){
      this.$el.removeClass(this.instance.baseCSS("item-ready"));
    },
    
    onDrop: function(ev){
      ev.preventDefault();
         
      var marker = this.$el,
          item_id = ev.originalEvent.dataTransfer.getData("text/plain"),
          block = $('#' + item_id);
          
      if (!_.isUndefined(item_id) && !_.isEmpty(block) && block.attr('data-instance') == this.instance.ID) {
        marker.after(block);
      }
    },
  
    findClosestBlock: function(mouse_enter) {
      var closest_block = false;
  
      var blockIterator = function(block, index) {
        block = $(block);
  
        var block_top = block.offset().top - 40,
            block_bottom = block.offset().top + block.outerHeight(true) - 40;
  
        if(block_top <= mouse_enter && mouse_enter < block_bottom) {
          closest_block = block;
        }
      };
      _.each(this.instance.cachedDomBlocks, _.bind(blockIterator, this));
  
      return closest_block;
    },
    
    remove: function(){ this.$el.remove(); },
  
    onButtonClick: function(ev){
      halt(ev);
      var button = $(ev.target);
      
      if (button.hasClass('inactive')) {
        alert('You cannot create any more blocks of this type');
        return false;
      }
      
      this.instance.createBlock(button.attr('data-type'), {});
    },
    
    move: function(top) {
      this.$el.css({ top: top })
              .show()
              .addClass(this.instance.baseCSS("item-ready"));
    }
  });
  
  
  
  /* FormatBar */
  /*
    Format Bar
    --
    Displayed on focus on a text area.
    Renders with all available options for the editor instance
  */
  
  var FormatBar = SirTrevor.FormatBar = function(options, editorInstance) {
    this.instance = editorInstance;
    this.options = _.extend({}, SirTrevor.DEFAULTS.formatBar, options || {});
    this.className = this.instance.baseCSS(this.options.baseCSSClass);
    this.clicked = false;
    this._bindFunctions();
  };
  
  _.extend(FormatBar.prototype, FunctionBind, {
    
    bound: ["onFormatButtonClick"],
    
    render: function(){
      var bar = $("<div>", {
        "class": this.className
      });
      
      this.instance.$wrapper.prepend(bar);
      this.$el = bar;
      
      var formats = this.instance.formatters,
          formatName, format;
          
      for (formatName in formats) {
        if (SirTrevor.Formatters.hasOwnProperty(formatName)) {
          format = SirTrevor.Formatters[formatName];
          $("<button>", {
            'class': this.instance.baseCSS("format-button"),
            'text': format.title,
            'data-type': formatName,
            'data-cmd': format.cmd,
            click: this.onFormatButtonClick
          }).appendTo(this.$el);
        }
      }
      
      var throttled_scroll = _.throttle(_.bind(this.handleDocumentScroll, this), 150);
      $(document).bind('scroll', throttled_scroll);
  
      if(this.$el.find('button').length === 0) this.$el.addClass('hidden');
      this.show();
    },
  
    handleDocumentScroll: function() {
      var instance_height = this.instance.$outer.height(),
          instance_offset = this.instance.$outer.offset().top,
          viewport_top = $(document).scrollTop();
  
      if (this.$el.hasClass('fixed')) {
        instance_offset = this.$el.offset().top;
      }
  
      if ((viewport_top > 5) && viewport_top >= instance_offset) {
        this.$el.addClass('fixed')
                .css({ 'width': this.instance.$wrapper.width() });
  
        this.instance.$wrapper.css({ 'padding-top': '104px' });
      } else {
        this.$el.removeClass('fixed').css({ 'width': '100%' });
        this.instance.$wrapper.css({ 'padding-top': '16px' });
      }
    },
  
    hide: function() {
      this.$el.removeClass(this.instance.baseCSS('item-ready'));
    },
  
    show: function() {
      this.$el.addClass(this.instance.baseCSS('item-ready'));
    },
  
    remove: function(){ this.$el.remove(); },
    
    onFormatButtonClick: function(ev){
      halt(ev);
  
      var btn = $(ev.target),
          format = SirTrevor.Formatters[btn.attr('data-type')];
       
      // Do we have a click function defined on this formatter?
      if(!_.isUndefined(format.onClick) && _.isFunction(format.onClick)) {
        format.onClick(); // Delegate
      } else {
        // Call default
        document.execCommand(btn.attr('data-cmd'), false, format.param);
      }
      // Make sure we still show the bar
      this.show();
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
    this.formatters = {};
    this.blockCounts = {}; // Cached block type counts
    this.blocks = []; // Block references
    this.errors = [];
    this.cachedDomBlocks = [];
    this.options = _.extend({}, SirTrevor.DEFAULTS, options || {});
    this.ID = _.uniqueId(this.options.baseCSSClass + "-");
    
    if (this._ensureAndSetElements()) {
      
      this.marker = new SirTrevor.Marker(this.options.marker, this);
      this.formatBar = new SirTrevor.FormatBar(this.options.formatBar, this);
      
      if(!_.isUndefined(this.options.onEditorRender) && _.isFunction(this.options.onEditorRender)) {
        this.onEditorRender = this.options.onEditorRender;
      }
      
      this._setRequired();
      this._setBlocksAndFormatters();
      this._bindFunctions();
      
      this.store("create", this); // Make our storage
      this.build();
      
      SirTrevor.instances.push(this); // Store a reference to this instance
      SirTrevor.bindFormSubmit(this.$form);
    }
  };
  
  _.extend(SirTrevorEditor.prototype, FunctionBind, {
    
    bound: ['onFormSubmit'],
    
    initialize: function() {},
    
    /*
      Build the Editor instance. 
      Check to see if we've been passed JSON already, and if not try and create a default block.
      If we have JSON then we need to build all of our blocks from this.
    */
    build: function() {
      this.$el.hide();
      
      // Render marker & format bar
      this.marker.render();
      this.formatBar.render();
      
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
          
      this.$wrapper.addClass('sir-trevor-ready');
      
      if(!_.isUndefined(this.onEditorRender)) {
        this.onEditorRender();
      }
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
    createBlock: function(type, data) {
      
      type = _.capitalize(type); // Proper case
      
      if (this._blockTypeAvailable(type)) {
        
       var blockType = SirTrevor.Blocks[type],
           currentBlockCount = (_.isUndefined(this.blockCounts[type])) ? 0 : this.blockCounts[type],
           totalBlockCounts = this.blocks.length,
           blockTypeLimit = this._getBlockTypeLimit(type);
           
       // Can we have another one of these blocks?
       if ((blockTypeLimit !== 0 && currentBlockCount > blockTypeLimit) || this.options.blockLimit !== 0 && totalBlockCounts >= this.options.blockLimit) {
         SirTrevor.log("Block Limit reached for type " + type);
         return false;
       }
       
       var block = new blockType(this, data || {});
       
       if (_.isUndefined(this.blockCounts[type])) {
         this.blockCounts[type] = 0;
       }
       
       this.blocks.push(block);
       currentBlockCount++;
       this.blockCounts[type] = currentBlockCount;
       
       // Check to see if we can add any more blocks
       if (this.options.blockLimit !== 0 && this.blocks.length >= this.options.blockLimit) {
         this.marker.$el.addClass('hidden');
       }
        
       if (blockTypeLimit !== 0 && currentBlockCount >= blockTypeLimit) {
         SirTrevor.log("Block Limit reached for type " + type + " setting state as inactive");
         this.marker.$el.find('[data-type="' + type + '"]')
          .addClass('inactive')
          .attr('title','You have reached the limit for this type of block');
       }
       
       SirTrevor.publish("editor/block/createBlock");
        
       SirTrevor.log("Block created of type " + type);
       this.cachedDomBlocks = this.$wrapper.find('.' + this.baseCSS("block"));
      } else {
        SirTrevor.log("Block type not available " + type);
      }
    },
    
    removeBlock: function(block) {
      // Blocks exist purely on the dom.
      // Remove the block and decrement the blockCount
      block.remove();
      this.blockCounts[block.type] = this.blockCounts[block.type] - 1;
      
      // Remove the block from our store
      this.blocks = _.reject(this.blocks, function(item){ return (item.blockID == block.blockID); });
      if(_.isUndefined(this.blocks)) this.blocks = [];
      
      SirTrevor.publish("editor/block/removeBlock");
      this.cachedDomBlocks = this.$wrapper.find('.' + this.baseCSS("block"));
      
      // Remove our inactive class if it's no longer relevant
      if(this._getBlockTypeLimit(block.type) > this.blockCounts[block.type]) {
        SirTrevor.log("Removing block limit for " + block.type);
        this.marker.$el.find('[data-type="' + block.type + '"]')
          .removeClass('inactive')
          .attr('title','Add a ' + block.type + ' block');
      }
    },
    
    performValidations : function(_block, should_validate) {
      
      var errors = 0;
      
      if (!SirTrevor.SKIP_VALIDATION && should_validate) {
        if(!_block.validate()){
          // fail validations
          SirTrevor.log("Block " + _block.blockID + " failed validation");
          ++errors;
        }
      } else {
        // not validating so clear validation warnings
        _block._beforeValidate();
      }
      
      // success
      var store = _block.save();
      if(!_.isEmpty(store.data)) {
        SirTrevor.log("Adding data for block " + _block.blockID + " to block store");
        this.store("add", this, { data: store });
      }
      return errors;
    },
    
    /*
      Handle a form submission of this Editor instance.
      Validate all of our blocks, and serialise all data onto the JSON objects
    */
    onFormSubmit: function(should_validate) {
      
      // if undefined or null or anything other than false - treat as true
      should_validate = (should_validate === false) ? false : true;
      
      SirTrevor.log("Handling form submission for Editor " + this.ID);
      
      var blockLength, block, result, errors = 0;
      
      this.removeErrors();
      // Reset our store
      this.store("reset", this);
      
      // Loop through blocks to validate
      var blockIterator = function(block,index) {
        // Find our block
        block = $(block);
        var _block = _.find(this.blocks, function(b){ return (b.blockID == block.attr('id')); });
        
        if (!_.isUndefined(_block) || !_.isEmpty(_block) || typeof _block == SirTrevor.Block) {
          // Validate our block
          errors += this.performValidations(_block, should_validate);
        }
        
      };
      _.each(this.$wrapper.find('.' + this.options.baseCSSClass + "-block"), _.bind(blockIterator, this));
  
      // Validate against our required fields (if there are any)
      if (this.required && (!SirTrevor.SKIP_VALIDATION && should_validate)) {
        _.each(this.required, _.bind(function(type) {
        
          if (this._blockTypeAvailable(type)) {
            // Valid block type to validate against
            if (_.isUndefined(this.blockCounts[type]) || this.blockCounts[type] === 0) {
              
              this.errors.push({ text: "You must have a block of type " + type });
              
              SirTrevor.log("Failed validation on required block type " + type);
              errors++;
              
            } else {
              // We need to also validate that we have some data of this type too.
              // This is ugly, but necessary for proper validation on blocks that don't have required fields.
              var blocks = _.filter(this.blocks, function(b){ return (b.type == type && !_.isEmpty(b.getData())); });
              
              if (blocks.length === 0) {
                this.errors.push({ text: "A required block type " + type + " is empty" });
                errors++;
                SirTrevor.log("A required block type " + type + " is empty");
              }
              
            }
          }
        }, this));
      }
  
      // Save it
      this.store("save", this);
      
      if (errors > 0) this.renderErrors();
      
      return errors;
    },
    
    renderErrors: function() {
      if (this.errors.length > 0) {
        
        if (_.isUndefined(this.$errors)) {
          this.$errors = $("<div>", {
            'class': this.baseCSS("errors"),
            html: "<p>You have the following errors: </p><ul></ul>"
          });
          this.$outer.prepend(this.$errors);
        }
        
        var list = this.$errors.find('ul');
        
        _.each(this.errors, _.bind(function(error) {
          list.append($("<li>", {
            'class': this.baseCSS("error-msg"),
            html: error.text
          }));
        }, this));
        
        this.$errors.show();
      }
    },
    
    removeErrors: function() {
      if (this.errors.length > 0) {
        // We have old errors to remove
        this.$errors.find('ul').html(''); 
        this.$errors.hide();
        this.errors = [];
      }
    },
    
    /*
      Get Block Type Limit
      --
      returns the limit for this block, which can be set on a per Editor instance, or on a global blockType scope.
    */
    _getBlockTypeLimit: function(t) {
      if (this._blockTypeAvailable(t)) {
        return (_.isUndefined(this.options.blockTypeLimits[t])) ? SirTrevor.Blocks[t].prototype.limit : this.options.blockTypeLimits[t];
      }
      return 0;
    },
    
    /* 
      Availability helper methods
      --
      Checks if the object exists within the instance of the Editor.
    */
    _blockTypeAvailable: function(t) {
      return !_.isUndefined(this.blockTypes[t]);
    },
    
    _formatterAvailable: function(f) {
      return !_.isUndefined(this.formatters[f]);
    },
    
    _ensureAndSetElements: function() {
      if(_.isUndefined(this.options.el) || _.isEmpty(this.options.el)) {
        SirTrevor.log("You must provide an el");
        return false;
      }
       
      this.$el = this.options.el;
      this.el = this.options.el[0];
      this.$form = this.$el.parents('form');
      
      var blockCSSClass = this.baseCSS("blocks");
  
      // Wrap our element in lots of containers *eww*
      this.$el.wrap($('<div>', { id: this.ID, 'class': this.options.baseCSSClass, dropzone: 'copy link move' }))
              .wrap($("<div>", { 'class': blockCSSClass }));
        
      this.$outer = this.$form.find('#' + this.ID);
      this.$wrapper = this.$outer.find("." + blockCSSClass);
  
      return true;
    },
    
    
    /*
      Set our blockTypes and formatters.
      These will either be set on a per Editor instance, or set on a global scope.
    */
    _setBlocksAndFormatters: function() {
      this.blockTypes = flattern((_.isUndefined(this.options.blockTypes)) ? SirTrevor.Blocks : this.options.blockTypes);
      this.formatters = flattern((_.isUndefined(this.options.formatters)) ? SirTrevor.Formatters : this.options.formatters);
    },
    
    /* Get our required blocks (if any) */
    _setRequired: function() {
      this.required = (_.isArray(this.options.required) && !_.isEmpty(this.options.required)) ? this.options.required : false;
    },
    
    /*
      A very generic HTML -> Markdown parser
      Looks for available formatters / blockTypes toMarkdown methods and calls these if they exist.
    */
    _toMarkdown: function(content, type) {
  
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
    },
    
    /*
      A very generic Markdown -> HTML parser
      Looks for available formatters / blockTypes toMarkdown methods and calls these if they exist.
    */
    _toHTML: function(markdown, type) {
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
    },
  
    baseCSS: function(additional) {
      return this.options.baseCSSClass + "-" + additional;
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
