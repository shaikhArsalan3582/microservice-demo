const nodemailer = require('nodemailer');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const logger = require('../utils/logger');

// Use Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',  // use Gmail service
  auth: {
    user: process.env.EMAIL_FROM,  // your Gmail address
    pass: process.env.EMAIL_PASS,  // your Gmail app password or OAuth2 token
  },
});

const sendEmail = async ({ to, subject, template, context }) => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', `${template}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf8');
    const compiled = handlebars.compile(source);
    const html = compiled(context);

    await transporter.sendMail({
      from: `"Notification Service" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email sent to ${to} with subject: "${subject}"`);
  } catch (err) {
    logger.error(`Failed to send email to ${to}: ${err.message}`, { stack: err.stack });
    throw err;
  }
};

module.exports = { sendEmail };
