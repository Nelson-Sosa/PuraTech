const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../configuration/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "gamemasters/products",
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
  },
});

const upload = multer({ storage });

module.exports = upload;