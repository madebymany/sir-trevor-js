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
      lines: 9, 
      length: 3, 
      width: 2, 
      radius: 3, 
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
    }
  }; 
  
  SirTrevor.BlockTypes = {};
  SirTrevor.Formatters = {};
  
  var Events = {
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
  
  // Array Remove - By John Resig (MIT Licensed)
  Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
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
    Generic Block Type Implementation
    --
    SirTrevor 0..N BlockTypes
    BlockType 0..Limit Blocks
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
    
    initialize: function() {},
    
    loadData: function(block, data) {},
    validate: function(block) {},
    
    /*
      Generic toData implementation.
      Can be overwritten, although hopefully this will cover most situations
    */
    toData: function(block) {
      var bl = block.$el,
          dataStruct = bl.data('block'),
          content;
      
      /* Simple to start. Add conditions later */
      if (block.$('.text-block').length > 0) {
        content = block.$('.text-block').html();
        if (content.length > 0) {
          dataStruct.data.text = block.instance._toMarkdown(content, block.type);
        }
      }
    },
    
    /* Callback methods that can be overriden */
    onBlockRender: function(block){},
    beforeBlockRender: function(block){},
    onBlockActivated: function(block){},
    onDrop: function(block){},
    onContentPasted: function(block, event){},
    
    // 'Private' methods
    _configure: function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = blockTypeOptions.length; i < l; i++) {
        var attr = blockTypeOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },
    
    blockType: function() {
      var objName = "";
      for (var block in SirTrevor.BlockTypes) {
        if (SirTrevor.BlockTypes[block] == this) {
          objName = block;
        }
      } 
      return objName;
    }
  });
  /* A Block representation */
  
  var Block = SirTrevor.Block = function(instance, parentBlockType, data) {
    
    this.blockID = _.uniqueId(parentBlockType.blockTypeID + '_block-');
    this.instance = instance; // SirTrevor.Editor instance
    this.blockType = parentBlockType;
    
    this.data = data;
    this.type = this.blockType.blockType();  // Cache the blocktype. 
  
    this.errors = [];
    
    this._setElement();
    this._bindFunctions();
    this.render();
  };
  
  _.extend(Block.prototype, Events, {
    
    bound: ["onDeleteClick", "onContentPasted", "onMouseOverAbove", "onMouseOverBelow"],
    
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
      this.instance.marker.hide();
      this.instance.marker.$el.before(block);
      
      // Has data already?
      if (!_.isUndefined(this.data) && !_.isEmpty(this.data)) {
        this.loadData();
      }
      
      // And save the state
      this.save();
      
      // Set ready state
      block.addClass('block-ready');
      
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
      
     // block.find('.block-above').bind('mouseover', this.onMouseOverAbove);
    //  block.find('.block-below').bind('mouseover', this.onMouseOverBelow);
      
      // Enable formatting keyboard input
      var formatter;
      for (var name in this.instance.formatters) {
        if (this.instance.formatters.hasOwnProperty(name)) {
          formatter = SirTrevor.Formatters[name];
          if (!_.isUndefined(formatter.keyCode)) {
            var ctrlDown = false;
  
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
        }
      }
      
      // Hanlde pastes
      block.find('.paste-block')
        .bind('click', function(){ $(this).select(); })
        .bind('paste', this.onContentPasted); 
      
      // Do we have a dropzone? 
      if (this.blockType.dropEnabled) {}
      
      // Delete
      block.find('.delete').bind('click', this.onDeleteClick);
      
      // Handle text blocks
      if (block.find('.text-block').length > 0) {
        document.execCommand("styleWithCSS", false, false);
        document.execCommand("insertBrOnReturn", false, true);
      }
      
      // Focus if we're adding an empty block
      if (_.isEmpty(this.data)) {
        var inputs = block.find('[contenteditable="true"], input');
        if (inputs.length > 0 && !block.dropEnabled) {
          inputs[0].focus();
        }
      }
      
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
      var result = this._super("validate");
      return result;
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
    
    
    // Event handlers
    
    onMouseOverAbove: function(ev) {
      var item = $(ev.target).parents("." + this.instance.options.baseCSSClass + "-block");
      this.instance.marker.$el.after(item);
      this.instance.marker.$el.show();
    },
    
    onMouseOverBelow: function(ev) {
      var item = $(ev.target).parents("." + this.instance.options.baseCSSClass + "-block");
      this.instance.marker.$el.before(item);
      this.instance.marker.$el.show();
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
    
    onContentDrop: function(){},
    
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
        'class': 'block_editor',
        html: "<div class='block-above'></div>" + el + "<div class='block-below'></div>"
      });
      
      // Set our element references
      this.$el = block;
      this.el = this.$el[0];
    },
    
    /* A wrapper to call our parent object */
    _super: function(functionName, args) {
       return this.blockType[functionName](this, args);
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
  
  SirTrevor.BlockTypes.BlockQuote = new SirTrevor.BlockType({ 
    
    title: "Quote",
    className: "block-quote",
    toolbarEnabled: true,
    dropEnabled: false,
    limit: 0,
    
    editorHTML: function() {
      return _.template('<blockquote class="text-block <%= className %>" contenteditable="true"></blockquote><div class="input text"><label>Credit</label><input data-maxlength="140" name="cite" class="input-string" type="text" /></div>', this);
    },
    
    loadData: function(block, data){
      block.$('.text-block').html(block.instance._toHTML(data.text, block.type));
      block.$('input').val(data.cite);
    },
    
    toData: function(block){
      var bl = block.$el,
          dataStruct = bl.data('block'),
          content;
      
      /* Simple to start. Add conditions later */
      content = block.$('.text-block').html();
      dataStruct.data.text = block.instance._toMarkdown(content, block.type);
      dataStruct.data.cite = block.$('input').val();
    },
    
    toMarkdown: function(markdown) {
      return markdown.replace(/^(.+)$/mg,"> $1");
    }
    
  });
  /*
    Ordered List
  */
  
  var template = '<div class="text-block <%= className %>" contenteditable="true"></div>';
  
  SirTrevor.BlockTypes.OrderedList = new SirTrevor.BlockType({ 
    title: "Ordered List",
    className: "ordered-list",
    toolbarEnabled: true,
    dropEnabled: false,
    limit: 0,
    
    editorHTML: function() {
      return _.template(template, this);
    },
    
    onBlockRender: function(block){
      
      block.$('.text-block').bind('click', function(){
        if($(this).html().length === 0){
          document.execCommand("insertOrderedList",false,false);
        }
      });
      
      // Put in a list
      if (_.isEmpty(block.data)) {
        block.$('.text-block').focus().click();
      }
      
    },
      
    loadData: function(block, data){
      block.$('.text-block').html("<ol>" + block.instance._toHTML(data.text, block.type) + "</ol>");
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
  /*
    Text Block
  */
  
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
    
    validate: function(block) {
      console.log(block.$el.html().length);
      if( block.$el.html().length === 0) {
        block.errors.push('You must enter some content');
        return false;
      }
      return true;
    },
    
    loadData: function(block, data){
      block.$('.text-block').html(block.instance._toHTML(data.text, block.type));
    },
    
    onBlockRender: function(block){},
    
    onContentPasted: function(block, event){
      console.log('Content pasted');
    },
    
    onDrop: function(block){
      console.log('Drop');
    }
    
    
  });
  /*
    Unordered List
  */
  
  var template = '<div class="text-block <%= className %>" contenteditable="true"></div>';
  
  SirTrevor.BlockTypes.UnorderedList = new SirTrevor.BlockType({ 
    title: "Unordered List",
    className: "unordered-list",
    toolbarEnabled: true,
    dropEnabled: false,
    limit: 0,
    
    editorHTML: function() {
      return _.template(template, this);
    },
    
    onBlockRender: function(block) {
      block.$('.text-block').bind('click', function(){
        if($(this).html().length === 0){
          document.execCommand("insertUnorderedList",false,false);
        }
      });
      
      // Put in a list
      if (_.isEmpty(block.data)) {
        block.$('.text-block').focus().click();
      }
      
    },
      
    loadData: function(block, data){
      block.$('.text-block').html("<ul>" + block.instance._toHTML(data.text, block.type) + "</ul>");
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
  
  SirTrevor.Formatters.Underline = new SirTrevor.Formatter({
    title: "U",
    className: "underline",
    cmd: "underline"
  });
  
  SirTrevor.Formatters.Link = new SirTrevor.Formatter({
    
    title: "Link",
    className: "link",
    cmd: "CreateLink",
    
    onClick: function() {
      
      var link = prompt("Enter a link"),
          link_regex = /(ftp|http|https):\/\/./;
      
      if(link.length > 0) {
        
       if (!link_regex.test(link)) { 
         link = "http://" + link; 
       }
       
       document.execCommand(this.cmd, false, link);
      }
    }
  });
  
  SirTrevor.Formatters.Unlink = new SirTrevor.Formatter({
    title: "Unlink",
    className: "link",
    cmd: "unlink"
  });
  
  SirTrevor.Formatters.Heading1 = new SirTrevor.Formatter({
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
  
  SirTrevor.Formatters.Heading2 = new SirTrevor.Formatter({
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
  
  _.extend(Marker.prototype, Events, {
    
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
      
      // Bind events
      /*this.$el.bind('dragover', halt);
      this.$el.bind('mouseover', halt);
      this.$el.children().bind('mouseover', halt);
      
      this.instance.$wrapper.bind('mouseover', this.show);
      
      var hideEditor = function(ev){
        var target = $(ev.target);
        if (!target.parents('span').hasClass('sir-trevor-marker') && !target.hasClass('sir-trevor-marker')) { }
      };
      
      ; */
    },
    
    remove: function(){
      
    },
    
    show: function(){
      this.$el.show();
    },
    
    hide: function(){
      this.$el.hide();
    },
    
    onButtonClick: function(ev){
      halt(ev);
      var button = $(ev.target);
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
  
  _.extend(FormatBar.prototype, Events, {
    
    bound: ["onFormatButtonClick"],
    
    render: function(){
      
      var bar = $("<div>", {
        "class": this.className
      });
      
      this.instance.$wrapper.before(bar);
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
      
    },
    show: function(){},
    hide: function(){},
    
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
    }
    
  };
  
  _.extend(SirTrevorEditor.prototype, Events, {
    
    bound: ['onFormSubmit'],
    
    initialize: function() {},
    
    build: function() {
      
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
      this.attach();
    },
    
    attach: function() {
      this.$form.on('submit', this.onFormSubmit);
    },
    
    createBlock: function(type, data) {
      if (this._blockTypeAvailable(type)) {
        
       var blockType = SirTrevor.BlockTypes[type],
           currentBlockCount = (_.isUndefined(this.blockCounts[type])) ? 0 : this.blockCounts[type];
       
       // Can we have another one of these blocks?
       if (currentBlockCount > blockType.limit) {
         return false;
       }
       
       if (currentBlockCount + 1 == blockType.limit) {
         this.marker.find('[data-type="' + type + '"]')
                    .addClass('inactive')
                    .attr('title','You have reached the limit for this type of block');
       }
       
       var block = new SirTrevor.Block(this, blockType, data || {});  
       
       if (_.isUndefined(this.blockCounts[type])) {
         this.blockCounts[type] = 0;
       }
       
       this.blocks.push(block);
       this.blockCounts[type] = currentBlockCount + 1;
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
    },
    
    /* Handlers */
    
    onFormSubmit: function(e) {
      
      e.preventDefault();
      
      var blockLength, block, result;
  
      this.options.blockStore.data = [];
      
      // Loop through blocks to validate
      var blockIterator = function(block,index) {
        // Find our block
        block = $(block);
        var _block = _.find(this.blocks, function(b){ return (b.blockID == block.attr('id')); });
        
        if (_.isUndefined(_block) || _.isEmpty(_block) || typeof _block != SirTrevor.Block) {
          var data = _block.save();
          console.log(data);
          if(!_.isEmpty(data)) {
            this.options.blockStore.data.push(data);
          }
        }
        
      };
      _.each(this.$wrapper.find('.' + this.options.baseCSSClass + "-block"), _.bind(blockIterator, this));
  
      // Empty or JSON-ify
      this.$el.val((this.options.blockStore.data.length === 0) ? '' : this.to_json());
      return false;
    },
    
    /* Privates */
    
    to_json: function() {
      return JSON.stringify(this.options.blockStore);
    },
    
    from_json: function() {
      var content = this.$el.val();
      if (content.length > 0) {
        this.options.blockStore = JSON.parse(content);
      } else {
        this.options.blockStore.data = [];
      }
    },
    
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
      this.$el
        .wrap(
          $('<div>', { 
            'class': this.options.baseCSSClass
          })
        )
        .wrap(
          $('<div>', { 
            'class': this.options.baseCSSClass + "_dragleave"
          })
        )
        .wrap(
          $('<div>', {
            id: this.ID,
            'class': this.options.baseCSSClass + "_container",
            'style': 'padding: 20px;',
            dropzone: 'copy link move'
          })
        );
        
      this.$wrapper = this.$form.find('#' + this.ID); 
      return true;
    },
    
    _setBlocksAndFormatters: function() {
      this.blockTypes = flattern((_.isUndefined(this.options.blockTypes)) ? SirTrevor.BlockTypes : this.options.blockTypes);
      this.formatters = flattern((_.isUndefined(this.options.formatters)) ? SirTrevor.Formatters : this.options.formatters);
    },
    
    _toMarkdown: function(content, type) {
      /* 
        Generic Markdown parser. Takes HTML and returns Markdown (obvs)
        This can be extended through your formatters.
      */
      
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
                  .replace(/(?:\*\*)([^*|_]+)(?:\*\*)/mg,"<b>$1</b>")                // Bold
                  .replace(/(?:_)([^*|_]+)(?:_)/mg,"<i>$1</i>");                     // Italic
         
      return html;  
    }
  });
  
  

}(jQuery, _));
