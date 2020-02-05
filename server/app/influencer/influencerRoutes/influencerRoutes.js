const express = require('express')
const influencerController = require('../influencerControllers/influencerControllers')
const CONSTANT = require('../../../constant')
const rn = require('random-number')
const multer = require('multer');


const storage = multer.diskStorage({
    destination: process.cwd() + "/server/public/uploads/",

    filename: function (req, file, cb) {

        cb(
            null,
            rn({
                min: 1001,
                max: 9999,
                integer: TRUESTATUS
            }) +
            "_" +
            Date.now() +
            `.${file.originalname.split('.').pop()}`
        );
    }
});
const upload = multer({ storage: storage })

let influencer = express.Router()


//Inflencer Register

influencer.route('/signup')
    .post((req, res) => {
        influencerController.signUp(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result.result,
                message: result.message,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

influencer.route('/logout/:ownerId')
    .get((req, res) => {
        influencerController.logout(req.params.ownerId).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                user: result
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })

    })
//socaillogin 
influencer.post("/sociallogin", upload.single('profilePic'), (req, res) => {
    let body = req.body;
    influencerController
        .sociallogin(body, req.file)
        .then(result => {
            console.log(result);

            res.json({ success: CONSTANT.TRUESTATUS, message: "Login successfully", "data": result });
        })
        .catch(err => {
            res.json({ success: CONSTANT.FALSESTATUS, message: err });
        });
});


//Verify and send activation Mail to user 
influencer.route('/verifyEmail')
    .post((req, res) => {
        influencerController.verifyEmail(req.body).then(result => {
            return res.send({
                success: CONSTANT.TRUESTATUS,
                data: result,
                message: CONSTANT.VERFIEDTRUESTATUS
            })
        }).catch(err => {
            return res.json({ data: err, message: CONSTANT.NOTVERIFIED, success: CONSTANT.FALSESTATUS })
        })
    })


//VERFIFY
influencer.route('/verify')
    .get((req, res) => {
        influencerController.verify(req.query).then(result => {

            return res.send(`<h1 style="text-align:center; font-size:100px" >Verified successfully</h1>`)
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUSSTATUS, success: CONSTANT.FALSESTATUS })
        })

    })


// Resend
influencer.route('/resendVerification')
    .put((req, res) => {
        influencerController.resendVerification(req.body).then(result => {
            return res.send({
                success: CONSTANT.TRUESTATUS,
                data: result,
                message: CONSTANT.VERIFYMAIL
            })
        }).catch(err => {
            console.log(err);

            return res.json({ message: err, success: CONSTANT.FALSESTATUS })

        })
    })

//Check If Number Exists
influencer.route('/checkContactExists')
    .post((req, res) => {
        influencerController.checkContactExists(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                message: result.message,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error.message, data: error.data, success: CONSTANT.FALSESTATUS })
        })

    })



influencer.route('/forgetpassword').
    get((req, res) => {
        if (!(req.query.user || req.query.token)) {
            res.redirect('/server/app/views/404-page')
        }
        let message = req.flash('errm');
        console.log("messagev", message);

        res.render('forgetPassword', { title: 'Forget password', message })
    })



//Forgot Password

influencer.route('/forget-password')
    .post((req, res) => {

        influencerController.forgotPassword(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                message: CONSTANT.CHANGEPASSWORDLINK

            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })


// Verify Passowrd

influencer.route('/forgetpassword').
    post((req, res) => {
        influencerController.forgetPasswordVerify(req.body, req.query).then(
            message => {
                res.render('forgetPassword', { message: message, title: 'Forget password' })
            },
            err => {
                if (err.expired) {
                    return res.send(`<h1 style="text-align:center; font-size:100px" >Forget password link has been expired.</h1>`)
                }
                req.flash('errm', err)

                let url = `/api/user/forgetpassword?token=${req.query.token}&user=${req.query.user}`
                res.redirect(url)
            }
        )
    })

//Add Vehicle

influencer.route('/addVehicle')
    .post(upload.fields([{ name: 'vehiclePics', maxCount: 4 }, { name: 'verificationPhotos', maxCount: 6 }]), (req, res) => {
        influencerController.addVehicle(req.body, req.files).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result,
                message: CONSTANT.VEHCILEADDSUCEESS,
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

//Add Vehicle

influencer.route('/displayVehicles/:ownerId')
    .get((req, res) => {
        influencerController.displayVehicles(req.params.ownerId, req.query.page).then(info => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: info.result,
                count: info.count
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

//Add Vehicle
influencer.route('/displayVehicleCategories')
    .get((req, res) => {
        influencerController.displayVehicleCategories().then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })


// Display Particular Vehicle to admin
influencer.route('/displayParticularVehicle/:vehicleId')
    .get((req, res) => {
        influencerController.displayParticularVehicle(req.params.vehicleId).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })


//availability of owner
influencer.route('/isAvailable')
    .put((req, res) => {
        console.log(req.body)
        influencerController.availability(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result,
                message: CONSTANT.UPDATEMSG,
            })
        }).catch(error => {
            console.log("error", error);
            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })


//Complete Owner
influencer.route('/completeProfile')
    .put(upload.fields([{ name: 'verificationPhotos', maxCount: 6 }]), (req, res) => {
        influencerController.completeProfile(req.body, req.files).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result,
                message: CONSTANT.UPDATEMSG,
            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

influencer.route('/updateVehicle')

    .put(upload.fields([{ name: 'vehiclePics', maxCount: 6 }]), (req, res) => {

        influencerController.updateVehicle(req.body, req.files).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result,
                message: CONSTANT.UPDATEMSG,
            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

// Owner Login

influencer.route('/login')
    .post((req, res) => {

        influencerController.login(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result

            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })


// Set Status Online /Offline

influencer.route('/setStatus')
    .patch((req, res) => {

        influencerController.setStatus(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result,
                message: CONSTANT.UPDATEMSG

            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

//Add Photos
influencer.route('/addPhotos').
    patch(upload.fields([{ name: 'photos', maxCount: 10 }]), (req, res) => {
        influencerController.addPhotos(req.body, req.files).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                message: CONSTANT.ADDSUCCESS
            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

//Add Verification Photo
influencer.route('/addVerificationPhotos').
    patch(upload.fields([{ name: 'verificationPhotos', maxCount: 10 }]), (req, res) => {
        influencerController.addVerificationPhotos(req.body, req.files).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                message: CONSTANT.ADDSUCCESS
            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

// Accept Request

influencer.route('/acceptDenyRequest').
    patch((req, res) => {
        influencerController.acceptDenyRequest(req.body).then(result => {
            var message
            if (result.status == 'confirmed')
                message = CONSTANT.ACCEPTREQUEST
            else
                message = CONSTANT.REQUESTDECLINE
            return res.json({
                success: CONSTANT.TRUESTATUS,
                message: message,
                data: result
            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

// Change Password

influencer.route('/changePassword').
    put((req, res) => {
        influencerController.changePassword(req.body).then(result => {
            return res.json({

                success: CONSTANT.TRUESTATUS,
                message: CONSTANT.UPDATEMSG,
                data: result
            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })


//update Service Details
influencer.route('/updateOwner').
    put(upload.fields([{ name: 'profilePic', maxCount: 1 }]), (req, res) => {
        console.log(req.body);

        influencerController.updateOwner(req.body, req.files).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                message: CONSTANT.UPDATEMSG,
                data: result
            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error.message, success: CONSTANT.FALSESTATUS })
        })
    })


//Get request List
influencer.route('/getRequestList')
    .post((req, res) => {
        influencerController.getRequestList(req.body).then(result => {
            return res.send({
                success: CONSTANT.TRUESTATUS,
                data: result
            })
        }).catch(err => {
            console.log(err);
            return res.json({ message: err, success: CONSTANT.FALSESTATUS })
        })
    })

//get documentList of particular owner
influencer.route('/getdocs/:ownerId')
    .get((req, res) => {
        influencerController.getDocument(req.params.ownerId).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

//Provide Ratings to User
influencer.route('/provideUserRatings')
    .patch((req, res) => {
        influencerController.provideUserRatings(req.body).then(result => {
            return res.send({
                success: CONSTANT.TRUESTATUS,
                message: CONSTANT.UPDATEMSG
            })
        }).catch(err => {
            console.log(err);
            return res.json({ message: err, success: CONSTANT.FALSESTATUS })
        })
    })

//Provide Ratings 
influencer.route('/ratings')
    .post((req, res) => {
        influencerController.ownerRatings(req.body).then(items => {
            return res.send({
                success: CONSTANT.TRUESTATUS,
                data: items.result,
                count: items.totalCount,
                ownerAvgRate: items.averageRate,
                cancleBookingPer: items.cancleBookingPer,
                completeBookingPer: items.completeBookingPer,
            })
        }).catch(err => {
            console.log(err);
            return res.json({ message: err, success: CONSTANT.FALSESTATUS })
        })
    })

//Add issue by service
influencer.route('/addIssue')
    .post(upload.fields([{ name: 'issueimage', maxCount: 1 }]), (req, res) => {
        influencerController.addIssue(req.body, req.files).then(result => {
            return res.send({
                success: CONSTANT.TRUESTATUS,
                data: result,
                message: CONSTANT.ISSUESUCCESSFULLY
            })
        }).catch(err => {
            console.log(err);
            return res.json({ message: err, success: CONSTANT.FALSESTATUS })
        })
    })


//get notification of particular owner
influencer.route('/notification')
    .post((req, res) => {
        influencerController.getNotification(req.body).then((result, totalItem) => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result,
                totalItem: totalItem
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

//get notification of particular owner
influencer.route('/bookings')
    .post((req, res) => {
        influencerController.getOwnerBooking(req.body).then((result, totalItem) => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result,
                totalItem: totalItem
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

influencer.route('/cancleBooking')
    .post((req, res) => {
        influencerController.cancleBooking(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result
            })
        }).catch(error => {
            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

influencer.route('/bookingEarning')
    .post((req, res) => {
        influencerController.bookingEarning(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result.result,
                totalItem: result.totalCount
            })
        }).catch(error => {
            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

//get notification of particular owner
influencer.route('/pastBookings')
    .post((req, res) => {
        influencerController.getOwnerPastBooking(req.body).then((result, totalItem) => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result,
                totalItem: totalItem
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })
//get notification of particular owner
influencer.route('/booking/:bookingId')
    .get((req, res) => {
        influencerController.getBookingsById(req.params.bookingId).then((result, totalItem) => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result,
                totalItem: totalItem
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

// delete vehicle 

influencer.route('/deleteVehicle/:vehicle_id')
    .get((req, res) => {
        influencerController.deleteVehicle(req.params.vehicle_id).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result
            })
        }).catch(error => {
            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

// delete vehicle 

influencer.route('/deleteVehicleMedia/:image_id')
    .get((req, res) => {
        influencerController.deleteVehicleImage(req.params.image_id).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result
            })
        }).catch(error => {
            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

module.exports = influencer;