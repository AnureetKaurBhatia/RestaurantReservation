require("dotenv").config();
var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var nodemailer = require("nodemailer");

const Day = require("../models/day").model;
const Reservation = require("../models/reservation").model;

// Parameters:
// {
//   "date": String ("Dec 02 2019 06:00"),
//   "table": table id,
// 	"name": String,
// 	"phone": String,
// 	"email": String
// }

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

router.post("/", function(req, res, next) {
  Day.find({ date: req.body.date }, (err, days) => {
    if (!err) {
      if (days.length > 0) {
        let day = days[0];
        day.tables.forEach(table => {
          if (table._id == req.body.table) {
            // The correct table is table
            table.reservation = new Reservation({
              name: req.body.name,
              phone: req.body.phone,
              email: req.body.email
            });
            table.isAvailable = false;
            day.save(err => {
              if (err) {
                console.log(err);
              } else {
                console.log("Reserved");
                res.status(200).send("Added Reservation");
                var mail_body = "Hi " + req.body.name + "!!! \n Your Reservation is confirmed for the date " + req.body.date;
                var mailOptions = {
                  from: process.env.GMAIL_USER,
                  to: req.body.email,
                  subject: 'Reservation Confirmation',
                  text: mail_body
                };
                transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
                });
              }
            });
          }
        });
      } else {
        console.log("Day not found");
      }
    }
  });
});

module.exports = router;