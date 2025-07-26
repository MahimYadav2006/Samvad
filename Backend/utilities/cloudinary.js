const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "avatars", // optional folder name in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const docStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "documents",
    resource_type: "raw", // cloudinary stores non-images as raw
    allowed_formats: ["pdf", "doc", "docx", "xls", "xlsx", "txt", "zip", "csv"],
  },
});

const audioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "audio",
    resource_type: "video", // cloudinary requires audio/video files to use "video"
    allowed_formats: ["mp3", "wav", "ogg", "m4a", "flac", "aac", "ogx"],
  },
});

const mediaStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "media";
    let resource_type = file.mimetype.startsWith("video/") ? "video" : "image";
    let allowed_formats = ["jpg", "jpeg", "png", "webp", "mp4", "mov", "avi", "mkv"];

    return {
      folder,
      resource_type,
      allowed_formats,
      transformation: resource_type === "image"
        ? [{ width: 1920, height: 1080, crop: "limit" }]
        : undefined,
    };
  },
});



const uploadAudio = multer({ storage: audioStorage });
const uploadAvatar = multer({ storage: avatarStorage });
const uploadDoc = multer({ storage: docStorage });
const uploadMedia = multer({ storage: mediaStorage });

module.exports = { cloudinary, uploadAvatar, uploadDoc, uploadAudio, uploadMedia };
