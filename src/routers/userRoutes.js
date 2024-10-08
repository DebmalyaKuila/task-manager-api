const express = require("express")
const User = require("../models/user")
const auth = require("../middleware/auth")
const router = new express.Router()
const Task =require('../models/task')
const sharp= require("sharp")
const multer=require("multer")



// create resource on users endpoint (user signup)
router.post("/users", async (req, res) => {

    // req.body ->contains the object which client provides ,now it will go through validation and saved in mongoose database

    try {
        const newUser = await new User(req.body)
        await newUser.save();
        const token = await newUser.generateAuthToken();
        res.status(201).send({ user: newUser, token: token });
    } catch (error) {
        res.status(400).send(error);
    }
})

//user login
//when user try to log in
router.post("/users/login", async (req, res) => {

    try {
        //1.we find the user by given credentials
        const user = await User.findByCredentials(req.body.email, req.body.password)
        //findByCredentials() is a method defined by us , which is a reusable function 
        //2.we generate a token for the user who's trying to login and saving it to te database
        const token = await user.generateAuthToken()
        //get the generated token from a reusable function generateAuthToken(), which I created
        res.send({ user, token })
    } catch (error) {
        res.status(400).send()

    }
})

//user logout
//when user want to logout from current device
router.post('/users/logout', auth, async (req, res) => {
    try {
        const sessionToken = req.token
        const user = req.user
        user.tokens = user.tokens.filter((token) => {
            if (token.token !== sessionToken) {
                return true
            }
        })
        await user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})
//when user want to logout from all devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        const user = req.user
        user.tokens = []
        await user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

// for currently authenticated user , user this route to get your own profile info
router.get('/users/me', auth, async (req, res) => {

    try {
        const myProfileData = req.user
        res.send(myProfileData)
    } catch (error) {
        res.status(500).send({
            reason: "internal server error",
            message: "our services are currently down"
        })
    }

})



//updating my own profile
router.patch("/users/me",auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const updateOperations = ["name", "age", "email", "password"]
    const isValidOperation = updates.every((update) => {
        return updateOperations.includes(update)
    })
    //if some invalid update is being performed or some values in database which are not changable
    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid update !!" })
    }

    try {
        // const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        //to make use of mongoose middleware , I made this change 
        const updateUser = req.user
        updates.forEach((update) => {
            updateUser[update] = req.body[update]
        })
        await updateUser.save()
        res.send(updateUser)
    } catch (error) {
        // case-1:error due to validation 
        res.status(400).send(error)
        // case-2:error due to server crash or internal server error
    }
})

//delete my own profile
router.delete("/users/me", auth,async (req, res) => {
    try {
        const user=req.user
        await User.findByIdAndDelete(user._id)
        //when user is deleted , tasks of user should also be deleted
        await Task.deleteMany({owner:user._id})
        res.send(user)
    } catch (error) {
        res.status(500).send({
            reason: "internal server error",
            message: "our services are currently down"
        })
    }
})

//configure multer to upload profile image
const upload = multer({
    limits : {
        //only allow files of 5 MB 
        fileSize : 5000000 // 5Mb in bytes
    },
    fileFilter(req , file , cb) {
        //how to work with callback function cb?
        //cb(undefined,true) -> upload the file
        // cb(new Error("file must be PDF")) -> send back an error to the user who uploaded the file
        //cb(undefined,false) -> silently reject the file (genereally not practically used)

        //only allow png , img ,jpg ,jpeg files
        if(!file.originalname.match(/\.(png|img|jpg|jpeg)$/)){
            return cb(new Error("Please upload an image"))
        }
        cb(undefined,true)
    }
    
})

//upload profile picture of the user -> multer middleware will look for a file called "profilePic" in request and when multer finds it , file will be stored in the directory according to dest option in upload
router.post("/users/me/avatar" , auth , upload.single("avatar") , async (req,res)=>{
    try {
        //normalize all uploaded files to pnf and also resize them using sharp and convert that back to binary buffer data
        const buffer = await sharp(req.file.buffer).resize({width:250 , height:250}).png().toBuffer()
        req.user.avatar=buffer
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send({
            reason: "internal server error",
            message: "our services are currently down"
        })
    }
},(error,req,res,next)=>{
    res.status(400).send({
        error:error.message
    })
})


//delete my profile picture
router.delete("/users/me/avatar" , auth , async (req,res)=>{
    try {
        req.user.avatar=undefined
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send({
            reason: "internal server error",
            message: "our services are currently down"
        })
    }
})

//get my profile picture
router.get("/users/me/avatar",auth , async(req,res)=>{
    try {
        const user=req.user
        if(!user || !user.avatar)throw new Error()
        res.set('Content-Type','image/png').send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }

})

module.exports = router