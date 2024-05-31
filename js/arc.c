#include <stdio.h>
#include <math.h>
#include <gsl/gsl_integration.h>
#include <gsl/gsl_sf_trig.h>

// Compile with
// gcc -Wall -lgsl -lm -o arc arc.c

struct func_params {
	double theta0;
	double sine;
	double cosine;
	double length ;
} fparam ;

	


double Volume( double theta0, double Lhat, gsl_integration_romberg_workspace * w ) {
	double result ;
	size_t neval ;

	fparam.theta0 = theta0 ;
	fparam.sine = gsl_sf_sin( theta0 ) ;
	fparam.cosine = gsl_sf_cos( theta0 ) ;
	fparam.length = Lhat ;
	
	int status = gsl_integration_romberg(
		, // gsl_function*
		0, //a
		theta0, //b
		.00001, //epsabs
		0, // epsrel
		& result,
		& neval,
		w );
}

int main(int argc, char ** argv) {
	gsl_integration_romberg_workspace *w = gsl_integration_romberg_alloc( 20 ) ;
	gsl_integration_romberg_free( w ) ;
	return 0 ;
}
