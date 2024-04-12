// Javascript genetic algorithm for solving best volume

const Settings = {
	N:		50, 	// segments
	Pop:	100, 	// Candidates/generation
	Lhat:	1.0 	// Relative length
} ;

function random_in_range( rng ) {
	// rng array [lo, hi]
	return Math.random()*(rng[1]-rng[0]) + rng[0] ;
}

function penumbra( ua, ub ) {
	// allowable range between ua, ub
	const NN = 1/Settings.N ;
	return [
		Math.max( 0 , Math.min( ua-NN, ub-NN ) ),
		Math.min( Settings.Lhat , Math.max( ua+NN, ub+NN ) ),
		] ;
}

function close_enough( u, utarget ) {
	// within proper distance to utarget
	const NN = 1/Settings.N ;
	return ( u >= utarget-NN ) && ( u <= utarget+NN ) ;
}

class Candidate {
	constructor () {
		this.u =  Array(Settings.N+1).fill(0.);
		for ( let i = 1; i < Settings.N ; ++i ) {
			this.mutate( i ) ;
		}
		this.valuate();
	}
	
	mutate( i ) {
		this.u[i] = random_in_range( penumbra(this.u[i-1], this.u[i+1]) ) ;
	}
	
	valuate() {
		this.value = this.u.reduce( (acc, u, prev) =>
			acc += (3 * Settings.Lhat * (u + this.u[prev]) - 2*(u^2+this.u[prev]^2+u*this.u[prev]))*Math.sqrt(1-(Settings.N*(u-this.u[prev]))^2)/(6*Settings.N)
			) ;
	}
}		 

class Generation {
	constructor () {
		
	}
}

