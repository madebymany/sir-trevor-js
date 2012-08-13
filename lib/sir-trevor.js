// Sir Trevor, v0.0.1

(function ($, _){
  
  var root = this,
      SirTrevor;
   
  SirTrevor = root.SirTrevor = {}; 
   
  /* 
   Define default attributes that can be extended through an object passed to the
   initialize function of SirTrevor
  */
  
  SirTrevor.DEFAULTS = {
    
    baseCSSClass: "sir-trevor",
    blockStore: {
      data: []
    },
    defaultType: "TextBlock",
    spinner: {
      className: 'spinner',
      lines: 9, 
      length: 6, 
      width: 2, 
      radius: 5, 
      color: '#000', 
      speed: 1.4, 
      trail: 57, 
      shadow: false
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
    blockTypeLimits: {}
  }; 
  
  SirTrevor.BlockTypes = {};
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
      $(e.target).addClass("dragOver");
      halt(e);
      return false;
    }
  
    function dragOver(e) {
      e.originalEvent.dataTransfer.dropEffect = "copy";
      halt(e);
      return false;
    }
  
    function dragLeave(e) {
      $(e.target).removeClass("dragOver");
      halt(e);
      return false;
    }
  
    $.fn.dropArea = function(){
      this.bind("dragenter", dragEnter).
           bind("dragover",  dragOver).
           bind("dragleave", dragLeave);
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
  var o = $({});
  $.subscribe = function() {
    o.on.apply(o, arguments);
  };
  $.unsubscribe = function() {
    o.off.apply(o, arguments);
  };
  $.publish = function() {
    o.trigger.apply(o, arguments);
  };
  //fgnass.github.com/spin.js#v1.2.2
  (function(a,b,c){function n(a){var b={x:a.offsetLeft,y:a.offsetTop};while(a=a.offsetParent)b.x+=a.offsetLeft,b.y+=a.offsetTop;return b}function m(a){for(var b=1;b<arguments.length;b++){var d=arguments[b];for(var e in d)a[e]===c&&(a[e]=d[e])}return a}function l(a,b){for(var c in b)a.style[k(a,c)||c]=b[c];return a}function k(a,b){var e=a.style,f,g;if(e[b]!==c)return b;b=b.charAt(0).toUpperCase()+b.slice(1);for(g=0;g<d.length;g++){f=d[g]+b;if(e[f]!==c)return f}}function j(a,b,c,d){var g=["opacity",b,~~(a*100),c,d].join("-"),h=.01+c/d*100,j=Math.max(1-(1-a)/b*(100-h),a),k=f.substring(0,f.indexOf("Animation")).toLowerCase(),l=k&&"-"+k+"-"||"";e[g]||(i.insertRule("@"+l+"keyframes "+g+"{"+"0%{opacity:"+j+"}"+h+"%{opacity:"+a+"}"+(h+.01)+"%{opacity:1}"+(h+b)%100+"%{opacity:"+a+"}"+"100%{opacity:"+j+"}"+"}",0),e[g]=1);return g}function h(a,b,c){c&&!c.parentNode&&h(a,c),a.insertBefore(b,c||null);return a}function g(a,c){var d=b.createElement(a||"div"),e;for(e in c)d[e]=c[e];return d}var d=["webkit","Moz","ms","O"],e={},f,i=function(){var a=g("style");h(b.getElementsByTagName("head")[0],a);return a.sheet||a.styleSheet}(),o=function r(a){if(!this.spin)return new r(a);this.opts=m(a||{},r.defaults,p)},p=o.defaults={lines:12,length:7,width:5,radius:10,color:"#000",speed:1,trail:100,opacity:.25,fps:20},q=o.prototype={spin:function(a){this.stop();var b=this,c=b.el=l(g(),{position:"relative"}),d,e;a&&(e=n(h(a,c,a.firstChild)),d=n(c),l(c,{left:(a.offsetWidth>>1)-d.x+e.x+"px",top:(a.offsetHeight>>1)-d.y+e.y+"px"})),c.setAttribute("aria-role","progressbar"),b.lines(c,b.opts);if(!f){var i=b.opts,j=0,k=i.fps,m=k/i.speed,o=(1-i.opacity)/(m*i.trail/100),p=m/i.lines;(function q(){j++;for(var a=i.lines;a;a--){var d=Math.max(1-(j+a*p)%m*o,i.opacity);b.opacity(c,i.lines-a,d,i)}b.timeout=b.el&&setTimeout(q,~~(1e3/k))})()}return b},stop:function(){var a=this.el;a&&(clearTimeout(this.timeout),a.parentNode&&a.parentNode.removeChild(a),this.el=c);return this}};q.lines=function(a,b){function e(a,d){return l(g(),{position:"absolute",width:b.length+b.width+"px",height:b.width+"px",background:a,boxShadow:d,transformOrigin:"left",transform:"rotate("+~~(360/b.lines*c)+"deg) translate("+b.radius+"px"+",0)",borderRadius:(b.width>>1)+"px"})}var c=0,d;for(;c<b.lines;c++)d=l(g(),{position:"absolute",top:1+~(b.width/2)+"px",transform:"translate3d(0,0,0)",opacity:b.opacity,animation:f&&j(b.opacity,b.trail,c,b.lines)+" "+1/b.speed+"s linear infinite"}),b.shadow&&h(d,l(e("#000","0 0 4px #000"),{top:"2px"})),h(a,h(d,e(b.color,"0 0 1px rgba(0,0,0,.1)")));return a},q.opacity=function(a,b,c){b<a.childNodes.length&&(a.childNodes[b].style.opacity=c)},function(){var a=l(g("group"),{behavior:"url(#default#VML)"}),b;if(!k(a,"transform")&&a.adj){for(b=4;b--;)i.addRule(["group","roundrect","fill","stroke"][b],"behavior:url(#default#VML)");q.lines=function(a,b){function k(a,d,i){h(f,h(l(e(),{rotation:360/b.lines*a+"deg",left:~~d}),h(l(g("roundrect",{arcsize:1}),{width:c,height:b.width,left:b.radius,top:-b.width>>1,filter:i}),g("fill",{color:b.color,opacity:b.opacity}),g("stroke",{opacity:0}))))}function e(){return l(g("group",{coordsize:d+" "+d,coordorigin:-c+" "+ -c}),{width:d,height:d})}var c=b.length+b.width,d=2*c,f=e(),i=~(b.length+b.radius+b.width)+"px",j;if(b.shadow)for(j=1;j<=b.lines;j++)k(j,-2,"progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");for(j=1;j<=b.lines;j++)k(j);return h(l(a,{margin:i+" 0 0 "+i,zoom:1}),f)},q.opacity=function(a,b,c,d){var e=a.firstChild;d=d.shadow&&d.lines||0,e&&b+d<e.childNodes.length&&(e=e.childNodes[b+d],e=e&&e.firstChild,e=e&&e.firstChild,e&&(e.opacity=c))}}else f=k(a,"animation")}(),a.Spinner=o})(window,document);
  /*
    Underscore helpers
  */
  
  var url_regex = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
  
  _.mixin({
    isURI : function(string) {
      return (url_regex.test(string));
    }
  });
  /*
    Generic Block Type Implementation
    --
    Designed to be extended in a Backbone way to create new instances.
    Lots of the properties / methods defined 
  */
  
  var BlockType = SirTrevor.BlockType = function(options){
    this.instances = {};
    this.instanceCount = 0;
    this._configure(options || {});
    this.blockTypeID = _.uniqueId(this.className + '-');
    this.initialize.apply(this, arguments);
  };
  
  var blockTypeOptions = [
    "className", 
    "toolbarEnabled", 
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
    "onBlockActivated",
    "toMarkdown",
    "toHTML"
  ];
  
  _.extend(BlockType.prototype, {
    
    /* Defaults to be overriden if required */
    className: '',
    title: '',
    limit: 0,
    editorHTML: '<div></div>',
    dropzoneHTML: '<div></div>',
    toolbarEnabled: true,
    dropEnabled: false,
    
    initialize: function() {},
    
    loadData: function(data) {},
    onBlockRender: function(){},
    beforeBlockRender: function(){},
    onBlockActivated: function(){},
    onDrop: function(transferData){},
    onContentPasted: function(ev){},
    toMarkdown: function(markdown){ return markdown; },
    toHTML: function(html){ return html; },
      
    /*
      Generic toData implementation.
      Can be overwritten, although hopefully this will cover most situations
    */
    toData: function() {
      var bl = this.$el,
          dataStruct = bl.data('block'),
          content;
      
      /* Simple to start. Add conditions later */
      if (this.$('.text-block').length > 0) {
        content = this.$('.text-block').html();
        if (content.length > 0) {
          dataStruct.data.text = this.instance._toMarkdown(content, this.type);
        }
      }
      
      var hasTextAndData = (!_.isUndefined(dataStruct.data.text) || this.$('.text-block').length === 0);
      
      // Add any inputs to the data attr
      if(this.$('input[type="text"]').not('.paste-block').length > 0) {
        this.$('input[type="text"]').each(function(index,input){
          input = $(input);
          if (input.val().length > 0 && hasTextAndData) {
            dataStruct.data[input.attr('name')] = input.val();
          }
        });
      }
      
      this.$('select').each(function(index,input){
        input = $(input);
        if(input.val().length > 0 && hasTextAndData) {
          dataStruct.data[input.attr('name')] = input.val();
        }
      });
      
      this.$('input[type="file"]').each(function(index,input) {
        input = $(input);
        dataStruct.data.file = input.data('json');
      });
    },
    
    /*
      Generic validator
      --
      We look for 'required' properties on any fields / editable areas. 
      If we don't find any, then skip. If we do find some, then run validators against each of these.
    */
    
    validate: function() {
      var fields = this.$('.required'),
          errors = 0;
          
      _.each(fields, _.bind(function(field) {
        field = $(field);
        var content = (field.attr('contenteditable')) ? field.text() : field.val();
          
        if (content.length === 0) {
          // Error!
          field.addClass('error').before($("<div>", {
            'class': 'error-marker',
            'html': '!'
          }));
        } 
      }, this));
      
      return (errors === 0);
    },
    
    /* Helper / convienience methods */
    
    blockType: function() {
      var objName = "";
      for (var block in SirTrevor.BlockTypes) {
        if (SirTrevor.BlockTypes[block] == this) {
          objName = block;
        }
      } 
      return objName;
    },
    
    /* Configure */
    
    _configure: function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = blockTypeOptions.length; i < l; i++) {
        var attr = blockTypeOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    }
    
  });
  
  BlockType.extend = extend; // Allow our BlockTypes to be extended.
  /* A Block representation */
  
  var Block = SirTrevor.Block = function(instance, parentBlockType, data) {
    
    this.blockID = _.uniqueId(parentBlockType.blockTypeID + '_block-');
    
    this.instance = instance; // SirTrevor.Editor instance
    this.blockType = parentBlockType; // SirTrevor.BlockType
    
    this.data = data;
    this.type = this.blockType.blockType();  // Cache the blocktype. 
  
    this.errors = [];
    
    this._setElement();
    this._bindFunctions();
    this.render();
  };
  
  _.extend(Block.prototype, FunctionBind, {
    
    bound: ["onDeleteClick", "onContentPasted", "onBlockFocus", "onDrop"],
    
    regexs: {
      url: /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/m,
      video: /http[s]?:\/\/(?:www.)?(?:(vimeo).com\/(.*))|(?:(youtu(?:be)?).(?:be|com)\/(?:watch\?v=)?([^&]*)(?:&(?:.))?)/
    },
    
    $: function(selector) {
      return this.$el.find(selector);
    },
    
    render: function() {
      
      this._super("beforeBlockRender");
      
      this.$block = block = $('<div>', { 
        'class': this.instance.options.baseCSSClass + "-block", 
        id: this.blockID,
        "data-type": this.type,
        html: this.el
      });
      
      // Insert before the marker
      this.instance.formatBar.hide();
      this.instance.marker.hide();
      this.instance.marker.$el.before(block);
      
      // Do we have a dropzone? 
      if (this.blockType.dropEnabled) {
        this.$dropzone = $("<div>", {
          html: this.blockType.dropzoneHTML,
          class: "dropzone"
        });
        this.$block.append(this.$dropzone);
        this.$el.hide();
      }
      
      // Has data already?
      if (!_.isUndefined(this.data) && !_.isEmpty(this.data)) {
        this.loadData();
      }
      
      // And save the state
      this.save();
      
      // Add UI elements
      block.append($('<span>',{ 'class': 'handle', draggable: true }));
      block.append($('<span>',{ 'class': 'delete' }));
      
      // Stop events propagating through to the container
      block.bind('click', halt)
        .bind('drop', halt)
        .bind('mouseover', halt)
        .bind('mouseout', halt)
        .bind('dragleave', halt)
        .bind('mouseover', function(ev){ $(this).siblings().removeClass('active'); $(this).addClass('active'); })
        .bind('mouseout', function(ev){ $(this).removeClass('active'); });
      
      // Enable formatting keyboard input
      var formatter;
      for (var name in this.instance.formatters) {
        if (this.instance.formatters.hasOwnProperty(name)) {
          formatter = SirTrevor.Formatters[name];
          if (!_.isUndefined(formatter.keyCode)) {
            formatter._bindToBlock(block);
          }
        }
      }
      
      // Hanlde pastes
      block.find('.paste-block')
        .bind('click', function(){ $(this).select(); })
        .bind('paste', this.onContentPasted)
        .bind('submit', this.onContentPasted); 
      
      // Delete
      block.find('.delete').bind('click', this.onDeleteClick);
      
      // Handle text blocks
      if (block.find('.text-block').length > 0) {
        document.execCommand("styleWithCSS", false, false);
        document.execCommand("insertBrOnReturn", false, true);
        
        // Bind our text block to show the format bar
        block.find('.text-block').focus(this.onBlockFocus);
      }
      
      if (this.blockType.dropEnabled) {
        // Bind our drop event
        this.$dropzone.dropArea();
        this.$dropzone.bind('drop', this.onDrop);
      }
      
      // Focus if we're adding an empty block
      if (_.isEmpty(this.data)) {
        var inputs = block.find('[contenteditable="true"], input');
        if (inputs.length > 0 && !block.dropEnabled) {
          inputs[0].focus();
        }
      }
      
      // Set ready state
      block.addClass('sir-trevor-item-ready');
      
      this._super("onBlockRender");
    },
    
    remove: function() {
      this.$el.parent().remove();
    },
    
    loadData: function() {
      this._super("loadData", this.data);
    },
  
    validate: function() {
      this.errors = []; 
      this.$('.error').removeClass('error');
      this.$('.error-marker').remove();
      return this._super("validate");
    },
    
    showErrors: function() {
      _.each(this.errors, _.bind(function(error){
        
      }, this));
    },
    
    /* Save the state of this block onto the blocks data attr */
    save: function() {
      var data = this.$el.data('block');
      if (_.isUndefined(data)) {
        // Create our data object on the element
        this.$el.data('block', this.to_json(this.data));
      } else {
        // We need to grab the state and save it here.
        this._super('toData');
      }
      return this.$el.data('block');
    },
    
    to_json: function(data) {
      return {
        type: this.type,
        data: data
      };
    },
    
    loading: function() {
      this.spinner = new Spinner(this.instance.options.spinner);
      this.spinner.spin(this.$block[0]);
      this.$block.addClass('loading');
    },
    
    ready: function() {
      this.$block.removeClass('loading');
      if (!_.isUndefined(this.spinner)) {
        this.spinner.stop();
        delete this.spinner;
      }
    },
    
    // Event handlers
  
    onBlockFocus: function(ev) {
      this.instance.formatBar.show(this.$el);
    },
    
    onDeleteClick: function(ev) {
      if (confirm('Are you sure you wish to delete this content?')) {
        this.instance.removeBlock(this);
        halt(ev);
      }
    },
    
    onContentPasted: function(ev) {
      // We need a little timeout here
      var timed = function(ev){ 
        // Delegate this off to the super method that can be overwritten
        this._super("onContentPasted", ev);
      };
      _.delay(_.bind(timed, this, ev), 100);
    },
    
    onDrop: function(e) {
      
      e.preventDefault();
      e = e.originalEvent;
    
      var el = $(e.target),
          types = e.dataTransfer.types,
          type, data = [];
          
      /*
        Check the type we just received,
        delegate it away to our blockTypes to process
      */    
      
      if (!_.isUndefined(types))
      {
        if (_.include(types, 'Files')) 
        {
          this._super("onDrop", e.dataTransfer);
        } 
        else if (_.include(types, 'text/plain') || _.include(types, 'text/uri-list')) 
        {
          this._super("onDrop", e.dataTransfer);
        }
      }
    },
    
    parseUrlInput: function(text){
      var url = text.match(this.regexs.url);
    },
    
    /*
      Our template is always either a string or a function
    */
    _setElement: function(){
      var el = (_.isFunction(this.blockType.editorHTML)) ? this.blockType.editorHTML() : this.blockType.editorHTML;
      
      // Wrap in a block
      var block = $('<div>', {
        'class': 'block-editor ' + this.blockType.className + '-block',
        html: el
      });
      
      // Set our element references
      this.$el = block;
      this.el = this.$el[0];
    },
    
    /* A wrapper to call our parent object */
    _super: function(functionName, args) {
      if (!_.isUndefined(this.blockType[functionName])) {
        return _.bind(this.blockType[functionName], this, args)();
      }
    }
  });
  
  var Format = SirTrevor.Formatter = function(options){
    this.formatId = _.uniqueId('format-');
    this._configure(options || {});
    this.className = SirTrevor.DEFAULTS.baseCSSClass + "-format-" + this.options.className;
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
  
  var BlockQuote = SirTrevor.BlockType.extend({ 
    
    title: "Quote",
    className: "block-quote",
    limit: 0,
    
    editorHTML: function() {
      return _.template('<blockquote class="required text-block <%= className %>" contenteditable="true"></blockquote><div class="input text"><label>Credit</label><input data-maxlength="140" name="cite" class="input-string required" type="text" /></div>', this);
    },
    
    loadData: function(data){
      this.$('.text-block').html(this.instance._toHTML(data.text, this.type));
      this.$('input').val(data.cite);
    },
    
    toMarkdown: function(markdown) {
      return markdown.replace(/^(.+)$/mg,"> $1");
    }
    
  });
  
  SirTrevor.BlockTypes.BlockQuote = new BlockQuote();
  /*
    Gist BlockType
  */
  
  var template = '<p>Drop gist link here</p><div class="input text"><label>or paste URL:</label><input type="text" class="paste-block"></div>';
  var gist_template = '<div class="gist"><%= div %></div>';
  
  var Gist = SirTrevor.BlockType.extend({ 
    
    title: "Gist",
    className: "gist-block",
    dropEnabled: true,
    
    editorHTML: "<div></div>",
    
    dropzoneHTML: template,
    
    validate: function() {},
    
    loadData: function(data){
      this.loading();
      this._super("loadGist", data.id);
    },
    
    loadGist: function(gist_id) {
      // Get the gist data (too big to store in JSON)
      var callbackSuccess = function(data) {
        // Streamlined (we can't store the div item, we'll need to grab it each time)
        var obj = {
          id: gist_id
        };
        
        var dataStruct = this.$el.data('block');
        dataStruct.data = obj;
        
        $('head').append('<link rel="stylesheet" href="'+data.stylesheet+'" type="text/css">');
        
        this.$el.html(data.div);
        this.$dropzone.fadeOut(250);
        this.$el.show();
        this.ready();
      };
  
      var callbackFail = function(){
        this.ready();
      };
      
      // Make our AJAX call
      $.ajax({
        url: "https://gist.github.com/" + gist_id + ".json",
        dataType: "JSONP",
        success: _.bind(callbackSuccess, this),
        error: _.bind(callbackFail, this)
      });
    },
    
    onContentPasted: function(event){
      // Content pasted. Delegate to the drop parse method
      var input = $(event.target),
          val = input.val();
      this._super("handleDropPaste", val);
    },
    
    handleDropPaste: function(url) {
      if(_.isURI(url)) 
      {
        if (url.indexOf("gist") != -1) {
          // Twitter status
          var ID = url.match(/[^\/]+$/);
          
          if (!_.isEmpty(ID)) {
            this.loading();
            
            ID = ID[0];
            this._super("loadGist", ID);
          }
        }
      }
    },
  
    onDrop: function(transferData){
      var url = transferData.getData('text/plain');
      this._super("handleDropPaste", url);
    }
  });
  
  SirTrevor.BlockTypes.Gist = new Gist();
  /*
    Ordered List
  */
  
  var template = '<div class="text-block <%= className %>" contenteditable="true"></div>';
  
  var OrderedList = SirTrevor.BlockType.extend({ 
    
    title: "List",
    className: "ordered-list",
    
    editorHTML: function() {
      return _.template(template, this);
    },
    
    onBlockRender: function(){
      
      this.$('.text-block').bind('click', function(){
        if($(this).html().length === 0){
          document.execCommand("insertOrderedList",false,false);
        }
      });
      
      // Put in a list
      if (_.isEmpty(this.data)) {
        this.$('.text-block').focus().click();
      }
    },
      
    loadData: function(data){
      this.$('.text-block').html("<ol>" + this.instance._toHTML(data.text, this.type) + "</ol>");
    },
    
    toMarkdown: function(markdown){
      return markdown.replace(/<\/li>/mg,"\n")
                     .replace(/<\/?[^>]+(>|$)/g, "")
                     .replace(/^(.+)$/mg," 1. $1");
    },
    
    toHTML: function(html) {
      return html.replace(/^ 1. (.+)$/mg,"<li>$1</li>");
    }
  });
  
  SirTrevor.BlockTypes.OrderedList = new OrderedList();
  /*
    Text Block
  */
  
  var template = '<div class="<%= className %>" contenteditable="true"></div>';
  
  var TextBlock = SirTrevor.BlockType.extend({ 
    
    title: "Text",
    className: "text-block required",
    
    editorHTML: function() {
      return _.template(template, this);
    },
    
    loadData: function(data){
      this.$('.text-block').html(this.instance._toHTML(data.text, this.type));
    }
  });
  
  SirTrevor.BlockTypes.TextBlock = new TextBlock();
  
  var template = '<p>Drop tweet link here</p><div class="input text"><label>or paste URL:</label><input type="text" class="paste-block"></div>';
  var tweet_template = '<div class="tweet media"><div class="img"><img src="<%= user.profile_image_url %>" class="tweet-avatar"></div><div class="bd tweet-body"><p><a href="http://twitter.com/#!/<%= user.screen_name %>">@<%= user.screen_name %></a>: <%= text %></p><time><%= created_at %></time></div></div>';
  
  var Tweet = SirTrevor.BlockType.extend({ 
    
    title: "Tweet",
    className: "tweet",
    dropEnabled: true,
    
    dropzoneHTML: template,
    
    validate: function() {},
    
    loadData: function(data){
      this.$block.find(".dropzone").hide();
      this.$el.show();
      this.$el.html(_.template(tweet_template, data));
    },
    
    onContentPasted: function(event){
      // Content pasted. Delegate to the drop parse method
      var input = $(event.target),
          val = input.val();
      
      // Pass this to the same handler as onDrop
      this._super("handleTwitterDropPaste", val);
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
              var dataStruct = this.$el.data('block');
              dataStruct.data = obj;
              
              this.$el.html(_.template(tweet_template, obj)); // Render
              this.$dropzone.hide();
              this.$el.show();
              
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
      this._super("handleTwitterDropPaste", url);
    }
  });
  
  SirTrevor.BlockTypes.Tweet = new Tweet();
  /*
    Unordered List
  */
  
  var template = '<div class="text-block <%= className %>" contenteditable="true"></div>';
  
  UnorderedList = SirTrevor.BlockType.extend({ 
    
    title: "List",
    className: "unordered-list",
    
    editorHTML: function() {
      return _.template(template, this);
    },
    
    onBlockRender: function() {
      this.$('.text-block').bind('click', function(){
        if($(this).html().length === 0){
          document.execCommand("insertUnorderedList",false,false);
        }
      });
      
      // Put in a list
      if (_.isEmpty(this.data)) {
        this.$('.text-block').focus().click();
      }
      
    },
      
    loadData: function(data){
      this.$('.text-block').html("<ul>" + this.instance._toHTML(data.text, this.type) + "</ul>");
    },
    
    toMarkdown: function(markdown) {
      return markdown.replace(/<\/li>/mg,"\n")
                     .replace(/<\/?[^>]+(>|$)/g, "")
                     .replace(/^(.+)$/mg," - $1"); 
    },
    
    toHTML: function(html) {
      return html.replace(/^ - (.+)$/mg,"<li>$1</li>");
    }
  });
  
  SirTrevor.BlockTypes.UnorderedList = new UnorderedList();
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
  
  var Heading1 = SirTrevor.Formatter.extend({
    
    title: "H1",
    className: "heading h1",
    cmd: "formatBlock",
    param: "H1",
    
    toMarkdown: function(markdown) {
      return markdown.replace(/<h1>([^*|_]+)<\/h1>/mg,"#$1#\n"); 
    },
    
    toHTML: function(html) {
      return html.replace(/(?:#)([^*|_]+)(?:#)/mg,"<h1>$1</h1>"); 
    }
  });
  
  var Heading2 = SirTrevor.Formatter.extend({
    title: "H2",
    className: "heading h2",
    cmd: "formatBlock",
    param: "H2",
    
    toMarkdown: function(markdown) {
      return markdown.replace(/<h2>([^*|_]+)<\/h2>/mg,"##$1##\n"); 
    },
    
    toHTML: function(html) {
      return html.replace(/(?:##)([^*|_]+)(?:##)/mg,"<h2>$1</h2>"); 
    }
  });
  
  /*
    Create our formatters and add a static reference to them
  */
  SirTrevor.Formatters.Bold = new Bold();
  SirTrevor.Formatters.Italic = new Italic();
  SirTrevor.Formatters.Link = new Link();
  SirTrevor.Formatters.Unlink = new UnLink();
  SirTrevor.Formatters.Heading1 = new Heading1();
  SirTrevor.Formatters.Heading2 = new Heading2();
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
    
    bound: ["onButtonClick", "show", "hide"],
    
    render: function() {
      
      var marker = $('<span>', {
        'class': this.instance.options.baseCSSClass + "-" + this.options.baseCSSClass,
        html: '<p>' + this.options.addText + '</p><div class="buttons"></div>'
      });
      
      // Bind to the wrapper
      this.instance.$wrapper.append(marker);
      
      // Cache our elements for later use
      this.$el = marker;
      this.$btns = this.$el.find('.buttons');
      this.$p = this.$el.find('p');
      
      // Add all of our buttons
      var blockName, block; 
      
      for (blockName in this.instance.blockTypes) {
        if (SirTrevor.BlockTypes.hasOwnProperty(blockName)) {
          block = SirTrevor.BlockTypes[blockName];
          if (block.toolbarEnabled) {
            this.$btns.append(
             $("<a>", {
              "href": "#",
              "class": this.options.buttonClass + " new-" + block.className,
              "data-type": blockName,
              "text": block.title,
              click: this.onButtonClick
             }) 
            );
          }
        }
      }
      
      // Do we have any buttons?
      if(this.$btns.children().length === 0) this.$el.addClass('hidden');
      
      // Bind our marker to the wrapper
      this.instance.$wrapper.bind('mouseover', this.show);
      this.instance.$wrapper.bind('mouseout', this.hide);
      
      this.$el.addClass('sir-trevor-item-ready');    
    },
      
    show: function(ev){ 
    
      if(ev.type == 'dragover') {
        this.$p.text(this.options.dropText);
        this.$btns.hide();
      } else {
        this.$p.text(this.options.addText);
        this.$btns.show();
      }
      
      var mouse_enter = (ev) ? ev.originalEvent.pageY - this.instance.$wrapper.offset().top : 0;
      
      // Do we have any sedit blocks?
      if (this.instance.blocks.length > 0) {
      
        // Find the closest block to this position
        var closest_block = false,
            wrapper = this.instance.$wrapper,
            blockClass = "." + this.instance.options.baseCSSClass + "-block";
        
        var blockIterator = function(block, index) {
          block = $(block);
          var block_top = block.position().top - 35,
              block_bottom = block.position().top + block.outerHeight(true) - 35;
      
          if(block_top <= mouse_enter && mouse_enter < block_bottom) {
            closest_block = block;
          }
        };
        _.each(wrapper.find(blockClass), _.bind(blockIterator, this));
        
        // Position it
        if (closest_block) {
          closest_block.before(this.$el);
        } else if(mouse_enter > 0) {
          wrapper.find(blockClass).last().after(this.$el);
        } else {
          wrapper.find(blockClass).first().before(this.$el);
        }
      }
      this.$el.addClass('sir-trevor-item-ready');
    },
  
    hide: function(ev){ 
      this.$el.removeClass('sir-trevor-item-ready'); 
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
    this.className = this.instance.options.baseCSSClass + "-" + this.options.baseCSSClass;
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
            'class': 'format-button ' + format.className,
            'text': format.title,
            'data-type': formatName,
            'data-cmd': format.cmd,
            click: this.onFormatButtonClick
          }).appendTo(this.$el);
        }
      }
      
      if(this.$el.find('button').length === 0) this.$el.addClass('hidden');
      
      this.$el.hide();
      this.$el.bind('mouseout', halt);
      this.$el.bind('mouseover', halt);
    },
    
    /* Convienience methods */
    show: function(relativeEl){ 
      this.$el.css({
        top: relativeEl.offset().top - (parseInt(this.$el.height()))
      });
      this.$el.show();
      this.$el.addClass('sir-trevor-item-ready'); 
    },
  
    hide: function(relativeEl){ 
      this.$el.hide();
      this.$el.removeClass('sir-trevor-item-ready'); 
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
      this.$el.addClass('sir-trevor-item-ready'); 
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
    
    this.blockTypes = {};
    this.formatters = {};
    this.blockCounts = {}; // Cached block type counts
    this.blocks = []; // Block references
    this.options = _.extend({}, SirTrevor.DEFAULTS, options || {});
    this.ID = _.uniqueId(this.options.baseCSSClass + "-");
    
    if (this._ensureAndSetElements()) {
      
      this.marker = new SirTrevor.Marker(this.options.marker, this);
      this.formatBar = new SirTrevor.FormatBar(this.options.formatBar, this);
      
      this._setBlocksAndFormatters();
      this._bindFunctions();
      this.from_json();
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
      
      if (this.options.blockStore.data.length === 0) {
        // Create a default instance
        this.createBlock(this.options.defaultType);
      } else {
        // We have data. Build our blocks from here.
        _.each(this.options.blockStore.data, _.bind(function(block){
          this.createBlock(block.type, block.data);
        }, this));
      }
      this.$wrapper.addClass('sir-trevor-ready');
    },
    
    /*
      Create an instance of a block from an available type. 
      We have to check the number of blocks we're allowed to create before adding one and handle fails accordingly.
      A block will have a reference to an Editor instance & the parent BlockType.
      We also have to remember to store static counts for how many blocks we have, and keep a nice array of all the blocks available.
    */
    createBlock: function(type, data) {
      if (this._blockTypeAvailable(type)) {
        
       var blockType = SirTrevor.BlockTypes[type],
           currentBlockCount = (_.isUndefined(this.blockCounts[type])) ? 0 : this.blockCounts[type],
           totalBlockCounts = this.blocks.length,
           blockTypeLimit = this._getBlockTypeLimit(type);
      
       // Can we have another one of these blocks?
       if (currentBlockCount > blockTypeLimit || this.options.blockLimit !== 0 && totalBlockCounts >= this.options.blockLimit) {
         return false;
       }
       
       var block = new SirTrevor.Block(this, blockType, data || {});  
       
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
        
       if (currentBlockCount >= blockTypeLimit) {
         this.marker.$el.find('[data-type="' + type + '"]')
          .addClass('inactive')
          .attr('title','You have reached the limit for this type of block');
       } 
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
      this.formatBar.hide();
    },
    
    /*
      Handle a form submission of this Editor instance.
      Validate all of our blocks, and serialise all data onto the JSON objects
    */
    onFormSubmit: function() {
      
      var blockLength, block, result, errors = 0;
  
      this.options.blockStore.data = [];
      
      // Loop through blocks to validate
      var blockIterator = function(block,index) {
        // Find our block
        block = $(block);
        var _block = _.find(this.blocks, function(b){ return (b.blockID == block.attr('id')); });
        
        if (!_.isUndefined(_block) || !_.isEmpty(_block) || typeof _block == SirTrevor.Block) {
          // Validate our block
          if(_block.validate())
          {
            var data = _block.save();
            if(!_.isEmpty(data)) {
              this.options.blockStore.data.push(data);
            }
          } else errors++;
        }
        
      };
      _.each(this.$wrapper.find('.' + this.options.baseCSSClass + "-block"), _.bind(blockIterator, this));
  
      // Empty or JSON-ify
      this.$el.val((this.options.blockStore.data.length === 0) ? '' : this.to_json());
      return false;
    },
    
    /*
      Turn our JSON blockStore into a string
    */  
    to_json: function() {
      return JSON.stringify(this.options.blockStore);
    },
    
    /* 
      Try and load our data from the defined element.
      Store it on our blockStore property for later re-use.
    */
    from_json: function() {
      var content = this.$el.val();
      this.options.blockStore = { data: [] };
      
      if (content.length > 0) {
        try{
          
          // Ensure the JSON string has a data element that's an array
          var str = JSON.parse(content);
          
          if (!_.isUndefined(str.data) && (_.isArray(str.data) && !_.isEmpty(str.data))) {
            // Set it
            this.options.blockStore = str;
          } 
        } catch(e) {
          console.log('Sorry there has been a problem with parsing the JSON');
          console.log(e);
        }
      } 
    },
    
    /*
      Get Block Type Limit
      --
      returns the limit for this block, which can be set on a per Editor instance, or on a global blockType scope.
    */
    _getBlockTypeLimit: function(t) {
      if (this._blockTypeAvailable(t)) {
        return (_.isUndefined(this.options.blockTypeLimits[t])) ? this.blockTypes[t].limit : this.options.blockTypeLimits[t];
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
        return false;
      }
       
      this.$el = this.options.el;
      this.el = this.options.el[0];
      this.$form = this.$el.parents('form');
      
      // Wrap our element in lots of containers *eww*
      this.$el.wrap($('<div>', { 
                      id: this.ID,
                      'class': this.options.baseCSSClass + " " + this.options.baseCSSClass + "_dragleave",
                      dropzone: 'copy link move'
                    })
                  );
        
      this.$wrapper = this.$form.find('#' + this.ID); 
      return true;
    },
    
    
    /*
      Set our blockTypes and formatters.
      These will either be set on a per Editor instance, or set on a global scope.
    */
    _setBlocksAndFormatters: function() {
      this.blockTypes = flattern((_.isUndefined(this.options.blockTypes)) ? SirTrevor.BlockTypes : this.options.blockTypes);
      this.formatters = flattern((_.isUndefined(this.options.formatters)) ? SirTrevor.Formatters : this.options.formatters);
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
      
      // Use custom block toMarkdown functions (if any exist)
      var block;
      if (SirTrevor.BlockTypes.hasOwnProperty(type)) {
        block = SirTrevor.BlockTypes[type];
        // Do we have a toMarkdown function?
        if (!_.isUndefined(block.toMarkdown) && _.isFunction(block.toMarkdown)) {
          markdown = block.toMarkdown(markdown);
        }
      }
       
      // Do our generic stripping out
      markdown = markdown.replace(/([^<>]+)(<div>)/g,"$1\n\n$2")                                 // Divitis style line breaks (handle the first line)
                     .replace(/(?:<div>)([^<>]+)(?:<div>)/g,"$1\n\n")                            // ^ (handle nested divs that start with content)
                     .replace(/(?:<div>)(?:<br>)?([^<>]+)(?:<br>)?(?:<\/div>)/g,"$1\n\n")        // ^ (handle content inside divs)
                     .replace(/<\/p>/g,"\n\n\n\n")                                               // P tags as line breaks
                     .replace(/<(.)?br(.)?>/g,"\n\n")                                            // Convert normal line breaks
                     .replace(/&nbsp;/g," ")                                                     // Strip white-space entities 
                     .replace(/&lt;/g,"<").replace(/&gt;/g,">")                                  // Encoding
                     .replace(/<\/?[^>]+(>|$)/g, "");                                            // Strip remaining HTML
                     
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
          // Do we have a toMarkdown function?
          if (!_.isUndefined(format.toHTML) && _.isFunction(format.toHTML)) {
            html = format.toHTML(html);
          }
        }
      }
      
      // Use custom block toHTML functions (if any exist)
      var block;
      if (SirTrevor.BlockTypes.hasOwnProperty(type)) {
        block = SirTrevor.BlockTypes[type];
        // Do we have a toMarkdown function?
        if (!_.isUndefined(block.toHTML) && _.isFunction(block.toHTML)) {
          html = block.toHTML(html);
        }
      }
      
      html =  html.replace(/^\> (.+)$/mg,"$1")                                       // Blockquotes
                  .replace(/\n\n/g,"<br>")                                           // Give me some <br>s
                  .replace(/\[(.+)\]\((.+)\)/g,"<a href='$2'>$1</a>")                 // Links
                  .replace(/(?:_)([^*|_]+)(?:_)/mg,"<i>$1</i>")                   // Italic
                  .replace(/(?:\*\*)([^*|_]+)(?:\*\*)/mg,"<b>$1</b>");                // Bold
         
      return html;  
    }
  });
  
  

  /* We need a form handler here to handle all the form submits */
  
  SirTrevor.bindFormSubmit = function(form) {
    if (!formBound) {
      form.bind('submit', this.onFormSubmit);
      formBound = true;
    }
  };
  
  SirTrevor.onFormSubmit = function(ev) {
    // Loop through all of our instances and do our form submits on them
    _.each(SirTrevor.instances, function(inst, i) {
      inst.onFormSubmit();
    });
    return false;
  };

}(jQuery, _));
