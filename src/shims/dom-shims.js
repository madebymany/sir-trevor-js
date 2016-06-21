(function () {
  'use strict';

  // The IE's "contains" method does not work when a text node is passed as argument.
  if (/Trident/.test(navigator.userAgent)) {
    Object.defineProperty(HTMLElement.prototype, 'contains', {
      writable: true,
      enumerable: false,
      configurable: true,
      value: function(node) {
        if (!node) return false;
        return this === node || !!(this.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_CONTAINED_BY);
      }
    });
  }

  // IE does not implement `Document.prototype.contains`
  if (typeof Document.prototype.contains !== 'function') {
    Object.defineProperty(Document.prototype, 'contains', {
      writable: true,
      enumerable: false,
      configurable: true,
      value: function(el) {
        if (!el) return false;
        return this.documentElement.contains(el);
      }
    });
  }

  // IE does not implement `Range.prototype.intersectsNode`
  if (typeof Range.prototype.intersectsNode !== 'function') {
    Object.defineProperty(Range.prototype, 'intersectsNode', {
      writable: true,
      enumerable: false,
      configurable: true,
      value: function(node) {
        if (!node) {
          throw new TypeError("Failed to execute 'intersectsNode' on 'Range': 1 argument required, but only 0 present.");
        }
        if (this.startContainer.ownerDocument !== node.ownerDocument) return false;
        if (!node.parentNode) return true;

        var targetRange = document.createRange();
        targetRange.selectNode(node);
        var startEnd = this.compareBoundaryPoints(Range.START_TO_END, targetRange);
        var endStart = this.compareBoundaryPoints(Range.END_TO_START, targetRange);

        return startEnd === 1 && endStart === -1;
      }
    });
  }
}());