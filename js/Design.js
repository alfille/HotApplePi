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
	
	grid() {
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
		for ( let i = .1; i <= .5 ; i += .1 ) {
			this.ctx.fillText(Number(i).toFixed(2).replace(/0$/,""),this.screenX(0),this.screenY(i))
		}
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
		this.clear();
	}

	clear() {
		this.hide();
		this.grid();
		this.ctx.strokeStyle="black";
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
	
	show() {
		document.getElementById("FoldDiv").hidden=false;
		this.folded=new Folded(this.seg) ;
		document.getElementById("Download").removeAttribute("disabled");
		document.getElementById("threedee").hidden=false;
	}
			
	hide() {
		document.getElementById("threedee").hidden=true;
		document.getElementById("FoldDiv").hidden=true;
		document.getElementById("Download").setAttribute("disabled",true);
		this.folded=null ;
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
			while ( diff > .001 ) {
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
		this.show();
	}
	
	download() {
		if ( this.folded ) {
			this.folded.download() ;
		}
	}
}

class Folded extends Graph {
	constructor(seg) {
		super("Folded");
		this.seg = seg;
		this.segnumber=seg.length-1;
		this.clear();
		this.Xs() ;
		this.plot();
		this.threedee() ;
	}

	clear() {
		this.grid();
	}
	
	plot() {
		this.ctx.strokeStyle="red";
		this.ctx.lineWidth=2;
		this.ctx.fillStyle="blue";
		this.ctx.beginPath();
		this.ctx.moveTo(this.screenX(this.X[0]),this.screenY(this.seg[0]));
		this.X.slice(1).forEach( (x,i) => this.ctx.lineTo(this.screenX(x),this.screenY(this.seg[i])) );
		this.ctx.stroke();
		this.ctx.closePath();
		this.ctx.fill();
	}
	
	Xs() {
		let sum = 0. ;
		const N1 = 1/this.segnumber**2 ;
		let u0 = this.seg[0] ;
		const X = this.seg.slice(1).map( u1 => {
			sum += Math.sqrt(Math.max(0,N1-(u1-u0)**2)) ;
			//console.log(sum);
			u0=u1;
			return sum;
		});
		X.unshift(0);
		this.X = X.map( x => x + (1-sum)/2 ) ; // centering
	}

	format_line(arr) {
		return arr.map(a => typeof(a)=="number" ? Number(a) : `"${a}"`).join(',') + '\n' ;
	}
	
    blob(blub) {
        //htype the file type i.e. text/csv
        const link = document.createElement("a");
        link.download = `Designed.csv`;
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
			
	download() {
		let x = this.Xs(this.seg) ;
		let csv = this.format_line(["s","x","f(s)"]) +
			this.seg.map( (u,i) => this.format_line( [ i/this.segnumber,x[i],u ] ) ).join('');
		const blub = new Blob([csv], {type: 'text/csv'});
		this.blob( blub ) ;
	}
	
	threedee() {
		const L = 1 ;
		pinhole.scale(.9);
		const top = this.seg.map( (f,i) => [ "drawLine", [this.X[i], L-f, f, this.X[i], f-L, f] ] ) ; 
		const bottom = this.seg.map( (f,i) => [ "drawLine", [this.X[i], L-f, -f, this.X[i], f-L, -f] ] ) ; 
		pinhole.ops( [ ...top, ...bottom ] );
	}
}

onload = () => {
	design = new Design() ;
	pinhole = new Pinhole("C3D");
	pinhole.buttons("D3D");
}
