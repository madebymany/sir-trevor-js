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