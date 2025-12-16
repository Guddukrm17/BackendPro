import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"
import dotenv from "dotenv";

dotenv.config({
    path:'./.env'
});

console.log("Mongo URL:",process.env.MONGO_URL);

const connectDB=async()=>{
    try{
        const connnectionInstance=await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        console.log(`\n MONGODB connected !! DB HOST:${connnectionInstance.connection.host}`);
    }
    catch(error){
        console.log("MONGODB connection FAILED",error);
        process.exit(1)
     }
}

export default connectDB