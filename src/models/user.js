//User model 
const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")


//making a schema manually to use middleware
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        age: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error("Age can't be a negative value")
                }
            }
        },
        email: {
            type: String,
            trim: true,
            unique:true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Email id isn't valid")
                }
            }
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 7,
            validate(value) {
                if (value.toLowerCase().includes("password")) {
                    throw new Error(`your password can't contain "password" string`)
                }
            }
        },
        tokens:[{
            token:{
                type:String,
                required:true
            }
        }]
    }
)

//virtual property of user model 'tasksOfUser' to establish relation with tasks from user
userSchema.virtual('tasksOfUser',{
    ref:'Tasks',
    localField:"_id",
    foreignField:'owner'
})


//instance method
userSchema.methods.generateAuthToken = async function(){
        const user=this
        const token = jwt.sign({_id:user._id.toString()},'mySignature@Debmalya123',{expiresIn:"4 weeks"})
        //saving token to the user database ,in case user want to logout later
        user.tokens=user.tokens.concat({token : token})
        await user.save()
        return token
}
userSchema.methods.toJSON = function(){
    //get the mongoose document using this keyword
    const user = this
    //convert the mongoose document to an object by using toObject() method of mongoose
    const userObject=user.toObject()
    //delete password , tokens, version from user object to hide private data of user
    delete userObject.password
    delete userObject.tokens
    delete userObject.__v

    return userObject
}
//model method
//now, User model will have access to findByCredentials() method
userSchema.statics.findByCredentials = async (email,password)=>{
        const user= await User.findOne({email:email})

        //when no user of given email exists
        if(!user){
                throw new Error("Unable to login")
        }
        const isMatch = await bcrypt.compare(password ,user.password)
        //when the hashed password don't match
        if(!isMatch){
            throw new Error("Unable to login")
        }

    //when user credential goes well,return the user 
    return user
}


//ALWAYS REMEMBER - you must add all middleware and plugins before calling mongoose.model() beacause calling pre() or post() after compiling a model does not work in Mongoose in general

//using pre method for doing something before "save" event

//hashing plain text password before saving
userSchema.pre('save', async function (next) {
    //this -> gives access to individual user that's about to be saved
    const user = this
    //if password is modified , we will override the value with new new hased password and even when we create a user for first time mongoose will consider password modified . so, both scenarios are covered
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    //if we don't run next , it will think we are still running some code and gonna hang forever
    next()
})


const User = mongoose.model("user", userSchema)



module.exports = User