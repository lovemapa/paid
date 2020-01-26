'use strict'
const adminModel = require('../../../models/adminModel')
const carCategory = require('../../../models/carCategoryModel')
const bookingModel = require('../../../models/bookingModel')
const ownerModel = require('../../../models/ownerModel')
const vehicleModel = require('../../../models/vehicleModel')
const vehicleType = require('../../../models/vehicleType')
const promoCodeModel = require('../../../models/promoCodeModel')
const securityModel = require('../../../models/securityModel')
const eventModel = require('../../../models/eventModel')
const taxModel = require('../../../models/taxModel')
const userModel = require('../../../models/company')
const couponModel = require('../../../models/discountCouponModel')
const CONSTANT = require('../../../constant')
const commonFunctions = require('../../common/controllers/commonFunctions')
const commonController = require('../../common/controllers/commonController')
const vehicleSchema = require('../../../models/vehicleImageModel')
const moment = require('moment')
const mongoose = require('mongoose')
const { Parser } = require('json2csv');

const fs = require('fs')


class admin {

    signUp(data) {

        return new Promise((resolve, reject) => {

            if (!data.email || !data.password) {
                reject(CONSTANT.EMAILPASSWORDPARAMS)
            }
            else {
                const adminRegster = this.createAdmin(data)
                adminRegster.save().then((saveresult) => {
                    resolve(saveresult)

                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))

                    return reject(error)
                })
            }
        })
    }
    // --------Create Admin Registration Model------------
    createAdmin(data) {

        data.password = commonFunctions.hashPassword(data.password)
        let adminRegistrationData = new adminModel({
            email: data.email,
            password: data.password,
            date: moment().valueOf()
        })
        return adminRegistrationData;
    }

    //===========================================================================================
    // admin Login

    login(data) {
        return new Promise((resolve, reject) => {
            if (!data.password || !data.email) {
                reject(CONSTANT.MISSINGPARAMS)
            }
            else {
                adminModel.findOne({ email: data.email }).then(result => {
                    if (!result) {
                        reject(CONSTANT.NOTREGISTERED)
                    }
                    else {
                        if (commonFunctions.compareHash(data.password, result.password)) {
                            resolve(result)
                        }
                        else
                            reject(CONSTANT.WRONGCREDENTIALS)
                    }
                })
            }

        })
    }

    displayOwner(ownerId) {
        return new Promise((resolve, reject) => {
            ownerModel.findOne({ _id: ownerId }).populate("ownerVerifyImages").then(result => {
                resolve(result)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            })
        })
    }

    displayUser(userId) {
        return new Promise((resolve, reject) => {
            userModel.findOne({ _id: userId }).then(result => {
                resolve(result)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            })
        })
    }

    editUser(data, file) {
        return new Promise((resolve, reject) => {

            if (!data) {
                reject(CONSTANT.MISSINGPARAMS)
            }
            else {
                var query = {}
                if (data.firstName)
                    query.firstName = data.firstName
                if (data.lastName)
                    query.lastName = data.lastName
                if (file)
                    query.profilePic = '/' + file.filename
                if (data.email)
                    query.email = data.email
                if (data.countryCode)
                    query.countryCode = data.countryCode
                if (data.address)
                    query.address = data.address
                if (data.street)
                    query.street = data.street
                if (data.city)
                    query.city = data.city
                if (data.password)
                    query.password = commonFunctions.hashPassword(data.password)
                console.log(query);
                userModel.findByIdAndUpdate({ _id: data._id }, { $set: query }, { new: true }).then(update => {
                    resolve(update)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }
        })
    }

    // add user
    addUser(data, file) {
        return new Promise((resolve, reject) => {

            if (!data.email) {
                reject(CONSTANT.MISSINGPARAMSORFILES)
            }
            else {
                // check if already exists
                let checkCriteria = {
                    $or: [
                        { email: data.email },
                        {
                            contact: data.contact,
                            countryCode: data.countryCode
                        }
                    ],
                    isDeleted: false
                };
                userModel.count(checkCriteria).then(result => {
                    if (result) {
                        return reject(CONSTANT.UNIQUEEMAILANDUSERNAME)
                    } else {
                        if (file && file.filename)
                            data.profilePic = '/' + file.filename;
                        else
                            data.profilePic = '/' + 'default.png';
                        const user = this.createUser(data)
                        user.save().then((saveresult) => {
                            resolve(saveresult)
                        }).catch(error => {
                            if (error.errors)
                                return reject(commonController.handleValidation(error))
                            return reject(error)
                        })
                    }
                });
            }
        })
    }

    createUser(data) {
        if (data.password)
            data.password = commonFunctions.hashPassword(data.password)
        const user = new userModel({
            email: data.email,
            countryCode: data.countryCode,
            firstName: data.firstName,
            lastName: data.lastName,
            address: data.address,
            password: data.password,
            contact: data.contact,
            city: data.city,
            street: data.street,
            cun: data.cun,
            profilePic: data.profilePic,
            isVerified: true,
            date: moment().valueOf()
        })
        return user
    }

    // add owner
    addOwner(data, file) {
        return new Promise((resolve, reject) => {

            if (!data.email) {
                reject(CONSTANT.MISSINGPARAMSORFILES)
            }
            else {

                // check if already exists
                let checkCriteria = {
                    $or: [
                        { email: data.email },
                        {
                            contact: data.contact,
                            countryCode: data.countryCode
                        }
                    ],
                    isDeleted: false
                };
                ownerModel.count(checkCriteria).then(result => {
                    if (result) {
                        return reject(CONSTANT.UNIQUEEMAILANDUSERNAME)
                    } else {
                        if (file && file.filename)
                            data.profilePic = '/' + file.filename;
                        else
                            data.profilePic = '/' + 'default.png';
                        const owner = this.createOwner(data)
                        owner.save().then((saveresult) => {
                            resolve(saveresult)
                        }).catch(error => {
                            if (error.errors)
                                return reject(commonController.handleValidation(error))
                            return reject(error)
                        })
                    }
                });

            }
        })
    }

    createOwner(data) {
        if (data.password)
            data.password = commonFunctions.hashPassword(data.password)
        const owner = new ownerModel({
            email: data.email,
            countryCode: data.countryCode,
            firstName: data.firstName,
            lastName: data.lastName,
            password: data.password,
            contact: data.contact,
            profilePic: data.profilePic,
            isVerified: true,
            date: moment().valueOf()
        })
        return owner
    }

    editOwner(data, file) {
        return new Promise((resolve, reject) => {

            if (!data) {
                reject(CONSTANT.MISSINGPARAMS)
            }
            else {
                var query = {}
                if (data.firstName)
                    query.firstName = data.firstName
                if (data.lastName)
                    query.lastName = data.lastName
                if (file)
                    query.profilePic = '/' + file.filename
                if (data.email)
                    query.email = data.email
                if (data.contact)
                    query.contact = data.contact
                if (data.status)
                    query.status = data.status
                if (data.countryCode)
                    query.countryCode = data.countryCode
                if (data.password)
                    query.password = commonFunctions.hashPassword(data.password)
                console.log(query);
                ownerModel.findByIdAndUpdate({ _id: data._id }, { $set: query }, { new: true }).then(update => {
                    resolve(update)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }
        })
    }

    ownerVerify(data) {
        return new Promise((resolve, reject) => {
            if (!data.ownerId)
                reject(CONSTANT.OWNERIDMISSING)
            ownerModel.findByIdAndUpdate({ _id: data.ownerId }, { $set: { isAdminVerified: data.status } }, { new: true }).then(del => {
                resolve(del)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            })
        })
    }

    // editService(data, file) {
    //     return new Promise((resolve, reject) => {

    //         if (!data) {
    //             reject(CONSTANT.MISSINGPARAMS)
    //         }
    //         else {
    //             var query = {}
    //             if (data.firstName)
    //                 query.firstName = data.firstName
    //             if (file)
    //                 query.profilePic = '/' + file.filename
    //             if (data.email)
    //                 query.email = data.email
    //             if (data.lastName)
    //                 query.lastName = data.lastName
    //             if (data.username)
    //                 query.username = data.username
    //             if (data.status)
    //                 query.status = data.status
    //             if (data.password)
    //                 query.password = commonFunctions.hashPassword(data.password)
    //             console.log(query);
    //             serviceModel.findByIdAndUpdate({ _id: data._id }, { $set: query }, { new: true }).then(update => {
    //                 resolve(update)
    //             }).catch(error => {
    //                 if (error.errors)
    //                     return reject(commonController.handleValidation(error))
    //                 return reject(error)
    //             })
    //         }
    //     })
    // }


    deleteUser(_id) {
        if (!_id) {
            reject(CONSTANT.MISSINGPARAMS)
        }
        else {
            return new Promise((resolve, reject) => {
                userModel.findByIdAndUpdate({ _id: _id }, { $set: { isDeleted: 1 }, $unset: { email: 1, contact: 1 } }, { new: true }).then(del => {
                    resolve(del)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            })
        }
    }

    deleteVehicle(_id) {
        if (!_id) {
            reject(CONSTANT.MISSINGPARAMS)
        }
        else {
            return new Promise((resolve, reject) => {
                vehicleModel.findByIdAndUpdate({ _id: _id }, { $set: { isDeleted: 1 } }, { new: true }).then(del => {
                    resolve(del)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            })
        }
    }


    deleteOwner(_id) {
        if (!_id) {
            reject(CONSTANT.MISSINGPARAMS)
        }
        else {
            return new Promise((resolve, reject) => {
                ownerModel.findByIdAndUpdate({ _id: _id }, { $set: { isDeleted: 1 }, $unset: { email: 1, contact: 1 } }, { new: true }).then(del => {
                    resolve(del)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            })
        }
    }

    generateUserCSV(req, res) {
        let fields = ["_id", "email", "countryCode", "nickName", "area", "state", "callType"]

        const opts = { fields };

        try {
            userModel.find().then(data => {
                const parser = new Parser(opts);
                var array = []
                data.map(value => {
                    var csvData = {}
                    csvData._id = value._id
                    csvData.email = value.email;
                    csvData.countryCode = value.countryCode;
                    csvData.nickName = value.nickName;
                    csvData.area = value.area;
                    csvData.state = value.state;
                    csvData.callType = value.callType;
                    array.push(csvData)
                })

                const csv = parser.parse(array);
                var path = './public/csv/'
                var name = '/user' + Date.now() + ".csv"
                var address = path + name
                fs.writeFile(address, csv, err => {
                    if (err)
                        console.log(data);
                    else
                        res.send({ message: "Downloaded successfully", status: 'true', file: name })
                })

            }).catch(err => {
                console.log(err);

            })
        } catch (err) {
            console.error(err);
        }

    }

    // generateServiceCSV(req, res) {
    //     let fields = ["_id", "email", "contact", "firstName", "lastName", "username", "gender", "status", "language"]

    //     const opts = { fields };

    //     try {
    //         serviceModel.find().then(data => {
    //             const parser = new Parser(opts);
    //             var array = []
    //             data.map(value => {
    //                 var csvData = {}
    //                 if (value.status === 1)
    //                     csvData.status = 'online'
    //                 else
    //                     csvData.status = 'offline'
    //                 csvData._id = value._id
    //                 csvData.email = value.email;
    //                 csvData.contact = value.contact;
    //                 csvData.firstName = value.firstName;
    //                 csvData.lastName = value.lastName;
    //                 csvData.username = value.username;
    //                 csvData.gender = value.gender;
    //                 csvData.language = value.language;


    //                 array.push(csvData)
    //             })

    //             const csv = parser.parse(array);
    //             var path = './public/csv/'
    //             var name = '/service' + Date.now() + ".csv"
    //             var address = path + name
    //             fs.writeFile(address, csv, err => {
    //                 if (err)
    //                     console.log(data);
    //                 else
    //                     res.send({ message: "Downloaded successfully", status: 'true', file: name })
    //             })

    //         }).catch(err => {
    //             console.log(err);

    //         })
    //     } catch (err) {
    //         console.error(err);
    //     }

    // }

    getRequestCount() {
        return new Promise((resolve, reject) => {
            bookingModel.aggregate([
                {
                    $group: {
                        "_id": "$status",
                        "count": { $sum: 1 }
                    }
                }

            ]).then(result => {
                resolve(result)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            })
        })
    }

    displayVehicles(data) {

        return new Promise((resolve, reject) => {

            let criteria = {}
            if (data.from && data.to)
                criteria.date = {
                    $gte: data.from,
                    $lte: data.to,
                    isDeleted: false
                }
            if (data.boookingFrom && data.bookingTo)
                criteria.schedule = {
                    $gte: data.boookingFrom,
                    $lte: data.bookingTo,
                    isDeleted: false
                }
            if (data && data.ownerId) {
                criteria.ownerId = mongoose.Types.ObjectId(data.ownerId);
                criteria.isDeleted = false
            }


            if (data && data.vehicleId) {
                criteria.isDeleted = false
                criteria._id = mongoose.Types.ObjectId(data.vehicleId);
            }
            criteria.isDeleted = false

            let options = {
                lean: true,
                limit: 10,
                skip: (parseInt(data.page) - 1) * 10
            }
            vehicleModel.count(criteria).then(count => {
                vehicleModel.find(criteria, {}, options).populate('vehicleImages').populate('carTypeId').populate('vehicleTypeId').then(result => {
                    resolve({ result: result, count: count });
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            })

        })
    }

    displayHome(groupParam) {
        return new Promise((resolve, reject) => {

            let pipeline = [
                {
                    $lookup:
                    {
                        from: "vehicleimages",
                        localField: "_id",
                        foreignField: "vehcileId",
                        as: "images"
                    }
                }
            ];
            if (groupParam) {
                pipeline = pipeline.concat([{
                    $group: {
                        _id: '$vehicleTypeId',
                        count: { $sum: 1 },
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
                        "vehicles": 1,
                        "count": 1,
                    }
                }]);
            }
            vehicleModel.aggregate(pipeline).then(result => {
                resolve(result)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))

                return reject(error)
            })
        })
    }

    displayBookings(data, page) {
        return new Promise((resolve, reject) => {

            let query = {};

            if (data.from && data.to) {
                query.date = {
                    $gte: data.from,
                    $lte: data.to
                };
            }

            if (data.boookingFrom && data.bookingTo) {
                query.schedule = {
                    $gte: data.boookingFrom,
                    $lte: data.bookingTo
                };
            }

            if (data.bookingId) {
                query._id = mongoose.Types.ObjectId(data.bookingId);
            }

            if (data.userId) {
                query.userId = mongoose.Types.ObjectId(data.userId);
            }

            if (data.vehicleId) {
                query.vehicleId = mongoose.Types.ObjectId(data.vehicleId);
            }

            let pipeline = [
                {
                    $match: query
                },
                {
                    $lookup: {
                        from: 'vehicles',
                        localField: 'vehicleId',
                        foreignField: '_id',
                        as: 'vehicleDetails'
                    }
                },
                {
                    $unwind: '$vehicleDetails'
                },
                {
                    $lookup: {
                        from: 'carcategories',
                        localField: 'vehicleDetails.vehicleTypeId',
                        foreignField: '_id',
                        as: 'vehicleDetails.vehicleTypeId'
                    }
                },
                {
                    $unwind: '$vehicleDetails.vehicleTypeId'
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $unwind: '$userDetails'
                },
                {
                    $lookup: {
                        from: 'owners',
                        localField: 'ownerId',
                        foreignField: '_id',
                        as: 'ownerDetails'
                    }
                },
                {
                    $unwind: '$ownerDetails'
                },
                {
                    $project: {
                        bookingDuration: 1,
                        'ownerDetails.firstName': 1,
                        'ownerDetails.lastName': 1,
                        'ownerDetails.email': 1,
                        'ownerDetails.contact': 1,
                        vehicleDetails: 1,
                        'userDetails.firstName': 1,
                        'userDetails.lastName': 1,
                        'userDetails.email': 1,
                        'userDetails.contact': 1,
                        typeOfEvent: 1,
                        address: 1,
                        startTime: 1,
                        endTime: 1,
                        currentCoordinates: 1,
                        currentLat: 1,
                        currentLong: 1,
                        trackImage: 1,
                        status: 1,
                        isPaid: 1,
                        date: 1
                    }
                }
            ];

            bookingModel.aggregate(pipeline).skip(Number(page-1) * 10)
            .limit(10).then(result => {
                bookingModel.aggregate(pipeline).then(items => {
                    resolve({result:result, count:items.length})
                })
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            })
        })
    }
    displayUsers(data) {
        return new Promise((resolve, reject) => {

            let query = {
                isDeleted: false
            } 
            
            
            
              if (data.query) {
                let search = data.query;
                let searchData = search.split(" ");

                if (searchData.length > 1) {
                    search = searchData[0];
                }

                query = {
                  $and: [
                    { isDeleted: false },
                    {
                      $or: [
                            { "email": new RegExp("^" + search, "i") },
                            { "firstName": new RegExp("^" + search, "i") }, 
                            { "lastName": new RegExp("^" + search, "i") },
                            { "contact": new RegExp("^" + search, "i") }
                        ]
                    },
                  ]
                }
              }

            userModel.find(query).countDocuments().then(count => {
                userModel.find(query).skip(Number(data.page - 1) * Number(10)).limit(Number(10)).then(result => {

                    resolve({ result: result, count: count })
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })

                return count
            })
        })
    }
    displayOwners(data) {

        return new Promise((resolve, reject) => {

            let query = {
                isDeleted: false
            } 
            
            
            
              if (data.query) {
                let search = data.query;
                let searchData = search.split(" ");

                if (searchData.length > 1) {
                    search = searchData[0];
                }

                query = {
                  $and: [
                    { isDeleted: false },
                    {
                      $or: [
                            { "email": new RegExp("^" + search, "i") },
                            { "firstName": new RegExp("^" + search, "i") }, 
                            { "lastName": new RegExp("^" + search, "i") }
                        ]
                    },
                  ]
                }
              }

            ownerModel.find(query).countDocuments().then(count => {
                ownerModel.find(query).populate('ownerVerifyImages').sort({"_id":-1}).skip(Number(data.page - 1) * Number(10)).limit(Number(10)).then(result => {

                    resolve({ result: result, count: count })
                }).catch(error => {
                    console.log(error);

                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            })
        })
    }
    updateBooking(data) {
        return new Promise((resolve, reject) => {
            if (!data)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                var query = {}
                if (data.serviceRatings)
                    query.serviceRatings = data.serviceRatings
                if (data.userRatings)
                    query.userRatings = data.userRatings
                if (data.status)
                    query.status = data.status
                if (data.houseName)
                    query.houseName = data.houseName
                if (data.houseNumber)
                    query.houseNumber = data.houseNumber
                if (data.assignedUser)
                    query.userId = mongoose.Types.ObjectId(data.assignedUser)
                console.log(query);

                bookingModel.findByIdAndUpdate({ _id: data.bookingId }, { $set: query }, { new: true }).then(result => {
                    resolve(result)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }


        })
    }

    addCategory(data, file) {
        console.log(data);

        return new Promise((resolve, reject) => {
            if (!data.carType || !data.baseFare || !data.hourlyMinRate || !data.hourlyMaxRate || !data.dayMinRate || !data.dayMaxRate)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                if (file)
                    data.image = '/' + file.filename;
                const category = this.createCategory(data)

                category.save({}).then(result => {
                    resolve(result)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }


        })
    }

    addType(data) {
        return new Promise((resolve, reject) => {
            if (!data.type)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                const vehicle = new vehicleType({
                    type: data.type,
                })
                vehicle.save({}).then(result => {
                    resolve(result)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }
        })
    }

    getVehicleTypeById(vehicleId) {
        return new Promise((resolve, reject) => {
            vehicleType.findById(vehicleId).then(result => {
                resolve(result)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            })
        })
    }

    deleteVehicleType(vehicleTypeId) {
        return new Promise((resolve, reject) => {
            if (!vehicleTypeId) {
                reject(CONSTANT.MISSINGPARAMS)
            } else {
                vehicleType.deleteOne({ _id: vehicleTypeId }).then(del => {
                    resolve(del)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }
        })
    }

    getVehicleTypes(data) {
        return new Promise((resolve, reject) => {
            vehicleType.find({}).skip(Number(data.page - 1) * Number(10)).limit(Number(10)).then(result => {
                vehicleType.find({}).countDocuments().then(count => {
                    resolve({ result: result, count: count });
                });            
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            })
        })
    }

    editVehicleType(data) {
        return new Promise((resolve, reject) => {
            if (!data.type)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                const criteria = {
                    _id: data._id
                };
                const dataToSet = {
                    type: data.type
                }
                vehicleType.findByIdAndUpdate(criteria, { $set: dataToSet }, { lean: true, new: true }).then(result => {
                    resolve(result)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }
        })
    }

    getTypes() {
        return new Promise((resolve, reject) => {
            vehicleType.find({}).then(result => {
                resolve(result);
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            })
        })
    }
    createCategory(data) {
        data.date = moment().valueOf()
        const category = new carCategory(data)
        return category
    }

    getCategory(data) {
        return new Promise((resolve, reject) => {
            let query = {};
            if (data.categoryId) {
                query._id = data.categoryId;
            }
            carCategory.find(query, {}, { lean: true }).skip(Number(data.page - 1) * Number(10)).limit(Number(10)).then(result => {
                carCategory.find(query, {}, { lean: true }).countDocuments().then(count => {
                    resolve({ result: result, count: count });
                });            
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            })
        })
    }
    deleteCategory(categoryId) {
      
        return new Promise((resolve, reject) => {
            if (!categoryId) {
                reject(CONSTANT.MISSINGPARAMS)
            } else {
                carCategory.deleteOne({ _id: categoryId }).then(del => {
                    resolve(del)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }

        })
    }

    editCategory(data, file) {
        return new Promise((resolve, reject) => {

            if (!data || !data.categoryId) {
                reject(CONSTANT.MISSINGPARAMS)
            }
            else {
                var query = {}
                if (data.carType)
                    query.carType = data.carType;
                if (data.baseFare)
                    query.baseFare = data.baseFare;
                if (data.hourlyMinRate)
                    query.hourlyMinRate = data.hourlyMinRate;
                if (data.hourlyMaxRate)
                    query.hourlyMaxRate = data.hourlyMaxRate;
                if (data.dayMinRate)
                    query.dayMinRate = data.dayMinRate;
                if (data.dayMaxRate)
                    query.dayMaxRate = data.dayMaxRate;
                if (file)
                    query.image = file.filename;
                console.log(query);
                carCategory.findByIdAndUpdate({ _id: data.categoryId }, { $set: query }, { new: true }).then(update => {
                    resolve(update)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }
        })
    }

    addCoupon(data) {

        return new Promise((resolve, reject) => {
            if (!data.name || !data.discountType || !data.discountAmount ||
                !data.applicableTimeStart || !data.applicableTimeEnd || !data.startDate ||
                !data.endDate || !data.couponCode || !data.minAmountForDiscount)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                const discountCoupon = this.createCoupon(data)

                discountCoupon.save({}).then(result => {
                    resolve(result)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }
        })
    }

    createCoupon(data) {
        let dataToSet = data;
        dataToSet.date = moment().valueOf();

        if (data.applicableTimeStart) {
            dataToSet.applicableTimeStartHours = data.applicableTimeStart.slice(0, 2);
            dataToSet.applicableTimeStartMinutes = data.applicableTimeStart.slice(3);
        }
        if (data.applicableTimeEnd) {
            dataToSet.applicableTimeEndHours = data.applicableTimeEnd.slice(0, 2);
            dataToSet.applicableTimeEndMinutes = data.applicableTimeEnd.slice(3);
        }
        const coupon = new discountCoupon(data)
        return coupon;
    }

    getCoupons(req) {
        return new Promise((resolve, reject) => {
            let query = {};
            if (req.couponId) {
                query_id = req.couponId;
            }
            couponModel.find(query, {}, { lean: true }).then(result => {
                resolve(result)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            })
        })
    }

    editCoupon(data) {
        return new Promise((resolve, reject) => {

            if (!data || !data.couponId) {
                reject(CONSTANT.MISSINGPARAMS)
            }
            else {
                var query = {}
                if (data.name)
                    query.name = data.name;
                if (data.discountType)
                    query.discountType = data.discountType;
                if (data.discountAmount)
                    query.discountAmount = data.discountAmount;
                if (data.maxDiscount)
                    query.maxDiscount = data.maxDiscount;
                if (data.minAmountForDiscount)
                    query.maxDiscount = data.maxDiscount;
                if (data.applicableTimeStart) {
                    query.applicableTimeStartHours = data.applicableTimeStart.slice(0, 2);
                    query.applicableTimeStartMinutes = data.applicableTimeStart.slice(3);
                }
                if (data.applicableTimeEnd) {
                    query.applicableTimeEndHours = data.applicableTimeEnd.slice(0, 2);
                    query.applicableTimeEndMinutes = data.applicableTimeEnd.slice(3);
                }
                if (data.startDate)
                    query.startDate = data.startDate;
                if (data.endDate)
                    query.endDate = data.endDate;
                console.log(query);
                couponModel.findByIdAndUpdate({ _id: data.couponId }, { $set: query }, { new: true }).then(update => {
                    resolve(update)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
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
            console.log(data)
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
                                        type: result.mimetype,
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
    deleteCoupon(couponId) {
        if (!couponId) {
            reject(CONSTANT.MISSINGPARAMS)
        }
        else {
            return new Promise((resolve, reject) => {
                couponModel.deleteOne({ _id: couponId }).then(del => {
                    resolve(del)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            })
        }
    }

    addEvent(data) {

        return new Promise((resolve, reject) => {
            if (!data.eventType)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                // check if already exists
                let checkCriteria = {
                    $or: [
                        { eventId: data.eventId },
                        { eventTypeInLowerCase: data.eventType.toLowerCase() }
                    ]
                };
                eventModel.count(checkCriteria).then(result => {
                    if (result) {
                        return reject(CONSTANT.EVENTALREADYADDED)
                    } else {
                        const event = new eventModel({
                            eventId: data.eventId,
                            eventType: data.eventType,
                            eventTypeInLowerCase: data.eventType.toLowerCase()
                        });
                        event.save({}).then(result => {
                            resolve(result)
                        }).catch(error => {
                            if (error.errors)
                                return reject(commonController.handleValidation(error))
                            return reject(error)
                        })
                    }
                });
            }
        })
    }

    getEvents(data) {
        return new Promise((resolve, reject) => {
            eventModel.find({ isDeleted: false }).then(result => {
                resolve(result)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            })
        })
    }

    deleteEvent(data) {
        return new Promise((resolve, reject) => {
            if (!data)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                const criteria = {
                    _id: data._id
                };
                const dataToSet = {
                    isDeleted: true,
                    eventTypeInLowerCase: `${data.eventTypeInLowerCase}-${new Date().getTime()}`,
                    eventId: `${data.eventId}${new Date().getTime()}`
                }
                eventModel.findByIdAndUpdate(criteria, { $set: dataToSet }, { lean: true, new: true }).then(result => {
                    resolve(result)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }
        })
    }

    editEvent(data) {
        return new Promise((resolve, reject) => {
            if (!data)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                // check if already exists
                let checkCriteria = {
                    _id: { $ne: mongoose.Types.ObjectId(data._id) },
                    $or: [
                        { eventTypeInLowerCase: data.eventType.toLowerCase() }
                    ]
                };
                eventModel.count(checkCriteria).then(result => {
                    if (result) {
                        return reject(CONSTANT.EVENTALREADYADDED)
                    } else {
                        const criteria = {
                            _id: data._id
                        };
                        const dataToSet = {
                            eventType: data.eventType,
                            eventTypeInLowerCase: data.eventType.toLowerCase(),
                            eventId: data.eventId
                        }
                        eventModel.findByIdAndUpdate(criteria, { $set: dataToSet }, { lean: true, new: true }).then(result => {
                            resolve(result)
                        }).catch(error => {
                            if (error.errors)
                                return reject(commonController.handleValidation(error))
                            return reject(error)
                        })
                    }
                });

            }
        })
    }


    getHomeScreenDataCounts() {

        const today = new Date();
        var year = today.getUTCFullYear();
        var month = today.getUTCMonth();
        var day = today.getUTCDate();

        var startHour = Date.UTC(year, month, day, 0, 0, 0, 0);
        var endHour = startHour + 86400000;

        const criteria = {
            date: {
                $gte: startHour,
                $lte: endHour

            }
        };

        const totalUsers = new Promise((resolve, reject) => {
            userModel.count({})
                .then(result => {
                    resolve(result)
                })
        });

        const newUsers = new Promise((resolve, reject) => {
            userModel.count(criteria)
                .then(result => {
                    resolve(result)
                })
        })

        const totalBookings = new Promise((resolve, reject) => {
            bookingModel.count({})
                .then(result => {
                    resolve(result)
                })
        })

        const newBookings = new Promise((resolve, reject) => {
            bookingModel.count(criteria)
                .then(result => {
                    resolve(result)
                })
        })

        return new Promise((resolve, reject) => {
            Promise.all([totalUsers, newUsers, totalBookings, newBookings]).then(result => {
                resolve(result)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            })
        })

    }

    getHomeScreenReports(data) {
        return new Promise((resolve, reject) => {
            if (!data) {

                reject(CONSTANT.MISSINGPARAMS)

            } else {

                let startDate = new Date();
                let endDate = new Date();
                let d = new Date();
                let group = {};
                let project = {};
                let sort = {};

                if (parseInt(data.aggregationType) == 3) {
                    startDate = new Date(new Date().getFullYear(), 0, 1);
                    endDate = new Date();
                    group = {
                        _id: {
                            month: { $month: '$date' }
                        },
                        total: { $sum: 1 }
                    };
                    project = {
                        _id: 0,
                        month: '$_id.month',
                        count: '$total'
                    };
                    sort = { month: 1 };
                } else if (parseInt(data.aggregationType) == 2) {
                    let day = d.getDay();
                    startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + (day == 0 ? -6 : 1) - day);
                    endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + (day == 0 ? 0 : 7) - day);
                    group = {
                        _id: {
                            week: { $dayOfWeek: '$date' }
                        },
                        total: { $sum: 1 }
                    };
                    project = {
                        _id: 0,
                        day: '$_id.week',
                        count: '$total'
                    };
                    sort = { week: 1 };
                } else {
                    startDate = new Date(data.startDate)
                    endDate = new Date(data.endDate)
                    group = {
                        _id: {
                            date: { $dayOfMonth: '$date' },
                            month: { $month: '$date' },
                            year: { $year: '$date' }
                        },
                        total: { $sum: 1 }
                    };
                    project = {
                        _id: 0,
                        date: '$_id.date',
                        month: '$_id.month',
                        year: '$_id.year',
                        count: '$total'
                    };
                    sort = { year: 1, month: 1, date: 1 };

                }

                let year = startDate.getUTCFullYear();
                let month = startDate.getUTCMonth();
                let day = startDate.getUTCDate();
                const startHour = Date.UTC(year, month, day, 0, 0, 0, 0);


                year = endDate.getUTCFullYear();
                month = endDate.getUTCMonth();
                day = endDate.getUTCDate();
                let endHour = Date.UTC(year, month, day, 0, 0, 0, 0);
                endHour = endHour + 86400000;

                const pipeline = [
                    {
                        $match: {
                            date: {
                                $gte: parseInt(startHour),
                                $lte: parseInt(endHour)
                            }
                        }
                    },
                    {
                        $project: {
                            "date": {
                                "$add": [new Date(0), "$date"]
                            }
                        }
                    },
                    {
                        $group: group
                    },
                    {
                        $project: project
                    },
                    {
                        $sort: sort
                    }
                ];

                if (parseInt(data.limit)) {
                    pipeline.push({ $limit: parseInt(data.limit) });
                }

                if (parseInt(data.skip)) {
                    pipeline.push({ $skip: parseInt(data.skip) });
                }

                const totalUsers = new Promise((resolve, reject) => {
                    userModel.aggregate(pipeline)
                        .then(result => {
                            resolve(result)
                        })
                });

                const totalBookings = new Promise((resolve, reject) => {
                    bookingModel.aggregate(pipeline)
                        .then(result => {
                            resolve(result)
                        })
                })

                Promise.all([totalUsers, totalBookings]).then(result => {
                    resolve(result)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }
        })

    }

    //Add Vehicle
    addVehicle(data, files) {
        return new Promise((resolve, reject) => {
            let abc = [];


            var currentCoordinates = []
            var location = {}
            if (data.currentLat && data.currentLong) {
                currentCoordinates.push(Number(data.currentLong))
                currentCoordinates.push(Number(data.currentLat))
                location.type = "Point";
                location.coordinates = currentCoordinates
            }

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
                carName: data.carName,
                hourlyRate: data.hourlyRate,
                dayRate: data.dayRate,
                currentLat: Number(data.currentLat),
                currentLong: Number(data.currentLong),
                location: location,
                place: data.place,
                steering: data.steering,
                passenger: data.passenger,
                transmission: data.transmission,
                speed: data.speed,
                events: JSON.parse(data.events),
                date: moment().valueOf()

            })
            vehicle.save().then(vehicle => {
                if (files && files.vehiclePics)
                    files.vehiclePics.map(result => {
                        const vehiclePics = new vehicleSchema({
                            path: '/' + result.filename,
                            vehcileId: vehicle._id,
                            type: result.mimetype,
                            date: moment().valueOf()
                        })
                        vehiclePics.save().then(image => {
                            console.log(image);

                        })
                    })
                resolve(vehicle)

            }).catch(err => {
                console.log(err);

            })
        })
    }
    addTax(data) {
        return new Promise((resolve, reject) => {
            if (!data.tax)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                taxModel.findOne().then(result => {
                    console.log(result);
                    if (result) {
                        var query = {}
                        if (data.tax)
                            query.tax = data.tax
                        if (data.security)
                            query.security = data.security
                        if (data.commission)
                            query.commission = data.commission
                        taxModel.findByIdAndUpdate({ _id: result._id }, { $set: query }, { new: true }).then(update => {
                            resolve(update)
                        })
                    } else {
                        const tax = new taxModel({
                                tax: data.tax,
                                name: data.name,
                                type: data.type
                            })
                            tax.save({}).then(taxDetails => {
                                resolve(taxDetails)
            
                            }).catch(error => {
                                if (error.errors)
                                return reject(commonController.handleValidation(error))
            
                            return reject(error)
                            })
                    }
                })
            }
        })
    }

    getTax() {
        return new Promise((resolve, reject) => {
            taxModel.findOne().then(result => {
                resolve(result)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            })
        })
    }

    addPromo(data) {
        return new Promise((resolve, reject) => {
            if (!data.name && !data.code)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                promoCodeModel.find({code: data.code}).then(result => {
                    if (result.length) {
                        reject('Promo code already exist')
                    }else {
                        const promoCode = new promoCodeModel({
                            name: data.name,
                            code: data.code,
                            type: data.type,
                            member: data.member,
                            value: data.value,
                            startTime: data.startTime,
                            endTime: data.endTime
                        })
                        promoCode.save({}).then(promo => {
                            resolve(promo)
                        }).catch(error => {
                            if (error.errors)
                            return reject(commonController.handleValidation(error))
        
                        return reject(error)
                        })
                    }
                })
            }
        })
    }

    updatePromo(data) {
        return new Promise((resolve, reject) => {
            if (!data.name && !data.code)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                // promoCodeModel.find({code: data.code}).then(result => {
                //     if (result) {
                //         reject('Promo code already exist')
                //     }else {

                    var promoCode = {}
                    if (data.name)
                        promoCode.name = data.name
                    if (data.code)
                        promoCode.code = data.code
                    if (data.type)
                       promoCode.type = data.type
                    if (data.value)
                        promoCode.value = data.value
                    if (data.member)
                        promoCode.member = data.member
                    if (data.startTime)
                       promoCode.startTime = data.startTime
                    if (data.endTime)
                        promoCode.endTime = data.endTime

                        promoCodeModel.findByIdAndUpdate({ _id: data.id }, { $set: promoCode }, { new: true }).then(promo => {
                            resolve(promo)
                        }).catch(error => {
                            if (error.errors)
                            return reject(commonController.handleValidation(error))
        
                        return reject(error)
                        })
                //     }
                // })
            }
        })
    }

    getPromos(data) {
        return new Promise((resolve, reject) => {
            promoCodeModel.find({}).skip(Number(data.page - 1) * Number(10)).limit(Number(10)).then(result => {
                promoCodeModel.find().countDocuments().then(count => {
                    resolve({result: result, count: count})
                })
            }).catch(error => {
                if (error.errors)
                return reject(commonController.handleValidation(error))

            return reject(error)
            })
        })
    }

    getPromoById(promoId) {
        return new Promise((resolve, reject) => {
            promoCodeModel.findById(promoId).then(result => {
                    resolve(result)
            }).catch(error => {
                if (error.errors)
                return reject(commonController.handleValidation(error))

            return reject(error)
            })
        })
    }

    deletePromo(promoId) {
        return new Promise((resolve, reject) => {
            if (!promoId) {
                reject(CONSTANT.MISSINGPARAMS)
            } else {
                promoCodeModel.deleteOne({ _id: promoId }).then(del => {
                    resolve(del)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }

        })
    }
    addSecurity(data) {
        return new Promise((resolve, reject) => {
            if (!data.price)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                securityModel.findOne().then(result => {
                    if (result) {
                        var query = {}
                        if (data.name)
                            query.name = data.name
                        if (data.price)
                            query.price = data.price
                        securityModel.findByIdAndUpdate({ _id: result._id }, { $set: query }, { new: true }).then(update => {
                            resolve(update)
                        })
                    } else {
                        const security = new securityModel({
                                name: data.name,
                                price: data.price
                            })
                            security.save({}).then(respo => {
                                resolve(respo)
            
                            }).catch(error => {
                                if (error.errors)
                                return reject(commonController.handleValidation(error))
            
                            return reject(error)
                            })
                    }
                })
            }
        })
    }
    getSecurity() {
        return new Promise((resolve, reject) => {
            securityModel.findOne().then(result => {
                resolve(result)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            })
        })
    }
}
module.exports = new admin()