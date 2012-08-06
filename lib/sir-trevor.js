// Sir Trevor, v0.0.1

(function ($, _){
  
  var root = this,
      SirTrevor;
   
  SirTrevor = root.SirTrevor = {}; 
   
  /* 
   Define default attributes that can be extended through an object passed to the
   initialize function of SirTrevor
  */
  
  var DEFAULTS = {
    baseCSSClass: "sir-trevor",
    storage: "json",
    blockStore: {
      "data": []
    },
    blockIndex: 0,
    spinner: {
      lines: 9, 
      length: 3, 
      width: 2, 
      radius: 3, 
      color: '#000', 
      speed: 1.4, 
      trail: 57, 
      shadow: false
    }
  }; 

  SirTrevor.options = DEFAULTS;
  SirTrevor.BlockTypes = {};
  SirTrevor.Formatters = {};
  
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
    Generic Block Type Implementation
  */
  
  var BlockType = SirTrevor.BlockType = function(options){
    this.instances = {};
    this.blockTypeID = _.uniqueId('blocktype-');
    this._configure(options || {});
    this.initialize.apply(this, arguments);
  };
  
  var blockTypeOptions = ["className", "toolbarEnabled", "dropEnabled", "title", "limit", "editorHTML", "dropzoneHTML"];
  
  _.extend(BlockType.prototype, {
    
    initialize: function(){},
    
    loadData: function(){
      /* Generic load data function for when we're not provided with one */
    },
    
    createInstance: function(){
      var block = new SirTrevor.Block(this);
      this.instances[block.blockID] = block;
    },
    
    removeInstance: function(){
    },
    
    // 'Private' methods
    _configure: function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = blockTypeOptions.length; i < l; i++) {
        var attr = blockTypeOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },
    
    _objectName: function(){
      var objName = "";
      for (var block in SirTrevor.BlockTypes) {
        if (SirTrevor.BlockTypes[block].blockID == this.blockID) {
          objName = block;
        }
      } 
      return objName;
    }
  });
  
  var Block = SirTrevor.Block = function(parent){
    this.blockID = _.uniqueId(parent.blockTypeID + '-block-');
    this.parent = parent;
    this._setElement();
  };
  
  _.extend(Block.prototype, {
    
    initialize: function(){},
    
    $: function(selector) {
      return this.$el.find(selector);
    },
    
    loadData: function() {
      this.parent.loadData(); // Super
    },
    
    /*
      Our template is always either a string or a function
    */
    _setElement: function(){
      var el = (_.isFunction(this.parent.editorHTML)) ? this.parent.editorHTML() : this.parent.editorHTML;
      // Set our element references
      this.$el = $(el);
      this.el = this.$el[0];
    }
  });
  
  /*
    Generic Block Implementation
  */
  
  var Format = SirTrevor.Formatter = function(options){
    this.formatId = _.uniqueId('format-');
    this._configure(options || {});
    this.className = SirTrevor.options.baseCSSClass + "-format-" + this.options.className;
    this.initialize.apply(this, arguments);
  };
  
  var formatOptions = ["title", "className", "cmd", "keyCode"];
  
  _.extend(Format.prototype, {
    
    initialize: function(){},
    
    _configure: function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = formatOptions.length; i < l; i++) {
        var attr = formatOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    }
  });
  
  /* Default Blocks */
  /*
    Block Quote
  */
  
  var template = '<div class="<%= className %>" contenteditable="true"></div>';
  
  SirTrevor.BlockTypes.BlockQuote = new SirTrevor.BlockType({ 
    title: "Quote",
    className: "block-quote",
    toolbarEnabled: true,
    dropEnabled: false,
    limit: 0,
    editorHTML: function() {
      return _.template(template, this);
    },
    loadData: function(data){
      $.find('input').val(data.cite);
    }
  });
  /*
    Ordered List
  */
  
  SirTrevor.BlockTypes.OrderedList = new SirTrevor.BlockType({ 
    title: "Ordered List",
    className: "ordered-list",
    toolbarEnabled: true,
    dropEnabled: false,
    limit: 0,
    editorHTML: ""
  });
  var template = '<div class="<%= className %>" contenteditable="true"></div>';
  
  SirTrevor.BlockTypes.TextBlock = new SirTrevor.BlockType({ 
    title: "Text",
    className: "text-block",
    toolbarEnabled: true,
    dropEnabled: false,
    limit: 0,
    editorHTML: function() {
      return _.template(template, this);
    },
  });
  /*
    Unordered List
  */
  
  SirTrevor.BlockTypes.UnorderedList = new SirTrevor.BlockType({ 
    title: "Unordered List",
    className: "unordered-list",
    toolbarEnabled: true,
    dropEnabled: false,
    limit: 0,
    editorHTML: ""
  });
  /* Default Formatters */
  /* Our base formatters */
  
  SirTrevor.Formatters.Bold = new SirTrevor.Formatter({
    title: "B",
    className: "bold",
    cmd: "bold",
    keyCode: 66
  });
  
  SirTrevor.Formatters.Italic = new SirTrevor.Formatter({
    title: "I",
    className: "italic",
    cmd: "italic",
    keyCode: 73
  });
  
  SirTrevor.Formatters.Link = new SirTrevor.Formatter({
    title: "Link",
    className: "link",
    cmd: "CreateLink"
  });
  
  SirTrevor.Formatters.Unlink = new SirTrevor.Formatter({
    title: "Unlink",
    className: "link",
    cmd: "unlink"
  });
  
  
  /* Initialize */
  SirTrevor.initialize = function(options) {
   this.options = _.extend({}, DEFAULTS, options || {});
   this.build();
  };
  
  SirTrevor.build = function() {
    
  };
  
}(jQuery, _));
