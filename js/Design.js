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

class Design {
	constructor() {
		this.canvas = document.getElementById("Design");
		this.width = this.canvas.width ;
		this.Xleng = this.width - 20 ;
		this.height = this.canvas.height ;
		this.Yleng = this.height - 20 ;
		this.ctx = this.canvas.getContext("2d") ;
	}
}


onload = () => {
	design = new Design() ;
	//console.log("new offload");
	design.run() ;
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
