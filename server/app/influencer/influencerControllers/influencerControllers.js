'use strict'
const influnce = require('../../../models/influencer')
const CONSTANT = require('../../../constant')
const commonFunctions = require('../../common/controllers/commonFunctions')
const commonController = require('../../common/controllers/commonController')
const vehicleSchema = require('../../../models/vehicleImageModel')
const ownerVerfiySchema = require('../../../models/ownerImagesModel')
const notificationModel = require('../../../models/notificationModel')
const vehicleRatingModel = require('../../../models/vehicleRatingModel')
const bookingModel = require('../../../models/bookingModel')
const rn = require('random-number')
const userModel = require('../../../models/company')
const carCategoryModel = require('../../../models/carCategoryModel')
const vehicleModel = require('../../../models/vehicleModel')
const Jwt = require('jsonwebtoken');
const moment = require('moment');
const privateKey = 'myprivatekey'
const mongoose = require('mongoose');

class owner {

    signUp(data) {


        return new Promise((resolve, reject) => {

            if (!data.email) {
                reject(CONSTANT.EMAILMISS)
            }
            else {
                // check if already exists
                let checkCriteria = {
                    email: data.email,
                    isDeleted: false
                };
                influnce.count(checkCriteria).then(async result => {
                    if (result) {
                        return reject(CONSTANT.UNIQUEEMAILANDUSERNAME)
                    } else {
                        if (data.password)
                            data.password = commonFunctions.hashPassword(data.password)
                        const user = new influnce(data)
                        const token = await Jwt.sign({ email: data.email, id: user._id, }, privateKey, { expiresIn: 15 * 60 })
                        user.set('token', token, { strict: false })
                        user.save().then((saveresult) => {
                            resolve({ success: CONSTANT.TRUESTATUS, result: saveresult })

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


    sociallogin(body, file) {
        return new Promise((resolve, reject) => {
            let query = { $or: [], };
            let forUpdate = {}
            if (body.email) {
                query.$or.push({ email: body.email })
                // forUpdate.email = body.email
            }
            if (body.fb_id) {
                query.$or.push({ fb_id: body.fb_id });
                forUpdate.fb_id = body.fb_id
            }
            if (body.google_id) {
                query.$or.push({ google_id: body.google_id })
                forUpdate.google_id = body.google_id
            }
            // if (body.phone && body.password) {
            //   query.phone = Number(body.phone);
            // }
            if (Object.keys(query).length == 0) {
                return reject("please provide fb_id or google_id");
            }

            ownerModel.findOne(query).sort("-email").then(
                async result => {

                    if (result) {
                        return resolve(await ownerModel.findByIdAndUpdate(result._id, forUpdate, { new: true }));
                    }

                    body.fb_id = body.fb_id;
                    body.google_id = body.google_id;
                    body.firstName = body.firstname;
                    body.lastName = body.lastname;
                    body.isVerified = true;
                    body.profilePic = file ? "/" + file.filename : "";
                    let user = this.createOwner(body)
                    user.save().then((result) => {
                        resolve(result);
                    }).catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        return reject(error)
                    });
                },
                err => {
                    reject(err);
                }
            );
        });
    }
    createOwner(data) {
        if (data.password)
            data.password = commonFunctions.hashPassword(data.password)
        const user = new ownerModel({
            email: data.email,
            countryCode: data.countryCode,
            firstName: data.firstName,
            lastName: data.lastName,
            password: data.password,
            isVerified: true,
            contact: data.contact,
            token: data.token,
            profilePic: data.profilePic,
            deviceType: data.deviceType,
            deviceId: data.deviceId,
            date: moment().valueOf()
        })
        return user
    }
    verify(query) {
        return new Promise((resolve, reject) => {
            if (!query.user)
                reject(CONSTANT.MISSINGPARAMS)

            else {
                ownerModel.findById(query.user).then(result => {
                    if (result.token == query.token) {
                        ownerModel.findByIdAndUpdate(query.user, { $set: { isVerified: true, } }, { new: true }).then(result => {
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


    verifyEmail(data) {
        return new Promise((resolve, reject) => {
            if (!data.ownerId)
                reject(CONSTANT.MISSINGPARAMS)

            else {


                ownerModel.findOne({ _id: data.ownerId }).then(result => {

                    if (result) {
                        if (result.isVerified) {
                            resolve(result)
                        }
                        else
                            reject(result)
                    }
                    else
                        reject(CONSTANT.NOTEXISTS)


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
                ownerModel.findOneAndUpdate({ email: data.email }, { $set: { token: token } }, { new: true }).then(updateResult => {
                    if (updateResult == null)
                        reject(CONSTANT.NOTREGISTERED)
                    resolve(updateResult)
                    commonController.sendMailandVerify(data.email, updateResult._id, token, 'owner', result => {
                        if (result.status === 1)
                            console.log(result.message.response);

                        else
                            reject(CONSTANT.SOMETHINGWRONG)
                    })
                })
            }
        })


    }

    //Add Vehicle
    addVehicle(data, files) {
        return new Promise((resolve, reject) => {

            if (!data.ownerId)
                reject(CONSTANT.MISSINGPARAMS)
            var currentCoordinates = []
            var location = {}
            if (data.currentLat && data.currentLong) {
                currentCoordinates.push(Number(data.currentLong))
                currentCoordinates.push(Number(data.currentLat))
                location.type = "Point";
                location.coordinates = currentCoordinates
            }

            // if (data.events) {
            //     data.events = data.events.split(',');
            // }

            console.log(data);
            const vehicle = new vehicleModel({
                ownerId: data.ownerId,
                aboutCar: data.aboutCar,
                vehicleTypeId: data.vehicleTypeId,
                carTypeId: data.carTypeId,
                vehicleModel: data.vehicleModel,
                color: data.color,
                chassis: data.chassis,
                condition: data.condition,
                engine: data.engine,
                makeOfCar: data.makeOfCar,
                steering: data.steering,
                passenger: data.passenger,
                transmission: data.transmission,
                speed: data.speed,
                place: data.place,
                carName: data.carName,
                hourlyRate: data.hourlyRate,
                dayRate: data.dayRate,
                currentLat: Number(data.currentLat),
                currentLong: Number(data.currentLong),
                location: location,
                events: JSON.parse(data.events),

                date: moment().valueOf()
            })
            vehicle.save().then(vehicle => {
                if (files && files.vehiclePics) {
                    files.vehiclePics.map(result => {

                        const vehiclePics = new vehicleSchema({
                            path: '/' + result.filename,
                            vehcileId: vehicle._id,
                            type: result.mimetype,
                            date: moment().valueOf()
                        })
                        vehiclePics.save();
                    })
                }
                resolve(vehicle)

            }).catch(err => {
                console.log(err);

            })
        })
    }
    // Delete vehicle  
    deleteVehicle(id) {
        return new Promise((resolve, reject) => {
            if (!id)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                vehicleModel.deleteOne({ _id: id }).then(del => {
                    resolve(del)
                }).catch(error => {
                    if (error)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }
        })
    }

    // Delete vehicle media  
    deleteVehicleImage(id) {
        return new Promise((resolve, reject) => {
            if (!id)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                vehicleSchema.deleteOne({ _id: id }).then(del => {
                    resolve(del)
                }).catch(error => {
                    if (error)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }
        })
    }

    // display Vehicles list to owner 
    displayVehicles(_id, page) {
        return new Promise((resolve, reject) => {

            if (!_id)
                reject(CONSTANT.OWNERIDMISSING)
            const pipeline = [
                {
                    $match: {
                        ownerId: mongoose.Types.ObjectId(_id)
                    }
                },
                {
                    $lookup: {
                        from: 'vehicleimages',
                        localField: '_id',
                        foreignField: 'vehcileId',
                        as: 'vehicleImages'
                    }
                },
                {
                    $lookup: {
                        from: 'carcategories',
                        localField: 'vehicleTypeId',
                        foreignField: '_id',
                        as: 'vehicleTypeId'
                    }
                },
                {
                    $lookup: {
                        from: 'vehicletypes',
                        localField: 'carTypeId',
                        foreignField: '_id',
                        as: 'vehicleType'
                    }
                },
                {
                    $unwind: '$vehicleTypeId'
                },
                {
                    $unwind: '$vehicleType'
                },
                { $sort: { _id: -1 } },
                {
                    $project: {
                        vehicleModel: 1,
                        distance: 1,
                        safe: 1,
                        vehicleType: '$vehicleTypeId.carType',
                        vehicleTypeId: '$vehicleTypeId._id',
                        carType: '$vehicleType.type',
                        carName: 1,
                        vehicleImages: 1,
                        color: 1,
                        hourlyRate: 1
                    }
                }
            ];
            console.log('.........pipeline', pipeline);
            vehicleModel.aggregate(pipeline).skip(Number(page - 1) * 10)
                .limit(10).then(result => {
                    vehicleModel.aggregate(pipeline).then(items => {
                        if (!result) {
                            reject(CONSTANT.NOTREGISTERED)
                        }
                        else {

                            resolve({ result: result, count: items.length })
                        }
                    })
                }).catch(err => {
                    if (err.errors)
                        return reject(commonController.handleValidation(error))
                })


        })
    }

    // Display  particular Vehicle to Owner
    displayParticularVehicle(_id) {
        return new Promise((resolve, reject) => {

            if (!_id)
                reject(CONSTANT.OWNERIDMISSING)
            const pipeline = [
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(_id)
                    }
                },
                {
                    $lookup: {
                        from: 'vehicleimages',
                        localField: '_id',
                        foreignField: 'vehcileId',
                        as: 'vehicleImages'
                    }
                },
                {
                    $lookup: {
                        from: 'carcategories',
                        localField: 'vehicleTypeId',
                        foreignField: '_id',
                        as: 'vehicleTypeId'
                    }
                },
                {
                    $lookup: {
                        from: 'vehicletypes',
                        localField: 'carTypeId',
                        foreignField: '_id',
                        as: 'carType'
                    }
                },
                {
                    $unwind: '$vehicleTypeId'
                },
                {
                    $unwind: '$carType'
                },
                {
                    $project: {
                        vehicleType: '$vehicleTypeId.carType',
                        vehicleName: '$vehicleTypeId.carName',
                        vehicleTypeId: '$vehicleTypeId._id',
                        carType: 1,
                        vehicleModel: 1,
                        vehicleImages: 1,
                        distance: 1,
                        color: 1,
                        chassis: 1,
                        aboutCar: 1,
                        engine: 1,
                        ownerId: 1,
                        condition: 1,
                        makeOfCar: 1,
                        hourlyRate: 1,
                        dayRate: 1,
                        carName: 1,
                        date: 1,
                        currentLat: 1,
                        place: 1,
                        currentLong: 1,
                        events: 1,
                        location: 1,
                        speed: 1,
                        steering: 1,
                        passenger: 1,
                        transmission: 1

                    }
                }
            ];

            vehicleModel.aggregate(pipeline).then(result => {
                if (!result) {
                    reject(CONSTANT.NOTREGISTERED)
                }
                else {
                    if (result && result.length) {
                        resolve(result[0])
                    } else {
                        resolve({})
                    }
                }

            }).catch(err => {
                if (err.errors)
                    return reject(commonController.handleValidation(error))
            })


        })
    }

    //availability of owner
    availability(body) {
        return new Promise((resolve, reject) => {
            if (!body.status)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                ownerModel.findByIdAndUpdate(body.ownerId, { status: Number(body.status) }, { new: true }).then(
                    (result) => {
                        resolve(result)
                    }
                )
            }

        })
    }
    // Complete owner Profile
    completeProfile(data, file) {
        return new Promise((resolve, reject) => {
            if (!data.ownerId || !file) {
                reject(CONSTANT.MISSINGPARAMS)
            }
            else {
                if (file) {
                    let imagesPics = []
                    file.verificationPhotos.map(result => {
                        imagesPics.push({
                            path: '/' + result.filename,
                            ownerId: data.ownerId,
                            date: moment().valueOf()
                        })
                    })
                    ownerModel.findByIdAndUpdate(data.ownerId, { documentUploaded: true }, { new: true }).then(
                        (result) => {
                            console.log(result)
                        })
                    ownerVerfiySchema.find({ ownerId: data.ownerId }).then(result => {
                        if (result.length < 4) {
                            ownerVerfiySchema.insertMany(imagesPics).then(image => {
                                resolve(image)
                            }).catch(error => {
                                if (error.errors)
                                    return reject(commonController.handleValidation(error))

                                return reject(error)
                            })
                        } else {
                            reject(CONSTANT.YOUCANNOTUPLOADMORETHENFOUR)
                        }

                    });

                }

            }
        })
    }



    updateVehicle(data, files) {
        return new Promise((resolve, reject) => {
            if (!data.vehicleId) {
                reject(CONSTANT.MISSINGPARAMSORFILES)
            }
            else {
                var vehiclePics = []
                if (files && files.vehiclePics) {
                    files.vehiclePics.map(result => {
                        vehiclePics.push('/' + result.filename);
                    });
                }

                let query = {}

                if (data.aboutCar)
                    query.aboutCar = data.aboutCar
                if (data.place)
                    query.place = data.place
                if (data.speed)
                    query.speed = data.speed
                if (data.steering)
                    query.steering = data.steering
                if (data.transmission)
                    query.transmission = data.transmission
                if (data.vehicleTypeId)
                    query.vehicleTypeId = data.vehicleTypeId
                if (data.carTypeId)
                    query.carTypeId = data.carTypeId
                if (data.vehicleModel)
                    query.vehicleModel = data.vehicleModel
                if (data.color)
                    query.color = data.color
                if (data.chassis)
                    query.chassis = data.chassis
                if (data.engine)
                    query.engine = data.engine
                if (data.condition)
                    query.condition = data.condition
                if (data.carName)
                    query.carName = data.carName
                if (data.events) {
                    query.events = JSON.parse(data.events)
                }
                if (data.makeOfCar)
                    query.makeOfCar = data.makeOfCar
                if (data.currentLat && data.currentLong) {
                    let currentCoordinates = []
                    let location = {};
                    currentCoordinates.push(Number(data.currentLong))
                    currentCoordinates.push(Number(data.currentLat))
                    location.type = "Point";
                    location.coordinates = currentCoordinates
                    data.location = location
                }
                if (data.hourlyRate)
                    query.hourlyRate = data.hourlyRate
                if (data.dayRate)
                    query.dayRate = data.dayRate
                if (data.currentLat)
                    data.currentLat = Number(data.currentLat)
                if (data.currentLong)
                    data.currentLong = Number(data.currentLong),

                        vehicleModel.findOneAndUpdate({ _id: data.vehicleId }, { $set: query }, { new: true }).then(update => {
                            if (files && files.vehiclePics) {
                                files.vehiclePics.map(result => {
                                    const vehiclePics = new vehicleSchema({
                                        path: '/' + result.filename,
                                        vehcileId: update._id,
                                        date: moment().valueOf()
                                    })
                                    vehiclePics.save();
                                })
                            }
                            resolve(update)
                        }).catch(error => {
                            if (error.errors)
                                return reject(commonController.handleValidation(error))

                            return reject(error)
                        })
            }
        })
    }

    logout(ownerId) {
        return new Promise((resolve, reject) => {
            ownerModel.findOneAndUpdate({ _id: ownerId }, { $set: { deviceId: '' } }, { new: true }).then(result => {
                console.log(result)
                resolve(result)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            });
        })
    }

    // Owner Login
    login(data) {
        return new Promise(async (resolve, reject) => {
            if (!data.email || !data.password) {
                reject(CONSTANT.MISSINGPARAMS)
            }

            else {

                const user = await influnce.findOne({ email: data.email })
                if (user) {


                    const token = await Jwt.sign({ email: data.email, id: user._id, }, privateKey, { expiresIn: 15 * 60 })

                    console.log(token);
                    influnce.findOneAndUpdate({ email: data.email },
                        { $set: { token: token } },

                        { new: true }).select('token password email firstName lastName')

                        .then(updateResult => {
                            console.log(updateResult);

                            // console.log(commonFunctions.compareHash(data.password, updateResult.password));

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



    forgotPassword(data) {
        return new Promise((resolve, reject) => {
            console.log(data);

            if (!data.email)
                reject('Kindly Provide Email')
            ownerModel.findOne({ email: data.email }).then(result => {
                if (!result) {
                    reject(CONSTANT.NOTREGISTERED)
                }
                else {
                    const token = rn({
                        min: 1001,
                        max: 9999,
                        integer: true
                    })
                    ownerModel.findOneAndUpdate({ email: data.email }, { $set: { token: token } }).then(updateToken => {
                        resolve(CONSTANT.VERIFYMAIL)
                    })
                    commonController.sendMail(data.email, result._id, token, 'owner', (result) => {

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
            ownerModel.findById(query.user).then(
                result => {

                    if (result && result.token == query.token) {

                        ownerModel
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
    addPhotos(data, files) {
        return new Promise((resolve, reject) => {
            var photos = []
            if ((!data._id && !files) || Object.keys(files).length === 0)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                files.photos.map(result => {
                    photos.push('/' + result.filename);

                });

                serviceModel.updateOne({ _id: data._id }, { $addToSet: { photos: photos } }).then(photos => {
                    if (photos.nModified === 1)
                        resolve(CONSTANT.ADDSUCCESS)
                    else
                        reject(CONSTANT.ADDFAIL)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))

                    return reject(error)
                })
            }
        })
    }

    addVerificationPhotos(data, files) {
        return new Promise((resolve, reject) => {

            var verificationPhotos = []
            if ((!data._id && !files) || Object.keys(files).length === 0)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                files.verificationPhotos.map(result => {
                    verificationPhotos.push('/' + result.filename);

                });
                serviceModel.updateOne({ _id: data._id }, { $addToSet: { verificationPhotos: verificationPhotos } }).then(photos => {
                    if (photos.nModified === 1)
                        resolve(CONSTANT.ADDSUCCESS)
                    else
                        reject(CONSTANT.ADDFAIL)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))

                    return reject(error)
                })
            }
        })
    }

    acceptDenyRequest(data) {
        return new Promise((resolve, reject) => {
            if (!data.bookingId || !data.status)
                reject(CONSTANT.MISSINGPARAMS)
            console.log(data);

            bookingModel.findByIdAndUpdate({ _id: data.bookingId }, { $set: { status: data.status } }, { new: true }).then(update => {
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

    getRequestList(data) {
        return new Promise(async (resolve, reject) => {
            if (!data.serviceId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                var query = {}
                if (data.bookingId) {
                    query.serviceId = data.serviceId;
                    query._id = data.bookingId;
                    query.status = { $ne: CONSTANT.BOOKING_STATUS.CLOSED }
                }
                else {
                    query.serviceId = data.serviceId;
                    query.status = { $ne: CONSTANT.BOOKING_STATUS.CLOSED }
                }
                console.log(query);

                var requests = []
                var bookings = []
                var userId = []
                bookingModel.find(query).populate({ path: 'userId', select: '_id ratings nickName', populate: { path: 'allRatings ', select: 'userRatings' } }).then(result => {

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

    changePassword(data) {
        return new Promise((resolve, reject) => {

            if (!data.oldPassword || !data.newPassword || !data.confirmPassword || !data._id)
                reject(CONSTANT.MISSINGPARAMS)
            if (data.confirmPassword != data.confirmPassword)
                reject(CONSTANT.NOTSAMEPASSWORDS)
            else {
                ownerModel.findOne({ _id: data._id }).then(oldPass => {

                    if (commonFunctions.compareHash(data.oldPassword, oldPass.password)) {
                        ownerModel.findByIdAndUpdate({ _id: data._id }, { $set: { password: commonFunctions.hashPassword(data.newPassword) } }, { new: true }).then(update => {
                            resolve(update)
                        })
                    }
                    else {
                        reject(CONSTANT.WRONGOLDPASS)
                    }
                    resolve(oldPass)
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

    updateOwner(data, file) {
        return new Promise((resolve, reject) => {
            console.log(data);

            if (!data.ownerId)
                reject(CONSTANT.OWNERIDMISSING)
            else {
                var query = {}
                if (file && file.profilePic) {
                    file.profilePic.map(result => {
                        query.profilePic = '/' + result.filename
                    });
                }


                if (data.firstName)
                    query.firstName = data.firstName
                if (data.lastName)
                    query.lastName = data.lastName
                if (data.countryCode)
                    query.countryCode = data.countryCode
                if (data.contact)
                    query.contact = data.contact



                ownerModel.findByIdAndUpdate({ _id: data.ownerId }, { $set: query }, { new: true }).then(update => {
                    resolve(update)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    if (error)
                        return reject(error)
                })

            }
        })
    }
    setStatus(data) {
        return new Promise((resolve, reject) => {
            console.log(data);

            if (!data._id || !data.status)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                serviceModel.findByIdAndUpdate({ _id: data._id }, { $set: { status: parseInt(data.status) } }, { new: true }).then(updateStatus => {
                    resolve(updateStatus)
                }).catch(error => {
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
                        resolve({ status: CONSTANT.TRUE, message: 'Phone Number not associated with any account' })
                    else {
                        reject({ status: CONSTANT.TRUE, message: 'User Exists', data: result })
                    }
                })
            }
        })

    }


    displayVehicleCategories() {
        return new Promise((resolve, reject) => {
            carCategoryModel.find({}, {}, { lean: true }).then(result => {
                resolve(result);
            })

        })

    }


    provideUserRatings(data) {
        return new Promise((resolve, reject) => {
            if (!data.bookingId)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                bookingModel.findByIdAndUpdate({ _id: data.bookingId }, { $set: { userRatings: data.ratings, status: "closed" } }).then(result => {
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

    ownerRatings(data) {
        return new Promise((resolve, reject) => {
            if (!data.ownerId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                vehicleRatingModel.find({ ownerId: data.ownerId }).populate({ path: 'userId', select: 'profilePic firstName lastName' }).skip(Number(data.page - 1) * Number(10)).limit(Number(10)).then(result => {
                    vehicleRatingModel.countDocuments({ ownerId: data.ownerId }).then(totalCount => {
                        const pipeline = [
                            {
                                $match: {
                                    ownerId: mongoose.Types.ObjectId(data.ownerId)
                                },
                            },
                            {
                                $group: { _id: null, average: { $avg: "$rating" } }
                            }
                        ];

                        vehicleRatingModel.aggregate(pipeline).then(async rating => {
                            let averageRate = 0

                            if (rating && rating.length) {
                                averageRate = rating[0].average
                            }

                            let totalBooking = await bookingModel.find({ ownerId: data.ownerId });
                            totalBooking = totalBooking.length;

                            let totalCancelBooking = await bookingModel.find({ ownerId: data.ownerId, status: CONSTANT.BOOKING_STATUS.CANCEL });
                            totalCancelBooking = totalCancelBooking.length;

                            let totalCompleteBooking = await bookingModel.find({ ownerId: data.ownerId, status: CONSTANT.BOOKING_STATUS.COMPLETED });
                            totalCompleteBooking = totalCompleteBooking.length;

                            let cancleBookingPer = (totalCancelBooking * 100) / totalBooking;
                            let completeBookingPer = (totalCompleteBooking * 100) / totalBooking;

                            return resolve({ result, totalCount, averageRate, cancleBookingPer, completeBookingPer })

                        })
                    })
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))

                    return reject(error)
                })
            }
        })
    }

    addIssue(data, file) {
        console.log(file);

        return new Promise((resolve, reject) => {
            if (!data.serviceId || !data.issue || !file || Object.keys(file).length === 0)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                file.issueimage.map(result => {
                    data.screenshot = '/' + result.filename

                });
                const issue = this.createIssueService(data)
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

    //get document List of owner
    getDocument(_id) {
        return new Promise((resolve, reject) => {
            if (!_id)
                reject(CONSTANT.OWNERIDMISSING)
            ownerVerfiySchema.find({ ownerId: _id }).then(result => {
                console.log(_id);
                return resolve(result)
            }).catch(err => {
                if (err.errors)
                    return reject(commonController.handleValidation(error))
            })
        })
    }

    createIssueService(data) {
        let issueData = new serviceIssue({
            serviceId: data.serviceId,
            screenshot: data.screenshot,
            issue: data.issue
        })
        return issueData
    }


    //get Notification List of owner
    getNotification(data) {
        return new Promise((resolve, reject) => {
            if (!data.ownerId)
                reject(CONSTANT.OWNERIDMISSING)
            notificationModel.find({ assignedId: data.ownerId }).skip(Number(data.page - 1) * Number(10)).limit(Number(10)).sort({ "_id": -1 }).then(result => {
                notificationModel.countDocuments({ assignedId: data.ownerId }).then(totalCount => {
                    return resolve({ result, totalCount })
                })
            }).catch(err => {
                if (err.errors)
                    return reject(commonController.handleValidation(error))
            })
        })
    }

    //get bookin List of owner
    getOwnerBooking(data) {
        return new Promise(async (resolve, reject) => {

            if (!data.ownerId)
                reject(CONSTANT.OWNERIDMISSING)
            bookingModel.find({ ownerId: data.ownerId, status: { $in: [CONSTANT.BOOKING_STATUS.PENDING, CONSTANT.BOOKING_STATUS.ACCEPTED, CONSTANT.BOOKING_STATUS.PICKUP_IN_PROGRESS, CONSTANT.BOOKING_STATUS.TRIP_IN_PROGRESS] } }).populate({ path: 'vehicleId', select: 'carName vehicleModel', populate: [{ path: 'carTypeId', select: 'type' }, { path: 'vehicleTypeId', select: 'carType' }] }).sort({ "_id": -1 }).skip(Number(data.page - 1) * Number(10)).limit(Number(10)).then(result => {
                bookingModel.countDocuments({ ownerId: data.ownerId, status: { $in: [CONSTANT.BOOKING_STATUS.PENDING, CONSTANT.BOOKING_STATUS.ACCEPTED, CONSTANT.BOOKING_STATUS.PICKUP_IN_PROGRESS, CONSTANT.BOOKING_STATUS.TRIP_IN_PROGRESS] } }).then(totalCount => {
                    return resolve({ result, totalCount })
                })
            }).catch(err => {
                if (err.errors)
                    return reject(commonController.handleValidation(error))
            })
        })
    }

    //get accepted booking List of owner
    getOwnerPastBooking(data) {
        return new Promise((resolve, reject) => {
            if (!data.ownerId)
                reject(CONSTANT.OWNERIDMISSING)
            bookingModel.find({ ownerId: data.ownerId, status: { $in: [CONSTANT.BOOKING_STATUS.REJECTED, CONSTANT.BOOKING_STATUS.COMPLETED, CONSTANT.BOOKING_STATUS.CLOSED] } }).populate({ path: 'vehicleId', select: 'carName vehicleModel', populate: [{ path: 'carTypeId', select: 'type' }, { path: 'vehicleTypeId', select: 'carType' }] }).sort({ "_id": -1 }).skip(Number(data.page - 1) * Number(10)).limit(Number(10)).then(result => {
                bookingModel.countDocuments({ ownerId: data.ownerId, status: { $in: [CONSTANT.BOOKING_STATUS.REJECTED, CONSTANT.BOOKING_STATUS.COMPLETED, CONSTANT.BOOKING_STATUS.CLOSED] } }).then(totalCount => {
                    return resolve({ result, totalCount })
                })
            }).catch(err => {
                if (err.errors)
                    return reject(commonController.handleValidation(error))
            })
        })
    }

    getBookingsById(bookingId) {

        return new Promise(async (resolve, reject) => {
            if (!bookingId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                var booking = await bookingModel.findById(bookingId);
                var vehicleInfo = await vehicleModel.findById(booking.vehicleId);

                const pipeline = [
                    // {
                    //     $geoNear: {
                    //         near: {
                    //             type: "Point", 
                    //             coordinates: vehicleInfo.location.coordinates
                    //         },
                    //         spherical: true,
                    //         distanceMultiplier : 0.001,
                    //         distanceField: "distance"
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
                            as: "vehicle.carType"
                        }
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
                        $lookup:
                        {
                            from: "vehicleratings",
                            localField: "ownerId",
                            foreignField: "ownerId",
                            as: "ownerRatings"
                        }
                    },
                    {
                        $unwind: {
                            path: "$vehicle.vehicleTypeDetails"
                        }
                    },
                    {
                        $unwind: {
                            path: "$vehicle.carType"
                        }
                    },
                    {
                        $addFields: {
                            ownerAvgRating: { $avg: "$ownerRatings.rating" }
                        }
                    },
                    {
                        $addFields: {
                            notes: "$pickdetails.notes"
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
                            createdAt: 1,
                            updatedAt: 1,
                            vehicle: 1,
                            ownerAvgRating: 1,
                            owners: 1,
                            startTime: 1,
                            name: { $cond: { if: { $size: "$name" }, then: { $arrayElemAt: ["$name", 0] }, else: '' } },
                            notes: { $cond: { if: { $size: "$notes" }, then: { $arrayElemAt: ["$notes", 0] }, else: '' } },
                            specialRequest: { $cond: { if: { $size: "$specialRequest" }, then: { $arrayElemAt: ["$specialRequest", 0] }, else: '' } },
                            contact: { $cond: { if: { $size: "$contact" }, then: { $arrayElemAt: ["$contact", 0] }, else: '' } }
                        }
                    }
                ];
                bookingModel.aggregate(pipeline).then(result => {
                    if (result.length) {
                        return resolve(result[0])
                    } else {
                        return resolve({})
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

    bookingEarning(data) {
        return new Promise(async (resolve, reject) => {
            console.log(data)
            if (!data.ownerId)
                reject(CONSTANT.OWNERIDMISSING)

            var start = moment().startOf('day'); // set to 12:00 am today
            var end = moment().endOf('day');

            if (data.type == "month") {
                start = moment().startOf('month');
                end = moment().endOf('month');
            }

            if (data.type == 'week') {
                start = moment().startOf('week');
                end = moment().endOf('week');
            }

            let query = {
                ownerId: data.ownerId,
                status: CONSTANT.BOOKING_STATUS.COMPLETED,
                createdAt: {
                    $gte: start,
                    $lt: end
                }
            }

            bookingModel.find(query, {
                isPaid: 1,
                price: 1,
                tax: 1,
                commission: 1,
                security: 1,
                estimatedPrice: 1,
                address: 1
            }).populate({ path: 'vehicleId', select: { hourlyRate: 1, dayRate: 1, carName: 1 }, populate: [{ path: 'vehicleTypeId', select: { carType: 1 } }, { path: 'carTypeId', select: { type: 1 } }] }).skip(Number(data.page - 1) * Number(10)).limit(Number(10)).sort({ "_id": -1 }).then(result => {
                bookingModel.countDocuments(query).then(totalCount => {
                    return resolve({ result, totalCount })
                })
            }).catch(err => {
                if (err.errors)
                    return reject(commonController.handleValidation(error))
            })
        })
    }

}
module.exports = new owner();