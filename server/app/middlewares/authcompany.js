const Jwt = require('jsonwebtoken');
const privateKey = process.env.JWTOKEN;
const UserModel = require('../../models/company');
module.exports = (req, res, next) => {
    var token;
    var companyToken;

    if (req.headers && req.headers.token) {

        const credentials = req.headers.token;
        token = credentials;
        companyToken = credentials;
    } else {
        return res.status(403).json({
            resStatus: 0, resMessage: 'ACCESS DENIED !! You are not authorize to access this Resource',
        });
    }
    Jwt.verify(token, privateKey, (err, token) => {
        if (err) { return res.status(401).json({ resStatus: 0, resMessage: 'The token is not valid', }); }
        else {
            //    console.log(`token details `, token, token.id, ` req.headers.token `, req.headers.token);
            UserModel.findOne({ "_id": token.id, token: req.headers.token }, (err, user) => {
                if (err) { return res.json({ status: 0, message: "Error in Finding User" }) }
                //   console.log(`user  in jwt   +_+_+_  `, user);
                if (!user) { return res.json({ status: 2, message: "Loggin on Other Device" }) }

                req.token = token;
                req.companyToken = companyToken
                next()
            })
        };
    });
}; 
