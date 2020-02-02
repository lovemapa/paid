const express = require("express");
const influencer = require('./influencer/influencerRoutes/influencerRoutes')
const comapany = require('./company/comapanyRoutes/comapanyRoutes')
const admin = require('../app/admin/adminRoutes/adminRoutes')
const campaign = require('./campaign/campaignRoutes')

const rentRoutes = express.Router()
rentRoutes.use('/influencer', influencer)
rentRoutes.use('/company', comapany)
rentRoutes.use('/admin', admin)
rentRoutes.use('/campaign', campaign)

module.exports = rentRoutes;