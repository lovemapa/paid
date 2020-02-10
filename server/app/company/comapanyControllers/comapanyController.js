'use strict'
const company = require('../../../models/company')
const campaign = require('../../../models/campaign')
const CONSTANT = require('../../../constant')
const commonFunctions = require('../../common/controllers/commonFunctions')
const commonController = require('../../common/controllers/commonController')
const moment = require('moment')
const rn = require('random-number')

const Jwt = require('jsonwebtoken');

const privateKey = 'myprivatekey'
const notificationModel = require('../../../models/notificationModel')


const mongoose = require('mongoose');

class userModule {
    signUp(data, file) {
        console.log(file, privateKey);

        return new Promise((resolve, reject) => {

            if (!data.email || !data.firstName || !data.contact || !data.companyName || !data.lastName || !data.password) {
                reject(CONSTANT.MISSINGPARAMSORFILES)
            }
            else {
                // check if already exists
                let checkCriteria = {
                    email: data.email,
                    isDeleted: false
                };
                company.count(checkCriteria).then(async result => {
                    if (result) {
                        return reject(CONSTANT.UNIQUEEMAILANDUSERNAME)
                    } else {
                        const user = this.createUser(data)
                        const token = await Jwt.sign({ email: data.email, id: user._id, }, privateKey, { expiresIn: 30 * 60 })
                        if (file) {
                            file.profilePic.map(result => {
                                if (result)
                                    data.profilePic = '/' + result.filename
                                else
                                    data.profilePic = '/' + 'default.png'
                            });
                        }
                        user.set('token', token, { strict: false })
                        user.save().then((saveresult) => {
                            resolve({ success: CONSTANT.TRUESTATUS, result: saveresult })
                            // commonController.sendMailandVerify(saveresult.email, saveresult._id, token, 'user', result => {
                            //     if (result.status === 1)
                            //         console.log(result.message.response);
                            //     else
                            //         reject(result.message)
                            // })
                        }).catch(error => {
                            if (error.errors)
                                return reject(commonController.handleValidation(error))
                            return reject(error)
                        })
                        user
                    }
                });
            }
        })
    }

    createUser(data) {
        if (data.password)
            data.password = commonFunctions.hashPassword(data.password)
        let type
        if (data.companyName) {
            type = 'company'
        }
        else
            type = 'creator'
        const user = new company({
            type: type,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            password: data.password,
            contact: data.contact,
            companyName: data.companyName,
            token: data.token,
            date: moment().valueOf()
        })
        return user
    }


    logout(userId) {
        return new Promise((resolve, reject) => {
            company.findOneAndUpdate({ _id: userId }, { $set: { deviceId: '' } }, { new: true }).then(result => {
                resolve(result)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            });
        })
    }
    // login for User

    login(data) {
        return new Promise(async (resolve, reject) => {
            if (!data.email || !data.password) {
                reject(CONSTANT.MISSINGPARAMS)
            }

            else {

                const user = await company.findOne({ email: data.email })
                if (user) {

                    const token = await Jwt.sign({ email: data.email, id: user._id, }, privateKey, { expiresIn: 30 * 60 })
                    company.findOneAndUpdate({ email: data.email },
                        { $set: { token: token } },

                        { new: true }).select('token password email type firstName lastName')

                        .then(updateResult => {

                            if (commonFunctions.compareHash(data.password, updateResult.password)) {
                                {
                                    resolve(updateResult)
                                }
                            } else {

                                reject(CONSTANT.WRONGCREDENTIALS)
                            }

                        })
                }
                else {
                    reject(CONSTANT.NOTREGISTERED)
                }

            }

        })
    }



    displayHome(body) {
        let cordinates = body.coordinates;
        return new Promise(async (resolve, reject) => {
            let search = {};
            let bookingVhlIs = []
            let bookingPipe = [
                {
                    $match: {
                        'startTime': { $lte: body.endTime },
                        'endTime': { $gte: body.startTime },
                        'status': { $in: [CONSTANT.BOOKING_STATUS.PENDING, CONSTANT.BOOKING_STATUS.ACCEPTED, CONSTANT.BOOKING_STATUS.PICKUP_IN_PROGRESS, CONSTANT.BOOKING_STATUS.TRIP_IN_PROGRESS] }
                    }
                },
                {
                    $project: {
                        "vehicleId": 1
                    }
                }
            ]
            await bookingModel.aggregate(bookingPipe).then(bookingData => {
                bookingData.map(bookingInfo => {
                    if (bookingInfo)
                        bookingVhlIs.push(bookingInfo.vehicleId)
                })
            })

            if (body && body.typeOfEvent) {
                search = {
                    $or: [
                        {
                            "events.eventType": { '$regex': body.typeOfEvent, '$options': 'i' }
                        }
                    ]
                }
            }

            let pipeline = [
                {
                    $geoNear: {
                        near: {
                            type: "Point", coordinates: cordinates
                        },
                        includeLocs: "dist.location",
                        maxDistance: 2000,
                        distanceField: "dist.calculated",

                        spherical: true
                    }
                },
                {
                    $match: search
                },
                {
                    $match: { '_id': { '$nin': bookingVhlIs } }
                },
                {
                    $lookup:
                    {
                        from: "vehicleimages",
                        localField: "_id",
                        foreignField: "vehcileId",
                        as: "images"
                    }
                },
                {
                    $group: {
                        _id: '$vehicleTypeId',
                        count: { $sum: 1 },
                        maxDayRate: { $max: "$dayRate" },
                        minDayRate: { $min: "$dayRate" },
                        minHourlyRate: { $min: "$hourlyRate" },
                        maxHourlyRate: { $max: "$hourlyRate" },
                        vehicles: {
                            $addToSet: {
                                _id: '$_id',
                                images: '$images',
                                vehicleTypeId: '$vehicleTypeId',
                                vehicleModel: '$vehicleModel',
                                hourlyRate: '$hourlyRate',
                                dayRate: '$dayRate'
                            }
                        }
                    }
                },
                {
                    $lookup:
                    {
                        from: "carcategories",
                        localField: "_id",
                        foreignField: "_id",
                        as: "vehicleTypeDetails"
                    }
                },
                {
                    $unwind: '$vehicleTypeDetails'
                },
                {
                    $project: {
                        "_id": 0,
                        "vehicleTypeDetails": 1,
                        "count": 1,
                        "maxDayRate": 1,
                        "minDayRate": 1,
                        "minHourlyRate": 1,
                        "maxHourlyRate": 1,
                        "hourlyRate": 1,
                        "dayRate": 1
                    }
                }
            ];
            vehicleModel.aggregate(pipeline).then(result => {
                resolve(result)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))

                return reject(error)
            })
        })
    }





    verify(query) {
        return new Promise((resolve, reject) => {
            if (!query.user)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                company.findById(query.user).then(result => {
                    if (result.token == query.token) {
                        company.findByIdAndUpdate(query.user, { $set: { isVerified: 'true', } }, { new: true }).then(result => {
                            if (result) {

                                resolve(result)

                            }
                            else
                                reject(CONSTANT.NOTREGISTERED)
                        })
                            .catch(error => {
                                if (error.errors)
                                    return reject(commonController.handleValidation(error))
                                if (error)
                                    return reject(error)
                            })
                    }
                    else {
                        reject("UNAUTHORIZED")
                    }
                })

            }

        })
    }


    //verification of email

    verifyEmail(data) {
        return new Promise((resolve, reject) => {
            if (!data.email)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                company.findOne({ email: data.email }).then(result => {
                    if (result.isVerified) {
                        resolve(result)
                    }
                    else
                        reject(result)
                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })
            }

        })
    }

    resendVerification(data) {
        return new Promise((resolve, reject) => {
            if (!data.email)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                const token = rn({
                    min: 1001,
                    max: 9999,
                    integer: true
                })
                company.findOneAndUpdate({ email: data.email }, { $set: { token: token } }, { new: true }).then(updateResult => {
                    if (updateResult == null)
                        reject(CONSTANT.NOTREGISTERED)
                    resolve(updateResult)
                    commonController.sendMailandVerify(data.email, updateResult._id, token, 'user', result => {
                        if (result.status === 1)
                            console.log(result.message.response);

                        else
                            reject(CONSTANT.SOMETHINGWRONG)
                    })
                })
            }
        })


    }

    forgotPassword(data) {
        return new Promise((resolve, reject) => {
            console.log(data);

            if (!data.email)
                reject('Kindly Provide Email')
            company.findOne({ email: data.email }).then(result => {
                if (!result) {
                    reject(CONSTANT.NOTREGISTERED)
                }
                else {
                    const token = rn({
                        min: 1001,
                        max: 9999,
                        integer: true
                    })
                    company.findOneAndUpdate({ email: data.email }, { $set: { token: token } }).then(updateToken => {
                        resolve(CONSTANT.VERIFYMAIL)
                    })
                    commonController.sendMail(data.email, result._id, token, 'company', (result) => {

                        if (result.status === 1)
                            console.log(result.message.response);

                        else
                            reject(result.message)
                    })

                }
            })

        })
    }

    forgetPasswordVerify(body, query) {
        return new Promise((resolve, reject) => {

            if (body.confirmpassword != body.password)
                return reject("Password and confirm password not matched.")
            company.findById(query.user).then(
                result => {

                    if (result && result.token == query.token) {

                        company
                            .findByIdAndUpdate(query.user, {
                                password: commonFunctions.hashPassword(body.password),
                            })
                            .then(
                                result1 => {
                                    return resolve('Password changed successfully.')
                                },
                                err => {
                                    return reject(err)
                                }
                            )
                    }
                    else {
                        return reject({ expired: 1 })
                    }
                },
                err => {
                    return reject(err)
                }
            )
        })
    }

    completeRegistration(data) {
        return new Promise((resolve, reject) => {
            if (!data.genderPreference || !data.state || !data.area || !data.callType)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                var query = {}

                if (data.genderPreference)
                    query.genderPreference = data.genderPreference
                if (data.state)
                    query.state = data.state
                if (data.area)
                    query.area = data.area
                if (data.callType)
                    query.callType = data.callType

                company.findByIdAndUpdate({ _id: data._id }, { $set: query }, { new: true }).then(updateResult => {
                    resolve(updateResult)
                    commonController.sendMail(data.email, token, result => {
                        if (result.status === 1)
                            console.log(result.message.response);

                        else
                            reject(CONSTANT.SOMETHINGWRONG)
                    })
                })
            }
        })


    }

    updateCompany(data, file) {
        return new Promise((resolve, reject) => {

            if (!data.userId)
                reject(CONSTANT.USERIDMISSING)
            else {

                company.findOne({ email: data.email }).then((userInfo) => {
                    if (userInfo && (userInfo._id.toString() !== data.userId)) {
                        return reject('Email is already exist.')
                    } else {
                        var query = {}

                        if (file && file.profilePic) {
                            file.profilePic.map(result => {
                                query.profilePic = '/' + result.filename
                            });
                        }
                        if (data.password && data.confirmPassword) {
                            if (data.password != data.confirmPassword) {
                                reject("Passwords don't match")
                            }
                            else
                                query.password = commonFunctions.hashPassword(data.password)
                        }
                        if (data.firstName)
                            query.firstName = data.firstName
                        if (data.lastName)
                            query.lastName = data.lastName

                        if (data.contact)
                            query.contact = data.contact

                        if (data.email)
                            query.email = data.email


                        company.findByIdAndUpdate({ _id: data.userId }, { $set: query }, { new: true }).
                            select().
                            then(update => {
                                if (update) {
                                    resolve({ user: update })
                                } else {
                                    reject(CONSTANT.NOTEXISTS)
                                }

                            }).catch(error => {
                                if (error.errors)
                                    return reject(commonController.handleValidation(error))
                                if (error)
                                    return reject(error)
                            })
                    }
                })

            }
        })
    }
    getCompanyProfile(id) {
        return new Promise((resolve, reject) => {

            if (!id) {
                reject(CONSTANT.NOTEXISTS)

            }
            else {
                company.findOne({ _id: id }).then(result => {
                    if (!result)
                        reject(CONSTANT.NOTEXISTS)
                    resolve(result)
                }).catch(err => {
                    console.log(err);

                })
            }
        })
    }

    getCampaigns(id) {
        return new Promise((resolve, reject) => {

            if (!id) {
                reject(CONSTANT.MISSINGCOMPANYID)

            }
            else {
                campaign.find({ companyId: id }).select('_id name brandPromoting dateForContentLive requirement').then(result => {
                    resolve(result)
                }).catch(err => {
                    console.log(err);

                })
            }
        })
    }

    createBooking(data) {
        return new Promise((resolve, reject) => {
            if (!data.vehicleId || !data.currentLat || !data.currentLong || !data.userId)
                reject(CONSTANT.MISSINGVEHCILE)
            else {
                const bookingRegister = this.createBookingRegistration(data)
                // console.log((data.endTime - data.startTime) / 86400000);


                bookingRegister.save().then((saveresult) => {
                    const pick = new pickModel({
                        bookingId: saveresult._id,
                        name: data.name,
                        contact: data.contact,
                        notes: data.notes,
                        specialRequest: data.specialRequest,
                        date: moment().valueOf()
                    })
                    pick.save({}).then(pickDetails => {

                    }).catch(err => {
                        console.log(err);

                    })
                    resolve(saveresult)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))

                    return reject(error)
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
            location: location,
            date: moment().valueOf()
        })
        return BookingRegistrationData;
    }

    getRequestList(data) {
        return new Promise((resolve, reject) => {
            if (!data.userId)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                var query = {}
                if (data.bookingId) {
                    query.userId = data.userId;
                    query._id = data.bookingId;
                    query.status = { $ne: "closed" }
                }
                else {
                    query.userId = data.userId;
                    query.status = { $ne: "closed" }
                }


                var requests = []
                var bookings = []
                bookingModel.find(query).populate({ path: 'serviceId', select: '_id ratings firstName lastName', populate: { path: "avgratings" } }).then(result => {

                    result.map(category => {
                        if (category.status == 'pending')
                            requests.push(category)
                        else
                            bookings.push(category)
                    })

                    resolve({ requests: requests, bookings: bookings })
                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })
            }
        })
    }
    //add Favorites
    addFavourites(data) {
        return new Promise((resolve, reject) => {
            if (!data.userId || !data.serviceId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                const fav = new favouritesModel({
                    userId: data.userId,
                    serviceId: data.serviceId
                })
                fav.save().then(save => {
                    resolve(save)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    if (error)
                        return reject(error)
                })

            }
        })
    }

    //Show Favourites List
    showFavourites(_id) {
        return new Promise((resolve, reject) => {
            if (!_id)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                favouritesModel.find({ userId: _id }).select('userId').populate({
                    path: 'serviceId', select: 'firstName lastName profilePic', populate: { path: 'avgratings' }
                }).then(result => {
                    resolve(result)
                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })
            }
        })
    }

    removeFavourites(_id) {
        return new Promise((resolve, reject) => {
            if (!_id)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                favouritesModel.deleteOne({ serviceId: _id }).then(result => {
                    resolve(result)
                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })
            }
        })
    }

    provideServiceRatings(data) {
        return new Promise((resolve, reject) => {
            if (!data.bookingId)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                bookingModel.findByIdAndUpdate({ _id: data.bookingId }, { $set: { serviceRatings: data.ratings } }).then(result => {
                    resolve(result)
                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })
            }
        })
    }


    changePassword(data) {
        return new Promise((resolve, reject) => {

            if (!data.oldPassword || !data.newPassword || !data.confirmPassword || !data._id)
                reject(CONSTANT.MISSINGPARAMS)
            if (data.confirmPassword != data.confirmPassword)
                reject(CONSTANT.NOTSAMEPASSWORDS)
            else {
                company.findOne({ _id: data._id }).then(oldPass => {
                    if (oldPass) {

                        if (commonFunctions.compareHash(data.oldPassword, oldPass.password)) {
                            company.findByIdAndUpdate({ _id: data._id }, { $set: { password: commonFunctions.hashPassword(data.newPassword) } }, { new: true }).then(update => {
                                resolve(update)
                            })
                        }
                        else {
                            reject(CONSTANT.WRONGOLDPASS)
                        }
                        resolve(oldPass)
                    }
                    else {
                        reject(CONSTANT.NOTEXISTS)
                    }

                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })
            }
        })
    }

    checkContactExists(data) {
        return new Promise((resolve, reject) => {
            if (!data.contact || !data.countryCode)
                reject(CONSTANT.MISSINGCONTACT)
            else {
                ownerModel.findOne({ countryCode: data.countryCode, contact: data.contact }).then(result => {
                    if (!result)
                        resolve(result)
                    else
                        reject(CONSTANT.NOCONTACTS)
                })
            }
        })

    }


    addIssue(data, file) {
        console.log(file);

        return new Promise((resolve, reject) => {
            if (!data.userId || !data.issue || !file || Object.keys(file).length === 0)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                file.issueimage.map(result => {
                    data.screenshot = '/' + result.filename

                });
                const issue = this.createUserService(data)
                issue.save({}).then(result => {
                    resolve(result)
                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })
            }
        })
    }

    createUserService(data) {
        let issueData = new userIssue({
            userId: data.userId,
            screenshot: data.screenshot,
            issue: data.issue
        })
        return issueData
    }

    getNearbyCars(data) {
        return new Promise((resolve, reject) => {
            if (!data.latitude || !data.longitude)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                ownerModel.find({
                    currentCoordinates: { $geoWithin: { $centerSphere: [[data.longitude, data.latitude], 5 / 6371] } }
                }).then(result => {
                    resolve(result)
                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })
            }
        })
    }

    applyCoupon(data) {
        return new Promise((resolve, reject) => {

            if (!data.couponCode || !data.totalAmount)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                let dataToSend = {};
                const currentDate = new Date();
                const currentUtcHours = currentDate.getUTCHours();
                const currentUtcMinutes = currentDate.getUTCMinutes();
                const query = {
                    couponCode: data.couponCode,
                    minAmountForDiscount: { $lte: data.totalAmount },
                    startDate: { $lte: currentDate },
                    endDate: { $gte: currentDate },
                    $and: [
                        {
                            $or: [
                                {
                                    applicableTimeStartHours: { $lt: currentUtcHours }
                                },
                                {
                                    applicableTimeStartHours: { $eq: currentUtcHours },
                                    applicableTimeStartMinutes: { $lte: currentUtcMinutes },
                                }
                            ]
                        },
                        {
                            $or: [
                                {
                                    applicableTimeEndHours: { $lt: currentUtcHours }
                                },
                                {
                                    applicableTimeEndHours: { $eq: currentUtcHours },
                                    applicableTimeEndMinutes: { $lte: currentUtcMinutes },
                                }
                            ]
                        }
                    ]
                }
                couponModel.findOne(query).then(coupon => {
                    if (coupon) {
                        dataToSend = couponId;
                        if (discountType == CONSTANT.DISCOUNT_TYPE.PERCENTAGE) {
                            dataToSend.discountedPrice = (data.totalAmount * coupon.discountAmount) / 100;
                            if (coupon.maxDiscount && dataToSend.discount > coupon.maxDiscount) {
                                dataToSend.discountedPrice = coupon.maxDiscount;
                            }
                        } else {
                            dataToSend.discountedPrice = coupon.discountAmount;
                        }
                        resolve(dataToSend);
                    }
                    else {
                        reject(CONSTANT.INVALIDCOUPON);
                    }

                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error));
                        if (error)
                            return reject(error);
                    })
            }
        })
    }

    applyPromo(data) {
        return new Promise((resolve, reject) => {

            if (!data.promoCode || !data.userId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                let dataToSend = {};
                const currentDate = new Date();
                const query = {
                    code: data.promoCode,
                    startTime: { $lte: currentDate },
                    endTime: { $gte: currentDate }
                }
                promoCodeModel.findOne(query).then(promo => {
                    if (promo) {
                        userPromoCode.findOne({ promoId: promo._id, userId: data.userId }).then(result => {
                            resolve(promo);
                        })
                    } else {
                        reject(CONSTANT.INVALIDPROMO);
                    }

                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error));
                        if (error)
                            return reject(error);
                    })
            }
        })
    }

    getBookingsList(data) {
        return new Promise((resolve, reject) => {
            if (!data.userId)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                var query = {}
                query.userId = data.userId;
                query.status = { $in: [CONSTANT.BOOKING_STATUS.PENDING, CONSTANT.BOOKING_STATUS.ACCEPTED, CONSTANT.BOOKING_STATUS.TRIP_IN_PROGRESS, CONSTANT.BOOKING_STATUS.PICKUP_IN_PROGRESS] }
                bookingModel.find(query).populate({ path: 'vehicleId', select: 'carName vehicleModel', populate: { path: 'carTypeId', select: 'type' } }).sort({ "_id": -1 }).skip(Number(data.page - 1) * Number(10)).limit(Number(10)).then(result => {
                    bookingModel.countDocuments(query).then(totalCount => {
                        return resolve({ result, totalCount })
                    })
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    if (error)
                        return reject(error)
                })
            }
        })
    }
    getPastBookingsList(data) {
        return new Promise((resolve, reject) => {
            if (!data.userId)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                var query = {}
                query.userId = data.userId;
                query.status = { $in: [CONSTANT.BOOKING_STATUS.COMPLETED, CONSTANT.BOOKING_STATUS.CLOSED, CONSTANT.BOOKING_STATUS.REJECTED] }

                bookingModel.find(query).populate({ path: 'vehicleId', select: 'carName vehicleModel', populate: { path: 'carTypeId', select: 'type' } }).sort({ "_id": -1 }).skip(Number(data.page - 1) * Number(10)).limit(Number(10)).then(result => {
                    bookingModel.countDocuments(query).then(totalCount => {
                        return resolve({ result, totalCount })
                    })
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    if (error)
                        return reject(error)
                })
            }
        })
    }

    // getBookingsById(data) {
    //     return new Promise((resolve, reject) => {
    //         if (!data.bookingId)
    //             reject(CONSTANT.MISSINGPARAMS)
    //         else {
    //             bookingModel.findById(data.bookingId).then(result => {
    //                 return resolve(result)
    //             }).catch(error => {
    //                 if (error.errors)
    //                     return reject(commonController.handleValidation(error))
    //                 if (error)
    //                     return reject(error)
    //             })
    //         }
    //     })
    // }

    displayUserInfo(userId) {
        return new Promise((resolve, reject) => {
            if (!userId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                company.findById(userId).then(result => {
                    return resolve(result)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    if (error)
                        return reject(error)
                })
            }
        })
    }

    getUserReferral(userId) {
        return new Promise((resolve, reject) => {
            if (!userId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                company.findById(userId, { userReferralCode: 1 }).then(result => {
                    return resolve(result)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    if (error)
                        return reject(error)
                })
            }
        })
    }
    helpCenter(data, file) {
        return new Promise((resolve, reject) => {
            if (!data.userId)
                reject(CONSTANT.MISSINGPARAMSORFILES)
            else {
                if (file.image) {
                    file.image.map(result => {
                        if (result)
                            data.image = '/' + result.filename
                    });
                }

                const help = new helpCenterModel({
                    image: data.image,
                    description: data.description,
                    userId: data.userId
                })
                help.save().then((saveresult) => {
                    resolve(saveresult)

                    // commonController.sendMailToAdminNotifyAdmin(saveresult.email, saveresult._id, token, 'user', result => {
                    //     if (result.status === 1)
                    //         console.log(result.message.response);
                    //     else
                    //         reject(result.message)
                    // })
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }
        })
    }

    rating(data) {
        return new Promise((resolve, reject) => {
            if (!data.userId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                const rating = new vehicleRatingModel({
                    vehicleId: data.vehicleId,
                    ownerId: data.ownerId,
                    userId: data.userId,
                    bookingId: data.bookingId,
                    rating: data.rating,
                    feedback: data.feedback
                })
                rating.save().then((saveresult) => {
                    resolve({ message: CONSTANT.RATING, result: saveresult })
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }
        })
    }
    addPromoToUser(data) {
        return new Promise((resolve, reject) => {
            if (!data.userId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                const promoCode = new userPromoCode({
                    promoId: data.promoId,
                    userId: data.userId
                })
                promoCode.save().then((saveresult) => {
                    resolve(saveresult)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }
        })
    }
    notification(data) {
        return new Promise((resolve, reject) => {
            if (!data.userId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                console.log(data);

                let query = {}
                if (data.status)
                    query.notificationStatus = data.status
                company.findByIdAndUpdate({ _id: data.userId }, { $set: query }, { new: true }).then(update => {
                    resolve(update)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))

                    return reject(error)
                })
            }
        })
    }
    getUserPromoCode(data) {
        return new Promise((resolve, reject) => {
            if (!data.userId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                userPromoCode.find({ userId: data.userId }).populate({ path: 'promoId' }).skip(Number(data.page - 1) * Number(10)).limit(Number(10)).then(result => {
                    userPromoCode.countDocuments({ userId: data.userId }).then(totalCount => {
                        return resolve({ result, totalCount })
                    })
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))

                    return reject(error)
                })
            }
        })
    }
    getBookingsById(bookingId) {
        return new Promise(async (resolve, reject) => {
            if (!bookingId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                var booking = await bookingModel.findById(bookingId);

                if (booking) {
                    var vehicleInfo = await vehicleModel.findById(booking.vehicleId);

                    const pipeline = [
                        // {
                        //     $geoNear: {
                        //         near: {
                        //             type: "Point", 
                        //             coordinates: vehicleInfo.location.coordinates
                        //         },
                        //         distanceMultiplier : 0.001,
                        //         distanceField: "distance",

                        //         spherical: true
                        //     }
                        // },
                        {
                            $match: {
                                _id: mongoose.Types.ObjectId(bookingId)
                            }
                        },
                        {
                            $lookup: {
                                from: 'vehicles',
                                localField: 'vehicleId',
                                foreignField: '_id',
                                as: 'vehicle'
                            }
                        },
                        {
                            $lookup: {
                                from: 'owners',
                                localField: 'ownerId',
                                foreignField: '_id',
                                as: 'owners'
                            }
                        },
                        {
                            $lookup:
                            {
                                from: "vehicleratings",
                                localField: "ownerId",
                                foreignField: "ownerId",
                                as: "ownerRatings"
                            }
                        },
                        {
                            $addFields: {
                                ownerAvgRating: { $avg: "$ownerRatings.rating" }
                            }
                        },
                        {
                            $unwind: {
                                path: "$vehicle"
                            }
                        },
                        {
                            $unwind: {
                                path: "$owners"
                            }
                        },

                        // {
                        //     $lookup:{
                        //         from: "vehicleimages",
                        //         localField: "vehicle._id",
                        //         foreignField: "vehcileId",
                        //         as: "vehicle.images"
                        //     }
                        // },
                        {
                            $lookup: {
                                from: "carcategories",
                                localField: "vehicle.vehicleTypeId",
                                foreignField: "_id",
                                as: "vehicle.vehicleTypeDetails"
                            }
                        },
                        {
                            $lookup: {
                                from: "vehicletypes",
                                localField: "vehicle.carTypeId",
                                foreignField: "_id",
                                as: "carType"
                            }
                        },
                        {
                            $unwind: "$carType"
                        },
                        {
                            $lookup: {
                                from: "pickdetails",
                                localField: "_id",
                                foreignField: "bookingId",
                                as: "pickdetails"
                            }
                        },
                        {
                            $addFields: {
                                notes: "$pickdetails.notes"
                            }
                        },
                        {
                            $addFields: {
                                'vehicle.cartype': '$carType.type'
                            }
                        },
                        {
                            $addFields: {
                                specialRequest: "$pickdetails.specialRequest"
                            }
                        },
                        {
                            $addFields: {
                                contact: "$pickdetails.contact"
                            }
                        },
                        {
                            $addFields: {
                                name: "$pickdetails.name"
                            }
                        },
                        {
                            $project: {
                                address: 1,
                                price: 1,
                                estimatedPrice: 1,
                                ownerId: 1,
                                userId: 1,
                                notes: 1,
                                // distance: 1,
                                status: 1,
                                currentCoordinates: 1,
                                specialRequest: 1,
                                date: 1,
                                contact: 1,
                                name: 1,
                                vehicle: 1,
                                owners: 1,
                                startTime: 1,
                                ownerAvgRating: 1,
                                name: { $cond: { if: { $size: "$name" }, then: { $arrayElemAt: ["$name", 0] }, else: '' } },
                                notes: { $cond: { if: { $size: "$notes" }, then: { $arrayElemAt: ["$notes", 0] }, else: '' } },
                                specialRequest: { $cond: { if: { $size: "$specialRequest" }, then: { $arrayElemAt: ["$specialRequest", 0] }, else: '' } },
                                contact: { $cond: { if: { $size: "$contact" }, then: { $arrayElemAt: ["$contact", 0] }, else: '' } }
                            }
                        }
                    ];
                    bookingModel.aggregate(pipeline).then(async result => {
                        if (result.length) {
                            vehicleRatingModel.findOne({ bookingId: bookingId, userId: booking.userId }).then(rating => {
                                let isRated = false;

                                if (rating)
                                    isRated = true

                                return resolve({ result: result[0], isRated: isRated })

                            })
                        } else {
                            return resolve({})
                        }
                    }).catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })

                } else {
                    reject('Booking not found')
                }
            }
        })
    }

    getBookingsByReferral(data) {
        return new Promise((resolve, reject) => {
            if (!data.referralCode)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                company.findOne({ userReferralCode: data.referralCode }).then(user => {
                    resolve(user)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))

                    return reject(error)
                })
            }
        })
    }

    getReview(data) {
        return new Promise((resolve, reject) => {
            if (!data.ownerId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                vehicleRatingModel.find({ ownerId: data.ownerId }).populate({ path: 'ownerId', select: 'profilePic firstName lastName' }).skip(Number(data.page - 1) * Number(10)).limit(Number(10)).then(result => {
                    vehicleRatingModel.countDocuments({ ownerId: data.ownerId }).then(totalCount => {
                        return resolve({ result, totalCount })
                    })
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))

                    return reject(error)
                })
            }
        })
    }
    // cancle booking api
    cancleBooking(data) {
        return new Promise((resolve, reject) => {
            if (!data.bookingId || !data.status)
                reject(CONSTANT.MISSINGPARAMS)
            console.log(data);

            bookingModel.findByIdAndUpdate({ _id: data.bookingId }, { $set: { status: data.status, reason: data.reason } }, { new: true }).then(update => {
                if (update)
                    resolve(update)
                else
                    reject(CONSTANT.SOMETHINGWRONG)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))

                return reject(error)
            })
        })
    }

    notify() {
        return new Promise((resolve, reject) => {
            let message = {
                to: '',
                data: {
                    type: "booking_ended",
                    title: "Your booking has ended",
                    body: "Your booking has ended.",
                    bookingInfo: 'test'
                }
            }
            commonController.notification(message);
        })
    }
}

module.exports = new userModule();