let constant = {
    TRUESTATUS: 1,
    FALSESTATUS: 0,
    MISSINGPARAMS: 'Please provide  params',
    EVENTALREADYADDED: 'Event exists',
    MISSINGEVENT: 'Please provide  event type',
    MISSINGVEHCILE: 'Either missing VehicleID or (Address latitude or longitude) or UserId',
    MISSINGCONTACT: "Please provide both Country Code and Contact Number",
    MISSINGPARAMSORFILES: 'Params are missing',
    CHANGEPASSWORDLINK: 'Link for change password has been sent on your email',
    NOCONTACTS: 'Phone Number not associated with any account',
    TRUE: true,
    FALSE: false,
    NOTEXISTS: 'User doesnt exist',
    VEHCILEADDSUCEESS: "Vehicle added successfully",
    USERADDSUCEESS: "User added successfully",
    OWNERADDSUCEESS: "Owner added successfully",
    EVENTADDSUCEESS: "Event added successfully",
    VERFIEDTRUE: 'Verfied Success',
    VERFIEDFALSE: 'tokens dont match',
    TRUEMSG: 'Successful',
    FALSEMSG: 'Please try again later',
    SENTMSG: 'Sent successfully',
    INVALIDPARAMS: 'Invalid parameters',
    BOOKSUCCESSFULL: 'Booking created successfully',
    ISSUESUCCESSFULLY: 'Issue created succefully',
    EMAILPASSWORDPARAMS: 'Provide both email and password',
    CODEUSED: 'Code already used',
    VERIFYMAIL: 'Verification Link has been sent on your mail',
    REMOVEFAV: 'Removed from favourites',
    NOTREGISTERED: 'This email not registered with any account',
    OWNERIDMISSING: "Owner Id missing",
    USERIDMISSING: "User Id missing",
    VEHCILEIDMISSING: "Vehicle Id missing",
    NOTVERIFIED: 'Your email is not Verified yet',
    NOTADMINVERIFIED: 'Yet to be verified by admin',
    WRONGCODEUSED: 'Verification code is not correct.',
    EXISTSMSG: 'Email or Phone Number associated with another account',
    UNIQUEEMAILANDUSERNAME: 'Email already taken , Provide unique email',
    VERIFYPENDING: 'Your account verification pending.',
    VERIFYDENY: 'Your document verification declined',
    DISABLEACCOUNT: 'Your account is disable by admin',
    SOMETHINGWRONG: 'Something went wrong. Please try again later',
    NOTAUTHERIZED: 'You can not verify driver account',
    ADDMSG: 'Added successfully',
    UPDATEMSG: 'Updated sucessfully',
    ADDSUCCESS: 'Uploaded Successfully',
    ADDFAIL: 'Something went wrong while uploading',
    SAVEMSG: 'Saved sucessfully',
    ACCEPTREQUEST: 'Request Accepted',
    REQUESTDECLINE: 'Request Declined',
    DELETEMSG: 'Deleted sucessfully',
    NOFILEMSG: 'No file selected',
    SCHEDULEMSG: 'Booking schedule successfully',
    CARDALREADYADDED: 'Card already added',
    NOTAXINEARBY: 'No taxi available nearby, Please try after some time',
    LATEMSG: 'Oops you are late this time..',
    CANCELREQUESTMSG: 'Request Cancel by User',
    HELPCENTER: 'Your help request succefully submited',
    LIMIT: 30,
    INVALIDCODE: 'You have entered invalid code',
    INVALIDCOUPON: 'This coupon code is not valid',
    INVALIDPROMO: 'This promo code is not valid',
    DISABLECODE: 'Discount not available on this code',
    EXPIREDCODE: 'Promocode expired',
    ALREADYUSEDCODE: 'Promocode already Used',
    REACHEDCODELIMIT: 'You have reached usage limit,You can not used this code.',
    NOTSAMEPASSWORDS: "Passwords don't match",
    WRONGOLDPASS: 'Wrong Old Password',
    FILEMISSING: 'Files missing',
    WRONGCREDENTIALS: 'Wrong credentials',
    NOTVERIFIEDLOGIN: 'Sorry you can`t login. Verfiy first ',
    LOGINSUCCESS: 'You have logged in successfully ',
    NOPASSWORDPROVIDED: 'Please Provide Password',
    SIGNUPSUCCESS: 'Account created Successfully',
    ERRORLOGINMESSAGE: 'Email or password is incorrect.',
    RATING: 'Rating successfully submit',
    NOTIFICATIONSTATUS: 'Notification setting successfully updated',
    ERR: 'Something went wrong please try again later.',
    YOUCANNOTUPLOADMORETHENFOUR: "You can`t upload more then four douments.",
    BOOKING_STATUS: {
        PENDING: 1,
        ACCEPTED: 2,
        REJECTED: 3,
        PICKUP_IN_PROGRESS: 4,
        TRIP_IN_PROGRESS: 5,
        COMPLETED: 6,
        CLOSED: 7,
        CANCEL: 8
    },

    BOOKING_STATUS_ARR: [1, 2, 3, 4, 5, 6, 7],

    DISCOUNT_TYPE: {
        PERCENTAGE: 1,
        FLAT: 2
    },

    DISCOUNT_TYPE_ARR: [1, 2]

}

module.exports = constant