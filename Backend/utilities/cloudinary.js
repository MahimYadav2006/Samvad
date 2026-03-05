const cloudinaryModule = require("cloudinary");
const cloudinary = cloudinaryModule.v2;
const cloudinaryStorageModule = require("multer-storage-cloudinary");
const multer = require("multer");

// Reasonable upload size limits (bytes)
const UPLOAD_LIMITS = {
  avatar: 5 * 1024 * 1024,       // 5 MB
  document: 25 * 1024 * 1024,    // 25 MB
  audio: 25 * 1024 * 1024,       // 25 MB
  media: 50 * 1024 * 1024,       // 50 MB
};

// Supports both multer-storage-cloudinary v2 (factory fn) and v4+ (CloudinaryStorage class).
const createCloudinaryStorage = (options) => {
  if (typeof cloudinaryStorageModule === "function") {
    return cloudinaryStorageModule(options);
  }

  if (typeof cloudinaryStorageModule?.CloudinaryStorage === "function") {
    return new cloudinaryStorageModule.CloudinaryStorage(options);
  }

  throw new TypeError("Unsupported multer-storage-cloudinary export shape");
};

// Configure Cloudinary.  process.env values are guaranteed to be
// available here because server.js calls dotenv.config() before
// requiring this module.  In Docker the vars come from env_file.
const configureCloudinary = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key  = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  if (!name || !key || !secret) {
    console.warn(
      "⚠️  Cloudinary env vars missing (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET). " +
      "File uploads will fail until they are set."
    );
  }

  cloudinary.config({
    cloud_name: name,
    api_key: key,
    api_secret: secret,
  });
};

configureCloudinary();

// ── Multer file-filters (validate format BEFORE hitting Cloudinary) ─────
const ALLOWED_DOC_EXTS  = new Set(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "zip", "csv"]);
const ALLOWED_AUDIO_EXTS = new Set(["mp3", "wav", "ogg", "m4a", "flac", "aac", "webm", "opus"]);
const ALLOWED_IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg", "heic", "heif", "avif"]);
const ALLOWED_VIDEO_EXTS = new Set(["mp4", "mov", "avi", "mkv", "webm", "ogv"]);
const ALLOWED_MEDIA_EXTS = new Set([...ALLOWED_IMAGE_EXTS, ...ALLOWED_VIDEO_EXTS]);

const getExtension = (filename) =>
  String(filename || "").split(".").pop().toLowerCase();

const createFileFilter = (allowedExts, label) => (req, file, cb) => {
  const ext = getExtension(file.originalname);
  if (allowedExts.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`${label}: .${ext} files are not allowed`));
  }
};

// ── Cloudinary storage engines ──────────────────────────────────────────
// IMPORTANT: Do NOT pass `allowed_formats` for `raw` or `video` resource_type.
// Cloudinary cannot reliably detect formats from streamed data for these types,
// so it rejects uploads with "An unknown file format not allowed".
// Format validation is handled by multer fileFilter instead.

const avatarStorage = createCloudinaryStorage({
  // multer-storage-cloudinary@2.x expects an object with `.v2`
  cloudinary: cloudinaryModule,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const docStorage = createCloudinaryStorage({
  cloudinary: cloudinaryModule,
  params: {
    folder: "documents",
    resource_type: "raw",
    // No allowed_formats — Cloudinary rejects "raw" uploads with format checks.
  },
});

const audioStorage = createCloudinaryStorage({
  cloudinary: cloudinaryModule,
  params: {
    folder: "audio",
    resource_type: "video", // Cloudinary uses "video" for audio files too
    // No allowed_formats — browser MediaRecorder outputs webm/ogg which
    // Cloudinary can't always match to the allowed list from stream data.
  },
});

// multer-storage-cloudinary v2 uses Node-callback-style params functions:
//   (req, file, cb) => cb(null, paramsObject)
// NOT async functions (which would hang because the callback is never invoked).
const mediaStorage = createCloudinaryStorage({
  cloudinary: cloudinaryModule,
  params(req, file, cb) {
    const isVideo = file.mimetype.startsWith("video/");
    cb(null, {
      folder: "media",
      resource_type: isVideo ? "video" : "image",
      // allowed_formats only for images (Cloudinary can detect image formats)
      ...(isVideo ? {} : { allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "bmp", "avif", "heic"] }),
      transformation: isVideo
        ? undefined
        : [{ width: 1920, height: 1080, crop: "limit" }],
    });
  },
});



const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: UPLOAD_LIMITS.audio },
  // Audio from the browser's MediaRecorder often arrives as a Blob without a
  // file extension (originalname = "blob").  Accept by MIME type instead.
  fileFilter: (req, file, cb) => {
    if (file.mimetype && (file.mimetype.startsWith("audio/") || file.mimetype.startsWith("video/"))) {
      return cb(null, true);
    }
    const ext = getExtension(file.originalname);
    if (ALLOWED_AUDIO_EXTS.has(ext)) {
      return cb(null, true);
    }
    cb(new Error("Audio upload: unsupported audio format"));
  },
});
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: UPLOAD_LIMITS.avatar },
});
const uploadDoc = multer({
  storage: docStorage,
  limits: { fileSize: UPLOAD_LIMITS.document },
  fileFilter: createFileFilter(ALLOWED_DOC_EXTS, "Document upload"),
});
const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: UPLOAD_LIMITS.media },
  fileFilter: createFileFilter(ALLOWED_MEDIA_EXTS, "Media upload"),
});

module.exports = { cloudinary, uploadAvatar, uploadDoc, uploadAudio, uploadMedia };
