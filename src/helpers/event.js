/* Halt event execution */
function halt(ev){
  ev.preventDefault();
  ev.stopPropagation();
}

function controlKeyDown(ev){
  return (ev.which == 17 || ev.which == 224);
}