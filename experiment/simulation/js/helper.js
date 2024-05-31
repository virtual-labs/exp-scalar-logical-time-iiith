"use strict";

export function isElement(element) {
    return element instanceof Element || element instanceof Document;  
}

export function getPosition(el) {
    var xPosition = 0;
    var yPosition = 0;
   
    while (el) {
      if (el == document.body) {

        var xScrollPos = el.scrollLeft || document.documentElement.scrollLeft;
        var yScrollPos = el.scrollTop || document.documentElement.scrollTop;
   
        xPosition += (el.offsetLeft - xScrollPos + el.clientLeft);
        yPosition += (el.offsetTop - yScrollPos + el.clientTop);
      } 
      else {
        xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
      }
   
      el = el.offsetParent;
    }
    return {
      x: xPosition,
      y: yPosition
    };
}

export function getRelativePosition(el, par) {
    var xPosition = 0;
    var yPosition = 0;
    while (!(el === par)) {
        if (el == document.body) {

            var xScrollPos = el.scrollLeft || document.documentElement.scrollLeft;
            var yScrollPos = el.scrollTop || document.documentElement.scrollTop;
       
            xPosition += (el.offsetLeft - xScrollPos + el.clientLeft);
            yPosition += (el.offsetTop - yScrollPos + el.clientTop);
          } 
          else {
            xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft);
            yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
          }
       
          el = el.offsetParent;
    }
    return {
        x: xPosition,
        y: yPosition
      };
}