const express = require('express')
const app = express()
const PORT = 3021
require('dotenv').config();
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);

const cors = require('cors');
app.use(cors());
const axios = require("axios");
app.use(express.json());
const apikey = process.env.API_KEY;
const hostKey = process.env.HOST_KEY;
const url = process.env.URL;
let data = require('./home.json');
const bcrypt = require('bcrypt');
//router
//imports the router module from ./router.js file
const appRoute = require('./router.js')
//middleware function that will handle any incoming requests to the '/api' endpoint.
app.use('/api', appRoute);
//
const saltRounds = 10;
app.get('/', getHomeHandler);
app.get('/filter', filterHandler);
app.post('/addUser', addUserHandller);
app.get('/getUsers', getUsersHandler);
app.put('/updateUser/:id', updateUserHandller);
app.delete('/deleteUser/:id', deletUserHandller);
app.put('/updateComment',updateCommentHandller)
app.get('/getInfo/:id', profileInfoHandler);
app.post('/addComment',addCommentHandler);
app.get('/getFav',getFavHandler);
app.post("/loginAuthanication", loginAuthHandler);
app.get("/email",emailHandeler)
app.get('/codeChecker',codeCheckerHandller);
app.use(error404);


function getHomeHandler(req, res) {
  const city = req.query.city;
  const options = {
    method: 'GET',
    url: `${url}`,
    params: {
      city,
      state_code: 'NY',
      offset: '0',
      limit: '200',
      sort: 'relevance'
    },
    headers: {
      'X-RapidAPI-Key': `${apikey}`,
      'X-RapidAPI-Host': `${hostKey}`
    }
  };
  axios.request(options).then(function (response) {
    let result = response.data.properties.map((element) => {
      return new HomeData(element.property_id, element.rdc_web_url, element.address.city, element.prop_status, element.price, element.beds, element.baths, element.thumbnail)
    });
    res.json(result);
  }).catch(function (error) {
    errorHandler(error, req, res);
  });
}

function filterHandler(req, res) {
  let price = req.query.price;
  let city = req.query.city;
  if (price !== "noChoice" && city !== "noChoice") {
    price = price.split('-');
    firstPrice = parseInt(price[0].replace(/[^\d]+/g, '')) * 1000;
    secondPrice = parseInt(price[1].replace(/[^\d]+/g, '')) * 1000;
  let array = data.filter(element => {
      return element.address === city && element.price >= firstPrice && element.price <= secondPrice;
    });

    res.json(array);
  } else {
    res.json([]);
  }
}



//LOGIN (AUTHENTICATE USER)
function loginAuthHandler(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  let values = [email];
  let sql = `SELECT * FROM Users WHERE Email=$1`;
  client.query(sql, values).then((result) => {
    if (result.rows[0].password == password) {
      res.status(201).json(result.rows[0].id)
    }
    else {
      res.status(505).json('rong password');
    }
  }).catch((err) => {
    res.status(505).json('No account');
  })
}

function isValidEmail(email) {
  const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  return regex.test(email);
}

function addUserHandller(req, res) {
  let { fullName, email, password } = req.body; // Destructuring

  console.log(req.body);
  // Add length restrictions
  const maxNameLength = 25;
  const maxEmailLength = 50;
  const maxPasswordLength = 25;
  const minPasswordLength = 8;
  
  if (fullName.length > maxNameLength) {
    res.status(400).json({ error: "Full name is too long. Maximum length is 25 characters." });
    return;
  }

  if (email.length > maxEmailLength) {
    res.status(400).json({ error: "Email is too long. Maximum length is 50 characters." });
    return;
  }

  if (password.length > maxPasswordLength || password.length < minPasswordLength) {
    res.status(400).json({ error: "Password length must be between 8 and 25 characters." });
    return;
  }

  // Check if the email is valid
  if (!isValidEmail(email)) {
    res.status(400).json({ error: "Invalid email format." });
    return;
  }

  // Check if the email already exists in the database
  let checkEmailSql = 'SELECT email FROM Users WHERE email=$1';
  let checkEmailValues = [email];

  client.query(checkEmailSql, checkEmailValues)
    .then(result => {
      if (result.rows.length > 0) {
        res.status(409).json({ error: "Email already in use." });
        return;
      }

      // Hash the password using bcrypt
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "An error occurred while hashing the password." });
          return;
        }

        let sql = `INSERT INTO users (fullName, email, password)
VALUES($1, $2, $3) RETURNING *;`;
        let values = [fullName, email, hash]; // Store the hashed password

        client.query(sql, values)
          .then((result) => {
            console.log(result.rows);
            res.status(201).json(result.rows);
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: "An error occurred while adding the user." });
          });
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "An error occurred while checking for existing email." });


function emailHandeler (req,res){
  let sql=`SELECT Email FROM Users;`;
  client.query(sql).then((result)=>{
      res.json(result.rows);
  }).catch();
}

function codeCheckerHandller(req,res){ 
  let sql=`SELECT code FROM Crypto;`;
  client.query(sql).then((result)=>{
      res.json(result.rows);
  }).catch();
}

//http://localhost:3002/addUser
function addUserHandller(req, res) {
  let { fullName, Email, password } = req.body //destructuring
  console.log(req.body)
  let sql = `INSERT INTO users (fullName,Email,password)
      VALUES($1,$2,$3) RETURNING *;`
  let values = [fullName, Email, password]
  client.query(sql, values).then((result) => {
    console.log(result.rows)
    //res.send("add succfly")
    res.status(201).json(result.rows);

  })
    .catch(err => {
      console.log(err)
    });
}

//http://localhost:3002/getUsers
function getUsersHandler(req, res) {
  let sql = `SELECT * FROM Users;`;
  client.query(sql).then((result) => {
    //  res.send("get succfly")
    //console.log(result.rows)
    res.json(result.rows);
  }).catch(err => {

function updateUserHandller(req, res) {
  let userId = req.params.id;
  let { fullName, email, password } = req.body;
  let sql = `UPDATE Users SET fullName = $1, email=$2, password=$3
  WHERE id=$4 RETURNING *;`
  let values = [fullName, email, password, userId];
  client.query(sql, values).then(result => {
    res.send(result.rows)
  }).catch(err => {
    console.error(err);
    res.status(500).json({ error: "An error occurred while updating the user." });
  });
    console.log(err)
  });
}

}

function deletUserHandller(req, res) {
  let { id } = req.params;
  let sql = `DELETE FROM Users WHERE id=$1;`
  let values = [id];
  client.query(sql, values).then(result => {
    //res.send("delet succfly")
    res.status(204).send("delete")
  }).catch(err => {
    console.log(err)
  });
}


function profileInfoHandler(req,res) {
  let { id } = req.params;
  let sql = 'SELECT * FROM Users WHERE id=$1;'
  let values = [id];
  client.query(sql, values).then(result => {
    res.status(201).send(result.rows)
  }).catch(err => {
    console.log(err)
  });
}


function addCommentHandler(req,res){
  let { user_id, Home_id, comment } = req.body //destructuring
  console.log(req.body)
  let sql = `INSERT INTO Comment (user_id,Home_id,comment)
    VALUES ($1,$2,$3) RETURNING *;`
  let values = [user_id, Home_id, comment]
  client.query(sql, values).then((result) => {
    console.log(result.rows);
    res.status(201).json(result.rows);

  })
    .catch(err => {
      console.log(err)
    });
  
}


function addCommentHandler(req,res)
{
  let { user_id, Home_id, comment } = req.body //destructuring
  console.log(req.body)
  let sql = `INSERT INTO Comment (user_id,Home_id,comment)
    VALUES ($1,$2,$3) RETURNING *;`
  let values = [user_id, Home_id, comment]
  client.query(sql, values).then((result) => {
    console.log(result.rows);
    res.status(201).json(result.rows);
  })
    .catch(err => {
      console.log(err)
    });
}

function getFavHandler (req,res){
  let sql = 'SELECT * FROM Comment';
  client.query(sql).then(result=>{
    res.json(result.rows)
  })
}



function updateCommentHandller (req,res) {

    let {user_id,Home_id,comment}=req.body;
    let sql=`UPDATE Comment SET comment=$1
    WHERE Home_id=$2 AND user_id=$3 RETURNING *;`
    let values=[comment,Home_id,user_id];
    client.query(sql,values).then(result=>{
        res.send(result.rows)
    }).catch(err => {console.log(err)})

}

//Constructor
function HomeData(property_id, webUrl, address, prop_status, price, beds, baths, photo) {
  this.id = property_id;
  this.webUrl = webUrl;
  this.address = address;
  this.status = prop_status;
  this.price = price;
  this.beds = beds;
  this.baths = baths;
  this.photo = photo;
}

//handle error 404
function error404(req, res) {
  return res.status(404).json({ status: 404, responseText: "page not found error" });
}
//handle error 500
function errorHandler(err, req, res) {
  return res.status(500).json({ status: 500, responseText: "ERROR 500" });
}

client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  })
}).catch(err => {
  console.log(`Failed to listen on port ${PORT} because of error: ${err}`);
})
