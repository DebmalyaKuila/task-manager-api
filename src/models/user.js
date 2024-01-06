//User model 
const mongoose =require("mongoose")
const validator=require("validator")

const User=mongoose.model("user",{
    name :{
        type : String,
        required :true,
        trim:true
    },
    age :{
        type : Number,
        default : 0,
        validate(value){
            if(value<0){
                throw new Error("Age can't be a negative value")
            }
        }
    },
    email :{
        type : String,
        trim :true,
        validate(value){
if (!validator.isEmail(value)) {
    throw new Error("Email id isn't valid")
}
        }
    },
    password :{
        type : String,
        required: true,
        trim :true,
        minlength :7,
        validate(value){
if (value.toLowerCase().includes("password")) {
    throw new Error(`your password can't contain "password" string`)
}
        }
    }
})

module.exports=User