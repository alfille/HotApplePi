#include <stdio.h>
#include <math.h>
#include <gsl/gsl_integration.h>

// Compile with
// gcc -Wall -lgsl -lm -o arc arc.c

int main(int argc, char ** argv) {
	gsl_integration_romberg_workspace *w = gsl_integration_romberg_alloc( 20 ) ;
	gsl_integration_romberg_free( w ) ;
	return 0 ;
}
