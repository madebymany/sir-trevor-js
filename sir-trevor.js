/*!
 * Sir Trevor JS v0.3.2
 *
 * Released under the MIT license
 * www.opensource.org/licenses/MIT
 *
 * 2013-12-24
 */

(function ($, _){

  var root = this,
      SirTrevor;

  SirTrevor = root.SirTrevor = {};
  SirTrevor.DEBUG = false;
  SirTrevor.SKIP_VALIDATION = false;

  SirTrevor.version = "0.3.0";
  SirTrevor.LANGUAGE = "en";

  function $element(el) {
    return el instanceof $ ? el : $(el);
  }

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
    errorsContainer: undefined
  };

  SirTrevor.log = function(message) {
    if (!_.isUndefined(console) && SirTrevor.DEBUG) {
      console.log(message);
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
      if (this.bound.length > 0) {
        _.bindAll.apply(null, _.union([this], this.bound));
      }
    }
  };

  var MediatedEvents = {
    mediatedEvents: {},
    eventNamespace: null,
    _bindMediatedEvents: function() {
      _.each(this.mediatedEvents, function(callbackFunction, eventName){
        eventName = this.eventNamespace ? this.eventNamespace + ':' + eventName : eventName;
        this.mediator.on(eventName, _.bind(this[callbackFunction], this));
      }, this);
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

    destroy: function() {
      if (!_.isUndefined(this.stopListening)) { this.stopListening(); }
      this.$el.remove();
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
      this.$el = $element(element);
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
  SirTrevor.Locales = {
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
    SirTrevor.log("Using i18n stub");
    window.i18n = {
      t: function(key, options) {
        var parts = key.split(':'), str, obj, part, i;
  
        obj = SirTrevor.Locales[SirTrevor.LANGUAGE];
  
        for(i = 0; i < parts.length; i++) {
          part = parts[i];
  
          if(!_.isUndefined(obj[part])) {
            obj = obj[part];
          }
        }
  
        str = obj;
  
        if (!_.isString(str)) { return ""; }
  
        if (str.indexOf('__') >= 0) {
          _.each(options, function(value, opt) {
            str = str.replace('__' + opt + '__', value);
          });
        }
  
        return str;
      }
    };
  } else {
    SirTrevor.log("Using i18next");
    // Only use i18next when the library has been loaded by the user, keeps
    // dependencies slim
    i18n.init({ resStore: SirTrevor.Locales, fallbackLng: SirTrevor.LANGUAGE,
                ns: { namespaces: ['general', 'blocks'], defaultNs: 'general' }
    });
  }
  //fgnass.github.com/spin.js#v1.2.5
  (function(a,b,c){function g(a,c){var d=b.createElement(a||"div"),e;for(e in c)d[e]=c[e];return d}function h(a){for(var b=1,c=arguments.length;b<c;b++)a.appendChild(arguments[b]);return a}function j(a,b,c,d){var g=["opacity",b,~~(a*100),c,d].join("-"),h=.01+c/d*100,j=Math.max(1-(1-a)/b*(100-h),a),k=f.substring(0,f.indexOf("Animation")).toLowerCase(),l=k&&"-"+k+"-"||"";return e[g]||(i.insertRule("@"+l+"keyframes "+g+"{"+"0%{opacity:"+j+"}"+h+"%{opacity:"+a+"}"+(h+.01)+"%{opacity:1}"+(h+b)%100+"%{opacity:"+a+"}"+"100%{opacity:"+j+"}"+"}",0),e[g]=1),g}function k(a,b){var e=a.style,f,g;if(e[b]!==c)return b;b=b.charAt(0).toUpperCase()+b.slice(1);for(g=0;g<d.length;g++){f=d[g]+b;if(e[f]!==c)return f}}function l(a,b){for(var c in b)a.style[k(a,c)||c]=b[c];return a}function m(a){for(var b=1;b<arguments.length;b++){var d=arguments[b];for(var e in d)a[e]===c&&(a[e]=d[e])}return a}function n(a){var b={x:a.offsetLeft,y:a.offsetTop};while(a=a.offsetParent)b.x+=a.offsetLeft,b.y+=a.offsetTop;return b}var d=["webkit","Moz","ms","O"],e={},f,i=function(){var a=g("style");return h(b.getElementsByTagName("head")[0],a),a.sheet||a.styleSheet}(),o={lines:12,length:7,width:5,radius:10,rotate:0,color:"#000",speed:1,trail:100,opacity:.25,fps:20,zIndex:2e9,className:"spinner",top:"auto",left:"auto"},p=function q(a){if(!this.spin)return new q(a);this.opts=m(a||{},q.defaults,o)};p.defaults={},m(p.prototype,{spin:function(a){this.stop();var b=this,c=b.opts,d=b.el=l(g(0,{className:c.className}),{position:"relative",zIndex:c.zIndex}),e=c.radius+c.length+c.width,h,i;a&&(a.insertBefore(d,a.firstChild||null),i=n(a),h=n(d),l(d,{left:(c.left=="auto"?i.x-h.x+(a.offsetWidth>>1):c.left+e)+"px",top:(c.top=="auto"?i.y-h.y+(a.offsetHeight>>1):c.top+e)+"px"})),d.setAttribute("aria-role","progressbar"),b.lines(d,b.opts);if(!f){var j=0,k=c.fps,m=k/c.speed,o=(1-c.opacity)/(m*c.trail/100),p=m/c.lines;!function q(){j++;for(var a=c.lines;a;a--){var e=Math.max(1-(j+a*p)%m*o,c.opacity);b.opacity(d,c.lines-a,e,c)}b.timeout=b.el&&setTimeout(q,~~(1e3/k))}()}return b},stop:function(){var a=this.el;return a&&(clearTimeout(this.timeout),a.parentNode&&a.parentNode.removeChild(a),this.el=c),this},lines:function(a,b){function e(a,d){return l(g(),{position:"absolute",width:b.length+b.width+"px",height:b.width+"px",background:a,boxShadow:d,transformOrigin:"left",transform:"rotate("+~~(360/b.lines*c+b.rotate)+"deg) translate("+b.radius+"px"+",0)",borderRadius:(b.width>>1)+"px"})}var c=0,d;for(;c<b.lines;c++)d=l(g(),{position:"absolute",top:1+~(b.width/2)+"px",transform:b.hwaccel?"translate3d(0,0,0)":"",opacity:b.opacity,animation:f&&j(b.opacity,b.trail,c,b.lines)+" "+1/b.speed+"s linear infinite"}),b.shadow&&h(d,l(e("#000","0 0 4px #000"),{top:"2px"})),h(a,h(d,e(b.color,"0 0 1px rgba(0,0,0,.1)")));return a},opacity:function(a,b,c){b<a.childNodes.length&&(a.childNodes[b].style.opacity=c)}}),!function(){function a(a,b){return g("<"+a+' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">',b)}var b=l(g("group"),{behavior:"url(#default#VML)"});!k(b,"transform")&&b.adj?(i.addRule(".spin-vml","behavior:url(#default#VML)"),p.prototype.lines=function(b,c){function f(){return l(a("group",{coordsize:e+" "+e,coordorigin:-d+" "+ -d}),{width:e,height:e})}function k(b,e,g){h(i,h(l(f(),{rotation:360/c.lines*b+"deg",left:~~e}),h(l(a("roundrect",{arcsize:1}),{width:d,height:c.width,left:c.radius,top:-c.width>>1,filter:g}),a("fill",{color:c.color,opacity:c.opacity}),a("stroke",{opacity:0}))))}var d=c.length+c.width,e=2*d,g=-(c.width+c.length)*2+"px",i=l(f(),{position:"absolute",top:g,left:g}),j;if(c.shadow)for(j=1;j<=c.lines;j++)k(j,-2,"progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");for(j=1;j<=c.lines;j++)k(j);return h(b,i)},p.prototype.opacity=function(a,b,c,d){var e=a.firstChild;d=d.shadow&&d.lines||0,e&&b+d<e.childNodes.length&&(e=e.childNodes[b+d],e=e&&e.firstChild,e=e&&e.firstChild,e&&(e.opacity=c))}):f=k(b,"animation")}(),a.Spinner=p})(window,document);
  /*
  *   Sir Trevor Uploader
  *   Generic Upload implementation that can be extended for blocks
  */
  
  SirTrevor.fileUploader = function(block, file, success, error) {
  
    SirTrevor.EventBus.trigger("onUploadStart");
  
    var uid  = [block.blockID, (new Date()).getTime(), 'raw'].join('-');
    var data = new FormData();
  
    data.append('attachment[name]', file.name);
    data.append('attachment[file]', file);
    data.append('attachment[uid]', uid);
  
    block.resetMessages();
  
    var callbackSuccess = function(data){
      SirTrevor.log('Upload callback called');
      SirTrevor.EventBus.trigger("onUploadStop");
  
      if (!_.isUndefined(success) && _.isFunction(success)) {
        _.bind(success, block)(data);
      }
    };
  
    var callbackError = function(jqXHR, status, errorThrown){
      SirTrevor.log('Upload callback error called');
      SirTrevor.EventBus.trigger("onUploadStop");
  
      if (!_.isUndefined(error) && _.isFunction(error)) {
        _.bind(error, block)(status);
      }
    };
  
    var xhr = $.ajax({
      url: SirTrevor.DEFAULTS.uploadUrl,
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
       .always(_.bind(block.removeQueuedItem, block, uid));
  
    return xhr;
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
      _.each(this.submitBtn, function(item, index){
        $(item).attr('value', this.submitBtnTitles[index]);
      }, this);
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
      _.forEach(this._events, function(callback, type) {
        SirTrevor.EventBus.on(type, this[callback], this);
      }, this);
    }
  
  });
  
  SirTrevor.submittable = function(){
    new Submittable();
  };
  /*
    Underscore helpers
  */
  
  var url_regex = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
  
  _.mixin({
    isURI : function(string) {
      return (url_regex.test(string));
    },
  
    titleize: function(str){
      if (str === null) return '';
      str  = String(str).toLowerCase();
      return str.replace(/(?:^|\s|-)\S/g, function(c){ return c.toUpperCase(); });
    },
  
    classify: function(str){
      return _.titleize(String(str).replace(/[\W_]/g, ' ')).replace(/\s/g, '');
    },
  
    classifyList: function(a){
      return _.map(a, function(i){ return _.classify(i); });
    },
  
    capitalize : function(string) {
      return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
    },
  
    underscored: function(str){
      return _.trim(str).replace(/([a-z\d])([A-Z]+)/g, '$1_$2')
                        .replace(/[-\s]+/g, '_').toLowerCase();
    },
  
    trim : function(string) {
      return string.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    },
  
    reverse: function(str) {
      return str.split("").reverse().join("");
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
    // MD -> HTML
    type = _.classify(type);
  
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
    html = _.reverse(
             _.reverse(html)
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
    for(formatName in SirTrevor.Formatters) {
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
  SirTrevor.toMarkdown = function(content, type) {
    type = _.classify(type);
  
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
    for(formatName in SirTrevor.Formatters) {
      if (SirTrevor.Formatters.hasOwnProperty(formatName)) {
        format = SirTrevor.Formatters[formatName];
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
  SirTrevor.BlockMixins.Ajaxable = {
  
    mixinName: "Ajaxable",
  
    ajaxable: true,
  
    initializeAjaxable: function(){
      this._queued = [];
    },
  
    addQueuedItem: function(name, deffered) {
      SirTrevor.log("Adding queued item for " + this.blockID + " called " + name);
      this._queued.push({ name: name, deffered: deffered });
    },
  
    removeQueuedItem: function(name) {
      SirTrevor.log("Removing queued item for " + this.blockID + " called " + name);
      this._queued = _.reject(this._queued, function(queued){ return queued.name == name; });
    },
  
    hasItemsInQueue: function() {
      return this._queued.length > 0;
    },
  
    resolveAllInQueue: function() {
      _.each(this._queued, function(item){
        SirTrevor.log("Aborting queued request: " + item.name);
        item.deffered.abort();
      }, this);
    }
  
  };
  SirTrevor.BlockMixins.Controllable = {
  
    mixinName: "Controllable",
  
    initializeControllable: function() {
      SirTrevor.log("Adding controllable to block " + this.blockID);
      this.$control_ui = $('<div>', {'class': 'st-block__control-ui'});
      _.each(
        this.controls,
        function(handler, cmd) {
          // Bind configured handler to current block context
          this.addUiControl(cmd, _.bind(handler, this));
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
  /* Adds drop functionaltiy to this block */
  
  SirTrevor.BlockMixins.Droppable = {
  
    mixinName: "Droppable",
    valid_drop_file_types: ['File', 'Files', 'text/plain', 'text/uri-list'],
  
    initializeDroppable: function() {
      SirTrevor.log("Adding droppable to block " + this.blockID);
  
      this.drop_options = _.extend({}, SirTrevor.DEFAULTS.Block.drop_options, this.drop_options);
  
      var drop_html = $(_.template(this.drop_options.html,
                        { block: this }));
  
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
  SirTrevor.BlockMixins.Fetchable = {
  
    mixinName: "Fetchable",
  
    initializeFetchable: function(){
      this.withMixin(SirTrevor.BlockMixins.Ajaxable);
    },
  
    fetch: function(options, success, failure){
      var uid = _.uniqueId(this.blockID + "_fetch"),
          xhr = $.ajax(options);
  
      this.resetMessages();
      this.addQueuedItem(uid, xhr);
  
      if(!_.isUndefined(success)) {
        xhr.done(_.bind(success, this));
      }
  
      if(!_.isUndefined(failure)) {
        xhr.fail(_.bind(failure, this));
      }
  
      xhr.always(_.bind(this.removeQueuedItem, this, uid));
  
      return xhr;
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
      this.withMixin(SirTrevor.BlockMixins.Ajaxable);
  
      this.upload_options = _.extend({}, SirTrevor.DEFAULTS.Block.upload_options, this.upload_options);
      this.$inputs.append(_.template(this.upload_options.html, this));
    },
  
    uploader: function(file, success, failure){
      return SirTrevor.fileUploader(this, file, success, failure);
    }
  
  };
  SirTrevor.BlockPositioner = (function(){
  
    var template = [
      "<div class='st-block-positioner__inner'>",
      "<span class='st-block-positioner__selected-value'></span>",
      "<select class='st-block-positioner__select'></select>",
      "</div>"
    ].join("\n");
  
    var BlockPositioner = function(block_element, mediator) {
      this.$block = block_element;
      this.mediator = mediator;
  
      this._ensureElement();
      this._bindFunctions();
  
      this.initialize();
    };
  
    _.extend(BlockPositioner.prototype, FunctionBind, Renderable, {
  
      total_blocks: 0,
  
      bound: ['onBlockCountChange', 'onSelectChange', 'toggle', 'show', 'hide'],
  
      className: 'st-block-positioner',
      visibleClass: 'st-block-positioner--is-visible',
  
      initialize: function(){
        this.$el.append(template);
        this.$select = this.$('.st-block-positioner__select');
  
        this.$select.on('change', this.onSelectChange);
        this.mediator.on('block:countUpdate', this.onBlockCountChange);
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
          this.mediator.trigger('block:changePosition',
              this.$block, val, (val == 1 ? 'before' : 'after'));
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
  
    return BlockPositioner;
  
  })();
  SirTrevor.BlockReorder = (function(){
  
    var BlockReorder = function(block_element, mediator) {
      this.$block = block_element;
      this.mediator = mediator;
  
      this._ensureElement();
      this._bindFunctions();
  
      this.initialize();
    };
  
    _.extend(BlockReorder.prototype, FunctionBind, Renderable, {
  
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
  
      onMouseDown: function() {
        this.mediator.trigger('block-controls:hide');
        SirTrevor.EventBus.trigger("block:reorder:down");
      },
  
      onDrop: function(ev) {
        ev.preventDefault();
  
        var dropped_on = this.$block,
            item_id = ev.originalEvent.dataTransfer.getData("text/plain"),
            block = $('#' + item_id);
  
        if (!_.isUndefined(item_id) && !_.isEmpty(block) &&
          dropped_on.attr('id') != item_id &&
          dropped_on.attr('data-instance') == block.attr('data-instance')
        ) {
          dropped_on.after(block);
        }
  
        this.mediator.trigger('block:rerender', item_id);
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
  var bestNameFromField = function(field) {
    var msg = field.attr("data-st-name") || field.attr("name");
  
    if (!msg) {
      msg = 'Field';
    }
  
    return _.capitalize(msg);
  };
  
  SirTrevor.BlockValidations = {
  
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
      _.each(required_fields, this.validateField, this);
      _.each(this.validations, this.runValidator, this);
  
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
      _.each(this.errors, function(error){
        error.field.removeClass('st-error');
        error.msg.remove();
      });
  
      this.$messages.removeClass("st-block__messages--is-visible");
      this.errors = [];
    }
  
  };
  SirTrevor.BlockStore = {
  
    blockStorage: {},
  
    createStore: function(blockData) {
      this.blockStorage = {
        type: _.underscored(this.type),
        data: blockData || {}
      };
    },
  
    save: function() { 
      var data = this._serializeData(); 
  
      if (!_.isEmpty(data)) {
        this.setData(data);
      }
    },
  
    saveAndReturnData: function() {
      this.save();
      return this.blockStorage;
    },
  
    /**
     * Get the block's specific data
     */
    getBlockData: function() {
      this.save();
      return this.blockStorage.data;
    },
  
    _getData: function() {
      return this.blockStorage.data;
    },
  
    setData: function(blockData) {
      SirTrevor.log("Setting data for block " + this.blockID);
      _.extend(this.blockStorage.data, blockData || {});
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
      SirTrevor.log("loadData for " + this.blockID);
      SirTrevor.EventBus.trigger("editor/block/loadData");
      this.loadData(this._getData());
    },
  
    _loadData: function() {
      SirTrevor.log("_loadData is deprecated and will be removed in the future. Please use beforeLoadingData instead.");
      this.beforeLoadingData();
    },
  
    checkAndLoadData: function() {
      if (!_.isEmpty(this._getData())) {
        this.beforeLoadingData();
      }
    }
  
  };
  SirTrevor.SimpleBlock = (function(){
  
    var SimpleBlock = function(data, instance_id, mediator) {
      this.createStore(data);
      this.blockID = _.uniqueId('st-block-');
      this.instanceID = instance_id;
      this.mediator = mediator;
  
      this._ensureElement();
      this._bindFunctions();
  
      this.initialize.apply(this, arguments);
    };
  
    _.extend(SimpleBlock.prototype, FunctionBind, SirTrevor.Events, Renderable, SirTrevor.BlockStore, {
  
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
        return _.titleize(this.type.replace(/[\W_]/g, ' '));
      },
  
      blockCSSClass: function() {
        this.blockCSSClass = _.to_slug(this.type);
        return this.blockCSSClass;
      },
  
      type: '',
  
      class: function() {
        return _.classify(this.type);
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
        (className && callback) && this.$ui.on('click', className, callback);
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
        this._withUIComponent(new SirTrevor.BlockReorder(this.$el));
      }
  
    });
  
    SimpleBlock.fn = SimpleBlock.prototype;
  
    SimpleBlock.extend = extend; // Allow our Block to be extended.
  
    return SimpleBlock;
  
  })();
  SirTrevor.Block = (function(){
  
    var Block = function(data, instance_id, mediator) {
      SirTrevor.SimpleBlock.apply(this, arguments);
    };
  
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
  
    SirTrevor.DEFAULTS.Block = {
      drop_options: drop_options,
      paste_options: paste_options,
      upload_options: upload_options
    };
  
    _.extend(Block.prototype, SirTrevor.SimpleBlock.fn, SirTrevor.BlockValidations, {
  
      bound: ["_handleContentPaste", "_onFocus", "_onBlur", "onDrop", "onDeleteClick",
              "clearInsertedStyles", "getSelectionForFormatter", "onBlockRender"],
  
      className: 'st-block st-icon--add',
  
      attributes: function() {
        return _.extend(SirTrevor.SimpleBlock.fn.attributes.call(this), {
          'data-icon-after' : "add"
        });
      },
  
      icon_name: 'default',
  
      validationFailMsg: function() {
        return i18n.t('errors:validation_fail', { type: this.title() });
      },
  
      editorHTML: '<div class="st-block__editor"></div>',
  
      toolbarEnabled: true,
  
      availableMixins: ['droppable', 'pastable', 'uploadable',
                        'fetchable', 'ajaxable', 'controllable'],
  
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
          _.extend(this, mixin);
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
  
        _.each(this.availableMixins, function(mixin) {
          if (this[mixin]) { this.withMixin(SirTrevor.BlockMixins[_.classify(mixin)]); }
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
  
      /*
        Generic _serializeData implementation to serialize the block into a plain object.
        Can be overwritten, although hopefully this will cover most situations.
        If you want to get the data of your block use block.saveAndGetData()
      */
      _serializeData: function() {
        SirTrevor.log("serializing data for " + this.blockID);
  
        var bl = this.$el,
            data = {};
  
        /* Simple to start. Add conditions later */
        if (this.hasTextBlock()) {
          var content = this.getTextBlock().html();
          if (content.length > 0) {
            data.text = SirTrevor.toMarkdown(content, this.type);
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
                        _.bind(onDeleteConfirm, this))
                   .on('click', '.st-block-ui-btn--deny-delete',
                        _.bind(onDeleteDeny, this));
      },
  
      pastedMarkdownToHTML: function(content) {
        return SirTrevor.toHTML(SirTrevor.toMarkdown(content, this.type), this.type);
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
  
        SirTrevor.SimpleBlock.fn.beforeLoadingData.call(this);
  
        this.ready();
      },
  
      _handleContentPaste: function(ev) {
        var target = $(ev.currentTarget);
  
        _.delay(_.bind(this.onContentPasted, this, ev, target), 0);
      },
  
      _getBlockClass: function() {
        return 'st-block--' + this.className;
      },
  
      /*
      * Init functions for adding functionality
      */
  
      _initUIComponents: function() {
  
        var positioner = new SirTrevor.BlockPositioner(this.$el, this.mediator);
  
        this._withUIComponent(
          positioner, '.st-block-ui-btn--reorder', positioner.toggle);
  
        this._withUIComponent(
          new SirTrevor.BlockReorder(this.$el, this.mediator));
  
        this._withUIComponent(
          new SirTrevor.BlockDeletion(), '.st-block-ui-btn--delete', this.onDeleteClick);
  
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
        this.getTextBlock()
          .bind('paste', this._handleContentPaste)
          .bind('keyup', this.getSelectionForFormatter)
          .bind('mouseup', this.getSelectionForFormatter)
          .bind('DOMNodeInserted', this.clearInsertedStyles);
      },
  
      getSelectionForFormatter: function() {
        var mediator = this.mediator;
  
        _.defer(function(){
          var selection = window.getSelection(),
             selectionStr = selection.toString().trim();
  
          if (selectionStr === '') {
            mediator.trigger('formatter:hide');
            SirTrevor.EventBus.trigger('formatter:hide');
          } else {
            mediator.trigger('formatter:positon');
            SirTrevor.EventBus.trigger('formatter:positon');
          }
        });
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
  
      isActive: function() {
        return document.queryCommandState(this.cmd);
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
              ctrlDown = false;
            }
          });
      }
    });
  
    Format.extend = extend; // Allow our Formatters to be extended.
  
    return Format;
  
  })();

  /* Default Blocks */
  /*
    Heading Block
  */
  
  SirTrevor.Blocks.Heading = SirTrevor.Block.extend({
  
    type: 'Heading',
  
    title: function(){ return i18n.t('blocks:heading:title'); },
  
    editorHTML: '<div class="st-required st-text-block st-text-block--heading" contenteditable="true"></div>',
  
    icon_name: 'heading',
  
    loadData: function(data){
      this.getTextBlock().html(SirTrevor.toHTML(data.text, this.type));
    }
  });
  SirTrevor.Blocks.Image = SirTrevor.Block.extend({
  
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
            this.setData(data);
            this.ready();
          },
          function(error){
            this.addMessage(i18n.t('blocks:image:upload_error'));
            this.ready();
          }
        );
      }
    }
  });
  SirTrevor.Blocks.List = (function() {
  
    var template = '<div class="st-text-block st-required" contenteditable="true"><ul><li></li></ul></div>';
  
    return SirTrevor.Block.extend({
  
      type: 'list',
  
      title: function() { return i18n.t('blocks:list:title'); },
  
      icon_name: 'list',
  
      editorHTML: function() {
        return _.template(template, this);
      },
  
      loadData: function(data){
        this.getTextBlock().html("<ul>" + SirTrevor.toHTML(data.text, this.type) + "</ul>");
      },
  
      onBlockRender: function() {
        this.checkForList = _.bind(this.checkForList, this);
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
        var replace = this.pastedMarkdownToHTML(target[0].innerHTML),
            list = this.$('ul').html(replace);
  
        this.getTextBlock().caretToEnd();
      },
  
      isEmpty: function() {
        return _.isEmpty(this.getBlockData().text);
      }
  
    });
  
  })();
  SirTrevor.Blocks.Quote = (function(){
  
    var template = _.template([
      '<blockquote class="st-required st-text-block" contenteditable="true"></blockquote>',
      '<label class="st-input-label"> <%= i18n.t("blocks:quote:credit_field") %></label>',
      '<input maxlength="140" name="cite" placeholder="<%= i18n.t("blocks:quote:credit_field") %>"',
      ' class="st-input-string st-required js-cite-input" type="text" />'
    ].join("\n"));
  
    return SirTrevor.Block.extend({
  
      type: "quote",
  
      title: function(){ return i18n.t('blocks:quote:title'); },
  
      icon_name: 'quote',
  
      editorHTML: function() {
        return template(this);
      },
  
      loadData: function(data){
        this.getTextBlock().html(SirTrevor.toHTML(data.text, this.type));
        this.$('.js-cite-input').val(data.cite);
      },
  
      toMarkdown: function(markdown) {
        return markdown.replace(/^(.+)$/mg,"> $1");
      }
  
    });
  
  })();
  /*
    Text Block
  */
  SirTrevor.Blocks.Text = SirTrevor.Block.extend({
  
    type: "text",
  
    title: function() { return i18n.t('blocks:text:title'); },
  
    editorHTML: '<div class="st-required st-text-block" contenteditable="true"></div>',
  
    icon_name: 'text',
  
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
          SirTrevor.log("Invalid Tweet URL");
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
        return (_.isURI(url) &&
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
  
  })();
  SirTrevor.Blocks.Video = (function(){
  
    return SirTrevor.Block.extend({
  
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
        if(!_.isURI(url)) {
          return;
        }
  
        var match, data;
  
        _.each(this.providers, function(provider, index) {
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
  
    var Link = SirTrevor.Formatter.extend({
  
      title: "link",
      iconName: "link",
      cmd: "CreateLink",
      text : "link",
  
      onClick: function() {
  
        var link = prompt(i18n.t("general:link")),
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
  
        return (node && node.nodeName == "A");
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
    SirTrevor.Formatters.Link = new Link();
    SirTrevor.Formatters.Unlink = new UnLink();
  
  })();
  /* Marker */
  SirTrevor.BlockControl = (function(){
  
    var BlockControl = function(type) {
      this.type = type;
      this.block_type = SirTrevor.Blocks[this.type].prototype;
      this.can_be_rendered = this.block_type.toolbarEnabled;
  
      this._ensureElement();
    };
  
    _.extend(BlockControl.prototype, FunctionBind, Renderable, SirTrevor.Events, {
  
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
  
    return BlockControl;
  
  })();
  /*
    SirTrevor Block Controls
    --
    Gives an interface for adding new Sir Trevor blocks.
  */
  
  SirTrevor.BlockControls = (function(){
  
    var BlockControls = function(available_types, mediator) {
      this.available_types = available_types || [];
      this.mediator = mediator;
  
      this._ensureElement();
      this._bindFunctions();
      this._bindMediatedEvents();
  
      this.initialize();
    };
  
    _.extend(BlockControls.prototype, FunctionBind, MediatedEvents, Renderable, SirTrevor.Events, {
  
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
          if (SirTrevor.Blocks.hasOwnProperty(block_type)) {
            var block_control = new SirTrevor.BlockControl(block_type);
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
  
        SirTrevor.EventBus.trigger('block:controls:shown');
      },
  
      hide: function() {
        this.removeCurrentContainer();
        this.$el.removeClass('st-block-controls--active');
  
        SirTrevor.EventBus.trigger('block:controls:hidden');
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
  
    return BlockControls;
  
  })();
  
  
  /*
    SirTrevor Floating Block Controls
    --
    Draws the 'plus' between blocks
  */
  
  SirTrevor.FloatingBlockControls = (function(){
  
    var FloatingBlockControls = function(wrapper, instance_id, mediator) {
      this.$wrapper = wrapper;
      this.instance_id = instance_id;
      this.mediator = mediator;
  
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
        this.mediator.trigger('block-controls:render', $(e.currentTarget));
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
  
    var FormatBar = function(options, mediator) {
      this.options = _.extend({}, SirTrevor.DEFAULTS.formatBar, options || {});
      this.mediator = mediator;
  
      this._ensureElement();
      this._bindFunctions();
      this._bindMediatedEvents();
  
      this.initialize.apply(this, arguments);
    };
  
    _.extend(FormatBar.prototype, FunctionBind, MediatedEvents, SirTrevor.Events, Renderable, {
  
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
  
        for (formatName in SirTrevor.Formatters) {
          if (SirTrevor.Formatters.hasOwnProperty(formatName)) {
            format = SirTrevor.Formatters[formatName];
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
        _.each(this.$btns, function($btn) {
          formatter = SirTrevor.Formatters[$btn.attr('data-type')];
          $btn.toggleClass("st-format-btn--is-active",
                           formatter.isActive());
        }, this);
      },
  
      onFormatButtonClick: function(ev){
        ev.stopPropagation();
  
        var btn = $(ev.target),
            format = SirTrevor.Formatters[btn.attr('data-type')];
  
        if (_.isUndefined(format)) return false;
  
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
  
    return FormatBar;
  
  })();
  SirTrevor.EditorStore = (function(){
  
    var EditorStore = function(data, mediator) {
      this.mediator = mediator;
      this.initialize(_.trim(data) || '');
    };
  
    _.extend(EditorStore.prototype, {
  
      initialize: function(data) {
        this.store = this._parseData(data) || { data: [] };
      },
  
      retrieve: function() {
        return this.store;
      },
  
      toString: function() {
        return JSON.stringify(this.store);
      },
  
      reset: function() {
        SirTrevor.log("Resetting the EditorStore");
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
          this.mediator.trigger('errors:add',
            { text: i18n.t("errors:load_fail") });
          this.mediator.trigger('errors:render');
  
          console.log('Sorry there has been a problem with parsing the JSON');
          console.log(e);
        }
  
        return result;
      }
  
    });
  
    return EditorStore;
  
  })();
  SirTrevor.BlockManager = (function(){
  
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
  
    _.extend(BlockManager.prototype, FunctionBind, MediatedEvents, SirTrevor.Events, {
  
      eventNamespace: 'block',
  
      mediatedEvents: {
        'create': 'createBlock',
        'remove': 'removeBlock',
        'rerender': 'rerenderBlock'
      },
  
      initialize: function() {},
  
      createBlock: function(type, data) {
        type = _.classify(type);
  
        // Run validations
        if (!this.canCreateBlock(type)) { return; }
  
        var block = new SirTrevor.Blocks[type](data, this.instance_scope, this.mediator);
        this.blocks.push(block);
  
        this._incrementBlockTypeCount(type);
        this.mediator.trigger('block:render', block);
  
        this.triggerBlockCountUpdate();
        this.mediator.trigger('block:limitReached', this.blockLimitReached());
  
        SirTrevor.log("Block created of type " + type);
      },
  
      removeBlock: function(blockID) {
        var block = this.findBlockById(blockID),
            type = _.classify(block.type);
  
        this.mediator.trigger('block-controls:reset');
        this.blocks = _.reject(this.blocks, function(item){
                               return (item.blockID == block.blockID); });
  
        this._decrementBlockTypeCount(type);
        this.triggerBlockCountUpdate();
        this.mediator.trigger('block:limitReached', this.blockLimitReached());
  
        SirTrevor.EventBus.trigger("block:remove");
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
          SirTrevor.log("Cannot add any more blocks. Limit reached.");
          return false;
        }
  
        if (!this.isBlockTypeAvailable(type)) {
          SirTrevor.log("Block type not available " + type);
          return false;
        }
  
        // Can we have another one of these blocks?
        if (!this.canAddBlockType(type)) {
          SirTrevor.log("Block Limit reached for type " + type);
          return false;
        }
  
        return true;
      },
  
      validateBlockTypesExist: function(should_validate) {
        if (SirTrevor.SKIP_VALIDATION || !should_validate) { return false; }
  
        var blockTypeIterator = function(type, index) {
          if (!this.isBlockTypeAvailable(type)) { return; }
  
          if (this._getBlockTypeCount(type) === 0) {
            SirTrevor.log("Failed validation on required block type " + type);
            this.mediator.trigger('errors:add',
                { text: i18n.t("errors:type_missing", { type: type }) });
  
          } else {
            var blocks = _.filter(this.getBlocksByType(type),
                                  function(b) { return !b.isEmpty(); });
  
            if (blocks.length > 0) { return false; }
  
            this.mediator.trigger('errors:add',
                { text: i18n.t("errors:required_type_empty", { type: type }) });
  
            SirTrevor.log("A required block type " + type + " is empty");
          }
        };
  
        if (_.isArray(this.required)) {
          _.each(this.required, blockTypeIterator, this);
        }
      },
  
      findBlockById: function(blockID) {
        return _.find(this.blocks, function(b){ return b.blockID == blockID; });
      },
  
      getBlocksByType: function(type) {
        return _.filter(this.blocks, function(b){ return _.classify(b.type) == type; });
      },
  
      getBlocksByIDs: function(block_ids) {
        return _.filter(this.blocks, function(b){ return _.contains(block_ids, b.blockID); });
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
        this.blockTypes = _.flattern((_.isUndefined(this.options.blockTypes)) ? SirTrevor.Blocks : this.options.blockTypes);
      },
  
      _setRequired: function() {
        this.required = false;
  
        if (_.isArray(this.options.required) && !_.isEmpty(this.options.required)) {
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
  
    return BlockManager;
  
  })();
  SirTrevor.ErrorHandler = (function(){
  
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
  
    _.extend(ErrorHandler.prototype, FunctionBind, MediatedEvents, Renderable, {
  
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
        _.each(this.errors, this.createErrorItem, this);
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
  
    return ErrorHandler;
  
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
      this.initialize(options);
    };
  
    _.extend(SirTrevorEditor.prototype, FunctionBind, SirTrevor.Events, {
  
      bound: ['onFormSubmit', 'hideAllTheThings', 'changeBlockPosition', 'removeBlockDragOver',
              'renderBlock', 'resetBlockControls', 'blockLimitReached'],
  
      events: {
        'block:reorder:dragend': 'removeBlockDragOver',
        'block:content:dropped': 'removeBlockDragOver'
      },
  
      initialize: function(options) {
        SirTrevor.log("Init SirTrevor.Editor");
  
        this.options = _.extend({}, SirTrevor.DEFAULTS, options || {});
        this.ID = _.uniqueId('st-editor-');
  
        if (!this._ensureAndSetElements()) { return false; }
  
        if(!_.isUndefined(this.options.onEditorRender) &&
          _.isFunction(this.options.onEditorRender)) {
          this.onEditorRender = this.options.onEditorRender;
        }
  
        // Mediated events for *this* Editor instance
        this.mediator = _.extend({}, SirTrevor.Events);
  
        this._bindFunctions();
        this.build();
  
        SirTrevor.instances.push(this);
        SirTrevor.bindFormSubmit(this.$form);
      },
  
      /*
        Build the Editor instance.
        Check to see if we've been passed JSON already, and if not try and create a default block.
        If we have JSON then we need to build all of our blocks from this.
      */
      build: function() {
        this.$el.hide();
  
        this.errorHandler = new SirTrevor.ErrorHandler(this.$outer, this.mediator, this.options.errorsContainer);
        this.store = new SirTrevor.EditorStore(this.$el.val(), this.mediator);
        this.block_manager = new SirTrevor.BlockManager(this.options, this.ID, this.mediator);
        this.block_controls = new SirTrevor.BlockControls(this.block_manager.blockTypes, this.mediator);
        this.fl_block_controls = new SirTrevor.FloatingBlockControls(this.$wrapper, this.ID, this.mediator);
        this.formatBar = new SirTrevor.FormatBar(this.options.formatBar, this.mediator);
  
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
          _.each(store.data, function(block) {
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
        _.each(this.blocks, function(block) {
          this.removeBlock(block.blockID);
        }, this);
  
        // Stop listening to events
        this.mediator.stopListening();
        this.stopListening();
  
        // Remove instance
        SirTrevor.instances = _.reject(SirTrevor.instances, _.bind(function(instance) {
          return instance.ID == this.ID;
        }, this));
  
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
        _.each(this.events, function(callback, type) {
          SirTrevor.EventBus.on(type, this[callback], this);
        }, this);
      },
  
      hideAllTheThings: function(e) {
        this.block_controls.hide();
        this.formatBar.hide();
      },
  
      store: function(method, options){
        SirTrevor.log("The store method has been removed, please call store[methodName]");
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
  
      validateAndSaveBlock: function(block, should_validate) {
        if ((!SirTrevor.SKIP_VALIDATION || should_validate) && !block.valid()) {
          this.mediator.trigger('errors:add', { text: _.result(block, 'validationFailMsg') });
          SirTrevor.log("Block " + block.blockID + " failed validation");
          return;
        }
  
        SirTrevor.log("Adding data for block " + block.blockID + " to block store");
        this.store.addData(block.saveAndReturnData());
      },
  
      /*
        Handle a form submission of this Editor instance.
        Validate all of our blocks, and serialise all data onto the JSON objects
      */
      onFormSubmit: function(should_validate) {
        // if undefined or null or anything other than false - treat as true
        should_validate = (should_validate === false) ? false : true;
  
        SirTrevor.log("Handling form submission for Editor " + this.ID);
  
        this.mediator.trigger('errors:reset');
        this.store.reset();
  
        this.validateBlocks(should_validate);
        this.block_manager.validateBlockTypesExist(should_validate);
  
        this.mediator.trigger('errors:render');
        this.$el.val(this.store.toString());
  
        return this.errorHandler.errors.length;
      },
  
      validateBlocks: function(should_validate) {
        var blockIterator = function(block) {
          var _block = this.block_manager.findBlockById($(block).attr('id'));
          if (!_.isUndefined(_block)) {
            this.validateAndSaveBlock(_block, should_validate);
          }
        };
  
        _.each(this.$wrapper.find('.st-block'), blockIterator, this);
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

  SirTrevor.getInstance = function(identifier) {
    if (_.isUndefined(identifier)) {
      return this.instances[0];
    }

    if (_.isString(identifier)) {
      return _.find(this.instances,
        function(editor){ return editor.ID === identifier; });
    }

    return this.instances[identifier];
  };

  SirTrevor.setBlockOptions = function(type, options) {
    var block = SirTrevor.Blocks[type];

    if (_.isUndefined(block)) {
      return;
    }

    _.extend(block.prototype, options || {});
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
