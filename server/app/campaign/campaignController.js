'use strict'
const CONSTANT = require('../../constant')
const commonController = require('../common/controllers/commonController')
const messageModel = require('../../models/message')
const brandModel = require('../../models/brands')
const campaignModel = require('../../models/campaign')
const targetModel = require('../../models/targetLocations')
const niches = require('../../models/niche')
const mongoose = require('mongoose')
const moment = require('moment');

class messageBroadcast {

    getBrands(data) {
        return new Promise((resolve, reject) => {
            let { type, name } = data
            if (!type) reject(CONSTANT.MISSINGUTYPENAME)
            else {
                if (type == 1) {
                    if (!name) reject("Please provide brand name")
                    else {
                        const brands = new brandModel({ name: name })
                        brands.save({}).then(brands => {
                            resolve(brands)
                        }).catch(err => {
                            console.log(err);

                        })
                    }

                }
                else {
                    brandModel.find({}).select('_id name').sort({ _id: -1 }).then(brands => {
                        resolve(brands)
                    }).catch(err => {
                        console.log(err);

                    })
                }

            }

        })
    }

    getNiches() {
        return new Promise(async (resolve, reject) => {
            let data = await niches.find({})
            resolve(data)
        })
    }

    getParticularCampaign(id) {
        return new Promise(async (resolve, reject) => {
            if (!id)
                reject("Please provide Campaign ID")
            let data = await campaignModel.aggregate([
                { $match: { "_id": mongoose.Types.ObjectId(id) } },


                {
                    $project:
                    {
                        creatorNiche: 1,
                        creatorNiche: 1,
                        targetLanguage: 1,
                        name: 1,
                        brandPromoting: 1,
                        dateForContentLive: 1,
                        awareness: 1,
                        campaignBudget: 1,
                        requirement: 1,
                        contentsFormat: 1,
                        hashtag: 1, content: 1,
                        createdAt: 1,
                        followingSize: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$followingSize", 1] }, then: "Small(5k-25k followers)" },
                                    { case: { $eq: ["$followingSize", 2] }, then: "Medium(25k-100k followers)" },
                                    { case: { $eq: ["$followingSize", 3] }, then: "Large(10k+ followers)" },


                                ]
                            }
                        },
                        ageGroups:
                        {
                            $map:
                            {
                                input: "$ageGroups",
                                as: "ageGroups",
                                in: {
                                    $switch: {
                                        branches: [
                                            { case: { $eq: ["$$ageGroups", 1] }, then: "17 - 19" },
                                            { case: { $eq: ["$$ageGroups", 2] }, then: "20-24" },
                                            { case: { $eq: ["$$ageGroups", 3] }, then: "25-29" },
                                            { case: { $eq: ["$$ageGroups", 4] }, then: "30 - 34" },
                                            { case: { $eq: ["$$ageGroups", 5] }, then: "35-39" },
                                            { case: { $eq: ["$$ageGroups", 6] }, then: "40-49" },
                                            { case: { $eq: ["$$ageGroups", 7] }, then: "50-49" },
                                            { case: { $eq: ["$$ageGroups", 8] }, then: "60+" },

                                        ]
                                    }
                                }
                            }
                        }
                    }
                },


            ])
            resolve(data)
        })
    }
    createTargetLocation(data) {
        return new Promise((resolve, reject) => {
            let { lat, long, name, campaignId } = data
            if (!lat || !long)
                reject("Please provide both longitude and latitude")
            else {
                var currentCoordinates = []
                var location = {}
                if (lat && long) {

                    currentCoordinates.push(Number(long))
                    currentCoordinates.push(Number(lat))
                    location.type = "Point";
                    location.coordinates = currentCoordinates

                }
                const target = new targetModel({
                    name: name,
                    location: location,
                    campaignId: campaignId
                })
                target.save({}).then(target => {
                    resolve(target)
                }).catch(err => {
                    console.log(err);

                })

            }

        })
    }

    createCampaign(body) {
        return new Promise((resolve, reject) => {
            let { companyId } = body

            if (!companyId)
                reject("Please provide CompanyId")
            const campaign = new campaignModel(body)
            campaign.save({}).then(campaign => {
                resolve(campaign)

            }).catch(err => {

                console.log(err);
                reject(err)

            })
        })
    }
    updateCampaign(body) {
        return new Promise((resolve, reject) => {
            let { campaignId, targetLanguage,
                campaignBudget, creatorNiche,
                contentsFormat, content, organicPost,
                requirement, whiteListBudget, hashtag } = body
            if (!campaignId)
                reject("Please Provide camapaign Id")
            else {
                let query = {}
                if (campaignBudget)
                    query.campaignBudget = campaignBudget
                if (creatorNiche)
                    query.creatorNiche = creatorNiche
                if (targetLanguage)
                    query.targetLanguage = targetLanguage
                if (contentsFormat)
                    query.contentsFormat = contentsFormat
                if (organicPost)
                    query.organicPost = organicPost
                if (whiteListBudget)
                    query.whiteListBudget = whiteListBudget
                if (requirement)
                    query.requirement = requirement
                if (content)
                    query.content = content
                if (hashtag)
                    query.hashtag = hashtag
                campaignModel.findOneAndUpdate({ _id: campaignId },
                    { $set: query }, { new: true }).then(update => {
                        resolve(update)
                    }).catch(err => {
                        console.log(err);

                    })
            }

        })

    }
}
module.exports = new messageBroadcast();