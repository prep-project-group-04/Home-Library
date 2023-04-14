const express = require('express')
const app = express()
const port = 3000;
require('dotenv').config();
const cors = require('cors');
app.use(cors());
const axios = require("axios");
// const { Client } = require('pg');
// const client = new Client(URL);
const apikey = process.env.API_KEY;
const hostKey=process.env.HOST_KEY;
const url = process.env.URL;
let data=require('./home.json');



app.get('/', getHomeHandler);
app.get('/filter',filterHandler);
app.use(error404);



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
    let result =response.data.properties.map((element)=>{
     return new HomeData(element.property_id,element.rdc_web_url,element.address.city, element.prop_status, element.price, element.beds, element.baths,element.thumbnail)
    }) ;
    res.json(result);
  }).catch(function (error) {
    errorHandler(error, req, res);
  });
}

function filterHandler(req,res){
  let price=req.query.price;
  let city=req.query.city;
  let prises=[];
  let plases=[];
  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    // prises.push(element.price);
    if(element.address==city){
      plases.push((element));
    }
  }
  // prises.sort(function(a, b){return a - b});
  res.json(plases);
  // console.log(plases);
}
//Constructor
function HomeData(property_id,webUrl,address,prop_status, price, beds, baths, photo) {
  this.id = property_id;
  this.webUrl=webUrl;
  this.address=address;
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


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

























































function HomeData(property_id,webUrl,address,prop_status, price, beds, baths, photo) {
  this.id = property_id;
  this.webUrl=webUrl;
  this.address=address;
  this.status = prop_status;
  this.price = price;
  this.beds = beds;
  this.baths = baths;
  this.photo = photo;
}
