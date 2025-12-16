import asyncHandler from "../utils/asyncHandler.js"
// import User from "../models/user.models.js"
import ApiError from "../utils/ApiError.js"
import {User}from "../models/user.models.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"



const registerUser=asyncHandler(async(req,res)=>{
    //Step for Register
        //1.get user details from frontend
        //2.Vlaidation-not empty the field
        //3.check if user already exist by checking username or email
        //4.check for images,check for avatar
        //5.upload them to cloudinary,avatar
        //6.create user object-create entry in db 
        //7.remove password tand refresh token field from response
        //8.check the user  creation
        //9.return res

    

const {fullName,email,username,password}=req.body
console.log("Body:",req.body);
//console.log("email: ",email);

// if(fullName===""){
//     throw new ApiError(400,"fulname is required")
// }
if(
    [fullName,email,username,password].some((field)=>field?.trim()==="")
)
{
    throw new ApiError(400,"All fields are required")
}

const exitedUser=await User.findOne({
    $or:[{username},{email}]
})
if(exitedUser){
    throw new ApiError(409,"User with Username and email already exists")
}


const avatarLocalPath=req.files?.avatar[0]?.path;//here the avatar is taken from the multer which is exit or not 

console.log("Avatar",avatarLocalPath);

const coverImageLocalPath=req.files?.coverImage[0]?.path;


if(!avatarLocalPath){
    throw new ApiError(400,"Avatar is required")
}//avatar is required

const avatar=await uploadOnCloudinary(avatarLocalPath);
const coverImage=await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
    throw new ApiError(400,"Avatar is required")
}

//Agar sb kuch sahi hai to data base me entry maaar lo 
//way into database
const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
})

const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
)//mongodb jo hai khudh ki entry banata hai sbse aage "_" add kr deta hai like (user._id)
if(!createdUser){
    throw new ApiError(500,"Soomething went Worng")
}

return res.status(201).json(
    new ApiResponse(200,createdUser,"User register succesfully")
)
})


export default registerUser