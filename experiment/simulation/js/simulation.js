"use strict";
/*
computeScalar(array of events)
Event = {
    t: location     - continuous
    p: Processor    - discrete
}
Message = {
    e: event        - event object
    p: To Processor - discrete
    d: delay        - continuous
}
*/
/*
inArray is an array of events
inMap is a map of processor-increment values or it can be a scalar value
*/
class Event {
    constructor(time, processor) {
        this.t  = time;
        this.p  = processor;
    }
}
class Message {
    constructor(event, processor, delay) {
        this.e  = event;
        this.p  = processor;
        this.d  = delay;
    }
    get e() {
        if (this.e instanceof Event) {
            return this.e;
        }
        else {
            delete this.e;
            throw new ReferenceError('Cannot find object');
        }
    }
    set e(event) {

    }
}
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
    let sorted_in   = inEvents.concat(inMessages);
    sorted_in.sort(function(a, b) {
        x_t = null;
        y_t = null;
        if (a instanceof Event) {
            x_t = a.t;
        }
        else if (a instanceof Message) {
            x_t = a.e.t + a.d;
        }
        if(b instanceof Event) {
            y_t = a.t;
        }
        else if (b instanceof Message) {
            y_t = b.e.t + b.d;
        }
        if(x_t < y_t) {
            return -1;
        }
        if(x_t > y_t) {
            return 1;
        }
        return 0;
    });
    for (let evnt in sorted_in)
    {
        if (evnt instanceof Event) {
            if (inTicks.has(evnt.p)) {
                let time    = 0;
                if (result.has(evnt.p)) {
                    time    = result.get(evnt.p).at(-1).t;
                }
                else {
                    result.set(evnt.p, new Array());
                }
                time        += inTicks.get(evnt.p);
                result.get(evnt.p).push(new Tag(time, evnt));
            }
        }
        if (evnt instanceof Message) {
            if (inTicks.has(evnt.e.p) && inTicks.has(evnt.p)) {
                let time    = 0;
                let rect    = 0;
                if (result.has(evnt.p)) {
                    time    = result.get(evnt.p).at(-1).t;
                }
                else {
                    result.set(evnt.p, new Array());
                }
                if (result.has(evnt.e.p)) {
                    rect    = result.get(evnt.e.p).at(-1).t;
                }
                time    = Math.max(time, rect);
                time    += inTicks.get(evnt.p);
                result.get(evnt.p).push(new Tag(time, evnt));
            }
        }
    }
    return result;
}
export function createEvent(time, processor) {
    return new Event(time, processor);
}

export function createMessage(event, toprocessor, delay) {
    return new Message(event, toprocessor, delay);
}