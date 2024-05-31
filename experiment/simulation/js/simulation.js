"use strict";
/*
computeScalar(array of events)
Event = {
    t: location     - continuous
    p: Processor    - discrete
}
Message = {
    e: event        - from event object
    e: event        - to event object
}
*/
/*
inArray is an array of events
inMap is a map of processor-increment values or it can be a scalar value
*/
// Represents events
class Event {
    constructor(time, processor) {
        this.t  = time;
        this.p  = processor;
    }
}

// Represents Messages
class Message {
    constructor(event1, event2) {
        this.e1 = event1;
        this.e2 = event2;
    }
    get e1() {
        if (this.e1 instanceof Event) {
            return this.e1;
        }
        else {
            delete this.e1;
            throw new ReferenceError('Cannot find object');
        }
    }
    set e1(event) {

    }
    get e2() {
        if (this.e2 instanceof Event) {
            return this.e2;
        }
        else {
            delete this.e2;
            throw new ReferenceError('Cannot find object');
        }
    }
    set e2 (event) {

    }
}

// Convenience object for having time, event | message 
class Tag {
    constructor(time, aobj) {
        this.t  = time;
        this.o  = aobj;
    }
}

export function computeScalar(inEvents, inMessages, inTicks) {
    let result      = new Map();
    /*  
    Result is a map of arrays, one for each processor
    Arrays store events relating to the processor
    Mesages are stored in the array of the procesor it is sent to.
    */
    
    return result;
}
export function createEvent(time, processor) {
    return new Event(time, processor);
}

export function createMessage(event1, event2) {
    return new Message(event1, event2);
}