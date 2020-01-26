const express = require('express')
const adminController = require('../adminControllers/adminController')
const CONSTANT = require('../../../constant')
const multer = require('multer');
const rn = require('random-number')



const adminRoute = express.Router()
const storage = multer.diskStorage({
    destination: process.cwd() + "/server/public/uploads/",
    filename: function (req, file, cb) {

        cb(
            null,
            rn({
                min: 1001,
                max: 9999,
                integer: true
            }) +
            "_" +
            Date.now() +
            `.${file.originalname.split('.').pop()}`
        );
    }
});
const upload = multer({ storage: storage }).single('file')
const uploadMulti = multer({ storage: storage })

//Register Admin 
adminRoute.route('/register')
    .post((req, res) => {
        adminController.signUp(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.SIGNUPSUCCESS,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

//create user by Admin 
adminRoute.route('/registerUser')
    .post((req, res) => {
        adminController.registerUser(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.SIGNUPSUCCESS,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

//Display Owners Profile
adminRoute.route('/displayOwner/:ownerId')
    .post((req, res) => {
        adminController.displayOwner(req.params.ownerId).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })

//Display Users Profile
adminRoute.route('/displayUser/:userId')
    .get((req, res) => {
        adminController.displayUser(req.params.userId).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })

//edit User    
adminRoute.route('/editUser')
    .patch(upload, (req, res) => {
        adminController.editUser(req.body, req.file).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.UPDATEMSG,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

//add User
adminRoute.route('/addUser')
    .post(upload, (req, res) => {
        adminController.addUser(req.body, req.file).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.ADDMSG,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

//add Owner
adminRoute.route('/addOwner')
    .post(upload, (req, res) => {
        adminController.addOwner(req.body, req.file).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.ADDMSG
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })

//edit Owner    
adminRoute.route('/editOwner')
    .patch(upload, (req, res) => {
        adminController.editOwner(req.body, req.file).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.UPDATEMSG,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

//Edit service
// adminRoute.route('/editService')
//     .patch(upload, (req, res) => {
//         adminController.editService(req.body, req.file).then(result => {
//             return res.json({
//                 success: CONSTANT.TRUE,
//                 data: result,
//                 message: CONSTANT.UPDATEMSG,

//             })
//         }).catch(error => {
//             console.log(error);

//             return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
//         })

//     })

//Verify Owner
adminRoute.route('/ownerVerify')
    .put(upload, (req, res) => {
        adminController.ownerVerify(req.body).then(result => {
            return res.json({
                success: CONSTANT.VERFIEDTRUE,
                data: result,
                message: CONSTANT.UPDATEMSG,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

// Login Admin
adminRoute.route('/login')
    .post(upload, (req, res) => {
        adminController.login(req.body, req.file, req.params._id).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

//Delete User
adminRoute.route('/deleteUser/:user_id')
    .patch((req, res) => {
        adminController.deleteUser(req.params.user_id).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.DELETEMSG

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

// Delete Vehicle
adminRoute.route('/deleteVehicle/:vehicle_id')
    .patch((req, res) => {
        adminController.deleteVehicle(req.params.vehicle_id).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.DELETEMSG

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })



// Delete Owner
adminRoute.route('/deleteOwner/:owner_id')
    .patch((req, res) => {
        adminController.deleteOwner(req.params.owner_id).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.DELETEMSG

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

//Get all request Count
adminRoute.route('/getRequestCount')
    .get((req, res) => {
        adminController.getRequestCount().then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })


//Generate User's CSV
adminRoute.route('/generateUserCSV')
    .post((req, res) => {
        adminController.generateUserCSV(req, res)
    })



//Generate Service's CSV
// adminRoute.route('/generateServiceCSV')
//     .post((req, res) => {
//         adminController.generateServiceCSV(req, res)
//     })


//Show all requests List (pending , closed, ongoing)
adminRoute.route('/displayBookings')
    .get((req, res) => {
        adminController.displayBookings(req.body, req.query.page).then(items => {
            return res.json({
                success: CONSTANT.TRUE,
                data: items.result,
                count: items.count,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })
//Dislpay Home screen
adminRoute.route('/displayHome').
    post((req, res) => {
        console.log('....req.body.group', req.body.group);
        adminController.displayHome(req.body.group).then(result => {
            return res.json({

                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, success: CONSTANT.FALSE })
        })
    })
//Show all vehicles
adminRoute.route('/displayVehicles')
    .get((req, res) => {
        adminController.displayVehicles(req.query).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

//Display Users
adminRoute.route('/displayUsers')
    .post((req, res) => {
        adminController.displayUsers(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

//Display Services
adminRoute.route('/displayOwners')
    .post((req, res) => {
        adminController.displayOwners(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })
//Update Bookings
adminRoute.route('/updateBooking')
    .patch((req, res) => {
        adminController.updateBooking(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.UPDATEMSG

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })


//add  Car category
adminRoute.route('/addCategory')
    .post(upload, (req, res) => {
        adminController.addCategory(req.body, req.file).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.ADDCATEGORY

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })
//add  Car Types
adminRoute.route('/addType')
    .post((req, res) => {
        adminController.addType(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })

//get Car Type by id
adminRoute.route('/getTypeById/:vehicle_id')
    .get((req, res) => {
        adminController.getVehicleTypeById(req.params.vehicle_id).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })
//add  Car Types
adminRoute.route('/deleteVehicleType/:vehicleType_id')
    .get((req, res) => {
        adminController.deleteVehicleType(req.params.vehicleType_id).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })

    //add  Car Types
adminRoute.route('/getVehicleTypes')
    .post((req, res) => {
        adminController.getVehicleTypes(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })

    adminRoute.route('/getTypes')
    .get((req, res) => {
        adminController.getTypes().then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })
    
    // Edit VehicleType
adminRoute.route('/editVehicleType')
    .post((req, res) => {
        adminController.editVehicleType(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.EVENTADDSUCEESS
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })
//add  Events
adminRoute.route('/addEvent')
    .post((req, res) => {
        adminController.addEvent(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.EVENTADDSUCEESS

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })

// add  Events
adminRoute.route('/getEvents')
    .get((req, res) => {
        adminController.getEvents().then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })

// Delete Event
adminRoute.route('/deleteEvent')
    .post((req, res) => {
        adminController.deleteEvent(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.EVENTADDSUCEESS
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })
// Update vehicle 
adminRoute.route('/updateVehicle')
    .put(uploadMulti.fields([{ name: 'vehiclePics', maxCount: 6 }]), (req, res) => {

        adminController.updateVehicle(req.body, req.files).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.UPDATEMSG,
            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, success: CONSTANT.FALSE })
        })
    })
// Edit Event
adminRoute.route('/editEvent')
    .post((req, res) => {
        adminController.editEvent(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })

//Get Home Screen Data Counts
adminRoute.route('/getHomeScreenDataCounts')
    .get((req, res) => {
        adminController.getHomeScreenDataCounts().then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: {
                    totalUsers: result[0],
                    newUsers: result[1],
                    totalBookings: result[2],
                    newBookings: result[3]
                },

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })

//Get Home Screen Reports
adminRoute.route('/getHomeScreenReports')
    .get((req, res) => {
        adminController.getHomeScreenReports(req.query).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: {
                    totalUsers: result[0],
                    totalBookings: result[1]
                },

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })

//add  Coupons
adminRoute.route('/addCoupon')
    .post((req, res) => {
        adminController.addCoupon(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.ADDMSG

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })

//edit Coupon    
adminRoute.route('/editCoupon')
    .patch((req, res) => {
        adminController.editCoupon(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.UPDATEMSG,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

//Display Coupons
adminRoute.route('/displayCoupons')
    .get((req, res) => {
        adminController.getCoupons(req.query).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })

//Delete Coupon
adminRoute.route('/deleteCoupon/:coupon_id')
    .patch((req, res) => {
        adminController.deleteCoupon(req.params.coupon_id).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.DELETEMSG
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

//Display Categories
adminRoute.route('/displayCategory')
    .post((req, res) => {
        adminController.getCategory(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })

//Edit Categories
adminRoute.route('/editCategory')
    .patch(upload, (req, res) => {
        console.log('..........reqqqqq', req.file);
        adminController.editCategory(req.body, req.file).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })

    //Delete Categories
adminRoute.route('/deleteCategory/:category_id')
.put((req, res) => {
    adminController.deleteCategory(req.params.category_id).then(result => {
        return res.json({
            success: CONSTANT.TRUE,
            data: result
        })
    }).catch(error => {
        console.log(error);
        return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
    })
})

// //Edit Events
// adminRoute.route('/editEvent')
//     .patch((req, res) => {
//         adminController.editEvent(req.body).then(result => {
//             return res.json({
//                 success: CONSTANT.TRUE,
//                 data: result
//             })
//         }).catch(error => {
//             console.log(error);
//             return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
//         })
//     })

// Add Vehicle
adminRoute.route('/addVehicle')
    .post(uploadMulti.fields([{ name: 'vehiclePics', maxCount: 4 }, { name: 'verificationPhotos', maxCount: 6 }]), (req, res) => {
        adminController.addVehicle(req.body, req.files).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.VEHCILEADDSUCEESS
            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, success: CONSTANT.FALSE })
        })
    })

adminRoute.route('/getTax')
    .get((req, res) => {
        adminController.getTax().then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSE })
        })  
    })

adminRoute.route('/addTax')
    .post((req, res) => {
        adminController.addTax(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSE })
        })  
    })

adminRoute.route('/addPromo')
    .post((req, res) => {
        adminController.addPromo(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSE })
        })  
    })

adminRoute.route('/getPromos')
    .post((req, res) => {
        adminController.getPromos(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSE })
        })  
    })

adminRoute.route('/getPromo/:promo_id')
    .get((req, res) => {
        adminController.getPromoById(req.params.promo_id).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSE })
        })  
    })

adminRoute.route('/updatePromo')
    .put((req, res) => {
        adminController.updatePromo(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSE })
        })  
    })
     
    //Delete Categories
adminRoute.route('/deletePromo/:promo_id')
    .get((req, res) => {
        adminController.deletePromo(req.params.promo_id).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })

adminRoute.route('/addSecurity')
    .post((req, res) => {
        adminController.addSecurity(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSE })
        })  
    })

adminRoute.route('/getSecurity')
    .get((req, res) => {
        adminController.getSecurity(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSE })
        })  
    })
module.exports = adminRoute