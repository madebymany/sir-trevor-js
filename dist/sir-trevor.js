/*!
 * Sir Trevor JS v0.3.0
 *
 * Created by Made by Many (http://madebymany.com)
 *
 * Released under the MIT license
 * www.opensource.org/licenses/MIT
 *
 * Date: 2013-07-09
 */

(function ($, _){

  var root = this,
      SirTrevor;

  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  SirTrevor = root.SirTrevor = {};
  SirTrevor.DEBUG = false;
  SirTrevor.SKIP_VALIDATION = false;

  /*
   Define default attributes that can be extended through an object passed to the
   initialize function of SirTrevor
  */

  SirTrevor.DEFAULTS = {
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
    twitter: {
      fetchURL: '/tweets/fetch' // Set this to your server
    }
  };

  SirTrevor.BlockMixins = {};
  SirTrevor.Blocks = {};
  SirTrevor.Formatters = {};
  SirTrevor.instances = [];
  SirTrevor.Events = Eventable;

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
    Drop Area Plugin from @maccman
    http://blog.alexmaccaw.com/svbtle-image-uploading
    --
    Tweaked so we use the parent class of dropzone
  */
  
  (function($){
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
  //fgnass.github.com/spin.js#v1.2.5
  (function(a,b,c){function g(a,c){var d=b.createElement(a||"div"),e;for(e in c)d[e]=c[e];return d}function h(a){for(var b=1,c=arguments.length;b<c;b++)a.appendChild(arguments[b]);return a}function j(a,b,c,d){var g=["opacity",b,~~(a*100),c,d].join("-"),h=.01+c/d*100,j=Math.max(1-(1-a)/b*(100-h),a),k=f.substring(0,f.indexOf("Animation")).toLowerCase(),l=k&&"-"+k+"-"||"";return e[g]||(i.insertRule("@"+l+"keyframes "+g+"{"+"0%{opacity:"+j+"}"+h+"%{opacity:"+a+"}"+(h+.01)+"%{opacity:1}"+(h+b)%100+"%{opacity:"+a+"}"+"100%{opacity:"+j+"}"+"}",0),e[g]=1),g}function k(a,b){var e=a.style,f,g;if(e[b]!==c)return b;b=b.charAt(0).toUpperCase()+b.slice(1);for(g=0;g<d.length;g++){f=d[g]+b;if(e[f]!==c)return f}}function l(a,b){for(var c in b)a.style[k(a,c)||c]=b[c];return a}function m(a){for(var b=1;b<arguments.length;b++){var d=arguments[b];for(var e in d)a[e]===c&&(a[e]=d[e])}return a}function n(a){var b={x:a.offsetLeft,y:a.offsetTop};while(a=a.offsetParent)b.x+=a.offsetLeft,b.y+=a.offsetTop;return b}var d=["webkit","Moz","ms","O"],e={},f,i=function(){var a=g("style");return h(b.getElementsByTagName("head")[0],a),a.sheet||a.styleSheet}(),o={lines:12,length:7,width:5,radius:10,rotate:0,color:"#000",speed:1,trail:100,opacity:.25,fps:20,zIndex:2e9,className:"spinner",top:"auto",left:"auto"},p=function q(a){if(!this.spin)return new q(a);this.opts=m(a||{},q.defaults,o)};p.defaults={},m(p.prototype,{spin:function(a){this.stop();var b=this,c=b.opts,d=b.el=l(g(0,{className:c.className}),{position:"relative",zIndex:c.zIndex}),e=c.radius+c.length+c.width,h,i;a&&(a.insertBefore(d,a.firstChild||null),i=n(a),h=n(d),l(d,{left:(c.left=="auto"?i.x-h.x+(a.offsetWidth>>1):c.left+e)+"px",top:(c.top=="auto"?i.y-h.y+(a.offsetHeight>>1):c.top+e)+"px"})),d.setAttribute("aria-role","progressbar"),b.lines(d,b.opts);if(!f){var j=0,k=c.fps,m=k/c.speed,o=(1-c.opacity)/(m*c.trail/100),p=m/c.lines;!function q(){j++;for(var a=c.lines;a;a--){var e=Math.max(1-(j+a*p)%m*o,c.opacity);b.opacity(d,c.lines-a,e,c)}b.timeout=b.el&&setTimeout(q,~~(1e3/k))}()}return b},stop:function(){var a=this.el;return a&&(clearTimeout(this.timeout),a.parentNode&&a.parentNode.removeChild(a),this.el=c),this},lines:function(a,b){function e(a,d){return l(g(),{position:"absolute",width:b.length+b.width+"px",height:b.width+"px",background:a,boxShadow:d,transformOrigin:"left",transform:"rotate("+~~(360/b.lines*c+b.rotate)+"deg) translate("+b.radius+"px"+",0)",borderRadius:(b.width>>1)+"px"})}var c=0,d;for(;c<b.lines;c++)d=l(g(),{position:"absolute",top:1+~(b.width/2)+"px",transform:b.hwaccel?"translate3d(0,0,0)":"",opacity:b.opacity,animation:f&&j(b.opacity,b.trail,c,b.lines)+" "+1/b.speed+"s linear infinite"}),b.shadow&&h(d,l(e("#000","0 0 4px #000"),{top:"2px"})),h(a,h(d,e(b.color,"0 0 1px rgba(0,0,0,.1)")));return a},opacity:function(a,b,c){b<a.childNodes.length&&(a.childNodes[b].style.opacity=c)}}),!function(){function a(a,b){return g("<"+a+' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">',b)}var b=l(g("group"),{behavior:"url(#default#VML)"});!k(b,"transform")&&b.adj?(i.addRule(".spin-vml","behavior:url(#default#VML)"),p.prototype.lines=function(b,c){function f(){return l(a("group",{coordsize:e+" "+e,coordorigin:-d+" "+ -d}),{width:e,height:e})}function k(b,e,g){h(i,h(l(f(),{rotation:360/c.lines*b+"deg",left:~~e}),h(l(a("roundrect",{arcsize:1}),{width:d,height:c.width,left:c.radius,top:-c.width>>1,filter:g}),a("fill",{color:c.color,opacity:c.opacity}),a("stroke",{opacity:0}))))}var d=c.length+c.width,e=2*d,g=-(c.width+c.length)*2+"px",i=l(f(),{position:"absolute",top:g,left:g}),j;if(c.shadow)for(j=1;j<=c.lines;j++)k(j,-2,"progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");for(j=1;j<=c.lines;j++)k(j);return h(b,i)},p.prototype.opacity=function(a,b,c,d){var e=a.firstChild;d=d.shadow&&d.lines||0,e&&b+d<e.childNodes.length&&(e=e.childNodes[b+d],e=e&&e.firstChild,e=e&&e.firstChild,e&&(e.opacity=c))}):f=k(b,"animation")}(),a.Spinner=p})(window,document);
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
      _.forEach(this._events, function(callback, type) {
        SirTrevor.EventBus.on(type, this[callback], this);
      }, this);
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
  
    SirTrevor.EventBus.trigger("onUploadStart");
  
    var uid  = [block.ID, (new Date()).getTime(), 'raw'].join('-');
  
    var data = new FormData();
  
    data.append('attachment[name]', file.name);
    data.append('attachment[file]', file);
    data.append('attachment[uid]', uid);
  
    var callbackSuccess = function(data){
      if (!_.isUndefined(success) && _.isFunction(success)) {
        SirTrevor.log('Upload callback called');
        SirTrevor.EventBus.trigger("onUploadStop");
        _.bind(success, block)(data);
      }
    };
  
    var callbackError = function(jqXHR, status, errorThrown){
      if (!_.isUndefined(error) && _.isFunction(error)) {
        SirTrevor.log('Upload callback error called');
        SirTrevor.EventBus.trigger("onUploadError");
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
    },
  
    flattern: function(obj) {
      var x = {};
      _.each(obj, function(a,b) {
        x[(_.isArray(obj)) ? a : b] = true;
      });
      return x;
    },
  
    to_slug: function(str) {
      return str
          .toLowerCase()
          .replace(/[^\w ]+/g,'')
          .replace(/ +/g,'-');
    }
  
  });
  
  SirTrevor.toHTML = function(markdown, type) {
    var html = markdown;
  
    html = html.replace(/^\> (.+)$/mg,"$1")
               .replace(/\[([^\]]+)\]\(([^\)]+)\)/g,"<a href='$2'>$1</a>")
               .replace(/([\W_]|^)(\*\*|__)(?=\S)([^\r]*?\S[\*_]*)\2([\W_]|$)/g, "$1<strong>$3</strong>$4")
               .replace(/([\W_]|^)(\*|_)(?=\S)([^\r\*_]*?\S)\2([\W_]|$)/g, "$1<em>$3</em>$4")
               .replace(/\n\n/g, "<br>");
  
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
  
    return html;
  };
  SirTrevor.toMarkdown = function(content, type) {
    var markdown;
  
    markdown = content.replace(/\n/mg,"")
                      .replace(/<a.*?href=[""'](.*?)[""'].*?>(.*?)<\/a>/g,"[$2]($1)")         // Hyperlinks
                      .replace(/<\/?b>/g,"**")
                      .replace(/<\/?STRONG>/gi,"**")                   // Bold
                      .replace(/<\/?i>/g,"_")
                      .replace(/<\/?EM>/gi,"_");                        // Italic
  
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
  
    mixinName: "Droppable",
    valid_drop_file_types: ['File', 'Files', 'text/plain', 'text/uri-list'],
  
    initializeDroppable: function() {
      SirTrevor.log("Adding droppable to block " + this.blockID);
  
      this.drop_options = _.extend({}, SirTrevor.DEFAULTS.Block.drop_options, this.drop_options);
  
      var drop_html = $(_.template(this.drop_options.html, this));
  
      this.$editor.hide();
      this.$inputs.append(drop_html);
      this.$dropzone = drop_html;
  
      // Bind our drop event
      this.$dropzone.dropArea()
                    .bind('drop', _.bind(this._handleDrop, this));
  
      this.$inner.addClass('st-block__inner--droppable');
    },
  
    _handleDrop: function(e) {
      e.preventDefault();
  
      e = e.originalEvent;
  
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
  SirTrevor.BlockMixins.Pastable = {
  
    mixinName: "Pastable",
  
    initializePastable: function() {
      SirTrevor.log("Adding pastable to block " + this.blockID);
  
      this.paste_options = _.extend({}, SirTrevor.DEFAULTS.Block.paste_options, this.paste_options);
      this.$inputs.append(_.template(this.paste_options.html, this));
  
      this.$('.st-paste-block')
        .bind('click', function(){ $(this).select(); })
        .bind('paste', this._handleContentPaste)
        .bind('submit', this._handleContentPaste);
    }
  
  };
  SirTrevor.BlockMixins.Uploadable = {
  
    mixinName: "Uploadable",
  
    uploadsCount: 0,
  
    initializeUploadable: function() {
      SirTrevor.log("Adding uploadable to block " + this.blockID);
  
      this.upload_options = _.extend({}, SirTrevor.DEFAULTS.Block.upload_options, this.upload_options);
      this.$inputs.append(_.template(this.upload_options.html, this));
    }
  
  };
  SirTrevor.BlockPositioner = (function(){
  
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
  
    _.extend(BlockPositioner.prototype, FunctionBind, Renderable, {
  
      bound: ['onBlockCountChange', 'onSelectChange'],
  
      className: 'st-block-positioner',
  
      initialize: function(){
        this.$el.append(template);
        this.$select = this.$('.st-block-positioner__select');
  
        this.$select.on('change', this.onSelectChange);
  
        SirTrevor.EventBus.on(this.instanceID + ":blocks:count_update", this.onBlockCountChange);
      },
  
      onBlockCountChange: function(new_count) {
        if (new_count != this.total_blocks) {
          this.total_blocks = new_count;
          this.renderPositionList();
        }
      },
  
      onSelectChange: function() {
        var val = this.$select.val();
        if (val !== 0) {
          SirTrevor.EventBus.trigger(this.instanceID + ":blocks:change_position",
            this.$block, val, (val == 1 ? 'before' : 'after'));
          this.toggle();
        }
      },
  
      renderPositionList: function() {
        var inner = "<option value='0'>Position</option>";
        for(var i = 1; i <= this.total_blocks; i++) {
          inner += "<option value="+i+">"+i+"</option>";
        }
        this.$select.html(inner);
      },
  
      toggle: function() {
        this.$select.val(0);
        this.$el.toggleClass('st-block-positioner--is-visible');
      },
  
      show: function(){
        this.$el.addClass('st-block-positioner--is-visible');
      },
  
      hide: function(){
        this.$el.removeClass('st-block-positioner--is-visible');
      }
  
    });
  
    return BlockPositioner;
  
  })();
  SirTrevor.BlockReorder = (function(){
  
    var BlockReorder = function(block_element) {
      this.$block = block_element;
  
      this._ensureElement();
      this._bindFunctions();
  
      this.initialize();
    };
  
    _.extend(BlockReorder.prototype, FunctionBind, Renderable, {
  
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
        SirTrevor.EventBus.trigger("block:reorder:down");
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
        SirTrevor.EventBus.trigger("block:reorder:dropped", item_id);
      },
  
      onDragStart: function(ev) {
        var btn = $(ev.currentTarget).parent();
  
        ev.originalEvent.dataTransfer.setDragImage(this.$block[0], btn.position().left, btn.position().top);
        ev.originalEvent.dataTransfer.setData('Text', this.$block.attr('id'));
  
        SirTrevor.EventBus.trigger("block:reorder:dragstart");
        this.$block.addClass('st-block--dragging');
      },
  
      onDragEnd: function(ev) {
        SirTrevor.EventBus.trigger("block:reorder:dragend");
        this.$block.removeClass('st-block--dragging');
      },
  
      onDrag: function(ev){},
  
      onClick: function() {
      },
  
      render: function() {
        return this;
      }
  
    });
  
    return BlockReorder;
  
  })();
  SirTrevor.BlockDeletion = (function(){
  
    var BlockDeletion = function() {
      this._ensureElement();
      this._bindFunctions();
    };
  
    _.extend(BlockDeletion.prototype, FunctionBind, Renderable, {
  
      tagName: 'a',
      className: 'st-block-ui-btn st-block-ui-btn--delete st-icon',
  
      attributes: {
        html: 'delete',
        'data-icon': 'bin'
      }
  
    });
  
    return BlockDeletion;
  
  })();
  SirTrevor.Block = (function(){
  
    var Block = function(data, instance_id) {
      this.store("create", this, { data: data || {} });
      this.blockID = _.uniqueId('st-block-');
      this.instanceID = instance_id;
  
      this._ensureElement();
      this._bindFunctions();
  
      this.initialize.apply(this, arguments);
    };
  
    var delete_template = [
      "<div class='st-block__ui-delete-controls'>",
        "<label class='st-block__delete-label'>Delete?</label>",
        "<a class='st-block-ui-btn st-block-ui-btn--confirm-delete st-icon' data-icon='tick'></a>",
        "<a class='st-block-ui-btn st-block-ui-btn--deny-delete st-icon' data-icon='close'></a>",
      "</div>"
    ].join("\n");
  
    var drop_options = {
      html: ['<div class="st-block__dropzone">',
             '<span class="st-icon"><%= icon_name() %></span>',
             '<p>Drag <span><%= type %></span> here</p></div>'].join('\n'),
      re_render_on_reorder: false
    };
  
    var paste_options = {
      html: '<input type="text" placeholder="Or paste URL here" class="st-block__paste-input st-paste-block">'
    };
  
    var upload_options = {
      html: [
        '<div class="st-block__upload-container">',
        '<input type="file" type="st-file-upload">',
        '<button class="st-upload-btn">...or choose a file</button>',
        '</div>'
      ].join('\n')
    };
  
    SirTrevor.DEFAULTS.Block = {
      drop_options: drop_options,
      paste_options: paste_options,
      upload_options: upload_options
    };
  
    _.extend(Block.prototype, FunctionBind, SirTrevor.Events, Renderable, {
  
      bound: ["_handleDrop", "_handleContentPaste", "_onFocus", "_onBlur", "onDrop", "onDeleteClick", "checkForSpan"],
  
      className: 'st-block st-icon--add',
  
      block_template: _.template(
        "<div class='st-block__inner'><%= editor_html %></div>"
      ),
  
      attributes: function() {
        return {
          'id': this.blockID,
          'data-type': this.type,
          'data-instance': this.instanceID,
          'data-icon-after' : "add"
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
        this.blockCSSClass = _.to_slug(this.type);
        return this.blockCSSClass;
      },
  
      validationFailMsg: function() {
        return this.type + ' block is invalid';
      },
  
      $$: function(selector) {
        return this.$el.find(selector);
      },
  
      type: '',
      editorHTML: '<div class="st-block__editor"></div>',
  
      toolbarEnabled: true,
  
      droppable: false,
      pastable: false,
      uploadable: false,
  
      drop_options: {},
      paste_options: {},
      upload_options: {},
  
      formattable: true,
  
      initialize: function() {},
  
      loadData: function() {},
      onBlockRender: function(){},
      beforeBlockRender: function(){},
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
        this["initialize" + mixin.mixinName]();
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
  
        if(this.droppable || this.pastable || this.uploadable) {
          var input_html = $("<div>", { 'class': 'st-block__inputs' });
          this.$inner.append(input_html);
          this.$inputs = input_html;
        }
  
        if (this.hasTextBlock) { this._initTextBlocks(); }
        if (this.droppable) { this.withMixin(SirTrevor.BlockMixins.Droppable); }
        if (this.pastable) { this.withMixin(SirTrevor.BlockMixins.Pastable); }
        if (this.uploadable) { this.withMixin(SirTrevor.BlockMixins.Uploadable); }
  
        if (this.formattable) { this._initFormatting(); }
  
        this._loadAndSetData();
        this._initUIComponents();
  
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
        this.store("save", this, { data: _.extend(this.dataStore.data, data) });
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
        if (this.hasTextBlock()) {
          var content = this.getTextBlock().html();
          if (content.length > 0) {
            dataObj.text = SirTrevor.toMarkdown(content, this.type);
          }
        }
  
        var hasTextAndData = (!_.isUndefined(dataObj.text) || !this.hasTextBlock());
  
        // Add any inputs to the data attr
        if(this.$$('input[type="text"]').not('.st-paste-block').length > 0) {
          this.$$('input[type="text"]').each(function(index,input){
            input = $(input);
            if (hasTextAndData) {
              dataObj[input.attr('name')] = input.val();
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
  
        this.$inner.append(delete_template);
        this.$el.addClass('st-block--delete-active');
  
        var $delete_el = this.$inner.find('.st-block__ui-delete-controls');
  
        var onDeleteConfirm = function(e) {
          e.preventDefault();
          this.trigger('removeBlock', this.blockID);
        };
  
        var onDeleteDeny = function(e) {
          e.preventDefault();
          this.$el.removeClass('st-block--delete-active');
          $delete_el.remove();
        };
  
        this.$inner.on('click', '.st-block-ui-btn--confirm-delete', _.bind(onDeleteConfirm, this))
                   .on('click', '.st-block-ui-btn--deny-delete', _.bind(onDeleteDeny, this));
      },
  
      onTextContentPasted: function(target, before, event){
        var after = target[0].innerHTML;
  
        var pos1 = -1,
            pos2 = -1,
            after_len = after.length,
            before_len = before.length;
  
        for (var i = 0; i < after_len; i++) {
          if (pos1 == -1 && before.substr(i, 1) != after.substr(i, 1)) {
            pos1 = i - 1;
          }
  
          if (pos2 == -1 &&
              before.substr(before_len - i - 1, 1) !=
              after.substr(after_len - i - 1, 1)
            ) {
            pos2 = i;
          }
        }
  
        var pasted = after.substr(pos1, after_len - pos2 - pos1 + 1);
  
        var replace = SirTrevor.toHTML(SirTrevor.toMarkdown(pasted, this.type), this.type);
  
        // replace the HTML mess with the plain content
        target[0].innerHTML = after.substr(0, pos1) + replace + after.substr(pos1 + pasted.length);
      },
  
      onContentPasted: function(event, target){},
  
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
  
        if(this.droppable || this.uploadable || this.pastable) {
          this.$editor.show();
          this.$inputs.hide();
        }
  
        SirTrevor.EventBus.trigger("editor/block/loadData");
  
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
        var target = $(ev.currentTarget),
            original_content = target.html();
  
        if (target.hasClass('st-text-block')) {
          _.delay(_.bind(this.onTextContentPasted, this, target, original_content, ev), 0);
        } else {
          _.delay(_.bind(this.onContentPasted, this, ev, target), 0);
        }
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
  
        var positioner = new SirTrevor.BlockPositioner(this.$el, this.instanceID),
            reorder = new SirTrevor.BlockReorder(this.$el);
  
        this.$ui.append(reorder.render().$el);
        this.$ui.append(new SirTrevor.BlockDeletion().render().$el);
        this.$ui.append(positioner.render().$el);
  
        this.$ui.on('click', '.st-block-ui-btn--delete', this.onDeleteClick);
        this.$ui.on('click', '.st-block-ui-btn--reorder', positioner.toggle);
  
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
  
        this.getTextBlock()
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
          .bind('mouseup', this.getSelectionForFormatter)
          .on('DOMNodeInserted', this.checkForSpan);
      },
  
      checkForSpan: function(e) {
        if (e.target.tagName == "SPAN") {
          $(e.target).attr('style', ''); // Hacky fix for Chrome.
        }
      },
  
      hasTextBlock: function() {
        return this.getTextBlock().length > 0;
      },
  
      getTextBlock: function() {
        if (_.isUndefined(this.text_block)) {
          this.text_block = this.$('.st-text-block');
        }
  
        return this.text_block;
      }
  
    });
  
    Block.extend = extend; // Allow our Block to be extended.
  
    return Block;
  
  })();
  SirTrevor.Formatter = (function(){
  
    var Format = function(options){
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
            if(ev.which == 17 || ev.which == 224 || ev.which == 91) {
              ctrlDown = false;
            }
          })
          .on('keydown','.st-text-block', { formatter: formatter }, function(ev) {
            if(ev.which == 17 || ev.which == 224 || ev.which == 91) {
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
  
    return Format;
  
  })();

  /* Default Blocks */
  /*
    Block Quote
  */
  
  SirTrevor.Blocks.Quote = (function(){
  
    var template = _.template([
      '<blockquote class="st-required st-text-block" contenteditable="true"></blockquote>',
      '<input maxlength="140" name="cite" placeholder="Credit" class="st-input-string st-required" type="text" />'
    ].join("\n"));
  
    return SirTrevor.Block.extend({
  
      type: 'Quote',
  
      editorHTML: function() {
        return template(this);
      },
  
      loadData: function(data){
        this.getTextBlock().html(SirTrevor.toHTML(data.text, this.type));
        this.$$('input').val(data.cite);
      },
  
      toMarkdown: function(markdown) {
        return markdown.replace(/^(.+)$/mg,"> $1");
      }
  
    });
  
  })();
  /*
    Text Block
  */
  SirTrevor.Blocks.Heading = SirTrevor.Block.extend({
  
    type: 'Heading',
  
    editorHTML: '<div class="st-required st-text-block st-text-block--heading" contenteditable="true"></div>',
  
    loadData: function(data){
      this.getTextBlock().html(SirTrevor.toHTML(data.text, this.type));
    }
  });
  /*
    Simple Image Block
  */
  
  SirTrevor.Blocks.Image = SirTrevor.Block.extend({
  
    type: "Image",
  
    droppable: true,
    uploadable: true,
  
    loadData: function(data){
      // Create our image tag
      this.$editor.html($('<img>', { src: data.file.url }));
    },
  
    onBlockRender: function(){
      /* Setup the upload button */
      this.$inputs.find('button').bind('click', function(ev){ ev.preventDefault(); });
      this.$inputs.find('input').on('change', _.bind(function(ev){
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
        this.$inputs.hide();
        this.$editor.html($('<img>', { src: urlAPI.createObjectURL(file) })).show();
  
        // Upload!
        SirTrevor.EventBus.trigger('setSubmitButton', ['Please wait...']);
        this.uploader(
          file,
          function(data) {
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
      this.getTextBlock().html(SirTrevor.toHTML(data.text, this.type));
    }
  });
  SirTrevor.Blocks.Tweet = (function(){
  
    var tweet_template = _.template([
      "<blockquote class='twitter-tweet' align='center'>",
      "<p><%= text %></p>",
      "&mdash; <%= user.name %> (@<%= user.screen_name %>)",
      "<a href='<%= status_url %>' data-datetime='<%= created_at %>'><%= created_at %></a>",
      "</blockquote>",
      '<script src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'
    ].join("\n"));
  
    return SirTrevor.Block.extend({
  
      type: "Tweet",
      droppable: true,
      pastable: true,
  
      drop_options: {
        re_render_on_reorder: true
      },
  
      icon_name: function() {
        return 'twitter';
      },
  
      default_data : {
        text : "",
        user : {
          name : "",
          screen_name : ""
        },
        status_url : "",
        created_at : ""
      },
  
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
                  id: data.id_str,
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
                url: SirTrevor.DEFAULTS.twitter.fetchURL + "?tweet_id=" + tweetID,
                dataType: "json",
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
  
  })();
  /*
    Unordered List
  */
  
  SirTrevor.Blocks.List = (function() {
  
    var template = '<div class="st-text-block" contenteditable="true"><ul><li></li></ul></div>';
  
    return SirTrevor.Block.extend({
  
      type: "List",
  
      editorHTML: function() {
        return _.template(template, this);
      },
  
      loadData: function(data){
        this.getTextBlock().html("<ul>" + SirTrevor.toHTML(data.text, this.type) + "</ul>");
      },
  
      onBlockRender: function() {
        this.getTextBlock().bind('click', function(){
          if($(this).text().length < 1) {
            document.execCommand("insertUnorderedList",false,false);
          }
        });
      },
  
      toMarkdown: function(markdown) {
        return markdown.replace(/<\/li>/mg,"\n")
                       .replace(/<\/?[^>]+(>|$)/g, "")
                       .replace(/^(.+)$/mg," - $1");
      },
  
      toHTML: function(html) {
        html = html.replace(/^ - (.+)$/mg,"<li>$1</li>")
                   .replace(/\n/mg,"");
  
        html = "<ul>" + html + "</ul>";
  
        return html;
      }
  
    });
  
  })();
  SirTrevor.Blocks.Video = (function(){
  
    var video_regex = /http[s]?:\/\/(?:www.)?(?:(vimeo).com\/(.*))|(?:(youtu(?:be)?).(?:be|com)\/(?:watch\?v=)?([^&]*)(?:&(?:.))?)/;
  
    return SirTrevor.Block.extend({
  
      type: 'Video',
  
      droppable: true,
      pastable: true,
  
      loadData: function(data){
        this.$editor.addClass('st-block__editor--with-sixteen-by-nine-media');
  
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
  
  })();
  /* Default Formatters */
  /* Our base formatters */
  (function(){
  
    var Bold = SirTrevor.Formatter.extend({
      title: "bold",
      cmd: "bold",
      keyCode: 66,
      text : "B"
    });
  
    var Italic = SirTrevor.Formatter.extend({
      title: "italic",
      cmd: "italic",
      keyCode: 73,
      text : "i"
    });
  
    var Underline = SirTrevor.Formatter.extend({
      title: "underline",
      cmd: "underline",
      keyCode: 85,
      text : "U"
    });
  
    var Link = SirTrevor.Formatter.extend({
  
      title: "link",
      iconName: "link",
      cmd: "CreateLink",
      text : "link",
  
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
      iconName: "link",
      cmd: "unlink",
      text : "link"
    });
  
    /*
      Create our formatters and add a static reference to them
    */
    SirTrevor.Formatters.Bold = new Bold();
    SirTrevor.Formatters.Italic = new Italic();
    SirTrevor.Formatters.Underline = new Underline();
    SirTrevor.Formatters.Link = new Link();
    SirTrevor.Formatters.Unlink = new UnLink();
  
  })();
  /* Marker */
  SirTrevor.BlockControl = (function(){
  
    var BlockControl = function(type, instance_scope) {
      this.type = type;
      this.instance_scope = instance_scope;
      this._ensureElement();
      this.initialize();
    };
  
    _.extend(BlockControl.prototype, FunctionBind, Renderable, SirTrevor.Events, {
  
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
  
    return BlockControl;
  
  })();
  /*
    SirTrevor Block Controls
    --
    Gives an interface for adding new Sir Trevor blocks.
  */
  
  SirTrevor.BlockControls = (function(){
  
    var BlockControls = function(available_types, instance_scope) {
      this.instance_scope = instance_scope;
      this.available_types = available_types || [];
      this._ensureElement();
      this._bindFunctions();
      this.initialize();
    };
  
    _.extend(BlockControls.prototype, FunctionBind, Renderable, SirTrevor.Events, {
  
      bound: ['handleControlButtonClick'],
      block_controls: null,
  
      className: "st-block-controls",
  
      html: "<a class='st-icon st-icon--close'>close</a>",
  
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
        e.stopPropagation();
  
        this.trigger('createBlock', e.currentTarget.dataset.type);
      }
  
    });
  
    return BlockControls;
  
  })();
  
  
  /*
    SirTrevor Floating Block Controls
    --
    Draws the 'plus' between blocks
  */
  
  SirTrevor.FloatingBlockControls = (function(){
  
    var FloatingBlockControls = function(wrapper, instance_id) {
      this.$wrapper = wrapper;
      this.instance_id = instance_id;
  
      this._ensureElement();
      this._bindFunctions();
  
      this.initialize();
    };
  
    _.extend(FloatingBlockControls.prototype, FunctionBind, Renderable, SirTrevor.Events, {
  
      className: "st-block-controls__top",
  
      attributes: function() {
        return {
          'data-icon': 'add'
        };
      },
  
      bound: ['handleWrapperMouseOver', 'handleBlockMouseOut', 'handleBlockClick'],
  
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
          dropped_on.attr('id') != item_id &&
          this.instance_id == block.attr('data-instance')
        ) {
          dropped_on.after(block);
        }
  
        SirTrevor.EventBus.trigger("block:reorder:dropped", item_id);
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
  
    return FloatingBlockControls;
  
  })();
  /* FormatBar */
  /*
    Format Bar
    --
    Displayed on focus on a text area.
    Renders with all available options for the editor instance
  */
  
  SirTrevor.FormatBar = (function(){
  
    var FormatBar = function(options) {
      this.options = _.extend({}, SirTrevor.DEFAULTS.formatBar, options || {});
      this._ensureElement();
      this._bindFunctions();
  
      this.initialize.apply(this, arguments);
    };
  
    _.extend(FormatBar.prototype, FunctionBind, SirTrevor.Events, Renderable, {
  
      className: 'st-format-bar',
  
      bound: ["onFormatButtonClick"],
  
      initialize: function() {
        var formatName, format;
  
        for (formatName in SirTrevor.Formatters) {
          if (SirTrevor.Formatters.hasOwnProperty(formatName)) {
            format = SirTrevor.Formatters[formatName];
  
            $("<button>", {
              'class': 'st-format-btn st-format-btn--' + formatName + ' ' + (format.iconName ? 'st-icon' : ''),
              'text': format.text,
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
  
    return FormatBar;
  
  })();
  /*
    Sir Trevor Editor
    --
    Represents one Sir Trevor editor instance (with multiple blocks)
    Each block references this instance.
    BlockTypes are global however.
  */
  
  SirTrevor.Editor = (function(){
  
    var SirTrevorEditor = function(options) {
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
  
    _.extend(SirTrevorEditor.prototype, FunctionBind, SirTrevor.Events, {
  
      bound: ['onFormSubmit', 'showBlockControls', 'hideAllTheThings',
              'onNewBlockCreated', 'changeBlockPosition', 'onBlockDragStart', 'onBlockDragEnd'],
  
      initialize: function() {},
      /*
        Build the Editor instance.
        Check to see if we've been passed JSON already, and if not try and create a default block.
        If we have JSON then we need to build all of our blocks from this.
      */
      build: function() {
        this.$el.hide();
  
        this.block_controls = new SirTrevor.BlockControls(this.blockTypes, this.ID);
        this.fl_block_controls = new SirTrevor.FloatingBlockControls(this.$wrapper, this.ID);
        this.formatBar = new SirTrevor.FormatBar(this.options.formatBar);
  
        this.listenTo(this.block_controls, 'createBlock', this.createBlock);
        this.listenTo(this.fl_block_controls, 'showBlockControls', this.showBlockControls);
  
        SirTrevor.EventBus.on("block:reorder:down", this.hideBlockControls);
        SirTrevor.EventBus.on("block:reorder:dragstart", this.onBlockDragStart);
        SirTrevor.EventBus.on("block:reorder:dragend", this.onBlockDragEnd);
        SirTrevor.EventBus.on("block:content:dropped", this.removeBlockDragOver);
  
        SirTrevor.EventBus.on("block:reorder:dropped", this.onBlockDropped);
        SirTrevor.EventBus.on("block:create:new", this.onNewBlockCreated);
  
        SirTrevor.EventBus.on(this.ID + ":blocks:change_position", this.changeBlockPosition);
  
        SirTrevor.EventBus.on("formatter:positon", this.formatBar.render_by_selection);
        SirTrevor.EventBus.on("formatter:hide", this.formatBar.hide);
  
        this.$wrapper.prepend(this.fl_block_controls.render().$el);
        this.$outer.append(this.formatBar.render().$el);
        this.$outer.append(this.block_controls.render().$el);
  
  
        $(window).bind('click', this.hideAllTheThings);
  
        var store = this.store("read", this);
  
        if (store.data.length > 0) {
          _.each(store.data, _.bind(function(block){
            SirTrevor.log('Creating: ', block);
            this.createBlock(block.type, block.data);
          }, this));
        } else if (this.options.defaultType !== false) {
          this.createBlock(this.options.defaultType);
        }
  
        this.$wrapper.addClass('st-ready');
  
        if(!_.isUndefined(this.onEditorRender)) {
          this.onEditorRender();
        }
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
  
        if(this._blockLimitReached()) {
          SirTrevor.log("Cannot add any more blocks. Limit reached.");
          return false;
        }
  
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
  
        var create_event = (data) ? "block:create:existing" : "block:create:new";
  
        SirTrevor.EventBus.trigger(create_event, block);
        SirTrevor.log("Block created of type " + type);
  
        this.triggerBlockCountUpdate();
      },
  
      onNewBlockCreated: function(block) {
        this.hideBlockControls();
        this.scrollTo(block.$el);
      },
  
      scrollTo: function(element) {
        $('html, body').animate({ scrollTop: element.position().top });
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
        SirTrevor.EventBus.trigger(this.ID + ":blocks:count_update", this.blocks.length);
      },
  
      changeBlockPosition: function(block_el, position, where) {
        var block = this.$wrapper.find('.st-block').eq(position - 1);
        if(block && block.attr('id') !== block_el.attr('id')) {
          this.hideAllTheThings();
          block[where](block_el);
          this.scrollTo(block_el);
        }
      },
  
      onBlockDropped: function(block_id) {
        this.hideAllTheThings();
        var block = this.findBlockById(block_id);
        if (
          !_.isUndefined(block) &&
          block.dataStore.data.length > 0 &&
          block.drop_options.re_render_on_reorder
        ) {
            block._loadData(block.dataStore);
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
            controls = block.$el.find('.st-block-controls');
  
        if (controls.length) {
          this.block_controls.hide();
          this.$wrapper.prepend(controls);
        }
  
        this.blockCounts[block.type] = this.blockCounts[block.type] - 1;
        this.blocks = _.reject(this.blocks, function(item){ return (item.blockID == block.blockID); });
        this.stopListening(block);
  
        block.remove();
  
        SirTrevor.EventBus.trigger("block:remove");
        this.triggerBlockCountUpdate();
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
          var _block = _.find(this.blocks, function(b) {
            return (b.blockID == $(block).attr('id')); });
  
          if (_.isUndefined(_block)) { return false; }
  
          // Find our block
          this.performValidations(_block, should_validate);
          this.saveBlockStateToStore(_block);
        };
  
        _.each(this.$wrapper.find('.st-block'), _.bind(blockIterator, this));
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
  
        this.$errors.hide().find('ul').html('');
  
        this.errors = [];
      },
  
      findBlockById: function(block_id) {
        return _.find(this.blocks, function(b){ return b.blockID == block_id; });
      },
  
      getBlocksByType: function(block_type) {
        return _.filter(this.blocks, function(b){ return b.type == block_type; });
      },
  
      getBlocksByIDs: function(block_ids) {
        return _.filter(this.blocks, function(b){ return _.contains(block_ids, b.blockID); });
      },
  
      /*
        Get Block Type Limit
        --
        returns the limit for this block, which can be set on a per Editor instance, or on a global blockType scope.
      */
      _getBlockTypeLimit: function(t) {
        if (!this._isBlockTypeAvailable(t)) { return 0; }
  
        return parseInt((_.isUndefined(this.options.blockTypeLimits[t])) ? 0 : this.options.blockTypeLimits[t], 10);
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
        this.$wrapper = this.$outer.find('.st-blocks');
  
        return true;
      },
  
      /*
        Set our blockTypes
        These will either be set on a per Editor instance, or set on a global scope.
      */
      _setBlocksTypes: function() {
        this.blockTypes = _.flattern((_.isUndefined(this.options.blockTypes)) ? SirTrevor.Blocks : this.options.blockTypes);
      },
  
      /* Get our required blocks (if any) */
      _setRequired: function() {
        this.required = (_.isArray(this.options.required) && !_.isEmpty(this.options.required)) ? this.options.required : false;
      }
    });
  
    return SirTrevorEditor;
  
  })();
  

  /* We need a form handler here to handle all the form submits */
  SirTrevor.setDefaults = function(options) {
    SirTrevor.DEFAULTS = _.extend(SirTrevor.DEFAULTS, options || {});
  };

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
      SirTrevor.EventBus.trigger("onError");
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
