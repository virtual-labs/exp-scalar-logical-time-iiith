"use strict";

import { computeScalar, createEvent, createMessage } from "./simulation.js";
import { isElement } from "./helper.js";

const tellspace = document.getElementById("tellspace");
// Area of work

const simspace = document.getElementById("simspace");
// Used to store containers

const nodes = [];
// An array of all nodes in the distributed system

const events = new Map();
// Mapping each node to an event

const messages = new Map();
// Mapping each node to a message

let addEventsMessage = true;
// Used with buttons in eventadd div to see whether events and messages should be added or deleted

let ticking = false;
// Used to throttle events

function manageTime(event) {
    if (!ticking) {
        const scrollwidth = tellspace.scrollWidth;
        const clientwidth = tellspace.clientWidth;
        const curwidth    = parseFloat(simspace.style.width.slice(0, -2));
        window.requestAnimationFrame(function() {
            if(scrollwidth > clientwidth) {
                if(scrollwidth - clientwidth <= tellspace.scrollLeft) {
                    tellspace.scrollTo(scrollwidth - clientwidth - 4, 0);
                    simspace.style.width = String(curwidth + 5) + 'px';
                }
                else if (tellspace.scrollLeft <= 0 && curwidth - 5 >= clientwidth) {
                    tellspace.scrollTo(scrollwidth - clientwidth + 4, 0);
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
document.getElementById("plus").addEventListener("click", createNode);
document.getElementById("minus").addEventListener("click", deleteNode);
addMode.addEventListener("click", inputMode);
subMode.addEventListener("click", inputMode);
updateModes();