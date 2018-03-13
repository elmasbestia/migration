"use strict";

const mongo = require('mongodb').MongoClient;
const async = require('async');
const fs = require("fs")

var cuantos = parseInt(process.argv[2], 10);
if (!cuantos) {
	cuantos = 1000;
	console.log(cuantos, "registros por lote (Defecto)");
}

function combina() {
	console.log ("2. Consolida Datos");

	let clientes    = JSON.parse(fs.readFileSync('m3-customer-data.json', 'utf8'));
	let direcciones = JSON.parse(fs.readFileSync('m3-customer-address-data.json', 'utf8'));
	var campo;

	let completo = clientes.map((cliente, x) => {
		for (campo in direcciones[x]) { cliente[campo] = direcciones[x][campo] }
		return cliente;
	})
	
	console.log("  ", completo.length, "registros");
	
	return completo
}

function pica(arreglo, cant) {
	// Divide un arreglo en un arreglo de arreglos de <cant> elementos
	var x, hasta;
	var lotes = [];
	
	console.log("3. Separa lotes");
	
	for (let x = 0; x < arreglo.length; x = hasta) {
		hasta = x +cant;
		lotes.push(arreglo.slice(x, hasta));
	}
	console.log("  ", lotes.length, "lotes");
	return lotes;
}

mongo.connect("mongodb://localhost:27017/", function(err, db) {
	if (err) throw err;

	var registrados = 0;

	var bdClientes = db.db("curso").collection("clientes");

	console.log ("1. Limpia la B.D.");
	bdClientes.deleteMany({}, (err, ack) => {
		if (err) throw err;

		console.log("  ", ack.deletedCount, "registros eliminados.");
		
		let lotes = pica(combina(),cuantos);

		console.log("4. Lanza los procesos");
		var debut = new Date();
		
		async.parallel(lotes.map(
			(lote, x) => function (done) {
				bdClientes.insert(lote, (err, res) => {
					if (err) throw err;
					done(err,res);
				}
			)}),
			(err, res) => {
				if (err) throw error;
				
				var resultado = new Resultado(debut, cuantos, res.reduce((total, x) => total +x.result.n,0), res.length);

				mstResultados(resultado);
				
				// Fin del proceso
				process.exit(0);
			});
	});
});

function mstResultados(resultado) {
	const nbArch = 'Resultados.json';

	function mstT(res) {
		console.log(res.muestra());
	}
	
	let fResultados = [];
	
	console.log("----");
	mstT(resultado);
				
	if (fs.existsSync(nbArch)) {
		fResultados = JSON.parse(fs.readFileSync(nbArch, 'utf8')).map(x => new Resultado(x));
		
		console.log();
		console.log("Resultados anteriores:");
		fResultados.forEach(x => { mstT(x)});
	}
			
	fResultados.push(resultado);
	
	fs.writeFileSync(nbArch, JSON.stringify(fResultados))
	console.log("Los resultados fueron guardados en", nbArch)
}

function Resultado (debut, cuantos, registrados, lotes) {
	
	if (cuantos) {
		this.debut = debut;
		this.fin = new Date();
		this.cuantos = cuantos;
		this.lotes = lotes;
		this.registrados = registrados;
	} else {
		this.debut = new Date(debut.debut);
		this.fin = new Date(debut.fin);
		this.cuantos = debut.cuantos;
		this.lotes = debut.lotes;
		this.registrados = debut.registrados;
	}
	this.t = () => this.fin - this.debut;
	this.muestra = () => this.registrados +" documentos insertados en " +this.t() +"ms. en " +this.lotes +" lotes de " +this.cuantos +" documentos";
}


function Evalua(lotes) {
	const benchmark = require('benchmark');
	var suite = new benchmark.Suite;
 
// add tests 
suite.add('RegExp#test', function() {
  /o/.test('Hello World!');
})
.add('String#indexOf', function() {
  'Hello World!'.indexOf('o') > -1;
})
// add listeners 
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
// run async 
.run({ 'async': true });
 
// logs: 
// => RegExp#test x 4,161,532 +-0.99% (59 cycles) 
// => String#indexOf x 6,139,623 +-1.00% (131 cycles) 
// => Fastest is String#indexOf 
}
