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

const messages = new Map();

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

function createNode() {
    const toadd = document.createElement("div");
    toadd.className = "slider-container";
    // Creating a container for the node timeline
    const toadd2 = document.createElement("input");
    toadd2.type = "number";
    toadd2.className = "increment";
    toadd2.min = "1";
    toadd2.max = "5";
    // Text boxes for setting increment in time step at each processor
    // Change CSS values for class increment should the max increase beyond some digits
    const toadd3 = document.createElement("div");
    toadd3.className = "slider";
    // Representing timeline of each node
    const toadd4 = document.createElement("div");
    toadd4.className = "slider-bone";
    toadd3.appendChild(toadd4);
    toadd.appendChild(toadd2);
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

simspace.style.width = tellspace.clientWidth.toString() + 'px';
tellspace.addEventListener("scroll", manageTime);
document.getElementById("plus").addEventListener("click", createNode);
document.getElementById("minus").addEventListener("click", deleteNode);

