"use strict";

import { computeScalar, createEvent, createMessage } from "./simulation.js";
import { isElement, getPosition, getRelativePosition, rotateLine, lineParallel } from "./helper.js";

const tellspace = document.getElementById("tellspace");
// Area of work

const simspace = document.getElementById("simspace");
let simpos = null;
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
// Array of all messages

let addEventsMessage = true;
// Used with buttons in eventadd div to see whether events and messages should be added or deleted

let ticking = false;
// Used to throttle events

let messagestate = 0;
let currentMessage = null;
let fromMessage = null;
let fromEvent = null;
let fromEventobj = null;
// Used for creating message

const shapeOffset = 7.5;
// Related to size of event marker

const addMode = document.getElementById("add"); 
const subMode = document.getElementById("subtract");
// Buttons for changing between adding and subtracting events

const event_time = new Map();
// Event time mappings

const ticks = [];
// Array having ticking for each process

const causal_chain = new Map();
// Map establishing causal links between elements

// Function is used to determine whether the current width can hold all events. Empirically determined
function mysteryAdjustment(curwidth, vw, max_events_offset) {
    return curwidth - 13 - 10 * vw >= max_events_offset;
}

// Function is used to adjust time
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
                if(scrollwidth - clientwidth <= tellspace.scrollLeft + 1) {
                    // If the scrollbar is at max right, add some more space
                    tellspace.scrollTo(scrollwidth - clientwidth - 4, 0);
                    simspace.style.width = String(curwidth + 5) + 'px';
                }
                else if (tellspace.scrollLeft <= 1 && curwidth - 5 >= clientwidth && mysteryAdjustment(curwidth, vw, max_events_offset)) {
                    // If the scrollbar is at max left delete some space
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

// Function for updating times associated with each element
function updateEventTimes() {
    const cycleDetect = computeScalar(events, messages, ticks, event_time, causal_chain);
    if(!cycleDetect) {
        console.log(document.getElementsByClassName("event-tip"));
        let i = events.length - 1;
        while(i >= 0) {
            const ID_FORMAT = events[i].p.toString() + '-' + events[i].t.toString() + '-tip';
            // Format of event tool tip
            const eventtip = document.getElementById(ID_FORMAT);
            // Getting tip corresponding to event
            if(!(eventtip === null)) {
                while(eventtip.firstChild) {
                    eventtip.removeChild(eventtip.lastChild);
                }
                // Remove all previous text
                console.log("element");
                const toadd = document.createTextNode(String(event_time.get(events[i])));
                eventtip.appendChild(toadd);
                // Adding new time
            }
            i--;
        }
        // Modifying DOM which might be observable - request timeout from other events       
    }
    return cycleDetect;
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
            ticks[target2.dataset.process] += 1;
            if(mytarget.getElementsByClassName("event").length > 0) {
                updateEventTimes();
            }
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
            ticks[target2.dataset.process] -= 1;
            if(mytarget.getElementsByClassName("event").length > 0) {
                updateEventTimes();
            }
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

// Creating an event
function createEventVisual(target, offsetX, noupdate = false) {
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
    const ID_FORMAT = toadd.dataset.process.toString() + '-' + toadd.dataset.myx.toString();
    // Common identifier for detecting clicks 
    const toadd3 = document.createElement("input");
    toadd3.type = "checkbox";
    toadd3.className = "check-label";
    toadd3.id = ID_FORMAT + 'input';
    // Creating an invisible checkbox
    const toadd4 = document.createElement("label");
    toadd4.className = "check-label";
    toadd4.htmlFor = ID_FORMAT + 'input';
    // Create the clickable area
    const toadd5 = document.createElement("span");
    toadd5.className = "event-tip";
    toadd5.id = ID_FORMAT + '-tip';
    // Creating pop up for displaying times
    toadd.appendChild(toadd3);
    toadd.appendChild(toadd4);
    toadd.appendChild(toadd5);
    // Adding elements for displaying event time on click
    target.appendChild(toadd);
    // Adding element
    const toadd2 = createEvent(roundedX, parseInt(target.dataset.process));
    events.push(toadd2);

    console.log(events);
    if(!noupdate) {
        updateEventTimes();
    }
    return [toadd, toadd2];
}

//Deleting an event
function deleteEventVisual(target, currentTarget, noupdate) {
    const intx = parseInt(target.dataset.myx);
    let toreturn = null; 
    const rindx = events.map(
        function(e) {
            return e.t;
        }
        ).indexOf(intx);
    // Getting identifier from target
    if(rindx > -1) {
        toreturn = events[rindx];
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
    if(!noupdate) {
        updateEventTimes();
    }
    return toreturn;
}

// Manages event creation and deletion
function manageEventVisual(event) {
    if(event.button < 4) {
        // Only when any mouse buttons are pressed
        if (addEventsMessage) {
            if(event.target.className == "slider-bone") {
                // We don't want one event on top of another for the sake of clarity
                createEventVisual(event.target, event.offsetX);
            }
        }
        else {
            if(event.target.className == "event") {
                deleteEventVisual(event.target, event.currentTarget);
            }
            else if (
                Array.from(event.target.classList).some(
                    function(item) {
                        return item === "from" || item === "to";
                })
            ) {
                // Deleting message and the events on from and to processes if either from or to events of the message is deleted
                const messagelist = messagespace.getElementsByClassName("message");
                for (const message of messagelist) {
                    if (
                            (event.target.dataset.myx === message.dataset.fromx
                                && 
                            event.target.dataset.process === message.dataset.fromprocess
                            ) || 
                            (event.target.dataset.myx === message.dataset.tox
                                &&
                            event.target.dataset.process === message.dataset.toprocess
                            )
                    ) {
                        const linelement = message.getElementsByTagNameNS("http://www.w3.org/2000/svg", "line");
                        if (linelement.length === 1) {
                            console.log(linelement);
                            deleteMessage(linelement[0]);    
                        }
                    }
                }
            }
        }
    }
}

// Deletes messages. Accepts the line SVG object connecting the two processes as argument
function deleteMessage(target) {
    const parentElement = target.parentElement;
    if(!(parentElement === null)) {
        const fromprocess = parentElement.dataset.fromprocess;
        const toprocess = parentElement.dataset.toprocess;
        const fromx = parentElement.dataset.fromx;
        const tox = parentElement.dataset.tox;
        const eventlist = Array.from(simspace.getElementsByClassName("event"));
        const fromevent = [];
        const toevent = [];
        for(const event of eventlist) {
            if (event.dataset.myx === fromx && event.dataset.process === fromprocess) {
                fromevent.push(deleteEventVisual(event, event.parentElement));
            }
            if(event.dataset.myx === tox && event.dataset.process === toprocess) {
                toevent.push(deleteEventVisual(event, event.parentElement));
            }
        }
        const grandParent = parentElement.parentElement;
        grandParent.removeChild(parentElement);
        for(let i = messages.length - 1; i >= 0; i--) {
            if(
                fromevent.some(function(item) {
                    return item === messages[i].event1
                }) &&
                toevent.some(function(item) {
                    return item === messages[i].event2
                })) {
                    messages.splice(i, 1);
                }
        }
        console.log(messages);
    }
}

// Deletes messages on mouse event
function deleteMessageVisual(event) {
    if(!addEventsMessage && event.target === event.currentTarget && event.button < 4) {
        deleteMessage(event.target);
    }
}

// Creates mesages
function createMessageVisual(event) {
    if(addEventsMessage && event.target.className === "slider-bone" && event.button < 4) {
        if (!(messagestate === 1)) {
            const toadd = document.createElementNS("http://www.w3.org/2000/svg", "line");
            toadd.setAttributeNS(null, "class", "message");
            const relPos = getRelativePosition(event.target, event.currentTarget);
            toadd.setAttributeNS(null, "x1", String(event.offsetX + relPos.x) + 'px');
            toadd.setAttributeNS(null, "y1", String(relPos.y) + 'px');
            toadd.setAttributeNS(null, "x2", String(event.offsetX + relPos.x) + 'px');
            toadd.setAttributeNS(null, "y2", String(relPos.y) + 'px');
            // Creating temporary line for guiding message drawing
            messagespace.appendChild(toadd);
            // Making the line visible
            currentMessage = toadd;
            fromMessage = event.target;
            [fromEvent, fromEventobj] = createEventVisual(event.target, event.offsetX, true);
            messagestate = 1;
        }
        // Signal start of a potential message
    }
}

// Visualize creation
function dragMessageVisual(event) {
    if ((!ticking) && messagestate === 1) {
        window.requestAnimationFrame(function() {
            currentMessage.setAttributeNS(null, "x2", String(event.clientX - simpos.x) + 'px');
            currentMessage.setAttributeNS(null, "y2", String(event.clientY - simpos.y) + 'px');
            ticking = false;
        });
        ticking = true;
        // Throttling events to follow mouse
    }
}

// Common tasks for faliing to create a message
function failedMessageVisual() {
    messagestate = 2;
    messagespace.removeChild(currentMessage);
    deleteEventVisual(fromEvent, fromMessage, true);
    currentMessage = null;
    fromMessage = null;
    fromEvent = null;
    fromEventobj = null;
    messagestate = 0;
}

// Creation of message failed - mouse left simspace
function endDragMessageVisual(event) {
    if((!ticking) && messagestate === 1) {
        failedMessageVisual();
    }
}

// Function to handle graphics part of drawing messages
function drawMessage(line, fromprocess, toprocess, fromx, tox) {
    const pc = {
        x: parseFloat(line.getAttributeNS(null, "x2")),
        y: parseFloat(line.getAttributeNS(null, "y2"))
    };
    // The center of arrows is the end point of the line for message
    const l1 = {
        p1: {
            x: parseFloat(line.getAttributeNS(null, "x1")),
            y: parseFloat(line.getAttributeNS(null, "y1"))
        },
        p2: pc
    };
    // Line object
    const toadd = document.createElementNS("http://www.w3.org/2000/svg", "g");
    toadd.setAttributeNS(null, "class", "message");
    toadd.dataset.fromprocess = fromprocess;
    toadd.dataset.toprocess = toprocess;
    toadd.dataset.fromx = fromx;
    toadd.dataset.tox = tox;
    // Setting up graphics group to represet message
    line.setAttributeNS(null, "class", "");
    // Drawing line connecting two processes
    toadd.appendChild(line);
    // Adding line connecting two timelines to graphics group
    const parallelLine = lineParallel(l1, pc, 15);
    // Getting a smaller parallel line centered at second end point
    const rotateLinePlus = rotateLine(parallelLine, pc, 157.5);
    const rotateLineMinus = rotateLine(parallelLine, pc, -157.5);
    // Mathematical description of lines
    const toadd2 = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    // Generating SVG lines based on mathematical description
    toadd2.setAttributeNS(null, "points",
        pc.x.toString() + ',' + pc.y.toString() + ' ' +
        rotateLinePlus.p2.x.toString() + ',' + rotateLinePlus.p2.y.toString() + ' ' +
        rotateLineMinus.p2.x.toString() + ',' + rotateLineMinus.p2.y.toString()
    );
    toadd2.setAttributeNS(null, "class", "message-arrow");
    toadd.appendChild(toadd2);
    // Appending + angle arrow
    return toadd;
}

// Creation of message ended in a point inside simspace
function finishDragMessageVisual(event) {
    if((!ticking) && messagestate === 1) {
        if(event.target.className === "slider-bone" && !(fromMessage === event.target)) {
            messagestate = 3;
            const relpos = getRelativePosition(event.target, event.currentTarget);
            currentMessage.setAttributeNS(null, "x2", String(relpos.x + event.offsetX) + 'px');
            currentMessage.setAttributeNS(null, "y2", String(relpos.y) + 'px');
            const [toEvent, toEventobj] = createEventVisual(event.target, event.offsetX, true);
            toEvent.classList.add('to');
            // Setting message endpoint for line
            fromEvent.classList.add('from');
            // Setting message startpoint for line
            messagespace.removeChild(currentMessage);
            // Removing temporary line
            currentMessage.addEventListener("click", deleteMessageVisual);
            // Adding event listener for deletion
            messages.push(
                createMessage(
                    fromEventobj,
                    toEventobj
                )
            );
            console.log(messages);
            updateEventTimes();
            // Adding record of message to list of messages
            messagespace.appendChild(
                drawMessage(currentMessage, fromMessage.dataset.process,
                event.target.dataset.process, fromEvent.dataset.myx, toEvent.dataset.myx)
            );
            // Adding graphics group to show
            currentMessage = null;
            fromMessage = null;
            fromEvent = null;
            fromEventobj = null;
            messagestate = 0;
            // Resetting state for next message
        }
        else {
            failedMessageVisual();
        }
    }
}

function createNode() {
    
    const inmin = 1;
    const inmax = 5;
    const indefault = 1;
    
    const toadd = document.createElement("div");
    toadd.className = "slider-container";
    // Creating a container for the node timeline
    
    const node_len = nodes.length;
    // The index of this process

    const toadd2 = document.createElement("input");
    toadd2.type = "number";
    toadd2.className = "increment";
    toadd2.min = inmin.toString();
    toadd2.max = inmax.toString();
    toadd2.value = inmin.toString();
    toadd2.dataset.process = node_len;
    // Text boxes for setting increment in time step at each processor
    // Change CSS values for class increment should the max increase beyond some digits
    
    const toadd3 = document.createElement("div");
    toadd3.className = "slider";
    // Representing timeline of each node
    
    const toadd4 = document.createElement("div");
    toadd4.className = "slider-bone";
    toadd4.dataset.process = node_len;
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
    
    ticks.push(indefault);
    // Adding to array of process ticks
}

function deleteNode() {
    nodes.pop();
    ticks.pop();
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

function windowChange(event) {
    const vw = Math.min(Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 100, 10);
    const curwidth    = parseFloat(simspace.style.width.slice(0, -2));
    if (tellspace.clientWidth > mysteryAdjustment(curwidth, vw, max_events_offset)) {
        simspace.style.width = tellspace.clientWidth.toString() + 'px';
    }
    // Try to take up all available screen width
    simpos = getPosition(simspace);
    // Getting position of simspace for use everywhere
    window.requestAnimationFrame(function() {
        let messageList = Array.from(messagespace.childNodes);
        // Converting list of nodes in messagespace into an array. Array should have graphical groups
        const processBones = new Map();
        for (const child of Array.from(simspace.getElementsByClassName("slider-bone"))) {
            processBones.set(child.dataset.process, getRelativePosition(child, simspace).y);
        }
        while(messagespace.firstChild) {
            messagespace.firstChild.remove();
        }
        // Removing nodes
        for (const child of messageList) {
            if(isElement(child)) {
                const grandchild = [...child.getElementsByTagNameNS("http://www.w3.org/2000/svg", "line")];
                if (grandchild.length === 1) {
                    const fromprocess = child.dataset.fromprocess;
                    const toprocess = child.dataset.toprocess;
                    if (processBones.has(fromprocess) && processBones.has(toprocess)) {
                        grandchild[0].setAttributeNS(null, "y1", processBones.get(fromprocess).toString() + 'px');
                        grandchild[0].setAttributeNS(null, "y2", processBones.get(toprocess).toString() + 'px');
                        messagespace.appendChild(
                            drawMessage(grandchild[0], fromprocess, toprocess, child.dataset.fromx,child.dataset.tox)
                        );
                    }
                }
            }
        }
        // Redrawing messages
        ticking = false;
    });
    ticking = true;
}


window.addEventListener("load", windowChange);
window.addEventListener("resize", windowChange);
// Listening for changing window sizes and loads to update positions and widths of elements

tellspace.addEventListener("scroll", manageTime);
// Calling function for dynamically resizing element with maximum scrolls

simspace.addEventListener("mousedown", createMessageVisual);
simspace.addEventListener("mousemove", dragMessageVisual);
simspace.addEventListener("mouseleave", endDragMessageVisual);
simspace.addEventListener("mouseup", finishDragMessageVisual);
// Listening for events leading to creation of a message

document.getElementById("plus").addEventListener("click", createNode);
document.getElementById("minus").addEventListener("click", deleteNode);
// adding and deleting nodes on click

addMode.addEventListener("click", inputMode);
subMode.addEventListener("click", inputMode);
// Switching between adding and deleting events/messages
updateModes();