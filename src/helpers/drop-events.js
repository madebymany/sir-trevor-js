"use strict";

function dragEnter(e) {
  e.preventDefault();
  e.stopPropagation();
}

function dragOver(e) {
  e.dataTransfer.dropEffect = "copy";
  e.currentTarget.classList.add('st-drag-over');
  e.preventDefault();
  e.stopPropagation();
}

function dragLeave(e) {
  e.currentTarget.classList.remove('st-drag-over');
  e.preventDefault();
  e.stopPropagation();
}

module.exports = {

  dropArea: function(el) {
    el.addEventListener("dragenter", dragEnter);
    el.addEventListener("dragover",  dragOver);
    el.addEventListener("dragleave", dragLeave);
    return el;
  },

  noDropArea: function(el) {
    el.removeEventListener("dragenter");
    el.removeEventListener("dragover");
    el.removeEventListener("dragleave");
    return el;
  }

};