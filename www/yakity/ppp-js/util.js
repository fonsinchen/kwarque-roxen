/*
Copyright (C) 2008-2009  Arne Goedeke

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
version 2 as published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/
/**
 * Some helpful utility functions.
 * @namespace
 */
UTIL = new Object();
/**
 * Flexible RegExp-based replace function. Calls a callback for every match and replaced it by the returned string.
 * @param {Object} reg RegExp Object to be used.
 * @param {String} s String to perform the replace on.
 * @param {Function} cb Callback to be called for every match. Parameters to the callback will be the result returned by the call to RegExp.exec and possible extra arguments that were passed to replace.
 * @returns The resulting string.
 */
UTIL.intp = function(i) { return (typeof(i) == "number" && i%1 == 0); };
UTIL.arrayp = function(a) { return (typeof(a) == "object" && a instanceof Array); };
UTIL.stringp = function(s) { return typeof(s) == "string"; };
UTIL.functionp = function(f) { return (typeof(f) == "function" || f instanceof Function); };
UTIL.objectp = function(o) { return typeof(o) == "object"; }
UTIL.replace = function(reg, s, cb) {
	var res;
	var last = 0;
	var ret = "";
	var extra;

	if (arguments.length > 3) {
		extra = new Array();
		for (var i = 3; i < arguments.length; i++) extra[i-3] = arguments[i];
	}

	while (null != (res = reg.exec(s))) {
		ret += s.substr(last, reg.lastIndex - res[0].length - last); 
		ret += (extra ? cb.apply(null, [res].concat(extra)) : cb(res));
		last = reg.lastIndex;
	}

	if (last < s.length) {
		ret += s.substr(last);
	}

	return ret;
};
UTIL.split_replace = function(reg, s, cb) {
	var res;
	var last = 0;
	var ret = new Array();
	var extra;

	if (arguments.length > 3) {
		extra = new Array();
		for (var i = 3; i < arguments.length; i++) extra[i-3] = arguments[i];
	}

	while (null != (res = reg.exec(s))) {
		ret.push(s.substr(last, reg.lastIndex - res[0].length - last));
		ret.push(extra ? cb.apply(null, [res].concat(extra)) : cb(res));
		last = reg.lastIndex;
	}

	if (last < s.length) {
		ret.push(s.substr(last));
	}

	return ret;
};
UTIL.has_prefix = function(s, n) {
	if (s.length < n.length) return false;
	return (n == s.substr(0, n.length));
};
UTIL.has_suffix = function(s, n) {
	if (s.length < n.length) return false;
	return (n == s.substr(s.length-n.length, n.length));
};
UTIL.search_array = function(a, n) {
	for (var i = 0; i < a.length; i++) {
		if (n == a[i]) return i;
	}

	return -1;
};
UTIL.replaceClass = function(o, cl1, cl2) {
	var classes = o.className.length ? o.className.split(' ') : [];
	var i = UTIL.search_array(classes, cl1);
	var j = UTIL.search_array(classes, cl2);

	if (i == -1 && j == -1) {
		if (cl2) classes.push(cl2);
	} else if (i == -1) {
		return;
	} else if (j == -1 && cl2) {
		classes[i] = cl2;
	} else {
		classes.splice(i, 1);
	}
	o.className = classes.join(" ");
};
UTIL.addClass = function(o, cl) {
	var classes = o.className.length ? o.className.split(' ') : [];
	var i = UTIL.search_array(classes, cl);

	if (i == -1) {
		classes.push(cl);
		o.className = classes.join(" ");
	}
};
UTIL.hasClass = function(o, cl) {
	var classes = o.className.split(' ');
	return (-1 != UTIL.search_array(classes, cl));
};
UTIL.removeClass = function(o, cl) {
	UTIL.replaceClass(o, cl);
};
UTIL.url_escape = function(s) {
    	return escape(s).replace(/\+/g, "%2B").replace(/\//g, "%2F");
};
UTIL.make_url = function(url, vars) {
    	var list = [];
	var key;
	if (vars) for (key in vars) if (vars.hasOwnProperty(key)) {
	    list.push(key + "=" + UTIL.url_escape(vars[key]));
	} else return url;

	return url + "?" + list.join("&");
};
UTIL.make_method_keep_this = function(obj, fun) {
    	if (arguments.length > 2) {
	    var list = Array.prototype.slice.call(arguments, 2);
	    return (function() {
		    return fun.apply(obj, [ this ].concat(list).concat(Array.prototype.concat.call(arguments)));
	    });
	}
	return (function() {
		return fun.apply(obj, [ this ].concat(Array.prototype.concat.call(arguments)));
	});
};
UTIL.make_method = function(obj, fun) {
    	if (arguments.length > 2) {
	    var list = Array.prototype.slice.call(arguments, 2);
	    return (function () { 
		    return fun.apply(obj, list.concat(Array.prototype.slice.call(arguments)));
	    });
	}
    	return (function () { 
		return fun.apply(obj, Array.prototype.slice.call(arguments));
	});
};
UTIL.Audio = function (params) {
	if (UTIL.App.has_vorbis && !!params.ogg) {
		this.url = params.ogg;	
	} else if (UTIL.App.has_mp3 && !!params.mp3) {
		this.url = params.mp3;	
	} else if (UTIL.App.has_wav && !!params.wav) {
		this.url = params.wav;
	} 

	if (this.url) {
	    this.play = function() {
		this.audio = new Audio();
		this.audio.preload = !!params.autobuffer;
		this.audio.autoplay = !!params.autoplay;
		this.audio.loop = !!params.loop;
		this.audio.controls = !!params.controls;
		this.audio.src = this.url;
		if (this.div) {
		    if (this.div.firstChild) {
			this.div.replaceChild(this.audio, this.div.firstChild);
		    } else {
			this.div.appendChild(this.audio);
		    }
		}
		this.audio.play();
		
	    };
	    this.stop = function() {
		this.audio.pause();
	    };
	    if (!!params.controls || !!params.hidden) {
		this.div = document.createElement("div");
		this.getDomNode = function () {
		    return this.div;
		};
	    }
	} else {
	    if (!params.wav) throw("You are trying to use UTIL.Audio without html5 and a wav file. This will not work.");

	    if (UTIL.App.is_opera || navigator.appVersion.indexOf("Mac") != -1) {
		this.div = document.createElement("div");
		if (params.hidden) {
		    this.div.style.width = 0;
		    this.div.style.height = 0;
		}
		if (navigator.appVersion.indexOf("Linux") != -1) {
		    this.play = function () {
			this.div.innerHTML = "<embed src=\""+params.wav+"\" type=\"application/x-mplayer2\" autostart=true height=0 width=0 hidden=true>";
		    };
		} else {
		    this.play = function() {
			this.div.innerHTML = "<embed src=\""+params.wav+"\" type=\"audio/wav\" autostart=true height=0 width=0 hidden=true cache=true>";
		    }
		}
		this.getDomNode = function() {
		    return this.div;
		};
	    } else if (UTIL.App.is_ie) { // IE
		this.url = params.wav;
		if (!document.all.sound) {
		    var bgsound = document.createElement("bgsound");
		    bgsound.id = "sound";
		    document.body.appendChild(bgsound);
		}
		this.play = function () { 
		    document.all.sound.src = this.url; 
		}
		this.stop = function () { 
		    document.all.sound.src = null; 
		}
	    } else {
		this.div = document.createElement("div");
		this.div.style.width = 0;
		this.div.style.height = 0;
		this.embed = document.createElement("embed");
		this.embed.type = "audio/wav";
		this.embed.autostart = params.hasOwnProperty("autoplay") ? !!params.autoplay : false;
		this.embed.width = 0;
		this.embed.height = 0;
		this.embed.enablejavascript = true;
		this.embed.cache = params.hasOwnProperty("autobuffer") ? !!params.autobuffer : true;
		this.div.appendChild(this.embed);

		this.getDomNode = function () { return this.div; }

		if (this.embed.Play) {
		    this.play = function () { this.embed.Play(); }
		} else if (this.embed.DoPlay) {
		    this.play = function () { this.embed.DoPlay(); }
		} else throw("embed does not have a play method. Something is wrong.");

		this.stop = function () { this.embed.Stop(); }
	    }
	}
};
UTIL.App = {};
UTIL.App.is_opera = !!window.opera;
UTIL.App.is_ie = !!document.all && !UTIL.is_opera;
// The following are copied from http://www.thespanner.co.uk/2009/01/29/detecting-browsers-javascript-hacks/
UTIL.App.is_firefox = /a/[-1]=='a';
UTIL.App.is_safari = /a/.__proto__=='//';
UTIL.App.is_chrome = /source/.test((/a/.toString+''));
try { 
    UTIL.App.audio = document.createElement('audio');
    UTIL.App.has_audio = !!UTIL.App.audio && !!UTIL.App.audio.canPlayType && !!UTIL.App.audio.play;
    UTIL.App.has_vorbis = UTIL.App.has_audio && UTIL.App.audio.canPlayType("audio/ogg") != "" && UTIL.App.audio.canPlayType("audio/ogg") != "no";
    UTIL.App.has_mp3 = UTIL.App.has_audio && UTIL.App.audio.canPlayType("audio/mpeg") != "" && UTIL.App.audio.canPlayType("audio/mpeg") != "no";
    UTIL.App.has_wav = UTIL.App.has_audio && UTIL.App.audio.canPlayType("audio/wav") != "" && UTIL.App.audio.canPlayType("audio/wav") != "no";
} catch (e) {
    UTIL.App.has_audio = false;
    UTIL.App.has_vorbis = false;
    UTIL.App.has_mp3 = false;
    UTIL.App.has_wav = false;
}
delete UTIL.App.audio;
try {
    UTIL.App.video = document.createElement('video');
    UTIL.App.has_video = !!UTIL.App.video && !!UTIL.App.video.canPlayType && !!UTIL.App.video.play;
    UTIL.App.has_theora = UTIL.App.has_video && UTIL.App.video.canPlayType("video/ogg") != "" && UTIL.App.video.canPlayType("video/ogg") != "no";
} catch (e) {
    UTIL.App.has_video = false;
    UTIL.App.has_theora = false;
}
delete UTIL.App.video;
