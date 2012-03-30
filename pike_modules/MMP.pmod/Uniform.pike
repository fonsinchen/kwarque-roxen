//! Implementation of Uniform (similar to UNLs) as described in
//! @[http://about.psyc.eu/Uniform].
//! 
//! @note
//!	Parsing of the Uniform is done automatically when variables
//!	are being accessed for the first time using @[`->()].

//! The Uniforms scheme. Could be @expr{"psyc"@} or @expr{"xmpp"@}.
string scheme;

//! The domain name or ip adress of the Uniform.
string host;

//! The (optional) port. Will be 0 if none is given which will
//! then be used as 4404, the standard PSYC port.
int port;

string transport;

//! The user (if preceding host, delimeted by @@, e.g.
//! @expr{protocol://user@@host@}).
string user;

//! The resource, excluding the first @expr{/@}.
//! @example
//!	    MMP.Uniform("http://ppp.psyc.eu/foo#babar")->resource; // is "foo#babar"
string resource;

//! The full unl.
string unl;

//! The channel. See @[http://about.psyc.eu/Channels].
//! @example
//!	    MMP.Uniform("http://ppp.psyc.eu/foo#babar")->channel; // is "babar"
//!	    MMP.Uniform("http://ppp.psyc.eu/foo")->channel; // is UNDEFINED
string channel;

//! The address of the entity a given channel resides on. Is @expr{UNDEFINED@} if the Uniform
//! is not a channel.
//! @example
//!	    MMP.Uniform("http://ppp.psyc.eu/foo#babar")->super; // is MMP.Uniform("http://ppp.psyc.eu/foo")
this_program super;

//! The Uniform of the root entity.
//! @example
//!	    MMP.Uniform("http://ppp.psyc.eu/foo#babar")->root; // is MMP.Uniform("http://ppp.psyc.eu/")
//! @note
//!	    The root Uniform is not automatically set. In case you are using 
//!	    @[PSYC.Server] this is taken care of.
this_program root;

//! The object associated with this Uniform. As @expr{root@} this variable is not set by default but
//! may be used to store such information. In contrast to @expr{root@} it must not be exprected to
//! contain the object when using @[PSYC.Server].
array handler = ({ 0 });
//array handler = set_weak_flag(({ 0 }), Pike.WEAK_VALUES);

string slashes;
string query;
string body;
string userAtHost;
string pass;
string hostPort;
string circuit;
string obj;
int parsed, islocal = UNDEFINED, reconnectable = 1;

//! @param unl
//!	    The string representation of the Uniform.
//! @param o
//!	    The object to be associated with @expr{u@}. Will be stored in
//!	    the variable @expr{handler@}.
void create(string unl, object|void o) {
this_program::unl = unl;
if (o) {
	handler[0] = o;
}
}

int is_local() {
if (zero_type(islocal)) {
	// -> to trigger parsing
	if (this->super) { 
	islocal = this->super->is_local();
	} 

	if (!zero_type(islocal)) return islocal;

	if (this->root && this != root) {
	islocal = root->is_local();
	}

	return islocal;
}

return islocal;
}

mixed cast(string type) {
if (type == "string") return unl;
}

string to_json() {
return "'" + unl + "'";
}

string _sprintf(int type) {
if (type == 's') {
	return sprintf("MMP.Uniform(%s)", unl);
} else if (type = 'O') {
	return sprintf("MMP.Uniform(%s, %s)", unl, is_local() ? "local" : "remote");
}

return UNDEFINED;
}

mixed `->=(string key, mixed value) {
if (key == "handler") {
	return handler[0] = value;
}

return ::`->=(key, value);
}

mixed `->(string dings) {
if (dings == "handler") {
	return handler[0];
}

if (!parsed) {
	switch (dings) {
	case "scheme":
	case "transport":
	case "host":
	case "user":
	case "resource":
	case "slashes":
	case "query":
	case "body":
	case "userAtHost":
	case "pass":
	case "hostPort":
	case "circuit":
	case "root":
	case "super":
	case "port":
	case "channel":
	case "islocal":
	case "obj":
	case "reconnectable":
		parse();
	}
}

return ::`->(dings);
}

void parse() {
	string s, t = unl;
	if (!sscanf(t, "%s:%s", scheme, t)) error(sprintf("this (%s) is not uniforminess", unl));
	slashes = "";
	switch(scheme) {
	case "sip":
		sscanf(t, "%s;%s", t, query);
		break;
	case "xmpp":
	case "mailto":
		sscanf(t, "%s?%s", t, query);
	case "telnet":
		break;
	default:
		if (t[0..1] == "//") {
			t = t[2..];
			slashes = "//";
		}
	}
	body = t;
	sscanf(t, "%s/%s", t, resource);

	if (!resource || 2 != sscanf(resource, "%s#%s", obj, channel)) {
		obj = resource;
		channel = UNDEFINED;
		super = UNDEFINED;
	}

	userAtHost = t;
	if (sscanf(t, "%s@%s", s, t)) {
		if (!sscanf(s, "%s:%s", user, pass))
			user = s;
	}
	hostPort = t;
	//if (complete) circuit = scheme+":"+hostPort;
	//root = scheme+":"+slashes+hostPort;
	if (sscanf(t, "%s:%s", t, s)) {
		if (sizeof(s) && s[0] == '-') {
			s = s[1..];
			reconnectable = 0;
		}
		if (!sscanf(s, "%d%s", port, transport))
			transport = s;
	}

	host = t;

	parsed = 1;
}
