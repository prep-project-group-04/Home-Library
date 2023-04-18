const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const { EMAIL, PASSWORD } = require('./env.js')



//send mail from real gmail account 
function sendEmailHandeler (req, res) {
    
    //add to Crypto table 
    // let email=req.body.email
    const {email}=req.body;
    let code = (Math.random() + 1).toString(36).substring(7).toUpperCase();
 


    let config = {
        service : 'gmail',
        auth : {
            user: EMAIL,
            pass: PASSWORD
        }
    }
  
    let transporter = nodemailer.createTransport(config);
  
    let MailGenerator = new Mailgen({
        theme: "default",
        product : {
            name: "Mailgen",
            link : 'https://mailgen.js/'
        }
    })
  
    let response = {
        body: {
            name : "qais",
            intro: "Your code has arrived!",
            table : {
                data : [
                    {
                         item: code,
                    }
                ]
            },
            outro: "Looking forward to do more business with you"
        }
    }
  
    let mail = MailGenerator.generate(response)
  
    let message = {
        from : EMAIL,
        to : email,
        subject: "Verification",
        html: mail
    }
  
    transporter.sendMail(message).then(() => {
        return res.status(201).json({yourCode:code})
    }).catch(error => {
        return res.status(500).json({ error })
    })
  }
  
  
  //this code exports the sendEmailHandeler function as a module, so that it can be used in other parts of the codebase
  module.exports = {
    sendEmailHandeler
  }