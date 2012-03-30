/*
    Copyright (C) 2008 Tobias S. Josefowitz

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.


		    GNU GENERAL PUBLIC LICENSE
		       Version 2, June 1991

 Copyright (C) 1989, 1991 Free Software Foundation, Inc.,
 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.

			    Preamble

  The licenses for most software are designed to take away your
freedom to share and change it.  By contrast, the GNU General Public
License is intended to guarantee your freedom to share and change free
software--to make sure the software is free for all its users.  This
General Public License applies to most of the Free Software
Foundation's software and to any other program whose authors commit to
using it.  (Some other Free Software Foundation software is covered by
the GNU Lesser General Public License instead.)  You can apply it to
your programs, too.

  When we speak of free software, we are referring to freedom, not
price.  Our General Public Licenses are designed to make sure that you
have the freedom to distribute copies of free software (and charge for
this service if you wish), that you receive source code or can get it
if you want it, that you can change the software or use pieces of it
in new free programs; and that you know you can do these things.

  To protect your rights, we need to make restrictions that forbid
anyone to deny you these rights or to ask you to surrender the rights.
These restrictions translate to certain responsibilities for you if you
distribute copies of the software, or if you modify it.

  For example, if you distribute copies of such a program, whether
gratis or for a fee, you must give the recipients all the rights that
you have.  You must make sure that they, too, receive or can get the
source code.  And you must show them these terms so they know their
rights.

  We protect your rights with two steps: (1) copyright the software, and
(2) offer you this license which gives you legal permission to copy,
distribute and/or modify the software.

  Also, for each author's protection and ours, we want to make certain
that everyone understands that there is no warranty for this free
software.  If the software is modified by someone else and passed on, we
want its recipients to know that what they have is not the original, so
that any problems introduced by others will not reflect on the original
authors' reputations.

  Finally, any free program is threatened constantly by software
patents.  We wish to avoid the danger that redistributors of a free
program will individually obtain patent licenses, in effect making the
program proprietary.  To prevent this, we have made it clear that any
patent must be licensed for everyone's free use or not licensed at all.

  The precise terms and conditions for copying, distribution and
modification follow.

		    GNU GENERAL PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. This License applies to any program or other work which contains
a notice placed by the copyright holder saying it may be distributed
under the terms of this General Public License.  The "Program", below,
refers to any such program or work, and a "work based on the Program"
means either the Program or any derivative work under copyright law:
that is to say, a work containing the Program or a portion of it,
either verbatim or with modifications and/or translated into another
language.  (Hereinafter, translation is included without limitation in
the term "modification".)  Each licensee is addressed as "you".

Activities other than copying, distribution and modification are not
covered by this License; they are outside its scope.  The act of
running the Program is not restricted, and the output from the Program
is covered only if its contents constitute a work based on the
Program (independent of having been made by running the Program).
Whether that is true depends on what the Program does.

  1. You may copy and distribute verbatim copies of the Program's
source code as you receive it, in any medium, provided that you
conspicuously and appropriately publish on each copy an appropriate
copyright notice and disclaimer of warranty; keep intact all the
notices that refer to this License and to the absence of any warranty;
and give any other recipients of the Program a copy of this License
along with the Program.
*/

// =======================================================================
// =======================================================================
// __                                          .         
// | \   _   __     ._ _   __  ._  _|_  _  _|_    _  ._  
// |  ) / \ /   | | | | | /__) | \  |  / |  |  | / \ | \ 
// |_/  \_/ \__ |_|_| | | \___ | (_ |_ \_|_ |_ |_\_/ | (_
//
// =======================================================================
// everybody complains when there is none, so now better read it!!
// =======================================================================
//
// this mapping class uses typeof(x) + ";" + x; as hashing method.
// this means that strings, booleans and numbers can safely be used as indices.
// additionally, any other types where this gives sufficient distinction can
// be used totally or at least partially, e.g. arrays: arrays of numbers and
// booleans and strings which do NOT have "," in them or are "true" or "false"
// can be used safely.
//
// an example of indices that do not work well (together):
// var mapping = new Mapping();
// mapping.set([2,3], "hey");
// mapping.get(["2,3"]); // returns "hey" which might not be desired.
//
// you get the picture.
//
// =======================================================================
// =======================================================================

/**
 * Flexible mapping/dictionary class that allows for arbitrary key types.
 * @constructor
 */
function get_random_key(length) {
	var a = new Array();
	// put some logic here to tune length of id and amount of items
	for (var i = 0; i < length; i++) {
		a.push(65 + Math.floor(Math.random() * 24));
	}

	return String.fromCharCode.apply(window, a);
}

function get_unique_key(length, set) {
	var id;
	while (set.hasOwnProperty((id = get_random_key(length)))) { }
	return id;
}

function HigherDMapping() {
	this.n = new Mapping();
	this.i2k = {};
}
HigherDMapping.prototype = {
	set : function(key, value) {
		var m = this.n.get(key);
		var id;

		if (!m) {
			m = {};
			this.n.set(key, m);
		}

		id = get_unique_key(6, m);
		m[id] = value;

		this.i2k[id] = key;

		return id;
	},
	get : function(key) {
		var m = this.n.get(key);

		if (m) {
		    	var ret = [];
			for (var i in m) if (m.hasOwnProperty(i)) {
				ret.push(m[i]);
			}
			return ret;
		} else return [];
	},
	remove : function(id) {
		if (!this.i2k.hasOwnProperty(id)) {
			return;
		}
		var m = this.n.get(this.i2k[id]);

		if (!m) {
			delete this.i2k[id];
			return;
		}

		delete m[id];
	}
};
function Mapping() {
	if (arguments.length & 1) throw("odd number of mapping members.");
	this.n = new Object();
	this.m = new Object();
	this.length = 0;
	for (var i = 0; i < arguments.length; i += 2) {
		this.set(arguments[i], arguments[i+1]);
	}
}
Mapping.prototype = {
	constructor : Mapping,
	id_cache : new Object(), // shared cached for all implementations
	get_new_id : function(o) {
		// TODO: 6 is just not good
		return get_unique_key(6, this.id_cache);
	},
    sfy : function(key) { // sfy ==> stringify
		// better use if (key.__proto__ == String.prototype) { ??
		// also there is somewhere something like isPrototypeOf(proto, instance). what about that?
		// for sure subclasses of String shouldn't be matched here.
		// on the other hand, subclasses of strings are strings. i made up
		// my mind and now think it's the right thing to adhere to that.
		if (typeof(key) == "object") {
			// not sure if we need this
			if (key instanceof String) {
				return "string;" + key;
			}
			// this is used for IE DOM objects only.
			if (key == window) {
				return "dom;window";
			}
			if (key == document) {
				return "dom;document";
			}
			if (key.uniqueID) {
				return "dom;"+key.uniqueID;
			}

			if (key.hasOwnProperty("__id")) {
				return key["__id"];
			}

			var id = "object;"+this.get_new_id();
			key["__id"] = id;
			return id;
		} else {
			return typeof(key) + ";" + key;
		}
    },

	/**
	 * Set an entry.
	 */
    set : function(key, val) {
		var key2 = this.sfy(key);

		if (!this.m.hasOwnProperty(key2)) {
			this.length++;
		}

		this.m[key2] = val;
		this.n[key2] = key;
    },

	/**
	 * Get an entry.
	 */
    get : function(key) {
		return this.m[this.sfy(key)];
    },

    // IE doesn't like this being called "delete", so, beware!
	/**
	 * Remove an entry.
	 */
    remove : function(key) {
		var key2 = this.sfy(key);

		if (this.hasIndex(key)) {
			this.length--;
		}

		delete this.m[key2];
		delete this.n[key2];
    },

	/**
	 * Indices of the mapping.
	 * @returns An array of indices.
	 */
    indices : function() {
		var ret = new Array();
		
		for (var i in this.n) {
			ret.push(this.n[i]);
		}

		return ret;
    },

	/**
	 * Values of the mapping.
	 * @returns An array of values.
	 */
    values : function() {
		var ret = new Array();
		
		for (var i in this.m) {
			ret.push(this.m[i]);
		}

		return ret;
    },

	/**
	 * Loops over all entries in the mapping and calls cb for each pair of (key, value).
	 */
    forEach : function(cb, context) {
		for (var i in this.n) {
			if (context) {
				cb.call(context, this.n[i], this.m[i]);
			} else {
				cb(this.n[i], this.m[i]);
			}
		}
    },

    toString : function() {
		return "Mapping(:" + this.length + ")";
    },

	/**
	 * Returns true if an entry with the given key exists.
	 */
    hasIndex : function(key) {
		return this.m.hasOwnProperty(this.sfy(key));
    },

    reset : function() {
		this.m = new Object();
		this.n = new Object();
		this.length = 0;
    }
};

// =======================================================================
// if your head hurts now, you should've just read the documentation.
// =======================================================================
