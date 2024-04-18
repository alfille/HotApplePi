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
	era:			30,		// number of generations 
} ;

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
		//console.log( "Window", evt, evt.data.seq );
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
