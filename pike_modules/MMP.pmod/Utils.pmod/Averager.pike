float|int max;

float average;
int n = 0;

int create(float|int max) {
	this_program::max = max;
}

void add(float f) {
	if (n >= 0) {
		if (n > 1) {
			average *= (float)n/(n+1);
			average += f/(n+1);
		} else {
			average = (average+f)/2;
	} else average = f;

	n++;
}

float get() {
	return average;
}

void reset() {
	n = 0;	
}
