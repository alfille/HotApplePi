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

int qdegree = 0 ; // show degrees rather than radians
enum { eVolume, eWidth, eHeight, eFolded, eUnfolded } eShow = eVolume ;

struct func_params {
	double theta0;
	double sine;
	double cosine;
	double length ;
} ;

int n_theta = 50 ;
double * theta = NULL ;
double * s_vals = NULL ;
double * x_vals = NULL ;
double * x_axis = NULL ; // underlying array

int n_length = 0 ;
double * length = NULL ;

gsl_integration_romberg_workspace * GSLW ;

double Fvolume( double t, void * params ) {
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
		.function = &Fvolume,
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

double Fwidth( double t, void * params ) {
	struct func_params * p = params ;
	double c = gsl_sf_cos(t) ;
	return sqrt(2 * gsl_pow_2(c) - 1) / p->sine ;
}

double Width( double theta0 ) {
	double result ;
	size_t neval ;

	if ( theta0 == 0. ) {
		return 1. ;
	}

	struct func_params p =
	{ 
		theta0,
		gsl_sf_sin( theta0 ),
		gsl_sf_cos( theta0 ),
		0.,
	} ;
	
	gsl_function gf = {
		.function = &Fwidth,
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

void CSVline( char * title, double * values ) {
	printf("\"%s\",",title );
	for ( int i = 0 ; i < n_theta ; ++i ) {
		printf("%g,",values[i]);
	}
	printf("%g\n",values[n_theta]);
}

void CSVtheta( void ) {
	if ( qdegree ) {
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
	if ( qdegree ) {
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
	CSVline("s",s_vals);
}

void CSVx( void ) {
	CSVline("x",x_vals);
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

void CSVwidth( void ) {
	double results[n_theta+1] ;
	for ( int i = 0; i <= n_theta ; ++i ) {
		results[i] = Width( theta[i] ) ;
	}
	CSVline( "Folded width", results ) ;
}

void CSVheight( void ) {
	double results[n_theta+1] ;
	results[0] = 0. ;
	for ( int i = 1; i <= n_theta ; ++i ) {
		results[i] = .5 * (1 - gsl_sf_cos(theta[i])) / gsl_sf_sin(theta[i]) ;
	}
	CSVline( "Max f(s)", results ) ;
}

void CSVunfolded( void ) {
	double results[n_theta+1] ;
	for ( int a = 1 ; a <= 45 ; ++a ) {
		double t0 = M_PI_4 * a / 45 ;
		double norm = 2 * gsl_sf_sin(t0) ;
		for ( int i = 0; i <= n_theta ; ++i ) {
			results[i] = (gsl_sf_cos(asin(norm*s_vals[i])) - gsl_sf_cos(t0)) / norm ;
		}
		char title[40];
		snprintf(title, 39, "theta0=%i", a ) ;
		CSVline( title, results ) ;
	}
}

double Fx( double t, void * params ) {
	return sqrt(fabs(gsl_sf_cos(2*t))) ;
}

double X( double theta0, double theta_start, double theta_finish ) {
	double result ;
	size_t neval ;

	if ( theta0 == 0. ) {
		return 0 ;
	}

	gsl_function gf = {
		.function = &Fx,
		.params = NULL 
	} ;
	
	int status = gsl_integration_romberg(
		&gf, // gsl_function*
		theta_start, //a
		theta_finish, //b
		.00001, //epsabs
		0, // epsrel
		& result,
		& neval,
		GSLW );
	result *= .5/gsl_sf_sin( theta0 ) ; // normallize
//	printf("t0=%g, %g->%g = %g\n",theta0,theta_start,theta_finish,result);
	return result ;
}

void CSVfolded( void ) {
	double results[n_theta+1] ;
    gsl_interp_accel *acc = gsl_interp_accel_alloc ();
    gsl_spline *spline = gsl_spline_alloc (gsl_interp_cspline, n_theta+1);

	for ( int a = 1 ; a <= 45 ; ++a ) {
		double t0 = M_PI_4 * a / 45 ;
		double x[n_theta+1] ;
		double f[n_theta+1] ;
		x[0] = 0. ;
		f[0] = .5 * (1 - gsl_sf_cos(t0)) / gsl_sf_sin(t0) ;
		double dt = t0 / n_theta ;
		for ( int i = 1; i <= n_theta ; ++i ) {
			x[i] = x[i-1] + X(t0,(i-1)*dt, i*dt ) ;
			f[i] = fmax(0.,.5 * (gsl_sf_cos(i*dt) - gsl_sf_cos(t0)) / gsl_sf_sin(t0)) ;
//			printf("%d\t%g\t%g\n",i,x[i],f[i]);
		}
		gsl_spline_init (spline, x, f, n_theta+1);
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

void help() {
    printf("arc -- HOt Apple Pi box with circular arc end-tabs\n");
    printf("\toutput in CSV format (comma-separated-values))\n");
    printf("\tby Paul H Alfille 2024 -- MIT Licence\n");
    printf("\tSee https://github.com/alfille/HotApplePi");
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
    printf("\t-q\t--seq\tshow full sequences (default off)\n"); 
    printf("\t-t\t--timelimit \t stop calculation after specified seconds (default none)\n");
    printf("\t-r\t--range \t increase last preset to this value\n");
    printf("\t-h\t--help\tthis help\n");
    printf("\nSee https://github.com/alfille/reciprocals for full exposition\n\n");
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
    {"timelimit",   required_argument, 0, 't'},       
    {"range"    ,   required_argument, 0, 'r'},       
    {"help"     ,   no_argument,       0, 'h'},
    {0          ,   0          ,       0,   0}
};

void ParseCommandLine( int argc, char * argv[] ) {
    // Parse command line
    int c;
    int option_index ;
    while ( (c = getopt_long( argc, argv, "hdvwmn:fu", long_options, &option_index )) != -1 ) {
        switch (c) {
            case 0:
                break ;
            case 'h':
                help();
                break ;
			case 'd':
				qdegree = 1 ;
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
