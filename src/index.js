const express = require("express")
require("./db/mongoose")
const userRouter=require("./routers/userRoutes")
const taskRouter = require("./routers/taskRoutes")

const app = express()
const port = process.env.PORT || 3000;


// configuring express to automatically parse the incoming json for us so that we have it as an object which we can use 
app.use(express.json())
//api endpoints
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log("server is up and running on port " + port);
})

