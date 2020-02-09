const express = require('express')
const campaignController = require('./campaignController')
const CONSTANT = require('../../constant')
const companyAuth = require('../middlewares/authcompany')
let campaignRoute = express.Router()





//CREATE CAMPAIGN
campaignRoute.route('/createCampaign')
    .post(companyAuth, (req, res) => {
        req.body.companyId = req.headers.userId
        campaignController.createCampaign(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })
//Create brands

campaignRoute.route('/getBrands')
    .post((req, res) => {
        campaignController.getBrands(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })


//Create brands

campaignRoute.route('/getNiches')
    .get((req, res) => {
        campaignController.getNiches().then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })

//get particular campaign

campaignRoute.route('/getParticularCampaign/:campaignId')
    .get(companyAuth, (req, res) => {
        campaignController.getParticularCampaign(req.params.campaignId).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })


campaignRoute.route('/createTargetLocation')
    .post((req, res) => {
        campaignController.createTargetLocation(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })


campaignRoute.route('/updateCampaign')
    .put((req, res) => {
        campaignController.updateCampaign(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUESTATUS,
                data: result
            })
        }).catch(error => {
            console.log(error);
            return res.json({ message: error, success: CONSTANT.FALSESTATUS })
        })
    })
module.exports = campaignRoute;