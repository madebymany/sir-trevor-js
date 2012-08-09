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