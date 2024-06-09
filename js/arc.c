#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <math.h>
#include <gsl/gsl_integration.h>
#include <gsl/gsl_sf_trig.h>
#include <gsl/gsl_spline.h>
#include <getopt.h>

// Compile with
// gcc arc.c -Wall -lgsl -lm -o arc

// Globals
int gDegree = 0 ; // show degrees rather than radians
enum { eVolume, eWidth, eHeight, eFolded, eUnfolded, } eShow = eVolume ; // command line choice
int gScale = 0 ; // use f scaled for max f' = +-1

#define EPSABS .0 // Absolute Error
#define EPSREL .00001      // Relative Error

gsl_integration_romberg_workspace * GSLW ;

// Parameter Structure
// Used for GSL form calls
struct func_params {
	double theta0;
	double sin0;
	double cos0;
	double length ;
} gParams ;

void setParams( double theta0, double Lhat ) {
	gParams.theta0 = theta0 ;
	gParams.sin0 = gsl_sf_sin( theta0 ) ;
	gParams.cos0 = gsl_sf_cos( theta0 ) ;
	gParams.length = Lhat ;
}

// Dependent variable array
// for clarity choose a pointer the the array that explains funtion.
// only one is chosen
int n_theta = 50 ;
double * theta = NULL ;
double * s_vals = NULL ;
double * x_vals = NULL ;
double * x_axis = NULL ; // underlying array

double * makeXaxis( double limit ) {
	x_axis = (double *) malloc( (n_theta+1) * sizeof( double ) ) ; 
	for ( int i=0 ; i <= n_theta ; ++i ) {
		x_axis[i] = limit * i / n_theta ;
	}
	return x_axis ;
}

void freeXaxis( void ) {
	if (x_axis != NULL ) {
		free(x_axis) ;
	}
	x_axis = NULL ;
	theta = NULL ;
	s_vals = NULL ;
	x_vals = NULL ;
}

// Length array
// Only used in Volume calculation
int n_length = 0 ;
double * length = NULL ;

// ----------------------
// Basic Functions for math analysis
double s_theta_( double theta, void * params ) {
	// normalized
	struct func_params * p = params ;
	return .5 * gsl_sf_sin(theta) / p->sin0 ;
} 

double f_theta_( double theta, void * params ) {
	// normalized
	struct func_params * p = params ;
	if (gScale) {
		return .5 * p->cos0 * (gsl_sf_cos(theta) - p->cos0) / gsl_pow_2(p->sin0) ;
	} else {
		return .5 * (gsl_sf_cos(theta) - p->cos0) / p->sin0 ;
	}
}

double dx_theta_( double theta, void * params ) {
	// normalized
	struct func_params * p = params ;
	if (gScale) {
		return .5 * sqrt(fabs( gsl_pow_2(gsl_sf_cos(theta)) - gsl_pow_2(p->cos0) )) / gsl_pow_2( p->sin0 ) ;
	} else {
		return .5 * sqrt(fabs( gsl_sf_cos(2. * theta) )) / p->sin0 ;
	}
}

double volume_theta_( double theta, void * params ) {
	// normalized
	struct func_params * p = params ;
	double f = f_theta_( theta, params ) ;
	return 8 * f * (p->length - f) * dx_theta_( theta, params ) ;
}

// Base CSV output
// "text" first value, then n_theta+1 floating point numbers
// comma separated, newline at end
void CSVline( char * title, double * values ) {
	printf("\"%s\",",title );
	for ( int i = 0 ; i < n_theta ; ++i ) {
		printf("%g,",values[i]);
	}
	printf("%g\n",values[n_theta]);
}

// Display various X axis values
void CSVtheta( void ) {
	if ( gDegree ) {
		double angles[n_theta+1] ;
		for ( int i=0 ; i <= n_theta ; ++i ) {
			angles[i] = 45. * i / n_theta ;
		}
		CSVline( "theta", angles ) ;
	} else {
		CSVline( "theta", theta ) ;
	}
}

void CSVtheta0( void ) {
	if ( gDegree ) {
		double angles[n_theta+1] ;
		for ( int i=0 ; i <= n_theta ; ++i ) {
			angles[i] = 45. * i / n_theta ;
		}
		CSVline( "theta0", angles ) ;
	} else {
		CSVline( "theta0", theta ) ;
	}
}

void CSVs( void ) {
	// unfolded linear position
	CSVline("s",s_vals);
}

void CSVx( void ) {
	// folded linear position
	CSVline("x",x_vals);
}

//-----------
// Volume
double Volume( double theta0, double Lhat ) {
	// calculate volume using integration of f*(L-f)*dx
	double result ;
	size_t neval ;

	if ( theta0 == 0. ) {
		return 0 ;
	}

	setParams( theta0, Lhat ) ;
	if ( Lhat < f_theta_( 0., (void *) (&gParams) ) ) {
		return 0 ;
	}
	
	gsl_function gf = {
		.function = &volume_theta_,
		.params = (void *) (&gParams) 
	} ;
	
	int status = gsl_integration_romberg(
		&gf, // gsl_function*
		0, //a
		theta0, //b
		EPSABS, EPSREL,
		& result,
		& neval,
		GSLW );
	if ( status != 0 ) {
		printf("[%d] Integration status = %d\n",__LINE__,status ) ;
	}
	return result ;
}

void CSVvolume( double length ) {
	double results[n_theta+1] ;
	for ( int i = 0; i <= n_theta ; ++i ) {
		results[i] = Volume( theta[i], length ) ;
	}
	char title[40];
	snprintf(title, 39, "L=%g", length ) ;
	CSVline( title, results ) ;
}

// -----------
// Width (folded)
double X( double theta0, double theta_start, double theta_finish ) {
	// calculate (interval) folded length by integrating dx
	double result ;
	size_t neval ;

	if ( theta0 == 0. ) {
		return 0 ;
	}

	// setParams( theta0, 0 ) ; // set prior

	gsl_function gf = {
		.function = &dx_theta_,
		.params = (void *) (&gParams), 
	} ;
	
	int status = gsl_integration_romberg(
		&gf, // gsl_function*
		theta_start, //a
		theta_finish, //b
		EPSABS, EPSREL,
		& result,
		& neval,
		GSLW );
	if ( status != 0 ) {
		printf("[%d] Integration status = %d\n",__LINE__,status ) ;
	}
	return result ;
}

double Width( double theta0 ) {
	double result ;
	size_t neval ;

	if ( theta0 == 0. ) {
		return 1. ;
	}

	setParams( theta0, 0 ) ;

	gsl_function gf = {
		.function = &dx_theta_,
		.params = (void *) (&gParams) 
	} ;
	
	int status = gsl_integration_romberg(
		&gf, // gsl_function*
		0, //a
		theta0, //b
		EPSABS, EPSREL,
		& result,
		& neval,
		GSLW );
	if ( status != 0 ) {
		printf("[%d] Integration status = %d\n",__LINE__,status ) ;
	}
	return 2*result ; // since we only look at positive side
}

void CSVwidth( void ) {
	double results[n_theta+1] ;
	for ( int i = 0; i <= n_theta ; ++i ) {
		results[i] = Width( theta[i] ) ;
	}
	CSVline( "Folded width", results ) ;
}

// -----------
// Height (max f = f(0))
void CSVheight( void ) {
	double results[n_theta+1] ;
	if ( gScale ) {
		results[0] = 0.25 ; // L'Hospital's Rule
	} else {
		results[0] = 0. ;
	}
	for ( int i = 1; i <= n_theta ; ++i ) {
		setParams( theta[i], 0 ) ;
		results[i] = f_theta_( 0, (void *) (&gParams) ) ;
	}
	CSVline( "Max f(s)", results ) ;
}

// ------------
// Unfolded profile
void CSVunfolded( void ) {
	// unfolded = flat
	double results[n_theta+1] ;
    gsl_interp_accel *acc = gsl_interp_accel_alloc ();
    gsl_spline *spline = gsl_spline_alloc (gsl_interp_cspline, n_theta+1);

	for ( int a = 1 ; a <= 45 ; ++a ) {

		// calculate (s(theta),f(theta)) pairs
		double theta0 = M_PI_4 * a / 45 ;
		double s[n_theta+1] ;
		double f[n_theta+1] ;
		setParams( theta0, 0 );
		for ( int i = 0; i <= n_theta ; ++i ) {
			double theta = i * theta0 / n_theta ;
			s[i] = s_theta_( theta, (void *) (&gParams) ) ;
			f[i] = f_theta_( theta, (void *) (&gParams) );
		}

		// use spline interpolation to get (s,f(s)) results
		gsl_spline_init (spline, s, f, n_theta+1);
		for ( int i = 0; i <= n_theta ; ++i ) {
			if ( s_vals[i] < s[n_theta] ) {
				results[i] = gsl_spline_eval( spline, s_vals[i], acc ) ;
			} else {
				// width shorter
				results[i] = 0 ;
			}
		}
		char title[40];
		snprintf(title, 39, "theta0=%i", a ) ;
		CSVline( title, results ) ;
	}
	gsl_spline_free (spline);
    gsl_interp_accel_free (acc);
}

// ------------
// Folded profile
void CSVfolded( void ) {
	double results[n_theta+1] ;
    gsl_interp_accel *acc = gsl_interp_accel_alloc ();
    gsl_spline *spline = gsl_spline_alloc (gsl_interp_cspline, n_theta+1);

	for ( int a = 1 ; a <= 45 ; ++a ) {
		// calculate (x(theta),f(theta)) pairs
		double theta0 = M_PI_4 * a / 45 ;
		double x[n_theta+1] ;
		double f[n_theta+1] ;
		setParams( theta0, 0 );
		x[0] = 0. ;
		f[0] = f_theta_( 0., (void *) (&gParams) ) ;
		double dt = theta0 / n_theta ;
		for ( int i = 1; i <= n_theta ; ++i ) {
			x[i] = x[i-1] + X(theta0,(i-1)*dt, i*dt ) ;
			f[i] = fmax(0.,f_theta_( (i*dt), (void *) (&gParams) ));
		}
		gsl_spline_init (spline, x, f, n_theta+1);
		// use spline interpolation to get (x,f(x)) results
		for ( int i = 0; i <= n_theta ; ++i ) {
			if ( x_vals[i] < x[n_theta] ) {
				results[i] = gsl_spline_eval( spline, x_vals[i], acc ) ;
			} else {
				// folded width shorter
				results[i] = 0 ;
			}
		}
		char title[40];
		snprintf(title, 39, "theta0=%i", a ) ;
		CSVline( title, results ) ;
	}
	gsl_spline_free (spline);
    gsl_interp_accel_free (acc);
}

// Command line poarsing
void help() {
    printf("arc -- Hot Apple Pi box with circular arc end-tabs\n");
    printf("\toutput in CSV format (comma-separated-values))\n");
    printf("\tby Paul H Alfille 2024 -- MIT Licence\n");
    printf("\tSee https://alfille.github.io/HotApplePi/arc_program.html");
    printf("\n");
    printf("arc [options] [L1, L2, ...]\n");
    printf("\twhere L1 L2 are normalized box length\n");
    printf("\n");
    printf("Options\n");
    printf("\t-d\t--degrees\tShow angles in degrees (radians default)\n");
    printf("\t-v\t--volume\tShow folded Volume (default)\n");
    printf("\t-w\t--width\tShow folded Width\n");
    printf("\t-m\t--max\tShow folded Maximum height\n");
    printf("\t-f\t--folded\tShow folded profile\n");
    printf("\t-u\t--unfolded\tShow unfolded profile\n");
    printf("\t-n%d\t--number\tnumber of angles (default %d)\n",n_theta,n_theta);
    printf("\t-s\t--scaled\tVertical scaling to maximum slope (default no)\n");
    printf("\t-h\t--help\tthis help\n");
    printf("\nSee https://github.com/alfille/HotApplePi for full project\n\n");
    exit(1);
}

struct option long_options[] =
{
    {"degrees"  ,   no_argument,       0, 'd'},
    {"number"   ,   required_argument, 0, 'n'},
    {"volume"   ,   no_argument,       0, 'v'},
    {"width"    ,   no_argument,       0, 'w'},
    {"max"      ,   no_argument,       0, 'm'},
    {"folded"   ,   no_argument,       0, 'f'},
    {"unfolded" ,   no_argument,       0, 'u'},
    {"scaled"   ,   no_argument,       0, 's'},
    {"help"     ,   no_argument,       0, 'h'},
    {0          ,   0          ,       0,   0}
};

void ParseCommandLine( int argc, char * argv[] ) {
    // Parse command line
    int c;
    int option_index ;
    while ( (c = getopt_long( argc, argv, "hdvwmn:fus", long_options, &option_index )) != -1 ) {
        switch (c) {
            case 0:
                break ;
            case 'h':
                help();
                break ;
			case 'd':
				gDegree = 1 ;
				break ;
			case 'v':
				eShow = eVolume ;
				break ;
			case 'w':
				eShow = eWidth ;
				break ;
			case 'm':
				eShow = eHeight ;
				break ;
			case 'f':
				eShow = eFolded ;
				break ;
			case 'u':
				eShow = eUnfolded ;
				break ;
            case 'n':
                n_theta = atoi(optarg);
                break ;
            case 's':
                gScale = 1;
                break ;
            default:
                help() ;
                break ;
            }
    }
    
	// angular resolution
    if ( n_theta < 1 ) {
		n_theta = 50 ;
	}
	if ( n_theta > 1000 ) {
		n_theta = 1000 ;
	}
   
   // lengths
   n_length = argc - optind ;
   if ( n_length <= 0 ) {
	   // use defaults
	   n_length = 12 ;
	   length = (double *) malloc( n_length * sizeof( double ) ) ;
	   length[0] = .01 ;
	   length[1] = .02 ;
	   length[2] = .05 ;
	   length[3] = .1 ;
	   length[4] = .2 ;
	   length[5] = .5 ;
	   length[6] = 1. ;
	   length[7] = 2. ;
	   length[8] = 5. ;
	   length[9] = 10. ;
	   length[10] = 20. ;
	   length[11] = 50. ;
   } else {
	   // specified
		length = (double *) malloc( n_length * sizeof( double ) ) ;
		for ( int i = 0 ; i<n_length ; ++i ) {
			errno = 0 ;
			length[i] = strtod( argv[optind+i], NULL ) ;
			if ( errno != 0 ) {
				length[i] = 0. ;
			}
		}
	} 
}

int main(int argc, char ** argv) {
	ParseCommandLine( argc, argv ) ;

	switch( eShow ) {
		// CSV display choices
		case eVolume:
			theta = makeXaxis(M_PI_4) ;
			CSVtheta0() ;
			GSLW = gsl_integration_romberg_alloc( 20 ) ;
			for ( int i = 0 ; i < n_length ; ++i ) {
				CSVvolume( length[i] ) ;
			}
			gsl_integration_romberg_free( GSLW ) ;
			break ;
			
		case eHeight:
			theta = makeXaxis(M_PI_4) ;
			CSVtheta0() ;
			CSVheight() ;
			break ;
			
		case eUnfolded:
			s_vals = makeXaxis(.5) ;
			CSVs() ;
			CSVunfolded() ;
			break ;
			
		case eWidth:
			theta = makeXaxis(M_PI_4) ;
			CSVtheta0() ;
			GSLW = gsl_integration_romberg_alloc( 20 ) ;
			CSVwidth() ;
			gsl_integration_romberg_free( GSLW ) ;
			break ;
			
		case eFolded:
			x_vals = makeXaxis(.5) ;
			CSVx() ;
			GSLW = gsl_integration_romberg_alloc( 20 ) ;
			CSVfolded() ;
			gsl_integration_romberg_free( GSLW ) ;
			break ;
	}
	
	// Clean up
	freeXaxis() ;
	if ( length != NULL ) {
		free(length) ;
		length=NULL ;
	}

	return 0 ;
}
