import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const likeSchema=new mongoose.Schema(
    {
        video:{
           type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        },
        comment:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        },
        tweet:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Tweet"
        },
        likeBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    },{timestamps:ture})

export const Like=mongoose.model("Like",likeSchema)