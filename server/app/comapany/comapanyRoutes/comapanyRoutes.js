const express = require('express')
const companyController = require('../comapanyControllers/comapanyController')
const companyAuth = require('../../middlewares/authcompany')
const CONSTANT = require('../../../constant')

const rn = require('random-number')
const multer = require('multer');



const storage = multer.diskStorage({
  destination: process.cwd() + "/server/public/uploads/",
  filename: function (req, file, cb) {

    cb(
      null,
      "img_"
      +
      Date.now() +
      ".jpeg"
    );
  }
});
const upload = multer({ storage: storage })

let companyRoute = express.Router()


// Save Details of user
companyRoute.route('/register')
  .post((req, res) => {
    companyController.signUp(req.body, req.files).then(result => {
      return res.json({
        success: CONSTANT.TRUESTATUS, user: result.result, message: CONSTANT.SIGNUPSUCCESS
      })
    }).catch(error => {
      console.log(error);

      return res.json({ message: error, success: CONSTANT.FALSE })
    })

  })

// logout user
companyRoute.route('/logout/:userId')
  .get((req, res) => {
    companyController.logout(req.params.userId).then(result => {
      return res.json({
        success: CONSTANT.TRUE,
        user: result
      })
    }).catch(error => {
      console.log(error);

      return res.json({ message: error, success: CONSTANT.FALSE })
    })

  })


// User Login Email Password
companyRoute.route('/login')
  .post((req, res) => {

    companyController.login(req.body).then(result => {
      return res.json({
        success: CONSTANT.TRUE, message: CONSTANT.LOGINSUCCESS, user: result
      })
    }).catch(error => {
      console.log("error", error);
      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })





//update User Details
companyRoute.route('/updateCompany').
  put(companyAuth, upload.fields([{ name: 'profilePic', maxCount: 1 }]), (req, res) => {
    companyController.updateCompany(req.body, req.files).then(update => {

      return res.json({
        success: CONSTANT.TRUE,
        message: CONSTANT.UPDATEMSG,
        newEmail: update.newEmail,
        user: update.user
      })
    }).catch(error => {
      console.log(error);

      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })

//update User Details
companyRoute.route('/getCompanyProfile/:userId').
  get(companyAuth, (req, res) => {
    companyController.getCompanyProfile(req.params.userId).then(result => {

      return res.json({
        success: CONSTANT.TRUE,
        user: result
      })
    }).catch(error => {
      console.log(error);

      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })






companyRoute.route('/forgetpassword').
  get((req, res) => {
    if (!(req.query.user || req.query.token)) {
      res.redirect('/server/app/views/404-page')
    }
    let message = req.flash('errm');
    console.log("messagev", message);

    res.render('forgetPassword', { title: 'Forget password', message })
  })





//Forgot Password

companyRoute.route('/forget-password')
  .post((req, res) => {

    companyController.forgotPassword(req.body).then(result => {
      return res.json({
        success: CONSTANT.TRUE,
        message: CONSTANT.CHANGEPASSWORDLINK

      })
    }).catch(error => {
      console.log("error", error);

      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })


// Verify Passowrd

companyRoute.route('/forgetpassword').
  post((req, res) => {
    companyController.forgetPasswordVerify(req.body, req.query).then(
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



// Get list of service List
// companyRoute.route('/servicesList')
//   .post((req, res) => {
//     companyController.servicesList(req.body).then(result => {
//       return res.send({
//         success: CONSTANT.TRUE,
//         data: result
//       })
//     }).catch(err => {
//       console.log(err);
//       return res.json({ message: err, success: CONSTANT.FALSE })
//     })
//   })

//Get list of particular service Provider
// companyRoute.route('/servicesList/:_id')
//   .get((req, res) => {
//     companyController.displayProfile(req.params._id).then(result => {
//       return res.send({
//         success: CONSTANT.TRUE,
//         data: result
//       })
//     }).catch(err => {
//       console.log(err);
//       return res.json({ message: err, success: CONSTANT.FALSE })
//     })
//   })

//Create Booking
companyRoute.route('/createBooking')
  .post((req, res) => {
    companyController.createBooking(req.body).then(result => {
      return res.send({
        success: CONSTANT.TRUE,
        data: result,
        message: CONSTANT.BOOKSUCCESSFULL
      })
    }).catch(err => {
      console.log(err);
      return res.json({ message: err, success: CONSTANT.FALSE })
    })
  })

//Get request List
companyRoute.route('/getRequestList')
  .post((req, res) => {
    companyController.getRequestList(req.body).then(result => {
      return res.send({
        success: CONSTANT.TRUE,
        data: result
      })
    }).catch(err => {
      console.log(err);
      return res.json({ message: err, success: CONSTANT.FALSE })
    })
  })

//add Favourites
companyRoute.route('/addFavourites')
  .patch((req, res) => {
    companyController.addFavourites(req.body).then(result => {
      return res.send({
        success: CONSTANT.TRUE,
        data: result,
        message: CONSTANT.ADDMSG
      })
    }).catch(err => {
      console.log(err);
      return res.json({ message: err, success: CONSTANT.FALSE })
    })
  })


// Show Favourites List
companyRoute.route('/showFavourites/:_id')
  .get((req, res) => {
    companyController.showFavourites(req.params._id).then(result => {
      return res.send({
        success: CONSTANT.TRUE,
        data: result

      })
    }).catch(err => {
      console.log(err);
      return res.json({ message: err, success: CONSTANT.FALSE })
    })
  })

//Remove Favourites
companyRoute.route('/removeFavourites/:serviceId')
  .delete((req, res) => {
    companyController.removeFavourites(req.params.serviceId).then(result => {
      return res.send({
        success: CONSTANT.TRUE,
        message: CONSTANT.REMOVEFAV
      })
    }).catch(err => {
      console.log(err);
      return res.json({ message: err, success: CONSTANT.FALSE })
    })
  })

//Provide Ratings to service
companyRoute.route('/provideServiceRatings')
  .patch((req, res) => {
    companyController.provideServiceRatings(req.body).then(result => {
      return res.send({
        success: CONSTANT.TRUE,
        message: CONSTANT.UPDATEMSG
      })
    }).catch(err => {
      console.log(err);
      return res.json({ message: err, success: CONSTANT.FALSE })
    })
  })

//Add issue by service
companyRoute.route('/addIssue')
  .post(upload.fields([{ name: 'issueimage', maxCount: 1 }]), (req, res) => {
    companyController.addIssue(req.body, req.files).then(result => {
      return res.send({
        success: CONSTANT.TRUE,
        data: result,
        message: CONSTANT.ISSUESUCCESSFULLY
      })
    }).catch(err => {
      console.log(err);
      return res.json({ message: err, success: CONSTANT.FALSE })
    })
  })

//get Nearby Cars
companyRoute.route('/getNearbyCars')
  .post((req, res) => {
    companyController.getNearbyCars(req.body).then(result => {
      return res.send({
        success: CONSTANT.TRUE,
        data: result,
        message: CONSTANT.ISSUESUCCESSFULLY
      })
    }).catch(err => {
      console.log(err);
      return res.json({ message: err, success: CONSTANT.FALSE })
    })
  })

companyRoute.route('/changePassword').
  put((req, res) => {
    companyController.changePassword(req.body).then(result => {
      return res.json({
        success: CONSTANT.TRUE, message: CONSTANT.UPDATEMSG, user: result
      })
    }).catch(error => {
      console.log("error", error);

      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })
// get user promo code
companyRoute.route('/getUserPromoCode')
  .post((req, res) => {
    companyController.getUserPromoCode(req.body).then((result, count) => {
      return res.json({
        success: CONSTANT.TRUE,
        data: result,
        count: count
      })
    }).catch(error => {
      console.log(error);
      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })

//Apply promo
companyRoute.route('/applyPromo').
  post((req, res) => {
    companyController.applyPromo(req.body).then(result => {
      return res.json({
        success: CONSTANT.TRUE,
        data: result
      })
    }).catch(error => {
      console.log("error", error);

      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })
//Apply Coupon
companyRoute.route('/applyCoupon').
  post((req, res) => {
    companyController.applyCoupon(req.body).then(result => {
      return res.json({

        success: CONSTANT.TRUE,
        data: result
      })
    }).catch(error => {
      console.log("error", error);

      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })

// companyController.cronJob()

//Get booking request List
companyRoute.route('/bookings')
  .post((req, res) => {
    companyController.getBookingsList(req.body).then((result, totalItem) => {
      return res.send({
        success: CONSTANT.TRUE,
        data: result,
        totalItem: totalItem
      })
    }).catch(err => {
      console.log(err);
      return res.json({ message: err, success: CONSTANT.FALSE })
    })
  })

//Get past booking request List
companyRoute.route('/pastBookings')
  .post((req, res) => {
    companyController.getPastBookingsList(req.body).then((result, totalItem) => {
      return res.send({
        success: CONSTANT.TRUE,
        data: result,
        totalItem: totalItem
      })
    }).catch(err => {
      console.log(err);
      return res.json({ message: err, success: CONSTANT.FALSE })
    })
  })

//helpCenter api
companyRoute.route('/helpCenter').
  post(upload.fields([{ name: 'image', maxCount: 1 }]), (req, res) => {
    companyController.helpCenter(req.body, req.files).then(result => {
      return res.json({
        success: CONSTANT.TRUE,
        data: result,
        message: CONSTANT.HELPCENTER
      })
    }).catch(error => {
      console.log("error", error);

      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })

//Get past booking request List
companyRoute.route('/rating')
  .post((req, res) => {
    companyController.rating(req.body).then(result => {
      return res.send({
        success: CONSTANT.TRUE,
        data: result
      })
    }).catch(err => {
      console.log(err);
      return res.json({ message: err, success: CONSTANT.FALSE })
    })
  })

companyRoute.route('/notificationSetting')
  .post((req, res) => {
    companyController.notification(req.body).then(result => {
      return res.send({
        success: CONSTANT.TRUE,
        message: CONSTANT.NOTIFICATIONSTATUS,
        data: result
      });
    }).catch(err => {
      console.log(err);
      return res.json({ message: err, success: CONSTANT.FALSE })
    })
  })

//get notification of particular owner
companyRoute.route('/booking/:bookingId')
  .get((req, res) => {
    companyController.getBookingsById(req.params.bookingId).then(item => {
      return res.json({
        success: CONSTANT.TRUE,
        data: item.result,
        isRated: item.isRated
      })
    }).catch(error => {
      console.log(error);
      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })

// get user by Referral code
companyRoute.route('/getUserByReferral')
  .post((req, res) => {
    companyController.getBookingsByReferral(req.body).then(result => {
      return res.json({
        success: CONSTANT.TRUE,
        data: result
      })
    }).catch(error => {
      console.log(error);
      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })

// get review
companyRoute.route('/review')
  .post((req, res) => {
    companyController.getReview(req.body).then((result, count) => {
      return res.json({
        success: CONSTANT.TRUE,
        data: result,
        count: count
      })
    }).catch(error => {
      console.log(error);
      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })


// get user promo code
companyRoute.route('/getUserPromoCode')
  .post((req, res) => {
    companyController.getUserPromoCode(req.body).then((result, count) => {
      return res.json({
        success: CONSTANT.TRUE,
        data: result,
        count: count
      })
    }).catch(error => {
      console.log(error);
      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })

// get review
companyRoute.route('/addPromoToUser')
  .post((req, res) => {
    companyController.addPromoToUser(req.body).then((result, count) => {
      return res.json({
        success: CONSTANT.TRUE,
        data: result,
        count: count
      })
    }).catch(error => {
      console.log(error);
      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })
companyRoute.route('/cancleBooking')
  .post((req, res) => {
    companyController.cancleBooking(req.body).then(result => {
      return res.json({
        success: CONSTANT.TRUE,
        data: result
      })
    }).catch(error => {
      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })

companyRoute.route('/notify')
  .get((req, res) => {
    companyController.notify().then(result => {
      return res.json({
        success: CONSTANT.TRUE,
        data: result
      })
    }).catch(error => {
      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })
//get user detail by id
companyRoute.route('/:userId')
  .get((req, res) => {
    companyController.displayUserInfo(req.params.userId).then(result => {
      return res.json({
        success: CONSTANT.TRUE,
        data: result
      })
    }).catch(error => {
      console.log(error);

      return res.json({ message: error, success: CONSTANT.FALSE })
    })
  })

module.exports = companyRoute;