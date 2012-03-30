// vim:syntax=lpc
#define client	Protocols.DNS->global_async_client
//#define MVC(MAP, VAL)	#VAL : MAP->VAL

//! @fixme
//! 	Make this module a child of @[MMP.Utils.Net]?

//! Makes an asynchronous DNS SRV request.
//! @param service
//! 	The service (without preceeding underscore), e.g. @expr{"psyc"@}.
//! @param protocol
//! 	The protocol (without preceeding underscore), e.g. @expr{"tcp"@}
//! @param name
//! 	The domainname the SRV record should be requested from, e.g
//! 	@expr{"psyc.eu"@}.
//! @param cb
//! 	Callback to be called with the resulting @[SRVReply]. Signature of
//! 	the callback: @expr{void cb(SRVReply result, mixed ... cba);@}.
//! @param cba
//! 	Additional arguments to the callback.
void async_srv(string service, string protocol, string name, function cb,
	       mixed ... cba) {
    void sort_srv(string query, mapping result) {
	if (result) {
	    SRVReply rpl;
	    mixed err;
	    
	    err = catch {
		rpl = SRVReply(result->an, query);
	    };

	    if (rpl) {
		cb(query, rpl, @cba);
	    } else {
		cb(query, -2, @cba);

		werror("%O\n", err);
	    }
	} else {
	    cb(query, -1, @cba);
	    werror("dns client: no result\n");
	}
    };

    if (!client) client = Protocols.DNS.async_client();

    client->do_query("_" + service +"._"+ protocol + "." + name,
                        Protocols.DNS.C_IN,
                        Protocols.DNS.T_SRV, sort_srv);
}

//! SRV Records are quite complex, especially getting their preferences right,
//! so there is this class to represent them.
class SRVReply {
    array(mapping) result;
    mapping(int:array(mapping)) _tmp;
    string query;
    int _current, _ordered, _sum;

    void create(array(mapping) result, string query) {
	this_program::query = query;

	if (sizeof(result) && `!=(@result->type, Protocols.DNS.T_SRV)) {
	    // TODO:: if this should happen alot, and not all answers
	    // are of the same (wrong) type, change strategy to "fixing"
	    // the answers. probably.
	    // it might also be legal to reply with a CNAME answer, so we
	    // should then go fetch the new .. thing. dunno.
	    error("dns-client: error-prone reply\n");
	}

	this_program::result = result;
    }

    //! @returns
    //!	    1 if there are more entries.
    int(0..1) has_next() {
	return !!sizeof(_tmp || result);
    }

    void _init() {
	_tmp = ([ ]);

	foreach (result;; mapping m) {
	    if (!_tmp[m->priority]) _tmp[m->priority] = ({ });

	    _tmp[m->priority] += ({ m });
	}
    }

    int _order() { // partially ordering.
	int current = min(@indices(_tmp));

	sort(_tmp[current]->weight, _tmp[current]);

	return current;
    }

    //! @returns
    //!	    A mapping with
    //!	    @mapping
    //!		@member string "target"
    //!		    The target hostname.
    //!		@member int "port"
    //!		    The target port.
    //!		@member int "priority"
    //!		    The entries priority.
    //!		@member int "weight"
    //!		    The entries weight.
    //!	    @endmapping
    //! @throws
    //!     If @[next()] is called without an available next entry.
    //!     Check @[has_next()]!
    mapping next() {
	mapping res;

	if (!_tmp) _init();

	if (!_ordered){
	    _current = _order();
	    _ordered = 1;
	    _sum = `+(@[array(int)]_tmp[_current]->weight);
	}

	if (sizeof(_tmp[_current]) == 1) {
	    _ordered = 0;
	    res = _tmp[_current][0];
	    m_delete(_tmp, _current);
	} else if (!(res = _tmp[_current][0])->weight) {
	    _tmp[_current] = _tmp[_current][1..];
	} else {
	    int probability = random(_sum + 1);

	    foreach (_tmp[_current]; int index; mapping m) {
		if (probability <= m->weight) {
		    res = m;
		    _tmp[_current] = _tmp[_current][..index - 1]
				    + _tmp[_current][index + 1..];
		    _sum -= res->weight;
		    break;
		}

		probability -= m->weight;
	    }
	}

	return res;
    }

    string _sprintf(int type) {
	if (type == 'O') {
	    return sprintf("MMP.Utils.DNS.SRVReply(%s)", query);
	} else {
	    return 0;
	}
    }
}

void async_srv_to_all_ip /* ip means "Ips and Ports" here */ (string host, function cb, mixed ... args) {
    void handle_srv(string query, MMP.Utils.DNS.SRVReply|int reply) {
	array(mapping)|int result;
	int amount;
	mapping peers = ([ ]);

	void h2ic /* host2ipcallback */ (string query, string ip, int port) {
	    if (stringp(ip)) {
		if (!peers[ip]) {
		    peers[ip] = (< >);
		}

		peers[ip][port] = 1;
	    }

	    if (!--amount) {
		call_out(cb, 0, peers, @args);
	    }
	};

	result = objectp(reply) ? reply->result : reply;

	if (arrayp(result) && sizeof(result)) {
//	    int count;

	    foreach (result;; mapping answer) {
		string target = answer->target;
		int port = answer->port;

		if (stringp(target) && sizeof(target)) {
		    ++amount;
		    Protocols.DNS.async_host_to_ip(target, h2ic /* host2ipcallback */, port);
		}
	    }
	} else {
	    ++amount;
	    Protocols.DNS.async_host_to_ip(host, h2ic /* host2ipcallback */, 0);
	    // fehler weitergeben, 0 statt array oder so
	}
    };

    MMP.Utils.DNS.async_srv("psyc-server", "tcp", host, handle_srv);
}
