const foodPartnerModel = require('../models/foodpartner.model');
const userModel = require('../models/user.model');
const JWT=require('jsonwebtoken');



async function authFoodPartnerMiddleware(req,res,next){
                  const token=req.cookies.token;
                 


                    if(!token){
                        return res.status(401).json({
                            message:"Unauthorized! No token provided"
                        })
                    }
                    try{
                       const decoded =JWT.verify(token,process.env.JWT_SECRET)
                          const foodPartner=await foodPartnerModel.findById(decoded.foodPartnerId);


                          req.foodPartner=foodPartner
                          next()


                    }
                    catch(err){

                        return res.status(401).json({
                            message:"Unauthorized! Invalid token"
                        })
                    }




}


async function authUserMiddleware(req,res,next){
     const token=req.cookies.token;
                    if(!token){
                        return res.status(401).json({
                            message:"Unauthorized! No token provided"
                        })
                    }
                    try{
                          const decoded =JWT.verify(token,process.env.JWT_SECRET)
                            const user=await userModel.findById(decoded.userId);
                            req.user=user
                            next()
                    }
                    catch(err){
                        return res.status(401).json({
                            message:"Invalid token"
                        })
                    }

                          
}

module.exports={authFoodPartnerMiddleware,
    authUserMiddleware
}