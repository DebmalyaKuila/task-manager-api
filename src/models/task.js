const mongoose = require("mongoose")
const validator = require("validator")

//Task schema
const taskSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
            trim: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'user'
        }
    },
    {
        timestamps:true
    }
)

//Task model
const Task = mongoose.model("Tasks", taskSchema)

module.exports = Task