const nodemailer = require("nodemailer")
const handlebars = require("handlebars")
const fs = require("fs")
const path = require("path")
const config = require('config')

const sendEmail = async (email, subject, payload, template) => {

  return new Promise((resolve, reject) => {

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      pool: true,
      secure: true,
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || config.get('EMAIL_USER'),
        pass: process.env.EMAIL_PASS || config.get('EMAIL_PASS')
      },
      maxConnections: 20,
      maxMessages: Infinity
    })

    const source = fs.readFileSync(path.join(__dirname, template), "utf8")
    const compiledTemplate = handlebars.compile(source)

    // Email template for the reset link
    const mailOptions = {
      from: '"quizblog.rw(Quiz-Blog)" <quizblog.rw@gmail.com>',
      to: email,
      subject: subject,
      html: compiledTemplate(payload),
    };

    // Sending the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        console.log('Email sent: ' + info.response);
        resolve(info);
      }
    });
  })
}


// Function to send html email
const SendHtmlEmail = async (email, subject, html) => {

  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      pool: true,
      secure: true,
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      maxConnections: 20,
      maxMessages: Infinity
    })

    // Mail options
    const options = () => {
      return {
        from: '"quizblog.rw(Quiz-Blog)" <quizblog.rw@gmail.com>',
        to: email,
        subject: subject,
        html: html,
      }
    }

    // Send email
    transporter.sendMail(options(), (err, info) => {

      if (err) {
        console.log(err)
        return err

      } else {
        console.log('Email sent to ' + info.envelope.to[0])
        return info
      }
    })

  } catch (err) {
    return console.log({ msg: err.message })
  }
}

module.exports = { sendEmail, SendHtmlEmail }