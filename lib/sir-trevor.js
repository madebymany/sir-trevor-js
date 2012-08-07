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
    el: null,
    baseCSSClass: "sir-trevor",
    storage: "json",
    blockStore: {
      "data": []
    },
    defaultType: "TextBlock",
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

  SirTrevor.BlockTypes = {};
  SirTrevor.Formatters = {};
  
  /*
    Given an array or object, flatten it and return only the key => true
  */
  
  function flattern(obj){
    var x = {};
    _.each(obj, function(a,b) {
      x[a] = true;
    });
    return x;
  }
  
  function convertToMarkdown(html, type) {
    
    var markdown;
    
    markdown = html.replace(/\n/mg,"")
                   .replace(/<a.*?href=[""'](.*?)[""'].*?>(.*?)<\/a>/g,"[$2]($1)")         // Hyperlinks
                   .replace(/<\/?b>/g,"**").replace(/<\/?STRONG>/g,"**")                   // Bold
                   .replace(/<\/?i>/g,"_").replace(/<\/?EM>/g,"_");                        // Italic
  
    if(type == "UnorderedList") {
      markdown = markdown.replace(/<\/li>/mg,"\n")
                         .replace(/<\/?[^>]+(>|$)/g, "")
                         .replace(/^(.+)$/mg," - $1");
    }
    
    markdown = markdown.replace(/([^<>]+)(<div>)/g,"$1\n\n$2")                                 // Divitis style line breaks (handle the first line)
                   .replace(/(?:<div>)([^<>]+)(?:<div>)/g,"$1\n\n")                            // ^ (handle nested divs that start with content)
                   .replace(/(?:<div>)(?:<br>)?([^<>]+)(?:<br>)?(?:<\/div>)/g,"$1\n\n")        // ^ (handle content inside divs)
                   .replace(/<\/p>/g,"\n\n\n\n")                                               // P tags as line breaks
                   .replace(/<(.)?br(.)?>/g,"\n\n")                                            // Convert normal line breaks
                   .replace(/&nbsp;/g," ")                                                     // Strip white-space entities 
                   .replace(/&lt;/g,"<").replace(/&gt;/g,">")                                  // Encoding
                   .replace(/<\/?[^>]+(>|$)/g, "");                                            // Strip remaining HTML
        
    if(type == "BlockQuote") markdown = markdown.replace(/^(.+)$/mg,"> $1");
  
    return markdown;
  }
  
  function toHTML(markdown) {
    markdown = markdown.replace(/^ - (.+)$/mg,"<li>$1</li>");
    return  markdown.replace(/^\> (.+)$/mg,"$1")                                       // Blockquotes
                    .replace(/\n\n/g,"<br>")                                           // Give me some <br>s
                    .replace(/\[(.+)\]\((.+)\)/g,"<a href='$2'>$1</a>")                 // Links
                    .replace(/(?:\*\*)([^*|_]+)(?:\*\*)/mg,"<b>$1</b>")                // Bold
                    .replace(/(?:_)([^*|_]+)(?:_)/mg,"<i>$1</i>");                     // Italic
  }
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
  
  var blockTypeOptions = ["className", "toolbarEnabled", "dropEnabled", "title", "limit", "editorHTML", "dropzoneHTML", "validate", "loadData", "toData"];
  
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
          dataStruct.data.text = convertToMarkdown(content, block.type);
        }
      }
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
    this.render();
  };
  
  _.extend(Block.prototype, {
    
    $: function(selector) {
      return this.$el.find(selector);
    },
    
    render: function() {
      
      this.instance.$wrapper.append(
        $('<div>', { 
          'class': this.instance.options.baseCSSClass + "-block", 
          id: this.blockID,
          "data-type": this.type,
          html: this.$el
        })
      );
      
      // Has data already?
      if (!_.isUndefined(this.data) && !_.isEmpty(this.data)) {
        this.loadData();
      }
      
      // And save the state
      this.save();
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
    },
    
    to_json: function(data) {
      return {
        type: this.type,
        data: data
      };
    },
    
    /*
      Our template is always either a string or a function
    */
    _setElement: function(){
      var el = (_.isFunction(this.blockType.editorHTML)) ? this.blockType.editorHTML() : this.blockType.editorHTML;
      
      // Wrap in a block
      var block = $('<div>', {
        'class': 'block_editor',
        html: el
      });
      
      // Set our element references
      this.$el = block;
      this.el = this.$el[0];
    },
    
    /* A wrapper to call our parent object */
    _super: function(functionName, args) {
     // if (_.has(this.blockType,functionName) && _.isFunction(this.blockType[functionName])) {
       console.log(functionName, args);
       return this.blockType[functionName](this, args);
    //  } else {
     //   console.log('Function doesnt exist');
    //  }
    }
  });
  
  /*
    Generic Block Implementation
  */
  
  var Format = SirTrevor.Formatter = function(options){
    this.formatId = _.uniqueId('format-');
    this._configure(options || {});
    this.className = SirTrevor.DEFAULTS.baseCSSClass + "-format-" + this.options.className;
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
      block.$('.text-block').html(toHTML(data.text));
    }
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
    this.blocks = {};
    this.options = _.extend({}, SirTrevor.DEFAULTS, options || {});
    this.ID = _.uniqueId(this.options.baseCSSClass + "-");
    this._ensureAndSetElements();
    this._setBlocksAndFormatters();
    this._bindFunctions();
    this.from_json();
    this.build();
  };
  
  _.extend(SirTrevorEditor.prototype, {
    
    bound: ['onFormSubmit'],
    
    initialize: function() {},
    
    build: function() {
      
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
           currentBlockCount = (_.isUndefined(this.blocks[type])) ? 0 : this.blocks[type].length;
       
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
       
       if (_.isUndefined(this.blocks[type])) {
         this.blocks[type] = [];
       }
       
       this.blocks[type].push(block);
      }
    },
    
    removeBlock: function(block) {
      if (!_.isUndefined(this.blocks[block.type][block.ID])) {
        block.remove();
        this.blocks[type][name] = null;
        delete this.blocks[type][name];
      }
    },
    
    /* Handlers */
    
    onFormSubmit: function(e) {
      
      e.preventDefault();
      
      var blockLength, block, result;
  
      this.options.blockStore.data = [];
      
      // Loop through blocks to validate
      for (var type in this.blocks) {
        
        if (this.blocks.hasOwnProperty(type)) {
          blockLength = this.blocks[type].length;
  
          for (var i = 0; i < blockLength; i++) {
            
            block = this.blocks[type][i];
            
            /*
              Save the blocks state and push to the blockStore object
            */
            
            block.save();
            
           // result = block.validate();
            
           // if (!result) {
          //    console.log(block.errors); // Show our errors.
         //   } else {
              
         //   }
            this.options.blockStore.data.push(block.$el.data('block'));
          } 
        }
      }
      
      // Empty or JSON-ify
      this.$el.val((this.options.blockStore.data.length === 0) ? '' : this.to_json());
      console.log(this.to_json());
      
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
        this.options.blockStore = [];
      }
    },
    
    _blockTypeAvailable: function(t) {
      return !_.isUndefined(this.blockTypes[t]);
    },
    
    _formatterAvailable: function(f) {
      return !_.isUndefined(this.formatters[f]);
    },
    
    _ensureAndSetElements: function() {
      
      this.$el = this.options.el;
      this.el = this.options.el[0];
      this.$form = this.$el.parents('form');
      
      // Wrap our element in lots of containers *eww*
      this.$el
        .wrap(
          $('<div>', { 
            'class': this.options.baseCSSClass + "_outer"
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
            dropzone: 'copy link move'
          })
        );
        
      this.$wrapper = this.$form.find('#' + this.ID); 
    },
    
    _setBlocksAndFormatters: function() {
      this.blockTypes = flattern((_.isUndefined(this.options.blockTypes)) ? SirTrevor.BlockTypes : this.options.blockTypes);
      this.formatters = flattern((_.isUndefined(this.options.formatters)) ? SirTrevor.Formatters : this.options.formatters);
    },
    
    _bindFunctions: function(){
      _.bindAll(this, this.bound);
    }
    
  });
  
  

}(jQuery, _));
