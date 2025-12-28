### Introduction

Measuring time is important for practical reasons — timestamps for transactions, backup, and ordering content. It is vital for the design and analysis of the systems themselves. This measurement derives from the *ordering* of events (that of a clock tick) themselves. Logical clocks avoid this intermediate representation by exploiting ordering in an element of a system and between elements in a system. The simplest such clock is scalar logical time.

Scalar Logical Clock was first described by Leslie Lamport in "Time, Clocks and the Ordering of events in a Distributed System", published 1978, and is also known as **Lamport's Clock**.


#### Model of a Distributed System

1. Process - It is a sequence of events. These events are defined based on application. The sequence has total ordering - event _a_ occurs before event _b_ if _a_ comes before _b_ in the sequence. Sending or receiving messages between processes are also events. 
2. Distributed System - A collection of processes as defined before, which only communicate via messages.

#### Happens Before relation

The 'happens before' relation, represented with $\rightarrow$ represents the following three conditions:

1. If an event *a* happens before *b* on the same process, then $a \rightarrow b$
2. If event *a* involves sending a message on one process and event *b* is the receipt of that message by a different process, then $a \rightarrow b$.
3. If $a \rightarrow b$ and $b \rightarrow c$, then $a \rightarrow c$. This relation is transitive.

It is possible for two events *a* and *b* to have both $a \nrightarrow b$ and $b \nrightarrow a$, where $\nrightarrow$ is the logical negative of $\rightarrow$. Such events are said to be *concurrent*.

### Logical Clock

A clock *C* for a process *P* is an incrementing counter assigning each value it takes to an event occurring in that process. This number may bear no relationship with the physical time at the process P. For a system of such clocks, they must satisfy the *clock condition*. If an event *a* happens before event *b*, then the time associated with *a* must be less than that assigned to *b*.  
    Formally,
    $$a \rightarrow b \Rightarrow C(a) < C(b)$$  
    This is called *monotonicity* and satisfies the consistency property of the clock.  
    Non-negative integers are used in logical clocks by convention.

Strong consistency is when the system of clocks satisfy:
    $$a \rightarrow b \Leftrightarrow C(a) < C(b)$$

#### Scalar Logical Clock

A single integer, $C_i$ is maintained by each process to keep track of time for scalar logical clock.

#### Rules for Ordering

1. Local Rule:
    Each process P<sub>i</sub> increments its clock C<sub>i</sub> between any two immediately following events. This increment is done before the first event in a process' timeline of events as well.
    $$ C_i \Leftarrow C_i + d$$

2. Global Rule:
    Each process P<sub>i</sub> sends the timestamp of the event associated with sending a message *m* along with the message itself.
    Each process P<sub>j</sub> receiving a message *m* increments its clock C<sub>j</sub> and sets its time to be greater than the timestamp in message *m*.
    $$C_i \Leftarrow max(C_i, C_{msg})$$
    $$C_i \Leftarrow C_i + d$$

#### Total Ordering

Using the happens before relation can give only a partial ordering of events on the system with this clock. A total order can be established by breaking ties arbitrarily using parameters like process ID.