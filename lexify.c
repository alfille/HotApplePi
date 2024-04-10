#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#define MAX 120000
char buff[MAX] ;

void removelast( char * s ) {
	s[strlen(s)-1] = 0 ;
}

char last( char * s ) {
	return s[strlen(s)-1];
}

int readmore( char * st, int left ) {
	if ( fgets( st, left, stdin ) == NULL ) {
		return 0 ;
	}
	if ( last(st) == '\n' ) {
		removelast(st) ;
	}
	if ( last(st) == '\\' ) {
		removelast(st) ;
	}
	return 1 ;
}

int replace( char * from, char * to ) {
	char * f = strstr( buff, from ) ;
	if ( f == NULL ) {
		return 0 ;
	}
	int lf = strlen(from) ;
	int lt = strlen(to) ;
	memmove( f+lt, f+lf, strlen(f+lf)+1 ) ;
	memmove( f, to, lt ) ;
	return 1 ;
}

void replaceall( char * from, char * to ) {
	char * b = buff ;
	char * f ;
	while ( (f = strstr( b, from )) != NULL ) {
		int lf = strlen(from) ;
		int lt = strlen(to) ;
		memmove( f+lt, f+lf, strlen(f+lf)+1 ) ;
		memmove( f, to, lt ) ;
		b = f+lt ;
	}
}

void extract( void ) {
	while ( buff[0] == '{' && last(buff) == '}' ) {
		replace( "{", "" ) ;
		removelast( buff ) ;
	}
}

char * prior( char * current ) {
	char * c = current ;
	int r = 0 ;
	int l = 0 ;
	do {
		switch (*c) {
			case '}':
				++ r ;
				break ;
			case '{':
				++ l ;
				break ;
		}
		-- c ;
	} while ( l != r ) ;
	return c + 1 ;
}

int unover( void ) {
	char * f = strstr( buff, "\\over" ) ;
	if ( f == NULL ) {
		return 0 ;
	}
	char * p = prior( f-1 ) ;
	memmove( p+strlen("\\over"), p, f-p ) ;
	memmove( p, "\\frac", strlen("\\over" ) ) ;
	return 1 ;
} 

void main(void) {
	char * st = buff ;
	while ( readmore( st, MAX-strlen(st) ) ) {
		st += strlen(st) ;
	}
	//printf("%s\n",buff) ;
	//extract() ;
	replaceall( "\\,"," " ) ;
	replaceall( "^","\\^" ) ;
	replaceall( "_","\\_" ) ;
	replaceall( "\\left(","\\lbrace " ) ;
	replaceall( "\\right)","\\rbrace " ) ;
	while ( unover() ) {}
	printf("%s\n",buff) ;
}

