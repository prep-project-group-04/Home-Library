const express = require('express')
const app = express()
const PORT = 3003
require('dotenv').config();
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL)

const cors = require('cors');
app.use(cors());
const axios = require("axios");
// const { Client } = require('pg');
// const url = process.env.DataURL;
// const client = new Client(url);
// const bodyParser = require('body-parser')
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())
app.use(express.json());
const apikey = process.env.API_KEY;
const hostKey = process.env.HOST_KEY;
// const url = process.env.URL;
let data = require('./home.json');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.get('/', getHomeHandler);
app.get('/filter', filterHandler);
app.post('/addUser', addUserHandller);
app.get('/getUsers', getUsersHandler);
app.put('/updateUser/:id', updateUserHandller)
app.delete('/deleteUser/:id', deletUserHandller);
//app.put('/updatecomment/:KEY',updatecommentHandller);



function getHomeHandler(req, res) {
  const options = {
    method: 'GET',
    url: `${url}`,
    params: {
      city: 'New York City',
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
  price = price.split('-');
  firstPrice = price[0].slice(0, price[0].length - 1);
  firstPrice = parseInt(firstPrice) * 1000;
  secondPrice = price[1].slice(0, price[1].length - 1);
  secondPrice = parseInt(secondPrice) * 1000;
  let array = [];
  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    if (price == "noChoice") {
      if (element.address == city) {
        array.push((element));
      }
    }
    else if (city == "noChoice") {
      if (element.price >= firstPrice && element.price <= secondPrice) {
        array.push(element)
      }
    }
    else if (!(price == "noChoice" && city == "noChoice")) {
      if (element.address == city && element.price >= firstPrice && element.price <= secondPrice) {
        array.push(element);
      }
    }
  }
  res.json(array);
}

function isValidEmail(email) {
  const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  return regex.test(email);
}

function addUserHandller(req, res) {
  let { fullName, email, password } = req.body; // Destructuring

  console.log(req.body);

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
    console.error(err);
    res.status(500).json({ error: "An error occurred while getting users." });
  });
}

function updateUserHandller(req, res) {
  let userId = req.params.id;
  let { fullName, Email, password } = req.body;
  let sql = `UPDATE Users SET fullName = $1, Email=$2, password=$3
  WHERE id=$4 RETURNING *;`
  let values = [fullName, Email, password, userId];
  client.query(sql, values).then(result => {
    res.send(result.rows)
  }).catch(err => {
    console.error(err);
    res.status(500).json({ error: "An error occurred while updating the user." });
  });
}

function deletUserHandller(req, res) {
  let { id } = req.params;
  let sql = `DELETE FROM Users WHERE id=$1;`
  let values = [id];
  client.query(sql, values).then(result => {
    //res.send("delet succfly")
    res.status(204).send("delete")
  }).catch(err => {
    console.error(err);
    res.status(500).json({ error: "An error occurred while deleting the user." });
  });
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


//LOGIN (AUTHENTICATE USER)
app.post("/loginAuthanication", loginAuthHandler)
function loginAuthHandler(req, res) {
  const email = req.query.Email;
  const password = req.query.Password;

  // Select the user with the matching email
  let sql = 'SELECT id, email, password FROM Users WHERE email=$1';
  let values = [email];

  client.query(sql, values)
    .then(result => {
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const hashedPassword = user.password;

        // Compare the plain-text password with the hashed password
        bcrypt.compare(password, hashedPassword, (err, isMatch) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: "An error occurred while comparing the passwords." });
            return;
          }

          if (isMatch) {
            res.send(`Login successful with ${user.id}`);
          } else {
            res.status(401).json({ error: "Invalid email or password." });
          }
        });
      } else {
        res.status(401).json({ error: "Invalid email or password." });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "An error occurred while authenticating the user." });
    });
}







//forgetPassword
app.post('/reset', resetPasswordHandler);

function resetPasswordHandler(req, res) {
  // Get the email entered by the user
  let email = req.body.email

  // Check if the email is valid (you can add more validation if needed)
  if (!validateEmail(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  // Send a request to reset the password
  var xhr = new XMLHttpRequest();       //this help send a request to the server
  xhr.open("POST", "reset-password.php");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function () {
    if (xhr.status === 200) {
      alert("A password reset link has been sent to your email address.");
    } else {
      alert("An error occurred while resetting your password.");
    }
  };
  xhr.send(JSON.stringify({ email: email }));
}


app.use(error404);
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
