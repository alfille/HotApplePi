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
} ;

#define THETAS 50
double theta[THETAS+1] ;

gsl_integration_romberg_workspace * GSLW ;

double F( double t, void * params ) {
	struct func_params * p = params ;
	double c = gsl_sf_cos(t) ;
	double f = .5 * (c - p->cosine) / p->sine ;
	return 4 * f * (p->length - f) * sqrt(2 * gsl_pow_2(c) - 1) / p->sine ;
}

double Volume( double theta0, double Lhat ) {
	double result ;
	size_t neval ;

	if ( theta0 == 0. ) {
		return 0 ;
	}

	struct func_params p =
	{ 
		theta0,
		gsl_sf_sin( theta0 ),
		gsl_sf_cos( theta0 ),
		Lhat,
	} ;
	
	if ( Lhat < .5 * (1 - p.cosine) / p.sine ) {
		return 0 ;
	}
	
	gsl_function gf = {
		.function = &F,
		.params = (void *) (&p) 
	} ;
	
	int status = gsl_integration_romberg(
		&gf, // gsl_function*
		0, //a
		theta0, //b
		.00001, //epsabs
		0, // epsrel
		& result,
		& neval,
		GSLW );
	return result ;
}

void makeTheta( void ) {
	for ( int i=0 ; i <= THETAS ; ++i ) {
		theta[i] = M_PI_4 * i / THETAS ;
	}
}

void CSVline( char * title, double * values ) {
	printf("\"%s\",",title );
	for ( int i = 0 ; i < THETAS ; ++i ) {
		printf("%g,",values[i]);
	}
	printf("%g\n",values[THETAS]);
}

void CSVtheta( void ) {
	CSVline( "theta0", theta ) ;
}

void CSVsolve( double length ) {
	double results[THETAS+1] ;
	for ( int i = 0; i <= THETAS ; ++i ) {
		results[i] = Volume( theta[i], length ) ;
	}
	char title[40];
	snprintf(title, 39, "L=%g", length ) ;
	CSVline( title, results ) ;
}

int main(int argc, char ** argv) {
	makeTheta() ;
	GSLW = gsl_integration_romberg_alloc( 20 ) ;
	CSVtheta() ;
	CSVsolve(.01);
	CSVsolve(.02);
	CSVsolve(.05);
	CSVsolve(.1);
	CSVsolve(.2);
	CSVsolve(.5);
	CSVsolve(1);
	CSVsolve(2);
	CSVsolve(5);
	CSVsolve(10);
	CSVsolve(20);
	CSVsolve(50);
	gsl_integration_romberg_free( GSLW ) ;
	return 0 ;
}
