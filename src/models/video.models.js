import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema=new mongoose.Schema(
    {
        videoFile:{
            type:String,//cloudiinary url
            required:true
        },
        thumbnail:{
            type:String,
            required:true
        },
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Number,
            default:0            
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }

},{truestamps:true})


videoSchema.plugin(mongooseAggregatePaginate)//ability to kaha se kaha tk kya dena hai 


export const Video=mongoose.model("Video",videoSchema)