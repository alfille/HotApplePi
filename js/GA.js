// Javascript genetic algorithm for solving best volume

// find segment lengths to solve Paul Alfille's HotPaalePi problem
// Javascript E6+ code

// See https://github.com/alfille/HotApplePi

// Problem constraints:
// for N+1 segments
//   all segment lengths: 0 <= u <= Lhat
//   u[0] = u[N] = 0
//   | u[i] - u[i+1] | <= 1/N

var offload = null ;

const Settings = {
	N:		100, 	// number of segments
	population:	1000, 	// Candidates/generation
	Lhat:	.5, 	// Relative length side to (unfolded) width
	generations:	100,	// short timeline
	era:			3,		// number of generations 
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
		this.population=Array(Settings.population).fill(null) ;
		this.population.forEach( (_,i)=>this.population[i]=new Candidate() ) ;
		this.half = Math.floor(this.population.length/2) ;
		this.resort();
	}
	
	resort() {
		// reorder the list of candidates by fitness
		this.population.sort((p1,p2)=>p2.value-p1.value);
		this.best = this.population[0].value ;
		console.log("Best:",this.best);
	}
	
	volume() {
		return 4 * this.best ;
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

class Evolution {
	constructor () {
		this.gen = new Generation() ;
	}
	
	run () {
		for ( let g = 0 ; g<Settings.generations ; ++g ) {
			this.gen.mutate() ;
			this.gen.procreate() ;
		}
	}
	
	all() {
		for ( let r = 0 ; r<Settings.era ; ++r ) {
			this.run() ;
		}
	}
}

class Offload {
	constructor() {
		this.seq = 0 ; // sequence to keep track of changes
		this.W = new Worker("js/GA_worker.js") ;
		this.W.addEventListener("message", this.message, false ) ;
		this.showValues() ;
		this.new_start = true ;
		this.more = document.getElementById("More") ;
		this.flat = new CanvasFlat() ;
		this.folded = new CanvasFolded() ;
	}
	
	showValues() {
		Object.entries(Settings).forEach( e => {
			const id = document.getElementById( e[0] ) ;
			if ( id !== null ) {
				id.value = e[1] ;
			}
		});
	}
	
	getValues() {
		Object.entries(Settings).forEach( e => {
			const id = document.getElementById( e[0] ) ;
			if ( id !== null ) {
				Settings[e[0]] = Number(id.value) ;
			}
		});
		this.new_start = true ;
		this.run() ;
	}
		
	run() {
		this.more.disabled=true ;
		this.more.disabled=true ;
		if ( this.new_start ) {
			this.flat.clear() ;
			this.folded.clear() ;
			this.seq += 1 ;
			this.era_counter = 0 ;
			//console.log("Window New", this.seq);
			this.W.postMessage(Object.assign(Object.assign({},Settings),{start:true,  seq:this.seq})) ;
			this.new_start = false ;
			this.era = Settings.era ;
		} else {
			this.era_counter += 1 ;
			//console.log("Window Old", this.seq);
			this.W.postMessage(Object.assign(Object.assign({},Settings),{start:false, seq:this.seq})) ;
		}
	}
	
	update_era() {
		offload.era += Settings.era ;
		offload.run() ;
	}
	
	message( evt ) {
		// called-back -- must use explicit object
		console.log( "Window", evt, evt.data.seq );
		if ( evt.data.seq == offload.seq ) {
			offload.more.value= offload.era_counter * Settings.generations ;
			// process data;
			offload.flat.add_data( evt.data.u ) ;
			offload.folded.add_data( evt.data.u ) ;
			if ( offload.era_counter >= offload.era ) {
				// this era for this current seq is done, don't send message until new Settings
				offload.more.value= `${offload.era_counter * Settings.generations} More...` ;
				offload.more.disabled=false ;
				return ;
			}
		}
		
		offload.run() ;
	}
	
}

onload = () => {
	offload = new Offload() ;
	offload.run() ;
}

class CanvasType {
	constructor(name) {
		this.canvas = document.getElementById(name) ;
		this.ctx=this.canvas.getContext("2d");
	}
	
	clear() {
		this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height) ;
	}
	
	curve(X,Y) {
		//console.log(X,Y);
		const startX = 20 ;
		const startY = 20 ;
		const lengX = this.canvas.width - 2* startX ;
		const lengY = this.canvas.height - 2* startY ;
		this.ctx.beginPath() ;
		this.ctx.moveTo(startX,startY);
		for ( let i = 1 ; i <= Settings.N; ++i ) {
			this.ctx.lineTo( 
				X[i]*lengX+startX, 
				Y[i]*lengY+startY 
			) ;
		}
		this.ctx.stroke() ;
	}
	
	add_data( u ) {
		this.curve( this.Xs( u ), u ) ;
	}
}

class CanvasFlat extends CanvasType {
	constructor() {
		super("Flat") ;
	}
	
	Xs(u) {
		return [...Array(Settings.N+1).keys()].map(x =>x/(Settings.N)) ;
	}
}

class CanvasFolded extends CanvasType {
	constructor() {
		super("Folded") ;
	}
	
	Xs(u) {
		let temp = 0. ;
		let X = [0] ;
		let N1 = 1/(Settings.N*Settings.N) ;
		for ( let i = 1 ; i <= Settings.N; ++i ) {
			const dx = Math.sqrt( N1 - (u[i]-u[i-1])**2 ) ;
			temp += dx ;
			X.push(temp) ;
		}
		return X.map( x => x+ (1-temp)/2 ) ; // centering
	}
}
