const {v2 : cloudinary} = require("cloudinary")
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'product_images', // The folder in Cloudinary to store the images
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'], // Allowed file formats
    public_id: (req, file) => file.originalname,
    transformation: [
      {
        crop: 'limit', // Use 'limit' to ensure the image is not upscaled beyond its original dimensions
        fetch_format: 'auto', 
        quality: 'auto'
      }
    ]  }
});

function deleteCloudinaryImage(publicId) {
  cloudinary.uploader.destroy(publicId, (error, result) => {
    if (error) {
      console.error('Error deleting image:', error);
    } else {
      console.log('Image deleted successfully:', result);
    }
  });
}

function extractPublicId(url) {
  const regex = /\/v\d+\/(.+)\./;
  const match = url.match(regex);
  return match ? match[1] : null;
}

module.exports = {cloudinary,storage,deleteCloudinaryImage,extractPublicId };