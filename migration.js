"use strict";

const mongo = require('mongodb').MongoClient;
const async = require('async');

var cuantos = parseInt(process.argv[2], 10);
if (!cuantos) {
	cuantos = 1000;
	console.log(cuantos, "registros por lote (Defecto)");
}

function combina() {
	console.log ("2. Consolida Datos");

	let fs = require("fs")
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

	var bdClientes = db.db("curso").collection("clientes");

	console.log ("1. Limpia la B.D.");
	bdClientes.deleteMany({}, (err, ack) => {
		if (err) throw err;

		console.log("  ", ack.deletedCount, "registros eliminados.");
		
		let lotes = pica(combina(),cuantos);

		console.log("4. Lanza los procesos");
		async.parallel(lotes.map(
			(lote, x) => 
				bdClientes.insert(lote, (err, res) => {
					if (err) throw err;
					done(err,res);
				}
			)),
			(error, results) => {
				if (error) throw error;

				results.forEach((res,x) => { 
					console.log("*************************************");
					console.log(" Lote. Resultado: ");
					console.log(res.result)
					console.log("*************************************");
				})
			});
	});
});

function done(err, res) {
	console.log("Alguien llamó a 'done' con:", err, ",", res);
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
