const express = require("express")
const Task = require("../models/task")
const auth = require("../middleware/auth")
const router = new express.Router()

// create resource on tasks endpoint
router.post("/tasks",auth, async (req, res) => {
    const newTask = new Task({
        ...req.body,
        owner:req.user._id
    })

    try {
        const data=await newTask.save();
        res.status(201).send(data);
    } catch (error) {
        res.status(400).send(error);
    }

})




// reading resources at tasks endpoint
router.get("/tasks", async(req, res) => {
    
    try {
        const data=Task.find({})
        res.send(data)
    } catch (error) {
        res.status(500).send({
            reason: "internal server error",
            message: "our services are currently down",
            error: err
        })
    }

})
// reading single resources at tasks endpoint, fetch individual task by id
router.get("/tasks/:id", async(req, res) => {
    const _id = req.params.id

    try {
        const data=await Task.findById(_id)
        if (!data) {
            res.status(404).send({error :"no such task found !!"})
        }
        res.send(data)
    } catch (error) {
        res.status(500).send({
            reason: "internal server error",
            message: "our services are currently down",
            error: err
        })
    }
})

//updating a task 
router.patch("/tasks/:id", async (req, res) => {

    const updates = Object.keys(req.body)
    const updateOperations = ["description", "completed"]
    const isValidOperation = updates.every((update) => {
        return updateOperations.includes(update)
    })
    //if some invalid update is being performed or some values in database which are not changable
    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid update !!" })
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    try {
        //if user is not found
        if (!updatedTask) {
            res.status(404).send()
        }
        //all well ,nothing wrong happened
        res.send(updatedTask)
    } catch (error) {
        // case-1:error due to validation 
        res.status(400).send(error)
        // case-2:error due to server crash or internal server error
    }
})

//delete a task
router.delete("/tasks/:id", async (req, res) => {
    const deletedTask = await Task.findByIdAndDelete(req.params.id)

    try {
        if (!deletedTask) {
            res.status(404).send({ error: `no such task exists !! ` })
        }
        res.send(deletedTask)
    } catch (error) {
        res.status(500).send({
            reason: "internal server error",
            message: "our services are currently down",
            error: error
        })
    }
})





module.exports = router