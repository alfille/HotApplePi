// Javascript genetic algorithm for solving best volume

function random_in_range( rng ) {
	// rng array [lo, hi]
	return Math.random()*(rng[1]-rng[0]) + rng[0] ;
}

function penumbra( ua, ub ) {
	const NN = 1/Candidate.N ;
	return [
		Math.max( 0 , Math.min( ua-NN, ub-NN ) ),
		Math.min( Geneation.Lhat , Math.max( ua+NN, ub+NN ) ),
		] ;
}

function close_enough( u, utarget ) {
	const NN = 1/Candidate.N ;
	return ( u >= utarget-NN ) && ( u <= utarget+NN ) ;
}

class Candidate {
	N = 50 ; //number of elements
	constructor () {
		this.u =  Array(n).fill(0.);
		for ( let i = 1; i < Candidate.N ; ++i ) {
			this,mutate( i ) ;
		}
	}
	
	mutate( i ) {
		this.u[i] = random_in_range( penumbra(this.u[i-1], this.U[i+1]) ) ;
	}
}		 

class Generation {
	Lhat = 1.0 ;
	N = 50 ;
	constructor () {
		

}

