const jwt = require("jsonwebtoken")
const User =require('../models/user')

const auth =async (req,res,next)=>{
try {
    //grab the token sent from client in the 'Authorization' header.we are using replace() to remove the 'Bearer ' part in the request header
    const token = req.header('Authorization').replace('Bearer ','')
    const decodedPayload=jwt.verify(token,'mySignature@Debmalya123')
    const user=await User.findOne({_id : decodedPayload._id , 'tokens.token':token})
    if(!user){
        throw new Error()
    }
    //when everything goes well-
    //1.route handler runs
    //2.give the route handler acces to the user info that we fetched fron database to save resouses of the server
    req.user=user
    next()
    
} catch (error) {
    //if client is not authenticated , we will not run the route handler and send back a 401 status code
    res.status(401).send({error : " Please Authenticate..."})
}

}
module.exports=auth