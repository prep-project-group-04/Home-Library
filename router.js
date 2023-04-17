const router = require('express').Router();

const { sendEmailHandeler } = require('./appController.js')

/** HTTP Reqeust */
router.post("/sendEmail",sendEmailHandeler)

module.exports = router;