"use strict";

const mongo = require('mongodb').MongoClient;
const async = require('async');

var cuantos = parseInt(process.argv[2], 10);
if (!cuantos) {
	cuantos = 1000;
	console.log(cuantos, "registros por lote (Defecto)");
}

function combina() {
	let fs = require("fs")
	let clientes    = JSON.parse(fs.readFileSync('m3-customer-data.json', 'utf8'));
	let direcciones = JSON.parse(fs.readFileSync('m3-customer-address-data.json', 'utf8'));
	var campo;
	
	let completo = clientes.map((cliente, x) => {
		for (campo in direcciones[x]) { cliente[campo] = direcciones[x][campo] }
	})
	
	return completo
}

mongo.connect("mongodb://localhost:27017/", function(err, db) {
	console.log("Pasó la entrada");
	if (err) throw err;
	var bdClientes = db.db("curso");
  
	console.log ("1. Consolida Datos");
	var datos = combina();
	console.log ("  ", datos.length, " registros.");
	
	var hasta = 0;
	let lotes = [];
	
	console.log("2. Prepara lotes");
	for (let x = 0; x < datos.length; x = hasta +1) {
		hasta = x +cuantos -1;
		console.log("  Prepara ", x, "a", hasta);
		lotes.push((done) => {
			bdClientes.collection("clientes").insert(datos.slice(x, hasta), function(err, res) {
				console.log("Lote de ", x, "a", hasta);
				done(err,res);
			});
		});
	}
	
	console.log("3. Lanza los procesos");
	async.parallel(lotes, (error, results) => {
		if (error) return process.exit(1);
		console.log(results.length, " lotes");
		console.log(results);
	});

	db.close();
	console.log("Proceso concluido");
}); 

process.exit();

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
