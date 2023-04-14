const express = require('express')
const app = express()
const cors = require('cors');
const axios = require("axios");

app.use(cors());



























































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
