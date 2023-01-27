;(function (exports) {
  'use strict';

  exports.supertext = function (textarea, div) {
    var blinkTimeout;
    var lastSelectionStart = 0;
    var lastSelectionEnd = 0;
    var whichSelection = true;

    function createCaret() {
      var caret = document.createElement('span');
      var classAttr = document.createAttribute('class');
      classAttr.value = 'caret';
      caret.setAttributeNode(classAttr);
      caret.appendChild(document.createTextNode('\xA0'));
      return caret;
    }

    function blinkCaret() {
      var caretDOM = div.querySelector('.caret');
      if (caretDOM) caretDOM.hidden ^= 1;
      blinkTimeout = setTimeout(blinkCaret, 500);
    }

    function hideCaret() {
      updateScroll();
      div.querySelector('.caret').hidden = true;
      clearTimeout(blinkTimeout);
    }

    function updateDiv() {
      var i = 0;
      var cursorPos;
      var firstChild;
      var textLen = textarea.value.length;

      while (firstChild = div.firstChild) {
        div.removeChild(firstChild);
      }

      if (textarea.selectionStart !== lastSelectionStart) {
        lastSelectionStart = textarea.selectionStart;
        whichSelection = false;
      }

      if (textarea.selectionEnd !== lastSelectionEnd) {
        lastSelectionEnd = textarea.selectionEnd;
        whichSelection = true;
      }

      cursorPos = whichSelection ? textarea.selectionEnd : textarea.selectionStart;

      div.appendChild(document.createTextNode(textarea.value.substr(0, cursorPos)));
      div.appendChild(createCaret());
      div.appendChild(document.createTextNode(textarea.value.substr(cursorPos, textLen)));

      clearTimeout(blinkTimeout);
      blinkTimeout = setTimeout(blinkCaret, 500);

      setTimeout(updateScroll, 0);
    }

    function updateDivTick() {
      setTimeout(updateDiv, 0);
    }

    function updateScroll() {
      div.scrollTop = textarea.scrollTop;
    }

    function bindEvents() {
      textarea.addEventListener('input', updateDiv);
      textarea.addEventListener('focus', updateDiv);
      textarea.addEventListener('mousedown', updateDivTick);
      textarea.addEventListener('keydown', updateDivTick);
      textarea.addEventListener('blur', hideCaret);
      textarea.addEventListener('scroll', updateScroll);
    }

    function unbindEvents() {
      textarea.removeEventListener('input', updateDiv);
      textarea.removeEventListener('focus', updateDiv);
      textarea.removeEventListener('mousedown', updateDivTick);
      textarea.removeEventListener('keydown', updateDivTick);
      textarea.removeEventListener('blur', hideCaret);
      textarea.removeEventListener('scroll', updateScroll);
    }

    function destroy() {
      unbindEvents();
    }

    function forceUpdate() {
      updateDiv();
    }

    return {
      destroy: destroy,
      forceUpdate: forceUpdate,
      bindEvents: bindEvents,
      unbindEvents: unbindEvents
    };
  }
})(this);
