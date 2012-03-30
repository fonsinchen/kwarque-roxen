string base;
string type = "_method";

#define OK(x)		(stringp(x) && String.width(x) == 8 && (!base || has_prefix((x), base)))
#define CHECK(x)	do { if (!OK(x)) error("%O is not a submethod of '%s'.\n", (x), base); } while(0);

void create(void|string base) {
    this_program::base = base || "_";
}

int(0..1) can_encode(mixed a) {
    return OK(a);
}

int(0..1) can_decode(Serialization.Atom a) {
	return a->type == type;
}

string decode(Serialization.Atom a) {
	return a->data;
}

Serialization.Atom encode(string s) {
	CHECK(s);
	return Serialization.Atom(type, s);
}

MMP.Utils.StringBuilder render(string method, MMP.Utils.StringBuilder buf) {
    buf->add(sprintf("%s %d %s", type, (sizeof(method)), method));
    return buf;
}

string _sprintf(int type) {
    if (type == 'O') {
		return sprintf("Serialization.Method(%s)", base);
    }

    return 0;
}
