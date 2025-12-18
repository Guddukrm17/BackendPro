import asyncHandler from "../utils/asyncHandler.js"
// import User from "../models/user.models.js"
import ApiError from "../utils/ApiError.js"
import {User}from "../models/user.models.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import { channel } from "diagnostics_channel"



const generateAccessAndRefereshTokens=async(userId)=>{
    try{
        const user= await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})//save in mongodb
        return {accessToken,refreshToken}
    }
    catch(error){
        throw new ApiError(500,"Something went Wrong")
    }
}



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
const coverImageLocalPath=req.files?.coverImage?.[0]?.path;

// let coverImageLocalPath;
// if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
//     coverImageLocalPath=req.files.coverImage[0].path
// }


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

const loginUser=asyncHandler(async(req,res)=>{
    //request body se data lawo 
    //username or email
    //find the userbase
    //validate the user exists
    //check the password
    //access and refresh token
    //send cookie

    const {email,username,password} =req.body 
    console.log(email)
    if(!username && !email){
        throw new ApiError(400,"usenname or password is required")
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    //password
    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Password is incorrect");
    }

    const {accessToken,refreshToken}=await generateAccessAndRefereshTokens(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true


    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,{
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged in Successfully"
        )
    )
})

//logout

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

      const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logout Successfully "))


})


//give new refresh token

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Request")
    }

try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user=await User.findById(decodedToken?._id)
         if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        //now token valid
         if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
        const {accessToken,newrefreshToken}=await generateAccessAndRefereshTokens(user._id)
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newrefreshToken},
                "Access token refrshed"
            )
        )
} catch (error) {
    throw new ApiError(401,error?.message||"Invalid refrsh token")
}



})


const changeCuurentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body


   const user=await User.findById(req.user?._id)
   const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
   if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid old Password")
   }
   user.password=newPassword
   await user.save({validateBeforeSave:false})

   return res
   .status(200)
   .json(new ApiResponse(200,{},"Password changed Successfully"))
})


const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(200,req.user,"Fetch current user Successfully")
})


const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body
    if(!fullName || !email){
        throw new ApiError(400,"All fiels are required")
    }
    const user=User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullName,email
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200,user,"Account Updated Successfully"))
});

//files upload

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar File is missing")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while Uploading on avatar")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"avatar Image updated successfully")
    )
})


const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover File is missing")
    }

    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while Uploading on coverImage")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password")

     return res
    .status(200)
    .json(
        new ApiResponse(200,user,"cover Image updated successfully")
    )
})


const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params

    if(!username?.trim()){
        throw new ApiError(400,"Username is missing")
    }

    //count subscriber and subscription by using pipeline

    const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",//database me lowercase ho jata hai aur plural hojata hai
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",//database me lowercase ho jata hai aur plural hojata hai
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{
                            $in:[req.user?._id,"$subscribers.subscriber"]
                        },
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])
    if(!channel?.length){
    throw new ApiError(404,"Channel does not exits")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel fetched successfully")
    )
})





export {
registerUser,
loginUser,
logoutUser,
refreshAccessToken,
changeCuurentPassword,
getCurrentUser,
updateAccountDetails,
updateUserAvatar,
updateUserCoverImage,
getUserChannelProfile
} 
