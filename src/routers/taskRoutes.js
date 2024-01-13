const express = require("express")
const Task = require("../models/task")
const auth = require("../middleware/auth")
const router = new express.Router()

// create resource on tasks endpoint
router.post("/tasks", auth, async (req, res) => {
    const newTask = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        const data = await newTask.save();
        res.status(201).send(data);
    } catch (error) {
        res.status(400).send(error);
    }

})




//GET /tasks--> reading all tasks of user
//GET /tasks?completed=true --> reading completed tasks of user (filtering)
//GET /tasks?completed=false --> reading not completed tasks of user (filtering)
router.get("/tasks", auth, async (req, res) => {
        const match ={}
        if (req.query.completed) {
            //req.query.completed returns true/false as string , not as boolean .That's why I converted it to boolean by using this way  and set completed key of match object as boolean
           
            match.completed = (req.query.completed === 'true')
        }
    try {
        const user=req.user
        // const data=await Task.find({owner:user._id})
        await user.populate({
            path :'tasksOfUser',
            match : match
        })
        res.send(user.tasksOfUser)
    } catch (error) {
        res.status(500).send({
            reason: "internal server error",
            message: "our services are currently down",
            error: error
        })
    }

})

// reading single resources at tasks endpoint by a user, fetch individual task by id 
router.get("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id

    try {
        const data = await Task.findOne({ _id: _id, owner: req.user._id })
        if (!data) {
            return res.status(404).send()
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

//updating a task of a user
router.patch("/tasks/:id",auth, async (req, res) => {

    const updates = Object.keys(req.body)
    //specifying allowed update operations
    const allowedUpdateOperations = ["description", "completed"]
    //determine whether the update operation is valid or not 
    const isValidOperation = updates.every((update) => {
        return allowedUpdateOperations.includes(update)
    })
    //if some invalid update is being performed or some values in database which are not changable
    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid update !!" })
    }
    const _id =req.params.id
    try {
        // const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        const task = await Task.findOne({_id , owner:req.user._id})
        //if user's task is not found
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach(update => {
            task[update]=req.body[update]
        });
        await task.save()
        //all well ,nothing wrong happened
        res.send(task)
    } catch (error) {
        // case-1:error due to validation 
        res.status(400).send(error)
        // case-2:error due to server crash or internal server error
    }
})

//delete a task created by a specific user 
router.delete("/tasks/:id",auth, async (req, res) => {
    const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})

    try {
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        res.status(500).send({
            reason: "internal server error",
            message: "our services are currently down",
            error: error
        })
    }
})





module.exports = router