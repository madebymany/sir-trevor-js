## Sir Trevor JS

All docs are very, very WIP.

Block view element implementation loosely based on Backbone. 

## Structure

BlockTypes / Formatters global
Block tied to an instance of Editor
Editor can have any number of blocks

## Block Templates

editorHTML can be string or function that returns a string. Made jQuery objects in the view and available via this.$el and this.el. 
We set the class name of an element by default. Override allowed though. Set element called after init, so any options are available to the template.

We map $() to within the current block template element.

