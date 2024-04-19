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
		this.delta =  Array(Settings.N+1).fill(1/Settings.N); // Segment lengths
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
	
	compare_values( s , v0 , trial ) {
		if ( trial == this.u[s] ) {
			return false ;
		}
		const v1 = local_val( s, trial ) ;
		if ( v1 <= v0 ) {
			return false ;
		}
		this.delta[s] = trial - this.u[s] ;
		this.u[s] = trial ;
		return true ;
	}
	
	gradient() {
		for ( let s = 1; s < Settings.N ; ++s ) {
			this.improve_slot(s) ;
		}
	}
	
	improve_slot(s) {
		const NN = 1/Settings.N ;
		const min = Math.max(             0, this.u[s-1]-NN, this.u[s+1]-NN ) ;
		const max = Math.min( Settings.Lhat, this.u[s-1]+NN, this.u[s+1]+NN ) ;
		const v0 = this.local_val(s,this.u[s]) ;
		
		if ( this.compare_values( s, v0, max )  ){
			return;
		}
		if ( this.compare_values( s, v0, min ) ) {
			return;
		}
		let d = this.u[0]+this.delta[s] ;
		if ( (d < max) && this.compare_values(s, v0, d ) ) {
			return;
		}
		d = this.u[0]-this.delta[s] ;
		if ( (d < max) && this.compare_values(s, v0, d ) ) {
			return;
		}
		this.delta[s] /= 2 ;
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

	slot_val(s) {
		// ignores constant multipliers
		const u0 = this.u[s-1] ;
		const u1 = this.u[s] ;
		return ( 3 * (u0+u1) * Settings.Lhat - 2 * ( u1**2+u0**2 + u0*u1 ) ) * Math.sqrt( 1 - ( (u1-u0)/Settings.N )**2 ) ;
	}
	
	local_val(s,v) {
		const vsave = this.u[s] ;
		this.u[s] = v ;
		const vret = this.slot_val(s)+this.slot_val(s+1) ;
		this.u[s] = vsave ;
		return vret ;
	}
}		 



class Generation {
	// Holds a list of candidates and manages population selection
	constructor () {
		this.population=[new Candidate()];
		this.resort();
	}
	
	resort() {
		// reorder the list of candidates by fitness
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
		this.population[0].gradient() ;
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
		}
		// send note back to master
		postMessage( {volume:this.gen.volume(), seq:this.seq } ) ;
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
