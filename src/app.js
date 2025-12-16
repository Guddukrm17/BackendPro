import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from "./db/db.js"
import userRouter from "./routes/user.routes.js"

const app=express()

app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
))

connectDB();

app.use(express.json({limit:"16kb"}))//jab form bhara tb
app.use(express.urlencoded({extended:true,limit:"16kb"
})) // url me space wagera ka code hota hai 

app.use(express.static("public")) //store image,doc in our database
app.use(cookieParser())

//router declaration
app.use("/api/v1/users",userRouter)

const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Bakend is running ${PORT}`)
})

export default app