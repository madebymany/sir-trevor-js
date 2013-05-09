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
