const express = require('express')
const messageController = require('./messageController')
const CONSTANT = require('../../constant')
let messageRoute = express.Router()


//Owner Register

messageRoute.route('/send')
    .post((req, res) => {
        messageController.send(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSE })
        })
    })

messageRoute.route('/history')
    .post((req, res) => {
        messageController.getHistory(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSE })
        })
    })
module.exports = messageRoute;