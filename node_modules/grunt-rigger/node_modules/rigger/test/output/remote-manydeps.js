function createElement(tag, attributes, css) {
    var element = document.createElement(tag), key;
    
    // iterate through the attributes
    for (key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            element[key] = attributes[key];
        } 
    } 
    
    for (key in css) {
        if (css.hasOwnProperty(key)) {
            element.style[key] = css[key];
        }
    }
    
    return element;
} // createElement

// if we don't have a querySelector function available shim it to jQuery (or zepto)
if (typeof document.querySelector == 'undefined') {
    var qsa = document.querySelectorAll = function(selector, scope) {
        return $(selector, scope);
    };
    
    document.querySelector = function(selector, scope) {
        return qsa(selector, scope)[0];
    };
}