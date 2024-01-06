const express = require("express")
const User = require("../models/user")
const router = new express.Router()



// create resource on users endpoint
router.post("/users", async (req, res) => {

    // req.body ->contains the object which client provides ,now it will go through validation and saved in mongoose database
    
    try {
        const newUser = new User(req.body)
        await newUser.save();
        res.status(201).send(newUser);
    } catch (error) {
        res.status(400).send(error);
    }
})


// reading resources at users endpoint
router.get('/users', async (req, res) => {

    try {
        const data =await User.find({})
        res.status(201).send(data)
    } catch (error) {
        res.status(500).send({
            reason: "internal server error",
            message: "our services are currently down"
        })
    }

})
// reading single resources at users endpoint, fetch individual user by id
router.get("/users/:id", async (req, res) => {
    try {
        const user_id = req.params.id
        const data = await User.findById(user_id);
        if (!data) {
            res.status(404).send()
        }
        res.send(data)
    } catch (error) {
        res.status(500).send({
            reason: "internal server error",
            message: "our services are currently down",
            error: error
        })
    }



})




//updating a user 
router.patch("/users/:id", async (req, res) => {

    const updates = Object.keys(req.body)
    const updateOperations = ["name", "age", "email", "password"]
    const isValidOperation = updates.every((update) => {
        return updateOperations.includes(update)
    })
    //if some invalid update is being performed or some values in database which are not changable
    if (!isValidOperation) {
       return res.status(400).send({ error: "Invalid update !!" })
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    try {
        //if user is not found
        if (!updatedUser) {
            res.status(404).send()
        }
        //all well ,nothing wrong happened
        res.send(updatedUser)
    } catch (error) {
        // case-1:error due to validation 
        res.status(400).send(error)
        // case-2:error due to server crash or internal server error
    }
})


//delete a user 
router.delete("/users/:userId", async (req, res) => {
    const deletedUser = await User.findByIdAndDelete(req.params.userId)

    try {
        if (!deletedUser) {
            res.status(404).send({ error: `no such user exists !! ` })
        }
        res.send(deletedUser)
    } catch (error) {
        res.status(500).send({
            reason: "internal server error",
            message: "our services are currently down",
            error: error
        })
    }
})



module.exports = router