// Javascript genetic algorithm for solving best volume

// find segment lengths to solve Paul Alfille's HotApplePi problem
// Javascript E6+ code

// See https://github.com/alfille/HotApplePi

// Problem constraints:
// for N+1 segments
//   all segment lengths: 0 <= u <= Lhat
//   u[0] = u[N] = 0
//   | u[i] - u[i+1] | <= 1/N

var design = null ;

class Graph {
	constructor(name) {
		this.canvas = document.getElementById(name);
		this.Xleng = this.canvas.width - 20 ;
		this.Yleng = this.canvas.height - 20 ;
		this.segnumber = 200 ;
		this.ctx = this.canvas.getContext("2d") ;
		this.Xend=this.screenX(1);
		this.Yend=this.screenY(0);
	}

	screenX(x) {
		// point to screen
		return 10+x*this.Xleng;
	}
	
	screenY(y) {
		// point to screen
		return 10+(1-2*y)*this.Yleng;
	}
	
	pX(x) {
		// screen to point
		return (x-10)/this.Xleng ;
	}
	
	pY(y) {
		// screen to point
		return .5+.5*((10-y)/this.Yleng);
	}
	
	clear() {
		this.ctx.strokeStyle="black";
		this.ctx.fillStyle = "lightgray" ;
		this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height) ;
		const x=this.screenX(0);
		const y=this.screenY(0);
		this.ctx.beginPath() ;
		this.ctx.moveTo(x,y);
		const a = .5*(this.Xend-this.Yend-x+y);
		this.ctx.lineTo(x+a,y-a);
		this.ctx.lineTo(this.Xend,this.Yend);
		this.ctx.lineTo(this.Yend+x-y,this.Yend);
		this.ctx.closePath() ;
		this.ctx.fillStyle="white";
		this.ctx.fill();
		this.endTab = new Path2D() ;
		this.endTab.moveTo(x,y);
		this.active = false ;
	}
	
}

class Design extends Graph {
	constructor() {
		super("Design");
		this.canvas.addEventListener("mousedown", e => {
			this.active = true;
			this.new_point( e.offsetX, e.offsetY ) ;
		});
		this.canvas.addEventListener("mousemove", e => {
			if ( this.active ) {
				this.new_point( e.offsetX, e.offsetY ) ;
			}
		});
		this.canvas.addEventListener("mouseup", e=> {
			this.active = false ;
			this.new_point( e.offsetX, e.offsetY ) ;
		});
		this.folddiv=document.getElementById("FoldDiv"); 
		this.clear();
	}

	clear() {
		this.folddiv.hidden=true;
		this.folded=null;
		this.ctx.strokeStyle="black";
		this.ctx.fillStyle = "lightgray" ;
		this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height) ;
		const x=this.screenX(0);
		const y=this.screenY(0);
		this.ctx.beginPath() ;
		this.ctx.moveTo(x,y);
		const a = .5*(this.Xend-this.Yend-x+y);
		this.ctx.lineTo(x+a,y-a);
		this.ctx.lineTo(this.Xend,this.Yend);
		this.ctx.lineTo(this.Yend+x-y,this.Yend);
		this.ctx.closePath() ;
		this.ctx.fillStyle="white";
		this.ctx.fill();
		this.endTab = new Path2D() ;
		this.endTab.moveTo(x,y);
		this.active = false ;
	}
	
	new_point(x,y) {
		if ( this.ctx.isPointInPath( x, y ) ) {
			this.ctx.fillStyle="lightgray";
			this.ctx.fill();
			this.ctx.beginPath();
			this.ctx.moveTo(x,y);
			const a = .5*(this.Xend-this.Yend-x+y);
			this.ctx.lineTo(x+a,y-a);
			this.ctx.lineTo(this.Xend,this.Yend);
			this.ctx.lineTo(this.Yend+x-y,this.Yend);
			this.ctx.closePath() ;
			this.ctx.fillStyle="white";
			this.ctx.fill();
			this.endTab.lineTo(x,y)
			this.ctx.stroke(this.endTab);
			if ( Math.abs(this.Xend-this.Yend-x+y)<=1 ) {
				this.end_point();
			}
		}
	}
	
	finish() {
		this.ctx.fillStyle="lightgray";
		this.ctx.fill();
		this.end_point() ;
	}
	
	end_point() {
		this.endTab.lineTo(this.Xend,this.Yend);
		this.endTab.closePath();
		this.ctx.stroke(this.endTab);
		this.ctx.fillStyle="blue";
		this.ctx.fill(this.endTab);
		// Make segments
		this.seg=[] ;
		this.ctx.strokeStyle="yellow";
		for ( let i=0 ; i<=this.segnumber ; i+=1 ) {
			const x = this.screenX(i/this.segnumber) ;
			let y = this.Yend/2 ;
			let diff = y ;
			while ( diff > 1 ) {
				diff *= .5 ;
				if ( this.ctx.isPointInPath( this.endTab, x, y ) ) {
					y -= diff ;
				} else {
					y += diff ;
				}
			}
			this.seg[i]=this.pY(y);
			this.ctx.beginPath();
			this.ctx.moveTo(x,this.Yend);
			this.ctx.lineTo(x,y);
			this.ctx.stroke();
		}
		this.seg[0] = 0 ;
		this.seg[this.segnumber] = 0 ;
		this.folddiv.hidden=false;
		this.folded=new Folded(this.seg);
	}
}

class Folded extends Graph {
	constructor(seg) {
		super("Folded");
		this.clear();
		this.plot(this.Xs(seg),seg);
	}

	clear() {
		this.ctx.fillStyle = "lightgray" ;
		this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height) ;
		this.ctx.strokeStyle = "white" ;
		this.ctx.lineWidth = 1 ;
		for ( let i = 0; i <= 1 ; i += .1 ) {
			// grid
			this.ctx.beginPath() ;
			this.ctx.moveTo( this.screenX(i),this.screenY(0) ) ;
			this.ctx.lineTo( this.screenX(i),this.screenY(.5) ) ;
			this.ctx.stroke() ;
		}
		for ( let i = 0; i <= .5 ; i += .1 ) {
			// grid
			this.ctx.beginPath() ;
			this.ctx.moveTo( this.screenX(0),this.screenY(i) ) ;
			this.ctx.lineTo( this.screenX(1),this.screenY(i) ) ;
			this.ctx.stroke() ;
		}
		this.ctx.fillStyle = "black" ;
		for ( let i = .1; i <= this.Ydim ; i += .1 ) {
			this.ctx.fillText(Number(i).toFixed(2).replace(/0$/,""),this.screenX(0),this.screenY(i))
		}
	}
	
	plot(X,Y) {
		console.log("X",X);
		console.log("Y",Y);
		this.ctx.strokeStyle="red";
		this.ctx.lineWidth=2;
		this.ctx.fillStyle="blue";
		this.ctx.beginPath();
		this.ctx.moveTo(this.screenX(X[0]),this.screenY(Y[0]));
		X.slice(1).forEach( (x,i) => this.ctx.lineTo(this.screenX(x),this.screenY(Y[i])) );
		this.ctx.stroke();
		this.ctx.closePath();
		this.ctx.fill();
	}
	
	Xs(u) {
		let sum = 0. ;
		const N1 = 1/this.segnumber**2 ;
		let u0 = u[0] ;
		const X = u.slice(1).map( u1 => {
			sum += Math.sqrt(Math.max(0,N1-(u1-u0)**2)) ;
			//console.log(sum);
			u0=u1;
			return sum;
		});
		X.unshift(0);
		return X.map( x => x + (1-sum)/2 ) ; // centering
	}
}

onload = () => {
	design = new Design() ;
	//console.log("new offload");
	//design.run() ;
}

class WorkerCanvas {
	constructor(name) {
		this.name = name ;
		this.canvas = document.getElementById(name) ;
		this.transferCanvas = this.canvas.transferControlToOffscreen() ;
	}
	
	send(W) {
		W.postMessage({ canvas: this.transferCanvas, type:this.name},[this.transferCanvas]);
	}
}

class CSV {
	// create a CSV file with data and parameters

	constructor() {
	}

	Xs() {
		let sum = 0. ;
		const N1 = 1/Settings.N**2 ;
		let u0 = this.u[0] ;
		const X = this.u.slice(1).map( u1 => {
			sum += Math.sqrt(N1-(u1-u0)**2) ;
			//console.log(sum);
			u0=u1;
			return sum;
		});
		X.unshift(0);
		return X.map( x => x + (1-sum)/2 ) ; // centering
	}
	
	Ss() {
		return [...Array(Settings.N+1).keys()].map(x =>x/(Settings.N)) ;
	}

	format_line(arr) {
		return arr.map(a => typeof(a)=="number" ? Number(a) : `"${a}"`).join(',') + '\n' ;
	}
	
	parameters(i) {
		switch(i) {
			case 0:
				return ['','Algorithm','gradient'] ;
			case 1:
				return ['','Length',Settings.Lhat] ;
			case 2:
				return ['','Volume',this.volume] ;
			case 3:
				return ['','Segments',Settings.N] ;
			default:
				return [] ;
		}
	}

    blob(blub) {
        //htype the file type i.e. text/csv
        const link = document.createElement("a");
        link.download = `Solution_${Settings.Lhat}.csv`;
        link.href = window.URL.createObjectURL(blub);
        link.style.display = "none";

        document.body.appendChild(link);
        link.click(); // press invisible button
        
        // clean up
        // Add "delay" see: https://www.stefanjudis.com/snippets/how-trigger-file-downloads-with-javascript/
        setTimeout( () => {
            window.URL.revokeObjectURL(link.href) ;
            document.body.removeChild(link) ;
        });
    }
			
	download(volume,u) {
		this.volume = volume ;
		this.u = u ;
		let x = this.Xs() ;
		let s = this.Ss() ;
		let csv = this.format_line(["s","x","f(s)","","Parameter","Value"]) +
			u.map( (_,i) => this.format_line( [s[i],x[i],u[i]].concat(this.parameters(i)) ) ).join('');
		const blub = new Blob([csv], {type: 'text/csv'});
		this.blob( blub ) ;
	}
}
