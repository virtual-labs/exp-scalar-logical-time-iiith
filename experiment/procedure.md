## Steps to be followed for simulating and understanding scalar logical clocks

### Experimental Steps

1. Load the simulation page

2. Click on the plus and minus buttons to add and delete processes
    - Each click of the plus button adds a process' timeline.
    - Each click of the minus button removes the most recently added process.

3. After adding a process, the increment in that process' clock can be adjusted
    - A number entry is present on the extreme left.
    - The increment can be adjusted by entering a number between 1 and 5.
    - The clock increment can also be adjusted with the small plus and minus buttons to the side. 

4. Use the Add/Delete buttons to change modes
    - Add button allows you to add events and messages
    - Delete button allows you to delete events and messages

5. Add events
    - Each process is represented by the a straight line representing its timeline.
    - New events can be added by moving the mouse over the line until it is highlighted and clicking once.

6. Move the scrollbar to the left and right
    - Moving the scrollbar to the extreme right gives you additional space on the timeline of all processes.
    - Moving the scrollbar to the extreme left deletes the timeline of processes as long as events do not go out of range.

7. Add messages between processes
    - Processes communicate with each other through messages between them.
    - To add a message, click on the timeline of the process sending the message.
    - Drag while holding the mouse button down to the timeline of the process receiving the message.
    - A message is created when the mouse is lifted.

8. See event times
    - The scalar logical time of an event can be seen by clicking on the event while in add mode.
    - This shows a popup, displaying event ID and time.
    - The causal relations leading up to that event are displayed below in the green box. Scroll if needed to look at all the events in a causal chain.

### Observations

1. Consistency
    - The circumstances leading to an inconsistent state involve a deadlock on sending and receiving messages.

2. Scalar time
    - Working of the scalar logical clock can be learned by adjusting events and messages.

3. Concurrency
    - The circumstances leading to cases where a causal relationship cannot be established between two events.
