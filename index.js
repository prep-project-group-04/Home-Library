const express = require('express')
const app = express()
const PORT = 3010
require('dotenv').config();
const {Client}=require('pg');
const client =new Client(process.env.DATABASE_URL)
// to kill a port => sudo kill -9 $(sudo lsof -t -i:portnumber)
const cors = require('cors');
app.use(cors());
const axios = require("axios");
// const bodyParser = require('body-parser')
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())
app.use(express.json());
const apikey = process.env.API_KEY;
const hostKey = process.env.HOST_KEY;
// const url = process.env.URL;
let data = require('./home.json');
//router
//imports the router module from ./router.js file
const appRoute = require('./router.js')
//middleware function that will handle any incoming requests to the '/api' endpoint.
app.use('/api', appRoute);
//
app.get('/', getHomeHandler);
app.get('/filter',filterHandler);
app.post('/addUser',addUserHandller);
app.get('/getUsers',getUsersHandler);
app.put('/updateUser/:id',updateUserHandller)
app.delete('/deleteUser/:id',deletUserHandller);
//app.put('/updatecomment/:KEY',updatecommentHandller);
// app.post("/restPass",passwordHandeler)
// app.post("/favourite",favouriteHandeler)
app.get("/email",emailHandeler)
app.get('/codeChecker',codeCheckerHandller);









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

//http://localhost:3002/addUser
function addUserHandller(req,res){ 
  let {fullName,Email,password}=req.body //destructuring
  console.log(req.body)
let sql=`INSERT INTO users (fullName,Email,password)
VALUES($1,$2,$3) RETURNING *;`
let values=[fullName,Email,password]
 client.query(sql,values).then((result)=>{
console.log(result.rows)
//res.send("add succfly")
 res.status(201).json(result.rows);

 })
 .catch(err=>{
  console.log(err)
 });
}

//http://localhost:3002/getUsers
function getUsersHandler (req,res){
  let sql=`SELECT * FROM Users;`;
  client.query(sql).then((result)=>{
  //  res.send("get succfly")
   //console.log(result.rows)
      res.json(result.rows);
  }) .catch(err=>{
    console.log(err)
   });
}

function updateUserHandller(req,res){
  let userId=req.params.id;
  let {fullName,Email,password}=req.body;
  let sql=`UPDATE Users SET fullName = $1, Email=$2, password=$3
  WHERE id=$4 RETURNING *;`
  let values=[fullName,Email,password,userId];
  client.query(sql,values).then(result=>{
      res.send(result.rows)
  }).catch(err=>{consolo.log(err)})
}

function deletUserHandller(req,res){
  let {id}=req.params;
  let sql=`DELETE FROM Users WHERE id=$1;`
  let values=[id];
  client.query(sql,values).then(result=>{
     //res.send("delet succfly")
      res.status(204).send("delete")
  }).catch(err=>{
    console.log(err)
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



app.use(error404);
//handle error 404
function error404(req, res) {
  return res.status(404).json({ status: 404, responseText: "page not found error" });
}
//handle error 500
function errorHandler(err, req, res) {
  return res.status(500).json({ status: 500, responseText: "ERROR 500" });
}

client.connect().then(()=>{
  app.listen(PORT,()=>{console.log("hello" ,PORT);})

}).catch()





















































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
