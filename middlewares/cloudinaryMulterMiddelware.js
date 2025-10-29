const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// ⚙️ Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "social_media_uploads";
    // Separate folders for profile vs posts
    if (file.fieldname === "profileimage") {
      folder = "profile_images";
    } else if (file.fieldname === "postimage") {
      folder = "post_uploads";
    }

    return {
      folder: folder,
      allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov"],
      resource_type: "auto", // auto handles images/videos
    };
  },
});

const uploads = multer({ storage: storage });
module.exports = uploads;
