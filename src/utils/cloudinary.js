//server par aata phir ek path deta hai 

import {v2 as cloudinary} from "cloudinary" 
import fs from "fs"


//cloudinary configuration
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})


//uploading the file
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    if (!fs.existsSync(localFilePath)) {
      console.error("File not found:", localFilePath);
      return null;
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // delete only AFTER successful upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    // delete only if file exists
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

export default uploadOnCloudinary;

