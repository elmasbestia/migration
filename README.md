The assignment lab for this module is to build a migration script to move data from one MongoDB database to another.

MongoDB Migration Node Script
You work at a Bitcoin exchange company. For some reason, the customer data is missing its full address. You have customer data only with the street address (building number and street name) but no city, state, country. Also, phone numbers are missing too. Luckily, your friends were able to restore the address information from a backup replica of a MongoDB instance. You need to write a migration/restoration script which will merge the data from the two sources.

You have millions of records so you need to create a script which can run queries to the database in parallel. You don't know what is the optimal number of customers to insert into a database at a time so you need to write the program to allow for a variable number of documents to be able to be updated at once. This will help to determine if it's better to update in groups of 10, 50 or maybe 500 at a time.

You are provided with two sample JSON files customer-data.json and customer-address-data.json which contain 1000 documents/objects (remember, the real data will have 1000000+ objects). Assume that the order of the objects in each file correlates to objects in the other file.

You can download the files here:

m3-customer-data.json

m3-customer-address-data.json

The end result of the customer object should have address fields and phone numbers. For example:

 { id: '100',
    first_name: 'Augustin',
    last_name: 'Chrichton',
    email: 'achrichton2r@studiopress.com',
    gender: 'Male',
    ip_address: '154.24.68.112',
    ssn: '480-83-7668',
    credit_card: '3543947705552628',
    bitcoin: '14VL3QyC2qS4f9pdC8rtjbjURxi5ysa7hU',
    street_address: '98207 Talmadge Road',
    country: 'United States',
    city: 'Saint Petersburg',
    state: 'Florida',
    phone: '813-448-6128' },
  },
Use the mongodb native driver and async modules. Read the number of objects to process in a single query from a CLI argument. For example, node migrate-data.js 1000 will run 10 queries in parallel out of 1000 objects while node migrate-data.js 50 will run 20 queries in parallel out of the same 1000 objects.

Use the async module from npm (or a similar module) and its parallel() method to implement the lab. For example, tasks is an array of functions and they will run all at the same time. When they are done, the callback will be executed:

async.parallel(tasks, (error, results) => {
  if (error) console.error(error)
  console.log(results)
})
For the full async documentation, see https://caolan.github.io/async.
