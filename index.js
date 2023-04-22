// Imports
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3022;
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
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Router
const appRoute = require('./router.js');
app.use('/api', appRoute);
app.get('/', getHomeHandler);
app.get('/filter', filterHandler);
app.post('/addUser', addUserHandller);
app.get('/getUsers', getUsersHandler);
app.put('/updateUser', updateUserHandller);
app.delete('/deleteUser', deletUserHandller);
app.put('/updateComment', updateCommentHandller)
app.post('/getInfo', profileInfoHandler);
app.post('/addComment', addCommentHandler);
app.post('/getFav', getFavHandler);
app.post("/loginAuthanication", loginAuthHandler);
app.post('/restPassword', restPassword);
app.put("/updatePass", updatePassword);
app.delete("/deleteComment", deleteComment);
app.use('*', error404);

// Function definitions
async function getHomeHandler(req, res) {
  const options = {
    method: 'GET',
    url: `${url}`,
    params: {
      city: "New York City",
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

  try {
    const response = await axios.request(options);
    const result = response.data.properties.map((element) => {
      return new HomeData(element.property_id, element.rdc_web_url, element.address.city, element.prop_status, element.price, element.beds, element.baths, element.thumbnail);
    });
    res.json(result);
  } catch (error) {
    errorHandler(error, req, res);
  }
}

function parsePrice(priceStr) {
  let multiplier = 1;
  let lastChar = priceStr[priceStr.length - 1];

  if (lastChar === 'k') {
    multiplier = 1000;
    priceStr = priceStr.slice(0, -1);
  } else if (lastChar === 'm') {
    multiplier = 1000000;
    priceStr = priceStr.slice(0, -1);
  }
  return parseFloat(priceStr) * multiplier;
}

function filterHandler(req, res) {
  const options = {
    method: 'GET',
    url: `${url}`,
    params: {
      city: "New York City",
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
    let price = req.query.price;
    let city = req.query.city;
    let array = [];
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      if (price == "noChoice") {
        if (element.address == city) {
          array.push((element));
        }
      }
      else if (city == "noChoice") {
        let price2 = `${price}`;
        price = price2.split('-');
        firstPrice = parsePrice(price[0]);
        secondPrice = parsePrice(price[1]);
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
  }).catch(function (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while filtering the data." });
  });

}

function restPassword(req, res) {
  let { email } = req.body;
  let values = [email];
  let url = `SELECT * FROM Users WHERE Email=$1`;
  client.query(url, values).then((result) => {
    if (result.rows.length == 0) {
      res.send('false')
    }
    else {
      axios.post('https://home-library.up.railway.app/api/sendEmail', {
        email: `${email}`
      }).then(function (response) {
        res.status(201).send(response.data.yourCode);
      }).catch(function (error) {
        res.status(505).send(error);
      });
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).json({ error: "An error occurred while resetting the password." });
  })
}

function isValidEmail(email) {
  const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  return regex.test(email);
}

function addUserHandller(req, res) {
  let { fullName, email, password } = req.body; // Destructuring

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
    res.status(401).json({ error: "Email is too long. Maximum length is 50 characters." });
    return;
  }

  if (password.length > maxPasswordLength || password.length < minPasswordLength) {
    res.status(402).json({ error: "Password length must be between 8 and 25 characters." });
    return;
  }

  // Check if the email is valid
  if (!isValidEmail(email)) {
    res.status(403).json({ error: "Invalid email format." });
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
          res.status(500).json({ error: "An error occurred while hashing the password." });
          return;
        }

        let sql = `INSERT INTO users (fullName, email, password)
VALUES($1, $2, $3) RETURNING *;`;
        let values = [fullName, email, hash]; // Store the hashed password

        client.query(sql, values)
          .then((result) => {
            res.status(201).json(result.rows);
          })
          .catch(err => {
            res.status(500).json({ error: "An error occurred while adding the user." });
          });
      });
    })
    .catch(err => {
      res.status(500).json({ error: "An error occurred while checking for existing email." });
    });
}

//LOGIN (AUTHENTICATE USER)
function loginAuthHandler(req, res) {
  const { email, password } = req.body;
  let values = [email];
  let sql = 'SELECT * FROM Users WHERE Email=$1';

  if (isValidEmail(email)) {
    client
      .query(sql, values)
      .then((result) => {
        // Use bcrypt.compare to compare the plain text password with the hashed password
        bcrypt.compare(password, result.rows[0].password, (err, isMatch) => {
          if (err) {
            res.status(500).json('Error comparing passwords');
          } else {
            if (isMatch) {
              res.status(201).json(result.rows[0].id);
            } else {
              res.status(505).json('rong password');
            }
          }
        });
      })
      .catch((err) => {
        res.status(501).json('No account');
      });
  } else {
    res.status(502).json('Try Other Way Haker');
  }
}

function updatePassword(req, res) {
  let { email, newPass } = req.body;
  bcrypt.hash(newPass, 10, (err, hashedPassword) => {
    if (err) {
      res.status(500).send('Error hashing password');
    } else {
      let sql = 'UPDATE Users SET password=$1 WHERE Email=$2';
      let values = [hashedPassword, email];
      client
        .query(sql, values)
        .then((result) => {
          res.status(201).json('The password updated');
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    }
  });
}

function getUsersHandler(req, res) {
  let sql = `SELECT * FROM Users;`;
  client.query(sql).then((result) => {
    res.json(result.rows);
  }).catch(err => {
    console.error(err);
    res.status(500).json({ error: "An error occurred while getting users." });
  });
}

function updateUserHandller(req, res) {
  let { userId, fullName, email, password } = req.body;
  let sql = `UPDATE Users SET fullName = $1, email=$2, password=$3
  WHERE id=$4 RETURNING *;`
  let values = [fullName, email, password, userId];
  client.query(sql, values).then(result => {
    res.send(result.rows)
  }).catch(err => {
    console.error(err);
    res.status(500).json({ error: "An error occurred while updating the user." });
  });
}

async function deletUserHandller(req, res) {
  const { id } = req.body;
  const sql = `DELETE FROM Users WHERE id=$1;`;
  const values = [id];

  try {
    await client.query(sql, values);
    res.status(204).send("delete");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error occurred while deleting the user." });
  }
}

function deleteComment(req, res) {
  let { Home_id, user_id } = req.body;
  let sql = `DELETE FROM Comment WHERE Home_id=$1 AND user_id=$2`;
  let values = [Home_id, user_id];
  client.query(sql, values).then((result) => {
    res.status(201).send("Data deleted");
  }).catch((err) => {
    console.log(err)
    res.status(500).json("comment dosent exist");
  })
}

function profileInfoHandler(req, res) {
  let { id } = req.body;
  let sql = 'SELECT * FROM Users WHERE id=$1;'
  let values = [id];
  client.query(sql, values).then(result => {
    res.status(201).send(result.rows)
  }).catch(err => {
    console.log(err);
    res.status(500).json({ error: "An error occurred while getting profile information." });
  });
}

function addCommentHandler(req, res) {
  let { user_id, Home_id, comment } = req.body //destructuring
  console.log(req.body)
  let sql = `INSERT INTO Comment (user_id,Home_id,comment)
    VALUES ($1,$2,$3) RETURNING *;`
  let values = [user_id, Home_id, comment]
  client.query(sql, values).then((result) => {
    res.status(201).json(result.rows);
  }).catch(err => {
    console.log(err);
    res.status(500).json({ error: "An error occurred while adding the comment." });
  });

}

function getFavHandler(req, res) {
  let { userID } = req.body;
  let sql = 'SELECT * FROM Comment WHERE user_id=$1';
  let values = [userID];
  client.query(sql, values).then(result => {
    if (result.rows.length > 0) {
      res.status(201).json(result.rows)
    }
    else {
      res.status(505).json("There is no comment yet")
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).json({ error: "An error occurred while getting favorites." });
  })
}

function updateCommentHandller(req, res) {
  let { user_id, Home_id, comment } = req.body;
  let sql = `UPDATE Comment SET comment=$1
    WHERE Home_id=$2 AND user_id=$3 RETURNING *;`
  let values = [comment, Home_id, user_id];
  client.query(sql, values).then(result => {
    res.send(result.rows)
  }).catch(err => {
    console.log(err);
    res.status(500).json({ error: "An error occurred while updating the comment." });
  })
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

// Error handlers
function error404(req, res) {
  return res.status(404).json({ status: 404, responseText: "page not found error" });
}

function errorHandler(err, req, res) {
  return res.status(500).json({ status: 500, responseText: "ERROR 500" });
}

// Start server
client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  })
}).catch(err => {
  console.log(`Failed to listen on port ${PORT} because of error: ${err}`);
});
