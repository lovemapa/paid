'use strict'
const CONSTANT = require('../../constant')
const commonController = require('../common/controllers/commonController')
const messageModel = require('../../models/message')
const moment = require('moment');

class messageBroadcast {

    send(data) {
        return new Promise((resolve, reject) => {
            if (!data.message && !data.userId && !data.ownerId && !data.bookingId && !data.senderId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                const message = new messageModel({
                    message: data.message,
                    userId: data.userId,
                    ownerId: data.ownerId,
                    bookingId: data.bookingId,
                    senderId: data.senderId,
                    date: moment().valueOf()
                })
                message.save().then((result) => {
                    resolve(result);
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                });

            }

        })
    }
    getHistory(data) {
        return new Promise((resolve, reject) => {
            if (!data.userId && !data.ownerId && !data.bookingId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                messageModel.find({bookingId: data.bookingId, ownerId: data.ownerId, userId: data.userId}).then((result) => {
                    resolve(result);
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                });

            }

        })
    }
}
module.exports = new messageBroadcast();