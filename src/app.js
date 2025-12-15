import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()

app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
))

app.use(express.json({limit:"16kb"}))//jab form bhara tb
app.use(express.urlencoded({extended:true,limit:"16kb"
})) // url me space wagera ka code hota hai 

app.use(express.static("public")) //store image,doc in our database
app.use(cookieParser())

//import routes
import userRouter from "./routes/user.routes.js"


//router declaration
app.use("/api/v1/users",userRouter)

export default app