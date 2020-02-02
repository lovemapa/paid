const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
// const apiUrl = 'http://13.232.208.65:4002';
const apiUrl = 'http://localhost:4002';

const smtpEmail = 'kumar16.pawan@gmail.com';
const smtpPass = 'niti!234';

const FCM = require("fcm-node");
const serverKey = "AIzaSyD7QbU83dWivM5qiPSPRlYwuHWhx4AWMsc"; //put your server key here
const fcm = new FCM(serverKey);


function encrypt(text) {
    const cipher = crypto.createCipher(algorithm, secretKey);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}
function decrypt(text) {
    const decipher = crypto.createDecipher(algorithm, secretKey);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}
class commonController {
    handleValidation(err) {
        const messages = []
        for (let field in err.errors) { return err.errors[field].message; }
        return messages;
    }
    authTokenGenerate(userId) {
        return jwt.sign({ username: userId },
            'someSecretText'
        );
    }
    async generateHashEmail(email) {
        const hash = await encrypt(email);
        return hash;
    }
    async compareHashEmail(email) {
        const decryptedEmail = await decrypt(email);
        return decryptedEmail;
    }

    sendMail(email, _id, token, type, cb) {

        var route;
        if (type == 'company')
            route = 'company'
        else
            route = 'influencer'
        var html, subject
        if (_id == undefined || token == undefined) {
            subject = 'Account verifciation'
            html = `<p><a href=${apiUrl}/api/${route}/verify/>Click this link to verfiy</a></p>`
        }
        else {
            subject = 'Request for Change Password'
            html = `<p><a href=${apiUrl}/api/${route}/forgetpassword/?token=${token}&user=${_id}>click here to change password</a></p>`

        }
        var smtpConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: smtpEmail,
                pass: smtpPass
            }
        };
        const transporter = nodemailer.createTransport(smtpConfig);
        const mailOptions = {
            from: smtpEmail, // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            html: html

        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log('email sending failed ' + error);
                cb({ status: 0, message: error })
            }
            else {
                cb({ status: 1, message: info })

            }
            transporter.close();
        });
    }


    sendMailandVerify(email, _id, token, type, cb) {

        var route;
        if (type == 'user')
            route = 'user'
        else
            route = 'owner'
        var html, subject

        subject = 'Account verifciation'
        html = `<p><a href=${apiUrl}/api/${route}/verify/?token=${token}&user=${_id}>Click this link to verfiy</a></p>`

        var smtpConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: smtpEmail,
                pass: smtpPass
            }
        };
        const transporter = nodemailer.createTransport(smtpConfig);
        const mailOptions = {
            from: smtpEmail, // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            html: html

        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log('email sending failed ' + error);
                cb({ status: 0, message: error })
            }
            else {
                cb({ status: 1, message: info })

            }
            transporter.close();
        });
    }

    notification(message) {
        return new Promise((resolve, reject) => {
            fcm.send(message, function (err, response) {
                if (err) {
                    console.log("Something has gone wrong!", err);
                    return reject(err);
                } else {
                    resolve(response);
                }
            });
        });
    }

}

module.exports = new commonController()