const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
  constructor(user, url, dog = null) {
    this.name = user.firstName + ' ' + user.lastName;
    this.url = url;
    this.to = user.email;
    this.from = `DogAdoption Admin <no-reply@apps.damirpristav.com>`;
    this.dog = dog;
  }

  getTransport() {
    if(process.env.NODE_ENV === 'production'){
      return nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASS
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASS
      }
    });
  }

  async send(template, subject, notification = false, admins = null) {
    let markup;
    if(notification) {
      markup = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
        name: this.name,
        url: this.url,
        subject,
        dog: this.dog
      });
    }else {
      markup = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
        name: this.name,
        url: this.url,
        subject
      });
    }

    const options = {
      from: this.from,
      to: admins ? admins : this.to,
      subject: subject,
      text: htmlToText.fromString(markup),
      html: markup
    }

    const transporter = this.getTransport();
    await transporter.sendMail(options);
  }
}

module.exports = Email;