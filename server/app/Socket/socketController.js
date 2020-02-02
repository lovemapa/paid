const vehicleModel = require('../../models/vehicleModel')
const pickModel = require('../../models/pickupModel')
const bookingModel = require('../../models/bookingModel')
const userModel = require('../../models/company')
const ownerModel = require('../../models/ownerModel')
const notificationModel = require('../../models/notificationModel')
const vehicleRatingModel = require('../../models/vehicleRatingModel')

const commonController = require('../common/controllers/commonController')

const CONSTANT = require('../../constant')
const moment = require('moment')

class socketController {

    // Add a username to connected socket for Single chat

    addUsername(socket, io, socketInfo) {
        socket.on('add', (user) => {
            console.log('add');
            socket.username = user.userId
            socketInfo[user.userId] = socket.id;
            console.log(socketInfo);
        })
    }

    sendLiveLocation(socket, io, room_members) {
        socket.on('sendLocation', (data) => {
            socket.broadcast.emit('broadcast', { coordinates: [76.710064, 30.703453], socketId: socket.id, ownerId: data.ownerId });

        })

    }

    sendRequest(socket, io, room_members) {
        socket.on('sendRequest', (data) => {

            if (!data.vehicleId || !data.currentLat || !data.currentLong || !data.userId) {
                io.to(socket.id).emit('sendRequest', { status: CONSTANT.FALSE, message: CONSTANT.MISSINGVEHCILE });
            } else {
                ownerModel.findById({ _id: data.ownerId }).then(ownerInfo => {
                    if (ownerInfo.status == 1) {
                        const bookingRegister = this.createBookingRegistration(data)
                        bookingRegister.save().then((saveresult) => {

                            const pick = new pickModel({
                                bookingId: saveresult._id,
                                name: data.name,
                                contact: data.contact,
                                notes: data.notes,
                                specialRequest: data.specialRequest,
                                date: data.pickUpDate
                            })
                            const notify = new notificationModel({
                                typeId: saveresult._id,
                                type: 'booking',
                                title: 'You got new booking please check',
                                description: 'You got new booking please check',
                                assignedId: data.ownerId
                            });
                            notify.save({}).then(notifyDetails => {
                                console.log('notifyDetails')
                                console.log(notifyDetails)
                            })

                            saveresult.set('userId', data.userId, { strict: false })

                            pick.save({}).then(pickDetails => {
                                userModel.findById({ _id: data.userId }).then(userInfo => {
                                    saveresult.set('user', userInfo, { strict: false })
                                    if (typeof room_members[data.ownerId] !== "undefined") {
                                        io.to(room_members[data.ownerId]).emit('newBooking', { status: 1, booking: saveresult });
                                    }
                                    io.to(socket.id).emit('sendRequest', { status: CONSTANT.TRUE, message: 'Booking successfully created' });
                                });
                            }).catch(err => {
                                console.log(err);
                                io.to(socket.id).emit('sendRequest', { status: CONSTANT.FALSE, message: err });

                            })
                        }).catch(error => {
                            if (error.errors)
                                io.to(socket.id).emit('sendRequest', { status: CONSTANT.FALSE, message: commonController.handleValidation(error) });

                            io.to(socket.id).emit('sendRequest', { status: CONSTANT.FALSE, message: error });
                        })
                    } else {
                        io.to(socket.id).emit('sendRequest', { status: CONSTANT.FALSE, message: 'Vehicle owner is offline you can`t book this at the moment' });
                    }
                })
            }

        })

    }
    // --------Create Booking Registration Model------------
    createBookingRegistration(data) {
        var currentCoordinates = []
        var location = {}

        if (data.currentLat && data.currentLong) {
            currentCoordinates.push(data.currentLong)
            currentCoordinates.push(data.currentLat)
        }

        location.type = "Point";
        location.coordinates = currentCoordinates

        let BookingRegistrationData = new bookingModel({

            // moment().add(1, "hour").add(10, "minute").valueOf()
            userId: data.userId,
            bookingDuration: data.bookingDuration,
            ownerId: data.ownerId,
            vehicleId: data.vehicleId,
            typeOfEvent: data.typeOfEvent,
            startTime: data.startTime,
            endTime: data.endTime,
            currentCoordinates: currentCoordinates,
            currentLat: data.currentLat,
            currentLong: data.currentLong,
            address: data.address,
            location: location,
            date: data.pickUpDate,
            price: data.price,
            tax: data.tax,
            commission: data.commission,
            security: data.security,
            promoCode: data.promoCode,
            estimatedPrice: data.estimatedPrice
        })
        return BookingRegistrationData;
    }

    acceptRequest(socket, io, room_members) {
        socket.on('acceptRequest', (data) => {
            var response;

            // if (data.status === 1)
            //     response = CONSTANT.BOOKING_STATUS.ACCEPTED
            // else
            //     response = CONSTANT.BOOKING_STATUS.REJECTED

            bookingModel.findOneAndUpdate({ _id: data.bookingId }, { $set: { status: data.status } }, { new: true }).then(
                update => {
                    io.to(room_members[data.userId]).emit('sendRequest', { booking_status: data.status, booking: update });
                }
            ).catch(error => {
                if (error.errors)
                    io.to(socket.id).emit('acceptRequest', { status: CONSTANT.FALSE, message: commonController.handleValidation(error) });


                io.to(socket.id).emit('acceptRequest', { status: CONSTANT.FALSE, message: error });
            })
        })

    }

    completeBooking(socket, io, room_members) {
        socket.on('completeBooking', (data) => {
            var response;
            bookingModel.findOneAndUpdate({ _id: data.bookingId }, { $set: { status: CONSTANT.BOOKING_STATUS.COMPLETED } }, { new: true }).then(
                update => {
                    bookingModel.findOne({ _id: data.bookingId }).populate({ path: 'ownerId', select: 'profilePic firstName lastName' }).then(result => {

                        vehicleRatingModel.aggregate([{ $match: { ownerId: result.ownerId._id } }, {
                            $group: { _id: null, average: { $avg: "$rating" } }
                        }]).then(rating => {
                            let averageRate = 0

                            if (rating && rating.length) {
                                averageRate = rating[0].average
                            }

                            result.ownerId.set('averageRate', averageRate, { strict: false });

                            io.to(room_members[update.userId]).emit('completeBooking', { status: CONSTANT.TRUE, booking: result });
                            io.to(room_members[update.ownerId]).emit('completeBooking', { status: CONSTANT.TRUE, booking: result });
                        });
                    });
                }
            ).catch(error => {
                if (error.errors)
                    io.to(socket.id).emit('completeBooking', { status: CONSTANT.FALSE, message: commonController.handleValidation(error) });

                io.to(socket.id).emit('completeBooking', { status: CONSTANT.FALSE, message: error });
            })
        })

    }


    cancelBooking(socket, io, room_members) {
        socket.on('cancelBooking', (data) => {

            var response;
            bookingModel.findOneAndUpdate({ _id: data.bookingId }, { $set: { status: CONSTANT.BOOKING_STATUS.CANCEL } }, { new: true }).then(
                update => {
                    bookingModel.findOne({ _id: data.bookingId }).populate({ path: 'ownerId', select: 'profilePic firstName lastName' }).then(result => {

                        console.log(result)

                        io.to(room_members[update.userId]).emit('cancelBooking', { status: CONSTANT.TRUE, booking: result });
                        io.to(room_members[update.ownerId]).emit('cancelBooking', { status: CONSTANT.TRUE, booking: result });
                    });
                }
            ).catch(error => {
                if (error.errors)
                    io.to(socket.id).emit('cancelBooking', { status: CONSTANT.FALSE, message: commonController.handleValidation(error) });

                io.to(socket.id).emit('cancelBooking', { status: CONSTANT.FALSE, message: error });
            })
        })

    }

    // Send Message to a particular user
    sendMessage(socket, io, room_members) {
        socket.on('sendMessage', (data) => {
            messageController.send(data).then(result => {
                console.log(result);
                io.to(socket.id).emit(`${result.userId}newMessage`, { status: CONSTANT.TRUE, result: result });
                io.to(socket.id).emit(`${result.ownerId}newMessage`, { status: CONSTANT.TRUE, result: result });
            }).catch(error => {
                if (error.errors)
                    io.to(socket.id).emit('sendMessage', { status: CONSTANT.FALSE, message: commonController.handleValidation(error) });

                io.to(socket.id).emit('sendMessage', { status: CONSTANT.FALSE, message: error });
            })
        })
    }

    chatHistory(socket, io, room_members, socketInfo) {
        socket.on('chatHistory', (data) => {
            messageController.getHistory(data).then(result => {
                io.to(socket.id).emit('chatHistory', { success: CONSTANT.TRUE, result: result, })
            }).catch(error => {
                if (error.errors)
                    io.to(socket.id).emit('chatHistory', { status: CONSTANT.FALSE, message: commonController.handleValidation(error) });

                io.to(socket.id).emit('chatHistory', { status: CONSTANT.FALSE, message: error });
            })
        })
    }


}

module.exports = socketController;