
var METEORURL="/meteor/";
var client; 
var chat;
var profiles;

function onconnect(success, uh) {
	client.onconnect = null;
	if (!success) {
		/* give an error message*/
		return;
	}
	
	var ulink = function (uniform) {
		if (uniform == client.uniform) return profiles.getDisplayNode(uniform);
		var a = document.createElement("a");
		//a.href = "javascript:void(null)";
		a.title = "Open private chat with "+uniform.name;
		a.appendChild(profiles.getDisplayNode(uniform));
		a.onclick = function() {
			var win = chat.getWindow(uniform);
			chat.active = win;
			chat.accordion.display(win.pos);
		};

		return a;
	};

	var timestamp = (function(type, key, value, p) {
		var div = document.createElement("div");
		div.appendChild(document.createTextNode(value.render("_hours") + ":" + value.render("_minutes") + ":" + value.render("_seconds")));
		return div;
	});
	var userlink = (function(type, key, value, p) {
		if (type) return value.render(type);
		var span = document.createElement("span");
		if (value.is_room()) {
		    span.appendChild(profiles.getDisplayNode(value));
		} else {
		    span.appendChild(ulink(value));
		}
		return span;
	});
	var templates = new mmp.Vars({
		_notice_enter : "[_supplicant] enters [_source].",
		_notice_leave : "[_supplicant] leaves [_source].",
		_message_public : "[_timestamp] [_source_relay] [data]",
		_message_private : "[_timestamp] [_source_relay] [data]",
		_echo_message_public : "[_timestamp] [_source_relay] [data]",
		_echo_message_private : "[_timestamp] [_source_relay] [data]",
		_source : userlink,
		_supplicant : userlink,
		_timestamp : timestamp
	});
	profiles = new Yakity.ProfileData(client);

	var CustomChat = new Class({
		Extends : AccChat,
		createWindow : function(uniform) {
			var win = this.parent(uniform);
			if (uniform.is_room()) {
				win.renderMember = function(uniform) {
					return ulink(uniform);
				}
			}
			win.parent_RenderMessage = win.renderMessage;
			win.renderMessage = function(p) {
				var div = win.parent_RenderMessage(p);

				if (div && p.v("_source_relay") == client.uniform) {
					UTIL.addClass(div, "self");
				}
				return div;
			};
			win._notice_presence_typing = function(p) {
				UTIL.replaceClass(this.header, "idle", "typing");
				UTIL.replaceClass(this.container, "idle", "typing");
				return psyc.STOP;
			};
			win._notice_presence_idle = function(p) {
				UTIL.replaceClass(this.container, "typing", "idle");
				UTIL.replaceClass(this.header, "typing", "idle");
				return psyc.STOP;
			};
			win._notice_logout = function(p) {
				UTIL.replaceClass(this.container, "idle", "offline");
				UTIL.replaceClass(this.header, "idle", "offline");
				UTIL.replaceClass(this.container, "typing", "offline");
				UTIL.replaceClass(this.header, "typing", "offline");
			};
			win._notice_login = function(p) {
				UTIL.replaceClass(this.container, "offline", "idle");
				UTIL.replaceClass(this.header, "offline", "idle");
			};
			return win;
		}
	});
	chat = new CustomChat(client, templates, "YakityChat", document.chat_input.text);
	chat.idle = new Yakity.Presence.Typing(client, chat);
	chat.enterRoom(mmp.get_uniform("psyc://nowhere/@default"), true);
}

function initchat() {
	if (client) return false;

	client = new Yakity.Client(METEORURL, "jane doe" + Math.floor((Math.random()*1000)+1));
	client.onconnect = onconnect;


	window.onunload = function() {
		if (client) {
			client.logout();
			client.abort();
			client = null;
		}
	};

	return false;
};

function new_input() {
	var str = document.chat_input.text.value;
	if (str.length == 0) return false;

	try {
		if (this.chat.active) {
			var target = this.chat.active.name;
			this.client.sendmsg(target, target.is_person() ? "_message_private" : "_message_public", str);
			document.chat_input.text.value = "";
		} else {
			//error_fun("You cannot chat to the DEBUG!");
		}
	} catch (err) {
		meteor.debug("send failed: ".err.toString());
	}
	return false;
};

