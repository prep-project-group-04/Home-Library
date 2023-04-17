const express = require('express')
const app = express()
const port = 3020;
require('dotenv').config();
const cors = require('cors');
app.use(cors());
const axios = require("axios");
const { Client } = require('pg');
const url = process.env.DataURL;
const client = new Client(url);
const apikey = process.env.API_KEY;
const hostKey = process.env.HOST_KEY;
// const url = process.env.URL;
let data = require('./home.json');



app.get('/', getHomeHandler);
app.get('/filter', filterHandler);



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
app.post("/loginAuthanication",loginAuthHandler)
function loginAuthHandler(req,res)
{ let id=req.query.id
  const email = req.query.Email;
  const password = req.query.Password;
  let sql='SELECT Email,Password FROM Users WHERE Email=$2,Password=$3'
  if(email==Email && password==Password)
  {
    res.send(` login successfull with ${id}`)
  }
}
  
  




//forgetPassword
app.post('/reset', resetPasswordHandler);

function resetPasswordHandler(req,res) {
  // Get the email entered by the user
  let email=req.body.email

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
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
