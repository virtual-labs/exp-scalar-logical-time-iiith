"use strict";

import { computeScalar, createEvent, createMessage } from "./simulation.js";
import { isElement, getPosition, getRelativePosition } from "./helper.js";

const tellspace = document.getElementById("tellspace");
// Area of work

const simspace = document.getElementById("simspace");
// Used to store containers

const messagespace = document.getElementById("messagespace");
// Used to draw lines between events

const nodes = [];
// An array of all nodes in the distributed system

const events = [];
// Array of all events

let max_events_offset = 0;
// Local Co-ordinates in simspace  of the rightmost event

const messages = [];
// Array of all events

let addEventsMessage = true;
// Used with buttons in eventadd div to see whether events and messages should be added or deleted

let ticking = false;
// Used to throttle events

let messagestate = 0;
let currentMessage = null;
let fromMessage = null;

function manageTime(event) {
    if (!ticking) {
        const scrollwidth = tellspace.scrollWidth;
        const clientwidth = tellspace.clientWidth;
        // Getting real width and displayed width in pixels

        const vw = Math.min(Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 100, 10);

        const curwidth    = parseFloat(simspace.style.width.slice(0, -2));
        // Getting current width

        window.requestAnimationFrame(function() {
            // If a scrollbar is required
            if(scrollwidth > clientwidth) {
                if(scrollwidth - clientwidth <= tellspace.scrollLeft) {
                    // If the scrollbar is at max left, add some more space
                    tellspace.scrollTo(scrollwidth - clientwidth - 4, 0);
                    simspace.style.width = String(curwidth + 5) + 'px';
                }
                else if (tellspace.scrollLeft <= 0 && curwidth - 5 >= clientwidth && curwidth - 13 - 10 * vw >= max_events_offset) {
                    // If the scrollbar is at max right delete some space
                    // Don't let the space get too small or shrink beyond an event
                    tellspace.scrollTo(4, 0);
                    simspace.style.width = String(curwidth - 5) + 'px';
                }
            }
            ticking = false;
        });
        ticking = true;
    }
}

function prepareInputbuttons(mytarget, target2, inmin, inmax) {
    const toadd = document.createElement("div");
    toadd.className = "quantity-nav";
    // Creating bounding boxes for + and - buttons
    
    const toadd2 = document.createElement("div");
    toadd2.className = "quantity-button quantity-up";
    toadd2.appendChild(document.createTextNode("+"));
    toadd2.addEventListener("click", function() {
        const oldval = parseInt(target2.value);
        if(oldval < inmax) {
            target2.value = String(oldval + 1);
        }
    });
    // Creating + button
    
    const toadd3 = document.createElement("div");
    toadd3.className = "quantity-button quantity-down";
    toadd3.appendChild(document.createTextNode("-"));
    toadd3.addEventListener("click", function() {
        const oldval = parseInt(target2.value);
        if(oldval > inmin) {
            target2.value = String(oldval - 1);
        }
    });
    // Creating - button
    
    toadd.appendChild(toadd2);
    toadd.appendChild(toadd3);
    // Adding buttons to container

    if (isElement(mytarget)) {
        mytarget.appendChild(toadd);
    }   
}

const shapeOffset = 7.5;

// Creating an event
function createEventVisual(target, offsetX) {
    const toadd = document.createElement("div");
    toadd.className = "event";
    toadd.style.left = String(offsetX - shapeOffset) + "px";
    // Take 7.5 from size of the event button? itself
    const roundedX = Math.round(offsetX);
    // Rounding value to an integer, so it can be compared with and deleted later. No danger of overlap as shapes are > 1px and can't overlap
    if(roundedX > max_events_offset) {
        max_events_offset = offsetX;
    }
    // If this is the rightmost event so far, designate it
    toadd.dataset.myx = roundedX.toString();
    toadd.dataset.process = target.dataset.process;
    // Saving identifier for use in deletion
    target.appendChild(toadd);
    // Adding element
    events.push(createEvent(roundedX, target.dataset.process));
    console.log(events);
}

//Deleting an event
function deleteEventVisual(target, currentTarget) {
    const intx = parseInt(target.dataset.myx); 
    const rindx = events.map(
        function(e) {
            return e.t;
        }
        ).indexOf(intx);
    // Getting identifier from target
    if(rindx > -1) {
        events.splice(rindx, 1);
    }
    // Removing element based on target
    console.log(events);
    if(intx === max_events_offset) {
        if (events.length >= 1) {
            max_events_offset = Math.max.apply(null, events.map(
                function(e) {
                    return e.t;
                }
                ));
        }
        else {
            max_events_offset = 0;
        }
        console.log(max_events_offset);
    }
    // If the maximum element has just been removed, find a new maximum
    currentTarget.removeChild(target);
}

// Manages event creation
function manageEventVisual(event) {
    if(event.button < 4) {
        // Only when any mouse buttons are pressed
        if (addEventsMessage) {
            if(!(event.target.className == "event")) {
                // We don't want one event on top of another for the sake of clarity
                createEventVisual(event.target, event.offsetX);
            }
        }
        else {
            if(event.target.className == "event") {
                deleteEventVisual(event.target, event.currentTarget);
            }
        }
    }
}

// Creates mesages
function createMessageVisual(event) {
    if(addEventsMessage && event.target.className === "slider-bone" && event.button < 4) {
        if (!(messagestate === 1)) {
            const toadd = document.createElementNS("http://www.w3.org/2000/svg", "line");
            toadd.setAttribute("class", "message");
            toadd.setAttribute("x1", String(event.offsetX) + 'px');
            toadd.setAttribute("y1", String(getRelativePosition(event.target, event.currentTarget).y) + 'px');
            messagespace.appendChild(toadd);
            currentMessage = toadd;
            fromMessage = event.target;
            messagestate = 1;
        }
        // Signal start of a potential message
    }
}

// Visualize creation
function dragMessageVisual(event) {
    if ((!ticking) && messagestate === 1) {
        window.requestAnimationFrame(function() {
            currentMessage.setAttribute("x2", event.offsetX.toString() + 'px');
            currentMessage.setAttribute("y2", event.offsetY.toString() + 'px');
            ticking = false;
        });
        ticking = true;
    }
}

// Common tasks for faliing to create a message
function failedMessageVisual() {
    messagestate = 2;
    messagespace.removeChild(currentMessage);
    currentMessage = null;
    fromMessage = null;
    messagestate = 0;
}

// Creation of message failed - mouse left simspace
function endDragMessageVisual(event) {
    if((!ticking) && messagestate === 1) {
        failedMessageVisual();
    }
}

// Creation of message ended in a point inside simspace
function finishDragMessageVisual(event) {
    if((!ticking) && messagestate === 1) {
        if(event.target.className === "slider-bone" && !(fromMessage === event.target)) {
            messagestate = 3;
            currentMessage.setAttribute("x2", event.offsetX.toString() + 'px');
            currentMessage.setAttribute("y2", String(getRelativePosition(event.target, event.currentTarget).y) + 'px');
            messagestate = 0;
        }
        else {
            failedMessageVisual();
        }
    }
}

function createNode() {
    
    const inmin = 1;
    const inmax = 5;
    
    const toadd = document.createElement("div");
    toadd.className = "slider-container";
    // Creating a container for the node timeline
    
    const toadd2 = document.createElement("input");
    toadd2.type = "number";
    toadd2.className = "increment";
    toadd2.min = inmin.toString();
    toadd2.max = inmax.toString();
    toadd2.value = inmin.toString();
    // Text boxes for setting increment in time step at each processor
    // Change CSS values for class increment should the max increase beyond some digits
    
    const toadd3 = document.createElement("div");
    toadd3.className = "slider";
    // Representing timeline of each node
    
    const toadd4 = document.createElement("div");
    toadd4.className = "slider-bone";
    toadd4.dataset.process = nodes.length;
    toadd4.addEventListener("click", manageEventVisual);
    toadd3.appendChild(toadd4);
    // Adding straight line representing timeline
    
    toadd.appendChild(toadd2);
    // Adding input to timeline

    prepareInputbuttons(toadd, toadd2, inmin, inmax);
    // Preparing input buttons
    
    toadd.appendChild(toadd3);
    // Setting up the a container div for each node
    
    simspace.appendChild(toadd);
    // Adding the container div to the simulation
    
    nodes.push(toadd);
    // Keeping track of the container div
}

function deleteNode() {
    nodes.pop();
    if(isElement(simspace.lastElementChild)) {
        simspace.removeChild(simspace.lastElementChild);
    }
    let i = events.length;
    while(i-- > 0) {
        if(parseInt(events[i].p) >= nodes.length) {
            events.splice(i, 1);
        } 
    }
    // Removing invalid events
}

const addMode = document.getElementById("add"); 
const subMode = document.getElementById("subtract");
function updateModes() {
    const setcolor = "#DDFFDD";
    if(addEventsMessage) {
        addMode.style.backgroundColor = setcolor;
        subMode.style.backgroundColor = "";
    }
    else {
        addMode.style.backgroundColor = "";
        subMode.style.backgroundColor = setcolor;
    }

}

function inputMode(event) {
    const oldevent = addEventsMessage;
    if(event.target == addMode) {
        addEventsMessage = true;
    }
    if(event.target == subMode) {
        addEventsMessage = false;
    }
    if(addEventsMessage != oldevent) {
        updateModes();
    }
}

simspace.style.width = tellspace.clientWidth.toString() + 'px';
tellspace.addEventListener("scroll", manageTime);
simspace.addEventListener("mousedown", createMessageVisual);
simspace.addEventListener("mousemove", dragMessageVisual);
simspace.addEventListener("mouseleave", endDragMessageVisual);
simspace.addEventListener("mouseup", finishDragMessageVisual);
document.getElementById("plus").addEventListener("click", createNode);
document.getElementById("minus").addEventListener("click", deleteNode);
addMode.addEventListener("click", inputMode);
subMode.addEventListener("click", inputMode);
updateModes();