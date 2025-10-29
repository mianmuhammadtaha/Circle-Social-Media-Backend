
// ya aik migration hai ya tab banaya tha k jab mujha local folder sa images ko cloudinary par save karwana tha tu ma na y abaanya tha i sko chalana k liya ma na ctrl + c or phir node cloudinaryMigration.js ko run ki aor is na sari files ko cloudinary par uload kar dia tha 

require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("./middlewares/cloudinary");
const Post = require("./model/addPostModel");
const fs = require("fs");
const path = require("path");

// 🧩 Connect MongoDB
mongoose.connect(process.env.MONGODB_URL)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// 🧠 Migration Function
async function migrateToCloudinary() {
  try {
    const posts = await Post.find({});

    for (let post of posts) {
      // Skip if already a Cloudinary URL
      if (post.filepath && post.filepath.startsWith("https://res.cloudinary.com")) {
        console.log(`✅ Already migrated: ${post._id}`);
        continue;
      }

      const localPath = path.join(__dirname, post.filepath);

      // Check if file exists locally
      if (!fs.existsSync(localPath)) {
        console.log(`⚠️ File missing: ${localPath}`);
        continue;
      }

      // ⬆️ Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(localPath, {
        folder: "post_uploads"
      });

      // 📝 Update MongoDB record
      post.filepath = uploadResult.secure_url;
      await post.save();

      console.log(`✅ Uploaded & Updated: ${post._id}`);

      // Optionally delete old file (optional)
      // fs.unlinkSync(localPath);
    }

    console.log("🎉 Migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration Error:", err);
    process.exit(1);
  }
}

migrateToCloudinary();
