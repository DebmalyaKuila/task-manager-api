const mongoose =require("mongoose")
const validator=require("validator")

//Task model
const Task =mongoose.model("Tasks",
{
description :{
    type : String,
    required:true,
    trim :true
},
completed :{
    type: Boolean,
    default:false
},
owner:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'user'
}
})

module.exports=Task