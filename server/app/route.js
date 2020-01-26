const express = require("express");
const influencer = require('./influencer/influencerRoutes/influencerRoutes')
const comapany = require('./comapany/comapanyRoutes/comapanyRoutes')
const admin = require('../app/admin/adminRoutes/adminRoutes')
const message = require('../app/message/messageRoutes')

const rentRoutes = express.Router()
rentRoutes.use('/influencer', influencer)
rentRoutes.use('/company', comapany)
rentRoutes.use('/admin', admin)
rentRoutes.use('/message', message)

module.exports = rentRoutes;