// Javascript genetic algorithm for solving best volume

// find segment lengths to solve Paul Alfille's HotApplePi problem
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
		this.mutate_slot(this.random_slot()) ;
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
		let val_E = 0. ;
		let val_L = 0. ;
		const N2 = Settings.N**2 ;
		let u0 = 0  ;
		this.u.slice(1).forEach( u1 => {
			const sq = Math.sqrt( 1 - N2*(u1-u0)**2 ) ;
			val_E += sq*(u0**2+u0*u1+u1**2) ;
			val_L += sq*(u0+u1) ;
			u0 = u1 ;
		});
		this.value = ( 3 * Settings.Lhat * val_L  - 2 * val_E ) / ( 6 * Settings.N ) ;
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
		this.W = new Worker("Plotter.js") ; // subworker
	}
	
	start() {
		this.gen = new Generation() ;
	}
	
	run() {
		// send message back
		//console.log("Worker:Send message",Settings.N);
		for ( let g = 0 ; g<Settings.generations ; ++g ) {
			this.gen.mutate() ;
			this.gen.procreate() ;
		}
		// send note back to master
		postMessage( {volume:this.gen.volume(), u:this.gen.profile(), seq:this.seq } ) ;
		// send data to plotter
		this.W.postMessage({seq:this.seq,type:"continue",u:this.gen.profile()});
	}
}

var run = new Run() ;

onmessage = ( evt ) => {
	if ( evt.isTrusted ) {
		//console.log("Worker gets: ",evt.data.type);
		switch (evt.data.type) {
			case "Flat":
			case "Folded":
				run.W.postMessage({canvas:evt.data.canvas,type:evt.data.type},[evt.data.canvas]) ;
				break ;
			case "start":
				Object.assign( Settings, evt.data ) ;
				run.W.postMessage(evt.data);
				run.seq = evt.data.seq ;
				run.start() ;
				run.run() ;
				break ;
			case "continue":
				Object.assign( Settings, evt.data ) ;
				run.seq = evt.data.seq ;
				run.run() ; 
				break ;
		}
	} else {
		console.log("Worker: Message not trusted");
	}
}

class CanvasType {
	constructor(canvas) {
		this.canvas = canvas ;
		this.ctx=this.canvas.getContext("2d",{willReadFrequently:true,});
		this.startX = 10 ;
		this.startY = 10 ;
		this.lengX = this.canvas.width - 2* this.startX ;
		this.lengY = this.canvas.height - 2* this.startY ;
		this.ctx.globalAlpha = 1.0 ;
	}
	
	clear() {
		this.ctx.fillStyle = "white" ;
		this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height) ;
		this.ctx.strokeStyle = "lightgray" ;
		this.ctx.lineWidth = 1 ;
		for ( let i = 0; i <= 1 ; i += .1 ) {
			// grid
			this.ctx.beginPath() ;
			this.ctx.moveTo( this.pX(0),this.pY(i) ) ;
			this.ctx.lineTo( this.pX(1),this.pY(i) ) ;
			this.ctx.stroke() ;
			this.ctx.beginPath() ;
			this.ctx.moveTo( this.pX(i),this.pY(0) ) ;
			this.ctx.lineTo( this.pX(i),this.pY(1) ) ;
			this.ctx.stroke() ;
		}
		this.copyImg() ;
	}
	
	pX( x ) {
		return x*this.lengX + this.startX ;
	} 
	
	pY( y ) {
		return (1-y)*this.lengY + this.startY ;
	}

	curve(X,Y) {
		this.pasteImg() ;
		//console.log(X,Y);

		// pass 1 in black
		this.ctx.beginPath() ;
		this.ctx.strokeStyle="black" ;
		this.ctx.lineWidth = 1 ;
		this.ctx.moveTo(this.pX(X[0]),this.pY(Y[0]));
		for ( let i = 1 ; i <= Settings.N; ++i ) {
			this.ctx.lineTo( this.pX(X[i]), this.pY(Y[i]) ) ;
		}
		this.ctx.stroke() ;

		this.copyImg() ;

		// pass 2 in red
		this.ctx.beginPath() ;
		this.ctx.strokeStyle="red";
		this.ctx.lineWidth = 4 ;
		this.ctx.moveTo(this.pX(X[0]),this.pY(Y[0]));
		for ( let i = 1 ; i <= Settings.N; ++i ) {
			this.ctx.lineTo( this.pX(X[i]), this.pY(Y[i]) ) ;
		}
		this.ctx.stroke() ;
	}
	
	add_data( u ) {
		this.curve( this.Xs( u ), u ) ;
	}
	
	copyImg () {
		this.imgData = this.ctx.getImageData(this.startX,this.startY,this.lengX,this.lengY);
	}
	
	pasteImg () {
		this.ctx.putImageData( this.imgData,this.startX,this.startY);
	}
}

class CanvasFlat extends CanvasType {
	Xs(u) {
		return [...Array(Settings.N+1).keys()].map(x =>x/(Settings.N)) ;
	}
}

class CanvasFolded extends CanvasType {
	Xs(u) {
		let sum = 0. ;
		const N1 = 1/Settings.N**2 ;
		let u0 = u[0] ;
		const X = u.slice(1).map( u1 => {
			sum += Math.sqrt(N1-(u1-u0)**2) ;
			u0=u1;
			return sum;
		});
		X.unshift(0);
		return X.map( x => x + (1-sum)/2 ) ; // centering
	}
}
