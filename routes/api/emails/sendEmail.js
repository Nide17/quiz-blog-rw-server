const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const config = require('config');

const createTransporter = () => {
  return nodemailer.createTransport({
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
  });
};

const sendActualMail = async (transporter, mailOptions, retries) => {
  for (let i = 0; i < retries; i++) {
    try {
      let info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
      return info;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed: ${error.message}`);
      if (i === retries - 1) throw error;
    }
  }
};

const sendEmail = async (email, subject, payload, template, retries = 3) => {
  const transporter = createTransporter();
  const source = fs.readFileSync(path.join(__dirname, template), "utf8");
  const compiledTemplate = handlebars.compile(source);
  const mailOptions = {
    from: '"quizblog.rw(Quiz-Blog)" <quizblog.rw@gmail.com>',
    to: email,
    subject: subject,
    html: compiledTemplate(payload),
  };
  return sendActualMail(transporter, mailOptions, retries);
};

const sendHtmlEmail = async (email, subject, html, retries = 3) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: '"quizblog.rw(Quiz-Blog)" <quizblog.rw@gmail.com>',
    to: email,
    subject: subject,
    html: html,
  };
  return sendActualMail(transporter, mailOptions, retries);
};

module.exports = { sendEmail, sendHtmlEmail };
