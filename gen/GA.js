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
		this.value = 0 ;
		this.u =  Array(Settings.N+1).fill(0.);
		this.mutate_all() ;
		this.valuate();
	}

	mutate_all() {
		for ( let i = 1; i < Settings.N ; ++i ) {
			this.mutate_i( i ) ;
		}
	}
	
	mutate_i( i ) {
		this.u[i] = random_in_range( penumbra(this.u[i-1], this.u[i+1]) ) ;
	}
	
	copy_from_at_i( C, i ) {
		// copies from another Candidate, but valuation defered
		for ( let j = i; j<=Settings.N ; ++j ) {
			this.u[j] = C.u[j] ;
		}
	}
	
	copy_from( C ) {
		this.copy_from_at_i( C, 0 ) ;
	}
	
	mutate_from(C) {
		this.copy_from(C);
		this.mutate_i(Math.floor(Math.random() * (Settings.N-1))+1) ;
		this.valuate() ;
	}
	
	sex_between( A, B ) {
		for ( let j = 1 ; j <= Settings.N ; ++j ) {
			if ( close_enough( A.u[j], B.u[j+1] ) ) {
				console.log("A->B");
				this.copy_from( A ) ;
				this.copy_from_at_i( B, j+1 ) ;
				this.valuate() ;
				return ;
			} else if ( close_enough( B.u[j], A.u[j+1] ) ) {
				console.log("B->A");
				this.copy_from( B ) ;
				this.copy_from_at_i( A, j+1 ) ;
				this.valuate() ;
				return ;
			}
		}
		this.mutate_all() ;
		this.valuate() ;
	}
		
	valuate() {
		this.value = this.u.reduce( (acc, u, prev) =>
			acc += (3 * Settings.Lhat * (u + this.u[prev]) - 2*(u^2+this.u[prev]^2+u*this.u[prev]))*Math.sqrt(1-(Settings.N*(u-this.u[prev]))^2)/(6*Settings.N)
			) ;
	}
}		 

class Generation {
	constructor () {
		this.population=Array(Settings.Pop).fill(null) ;
		this.population.forEach( (_,i)=>this.population[i]=new Candidate() ) ;
		this.half = Math.floor(this.population.length/2) ;
		this.resort();
	}
	
	resort() {
		this.population.sort((p1,p2)=>p2.value-p1.value);
		this.best = this.population[0].value ;
		console.log("Best:",this.best);
	}
	
	mutate() {
		// Make worst half a mutated copy of best
		for ( let i = this.half; i<this.population.length; ++i ) {
			this.population[i].mutate_from(this.population[i-this.half]) ;
		}
		this.resort() ;
	}		

	procreate() {
		for ( let i = 0 ; i < this.half ; ++i ) {
			this.population[i+this.half].sex_between( this.population[2*i], this.population[2*i+1] ) ;
		}
		this.resort() ;
	}
}

