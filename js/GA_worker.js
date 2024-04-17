// Javascript genetic algorithm for solving best volume

// find segment lengths to solve Paul Alfille's HotPaalePi problem
// Javascript E6+ code

// See https://github.com/alfille/HotApplePi

// Problem constraints:
// for N+1 segments
//   all segment lengths: 0 <= u <= Lhat
//   u[0] = u[N] = 0
//   | u[i] - u[i+1] | <= 1/N

const Settings = {
	N:		100, 	// number of segments
	Pop:	1000, 	// Candidates/generation
	Lhat:	2.0, 	// Relative length side to (unfolded) width
	generations:	1000,	// short timeline
} ;

class Candidate {
	// Single sequence
	constructor () {
		this.value = 0 ; // calculated volume (Ignores constant multiplier)
		this.u =  Array(Settings.N+1).fill(0.); // Segment lengths
		this.mutate_all() ;
		this.valuate();
	}

	mutate_all() {
		for ( let i = 1; i < Settings.N ; ++i ) {
			this.mutate_slot( i ) ;
		}
	}
	
	mutate_slot( i ) {
		const NN = 1/Settings.N ;
		const min = Math.max(             0, this.u[i-1]-NN, this.u[i+1]-NN ) ;
		const max = Math.min( Settings.Lhat, this.u[i-1]+NN, this.u[i+1]+NN ) ;
		this.u[i] = Math.random() * ( max-min ) + min ;
	}
	
	copy_at_slot( C, i ) {
		// copies from another Candidate, but valuation defered
		for ( let j = i; j<=Settings.N ; ++j ) {
			this.u[j] = C.u[j] ;
		}
	}
	
	copy( C ) {
		this.copy_at_slot( C, 0 ) ;
	}
	
	random_slot() {
		return Math.floor(Math.random() * (Settings.N-1))+1 ;
	}
	
	mutate_from(C) {
		this.copy(C);
		this.mutate_slot(this.random_slot()) ;
		this.valuate() ;
	}
	
	close_enough( u1, u2 ) {
		// within proper distance to utarget
		const NN = 1/Settings.N ;
		return Math.abs(u1-u2) < NN ;
	}
	
	sex_between( A, B ) {
		// a little complicated:
		// Copy part of A and rest of B
		// make sure transition point is random but also legal ("close_enough for a valid derivative).
		// So start at a random spot and start testing for close_enough
		// Copy direction depends on which way is close enough.
		// If no possible transition, just mutate
		
		const start = this.random_slot() ;
		for ( let k = 1 ; k <= Settings.N ; ++k ) {
			const j = (k+start-1) % Settings.N + 1 ; // need to shift to avoid endpoints
			if ( this.close_enough( A.u[j], B.u[j+1] ) ) {
				//console.log("A->B");
				this.copy( A ) ;
				this.copy_at_slot( B, j+1 ) ;
				this.valuate() ;
				return ;
			} else if ( this.close_enough( B.u[j], A.u[j+1] ) ) {
				//console.log("B->A");
				this.copy( B ) ;
				this.copy_at_slot( A, j+1 ) ;
				this.valuate() ;
				return ;
			}
		}
		//console.log("Mutate");
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
	// Holds a list of candidates and manages population selection
	constructor () {
		this.population=Array(Settings.Pop).fill(null) ;
		this.population.forEach( (_,i)=>this.population[i]=new Candidate() ) ;
		this.half = Math.floor(this.population.length/2) ;
		this.resort();
	}
	
	resort() {
		// reorder the list of candidates by fitness
		this.population.sort((p1,p2)=>p2.value-p1.value);
		this.best = this.population[0].value ;
	}
	
	volume() {
		return 4 * this.best ;
	}
	
	profile() {
		// best profile
		return this.population[0].u ;
	}
	
	mutate() {
		// Make worst half of population a mutated copy of best half
		for ( let i = this.half; i<this.population.length; ++i ) {
			this.population[i].mutate_from(this.population[i-this.half]) ;
		}
		this.resort() ;
	}		

	procreate() {
		// genetically mix with preference for most fit
		// pairswise best replace lower half, and best children get mixed into procreators
		for ( let i = 0 ; i < this.half ; ++i ) {
			this.population[i+this.half].sex_between( this.population[2*i], this.population[2*i+1] ) ;
		}
		this.resort() ;
	}
}

class Run {
	constructor () {
		this.gen = null ;
	}
	
	start() {
		this.gen = new Generation() ;
	}
	
	run() {
		postMessage( {volume:this.gen.volume(), u:this.gen.profile(), seq:this.seq } ) ;
		console.log("Worker:Send message",Settings.N);
		for ( let g = 0 ; g<Settings.generations ; ++g ) {
			this.gen.mutate() ;
			this.gen.procreate() ;
		}
	}
}

var run = new Run() ;

onmessage = ( evt ) => {
	if ( evt.isTrusted ) {
		console.log("Worker",evt);
		Object.assign( Settings, evt.data ) ;
		run.seq = evt.data.seq ;
		if ( evt.data.start ) {
			run.start() ;
		}
		run.run() ; 
	} else {
		console.log("Worker: Message not trusted");
	}
}
