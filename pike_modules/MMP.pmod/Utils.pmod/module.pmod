//! This module is home to several small utils that are used by MMP and PSYC.

//! A classical fifo-queue. Uses a linked list internally.
//! @note
//! 	@expr{({ })@}-"queues" have showed to be faster (at least on linux-2.4.*,
//!	athlon). Yet, we stick to this module since it has clear operations
//!	and can easily be shared without the need for wrapping.
class Queue {
    array|int head, tail;
    int size = 0;

    constant DATA = 0;
    constant NEXT = 1;

#if 0
    void create(array|void source) {
	if (source) {
	    foreach (source;; mixed data) {
		push(data);
	    }
	}
    }
#endif

    //! @returns
    //!	    The number of entries in the @[Queue].
    int _sizeof() {
	return size;
    }

    int isEmpty() {
	return is_empty();
    }

    //! @returns
    //!	    True when there are no more entries in the Queue.
    int is_empty() {
	return !head;
    }

    //! Pushes an element to the @[Queue].
    void push(mixed data) {
        if (isEmpty()) {
            head = tail = allocate(2);
            head[DATA] = data;
        } else {
            tail = tail[NEXT] = allocate(2);
            tail[DATA] = data;
        }

	size++;
    }

    //! Shifts an argument from the @[Queue].
    //! @returns
    //!	    The element longest in the @[Queue], or @expr{UNDEFINED@}.
    mixed shift() {
        mixed data;

        if (isEmpty()) return UNDEFINED;

        data = head[DATA];
        head = head[NEXT];
	size--;

        if (isEmpty()) tail = 0;


        return data;
    }

    //! Peeks into the queue, like @[shift()], but doesn't delete the
    //! 'shifted' element.
    //! @returns
    //!	    The element longest in the @[Queue], or @expr{UNDEFINED@}.
    mixed shift_() {
	if (isEmpty()) return UNDEFINED;

	return head[DATA];
    }

    //! Unshifts an element, i.e. like @[push()], but at the other end of the
    //! @[Queue]. Therefore @expr{(q->unshift(x), q->shift() == x)@} will always
    //! be true.
    void unshift(mixed data) {
        if (isEmpty()) {
            push(data);
        } else {
            array newhead = allocate(2); // uncool, but allows changing of
                                         // DATA and NEXT... as if anybody
                                         // would need that .)

            newhead[DATA] = data;
            newhead[NEXT] = head;
            head = newhead;

	    size++;
        }
    }

    string _sprintf(int t) {
	if (t == 'O') {
	    return sprintf("MMP.Utils.Queue: %O", (array)this);
	}

	return UNDEFINED;
    }

    //! Cast operator.
    //! @param type
    //!	    @string
    //!		@value "array"
    //!		    Will return an array containing the @[Queue]'s elements,
    //!		    in order.
    //!	    @endstring
    mixed cast(string type) {
	if (type == "array") {
	    array out = allocate(sizeof(this));
	    array|int tmp = head;

	    for (int i; tmp; i++) {
		out[i] = tmp[DATA];
		tmp = tmp[NEXT];
	    }

	    return out;
	}

	return UNDEFINED;
    }
}

.Queue invoke_queue;

void late_invoker() {
    function f;
    array args;

    [f, args] = invoke_queue->shift();
    f(@args);
}

//! Calls @expr{f@} as soon as possible from the backend thread.
//! @note
//! 	This basically does the same as @expr{call_out(f, 0, ...)@}, but
//! 	@[call_out()] does not keep the order of scheduled events (well, the
//! 	@expr{delay@} argument to @[call_out()] may of course induce some
//! 	order).
void invoke_later(function|object|program f, mixed ... args) {
    if (!invoke_queue) invoke_queue = .Queue();

    if (!callablep(f)) {
	throw(({ "First argument to invoke_later has to be callable.\n", backtrace() }));
    }

    invoke_queue->push(({ f, args }));
    call_out(late_invoker, 0);
}
