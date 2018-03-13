/* Servidor para Clientes
 
GET /clientes
DELETE /clientes/:id

*/

"use strict";

const express = require('express')
const logger = require('morgan')
const errorhandler = require('errorhandler')
const mongodb= require('mongodb')
const bodyParser = require('body-parser')
let app = express()

const url = 'mongodb://localhost:27017/'

// middleware
/*
 * var autentica = // autenticación
	let usr;
	
	if(!usr) {
		usr = prompt("Identificación", "El pibe mandingo");
	}
}
*/

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(errorhandler())
/*
app.use((req, res, next) => { 
	// Autenticación

	if(!req.usr) {
		req.usr = prompt("Identificación", "El pibe mandingo");
	}
	
	if (req.usr) next();
})
*/

function cuenta(bd, next) {
	bd
      .count({}, (error, res) => {
        if (error) return next(error);
        
        next(res);
	}) 
}

function mstBD(bd) {
	cuenta(bd, (res) => { console.log(res, bd.s.name) })
}

mongodb.MongoClient.connect(url, (error, db) => {
	if (error) throw error;

	var bdClientes = db.db("curso").collection("clientes");
	
	mstBD(bdClientes);

	app.get('/clientes', (req, res) => {
		bdClientes
			.find({}, {sort: {_id: -1}})
			.toArray((error, clientes) => {
				if (error) return next(error)
				res.send(clientes)
			})
	})

  app.get('/clientes/cuantos', (req, res) => {
    res.send(cuenta(bdClientes, res => res));
  })

	app.get('/cliente/:id', (req, res) => {
		bdClientes
			.find({_id: mongodb.ObjectID(req.params.id)})
			.toArray((error, cliente) => {
				if (error) return next(error);
				res.send(cliente)
			})
  })

/*
  app.post('/accounts', (req, res) => {
    let newAccount = req.body
    db.collection('accounts').insert(newAccount, (error, results) => {
      if (error) return next(error)
      res.send(results)
    })
  })

// For the PUT route, define a URL parameter :id and access it with req.params.id. Use req.body (request body) to pass the new account to the update method. Use mongodb.ObjectID with req.params.id to convert the string ID to an ObjectID which is needed for the update method query:

  app.put('/accounts/:id', (req, res) => {
   db.collection('accounts')
     .update({_id: mongodb.ObjectID(req.params.id)},
       {$set: req.body},
       (error, results) => {
         if (error) return next(error)
         res.send(results)
       }
     )
  })
*/

  app.delete('/cliente/:id', (req, res) => {
	  let id = {}
	  if (req.params.id) id = {_id: mongodb.ObjectID(req.params.id)}
	bdClientes
     .remove(id, (error, results) => {
      if (error) return next(error)
      res.send(results)
   })
  })

  app.delete('/clientes', (req, res) => {
	bdClientes
     .remove({}, (error, results) => {
      if (error) return next(error)
      res.send(results)
   })
  })
  
  console.log("Monta el servicio")
  
  app.listen(3000)
})
