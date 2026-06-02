const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.API_KEY,
    api_secret : process.env.API_SECRET_KEY
})
// Cloudinary upload image

const cloudUpload = async (fileToUpload, options = {}) =>{
    try {
        const data = await cloudinary.uploader.upload(fileToUpload, {
            resource_type: "auto",
            ...options
        });
        return data
    } catch (error) {
        throw new Error(error.message || "Something went wrong")
    }
}

// Cloudinary remove image

const cloudRemove = async (imagePuplicID) =>{
    try {
        const result = await cloudinary.uploader.destroy(imagePuplicID);
        return result
    } catch (error) {
        throw new Error("Something went wrong")
    }
}

module.exports = {cloudUpload , cloudRemove}